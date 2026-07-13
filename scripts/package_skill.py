#!/usr/bin/env python3
"""Deterministic .skill packager.

Packages a skill directory into a byte-identical `<basename>.skill` zip whose
members live under a top-level `<basename>/...` path. Standalone: does not
import the skill-creator package.

Usage:
    python scripts/package_skill.py <skill-dir>   # package one skill
    python scripts/package_skill.py --all         # package every skill in repo root
"""

import os
import re
import sys
import zipfile

# Repo root is the parent of this script's directory, so --all works from any CWD.
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Top-level entries that are never skills, even if they contain a SKILL.md.
SKIP_DIRS = {"_audit", "_public", "_shared", "scripts", ".github"}

# Names excluded from the packaged zip wherever they appear in the tree.
EXCLUDE_NAMES = {".git", "__pycache__", ".DS_Store"}

# Fixed zip metadata for reproducibility.
ZIP_DATE_TIME = (1980, 1, 1, 0, 0, 0)
ZIP_EXTERNAL_ATTR = 0o644 << 16


def _fail(message):
    print(f"error: {message}", file=sys.stderr)
    sys.exit(1)


# Matches a top-level frontmatter key line, e.g. `name: foo` or `description: ...`.
# Values may legitimately contain colons (e.g. "Read-only: ..."), so full YAML
# parsing is too strict; a lenient top-level-key scan is what we need here.
_KEY_RE = re.compile(r"^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s?(.*)$")


def _read_frontmatter(skill_md_path):
    """Return top-level frontmatter key/value strings, or fail non-zero."""
    try:
        with open(skill_md_path, "r", encoding="utf-8") as fh:
            lines = fh.read().splitlines()
    except OSError as exc:
        _fail(f"cannot read {skill_md_path}: {exc}")

    if not lines or lines[0].strip() != "---":
        _fail(f"{skill_md_path}: missing YAML frontmatter (must open with '---')")

    end = None
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            end = idx
            break
    if end is None:
        _fail(f"{skill_md_path}: unterminated YAML frontmatter (no closing '---')")

    data = {}
    for line in lines[1:end]:
        if not line.strip() or line[0] in (" ", "\t"):
            # Skip blanks and indented continuation lines (not top-level keys).
            continue
        match = _KEY_RE.match(line)
        if match:
            value = match.group(2).strip()
            if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
                value = value[1:-1]
            data[match.group(1)] = value
    return data


def _validate(skill_dir):
    """Validate a skill directory; return (abs_dir, basename) or fail non-zero."""
    abs_dir = os.path.abspath(skill_dir)
    if not os.path.isdir(abs_dir):
        _fail(f"{skill_dir}: not a directory")
    basename = os.path.basename(abs_dir.rstrip(os.sep))

    skill_md = os.path.join(abs_dir, "SKILL.md")
    if not os.path.isfile(skill_md):
        _fail(f"{skill_dir}: SKILL.md not found")

    fm = _read_frontmatter(skill_md)
    name = fm.get("name")
    description = fm.get("description")
    if not name or not str(name).strip():
        _fail(f"{skill_md}: frontmatter 'name' is missing or empty")
    if not description or not str(description).strip():
        _fail(f"{skill_md}: frontmatter 'description' is missing or empty")
    if str(name).strip() != basename:
        _fail(
            f"{skill_md}: frontmatter name '{name}' does not match "
            f"folder basename '{basename}'"
        )
    return abs_dir, basename


def _collect_files(abs_dir):
    """Return sorted relative paths of files to include in the package."""
    rel_paths = []
    for root, dirs, files in os.walk(abs_dir):
        # Prune excluded directories in place.
        dirs[:] = [d for d in dirs if d not in EXCLUDE_NAMES]
        # A skill-root `evals/` directory is excluded (only at the skill root).
        if root == abs_dir:
            dirs[:] = [d for d in dirs if d != "evals"]
        for fname in files:
            if fname in EXCLUDE_NAMES:
                continue
            if fname.endswith(".pyc") or fname.endswith(".skill"):
                continue
            abs_path = os.path.join(root, fname)
            rel_paths.append(os.path.relpath(abs_path, abs_dir))
    rel_paths.sort()
    return rel_paths


def package(skill_dir):
    """Package one skill directory deterministically; print the result path."""
    abs_dir, basename = _validate(skill_dir)
    rel_paths = _collect_files(abs_dir)

    target = os.path.join(abs_dir, f"{basename}.skill")
    tmp = os.path.join(abs_dir, f".{basename}.skill.tmp")

    with zipfile.ZipFile(tmp, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for rel in rel_paths:
            with open(os.path.join(abs_dir, rel), "rb") as fh:
                data = fh.read()
            arcname = f"{basename}/{rel.replace(os.sep, '/')}"
            info = zipfile.ZipInfo(filename=arcname, date_time=ZIP_DATE_TIME)
            info.external_attr = ZIP_EXTERNAL_ATTR
            info.compress_type = zipfile.ZIP_DEFLATED
            zf.writestr(info, data)

    os.replace(tmp, target)
    print(f"Packaged: {target}")


def package_all():
    """Package every top-level skill directory in the repo root."""
    for entry in sorted(os.listdir(REPO_ROOT)):
        if entry in SKIP_DIRS or entry.startswith("."):
            continue
        abs_entry = os.path.join(REPO_ROOT, entry)
        if not os.path.isdir(abs_entry):
            continue
        if not os.path.isfile(os.path.join(abs_entry, "SKILL.md")):
            continue
        package(abs_entry)


def main(argv):
    if len(argv) != 1:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    arg = argv[0]
    if arg == "--all":
        package_all()
    else:
        package(arg)


if __name__ == "__main__":
    main(sys.argv[1:])
