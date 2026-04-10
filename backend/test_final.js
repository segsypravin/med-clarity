require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

async function testFinalGemini3() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log("FINAL VERIFICATION: Gemini 3.1 Flash with Unified SDK");
    console.log("Using Key:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");

    if (!apiKey || !apiKey.startsWith("AIzaSy")) {
        console.error("ERROR: API key should start with AIzaSy for AI Studio.");
        process.exit(1);
    }

    try {
        const client = new GoogleGenAI({ apiKey });
        const modelName = "gemini-3.1-flash-live-preview";


        console.log(`Sending prompt to ${modelName}...`);
        const response = await client.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: "Hello! Are you working with the Gemini 3.1 SDK?" }] }],
        });

        const text = response.response.text();
        console.log("\n✨ [SUCCESS] Final Verification Complete!");
        console.log("Response:", text);
    } catch (error) {
        console.error("\n❌ [ERROR] Final Verification failed.");
        console.error("Reason:", error.message);
    }
}

testFinalGemini3();
