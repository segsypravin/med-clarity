const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function analyzeScan(filePath) {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const SCAN_URL = process.env.SCAN_SERVICE_URL || 'http://127.0.0.1:8000';
    const response = await axios.post(
        `${SCAN_URL}/scan`,
        form,
        { headers: form.getHeaders() }
    );

    return response.data;
}

module.exports = analyzeScan;