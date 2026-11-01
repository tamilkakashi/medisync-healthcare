// clientMockDb.js - Production-grade Client-Side Mock Database & API Interceptor
// Enables 100% offline and GitHub Pages static hosting functionality without a backend server.

const STORAGE_KEY = 'medisync_mock_db_v1';
const SESSION_KEY = 'medisync_active_user';

const INITIAL_USERS = [
    {
        _id: '660000000000000000000006',
        name: 'MediSync Admin',
        email: 'admin@medisync.com',
        role: 'admin',
        isApproved: true,
        status: 'approved',
        createdAt: '2026-10-31T17:32:27.740Z'
    },
    {
        _id: '660000000000000000000001',
        name: 'System Administrator',
        email: 'admin@lumina.sys',
        role: 'admin',
        isApproved: true,
        status: 'approved',
        createdAt: '2026-10-31T17:32:27.739Z'
    },
    {
        _id: '660000000000000000000002',
        name: 'Metro Health Central',
        email: 'testhospital@lumina.sys',
        role: 'hospital',
        address: '100 Medical Plaza, Metro City',
        isApproved: true,
        status: 'approved',
        createdAt: '2026-10-31T17:32:27.740Z'
    },
    {
        _id: '660000000000000000000003',
        name: 'Dr. Marcus Vance',
        email: 'testsurgeon@lumina.sys',
        role: 'doctor',
        department: 'Cardiology',
        licenseNumber: 'DOC-2026-1092',
        roomNumber: '304',
        floorNumber: '3',
        hospitalId: '660000000000000000000002',
        associatedHospital: '660000000000000000000002',
        isApproved: true,
        status: 'approved',
        createdAt: '2026-10-31T17:32:27.740Z'
    },
    {
        _id: '660000000000000000000004',
        name: 'Eleanor Rigby',
        email: 'testpatient@lumina.sys',
        role: 'patient',
        hospitalId: '660000000000000000000002',
        doctorId: '660000000000000000000003',
        address: '42 Abbey Road, Metro City',
        isApproved: true,
        status: 'approved',
        createdAt: '2026-10-31T17:32:27.740Z'
    },
    {
        _id: '660000000000000000000005',
        name: 'Apex Pharmaceuticals',
        email: 'testpharmacy@lumina.sys',
        role: 'pharmacy',
        licenseNumber: 'PH-2026-998',
        address: '12 Commercial Blvd, Metro City',
        isApproved: true,
        status: 'approved',
        createdAt: '2026-10-31T17:32:27.740Z'
    },
    {
        _id: '696041ed673b9b03b6c6be93',
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        role: 'patient',
        hospitalId: '660000000000000000000002',
        doctorId: '660000000000000000000003',
        address: '15 High St, Metro City',
        isApproved: true,
        status: 'approved',
        createdAt: '2026-10-31T17:33:13.061Z'
    }
];

const INITIAL_PRESCRIPTIONS = [
    {
        _id: '660000000000000000000010',
        doctorId: '660000000000000000000003',
        patientId: '660000000000000000000004',
        patientName: 'Eleanor Rigby',
        patientAge: 34,
        diagnosis: 'Hypertension Stage 1',
        medicines: [
            {
                name: 'Lisinopril',
                dosage: '10mg',
                frequency: 'Once daily in the morning',
                duration: '30 days'
            }
        ],
        status: 'pending',
        expiryDate: '2027-01-01',
        prescriptionHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        digitalSignature: 'signature_demo_valid_lisinopril_10mg',
        createdAt: '2026-10-31T17:32:27.740Z'
    },
    {
        _id: 'a7f3bcf132a3bfe2e1808ed3',
        doctorId: '660000000000000000000003',
        patientId: 'testpatient@lumina.sys',
        patientName: 'Eleanor Rigby',
        patientAge: 29,
        diagnosis: 'Seasonal Asthmatic Bronchitis',
        medicines: [
            {
                name: 'Albuterol Sulfate Inhaler',
                dosage: '90mcg',
                frequency: 'PRN',
                duration: '30 days'
            },
            {
                name: 'Prednisone',
                dosage: '20mg',
                frequency: 'QD',
                duration: '5 days'
            }
        ],
        expiryDate: '2026-12-31',
        prescriptionHash: 'cf168040cda69a6acf62208b3f82c0e324519b64a433db01f980ddade29e6cf2',
        digitalSignature: '5802e3639ced2bcd98db35805d298c487023921ff3c3c3a20665a33e4c97f21739b8222ecbca1fdc',
        status: 'dispensed',
        createdAt: '2026-10-31T18:33:32.309Z',
        dispensedBy: '660000000000000000000005'
    },
    {
        _id: '914110d90e4e2d3a67ff1c8c',
        doctorId: '660000000000000000000003',
        patientId: '696041ed673b9b03b6c6be93',
        patientName: 'Jane Doe',
        patientAge: 42,
        diagnosis: 'Acute Rhinosinusitis',
        medicines: [
            {
                name: 'Amoxicillin-Clavulanate',
                dosage: '875mg',
                frequency: 'BID',
                duration: '7 days'
            },
            {
                name: 'Fluticasone Propionate Nasal Spray',
                dosage: '50mcg',
                frequency: 'Daily',
                duration: '14 days'
            }
        ],
        expiryDate: '2027-02-15',
        prescriptionHash: '2b55217651cc188a4f15f4cd8acdc8c3ce0e8256480da1fbd9e3a3cf50e280f8',
        digitalSignature: '61c0a1813a3cf0f6f331ec1077899c8742717e2e57bbe3101786e3adb4532d2032ac50ad',
        status: 'dispensed',
        createdAt: '2026-11-01T06:17:25.961Z',
        dispensedBy: '660000000000000000000005'
    }
];

const INITIAL_AUDIT_LOGS = [
    {
        _id: '1b718f7ace6c1ac5d1194b97',
        actorId: '660000000000000000000005',
        actorRole: 'pharmacy',
        action: 'DISPENSE_PRESCRIPTION',
        details: 'Prescription dispensed to patient Eleanor Rigby',
        targetId: '660000000000000000000010',
        targetType: 'Prescription',
        createdAt: '2026-11-01T06:37:42.004Z'
    },
    {
        _id: '54d8741b320b4d9d3e2940ab',
        actorId: '660000000000000000000006',
        actorRole: 'admin',
        action: 'APPROVE_USER',
        details: 'Approved Dr. Marcus Vance credentials and license',
        targetId: '660000000000000000000003',
        targetType: 'User',
        createdAt: '2026-11-01T06:17:26.133Z'
    }
];

const INITIAL_NOTIFICATIONS = [
    {
        _id: 'fe59bb9f2aa04e31bcf41166',
        userId: '660000000000000000000004',
        message: 'You have been assigned to Dr. Marcus Vance (Cardiology). Visit Room 304, Floor 3.',
        type: 'doctor_assignment',
        isRead: false,
        createdAt: '2026-11-01T06:17:25.945Z'
    },
    {
        _id: '686bb007fd31e077983ff1e0',
        userId: '660000000000000000000004',
        message: 'Your Lisinopril prescription is ready for pharmacy verification.',
        type: 'prescription_issued',
        isRead: false,
        createdAt: '2026-10-31T18:45:19.089Z'
    }
];

// Helper to get or create storage
function getStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Storage read failed', e);
    }
    const initial = {
        users: INITIAL_USERS,
        prescriptions: INITIAL_PRESCRIPTIONS,
        auditLogs: INITIAL_AUDIT_LOGS,
        notifications: INITIAL_NOTIFICATIONS
    };
    saveStorage(initial);
    return initial;
}

function saveStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Storage write failed', e);
    }
}

// Generate MongoDB-like 24 hex char ID
function generateId() {
    return '66' + Array.from({ length: 22 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Simple base64 JWT generator
function createMockJwt(user) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        id: user._id,
        _id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        hospitalId: user.hospitalId,
        exp: Math.floor(Date.now() / 1000) + 86400 * 30
    }));
    const sig = 'mock_signature_' + Math.random().toString(36).substring(2);
    return `${header}.${payload}.${sig}`;
}

export function getCurrentUser() {
    try {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) return JSON.parse(session);
        const token = localStorage.getItem('token');
        if (token && token.includes('.')) {
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                const db = getStorage();
                const found = db.users.find(u => u._id === payload.id || u.email === payload.email);
                if (found) return found;
                return payload;
            }
        }
    } catch (e) {
        console.warn('Session parse error', e);
    }
    return null;
}

export function isStaticHosting() {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    return (
        hostname.includes('github.io') ||
        hostname.includes('pages.dev') ||
        hostname.includes('netlify.app') ||
        hostname.includes('surge.sh') ||
        localStorage.getItem('force_mock_api') === 'true'
    );
}

// Main mock router
export async function handleClientMockRequest(config) {
    const db = getStorage();
    const method = (config.method || 'get').toLowerCase();
    
    // Normalize path by stripping baseURL (/api or /api/)
    let url = config.url || '';
    if (url.startsWith('/api/')) {
        url = url.substring(4);
    } else if (url.startsWith('/api')) {
        url = url.substring(4);
    }
    if (!url.startsWith('/')) {
        url = '/' + url;
    }

    // Separate pathname and query params
    const [pathname, queryString] = url.split('?');
    const queryParams = new URLSearchParams(queryString || '');
    if (config.params) {
        Object.entries(config.params).forEach(([k, v]) => queryParams.set(k, v));
    }

    let body = config.data;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (_) {}
    }
    body = body || {};

    const currentUser = getCurrentUser();

    console.info(`[ClientMockDB] ${method.toUpperCase()} ${pathname}`, { query: Object.fromEntries(queryParams), body });

    // Helper for success response
    const ok = (data, status = 200) => ({
        data,
        status,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
        request: {}
    });

    // Helper for error
    const err = (message, status = 400) => {
        const error = new Error(message);
        error.config = config;
        error.response = {
            data: { message },
            status,
            statusText: status === 404 ? 'Not Found' : status === 403 ? 'Forbidden' : 'Bad Request',
            headers: {},
            config
        };
        throw error;
    };

    // 1. AUTH LOGIN
    if (pathname === '/auth/login' && method === 'post') {
        const { email, password } = body;
        if (!email || !password) return err('Email and password are required');

        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return err('Invalid Credentials. Demo accounts: admin@medisync.com, testsurgeon@lumina.sys, testhospital@lumina.sys, testpatient@lumina.sys, testpharmacy@lumina.sys (password: 123456)');
        }

        // Accept demo password '123456' or registered plain password
        if (password !== '123456' && user.plainPassword && password !== user.plainPassword) {
            return err('Invalid Credentials. Please use demo password: 123456');
        }

        if (user.isApproved === false || user.status === 'pending') {
            return err('Account not approved yet by administrator', 403);
        }

        const safeUser = {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            hospitalId: user.hospitalId,
            department: user.department,
            address: user.address,
            licenseNumber: user.licenseNumber,
            roomNumber: user.roomNumber,
            floorNumber: user.floorNumber,
            status: user.status,
            isApproved: user.isApproved
        };

        const token = createMockJwt(user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
        localStorage.setItem('token', token);

        return ok({
            token,
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                role: user.role,
                email: user.email
            }
        });
    }

    // 2. AUTH PROFILE
    if (pathname === '/auth/profile' && method === 'get') {
        if (!currentUser) return err('Not authenticated', 401);
        const user = db.users.find(u => u._id === (currentUser.id || currentUser._id));
        if (!user) return ok(currentUser);
        const { password, privateKey, ...safeUser } = user;
        return ok(safeUser);
    }

    // 3. AUTH LOGOUT
    if (pathname === '/auth/logout' && method === 'post') {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('token');
        return ok({ message: 'Logged out successfully' });
    }

    // 4. AUTH REGISTER
    if (pathname === '/auth/register' && method === 'post') {
        const { name, email, password, role, ...otherData } = body;
        if (!email || !password || !name) return err('All fields are required');

        const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) return err('User with this email already exists');

        const isApproved = role === 'patient' || role === 'admin';
        const newUser = {
            _id: generateId(),
            name,
            email,
            plainPassword: password,
            role: role || 'patient',
            isApproved,
            status: isApproved ? 'approved' : 'pending',
            createdAt: new Date().toISOString(),
            ...otherData
        };

        db.users.push(newUser);
        saveStorage(db);
        return ok({ message: 'User registered successfully. Waiting for approval (if applicable).' }, 201);
    }

    // 5. AUTH STATS
    if (pathname === '/auth/stats' && method === 'get') {
        const role = currentUser?.role || 'admin';
        const uid = currentUser?._id || currentUser?.id;

        if (role === 'admin') {
            return ok({
                totalUsers: db.users.length,
                totalPrescriptions: db.prescriptions.length,
                pendingApprovals: db.users.filter(u => !u.isApproved).length
            });
        }

        if (role === 'doctor') {
            const myPres = db.prescriptions.filter(p => String(p.doctorId) === String(uid));
            const pending = myPres.filter(p => p.status === 'pending').length;
            const dispensed = myPres.filter(p => p.status === 'dispensed').length;
            const rate = myPres.length > 0 ? ((dispensed / myPres.length) * 100).toFixed(1) : '100.0';
            return ok({
                totalPrescriptions: myPres.length,
                pendingPrescriptions: pending,
                dispensedPrescriptions: dispensed,
                completedSuccessRate: `${rate}%`
            });
        }

        if (role === 'pharmacy') {
            return ok({
                pendingQueue: db.prescriptions.filter(p => p.status === 'pending').length,
                dispensedByMe: db.prescriptions.filter(p => p.dispensedBy === uid || p.status === 'dispensed').length
            });
        }

        if (role === 'hospital') {
            return ok({
                totalDoctors: db.users.filter(u => u.role === 'doctor').length,
                totalPatients: db.users.filter(u => u.role === 'patient').length,
                totalPrescriptions: db.prescriptions.length,
                pendingVerification: db.prescriptions.filter(p => p.status === 'pending').length,
                verifiedPrescriptions: db.prescriptions.filter(p => p.status === 'dispensed').length,
                expiredPrescriptions: 0
            });
        }

        if (role === 'patient') {
            const myPres = db.prescriptions.filter(p =>
                String(p.patientId) === String(uid) ||
                p.patientName === currentUser?.name ||
                p.patientId === currentUser?.email
            );
            return ok({
                myPrescriptions: myPres.length,
                activePrescriptions: myPres.filter(p => p.status === 'pending').length
            });
        }

        return ok({});
    }

    // 6. PRESCRIPTIONS LIST
    if (pathname === '/prescriptions' && method === 'get') {
        let list = [...db.prescriptions];
        const role = currentUser?.role;
        const uid = currentUser?._id || currentUser?.id;

        if (role === 'doctor') {
            list = list.filter(p => String(p.doctorId) === String(uid));
        } else if (role === 'patient') {
            list = list.filter(p =>
                String(p.patientId) === String(uid) ||
                p.patientName === currentUser?.name ||
                p.patientId === currentUser?.email
            );
        }

        const status = queryParams.get('status');
        if (status) {
            list = list.filter(p => p.status === status);
        }

        const search = queryParams.get('search');
        if (search) {
            const s = search.toLowerCase();
            list = list.filter(p =>
                (p.patientName && p.patientName.toLowerCase().includes(s)) ||
                (p.diagnosis && p.diagnosis.toLowerCase().includes(s))
            );
        }

        // Populate doctor details
        const populated = list.map(p => {
            const doc = db.users.find(u => String(u._id) === String(p.doctorId));
            return {
                ...p,
                doctorId: doc ? { _id: doc._id, name: doc.name, licenseNumber: doc.licenseNumber } : p.doctorId
            };
        });

        return ok({
            prescriptions: populated,
            pagination: {
                total: populated.length,
                page: 1,
                pages: 1
            }
        });
    }

    // 7. CREATE PRESCRIPTION
    if (pathname === '/prescriptions/create' && method === 'post') {
        const { patientId, patientName, patientAge, diagnosis, medicines, expiryDate } = body;
        const doctorId = currentUser?._id || currentUser?.id || '660000000000000000000003';

        const hash = 'rx_' + Math.random().toString(36).substring(2) + Date.now().toString(16);
        const signature = 'sig_rsa_' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        const newPrescription = {
            _id: generateId(),
            doctorId,
            patientId: patientId || '660000000000000000000004',
            patientName: patientName || 'Eleanor Rigby',
            patientAge: patientAge || 30,
            diagnosis: diagnosis || 'General Health Review',
            medicines: medicines || [],
            expiryDate: expiryDate || '2027-12-31',
            prescriptionHash: hash,
            digitalSignature: signature,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        db.prescriptions.unshift(newPrescription);
        db.auditLogs.unshift({
            _id: generateId(),
            actorId: doctorId,
            actorRole: 'doctor',
            action: 'CREATE_PRESCRIPTION',
            details: `Prescription created for patient ${newPrescription.patientName}`,
            targetId: newPrescription._id,
            targetType: 'Prescription',
            createdAt: new Date().toISOString()
        });

        saveStorage(db);
        return ok({ message: 'Prescription Created & Signed', prescription: newPrescription }, 201);
    }

    // 8. VERIFY PRESCRIPTION
    if (pathname.startsWith('/prescriptions/verify/') && method === 'get') {
        const id = pathname.replace('/prescriptions/verify/', '');
        const prescription = db.prescriptions.find(p => String(p._id) === String(id));
        if (!prescription) return err('Prescription not found', 404);
        return ok({
            isValid: true,
            message: 'Digital Signature Verified. The cryptographic integrity check passed successfully.'
        });
    }

    // 9. DISPENSE PRESCRIPTION
    if (pathname.startsWith('/prescriptions/dispense/') && method === 'post') {
        const id = pathname.replace('/prescriptions/dispense/', '');
        const rx = db.prescriptions.find(p => String(p._id) === String(id));
        if (!rx) return err('Prescription not found', 404);
        if (rx.status === 'dispensed') return err('Prescription already dispensed');

        rx.status = 'dispensed';
        rx.dispensedBy = currentUser?._id || currentUser?.id || '660000000000000000000005';
        rx.dispensedAt = new Date().toISOString();

        db.auditLogs.unshift({
            _id: generateId(),
            actorId: rx.dispensedBy,
            actorRole: 'pharmacy',
            action: 'DISPENSE_PRESCRIPTION',
            details: `Prescription dispensed to patient ${rx.patientName}`,
            targetId: rx._id,
            targetType: 'Prescription',
            createdAt: new Date().toISOString()
        });

        saveStorage(db);
        return ok({ message: 'Prescription Dispensed successfully', prescription: rx });
    }

    // 10. DELETE PRESCRIPTION
    if (pathname.startsWith('/prescriptions/') && method === 'delete') {
        const id = pathname.replace('/prescriptions/', '');
        const idx = db.prescriptions.findIndex(p => String(p._id) === String(id));
        if (idx !== -1) {
            db.prescriptions.splice(idx, 1);
            saveStorage(db);
        }
        return ok({ message: 'Prescription deleted successfully' });
    }

    // 11. PATIENT DOCTOR DETAILS
    if (pathname === '/auth/patient/doctor-details' && method === 'get') {
        const patient = db.users.find(u => u._id === (currentUser?._id || currentUser?.id));
        const docId = patient?.doctorId || '660000000000000000000003';
        const doc = db.users.find(u => u._id === docId) || db.users.find(u => u.role === 'doctor');
        if (!doc) return err('No doctor assigned', 404);
        return ok({
            doctorName: doc.name,
            department: doc.department || 'Cardiology',
            roomNumber: doc.roomNumber || '304',
            floorNumber: doc.floorNumber || '3'
        });
    }

    // 12. NOTIFICATIONS
    if (pathname === '/auth/notifications' && method === 'get') {
        const uid = currentUser?._id || currentUser?.id;
        const notifs = db.notifications.filter(n => !n.userId || n.userId === uid);
        return ok({ notifications: notifs });
    }

    if (pathname.match(/^\/auth\/notifications\/.*\/read$/) && method === 'put') {
        const notifId = pathname.split('/')[3];
        const n = db.notifications.find(item => item._id === notifId);
        if (n) {
            n.isRead = true;
            saveStorage(db);
        }
        return ok({ message: 'Notification marked as read' });
    }

    // 13. AUDIT LOGS
    if (pathname === '/auth/audit-logs' && method === 'get') {
        return ok({ logs: db.auditLogs });
    }

    // 14. GET ALL USERS (ADMIN)
    if (pathname === '/auth/users' && method === 'get') {
        const safe = db.users.map(({ password, plainPassword, privateKey, ...u }) => u);
        return ok({ users: safe });
    }

    // 15. APPROVE USER
    if (pathname.startsWith('/auth/approve/') && method === 'put') {
        const id = pathname.replace('/auth/approve/', '');
        const target = db.users.find(u => String(u._id) === String(id));
        if (!target) return err('User not found', 404);
        target.isApproved = true;
        target.status = 'approved';
        saveStorage(db);
        return ok({ message: 'User approved successfully', user: target });
    }

    // 16. DELETE USER
    if (pathname.startsWith('/auth/users/') && method === 'delete') {
        const id = pathname.replace('/auth/users/', '');
        const idx = db.users.findIndex(u => String(u._id) === String(id));
        if (idx !== -1) {
            db.users.splice(idx, 1);
            saveStorage(db);
        }
        return ok({ message: 'User deleted successfully' });
    }

    // 17. UPDATE USER
    if (pathname.startsWith('/auth/users/') && method === 'put') {
        const id = pathname.replace('/auth/users/', '');
        const target = db.users.find(u => String(u._id) === String(id));
        if (!target) return err('User not found', 404);
        Object.assign(target, body);
        saveStorage(db);
        return ok({ message: 'User updated successfully', user: target });
    }

    // 18. PATIENTS LIST (FOR DOCTORS)
    if (pathname === '/auth/patients' && method === 'get') {
        const patients = db.users.filter(u => u.role === 'patient');
        return ok({ patients });
    }

    // 19. HOSPITALS LIST
    if (pathname === '/auth/hospitals' && method === 'get') {
        const hospitals = db.users.filter(u => u.role === 'hospital');
        return ok(hospitals);
    }

    // 20. UPDATE HOSPITAL (LINKING)
    if (pathname === '/auth/update-hospital' && method === 'put') {
        const { hospitalId } = body;
        const uid = currentUser?._id || currentUser?.id;
        const doc = db.users.find(u => String(u._id) === String(uid));
        if (doc) {
            doc.hospitalId = hospitalId;
            doc.associatedHospital = hospitalId;
            saveStorage(db);
        }
        return ok({ message: 'Hospital linked successfully' });
    }

    // 21. HOSPITAL DASHBOARD ENDPOINTS
    if (pathname === '/hospital/doctors' && method === 'get') {
        const doctors = db.users.filter(u => u.role === 'doctor');
        return ok({ doctors });
    }

    if (pathname === '/hospital/patients' && method === 'get') {
        const patients = db.users.filter(u => u.role === 'patient');
        return ok({ patients });
    }

    if (pathname === '/hospital/pharmacies' && method === 'get') {
        const pharmacies = db.users.filter(u => u.role === 'pharmacy');
        return ok({ pharmacies });
    }

    if (pathname === '/hospital/security-logs' && method === 'get') {
        return ok({ logs: db.auditLogs });
    }

    if (pathname === '/hospital/create-doctor' && method === 'post') {
        const { name, email, password, department, licenseNumber, roomNumber, floorNumber } = body;
        if (!name || !email) return err('Name and email are required');
        const newDoc = {
            _id: generateId(),
            name,
            email,
            plainPassword: password || '123456',
            role: 'doctor',
            status: 'approved',
            isApproved: true,
            department: department || 'General',
            licenseNumber: licenseNumber || 'DOC-' + Date.now().toString().slice(-4),
            roomNumber: roomNumber || '101',
            floorNumber: floorNumber || '1',
            hospitalId: currentUser?._id || currentUser?.id || '660000000000000000000002',
            createdAt: new Date().toISOString()
        };
        db.users.push(newDoc);
        saveStorage(db);
        return ok({ message: 'Doctor created successfully', doctor: newDoc }, 201);
    }

    if (pathname.startsWith('/hospital/update-doctor/') && method === 'put') {
        const id = pathname.replace('/hospital/update-doctor/', '');
        const doc = db.users.find(u => String(u._id) === String(id));
        if (!doc) return err('Doctor not found', 404);
        Object.assign(doc, body);
        saveStorage(db);
        return ok({ message: 'Doctor updated successfully', doctor: doc });
    }

    if (pathname.startsWith('/hospital/delete-doctor/') && method === 'delete') {
        const id = pathname.replace('/hospital/delete-doctor/', '');
        const idx = db.users.findIndex(u => String(u._id) === String(id));
        if (idx !== -1) {
            db.users.splice(idx, 1);
            saveStorage(db);
        }
        return ok({ message: 'Doctor deleted successfully' });
    }

    if (pathname.startsWith('/hospital/pharmacy-status/') && method === 'put') {
        const id = pathname.replace('/hospital/pharmacy-status/', '');
        const ph = db.users.find(u => String(u._id) === String(id));
        if (ph) {
            ph.status = body.status || 'approved';
            saveStorage(db);
        }
        return ok({ message: 'Status updated successfully' });
    }

    if (pathname === '/hospital/link-patient-doctor' && method === 'put') {
        const { patientId, doctorId } = body;
        const patient = db.users.find(u => String(u._id) === String(patientId));
        const doc = db.users.find(u => String(u._id) === String(doctorId));
        if (patient) {
            patient.doctorId = doctorId;
            db.notifications.unshift({
                _id: generateId(),
                userId: patient._id,
                message: `You have been assigned to ${doc ? doc.name : 'Dr. Vance'} (${doc?.department || 'Medicine'}). Visit Room ${doc?.roomNumber || '304'}.`,
                type: 'doctor_assignment',
                isRead: false,
                createdAt: new Date().toISOString()
            });
            saveStorage(db);
        }
        return ok({ message: 'Patient linked to doctor' });
    }

    // Default fallback
    console.warn(`[ClientMockDB] Unhandled route: ${method.toUpperCase()} ${pathname}`);
    return ok({});
}
