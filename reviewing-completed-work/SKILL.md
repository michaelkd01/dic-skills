---
name: reviewing-completed-work
description: Procedural checklist for validating Linear issue work and issuing PASS/FIX/REJECT verdicts
---

# Supervisor Validation

## Context

This skill is triggered in two modes:

1. **Test Spec Validation** ... after the Planner generates a test specification (Step 3.5 of scoping). The goal is to validate the test spec quality before execution begins.
2. **Execution Validation** ... after a Cyrus run completes (issue moves to `In Review` with a linked PR) or a manual Claude Code execution completes and the user shares the output for review. The goal is to validate the work against the original plan, detect drift, and issue a clear verdict.

Active execution layer: Cyrus driven by Linear.

Role: Supervisor. Do not plan or execute ... only validate and instruct.

## Resources

- **Linear MCP**: scoped to one workspace per connection
- **GitHub MCP**: read PR diff, CI status
- **Obsidian (preferred) / Notion PROJECT DOCS (fallback)**: project context lookup

---

## Mode A: Test Spec Validation

Triggered when the Planner completes Step 3.5 (Generate Test Specification) for a Code task.

### A1. Load the Issue

1. Fetch the issue from Linear by identifier (e.g., `ANY-42`)
2. Read: title, description (AC), team, labels, project context

If the work is not a Code task, this mode does not apply. Return control to Planner.

### A2. Load Project Context

Fetch the project's CLAUDE.md to confirm:
- Test runner command exists
- Test file conventions are known

### A3. Validate Test Spec

Assess each element of the test specification against this checklist:

| Check | Pass/Fail | Evidence |
|---|---|---|
| Every AC item has ≥1 corresponding test | | |
| Edge cases and error paths are covered | | |
| No test is trivially self-fulfilling | | |
| Test scope does not exceed task scope | | |
| Test file paths follow project conventions | | |
| Test runner command matches CLAUDE.md | | |

**Trivially self-fulfilling test examples (FAIL these):**
- `expect(true).toBe(true)`
- Testing that a mock returns what you told it to return
- Testing only the happy path with hardcoded expected values that mirror the implementation

**Scope creep examples (FAIL these):**
- Tests for modules not mentioned in the AC
- Performance benchmarks when AC doesn't mention performance
- Integration tests with external services when AC is about internal logic

### A4. Issue Verdict

**APPROVED** ... All checks pass. Test spec is ready for execution.
```
Test Spec Verdict: APPROVED
All {N} acceptance criteria covered. {M} edge case tests included. Proceed to execution.
```
Planner may now finalize the issue and route to Cyrus (or produce a manual execution prompt).

**REVISION NEEDED** ... Specific deficiencies found.
```
Test Spec Verdict: REVISION NEEDED

Issues:
1. {AC item X}: no corresponding test
2. {specific test}: trivially self-fulfilling because {reason}
3. {gap}: missing error path test for {scenario}

Action: Planner to revise test spec and resubmit.
```

**FLAG TO USER** ... Ambiguity that requires human judgment.
```
Test Spec Verdict: FLAGGED

Reason: {why this can't be resolved without human input}
Question for user: {specific question}
```
Send via Slack DM with issue link. Await response before proceeding.

---

## Mode B: Execution Validation

Triggered after Cyrus moves an issue to `In Review` (with a linked PR) or after a manual Claude Code execution completes.

### B1. Load the Issue

1. Fetch the issue from Linear by identifier
2. Read: title, body (AC + test spec), state, team, labels, recent comments
3. Identify the linked PR (Linear issue attachment, or GitHub search by issue identifier)

### B2. Load Project Context

Before validating, fetch:

1. **Architecture & Decisions** for the project (Obsidian first, Notion fallback)
2. **Overview** for the project
3. **CLAUDE.md** from project knowledge (if code task)

This is needed to detect architectural drift ... the execution might satisfy the AC but violate a documented decision.

### B3. Validate Each Acceptance Criterion

For each AC item, assess:

| Criterion | Status | Evidence |
|---|---|---|
| AC1: {text} | PASS / FAIL / PARTIAL | {what you observed in PR diff or run output} |
| AC2: {text} | PASS / FAIL / PARTIAL | {what you observed} |

**PASS** ... criterion is fully met with evidence in the PR diff or execution output.
**PARTIAL** ... criterion is partially met but something is missing or incomplete.
**FAIL** ... criterion is not met or contradicted by the output.

Sources of evidence:
- PR diff (`Claude Github MCP (Personal):pull_request_read` get_files)
- CI status (checks)
- Cyrus's run summary comment on the Linear issue
- Build/test/lint output (visible in CI checks)

### B3.5. Validate Test Contract (Code tasks only)

If the issue had an approved test spec (Step 3.5), verify:

- [ ] All specified tests were written
- [ ] Test assertions match the approved spec (not silently weakened)
- [ ] Tests actually run and pass (visible in CI or execution output)
- [ ] No test was deleted or skipped to achieve a pass
- [ ] Coverage: new/modified code paths are exercised

If test assertions were modified from the approved spec without justification, this is a **FIX-MAJOR** regardless of whether other AC items pass. The test contract is binding.

### B4. Check for Drift

Beyond the AC, verify:

- [ ] No files were modified outside the stated scope
- [ ] No new dependencies were added without justification
- [ ] No existing ADRs were violated
- [ ] Commit message follows conventional format and includes the issue identifier
- [ ] No existing functionality was removed (unless AC explicitly required it)

### B5. Issue Verdict

**PASS** ... All AC items met. No drift detected. Test contract honoured.
```
## Supervisor Verdict

**PASS**

All {N} acceptance criteria met. No architectural drift detected.
```
Then proceed to Step B6.

**FIX-MINOR** ... Most AC met but small issues remain. Provide specific fix instructions.
```
## Supervisor Verdict

**FIX-MINOR**

Issues:
1. {AC item}: {what's wrong and exactly how to fix it}
2. {drift item}: {what happened and what needs to change}

Fix prompt: {if a Claude Code prompt is needed, follow writing-execution-prompts}
```

**FIX-MAJOR** ... Significant AC items failed or major drift detected. Requires re-execution.
```
## Supervisor Verdict

**FIX-MAJOR**

Failed criteria:
1. {AC item}: {what's wrong}
2. {AC item}: {what's wrong}

Root cause: {why the execution went wrong}
Recommendation: {reset issue with adjusted AC / rewrite prompt / split into smaller issues}
```

**REJECT** ... Execution went in the wrong direction entirely. Discard and re-plan.
```
## Supervisor Verdict

**REJECT**

Reason: {why the output is not salvageable}
Next step: {re-scope from scratch / re-plan with different approach}
```

### B6. Update Linear

Based on verdict:

**PASS:**
1. Post the verdict comment via `Linear:save_comment`
2. Move issue to `Done` via `Linear:save_issue` with `state: "Done"`
3. Merge the linked PR if CI is green and merge has not yet happened (`Claude Github MCP (Personal):merge_pull_request`)

**FIX-MINOR:**
1. Post the verdict comment via `Linear:save_comment` with concrete fix instructions
2. Move issue to `Todo` via `Linear:save_issue` (back to executor) or leave in `In Review` and let the user decide

**FIX-MAJOR:**
1. Post the verdict comment via `Linear:save_comment` with diagnosis and recommendation
2. Move issue to `Todo` via `Linear:save_issue` (back to executor for re-execution)
3. If the AC needs revision: move to `Backlog` and ping the Planner

**REJECT:**
1. Post the verdict comment via `Linear:save_comment` with the rejection reason
2. Move issue to `Backlog` via `Linear:save_issue` (back to scoping)

### B7. Deploy (PASS only)

For Cyrus-driven work, deployment happens automatically when the PR merges (Vercel auto-deploys the configured base branch).

For manual feature-branch work, the merge sequence in the original execution prompt handles push-to-base, which triggers Vercel.

For projects with explicit deploy hooks, the project's Architecture & Decisions doc names them.

## Validation Principles

- **AC is the contract.** If the AC says X and the execution did Y (even if Y is objectively better), flag it. The user decides whether to accept the deviation.
- **Test contract is binding.** If approved tests were weakened or skipped to achieve a pass, that's a FIX-MAJOR. Tests are the spec, not the implementation.
- **Silence is not approval.** If you can't verify a criterion from the available evidence, mark it PARTIAL and ask for more information.
- **Drift matters more than bugs.** A task that satisfies all AC but violates an ADR is worse than a task that fails one AC item cleanly. Drift compounds silently.
- **Preserve existing functionality.** Unless the AC explicitly calls for removal, any existing feature that stops working is a regression and a FAIL.
- **Be specific in fix instructions.** "Fix the test" is not a fix instruction. "In `tests/test_main.py`, line 42, the assertion expects `200` but the route returns `201` after the change ... update the assertion to `201`" is.

## Anti-Patterns

- Issuing PASS without checking Architecture & Decisions (allows drift)
- Issuing FIX without a concrete fix instruction or revised prompt
- Forgetting to merge the PR after PASS
- Accepting "no tests written" when the AC includes test expectations
- Accepting modified test assertions without flagging (test contract violation)
- Issuing PASS on a Code task where no CI output is visible
