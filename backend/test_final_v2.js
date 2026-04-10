require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testFinalScan() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log("FINAL SYSTEM VERIFICATION: Gemini 1.5 Flash");
    console.log("Using Key:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Sending multimodal test prompt...");
        // Basic hello to confirm the model ID is accepted
        const result = await model.generateContent("Hello from the Smart Health Simplifier! Please confirm you are ready.");
        const text = result.response.text();
        
        console.log("\n✨ [SUCCESS] Healthcare AI System is ONLINE!");
        console.log("Response:", text);
    } catch (error) {
        console.error("\n❌ [ERROR] Final System Verification failed.");
        console.error("Reason:", error.message);
    }
}

testFinalScan();
