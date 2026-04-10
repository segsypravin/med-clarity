import os
import sys
import json
from dotenv import load_dotenv

# Add backend/ai-service to path
sys.path.append(os.path.join(os.getcwd(), 'backend', 'ai-service'))

from pipeline.gcp_gemini import analyze_health_report_gemini

load_dotenv(os.path.join('backend', 'ai-service', '.env'))

def test_detection():
    blood_text = """
    LABORATORY REPORT
    PATIENT: John Doe
    TEST: Hemoglobin
    RESULT: 14.5 g/dL (Normal: 13.5 - 17.5)
    TEST: WBC Count
    RESULT: 6.5 x10^9/L (Normal: 4.5 - 11.0)
    """
    
    urine_text = """
    URINE ANALYSIS REPORT
    PATIENT: John Doe
    COLOR: Pale Yellow
    SPECIFIC GRAVITY: 1.015 (Normal: 1.005 - 1.030)
    PH: 6.0 (Normal: 4.5 - 8.0)
    GLUCOSE: Negative
    """

    print("--- TESTING BLOOD REPORT DETECTION ---")
    res1 = analyze_health_report_gemini(blood_text)
    if res1:
        print(f"Detected Type: {res1.get('report_type')}")
        print(f"Health Score: {res1.get('health_score')}")
    else:
        print("Blood analysis failed.")

    print("\n--- TESTING URINE REPORT DETECTION ---")
    res2 = analyze_health_report_gemini(urine_text)
    if res2:
        print(f"Detected Type: {res2.get('report_type')}")
        print(f"Health Score: {res2.get('health_score')}")
    else:
        print("Urine analysis failed.")

if __name__ == "__main__":
    test_detection()
