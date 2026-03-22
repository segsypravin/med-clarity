from .ai_analysis import analyze_report
import os
import json
from .preprocess import preprocess_image
from .ocr import extract_text
from .layout import sort_and_cluster
from .extractor import extract_data_from_lines

def process_report(image_path_or_pdf, lang="en"):

    print("STEP 1: Preprocessing...")
    processed_img = preprocess_image(image_path_or_pdf)
    
    print("STEP 2: OCR...")
    ocr_results = extract_text(processed_img)
    
    print("STEP 3: Layout...")
    text_lines = sort_and_cluster(ocr_results)
    
    print("STEP 4: Sending to AI...")
    text_for_ai = "\n".join(text_lines)

    ai_output = analyze_report(text_for_ai, lang=lang)

    print("STEP 5: Done!")

    return ai_output