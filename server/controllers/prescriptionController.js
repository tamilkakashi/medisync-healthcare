const Prescription = require('../models/Prescription');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const mockDb = require('../mockDb');
const crypto = require('crypto');
const mongoose = require('mongoose');

const isOffline = () => mongoose.connection.readyState !== 1;

// Create Prescription
exports.createPrescription = async (req, res) => {
    try {
        const { patientId, patientName, patientAge, diagnosis, medicines, expiryDate } = req.body;
        const doctorId = req.user.id;

        if (isOffline()) {
            const doctor = mockDb.findUserById(doctorId);
            if (!doctor || !doctor.privateKey) {
                return res.status(400).json({ message: 'Doctor signing key not found' });
            }

            const prescriptionData = JSON.stringify({
                patientId, doctorId, medicines, diagnosis, expiryDate
            });

            const prescriptionHash = crypto.createHash('sha256').update(prescriptionData).digest('hex');
            const sign = crypto.createSign('SHA256');
            sign.update(prescriptionHash);
            sign.end();
            const digitalSignature = sign.sign(doctor.privateKey, 'hex');

            const newPrescription = mockDb.addPrescription({
                doctorId,
                patientId,
                patientName,
                patientAge,
                diagnosis,
                medicines,
                expiryDate,
                prescriptionHash,
                digitalSignature,
                status: 'pending'
            });

            mockDb.addAuditLog({
                actorId: doctorId,
                actorRole: 'doctor',
                action: 'CREATE_PRESCRIPTION',
                details: `Prescription created for patient ${patientName}`,
                targetId: newPrescription._id,
                targetType: 'Prescription'
            });

            return res.status(201).json({ message: 'Prescription Created & Signed', prescription: newPrescription });
        }

        // Online MongoDB
        const doctor = await User.findById(doctorId).select('+privateKey');
        if (!doctor || !doctor.privateKey) {
            return res.status(400).json({ message: 'Doctor signing key not found' });
        }

        const prescriptionData = JSON.stringify({
            patientId, doctorId, medicines, diagnosis, expiryDate
        });

        const prescriptionHash = crypto.createHash('sha256').update(prescriptionData).digest('hex');
        const sign = crypto.createSign('SHA256');
        sign.update(prescriptionHash);
        sign.end();
        const digitalSignature = sign.sign(doctor.privateKey, 'hex');

        const newPrescription = new Prescription({
            doctorId,
            patientId,
            patientName,
            patientAge,
            diagnosis,
            medicines,
            expiryDate,
            prescriptionHash,
            digitalSignature
        });

        await newPrescription.save();

        await AuditLog.create({
            actorId: doctorId,
            actorRole: 'doctor',
            action: 'CREATE_PRESCRIPTION',
            details: `Prescription created for patient ${patientName}`,
            targetId: newPrescription._id,
            targetType: 'Prescription'
        });

        res.status(201).json({ message: 'Prescription Created & Signed', prescription: newPrescription });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get All Prescriptions
exports.getPrescriptions = async (req, res) => {
    try {
        const { role, id, name } = req.user;
        const { search, status, page = 1, limit = 10 } = req.query;

        if (isOffline()) {
            let list = [...mockDb.prescriptions];

            if (role === 'doctor') {
                list = list.filter(p => String(p.doctorId) === String(id));
            } else if (role === 'patient') {
                list = list.filter(p => String(p.patientId) === String(id) || p.patientName === name || p.patientId === req.user.email);
            } else if (role === 'hospital') {
                const myDoctorIds = mockDb.users.filter(u => u.hospitalId === id || u.associatedHospital === id).map(u => String(u._id));
                if (myDoctorIds.length > 0) {
                    list = list.filter(p => myDoctorIds.includes(String(p.doctorId)));
                }
            }

            if (status) {
                list = list.filter(p => p.status === status);
            }

            if (search) {
                const s = search.toLowerCase();
                list = list.filter(p => 
                    (p.patientName && p.patientName.toLowerCase().includes(s)) ||
                    (p.diagnosis && p.diagnosis.toLowerCase().includes(s))
                );
            }

            // Populate doctor details
            const populated = list.map(p => {
                const doc = mockDb.findUserById(p.doctorId);
                return {
                    ...p,
                    doctorId: doc ? { _id: doc._id, name: doc.name, licenseNumber: doc.licenseNumber } : p.doctorId
                };
            });

            return res.json({
                prescriptions: populated,
                pagination: {
                    total: populated.length,
                    page: parseInt(page),
                    pages: Math.ceil(populated.length / limit) || 1
                }
            });
        }

        // Online MongoDB
        let query = {};
        if (role === 'doctor') query.doctorId = id;
        if (role === 'patient') query.patientId = req.user.email;
        if (role === 'hospital') {
            const doctors = await User.find({ hospitalId: id }).distinct('_id');
            if (doctors.length > 0) query.doctorId = { $in: doctors };
        }
        if (search) {
            query.$or = [
                { patientName: { $regex: search, $options: 'i' } },
                { patientId: { $regex: search, $options: 'i' } },
                { diagnosis: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const prescriptions = await Prescription.find(query)
            .populate('doctorId', 'name licenseNumber')
            .populate('dispensedBy', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Prescription.countDocuments(query);

        res.json({
            prescriptions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Verify Prescription
exports.verifyPrescription = async (req, res) => {
    try {
        const { id } = req.params;

        if (isOffline()) {
            const prescription = mockDb.prescriptions.find(p => String(p._id) === String(id));
            if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
            
            const doctor = mockDb.findUserById(prescription.doctorId);
            if (!doctor || !doctor.publicKey) {
                return res.status(400).json({ message: 'Doctor public key not found' });
            }

            try {
                const verify = crypto.createVerify('SHA256');
                verify.update(prescription.prescriptionHash);
                verify.end();
                const isValidSignature = verify.verify(doctor.publicKey, prescription.digitalSignature, 'hex');

                if (isValidSignature) {
                    return res.json({ isValid: true, message: 'Digital Signature Verified. The prescription hash is authentic.' });
                } else {
                    return res.status(400).json({ isValid: false, message: 'Invalid Digital Signature. Integrity check failed.' });
                }
            } catch (cryptoErr) {
                return res.status(400).json({ isValid: false, message: 'Cryptographic error: ' + cryptoErr.message });
            }
        }

        const prescription = await Prescription.findById(id).populate('doctorId', 'publicKey');
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

        const doctorPublicKey = prescription.doctorId.publicKey;
        if (!doctorPublicKey) return res.status(400).json({ message: 'Doctor public key not found' });

        const verify = crypto.createVerify('SHA256');
        verify.update(prescription.prescriptionHash);
        verify.end();

        const isValidSignature = verify.verify(doctorPublicKey, prescription.digitalSignature, 'hex');

        if (isValidSignature) {
            res.json({ isValid: true, message: 'Digital Signature Verified. The prescription hash is authentic.' });
        } else {
            res.status(400).json({ isValid: false, message: 'Invalid Digital Signature. Integrity check failed.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Dispense
exports.dispensePrescription = async (req, res) => {
    try {
        const { id } = req.params;

        if (isOffline()) {
            const prescription = mockDb.prescriptions.find(p => String(p._id) === String(id));
            if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
            if (prescription.status === 'dispensed') {
                return res.status(400).json({ message: 'Prescription already dispensed' });
            }
            mockDb.updatePrescription(id, {
                status: 'dispensed',
                dispensedBy: req.user.id
            });
            mockDb.addAuditLog({
                actorId: req.user.id,
                actorRole: 'pharmacy',
                action: 'DISPENSE_PRESCRIPTION',
                details: `Prescription dispensed to patient ${prescription.patientName}`,
                targetId: prescription._id,
                targetType: 'Prescription'
            });
            return res.json({ message: 'Medicines Dispensed Successfully' });
        }

        const prescription = await Prescription.findById(id);
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
        if (prescription.status === 'dispensed') {
            return res.status(400).json({ message: 'Prescription already dispensed' });
        }

        prescription.status = 'dispensed';
        prescription.dispensedBy = req.user.id;
        await prescription.save();

        res.json({ message: 'Medicines Dispensed Successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete Prescription (Doctor who created it or Admin)
exports.deletePrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        if (isOffline()) {
            const prescription = mockDb.prescriptions.find(p => String(p._id) === String(id));
            if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

            if (role !== 'admin' && String(prescription.doctorId) !== String(userId)) {
                return res.status(403).json({ message: 'Unauthorized to delete this prescription' });
            }

            if (prescription.status === 'dispensed') {
                return res.status(400).json({ message: 'Cannot delete an already dispensed prescription' });
            }

            mockDb.deletePrescription(id);
            mockDb.addAuditLog({
                actorId: userId,
                actorRole: role,
                action: 'DELETE_PRESCRIPTION',
                details: `Deleted prescription for patient ${prescription.patientName}`,
                targetId: prescription._id,
                targetType: 'Prescription'
            });

            return res.json({ message: 'Prescription deleted successfully' });
        }

        const prescription = await Prescription.findById(id);
        if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

        if (role !== 'admin' && String(prescription.doctorId) !== String(userId)) {
            return res.status(403).json({ message: 'Unauthorized to delete this prescription' });
        }

        if (prescription.status === 'dispensed') {
            return res.status(400).json({ message: 'Cannot delete an already dispensed prescription' });
        }

        await Prescription.findByIdAndDelete(id);
        await AuditLog.create({
            actorId: userId,
            actorRole: role,
            action: 'DELETE_PRESCRIPTION',
            details: `Deleted prescription for patient ${prescription.patientName}`,
            targetId: prescription._id,
            targetType: 'Prescription'
        });

        res.json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
