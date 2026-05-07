# inspect_format.py
from config import DATA_PROC_DIR

files = ["clean_bns.txt", "clean_bnss.txt", "clean_bsa.txt", "clean_contract_act.txt"]

for fname in files:
    path = DATA_PROC_DIR / fname
    if not path.exists():
        print(f"NOT FOUND: {fname}")
        continue
    text = path.read_text(encoding="utf-8")
    # Find where numbered sections actually begin (skip table of contents)
    # Look for a line that looks like "103." followed by content on next line
    lines = text.split('\n')
    print(f"\n{'='*50}")
    print(f"FILE: {fname}")
    print(f"Total lines: {len(lines)}")
    print("\nLines 1-30:")
    for i, line in enumerate(lines[:30], 1):
        print(f"  {i:4d}: {repr(line[:80])}")
    # Find first occurrence of a pattern like "103."
    print("\nSearching for numbered section lines...")
    import re
    for i, line in enumerate(lines):
        if re.match(r'^\s*\d{1,3}[A-Z]?\.\s+\S', line):
            print(f"  Line {i+1}: {repr(line[:100])}")
            if i > 0:
                print(f"  Prev:   {repr(lines[i-1][:100])}")
            if i < len(lines)-1:
                print(f"  Next:   {repr(lines[i+1][:100])}")
            break