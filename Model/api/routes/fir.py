from fastapi     import APIRouter
from api.schemas import FIRRequest, ErrorResponse
from features.fir_generator import generate_fir, get_fir_checklist
from config      import DISCLAIMER

router = APIRouter()

@router.post("/fir", summary="Generate FIR / complaint draft")
async def fir_endpoint(req: FIRRequest):
    try:
        return generate_fir(
            scenario            = req.scenario,
            language            = req.language.value,
            session_id          = req.session_id,
            complainant_name    = req.complainant_name,
            incident_date       = req.incident_date,
            incident_place      = req.incident_place,
            accused_description = req.accused_description,
        )
    except Exception as e:
        return ErrorResponse(error="FIR generation failed",
                             detail=str(e), disclaimer=DISCLAIMER)

@router.get("/fir/checklist", summary="Pre-FIR filing checklist")
async def fir_checklist():
    return get_fir_checklist()