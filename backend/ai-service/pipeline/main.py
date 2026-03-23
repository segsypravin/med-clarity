from .ai_analysis import analyze_report
import os
import json
from .preprocess import preprocess_image
from .ocr import extract_text
from .layout import sort_and_cluster
from .extractor import extract_structured_data
from .validator import validate_structured_data


def process_report(image_path_or_pdf, lang="en"):
    """
    Full upgraded pipeline:
      1. Preprocess   → enhanced image (denoise, scale, threshold)
      2. OCR          → confidence-filtered text boxes
      3. Layout       → sort boxes into text lines
      4. Extract      → structured {test, value, unit, normal_range} list
      5. Validate     → remove junk, deduplicate, normalize units
      6. AI Analysis  → status + reason + suggestion per test
    """

    print("STEP 1: Preprocessing image...")
    processed_img = preprocess_image(image_path_or_pdf)

    print("STEP 2: Running OCR (confidence ≥ 0.4)...")
    ocr_results = extract_text(processed_img, confidence_threshold=0.4)

    print("STEP 3: Clustering into text lines...")
    text_lines = sort_and_cluster(ocr_results)

    print(f"STEP 4: Structured extraction from {len(text_lines)} lines...")
    structured_tests = extract_structured_data(text_lines)

    print(f"STEP 5: Validating {len(structured_tests)} extracted tests...")
    validated_tests = validate_structured_data(structured_tests)

    if not validated_tests:
        # Fallback: send raw OCR text if extraction finds nothing
        print("STEP 5 (fallback): No structured tests found, sending raw text to AI...")
        raw_text = "\n".join(text_lines)
        ai_output = analyze_report(raw_text, lang=lang)
    else:
        print(f"STEP 6: AI reasoning on {len(validated_tests)} validated tests...")
        ai_output = analyze_report(validated_tests, lang=lang)

    print("PIPELINE COMPLETE!")
    return ai_output