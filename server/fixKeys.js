const mongoose = require('mongoose');
const User = require('./models/User');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const generateKeyPair = () => {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
};

const fixKeys = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({
            role: { $in: ['doctor', 'hospital'] }
        }).select('+privateKey');

        let count = 0;
        for (const user of users) {
            if (!user.privateKey) {
                console.log(`Fixing keys for ${user.email}`);
                const keys = generateKeyPair();
                user.publicKey = keys.publicKey;
                user.privateKey = keys.privateKey;
                await user.save();
                count++;
            }
        }

        console.log(`Fixed keys for ${count} users.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixKeys();
