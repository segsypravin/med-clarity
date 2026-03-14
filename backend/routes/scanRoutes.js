const express = require("express");
const multer = require("multer");
const analyzeScan = require("../services/scanService");

const router = express.Router();

// where uploaded files will be stored
const upload = multer({ dest: "uploads/" });

router.post("/scan", upload.single("scan"), async (req, res) => {
    try {
        const filePath = req.file.path;

        const result = await analyzeScan(filePath);

        res.json({
            message: "Scan analyzed successfully",
            prediction: result.prediction,
            confidence: result.confidence
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Scan analysis failed" });
    }
});

module.exports = router;