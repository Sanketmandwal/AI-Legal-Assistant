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
TOP_K              = 5     # number of chunks to retrieve
SIMILARITY_THRESHOLD = 0.42  # below this → "no relevant provision found"
                              # tune after testing: too high = too strict

# ── LLM ────────────────────────────────────────────────────
GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "openai/gpt-oss-120b"   # fast + capable on Groq
# GROQ_MODEL = "openai/gpt-oss-120b"
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