const User = require('../models/User');
const Prescription = require('../models/Prescription');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const mockDb = require('../mockDb');
const bcrypt = require('bcryptjs');
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

// DOCTOR MANAGEMENT
exports.createDoctor = async (req, res) => {
    try {
        const { name, email, password, department, licenseNumber, roomNumber, floorNumber } = req.body;
        const hospitalId = req.user.id;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if (isOffline()) {
            const existing = mockDb.findUserByEmail(email);
            if (existing) return res.status(400).json({ message: 'User already exists' });
            const hashedPassword = await bcrypt.hash(password, 10);
            const keys = mockDb.generateDoctorKeys();
            const newDoctor = mockDb.addUser({
                name,
                email,
                password: hashedPassword,
                role: 'doctor',
                status: 'approved',
                isApproved: true,
                hospitalId,
                department,
                licenseNumber,
                roomNumber,
                floorNumber,
                publicKey: keys.publicKey,
                privateKey: keys.privateKey
            });
            mockDb.addAuditLog({
                actorId: hospitalId,
                actorRole: 'hospital',
                action: 'CREATE_DOCTOR',
                details: `Created doctor: ${name} (${email}) in ${department}`,
                targetId: newDoctor._id,
                targetType: 'User'
            });
            return res.status(201).json({ message: 'Doctor created successfully', doctor: newDoctor });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const keys = generateKeyPair();

        const newDoctor = new User({
            name,
            email,
            password: hashedPassword,
            role: 'doctor',
            status: 'approved',
            isApproved: true,
            hospitalId,
            department,
            licenseNumber,
            roomNumber,
            floorNumber,
            publicKey: keys.publicKey,
            privateKey: keys.privateKey
        });

        await newDoctor.save();
        res.status(201).json({ message: 'Doctor created successfully', doctor: newDoctor });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        if (isOffline()) {
            const doctors = mockDb.users
                .filter(u => u.role === 'doctor')
                .map(({ password, privateKey, ...u }) => u);
            return res.json({ doctors });
        }
        const doctors = await User.find({ hospitalId: req.user.id, role: 'doctor' }).select('-password');
        res.json({ doctors });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const { name, department, licenseNumber, status, roomNumber, floorNumber } = req.body;
        if (isOffline()) {
            const updates = {};
            if (name !== undefined) updates.name = name;
            if (department !== undefined) updates.department = department;
            if (licenseNumber !== undefined) updates.licenseNumber = licenseNumber;
            if (status !== undefined) updates.status = status;
            if (roomNumber !== undefined) updates.roomNumber = roomNumber;
            if (floorNumber !== undefined) updates.floorNumber = floorNumber;

            const doctor = mockDb.updateUser(req.params.id, updates);
            if (!doctor) return res.status(404).json({ message: 'Doctor not found or unauthorized' });
            return res.json({ message: 'Doctor updated successfully', doctor });
        }
        const doctor = await User.findOne({ _id: req.params.id, hospitalId: req.user.id });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found or unauthorized' });

        if (name) doctor.name = name;
        if (department) doctor.department = department;
        if (licenseNumber) doctor.licenseNumber = licenseNumber;
        if (status) doctor.status = status;
        if (roomNumber !== undefined) doctor.roomNumber = roomNumber;
        if (floorNumber !== undefined) doctor.floorNumber = floorNumber;
        await doctor.save();
        res.json({ message: 'Doctor updated successfully', doctor });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deactivateDoctor = async (req, res) => {
    try {
        if (isOffline()) {
            mockDb.updateUser(req.params.id, { status: 'suspended' });
            return res.json({ message: 'Doctor deactivated successfully' });
        }
        const doctor = await User.findOne({ _id: req.params.id, hospitalId: req.user.id });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        doctor.status = 'suspended';
        await doctor.save();
        res.json({ message: 'Doctor deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        if (isOffline()) {
            const doc = mockDb.findUserById(req.params.id);
            if (!doc) return res.status(404).json({ message: 'Doctor not found or unauthorized' });
            mockDb.deleteUser(req.params.id);
            mockDb.addAuditLog({
                actorId: req.user.id,
                actorRole: 'hospital',
                action: 'DELETE_DOCTOR',
                details: `Deleted doctor: ${doc.name}`,
                targetId: doc._id,
                targetType: 'User'
            });
            return res.json({ message: 'Doctor permanently deleted' });
        }
        const doctor = await User.findOneAndDelete({ _id: req.params.id, hospitalId: req.user.id });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found or unauthorized' });
        await AuditLog.create({
            actorId: req.user.id,
            actorRole: 'hospital',
            action: 'DELETE_DOCTOR',
            details: `Deleted doctor: ${doctor.name}`,
            targetId: doctor._id,
            targetType: 'User'
        });
        res.json({ message: 'Doctor permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// PATIENT MANAGEMENT
exports.getPatients = async (req, res) => {
    try {
        if (isOffline()) {
            const patients = mockDb.users
                .filter(u => u.role === 'patient')
                .map(({ password, privateKey, ...u }) => u);
            return res.json({ patients });
        }
        const patients = await User.find({ hospitalId: req.user.id, role: 'patient' }).select('-password');
        res.json({ patients });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const { name, address } = req.body;
        if (isOffline()) {
            const patient = mockDb.updateUser(req.params.id, { name, address });
            if (!patient) return res.status(404).json({ message: 'Patient not found' });
            return res.json({ message: 'Patient updated successfully', patient });
        }
        const patient = await User.findOne({ _id: req.params.id, hospitalId: req.user.id });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        if (name) patient.name = name;
        if (address) patient.address = address;
        await patient.save();
        res.json({ message: 'Patient updated successfully', patient });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.linkPatientDoctor = async (req, res) => {
    try {
        const { patientId, doctorId } = req.body;
        if (isOffline()) {
            const patient = mockDb.findUserById(patientId);
            const doctor = mockDb.findUserById(doctorId);
            if (!patient) return res.status(404).json({ message: 'Patient not found' });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

            mockDb.updateUser(patientId, { doctorId, hospitalId: req.user.id });

            mockDb.addNotification({
                userId: patientId,
                message: `You have been assigned to ${doctor.name} (${doctor.department || 'General Medicine'}). Visit Room ${doctor.roomNumber || 'N/A'}, Floor ${doctor.floorNumber || 'N/A'}.`,
                type: 'doctor_assignment'
            });

            mockDb.addAuditLog({
                actorId: req.user.id,
                actorRole: 'hospital',
                action: 'LINK_PATIENT_DOCTOR',
                details: `Linked patient ${patient.name} to Dr. ${doctor.name}. Notification sent.`,
                targetId: patient._id,
                targetType: 'User'
            });

            return res.json({ message: 'Patient assigned to doctor successfully and notification sent' });
        }
        const patient = await User.findOne({ _id: patientId, hospitalId: req.user.id });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        patient.doctorId = doctorId;
        await patient.save();
        res.json({ message: 'Patient assigned to doctor successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// PHARMACY
exports.getPharmacies = async (req, res) => {
    try {
        if (isOffline()) {
            const pharmacies = mockDb.users
                .filter(u => u.role === 'pharmacy')
                .map(({ password, privateKey, ...u }) => u);
            return res.json({ pharmacies });
        }
        const pharmacies = await User.find({ role: 'pharmacy' }).select('-password');
        res.json({ pharmacies });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updatePharmacyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (isOffline()) {
            const isApproved = status === 'approved';
            mockDb.updateUser(req.params.id, { status, isApproved });
            return res.json({ message: `Pharmacy status updated to ${status}` });
        }
        const pharmacy = await User.findById(req.params.id);
        if (!pharmacy || pharmacy.role !== 'pharmacy') return res.status(404).json({ message: 'Pharmacy not found' });
        pharmacy.status = status;
        pharmacy.isApproved = status === 'approved';
        await pharmacy.save();
        res.json({ message: `Pharmacy status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// SECURITY LOGS
exports.getSecurityLogs = async (req, res) => {
    try {
        if (isOffline()) {
            return res.json({ logs: mockDb.auditLogs });
        }
        const logs = await AuditLog.find({ actorId: req.user.id }).sort({ createdAt: -1 });
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
