import os
from dotenv import load_dotenv
load_dotenv()
from pipeline.gcp_ocr import extract_text_from_image

print("Testing Vision OCR directly...")
try:
    text = extract_text_from_image("temp_report.png")
    print(f"Extracted: {text[:100] if text else None}")
except Exception as e:
    print("FATAL OCR ERROR:", e)
