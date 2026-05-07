"""
pipeline/chunker.py  — v2

Key fix: Indian legal PDFs use bare number format "103." not "Section 103."
Each document has its own numbering convention detected from the actual text.

Strategy per document:
  Constitution  → "Article N"  (already working)
  BNS           → "N." bare number at line start, followed by title
  BNSS          → "N." bare number at line start  
  BSA           → "N." bare number at line start
  Contract Act  → "N." bare number at line start
  
Secondary: If a section > MAX_CHUNK_TOKENS, split on paragraph boundaries
           with overlap. Always prepend section header to every sub-chunk.
"""

import re
import json
from dataclasses import dataclass, asdict
from pathlib import Path

import tiktoken

from config import (
    DATA_PROC_DIR, CHUNKS_PATH, METADATA_PATH,
    MAX_CHUNK_TOKENS, OVERLAP_TOKENS, SOURCE_REGISTRY
)

_tokenizer = tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str) -> int:
    return len(_tokenizer.encode(text))


@dataclass
class Chunk:
    chunk_id:      str
    source_file:   str
    act_name:      str
    section_num:   str   # e.g. "Section 103" (normalized, always includes word)
    section_title: str   # e.g. "Murder"
    text:          str
    token_count:   int


# ─────────────────────────────────────────────────────────────
# SECTION PATTERNS  — one per document
#
# Each pattern is applied to the FULL cleaned text with re.finditer()
# Groups:
#   group(1) → raw number/identifier  e.g. "103", "14A"
#   group(2) → title text             e.g. "Murder" (may be empty string)
#
# IMPORTANT: Patterns must NOT match table-of-contents lines.
# We handle this by requiring the section body to be non-trivial (>50 chars).
# ─────────────────────────────────────────────────────────────

SECTION_PATTERNS = {

    # Constitution: "Article 14" or "Article 14A"
    # Works already — keep as-is
    "constitution.txt": re.compile(
        r'^(\d{1,3}[A-Z]?)\.\s+([A-Z][^\n]{10,120})$',
        re.MULTILINE
    ),

    # BNS/BNSS/BSA: bare number format
    # Matches lines like:
    #   "103. Murder.—Whoever..."
    #   "103. Murder."
    #   "103A. Special provision."
    # Does NOT match table of contents (same format sadly — we'll filter by body length)
    "bns.txt": re.compile(
        r'^(\d{1,3}[A-Z]?)\.\s+([^\n]{0,120})$',
        re.MULTILINE
    ),

    "bnss.txt": re.compile(
        r'^(\d{1,3}[A-Z]?)\.\s+([^\n]{0,120})$',
        re.MULTILINE
    ),

    "bsa.txt": re.compile(
        r'^(\d{1,3}[A-Z]?)\.\s+([^\n]{0,120})$',
        re.MULTILINE
    ),

    # Contract Act: sections go up to ~238
    "contract_act.txt": re.compile(
        r'^(\d{1,3}[A-Z]?)\.\s+([^\n]{0,120})$',
        re.MULTILINE
    ),
}

# Prefix to add when normalizing section numbers for display/citation
# e.g. "103" → "Section 103", "14" → "Article 14"
SECTION_PREFIX = {
    "constitution.txt": "Article ",
    "bns.txt":          "Section ",
    "bnss.txt":         "Section ",
    "bsa.txt":          "Section ",
    "contract_act.txt": "Section ",
}


def _clean_title(title: str) -> str:
    """
    Clean up captured section title.
    Indian legal PDFs often have "Murder.—" style with em-dash.
    We want just "Murder".
    """
    # Remove trailing em-dash and what follows (definition start)
    title = re.split(r'[—–\-]{1,2}', title)[0]
    # Remove trailing period
    title = title.rstrip('. ')
    # Normalize whitespace
    title = re.sub(r'\s+', ' ', title).strip()
    return title


def _split_into_sections(
    text: str,
    filename: str,
) -> list[tuple[str, str, str]]:
    """
    Split document text into (section_num, section_title, body) tuples.
    section_num is normalized: always includes "Section" or "Article" prefix.
    body includes the header line and all content until the next section.
    """
    pattern = SECTION_PATTERNS.get(filename)
    prefix  = SECTION_PREFIX.get(filename, "Section ")

    if not pattern:
        raise ValueError(f"No section pattern for {filename}")

    matches = list(pattern.finditer(text))

    if not matches:
        print(f"  [WARN] No section headers matched in {filename}. Treating as single chunk.")
        return [("Full Document", "", text)]

    sections = []
    for i, match in enumerate(matches):
        raw_num   = match.group(1).strip()
        raw_title = match.group(2).strip() if match.group(2) else ""

        # Normalize section number
        if filename == "constitution.txt":
            section_num = raw_num          # Already "Article 14"
        else:
            section_num = f"{prefix}{raw_num}"   # "Section 103"

        section_title = _clean_title(raw_title)

        # Body: from this match to the next
        body_start = match.start()
        body_end   = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body       = text[body_start:body_end].strip()

        # ── Table of Contents filter ──────────────────────────
        # ToC entries look like "103. Murder." with no real body.
        # Real sections have substantial body text.
        # Skip if body is too short (just the header line essentially).
        if len(body) < 80:
            continue

        # Also skip if body is ONLY the header line with no paragraph content
        # i.e. no sentence-ending punctuation beyond the header
        body_without_header = body[len(match.group(0)):].strip()
        if len(body_without_header) < 40:
            continue

        sections.append((section_num, section_title, body))

    if not sections:
        print(f"  [WARN] All matches filtered out for {filename} (likely ToC only).")
        print(f"         Falling back to single-chunk mode.")
        return [("Full Document", "", text)]

    return sections


def _secondary_split(
    section_num:    str,
    section_title:  str,
    body:           str,
    source_file:    str,
    act_name:       str,
    chunk_id_prefix: str,
) -> list[Chunk]:
    """
    If a section body > MAX_CHUNK_TOKENS, split by paragraph with overlap.
    Every sub-chunk gets the section header prepended so it is self-contained.
    """
    if count_tokens(body) <= MAX_CHUNK_TOKENS:
        return [Chunk(
            chunk_id      = f"{chunk_id_prefix}_0",
            source_file   = source_file,
            act_name      = act_name,
            section_num   = section_num,
            section_title = section_title,
            text          = body,
            token_count   = count_tokens(body),
        )]

    header = section_num
    if section_title:
        header += f" — {section_title}"

    paragraphs = [p.strip() for p in re.split(r'\n{2,}', body) if p.strip()]
    chunks      = []
    current     = []
    cur_tokens  = 0

    for para in paragraphs:
        pt = count_tokens(para)

        if cur_tokens + pt > MAX_CHUNK_TOKENS and current:
            chunk_text = header + "\n\n" + "\n\n".join(current)
            chunks.append(Chunk(
                chunk_id      = f"{chunk_id_prefix}_{len(chunks)}",
                source_file   = source_file,
                act_name      = act_name,
                section_num   = section_num,
                section_title = section_title,
                text          = chunk_text,
                token_count   = count_tokens(chunk_text),
            ))
            # Overlap: carry forward last N tokens worth of paragraphs
            overlap, ot = [], 0
            for p in reversed(current):
                t = count_tokens(p)
                if ot + t > OVERLAP_TOKENS:
                    break
                overlap.insert(0, p)
                ot += t
            current    = overlap + [para]
            cur_tokens = sum(count_tokens(p) for p in current)
        else:
            current.append(para)
            cur_tokens += pt

    if current:
        chunk_text = header + "\n\n" + "\n\n".join(current)
        chunks.append(Chunk(
            chunk_id      = f"{chunk_id_prefix}_{len(chunks)}",
            source_file   = source_file,
            act_name      = act_name,
            section_num   = section_num,
            section_title = section_title,
            text          = chunk_text,
            token_count   = count_tokens(chunk_text),
        ))

    return chunks


def chunk_document(text: str, filename: str) -> list[Chunk]:
    act_name = SOURCE_REGISTRY.get(filename, filename)
    file_key = re.sub(r'[^a-z0-9]', '', filename.lower().replace('.txt', ''))

    sections   = _split_into_sections(text, filename)
    all_chunks = []

    for section_num, section_title, body in sections:
        sec_key = re.sub(r'\s+', '', section_num.lower())
        prefix  = f"{file_key}_{sec_key}"
        sub     = _secondary_split(section_num, section_title, body,
                                   filename, act_name, prefix)
        all_chunks.extend(sub)

    return all_chunks


def chunk_all(cleaned_docs: dict[str, str]) -> list[Chunk]:
    all_chunks = []
    DATA_PROC_DIR.mkdir(parents=True, exist_ok=True)

    for filename, text in cleaned_docs.items():
        chunks = chunk_document(text, filename)
        all_chunks.extend(chunks)
        if chunks:
            avg = sum(c.token_count for c in chunks) / len(chunks)
            sec_nums = set(c.section_num for c in chunks)
            print(f"  [OK] {filename}: {len(chunks)} chunks | "
                  f"{len(sec_nums)} unique sections | avg {avg:.0f} tokens")
        else:
            print(f"  [WARN] {filename}: 0 chunks produced")

    chunks_data = [asdict(c) for c in all_chunks]
    CHUNKS_PATH.write_text(
        json.dumps(chunks_data, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    metadata = [{k: v for k, v in asdict(c).items() if k != 'text'}
                for c in all_chunks]
    METADATA_PATH.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"\n  Total: {len(all_chunks)} chunks")
    return all_chunks