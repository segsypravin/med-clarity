const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

/**
 * POST /api/analyze
 * Body: { reportId, filename }
 * Extacts text using OCR or pdf-parse.
 */
router.post('/', async (req, res) => {
    const { reportId, filename, lang = 'en' } = req.body;

    if (!reportId || !filename) {
        return res.status(400).json({ success: false, message: 'reportId and filename are required.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found.' });
    }

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        formData.append('lang', lang);

        const response = await axios.post('http://127.0.0.1:8000/analyze_report', formData, {
            headers: formData.getHeaders()
        });

        res.json({
            status: "success",
            result: response.data
        });
    } catch (err) {
        console.error('OCR Error:', err.message);
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

router.post('/translate', async (req, res) => {
    const { data, lang } = req.body;

    try {
        const response = await axios.post('http://127.0.0.1:8000/translate_result', {
            data,
            lang
        });

        res.json({
            status: "success",
            result: response.data
        });
    } catch (err) {
        console.error('Translation Error:', err.message);
        res.status(500).json({ success: false, message: 'Translation failed.' });
    }
});

router.post('/chat', async (req, res) => {
    const { report_data, query, history, lang } = req.body;

    try {
        const response = await axios.post('http://127.0.0.1:8000/chat', {
            report_data,
            query,
            history,
            lang
        });

        res.json({
            status: "success",
            response: response.data.response
        });
    } catch (err) {
        console.error('Chat Error:', err.message);
        res.status(500).json({ success: false, message: 'Chat interaction failed.' });
    }
});

module.exports = router;
