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

**Supersession check (both paths) ... run before creating or queuing:**

Check whether another in-flight, queued, or recently-merged ticket changes the SAME surface in a way that makes this one moot. If a structural ticket will remove, rename, or replace the route / page / component this ticket targets, that structural ticket supersedes the polish or feature ticket sitting on top of it.

- If a superseding structural ticket exists, cancel or hold the subordinate ticket (`save_comment` rationale, then `save_issue` -> `Canceled`) rather than running both. Never queue a redesign of a surface that another queued ticket is about to delete.
- Incident: BES-189 redesigned the action-plan detail view; BES-170 deleted that detail view 48 minutes later. Both ran, so the BES-189 work was merged then thrown away ... wasted execution because the supersession was not caught at scoping.

### Step 2 ... Gather Project Context

Before scoping or producing a prompt, ALWAYS fetch project context. Read in this order:

1. **Linear project description** ... read the parent project's description via `Linear:get_project` (the issue's `projectId` resolves to this). The description follows the five-section template at `wiki/decisions/linear-project-description-template.md` and carries: repo URL, routes / endpoints, auth gate, stack, sibling-project boundaries, and wiki pointers. This is the agent's bootstrap context ... read it first regardless of task size.
2. **Architecture & Decisions** ... Obsidian first (`wiki/projects/{slug}/architecture/`, `wiki/decisions/`); Notion PROJECT DOCS as fallback (search `{ProjectCode} ... Architecture & Decisions`)
3. **Overview** ... Obsidian first; Notion PROJECT DOCS as fallback (search `{ProjectCode} ... Overview`)
4. **Repo CLAUDE.md** ... if the task involves code, read it from project knowledge or the local repo
5. **In-flight sibling check (code tasks)** ... if this task touches specific files, check whether any other open / unmerged Linear issue touches the same files. Sibling issues' `**Concurrency: EXCLUSIVE**` notes name the shared files; cross-check GitHub for unmerged branches / PRs against those paths. Any sibling found changes what "current source" means for the next step.

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
- [ ] No unmerged sibling issue rewrites the files this AC names. If one does, scope the AC against that sibling's **post-merge** end-state, not the current snapshot ... or add the sibling as a `blockedBy` so this issue cannot be queued until it lands.

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

### Step 3.6 ... Structural-Removal Sweep

**Applies to:** any task that removes, renames, or relocates a cross-referenced surface ... a route, page, exported component or hook, public function, env binding, or URL path that other modules reference.

A structural removal is not done when the target is deleted; it is done when every reference to it is updated or removed. Bake the sweep into the AC so the executor cannot leave a dangling reference:

- [ ] AC includes a repo-wide reference sweep for the removed symbol / route / path (e.g. `grep -rn "/old-route/" src/`, plus import sites and route declarations), updating or removing every hit.
- [ ] AC includes a dangling-reference guard ... a unit test or a grep step asserting zero references to the removed surface remain after the change.
- [ ] The sweep covers sibling surfaces, not just the file being edited. Updating one linker while missing another is the exact failure mode this step exists to prevent.

Incident: BES-170 removed the `/action-plan/:quoteId` route and updated the Dashboard linker but missed `Property.tsx`, shipping a dead link to the client portal (fixed in BES-203). The removal AC should have required the sweep.

### Step 3.7 ... Rendering-Verification Gate (verify:device)

**Applies to:** any task, in ANY project, whose change can alter what a real user sees or whether content renders at all. Triggers include: CSS cascade / specificity / visibility / animation-state changes; JS load-order or bootstrapping changes (inline → external, defer/async, class-hook gating); CSP or security-header changes that affect script or style execution; font loading; viewport or responsive layout changes.

Grep and unit assertions structurally cannot detect rendering failures. Green CI has shipped the same blank-site failure class twice on one repo: 817d339 (CSP hash drift, ~2.5 weeks blank in production) and the BES-205 first pass (hidden rule `html.js [data-reveal]` at specificity (0,2,1) outranked the `.is-visible` reveal rule at (0,2,0), locking all revealed content invisible ... caught only at Supervisor review).

- [ ] Apply the workspace `verify:device` label at scoping time when any trigger matches. The label gates Supervisor PASS per the Feature Verification Standard ADR: web → BrowserStack Live or an evidenced real-browser session; native iOS → owned device + TestFlight.
- [ ] The AC must require reported browser evidence, not just green CI: (a) the runtime state is applied (e.g., bootstrap/state classes present in the live DOM), (b) the visual outcome actually occurs (content renders / reveals), and (c) the failure-mode fallback holds (e.g., content visible with JS disabled; reduced-motion behaviour).
- [ ] The test spec may remain grep/unit based, but must never be represented as proving rendering. State that gap explicitly in the spec so the Supervisor knows CI-green is not render-green.

### Step 4 ... Create or Update the Issue in Linear

Use `Linear:save_issue` with these inputs:

| Field | Notes |
|---|---|
| title | Descriptive, imperative form |
| team | Linear team key (e.g., `anytimeinterview2`) |
| description | Includes AC + test spec + any context (see body convention below) |
| labels | Apply relevant team labels (`Feature`, `Improvement`, `Bug`) plus scope labels where applicable (e.g., `bespoke-portal`), plus `verify:device` when Step 3.7 triggers |
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
7. **Do not specify the base branch in prompt prose** ... Cyrus resolves it from config via `GitService.determineBaseBranch()`. See the "Base Branch" section in `writing-execution-prompts` for the resolution priority order and per-repo defaults. Use `[repo=name#branch]` in the Linear description only when an explicit override is required.

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
- **Scoping AC against stale source while a sibling rewrites the same files.** Writing criteria against the current source when another unmerged issue will change those files produces ACs that name components the sibling deletes. The EXCLUSIVE concurrency lock serialises execution but does nothing for scope currency. (BES-170/199: 199's ACs targeted `QuoteApproval` in `ActionPlan.tsx`; BES-170 deleted it 24 min later. 199 even documented the shared-file dependency, yet the ACs still assumed the pre-170 surface.)
- **Specifying the base branch in prompt prose** ("branch from main", "create a branch off staging"). Cyrus resolves the base from `repositories[].baseBranch` in `~/.cyrus/config.json`; contradicting it in prose triggers recovery loops (see ANY-230 incident documented in SOC-18). Use `[repo=name#branch]` in the Linear description for explicit overrides instead. See `writing-execution-prompts` → Base Branch.
- **Queuing a ticket that another queued or in-flight ticket supersedes** (e.g. polishing a surface a structural ticket is about to delete). Run the Step 1 supersession check; cancel or hold the subordinate ticket. See BES-189 / BES-170.
- **Scoping a structural removal without a reference sweep in the AC**, leaving dangling links or imports to the removed route or component. See Step 3.6 and the BES-170 / BES-203 straggler.
- **Scoping a rendering-critical change without the `verify:device` label**, letting grep-only CI stand in for visual verification. Green CI shipped the identical blank-production-site failure class twice (817d339; BES-205 first pass). See Step 3.7.

## See Also

- `wiki/decisions/linear-project-description-template.md` ... the five-section template referenced in Step 2
- `_shared/repo-paths.md` ... canonical Project ↔ Repo Path mapping
- `writing-execution-prompts` ... format for manual Claude Code prompts (incl. Base Branch section)
- `reviewing-completed-work` ... Supervisor validation of completed work

## Handback Audit (MANDATORY final output)

Every deliverable produced under this skill ... plan, scoped issue, execution prompt, verdict, or status update ... MUST end with a Handback Audit block:

HANDBACK AUDIT
Items assigned to a human: {N}
- {action} | category: {interactive-only auth | credential confirmed absent | irreversible high-stakes | judgment call} | evidence: {what was checked and why no autonomous path exists}
(if N = 0): NONE ... every action is autonomous or queued to an agent.

An item that cannot be mapped to an allowed category with evidence is a defect: convert it into an autonomous step or execution prompt before delivery. A deliverable missing this block fails validation. The categories and evidence standard are defined by the Capability Exhaustion Gate in the writing-execution-prompts skill.
