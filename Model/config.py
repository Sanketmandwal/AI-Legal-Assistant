import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Paths ──────────────────────────────────────────────────
BASE_DIR        = Path(__file__).parent
DATA_RAW_DIR    = BASE_DIR / "data" / "raw"
DATA_PROC_DIR   = BASE_DIR / "data" / "processed"
VECTOR_DIR      = BASE_DIR / "vector_store"

CHUNKS_PATH     = DATA_PROC_DIR / "chunks.json"
METADATA_PATH   = DATA_PROC_DIR / "metadata.json"
FAISS_INDEX     = VECTOR_DIR / "index.faiss"
FAISS_META      = VECTOR_DIR / "index_metadata.pkl"

# ── Embedding model ────────────────────────────────────────
# all-MiniLM-L6-v2: 80MB, fast on CPU, good for legal text
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
EMBEDDING_DIM   = 384

# ── Chunking ───────────────────────────────────────────────
# Primary: split at section boundaries
# Secondary: if section > MAX_CHUNK_TOKENS, split further with overlap
MAX_CHUNK_TOKENS   = 400
OVERLAP_TOKENS     = 80   # overlap between secondary splits

# ── Retrieval ──────────────────────────────────────────────

# ── Stage 1: Candidate pool (dense + sparse) ────────────────
TOP_K                  = 5      # final chunks returned to the LLM
RETRIEVAL_CANDIDATES   = 50     # FAISS + BM25 candidates before reranking
                                 # (increase for longer docs / lower recall)

# ── Stage 2: Fusion ─────────────────────────────────────────
BM25_WEIGHT            = 0.4    # BM25 share in RRF score (0.0 = dense only)
RRF_K                  = 60     # standard RRF constant (60 is the canonical default)

# ── Stage 3: Reranking ──────────────────────────────────────
RERANK_MODEL           = "cross-encoder/ms-marco-MiniLM-L-6-v2"
                                 # ~80 MB, CPU-friendly, ships with sentence-transformers
RERANK_TOP_K           = 8      # how many to keep after reranking (5–10 recommended)

# ── Stage 4: Post-rerank confidence filter ──────────────────
# Replaces the old hard cosine threshold.
# 0.0  = no filter (return everything from reranker)
# Tune up (e.g. -2.0) to suppress clearly irrelevant results.
# Cross-encoder logit scores are typically in range [-10, 10].
RERANK_CONFIDENCE_THRESHOLD = 0.0

# Legacy alias kept so existing code that imports SIMILARITY_THRESHOLD still works
SIMILARITY_THRESHOLD = RERANK_CONFIDENCE_THRESHOLD

# ── Query expansion ─────────────────────────────────────────
QUERY_VARIANTS         = 2      # extra query variants (0 = original only)

# ── Context expansion ────────────────────────────────────────
CONTEXT_EXPANSION      = False  # if True, also return adjacent sections as context
CONTEXT_WINDOW         = 1      # ±N sections around each top result

# ── LLM ────────────────────────────────────────────────────
GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
# GROQ_MODEL = "llama-3.3-70b-versatile"   # fast + capable on Groq
# GROQ_MODEL = "openai/gpt-oss-120b"
GROQ_MODEL = "groq/compound-mini"
MAX_TOKENS    = 1500
TEMPERATURE   = 0.1   # low temp = more deterministic = fewer hallucinations

# ── Source document registry ───────────────────────────────
# Maps filename → display name used in citations
SOURCE_REGISTRY = {
    "constitution.txt":   "Constitution of India",
    "bns.txt":            "Bharatiya Nyaya Sanhita (BNS)",
    "bnss.txt":           "Bharatiya Nagarik Suraksha Sanhita (BNSS)",
    "bsa.txt":            "Bharatiya Sakshya Adhiniyam (BSA)",
    "contract_act.txt":   "Indian Contract Act, 1872",
}

# ── Disclaimer ─────────────────────────────────────────────
DISCLAIMER = (
    "⚠️ This system is for educational purposes only and does not constitute "
    "legal advice. Please consult a qualified lawyer before making any legal decisions."
)