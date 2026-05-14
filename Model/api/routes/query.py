from fastapi  import APIRouter, HTTPException
from api.schemas import QueryRequest, ErrorResponse
from core.engine import query as engine_query
from config      import DISCLAIMER

router = APIRouter()

@router.post(
    "/query",
    summary     = "General legal Q&A",
    description = "Ask any legal question grounded in the indexed Indian law corpus.",
)
async def legal_query(req: QueryRequest):
    try:
        result = engine_query(
            user_query = req.query,
            role       = req.role.value,
            language   = req.language.value,
            top_k      = req.top_k,
            filter_act = req.filter_act,
        )
        if "error" in result and len(result) <= 3:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        return ErrorResponse(
            error      = "Query processing failed",
            detail     = str(e),
            disclaimer = DISCLAIMER,
        )