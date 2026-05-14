"""
api/main.py

FastAPI application entry point.
Engine is initialized once at startup and shared across all requests.
"""

from contextlib import asynccontextmanager
from fastapi    import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import query, fir, analyze, workflow, risk
from core.engine import initialize
from config      import DISCLAIMER


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load FAISS index + embedding model into memory
    print("Starting up Legal Assistant API...")
    initialize()
    print("API ready.")
    yield
    # Shutdown (nothing to clean up for in-process store)
    print("Shutting down.")


app = FastAPI(
    title       = "AI Legal Workflow Assistant",
    description = (
        "RAG-powered legal assistant grounded in Indian law. "
        "Covers Constitution, BNS, BNSS, BSA, and Indian Contract Act.\n\n"
        f"**{DISCLAIMER}**"
    ),
    version     = "1.0.0",
    lifespan    = lifespan,
)

# CORS — allow all origins for development
# Restrict to your frontend domain in production
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# Register routes
app.include_router(query.router,    tags=["Core"])
app.include_router(fir.router,      tags=["Features"])
app.include_router(analyze.router,  tags=["Features"])
app.include_router(workflow.router, tags=["Features"])
app.include_router(risk.router,     tags=["Features"])


@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/", tags=["System"])
async def root():
    return {
        "name":      "AI Legal Workflow Assistant",
        "endpoints": [
            "POST /query",
            "POST /fir",
            "GET  /fir/checklist",
            "POST /analyze",
            "POST /evidence",
            "POST /workflow",
            "POST /risk",
            "POST /timeline",
            "POST /case-builder",
            "GET  /health",
        ],
        "docs":       "/docs",
        "disclaimer": DISCLAIMER,
    }