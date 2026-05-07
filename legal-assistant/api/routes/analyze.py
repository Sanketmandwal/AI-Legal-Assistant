from fastapi     import APIRouter
from api.schemas import AnalyzeRequest, EvidenceRequest, ErrorResponse
from features.case_analyzer    import analyze_case
from features.evidence_analyzer import analyze_evidence
from config      import DISCLAIMER

router = APIRouter()

@router.post("/analyze", summary="Case strength analysis")
async def analyze_endpoint(req: AnalyzeRequest):
    try:
        return analyze_case(
            scenario           = req.scenario,
            available_evidence = req.available_evidence,
            language           = req.language.value,
            session_id         = req.session_id,
        )
    except Exception as e:
        return ErrorResponse(error="Analysis failed",
                             detail=str(e), disclaimer=DISCLAIMER)

@router.post("/evidence", summary="Evidence gap analysis")
async def evidence_endpoint(req: EvidenceRequest):
    try:
        return analyze_evidence(
            scenario           = req.scenario,
            available_evidence = req.available_evidence,
            language           = req.language.value,
            session_id         = req.session_id,
        )
    except Exception as e:
        return ErrorResponse(error="Evidence analysis failed",
                             detail=str(e), disclaimer=DISCLAIMER)