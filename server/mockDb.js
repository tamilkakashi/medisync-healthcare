const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'mock_database.json');

// Helper to generate RSA key pair for doctor signing
const generateKeyPair = () => {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
};

function seedDefaultData() {
    const keys = generateKeyPair();
    const defaultPassword = bcrypt.hashSync('123456', 10);

    return {
        users: [
            {
                _id: '660000000000000000000001',
                name: 'System Administrator',
                email: 'admin@lumina.sys',
                password: defaultPassword,
                role: 'admin',
                isApproved: true,
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                _id: '660000000000000000000006',
                name: 'MediSync Admin',
                email: 'admin@medisync.com',
                password: defaultPassword,
                role: 'admin',
                isApproved: true,
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                _id: '660000000000000000000002',
                name: 'Metro Health Central',
                email: 'testhospital@lumina.sys',
                password: defaultPassword,
                role: 'hospital',
                address: '100 Medical Plaza, Metro City',
                isApproved: true,
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                _id: '660000000000000000000003',
                name: 'Dr. Marcus Vance',
                email: 'testsurgeon@lumina.sys',
                password: defaultPassword,
                role: 'doctor',
                department: 'Cardiology',
                roomNumber: '304',
                floorNumber: '3',
                hospitalId: '660000000000000000000002',
                associatedHospital: '660000000000000000000002',
                isApproved: true,
                status: 'approved',
                publicKey: keys.publicKey,
                privateKey: keys.privateKey,
                createdAt: new Date().toISOString()
            },
            {
                _id: '660000000000000000000004',
                name: 'Eleanor Rigby',
                email: 'testpatient@lumina.sys',
                password: defaultPassword,
                role: 'patient',
                hospitalId: '660000000000000000000002',
                doctorId: '660000000000000000000003',
                address: '42 Abbey Road, Metro City',
                isApproved: true,
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                _id: '660000000000000000000005',
                name: 'Apex Pharmaceuticals',
                email: 'testpharmacy@lumina.sys',
                password: defaultPassword,
                role: 'pharmacy',
                licenseNumber: 'PH-2026-998',
                address: '12 Commercial Blvd, Metro City',
                isApproved: true,
                status: 'approved',
                createdAt: new Date().toISOString()
            }
        ],
        prescriptions: [
            {
                _id: '660000000000000000000010',
                doctorId: '660000000000000000000003',
                patientId: '660000000000000000000004',
                patientName: 'Eleanor Rigby',
                patientAge: 34,
                diagnosis: 'Hypertension Stage 1',
                medicines: [
                    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily in the morning', duration: '30 days' }
                ],
                status: 'pending',
                expiryDate: '2027-01-01',
                prescriptionHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
                digitalSignature: 'signature_demo_valid',
                createdAt: new Date().toISOString()
            }
        ],
        auditLogs: [
            {
                _id: '660000000000000000000030',
                actorId: '660000000000000000000001',
                actorRole: 'admin',
                action: 'SYSTEM_INITIALIZE',
                details: 'MediSync Mock Security & Data Engine initialized',
                createdAt: new Date().toISOString()
            }
        ],
        notifications: [
            {
                _id: '660000000000000000000020',
                userId: '660000000000000000000001',
                message: 'Welcome to MediSync Platform.',
                isRead: false,
                createdAt: new Date().toISOString()
            }
        ]
    };
}

let dataStore = null;

function loadStore() {
    if (dataStore) return dataStore;
    if (fs.existsSync(DB_FILE)) {
        try {
            dataStore = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            return dataStore;
        } catch (e) {
            console.error('[MockDB] Error parsing existing db file, re-seeding:', e.message);
        }
    }
    dataStore = seedDefaultData();
    saveStore();
    return dataStore;
}

function saveStore() {
    if (!dataStore) return;
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(dataStore, null, 2), 'utf8');
    } catch (e) {
        console.error('[MockDB] Save failed:', e.message);
    }
}

// Helper methods
const mockDb = {
    get users() { return loadStore().users; },
    get prescriptions() { return loadStore().prescriptions; },
    get auditLogs() { return loadStore().auditLogs; },
    get notifications() { return loadStore().notifications; },

    findUserByEmail(email) {
        if (!email || typeof email !== 'string') return null;
        const normalized = email.trim().toLowerCase();
        return this.users.find(u => u && typeof u.email === 'string' && u.email.trim().toLowerCase() === normalized) || null;
    },

    findUserById(id) {
        if (!id) return null;
        return this.users.find(u => String(u._id) === String(id)) || null;
    },

    addUser(userObj) {
        const store = loadStore();
        if (!userObj._id) {
            userObj._id = crypto.randomBytes(12).toString('hex');
        }
        userObj.createdAt = new Date().toISOString();
        store.users.push(userObj);
        saveStore();
        return userObj;
    },

    addPrescription(prescription) {
        const store = loadStore();
        if (!prescription._id) {
            prescription._id = crypto.randomBytes(12).toString('hex');
        }
        prescription.createdAt = new Date().toISOString();
        store.prescriptions.push(prescription);
        saveStore();
        return prescription;
    },

    addAuditLog(log) {
        const store = loadStore();
        if (!log._id) {
            log._id = crypto.randomBytes(12).toString('hex');
        }
        log.createdAt = new Date().toISOString();
        store.auditLogs.unshift(log);
        saveStore();
        return log;
    },

    addNotification(notif) {
        const store = loadStore();
        if (!notif._id) {
            notif._id = crypto.randomBytes(12).toString('hex');
        }
        notif.createdAt = new Date().toISOString();
        store.notifications.unshift(notif);
        saveStore();
        return notif;
    },

    updateUser(id, updates) {
        const user = this.findUserById(id);
        if (user) {
            Object.assign(user, updates);
            saveStore();
        }
        return user;
    },

    updatePrescription(id, updates) {
        const store = loadStore();
        const p = store.prescriptions.find(p => String(p._id) === String(id));
        if (p) {
            Object.assign(p, updates);
            saveStore();
        }
        return p;
    },

    deleteUser(id) {
        const store = loadStore();
        const idx = store.users.findIndex(u => String(u._id) === String(id));
        if (idx !== -1) {
            const removed = store.users.splice(idx, 1)[0];
            saveStore();
            return removed;
        }
        return null;
    },

    deletePrescription(id) {
        const store = loadStore();
        const idx = store.prescriptions.findIndex(p => String(p._id) === String(id));
        if (idx !== -1) {
            const removed = store.prescriptions.splice(idx, 1)[0];
            saveStore();
            return removed;
        }
        return null;
    },

    generateDoctorKeys: generateKeyPair
};

module.exports = mockDb;
