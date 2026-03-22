from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
import sys

# Ensure terminal/redirected output handles UTF-8 (for medical symbols like µ)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from predict_xray import predict_image
from pipeline.main import process_report

app = FastAPI()

# ✅ Allow frontend requests (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # you can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📁 Temp folder
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# 🏥 X-RAY ANALYSIS API
@app.post("/scan")
async def analyze_scan(file: UploadFile = File(...)):
    try:
        # Unique filename
        file_ext = os.path.splitext(file.filename)[1] or ".jpg"
        file_path = os.path.join(UPLOAD_DIR, f"xray_{uuid.uuid4()}{file_ext}")

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run model
        result, confidence = predict_image(file_path)

        return {
            "success": True,
            "prediction": result,
            "confidence": float(confidence)
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# 📄 MEDICAL REPORT ANALYSIS API
@app.post("/analyze_report")
async def analyze_report_api(file: UploadFile = File(...), lang: str = Form("en")):
    try:
        # Detect file type (image / pdf)
        file_ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
        file_path = os.path.join(UPLOAD_DIR, f"report_{uuid.uuid4()}{file_ext}")

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run AI pipeline
        result_json = process_report(file_path, lang=lang)

        return result_json

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/translate_result")
async def translate_result_api(payload: dict):
    try:
        from pipeline.ai_analysis import translate_result
        data = payload.get("data")
        lang = payload.get("lang", "en")
        translated = translate_result(data, lang)
        return translated
    except Exception as e:
        return {"error": str(e)}