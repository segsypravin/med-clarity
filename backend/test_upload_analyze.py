import requests
import os

# Create a small dummy image for testing
from PIL import Image, ImageDraw, ImageFont
img = Image.new('RGB', (400, 200), color=(255, 255, 255))
d = ImageDraw.Draw(img)
d.text((10,10), "Patient Health Report\nHemoglobin 10.5 g/dL\nSugar 150 mg/dL", fill=(0,0,0))
dummy_path = "dummy_test_report.jpg"
img.save(dummy_path)

print("Uploading to Node server...")
with open(dummy_path, "rb") as f:
    files = {"report": ("dummy_test_report.jpg", f, "image/jpeg")}
    upload_res = requests.post("http://localhost:5000/api/upload", files=files)

print("Upload response:", upload_res.status_code, upload_res.text)

if upload_res.status_code in [200, 201]:
    data = upload_res.json()
    file_info = data.get("file", {})
    payload = {
        "reportId": file_info.get("id"),
        "filename": file_info.get("filename")
    }
    
    print("\nTriggering analyze endpoint with:", payload)
    analyze_res = requests.post("http://localhost:5000/api/analyze", json=payload)
    print("Analyze response status:", analyze_res.status_code)
    try:
        print("Analyze response JSON:", analyze_res.json())
    except:
        print("Analyze response TEXT:", analyze_res.text)
