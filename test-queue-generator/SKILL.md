---
name: test-queue-generator
description: Generates test queue entry for the day
---

# Cowork Job 1 ... Nightly Test Queue Generator

## Context

You are running a nightly automation for the Orchestrator project. Your job is to create a daily aggregated test checklist page in the TEST QUEUE database so that a human can open one Notion page and tick off test items for all tasks awaiting human verification.

## Resources

- **TASK QUEUE database**: `collection://5da08552-f08b-4734-9784-3019be7dd1a2`
- **TASK QUEUE Awaiting Test view**: `view://31b3257a-fd0a-8007-b05d-000cdfe3c733`
- **TEST QUEUE database**: `collection://31e3257a-fd0a-8007-9c35-000b8ab79a25`
- **Slack channel**: `#md_task_scoping` (ID: `C0AJZ7RKU20`)
- **Scope document**: ORCH ... Nightly Test Queue Workflow ... Scope (in PROJECT DOCS)

## Instructions

### Step 1 ... Query Awaiting Test tasks

Use `notion-query-database-view` with the Awaiting Test view URL to get all tasks currently in Awaiting Test status. For each task, note: Task ID (TQ-xxx), Name, Project, and page URL.

### Step 2 ... Read test briefs

For each Awaiting Test task, use `notion-get-comments` with `include_all_blocks: true` to read the task page's discussion thread. Look for the comment containing `## Test Brief`. Extract the full test brief content.

If a task has no `## Test Brief` comment, fall back to using the Acceptance Criteria from the task's properties instead. If neither exists, note the task as "No test criteria available ... manual review required."

### Step 3 ... Calculate carry-forward count

Search the TEST QUEUE database (`notion-search` against `collection://31e3257a-fd0a-8007-9c35-000b8ab79a25`) for the most recent TEST QUEUE page (by date, excluding today). This page may have any Status (Open, Reviewed, or Closed).

1. Use `notion-fetch` to read the previous page's content
2. Extract all task IDs (TQ-xxx) from the heading_2 blocks on that page
3. Compare those task IDs against the Awaiting Test task IDs from Step 1
4. Any task ID present on BOTH the previous page AND today's Awaiting Test list is "carried forward"
5. Count the carried-forward tasks. The remainder (Awaiting Test tasks NOT on the previous page) are "new"

If no previous TEST QUEUE page exists at all, carry-forward count is 0.

**Additional handling for previous Open pages:**

If the previous page has Status = Open (unreviewed), also check whether its tasks have partially checked items or failure comments. Tasks on the Open page that were partially checked should NOT be carried forward ... leave them on the Open page for the reviewer to handle. Only carry forward tasks from Open pages where all to-do items are still unchecked and have no failure comments.

### Step 4 ... Create today's TEST QUEUE page

Create a new page in the TEST QUEUE database with:

**Properties:**
- `Name`: "Test Checklist ... {YYYY-MM-DD}" (today's date in AEST)
- `Date`: today's date
- `Status`: Open
- `Tasks for testing`: total count of tasks (new + carried forward)
- `Carried Forward`: count of tasks carried from previous page
- `Checked Count`: 0
- `Total Actions`: total count of to-do items across all tasks

**Page content** (grouped by project, using Notion markdown):

For each project that has Awaiting Test tasks, write a `heading_1` block with the project name. Under each project heading, for each task write:

- `heading_2`: `{TQ-ID} ... {Task Name}`
- One `to_do` (unchecked) block per test brief item, formatted as: `**Action:** {action text} **Expected:** {expected text}`
- If the test brief doesn't parse into Action/Expected pairs, write each numbered item or bullet as its own `to_do` block

### Step 5 ... Close previous page (if carry-forward handled)

If a previous Open TEST QUEUE page existed and ALL of its tasks have been carried forward into today's page:
- Set the previous page's Status to "Closed"
- Update its Actions Taken: "All items carried forward to {today's date}"

If some tasks on the previous page were checked off (but the reviewer hasn't run yet), leave the previous page as Open ... the reviewer will handle it.

If the previous page has Status = Reviewed or Closed, skip this step entirely ... it has already been processed.

### Step 6 ... Post Slack summary

Send a message to `#md_task_scoping` with:

```
Test Queue ... {YYYY-MM-DD}

{N} tasks awaiting test ({M} new, {K} carried forward)

Projects: {list of project names with counts}

Checklist: {Notion URL of the new TEST QUEUE page}
```

### Decision Rules

- IF a task has been in Awaiting Test but has no test brief AND no acceptance criteria ... include it with a single to-do item: "No test criteria available ... review task manually and add acceptance criteria"
- IF a task was manually set to Done or Failed since the last generator run ... exclude it (it's no longer in the Awaiting Test view, so the view query handles this automatically)
- IF the previous Open page has tasks that were partially checked ... do NOT carry those tasks forward. Leave them on the previous page for the reviewer to handle.
- IF there are zero tasks in Awaiting Test and zero carry-forward ... do NOT create a page. Post to Slack: "Test Queue ... {date}: No tasks awaiting test."

## Output

Confirm completion with:
- Link to the created TEST QUEUE page
- Count of tasks included
- Count carried forward
- Any tasks that had missing test briefs
