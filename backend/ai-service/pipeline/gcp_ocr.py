import base64
import requests
import os

def extract_text_from_image(image_path):
    """
    Extract text using Google Vision API with API KEY (no JSON needed)
    """
    try:
        API_KEY = os.environ.get("VISION_API_KEY")
        
        if not API_KEY:
            raise ValueError("VISION_API_KEY is not set in your .env file!")

        with open(image_path, "rb") as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode()

        url = f"https://vision.googleapis.com/v1/images:annotate?key={API_KEY}"

        payload = {
            "requests": [
                {
                    "image": {"content": encoded_image},
                    "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]
                }
            ]
        }

        response = requests.post(url, json=payload)
        result = response.json()

        if "error" in result:
            raise Exception(result["error"]["message"])

        return result["responses"][0]["fullTextAnnotation"]["text"]

    except Exception as e:
        print(f"[Vision API ERROR]: {e}")
        return None