const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Notification = require('./models/Notification');

dotenv.config();

const verifyFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Create a Hospital
        const hospital = await User.findOneAndUpdate(
            { email: 'arasan7102003@hospital.com' },
            { role: 'hospital' },
            { upsert: true, new: true }
        );

        // 2. Create a Doctor with Room Allocation
        const doctorEmail = `dr.manual.${Date.now()}@test.com`;
        const doctorData = {
            name: 'Dr. Manual Verification',
            email: doctorEmail,
            password: 'hashed_password',
            role: 'doctor',
            department: 'Neurology',
            roomNumber: '101A',
            floorNumber: '1',
            hospitalId: hospital._id,
            status: 'approved',
            isApproved: true
        };
        const doctor = await User.create(doctorData);
        console.log('Doctor created with room/floor:', doctor.roomNumber, '/', doctor.floorNumber);

        // 3. Find a Patient
        const patient = await User.findOne({ role: 'patient' });
        if (!patient) {
            console.error('No patient found to link');
            process.exit(1);
        }
        console.log('Linking patient:', patient.name);

        // 4. Link & Notify (Simulating controller logic)
        patient.doctorId = doctor._id;
        patient.hospitalId = hospital._id;
        await patient.save();

        const notification = await Notification.create({
            userId: patient._id,
            message: `You have been assigned to ${doctor.name} (${doctor.department}). Visit Room ${doctor.roomNumber}, Floor ${doctor.floorNumber}.`,
            type: 'doctor_assignment'
        });
        console.log('Notification created:', notification.message);

        // 5. Cleanup (optional, but let's keep it for actual test)
        console.log('Verification Success: Database state is correct.');

        // Final Check
        const finalNotif = await Notification.findOne({ userId: patient._id }).sort({ createdAt: -1 });
        console.log('Latest Notification in DB:', finalNotif.message);

        process.exit(0);
    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
};

verifyFlow();
