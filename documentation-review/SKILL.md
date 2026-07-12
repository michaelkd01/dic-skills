---
name: documentation-review
description: Advisory documentation reviewer. Use when Michael wants the documentation corpus checked for accuracy drift against recent merged work ... triggers include "documentation review", "are the docs up to date", "review the runbooks", "review the SOPs", "doc accuracy check", scoped by a project or a doc-class token. Resolves a scope token to a doc set, takes recently merged/closed work as ground truth, and flags each doc as CURRENT / STALE / SUPERSEDED / INCOMPLETE with the specific triggering PR / issue / decision plus a concrete proposed correction. Advisory only ... never edits, moves, or deletes a doc; approved wiki/Notion fixes go to the planner, approved repo-doc fixes route through scoping-and-queuing-tasks as a feature-branch PR. Do NOT use for reviewing a PR against its acceptance criteria (reviewing-completed-work) or strategy against the backlog (strategic-review).
---

# Documentation Review (Advisory Accuracy Check)

## Context
Advisory accuracy reviewer for the documentation corpus. Reads a scoped doc set, takes recently merged/closed work as ground truth, and flags the drift class where code or decisions moved but the docs did not ... stale runbooks, superseded ADRs, CLAUDE.md files describing old conventions, skills referencing deprecated systems. Phase 1 (advisory) of a three-phase path (advisory to scheduled/periodic to auto-apply); it never edits a doc.

Motivated by the 2026-07-12 session (stale skill-registry, wrong dic-skills convention, two unsynced skills ... all the same drift class).

Operator-direct (SOC), never Cyrus. Role: Development Planner throughout. Advisory only.

## Hard Boundary (read first)
- This skill MUST NOT edit, move, rename, or delete any doc. Zero doc mutations in a run ... the dry-run guarantee.
- Output is a proposal for Michael. Nothing is applied without a per-item approve.
- Approved wiki/Notion fixes are applied by the planner via the knowledge-layer tools (Obsidian / Notion MCP).
- Approved repo-doc fixes (CLAUDE.md, SKILL.md, any file in a repo) route through `scoping-and-queuing-tasks` as a feature-branch PR ... never a direct commit from this skill, and never direct-to-main (the corrected dic-skills convention is feature-branch + PR + operator squash-merge).
- An uncited drift flag is a defect. Every flag names the specific PR / issue / decision that moved. If you cannot cite the triggering work, do not flag ... note it as unverifiable instead.
- Never trust a doc's own claims or self-report. Ground truth is merged work, not what the doc says about itself.

## Step 1 ... Resolve Scope
Accept a scope token. Three kinds:

1. **Project scope** (e.g. "bespoke", "propell", "anytime", "infra") ... the doc set is that project's wiki notes + its Notion PROJECT DOCS + its repo CLAUDE.md.
2. **Doc-class scope** ... one of `runbooks` / `adrs` / `claude-md` / `skills`, across all projects.
3. **Corpus** ... the whole wiki + all CLAUDE.md files + all skills. Flag this as heavy before running (large read fan-out); confirm the operator wants the full sweep.

Resolution:
1. Read `wiki/projects/_registry.md` (Obsidian) to map a project token to its Linear team, wiki slug, Notion PROJECT DOCS, and repo path.
2. For a doc-class token, enumerate the class:
   - `runbooks` ... `wiki/**/runbooks/` (Obsidian).
   - `adrs` ... `wiki/decisions/` (Obsidian).
   - `claude-md` ... every repo CLAUDE.md across the registered repos.
   - `skills` ... every `*/SKILL.md` in dic-skills.
3. For corpus, union all of the above.

If no token is given, ask which project or doc-class ... one question, do not guess.

## Step 2 ... Enumerate the Doc Set and its Baselines
For each doc in scope, record:
- Path / location and doc class.
- **Last-updated baseline** ... frontmatter `updated` if present, else git last-commit date for repo files (`git log -1 --format=%cI -- {path}`), else Notion `last_edited`. This baseline is the drift line: only work merged/closed *after* it can have created drift.

A doc with no resolvable baseline is flagged INCOMPLETE (cannot be accuracy-checked) rather than silently skipped.

## Step 3 ... Pull the Recent-Work Signal (ground truth)
Gather the work that landed since the doc baselines. This is the ground truth against which docs are judged ... never the docs themselves.

1. **Merged PRs** ... via GitHub MCP, list PRs on the in-scope repos with `merged_at` populated since the earliest doc baseline. Use the `merged_at` timestamp, NOT the `merged` boolean (the boolean is unreliable; a populated `merged_at` is the only trustworthy merge signal). Record PR number, `merged_at`, and the surface it changed.
2. **Done Linear issues** ... via Linear MCP, list issues moved to Done/closed in the window. For each one the review leans on, verify against its linked PR that `merged_at` is populated. A Done issue with no merged PR is not ground truth ... note it and move on.
3. **Changed ADRs** ... decisions in `wiki/decisions/` whose last-commit date is newer than a doc that references or depends on them (a newer ADR can supersede an older doc).

Show at least one `merged_at` cross-check explicitly in the run output ... it is the ground-truth receipt.

## Step 4 ... Detect Drift
For each doc, classify against the recent-work signal:

- **CURRENT** ... no merged work since the baseline contradicts the doc. No action.
- **STALE** ... merged work changed something the doc describes, but the doc still describes the old state. Cite the PR / issue.
- **SUPERSEDED** ... a newer decision / ADR / doc replaced this one; it should point to or be retired in favour of the successor. Cite the superseding decision.
- **INCOMPLETE** ... the doc omits something that merged work added (a new step, flag, endpoint, convention), or has no resolvable baseline. Cite the addition.

Every non-CURRENT classification MUST cite the specific triggering PR / issue / decision. An uncited flag is a defect (see Hard Boundary).

**Mandatory deprecated-system sweep** (run over every doc in scope regardless of the recent-work window ... these are always drift):
- TASK QUEUE / TQ-IDs (the pre-Linear task tracker).
- Paperclip (the pre-Cyrus execution layer ... see `wiki/decisions/linear-cyrus-replaces-paperclip.md`).
- "direct-main permitted" / "push to main" for dic-skills (the retired convention; the current rule is feature-branch + PR + operator squash-merge).
- Any pre-Linear pipeline reference (TASK QUEUE states, Paperclip runs, old role/routing names).
- Any doc or skill referencing a retired system or convention not in the current stack.

Flag every hit ... a live reference to a retired system will mislead an agent or operator, so these default to BLOCKING unless clearly historical/archival context.

## Step 5 ... Assign Severity
Per flagged doc:
- **BLOCKING** ... will mislead an agent or operator into a wrong action (a runbook step that no longer works, a CLAUDE.md convention that contradicts the current one, a skill pointing at a retired system). Live deprecated-system references are BLOCKING by default.
- **MINOR** ... inaccurate but low-consequence (a stale link, an outdated count, a cosmetic mismatch that would not change what someone does).

## Step 6 ... Output the Drift Report
Advisory drift report, Notion-pasteable, ellipses not dashes, grouped by severity (BLOCKING first, then MINOR). Per item:
- **Doc** ... path / location and class.
- **Status** ... CURRENT / STALE / SUPERSEDED / INCOMPLETE.
- **Triggering work** ... the PR (`#NNN`, `merged_at`) / issue / decision that moved, with the cross-check.
- **Proposed correction** ... concrete: the exact text/section to change and to what, or "retire, superseded by {successor}". Never vague ("update the docs").
- **Route** ... wiki/Notion (planner applies) or repo-doc (routes through `scoping-and-queuing-tasks` as a PR).

Optional light-theme Mermaid coverage map (in-chat only, do not push to Notion) ... docs mapped to the merged work that touched their surface, so covered-vs-drifted is visible at a glance.

End by asking Michael to **approve / edit / skip** each item.

## Step 7 ... Route Approved Fixes (after operator responds)
For each approved item, per the Hard Boundary ... this skill still does not mutate anything itself:
- **Wiki / Notion fix** ... hand to the planner to apply via the knowledge-layer tools (Obsidian / Notion MCP).
- **Repo-doc fix** (CLAUDE.md, SKILL.md, any repo file) ... hand to `scoping-and-queuing-tasks` to scope a Linear issue and a feature-branch PR. For a SKILL.md change, note the post-landing steps in the queued issue: re-upload the skill to claude.ai (interactive-only) and add/refresh it in the skill-registry note.

Edited items re-enter as amended proposals; skipped items are logged as skipped.

## Step 8 ... Log the Run
Append to `wiki/doc-review/runs/{YYYY-MM-DD}.md` (Obsidian, create if absent):
- Timestamp, scope token, doc set resolved.
- Docs-reviewed count.
- Drift counts by severity (BLOCKING / MINOR) and by status (STALE / SUPERSEDED / INCOMPLETE).
- Per proposed fix: doc, status, triggering work (with the `merged_at` receipt), proposed correction, and an `approved / applied` field filled after Michael responds.

This log is the agreement-rate record ... the named Phase-3 gate metric. Auto-apply of high-confidence fixes is unlocked only once this log shows a sustained operator-agreement rate, so the `approved / applied` fields are not optional bookkeeping.

## Phase Path
- **Phase 1 (this skill)** ... advisory: flags and proposes, never edits.
- **Phase 2** ... scheduled/periodic run (Cowork / launchd) over the corpus on a cadence.
- **Phase 3** ... auto-apply high-confidence fixes, gated on the agreement rate from the Step 8 run log.

## Handback Audit (mandatory)
End every run with a HANDBACK AUDIT block per the house standard. Advisory runs normally carry 0 handbacks (the operator's approve/edit/skip is a decision pending, not a handback). A repo-doc fix that needs a re-upload to claude.ai after merge is an interactive-only handback ... record it as such when it arises.

## See Also
- `reviewing-completed-work` ... the `merged_at` ground-truth verification standard reused in Step 3 (this skill shares that discipline; it does NOT do PR-vs-AC review).
- `strategic-review` ... sibling advisory skill (strategy vs backlog); same scope-token + run-log + advisory-boundary shape. Not for doc accuracy.
- `scoping-and-queuing-tasks` ... consumes approved repo-doc fixes (owns AC, prompt, feature-branch PR, promotion).
- `session-to-skill` ... when a review surfaces a skill that should be rewritten rather than patched.
- `wiki/projects/_registry.md` ... the scope-token to doc-set mapping read in Step 1.
- `wiki/decisions/linear-cyrus-replaces-paperclip.md` ... the current-execution-model ADR the deprecated-system sweep checks against.
