const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcryptjs');

async function run() {
    const env = fs.readFileSync('.env', 'utf8');
    const line = env.split('\n').find(l => l.startsWith('MONGO_URI='));
    const uri = line.substring(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
    await mongoose.connect(uri);

    const password = await bcrypt.hash('123456', 10);
    const emails = [
        'testhospital@lumina.sys',
        'testsurgeon@lumina.sys',
        'testpatient@lumina.sys',
        'testpharmacy@lumina.sys'
    ];

    await mongoose.connection.db.collection('users').updateMany(
        { email: { $in: emails } },
        { $set: { password: password, isApproved: true } }
    );

    console.log('PASSWORDS_RESET_SUCCESS');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
