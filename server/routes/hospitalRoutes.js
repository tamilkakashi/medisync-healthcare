const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { auth, authorizeRoles } = require('../middleware/authMiddleware');

// All hospital routes require hospital or admin role
router.use(auth);
router.use(authorizeRoles('hospital', 'admin'));

// Doctor Management
router.post('/create-doctor', hospitalController.createDoctor);
router.get('/doctors', hospitalController.getDoctors);
router.put('/update-doctor/:id', hospitalController.updateDoctor);
router.put('/deactivate-doctor/:id', hospitalController.deactivateDoctor);
router.delete('/delete-doctor/:id', hospitalController.deleteDoctor);

// Patient Management
router.get('/patients', hospitalController.getPatients);
router.put('/update-patient/:id', hospitalController.updatePatient);
router.put('/link-patient-doctor', hospitalController.linkPatientDoctor);

// Pharmacy Approval
router.get('/pharmacies', hospitalController.getPharmacies);
router.put('/pharmacy-status/:id', hospitalController.updatePharmacyStatus);

// Security Logs
router.get('/security-logs', hospitalController.getSecurityLogs);

module.exports = router;
