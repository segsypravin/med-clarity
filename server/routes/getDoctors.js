const express = require('express');
const router = express.Router();

/**
 * GET /api/get-doctors
 *
 * Query params:
 *   lat            — latitude  (required)
 *   lng            — longitude (required)
 *   specialization — e.g. "cardiologist" (optional, refines keyword)
 *
 * Proxies the request to Google Places Nearby Search and returns the results.
 */
router.get('/', async (req, res) => {
    try {
        const { lat, lng, specialization } = req.query;

        // ── Validate required params ──────────────────────────────────────────
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Missing required query parameters: lat and lng.',
            });
        }

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            return res.status(500).json({
                success: false,
                message: 'Google Maps API key is not configured on the server.',
            });
        }

        // ── Build Google Places Nearby Search URL ─────────────────────────────
        const params = new URLSearchParams({
            location: `${lat},${lng}`,
            radius: '5000',          // 5 km radius
            type: 'doctor',
            key: apiKey,
        });

        if (specialization && specialization.toLowerCase() !== 'all') {
            params.set('keyword', specialization);
        }

        const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;

        // ── Fetch from Google ─────────────────────────────────────────────────
        const response = await fetch(googleUrl);
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('[Google Places Error]', data.status, data.error_message);
            return res.status(502).json({
                success: false,
                message: `Google Places API error: ${data.status}`,
                detail: data.error_message || null,
            });
        }

        // ── Return results ────────────────────────────────────────────────────
        res.json({
            success: true,
            count: (data.results || []).length,
            results: data.results || [],
        });
    } catch (err) {
        console.error('[get-doctors]', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching doctors.',
        });
    }
});

module.exports = router;
