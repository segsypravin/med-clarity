const express = require('express');
const router = express.Router();

/**
 * POST /api/analyze
 * Body: { reportId, text? }
 *
 * Phase 2: Will call OCR service → AI service (Gemini) → return structured result.
 * Phase 1: Returns a mock analysis result for UI development & testing.
 */
router.post('/', (req, res) => {
    const { reportId } = req.body;

    if (!reportId) {
        return res.status(400).json({ success: false, message: 'reportId is required.' });
    }

    // ── STUB RESPONSE ──────────────────────────────────────────────────────────
    // Replace this block with real OCR + AI pipeline in Phase 2
    const mockResult = {
        reportId,
        analyzedAt: new Date().toISOString(),
        healthScore: 82,
        overallStatus: 'normal', // normal | moderate | high
        summary: {
            en: 'Your blood test results are mostly within the normal range. Cholesterol is slightly borderline and may need a lifestyle adjustment.',
            hi: 'आपके रक्त परीक्षण के परिणाम अधिकतर सामान्य सीमा में हैं। कोलेस्ट्रोल थोड़ा सीमा रेखा पर है।',
        },
        keyFindings: [
            { parameter: 'Hemoglobin', value: '14.2 g/dL', status: 'normal', note: 'Normal range: 13–17 g/dL' },
            { parameter: 'WBC Count', value: '7200 /µL', status: 'normal', note: 'Normal range: 4500–11000' },
            { parameter: 'Cholesterol', value: '195 mg/dL', status: 'warning', note: 'Borderline high. Ideal <200 mg/dL' },
        ],
        suggestions: [
            'Reduce fried and processed foods.',
            'Exercise for 30 minutes, 5 days a week.',
            'Follow up on cholesterol in 3 months.',
        ],
        recommendedSpecialist: null, // e.g. 'Cardiologist' when high risk
    };
    // ── END STUB ───────────────────────────────────────────────────────────────

    res.json({ success: true, result: mockResult });
});

/**
 * GET /api/analyze/:reportId
 * Retrieve a cached analysis result (Phase 2: from DB)
 */
router.get('/:reportId', (req, res) => {
    // Phase 2: fetch from database by reportId
    res.json({
        success: true,
        message: 'Analysis retrieval by ID coming in Phase 2.',
        reportId: req.params.reportId,
    });
});

module.exports = router;
