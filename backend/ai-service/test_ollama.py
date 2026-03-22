import sys
from pipeline.ai_analysis import analyze_report

text = """
Patient Health Report
Test Name Result Unit Ref Range
Hemoglobin 10.5 g/dL (13.5 - 17.0)
Sugar 150 mg/dL (70-100)
Cholesterol 190 mg/dL (under 200)
WBC Count 15.0 x10^6/uL 4.5-11.0
"""

out = analyze_report(text)
print("OUTPUT:")
print(out)
