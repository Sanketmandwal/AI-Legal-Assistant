"""
core/validator.py  — v3
Validates both legal_provisions AND applicable_sections (used by FIR feature)
"""

import re
from config import DISCLAIMER
from core.semantic_validator import validate_semantic_grounding


def _normalize_section(s: str) -> str:
    return re.sub(r'\s+', ' ', s.strip().lower())


def _extract_numbers_from_text(text: str) -> set:
    nums = set()
    for match in re.finditer(
        r'(?:section|article|s\.)\s*(\d+[A-Za-z]?(?:\(\d+\))?)',
        text, re.IGNORECASE
    ):
        nums.add(match.group(1).lower())
    return nums


def _build_valid_sections(retrieved_chunks: list) -> set:
    """Build complete set of valid section references from retrieved chunks."""
    valid = set()
    for chunk in retrieved_chunks:
        # Full normalized form e.g. "section 317"
        valid.add(_normalize_section(chunk.section_num))
        # Number only e.g. "317"
        num_match = re.search(r'(\d+[A-Za-z]?)', chunk.section_num)
        if num_match:
            valid.add(num_match.group(1).lower())
        # Numbers mentioned inside chunk text
        valid.update(_extract_numbers_from_text(chunk.text))
    return valid


def _is_valid_section(section_str: str, valid_sections: set) -> bool:
    """Check if a cited section exists in retrieved context."""
    normalized = _normalize_section(section_str)
    num_match  = re.search(r'(\d+[A-Za-z]?(?:\(\d+\))?)', section_str)
    num_only   = num_match.group(1).lower() if num_match else ""
    return normalized in valid_sections or num_only in valid_sections


def validate_response(
    response:         dict,
    retrieved_chunks: list,
) -> dict:

    response["disclaimer"] = DISCLAIMER

    # Hard error passthrough
    if "error" in response and len(response) <= 3:
        return response

    valid_sections = _build_valid_sections(retrieved_chunks)

    # ── 1. Validate legal_provisions (standard Q&A) ────────
    hallucinated = []
    verified     = []

    for prov in response.get("legal_provisions", []):
        if _is_valid_section(prov.get("section", ""), valid_sections):
            prov["verified"] = True
            verified.append(prov)
        else:
            prov["verified"] = False
            prov["warning"]  = "Section not found in retrieved context."
            hallucinated.append(prov)

    response["legal_provisions"] = verified + hallucinated
    response["_validation"] = {
        "total_cited":           len(verified) + len(hallucinated),
        "verified_count":        len(verified),
        "hallucinated":          len(hallucinated),
        "hallucinated_sections": [p.get("section") for p in hallucinated],
    }

    # ── 2. Validate applicable_sections (FIR feature) ──────
    if "applicable_sections" in response:
        for sec in response["applicable_sections"]:
            sec["verified"] = _is_valid_section(
                sec.get("section", ""), valid_sections
            )

    # ── 3. Confidence adjustment ───────────────────────────
    if hallucinated:
        conf = response.get("confidence", {})
        conf["level"] = "LOW"
        conf["score"] = min(conf.get("score", 0.5), 0.3)
        conf["justification"] = (
            conf.get("justification", "") +
            f" [Citation check: {len(hallucinated)} unverified section(s)]"
        )
        response["confidence"] = conf

    if "confidence" in response:
        s = response["confidence"].get("score", 0.5)
        response["confidence"]["score"] = max(0.0, min(1.0, float(s)))

    # ── 4. Semantic validation ─────────────────────────────
    response = validate_semantic_grounding(response, retrieved_chunks)

    return response