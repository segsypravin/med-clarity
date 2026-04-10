import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("NO API KEY")
    exit()

try:
    genai.configure(api_key=api_key)
    print("AVAILABLE MODELS:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"ERROR: {e}")
