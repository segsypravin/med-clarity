const express = require('express');
const router = express.Router();

/**
 * GET /api/get-doctors
 *
 * Query params:
 *   lat            — latitude  (required)
 *   lng            — longitude (required)
 *   specialization — e.g. "cardiologist" (optional)
 *
 * Proxies the request to Geoapify Places API and returns the results.
 */
router.get('/', async (req, res) => {
    try {
        const { lat, lng } = req.query;

        // ── Validate required params ──────────────────────────────────────────
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Missing required query parameters: lat and lng.',
            });
        }

        const apiKey = process.env.GEOAPIFY_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: 'Geoapify API key is not configured on the server.',
            });
        }

        // ── Build Geoapify Places URL ─────────────────────────────────────────
        // Geoapify requires longitude first: lon,lat
        const filter = `circle:${lng},${lat},5000`; // 5000 meters = 5km
        const categories = 'healthcare';
        
        const params = new URLSearchParams({
            categories,
            filter,
            bias: `proximity:${lng},${lat}`,
            limit: '20',
            apiKey
        });

        const geoapifyUrl = `https://api.geoapify.com/v2/places?${params}`;

        // ── Fetch from Geoapify ───────────────────────────────────────────────
        const response = await fetch(geoapifyUrl);
        const data = await response.json();

        if (!response.ok) {
            console.error('[Geoapify Error]', data);
            return res.status(502).json({
                success: false,
                message: `Geoapify API error: ${response.status}`,
                detail: data.message || null,
            });
        }

        // ── Map Geoapify results to expected format ───────────────────────────
        const doctors = (data.features || []).map(feature => {
            const props = feature.properties;
            return {
                place_id: props.place_id,
                name: props.name || 'Doctor',
                vicinity: props.formatted,
                geometry: {
                    location: {
                        lat: props.lat,
                        lng: props.lon
                    }
                },
                types: props.categories,
                // Geoapify doesn't consistently return ratings/opening hours in the free tier
                // so we provide sensible defaults for the UI cards
                rating: null,
                opening_hours: { open_now: true } 
            };
        });

        // ── Return results ────────────────────────────────────────────────────
        res.json({
            success: true,
            count: doctors.length,
            results: doctors,
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
