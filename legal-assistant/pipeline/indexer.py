"""
pipeline/indexer.py

WHY: FAISS enables fast approximate nearest-neighbour search
over our embedding matrix without a database server.

Index type: IndexFlatIP (exact inner product)
  - Since embeddings are L2-normalized, inner product = cosine similarity
  - "Flat" means exact search (no approximation)
  - For ~50k chunks this is instant on CPU; scale to IVF if needed later
"""

import pickle
import numpy as np
import faiss

from config import (
    EMBEDDING_DIM, FAISS_INDEX, FAISS_META, VECTOR_DIR
)
from pipeline.embedder import EMBEDDINGS_PATH, load_chunks


def build_index(embeddings: np.ndarray, chunks: list[dict]) -> faiss.Index:
    """
    Build FAISS index and save alongside chunk metadata.
    """
    VECTOR_DIR.mkdir(parents=True, exist_ok=True)

    n_vectors = embeddings.shape[0]
    print(f"  Building FAISS IndexFlatIP with {n_vectors} vectors (dim={EMBEDDING_DIM})")

    # IndexFlatIP: exact inner-product search
    # Because embeddings are L2-normalized, this equals cosine similarity
    index = faiss.IndexFlatIP(EMBEDDING_DIM)

    # FAISS requires float32
    vecs = embeddings.astype(np.float32)
    index.add(vecs)

    print(f"  Index contains {index.ntotal} vectors")

    # Save FAISS index
    faiss.write_index(index, str(FAISS_INDEX))
    print(f"  Saved FAISS index → {FAISS_INDEX}")

    # Save chunk metadata alongside the index
    # We store the full chunks list; index position i → chunks[i]
    with open(FAISS_META, "wb") as f:
        pickle.dump(chunks, f)
    print(f"  Saved metadata → {FAISS_META}")

    return index


def load_index() -> tuple[faiss.Index, list[dict]]:
    """
    Load existing FAISS index and chunk metadata.
    Called at API startup — kept in memory for the lifetime of the server.
    """
    if not FAISS_INDEX.exists():
        raise FileNotFoundError(
            f"FAISS index not found at {FAISS_INDEX}. "
            "Run the full pipeline first: python run_pipeline.py"
        )

    index = faiss.read_index(str(FAISS_INDEX))
    with open(FAISS_META, "rb") as f:
        chunks = pickle.load(f)

    print(f"  Loaded FAISS index: {index.ntotal} vectors")
    print(f"  Loaded {len(chunks)} chunk metadata records")
    return index, chunks


if __name__ == "__main__":
    print("Building FAISS index...")
    chunks = load_chunks()
    embeddings = np.load(EMBEDDINGS_PATH)
    build_index(embeddings, chunks)
    print("Done.")