"""
features/timeline_generator.py

Generates expected legal timeline grounded in BNSS procedural provisions.
"""

from core.engine    import query_feature
from session.memory import get_or_create, add_turn


def generate_timeline(
    scenario:   str,
    case_type:  str = None,
    language:   str = "english",
    session_id: str = None,
) -> dict:

    sid, session = get_or_create(session_id)

    enriched = scenario
    if case_type:
        enriched += f"\nCase type: {case_type}"

    history_ctx = ""
    if session["history"]:
        from session.memory import build_history_context
        history_ctx = build_history_context(sid)

    result = query_feature(
        feature    = "timeline",
        user_query = enriched,
        language   = language,
        top_k      = 5,
        extra      = {"additional_context": history_ctx} if history_ctx else {},
    )

    add_turn(sid, "user",      f"[Timeline Request] {scenario[:150]}")
    add_turn(sid, "assistant",
             f"[Timeline] {len(result.get('phases', []))} phases | "
             f"Total: {result.get('total_estimate', 'Unknown')}")

    result["session_id"] = sid
    return result