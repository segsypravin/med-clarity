import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("VISION_API_KEY")
print(f"Key starts with: {api_key[:15]}..." if api_key else "NO KEY FOUND")

# Use a simple 1x1 white pixel PNG for quick test
test_pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg=="

url = f"https://vision.googleapis.com/v1/images:annotate?key={api_key}"
payload = {
    "requests": [{
        "image": {"content": test_pixel},
        "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]
    }]
}

resp = requests.post(url, json=payload)
print(f"HTTP Status: {resp.status_code}")
print(f"Response: {resp.text[:500]}")
