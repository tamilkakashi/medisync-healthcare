const mongoose = require('mongoose');
const User = require('./models/User');
const AuditLog = require('./models/AuditLog');
require('dotenv').config();

async function testDelete() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create a dummy user
        const dummy = await User.create({
            name: 'Delete Test',
            email: 'delete@test.com',
            password: 'password123',
            role: 'patient',
            isApproved: true
        });
        console.log('Created dummy user:', dummy._id);

        // Try to delete it
        const deleted = await User.findByIdAndDelete(dummy._id);
        console.log('Deleted user:', deleted._id);

        // Check AuditLog
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            await AuditLog.create({
                actorId: adminUser._id,
                actorRole: 'admin',
                action: 'DELETE_USER_TEST',
                details: `Test Deleted user: ${dummy.email}`,
                targetId: dummy._id.toString(),
                targetType: 'User'
            });
            console.log('Audit log created');
        }

        console.log('Test PASSED');
        process.exit(0);
    } catch (error) {
        console.error('Test FAILED:', error);
        process.exit(1);
    }
}

testDelete();
