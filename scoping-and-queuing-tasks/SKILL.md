---
name: scoping-and-queuing-tasks
description: Procedural checklist for scoping a task from first mention to Ready with a Claude Code prompt
---

# Task Scoping Workflow

## Context

This workflow is triggered whenever the user references a task to work on, whether by issue ID, name, or description. It covers the full path from "let's do X" to a task that is ready for execution with a validated prompt.

Role: Development Planner throughout. Switch to Supervisor only if validating a completed execution.

## Resources

- **TASK SYSTEM**: Paperclip issues via API (`$PAPERCLIP_API_URL/api/companies/$PAPERCLIP_COMPANY_ID/issues`)
- **PROJECT DOCS database** (Notion): `3083257a-fd0a-8088-bbcc-000bdd488971`
- **Architecture & Decisions page** (Notion): `3163257a-fd0a-8171-894a-eb2b6a0d297d`

## Workflow

### Step 1 ... Identify the Task

Determine whether this is an existing task or a new one.

**Existing task:**
1. Search Paperclip issues by name or ID (GET `/api/companies/{companyId}/issues`)
2. Read the full issue including description and comments
3. Extract properties from the description metadata block (if present): Project, Task Type, Category, Priority, Branch Strategy, Max Iterations, Repo Path, Acceptance Criteria

**New task:**
1. Confirm scope with the user before creating
2. Determine the target project
3. Skip to Step 4 (Create/Update Task)

### Step 2 ... Gather Project Context

Before scoping or producing a prompt, ALWAYS fetch these project docs:

1. **Architecture & Decisions** ... search PROJECT DOCS for `{ProjectCode} ... Architecture & Decisions`
2. **Overview** ... search PROJECT DOCS for `{ProjectCode} ... Overview`
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
- [ ] If this is a re-run of a failed task: read the execution log comments to understand what went wrong, and adjust AC or add recovery notes accordingly

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
   - If any fail ... flag to user with specific deficiency
   - Task cannot proceed until test spec is approved

5. Record the approved test spec in the issue description or as a comment. The execution prompt will reference it.

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

### Step 4 ... Create or Update the Paperclip Issue

**Required fields for every issue:**

| Field | Location | Rule |
|---|---|---|
| Title | Issue title | Descriptive, imperative form |
| Status | Issue status | See decision rules below |
| Project | Issue project | Must match a Paperclip project in this company |
| Assignee | Issue assignee | Set to the appropriate agent |
| Description | Issue body | Contains AC, metadata block, and execution prompt |

**Description metadata block** (include at top of every issue description):

```
<!-- metadata -->
task_type: Code | Scaffold | Management | Research
category: Bug | Chore | Feature
priority: 0-Extreme | 1-High | 2-Mid | 3-Low
branch_strategy: feature-branch | direct-main
max_iterations: 15
repo_path: /Users/michaeldavidson/Developer/{repo}
execution_method: Pipeline | Manual
<!-- /metadata -->

## Acceptance Criteria

{validated AC from Step 3}
```

**Status decision rules (Paperclip statuses):**

- Pipeline task: **todo** assigned to Executor ... the execution prompt is in the description, Executor picks it up on next heartbeat
- Needs Pre-planner scoping: **todo** assigned to Pre-planner
- Manual task: **todo** assigned to no one, labelled "manual" ... you grab the prompt and run it manually
- Needs more scoping: **backlog** (not yet ready for any agent)
- Management task (no code changes): do NOT create an issue ... handle directly in chat

**For re-running a failed task:**
- Set status back to todo
- Clear the execution log (or add a comment noting the reset)
- Assign to Executor

### Step 5 ... Produce the Claude Code Prompt

Follow the **writing-execution-prompts** skill exactly. Key reminders:

1. Read the current state of target files before writing the prompt (use project knowledge search, or instruct Step 1 of the prompt to `cat` the file)
2. All paths fully qualified
3. Git identity block present
4. Commit/push as final step
5. Rules block present
6. Concurrency classification stated
7. **Test Contract section present** (for Code tasks with approved test spec)

Deliver the prompt as a linked Markdown artifact.

Include the execution prompt in the Paperclip issue description (after the metadata block and AC).

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
- **Deploy hook (if needed):** `POST https://api.vercel.com/v1/integrations/deploy/prj_VHyn5vDslqsoX6d1LMpa16y7X2bC/YpADhlKz4b`

## Common Mistakes to Avoid

- Not checking Architecture & Decisions before scoping (causes architectural drift)
- Skipping Step 3.5 for Code tasks (executor writes both tests and code, defeating independence)
- Approving a test spec that only covers happy paths (edge cases catch most bugs)
- Using `~/Developer/` instead of `/Users/michaeldavidson/Developer/` in Repo Path
- Producing prompts that require human substitution of any value
- Creating Management tasks as issues (they fail on git commit)

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
| Orchestrator | /Users/michaeldavidson/Developer/orchestrator |
| Propell | /Users/michaeldavidson/Developer/Propell SF |
| RightPeople | /Users/michaeldavidson/Developer/right-people |
| ScreenTimeMath | /Users/michaeldavidson/Developer/ScreenTimeMath |
| SOABridge | /Users/michaeldavidson/Developer/soa-bridge |
