"""
core/semantic_validator.py

Detects semantic hallucination: cases where the LLM's interpretation
goes beyond or contradicts what the exact_quote actually says.

Two checks:
  1. Quote Presence Check  — does exact_quote actually appear in retrieved chunks?
  2. Drift Detection       — is the interpretation semantically consistent
                             with the exact_quote? (embedding cosine similarity)
"""

import re
from difflib import SequenceMatcher
from sentence_transformers import SentenceTransformer
import numpy as np

from core.retriever import RetrievedChunk
from config import EMBEDDING_MODEL

# Reuse the same model as retriever — loaded once at module level
# In production this is shared via the engine singleton
_model: SentenceTransformer = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model


def _fuzzy_match_score(quote: str, chunk_text: str) -> float:
    """
    Returns 0.0–1.0 indicating how much of the quote
    appears verbatim (or near-verbatim) in the chunk text.

    Uses SequenceMatcher — handles minor OCR differences,
    extra spaces, slightly different punctuation.
    """
    quote      = quote.strip().lower()
    chunk_text = chunk_text.lower()

    if not quote:
        return 0.0

    # Direct substring check first (fast path)
    if quote in chunk_text:
        return 1.0

    # Sliding window fuzzy match
    # Check if any window of chunk_text similar to quote
    words       = quote.split()
    window_size = len(words)
    chunk_words = chunk_text.split()

    best = 0.0
    for i in range(max(1, len(chunk_words) - window_size + 1)):
        window = " ".join(chunk_words[i : i + window_size + 5])
        score  = SequenceMatcher(None, quote, window).ratio()
        if score > best:
            best = score
        if best > 0.95:  # good enough, stop early
            break

    return best


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two 1D vectors."""
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def check_quote_presence(
    exact_quote:      str,
    retrieved_chunks: list[RetrievedChunk],
    min_score:        float = 0.60,
) -> dict:
    """
    Verify that exact_quote actually exists in at least one retrieved chunk.

    Returns:
        {
            "present": True/False,
            "best_score": 0.0-1.0,
            "best_chunk": chunk_id or None,
            "flag": "VERIFIED" / "SUSPICIOUS" / "NOT_FOUND"
        }
    """
    if not exact_quote or len(exact_quote.strip()) < 10:
        return {"present": False, "best_score": 0.0,
                "best_chunk": None, "flag": "EMPTY_QUOTE"}

    best_score = 0.0
    best_chunk = None

    for chunk in retrieved_chunks:
        score = _fuzzy_match_score(exact_quote, chunk.text)
        if score > best_score:
            best_score = score
            best_chunk = chunk.chunk_id

    flag = (
        "VERIFIED"   if best_score >= 0.85 else
        "SUSPICIOUS" if best_score >= min_score else
        "NOT_FOUND"
    )

    return {
        "present":    best_score >= min_score,
        "best_score": round(best_score, 3),
        "best_chunk": best_chunk,
        "flag":       flag,
    }


def check_interpretation_drift(
    exact_quote:    str,
    interpretation: str,
    max_drift:      float = 0.45,
) -> dict:
    """
    Measure semantic drift between exact_quote and interpretation.

    If interpretation is semantically distant from the quote,
    the LLM likely added meaning beyond the source text.

    Returns:
        {
            "similarity": 0.0-1.0,
            "drift": 0.0-1.0  (1 - similarity),
            "flag": "ACCEPTABLE" / "MODERATE_DRIFT" / "HIGH_DRIFT"
        }
    """
    if not exact_quote or not interpretation:
        return {"similarity": 0.0, "drift": 1.0, "flag": "MISSING_FIELDS"}

    model = _get_model()
    vecs  = model.encode(
        [exact_quote, interpretation],
        normalize_embeddings=True,
        convert_to_numpy=True,
    )
    similarity = _cosine_similarity(vecs[0], vecs[1])
    drift      = 1.0 - similarity

    flag = (
        "ACCEPTABLE"     if drift <= 0.30 else
        "MODERATE_DRIFT" if drift <= max_drift else
        "HIGH_DRIFT"
    )

    return {
        "similarity": round(similarity, 3),
        "drift":      round(drift, 3),
        "flag":       flag,
    }


def validate_semantic_grounding(
    response:         dict,
    retrieved_chunks: list[RetrievedChunk],
) -> dict:
    """
    Full semantic validation pass on an LLM response.

    For each legal_provision:
      1. Checks exact_quote is present in retrieved chunks
      2. Checks interpretation doesn't drift from exact_quote

    Adds semantic_validation block to response.
    Adjusts confidence score if problems found.
    Flags individual provisions with issues.
    """
    provisions = response.get("legal_provisions", [])

    if not provisions:
        response["semantic_validation"] = {
            "checked": 0,
            "issues":  [],
            "overall": "NO_PROVISIONS",
        }
        return response

    issues           = []
    high_drift_count = 0
    not_found_count  = 0

    for prov in provisions:
        exact_quote    = prov.get("exact_quote", "")
        interpretation = prov.get("interpretation", "")
        section        = prov.get("section", "unknown")

        # Check 1: Quote presence
        presence = check_quote_presence(exact_quote, retrieved_chunks)
        prov["_quote_check"] = presence

        if presence["flag"] == "NOT_FOUND":
            not_found_count += 1
            prov["_semantic_warning"] = (
                f"exact_quote for {section} not found in retrieved context "
                f"(match score: {presence['best_score']}). "
                "This may indicate the LLM fabricated or paraphrased the quote."
            )
            issues.append({
                "section": section,
                "type":    "QUOTE_NOT_FOUND",
                "detail":  f"Quote match score: {presence['best_score']}",
            })

        elif presence["flag"] == "SUSPICIOUS":
            prov["_semantic_warning"] = (
                f"exact_quote for {section} is only partially matched "
                f"(score: {presence['best_score']}). Verify manually."
            )
            issues.append({
                "section": section,
                "type":    "QUOTE_SUSPICIOUS",
                "detail":  f"Partial match score: {presence['best_score']}",
            })

        # Check 2: Interpretation drift (only if quote was found)
        if presence["flag"] in ("VERIFIED", "SUSPICIOUS") and interpretation:
            drift = check_interpretation_drift(exact_quote, interpretation)
            prov["_drift_check"] = drift

            if drift["flag"] == "HIGH_DRIFT":
                high_drift_count += 1
                prov["_semantic_warning"] = prov.get("_semantic_warning", "") + (
                    f" Interpretation diverges significantly from quoted text "
                    f"(drift: {drift['drift']}). "
                    "The explanation may contain claims beyond the source text."
                )
                issues.append({
                    "section": section,
                    "type":    "HIGH_INTERPRETATION_DRIFT",
                    "detail":  (
                        f"Semantic similarity between quote and interpretation: "
                        f"{drift['similarity']} (drift: {drift['drift']})"
                    ),
                })

            elif drift["flag"] == "MODERATE_DRIFT":
                issues.append({
                    "section": section,
                    "type":    "MODERATE_INTERPRETATION_DRIFT",
                    "detail":  f"Drift: {drift['drift']} — review interpretation",
                })

    # Overall semantic validation summary
    response["semantic_validation"] = {
        "checked":         len(provisions),
        "issues":          issues,
        "not_found_count": not_found_count,
        "high_drift_count": high_drift_count,
        "overall": (
            "CLEAN"    if not issues else
            "WARNING"  if (not_found_count == 0 and high_drift_count == 0) else
            "FLAGGED"
        ),
    }

    # Penalize confidence for semantic issues
    if high_drift_count > 0 or not_found_count > 0:
        conf  = response.get("confidence", {})
        level = conf.get("level", "MEDIUM")
        score = conf.get("score", 0.5)

        penalty = (not_found_count * 0.15) + (high_drift_count * 0.10)
        new_score = max(0.1, score - penalty)
        new_level = (
            "HIGH"   if new_score >= 0.75 else
            "MEDIUM" if new_score >= 0.45 else
            "LOW"
        )

        conf["score"]         = round(new_score, 3)
        conf["level"]         = new_level
        conf["justification"] = (
            conf.get("justification", "") +
            f" [Semantic check: {not_found_count} quote(s) unverified, "
            f"{high_drift_count} high-drift interpretation(s)]"
        )
        response["confidence"] = conf

    return response