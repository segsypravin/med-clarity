import requests
import json
import re
from deep_translator import GoogleTranslator

def translate_text(text, target_lang):
    """Translates text using Google Translator. Returns original if fails."""
    try:
        if not text or target_lang == "en":
            return text
        return GoogleTranslator(source='auto', target=target_lang).translate(str(text))
    except Exception as e:
        print(f"[Translation] Error ({target_lang}): {e}")
        return text

def generate_full_summary(summary, tests, lang="en"):
    """Builds a comprehensive spoken summary for TTS, fully localized."""
    # Clean symbols that break speech synthesis
    clean = (summary or "").replace("µ", "micro").replace("^", " ").strip()
    full = clean + " "

    troubles = [t for t in (tests or []) if t.get("status", "").lower() in ["high", "low", "critical"]]

    STATUS_MAP = {
        "hi": {"high": "ज़्यादा", "low": "कम", "normal": "सामान्य", "critical": "गंभीर"},
        "mr": {"high": "जास्त", "low": "कमी", "normal": "सामान्य", "critical": "गंभीर"},
    }

    if troubles:
        if lang == "hi":
            full += "मुख्य निष्कर्षों में शामिल हैं: "
        elif lang == "mr":
            full += "मुख्य निष्कर्षांमध्ये हे समाविष्ट आहे: "
        else:
            full += "Key findings: "

        for t in troubles:
            name = t.get("test_translated") if lang != "en" else t.get("test", "")
            remark = t.get("remark_translated") if lang != "en" else t.get("remark", "")
            raw_status = t.get("status", "").lower()
            display_status = STATUS_MAP.get(lang, {}).get(raw_status, raw_status.capitalize())

            if lang == "hi":
                full += f"{name} {display_status} है। {remark} "
            elif lang == "mr":
                full += f"{name} {display_status} आहे. {remark} "
            else:
                full += f"{name} is {display_status}. {remark} "
    else:
        if lang == "hi":
            full += "आपके सभी परीक्षण परिणाम सामान्य सीमा के भीतर हैं।"
        elif lang == "mr":
            full += "तुमचे सर्व चाचणी निकाल सामान्य मर्यादेत आहेत."
        else:
            full += "All test results are within normal ranges."

    return full.strip()


def analyze_report(text, lang="en"):
    """Sends OCR text to Ollama and returns structured JSON with optional translations."""

    prompt = f"""You are a senior clinical pathologist. Analyze the medical report below.

REPORT:
{text}

STRICT REFERENCE RANGES:
- Haemoglobin: 13.0-17.0 g/dL (Male), 12.0-15.0 g/dL (Female)
- WBC Count: 4.0-11.0 × 10³/µL
- RBC Count: 4.5-5.5 × 10⁶/µL
- Platelet Count: 150-450 × 10³/µL
- Hematocrit (Hct): 37.0-47.0 %
- MCV: 80.0-100.0 fL
- MCH: 27.0-32.0 pg
- Neutrophils: 2.0-7.5 × 10³/µL
- Lymphocytes: 1.0-4.0 × 10³/µL
- Monocytes: 0.2-1.0 × 10³/µL
- Eosinophils: 0.0-0.5 × 10³/µL
- Basophils: 0.0-0.2 × 10³/µL
- FBS: 70-100 mg/dL
- HbA1c: <5.7% Normal
- Total Cholesterol: <200 mg/dL
- LDL: <100 mg/dL
- TSH: 0.4-4.0 mIU/L

RULES:
1. Compare each value against the reference ranges above.
2. If WITHIN range → status = "Normal". Write a brief reassuring remark about what this value means for the patient's health (e.g. "Your haemoglobin is healthy, indicating good oxygen-carrying capacity.").
3. If OUTSIDE range → status = "Low" or "High". Explain WHY in simple terms and give 1-2 practical suggestions (diet, hydration, lifestyle). If critically abnormal, add "Consult a doctor immediately."
4. Always list EVERY test parameter extracted from the report.
5. health_score: overall score 0-100 (100 = perfectly healthy).
6. Summary: 2-3 personalized sentences summarising overall health.

RESPOND WITH VALID JSON ONLY — NO EXTRA TEXT:
{{
  "summary": "string",
  "health_score": integer,
  "overall_status": "Normal or Attention Required",
  "tests": [
    {{"test": "Name", "value": "val", "unit": "unit", "status": "Normal/Low/High", "remark": "Meaningful explanation and advice"}}
  ]
}}"""

    try:
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False, "format": "json"},
            timeout=120
        )
        raw = response.json().get("response", "")

        # Try to load directly as JSON
        try:
            parsed = json.loads(raw)
        except Exception:
            # Fallback: extract JSON block from text
            m = re.search(r"\{.*\}", raw, re.DOTALL)
            if not m:
                return {"summary": "AI could not parse the report.", "tests": [], "health_score": 0, "overall_status": "Unknown", "lang": lang}
            try:
                parsed = json.loads(m.group(0))
            except Exception as e:
                print(f"[AI] JSON parse failed: {e}")
                return {"summary": "AI could not parse the report.", "tests": [], "health_score": 0, "overall_status": "Unknown", "lang": lang}

        summary = parsed.get("summary", "Analysis complete.")
        tests = parsed.get("tests", [])
        if not isinstance(tests, list):
            tests = []

        # Normalize each test
        for item in tests:
            item["test"] = str(item.get("test", item.get("name", "Unknown"))).strip()
            item["value"] = str(item.get("value", "")).strip()
            item["unit"] = str(item.get("unit", "")).strip()
            item["status"] = str(item.get("status", "Normal")).strip().capitalize()
            item["remark"] = str(item.get("remark", "Within normal range.")).strip()

            if lang != "en":
                item["test_translated"] = translate_text(item["test"], lang)
                item["remark_translated"] = translate_text(item["remark"], lang)

        summary_translated = None
        if lang != "en":
            summary_translated = translate_text(summary, lang)
            full_summary = generate_full_summary(summary_translated, tests, lang)
        else:
            full_summary = generate_full_summary(summary, tests, lang="en")

        return {
            "summary": summary,
            "summary_translated": summary_translated,
            "full_report_summary": full_summary,
            "health_score": parsed.get("health_score", 80),
            "overall_status": parsed.get("overall_status", "Normal"),
            "tests": tests,
            "lang": lang
        }

    except Exception as e:
        return {
            "summary": f"Connection Error: {str(e)}",
            "tests": [],
            "health_score": 0,
            "overall_status": "Error",
            "lang": lang
        }


def translate_result(data, target_lang):
    """Re-translates an existing analysis result to a new language."""
    if not data:
        return {}
    if target_lang == "en":
        if not data.get("full_report_summary"):
            data["full_report_summary"] = generate_full_summary(data.get("summary", ""), data.get("tests", []))
        return data

    new_data = data.copy()
    new_data["summary_translated"] = translate_text(data.get("summary", ""), target_lang)

    new_tests = []
    for item in (data.get("tests") or []):
        ni = item.copy()
        ni["test_translated"] = translate_text(item.get("test", ""), target_lang)
        ni["remark_translated"] = translate_text(item.get("remark", ""), target_lang)
        new_tests.append(ni)

    new_data["tests"] = new_tests
    new_data["full_report_summary"] = generate_full_summary(new_data["summary_translated"], new_tests, target_lang)
    new_data["lang"] = target_lang
    return new_data