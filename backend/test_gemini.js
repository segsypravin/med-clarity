require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");
    
    if (!apiKey) {
        console.error("No API key found in .env");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log("Sending simple prompt to Gemini...");
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();
        console.log("Response from Gemini:", text);
    } catch (error) {
        console.error("Gemini Error:", error.message);
        if (error.response) {
            console.error("Error Details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
