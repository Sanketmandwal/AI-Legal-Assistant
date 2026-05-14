from fastapi     import APIRouter
from api.schemas import RiskRequest, TimelineRequest, CaseBuilderRequest, ErrorResponse
from features.risk_detector      import detect_risks
from features.timeline_generator import generate_timeline
from features.case_builder       import process_case_builder_turn
from config      import DISCLAIMER

router = APIRouter()

@router.post("/risk", summary="Legal risk detection")
async def risk_endpoint(req: RiskRequest):
    try:
        return detect_risks(
            scenario   = req.scenario,
            language   = req.language.value,
            session_id = req.session_id,
        )
    except Exception as e:
        return ErrorResponse(error="Risk detection failed",
                             detail=str(e), disclaimer=DISCLAIMER)

@router.post("/timeline", summary="Legal timeline estimation")
async def timeline_endpoint(req: TimelineRequest):
    try:
        return generate_timeline(
            scenario   = req.scenario,
            case_type  = req.case_type,
            language   = req.language.value,
            session_id = req.session_id,
        )
    except Exception as e:
        return ErrorResponse(error="Timeline generation failed",
                             detail=str(e), disclaimer=DISCLAIMER)

@router.post("/case-builder", summary="Guided multi-turn case building")
async def case_builder_endpoint(req: CaseBuilderRequest):
    try:
        print(f"\n[API] /case-builder — session={req.session_id} "
              f"msg='{req.user_message[:60]}'")
        result = process_case_builder_turn(
            session_id   = req.session_id,
            user_message = req.user_message,
            language     = req.language.value,
        )
        print(f"[API] /case-builder → type={result.get('type')} "
              f"stage={result.get('stage','—')}")
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ErrorResponse(
            error      = "Case builder failed",
            detail     = str(e),
            disclaimer = DISCLAIMER,
        )