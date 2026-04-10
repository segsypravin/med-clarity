import os
import json
from pipeline.gcp_gemini import chat_with_health_assistant
from dotenv import load_dotenv

load_dotenv()

# Mock report data
report_data = {
    "summary": "Patient has slightly high cholesterol but good iron levels.",
    "tests": [
        {"name": "LDL", "value": "135", "unit": "mg/dL", "status": "High"},
        {"name": "Iron", "value": "90", "unit": "µg/dL", "status": "Normal"}
    ]
}

print("--- Testing Chat Assistant ---")
print(f"API KEY: {os.environ.get('GEMINI_API_KEY', 'MISSING')[:10]}...")

try:
    response = chat_with_health_assistant(report_data, "What should I do about my LDL?")
    print(f"AI Response: {response}")
except Exception as main_e:
    print(f"FAILED: {main_e}")
