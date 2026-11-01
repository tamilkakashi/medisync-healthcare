const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actorRole: {
        type: String,
        required: true
    },
    action: {
        type: String, // e.g., 'CREATE_PRESCRIPTION', 'VERIFY_PRESCRIPTION', 'APPROVE_USER'
        required: true
    },
    details: {
        type: String
    },
    targetId: {
        type: String // ID of the affected resource
    },
    targetType: {
        type: String // Type of the affected resource (Prescription, User, etc.)
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
