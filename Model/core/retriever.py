"""
core/retriever.py  — v2 (hybrid retrieval)

Architecture:
  raw query
    → exact_section_lookup  (Section 103 / Article 21 direct hit)
    ↓  (no exact match)
    → generate_query_variants (original + 2 legal variants)
    → for each variant:
        → FAISS dense search (top RETRIEVAL_CANDIDATES)
        → BM25 sparse search (top RETRIEVAL_CANDIDATES)
    → RRF fusion of all ranked lists
    → cross-encoder rerank top-N → keep RERANK_TOP_K
    → RERANK_CONFIDENCE_THRESHOLD filter
    → optional neighboring-section context expansion
    → return list[RetrievedChunk] with full score provenance

Key design decisions:
  - No deduplication BEFORE ranking; chunks are grouped/merged only AFTER.
  - SIMILARITY_THRESHOLD is now a legacy alias; filtering is post-rerank.
  - score field on RetrievedChunk = rerank_score for LLM prompt compat.
  - BM25 index is built in-memory at startup (~1–3 s for 11k chunks).
  - Cross-encoder adds ~100–500 ms per query on CPU (50 candidates).
"""

import re
import logging
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional

import numpy as np
from sentence_transformers import SentenceTransformer, CrossEncoder

try:
    from rank_bm25 import BM25Okapi
    _BM25_AVAILABLE = True
except ImportError:
    _BM25_AVAILABLE = False
    logging.warning(
        "rank-bm25 not installed. BM25 retrieval disabled. "
        "Run: pip install rank-bm25==0.2.2"
    )

import faiss

from config import (
    EMBEDDING_MODEL,
    TOP_K,
    RETRIEVAL_CANDIDATES,
    RERANK_MODEL,
    RERANK_TOP_K,
    RERANK_CONFIDENCE_THRESHOLD,
    BM25_WEIGHT,
    RRF_K,
    QUERY_VARIANTS,
    CONTEXT_EXPANSION,
    CONTEXT_WINDOW,
    FAISS_INDEX,
    FAISS_META,
)
from pipeline.indexer import load_index

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────
# Data model
# ──────────────────────────────────────────────────────────────

@dataclass
class RetrievedChunk:
    """
    A single retrieved legal provision with full score provenance.

    score  = rerank_score (primary ranking signal, backward-compatible).
    dense_score, bm25_score, fusion_score, rerank_score carry the
    full pipeline trace for debugging and evaluation.
    """
    chunk_id:      str
    act_name:      str
    section_num:   str
    section_title: str
    text:          str
    source_file:   str

    # ── Score provenance ──────────────────────────────────────
    score:         float   # = rerank_score (kept for API compat)
    dense_score:   float = field(default=0.0)   # cosine similarity from FAISS
    bm25_score:    float = field(default=0.0)   # BM25 raw score (normalized 0-1)
    fusion_score:  float = field(default=0.0)   # RRF fusion score
    rerank_score:  float = field(default=0.0)   # cross-encoder logit


# ──────────────────────────────────────────────────────────────
# Tokenizer for BM25
# ──────────────────────────────────────────────────────────────

_STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "shall", "can",
    "of", "in", "to", "for", "on", "at", "by", "with", "from",
    "and", "or", "but", "not", "that", "this", "it", "its",
    "as", "if", "any", "all", "which", "who", "whom", "what",
}


def _tokenize(text: str) -> list[str]:
    """Simple whitespace + punctuation tokenizer for BM25."""
    tokens = re.findall(r"[a-zA-Z0-9]+", text.lower())
    return [t for t in tokens if t not in _STOP_WORDS and len(t) > 1]


# ──────────────────────────────────────────────────────────────
# Legal keyword variant table
# ──────────────────────────────────────────────────────────────

# (pattern, legal_expansion) — at most 2-3 expansions per query.
# Intentionally smaller/less aggressive than the old expand map.
_LEGAL_VARIANTS: list[tuple[re.Pattern, str]] = [
    (re.compile(r'\bhit|beat|slap|assault\b',    re.I), "assault causing hurt bodily harm"),
    (re.compile(r'\bkill|murder|homicide\b',      re.I), "culpable homicide murder"),
    (re.compile(r'\brape|sexual assault\b',        re.I), "sexual assault rape"),
    (re.compile(r'\btheft|steal|stole\b',          re.I), "theft dishonest misappropriation"),
    (re.compile(r'\bfraud|cheat|scam\b',           re.I), "cheating fraud misrepresentation"),
    (re.compile(r'\bbrib|corrupt\b',               re.I), "corruption bribery public servant"),
    (re.compile(r'\bcontract|agreement\b',         re.I), "contract agreement consideration"),
    (re.compile(r'\bbreach\b',                     re.I), "breach contract damages remedies"),
    (re.compile(r'\bfir|police complaint\b',       re.I), "first information report cognizable"),
    (re.compile(r'\barrest\b',                     re.I), "arrest warrant bail custody"),
    (re.compile(r'\bbail\b',                       re.I), "bail anticipatory surety"),
    (re.compile(r'\bevidence|proof|witness\b',     re.I), "evidence admissibility burden proof"),
    (re.compile(r'\bright|freedom|liberty\b',      re.I), "fundamental rights article constitution"),
    (re.compile(r'\bequality|discriminat\b',       re.I), "equality discrimination article 14"),
    (re.compile(r'\bpunishment|penalty|sentence\b',re.I), "punishment imprisonment fine"),
    (re.compile(r'\bthreaten|intimidat\b',         re.I), "criminal intimidation threat"),
    (re.compile(r'\bcoercio|undue influence\b',    re.I), "coercion undue influence void"),
    (re.compile(r'\bvoid|voidable|cancel\b',       re.I), "void voidable rescind terminate"),
]

# Act-specific keyword → act filter hint
_ACT_HINTS: dict[re.Pattern, str] = {
    re.compile(r'\bbns\b|nyaya sanhita\b',         re.I): "BNS",
    re.compile(r'\bbnss\b|suraksha sanhita\b',     re.I): "BNSS",
    re.compile(r'\bconstitution\b|article \d',     re.I): "Constitution",
    re.compile(r'\bcontract act\b',                re.I): "Contract",
    re.compile(r'\bsakshya\b|\bbsa\b',             re.I): "BSA",
}

# ──────────────────────────────────────────────────────────────
# Exact Section/Article detection patterns
# ──────────────────────────────────────────────────────────────
# Matches: "Section 103", "Article 21", "s. 15", "Sec. 103", "s 15"
_EXACT_SECTION_RE = re.compile(
    r'\b(?:section|sec\.?|article|art\.?|s\.)\s*(\d{1,3}[A-Z]?)\b',
    re.IGNORECASE
)


# ──────────────────────────────────────────────────────────────
# Main retriever class
# ──────────────────────────────────────────────────────────────

class LegalRetriever:
    """
    Singleton-style retriever. Initialize once at app startup,
    reuse across all requests.

    Retrieval pipeline:
      exact_section_lookup → (query_variants → dense + BM25 → RRF) → rerank → filter
    """

    def __init__(self):
        print("  [Retriever] Loading embedding model...")
        self.model = SentenceTransformer(EMBEDDING_MODEL)

        print("  [Retriever] Loading cross-encoder reranker...")
        self.reranker = CrossEncoder(RERANK_MODEL, max_length=512)

        print("  [Retriever] Loading FAISS index...")
        self.index, self.chunks = load_index()

        # Build lookup structures
        print("  [Retriever] Building BM25 index...")
        self._build_bm25_index()

        print("  [Retriever] Building section lookup map...")
        self._build_section_map()

        print(
            f"  [Retriever] Ready. "
            f"{self.index.ntotal} vectors | "
            f"{len(self.chunks)} chunks | "
            f"BM25={'OK' if _BM25_AVAILABLE else 'DISABLED'}"
        )

    # ── Index construction ─────────────────────────────────────

    def _build_bm25_index(self) -> None:
        """Build in-memory BM25 index from all chunk texts."""
        if not _BM25_AVAILABLE:
            self.bm25 = None
            return
        tokenized = [_tokenize(c["text"]) for c in self.chunks]
        self.bm25 = BM25Okapi(tokenized)

    def _build_section_map(self) -> None:
        """
        Build a map from normalized section number → list of chunk indices.

        Key format: "<normalized_num>"  e.g. "103", "21", "14a"
        We store all chunks for each section number (multiple sub-chunks).
        """
        self._section_map: dict[str, list[int]] = defaultdict(list)
        for idx, chunk in enumerate(self.chunks):
            raw = chunk.get("section_num", "")
            # Normalize: strip prefix, lowercase, remove spaces
            norm = re.sub(r'(?:section|article|sec\.?|art\.?)\s*', '', raw, flags=re.I)
            norm = norm.strip().lower()
            if norm:
                self._section_map[norm].append(idx)

    # ── Exact section lookup ───────────────────────────────────

    def _exact_section_lookup(
        self,
        query: str,
        filter_act: Optional[str],
    ) -> list[RetrievedChunk]:
        """
        Detect explicit section references (e.g. 'Section 103', 'Article 21')
        and directly return matching chunks from the metadata map.

        Returns an empty list if no explicit reference is detected.
        """
        matches = _EXACT_SECTION_RE.findall(query)
        if not matches:
            return []

        results = []
        seen: set[str] = set()

        for raw_num in matches:
            norm = raw_num.strip().lower()
            indices = self._section_map.get(norm, [])
            for idx in indices:
                chunk = self.chunks[idx]
                if filter_act and filter_act.lower() not in chunk["act_name"].lower():
                    continue
                cid = chunk["chunk_id"]
                if cid in seen:
                    continue
                seen.add(cid)
                results.append(RetrievedChunk(
                    chunk_id      = cid,
                    act_name      = chunk["act_name"],
                    section_num   = chunk["section_num"],
                    section_title = chunk["section_title"],
                    text          = chunk["text"],
                    source_file   = chunk["source_file"],
                    score         = 1.0,
                    dense_score   = 1.0,
                    bm25_score    = 1.0,
                    fusion_score  = 1.0,
                    rerank_score  = 1.0,
                ))

        return results

    # ── Query variant generation ───────────────────────────────

    def _generate_query_variants(self, raw_query: str) -> list[str]:
        """
        Produce up to QUERY_VARIANTS+1 query strings:
          [0] cleaned original
          [1] original + top legal keyword expansions (max 2 matches)
          [2] act-specific hint appended (if an act is detected)

        Intentionally lean — avoids the noise of the old aggressive regex map.
        """
        variants = [raw_query]  # always include original

        if QUERY_VARIANTS < 1:
            return variants

        # Variant 1: add legal keyword expansions (max 2)
        expansions = []
        for pattern, expansion in _LEGAL_VARIANTS:
            if pattern.search(raw_query):
                expansions.append(expansion)
            if len(expansions) >= 2:
                break

        if expansions:
            variants.append(raw_query + " " + " ".join(expansions))

        # Variant 2: act-specific suffix
        if QUERY_VARIANTS >= 2:
            for pattern, hint in _ACT_HINTS.items():
                if pattern.search(raw_query):
                    variants.append(raw_query + f" {hint} act provision")
                    break

        return variants

    # ── Dense search ───────────────────────────────────────────

    def _dense_search(
        self,
        query: str,
        top_n: int,
    ) -> list[tuple[int, float]]:
        """
        Embed query and run FAISS inner-product search.
        Returns list of (chunk_idx, cosine_score) sorted descending.
        """
        vec = self.model.encode(
            [query],
            normalize_embeddings=True,
            convert_to_numpy=True,
        ).astype(np.float32)

        n = min(top_n, self.index.ntotal)
        scores, indices = self.index.search(vec, n)
        scores  = scores[0]
        indices = indices[0]

        return [
            (int(idx), float(score))
            for idx, score in zip(indices, scores)
            if idx != -1
        ]

    # ── BM25 search ────────────────────────────────────────────

    def _bm25_search(
        self,
        query: str,
        top_n: int,
    ) -> list[tuple[int, float]]:
        """
        BM25 sparse retrieval.
        Scores are normalized to [0, 1] before fusion.
        Returns list of (chunk_idx, normalized_score) sorted descending.
        """
        if not _BM25_AVAILABLE or self.bm25 is None:
            return []

        tokens = _tokenize(query)
        if not tokens:
            return []

        raw_scores = self.bm25.get_scores(tokens)
        top_n = min(top_n, len(raw_scores))
        top_indices = np.argpartition(raw_scores, -top_n)[-top_n:]
        top_indices = top_indices[np.argsort(raw_scores[top_indices])[::-1]]

        max_score = raw_scores[top_indices[0]] if top_indices.size > 0 else 1.0
        if max_score == 0:
            return []

        return [
            (int(idx), float(raw_scores[idx] / max_score))
            for idx in top_indices
        ]

    # ── RRF fusion ─────────────────────────────────────────────

    def _rrf_merge(
        self,
        ranked_lists: list[list[tuple[int, float]]],
        weights: Optional[list[float]] = None,
    ) -> list[tuple[int, float]]:
        """
        Reciprocal Rank Fusion across multiple ranked lists.

        score(d) = Σ_i  w_i / (RRF_K + rank_i(d))

        where rank_i is 1-based. Lists with no weight default to 1.0.
        Returns merged [(idx, fusion_score)] sorted descending.
        """
        if weights is None:
            weights = [1.0] * len(ranked_lists)

        accum: dict[int, float] = defaultdict(float)
        for ranked_list, w in zip(ranked_lists, weights):
            for rank, (idx, _) in enumerate(ranked_list, start=1):
                accum[idx] += w / (RRF_K + rank)

        return sorted(accum.items(), key=lambda x: x[1], reverse=True)

    # ── Cross-encoder reranking ────────────────────────────────

    def _rerank(
        self,
        query: str,
        candidates: list[tuple[int, float]],  # (idx, fusion_score)
        top_n: int,
    ) -> list[tuple[int, float, float]]:
        """
        Score (query, passage) pairs with the cross-encoder.
        Returns [(idx, fusion_score, rerank_score)] sorted by rerank_score desc.

        We pass the raw chunk text (not enriched) to the reranker so it sees
        exactly the passage the LLM will see.
        """
        if not candidates:
            return []

        pairs = [
            (query, self.chunks[idx]["text"])
            for idx, _ in candidates
        ]
        rerank_scores = self.reranker.predict(pairs, show_progress_bar=False)

        combined = [
            (idx, fusion_score, float(rerank_scores[i]))
            for i, (idx, fusion_score) in enumerate(candidates)
        ]
        # Sort by rerank score; take top_n
        combined.sort(key=lambda x: x[2], reverse=True)
        return combined[:top_n]

    # ── Context expansion ──────────────────────────────────────

    def _expand_context(
        self,
        results: list[RetrievedChunk],
        window: int = CONTEXT_WINDOW,
    ) -> list[RetrievedChunk]:
        """
        For each top result, look up FAISS metadata at index ± window
        and append neighboring sections if they are not already present.

        Neighboring chunks get score = 0.0 (marked as context, not ranked hits).
        """
        existing_ids = {r.chunk_id for r in results}
        extras = []

        for chunk in results:
            # Find the FAISS index position for this chunk
            try:
                base_idx = next(
                    i for i, c in enumerate(self.chunks)
                    if c["chunk_id"] == chunk.chunk_id
                )
            except StopIteration:
                continue

            for delta in range(-window, window + 1):
                if delta == 0:
                    continue
                neighbor_idx = base_idx + delta
                if neighbor_idx < 0 or neighbor_idx >= len(self.chunks):
                    continue
                neighbor = self.chunks[neighbor_idx]
                if neighbor["chunk_id"] in existing_ids:
                    continue
                existing_ids.add(neighbor["chunk_id"])
                extras.append(RetrievedChunk(
                    chunk_id      = neighbor["chunk_id"],
                    act_name      = neighbor["act_name"],
                    section_num   = neighbor["section_num"],
                    section_title = neighbor["section_title"],
                    text          = neighbor["text"],
                    source_file   = neighbor["source_file"],
                    score         = 0.0,
                    dense_score   = 0.0,
                    bm25_score    = 0.0,
                    fusion_score  = 0.0,
                    rerank_score  = 0.0,
                ))

        return results + extras

    # ── Public API ─────────────────────────────────────────────

    def retrieve(
        self,
        query:      str,
        top_k:      int = TOP_K,
        threshold:  float = RERANK_CONFIDENCE_THRESHOLD,
        filter_act: Optional[str] = None,
    ) -> list[RetrievedChunk]:
        """
        Main retrieval method. Backward-compatible signature.

        Args:
            query:      User's question (raw)
            top_k:      Max final chunks to return (after reranking)
            threshold:  Post-rerank confidence cutoff (cross-encoder logit).
                        Defaults to RERANK_CONFIDENCE_THRESHOLD from config.
                        Set to e.g. -3.0 to suppress very low-confidence results.
            filter_act: Optional act name substring to restrict search.

        Returns:
            List[RetrievedChunk] sorted by rerank_score descending.
            Empty list → no relevant provision found.
        """
        # ── 0. Exact section lookup ────────────────────────────
        exact = self._exact_section_lookup(query, filter_act)
        if exact:
            logger.debug(
                f"[retrieve] Exact section match: "
                f"{[c.section_num for c in exact]}"
            )

            if len(exact) > 1:
                pairs = [
                    (query, c.text)
                    for c in exact
                ]

                rerank_scores = self.reranker.predict(
                    pairs,
                    show_progress_bar=False
                )

                scored = [
                    (c, float(score))
                    for c, score in zip(exact, rerank_scores)
                ]

                scored.sort(key=lambda x: x[1], reverse=True)

                exact = []

                for c, score in scored[:top_k]:
                    c.rerank_score = score
                    c.score = score
                    exact.append(c)

            return exact[:top_k]

        # ── 1. Generate query variants ─────────────────────────
        variants = self._generate_query_variants(query)
        logger.debug(f"[retrieve] Query variants: {variants}")

        # ── 2. Dense + BM25 search across all variants ─────────
        n_candidates = min(RETRIEVAL_CANDIDATES, self.index.ntotal)

        # Collect all ranked lists for RRF
        # dense: one list per variant, weight = 1.0 - BM25_WEIGHT
        # bm25 : one list per variant, weight = BM25_WEIGHT
        rrf_lists   = []
        rrf_weights = []

        # Per-chunk score tracking (for provenance)
        dense_score_map: dict[int, float] = {}
        bm25_score_map:  dict[int, float] = {}

        dense_w = 1.0 - BM25_WEIGHT
        bm25_w  = BM25_WEIGHT

        for variant in variants:
            d_results = self._dense_search(variant, n_candidates)
            b_results = self._bm25_search(variant, n_candidates)

            for idx, sc in d_results:
                dense_score_map[idx] = max(dense_score_map.get(idx, -1), sc)
            for idx, sc in b_results:
                bm25_score_map[idx] = max(bm25_score_map.get(idx, -1), sc)

            rrf_lists.append(d_results)
            rrf_weights.append(dense_w)

            if b_results:
                rrf_lists.append(b_results)
                rrf_weights.append(bm25_w)

        # ── 3. RRF merge ───────────────────────────────────────
        fused = self._rrf_merge(rrf_lists, rrf_weights)

        # Apply act filter before reranking (cheaper)
        if filter_act:
            fused = [
                (idx, sc) for idx, sc in fused
                if filter_act.lower() in self.chunks[idx]["act_name"].lower()
            ]

        # Limit candidates sent to reranker
        fused_top = fused[:n_candidates]

        # ── 4. Cross-encoder rerank ────────────────────────────
        reranked = self._rerank(query, fused_top, RERANK_TOP_K)

        # ── 5. Build final RetrievedChunk list ─────────────────
        results: list[RetrievedChunk] = []
        seen_chunk_ids: set[str] = set()

        for idx, fusion_score, rerank_score in reranked:
            # Post-rerank confidence filter
            if rerank_score < threshold:
                continue

            chunk = self.chunks[idx]
            cid   = chunk["chunk_id"]

            # Merge sub-chunks of same section only AFTER ranking
            # (keep all sub-chunks; the caller/LLM sees them as separate sources)
            if cid in seen_chunk_ids:
                continue
            seen_chunk_ids.add(cid)

            rc = RetrievedChunk(
                chunk_id      = cid,
                act_name      = chunk["act_name"],
                section_num   = chunk["section_num"],
                section_title = chunk["section_title"],
                text          = chunk["text"],
                source_file   = chunk["source_file"],
                dense_score   = round(dense_score_map.get(idx, 0.0), 4),
                bm25_score    = round(bm25_score_map.get(idx, 0.0), 4),
                fusion_score  = round(fusion_score, 6),
                rerank_score  = round(rerank_score, 4),
                score         = round(rerank_score, 4),   # backward compat
            )
            results.append(rc)

            if len(results) >= top_k:
                break

        # ── 6. Optional context expansion ─────────────────────
        if CONTEXT_EXPANSION and results:
            results = self._expand_context(results)

        logger.debug(
            f"[retrieve] Returned {len(results)} chunks | "
            f"top rerank_score={results[0].rerank_score if results else 'N/A'}"
        )
        return results

    # ── Formatting ─────────────────────────────────────────────

    def format_context(self, chunks: list[RetrievedChunk]) -> str:
        """
        Format retrieved chunks into a clean context block for the LLM prompt.
        Each chunk is labeled with its source so the LLM can cite correctly.
        Includes rerank score for the LLM to judge confidence.
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

    def debug_scores(self, chunks: list[RetrievedChunk]) -> str:
        """
        Return a human-readable score table for debugging / logging.
        """
        if not chunks:
            return "(no results)"
        header = f"{'#':<3} {'Section':<20} {'Dense':>7} {'BM25':>7} {'Fusion':>9} {'Rerank':>8}"
        lines = [header, "-" * len(header)]
        for i, c in enumerate(chunks, 1):
            lines.append(
                f"{i:<3} {c.section_num:<20} "
                f"{c.dense_score:>7.4f} {c.bm25_score:>7.4f} "
                f"{c.fusion_score:>9.6f} {c.rerank_score:>8.4f}"
            )
        return "\n".join(lines)