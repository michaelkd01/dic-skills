---
name: tq-triage
description: Nightly triage of failed and blocked tasks with deep root-cause analysis
---

# Orchestrator Nightly Review ... Failed & Blocked Task Triage

## Context

You are running the Orchestrator Nightly Review. Read the workflow document at https://www.notion.so/31e3257afd0a817f8e5cea831f4c358e for full instructions.

Your job is to autonomously recover Failed and Blocked tasks by performing genuine root-cause analysis. Do not pattern-match error strings and blindly reset. Understand WHY the task broke before deciding what to do about it.

## Resources

- **TASK QUEUE database**: `collection://5da08552-f08b-4734-9784-3019be7dd1a2`
- **TASK QUEUE Blocked - Failed view**: `view://3183257a-fd0a-80d5-a23f-000c635b11ca`
- **Slack channel**: `#md_sched_task_notif` (ID: `C0ALHNZV623`)
- **Slack MCP tool**: `mcp__df83bf65-c74e-444c-bcc0-0aa31f18d29a__slack_send_message` ... use ToolSearch to fetch this tool before calling it

## Instructions

### Step 1 ... Gather the queue

Query the TASK QUEUE Blocked - Failed view (`view://3183257a-fd0a-80d5-a23f-000c635b11ca`) to get all tasks with Status = Failed or Blocked. For each task, read and internalise ALL of the following before making any decision:
- Name, Task ID, Project, Task Type, Category
- Acceptance Criteria (the original intent ... what "done" looks like)
- Execution Log (what actually happened)
- Blocked Reason (if Status = Blocked)
- Iterations Used vs Max Iterations
- Retry Count and Max Retries
- Shared Files (cross-task dependency signal)
- Repo Path

### Step 2 ... Deep context gathering (per task)

Before diagnosing, fetch the task's project context from Notion:
1. Search for the project's Architecture & Decisions doc (naming convention: `{ProjectCode} ... Architecture & Decisions`)
2. Search for the project's Overview doc (`{ProjectCode} ... Project Overview`)
3. Read the task's Notion page comments (`notion-get-comments`) for any prior triage notes or escalation history

This gives you the original architectural intent, known constraints, and any decisions that should inform the fix. If a doc is not found, note it and proceed with available context.

### Step 3 ... Root cause diagnosis (per task)

Work through this diagnostic framework IN ORDER. Do not skip to a fix.

**A. UNDERSTAND INTENT**
What was this task trying to achieve? Restate the goal in one sentence from the Acceptance Criteria and project context.

**B. RECONSTRUCT THE FAILURE**
Read the Execution Log carefully. Identify:
- The last meaningful action before failure
- The specific error or stall point
- Whether the task made partial progress or no progress at all
- Whether the failure is in the task's logic, or in its environment/dependencies

**C. CLASSIFY THE ROOT CAUSE**
Assign exactly one primary cause:

- `BUDGET_EXHAUSTED`: Task ran out of iterations but was making progress. Evidence: Iterations Used >= Max Iterations AND log shows incremental progress.
- `SCOPE_TOO_LARGE`: Acceptance Criteria has too many concerns for a single task. Evidence: AC has 5+ distinct requirements, or log shows the agent jumping between unrelated files.
- `PROMPT_DEFICIENCY`: The execution prompt is ambiguous, missing critical context, or gives contradictory instructions. Evidence: log shows the agent misinterpreting intent, going in circles, or doing something unrelated to the AC.
- `TEST_FAILURE`: Code was written but tests fail. Evidence: specific test names and assertion errors in the log.
- `DEPENDENCY_BLOCKED`: Task depends on another task, external service, or file that is not available. Evidence: Blocked Reason references another task ID, or log shows file-not-found / import errors for modules that do not exist yet.
- `ENVIRONMENT_ISSUE`: Infrastructure or tooling problem unrelated to the task logic. Evidence: timeout errors, network failures, permission denied, tool crashes.
- `STALE_CONTEXT`: The codebase has changed since the task was planned. Evidence: log references files, functions, or APIs that no longer exist or have moved.
- `UNKNOWN`: Cannot determine root cause from available information.

**D. FORM A RECOVERY HYPOTHESIS**
Based on the root cause, what specifically needs to change for this task to succeed on the next attempt? Be concrete. "Try again" is not a hypothesis.

### Step 4 ... Decide and act (per task)

**Circuit breakers (check FIRST):**
- If Retry Count >= 2: DO NOT RESET. Add a detailed diagnostic comment explaining the root cause, the pattern of repeated failure, and recommend manual review. Move on.
- If this task was already reset by a previous nightly review (check comments for `[Nightly Triage]` entries): DO NOT RESET AGAIN. Add comment with new diagnosis and escalation note. Move on.
- Never reset a task more than once per night.

**If circuit breakers pass, act based on root cause:**

**BUDGET_EXHAUSTED:**
- Increase Max Iterations by 50% (cap at 20)
- Clear Execution Log
- Clear Blocked Reason
- Set Status = Ready
- Add comment: `[Nightly Triage] Root cause: BUDGET_EXHAUSTED at {N} iterations with progress. Bumped to {new_max}. Last progress point: {description}.`

**SCOPE_TOO_LARGE:**
- Leave Status as-is (do NOT reset)
- Add comment: `[Nightly Triage] Root cause: SCOPE_TOO_LARGE. Recommend decomposition into: {suggest 2-3 smaller tasks with scoped AC}. Escalating for manual split.`

**PROMPT_DEFICIENCY:**
- Rewrite the Execution Log field with a corrected execution approach. The rewrite must:
  - Preserve the original Acceptance Criteria (do not change what "done" means)
  - Fix the specific ambiguity or gap identified in diagnosis
  - Add explicit constraints or sequencing that was missing
  - Reference the Architecture & Decisions doc findings if relevant
- Clear Blocked Reason
- Set Status = Ready
- Increment Retry Count by 1
- Add comment: `[Nightly Triage] Root cause: PROMPT_DEFICIENCY. Issue: {specific problem}. Rewrote execution approach to address: {what changed}.`

**TEST_FAILURE:**
- Append to the Execution Log: `RECOVERY NOTE: Previous attempt failed tests: {test names}. Specific failures: {assertion details}. Fix these tests before addressing any other AC items.`
- Clear Blocked Reason
- Set Status = Ready
- Increment Retry Count by 1
- Add comment: `[Nightly Triage] Root cause: TEST_FAILURE. {N} tests failing. Added recovery notes with specific failure details.`

**DEPENDENCY_BLOCKED:**
- Check if the blocking dependency is now resolved (search for the referenced task ID and check its status, or verify the missing file/module now exists)
- If resolved: Clear Blocked Reason, set Status = Ready, add comment noting the dependency is now available
- If still unresolved: Leave as Blocked, update Blocked Reason with current dependency status, add comment: `[Nightly Triage] Still blocked on {dependency}. Current status of blocker: {status}.`

**ENVIRONMENT_ISSUE:**
- If it looks transient (timeout, network): Set Status = Ready, clear Execution Log, add comment noting transient environment issue
- If it looks systemic (permissions, missing tool): Leave as Failed, add comment with detailed diagnosis

**STALE_CONTEXT:**
- Rewrite the Execution Log with updated file paths, function names, or API references based on current project docs
- Clear Blocked Reason
- Set Status = Ready
- Increment Retry Count by 1
- Add comment: `[Nightly Triage] Root cause: STALE_CONTEXT. Updated references: {list what changed}.`

**UNKNOWN:**
- Leave Status as-is
- Add comment: `[Nightly Triage] Unable to determine root cause. Execution log analysis: {summary of what was observed}. Recommend manual review.`

### Step 5 ... Post Slack summary

Use the `slack_send_message` MCP tool to post the summary. You MUST fetch this tool via ToolSearch before calling it. The exact call is:

```
Tool: mcp__df83bf65-c74e-444c-bcc0-0aa31f18d29a__slack_send_message
Parameters:
  channel_id: "C0ALHNZV623"
  message: <summary below>
```

Message format:

```
Nightly Triage Complete ... {YYYY-MM-DD}

{N} tasks assessed
- Reset to Ready: {M} ({list Task IDs and root causes})
- Left as Failed/Blocked: {K} ({list Task IDs and reasons})
- Escalated (retry limit): {J} ({list Task IDs})
```

If there were zero tasks in the Blocked - Failed view, post: `Nightly Triage ... {date}: No failed or blocked tasks. Queue is clean.`

## Output

Confirm completion with the Slack summary content and a count of tasks processed.
