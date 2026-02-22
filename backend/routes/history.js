const express = require('express');
const router = express.Router();

// In-memory store for Phase 1 — replace with DB in Phase 2
const records = [];

/**
 * GET /api/history
 * Returns all uploaded report records
 */
router.get('/', (_req, res) => {
    res.json({ success: true, count: records.length, records });
});

/**
 * POST /api/history
 * Add a record (called internally after upload)
 */
router.post('/', (req, res) => {
    const record = { id: `rec-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    records.push(record);
    res.status(201).json({ success: true, record });
});

/**
 * DELETE /api/history/:id
 * Delete a record by id
 */
router.delete('/:id', (req, res) => {
    const idx = records.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Record not found.' });
    records.splice(idx, 1);
    res.json({ success: true, message: 'Record deleted.' });
});

module.exports = router;
