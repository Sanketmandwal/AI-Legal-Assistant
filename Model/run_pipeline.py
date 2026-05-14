"""
run_pipeline.py

Single command to build the entire vector store from raw PDFs.

Usage:
    python run_pipeline.py

Place your PDFs in data/raw/ with these exact names:
    constitution.pdf
    bns.pdf
    bnss.pdf
    bsa.pdf
    contract_act.pdf
"""

import time
import json
from config import CHUNKS_PATH, VECTOR_DIR


def main():
    print("=" * 60)
    print("AI Legal Workflow Assistant — Data Pipeline")
    print("=" * 60)

    # Step 0: Extract PDFs → TXT
    print("\n[0/4] Extracting text from PDFs...")
    t0 = time.time()
    from pipeline.pdf_extractor import extract_all_pdfs
    extracted_docs = extract_all_pdfs()
    if not extracted_docs:
        print("\n[ERROR] No documents extracted. "
              "Place PDFs in data/raw/ and retry.")
        return
    print(f"      Done in {time.time() - t0:.1f}s — {len(extracted_docs)} docs")

    # Step 1: Clean
    print("\n[1/4] Cleaning documents...")
    t0 = time.time()
    from pipeline.cleaner import clean_all
    cleaned_docs = clean_all()
    if not cleaned_docs:
        print("[ERROR] Cleaning produced no output.")
        return
    print(f"      Done in {time.time() - t0:.1f}s")

    # Step 2: Chunk
    print("\n[2/4] Chunking into sections...")
    t0 = time.time()
    from pipeline.chunker import chunk_all
    chunks = chunk_all(cleaned_docs)
    if not chunks:
        print("[ERROR] Chunking produced no output.")
        return
    print(f"      Done in {time.time() - t0:.1f}s")

    # Step 3: Embed
    print("\n[3/4] Building embeddings (may take 3-10 min on CPU)...")
    t0 = time.time()
    from pipeline.embedder import build_embeddings
    VECTOR_DIR.mkdir(parents=True, exist_ok=True)
    chunk_dicts = json.loads(CHUNKS_PATH.read_text(encoding="utf-8"))
    embeddings = build_embeddings(chunk_dicts)
    print(f"      Done in {time.time() - t0:.1f}s")

    # Step 4: Index
    print("\n[4/4] Building FAISS index...")
    t0 = time.time()
    from pipeline.indexer import build_index
    build_index(embeddings, chunk_dicts)
    print(f"      Done in {time.time() - t0:.1f}s")

    print("\n" + "=" * 60)
    print(f"Pipeline complete. {len(chunk_dicts)} chunks indexed and ready.")
    print("Next: uvicorn api.main:app --reload")
    print("=" * 60)


if __name__ == "__main__":
    main()