"""
features/evidence_analyzer.py

Identifies evidence gaps and their impact on case strength.
Grounded in BSA (evidence law) provisions.
"""

from core.engine    import query_feature
from session.memory import get_or_create, add_turn, update_profile


def analyze_evidence(
    scenario:           str,
    available_evidence: list[str],
    language:           str = "english",
    session_id:         str = None,
) -> dict:

    sid, _ = get_or_create(session_id)

    evidence_str  = "\n".join(f"- {e}" for e in available_evidence) if available_evidence else "None provided"
    enriched      = f"{scenario}\n\nEVIDENCE CURRENTLY HELD:\n{evidence_str}"

    # Evidence questions grounded in BSA
    evidence_query = (
        enriched +
        "\n\nAnalyze: What evidence is missing? What evidence is admissible? "
        "What is the burden of proof? What would strengthen this case?"
    )

    result = query_feature(
        feature    = "analyzer",
        user_query = evidence_query,
        language   = language,
        top_k      = 5,
    )

    # Restructure for evidence-specific output
    evidence_result = {
        "available_evidence":  available_evidence,
        "missing_evidence":    result.get("missing_evidence", []),
        "admissibility_notes": [],
        "strength_impact":     result.get("overall_assessment", ""),
        "recommendations":     [],
        "retrieved_sources":   result.get("retrieved_sources", []),
        "semantic_validation": result.get("semantic_validation", {}),
        "disclaimer":          result.get("disclaimer", ""),
        "session_id":          sid,
    }

    # Extract admissibility notes from provisions
    for prov in result.get("legal_provisions", []):
        if any(word in prov.get("title", "").lower()
               for word in ["admissib", "evidence", "proof", "witness"]):
            evidence_result["admissibility_notes"].append({
                "section":     prov.get("section"),
                "act":         prov.get("act"),
                "note":        prov.get("interpretation", ""),
                "exact_quote": prov.get("exact_quote", ""),
            })

    # Pull recommendations from analysis
    evidence_result["recommendations"] = result.get("recommended_actions", [])

    update_profile(sid, "missing_evidence", evidence_result["missing_evidence"])
    add_turn(sid, "user",
             f"[Evidence Analysis] {len(available_evidence)} items | {scenario[:150]}")
    add_turn(sid, "assistant",
             f"[Evidence] Missing: {len(evidence_result['missing_evidence'])} items")

    return evidence_result