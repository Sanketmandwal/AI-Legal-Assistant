"""
pipeline/embedder.py

WHY: We use SentenceTransformers to convert each chunk into a
dense vector. We batch-encode for CPU efficiency and save
the matrix as a numpy array for FAISS.
"""

import json
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer

from config import (
    EMBEDDING_MODEL, EMBEDDING_DIM,
    CHUNKS_PATH, VECTOR_DIR
)

EMBEDDINGS_PATH = VECTOR_DIR / "embeddings.npy"


def load_chunks() -> list[dict]:
    if not CHUNKS_PATH.exists():
        raise FileNotFoundError(
            f"Chunks not found at {CHUNKS_PATH}. "
            "Run the cleaner and chunker first."
        )
    return json.loads(CHUNKS_PATH.read_text(encoding="utf-8"))


def _enrich_text(chunk: dict) -> str:
    """
    Build a richer embedding text by prepending structured metadata.

    WHY: Embedding "Section 103 — Murder | Bharatiya Nyaya Sanhita (BNS) | <body>"
    instead of just the raw body text dramatically improves retrieval for queries
    that mention section numbers, act names, or legal headings directly.

    Format: "<act_name> | <section_num> — <section_title> | <body_text>"
    """
    parts = [chunk.get("act_name", "")]
    sec = chunk.get("section_num", "")
    title = chunk.get("section_title", "")
    if sec and title:
        parts.append(f"{sec} — {title}")
    elif sec:
        parts.append(sec)
    parts.append(chunk.get("text", ""))
    return " | ".join(p for p in parts if p)


def build_embeddings(chunks: list[dict]) -> np.ndarray:
    """
    Encode all chunk texts into embedding vectors.
    Returns numpy array of shape (N, EMBEDDING_DIM).

    NOTE: We embed enriched text (Act + Section + Title + Body) rather than
    the raw body alone. This requires a FAISS index rebuild if upgrading from
    the previous version.
    """
    print(f"  Loading model: {EMBEDDING_MODEL}")
    model = SentenceTransformer(EMBEDDING_MODEL)

    texts = [_enrich_text(c) for c in chunks]
    print(f"  Encoding {len(texts)} enriched chunks in batches...")

    # batch_size=64 is a good balance for CPU
    # show_progress_bar=True shows a tqdm progress bar
    embeddings = model.encode(
        texts,
        batch_size=64,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True,  # L2 normalize → cosine similarity via dot product
    )

    print(f"  Embedding matrix shape: {embeddings.shape}")
    assert embeddings.shape == (len(texts), EMBEDDING_DIM), (
        f"Expected ({len(texts)}, {EMBEDDING_DIM}), got {embeddings.shape}"
    )

    # Save to disk
    VECTOR_DIR.mkdir(parents=True, exist_ok=True)
    np.save(EMBEDDINGS_PATH, embeddings)
    print(f"  Saved embeddings → {EMBEDDINGS_PATH}")

    return embeddings


if __name__ == "__main__":
    print("Building embeddings...")
    chunks = load_chunks()
    embeddings = build_embeddings(chunks)
    print("Done.")