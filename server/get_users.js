const mongoose = require('mongoose');
const fs = require('fs');

async function run() {
    const env = fs.readFileSync('.env', 'utf8');
    const line = env.split('\n').find(l => l.startsWith('MONGO_URI='));
    const uri = line.substring(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
    console.log('Connecting to:', uri.substring(0, 20) + '...');
    await mongoose.connect(uri);
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('USER_DATA_START');
    users.forEach(u => console.log(`${u.role}|${u.email}|${u.name}`));
    console.log('USER_DATA_END');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
