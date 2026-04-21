---
name: reviewing-completed-work
description: Procedural checklist for validating task execution outputs and issuing PASS/FIX/REJECT verdicts
---

# Supervisor Validation

## Context

This skill is triggered in two modes:

1. **Test Spec Validation** ... after the Planner generates a test specification (Step 3.5 of scoping). The goal is to validate the test spec quality before execution begins.
2. **Execution Validation** ... after a Claude Code execution completes and the output is available for review. The goal is to validate the work against the original plan, detect drift, and issue a clear verdict.

Role: Supervisor. Do not plan or execute ... only validate and instruct.

## Resources

- **Paperclip task tools**: `list_issues`, `update_issue`, `put_issue_document`, `comment_on_issue`
- **Obsidian knowledge tools**: `search_notes`, `read_note`
- **PROJECT DOCS database (Notion fallback)**: `3083257a-fd0a-8088-bbcc-000bdd488971`
- **Architecture & Decisions page**: `3163257a-fd0a-8171-894a-eb2b6a0d297d`

---

## Mode A: Test Spec Validation

Triggered when the Planner completes Step 3.5 (Generate Test Specification) for a Code task.

### A1. Load the Task

1. Query the issue in Paperclip via `list_issues` with `q` matching the issue title or ID
2. Read: issue details, labels, attached documents (especially `spec` for acceptance criteria and task type)

If Skip Tests = YES or Task Type ≠ Code, this mode does not apply. Return control to Planner.

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
Planner may now produce the execution prompt with this test spec embedded.

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
Await response before proceeding.

---

## Mode B: Execution Validation

Triggered after a Claude Code execution completes and the output is available for review.

### B1. Load the Task

1. Query the issue in Paperclip via `list_issues` with `q` matching the issue title or ID
2. Read issue details and attached documents, especially:
   - Acceptance Criteria from `spec` document (the definition of done)
   - Branch Strategy (from description)
   - Project

### B2. Load Project Context

Before validating, fetch:

1. **Architecture & Decisions doc** for the project
2. **Overview doc** for the project
3. **CLAUDE.md** from project knowledge (if code task)

This is needed to detect architectural drift ... the execution might satisfy the AC but violate a documented decision.

### B3. Validate Each Acceptance Criterion

For each AC item, assess:

| Criterion | Status | Evidence |
|---|---|---|
| AC1: {text} | PASS / FAIL / PARTIAL | {what you observed} |
| AC2: {text} | PASS / FAIL / PARTIAL | {what you observed} |
| ... | ... | ... |

**PASS** ... criterion is fully met with evidence in the execution output.
**PARTIAL** ... criterion is partially met but something is missing or incomplete.
**FAIL** ... criterion is not met or contradicted by the output.

Sources of evidence:
- Execution output (visible in Paperclip issue comments/run transcript)
- Git diff / commit messages
- Build/test/lint output
- File contents visible in the output

### B3.5. Validate Test Contract (Code tasks only)

If the task had an approved test spec (Step 3.5), verify:

- [ ] All specified tests were written
- [ ] Test assertions match the approved spec (not silently weakened)
- [ ] Tests actually run and pass (visible in execution output)
- [ ] No test was deleted or skipped to achieve a pass
- [ ] Coverage: new/modified code paths are exercised

If test assertions were modified from the approved spec without justification, this is a **FIX-MAJOR** regardless of whether other AC items pass. The test contract is binding.

### B4. Check for Drift

Beyond the AC, verify:

- [ ] No files were modified outside the stated scope
- [ ] No new dependencies were added without justification
- [ ] No existing ADRs were violated
- [ ] Commit message follows conventional format and includes issue identifier
- [ ] Branch strategy was followed (feature-branch vs direct-main)
- [ ] No existing functionality was removed (unless AC explicitly required it)

### B5. Issue Verdict

**PASS** ... All AC items met. No drift detected. Test contract honoured.
```
Verdict: PASS
All {N} acceptance criteria met. No architectural drift detected.
```
Then proceed to Step B6.

**FIX-MINOR** ... Most AC met but small issues remain. Provide specific fix instructions.
```
Verdict: FIX-MINOR

Issues:
1. {AC item}: {what's wrong and exactly how to fix it}
2. {drift item}: {what happened and what needs to change}

Fix prompt: {if a Claude Code prompt is needed, produce one following the writing-execution-prompts skill}
```

**FIX-MAJOR** ... Significant AC items failed or major drift detected. Requires re-execution.
```
Verdict: FIX-MAJOR

Failed criteria:
1. {AC item}: {what's wrong}
2. {AC item}: {what's wrong}

Root cause: {why the execution went wrong}
Recommendation: {reset task with adjusted AC / rewrite prompt / split into smaller tasks}
```

**REJECT** ... Execution went in the wrong direction entirely. Discard and re-plan.
```
Verdict: REJECT

Reason: {why the output is not salvageable}
Next step: {re-scope from scratch / re-plan with different approach}
```

### B6. Update Paperclip

Based on verdict:

**PASS:**
1. Update issue via `update_issue`: set `status` → `done`
2. Attach verdict summary via `put_issue_document` with `key: "supervisor-review"`
3. Trigger deploy if applicable (check project Architecture doc for deploy hook)

**FIX-MINOR:**
1. Leave `status` as-is (user will re-run after fix)
2. Add fix instructions via `comment_on_issue`

**FIX-MAJOR:**
1. Update issue via `update_issue`: set `status` → `todo`
2. Add diagnostic comment via `comment_on_issue`

**REJECT:**
1. Update issue via `update_issue`: set `status` → `backlog`
2. Add rejection reason via `comment_on_issue`

### B7. Deploy (PASS only)

Every PASS verdict must include deployment:

- **Feature-branch:** provide merge sequence command
- **Direct-main:** confirm push happened, trigger deploy hook if needed
- **Deploy hook (if needed):** Check the project's Architecture doc (Obsidian first, Notion fallback) for the per-project deploy hook URL

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
- Marking a task Done when it should be in review (code tasks with UI/UX impact need human verification)
- Forgetting to trigger deployment after a PASS
- Accepting "no tests written" when the AC includes test expectations
- Accepting modified test assertions without flagging (test contract violation)
- Issuing PASS on a Code task where no test output is visible in the execution log
