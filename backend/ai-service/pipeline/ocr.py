import easyocr
import numpy as np

# Initialize the reader once to save time across multiple calls
READER = None

def get_reader():
    global READER
    if READER is None:
        # Use English language, disable GPU if not available
        READER = easyocr.Reader(['en'], gpu=False)
    return READER

def extract_text(image_path_or_array):
    """
    Extracts text and bounding boxes from an image using EasyOCR.
    Returns: list of tuples: (bbox, text, confidence)
    """
    reader = get_reader()
    
    # Read text 
    # reader.readtext accepts both file path and numpy array
    results = reader.readtext(image_path_or_array, width_ths=0.7)
    
    # Format: [([[x1,y1], [x2,y2], [x3,y3], [x4,y4]], text, confidence), ...]
    return results
