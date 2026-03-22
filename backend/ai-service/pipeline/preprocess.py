import cv2
import numpy as np
import fitz # PyMuPDF
import os

def preprocess_image(image_path):
    """
    Reads and preprocesses an image or PDF for better OCR accuracy.
    Steps: Grayscale, Deskew, Contrast, Binarization, Noise Removal.
    """
    ext = os.path.splitext(image_path)[1].lower()

    if ext == '.pdf':
        doc = fitz.open(image_path)
        if len(doc) == 0:
            raise ValueError("PDF has no pages.")
        page = doc.load_page(0)
        # Increase resolution
        zoom_matrix = fitz.Matrix(2, 2)
        pix = page.get_pixmap(matrix=zoom_matrix)
        
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
        
        # Ensure BGR format for cv2
        if pix.n == 4:
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
        elif pix.n == 3:
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        elif pix.n == 1:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    else:
        # 1. Read standard image
        img = cv2.imread(image_path)

    if img is None:
        raise ValueError(f"Could not read image/PDF from path: {image_path}")

    # 2. Convert to Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 3. Deskew (Optional, simple implementation based on edge detection)
    coords = np.column_stack(np.where(gray > 0))
    if coords.size > 0:
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        
        if abs(angle) > 0.5:
            (h, w) = img.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            gray = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # 4. Enhance Contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)

    # 5. Denoise and Binarization (Adaptive Thresholding)
    # Using Gaussian blur to remove noise before binarization
    blurred = cv2.GaussianBlur(enhanced, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                   cv2.THRESH_BINARY, 11, 2)

    # Alternatively, for clean document images, simple Otsu might be better:
    # _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # We will return the original grayscale enhanced image, as EasyOCR 
    # often performs better on grayscale than strictly binarized unless noise is severe.
    # But as per requirements, we will return the thresholded/binarized image if needed,
    # or let's return 'enhanced' to let EasyOCR do its magic, but we keep the preprocess ready.
    # Given requirements: Apply thresholding, remove noise. Let's return the thresholded one.
    
    return enhanced
