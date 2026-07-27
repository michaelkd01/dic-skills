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
- **Ready**: scoped, prompt drafted, file territory mapped, risk class assessed, dependencies declared. Not yet handed to Cyrus. This is the canonical handoff gate ... see [[wiki/decisions/linear-pipeline-states-and-wip-caps]].
- **Todo**: handed to Cyrus. Cyrus picks up from this state when assigned. Promotion gated by Step 4.5.
- **In Progress**: Cyrus is actively working.
- **Investigation Complete**: Cyrus has finished an investigation pass; Planner takes over to scope based on findings.
- **In Review**: work is done; Supervisor reviews. (See `reviewing-completed-work`.)
- **Done**: closed.

For most new tasks the natural state is either `Backlog` (still scoping) or `Ready` (scoped, awaiting promotion). Use the `Investigate` label + `Todo` state for the recon-before-execution flow.

**Important:** `Todo` is the Cyrus-pickup state. Do NOT set state to `Todo` directly from this step. Tasks promote through the gate in Step 4.5 first.

### Step 4.5 ... Pre-Promotion Gate (non-skippable)

This gate exists because of the 2026-05-16 bulk-assign merge cascade. The canonical rules live in [[wiki/decisions/linear-pipeline-states-and-wip-caps|Linear Pipeline States and WIP Caps]]. Do not skip the checklists below ... they are the planner-side implementation of that ADR.

**Session pre-flight ... run ONCE at the start of any batching session, before any other gate check:**

- [ ] Identify the target venture and its repo(s). ANY → `michaelkd01/anytimeinterview2`. BES → `michaelkd01/bespoke-website-main`. SOC → `michaelkd01/infra-config`. Add others here as ventures onboard.
- [ ] For each target repo, call `Claude Github MCP:list_pull_requests` with `state: open`.
- [ ] If any PRs are open, **halt the batching session.** Do not run the per-issue gate below. Do not promote anything. Address the PRs first:
  - **Cyrus-authored PRs** (carry the marker `<!-- generated-by-cyrus -->`): switch to Supervisor role per `reviewing-completed-work`, issue PASS / FIX / REJECT, and merge or bounce as appropriate.
  - **Human-authored PRs**: confirm with the user ... merge, hold, or close.
  - **Stale or abandoned PRs**: confirm closure or revival with the user.
- [ ] Re-run the pre-flight after each merge. Only when the repo shows zero open PRs (or only PRs the user has explicitly approved leaving open for this session) do we proceed to the per-issue gate.

**Why this is the first check:** open PRs are unmerged state on the base branch. Adding more in-flight work on top compounds the merge surface and recreates the original failure mode. Cyrus-authored PRs are usually already at the Supervisor stage and just need a verdict ... clearing them is faster than starting new work and gets the in-flight count back to zero before the batch begins.

**Backlog → Ready (scoping is complete):**

- [ ] Parent feature issue linked
- [ ] Intent and Acceptance Criteria written
- [ ] Execution prompt drafted per the `writing-execution-prompts` skill
- [ ] **File territory mapped** ... exact paths the task will touch, recorded in the issue body
- [ ] **Risk class assessed** ... schema / auth / billing = serialise; UI / copy / docs = parallelisable
- [ ] **Dependencies declared** ... `blocks` / `blockedBy` set on any upstream or downstream sub-issue

If any check fails, leave the issue in `Backlog` and finish scoping.

**Ready → Todo (handoff to Cyrus):**

Before promoting any single issue from Ready to Todo, run all four checks. If you have a batch of related work, run them against each item individually ... do not batch-promote.

- [ ] **WIP cap check:** count Cyrus's current in-flight (`Todo` + `In Progress` + `In Review`). It must be strictly less than 3. If it equals 3, hold.
- [ ] **Upstream check:** no `blocks` relation pointing at this issue from anything currently in `Todo`, `In Progress`, or `In Review`. Wait for upstream to reach `Done`.
- [ ] **Orthogonality check:** the file territory recorded on this issue does not overlap with any item currently in `In Progress` or `In Review`. If there is overlap and no `blocks` relation, do NOT promote ... either declare the dependency and serialise, or wait for the conflicting item to merge.
- [ ] **Batch type check:** if this is part of a related set, confirm which pattern applies and document it on the parent epic:
  - **Orthogonal** ... different files / different subsystems / different repos. Safe to parallel-promote up to the cap.
  - **Sequenced** ... `blocks` relations set on each item. Promote one at a time, bottom-up.
  - **Stacked** ... branches stack off a parent branch, not `main`. Promote one at a time, bottom-up. (Note: the Cyrus `orchestrator` label still spawns one worktree per sub-issue as of 2026-05-16; upstream [issue #1048](https://github.com/cyrusagents/cyrus/issues/1048) tracks unified-worktree support. Until that lands, treat orchestrator label work the same as manual sequencing.)

If any check fails, leave the issue in `Ready` and pick a different item or wait.

**Anti-patterns this gate exists to prevent:**

- Bulk-assigning N issues to Cyrus in one planner action. The 2026-05-16 incident processed 25 issues serially through Cyrus but produced 25 PRs against `main` that collided on shared files. Even with serial execution, parallel branches off `main` is the collision vector.
- Promoting an issue with overlapping file territory and no `blocks` relation, hoping merges will sort it out.
- Treating the WIP cap as advisory because "this one is small". The cap is the cap.

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
- **Bulk-promoting multiple issues to `Todo` in one planner action.** Cyrus processes serially per pm2 instance, but produces parallel PRs from `main` ... the merge phase collides on shared files. Promote one at a time through Step 4.5. The 2026-05-16 incident documented in [[wiki/decisions/linear-pipeline-states-and-wip-caps]] is the canonical example of this failure.
- **Overriding the WIP cap because "this one is small".** The cap is `Todo + In Progress + In Review < 3` per team, full stop. If Cyrus is at cap, hold in Ready.
- **Ignoring file-territory overlap between Ready items.** Two Ready items that touch the same file must not both be promoted ... either declare a `blocks` relation and serialise, or wait for one to merge before promoting the other.

## See Also

- `wiki/decisions/linear-pipeline-states-and-wip-caps.md` ... canonical state model, WIP caps, hardened pre-promotion checklist (referenced by Step 4.5)
- `wiki/decisions/linear-project-description-template.md` ... the five-section template referenced in Step 2
- `_shared/repo-paths.md` ... canonical Project ↔ Repo Path mapping
- `writing-execution-prompts` ... format for manual Claude Code prompts
- `reviewing-completed-work` ... Supervisor validation of completed work
