---
name: hourly-supervisor-review
description: Scheduled or on-demand Supervisor that reviews Linear "In Review" issues, auto-passes verified work, and flags uncertain items via Slack DM
---

# Supervisor Review (Linear)

## Context

This skill is invoked when reviewing Linear issues sitting in the `In Review` status. It can run on a schedule (hourly cadence as a safety net) or on demand. It acts as an autonomous Supervisor that validates each issue against acceptance criteria and the linked PR, and either auto-passes verified work or flags uncertain items for human review via Slack DM.

The active execution layer is Cyrus driven by Linear. Cyrus moves issues to `In Review` after opening a PR against the configured base branch. This skill reviews what landed there.

Role: Supervisor. Do not plan or execute code ... only validate, comment, and notify.

## Resources

- **Linear MCP**: scoped to one workspace per connection. The skill operates on whichever workspace this chat is connected to.
- **GitHub MCP**: needed to read the PR linked to each issue.
- **Slack DM target**: `U0CHWC4M9`

## Workflow

### Step 0 ... Initialise Run

1. Record start time
2. Initialise counters: `tasks_reviewed = 0`, `tasks_passed = 0`, `tasks_flagged = 0`
3. Initialise arrays: `passed_ids = []`, `flagged_ids = []`, `flag_details = []`

### Step 1 ... Query In Review Queue

1. `Linear:list_issues` with `state: "In Review"`, `orderBy: "createdAt"`
2. If zero results → skip to Step 6 (clean run notification and exit)
3. Collect issue identifiers (e.g., `ANY-123`) for iteration

### Step 2 ... Per-Issue: Load Context

For each issue:

1. **Fetch the full issue** via `Linear:get_issue`
2. Read: title, description, AC (in body), team, labels, priority, assignee, attachments
3. **Skip if already reviewed**: scan recent comments for `## Supervisor Verdict`. If found with PASS / FIX-MINOR / FIX-MAJOR / REJECT, skip
4. **Find the linked PR**: Cyrus marks PRs with the issue identifier. Check the issue's attachments for a GitHub PR link first; fall back to GitHub search by issue identifier in PR title or body
5. **Fetch project context** from Obsidian (preferred) or Notion PROJECT DOCS (fallback):
   - Obsidian: `wiki/projects/{project-slug}/architecture/` and `wiki/decisions/`
   - Notion PROJECT DOCS: `{ProjectCode} ... Architecture & Decisions`, `{ProjectCode} ... Overview`

### Step 3 ... Per-Issue: Gather Evidence

**From Linear:**
- Acceptance Criteria from the issue body
- Recent comments (Cyrus typically posts a run summary)

**From GitHub (via the linked PR):**
- PR diff (`pull_request_read` get_files)
- CI status (checks)
- PR description / Cyrus run notes

**From Obsidian/Notion:**
- Architecture & Decisions for the project (drift check)

If the PR can't be located → mark as UNAVAILABLE and proceed to flag.
If CI is failing → flag automatically.

### Step 4 ... Per-Issue: Validate Acceptance Criteria

For each AC item, assess against gathered evidence:

| Criterion | Status | Evidence |
|---|---|---|
| AC1: {text} | PASS / PARTIAL / FAIL / UNVERIFIABLE | {what was observed in the PR or run output} |

**Status definitions:**
- **PASS** ... criterion is fully met with concrete evidence in the PR diff or test output
- **PARTIAL** ... criterion appears partially met but something is missing
- **FAIL** ... criterion is contradicted by evidence
- **UNVERIFIABLE** ... insufficient evidence (PR missing, CI not run, etc.)

### Step 5 ... Per-Issue: Issue Verdict and Act

**Check for drift** beyond AC:
- Files modified outside the stated scope
- New dependencies without justification
- ADR violations (compare PR diff against Architecture & Decisions)
- Commit messages reference the issue identifier

**Decision logic:**

```
IF all AC items are PASS
   AND no drift detected
   AND CI is green
THEN → AUTO-PASS
ELSE → FLAG
```

**AUTO-PASS path:**
1. Post a comment via `Linear:save_comment`:
   ```
   ## Supervisor Verdict

   **PASS**

   All {N} acceptance criteria met. CI green. No architectural drift detected.

   AC Assessment:
   - AC1: PASS — {evidence}
   - AC2: PASS — {evidence}
   ```
2. Move issue to `Done` via `Linear:save_issue` with `state: "Done"`
3. If the PR has not yet been merged and CI is green, merge via `Claude Github MCP (Personal):merge_pull_request` using the repo's default merge method (typically squash for Cyrus-generated PRs)
4. Increment `tasks_passed`, append issue identifier to `passed_ids`

**FLAG path:**
1. Leave issue status as `In Review`
2. Post a comment via `Linear:save_comment`:
   ```
   ## Supervisor Verdict

   **NOT CONFIDENT — FLAGGED FOR HUMAN REVIEW**

   AC Assessment:
   - AC1: {status} — {evidence}
   - AC2: {status} — {evidence}

   Drift check: {pass / specific issues}
   CI status: {green / failing / not run}
   Recommendation: {what needs human attention}
   ```
3. Increment `tasks_flagged`, append identifier to `flagged_ids`
4. Append details to `flag_details` for the Slack summary

### Step 6 ... Slack Notification

**Always send a Slack DM** to `U0CHWC4M9` with run results.

**Clean run (no items in queue):**
```
🟢 Supervisor Review — {timestamp}
No items in In Review queue.
```

**Items passed (none flagged):**
```
🟢 Supervisor Review — {timestamp}
Passed {N} item(s): {identifiers}
All AC verified, PRs merged.
```

**Items flagged:**
```
🟠 Supervisor Review — {timestamp}
Passed: {N} ({identifiers or "none"})
Flagged: {N} — needs your review:
• {identifier} — {title}: {reason}
```

**Error:**
```
🔴 Supervisor Review — {timestamp}
Run errored: {error description}
Items reviewed before failure: {N}
```

## Conservative Bias Rules

This skill has a strong conservative bias. It only auto-passes when confidence is high:

1. **No linked PR or PR unreachable → FLAG.** No evidence of what was done.
2. **CI failing or not run → FLAG.** Even if AC appear met.
3. **Any PARTIAL or FAIL AC → FLAG.** Even one uncertain criterion means human review.
4. **Any UNVERIFIABLE AC → FLAG.** Missing evidence is not absence of problems.
5. **Merge conflict on the PR → FLAG.** Never force-push or resolve conflicts.
6. **Suspected ADR violation → FLAG.** Let the human decide if the deviation is intentional.
7. **Files modified outside stated scope → FLAG.** Drift compounds silently.

The goal is zero false positives. A missed auto-pass costs nothing (human reviews next cycle). A false pass could ship broken code.

## Error Handling

- If Linear query fails → log error, send Slack error notification, exit
- If individual issue fetch fails → skip issue, log error, continue to next
- If GitHub MCP fails for evidence → mark CI / PR diff as UNAVAILABLE, continue with available evidence (most likely outcome: FLAG)
- If Slack send fails → log error but do not retry (avoid spam)

## Anti-Patterns

- Auto-passing an issue with no linked PR (no evidence of work)
- Auto-passing when CI is failing
- Force-merging when a regular merge fails
- Sending FIX-MINOR / FIX-MAJOR / REJECT verdicts autonomously (only PASS or FLAG ... humans issue the others)
- Skipping the Architecture & Decisions check (allows drift)
- Modifying or merging anything if the PR's `head` ref is not a Cyrus-generated branch (only operate on agent-produced PRs)
