"""
core/retriever.py

WHY: The retriever is the grounding mechanism of the entire system.
It converts a user query to an embedding, finds the most similar
legal provisions in FAISS, and applies a similarity threshold.

CRITICAL DESIGN DECISION — Threshold:
  If similarity < SIMILARITY_THRESHOLD, we return empty results.
  The prompt builder then forces the LLM to say "no relevant provision found."
  This is the primary hallucination prevention mechanism.

Query flow:
  raw query
    → reformulate (make it more "legal-sounding")
    → embed
    → FAISS search (top K)
    → threshold filter
    → return ranked chunks with scores
"""

import re
import numpy as np
from dataclasses import dataclass
from sentence_transformers import SentenceTransformer

import faiss

from config import (
    EMBEDDING_MODEL, TOP_K,
    SIMILARITY_THRESHOLD, FAISS_INDEX, FAISS_META
)
from pipeline.indexer import load_index


@dataclass
class RetrievedChunk:
    chunk_id:      str
    act_name:      str
    section_num:   str
    section_title: str
    text:          str
    score:         float   # cosine similarity [0, 1]
    source_file:   str


class LegalRetriever:
    """
    Singleton-style retriever. Initialize once at app startup,
    reuse across all requests.
    """

    def __init__(self):
        print("  Loading embedding model...")
        self.model = SentenceTransformer(EMBEDDING_MODEL)

        print("  Loading FAISS index...")
        self.index, self.chunks = load_index()

        print(f"  Retriever ready. {self.index.ntotal} provisions indexed.")

    # ── Query Reformulation ────────────────────────────────
    def _reformulate_query(self, raw_query: str) -> str:
        """
        Convert casual user language into legal-domain language
        before embedding. This improves retrieval relevance
        without needing a separate LLM call.

        Examples:
          "my boss didn't pay me" → "employer failure to pay wages labour law"
          "someone hit me"        → "assault causing hurt bodily harm section"
          "fake contract"         → "void agreement misrepresentation fraud contract"
        """
        q = raw_query.lower().strip()

        # Term expansion map: casual phrase → legal terms
        # Add more as you test and find retrieval gaps
        expansions = {
            # Violence / hurt
            r'\bhit\b|\bbeat\b|\bslap\b':           'assault causing hurt bodily harm',
            r'\bkill\b|\bmurder\b':                  'culpable homicide murder death',
            r'\bthreaten\b|\bthreat\b':              'criminal intimidation threat',
            r'\brake\b|\bsexual assault\b':          'sexual assault rape section',

            # Property
            r'\bsteal\b|\btheft\b|\bstole\b':       'theft dishonest misappropriation',
            r'\bfraud\b|\bcheat\b|\bscam\b':        'cheating fraud dishonest misrepresentation',
            r'\bbribe\b|\bcorruption\b':             'corruption bribery public servant',

            # Contract
            r'\bcontract\b|\bagreement\b':           'contract agreement consideration void voidable',
            r'\bbreak.*contract\b|\bbreach\b':       'breach contract damages remedies',
            r'\bforced.*sign\b|\bcoercion\b':        'coercion undue influence void contract',

            # FIR / police
            r'\bfir\b|\bcomplaint.*police\b':        'first information report cognizable offence',
            r'\barrest\b':                           'arrest warrant bail custody',
            r'\bbail\b':                             'bail anticipatory bail surety',

            # Evidence
            r'\bproof\b|\bevidence\b|\bwitness\b':  'evidence witness admissibility burden of proof',
            r'\bconfession\b':                       'confession admissibility voluntary statement',

            # Rights
            r'\bright\b|\bfreedom\b|\bliberty\b':   'fundamental rights article constitution',
            r'\bequality\b|\bdiscriminat\b':         'equality discrimination article 14 15 16',

            # Add these to the expansions dict in _reformulate_query:

            r'\bkill\b|\bmurder\b|\bhomicide\b': 'culpable homicide murder death punishment BNS',

            r'\bpenalty\b|\bpunishment\b|\bsentence\b': 'punishment imprisonment fine death penalty section',

            r'\billegal\b|\bunlawful\b|\boffence\b|\bcrime\b': 'offence cognizable punishable section act',

            r'\bagreement\b|\bdeal\b|\bcontract\b': 'contract agreement consideration void voidable enforceable',

            r'\bcancel\b|\bterminate\b|\bvoid\b': 'void voidable rescind terminate contract agreement',
        }

        reformulated = raw_query  # start with original (preserve case for output)
        additions = []

        for pattern, expansion in expansions.items():
            if re.search(pattern, q):
                additions.append(expansion)

        if additions:
            reformulated = raw_query + " " + " ".join(additions)

        return reformulated

    # ── Core Retrieval ─────────────────────────────────────
    def retrieve(
        self,
        query: str,
        top_k: int = TOP_K,
        threshold: float = SIMILARITY_THRESHOLD,
        filter_act: str = None,   # optional: restrict to one act
    ) -> list[RetrievedChunk]:
        """
        Main retrieval method.

        Args:
            query:      User's question (raw)
            top_k:      Max number of chunks to return
            threshold:  Min similarity score (chunks below this are dropped)
            filter_act: Optional act name to restrict search

        Returns:
            List of RetrievedChunk, sorted by score descending.
            Empty list means no relevant provision found.
        """
        # 1. Reformulate
        reformulated = self._reformulate_query(query)

        # 2. Embed (normalize=True for cosine similarity)
        query_vec = self.model.encode(
            [reformulated],
            normalize_embeddings=True,
            convert_to_numpy=True,
        ).astype(np.float32)

        # 3. FAISS search — get more than top_k so we can filter
        search_k = min(top_k * 3, self.index.ntotal)
        scores, indices = self.index.search(query_vec, search_k)

        # scores shape: (1, search_k), indices shape: (1, search_k)
        scores  = scores[0]
        indices = indices[0]

        # 4. Build results with threshold filtering
        results = []
        seen_sections = set()  # deduplicate: skip same section if already retrieved

        for score, idx in zip(scores, indices):
            if idx == -1:           # FAISS returns -1 for empty slots
                continue
            if float(score) < threshold:
                continue

            chunk = self.chunks[idx]
            section_key = f"{chunk['source_file']}_{chunk['section_num']}"

            # Skip duplicate sections (secondary chunks of the same section)
            if section_key in seen_sections:
                continue
            seen_sections.add(section_key)

            # Optional act filter
            if filter_act and filter_act.lower() not in chunk['act_name'].lower():
                continue

            results.append(RetrievedChunk(
                chunk_id      = chunk['chunk_id'],
                act_name      = chunk['act_name'],
                section_num   = chunk['section_num'],
                section_title = chunk['section_title'],
                text          = chunk['text'],
                score         = float(score),
                source_file   = chunk['source_file'],
            ))

            if len(results) >= top_k:
                break

        # Sort by score descending (FAISS already does this, but be safe)
        results.sort(key=lambda x: x.score, reverse=True)
        return results

    def format_context(self, chunks: list[RetrievedChunk]) -> str:
        """
        Format retrieved chunks into a clean context block
        for injection into the LLM prompt.

        Each chunk is labeled with its source so the LLM
        can cite it correctly.
        """
        if not chunks:
            return "NO_RELEVANT_PROVISIONS_FOUND"

        parts = []
        for i, chunk in enumerate(chunks, 1):
            title_part = f" — {chunk.section_title}" if chunk.section_title else ""
            header = (
                f"[SOURCE {i}]\n"
                f"Act: {chunk.act_name}\n"
                f"Provision: {chunk.section_num}{title_part}\n"
                f"Relevance Score: {chunk.score:.3f}\n"
                f"---\n"
                f"{chunk.text}"
            )
            parts.append(header)

        return "\n\n".join(parts)