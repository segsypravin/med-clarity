import easyocr
import numpy as np

READER = None

def get_reader():
    global READER
    if READER is None:
        # Try GPU first, fall back to CPU automatically
        try:
            READER = easyocr.Reader(['en'], gpu=True)
            print("[OCR] Using GPU acceleration.")
        except Exception:
            READER = easyocr.Reader(['en'], gpu=False)
            print("[OCR] GPU unavailable, using CPU.")
    return READER


def extract_text(image_path_or_array, confidence_threshold=0.4):
    """
    Extracts text from an image using EasyOCR.
    Filters out results with confidence below threshold (noise/artifacts).
    Returns: list of tuples: (bbox, text, confidence)
    """
    reader = get_reader()

    results = reader.readtext(
        image_path_or_array,
        width_ths=0.7,       # merge boxes on same line
        paragraph=False      # keep individual word boxes for layout clustering
    )

    # Filter low-confidence results — removes scan artifacts and noise
    filtered = [
        (bbox, text.strip(), conf)
        for bbox, text, conf in results
        if conf >= confidence_threshold and text.strip()
    ]

    print(f"[OCR] {len(results)} raw results → {len(filtered)} kept (conf ≥ {confidence_threshold})")
    return filtered
