const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'doctor', 'pharmacy', 'patient', 'hospital']
    },
    isApproved: {
        type: Boolean,
        default: false // Pharmacies/Doctors/Hospitals might need admin approval
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'suspended'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Specific fields based on role
    licenseNumber: {
        type: String // For Doctors/Pharmacies
    },
    address: {
        type: String // For Hospitals/Pharmacies/Patients
    },
    associatedHospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Legacy link
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // For Doctors/Patients to link to a Hospital
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // For Patients to link to a Doctor
    },
    department: {
        type: String // For Doctors
    },
    roomNumber: {
        type: String // For Doctors (Room Allocation)
    },
    floorNumber: {
        type: String // For Doctors (Floor Allocation)
    },
    publicKey: {
        type: String // For Digital Signatures (Doctors/Hospitals)
    },
    privateKey: {
        type: String, // STORAGE OF PRIVATE KEY IS FOR DEMO ONLY. 
        select: false // Do not return by default
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
