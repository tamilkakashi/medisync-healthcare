const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['doctor_assignment', 'prescription_added', 'system_alert'],
        default: 'system_alert'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
