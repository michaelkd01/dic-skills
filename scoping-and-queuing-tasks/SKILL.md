---
name: scoping-and-queuing-tasks
description: Procedural checklist for scoping a task from first mention to Ready/Manual Queue with a Claude Code prompt
---

# Task Scoping Workflow

## Context

This workflow is triggered whenever the user references a task to work on, whether by TQ-ID, Sort Order, name, or description. It covers the full path from "let's do X" to a task that is either Ready (pipeline) or Manual Queue (human) with a validated Claude Code prompt.

All status transitions must comply with the ADR-003 valid_transitions map. Invalid transitions are rejected by the state machine in code.

Role: Development Planner throughout. Switch to Supervisor only if validating a completed execution.

## Resources

- **TASK QUEUE database**: `collection://5da08552-f08b-4734-9784-3019be7dd1a2`
- **TASK QUEUE views**:
  - Active: `view://3183257a-fd0a-80c0-9e04-000cf43fb336`
  - Draft: `view://3183257a-fd0a-809b-9e17-000c8f113a01`
  - Pre-planning: `view://3183257a-fd0a-80cb-88ab-000c29e1da3a`
  - Needs-attention: `view://3183257a-fd0a-80d5-a23f-000c635b11ca`
  - Awaiting-test: `view://31b3257a-fd0a-8007-b05d-000cdfe3c733`
- **PROJECT DOCS database**: `3083257a-fd0a-8088-bbcc-000bdd488971`
- **Architecture & Decisions page**: `3163257a-fd0a-8171-894a-eb2b6a0d297d`
- **Notion parent for new tasks**: `{'data_source_id': '5da08552-f08b-4734-9784-3019be7dd1a2'}`

## Workflow

### Step 1 ... Identify the Task

Determine whether this is an existing task or a new one.

**Existing task:**
1. Search Notion TASK QUEUE by TQ-ID, Sort Order, or name
2. Fetch the full page (`notion-fetch` with page ID)
3. Read ALL properties: Name, Status, Project, Task Type, Category, Priority, Branch Strategy, Max Iterations, Human Hours Est, Sort Order, Repo Path, Acceptance Criteria, Shared Files, Execution Log, Blocked Reason, Execution Method

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
- [ ] If this is a re-run of a failed task: read the Execution Log to understand what went wrong, and adjust AC or add recovery notes accordingly

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

4. **Supervisor validation (Option B):**
   - Hand the test spec to the Supervisor role for validation
   - Supervisor checks the four criteria above
   - If all pass ... auto-approved, proceed to Step 4
   - If any fail ... flag to user via Slack DM with specific deficiency
   - Task cannot move to Ready until test spec is approved

5. Record the approved test spec in the task's Acceptance Criteria or as a linked comment. The execution prompt will reference it.

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

### Step 4 ... Create or Update the Task in Notion

**Required properties for every task:**

| Property | Rule |
|---|---|
| Name | Descriptive, imperative form |
| Status | See decision rules below |
| Project | Must match an existing select option |
| Task Type | Code / Management / Research / Scaffold |
| Category | Bug / Chore / Feature |
| Priority | 0 - Extreme / 1 - High / 2 - Mid / 3 - Low |
| Branch Strategy | `feature-branch` or `direct-main` |
| Max Iterations | Default 15. Increase for complex tasks. |
| Human Hours Est | MANDATORY. See estimation guide below. Never leave blank or zero. |
| Sort Order | Next available (query Active view to find max) |
| Repo Path | Absolute path: `/Users/michaeldavidson/Developer/{repo}` |
| Acceptance Criteria | Validated in Step 3 |
| Execution Method | Pipeline / Manual / Chat |
| Self Modifying | __YES__ if task modifies src/orchestrator/ (pipeline source code). __NO__ otherwise. |

**Status decision rules:**

- Pipeline task (Execution Method = Pipeline): **Pre-planning** ... the pre-planner generates the execution prompt and promotes to Ready automatically
- Manual task (orchestrator `src/` changes, or user wants to run it): **Pre-planning** ... the pre-planner generates the execution prompt, then promotes to Manual Queue (not Ready). You grab the prompt from Notion and run it manually whenever you like.
- Needs more scoping: **Draft** (not yet ready for pre-planner)
- Management task (Notion-only): do NOT create a task ... handle directly in chat
- Only use **Ready** when you've written the execution prompt yourself in chat and want the pipeline to pick it up immediately (bypasses pre-planner)

**Three-field reset (for re-running a failed/blocked task):**
These three fields must be cleared together. Missing one causes stale data to persist.
```
Status → Ready (or Manual Queue)
Execution Log → ''
Blocked Reason → ''
```

Also reset `Iterations Used → 0` if the task previously executed.

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

Verify every required property in the table above is set. Specifically check:
- [ ] Human Hours Est is set and > 0
- [ ] Repo Path is an absolute path (starts with `/Users/`)
- [ ] Execution Method is set
- [ ] Sort Order is set and unique
- [ ] Branch Strategy is set

Do not produce a Claude Code prompt until all five are confirmed.

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

- Forgetting to set Human Hours Est (breaks leverage ratio reporting, frequently missed)
- Forgetting to set Repo Path (causes pipeline to fail with "Repo Path not set")
- Forgetting to clear Blocked Reason on a reset (causes stale blocked reason to display)
- Not checking Architecture & Decisions before scoping (causes architectural drift)
- Setting orchestrator `src/` tasks to Ready instead of Pre-planning (the pre-planner handles promotion to Manual Queue for manual tasks)
- Setting manual tasks to Parked instead of Manual Queue (Parked means "deliberately on hold", Manual Queue means "has a prompt, awaiting human pickup" ... see ADR-003)
- Creating Management tasks in the pipeline (they fail on git commit)
- Using `~/Developer/` instead of `/Users/michaeldavidson/Developer/` in Repo Path
- Not querying the Active view for the next Sort Order (causes collisions)
- Skipping Step 3.5 for Code tasks (executor writes both tests and code, defeating independence)
- Approving a test spec that only covers happy paths (edge cases catch most bugs)

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
