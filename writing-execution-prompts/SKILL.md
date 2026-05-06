---
name: writing-execution-prompts
description: Standard format, rules, and validation checklist for producing Claude Code execution prompts
---

# Claude Code Prompt Standard

## Context

Every Claude Code execution prompt must follow this standard. This skill is the single source of truth for prompt structure, required elements, and validation. It applies to all prompts ... Cyrus-attached prompts (sub-documents on Linear issues), manual one-off prompts, scaffolds, fixes, and ad hoc executions.

## Prompt Structure

Every prompt must contain these sections in order:

### 1. Title Block

```
# {Issue identifier}: {Task Name}
```

For Cyrus-attached prompts, the issue identifier is the Linear identifier (e.g., `ANY-42`, `BES-7`). For manual ad hoc prompts without an issue, use a descriptive title.

### 2. Context (optional but recommended)

One to three sentences explaining WHY this task exists. Reference the project, the problem, and any prior attempts. This grounds Claude Code's understanding without requiring it to infer intent.

### 3. Test Contract (MANDATORY for Code tasks)

**Skip only for:** scaffold work or management/non-code work.

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
- **Copy-paste ready** ... all paths are absolute or repo-relative. No placeholders. Every command is fully formed.

### 5. Verification Step

Always include a verification step before the commit step. At minimum:
```
npx tsc --noEmit        # TypeScript projects
pytest                   # Python projects
ruff check src/ tests/   # Python lint
```

For projects with multiple toolchains, verify each.

### 6. Commit, Merge, and Push Step (MANDATORY)

This must be the FINAL numbered step. Never folded into a previous step. Never trust Claude Code to commit on its own.

**For feature-branch tasks (manual session, includes merge to base branch):**
```
git config user.email "michaelkd01@gmail.com" && git config user.name "Michael Davidson"
git checkout -b {branch-name}
git add -A && git commit -m "{issue-identifier}: {descriptive message}" && git push origin {branch-name}
git checkout {base-branch} && git merge --ff-only {branch-name} && git push origin {base-branch} && git branch -D {branch-name}
```

The merge-to-base step is part of the prompt itself. **Never provide a separate post-merge command in chat.** The prompt is self-contained. If the ff-only merge fails, the work is safe on the feature branch for manual resolution.

**For Cyrus-driven work:** Cyrus opens a PR rather than merging directly. The merge-to-base step is omitted; the Supervisor (or `hourly-supervisor-review`) merges the PR after validation.

**For direct-to-base tasks:**
```
git config user.email "michaelkd01@gmail.com" && git config user.name "Michael Davidson"
git add -A && git commit -m "{issue-identifier}: {descriptive message}" && git push origin {base-branch}
```

The git identity lines are NOT optional. macOS defaults to a hostname email which Vercel blocks.

**Default branch names:** Verify per-repo. Modern repos use `main`. AnytimeInterview's Cyrus base is `staging`. Always confirm with `git symbolic-ref refs/remotes/origin/HEAD` if unsure.

### 7. Rules Block (MANDATORY)

Every prompt must end with:

```
## Rules
- Follow these steps exactly. Make no assumptions. Add nothing. Do not refactor unrelated code.
- Do not remove existing functionality unless explicitly instructed.
- Report the output of every command.
```

Add task-specific rules as needed.

## Branch Naming Convention

**Cyrus-driven work:** Cyrus generates branch names automatically per its config. Don't override unless required.

**Manual prompts:**
- Issue-attached: `{issue-identifier}-{kebab-case-description}` (e.g., `ANY-42-fix-stripe-webhook-replay`)
- Ad hoc: `fix/{kebab-case-description}` or `chore/{kebab-case-description}`

## Concurrency Classification

Every prompt delivered in a multi-prompt response MUST be labeled with one of:

- **PARALLEL SAFE** ... no shared files with other prompts in the batch.
- **SEQUENTIAL** ... depends on another prompt completing first. State the order.
- **EXCLUSIVE** ... must be the only thing running. Typically: direct-to-base pushes, database migrations, repo-wide refactors.
- **BLOCKED** ... cannot execute yet. State the blocker.

If delivering a single prompt, label it EXCLUSIVE unless there's a reason not to.

## Task-Type-Specific Rules

### Scaffold Prompts
- Direct-to-base (no feature branch)
- Skip Test Contract section
- Executor uses `~/Developer` as `cwd` (not repo root ... repo doesn't exist yet)

### Management Prompts (no code changes)
- Don't deliver as Claude Code prompts. Handle directly in chat via Linear / Notion / Obsidian MCP tools.
- The prompt format below assumes work that produces commits. Pure-doc work doesn't fit.

## Validation Checklist

Before delivering any prompt, verify ALL of the following:

- [ ] Title includes the issue identifier (if applicable)
- [ ] All file paths are fully qualified
- [ ] Git identity block is present before commit step
- [ ] Commit, merge, and push is the FINAL numbered step
- [ ] Feature-branch prompts include the merge-to-base step (or omit if Cyrus-driven)
- [ ] Base branch name is correct for the repo
- [ ] Branch name matches the branch strategy
- [ ] Commit message includes the issue identifier
- [ ] Verification step exists (build, test, lint as appropriate)
- [ ] Rules block is present
- [ ] Rules block includes "Do not remove existing functionality unless explicitly instructed"
- [ ] Concurrency classification is stated
- [ ] No instructions say "see above" or reference context outside the prompt
- [ ] Repo path matches the project (cross-check `_shared/repo-paths.md`)
- [ ] Test Contract section is present (for Code tasks)
- [ ] Any model reference points to the latest available Claude Opus. Current as of writing: `claude-opus-4-7`. Update to whatever is highest when new versions release.

## Delivery Format

For Cyrus-attached prompts: store as a Linear sub-document via `Linear:save_document` with the issue as parent. Name the doc `Execution Prompt`.

For manual prompts: deliver as a separate linked Markdown artifact in chat. Planning context and concurrency summary stay in the chat body, not in the prompt file.

File naming for ad hoc prompts: `{issue-identifier}-{kebab-case-description}.md` or `manual-{kebab-case-description}.md`.

## Anti-Patterns (Never Do These)

- Never fold the commit step into another step ("implement X and then commit")
- Never provide a separate post-merge command in chat ... the merge is in the prompt (or omitted for Cyrus)
- Never use template placeholders like `{branch}` in the chat body ... only in the prompt file
- Never use `git add .` inside a subdirectory ... always `git add -A` from repo root
- Never assume Claude Code will push without being told
- Never give raw terminal commands for the user to run ... always wrap in a Claude Code prompt
- Never pin to an old Claude model. Use the latest Claude Opus available; current is `claude-opus-4-7`. Update when new versions release.
- Never omit the git identity block ("it was set globally" is not reliable across machines)
- Never produce a prompt that requires human substitution of any value
- Never skip the Test Contract for Code tasks (defeats the test-first quality gate)
- Never let the executor modify test assertions to make them pass (tests are the contract, not the implementation)
- Never assume default branch is `main` ... verify per-repo (some use `staging`, `master`, etc.)
