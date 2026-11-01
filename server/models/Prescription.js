const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Hospital Removed
    patientId: {
        type: String, // Relaxed for prototype: Allow manual string input
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientAge: {
        type: Number,
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    medicines: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true }
    }],
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'dispensed', 'expired'],
        default: 'pending'
    },
    digitalSignature: {
        type: String,
        required: true // Cryptographic signature
    },
    prescriptionHash: {
        type: String,
        required: true // Hash of the prescription data for verification
    },
    dispensedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Pharmacy that dispensed it
    }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
