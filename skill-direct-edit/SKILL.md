---
name: skill-direct-edit
description: Planner-direct procedure for landing a small, self-contained edit to an existing skill's SKILL.md in the dic-skills repo (or creating a new single-file skill) WITHOUT spinning up a Claude Code executor. The planner edits via GitHub MCP on a fresh branch, opens a PR, waits for the packaging CI to commit the refreshed .skill, verifies the PR diff is exactly the intended change, then squash-merges. Use this WHENEVER you are about to directly edit, tweak, fix, reword, or add a rule or section to a skill and you already hold or can fetch the exact content ... triggers include "edit the {skill} skill", "fix the {skill} skill", "update {skill} SKILL.md", "add a rule to {skill}", "tweak the {skill} skill", "land this skill edit directly", or any moment you would otherwise start hand-editing a SKILL.md. Do NOT use for multi-file or resource-bearing skills, skills needing code or assets, or brand-new skills that ship resources (those go through scoping-and-queuing-tasks and a Claude Code executor, or starting-a-new-project); do NOT use for non-skill repo code.
---

# Skill Direct Edit (Planner-Direct)

## Context
The lane for landing a small, self-contained edit to a skill's `SKILL.md` in the `dic-skills` repo without spinning up a Claude Code executor. The planner already holds (or fetches) the exact content, edits via GitHub MCP on a fresh branch, lets the packaging CI refresh the `.skill`, verifies the PR diff, and squash-merges. It is the sibling of `writing-execution-prompts`: that skill routes work THROUGH an executor; this one is "when NOT to ... do the micro-edit yourself, with a PR-diff verify as the safety net."

Role: Development Planner, executing directly. This is the one sanctioned exception to "the planner delegates all file changes" ... it applies ONLY to small text edits of skills or docs, never to production code, and only with the PR-diff verify gate below. Routing tiny doc edits through an executor proved heavier and, worse, introduced branch contamination (SOC-163), so this lane exists to remove that risk, not to bypass review.

## When to use
- A small, self-contained edit to ONE existing skill's `SKILL.md` (add or adjust a rule, section, worked example, or wording), where you hold or can fetch the exact content.
- A brand-new SINGLE-FILE skill (a `SKILL.md` with no resources, no code, no assets).

## When NOT to use (route elsewhere)
- Multi-file skills, or skills with `references/`, `assets/`, scripts, or any binary or code ... use `scoping-and-queuing-tasks` and a Claude Code executor.
- A brand-new skill that ships resources ... use `starting-a-new-project`.
- Any non-skill repo code, or anything needing a Test Contract ... executor work.
- If you cannot state the exact final content, or the change spans several files ... do not use this lane.

## Hard Boundaries (read first)
- Edit ONE text file (`SKILL.md`) per run. Never hand-craft the binary `.skill` ... the packaging CI owns it (`wiki/decisions/skill-packaging-standard.md`).
- Never squash-merge before the refreshed `.skill` is present on the PR branch. Merging the folder with a stale `.skill` reintroduces exactly the drift the packaging standard exists to prevent.
- Never reuse a leftover branch. Cut a fresh ticket-named branch off `main` and confirm it carries no commits vs main (SOC-163: a reused branch bundled unrelated work onto a mis-scoped PR).
- Always verify the PR diff is EXACTLY the intended change before merging. This is the load-bearing step ... it catches transcription drift and contamination that a self-report cannot.

## Procedure
1. Fit check. Confirm the change is one text file and you hold the exact final content. If not, STOP and route to the executor lane.
2. Fetch authoritative source. For an edit: `get_file_contents` on `<skill>/SKILL.md` at `ref=main` and record the returned blob sha. For a new single-file skill: skip.
3. Apply the exact change to the fetched content (or author the new `SKILL.md`). Preserve everything else byte-for-byte. House style: ellipses not dashes; zero em-dashes in added content.
4. Fresh branch. Create a ticket-named branch off `main` (e.g. `soc-<n>-<slug>`) and confirm `git log --oneline main..HEAD` is empty.
5. Write. `create_or_update_file` with the full content plus the fetched sha (edit), or as a new file (create).
6. Open the PR against `main`, body ending with the `<!-- not-cyrus -->` marker.
7. Wait for packaging CI. The `package-skills` Action repackages the skill and commits the refreshed `<skill>/<skill>.skill` onto the PR branch. Poll the PR files or the Action run until that commit lands. If CI fails, STOP and report ... do not merge.
8. Verify the diff. `pull_request_read` (get_files) must show EXACTLY: the intended change to `<skill>/SKILL.md`, plus the updated `<skill>/<skill>.skill`, and nothing else. Any extra file or unexpected hunk ... STOP, do not merge, remediate.
9. Squash-merge.
10. Verdict and close. Post a one-paragraph verdict (what changed, the merge sha, the diff-verify result); mark any tracking issue Done.
11. Downstream (not part of the merge). The skill is not live until it is on the Mini and re-uploaded: emit a Mini-sync reminder (a separate `git pull`, which brings both the folder and the `.skill`), and note the claude.ai re-upload is manual and interactive.

## Lifecycle (three hops; this skill owns only the first)
`skill-direct-edit` (edit then PR then CI `.skill` then verify then merge) then Mini `git pull` (separate) then claude.ai re-upload (manual, interactive).

## Handback Audit (mandatory)
End every run with a HANDBACK AUDIT block. A direct-edit run normally carries 0 handbacks; the Mini pull and the claude.ai upload are decisions pending or operator steps, not handbacks.

## See Also
- `writing-execution-prompts` ... the executor lane; use it when this skill's boundaries are exceeded.
- `reviewing-completed-work` ... the PR-diff-vs-ground-truth verify discipline reused in Step 8.
- `scoping-and-queuing-tasks` ... route here for anything beyond a single-file text edit.
- `starting-a-new-project` ... for multi-file new skills.
- `wiki/decisions/skill-packaging-standard.md` ... why Step 7 waits for CI (the `.skill` is CI-owned).
