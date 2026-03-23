import re

def clean_text(text: str) -> str:
    """Normalize whitespace and remove non-medical characters."""
    # 1. Strip commas from obvious thousands (e.g., 7,800 -> 7800, 150,000 -> 150000)
    text = re.sub(r'(\d),(\d{3})', r'\1\2', text)
    # 2. Fix comma used as decimal point (e.g., 3,8 -> 3.8). Only if followed by 1 or 2 digits.
    text = re.sub(r'(\d),(\d{1,2}(?!\d))', r'\1.\2', text)
    # 3. Fix dropped decimal point with leading zero (e.g., " 04 " -> " 0.4 ")
    text = re.sub(r'\b0(\d)\b', r'0.\1', text)
    text = re.sub(r'\s+', ' ', text)
    # Allow: letters, digits, %, /, -, ., (, ), >, <, =, :, ^, µ, ×, @, ' (for OCR typos)
    text = re.sub(r'[^a-zA-Z0-9%\/\-\.\(\)\>\<\=\:\,\^\µ\×\@\' ]', '', text)
    return text.strip()
    # Fix dropped decimal point with leading zero (e.g., " 04 " -> " 0.4 ")
    text = re.sub(r'\b0(\d)\b', r'0.\1', text)
    text = re.sub(r'\s+', ' ', text)
    # Allow: letters, digits, %, /, -, ., (, ), >, <, =, :, ^, µ, ×, @, ' (for OCR typos)
    text = re.sub(r'[^a-zA-Z0-9%\/\-\.\(\)\>\<\=\:\,\^\µ\×\@\' ]', '', text)
    return text.strip()


def normalize_test_name(raw_name: str) -> tuple:
    """Maps fuzzy OCR-extracted names to standard clinical test names using substring matching.
    Returns: (normalized_name, is_known_flag)
    """
    key = raw_name.lower()
    
    # Precise regex matching rules (order matters: more specific first)
    if re.search(r'\b(glucose|fbs|fasting)\b', key): return "Fasting Blood Sugar", True
    if re.search(r'cholesterol', key) and re.search(r'\btotal\b', key): return "Total Cholesterol", True
    if re.search(r'\b(hdl)\b', key): return "HDL Cholesterol", True
    if re.search(r'\b(ldl)\b', key): return "LDL Cholesterol", True
    if re.search(r'\b(hba1c|glycated)\b', key): return "HbA1c", True
    if re.search(r'\b(ha?emoglobin|hgb|hb)\b', key): return "Haemoglobin", True
    if re.search(r'\b(wbc|white blood|tbc|wcc|leukocyte|tlc)\b', key): return "WBC Count", True
    if re.search(r'\b(rbc|erythrocyte)\b', key) or (re.search(r'\bred\b', key) and re.search(r'\bcell\b', key)): return "RBC Count", True
    if re.search(r'\b(plt|platelet)\b', key): return "Platelet Count", True
    if re.search(r'\b(hct|ha?ematocrit|pcv)\b', key): return "Hematocrit", True
    if re.search(r'\b(mcv)\b', key): return "MCV", True
    if re.search(r'\b(mchc)\b', key): return "MCHC", True
    if re.search(r'\b(mch)\b', key): return "MCH", True
    if re.search(r'\b(rdw)\b', key): return "RDW", True
    if re.search(r'\b(neut|neutrophils?)\b', key): return "Neutrophils", True
    if re.search(r'\b(lymph|lymphocytes?)\b', key): return "Lymphocytes", True
    if re.search(r'\b(mono|monocytes?)\b', key): return "Monocytes", True
    if re.search(r'\b(eosi|eosinophils?)\b', key): return "Eosinophils", True
    if re.search(r'\b(baso|basophils?)\b', key): return "Basophils", True
    if re.search(r'\b(tsh)\b', key): return "TSH", True
    if re.search(r'\b(creat|creatinine)\b', key): return "Creatinine", True
    if re.search(r'\b(urea|bun)\b', key): return "Blood Urea", True
    if re.search(r'\b(sgpt|alt)\b', key): return "ALT (SGPT)", True
    if re.search(r'\b(sgot|ast)\b', key): return "AST (SGOT)", True
    
    # Common missing panels to expand coverage
    if re.search(r'\b(bilirubin)\b', key): return "Bilirubin", True
    if re.search(r'\b(calcium)\b', key): return "Calcium", True
    if re.search(r'\b(potassium)\b', key): return "Potassium", True
    if re.search(r'\b(sodium)\b', key): return "Sodium", True
    if re.search(r'\b(chloride)\b', key): return "Chloride", True
    if re.search(r'\b(protein)\b', key): return "Protein", True
    if re.search(r'\b(albumin)\b', key): return "Albumin", True
    if re.search(r'\b(globulin)\b', key): return "Globulin", True
    if re.search(r'\b(alp|phosphatase)\b', key): return "Alkaline Phosphatase", True
    if re.search(r'\b(uric)\b', key) and re.search(r'\b(acid)\b', key): return "Uric Acid", True
    
    # Fallback to Title Case stripped of trailing junk
    clean_name = re.sub(r'[0-9\/\.\,\(\)\<]', '', raw_name).strip()
    return clean_name.title(), False


def extract_structured_data(lines: list) -> list:
    """
    Parses OCR text lines into structured test records.
    Returns: list of {test, value (float), unit, normal_range}
    
    Handles severe OCR typos:
    - "Haemoglobin GIdl 14.5" -> GIdl is trapped as unit g/dL
    - "Wbc Count 10 Iul 6.2" -> 10 Iul is trapped as 10^3/uL
    """
    
    # Aggressively fuzzy unit patterns to catch OCR character swaps
    UNIT_PATTERN = (
        r'(1[oO0][\s\^xX\*\'\%\@]*[236]?\s*[\/I\|l\s]+[µu]?[Ll]'  # 10^3/µL, 10 Iul
        r'|[Cc]ells[\/I\|l\s]*[µu]?[Ll]'               # cells/uL
        r'|[Mm]illion[\/I\|l\s]*[µu]?[Ll]'             # million/uL
        r'|10\s*[\^xX\*]\s*[236]\s*[\/I\|l\s]+mm3'     # 10^3/mm3
        r'|[µu][Gg][\/I\|l\s]*m[Ll]'                   # µg/mL
        r'|[Gg][\/I\|l\s]*d[Ll]'                       # g/dL
        r'|m[Gg][\/I\|l\s]*d[Ll]'                      # mg/dL
        r'|m[Gg][\/I\|l\s]*[Ll]'                       # mg/L
        r'|m[Ii][Uu][\/I\|l\s]*[Ll]'                   # mIU/L
        r'|[Uu][\/I\|l\s]*[Ll]|[Ii][Uu][\/I\|l\s]*[Ll]' # U/L, IU/L
        r'|mmol[\/I\|l\s]*[Ll]|[µu]mol[\/I\|l\s]*[Ll]'  # mmol/L
        r'|mEq[\/I\|l\s]*[Ll]'                          # mEq/L
        r'|mm[Hh]g'                                     # mmHg
        r'|f[Ll]|pg|%'                                  # fL, fl, pg, %
        r'|[\/I\|l\s]*mm3|[\/I\|l\s]*[µu][Ll])'         # /mm3, /uL
    )
    
    # Value must be standalone or cleanly separated (handling 210000 -> 7 digits)
    VALUE_PATTERN = r'\b(\d{1,7}(?:\.\d{1,3})?)\b'
    
    # Range usually has a dash, or a less-than sign (< 200)
    RANGE_PATTERN = r'\(?\s*(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)\s*\)?|(?:\<\s*(\d+\.?\d*))'

    extracted = []

    for line in lines:
        line = clean_text(line)
        if not line or len(line) < 4:
            continue

        # Extract normal range first
        normal_range = ""
        range_m = re.search(RANGE_PATTERN, line)
        if range_m:
            if range_m.group(3):
                normal_range = f"<{range_m.group(3)}"
            else:
                normal_range = f"{range_m.group(1)}-{range_m.group(2)}"
            line = line[:range_m.start()] + line[range_m.end():]

        # Extract unit (case-insensitive)
        unit = ""
        unit_m = re.search(UNIT_PATTERN, line, re.IGNORECASE)
        if unit_m:
            raw_unit = unit_m.group(1).lower().strip()
            # Standardize 10^3 OCR typos natively
            if '10' in raw_unit or '1o' in raw_unit or '1 0' in raw_unit or 'cell' in raw_unit:
                unit = "10^3/µL" if "rbc" not in line.lower() else "10^6/µL"
            elif 'million' in raw_unit:
                unit = "10^6/µL"
            elif 'gldl' in raw_unit or 'gidl' in raw_unit or 'gdl' in raw_unit or 'g / dl' in raw_unit:
                unit = "g/dL"
            else:
                unit = unit_m.group(1).strip()
            line = line[:unit_m.start()] + line[unit_m.end():]

        # Extract numeric value
        value = None
        num_matches = list(re.finditer(VALUE_PATTERN, line))
        
        if num_matches:
            val_m = num_matches[0]
            try:
                value = float(val_m.group(1))
                line = line[:val_m.start()] + line[val_m.end():]
            except ValueError:
                pass
        else:
            # Fallback for qualitative string results
            text_val_m = re.search(r'\b(Positive|Negative|Reactive|Non-Reactive|Non Reactive|Absent|Present|Trace|NIL|Detected|Not Detected|Normal|Abnormal)\b', line, re.IGNORECASE)
            if text_val_m:
                 value = text_val_m.group(1).title()
                 line = line[:text_val_m.start()] + line[text_val_m.end():]

        if value is None:
            continue

        # What remains is the test name
        test_name_raw = re.sub(r'[\:\-\,\.\(\)]', '', line).strip()
        test_name_raw = re.sub(r'\s+', ' ', test_name_raw).strip()

        if len(test_name_raw) < 2:
            continue

        normalized, is_known = normalize_test_name(test_name_raw)

        # STRICT REJECTION: If test is unknown AND has no unit AND no range -> It's a hallucination (e.g. "Mumbai 400001")
        # BUT explicitly ALLOW string-based qualitative values because they strictly match medical keywords (Positive/Negative/etc)
        if not is_known and not unit and not normal_range and not isinstance(value, str):
            continue

        extracted.append({
            "test": normalized,
            "raw_name": test_name_raw,
            "value": value,
            "unit": unit,
            "normal_range": normal_range,
        })

    return extracted
