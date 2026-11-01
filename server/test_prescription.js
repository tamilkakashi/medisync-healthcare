const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testPrescription = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const doctor = await User.findOne({ role: 'doctor' }).select('+privateKey');
        if (!doctor) {
            console.error('No doctor found');
            process.exit(1);
        }

        const { createPrescription } = require('./controllers/prescriptionController');

        let resData = null;
        let resStatus = 200;
        const mockRes = {
            json: (data) => { resData = data; return mockRes; },
            status: (s) => { resStatus = s; return mockRes; }
        };

        const req = {
            user: { id: doctor._id },
            body: {
                patientId: 'user@example.com',
                patientName: 'Test Patient',
                patientAge: '30',
                diagnosis: 'Fever',
                expiryDate: '2024-12-31',
                medicines: [
                    { name: 'Paracetamol', dosage: '500mg', frequency: 'BOTH', duration: '5' }
                ]
            }
        };

        console.log('Calling createPrescription...');
        await createPrescription(req, mockRes);

        console.log('Status:', resStatus);
        console.log('Response:', resData);

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};

testPrescription();
