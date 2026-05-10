---
name: writing-execution-prompts
description: Standard format, rules, and validation checklist for producing Claude Code execution prompts
---

# Execution Prompt Standard

## Context

Every execution prompt ... whether embedded in a Linear issue description for Cyrus to pick up, or delivered as a standalone Markdown artifact for an ad hoc manual session ... must follow this standard. This skill is the single source of truth for prompt structure, required elements, and validation.

Role: Development Planner produces the prompt. Claude Code (Cyrus or a manual session) consumes it.

## Prompt Structure

Every prompt contains these sections in order.

### 1. Title Block

```
# {LINEAR-KEY}-{N}: {Task Title}
```

Example: `# ANY-19: Add CSP reporting endpoint`

For ad hoc prompts with no Linear issue, use a descriptive title.

### 2. Context (recommended)

One to three sentences explaining WHY this task exists. Reference the project, the problem, any prior attempts. Grounds the executor without requiring it to infer intent.

### 3. Test Contract (MANDATORY for Code tasks)

Skip only for: scaffold tasks, documentation-only changes, or tasks where TDD has been explicitly waived.

The Test Contract tells the executor what tests to write FIRST, before any implementation. Without it, the executor writes tests and implementation simultaneously, optimising for "tests pass" rather than "tests match the spec".

Format:

```
## Test Contract

Write and verify the following tests BEFORE implementing any production code. All tests must pass before proceeding to implementation.

### Tests
{the approved test spec from scoping}

### Test Runner
{command from CLAUDE.md, e.g., pytest tests/, npm run test}

### Constraint
- Write all test files first. Run them. They should FAIL (red).
- Then implement production code until all tests PASS (green).
- Do not modify test assertions to make them pass. If a test is wrong, stop and report.
```

### 4. Instructions

Numbered steps. Each step must be:
- **Specific** ... name exact files, exact functions, exact line-level locations where possible
- **Self-contained** ... do not reference external docs, URLs, or "see above"
- **Unambiguous** ... if there are two valid interpretations, add a constraint to eliminate one
- **Copy-paste ready** ... all paths absolute or repo-relative. No placeholders. Every command fully formed.

### 5. Verification Step

Always include verification before the commit step. At minimum:

```
npx tsc --noEmit        # TypeScript projects
pytest                   # Python projects
ruff check src/ tests/   # Python lint
npm run lint             # JS/TS lint
```

For projects with multiple toolchains: verify each.

### 6. Commit & Push Step (MANDATORY)

This is the FINAL numbered step. Always separate, never folded into a previous step. Never trust the executor to commit on its own.

**Feature-branch tasks (Linear default ... Cyrus auto-creates a branch on pickup):**

```
git config user.email "michaelkd01@gmail.com" && git config user.name "Michael Davidson"
git add -A && git commit -m "{LINEAR-KEY}-{N}: {descriptive message}"
git push origin HEAD
```

Cyrus opens the PR. For ad hoc manual execution, also include:

```
gh pr create --title "{LINEAR-KEY}-{N}: {title}" --body "Closes {LINEAR-KEY}-{N}"
```

**Direct-main tasks (scaffold, docs-only, or explicit override):**

```
git config user.email "michaelkd01@gmail.com" && git config user.name "Michael Davidson"
git add -A && git commit -m "{LINEAR-KEY}-{N}: {descriptive message}"
git push origin main
```

The git identity lines are NOT optional. macOS defaults to hostname email, which Vercel blocks.

### 7. Rules Block (MANDATORY)

Every prompt ends with:

```
## Rules
- Follow these steps exactly. Make no assumptions. Add nothing. Do not refactor unrelated code.
- Do not remove existing functionality unless explicitly instructed.
- Report the output of every command.
```

Add task-specific rules as needed (e.g., "Do not modify files outside dashboard/", "If tests fail, stop and report").

## Branch Naming Convention

Cyrus auto-creates branches from Linear issues using its own convention. When writing an execution prompt for ad hoc manual execution, use:

- Standard tasks: `{linear-key-lower}-{n}-{kebab-case-description}` (e.g., `any-19-csp-reporting-endpoint`)
- Direct-main tasks: no branch
- Fix without a Linear issue: `fix/{kebab-case-description}`

## Concurrency Classification

Every prompt in a multi-prompt response MUST be labelled with one of:

- **PARALLEL SAFE** ... no shared files with other prompts in the batch
- **SEQUENTIAL** ... depends on another prompt completing first; state the order
- **EXCLUSIVE** ... must be the only thing running. Typically: direct-main pushes, database migrations, infra-config edits
- **BLOCKED** ... cannot execute yet; state the blocker

Single prompts: label EXCLUSIVE unless there's a reason not to.

## Task-Type-Specific Rules

### Scaffold Tasks
- Branch Strategy: direct-main
- Skip Test Contract section
- Executor uses `~/Developer` as `cwd` (repo doesn't exist yet)

### Documentation-Only Tasks
- Branch Strategy: direct-main acceptable for low-risk docs
- Skip Test Contract section
- Verification step: file integrity check (line count, head, tail, grep for key markers)

### Cyrus Config Edits
- Branch Strategy: feature branch ... never direct-main on `infra-config`
- Always mirror the live `~/.cyrus/config.json` and the source-of-truth at `~/Developer/infra-config/cyrus/`
- Always include `pm2 restart cyrus` and a `curl -s https://cyrus.socialclub.ltd/status` health check
- See `wiki/projects/cyrus.md` for known blockers (interactive `cyrus self-auth-linear`, infra-config branch state)

### Production Deployments
- Never direct-main push to a branch that auto-deploys to production
- For two-Vercel-project repos (e.g., AnytimeInterview2): use empty-commit Git integration triggers, never `vercel deploy --prod`, to avoid cross-project contamination

## Validation Checklist

Before delivering any prompt, verify ALL of the following:

- [ ] Title includes `{LINEAR-KEY}-{N}` (or descriptive title for ad hoc)
- [ ] All file paths are fully qualified (no placeholders, no `~` in non-shell contexts)
- [ ] Git identity block is present before the commit step
- [ ] Commit & push is the FINAL numbered step, explicitly separated
- [ ] Commit message includes `{LINEAR-KEY}-{N}`
- [ ] Branch strategy is correct for the task type
- [ ] Verification step exists (build, test, lint as appropriate)
- [ ] Rules block is present
- [ ] Rules block includes "Do not remove existing functionality unless explicitly instructed"
- [ ] Concurrency classification is stated
- [ ] No instructions say "see above" or reference context outside the prompt
- [ ] Repo path matches the Linear project's `Surface > Repo` (verify against the project description)
- [ ] Test Contract section is present (for Code tasks without an explicit waiver)
- [ ] If this is a Cyrus config edit: source-of-truth mirror, pm2 restart, and status check are all in the steps

## Delivery Format

### Cyrus-handled (primary use case)
The prompt IS the Linear issue. Title goes in the Linear title; the rest goes in the Linear description body. Cyrus picks it up on label or status change.

### Ad hoc manual execution
The prompt is a standalone Markdown artifact at `/mnt/user-data/outputs/`. Planning context and concurrency summary stay in the chat body, not in the prompt file.

File naming: `{LINEAR-KEY}-{N}-{kebab-case-description}.md` (e.g., `ANY-19-csp-reporting-endpoint.md`). For ad hoc without a Linear issue: `{kebab-case-description}.md`.

## Anti-Patterns (Never Do These)

- Never fold the commit step into another step ("implement X and then commit")
- Never use template placeholders like `{branch}` in the chat body ... only in the prompt file
- Never use `git add .` inside a subdirectory ... always `git add -A` from repo root
- Never assume the executor will push without being told
- Never omit the git identity block ("it was set globally" is not reliable across machines)
- Never produce a prompt that requires human substitution of any value
- Never skip the Test Contract for Code tasks (defeats the test-first quality gate)
- Never let the executor modify test assertions to make them pass
- Never direct-main push to a repo branch that auto-deploys to production
- Never edit `~/.cyrus/config.json` without mirroring to `~/Developer/infra-config/cyrus/` and restarting pm2

## Related

- `starting-a-new-project` ... uses this skill for Phase 4 (Cyrus config wiring) and Phase 5 (scaffold issue)
- `scoping-and-queuing-tasks` ... the upstream procedure that defines the test spec consumed by the Test Contract
- `reviewing-completed-work` ... the downstream procedure for the supervisor verdict
- `wiki/decisions/linear-cyrus-replaces-paperclip.md` ... why Linear is the prompt-delivery surface
