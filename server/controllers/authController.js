const User = require('../models/User');
const Prescription = require('../models/Prescription');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const mockDb = require('../mockDb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');

const isOffline = () => mongoose.connection.readyState !== 1;

// Helper to generate key pair
const generateKeyPair = () => {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
};

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.name, email: user.email },
        process.env.JWT_SECRET || 'medisync_secret_key',
        { expiresIn: '1d' }
    );
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, ...otherData } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Name, email, password, and role are required' });
        }

        if (role === 'doctor') {
            return res.status(403).json({
                message: "Doctor accounts must be created by hospital administration"
            });
        }

        if (isOffline()) {
            const existingUser = mockDb.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const isApproved = role === 'patient' || role === 'admin';
            let publicKey = '';
            let privateKey = '';

            if (role === 'doctor') {
                const keys = mockDb.generateDoctorKeys();
                publicKey = keys.publicKey;
                privateKey = keys.privateKey;
            }

            mockDb.addUser({
                name,
                email,
                password: hashedPassword,
                role,
                isApproved,
                status: isApproved ? 'approved' : 'pending',
                publicKey,
                privateKey,
                ...otherData
            });

            return res.status(201).json({ message: 'User registered successfully. Waiting for approval (if applicable).' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let isApproved = role === 'patient' || role === 'admin';

        let publicKey = '';
        let privateKey = '';

        if (role === 'doctor') {
            const keys = generateKeyPair();
            publicKey = keys.publicKey;
            privateKey = keys.privateKey;
        }

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            isApproved,
            publicKey,
            privateKey,
            ...otherData
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully. Waiting for approval (if applicable).' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        let user;

        if (isOffline()) {
            user = mockDb.findUserByEmail(email);
            if (!user) {
                return res.status(400).json({ 
                    message: 'Invalid Credentials. Demo accounts: admin@medisync.com, testsurgeon@lumina.sys, testhospital@lumina.sys, testpatient@lumina.sys, testpharmacy@lumina.sys (password: 123456)' 
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            if (!user.isApproved) {
                return res.status(403).json({ message: 'Account not approved yet' });
            }
        } else {
            user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            if (!user.isApproved) {
                return res.status(403).json({ message: 'Account not approved yet' });
            }
        }

        const token = generateToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User ID missing in token' });
        }

        if (isOffline()) {
            const user = mockDb.findUserById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            const { password, privateKey, ...safeUser } = user;
            return res.json(safeUser);
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('getProfile Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

// Get Stats for Dashboards
exports.getStats = async (req, res) => {
    try {
        const { role, id } = req.user;
        let stats = {};

        if (isOffline()) {
            const allUsers = mockDb.users;
            const allPrescriptions = mockDb.prescriptions;

            if (role === 'admin') {
                stats = {
                    totalUsers: allUsers.length,
                    totalPrescriptions: allPrescriptions.length
                };
            } else if (role === 'doctor') {
                stats = {
                    totalPrescriptions: allPrescriptions.filter(p => p.doctorId === id).length,
                    pendingPrescriptions: allPrescriptions.filter(p => p.doctorId === id && p.status === 'pending').length,
                    dispensedPrescriptions: allPrescriptions.filter(p => p.doctorId === id && p.status === 'dispensed').length
                };
            } else if (role === 'pharmacy') {
                stats = {
                    pendingQueue: allPrescriptions.filter(p => p.status === 'pending').length,
                    dispensedByMe: allPrescriptions.filter(p => p.dispensedBy === id).length
                };
            } else if (role === 'hospital') {
                stats = {
                    totalDoctors: allUsers.filter(u => u.role === 'doctor').length,
                    totalPatients: allUsers.filter(u => u.role === 'patient').length,
                    totalPrescriptions: allPrescriptions.length,
                    pendingVerification: allPrescriptions.filter(p => p.status === 'pending').length,
                    verifiedPrescriptions: allPrescriptions.filter(p => p.status === 'dispensed').length,
                    expiredPrescriptions: 0
                };
            } else if (role === 'patient') {
                stats = {
                    myPrescriptions: allPrescriptions.filter(p => p.patientId === id || p.patientName === req.user.name).length,
                    activePrescriptions: allPrescriptions.filter(p => (p.patientId === id || p.patientName === req.user.name) && p.status === 'pending').length
                };
            }
            return res.json(stats);
        }

        if (role === 'admin') {
            const totalUsers = await User.countDocuments();
            const totalPrescriptions = await Prescription.countDocuments();
            stats = { totalUsers, totalPrescriptions };
        } else if (role === 'doctor') {
            const totalPrescriptions = await Prescription.countDocuments({ doctorId: id });
            const pendingPrescriptions = await Prescription.countDocuments({ doctorId: id, status: 'pending' });
            const dispensedPrescriptions = await Prescription.countDocuments({ doctorId: id, status: 'dispensed' });
            stats = { totalPrescriptions, pendingPrescriptions, dispensedPrescriptions };
        } else if (role === 'pharmacy') {
            const pendingQueue = await Prescription.countDocuments({ status: 'pending' });
            const dispensedByMe = await Prescription.countDocuments({ dispensedBy: id });
            stats = { pendingQueue, dispensedByMe };
        } else if (role === 'hospital') {
            const doctors = await User.find({ hospitalId: id, role: 'doctor' }).distinct('_id');
            const totalDoctors = doctors.length;
            const totalPatients = await User.countDocuments({ hospitalId: id, role: 'patient' });

            const totalPrescriptions = await Prescription.countDocuments({
                doctorId: { $in: doctors }
            });
            const pendingVerification = await Prescription.countDocuments({
                doctorId: { $in: doctors },
                status: 'pending'
            });
            const verifiedPrescriptions = await Prescription.countDocuments({
                doctorId: { $in: doctors },
                status: 'dispensed'
            });
            const expiredPrescriptions = await Prescription.countDocuments({
                doctorId: { $in: doctors },
                status: 'expired'
            });

            stats = {
                totalDoctors,
                totalPatients,
                totalPrescriptions,
                pendingVerification,
                verifiedPrescriptions,
                expiredPrescriptions
            };
        } else if (role === 'patient') {
            const myPrescriptions = await Prescription.countDocuments({ patientId: id });
            const activePrescriptions = await Prescription.countDocuments({ patientId: id, status: 'pending' });
            stats = { myPrescriptions, activePrescriptions };
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

// Get all patients
exports.getPatients = async (req, res) => {
    try {
        if (isOffline()) {
            const patients = mockDb.users
                .filter(u => u.role === 'patient')
                .map(u => ({ _id: u._id, name: u.name, email: u.email }));
            return res.json({ patients });
        }
        const patients = await User.find({ role: 'patient' }).select('name email');
        res.json({ patients });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin only: Get all users
exports.getAllUsers = async (req, res) => {
    try {
        if (isOffline()) {
            const users = mockDb.users.map(({ password, privateKey, ...u }) => u);
            return res.json({ users });
        }
        const query = { ...req.query };
        const users = await User.find(query).select('-password');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin only: Delete user
exports.deleteUser = async (req, res) => {
    try {
        if (isOffline()) {
            const user = mockDb.findUserById(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            mockDb.deleteUser(req.params.id);
            mockDb.addAuditLog({
                actorId: req.user.id,
                actorRole: req.user.role,
                action: 'DELETE_USER',
                details: `Deleted ${user.role}: ${user.name} (${user.email})`,
                targetId: user._id,
                targetType: 'User'
            });
            return res.json({ message: 'User permanently deleted from database' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(req.params.id);
        await AuditLog.create({
            actorId: req.user.id,
            actorRole: req.user.role,
            action: 'DELETE_USER',
            details: `Deleted ${user.role}: ${user.name} (${user.email})`,
            targetId: user._id,
            targetType: 'User'
        });
        res.json({ message: 'User permanently deleted from database' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Admin only: Update user
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, isApproved } = req.body;
        if (isOffline()) {
            const user = mockDb.updateUser(req.params.id, { name, email, role, isApproved });
            if (!user) return res.status(404).json({ message: 'User not found' });
            return res.json({ message: 'User updated successfully', user });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        if (isApproved !== undefined) user.isApproved = isApproved;

        await user.save();
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Admin only: Approve user
exports.approveUser = async (req, res) => {
    try {
        if (isOffline()) {
            const user = mockDb.updateUser(req.params.id, { isApproved: true, status: 'approved' });
            if (!user) return res.status(404).json({ message: 'User not found' });
            return res.json({ message: 'User Approved Successful', user });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isApproved = true;
        user.approvedBy = req.user.id;
        await user.save();
        res.json({ message: 'User Approved Successful', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Hospital Staff Management
exports.addHospitalStaff = async (req, res) => {
    try {
        const { name, email, password, licenseNumber } = req.body;
        const hospitalId = req.user.id;

        if (isOffline()) {
            const existing = mockDb.findUserByEmail(email);
            if (existing) return res.status(400).json({ message: 'User already exists' });
            const hashedPassword = await bcrypt.hash(password, 10);
            const keys = mockDb.generateDoctorKeys();
            const newStaff = mockDb.addUser({
                name,
                email,
                password: hashedPassword,
                role: 'doctor',
                isApproved: true,
                status: 'approved',
                associatedHospital: hospitalId,
                hospitalId,
                licenseNumber,
                publicKey: keys.publicKey,
                privateKey: keys.privateKey
            });
            return res.status(201).json({ message: 'Staff added successfully', staff: newStaff });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const keys = generateKeyPair();

        const newStaff = new User({
            name,
            email,
            password: hashedPassword,
            role: 'doctor',
            isApproved: true,
            associatedHospital: hospitalId,
            licenseNumber,
            publicKey: keys.publicKey,
            privateKey: keys.privateKey
        });

        await newStaff.save();
        res.status(201).json({ message: 'Staff added successfully', staff: newStaff });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getHospitalStaff = async (req, res) => {
    try {
        if (isOffline()) {
            const staff = mockDb.users
                .filter(u => u.associatedHospital === req.user.id || u.hospitalId === req.user.id)
                .map(({ password, privateKey, ...u }) => u);
            return res.json({ staff });
        }
        const staff = await User.find({ associatedHospital: req.user.id }).select('-password');
        res.json({ staff });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get Audit Logs (Admin Only)
exports.getAuditLogs = async (req, res) => {
    try {
        if (isOffline()) {
            return res.json({ logs: mockDb.auditLogs });
        }
        const logs = await AuditLog.find()
            .populate('actorId', 'name role')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all Hospitals (For Doctors to Link)
exports.getHospitals = async (req, res) => {
    try {
        if (isOffline()) {
            const hospitals = mockDb.users
                .filter(u => u.role === 'hospital')
                .map(u => ({ _id: u._id, name: u.name, email: u.email }));
            return res.json(hospitals);
        }
        const hospitals = await User.find({ role: 'hospital', isApproved: true }).select('name email _id');
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Doctor: Link themselves to a Hospital
exports.linkHospital = async (req, res) => {
    try {
        const { hospitalId } = req.body;
        const doctorId = req.user.id;

        if (isOffline()) {
            mockDb.updateUser(doctorId, { associatedHospital: hospitalId, hospitalId });
            return res.json({ message: 'Successfully linked to hospital' });
        }

        const hospital = await User.findById(hospitalId);
        if (!hospital || hospital.role !== 'hospital') {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        await User.findByIdAndUpdate(doctorId, { associatedHospital: hospitalId });
        res.json({ message: 'Successfully linked to hospital' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Patient: Get Assigned Doctor Details
exports.getPatientDoctorDetails = async (req, res) => {
    try {
        const patientId = req.user.id;
        if (isOffline()) {
            const patient = mockDb.findUserById(patientId);
            if (!patient || !patient.doctorId) {
                return res.status(404).json({ message: 'No doctor assigned' });
            }
            const doctor = mockDb.findUserById(patient.doctorId);
            if (!doctor) return res.status(404).json({ message: 'Assigned doctor not found' });
            return res.json({
                doctorName: doctor.name,
                department: doctor.department || 'General Medicine',
                roomNumber: doctor.roomNumber || '101',
                floorNumber: doctor.floorNumber || '1'
            });
        }
        const patient = await User.findById(patientId);
        if (!patient || !patient.doctorId) {
            return res.status(404).json({ message: 'No doctor assigned' });
        }
        const doctor = await User.findById(patient.doctorId).select('name department roomNumber floorNumber');
        if (!doctor) {
            return res.status(404).json({ message: 'Assigned doctor not found' });
        }
        res.json({
            doctorName: doctor.name,
            department: doctor.department,
            roomNumber: doctor.roomNumber,
            floorNumber: doctor.floorNumber
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get Notifications for User
exports.getNotifications = async (req, res) => {
    try {
        if (isOffline()) {
            const notifications = mockDb.notifications.filter(n => n.userId === req.user.id || !n.userId);
            return res.json({ notifications });
        }
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ notifications });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Mark Notification as Read
exports.markNotificationRead = async (req, res) => {
    try {
        if (isOffline()) {
            const notif = mockDb.notifications.find(n => String(n._id) === String(req.params.id));
            if (notif) notif.isRead = true;
            return res.json({ message: 'Notification marked as read' });
        }
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
