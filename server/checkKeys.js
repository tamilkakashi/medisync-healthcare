const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkKeys = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find().select('+privateKey');
        users.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}, Approved: ${u.isApproved}, Has PrivateKey: ${!!u.privateKey}`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkKeys();
