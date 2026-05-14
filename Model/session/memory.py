"""
session/memory.py — v2
"""

import uuid
from datetime import datetime
from typing import Optional

_store: dict[str, dict] = {}

CASE_BUILDER_STAGES = [
    "incident_type",
    "incident_details",
    "parties",
    "date_place",
    "evidence",
    "prior_action",
    "goal",
    "complete",
]

STAGE_QUESTIONS = {
    "incident_type":    "What type of legal issue are you facing? (e.g. assault, theft, fraud, contract dispute, property dispute)",
    "incident_details": "Please describe what happened in as much detail as possible.",
    "parties":          "Who are the people involved? Describe the complainant and the accused/other party.",
    "date_place":       "When and where did the incident occur? Provide date, time, and location.",
    "evidence":         "What evidence do you currently have? (e.g. documents, witnesses, photos, messages)",
    "prior_action":     "Have you already reported this to police or any authority? If yes, what happened?",
    "goal":             "What outcome are you seeking? (e.g. file FIR, seek compensation, cancel a contract)",
    "complete":         None,
}


def _empty_profile() -> dict:
    return {
        "summary":          "",
        "incident_type":    "",
        "parties":          {"complainant": "", "accused": ""},
        "applicable_acts":  [],
        "evidence":         [],
        "missing_evidence": [],
        "risks":            [],
        "stage":            CASE_BUILDER_STAGES[0],
        "completed_fields": [],
    }


def create_session(sid: str = None) -> str:
    new_id = sid if sid else str(uuid.uuid4())
    _store[new_id] = {
        "session_id":  new_id,
        "created_at":  datetime.utcnow().isoformat(),
        "last_active": datetime.utcnow().isoformat(),
        "history":     [],
        "case_profile": _empty_profile(),
    }
    return new_id


def get_session(session_id: str) -> Optional[dict]:
    return _store.get(session_id)


def get_or_create(session_id: str = None) -> tuple[str, dict]:
    """
    Return existing session or create new one.
    If session_id provided and exists → return it.
    If session_id provided but not found → create under that id.
    If no session_id → generate new UUID.
    """
    if session_id and session_id in _store:
        _store[session_id]["last_active"] = datetime.utcnow().isoformat()
        return session_id, _store[session_id]

    new_id = create_session(session_id)
    return new_id, _store[new_id]


def add_turn(session_id: str, role: str, content: str):
    if session_id not in _store:
        return
    _store[session_id]["history"].append({
        "role":      role,
        "content":   content,
        "timestamp": datetime.utcnow().isoformat(),
    })
    _store[session_id]["last_active"] = datetime.utcnow().isoformat()


def update_profile(session_id: str, field: str, value):
    if session_id not in _store:
        return
    _store[session_id]["case_profile"][field] = value
    fields = _store[session_id]["case_profile"].setdefault("completed_fields", [])
    if field not in fields:
        fields.append(field)


def advance_stage(session_id: str):
    if session_id not in _store:
        return
    profile = _store[session_id]["case_profile"]
    current = profile.get("stage", CASE_BUILDER_STAGES[0])
    try:
        idx = CASE_BUILDER_STAGES.index(current)
        next_idx = idx + 1
        if next_idx < len(CASE_BUILDER_STAGES):
            profile["stage"] = CASE_BUILDER_STAGES[next_idx]
    except ValueError:
        profile["stage"] = "complete"


def get_next_question(session_id: str) -> Optional[str]:
    session = get_session(session_id)
    if not session:
        return None
    stage = session["case_profile"].get("stage", CASE_BUILDER_STAGES[0])
    return STAGE_QUESTIONS.get(stage)


def build_history_context(session_id: str, max_turns: int = 6) -> str:
    session = get_session(session_id)
    if not session:
        return ""
    history = session["history"][-max_turns:]
    if not history:
        return ""
    lines = ["PREVIOUS CONVERSATION:"]
    for turn in history:
        role    = "User" if turn["role"] == "user" else "Assistant"
        content = turn["content"][:300]
        lines.append(f"{role}: {content}")
    return "\n".join(lines)