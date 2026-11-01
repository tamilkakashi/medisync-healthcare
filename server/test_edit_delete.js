const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testEditDelete = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get hospital
        const hospital = await User.findOne({ role: 'hospital' });
        if (!hospital) {
            console.error('No hospital found');
            process.exit(1);
        }

        // 2. Create a test doctor
        const dummyEmail = `dr.editdelete.${Date.now()}@test.com`;
        const doctor = await User.create({
            name: 'Dr. Test EditDelete',
            email: dummyEmail,
            password: 'hashed',
            role: 'doctor',
            department: 'TestDept',
            roomNumber: '100',
            floorNumber: '1',
            hospitalId: hospital._id,
            status: 'approved',
            isApproved: true
        });
        console.log(`Created doctor: ${doctor.name} (Room ${doctor.roomNumber}, Floor ${doctor.floorNumber})`);

        // 3. Emulate Edit Profile via Controller
        // Import controller directly to test logic
        const { updateDoctor, deleteDoctor } = require('./controllers/hospitalController');

        // Mock Res & Req
        let resData = null;
        let resStatus = 200;
        const mockRes = {
            json: (data) => { resData = data; return mockRes; },
            status: (s) => { resStatus = s; return mockRes; }
        };

        const editReq = {
            user: { id: hospital._id },
            params: { id: doctor._id },
            body: {
                name: 'Dr. Test FullEdit',
                roomNumber: '105',
                floorNumber: '2',
                status: 'suspended'
            }
        };

        console.log('Testing updateDoctor...');
        await updateDoctor(editReq, mockRes);

        if (resStatus === 200) {
            console.log('Update result:', resData.message);
            console.log(`Updated room to ${resData.doctor.roomNumber}, status to ${resData.doctor.status}`);
        } else {
            console.error('Update failed:', resData);
        }

        // 4. Emulate Delete
        const deleteReq = {
            user: { id: hospital._id },
            params: { id: doctor._id }
        };

        console.log('Testing deleteDoctor...');
        await deleteDoctor(deleteReq, mockRes);
        console.log('Delete result:', resData.message);

        // 5. Verify deleted from DB
        const checkDoc = await User.findById(doctor._id);
        if (!checkDoc) {
            console.log('SUCCESS: Doctor safely removed from database.');
        } else {
            console.log('FAILURE: Doctor still exists in database:', checkDoc.name);
        }

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};

testEditDelete();
