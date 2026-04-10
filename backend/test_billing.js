require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testBillingKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log("VERIFYING BILLING KEY: Connecting to Gemini 1.5 Flash");
    console.log("Using Key:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");

    if (!apiKey || !apiKey.startsWith("AIzaSy")) {
        console.error("ERROR: API key is not a standard Google Cloud key (AIzaSy). Please check your .env file.");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Sending prompt to Gemini...");
        const result = await model.generateContent("Hello! Are you working with this project's billing enabled key?");
        const text = result.response.text();
        
        console.log("\n✅ [SUCCESS] Billing Key is fully functional!");
        console.log("Response:", text);
    } catch (error) {
        console.error("\n❌ [ERROR] Verification failed.");
        console.error("Reason:", error.message);
        if (error.stack) {
            console.error("Stack Trace:", error.stack);
        }
    }
}

testBillingKey();
