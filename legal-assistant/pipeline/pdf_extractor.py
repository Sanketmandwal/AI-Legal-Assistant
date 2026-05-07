"""
pipeline/pdf_extractor.py

WHY: Legal PDFs have inconsistent internal structures.
We use a tiered extraction strategy:

  Tier 1 — pdfplumber  : Best for text-layer PDFs with clean layout
  Tier 2 — pymupdf     : Better for PDFs with complex column layouts
  Tier 3 — pdfminer    : Last resort for difficult encodings

After extraction we run quality checks. If extracted text looks like
garbage (too many symbols, suspiciously short), we raise a clear error
rather than silently passing bad text to the chunker.

Output: one .txt file per PDF saved to data/raw/
"""

import re
import json
from pathlib import Path
from typing import Optional

from config import DATA_RAW_DIR, SOURCE_REGISTRY

# Map of expected PDF filenames → output txt filenames
PDF_TO_TXT = {
    "constitution.pdf":   "constitution.txt",
    "bns.pdf":            "bns.txt",
    "bnss.pdf":           "bnss.txt",
    "bsa.pdf":            "bsa.txt",
    "contract_act.pdf":   "contract_act.txt",
}


# ── Quality checks ─────────────────────────────────────────
def _quality_score(text: str) -> dict:
    """
    Returns a quality report for extracted text.
    Flags problems that indicate bad extraction.
    """
    total_chars = len(text)
    if total_chars == 0:
        return {"score": 0, "reason": "empty output"}

    # Ratio of printable ASCII + Devanagari vs total
    printable = sum(
        1 for c in text
        if ('\x20' <= c <= '\x7E') or ('\u0900' <= c <= '\u097F') or c == '\n'
    )
    printable_ratio = printable / total_chars

    # Ratio of alphabetic characters (should be high for legal text)
    alpha = sum(1 for c in text if c.isalpha())
    alpha_ratio = alpha / total_chars

    # Word count (rough)
    words = len(text.split())

    issues = []
    if printable_ratio < 0.85:
        issues.append(f"low printable ratio: {printable_ratio:.2f}")
    if alpha_ratio < 0.50:
        issues.append(f"low alpha ratio: {alpha_ratio:.2f}")
    if words < 500:
        issues.append(f"suspiciously short: {words} words")

    score = printable_ratio * 0.5 + alpha_ratio * 0.5
    return {
        "score": round(score, 3),
        "words": words,
        "printable_ratio": round(printable_ratio, 3),
        "alpha_ratio": round(alpha_ratio, 3),
        "issues": issues,
    }


# ── Tier 1: pdfplumber ─────────────────────────────────────
def _extract_pdfplumber(pdf_path: Path) -> Optional[str]:
    try:
        import pdfplumber
        pages = []
        with pdfplumber.open(str(pdf_path)) as pdf:
            for page in pdf.pages:
                text = page.extract_text(
                    x_tolerance=2,
                    y_tolerance=2,
                    layout=True,          # preserves spacing better
                    x_density=7.25,
                    y_density=13,
                )
                if text:
                    pages.append(text)
        return "\n\n".join(pages) if pages else None
    except Exception as e:
        print(f"    pdfplumber failed: {e}")
        return None


# ── Tier 2: pymupdf (fitz) ─────────────────────────────────
def _extract_pymupdf(pdf_path: Path) -> Optional[str]:
    try:
        import fitz  # pymupdf
        doc = fitz.open(str(pdf_path))
        pages = []
        for page in doc:
            # "text" mode preserves layout better than "blocks"
            text = page.get_text("text", sort=True)
            if text.strip():
                pages.append(text)
        doc.close()
        return "\n\n".join(pages) if pages else None
    except Exception as e:
        print(f"    pymupdf failed: {e}")
        return None


# ── Tier 3: pdfminer ───────────────────────────────────────
def _extract_pdfminer(pdf_path: Path) -> Optional[str]:
    try:
        from pdfminer.high_level import extract_text as pm_extract
        text = pm_extract(str(pdf_path))
        return text if text and text.strip() else None
    except Exception as e:
        print(f"    pdfminer failed: {e}")
        return None


# ── Main extractor ─────────────────────────────────────────
def extract_pdf(pdf_path: Path, min_score: float = 0.80) -> str:
    """
    Extract text from a PDF using tiered strategy.
    Raises ValueError if no tier produces acceptable quality.
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    tiers = [
        ("pdfplumber", _extract_pdfplumber),
        ("pymupdf",    _extract_pymupdf),
        ("pdfminer",   _extract_pdfminer),
    ]

    best_text  = None
    best_score = 0.0
    best_tier  = None

    for tier_name, extractor in tiers:
        print(f"    Trying {tier_name}...")
        text = extractor(pdf_path)
        if not text:
            continue

        report = _quality_score(text)
        print(f"    Score: {report['score']} | Words: {report.get('words', 0)} "
              f"| Issues: {report['issues']}")

        if report["score"] > best_score:
            best_score = report["score"]
            best_text  = text
            best_tier  = tier_name

        # If quality is already excellent, stop trying
        if report["score"] >= 0.95 and not report["issues"]:
            break

    if best_text is None or best_score < min_score:
        raise ValueError(
            f"All extraction tiers failed for {pdf_path.name}. "
            f"Best score: {best_score:.3f} (minimum: {min_score}). "
            f"The PDF may be scanned/image-based. Consider OCR."
        )

    print(f"    Best tier: {best_tier} (score: {best_score:.3f})")
    return best_text


def extract_all_pdfs(
    pdf_dir: Path = DATA_RAW_DIR,
    output_dir: Path = DATA_RAW_DIR,
) -> dict[str, str]:
    """
    Extract all PDFs in pdf_dir that match our registry.
    Saves .txt files alongside PDFs.
    Returns dict of {txt_filename: extracted_text}
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    results = {}
    report  = {}

    for pdf_name, txt_name in PDF_TO_TXT.items():
        pdf_path = pdf_dir / pdf_name
        txt_path = output_dir / txt_name

        # Skip if already extracted (saves time on re-runs)
        if txt_path.exists():
            existing = txt_path.read_text(encoding="utf-8")
            if len(existing) > 1000:
                print(f"  [SKIP] {pdf_name} → already extracted ({len(existing):,} chars)")
                results[txt_name] = existing
                continue

        if not pdf_path.exists():
            print(f"  [MISS] {pdf_name} not found — place PDF in {pdf_dir}")
            continue

        print(f"\n  [EXTRACTING] {pdf_name}")
        try:
            text = extract_pdf(pdf_path)
            txt_path.write_text(text, encoding="utf-8")
            results[txt_name] = text
            report[pdf_name]  = {
                "status": "ok",
                "chars": len(text),
                "words": len(text.split()),
            }
            print(f"  [OK] {pdf_name} → {len(text):,} chars, {len(text.split()):,} words")
        except Exception as e:
            print(f"  [FAIL] {pdf_name}: {e}")
            report[pdf_name] = {"status": "failed", "error": str(e)}

    # Save extraction report
    report_path = output_dir / "extraction_report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\n  Extraction report saved → {report_path}")

    return results


if __name__ == "__main__":
    print("Extracting PDFs...")
    results = extract_all_pdfs()
    print(f"\nExtracted {len(results)} documents.")