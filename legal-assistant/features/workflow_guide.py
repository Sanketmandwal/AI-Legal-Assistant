"""
features/workflow_guide.py

Generates step-by-step legal process guidance.
Each step is grounded in BNSS procedural provisions.
"""

from core.engine    import query_feature
from session.memory import get_or_create, add_turn


def get_workflow(
    scenario:  str,
    goal:      str,
    language:  str = "english",
    session_id: str = None,
) -> dict:
    """
    Generate a step-by-step legal workflow.

    Args:
        scenario:  What happened
        goal:      What the user wants to achieve
        language:  Response language
        session_id: For session continuity
    """
    sid, session = get_or_create(session_id)

    combined_query = f"{scenario}\n\nGOAL: {goal}"

    history_ctx = ""
    if session["history"]:
        from session.memory import build_history_context
        history_ctx = build_history_context(sid)

    result = query_feature(
        feature    = "workflow",
        user_query = combined_query,
        language   = language,
        top_k      = 6,
        extra      = {"additional_context": history_ctx} if history_ctx else {},
    )

    add_turn(sid, "user",      f"[Workflow Request] Goal: {goal} | {scenario[:150]}")
    add_turn(sid, "assistant", f"[Workflow] Steps: {len(result.get('steps', []))}")

    result["session_id"] = sid
    return result