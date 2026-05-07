"""
features/risk_detector.py

Identifies legal risks and violations in a scenario.
Severity: HIGH / MEDIUM / LOW
"""

from core.engine    import query_feature
from session.memory import get_or_create, add_turn, update_profile


def detect_risks(
    scenario:   str,
    language:   str = "english",
    session_id: str = None,
) -> dict:

    sid, session = get_or_create(session_id)

    history_ctx = ""
    if session["history"]:
        from session.memory import build_history_context
        history_ctx = build_history_context(sid)

    result = query_feature(
        feature    = "risk",
        user_query = scenario,
        language   = language,
        top_k      = 6,
        extra      = {"additional_context": history_ctx} if history_ctx else {},
    )

    # Store risks in session
    if "risks" in result:
        update_profile(sid, "risks", result["risks"])

    add_turn(sid, "user",      f"[Risk Detection] {scenario[:200]}")
    add_turn(sid, "assistant",
             f"[Risks Found] {len(result.get('risks', []))} risk(s) identified")

    result["session_id"] = sid
    return result