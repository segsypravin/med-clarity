import cv2
import numpy as np
import fitz  # PyMuPDF
import os


def preprocess_image(image_path):
    """
    Reads and preprocesses an image or PDF for best OCR accuracy.
    Pipeline: Load → Scale → Grayscale → Denoise → CLAHE → Deskew → Threshold
    """
    ext = os.path.splitext(image_path)[1].lower()

    # ── 1. Load ─────────────────────────────────────────────────────────────
    if ext == '.pdf':
        doc = fitz.open(image_path)
        if len(doc) == 0:
            raise ValueError("PDF has no pages.")
        page = doc.load_page(0)
        zoom_matrix = fitz.Matrix(3, 3)          # 3× zoom = ~216 DPI
        pix = page.get_pixmap(matrix=zoom_matrix)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
        if pix.n == 4:
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
        elif pix.n == 3:
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        elif pix.n == 1:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    else:
        img = cv2.imread(image_path)

    if img is None:
        raise ValueError(f"Could not read image/PDF: {image_path}")

    # ── 2. Scale up small images (EasyOCR accuracy drops below ~1000px) ────
    h, w = img.shape[:2]
    if w < 1200:
        scale = 1200 / w
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

    # ── 3. Grayscale ────────────────────────────────────────────────────────
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # ── 4. Non-local Means Denoising (better than Gaussian for text) ────────
    denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)

    # ── 5. CLAHE (Contrast Limited Adaptive Histogram Equalization) ─────────
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    # ── 6. Deskew using white-pixel column centroids ─────────────────────────
    # Only skew-correct if text pixels are present and angle is significant
    try:
        coords = np.column_stack(np.where(enhanced > 127))  # light pixels = background
        if coords.size > 100:
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            if abs(angle) > 0.3:
                (rh, rw) = enhanced.shape[:2]
                center = (rw // 2, rh // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                enhanced = cv2.warpAffine(
                    enhanced, M, (rw, rh),
                    flags=cv2.INTER_CUBIC,
                    borderMode=cv2.BORDER_REPLICATE
                )
    except Exception:
        pass  # Skip deskew if it fails

    # ── 7. Binarization: Otsu for clean documents, Adaptive for complex ones ─
    # Try Otsu first (better for printed lab reports)
    _, otsu = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # If Otsu produces too many black pixels (over-thresholded), fall back to adaptive
    black_ratio = np.sum(otsu == 0) / otsu.size
    if black_ratio > 0.6:
        blurred = cv2.GaussianBlur(enhanced, (3, 3), 0)
        final = cv2.adaptiveThreshold(
            blurred, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 15, 4
        )
    else:
        final = otsu

    # Return the enhanced grayscale — EasyOCR handles binarized or grayscale best
    return enhanced
