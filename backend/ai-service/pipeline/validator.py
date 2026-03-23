"""
validator.py — Validation layer for structured medical test data.
Runs between extraction and AI analysis to ensure clean, reliable input.
"""

# Unit normalization map: OCR variants → standard form
UNIT_NORM = {
    "g/dl": "g/dL", "G/DL": "g/dL",
    "mg/dl": "mg/dL", "MG/DL": "mg/dL",
    "x10^3/ul": "10^3/µL", "x10^3/µl": "10^3/µL",
    "×10^3/ul": "10^3/µL", "×10^3/µl": "10^3/µL",
    "10^3/ul": "10^3/µL",
    "x10^6/ul": "10^6/µL", "10^6/ul": "10^6/µL",
    "fl": "fL", "FL": "fL",
    "pg": "pg",
    "miu/l": "mIU/L", "MIU/L": "mIU/L",
    "u/l": "U/L", "iu/l": "IU/L",
    "mmol/l": "mmol/L",
    "/mm3": "/mm³", "/ul": "/µL",
}

# Known duplicate/alias pairs — keep only the first encountered
DUPLICATE_ALIASES = {
    "hemoglobin": "haemoglobin",
    "hematocrit": "pcv",
    "wbc count": "total wbc",
    "rbc count": "total rbc",
}

# Hardcoded fallback reference ranges
REFERENCE_RANGES = {
    "Haemoglobin": (12.0, 17.0),
    "WBC Count": (4.0, 11.0),
    "RBC Count": (4.5, 5.5),
    "Platelet Count": (150.0, 450.0),
    "Hematocrit": (37.0, 47.0),
    "MCV": (80.0, 100.0),
    "MCH": (27.0, 32.0),
    "MCHC": (31.5, 35.0),
    "RDW": (11.5, 14.5),
    "Neutrophils": (2.0, 7.5),
    "Lymphocytes": (1.0, 4.0),
    "Monocytes": (0.2, 1.0),
    "Eosinophils": (0.0, 0.5),
    "Basophils": (0.0, 0.2),
    "Fasting Blood Sugar": (70.0, 100.0),
    "Total Cholesterol": (0.0, 200.0),
    "LDL Cholesterol": (0.0, 100.0),
    "TSH": (0.4, 4.0),
    "Creatinine": (0.5, 1.2),
    "ALT (SGPT)": (7.0, 56.0),
    "AST (SGOT)": (10.0, 40.0),
}

def evaluate_test_status(test_name: str, value, normal_range_str: str) -> str:
    """Evaluates if a value is Normal, High, or Low deterministically. Supports string values."""
    if isinstance(value, str):
        v_low = value.lower()
        if v_low in ["negative", "absent", "nil", "normal", "non-reactive", "non reactive", "not detected"]:
            return "Normal"
        return "Attention Required"

    import re
    min_val, max_val = None, None

    if normal_range_str:
        m = re.search(r'(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)', normal_range_str)
        if m:
            try:
                min_val, max_val = float(m.group(1)), float(m.group(2))
            except ValueError:
                pass
        else:
            m2 = re.search(r'<\s*(\d+\.?\d*)', normal_range_str)
            if m2:
                try:
                    min_val, max_val = 0.0, float(m2.group(1))
                except ValueError:
                    pass

    if min_val is None or max_val is None:
        ref = REFERENCE_RANGES.get(test_name)
        if ref:
            min_val, max_val = ref

    if min_val is not None and max_val is not None:
        if value < min_val: return "Low"
        if value > max_val: return "High"
        return "Normal"
            
    return "Normal"


def normalize_unit(unit: str) -> str:
    """Normalize unit string to standard form."""
    return UNIT_NORM.get(unit.strip(), unit.strip())


def validate_structured_data(tests: list) -> list:
    """
    Clean and validate a list of extracted test records.
    Rules:
      - value must be numeric and > 0
      - test name must be >= 3 characters
      - remove duplicate test names (keep first occurrence)
      - normalize units
      - skip lab headers, patient info lines
    """
    SKIP_KEYWORDS = {
        "patient", "name", "date", "dob", "age", "gender", "sex",
        "lab", "report", "doctor", "ref", "id", "no", "page",
        "specimen", "sample", "collected", "received", "printed",
        "pathologist", "signature", "result", "test", "normal range",
        "reference", "hospital", "clinic"
    }

    seen_names = set()
    valid = []

    for item in tests:
        test_name = item.get("test", "").strip()
        value = item.get("value")
        unit = item.get("unit", "")

        # ── Rule 1: Name must be at least 3 chars ───────────────────────────
        if not test_name or len(test_name) < 3:
            continue

        # ── Rule 2: Skip info/header lines ──────────────────────────────────
        name_lower = test_name.lower()
        if any(kw in name_lower for kw in SKIP_KEYWORDS):
            continue

        # ── Rule 3: Value must be a positive number OR valid string ──────────
        if value is None:
            continue
            
        fval = value
        if not isinstance(value, str):
            try:
                fval = float(value)
            except (TypeError, ValueError):
                continue
            if fval <= 0:
                continue

        # ── Rule 4: Deduplicate by normalized name ───────────────────────────
        dedup_key = DUPLICATE_ALIASES.get(name_lower, name_lower)
        if dedup_key in seen_names:
            continue
        seen_names.add(dedup_key)

        # ── Rule 6: Fix OCR 10x scaling error ───────────────────────────────
        if not isinstance(fval, str):
            ref = REFERENCE_RANGES.get(test_name)
            if ref:
                if fval > (ref[1] * 5):
                    if (ref[0] * 0.5) <= (fval / 10) <= (ref[1] * 1.5):
                        fval = fval / 10.0

        # ── Rule 7: Determine Status deterministically ───────────────────────
        status = evaluate_test_status(test_name, fval, item.get("normal_range", ""))

        item_clean = item.copy()
        item_clean["value"] = fval
        item_clean["unit"] = normalize_unit(unit) if unit else ""
        item_clean["status"] = status  # Guaranteed Python math status

        valid.append(item_clean)

    print(f"[Validator] {len(tests)} extracted → {len(valid)} valid tests passed to AI")
    return valid
