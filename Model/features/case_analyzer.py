"""
features/case_analyzer.py

Evaluates case strength: STRONG / MEDIUM / WEAK
Based purely on retrieved legal provisions and stated evidence.
"""

from core.engine    import query_feature
from session.memory import get_or_create, add_turn, update_profile


def analyze_case(
    scenario:           str,
    available_evidence: list[str] = None,
    language:           str       = "english",
    session_id:         str       = None,
) -> dict:
    """
    Perform case strength analysis.

    Args:
        scenario:           Description of the legal situation
        available_evidence: List of evidence the user has
        language:           Response language
        session_id:         For session continuity
    """
    available_evidence = available_evidence or []
    sid, session       = get_or_create(session_id)

    # Build enriched query with evidence
    enriched = scenario
    if available_evidence:
        evidence_str = "\n".join(f"- {e}" for e in available_evidence)
        enriched += f"\n\nAVAILABLE EVIDENCE:\n{evidence_str}"

    # Include session history for context
    history_ctx = ""
    if session["history"]:
        from session.memory import build_history_context
        history_ctx = build_history_context(sid)

    result = query_feature(
        feature    = "analyzer",
        user_query = enriched,
        language   = language,
        top_k      = 5,
        extra      = {"additional_context": history_ctx} if history_ctx else {},
    )

    # Update session profile with analysis results
    if "strength" in result:
        update_profile(sid, "case_strength",   result["strength"])
    if "risks" in result:
        update_profile(sid, "risks",           result.get("risks", []))
    if "missing_evidence" in result:
        update_profile(sid, "missing_evidence", result.get("missing_evidence", []))

    add_turn(sid, "user",      f"[Analysis Request] {scenario[:200]}")
    add_turn(sid, "assistant", f"[Analysis Result] Strength: {result.get('strength')} "
             f"Score: {result.get('score')}")

    result["session_id"] = sid
    return result