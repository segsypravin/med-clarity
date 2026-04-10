import os
import json
import re
from google import genai


def analyze_health_report_gemini(extracted_text, context_history=None):
    """
    Analyzes medical report text using Gemini 1.5 Flash.
    Tries GEMINI_API_KEY first, then falls back to VISION_API_KEY (separate GCP quota).

    Supports two key types automatically:
      - Vertex AI Express keys  (start with "AQ.") → uses Vertex AI endpoint
      - Standard Gemini AI Studio keys (start with "AIzaSy") → uses standard endpoint
    """
    api_keys = [
        os.environ.get("GEMINI_API_KEY"),
        os.environ.get("VISION_API_KEY"),
    ]
    api_keys = [k for k in api_keys if k]

    if not api_keys:
        print("[Gemini] Error: No API key found.")
        return None

    for api_key in api_keys:
        result = _call_gemini(api_key, extracted_text, context_history)
        if result is not None:
            return result
        print("[Gemini] API key attempt failed. Trying next available...")

    return None


def _build_client(api_key: str):
    """
    Returns a configured genai.Client.
    Both AQ. (Vertex AI Express) and AIzaSy (AI Studio) keys use
    generativelanguage.googleapis.com/v1beta — no special handling needed.
    """
    api_key = api_key.strip()
    print("[Gemini] Connecting to Generative Language API.")
    return genai.Client(api_key=api_key)


def _call_gemini(api_key, extracted_text, context_history=None):
    print(f"[Gemini] Trying key starting with: {api_key[:10]}...")

    try:
        client = _build_client(api_key)

        history_prompt = ""
        if context_history:
            history_prompt = f"\n\nPATIENT HISTORY:\n{context_history}\n\nPlease correlate the current report with this history."

        prompt = f"""You are a world-class clinical pathologist and medical health strategist.
Analyze the following medical report data.

{extracted_text}
{history_prompt}

TASK:
1. Extract ALL test results into a structured format.
2. Identify the report type accurately (e.g., "Blood Report", "Urine Report", "Thyroid Profile", "Kidney Function Test", etc.).
3. Provide a health score (0-100).
4. Provide a concise overall summary.
5. For each test, provide:
   - name: The test name.
   - value: The result value.
   - unit: The measurement unit.
   - status: Normal, High, or Low.
   - simple_explanation: A very simple, non-medical explanation of what this test measures.
   - reason: Clear possible medical reasons or physiological causes for this result.
   - suggestion: Good suggestions for improvement (dietary changes, lifestyle habits, or medical follow-ups).
   - remark: A 1-sentence combined summary of the result.
   - normal_range: The reference range as a string (e.g., "70 - 100 mg/dL").

IMPORTANT:
- Return ONLY valid JSON.
- No markdown, no code fences.
- Match this exact schema:
{{
  "report_type": "Blood Report",
  "health_score": 85,
  "overall_status": "Good",
  "summary": "Full medical summary here...",
  "tests": [
    {{
      "name": "Glucose",
      "value": "95",
      "unit": "mg/dL",
      "status": "Normal",
      "simple_explanation": "Glucose measures the amount of sugar in your blood.",
      "reason": "Value is within optimal range.",
      "suggestion": "Maintain a balanced diet and regular exercise.",
      "remark": "Your blood sugar is normal and healthy.",
      "normal_range": "70 - 100 mg/dL"
    }}
  ]
}}
"""
        # Try models in priority order — 'gemini-pro-latest' verified working for this key
        for model_name in ["gemini-pro-latest", "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                text_response = response.text
                print(f"[Gemini] Success with model: {model_name}")
                break
            except Exception as model_err:
                err_str = str(model_err)
                if "404" in err_str or "not found" in err_str.lower():
                    print(f"[Gemini] Model '{model_name}' not found, trying next...")
                    continue
                raise  # re-raise non-404 errors
        else:
            print("[Gemini] No working model found.")
            return None

        # Clean up code blocks if model ignores "no markdown" rule
        m = re.search(r"```(?:json)?\s*(.*?)\s*```", text_response, re.DOTALL)
        if m:
            text_response = m.group(1)
        else:
            text_response = text_response.strip()

        return json.loads(text_response)

    except Exception as e:
        err_msg = str(e)
        if "429" in err_msg or "quota" in err_msg.lower():
            print(f"[Gemini] Quota Exceeded (429).")
        elif "403" in err_msg:
            print(f"[Gemini] Permission Denied (403). Key may not have access to this API.")
            print(f"[DEBUG] Full Error: {err_msg}")
        elif "404" in err_msg:
            print(f"[Gemini] Model Not Found (404).")
        else:
            print(f"[Gemini] Error: {err_msg}")
        return None


def chat_with_health_assistant(report_data, user_query, history=None, lang="en"):
    """
    Contextual chat with Gemini about a specific medical report.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("VISION_API_KEY")
    if not api_key:
        return "Assistant unavailable: No API key."

    try:
        client = _build_client(api_key)
        
        # Build context from report data
        report_summary = report_data.get("summary", "No summary available.")
        tests_summary = ""
        for t in report_data.get("tests", []):
            tests_summary += f"- {t.get('name', t.get('test'))}: {t.get('value')} {t.get('unit')} (Status: {t.get('status')})\n"

        system_instruction = f"""You are 'MEDClarity AI', a friendly and professional medical health coach. 
You are helping a patient understand their medical report.

CURRENT REPORT DATA:
Overall Summary: {report_summary}
Test Results:
{tests_summary}

RULES:
1. Be encouraging, empathetic, and clear.
2. Use simple, non-jargon language.
3. ALWAYS remind the user to consult their doctor for final medical decisions.
4. If asked about something NOT in the report, answer generally but stay focused on the user's health.
5. If the language is 'hi', respond in Hindi. If 'mr', respond in Marathi. Currently language is: {lang}.
6. Keep responses concise (max 3-4 sentences).
"""

        # Prepare chat history for Gemini 2.0 / 1.5 format
        # History is expected as list of {role: "user"/"model", parts: [{text: "..."}]}
        contents = []
        if history:
            for msg in history:
                role = "user" if msg["role"] == "user" else "model"
                contents.append({"role": role, "parts": [{"text": msg["content"]}]})
        
        # Add current query
        contents.append({"role": "user", "parts": [{"text": user_query}]})

        # Try models in priority order for chat - prioritize models known to work with this key
        chat_response = None
        # Note: Using 'gemini-pro-latest' and 'gemini-1.5-flash' as they are most stable for AI Studio keys
        for model_name in ["gemini-pro-latest", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash"]:
            try:
                chat_response = client.models.generate_content(
                    model=model_name,
                    config={"system_instruction": system_instruction},
                    contents=contents
                )
                print(f"[Chat] Success with model: {model_name}")
                break
            except Exception as m_err:
                print(f"[Chat] Model {model_name} access failed: {m_err}")
                continue
        
        if not chat_response:
            print("[Chat] ERROR: All Gemini models failed to respond.")
            raise Exception("No available Gemini models responded for chat.")

        return chat_response.text

    except Exception as e:
        print(f"[Chat] Error: {e}")
        return "I'm having trouble connecting to my medical brain right now. Please try again in a moment."


if __name__ == "__main__":
    # Simple CLI test
    import sys
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            content = f.read()
        res = analyze_health_report_gemini(content)
        print(json.dumps(res, indent=2))
    else:
        print("Usage: python gcp_gemini.py <text_file_path>")
