const express = require('express');
const multer = require('multer');
const router = express.Router();
const doctorController = require('./doctorController');

// 📁 File upload config
const upload = multer({ dest: 'uploads/' });

/**
 * GET /api/doctors
 * Fetch nearby doctors
 */
router.get('/', doctorController.getNearbyDoctors);

/**
 * POST /api/doctors/analyze-report
 * Upload medical report → AI analysis
 */
router.post('/analyze-report', upload.single('file'), doctorController.analyzeReport);

module.exports = router;