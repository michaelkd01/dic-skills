---
name: hourly-supervisor-review
description: Scheduled agent that reviews in-review tasks, auto-passes verified work, and flags uncertain items via Slack DM
---

# Hourly Supervisor Review

## Context

This skill is invoked by a Claude scheduled task (hourly cadence). It acts as an autonomous Supervisor agent that reviews all tasks in the `in_review` status, validates them against the reviewing-completed-work methodology, and either auto-passes verified work or flags uncertain items for human review.

Role: Supervisor. Do not plan or execute code ... only validate, update Paperclip, and notify.

## Resources

- **Paperclip task tools**: `list_issues` (filter by `status`, `projectId`, `assigneeAgentId`), `update_issue`, `put_issue_document`, `comment_on_issue`
- **Obsidian knowledge tools**: `search_notes`, `read_note`
- **Notion PROJECT DOCS**: fallback when Obsidian doesn't have the content
- **Supervisor Review Log DB**: `collection://fd45405d-5bb1-4ad0-aaff-9ac15801649e`
- **Slack DM target**: `U0CHWC4M9`

## Workflow

### Step 0 ... Initialise Run

1. Record start time
2. Initialise counters: `tasks_reviewed = 0`, `tasks_passed = 0`, `tasks_flagged = 0`
3. Initialise arrays: `passed_ids = []`, `flagged_ids = []`, `flag_details = []`

### Step 1 ... Query In-Review Issues

1. Query Paperclip via `list_issues` with `status: 'in_review'` for each relevant company (DickBot, AnytimeInterview, Bespoke, GymToGreen, ScreenTimeMath)
2. If zero results across all companies → skip to Step 6 (log clean run and exit)
3. Collect the list of issue IDs for iteration

### Step 2 ... Per-Task: Load Context

For each issue in the queue:

1. **Read the full issue** including title, description, status, priority, labels, project, company
2. **Fetch attached documents**: check for `execution-log`, `spec`, `prompt` documents via issue document keys
3. **Skip if already reviewed**: If a `supervisor-review` document exists with a verdict of `PASS`, `FIX-MINOR`, `FIX-MAJOR`, or `REJECT` → skip this issue (already handled)
4. **Skip if manual-review-only**: If the issue has a `manual-review-only` label → skip (requires human review)
5. **Fetch project context**:
   - Search Obsidian via `search_notes` for `{ProjectCode} Architecture & Decisions`; fall back to Notion PROJECT DOCS only if Obsidian returns nothing
   - Search Obsidian via `search_notes` for `{ProjectCode} Overview`; fall back to Notion PROJECT DOCS only if Obsidian returns nothing

### Step 3 ... Per-Task: Gather Evidence

Use available tools to collect evidence for AC validation:

**From Paperclip:**
- Read the `execution-log` document (primary evidence of what was done)
- Read the `spec` document for acceptance criteria

**From Filesystem (MCP):**
- Verify file existence for any AC referencing specific files/paths
- Read key files mentioned in AC to confirm content

**From osascript (shell commands):**
- `cd {Repo Path} && git log --oneline -5` → recent commits, confirm work was committed
- `cd {Repo Path} && git status` → confirm clean working tree
- If feature-branch: `cd {Repo Path} && git log main..HEAD --oneline` → branch-specific commits
- If the project has a test command (check CLAUDE.md or project conventions):
  - Run the test suite and capture pass/fail
- If the project has a lint command:
  - Run lint and capture output

**Evidence collection rules:**
- If osascript fails or Repo Path doesn't exist → mark evidence as UNAVAILABLE, do not fail the entire run
- If Filesystem read fails → mark as UNAVAILABLE
- Timeout: If any single command takes >60s, kill it and mark UNAVAILABLE

### Step 4 ... Per-Task: Validate Acceptance Criteria

For each AC item, assess against gathered evidence:

| Criterion | Status | Evidence |
|---|---|---|
| AC1: {text} | PASS / PARTIAL / FAIL / UNVERIFIABLE | {what was observed} |
| AC2: {text} | PASS / PARTIAL / FAIL / UNVERIFIABLE | {what was observed} |

**Status definitions:**
- **PASS** ... criterion is fully met with concrete evidence
- **PARTIAL** ... criterion appears partially met but something is missing
- **FAIL** ... criterion is contradicted by evidence
- **UNVERIFIABLE** ... insufficient evidence to determine (no execution log, files missing, command failed)

### Step 5 ... Per-Task: Issue Verdict and Act

**Check for drift** (beyond AC):
- Commit messages reference the issue
- Branch strategy was followed
- No obvious ADR violations based on Architecture & Decisions doc

**Decision logic:**

```
IF all AC items are PASS
   AND no drift detected
   AND execution log document is non-empty
THEN → AUTO-PASS
ELSE → FLAG
```

**AUTO-PASS path:**
1. Update issue via `update_issue`: set `status` → `done`
2. Attach supervisor review via `put_issue_document` with `key: "supervisor-review"`:
   ```
   [SVR-{RunID} {timestamp}] AUTO-PASS: All AC verified by supervisor agent.
   ```
3. If Branch Strategy == `feature-branch`:
   - Run merge sequence via osascript:
     ```
     cd {Repo Path} && git fetch origin && git checkout main && git merge --ff-only {branch} && git push origin main && git branch -D {branch}
     ```
   - If merge fails → revert to FLAG path, note merge failure
4. If the task targets a Vercel project, rely on the per-project deploy hook configured in that project's Architecture doc (Obsidian first, Notion fallback)
5. Increment `tasks_passed`, append issue ID to `passed_ids`

**FLAG path:**
1. Leave `status` as `in_review`
2. Add flag comment via `comment_on_issue`:
   ```
   [SVR-{RunID}] Supervisor Review — NOT CONFIDENT

   AC Assessment:
   - AC1: {status} — {evidence}
   - AC2: {status} — {evidence}

   Drift check: {pass/issues}
   Recommendation: {what needs human attention}
   ```
3. Increment `tasks_flagged`, append issue ID to `flagged_ids`
4. Append details to `flag_details` for Slack summary

### Step 6 ... Log Run to Supervisor Review Log

Create a page in the Supervisor Review Log DB (`collection://fd45405d-5bb1-4ad0-aaff-9ac15801649e`):

| Property | Value |
|---|---|
| Run | `Supervisor Review — {YYYY-MM-DD HH:MM}` |
| Status | `Clean Run` (0 tasks) / `Tasks Passed` (all passed) / `Tasks Flagged` (any flagged) / `Error` (if run errored) |
| Tasks Reviewed | `{tasks_reviewed}` |
| Tasks Passed | `{tasks_passed}` |
| Tasks Flagged | `{tasks_flagged}` |
| Passed Task IDs | `{comma-separated passed_ids}` |
| Flagged Task IDs | `{comma-separated flagged_ids}` |
| Run Duration (s) | `{elapsed seconds}` |
| Summary | Brief natural language summary of what happened |
| Errors | Any errors encountered during the run (empty if clean) |

### Step 7 ... Slack Notification

**Always send a Slack DM** to `U0CHWC4M9` with run results:

**Clean run (no tasks):**
```
🟢 Supervisor Review — {timestamp}
No tasks in in_review status.
```

**Tasks passed (none flagged):**
```
🟢 Supervisor Review — {timestamp}
Passed {N} task(s): {issue IDs}
All AC verified, deployed.
```

**Tasks flagged:**
```
🟠 Supervisor Review — {timestamp}
Passed: {N} ({issue IDs or "none"})
Flagged: {N} — needs your review:
• {issue ID} — {task name}: {reason}
• {issue ID} — {task name}: {reason}
```

**Error:**
```
🔴 Supervisor Review — {timestamp}
Run errored: {error description}
Tasks reviewed before failure: {N}
```

## Conservative Bias Rules

This agent has a strong conservative bias. It only auto-passes when confidence is high:

1. **Empty execution log document → always FLAG.** No evidence of what was done.
2. **Any PARTIAL or FAIL AC → always FLAG.** Even one uncertain criterion means human review.
3. **Any UNVERIFIABLE AC → always FLAG.** Missing evidence is not absence of problems.
4. **Merge conflict → FLAG and leave branch unmerged.** Never force-push or resolve conflicts.
5. **Test failure → FLAG.** Even if all AC appear met, a failing test suite blocks auto-pass.
6. **ADR violation suspected → FLAG.** Let the human decide if the deviation is intentional.

The goal is zero false positives. A missed auto-pass costs nothing (human reviews it next cycle). A false pass could ship broken code.

## Error Handling

- If Paperclip query fails → log error, send Slack error notification, exit
- If individual issue fetch fails → skip issue, log error, continue to next
- If osascript/Filesystem fails for evidence → mark evidence UNAVAILABLE, continue validation with available evidence
- If Slack send fails → log error but do not retry (avoid spam)
- If Supervisor Review Log write fails → log to console, do not block run completion

## Anti-Patterns

- Auto-passing a task with no execution log document (no evidence of work)
- Auto-passing when test suite fails
- Force-merging when ff-only fails
- Sending FIX/REJECT verdicts autonomously (only PASS or FLAG)
- Skipping Architecture & Decisions check (allows drift)
