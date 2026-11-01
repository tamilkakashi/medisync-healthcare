const express = require('express');
const { createPrescription, getPrescriptions, verifyPrescription, dispensePrescription, deletePrescription } = require('../controllers/prescriptionController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Doctor creates
router.post('/create', verifyToken, authorizeRoles('doctor'), createPrescription);

// Get All (Filtered by Role in Controller)
router.get('/', verifyToken, getPrescriptions);

// Verify (Pharmacy, Patient, Admin)
router.get('/verify/:id', verifyToken, verifyPrescription);

// Pharmacy Dispenses
router.post('/dispense/:id', verifyToken, authorizeRoles('pharmacy'), dispensePrescription);

// Delete Prescription (Doctor who issued it or Admin)
router.delete('/:id', verifyToken, authorizeRoles('doctor', 'admin'), deletePrescription);

module.exports = router;
