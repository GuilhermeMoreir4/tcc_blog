#!/usr/bin/env python3
"""Convert all MDX content to a single PDF."""

import re
import subprocess
from pathlib import Path

ROOT = Path("/home/guigo/tcc_blog/content/bootloader-na-pratica")

CHAPTERS = [
    ("Parte 1 — Assembly e o Parede de Carne", [
        ROOT / "parte-1/1-introduction.mdx",
        ROOT / "parte-1/2-tooling.mdx",
        ROOT / "parte-1/3-assembly-x86.mdx",
    ]),
    ("Parte 2 — Alice e a toca do coelho", [
        ROOT / "parte-2/1-real-mode.mdx",
        ROOT / "parte-2/2-disk-and-bios.mdx",
        ROOT / "parte-2/3-stage-1.mdx",
        ROOT / "parte-2/4-stage-2.mdx",
        ROOT / "parte-2/5-protect-mode.mdx",
    ]),
    ("Parte 3 — Olá, Seldon!", [
        ROOT / "parte-3/1-seldon-os.mdx",
    ]),
]


def clean_mdx(text: str) -> str:
    lines = text.splitlines()
    result = []
    skip_until = None  # tag name to skip until closing tag
    inside_if_false = False

    i = 0
    while i < len(lines):
        line = lines[i]

        # Skip import lines
        if re.match(r'^import\s+', line):
            i += 1
            continue

        # Skip export const metadata = { ... } (multi-line)
        if re.match(r'^export\s+(const|let)\s+metadata\s*=', line):
            # skip until closing brace at start of line
            while i < len(lines) and not lines[i].strip() == '};':
                i += 1
            i += 1  # skip the closing '};'
            continue

        # Skip export let/const single-line variables
        if re.match(r'^export\s+(let|const)\s+\w+\s*=\s*\S+;?\s*$', line):
            i += 1
            continue

        # Skip self-closing JSX tags like <ChapterNav .../> or <ChapterNav ... />
        if re.match(r'^\s*<ChapterNav\b', line):
            # skip until '/>' on same or future line
            while i < len(lines) and '/>' not in lines[i]:
                i += 1
            i += 1
            continue

        if re.match(r'^\s*<Button\b', line):
            while i < len(lines) and ('/>' in lines[i] or '</Button>' in lines[i]):
                i += 1
                break
            else:
                i += 1
            continue

        # Handle <If condition={...}> blocks
        if_match = re.match(r'^\s*<If\s+condition=\{(.+?)\}>', line)
        if if_match:
            condition_str = if_match.group(1).strip()
            # Evaluate simple boolean conditions
            condition = condition_str.lower() not in ('false', '0', '')
            if not condition:
                inside_if_false = True
                i += 1
                continue
            else:
                i += 1
                continue

        if inside_if_false:
            if re.match(r'^\s*</If>', line):
                inside_if_false = False
            i += 1
            continue

        if re.match(r'^\s*</If>', line):
            i += 1
            continue

        # Handle <DesignNote title="..."> blocks → blockquote
        design_match = re.match(r'^\s*<DesignNote\s+title="([^"]+)"[^>]*>', line)
        if design_match:
            title = design_match.group(1)
            result.append(f"\n> **{title}**\n>")
            i += 1
            # collect content until </DesignNote>
            while i < len(lines):
                l = lines[i]
                if re.match(r'^\s*</DesignNote>', l):
                    result.append(">")
                    i += 1
                    break
                stripped = l.strip()
                if stripped:
                    result.append(f"> {stripped}")
                else:
                    result.append(">")
                i += 1
            result.append("")
            continue

        # Handle <Challenge level={N}> blocks → callout section
        challenge_match = re.match(r'^\s*<Challenge\s+level=\{(\d)\}>', line)
        if challenge_match:
            level = challenge_match.group(1)
            labels = {'1': 'Nível 1', '2': 'Nível 2', '3': 'Nível 3'}
            label = labels.get(level, f'Nível {level}')
            result.append(f"\n**{label}**\n")
            i += 1
            while i < len(lines):
                l = lines[i]
                if re.match(r'^\s*</Challenge>', l):
                    i += 1
                    break
                result.append(l)
                i += 1
            continue

        # Skip other standalone JSX closing/opening tags
        if re.match(r'^\s*</?(Testing|If|Button)\b', line):
            i += 1
            continue

        result.append(line)
        i += 1

    return "\n".join(result)


def extract_title(text: str) -> str:
    """Extract title from metadata block."""
    m = re.search(r'title:\s*"([^"]+)"', text)
    return m.group(1) if m else ""


def build_combined_markdown() -> str:
    parts = []

    parts.append("""---
title: Bootloader na Prática
author: Guilherme Moreira
date: 2026
---

# Bootloader na Prática

*Um guia prático para construir um bootloader e kernel mínimo em Assembly e C.*

---

""")

    for part_title, files in CHAPTERS:
        parts.append(f"\n# {part_title}\n\n---\n")
        for path in files:
            raw = path.read_text(encoding="utf-8")
            title = extract_title(raw)
            cleaned = clean_mdx(raw)
            # Remove leading blank lines
            cleaned = cleaned.strip()
            if title:
                parts.append(f"\n## {title}\n\n{cleaned}\n\n---\n")
            else:
                parts.append(f"\n{cleaned}\n\n---\n")

    return "\n".join(parts)


def main():
    out_dir = Path("/home/guigo/tcc_blog/scripts")
    md_path = out_dir / "bootloader-na-pratica.md"
    pdf_path = out_dir / "bootloader-na-pratica.pdf"

    print("Building combined markdown...")
    combined = build_combined_markdown()
    md_path.write_text(combined, encoding="utf-8")
    print(f"  Written: {md_path} ({len(combined):,} chars)")

    print("Converting to PDF with md-to-pdf...")
    result = subprocess.run(
        ["npx", "md-to-pdf", str(md_path)],
        cwd=str(out_dir),
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        print(f"  PDF generated: {pdf_path}")
    else:
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        raise RuntimeError("md-to-pdf failed")


if __name__ == "__main__":
    main()
