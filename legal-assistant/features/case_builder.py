"""
features/case_builder.py  — v2
"""

import traceback
from core.engine import query, query_feature
from session.memory import (
    get_or_create, add_turn, advance_stage,
    get_next_question, update_profile,
    build_history_context, CASE_BUILDER_STAGES,
)
from config import DISCLAIMER


def _build_profile_query(profile: dict) -> str:
    parts = []
    if profile.get("incident_type"):
        parts.append(f"INCIDENT TYPE: {profile['incident_type']}")
    if profile.get("summary"):
        parts.append(f"FACTS: {profile['summary']}")
    parties = profile.get("parties", {})
    if isinstance(parties, dict) and parties.get("raw"):
        parts.append(f"PARTIES: {parties['raw']}")
    elif isinstance(parties, str) and parties:
        parts.append(f"PARTIES: {parties}")
    if profile.get("date_place"):
        parts.append(f"DATE/PLACE: {profile['date_place']}")
    evidence = profile.get("evidence", [])
    parts.append(f"AVAILABLE EVIDENCE: {', '.join(evidence) if evidence else 'None stated'}")
    if profile.get("prior_action"):
        parts.append(f"PRIOR ACTION: {profile['prior_action']}")
    if profile.get("goal"):
        parts.append(f"DESIRED OUTCOME: {profile['goal']}")
    return "\n\n".join(parts) if parts else "General legal matter requiring analysis."


def _safe_feature(feature: str, query_text: str,
                  language: str, extra: dict = None) -> dict:
    """Run a feature module. Never raises — returns error dict on failure."""
    try:
        result = query_feature(
            feature    = feature,
            user_query = query_text,
            language   = language,
            top_k      = 5,
            extra      = extra or {},
        )
        return result or {"error": f"{feature} returned empty"}
    except Exception as e:
        print(f"  [WARN] feature '{feature}' failed: {e}")
        traceback.print_exc()
        return {"error": str(e)}


def _extract_profile_info(stage: str, user_message: str, sid: str):
    import re
    if stage == "incident_type":
        update_profile(sid, "incident_type", user_message.strip())
    elif stage == "incident_details":
        update_profile(sid, "summary", user_message.strip())
    elif stage == "parties":
        update_profile(sid, "parties", {"raw": user_message.strip(),
                                         "complainant": "", "accused": ""})
    elif stage == "date_place":
        update_profile(sid, "date_place", user_message.strip())
    elif stage == "evidence":
        items = re.split(r'[\n,]+', user_message)
        ev    = [e.strip() for e in items if e.strip() and len(e.strip()) > 3]
        update_profile(sid, "evidence", ev if ev else [user_message.strip()])
    elif stage == "prior_action":
        update_profile(sid, "prior_action", user_message.strip())
    elif stage == "goal":
        update_profile(sid, "goal", user_message.strip())


def _generate_final_analysis(session: dict, language: str) -> dict:
    profile = session["case_profile"]
    sid     = session["session_id"]

    print(f"\n[CaseBuilder] Generating final analysis — session={sid}")

    full_query  = _build_profile_query(profile)
    history_ctx = build_history_context(sid, max_turns=10)
    extra       = {"additional_context": history_ctx} if history_ctx else {}

    print(f"  Query: {full_query[:120]}...")

    analysis = _safe_feature("analyzer",  full_query, language, extra)
    workflow  = _safe_feature("workflow",  full_query, language, extra)
    risks     = _safe_feature("risk",      full_query, language, extra)
    timeline  = _safe_feature("timeline",  full_query, language, extra)
    fir_data  = _safe_feature("fir",       full_query, language, extra)

    update_profile(sid, "stage", "complete")

    module_errors = {
        name: res["error"]
        for name, res in [("analyzer", analysis), ("workflow", workflow),
                           ("risk", risks), ("timeline", timeline), ("fir", fir_data)]
        if "error" in res
    }
    if module_errors:
        print(f"  Module errors: {module_errors}")

    return {
        "type":          "COMPLETE_CASE_PROFILE",
        "session_id":    sid,
        "case_profile":  profile,
        "case_strength": {
            "strength":   analysis.get("strength",          "UNKNOWN"),
            "score":      analysis.get("score",              0),
            "assessment": analysis.get("overall_assessment", ""),
            "strengths":  analysis.get("strengths",          []),
            "weaknesses": analysis.get("weaknesses",         []),
        },
        "workflow":           workflow.get("steps",             []),
        "risks":              risks.get("risks",                []),
        "timeline":           timeline.get("phases",            []),
        "fir_draft":          fir_data.get("draft",             None),
        "applicable_sections": fir_data.get("applicable_sections", []),
        "immediate_actions":  risks.get("immediate_actions",   []),
        "module_errors":      module_errors,
        "disclaimer":         DISCLAIMER,
    }


def process_case_builder_turn(
    session_id:   str,
    user_message: str,
    language:     str = "english",
) -> dict:

    sid, session  = get_or_create(session_id)
    profile       = session["case_profile"]
    current_stage = profile.get("stage", CASE_BUILDER_STAGES[0])

    print(f"\n[CaseBuilder] session={sid} stage={current_stage} "
          f"msg='{user_message[:50]}'")

    add_turn(sid, "user", user_message)

    # Already complete → follow-up query
    if current_stage == "complete":
        try:
            result = query(user_query=user_message, role="advisor",
                           language=language)
            result["session_id"] = sid
            result["type"]       = "FOLLOWUP_QUERY"
            add_turn(sid, "assistant", result.get("summary", "")[:200])
            return result
        except Exception as e:
            return {"type": "FOLLOWUP_QUERY", "session_id": sid,
                    "error": str(e), "disclaimer": DISCLAIMER}

    # Store this turn's info
    _extract_profile_info(current_stage, user_message, sid)

    # Advance stage
    advance_stage(sid)

    # Re-read session state after mutation
    session       = get_or_create(sid)[1]
    profile       = session["case_profile"]
    next_stage    = profile.get("stage", "complete")

    print(f"  → next_stage={next_stage}")

    # Final stage reached
    if next_stage == "complete":
        try:
            return _generate_final_analysis(session, language)
        except Exception as e:
            print(f"[ERROR] _generate_final_analysis: {e}")
            traceback.print_exc()
            return {
                "type":          "COMPLETE_CASE_PROFILE",
                "session_id":    sid,
                "error":         str(e),
                "case_profile":  profile,
                "case_strength": {"strength": "UNKNOWN", "score": 0,
                                   "assessment": "Analysis failed."},
                "workflow": [], "risks": [], "timeline": [],
                "disclaimer": DISCLAIMER,
            }

    # Return next question
    next_question = get_next_question(sid)
    stages_done   = CASE_BUILDER_STAGES.index(next_stage)
    total         = len(CASE_BUILDER_STAGES) - 1

    collected = {
        k: v for k, v in profile.items()
        if k not in ("stage", "completed_fields", "applicable_acts",
                     "missing_evidence", "risks")
        and v not in ("", [], {}, None)
    }

    response = {
        "type":             "QUESTION",
        "session_id":       sid,
        "stage":            next_stage,
        "progress":         f"{stages_done}/{total}",
        "question":         next_question,
        "collected_so_far": collected,
        "disclaimer":       DISCLAIMER,
    }

    add_turn(sid, "assistant", f"[{next_stage}] {next_question}")
    return response