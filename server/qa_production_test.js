const http = require('http');
const crypto = require('crypto');

const BASE_HOST = 'localhost';
const PORT = 5000;

let testsPassed = 0;
let testsFailed = 0;
const results = [];

function request(method, path, body = null, token = null) {
    return new Promise((resolve) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(
            { hostname: BASE_HOST, port: PORT, path, method, headers },
            (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    let parsed = null;
                    try {
                        parsed = JSON.parse(data);
                    } catch (e) {
                        parsed = data;
                    }
                    resolve({ status: res.statusCode, data: parsed });
                });
            }
        );
        req.on('error', (err) => resolve({ status: 500, error: err.message }));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function assert(description, condition, details = '') {
    if (condition) {
        testsPassed++;
        results.push({ pass: true, desc: description });
        console.log(`  [PASS] ${description}`);
    } else {
        testsFailed++;
        results.push({ pass: false, desc: description, details });
        console.error(`  [FAIL] ${description} -> ${details}`);
    }
}

async function runProductionTestSuite() {
    console.log('===============================================================');
    console.log('       MEDISYNC QA / PRODUCTION COMPREHENSIVE TEST SUITE       ');
    console.log('===============================================================');

    // -------------------------------------------------------------
    // SECTION 1: Health Check & System Baseline
    // -------------------------------------------------------------
    console.log('\n--- SECTION 1: Base Health & Routing ---');
    const health = await request('GET', '/');
    assert('API Server Root Health Check', health.status === 200 && health.data === 'MediSync API is Running');

    // -------------------------------------------------------------
    // SECTION 2: Authentication & Registration Edge Cases
    // -------------------------------------------------------------
    console.log('\n--- SECTION 2: Authentication & Edge Cases ---');

    // Register without email
    const regNoEmail = await request('POST', '/api/auth/register', { password: '123' });
    assert('Registration with missing email rejected', regNoEmail.status >= 400);

    // Doctor direct registration blocked
    const regDocDirect = await request('POST', '/api/auth/register', {
        name: 'Dr. Hacker',
        email: 'doc.hacker@test.com',
        password: '123',
        role: 'doctor'
    });
    assert('Doctor direct registration blocked (Hospital administration only)', regDocDirect.status === 403);

    // Register valid new patient
    const testPatientEmail = `qa.patient.${Date.now()}@test.com`;
    const regPatient = await request('POST', '/api/auth/register', {
        name: 'QA Patient',
        email: testPatientEmail,
        password: 'Password123',
        role: 'patient',
        address: '42 QA Lane'
    });
    assert('Patient registration successful', regPatient.status === 201);

    // Duplicate email registration rejected
    const regDup = await request('POST', '/api/auth/register', {
        name: 'QA Patient Dup',
        email: testPatientEmail,
        password: 'Password123',
        role: 'patient'
    });
    assert('Duplicate email registration rejected', regDup.status === 400);

    // Invalid credentials login
    const loginInvalid = await request('POST', '/api/auth/login', {
        email: testPatientEmail,
        password: 'WrongPassword'
    });
    assert('Invalid password login rejected', loginInvalid.status === 400);

    // -------------------------------------------------------------
    // SECTION 3: Multi-Role Authentication & Token Issuance
    // -------------------------------------------------------------
    console.log('\n--- SECTION 3: Multi-Role Authentication ---');
    const rolesToTest = [
        { role: 'admin', email: 'admin@medisync.com' },
        { role: 'hospital', email: 'testhospital@lumina.sys' },
        { role: 'doctor', email: 'testsurgeon@lumina.sys' },
        { role: 'pharmacy', email: 'testpharmacy@lumina.sys' },
        { role: 'patient', email: 'testpatient@lumina.sys' }
    ];

    const tokens = {};
    for (const r of rolesToTest) {
        const res = await request('POST', '/api/auth/login', { email: r.email, password: '123456' });
        assert(`Login for role [${r.role}] (${r.email})`, res.status === 200 && !!res.data.token);
        if (res.data?.token) {
            tokens[r.role] = res.data.token;
        }
    }

    // -------------------------------------------------------------
    // SECTION 4: Profile & Dashboard Statistics Verification
    // -------------------------------------------------------------
    console.log('\n--- SECTION 4: Profiles & Dashboard Statistics ---');
    for (const r of rolesToTest) {
        const prof = await request('GET', '/api/auth/profile', null, tokens[r.role]);
        assert(`Profile retrieval for [${r.role}]`, prof.status === 200 && !prof.data.password && !prof.data.privateKey);

        const stats = await request('GET', '/api/auth/stats', null, tokens[r.role]);
        assert(`Stats retrieval for [${r.role}]`, stats.status === 200 && typeof stats.data === 'object');
    }

    // -------------------------------------------------------------
    // SECTION 5: Role-Based Access Control (RBAC) Security Boundaries
    // -------------------------------------------------------------
    console.log('\n--- SECTION 5: RBAC & Security Boundary Tests ---');
    // Patient attempts admin users list
    const patientAdminAttempt = await request('GET', '/api/auth/users', null, tokens.patient);
    assert('RBAC: Patient blocked from Admin users list', patientAdminAttempt.status === 403);

    // Doctor attempts hospital doctor creation
    const doctorHospitalAttempt = await request('POST', '/api/hospital/create-doctor', {}, tokens.doctor);
    assert('RBAC: Doctor blocked from Hospital doctor creation', doctorHospitalAttempt.status === 403);

    // Pharmacy attempts prescription creation
    const pharmacyPrescAttempt = await request('POST', '/api/prescriptions/create', {}, tokens.pharmacy);
    assert('RBAC: Pharmacy blocked from creating prescription', pharmacyPrescAttempt.status === 403);

    // Patient attempts dispensing medicine
    const patientDispenseAttempt = await request('POST', '/api/prescriptions/dispense/anyid', {}, tokens.patient);
    assert('RBAC: Patient blocked from dispensing medicines', patientDispenseAttempt.status === 403);

    // Unauthenticated request blocked
    const unauthAttempt = await request('GET', '/api/prescriptions');
    assert('Security: Unauthenticated request blocked', unauthAttempt.status === 401 || unauthAttempt.status === 403);

    // -------------------------------------------------------------
    // SECTION 6: Hospital Workflow
    // -------------------------------------------------------------
    console.log('\n--- SECTION 6: Hospital Workflow ---');
    // Hospital creates new doctor with department & room
    const newDocEmail = `dr.specialist.${Date.now()}@lumina.sys`;
    const createDocRes = await request('POST', '/api/hospital/create-doctor', {
        name: 'Dr. Sarah Connor',
        email: newDocEmail,
        password: 'DoctorPassword123',
        department: 'Neurology',
        licenseNumber: 'LIC-NEURO-999',
        roomNumber: '402',
        floorNumber: '4'
    }, tokens.hospital);
    assert('Hospital: Doctor creation with RSA keypair', createDocRes.status === 201 && !!createDocRes.data.doctor.publicKey);

    const createdDoctorId = createDocRes.data?.doctor?._id;

    // Hospital fetches doctors
    const hospitalDocs = await request('GET', '/api/hospital/doctors', null, tokens.hospital);
    assert('Hospital: Retrieve doctors directory', hospitalDocs.status === 200 && Array.isArray(hospitalDocs.data.doctors));

    // Hospital updates doctor details
    const updateDocRes = await request('PUT', `/api/hospital/update-doctor/${createdDoctorId}`, {
        roomNumber: '405'
    }, tokens.hospital);
    assert('Hospital: Update doctor room allocation', updateDocRes.status === 200);

    // Hospital assigns patient to doctor
    const linkRes = await request('PUT', '/api/hospital/link-patient-doctor', {
        patientId: '660000000000000000000004', // testpatient@lumina.sys
        doctorId: createdDoctorId
    }, tokens.hospital);
    assert('Hospital: Link patient to assigned doctor', linkRes.status === 200);

    // Hospital retrieves pharmacies
    const pharmList = await request('GET', '/api/hospital/pharmacies', null, tokens.hospital);
    assert('Hospital: Retrieve pharmacies directory', pharmList.status === 200 && Array.isArray(pharmList.data.pharmacies));

    // Hospital retrieves security logs
    const secLogs = await request('GET', '/api/hospital/security-logs', null, tokens.hospital);
    assert('Hospital: Retrieve security audit logs', secLogs.status === 200 && Array.isArray(secLogs.data.logs));

    // -------------------------------------------------------------
    // SECTION 7: Doctor Prescription Creation & Digital Signatures
    // -------------------------------------------------------------
    console.log('\n--- SECTION 7: Doctor & Digital Signatures ---');
    // Doctor creates prescription
    const prescPayload = {
        patientId: 'testpatient@lumina.sys',
        patientName: 'Eleanor Rigby',
        patientAge: 29,
        diagnosis: 'Seasonal Asthmatic Bronchitis',
        expiryDate: '2026-12-31',
        medicines: [
            { name: 'Albuterol Sulfate Inhaler', dosage: '90mcg', frequency: 'PRN', duration: '30 days' },
            { name: 'Prednisone', dosage: '20mg', frequency: 'QD', duration: '5 days' }
        ]
    };
    const createPrescRes = await request('POST', '/api/prescriptions/create', prescPayload, tokens.doctor);
    assert('Doctor: Prescription creation with SHA-256 hash & RSA signature',
        createPrescRes.status === 201 &&
        !!createPrescRes.data.prescription.prescriptionHash &&
        !!createPrescRes.data.prescription.digitalSignature
    );

    const generatedPrescId = createPrescRes.data?.prescription?._id;

    // Doctor retrieves prescriptions list
    const doctorPrescs = await request('GET', '/api/prescriptions', null, tokens.doctor);
    assert('Doctor: View issued prescriptions', doctorPrescs.status === 200 && Array.isArray(doctorPrescs.data.prescriptions));

    // Doctor retrieves patient directory
    const docPatients = await request('GET', '/api/auth/patients', null, tokens.doctor);
    assert('Doctor: View patient directory', docPatients.status === 200 && Array.isArray(docPatients.data.patients));

    // -------------------------------------------------------------
    // SECTION 8: Pharmacy Verification & Dispensing
    // -------------------------------------------------------------
    console.log('\n--- SECTION 8: Pharmacy Cryptographic Verification & Dispensing ---');
    // Pharmacy retrieves prescription queue
    const queueRes = await request('GET', '/api/prescriptions?status=pending', null, tokens.pharmacy);
    assert('Pharmacy: View pending prescription queue', queueRes.status === 200 && Array.isArray(queueRes.data.prescriptions));

    // Cryptographic verification test (Genuine)
    const verifyRes = await request('GET', `/api/prescriptions/verify/${generatedPrescId}`, null, tokens.pharmacy);
    assert('Pharmacy: Cryptographic verification of doctor RSA signature',
        verifyRes.status === 200 && verifyRes.data.isValid === true
    );

    // Negative Test: Verify non-existent prescription
    const verifyFake = await request('GET', '/api/prescriptions/verify/nonexistentid999', null, tokens.pharmacy);
    assert('Pharmacy: Reject verification of non-existent prescription', verifyFake.status === 404);

    // Pharmacy dispenses medication
    const dispenseRes = await request('POST', `/api/prescriptions/dispense/${generatedPrescId}`, {}, tokens.pharmacy);
    assert('Pharmacy: Dispense medication', dispenseRes.status === 200);

    // Prevent double-dispensing
    const doubleDispense = await request('POST', `/api/prescriptions/dispense/${generatedPrescId}`, {}, tokens.pharmacy);
    assert('Pharmacy: Prevent double dispensing', doubleDispense.status === 400);

    // -------------------------------------------------------------
    // SECTION 9: Patient Portal & Notifications
    // -------------------------------------------------------------
    console.log('\n--- SECTION 9: Patient Portal & Notifications ---');
    // Patient views assigned doctor details
    const patientDoc = await request('GET', '/api/auth/patient/doctor-details', null, tokens.patient);
    assert('Patient: View assigned doctor details (room, floor, department)',
        patientDoc.status === 200 && !!patientDoc.data.doctorName && !!patientDoc.data.department
    );

    // Patient views prescriptions
    const patientPrescs = await request('GET', '/api/prescriptions', null, tokens.patient);
    assert('Patient: View my prescriptions history', patientPrescs.status === 200 && Array.isArray(patientPrescs.data.prescriptions));

    // Patient views notifications
    const notifs = await request('GET', '/api/auth/notifications', null, tokens.patient);
    assert('Patient: View notifications', notifs.status === 200 && Array.isArray(notifs.data.notifications));

    // -------------------------------------------------------------
    // SECTION 10: Admin Management & System Audits
    // -------------------------------------------------------------
    console.log('\n--- SECTION 10: Admin Management & Audits ---');
    // Admin retrieves all users
    const allUsersRes = await request('GET', '/api/auth/users', null, tokens.admin);
    assert('Admin: View complete user registry', allUsersRes.status === 200 && Array.isArray(allUsersRes.data.users));

    // Admin updates user
    const adminUpdate = await request('PUT', `/api/auth/users/${createdDoctorId}`, {
        name: 'Dr. Sarah Connor MD'
    }, tokens.admin);
    assert('Admin: Update user profile', adminUpdate.status === 200);

    // Admin approves user
    const adminApprove = await request('PUT', `/api/auth/approve/${createdDoctorId}`, {}, tokens.admin);
    assert('Admin: Approve user account', adminApprove.status === 200);

    // Admin retrieves audit logs
    const auditLogsRes = await request('GET', '/api/auth/audit-logs', null, tokens.admin);
    assert('Admin: View system audit trail logs', auditLogsRes.status === 200 && Array.isArray(auditLogsRes.data.logs));

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`TOTAL TESTS RUN: ${testsPassed + testsFailed}`);
    console.log(`PASSED: ${testsPassed}`);
    console.log(`FAILED: ${testsFailed}`);
    console.log(`SUCCESS RATE: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
    console.log('===============================================================');

    if (testsFailed === 0) {
        console.log('>>> ALL PRODUCTION QA TESTS PASSED WITH ZERO ERRORS! <<<');
    } else {
        console.log('>>> SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE. <<<');
    }
}

runProductionTestSuite();
