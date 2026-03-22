from pipeline.ai_analysis import translate_text
import sys

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

test_sentences = [
    "Your hemoglobin levels are slightly low.",
    "Everything looks normal.",
    "Hemoglobin",
    "WBC Count"
]

langs = ["hi", "mr"]

for lang in langs:
    print(f"\n--- Testing Language: {lang} ---")
    for text in test_sentences:
        translated = translate_text(text, lang)
        print(f"Original: {text}")
        print(f"Translated: {translated}")
