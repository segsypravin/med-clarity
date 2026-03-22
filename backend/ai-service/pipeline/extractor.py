import re

def clean_text(text):
    """Normalize text: remove extra spaces, unknown symbols."""
    text = re.sub(r'\s+', ' ', text)
    # Remove characters that are highly unlikely in a medical report except standard ones
    # Allow alphabets, numbers, %, /, -, ., (, ), >, <, =, :
    text = re.sub(r'[^a-zA-Z0-9%\/\-\.\(\)\>\<\=\:\, ]', '', text)
    return text.strip()

def extract_data_from_lines(lines):
    """
    Identifies test names, values, units, and normal ranges from a list of strings.
    Returns a list of dictionaries.
    """
    extracted_data = []

    # Regex patterns:
    # Value: typically a float or integer: e.g., 13.5, 180, 0.5
    value_pattern = r'(\d+\.?\d*)'
    
    # Units: Common medical units
    unit_pattern = r'(g/dL|mg/dL|%|x10\^6/uL|/mm3|mEq/L|U/L|mmol/L|fl|pg)'
    
    # Normal Range: can be in parentheses (70-100) or standalone like 13.5 - 17.0
    range_pattern = r'\(?(\d+\.?\d*\s*-\s*\d+\.?\d*)\)?'
    
    for line in lines:
        line = clean_text(line)
        if not line:
            continue
            
        # We need a heuristic: A typical test line has a string name, a number, a unit, and optionally a range.
        # Check if there is a number
        match_val = re.search(value_pattern, line)
        if not match_val:
            continue # Skip lines without values (probably headers)
            
        value_str = match_val.group(1)
        value = float(value_str)
        
        # Check for range first to avoid confusing range numbers with the main value
        normal_range = ""
        match_range = re.search(range_pattern, line)
        if match_range:
            normal_range = match_range.group(1).replace(' ', '')
            # Remove range from line so it doesn't interfere
            line = line.replace(match_range.group(0), '')
            
            # Recheck value just in case the value we matched earlier was inside the range
            # Example: Glucose (70-100) -> without replacing earlier, value might have been 70.
            # Best way is to find the first number that is NOT part of the range.
            match_val_new = re.search(value_pattern, line)
            if match_val_new:
                value_str = match_val_new.group(1)
                value = float(value_str)

        match_unit = re.search(unit_pattern, line, flags=re.IGNORECASE)
        unit = match_unit.group(1) if match_unit else ""
        
        if match_unit:
            line = line.replace(match_unit.group(0), '')
            
        line = line.replace(str(value_str), '')
        
        # Whatever is left on the left side (or after cleaning) is likely the test name
        # Remove trailing/leading colons and spaces
        test_name = re.sub(r'[\:\-\,]', '', line).strip()
        
        if len(test_name) > 2:
            extracted_data.append({
                "raw_name": test_name,
                "value": value,
                "unit": unit,
                "normal_range": normal_range
            })

    return extracted_data
