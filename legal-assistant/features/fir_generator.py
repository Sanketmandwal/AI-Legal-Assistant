"""
features/fir_generator.py  — v3
Uses query_feature() instead of direct _retriever/_llm access.
Safer, simpler, no import timing issues.
"""

from core.engine    import query_feature
from session.memory import get_or_create, add_turn
from config         import DISCLAIMER


def generate_fir(
    scenario:            str,
    language:            str = "english",
    session_id:          str = None,
    complainant_name:    str = None,
    incident_date:       str = None,
    incident_place:      str = None,
    accused_description: str = None,
) -> dict:

    # Build enriched query with all available details
    parts = [scenario]
    if complainant_name:
        parts.append(f"Complainant name: {complainant_name}")
    if incident_date:
        parts.append(f"Date of incident: {incident_date}")
    if incident_place:
        parts.append(f"Place of incident: {incident_place}")
    if accused_description:
        parts.append(f"Accused: {accused_description}")

    # Add explicit retrieval hints so FAISS finds the right sections
    parts.append(
        "Legal context needed: theft house breaking stolen property "
        "FIR filing procedure cognizable offence police complaint"
    )

    enriched = "\n".join(parts)

    sid, _ = get_or_create(session_id)

    # query_feature handles retrieval + prompt + LLM + validation internally
    result = query_feature(
        feature    = "fir",
        user_query = enriched,
        language   = language,
        top_k      = 7,
    )

    # Fill placeholders in draft if details were provided
    draft = result.get("draft", "")
    if draft:
        replacements = {
            "[Complainant Name]":  complainant_name or "[Complainant Name]",
            "[User's Name]":       complainant_name or "[Complainant Name]",
            "[Date of incident]":  incident_date    or "[Date of incident]",
            "[Date]":              incident_date    or "[Date]",
            "[Place of incident]": incident_place   or "[Place of incident]",
            "[City/District]":     incident_place   or "[City/District]",
            "[Police Station Name]": f"Police Station, {incident_place}" if incident_place else "[Police Station Name]",
            "[Accused details]":   accused_description or "[Accused details]",
            "[Name/Description]":  accused_description or "[Name/Description]",
        }
        for placeholder, value in replacements.items():
            draft = draft.replace(placeholder, value)
        result["draft"] = draft

    add_turn(sid, "user",      f"[FIR] {scenario[:200]}")
    add_turn(sid, "assistant",
             f"[FIR] sections={[s.get('section') for s in result.get('applicable_sections', [])]}"
             f" draft_len={len(result.get('draft', ''))}")

    result["session_id"] = sid
    return result


def get_fir_checklist() -> dict:
    return {
        "before_filing": [
            "Write down all incident details with exact dates and times",
            "Collect names and addresses of witnesses if any",
            "Preserve any physical evidence — do not clean the scene",
            "Photograph any injuries or property damage",
            "Save all digital evidence (messages, emails, call logs)",
        ],
        "at_police_station": [
            "Request to file FIR under Section 173 BNSS",
            "Insist on a written acknowledgment with FIR number",
            "Get a free copy of the FIR — it is your right under BNSS",
            "If police refuse, send complaint to Superintendent of Police",
            "Last resort: file complaint before Magistrate under Section 175 BNSS",
        ],
        "after_filing": [
            "Keep your FIR copy safe — needed for all future proceedings",
            "Note down FIR number, police station name, and officer name",
            "Follow up within 15 days if no action is taken",
        ],
        "disclaimer": DISCLAIMER,
    }