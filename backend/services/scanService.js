const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function analyzeScan(filePath) {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
        "http://127.0.0.1:8000/scan",
        form,
        { headers: form.getHeaders() }
    );

    return response.data;
}

module.exports = analyzeScan;