# diagnose_chunks.py
import json
from config import CHUNKS_PATH, DATA_PROC_DIR

chunks = json.loads(CHUNKS_PATH.read_text(encoding="utf-8"))

print(f"Total chunks: {len(chunks)}\n")

# Group by source
from collections import defaultdict
by_source = defaultdict(list)
for c in chunks:
    by_source[c['source_file']].append(c)

for source, clist in by_source.items():
    print(f"\n{'='*50}")
    print(f"FILE: {source} — {len(clist)} chunks")
    print(f"Section numbers found:")
    for c in clist[:10]:  # show first 10
    # for c in clist:
        print(f"  [{c['chunk_id']}] section_num='{c['section_num']}' | tokens={c['token_count']}")
    if len(clist) > 10:
        print(f"  ... and {len(clist)-10} more")

# Show first 500 chars of cleaned BNS to see actual format
# bns_clean = (DATA_PROC_DIR / "clean_bns.txt")
# if bns_clean.exists():
#     text = bns_clean.read_text(encoding="utf-8")
#     print(f"\n{'='*50}")
#     print("First 1000 chars of cleaned BNS:")
#     print(repr(text[:1000]))