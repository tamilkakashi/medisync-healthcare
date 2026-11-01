const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcryptjs');

async function run() {
    console.log('Reading .env...');
    const env = fs.readFileSync('.env', 'utf8');
    const line = env.split('\n').find(l => l.startsWith('MONGO_URI='));
    const uri = line.substring(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected.');

    const email = 'john.doe@medisync.com';
    const password = await bcrypt.hash('123456', 10);

    console.log(`Updating user ${email}...`);
    const res = await mongoose.connection.db.collection('users').updateOne(
        { email: email },
        { $set: { password: password, isApproved: true } }
    );

    console.log('Update result:', JSON.stringify(res));

    const user = await mongoose.connection.db.collection('users').findOne({ email: email });
    console.log('Final user status:', JSON.stringify(user));

    process.exit(0);
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
