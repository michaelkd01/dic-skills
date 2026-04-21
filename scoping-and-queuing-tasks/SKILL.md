---
name: scoping-and-queuing-tasks
description: Procedural checklist for scoping a task from first mention to queued with a Claude Code prompt
---

# Task Scoping Workflow

## Context

This workflow is triggered whenever the user references a task to work on, whether by issue ID, name, or description. It covers the full path from "let's do X" to a task that is queued with a validated Claude Code prompt.

All status transitions must comply with the ADR-003 valid_transitions map. Invalid transitions are rejected by the state machine in code.

Role: Development Planner throughout. Switch to Supervisor only if validating a completed execution.

## Resources

- **Paperclip task tools**: `list_issues` (search/filter by `status`, `projectId`, `assigneeAgentId`), `create_issue`, `update_issue`, `put_issue_document` (attach specs, plans, prompts, logs)
- **Obsidian knowledge tools**: `search_notes` (content or frontmatter), `read_note` (by path)
- **Notion PROJECT DOCS**: fallback when Obsidian doesn't have the content

## Workflow

### Step 1 ... Identify the Task

Determine whether this is an existing task or a new one.

**Existing task:**
1. Search Paperclip via `list_issues` with a `q` query matching issue ID or title
2. Read the issue details: title, status, priority, description, labels, project, company, parent, assignee
3. Fetch any attached documents via issue document keys (e.g., `spec`, `prompt`, `execution-log`)

**New task:**
1. Confirm scope with the user before creating
2. Determine the target project and company
3. Skip to Step 4 (Create/Update Task)

### Step 2 ... Gather Project Context

Before scoping or producing a prompt, ALWAYS fetch these project docs:

1. **Architecture & Decisions** ... search Obsidian via `search_notes` for `{ProjectCode} Architecture & Decisions`; fall back to Notion PROJECT DOCS only if Obsidian returns nothing
2. **Overview** ... search Obsidian via `search_notes` for `{ProjectCode} Overview`; fall back to Notion PROJECT DOCS only if Obsidian returns nothing
3. **CLAUDE.md** ... if the task involves code, check project knowledge for the repo's CLAUDE.md

Read enough to understand:
- Current architecture and constraints
- Existing ADRs that might affect this task
- Tech stack, test commands, lint commands
- Any prior decisions that this task must respect

**Do not skip this step.** Past incidents have occurred where prompts contradicted existing architecture because this step was skipped.

### Step 3 ... Validate / Refine Acceptance Criteria

Review the existing AC (or draft new AC) against:

- [ ] Each criterion is independently verifiable
- [ ] No criterion is ambiguous ("improve performance" is bad; "reduce query time from 2s to <500ms" is good)
- [ ] Criteria reference specific files or modules where possible
- [ ] Criteria do not contradict Architecture & Decisions doc
- [ ] Scope is achievable within Max Iterations (default 15, increase for complex tasks)
- [ ] If this is a re-run of a failed task: read the execution log document to understand what went wrong, and adjust AC or add recovery notes accordingly

If AC needs changes, propose them to the user and get confirmation before proceeding.

### Step 3.5 ... Generate Test Specification

**Applies to:** Code tasks (Task Type = Code). Skip for Scaffold, Management, and Research tasks. Also skip if the task has Skip Tests = YES.

**Purpose:** Define the test contract BEFORE any implementation code is written. The executor's job becomes "make these tests pass" ... not "write tests and code and hope they agree."

**Procedure:**

1. For each acceptance criterion, generate at least one test case:
   - Test name (descriptive, `test_<what_it_verifies>` format)
   - Test type: unit / integration / e2e
   - Input: what setup or data is required
   - Expected outcome: exact assertion
   - File location: where this test should live (e.g., `tests/test_<module>.py`, `__tests__/<component>.test.tsx`)

2. Add edge case and error path tests:
   - Invalid inputs (null, empty, wrong type)
   - Boundary conditions
   - Error responses (4xx, exceptions)
   - Concurrency or race conditions (if relevant)

3. Validate test spec:
   - [ ] Every AC item has at least one corresponding test
   - [ ] No test is trivially self-fulfilling (e.g., `expect(true).toBe(true)`)
   - [ ] Test scope does not exceed task scope (no gold-plating)
   - [ ] Tests reference the project's test runner from CLAUDE.md
   - [ ] Test file paths follow project conventions

4. **Supervisor validation:**
   - Hand the test spec to the Supervisor role for validation
   - Supervisor checks the four criteria above
   - If all pass ... auto-approved, proceed to Step 4
   - If any fail ... flag to user via Slack DM with specific deficiency
   - Task cannot move to `todo` until test spec is approved

5. Record the approved test spec by attaching it to the issue via `put_issue_document` with `key: "test-spec"`. The execution prompt will reference it.

**Output format:**

```
## Test Specification

### Tests for AC1: {criterion text}
- test_<n>: {description}. Assert: {expected outcome}. File: {path}

### Tests for AC2: {criterion text}
- test_<n>: {description}. Assert: {expected outcome}. File: {path}

### Edge Cases
- test_<n>: {description}. Assert: {expected outcome}. File: {path}

### Test Runner
Command: {from CLAUDE.md, e.g., pytest, npm run test}
Coverage target: all new/modified code paths
```

### Step 4 ... Create or Update the Task in Paperclip

**Required fields for `create_issue`:**

| Field | Rule |
|---|---|
| `title` | Descriptive, imperative form |
| `companyId` | Target company. Use DickBot for infrastructure/cross-cutting work. Use the specific company (AnytimeInterview, Bespoke, GymToGreen, ScreenTimeMath) when the task clearly belongs to one. When in doubt, prefer the most specific match. |
| `projectId` | Target project within the company |
| `status` | See decision rules below |
| `priority` | `critical` / `high` / `medium` / `low` |
| `description` | See description template below |

**Optional fields:**

| Field | Rule |
|---|---|
| `labelIds` | Labels for categorisation (e.g., `manual`, `scaffold`, `bug`, `feature`, `chore`) |
| `assigneeAgentId` | Agent assigned to execute |
| `parentId` | Parent issue ID (for sub-tasks) |

**Description template:**

The issue `description` should contain structured metadata and context:

```
## Task Details
- **Task Type:** Code / Management / Research / Scaffold
- **Category:** Bug / Chore / Feature
- **Branch Strategy:** feature-branch / direct-main
- **Repo Path:** /Users/michaeldavidson/Developer/{repo}
- **Max Iterations:** {default 15, increase for complex tasks}
- **Human Hours Est:** {see estimation guide below}

## Acceptance Criteria
{Validated in Step 3}
```

Attach the full spec (if lengthy) via `put_issue_document` with `key: "spec"`.

**Status decision rules:**

- New task, fully scoped with prompt: **`todo`**
- New task, not yet fully scoped: **`backlog`**
- Task requiring manual user execution: **`backlog`** with a `manual` label (user pulls when ready)
- Management task (no code changes): do NOT create an issue ... handle directly in chat
- Move to **`in_progress`** when started
- Move to **`in_review`** when awaiting test/validation
- Move to **`done`** on pass

**Human Hours Estimation Guide:**

Estimate how long this task would take a competent human developer working manually (no AI). This is the baseline for leverage ratio reporting.

| Estimate | When to use |
|---|---|
| 0.25 | Single-file change, config tweak, scaffold, property backfill |
| 0.5 | Small feature or fix touching 1-3 files with tests |
| 1.0 | Multi-file feature, new API route, moderate refactor |
| 2.0 | Cross-cutting change, new subsystem, significant architecture work |
| 3.0+ | Large feature spanning multiple modules, new project phase |

When in doubt, round up. An overestimate is better than a missing estimate.

**Validation gate (before proceeding to Step 5):**

Verify every required field is set. Specifically check:
- [ ] Human Hours Est is included in the description and > 0
- [ ] Repo Path is an absolute path (starts with `/Users/`)
- [ ] Branch Strategy is specified in the description

Do not produce a Claude Code prompt until all three are confirmed.

### Step 5 ... Produce the Claude Code Prompt

Follow the **writing-execution-prompts** skill exactly. Key reminders:

1. Read the current state of target files before writing the prompt (use project knowledge search, or instruct Step 1 of the prompt to `cat` the file)
2. All paths fully qualified
3. Git identity block present
4. Commit/push as final step
5. Rules block present
6. Concurrency classification stated
7. **Test Contract section present** (for Code tasks with approved test spec)

Attach the prompt to the Paperclip issue via `put_issue_document` with `key: "prompt"`.

Deliver the prompt as a linked Markdown artifact.

### Step 6 ... Provide the Execution Command

After delivering the prompt, provide the command to start Claude Code:

```
cd ~/Developer/{repo} && claude
```

If feature-branch, also provide the post-execution merge sequence:

```
git fetch origin && git checkout -b {branch} origin/{branch} && git checkout main && git merge --ff-only {branch} && git push origin main && git branch -D {branch}
```

### Step 7 ... Deploy Reminder

Every completed fix must include deployment:

- **Feature-branch:** merge sequence → push to main → Vercel auto-deploys (or trigger deploy hook)
- **Direct-main:** `git push origin main` → Vercel auto-deploys
- **Deploy hook (if needed):** Check the project's Architecture doc (Obsidian first, Notion fallback) for the per-project deploy hook URL

## Common Mistakes to Avoid

- Forgetting to include Human Hours Est in the description (breaks leverage ratio reporting, frequently missed)
- Forgetting to include Repo Path in the description (causes confusion about target repo)
- Not checking Architecture & Decisions before scoping (causes architectural drift)
- Creating Management tasks as issues (they fail on git commit)
- Using `~/Developer/` instead of `/Users/michaeldavidson/Developer/` in Repo Path
- Skipping Step 3.5 for Code tasks (executor writes both tests and code, defeating independence)
- Approving a test spec that only covers happy paths (edge cases catch most bugs)
- Producing prompts that require human substitution of any value

## Project → Repo Path Mapping

| Project | Repo Path |
|---|---|
| AIAssistant | /Users/michaeldavidson/Developer/ai-assistant |
| AIFund | /Users/michaeldavidson/Developer/aifund-phase3 |
| AI-BOS | /Users/michaeldavidson/Developer/ai-bos |
| Arc | /Users/michaeldavidson/Developer/lifestyle-design |
| Bespoke | /Users/michaeldavidson/Developer/bespoke-landing-page |
| BIStack | /Users/michaeldavidson/Developer/bi-reports |
| CaddieAI | /Users/michaeldavidson/Developer/CaddieAI |
| ContextEngine | /Users/michaeldavidson/Developer/context-engine |
| Delegator | /Users/michaeldavidson/Developer/delegator |
| Propell | /Users/michaeldavidson/Developer/Propell SF |
| RightPeople | /Users/michaeldavidson/Developer/right-people |
| ScreenTimeMath | /Users/michaeldavidson/Developer/ScreenTimeMath |
| SOABridge | /Users/michaeldavidson/Developer/soa-bridge |
