require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

async function testFinalVertexAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    const project = process.env.GCP_PROJECT_ID;
    
    console.log("FINAL VERIFICATION: Vertex AI Express Mode with API Key");
    console.log("Using Key:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");
    console.log("Using Project ID:", project);

    if (!project || project.includes("6cb83")) {
        console.error("ERROR: Project ID is missing or using the old 6cb83 ID. Please ensure .env is updated to med-clarity-a269c");
        process.exit(1);
    }

    const client = new GoogleGenAI({
        apiKey: apiKey,
        vertexai: true,
        project: project,
    });

    // We'll try the models that frequently appear in Vertex AI Studio Express Mode
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-002",
        "gemini-3.1-flash-lite",
        "gemini-3.1-flash-live-preview",
    ];

    for (const m of modelsToTry) {
        try {
            console.log(`[Test] Trying model: ${m}...`);
            const response = await client.models.generateContent({
                model: m,
                contents: [{ role: "user", parts: [{ text: "Hello! If you can read this, Vertex AI Express Mode is working perfectly. Please reply with 'SYSTEM READY'." }] }],
            });

            const text = response.response.text();
            if (text.includes("SYSTEM READY")) {
                console.log(`\n🎉 [SUCCESS] Vertex AI is fully functional on model: ${m}`);
                console.log("Response:", text);
                return;
            } else {
                console.log(`[Partial Success] Received response from ${m}, but it was unexpected:`, text);
            }
        } catch (error) {
            console.warn(`[FAIL] Model ${m}: ${error.message}`);
        }
    }

    console.error("\n❌ All models failed. Possible reasons:\n1. Vertex AI API is not enabled in project 'med-clarity-a269c'.\n2. The API key is not from this project.\n3. The region defaults to us-central1 - if your project is elsewhere, we may need to specify the location.");
    process.exit(1);
}

testFinalVertexAI();
