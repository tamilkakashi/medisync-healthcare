const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const approveAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const result = await User.updateMany(
            { isApproved: false },
            { $set: { isApproved: true } }
        );

        console.log(`Approved ${result.modifiedCount} users.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

approveAll();
