import requests
import json
import re
from deep_translator import GoogleTranslator


# ── Translation helper ───────────────────────────────────────────────────────
def translate_text(text, target_lang):
    """Translates text to target_lang using Google Translator. Returns original on failure."""
    try:
        if not text or target_lang == "en":
            return text
        return GoogleTranslator(source='auto', target=target_lang).translate(str(text))
    except Exception as e:
        print(f"[Translation] Error ({target_lang}): {e}")
        return text


# ── Full spoken summary builder ───────────────────────────────────────────────
def generate_full_summary(summary, tests, lang="en"):
    """Builds a comprehensive spoken summary for TTS, fully localized."""
    clean = (summary or "").replace("µ", "micro").replace("^", " ").strip()
    full = clean + " "

    troubles = [t for t in (tests or []) if t.get("status", "").lower() in ["high", "low", "critical"]]

    STATUS_MAP = {
        "hi": {"high": "ज़्यादा", "low": "कम", "normal": "सामान्य"},
        "mr": {"high": "जास्त", "low": "कमी", "normal": "सामान्य"},
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


# ── Core AI analysis ────────────────────────────────────────────────────────
def analyze_report(structured_tests_or_text, lang="en"):
    """
    Accepts either:
      - list of structured test dicts (preferred, from extraction pipeline)
      - raw OCR text string (fallback for backward compatibility)
    Returns full analysis with reason + suggestion per test.
    """

    # ── Build input for prompt ───────────────────────────────────────────────
    if isinstance(structured_tests_or_text, list) and len(structured_tests_or_text) > 0:
        # Format structured tests as a clear table for the LLM
        test_lines = []
        for t in structured_tests_or_text:
            line = f"  - {t['test']}: {t['value']} {t.get('unit', '')}"
            if t.get("normal_range"):
                line += f"  (Reference: {t['normal_range']})"
            # Include the mathematically verified status
            calculated_status = t.get('status', 'Normal').upper()
            line += f"  => [STATUS: {calculated_status}]"
            test_lines.append(line)
        report_input = "EXTRACTED TEST DATA (verified):\n" + "\n".join(test_lines)
        use_structured = True
    else:
        # Fallback: raw text
        report_input = f"RAW REPORT TEXT:\n{structured_tests_or_text}"
        use_structured = False

    prompt = f"""You are a senior clinical pathologist AI assistant.

{report_input}

CRITICAL RULES:
1. Do NOT calculate or guess the status. You MUST use the exact [STATUS] provided for each test above.
2. If the Status is 'NORMAL', your reason MUST be exactly "Value is within normal limits." and your suggestion MUST be exactly "Maintain a healthy lifestyle." DO NOT invent diseases, conditions, or treatments for NORMAL tests.
3. If the Status is 'HIGH' or 'LOW', provide a clear medical reason (physiological meaning, possible causes) and practical, actionable advice.
4. remark: A concise 1-sentence version combining reason + suggestion.
5. health_score: integer 0–100 (100 = perfectly healthy, deduct ~5 per abnormal test).
6. overall_status: "Normal" if all tests normal, otherwise "Attention Required".
7. summary: 2–3 personalized sentences about overall health based on the results.

RESPOND WITH VALID JSON ONLY — NO EXTRA TEXT, NO MARKDOWN:
{{
  "summary": "string",
  "health_score": integer,
  "overall_status": "Normal or Attention Required",
  "tests": [
    {{
      "test": "Test Name",
      "value": "value as string",
      "unit": "unit",
      "status": "Normal/Low/High",
      "reason": "Medical explanation why it is normal/abnormal.",
      "suggestion": "Actionable advice for the patient.",
      "remark": "One-sentence summary of reason + suggestion."
    }}
  ]
}}"""

    try:
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False, "format": "json"},
            timeout=180
        )
        raw = response.json().get("response", "")

        # Parse JSON
        try:
            parsed = json.loads(raw)
        except Exception:
            m = re.search(r"\{.*\}", raw, re.DOTALL)
            if not m:
                return _error_result(lang, "AI could not parse the report.")
            try:
                parsed = json.loads(m.group(0))
            except Exception as e:
                print(f"[AI] JSON parse failed: {e}\nRAW: {raw[:500]}")
                return _error_result(lang, "AI returned malformed JSON.")

        summary = parsed.get("summary", "Analysis complete.")
        tests = parsed.get("tests", [])
        if not isinstance(tests, list):
            tests = []

        # ── Normalize each test entry ────────────────────────────────────────
        for item in tests:
            item["test"]       = str(item.get("test", item.get("name", "Unknown"))).strip()
            item["value"]      = str(item.get("value", "")).strip()
            item["unit"]       = str(item.get("unit", "")).strip()
            item["status"]     = str(item.get("status", "Normal")).strip().capitalize()
            item["reason"]     = str(item.get("reason", "")).strip()
            item["suggestion"] = str(item.get("suggestion", "")).strip()
            # remark = combined for frontend display (backward-compatible)
            item["remark"]     = str(item.get("remark", item.get("reason", ""))).strip()

            # Optional translation
            if lang != "en":
                item["test_translated"]       = translate_text(item["test"], lang)
                item["remark_translated"]     = translate_text(item["remark"], lang)
                item["reason_translated"]     = translate_text(item["reason"], lang)
                item["suggestion_translated"] = translate_text(item["suggestion"], lang)

        # ── Build translated summary ─────────────────────────────────────────
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
            "health_score": int(parsed.get("health_score", 80)),
            "overall_status": parsed.get("overall_status", "Normal"),
            "tests": tests,
            "lang": lang
        }

    except Exception as e:
        return _error_result(lang, f"Connection Error: {e}")


def _error_result(lang, msg):
    return {
        "summary": msg,
        "summary_translated": None,
        "full_report_summary": msg,
        "health_score": 0,
        "overall_status": "Error",
        "tests": [],
        "lang": lang
    }


# ── On-the-fly translation of an existing result ────────────────────────────
def translate_result(data, target_lang):
    """Re-translates an existing analysis result to a new language."""
    if not data:
        return {}
    if target_lang == "en":
        if not data.get("full_report_summary"):
            data["full_report_summary"] = generate_full_summary(
                data.get("summary", ""), data.get("tests", [])
            )
        return data

    new_data = data.copy()
    new_data["summary_translated"] = translate_text(data.get("summary", ""), target_lang)

    new_tests = []
    for item in (data.get("tests") or []):
        ni = item.copy()
        ni["test_translated"]       = translate_text(item.get("test", ""), target_lang)
        ni["remark_translated"]     = translate_text(item.get("remark", ""), target_lang)
        ni["reason_translated"]     = translate_text(item.get("reason", ""), target_lang)
        ni["suggestion_translated"] = translate_text(item.get("suggestion", ""), target_lang)
        new_tests.append(ni)

    new_data["tests"] = new_tests
    new_data["full_report_summary"] = generate_full_summary(
        new_data["summary_translated"], new_tests, target_lang
    )
    new_data["lang"] = target_lang
    return new_data