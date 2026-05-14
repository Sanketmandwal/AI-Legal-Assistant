"""
pipeline/cleaner.py

WHY: Raw legal text from PDFs has noise: page headers, footers,
broken hyphenation, inconsistent whitespace. We clean each source
differently because their PDF→text artifacts differ.
"""

import re
from pathlib import Path
from config import DATA_RAW_DIR, DATA_PROC_DIR, SOURCE_REGISTRY

# ── Shared cleaning steps (apply to all documents) ─────────
def _shared_clean(text: str) -> str:
    # 1. Normalize line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # 2. Remove page numbers (standalone lines like "- 42 -" or just "42")
    text = re.sub(r'^\s*[-–]?\s*\d{1,4}\s*[-–]?\s*$', '', text, flags=re.MULTILINE)

    # 3. Remove repeated headers/footers (lines that appear many times)
    #    We'll do this in post-processing per-document if needed.

    # 4. Fix broken hyphenation (word-\nnewword → wordnewword)
    text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)

    # 5. Collapse multiple blank lines to max 2
    text = re.sub(r'\n{3,}', '\n\n', text)

    # 6. Remove non-printable characters (keep Devanagari range for Hindi text)
    text = re.sub(r'[^\x20-\x7E\u0900-\u097F\n]', ' ', text)

    # 7. Normalize spaces
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r' +\n', '\n', text)

    return text.strip()


# ── Document-specific cleaners ─────────────────────────────
def clean_constitution(text: str) -> str:
    text = _shared_clean(text)
    # Remove "THE CONSTITUTION OF INDIA" repeated headers
    text = re.sub(r'THE CONSTITUTION OF INDIA\n', '', text)
    # Normalize Article markers: "ARTICLE 14" → "Article 14"
    text = re.sub(r'\bARTICLE\s+(\d+)', r'Article \1', text)
    # Normalize "PART [Roman numeral]" headers
    text = re.sub(r'\bPART\s+([IVXLC]+)\b', r'Part \1', text)
    return text


def clean_bns(text: str) -> str:
    text = _shared_clean(text)
    # Normalize section markers: "SECTION 103" or "Sec. 103" → "Section 103"
    text = re.sub(r'\b(?:SECTION|Sec\.)\s+(\d+)', r'Section \1', text)
    # Remove "Bharatiya Nyaya Sanhita" repeated in headers
    text = re.sub(r'Bharatiya Nyaya Sanhita,?\s*\d{4}\n', '', text)
    return text


def clean_bnss(text: str) -> str:
    text = _shared_clean(text)
    text = re.sub(r'\b(?:SECTION|Sec\.)\s+(\d+)', r'Section \1', text)
    text = re.sub(r'Bharatiya Nagarik Suraksha Sanhita,?\s*\d{4}\n', '', text)
    return text


def clean_bsa(text: str) -> str:
    text = _shared_clean(text)
    text = re.sub(r'\b(?:SECTION|Sec\.)\s+(\d+)', r'Section \1', text)
    text = re.sub(r'Bharatiya Sakshya Adhiniyam,?\s*\d{4}\n', '', text)
    return text


def clean_contract_act(text: str) -> str:
    text = _shared_clean(text)
    text = re.sub(r'\b(?:SECTION|Sec\.)\s+(\d+)', r'Section \1', text)
    # The Contract Act often has "THE INDIAN CONTRACT ACT, 1872" in headers
    text = re.sub(r'THE INDIAN CONTRACT ACT,?\s*1872\n', '', text)
    return text


# ── Dispatcher ─────────────────────────────────────────────
CLEANERS = {
    "constitution.txt":  clean_constitution,
    "bns.txt":           clean_bns,
    "bnss.txt":          clean_bnss,
    "bsa.txt":           clean_bsa,
    "contract_act.txt":  clean_contract_act,
}


def clean_all(output_dir: Path = DATA_PROC_DIR) -> dict[str, str]:
    """
    Clean all source documents.
    Returns: dict of {filename: cleaned_text}
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    cleaned = {}

    for filename, cleaner_fn in CLEANERS.items():
        source_path = DATA_RAW_DIR / filename
        if not source_path.exists():
            print(f"  [SKIP] {filename} not found in {DATA_RAW_DIR}")
            continue

        raw_text = source_path.read_text(encoding="utf-8", errors="replace")
        clean_text = cleaner_fn(raw_text)
        cleaned[filename] = clean_text

        # Save cleaned version for inspection
        out_path = output_dir / f"clean_{filename}"
        out_path.write_text(clean_text, encoding="utf-8")
        print(f"  [OK]   {filename} → {len(clean_text):,} chars")

    return cleaned


if __name__ == "__main__":
    print("Cleaning documents...")
    results = clean_all()
    print(f"\nDone. Cleaned {len(results)} documents.")