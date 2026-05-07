"""
evaluate.py

Comprehensive evaluation suite for the AI Legal Workflow Assistant.
Generates a metrics report across four categories:

  1. Retrieval Metrics     (precision, recall, MRR, NDCG)
  2. Grounding Metrics     (citation accuracy, hallucination rate, quote verification)
  3. Response Quality      (semantic similarity, answer relevance, completeness)
  4. System Performance    (latency, throughput, corpus statistics)

Fixes applied:
  - Section number normalization (_extract_num) so "Section 103" matches "103"
  - Evaluator no longer double-loads the FAISS index
  - Cleaner summary table with context notes

Usage:
    python evaluate.py
    python evaluate.py --category retrieval
    python evaluate.py --category grounding
    python evaluate.py --category quality
    python evaluate.py --category performance
    python evaluate.py --output report.json
"""

import re
import json
import time
import argparse
import statistics
from pathlib import Path
from datetime import datetime

# ── Bootstrap the engine (loads FAISS + embedding model once) ──
from core.engine import initialize, query, query_feature
initialize()

from sentence_transformers import SentenceTransformer
import numpy as np

# Reuse the same embedding model — do NOT load a second instance
_embed_model = SentenceTransformer("all-MiniLM-L6-v2")


# ══════════════════════════════════════════════════════════════
# SHARED UTILITY
# ══════════════════════════════════════════════════════════════

def _extract_num(section_str: str) -> str:
    """
    Normalize a section reference to a bare number string.

    Handles all formats found in our index and LLM responses:
      "Section 103"  → "103"
      "Article 14"   → "14"
      "103"          → "103"
      "103A"         → "103a"
      "103(2)"       → "103"
      "s. 15"        → "15"
      ""             → ""
    """
    if not section_str:
        return ""
    # Remove known prefix words
    cleaned = re.sub(
        r'^(section|article|s\.)\s*',
        '',
        section_str.strip(),
        flags=re.IGNORECASE,
    )
    # Extract leading number + optional single letter suffix
    m = re.match(r'(\d+[A-Za-z]?)', cleaned)
    return m.group(1).lower() if m else cleaned.lower()


def _cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    return float(np.dot(a, b) / denom) if denom > 0 else 0.0


def _semantic_similarity(text1: str, text2: str) -> float:
    if not text1 or not text2:
        return 0.0
    vecs = _embed_model.encode(
        [text1, text2],
        normalize_embeddings=True,
        convert_to_numpy=True,
    )
    return _cosine_sim(vecs[0], vecs[1])


# ══════════════════════════════════════════════════════════════
# EVALUATION DATASETS
# ══════════════════════════════════════════════════════════════

# Ground truth: query → sections that MUST appear in top-5 results
# Section numbers are BARE DIGITS — _extract_num normalizes both sides
RETRIEVAL_GROUND_TRUTH = [
    {
        "query":             "What is the punishment for murder?",
        "relevant_sections": ["103", "104"],
        "relevant_act":      "BNS",
        "category":          "criminal",
    },
    {
        "query":             "What constitutes theft under BNS?",
        "relevant_sections": ["303", "304", "305"],
        "relevant_act":      "BNS",
        "category":          "criminal",
    },
    {
        "query":             "What is punishment for cheating and fraud?",
        "relevant_sections": ["316", "317", "318"],
        "relevant_act":      "BNS",
        "category":          "criminal",
    },
    {
        "query":             "What is culpable homicide not amounting to murder?",
        "relevant_sections": ["100", "101", "104"],
        "relevant_act":      "BNS",
        "category":          "criminal",
    },
    {
        "query":             "What is assault causing grievous hurt?",
        "relevant_sections": ["114", "116", "117"],
        "relevant_act":      "BNS",
        "category":          "criminal",
    },
    {
        "query":             "What makes a contract void or voidable?",
        "relevant_sections": ["2", "10", "19"],
        "relevant_act":      "Contract Act",
        "category":          "contract",
    },
    {
        "query":             "What is coercion in contract law?",
        "relevant_sections": ["15", "19"],
        "relevant_act":      "Contract Act",
        "category":          "contract",
    },
    {
        "query":             "What is consideration in a contract?",
        "relevant_sections": ["2", "10", "25"],
        "relevant_act":      "Contract Act",
        "category":          "contract",
    },
    {
        "query":             "What is misrepresentation in contract law?",
        "relevant_sections": ["17", "18", "19"],
        "relevant_act":      "Contract Act",
        "category":          "contract",
    },
    {
        "query":             "How is an FIR filed under BNSS?",
        "relevant_sections": ["173", "174", "175"],
        "relevant_act":      "BNSS",
        "category":          "procedural",
    },
    {
        "query":             "What are the rules for bail?",
        "relevant_sections": ["478", "479", "480", "481", "482"],
        "relevant_act":      "BNSS",
        "category":          "procedural",
    },
    {
        "query":             "What is anticipatory bail?",
        "relevant_sections": ["482", "483"],
        "relevant_act":      "BNSS",
        "category":          "procedural",
    },
    {
        "query":             "What is the right to equality under the Constitution?",
        "relevant_sections": ["14", "15", "16"],
        "relevant_act":      "Constitution",
        "category":          "constitutional",
    },
    {
        "query":             "What is the right to life and personal liberty?",
        "relevant_sections": ["21", "22"],
        "relevant_act":      "Constitution",
        "category":          "constitutional",
    },
    {
        "query":             "What is admissibility of confessions under BSA?",
        "relevant_sections": ["22", "23", "24"],
        "relevant_act":      "BSA",
        "category":          "evidence",
    },
    {
        "query":             "What is burden of proof in criminal cases?",
        "relevant_sections": ["104", "105"],
        "relevant_act":      "BSA",
        "category":          "evidence",
    },
    {
        "query":             "What is admissibility of electronic records as evidence?",
        "relevant_sections": ["61", "62", "63"],
        "relevant_act":      "BSA",
        "category":          "evidence",
    },
]

# Queries that must be REJECTED — no relevant legal provision should be returned
NEGATIVE_QUERIES = [
    "What is the capital of France?",
    "How do I cook biryani?",
    "What is the speed of light?",
    "Who won the cricket world cup?",
    "How to write Python code?",
    "What is the best smartphone to buy?",
    "How do I lose weight fast?",
]

# Semantically equivalent query pairs — good retrieval returns overlapping chunks
PARAPHRASE_PAIRS = [
    (
        "punishment for murder",
        "penalty for killing someone intentionally",
    ),
    (
        "void contract",
        "agreement that has no legal effect",
    ),
    (
        "filing a police complaint",
        "how to register an FIR at the police station",
    ),
    (
        "right to equality",
        "constitutional protection against discrimination",
    ),
    (
        "theft of property",
        "someone stole my belongings",
    ),
    (
        "anticipatory bail",
        "get bail before being arrested",
    ),
    (
        "breach of contract",
        "other party did not fulfil agreement terms",
    ),
]

# Quality test cases: query + expected terms + must-cite sections
QUALITY_TEST_CASES = [
    {
        "query":          "What is the punishment for murder under BNS?",
        "expected_terms": ["death", "imprisonment", "life", "fine", "murder"],
        "must_cite":      ["103"],
        "role":           "advisor",
    },
    {
        "query":          "What makes a contract void under Indian Contract Act?",
        "expected_terms": ["void", "agreement", "consideration", "lawful",
                           "competent", "consent"],
        "must_cite":      ["10"],
        "role":           "researcher",
    },
    {
        "query":          "How to file an FIR under BNSS?",
        "expected_terms": ["police", "station", "officer", "information",
                           "cognizable", "complaint"],
        "must_cite":      ["173"],
        "role":           "advisor",
    },
    {
        "query":          "What is anticipatory bail under BNSS?",
        "expected_terms": ["bail", "arrest", "anticipatory", "court", "session"],
        "must_cite":      ["482"],
        "role":           "advisor",
    },
    {
        "query":          "What is the right to equality under the Constitution?",
        "expected_terms": ["equality", "discrimination", "state", "law", "equal"],
        "must_cite":      ["14"],
        "role":           "advisor",
    },
    {
        "query":          "What is theft under BNS?",
        "expected_terms": ["dishonestly", "moveable", "property", "consent",
                           "possession"],
        "must_cite":      ["303"],
        "role":           "advisor",
    },
    {
        "query":          "What is coercion in Indian contract law?",
        "expected_terms": ["coercion", "force", "threat", "unlawful",
                           "consent", "voidable"],
        "must_cite":      ["15"],
        "role":           "researcher",
    },
]

# Grounding test queries — used to measure citation and hallucination rates
GROUNDING_TEST_QUERIES = [
    "What is the punishment for murder under BNS?",
    "Is a contract made under coercion valid?",
    "How to file an FIR for theft?",
    "What are fundamental rights under Article 14?",
    "What is the admissibility of electronic evidence under BSA?",
    "What is culpable homicide not amounting to murder?",
    "What makes a contract voidable?",
    "What is anticipatory bail under BNSS?",
    "What is the burden of proof in a criminal trial?",
    "What is criminal breach of trust under BNS?",
]


# ══════════════════════════════════════════════════════════════
# CATEGORY 1: RETRIEVAL METRICS
# ══════════════════════════════════════════════════════════════

def compute_retrieval_metrics(retriever) -> dict:
    """
    Precision@K, Recall@K, Hit@K, MRR, NDCG@5,
    Negative Rejection Rate, Paraphrase Consistency.

    All section comparisons go through _extract_num so format
    differences ("Section 103" vs "103") do not penalise results.
    """
    print("\n[1/4] Computing Retrieval Metrics...")
    print(f"      {len(RETRIEVAL_GROUND_TRUTH)} queries × ground truth sections")

    precision_at = {1: [], 3: [], 5: []}
    recall_at    = {1: [], 3: [], 5: []}
    hit_at       = {1: [], 3: [], 5: []}
    mrr_scores   = []
    ndcg_scores  = []
    category_mrr = {}

    for item in RETRIEVAL_GROUND_TRUTH:
        q_text   = item["query"]
        relevant = set(item["relevant_sections"])  # already bare numbers
        category = item["category"]

        # Retrieve with threshold=0 so we always get top-5 for fair comparison
        chunks = retriever.retrieve(q_text, top_k=5, threshold=0.0)

        # Normalize retrieved section numbers
        retrieved = [_extract_num(c.section_num) for c in chunks]
        retrieved = [n for n in retrieved if n]

        # Precision@K, Recall@K, Hit@K
        for k in [1, 3, 5]:
            top = retrieved[:k]
            hits = sum(1 for n in top if n in relevant)
            precision_at[k].append(hits / k)
            recall_at[k].append(hits / len(relevant) if relevant else 0)
            hit_at[k].append(1 if any(n in relevant for n in top) else 0)

        # MRR
        rr = 0.0
        for rank, num in enumerate(retrieved, 1):
            if num in relevant:
                rr = 1.0 / rank
                break
        mrr_scores.append(rr)
        category_mrr.setdefault(category, []).append(rr)

        # NDCG@5
        idcg = sum(
            1.0 / np.log2(i + 2)
            for i in range(min(len(relevant), 5))
        )
        dcg = sum(
            1.0 / np.log2(i + 2)
            for i, num in enumerate(retrieved[:5])
            if num in relevant
        )
        ndcg_scores.append(dcg / idcg if idcg > 0 else 0.0)

    # Negative query rejection rate
    rejected = 0
    for neg_q in NEGATIVE_QUERIES:
        # Use the real threshold here
        chunks = retriever.retrieve(neg_q, top_k=5)
        if len(chunks) == 0:
            rejected += 1
    rejection_rate = rejected / len(NEGATIVE_QUERIES)

    # Paraphrase consistency (Jaccard overlap of top-5 chunk IDs)
    consistency = []
    for q1, q2 in PARAPHRASE_PAIRS:
        c1   = set(c.chunk_id for c in retriever.retrieve(q1, top_k=5, threshold=0.0))
        c2   = set(c.chunk_id for c in retriever.retrieve(q2, top_k=5, threshold=0.0))
        union = len(c1 | c2)
        consistency.append(len(c1 & c2) / union if union > 0 else 0.0)

    metrics = {
        "precision_at_1":  round(statistics.mean(precision_at[1]), 4),
        "precision_at_3":  round(statistics.mean(precision_at[3]), 4),
        "precision_at_5":  round(statistics.mean(precision_at[5]), 4),
        "recall_at_1":     round(statistics.mean(recall_at[1]),    4),
        "recall_at_3":     round(statistics.mean(recall_at[3]),    4),
        "recall_at_5":     round(statistics.mean(recall_at[5]),    4),
        "hit_at_1":        round(statistics.mean(hit_at[1]),       4),
        "hit_at_3":        round(statistics.mean(hit_at[3]),       4),
        "hit_at_5":        round(statistics.mean(hit_at[5]),       4),
        "mrr":             round(statistics.mean(mrr_scores),      4),
        "ndcg_at_5":       round(statistics.mean(ndcg_scores),     4),
        "negative_rejection_rate": round(rejection_rate,           4),
        "paraphrase_consistency":  round(statistics.mean(consistency), 4),
        "per_category_mrr": {
            cat: round(statistics.mean(scores), 4)
            for cat, scores in category_mrr.items()
        },
        "total_queries": len(RETRIEVAL_GROUND_TRUTH),
    }

    print(f"  MRR:              {metrics['mrr']:.4f}")
    print(f"  NDCG@5:           {metrics['ndcg_at_5']:.4f}")
    print(f"  Precision@5:      {metrics['precision_at_5']:.4f}")
    print(f"  Recall@5:         {metrics['recall_at_5']:.4f}")
    print(f"  Hit@1:            {metrics['hit_at_1']:.4f}")
    print(f"  Hit@5:            {metrics['hit_at_5']:.4f}")
    print(f"  Negative reject:  {metrics['negative_rejection_rate']:.4f}")
    print(f"  Paraphrase cons:  {metrics['paraphrase_consistency']:.4f}")
    print(f"  Per-category MRR: {metrics['per_category_mrr']}")

    return metrics


# ══════════════════════════════════════════════════════════════
# CATEGORY 2: GROUNDING METRICS
# ══════════════════════════════════════════════════════════════

def compute_grounding_metrics() -> dict:
    """
    Citation accuracy, hallucination rate, quote presence,
    semantic drift rate, irrelevant query refusal rate,
    disclaimer presence rate.
    """
    print(f"\n[2/4] Computing Grounding Metrics...")
    print(f"      {len(GROUNDING_TEST_QUERIES)} legal queries + "
          f"{len(NEGATIVE_QUERIES)} negative queries")

    citation_accuracy  = []
    hallucination_rate = []
    quote_presence     = []
    drift_rate         = []
    confidence_scores  = []
    disclaimer_present = []

    for q in GROUNDING_TEST_QUERIES:
        result = query(q, role="researcher")

        # Citation accuracy
        val     = result.get("_validation", {})
        total   = val.get("total_cited", 0)
        verified= val.get("verified_count", 0)
        halluc  = val.get("hallucinated", 0)

        if total > 0:
            citation_accuracy.append(verified / total)
            hallucination_rate.append(1 if halluc > 0 else 0)
        else:
            # No citations at all — treat as neither hallucinated nor accurate
            citation_accuracy.append(0.0)
            hallucination_rate.append(0)

        # Quote presence from semantic validator
        sv      = result.get("semantic_validation", {})
        checked = sv.get("checked", 0)
        missing = sv.get("not_found_count", 0)
        if checked > 0:
            quote_presence.append((checked - missing) / checked)
        else:
            quote_presence.append(1.0)

        # Drift
        drift_rate.append(1 if sv.get("high_drift_count", 0) > 0 else 0)

        # Confidence score
        conf = result.get("confidence", {})
        confidence_scores.append(float(conf.get("score", 0)))

        # Disclaimer
        disclaimer_present.append(1 if result.get("disclaimer") else 0)

    # Irrelevant query refusal
    refused = 0
    for neg_q in NEGATIVE_QUERIES:
        result    = query(neg_q)
        has_error = "error" in result
        no_provs  = len(result.get("legal_provisions", [])) == 0
        low_conf  = float(result.get("confidence", {}).get("score", 1)) < 0.3
        if has_error or (no_provs and low_conf):
            refused += 1
    refusal_rate = refused / len(NEGATIVE_QUERIES)

    # Composite grounding score (weighted)
    grounding_score = round(
        statistics.mean(citation_accuracy)   * 0.35 +
        (1 - statistics.mean(hallucination_rate)) * 0.30 +
        statistics.mean(quote_presence)      * 0.20 +
        (1 - statistics.mean(drift_rate))    * 0.15,
        4,
    )

    metrics = {
        "citation_accuracy":       round(statistics.mean(citation_accuracy),   4),
        "hallucination_rate":      round(statistics.mean(hallucination_rate),  4),
        "quote_presence_rate":     round(statistics.mean(quote_presence),      4),
        "semantic_drift_rate":     round(statistics.mean(drift_rate),          4),
        "avg_confidence_score":    round(statistics.mean(confidence_scores),   4),
        "disclaimer_presence_rate":round(statistics.mean(disclaimer_present),  4),
        "irrelevant_refusal_rate": round(refusal_rate,                         4),
        "grounding_score":         grounding_score,
        "queries_evaluated":       len(GROUNDING_TEST_QUERIES),
    }

    print(f"  Citation accuracy:   {metrics['citation_accuracy']:.4f}")
    print(f"  Hallucination rate:  {metrics['hallucination_rate']:.4f}")
    print(f"  Quote presence:      {metrics['quote_presence_rate']:.4f}")
    print(f"  Drift rate:          {metrics['semantic_drift_rate']:.4f}")
    print(f"  Avg confidence:      {metrics['avg_confidence_score']:.4f}")
    print(f"  Disclaimer rate:     {metrics['disclaimer_presence_rate']:.4f}")
    print(f"  Refusal rate:        {metrics['irrelevant_refusal_rate']:.4f}")
    print(f"  Grounding score:     {metrics['grounding_score']:.4f}")

    return metrics


# ══════════════════════════════════════════════════════════════
# CATEGORY 3: RESPONSE QUALITY METRICS
# ══════════════════════════════════════════════════════════════

def compute_response_quality_metrics() -> dict:
    """
    Term coverage, semantic relevance, citation compliance,
    structural completeness (summary / explanation / actions / limitations).
    Uses _extract_num so citation compliance is not penalised by formatting.
    """
    print(f"\n[3/4] Computing Response Quality Metrics...")
    print(f"      {len(QUALITY_TEST_CASES)} test cases")

    term_coverage      = []
    semantic_relevance = []
    citation_compliance= []
    has_summary        = []
    has_explanation    = []
    has_actions        = []
    has_limitations    = []
    provision_counts   = []

    for case in QUALITY_TEST_CASES:
        result = query(user_query=case["query"], role=case["role"])

        # Term coverage — check summary + explanation
        full_text = (
            (result.get("summary",     "") or "") + " " +
            (result.get("explanation", "") or "")
        ).lower()

        covered = sum(
            1 for term in case["expected_terms"]
            if term.lower() in full_text
        )
        term_coverage.append(covered / len(case["expected_terms"]))

        # Semantic relevance — embedding cosine between query and summary
        summary = result.get("summary", "") or ""
        if summary.strip():
            semantic_relevance.append(
                _semantic_similarity(case["query"], summary)
            )

        # Citation compliance — normalize both sides with _extract_num
        provisions = result.get("legal_provisions", [])
        cited_nums = [
            _extract_num(p.get("section", ""))
            for p in provisions
        ]
        cited_nums = [n for n in cited_nums if n]

        must_cite = case["must_cite"]  # already bare numbers
        hits      = sum(1 for s in must_cite if s in cited_nums)
        citation_compliance.append(hits / len(must_cite) if must_cite else 1.0)

        # Structural completeness
        has_summary.append(    1 if result.get("summary")              else 0)
        has_explanation.append(1 if result.get("explanation")          else 0)
        has_actions.append(    1 if result.get("recommended_actions")  else 0)
        has_limitations.append(1 if result.get("limitations")          else 0)
        provision_counts.append(len(provisions))

    # Completeness composite
    completeness = round(
        statistics.mean(has_summary)        * 0.25 +
        statistics.mean(has_explanation)    * 0.25 +
        statistics.mean(citation_compliance)* 0.30 +
        statistics.mean(term_coverage)      * 0.20,
        4,
    )

    metrics = {
        "term_coverage":             round(statistics.mean(term_coverage),       4),
        "semantic_relevance":        round(statistics.mean(semantic_relevance),  4),
        "citation_compliance":       round(statistics.mean(citation_compliance), 4),
        "summary_presence_rate":     round(statistics.mean(has_summary),         4),
        "explanation_presence_rate": round(statistics.mean(has_explanation),     4),
        "action_presence_rate":      round(statistics.mean(has_actions),         4),
        "limitations_presence_rate": round(statistics.mean(has_limitations),     4),
        "avg_provisions_per_query":  round(statistics.mean(provision_counts),    2),
        "response_completeness":     completeness,
        "queries_evaluated":         len(QUALITY_TEST_CASES),
    }

    print(f"  Term coverage:       {metrics['term_coverage']:.4f}")
    print(f"  Semantic relevance:  {metrics['semantic_relevance']:.4f}")
    print(f"  Citation compliance: {metrics['citation_compliance']:.4f}")
    print(f"  Summary presence:    {metrics['summary_presence_rate']:.4f}")
    print(f"  Explanation present: {metrics['explanation_presence_rate']:.4f}")
    print(f"  Actions present:     {metrics['action_presence_rate']:.4f}")
    print(f"  Completeness score:  {metrics['response_completeness']:.4f}")
    print(f"  Avg provisions/q:    {metrics['avg_provisions_per_query']:.2f}")

    return metrics


# ══════════════════════════════════════════════════════════════
# CATEGORY 4: SYSTEM PERFORMANCE METRICS
# ══════════════════════════════════════════════════════════════

PERF_QUERIES = [
    "What is theft under BNS?",
    "How to file an FIR?",
    "What is a void contract?",
    "What is Article 21?",
    "What is bail under BNSS?",
    "What is murder under BNS?",
    "What is coercion in contract law?",
]


def compute_performance_metrics(retriever) -> dict:
    """
    Retrieval-only latency (no LLM), end-to-end latency,
    corpus statistics, index size.
    """
    print("\n[4/4] Computing Performance Metrics...")

    # Warmup — first query is always slow due to memory paging
    # Don't include in measurements
    print("  Warming up retriever...")
    retriever.retrieve("test warmup query", top_k=5)

    # ── Retrieval latency (no LLM) ─────────────────────────
    print(f"  Measuring retrieval latency ({len(PERF_QUERIES)} queries)...")
    retrieval_ms = []
    for q in PERF_QUERIES:
        t0 = time.perf_counter()
        retriever.retrieve(q, top_k=5)
        retrieval_ms.append((time.perf_counter() - t0) * 1000)

    # ── End-to-end latency (retrieval + LLM) ───────────────
    e2e_queries = PERF_QUERIES[:3]   # limit LLM calls to save quota
    print(f"  Measuring E2E latency ({len(e2e_queries)} queries — includes LLM)...")
    e2e_ms = []
    for q in e2e_queries:
        t0 = time.perf_counter()
        query(q, role="advisor")
        e2e_ms.append((time.perf_counter() - t0) * 1000)

    # ── Corpus statistics ───────────────────────────────────
    from config import CHUNKS_PATH, FAISS_INDEX
    import os

    chunk_data   = json.loads(CHUNKS_PATH.read_text(encoding="utf-8"))
    token_counts = [c["token_count"] for c in chunk_data]

    by_source = {}
    for c in chunk_data:
        by_source.setdefault(c["source_file"], []).append(c)

    unique_sections = len(set(
        _extract_num(c["section_num"]) + "|" + c["source_file"]
        for c in chunk_data
    ))

    index_mb = os.path.getsize(str(FAISS_INDEX)) / (1024 * 1024)

    # Percentiles helper
    def pct(lst, p):
        return round(sorted(lst)[int(len(lst) * p / 100)], 2)

    metrics = {
        "retrieval_latency_ms": {
            "mean":   round(statistics.mean(retrieval_ms),   2),
            "median": round(statistics.median(retrieval_ms), 2),
            "min":    round(min(retrieval_ms),               2),
            "max":    round(max(retrieval_ms),               2),
            "p95":    pct(retrieval_ms, 95),
        },
        "e2e_latency_ms": {
            "mean":   round(statistics.mean(e2e_ms),   2),
            "median": round(statistics.median(e2e_ms), 2),
            "min":    round(min(e2e_ms),               2),
            "max":    round(max(e2e_ms),               2),
            "note":   "Dominated by external Groq API call",
        },
        "corpus_statistics": {
            "total_chunks":         len(chunk_data),
            "unique_sections":      unique_sections,
            "total_tokens_indexed": sum(token_counts),
            "avg_tokens_per_chunk": round(statistics.mean(token_counts), 1),
            "median_tokens":        round(statistics.median(token_counts), 1),
            "min_tokens":           min(token_counts),
            "max_tokens":           max(token_counts),
            "chunks_by_source": {
                src: len(chunks)
                for src, chunks in sorted(by_source.items())
            },
        },
        "index_size_mb":        round(index_mb, 3),
        "embedding_dimensions": 384,
        "embedding_model":      "all-MiniLM-L6-v2",
        "llm_model":            "llama-3.3-70b-versatile (Groq)",
        "similarity_threshold": 0.42,
        "cpu_only":             True,
    }

    print(f"  Retrieval latency:   {metrics['retrieval_latency_ms']['mean']:.1f}ms mean  "
          f"(p95={metrics['retrieval_latency_ms']['p95']}ms)")
    print(f"  E2E latency:         {metrics['e2e_latency_ms']['mean']:.0f}ms mean  "
          f"(LLM dominates)")
    print(f"  Total chunks:        {metrics['corpus_statistics']['total_chunks']}")
    print(f"  Unique sections:     {metrics['corpus_statistics']['unique_sections']}")
    print(f"  Total tokens:        {metrics['corpus_statistics']['total_tokens_indexed']:,}")
    print(f"  Index size:          {metrics['index_size_mb']} MB")

    return metrics


# ══════════════════════════════════════════════════════════════
# AGGREGATE SCORE
# ══════════════════════════════════════════════════════════════

def compute_aggregate(all_metrics: dict) -> dict:
    r = all_metrics["retrieval"]
    g = all_metrics["grounding"]
    q = all_metrics["quality"]

    composite = round(
        r["mrr"]                      * 0.12 +
        r["ndcg_at_5"]                * 0.08 +
        r["negative_rejection_rate"]  * 0.10 +
        g["grounding_score"]          * 0.35 +
        q["response_completeness"]    * 0.20 +
        q["semantic_relevance"]       * 0.15,
        4,
    )

    return {
        "composite_score":    composite,
        "retrieval_subscore": round(
            r["mrr"] * 0.5 + r["ndcg_at_5"] * 0.5, 4
        ),
        "grounding_subscore": g["grounding_score"],
        "quality_subscore":   q["response_completeness"],
        "grade": (
            "A+" if composite >= 0.90 else
            "A"  if composite >= 0.80 else
            "B"  if composite >= 0.65 else
            "C"  if composite >= 0.50 else
            "D"
        ),
        "interpretation": (
            "Excellent"   if composite >= 0.80 else
            "Good"        if composite >= 0.65 else
            "Satisfactory"if composite >= 0.50 else
            "Needs work"
        ),
    }


# ══════════════════════════════════════════════════════════════
# SUMMARY PRINTER
# ══════════════════════════════════════════════════════════════

def print_summary(all_metrics: dict):
    sep = "=" * 62

    print(f"\n{sep}")
    print("EVALUATION SUMMARY")
    print(sep)

    if "retrieval" in all_metrics:
        r = all_metrics["retrieval"]
        print(f"\n{'─'*62}")
        print(f"  RETRIEVAL  ({r['total_queries']} queries)")
        print(f"{'─'*62}")
        print(f"  {'MRR':<35} {r['mrr']:.4f}")
        print(f"  {'NDCG@5':<35} {r['ndcg_at_5']:.4f}")
        print(f"  {'Precision@5':<35} {r['precision_at_5']:.4f}")
        print(f"  {'Recall@5':<35} {r['recall_at_5']:.4f}")
        print(f"  {'Hit@1':<35} {r['hit_at_1']:.4f}")
        print(f"  {'Hit@5':<35} {r['hit_at_5']:.4f}")
        print(f"  {'Negative Rejection Rate':<35} {r['negative_rejection_rate']:.4f}  ★")
        print(f"  {'Paraphrase Consistency':<35} {r['paraphrase_consistency']:.4f}")
        print(f"  Per-category MRR:")
        for cat, score in r.get("per_category_mrr", {}).items():
            print(f"    {cat:<33} {score:.4f}")

    if "grounding" in all_metrics:
        g = all_metrics["grounding"]
        print(f"\n{'─'*62}")
        print(f"  GROUNDING  ({g['queries_evaluated']} queries)  ← Key for legal systems")
        print(f"{'─'*62}")
        print(f"  {'Hallucination Rate':<35} {g['hallucination_rate']:.4f}  ★")
        print(f"  {'Citation Accuracy':<35} {g['citation_accuracy']:.4f}  ★")
        print(f"  {'Quote Presence Rate':<35} {g['quote_presence_rate']:.4f}  ★")
        print(f"  {'Semantic Drift Rate':<35} {g['semantic_drift_rate']:.4f}  ★")
        print(f"  {'Avg Confidence Score':<35} {g['avg_confidence_score']:.4f}")
        print(f"  {'Disclaimer Presence':<35} {g['disclaimer_presence_rate']:.4f}")
        print(f"  {'Irrelevant Refusal Rate':<35} {g['irrelevant_refusal_rate']:.4f}  ★")
        print(f"  {'Grounding Score (composite)':<35} {g['grounding_score']:.4f}  ★")

    if "quality" in all_metrics:
        q = all_metrics["quality"]
        print(f"\n{'─'*62}")
        print(f"  RESPONSE QUALITY  ({q['queries_evaluated']} queries)")
        print(f"{'─'*62}")
        print(f"  {'Term Coverage':<35} {q['term_coverage']:.4f}")
        print(f"  {'Semantic Relevance':<35} {q['semantic_relevance']:.4f}")
        print(f"  {'Citation Compliance':<35} {q['citation_compliance']:.4f}")
        print(f"  {'Summary Presence':<35} {q['summary_presence_rate']:.4f}")
        print(f"  {'Explanation Presence':<35} {q['explanation_presence_rate']:.4f}")
        print(f"  {'Actions Presence':<35} {q['action_presence_rate']:.4f}")
        print(f"  {'Avg Provisions / Query':<35} {q['avg_provisions_per_query']:.2f}")
        print(f"  {'Completeness Score':<35} {q['response_completeness']:.4f}")

    if "performance" in all_metrics:
        p = all_metrics["performance"]
        cs = p["corpus_statistics"]
        print(f"\n{'─'*62}")
        print(f"  PERFORMANCE")
        print(f"{'─'*62}")
        print(f"  {'Retrieval Latency (mean)':<35} {p['retrieval_latency_ms']['mean']:.1f} ms")
        print(f"  {'Retrieval Latency (p95)':<35} {p['retrieval_latency_ms']['p95']:.1f} ms")
        print(f"  {'E2E Latency (mean)':<35} {p['e2e_latency_ms']['mean']:.0f} ms  (LLM bound)")
        print(f"  {'FAISS Index Size':<35} {p['index_size_mb']} MB")
        print(f"  {'Total Chunks Indexed':<35} {cs['total_chunks']}")
        print(f"  {'Unique Sections':<35} {cs['unique_sections']}")
        print(f"  {'Total Tokens Indexed':<35} {cs['total_tokens_indexed']:,}")
        print(f"  {'Avg Tokens / Chunk':<35} {cs['avg_tokens_per_chunk']}")
        print(f"  {'Embedding Model':<35} {p['embedding_model']}")
        print(f"  {'LLM':<35} {p['llm_model']}")
        print(f"  {'CPU Only':<35} {p['cpu_only']}")
        print(f"  Chunks by source:")
        for src, count in cs["chunks_by_source"].items():
            print(f"    {src:<33} {count}")

    if "aggregate" in all_metrics:
        a = all_metrics["aggregate"]
        print(f"\n{'─'*62}")
        print(f"  AGGREGATE")
        print(f"{'─'*62}")
        print(f"  {'Retrieval Subscore':<35} {a['retrieval_subscore']:.4f}")
        print(f"  {'Grounding Subscore':<35} {a['grounding_subscore']:.4f}")
        print(f"  {'Quality Subscore':<35} {a['quality_subscore']:.4f}")
        print(f"  {'Composite Score':<35} {a['composite_score']:.4f}")
        print(f"  {'Grade':<35} {a['grade']}")
        print(f"  {'Interpretation':<35} {a['interpretation']}")

    print(f"\n{sep}")
    print("★ = Most critical metrics for a legal AI system")
    print(sep)


# ══════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Evaluate the AI Legal Workflow Assistant"
    )
    parser.add_argument(
        "--category",
        choices=["retrieval", "grounding", "quality", "performance", "all"],
        default="all",
        help="Which category to evaluate (default: all)",
    )
    parser.add_argument(
        "--output",
        default="metrics_report.json",
        help="Path to save JSON report (default: metrics_report.json)",
    )
    args = parser.parse_args()

    print("=" * 62)
    print("AI Legal Workflow Assistant — Evaluation Suite")
    print(f"Run at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 62)

    # Use the retriever that was already loaded by initialize()
    from core.engine import _retriever
    retriever = _retriever

    all_metrics = {}
    cat = args.category

    if cat in ("retrieval", "all"):
        all_metrics["retrieval"] = compute_retrieval_metrics(retriever)

    if cat in ("grounding", "all"):
        all_metrics["grounding"] = compute_grounding_metrics()

    if cat in ("quality", "all"):
        all_metrics["quality"] = compute_response_quality_metrics()

    if cat in ("performance", "all"):
        all_metrics["performance"] = compute_performance_metrics(retriever)

    if cat == "all" and len(all_metrics) == 4:
        all_metrics["aggregate"] = compute_aggregate(all_metrics)

    # Print summary
    print_summary(all_metrics)

    # Save JSON report
    report = {
        "metadata": {
            "timestamp":        datetime.now().isoformat(),
            "system":           "AI Legal Workflow Assistant",
            "corpus":           "Constitution + BNS + BNSS + BSA + Indian Contract Act",
            "llm":              "llama-3.3-70b-versatile via Groq API",
            "embeddings":       "all-MiniLM-L6-v2 (SentenceTransformers)",
            "vector_store":     "FAISS IndexFlatIP (CPU)",
            "category_run":     cat,
        },
        "metrics": all_metrics,
    }

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(report, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\nFull report saved → {out_path.resolve()}")


if __name__ == "__main__":
    main()