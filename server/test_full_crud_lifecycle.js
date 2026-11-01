const http = require('http');
const crypto = require('crypto');

const BASE_HOST = 'localhost';
const PORT = 5000;

let passCount = 0;
let failCount = 0;
const testDetails = [];

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

function check(moduleName, operation, description, condition, errorMsg = '') {
    if (condition) {
        passCount++;
        testDetails.push({ module: moduleName, op: operation, desc: description, passed: true });
        console.log(`  [PASS] [${moduleName}] [${operation}] ${description}`);
    } else {
        failCount++;
        testDetails.push({ module: moduleName, op: operation, desc: description, passed: false, error: errorMsg });
        console.error(`  [FAIL] [${moduleName}] [${operation}] ${description} -> ${errorMsg}`);
    }
}

async function runFullCrudLifecycleSuite() {
    console.log('========================================================================');
    console.log('       MEDISYNC A-Z FULL CRUD & LIFECYCLE AUDIT TEST SUITE             ');
    console.log('========================================================================\n');

    // 0. AUTHENTICATE ALL STAKEHOLDERS
    console.log('--- Step 0: Initializing Stakeholder Sessions ---');
    const adminLogin = await request('POST', '/api/auth/login', { email: 'admin@medisync.com', password: '123456' });
    const hospitalLogin = await request('POST', '/api/auth/login', { email: 'testhospital@lumina.sys', password: '123456' });
    const doctorLogin = await request('POST', '/api/auth/login', { email: 'testsurgeon@lumina.sys', password: '123456' });
    const pharmacyLogin = await request('POST', '/api/auth/login', { email: 'testpharmacy@lumina.sys', password: '123456' });
    const patientLogin = await request('POST', '/api/auth/login', { email: 'testpatient@lumina.sys', password: '123456' });

    const adminToken = adminLogin.data.token;
    const hospitalToken = hospitalLogin.data.token;
    const doctorToken = doctorLogin.data.token;
    const pharmacyToken = pharmacyLogin.data.token;
    const patientToken = patientLogin.data.token;

    check('Auth', 'LOGIN', 'Admin authenticated', adminLogin.status === 200 && !!adminToken);
    check('Auth', 'LOGIN', 'Hospital authenticated', hospitalLogin.status === 200 && !!hospitalToken);
    check('Auth', 'LOGIN', 'Doctor authenticated', doctorLogin.status === 200 && !!doctorToken);
    check('Auth', 'LOGIN', 'Pharmacy authenticated', pharmacyLogin.status === 200 && !!pharmacyToken);
    check('Auth', 'LOGIN', 'Patient authenticated', patientLogin.status === 200 && !!patientToken);

    // =========================================================================
    // MODULE 1: USER MANAGEMENT (ADMIN CRUD)
    // =========================================================================
    console.log('\n--- Module 1: User Management (Admin CRUD) ---');
    const tempUserEmail = `crud.tempuser.${Date.now()}@test.sys`;

    // 1.1 CREATE
    const userCreateRes = await request('POST', '/api/auth/register', {
        name: 'Temp Test User',
        email: tempUserEmail,
        password: 'Password@123',
        role: 'patient',
        address: '100 Test Blvd'
    });
    check('Users', 'CREATE', 'Admin/Public creates user profile', userCreateRes.status === 201);

    // 1.2 READ
    const usersListRes = await request('GET', '/api/auth/users', null, adminToken);
    const createdUser = usersListRes.data?.users?.find(u => u.email === tempUserEmail);
    check('Users', 'READ', 'Admin reads user from registry', !!createdUser);
    const tempUserId = createdUser?._id;

    // 1.3 UPDATE (Details)
    const userUpdateRes = await request('PUT', `/api/auth/users/${tempUserId}`, {
        name: 'Updated Temp User',
        role: 'patient'
    }, adminToken);
    check('Users', 'UPDATE', 'Admin updates user name/attributes', userUpdateRes.status === 200 && userUpdateRes.data?.user?.name === 'Updated Temp User');

    // 1.4 UPDATE (Approve)
    const userApproveRes = await request('PUT', `/api/auth/approve/${tempUserId}`, {}, adminToken);
    check('Users', 'UPDATE', 'Admin approves user account status', userApproveRes.status === 200 && userApproveRes.data?.user?.isApproved === true);

    // 1.5 DELETE
    const userDeleteRes = await request('DELETE', `/api/auth/users/${tempUserId}`, null, adminToken);
    check('Users', 'DELETE', 'Admin permanently deletes user', userDeleteRes.status === 200);

    // 1.6 VERIFY DELETED
    const usersAfterDelete = await request('GET', '/api/auth/users', null, adminToken);
    const userStillExists = usersAfterDelete.data?.users?.some(u => String(u._id) === String(tempUserId));
    check('Users', 'DELETE_VERIFY', 'Confirm user completely purged from system', !userStillExists);

    // =========================================================================
    // MODULE 2: DOCTOR MANAGEMENT (HOSPITAL CRUD)
    // =========================================================================
    console.log('\n--- Module 2: Doctor Management (Hospital CRUD) ---');
    const tempDocEmail = `crud.doc.${Date.now()}@lumina.sys`;

    // 2.1 CREATE DOCTOR
    const docCreateRes = await request('POST', '/api/hospital/create-doctor', {
        name: 'Dr. Gregory House',
        email: tempDocEmail,
        password: 'DocPassword@123',
        department: 'Diagnostic Medicine',
        licenseNumber: 'LIC-HOUSE-MD',
        roomNumber: '404',
        floorNumber: '4'
    }, hospitalToken);
    check('Doctor', 'CREATE', 'Hospital creates doctor with RSA keypair', docCreateRes.status === 201 && !!docCreateRes.data?.doctor?.publicKey);
    const tempDoctorId = docCreateRes.data?.doctor?._id;

    // 2.2 READ DOCTORS
    const docsListRes = await request('GET', '/api/hospital/doctors', null, hospitalToken);
    const foundDoc = docsListRes.data?.doctors?.find(d => String(d._id) === String(tempDoctorId));
    check('Doctor', 'READ', 'Hospital reads doctor directory', !!foundDoc && foundDoc.department === 'Diagnostic Medicine');

    // 2.3 UPDATE DOCTOR (Room, Floor, Status)
    const docUpdateRes = await request('PUT', `/api/hospital/update-doctor/${tempDoctorId}`, {
        roomNumber: '408',
        floorNumber: '5',
        department: 'Nephrology'
    }, hospitalToken);
    check('Doctor', 'UPDATE', 'Hospital updates doctor room/floor/department', docUpdateRes.status === 200 && docUpdateRes.data?.doctor?.roomNumber === '408');

    // 2.4 DEACTIVATE DOCTOR
    const docDeactivateRes = await request('PUT', `/api/hospital/deactivate-doctor/${tempDoctorId}`, {}, hospitalToken);
    check('Doctor', 'UPDATE_STATUS', 'Hospital deactivates / suspends doctor', docDeactivateRes.status === 200);

    // 2.5 DELETE DOCTOR
    const docDeleteRes = await request('DELETE', `/api/hospital/delete-doctor/${tempDoctorId}`, null, hospitalToken);
    check('Doctor', 'DELETE', 'Hospital permanently deletes doctor', docDeleteRes.status === 200);

    // 2.6 VERIFY DOCTOR DELETED
    const docsAfterDelete = await request('GET', '/api/hospital/doctors', null, hospitalToken);
    const docStillExists = docsAfterDelete.data?.doctors?.some(d => String(d._id) === String(tempDoctorId));
    check('Doctor', 'DELETE_VERIFY', 'Confirm doctor purged from hospital directory', !docStillExists);

    // =========================================================================
    // MODULE 3: PATIENT MANAGEMENT & CONSULTATION LINKING (HOSPITAL CRUD)
    // =========================================================================
    console.log('\n--- Module 3: Patient Management & Consultation (Hospital CRUD) ---');
    const tempPatientEmail = `crud.patient.${Date.now()}@patient.sys`;

    // 3.1 CREATE PATIENT
    const patCreateRes = await request('POST', '/api/auth/register', {
        name: 'Patient Arthur Dent',
        email: tempPatientEmail,
        password: 'DentPassword@123',
        role: 'patient',
        address: 'Cottington, England'
    });
    check('Patient', 'CREATE', 'Patient registers account', patCreateRes.status === 201);

    // Login as the new patient
    const newPatLogin = await request('POST', '/api/auth/login', { email: tempPatientEmail, password: 'DentPassword@123' });
    const newPatToken = newPatLogin.data?.token;
    const newPatId = newPatLogin.data?.user?.id;
    check('Patient', 'LOGIN', 'Newly created patient logs in', newPatLogin.status === 200 && !!newPatToken);

    // 3.2 READ PATIENT
    const patsListRes = await request('GET', '/api/hospital/patients', null, hospitalToken);
    const foundPat = patsListRes.data?.patients?.find(p => String(p._id) === String(newPatId));
    check('Patient', 'READ', 'Hospital reads patient in directory', !!foundPat);

    // 3.3 UPDATE PATIENT
    const patUpdateRes = await request('PUT', `/api/hospital/update-patient/${newPatId}`, {
        name: 'Arthur Dent Esq.',
        address: 'Space Sector ZZ9 Plural Z Alpha'
    }, hospitalToken);
    check('Patient', 'UPDATE', 'Hospital updates patient address details', patUpdateRes.status === 200 && patUpdateRes.data?.patient?.name === 'Arthur Dent Esq.');

    // 3.4 LINK PATIENT TO DOCTOR (Consultation Assignment)
    const linkRes = await request('PUT', '/api/hospital/link-patient-doctor', {
        patientId: newPatId,
        doctorId: '660000000000000000000003' // Dr. Marcus Vance
    }, hospitalToken);
    check('Patient', 'LINK', 'Hospital links patient to consulting physician', linkRes.status === 200);

    // 3.5 READ ASSIGNED DOCTOR (From Patient View)
    const patDocRes = await request('GET', '/api/auth/patient/doctor-details', null, newPatToken);
    check('Patient', 'READ_ASSIGNMENT', 'Patient retrieves assigned physician details (room, floor, dept)',
        patDocRes.status === 200 && patDocRes.data?.doctorName === 'Dr. Marcus Vance' && !!patDocRes.data?.roomNumber
    );

    // 3.6 NOTIFICATION READ & UPDATE
    const notifsRes = await request('GET', '/api/auth/notifications', null, newPatToken);
    const assignedNotif = notifsRes.data?.notifications?.find(n => n.type === 'doctor_assignment' && n.userId === newPatId);
    check('Notification', 'READ', 'Patient receives doctor assignment notification', !!assignedNotif);

    if (assignedNotif) {
        const notifReadRes = await request('PUT', `/api/auth/notifications/${assignedNotif._id}/read`, {}, newPatToken);
        check('Notification', 'UPDATE', 'Patient marks notification as read', notifReadRes.status === 200);
    }

    // =========================================================================
    // MODULE 4: PRESCRIPTION LIFECYCLE (DOCTOR, PHARMACY, PATIENT CRUD)
    // =========================================================================
    console.log('\n--- Module 4: Prescription Lifecycle (Cryptographic CRUD) ---');

    // 4.1 CREATE PRESCRIPTION (Normal Flow)
    const prescPayload = {
        patientId: tempPatientEmail,
        patientName: 'Arthur Dent Esq.',
        patientAge: 42,
        diagnosis: 'Hyperspace Travel Vertigo',
        expiryDate: '2027-01-01',
        medicines: [
            { name: 'Pan Galactic Gargle Blaster', dosage: '10ml', frequency: 'PRN', duration: '3 days' },
            { name: 'Hydrocortisone', dosage: '10mg', frequency: 'BID', duration: '7 days' }
        ]
    };
    const prescCreateRes = await request('POST', '/api/prescriptions/create', prescPayload, doctorToken);
    check('Prescription', 'CREATE', 'Doctor issues digitally signed prescription',
        prescCreateRes.status === 201 && !!prescCreateRes.data?.prescription?.digitalSignature
    );
    const activePrescId = prescCreateRes.data?.prescription?._id;

    // 4.2 READ PRESCRIPTION (Doctor View)
    const docPrescs = await request('GET', '/api/prescriptions', null, doctorToken);
    const docFound = docPrescs.data?.prescriptions?.some(p => String(p._id) === String(activePrescId));
    check('Prescription', 'READ_DOCTOR', 'Doctor views issued prescription in history', docFound);

    // 4.3 READ PRESCRIPTION (Patient View)
    const patPrescs = await request('GET', '/api/prescriptions', null, newPatToken);
    const patFound = patPrescs.data?.prescriptions?.some(p => String(p._id) === String(activePrescId));
    check('Prescription', 'READ_PATIENT', 'Patient views issued prescription in dashboard', patFound);

    // 4.4 READ PRESCRIPTION QUEUE (Pharmacy View)
    const queueRes = await request('GET', '/api/prescriptions?status=pending', null, pharmacyToken);
    const queueFound = queueRes.data?.prescriptions?.some(p => String(p._id) === String(activePrescId));
    check('Prescription', 'READ_PHARMACY', 'Pharmacy retrieves pending prescription in dispensing queue', queueFound);

    // 4.5 VERIFY CRYPTOGRAPHIC SIGNATURE (Pharmacy Verification)
    const verifyRes = await request('GET', `/api/prescriptions/verify/${activePrescId}`, null, pharmacyToken);
    check('Prescription', 'VERIFY_SIGNATURE', 'Pharmacy validates Doctor RSA-2048 Digital Signature',
        verifyRes.status === 200 && verifyRes.data?.isValid === true
    );

    // 4.6 UPDATE / DISPENSE (Pharmacy Dispense)
    const dispenseRes = await request('POST', `/api/prescriptions/dispense/${activePrescId}`, {}, pharmacyToken);
    check('Prescription', 'UPDATE_DISPENSE', 'Pharmacy dispenses prescription medications', dispenseRes.status === 200);

    // 4.7 DOUBLE DISPENSE GUARD
    const reDispenseRes = await request('POST', `/api/prescriptions/dispense/${activePrescId}`, {}, pharmacyToken);
    check('Prescription', 'GUARD_DOUBLE_DISPENSE', 'System rejects duplicate dispensing of same prescription', reDispenseRes.status === 400);

    // 4.8 DELETE PRESCRIPTION TEST (DRAFT vs DISPENSED)
    // Create a draft prescription to test deletion
    const draftRes = await request('POST', '/api/prescriptions/create', {
        patientId: tempPatientEmail,
        patientName: 'Arthur Dent Esq.',
        patientAge: 42,
        diagnosis: 'Draft Error Diagnosis',
        expiryDate: '2026-12-31',
        medicines: [{ name: 'Placebo', dosage: '0mg', frequency: 'QD', duration: '1 day' }]
    }, doctorToken);
    const draftPrescId = draftRes.data?.prescription?._id;

    // Delete un-dispensed draft prescription
    const deleteDraftRes = await request('DELETE', `/api/prescriptions/${draftPrescId}`, null, doctorToken);
    check('Prescription', 'DELETE', 'Doctor successfully deletes un-dispensed draft prescription', deleteDraftRes.status === 200);

    // Verify un-dispensed draft is gone
    const checkDraftRes = await request('GET', `/api/prescriptions/verify/${draftPrescId}`, null, pharmacyToken);
    check('Prescription', 'DELETE_VERIFY', 'Confirm draft prescription is removed', checkDraftRes.status === 404);

    // Attempt to delete already dispensed prescription (Should be rejected)
    const deleteDispensedRes = await request('DELETE', `/api/prescriptions/${activePrescId}`, null, doctorToken);
    check('Prescription', 'GUARD_DELETE_DISPENSED', 'System forbids deletion of already dispensed prescription', deleteDispensedRes.status === 400);

    // =========================================================================
    // MODULE 5: PHARMACY MANAGEMENT (HOSPITAL CRUD)
    // =========================================================================
    console.log('\n--- Module 5: Pharmacy Management (Hospital CRUD) ---');
    const tempPharmEmail = `crud.pharm.${Date.now()}@pharma.sys`;

    // 5.1 CREATE PHARMACY
    const pharmCreateRes = await request('POST', '/api/auth/register', {
        name: 'Omega Community Pharmacy',
        email: tempPharmEmail,
        password: 'PharmaPassword@123',
        role: 'pharmacy',
        licenseNumber: 'PH-OMEGA-77',
        address: '77 Health Park Way'
    });
    check('Pharmacy', 'CREATE', 'Pharmacy registers institution account', pharmCreateRes.status === 201);

    // 5.2 READ PHARMACIES
    const pharmsListRes = await request('GET', '/api/hospital/pharmacies', null, hospitalToken);
    const foundPharm = pharmsListRes.data?.pharmacies?.find(p => p.email === tempPharmEmail);
    check('Pharmacy', 'READ', 'Hospital reads pharmacies network list', !!foundPharm);
    const tempPharmId = foundPharm?._id;

    // 5.3 UPDATE PHARMACY (Approve)
    const approvePharmRes = await request('PUT', `/api/hospital/pharmacy-status/${tempPharmId}`, {
        status: 'approved'
    }, hospitalToken);
    check('Pharmacy', 'UPDATE_STATUS', 'Hospital approves pharmacy license and status', approvePharmRes.status === 200);

    // 5.4 UPDATE PHARMACY (Suspend)
    const suspendPharmRes = await request('PUT', `/api/hospital/pharmacy-status/${tempPharmId}`, {
        status: 'suspended'
    }, hospitalToken);
    check('Pharmacy', 'UPDATE_STATUS', 'Hospital suspends pharmacy permissions', suspendPharmRes.status === 200);

    // 5.5 DELETE PHARMACY (Admin)
    const deletePharmRes = await request('DELETE', `/api/auth/users/${tempPharmId}`, null, adminToken);
    check('Pharmacy', 'DELETE', 'Admin permanently deletes pharmacy record', deletePharmRes.status === 200);

    // =========================================================================
    // MODULE 6: SECURITY AUDIT LEDGER INTEGRITY
    // =========================================================================
    console.log('\n--- Module 6: Security Audit Ledger Integrity ---');
    const adminLogsRes = await request('GET', '/api/auth/audit-logs', null, adminToken);
    const hospitalLogsRes = await request('GET', '/api/hospital/security-logs', null, hospitalToken);

    check('Audit', 'READ_ADMIN', 'Admin retrieves system-wide immutable audit trail',
        adminLogsRes.status === 200 && Array.isArray(adminLogsRes.data?.logs) && adminLogsRes.data.logs.length > 0
    );

    check('Audit', 'READ_HOSPITAL', 'Hospital retrieves institutional security audit logs',
        hospitalLogsRes.status === 200 && Array.isArray(hospitalLogsRes.data?.logs) && hospitalLogsRes.data.logs.length > 0
    );

    // Verify presence of CRUD operations in audit trail
    const actionsInLog = (adminLogsRes.data?.logs || []).map(l => l.action);
    check('Audit', 'VERIFY_CREATE', 'Audit log records CREATE actions', actionsInLog.some(a => a?.includes('CREATE')));
    check('Audit', 'VERIFY_UPDATE', 'Audit log records UPDATE actions', actionsInLog.some(a => a?.includes('UPDATE') || a?.includes('LINK') || a?.includes('DISPENSE')));
    check('Audit', 'VERIFY_DELETE', 'Audit log records DELETE actions', actionsInLog.some(a => a?.includes('DELETE')));

    // Clean up temporary patient Arthur Dent
    await request('DELETE', `/api/auth/users/${newPatId}`, null, adminToken);

    // =========================================================================
    // FINAL SUMMARY
    // =========================================================================
    console.log('\n========================================================================');
    console.log(`TOTAL A-Z CRUD OPERATIONS TESTED: ${passCount + failCount}`);
    console.log(`SUCCESSFUL (PASSED): ${passCount}`);
    console.log(`FAILED: ${failCount}`);
    console.log(`OVERALL COMPLIANCE SCORE: ${Math.round((passCount / (passCount + failCount)) * 100)}%`);
    console.log('========================================================================');

    if (failCount === 0) {
        console.log('>>> COMPLETE A-Z CRUD LIFECYCLE FOR ALL MODULES IS 100% OPERATIONAL! <<<');
    } else {
        console.log('>>> SOME OPERATIONS FAILED. CHECK DETAILS ABOVE. <<<');
    }
}

runFullCrudLifecycleSuite();
