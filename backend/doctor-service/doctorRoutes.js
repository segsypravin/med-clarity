const express = require('express');
const router = express.Router();
const doctorController = require('./doctorController');

/**
 * GET /api/get-doctors
 * Handled by getNearbyDoctors controller
 */
router.get('/', doctorController.getNearbyDoctors);

module.exports = router;
