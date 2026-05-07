"""
api/schemas.py

Pydantic models for all API endpoints.
Strict typing catches malformed requests before they reach the engine.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum


class RoleEnum(str, Enum):
    advisor    = "advisor"
    researcher = "researcher"
    drafter    = "drafter"


class LanguageEnum(str, Enum):
    english = "english"
    hindi   = "hindi"


# ── Shared base ────────────────────────────────────────────
class BaseRequest(BaseModel):
    language:   LanguageEnum = LanguageEnum.english
    session_id: Optional[str] = None   # for session memory


# ── /query ─────────────────────────────────────────────────
class QueryRequest(BaseRequest):
    query:      str                = Field(..., min_length=5, max_length=2000)
    role:       RoleEnum           = RoleEnum.advisor
    top_k:      int                = Field(default=5, ge=1, le=10)
    filter_act: Optional[str]      = None  # e.g. "BNS" to restrict search


class QueryResponse(BaseModel):
    summary:            str
    legal_provisions:   list[dict]
    explanation:        str
    recommended_actions: list[str]
    confidence:         dict
    limitations:        Optional[str]
    retrieved_sources:  list[dict]
    semantic_validation: dict
    query_meta:         dict
    disclaimer:         str


# ── /fir ───────────────────────────────────────────────────
class FIRRequest(BaseRequest):
    scenario:         str  = Field(..., min_length=20, max_length=3000,
                                   description="Describe what happened in detail")
    complainant_name: Optional[str] = None
    incident_date:    Optional[str] = None
    incident_place:   Optional[str] = None
    accused_description: Optional[str] = None


# ── /analyze ───────────────────────────────────────────────
class AnalyzeRequest(BaseRequest):
    scenario:         str  = Field(..., min_length=20, max_length=3000)
    available_evidence: Optional[list[str]] = []
    role:             RoleEnum = RoleEnum.researcher


# ── /workflow ──────────────────────────────────────────────
class WorkflowRequest(BaseRequest):
    scenario: str = Field(..., min_length=20, max_length=3000)
    goal:     str = Field(..., description="What the user wants to achieve",
                          example="File an FIR for assault")


# ── /risk ──────────────────────────────────────────────────
class RiskRequest(BaseRequest):
    scenario: str = Field(..., min_length=20, max_length=3000)


# ── /timeline ──────────────────────────────────────────────
class TimelineRequest(BaseRequest):
    scenario:  str = Field(..., min_length=20, max_length=3000)
    case_type: Optional[str] = None  # e.g. "criminal", "civil", "contract"


# ── /case-builder ──────────────────────────────────────────
class CaseBuilderRequest(BaseRequest):
    session_id:   str   = Field(..., description="Required for case builder — maintains state")
    user_message: str   = Field(..., min_length=2, max_length=2000)
    stage:        Optional[str] = None  # injected by session, not user


# ── /evidence ──────────────────────────────────────────────
class EvidenceRequest(BaseRequest):
    scenario:         str          = Field(..., min_length=20, max_length=3000)
    available_evidence: list[str]  = Field(..., description="List what evidence you have")


# ── Generic error response ──────────────────────────────────
class ErrorResponse(BaseModel):
    error:      str
    detail:     Optional[str] = None
    disclaimer: str