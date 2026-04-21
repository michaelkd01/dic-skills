---
name: writing-execution-prompts
description: Standard format, rules, and validation checklist for producing Claude Code execution prompts
---

# Claude Code Prompt Standard

## Context

Every Claude Code execution prompt must follow this standard. This skill is the single source of truth for prompt structure, required elements, and validation. It applies to all prompts ... pipeline tasks, manual tasks, scaffolds, fixes, and ad hoc executions.

All status transitions referenced in prompts must comply with ADR-003 valid_transitions map.

## Prompt Structure

Every prompt must contain these sections in order:

### 1. Title Block

```
# {Issue ID}: {Task Name}
```

If no issue ID exists (ad hoc execution), use a descriptive title.

### 2. Context (optional but recommended)

One to three sentences explaining WHY this task exists. Reference the project, the problem, and any prior attempts. This grounds Claude Code's understanding without requiring it to infer intent.

### 3. Test Contract (MANDATORY for Code tasks)

**Skip only for:** Scaffold tasks, Management tasks, or tasks with Skip Tests = YES.

This section references the pre-approved test specification from the scoping phase. It tells the executor exactly what tests to write FIRST, before any implementation code.

Format:

```
## Test Contract

Write and verify the following tests BEFORE implementing any production code. All tests must pass before proceeding to implementation.

### Tests
{paste or reference the approved test spec from Step 3.5 of scoping}

### Test Runner
{command from CLAUDE.md, e.g., pytest tests/, npm run test}

### Constraint
- Write all test files first. Run them. They should FAIL (red).
- Then implement production code until all tests PASS (green).
- Do not modify test assertions to make them pass. If a test is wrong, stop and report.
```

**Why this matters:** Without this section, the executor writes both tests and implementation simultaneously. This defeats the independence of the test contract ... the AI optimises for "tests pass" by writing tests that match its implementation rather than tests that match the spec.

### 4. Instructions

Numbered steps. Each step must be:
- **Specific** ... name exact files, exact functions, exact line-level locations where possible
- **Self-contained** ... do not reference external docs, URLs, or "see above"
- **Unambiguous** ... if there are two valid interpretations, add a constraint to eliminate one
- **Copy-paste ready** ... all paths are absolute or repo-relative. No placeholders like `{your-path}` or `<repo-root>`. Every command is fully formed.

### 5. Verification Step

Always include a verification step before the commit step. At minimum:
```
npx tsc --noEmit        # TypeScript projects
pytest                   # Python projects
ruff check src/ tests/   # Python lint
```

For projects with multiple language stacks, verify each stack's build/test/lint.

### 6. Commit and Push Step (MANDATORY)

This must be the FINAL numbered step. It must be a separate, explicitly numbered step ... never folded into a previous step. Never trust Claude Code to commit on its own.

**For feature-branch tasks:**
```
git config user.email "michaelkd01@gmail.com" && git config user.name "Michael Davidson"
git checkout -b {branch-name}
git add -A && git commit -m "{Issue ID}: {descriptive message}" && git push origin {branch-name}
```

**For direct-main tasks:**
```
git config user.email "michaelkd01@gmail.com" && git config user.name "Michael Davidson"
git add -A && git commit -m "{Issue ID}: {descriptive message}" && git push origin main
```

The git identity lines are NOT optional. macOS defaults to hostname email which Vercel blocks.

### 7. Rules Block (MANDATORY)

Every prompt must end with:

```
## Rules
- Follow these steps exactly. Make no assumptions. Add nothing. Do not refactor unrelated code.
- Do not remove existing functionality unless explicitly instructed.
- Report the output of every command.
```

Add task-specific rules as needed (e.g., "Do not modify files outside dashboard/", "If tests fail, stop and report").

## Branch Naming Convention

- Pipeline tasks: `issue-{id}-{kebab-case-description}`
- Manual tasks: `issue-{id}-{kebab-case-description}` or `fix/{kebab-case-description}`
- Security tasks: `sec-{number}-{kebab-case-description}`

## Concurrency Classification

Every prompt delivered in a multi-prompt response MUST be labeled with one of:

- **PARALLEL SAFE** ... no shared files with other prompts in the batch. Can run simultaneously.
- **SEQUENTIAL** ... depends on another prompt completing first. State the order: "Run after Prompt A."
- **EXCLUSIVE** ... must be the only thing running. Typically: direct-main pushes, database migrations.
- **BLOCKED** ... cannot execute yet. State the blocker.

If delivering a single prompt, label it EXCLUSIVE unless there's a reason not to.

## Task-Type-Specific Rules

### Scaffold Tasks
- Branch Strategy: `direct-main`
- Skip CLAUDE.md check, plan phase, eval phase
- Skip Test Contract section
- Executor uses `~/Developer` as `cwd` (not repo root ... repo doesn't exist yet)
- On success: status goes to Done (not Awaiting Test)

### Management Tasks (Notion-only, no code changes)
- Do NOT send through the pipeline ... they fail on the git commit step
- Handle directly in chat via Notion MCP tools

## Merge Sequence (Post-Execution)

After a feature-branch prompt completes, the merge command is:

```
git fetch origin && git checkout -b {branch-name} origin/{branch-name} && git checkout main && git merge --ff-only {branch-name} && git push origin main && git branch -D {branch-name}
```

Claude Code pushes to `origin` but leaves no local tracking branch. This sequence handles that.

## Validation Checklist

Before delivering any prompt, verify ALL of the following:

- [ ] Title includes issue identifier (if applicable)
- [ ] All file paths are fully qualified (no placeholders, no `~` in non-shell contexts)
- [ ] Git identity block is present before commit step
- [ ] Commit and push is the FINAL numbered step, explicitly separated
- [ ] Branch name matches the branch strategy (feature-branch vs direct-main)
- [ ] Commit message includes issue identifier
- [ ] Verification step exists (build, test, lint as appropriate)
- [ ] Rules block is present
- [ ] Rules block includes "Do not remove existing functionality unless explicitly instructed"
- [ ] Concurrency classification is stated
- [ ] No instructions say "see above" or reference context outside the prompt
- [ ] Repo path matches the project (check memory for the correct mapping)

- [ ] **Test Contract section is present** (for Code tasks without Skip Tests)

## Delivery Format

Each prompt is delivered as a **separate linked Markdown artifact** (file in `/mnt/user-data/outputs/`). Planning context and concurrency summary stay in the chat body, not in the prompt file.

File naming: `{issue-id}-{kebab-case-description}.md` (e.g., `issue-42-hardcode-inception-date.md`)

## Anti-Patterns (Never Do These)

- Never fold the commit step into another step ("implement X and then commit")
- Never use `git add .` inside a subdirectory ... always `git add -A` from repo root
- Never assume Claude Code will push without being told
- Never give raw terminal commands for the user to run ... always wrap in a Claude Code prompt
- Never use `claude-opus-4-5-20250529` ... the current model is `claude-opus-4-6`
- Never omit the git identity block ("it was set globally" is not reliable across machines)
- Never produce a prompt that requires human substitution of any value
- Never skip the Test Contract for Code tasks (defeats the test-first quality gate)
- Never let the executor modify test assertions to make them pass (tests are the contract, not the implementation)
