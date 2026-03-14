from fastapi import FastAPI, UploadFile
import shutil
from predict_xray import predict_image

app = FastAPI()

@app.post("/scan")
async def analyze_scan(file: UploadFile):

    file_path = "temp.jpg"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result, confidence = predict_image(file_path)

    return {
        "prediction": result,
        "confidence": confidence
    }