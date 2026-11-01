const express = require('express');
const { register, login, getProfile, logout, getAllUsers, getPatients, approveUser, getStats, getAuditLogs, deleteUser, updateUser, addHospitalStaff, getHospitalStaff, getHospitals, linkHospital, getPatientDoctorDetails, getNotifications, markNotificationRead } = require('../controllers/authController');
const { auth, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
console.log('Auth Routes initialized');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);
router.get('/stats', auth, getStats);
router.get('/patients', auth, authorizeRoles('admin', 'doctor'), getPatients);

// Hospital Staff Routes
router.post('/hospital/staff', auth, authorizeRoles('hospital'), addHospitalStaff);
router.get('/hospital/staff', auth, authorizeRoles('hospital'), getHospitalStaff);

// Doctor: Browse and Link to a Hospital
router.get('/hospitals', auth, getHospitals);
router.put('/update-hospital', auth, authorizeRoles('doctor'), linkHospital);

// Admin Routes
router.get('/users', auth, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id', auth, authorizeRoles('admin'), updateUser);
router.delete('/users/:id', auth, authorizeRoles('admin'), deleteUser);
router.put('/approve/:id', auth, authorizeRoles('admin'), approveUser);
router.get('/audit-logs', auth, authorizeRoles('admin'), getAuditLogs);

// Patient & Notification Routes
router.get('/patient/doctor-details', auth, authorizeRoles('patient'), getPatientDoctorDetails);
router.get('/notifications', auth, getNotifications);
router.put('/notifications/:id/read', auth, markNotificationRead);

module.exports = router;
