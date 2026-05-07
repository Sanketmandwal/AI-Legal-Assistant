"""test_core.py — v2"""
import json
from core.engine import initialize, query


def print_validation(result: dict):
    print("\n── Citation Validation ──")
    v = result.get("_validation", {})
    print(f"  Verified:      {v.get('verified_count')}")
    print(f"  Hallucinated:  {v.get('hallucinated')} {v.get('hallucinated_sections')}")

    print("\n── Semantic Validation ──")
    sv = result.get("semantic_validation", {})
    print(f"  Overall:       {sv.get('overall')}")
    print(f"  Quotes not found:    {sv.get('not_found_count')}")
    print(f"  High drift count:    {sv.get('high_drift_count')}")
    if sv.get("issues"):
        for issue in sv["issues"]:
            print(f"  ⚠ [{issue['type']}] {issue['section']}: {issue['detail']}")

    print("\n── Confidence ──")
    conf = result.get("confidence", {})
    print(f"  Level: {conf.get('level')} | Score: {conf.get('score')}")
    print(f"  Reason: {conf.get('justification', '')[:120]}")

    print("\n── Provisions ──")
    for p in result.get("legal_provisions", []):
        flag = "✅" if p.get("verified") else "❌"
        drift = p.get("_drift_check", {}).get("flag", "—")
        qflag = p.get("_quote_check", {}).get("flag", "—")
        print(f"  {flag} {p.get('act')} | {p.get('section')}")
        print(f"     Quote check: {qflag} | Drift: {drift}")
        if p.get("_semantic_warning"):
            print(f"     ⚠ {p['_semantic_warning'][:100]}")


def main():
    initialize()

    print("\n" + "="*55)
    print("TEST 1: Murder under BNS (should be clean)")
    print("="*55)
    r1 = query("What is the punishment for murder under BNS?", role="advisor")
    print(f"Summary: {r1.get('summary', '')[:120]}")
    print_validation(r1)

    print("\n" + "="*55)
    print("TEST 2: Contract fraud (tests drift on voidable vs void)")
    print("="*55)
    r2 = query("Is a contract signed under fraud void or voidable?", role="researcher")
    print(f"Summary: {r2.get('summary', '')[:120]}")
    print_validation(r2)

    print("\n" + "="*55)
    print("TEST 3: Irrelevant query (no context)")
    print("="*55)
    r3 = query("What is the capital of France?")
    print(f"Response: {r3.get('error') or r3.get('summary', '')[:80]}")


if __name__ == "__main__":
    main()