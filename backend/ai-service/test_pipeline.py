import sys
import os

# Ensure we can import from the current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pipeline.main import process_report

# Handle medical characters (µ) on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Run test on a sample report
# If temp_report.png doesn't exist, we'll try to use a dummy name
REPORT_PATH = "temp_report.png"
if not os.path.exists(REPORT_PATH):
    print(f"WARNING: {REPORT_PATH} not found. Test might fail.")

try:
    print("Testing with Hindi (hi)...")
    result = process_report(REPORT_PATH, lang="hi")
    print("\n=== FINAL OUTPUT (HINDI) ===")
    
    summary = result.get("summary_translated") or result.get("summary")
    print(f"Summary: {summary}")
    
    for t in result.get("tests", []):
        name = t.get("test_translated") or t.get("test")
        remark = t.get("remark_translated") or t.get("remark")
        print(f"- {name}: {t.get('value')} {t.get('unit')} ({t.get('status')}) -> {remark}")

except Exception as e:
    print(f"\nFATAL ERROR: {e}")
    sys.exit(1)