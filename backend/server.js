const express = require("express");
const cors = require("cors");
const multer = require("multer");
const analyzeScan = require("./services/scanService");

const app = express();
app.use(cors());

// configure upload folder
const upload = multer({ dest: "uploads/" });

// route to upload scan
app.post("/scan", upload.single("scan"), async (req, res) => {
    console.log(`Received scan upload request: ${req.file ? req.file.originalname : 'no file'}`);
    try {
        const filePath = req.file.path;

        // send image to AI service
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

// start server
app.listen(3001, () => {
    console.log("Node backend running on http://localhost:3001");
});