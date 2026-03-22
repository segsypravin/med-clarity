from pipeline.ai_analysis import analyze_report
import json
import sys

# Ensure terminal handles UTF-8 (for Hindi/Marathi and medical symbols like µ)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Data from the provided image
ocr_text = """
CLINICAL PATHOLOGY LABORATORY
FULL BLOOD COUNT REPORT

Patient Name: Jane D. Smith DOB: 12 May 1982 Gender: Female
Patient ID: P12345678 Report Date: 28 Oct 2023 11:15
Collection Date: 28 Oct 2023 09:30 Specimen: Whole Blood (EDTA)

Parameter Result Unit Reference Range
Haemoglobin 14.5 g/dL 13.0 - 17.0
WBC Count 6.2 10^3/uL 4.0 - 11.0
Red Blood Cell Count 4.8 10^6/uL 4.0 - 5.5
Haematocrit (Hct) 43.1 % 37.0 - 47.0
MCV 89.8 fL 80.0 - 100.0
MCH 30.2 pg 27.0 - 32.0
Platelet Count 245 10^3/uL 150 - 400
Neutrophils 3.8 10^3/uL 2.0 - 7.5
Lymphocytes 1.9 10^3/uL 1.0 - 4.0
Monocytes 0.4 10^3/uL 0.2 - 1.0
Eosinophils 0.1 10^3/uL 0.0 - 0.5
Basophils 0.03 10^3/uL 0.0 - 0.2
"""

print("Testing Analysis in English...")
result_en = analyze_report(ocr_text, lang="en")
print(json.dumps(result_en, indent=2))

print("\nTesting Analysis in Hindi...")
result_hi = analyze_report(ocr_text, lang="hi")
print(result_hi.get("summary_translated"))
print(result_hi.get("full_report_summary"))
