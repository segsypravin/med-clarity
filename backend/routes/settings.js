const express = require('express');
const router = express.Router();

// Default settings — Phase 2: persist per user in DB
const defaults = {
    language: 'en',
    audioOutput: true,
    autoPlayAudio: false,
    speechSpeed: 'normal',
    largeText: false,
    highContrast: false,
    simplifiedUI: true,
    notifications: { analysisComplete: true, reminders: false, appointments: true },
    secureStorage: true,
    analytics: false,
};

let currentSettings = { ...defaults };

/**
 * GET /api/settings
 */
router.get('/', (_req, res) => {
    res.json({ success: true, settings: currentSettings });
});

/**
 * PUT /api/settings
 * Body: partial settings object
 */
router.put('/', (req, res) => {
    currentSettings = { ...currentSettings, ...req.body };
    res.json({ success: true, message: 'Settings updated.', settings: currentSettings });
});

/**
 * POST /api/settings/reset
 */
router.post('/reset', (_req, res) => {
    currentSettings = { ...defaults };
    res.json({ success: true, message: 'Settings reset to defaults.', settings: currentSettings });
});

module.exports = router;
