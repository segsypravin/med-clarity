from .ai_analysis import analyze_report
import os
import json
import time
from .preprocess import preprocess_image
from .ocr import extract_text
from .layout import sort_and_cluster
from .extractor import extract_structured_data
from .validator import validate_structured_data

from dotenv import load_dotenv
load_dotenv()

# GCP Integration
from .gcp_ocr import extract_text_from_image
from .gcp_gemini import analyze_health_report_gemini


def process_report(image_path_or_pdf, lang="en"):
    """
    Upgraded pipeline with optional GCP support:
      1. OCR: GCP Vision (if key exists) OR Local Tesseract
      2. AI: GCP Gemini (if key exists) OR Local Ollama
    """
    t0 = time.time()

    # --- PHASE 1: OCR ---
    use_gcp_ocr = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS") is not None or os.environ.get("VISION_API_KEY") is not None
    if use_gcp_ocr:
        print("STEP 1: Running HIGH-POWERED GCP Vision OCR...")
        t1 = time.time()
        raw_text = extract_text_from_image(image_path_or_pdf)
        print(f"[TIMING] Vision OCR took {time.time()-t1:.1f}s")
        if not raw_text:
            print("GCP OCR failed, falling back to local pipeline...")
            use_gcp_ocr = False

    if not use_gcp_ocr:
        print("STEP 1: Preprocessing image...")
        processed_img = preprocess_image(image_path_or_pdf)
        print("STEP 2: Running local OCR...")
        t1 = time.time()
        ocr_results = extract_text(processed_img, confidence_threshold=0.4)
        print(f"[TIMING] Local OCR took {time.time()-t1:.1f}s")
        print("STEP 3: Clustering into text lines...")
        text_lines = sort_and_cluster(ocr_results)
        raw_text = "\n".join(text_lines)

    # --- PHASE 2: AI ANALYSIS ---
    use_gemini = os.environ.get("GEMINI_API_KEY") is not None
    if use_gemini:
        print("STEP 4: Running HIGH-POWERED Gemini analysis...")
        t1 = time.time()
        ai_output = analyze_health_report_gemini(raw_text)
        print(f"[TIMING] Gemini took {time.time()-t1:.1f}s")
        if ai_output:
            print(f"[TIMING] TOTAL (GCP path): {time.time()-t0:.1f}s")
            print("GCP ANALYSIS COMPLETE!")
            return ai_output
        print("Gemini analysis failed, falling back to local Ollama...")

    # --- FALLBACK: LOCAL PIPELINE ---
    print("STEP 4: Running Local OCR Extraction & Ollama Analysis...")
    # (If we didn't use GCP OCR, we already have text_lines)
    if 'text_lines' not in locals():
        text_lines = raw_text.split("\n")
    
    structured_tests = extract_structured_data(text_lines)
    validated_tests = validate_structured_data(structured_tests)

    if not validated_tests:
        print("No structured tests found, sending raw text to Ollama...")
        ai_output = analyze_report(raw_text, lang=lang)
    else:
        print(f"AI reasoning on {len(validated_tests)} validated tests via Ollama...")
        ai_output = analyze_report(validated_tests, lang=lang)

    print(f"[TIMING] TOTAL (Local path): {time.time()-t0:.1f}s")
    print("PIPELINE COMPLETE (Local Fallback)!")
    return ai_output