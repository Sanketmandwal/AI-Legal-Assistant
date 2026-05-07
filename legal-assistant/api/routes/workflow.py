from fastapi     import APIRouter
from api.schemas import WorkflowRequest, ErrorResponse
from features.workflow_guide import get_workflow
from config      import DISCLAIMER

router = APIRouter()

@router.post("/workflow", summary="Step-by-step legal process guidance")
async def workflow_endpoint(req: WorkflowRequest):
    try:
        return get_workflow(
            scenario   = req.scenario,
            goal       = req.goal,
            language   = req.language.value,
            session_id = req.session_id,
        )
    except Exception as e:
        return ErrorResponse(error="Workflow generation failed",
                             detail=str(e), disclaimer=DISCLAIMER)