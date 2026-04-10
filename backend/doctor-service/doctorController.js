/**
 * Controller for Doctor Service
 * - Nearby Doctors (Geoapify)
 * - Medical Report AI Analysis (Python AI server)
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// ==============================
// 🏥 1. GET NEARBY DOCTORS
// ==============================

exports.getNearbyDoctors = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: "Missing required query parameters: lat and lng.",
            });
        }

        const apiKey = process.env.GEOAPIFY_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "Geoapify API key not configured.",
            });
        }

        const params = new URLSearchParams({
            categories: "healthcare",
            filter: `circle:${lng},${lat},5000`,
            bias: `proximity:${lng},${lat}`,
            limit: "20",
            apiKey,
        });

        const url = `https://api.geoapify.com/v2/places?${params}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(502).json({
                success: false,
                message: "Geoapify API error",
                detail: data,
            });
        }

        const doctors = (data.features || []).map((feature) => {
            const props = feature.properties;

            return {
                place_id: props.place_id,
                name: props.name || "Doctor",
                address: props.formatted,
                location: {
                    lat: props.lat,
                    lng: props.lon,
                },
                categories: props.categories,
                rating: null,
                open_now: true,
            };
        });

        return res.json({
            success: true,
            count: doctors.length,
            results: doctors,
        });

    } catch (err) {
        console.error("Doctor fetch error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// ==============================
// 🤖 2. ANALYZE MEDICAL REPORT
// ==============================

exports.analyzeReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const filePath = req.file.path;

        // Prepare form-data
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));

        // Send to Python AI server
        const SCAN_URL = process.env.SCAN_SERVICE_URL || 'http://127.0.0.1:8000';
        const response = await axios.post(
            `${SCAN_URL}/analyze_report`,
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 60000,
            }
        );

        // Delete file after processing
        fs.unlinkSync(filePath);

        return res.json({
            success: true,
            data: response.data,
        });

    } catch (error) {
        console.error("AI analysis error:", error.message);

        return res.status(500).json({
            success: false,
            message: "AI analysis failed",
            error: error.message,
        });
    }
};