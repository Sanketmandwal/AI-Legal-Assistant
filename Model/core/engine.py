"""
core/engine.py

WHY: This is the orchestration layer. Every query—whether
a simple Q&A, FIR draft, or case analysis—passes through here.

Flow:
  query + role + language
    → retrieve (with reformulation + threshold)
    → build prompt (role-aware)
    → call LLM
    → validate response
    → return structured JSON

Feature modules call query() or query_feature() depending on type.
"""

from core.retriever   import LegalRetriever, RetrievedChunk
from core.prompt_builder import build_system_prompt, build_user_prompt, build_feature_prompt
from core.llm_client  import LLMClient
from core.validator   import validate_response
from config           import DISCLAIMER

# These are initialized ONCE at startup and shared across all requests
_retriever: LegalRetriever = None
_llm:       LLMClient      = None


def initialize():
    """Call this once when the FastAPI app starts."""
    global _retriever, _llm
    print("Initializing RAG engine...")
    _retriever = LegalRetriever()
    _llm       = LLMClient()
    print("Engine ready.")


def query(
    user_query: str,
    role:       str = "advisor",
    language:   str = "english",
    top_k:      int = 5,
    filter_act: str = None,
) -> dict:
    """
    Standard legal Q&A query.

    Returns structured JSON with legal provisions, explanation,
    citations, confidence score, and disclaimer.
    """
    # 1. Retrieve
    chunks = _retriever.retrieve(user_query, top_k=top_k, filter_act=filter_act)
    context = _retriever.format_context(chunks)

    # 2. Build prompts
    system_prompt = build_system_prompt(role, context, language)
    user_prompt   = build_user_prompt(user_query)

    # 3. LLM call
    response = _llm.call(system_prompt, user_prompt)

    # 4. Validate
    response = validate_response(response, chunks)

    # 5. Attach retrieval metadata
    response["retrieved_sources"] = [
        {
            "act":     c.act_name,
            "section": c.section_num,
            "title":   c.section_title,
            "score":   round(c.score, 4),
        }
        for c in chunks
    ]
    response["query_meta"] = {
        "role":     role,
        "language": language,
        "chunks_retrieved": len(chunks),
    }

    return response


def query_feature(
    feature:    str,
    user_query: str,
    language:   str = "english",
    top_k:      int = 5,
    extra:      dict = None,
) -> dict:
    """
    Feature-specific query (FIR, analyzer, workflow, risk, timeline).

    Args:
        feature: "fir" | "analyzer" | "workflow" | "risk" | "timeline"
    """
    # 1. Retrieve (same retrieval for all features)
    chunks  = _retriever.retrieve(user_query, top_k=top_k)
    context = _retriever.format_context(chunks)

    # 2. Build feature-specific prompts
    system_prompt, user_prompt = build_feature_prompt(
        feature, user_query, context, language, extra
    )

    # 3. LLM call
    response = _llm.call(system_prompt, user_prompt)

    # 4. Validate
    response = validate_response(response, chunks)

    # 5. Metadata
    response["retrieved_sources"] = [
        {"act": c.act_name, "section": c.section_num, "score": round(c.score, 4)}
        for c in chunks
    ]
    response["feature"] = feature

    return response