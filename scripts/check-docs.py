"""Dependency-free Markdown hygiene, local-link and fenced JSON validation."""

import json
from pathlib import Path
import re
import subprocess
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
files = subprocess.check_output(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"], cwd=ROOT
).decode().split("\0")
markdown = sorted({ROOT / name for name in files if name.endswith(".md")})
failures = []
link_count = 0

for path in markdown:
    text = path.read_text(encoding="utf-8")
    label = path.relative_to(ROOT)
    if not text.endswith("\n"):
        failures.append(f"{label}: missing final newline")
    fence = None
    block = []
    for number, line in enumerate(text.splitlines(), 1):
        if line.rstrip() != line:
            failures.append(f"{label}:{number}: trailing whitespace")
        if "\t" in line:
            failures.append(f"{label}:{number}: tab character")
        match = re.match(r"^\s*(`{3,}|~{3,})(\w*)\s*$", line)
        if match:
            if fence is None:
                fence = (match[1], match[2], number)
                block = []
            elif match[1][0] == fence[0][0] and len(match[1]) >= len(fence[0]):
                if fence[1] == "json":
                    try:
                        json.loads("\n".join(block))
                    except json.JSONDecodeError as error:
                        failures.append(f"{label}:{fence[2]}: invalid fenced JSON: {error}")
                fence = None
            continue
        if fence is not None:
            block.append(line)
            continue
        for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", line):
            target = target.strip().strip("<>")
            parsed = urlsplit(target)
            if parsed.scheme or target.startswith("//"):
                continue  # Remote availability is not a deterministic format check.
            destination = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
            link_count += 1
            if not destination.exists():
                failures.append(f"{label}:{number}: broken local link: {target}")
    if fence is not None:
        failures.append(f"{label}:{fence[2]}: unclosed code fence")

if failures:
    raise SystemExit("\n".join(failures))
print(f"PASS: {len(markdown)} Markdown files; {link_count} local links; fences, JSON and whitespace.")
