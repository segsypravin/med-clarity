import os
from dotenv import load_dotenv
load_dotenv()
from pipeline.gcp_gemini import analyze_health_report_gemini

print(f"Testing Gemini with key: {str(os.environ.get('GEMINI_API_KEY'))[:10]}...")
print("Testing Gemini directly...")
# The code in gcp_gemini now tries multiple keys and uses gemini-1.5-flash
result = analyze_health_report_gemini("Patient has high blood pressure, BP is 150/90. Suggest lifestyle changes.")
print("Result:", result)
