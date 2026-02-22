const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer config
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const stamp = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `report-${stamp}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        allowed.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error('Only PDF and image files are allowed'));
    },
});

/**
 * POST /api/upload
 * Accepts: multipart/form-data with field "report"
 */
router.post('/', upload.single('report'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const record = {
        id: `rpt-${Date.now()}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        uploadedAt: new Date().toISOString(),
        status: 'pending', // pending | analyzed
    };

    // In Phase 2 this record will be persisted to a DB and queued for OCR/AI
    res.status(201).json({
        success: true,
        message: 'Report uploaded successfully! Analysis will begin shortly.',
        file: record,
    });
});

module.exports = router;
