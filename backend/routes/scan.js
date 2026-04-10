const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const analyzeScan = require("../services/scanService");

const router = express.Router();

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer config
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const stamp = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `scan-${stamp}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
        allowed.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error('Only JPG and PNG image files are allowed'));
    },
});

// route to upload and analyze scan
router.post("/", upload.single("scan"), async (req, res) => {
    console.log(`Received scan upload request: ${req.file ? req.file.originalname : 'no file'}`);
    
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    try {
        const filePath = req.file.path;

        // send image to AI service
        const result = await analyzeScan(filePath);

        res.json({
            message: "Scan analyzed successfully",
            prediction: result.prediction,
            confidence: result.confidence,
            summary: result.summary || "",
            recommendations: result.recommendations || [],
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Scan analysis failed" });
    }
});

module.exports = router;
