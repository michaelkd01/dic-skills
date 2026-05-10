---
name: scoping-and-queuing-tasks
description: Procedural checklist for scoping a Linear issue from first mention to a Cyrus-ready execution prompt
---

# Task Scoping Workflow (Linear + Cyrus)

## Context

This workflow is triggered whenever the user references a task to work on, whether by Linear identifier (e.g., `ANY-42`), name, or description. It covers the full path from "let's do X" to a Linear issue with an attached execution prompt that Cyrus can pick up.

Active execution layer: Cyrus driven by Linear.

Role: Development Planner throughout. Switch to Supervisor only if validating completed execution (see `reviewing-completed-work`).

## Resources

- **Linear MCP**: scoped to one workspace per connection
- **Obsidian (preferred) / Notion PROJECT DOCS (fallback)**: project context lookup
- **`_shared/repo-paths.md`**: canonical Project ↔ Repo Path mapping for human reference
- **Linear project description**: agent bootstrap context for each project, populated per `wiki/decisions/linear-project-description-template.md`

## Workflow

### Step 1 ... Identify the Task

Determine whether this is an existing issue or a new one.

**Existing issue:**
1. Search Linear by identifier or title via `Linear:list_issues` or `Linear:get_issue`
2. Fetch full issue: title, description, state, team, labels, priority, assignee
3. Read AC from the issue body (typically under `## Acceptance Criteria`)

**New issue:**
1. Confirm scope with the user before creating
2. Determine the target team and any scope labels
3. Skip to Step 4 (Create Issue)

### Step 2 ... Gather Project Context

Before scoping or producing a prompt, ALWAYS fetch project context. Read in this order:

1. **Linear project description** ... read the parent project's description via `Linear:get_project` (the issue's `projectId` resolves to this). The description follows the five-section template at `wiki/decisions/linear-project-description-template.md` and carries: repo URL, routes / endpoints, auth gate, stack, sibling-project boundaries, and wiki pointers. This is the agent's bootstrap context ... read it first regardless of task size.
2. **Architecture & Decisions** ... Obsidian first (`wiki/projects/{slug}/architecture/`, `wiki/decisions/`); Notion PROJECT DOCS as fallback (search `{ProjectCode} ... Architecture & Decisions`)
3. **Overview** ... Obsidian first; Notion PROJECT DOCS as fallback (search `{ProjectCode} ... Overview`)
4. **Repo CLAUDE.md** ... if the task involves code, read it from project knowledge or the local repo

Read enough to understand:
- Current architecture and constraints
- Existing decisions that might affect this task
- Tech stack, test commands, lint commands
- Any prior decisions that this task must respect

**Do not skip this step.** Past incidents have occurred where prompts contradicted existing architecture because this step was skipped.

### Step 3 ... Validate / Refine Acceptance Criteria

Review existing AC (or draft new AC) against:

- [ ] Each criterion is independently verifiable
- [ ] No criterion is ambiguous ("improve performance" is bad; "reduce query time from 2s to <500ms" is good)
- [ ] Criteria reference specific files or modules where possible
- [ ] Criteria do not contradict the project's Architecture & Decisions

If AC needs changes, propose them and get confirmation before proceeding.

### Step 3.5 ... Generate Test Specification

**Applies to:** Code tasks. Skip for scaffold and management work.

**Purpose:** Define the test contract BEFORE any implementation code is written. The executor's job becomes "make these tests pass" ... not "write tests and code and hope they agree."

**Procedure:**

1. For each acceptance criterion, generate at least one test case:
   - Test name (`test_<what_it_verifies>` format)
   - Test type: unit / integration / e2e
   - Input: setup or data required
   - Expected outcome: exact assertion
   - File location: `tests/test_<module>.py`, `__tests__/<component>.test.tsx`, etc.
2. Add edge case and error path tests:
   - Invalid inputs (null, empty, wrong type)
   - Boundary conditions
   - Error responses (4xx, exceptions)
   - Concurrency or race conditions (if relevant)
3. Validate test spec:
   - [ ] Every AC item has at least one corresponding test
   - [ ] No test is trivially self-fulfilling (`expect(true).toBe(true)`)
   - [ ] Test scope does not exceed task scope
   - [ ] Tests reference the project's test runner from CLAUDE.md
   - [ ] Test file paths follow project conventions

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
Command: {from CLAUDE.md}
Coverage target: all new/modified code paths
```

### Step 4 ... Create or Update the Issue in Linear

Use `Linear:save_issue` with these inputs:

| Field | Notes |
|---|---|
| title | Descriptive, imperative form |
| team | Linear team key (e.g., `anytimeinterview2`) |
| description | Includes AC + test spec + any context (see body convention below) |
| labels | Apply relevant team labels (`Feature`, `Improvement`, `Bug`) plus scope labels where applicable (e.g., `bespoke-portal`) |
| priority | `1 Urgent` / `2 High` / `3 Medium` / `4 Low` (or `0 None`) |
| assignee | Cyrus agent (when ready for execution) or self (if planning still ongoing) |
| state | See decision rules below |

**Issue body convention:**

```
## Context
{1-3 sentences: why this task exists}

## Acceptance Criteria
1. {criterion}
2. {criterion}

## Test Specification
{from Step 3.5, if Code task}

## Notes
{any additional context, related issues, references to ADRs}
```

**State decision rules:**

- **Backlog**: not yet ready to work; still being scoped.
- **Todo**: ready for execution. Cyrus picks up from this state when assigned.
- **In Progress**: work has started.
- **Investigation Complete**: Cyrus has finished an investigation pass; Planner takes over to scope based on findings.
- **In Review**: work is done; Supervisor reviews. (See `reviewing-completed-work`.)
- **Done**: closed.

For most new tasks the natural state is either `Backlog` (still scoping) or `Todo` (ready for Cyrus). Use the `Investigate` label + `Todo` state for the recon-before-execution flow.

### Step 5 ... Produce the Claude Code Prompt

If the task is going to Cyrus (assigned to Cyrus, state `Todo`), Cyrus invokes Claude Code itself ... no separate prompt artifact is needed. Cyrus reads the issue body directly.

If the task is going to a manual Claude Code session (e.g., legacy work outside Cyrus's wired repos), follow the **writing-execution-prompts** skill exactly. Key reminders:

1. Read the current state of target files before writing the prompt
2. All paths fully qualified (cross-check `_shared/repo-paths.md`)
3. Git identity block present
4. Commit/push as final step
5. Rules block present
6. Test Contract section present (for Code tasks)

For manual prompts attached to a Linear issue, store as a sub-document via `Linear:save_document` with the issue as parent. Do not paste the full prompt into the issue body; the body holds spec, the document holds the prompt.

### Step 6 ... Provide the Execution Command (manual sessions only)

For manual sessions (not Cyrus):

```
cd ~/Developer/{repo} && claude
```

The repo path is looked up in `_shared/repo-paths.md`.

If feature-branch, the merge sequence is part of the prompt itself ... never delivered separately in chat.

### Step 7 ... Deploy Reminder

For Cyrus-driven work, deployment happens automatically on PR merge (Vercel auto-deploys on the configured branch).

For manual feature-branch tasks, the merge sequence in the prompt handles push-to-base, which triggers Vercel.

For projects with explicit deploy hooks, the project's Architecture & Decisions doc names them.

## Common Mistakes to Avoid

- Forgetting to fetch the Linear project description before scoping (causes prompts that contradict the auth model, route prefixes, or stack documented in the project's Surface section)
- Forgetting to fetch Architecture & Decisions before scoping (causes architectural drift)
- Pasting the full execution prompt into the issue body (clutters; use a sub-document)
- Setting state to `Todo` before AC and test spec are validated (Cyrus may pick up incomplete work)
- Approving a test spec that only covers happy paths (edge cases catch most bugs)
- Forgetting to apply scope labels (Bespoke specifically uses `bespoke-portal` / `bespoke-website` / `bespoke-api` for routing)

## See Also

- `wiki/decisions/linear-project-description-template.md` ... the five-section template referenced in Step 2
- `_shared/repo-paths.md` ... canonical Project ↔ Repo Path mapping
- `writing-execution-prompts` ... format for manual Claude Code prompts
- `reviewing-completed-work` ... Supervisor validation of completed work
