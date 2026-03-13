const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const pdfParse = require('pdf-parse');

/**
 * POST /api/analyze
 * Body: { reportId, filename }
 * Extacts text using OCR or pdf-parse.
 */
router.post('/', async (req, res) => {
    const { reportId, filename } = req.body;

    if (!reportId || !filename) {
        return res.status(400).json({ success: false, message: 'reportId and filename are required.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found.' });
    }

    try {
        let extractedText = '';
        const ext = path.extname(filename).toLowerCase();

        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            extractedText = pdfData.text;
        } else {
            return res.status(400).json({ success: false, message: 'Image OCR is currently disabled. Please upload a PDF.' });
        }

        res.json({
            status: "success",
            extracted_text: extractedText.trim()
        });
    } catch (err) {
        console.error('OCR Error:', err);
        res.status(500).json({ success: false, message: 'OCR analysis failed due to server error.' });
    }
});

router.get('/:reportId', (req, res) => {
    res.json({
        success: true,
        message: 'Analysis retrieval by ID coming in Phase 2.',
        reportId: req.params.reportId,
    });
});

module.exports = router;
