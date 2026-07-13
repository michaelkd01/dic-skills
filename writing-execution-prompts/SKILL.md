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

## Base Branch

Cyrus resolves the base branch for every spawned worktree via `GitService.determineBaseBranch()` in this priority order:

0. **Explicit override** ... `[repo=name#branch]` syntax in the Linear issue description body
1. **Graphite blocked-by relationship** ... stacked PRs
2. **Parent issue branch** ... for sub-issues whose parent has an active branch
3. **Repository default** ... `repositories[<name>].baseBranch` in `~/.cyrus/config.json` (terminal fallback)

There is **no live GitHub API lookup** at issue time. The terminal fallback is whatever string sits in the config file.

**Do NOT specify the base branch in prompt prose.** Phrases like "branch from main", "create a branch off staging", or "make sure you branch from X" contradict Cyrus's actual resolution and trigger recovery loops. SOC-18 documented the failure mode: on ANY-230, prompt prose said "branch from main" while config priority 3 (correctly) put Cyrus on `staging` ... Cyrus then presented destructive recovery options to reconcile the mismatch.

If an override is needed for one issue, use the explicit `[repo=name#branch]` syntax in the Linear description (priority 0). Otherwise, stay silent and let the config default win.

Per-repo defaults (Planner reference, not for prompt body):

| Repo | `baseBranch` |
|---|---|
| `anytimeinterview2` | `staging` (main is parked pending BV6 promotion) |
| `bespoke-website-main` | `main` |

When a new repo is wired into Cyrus, record its `baseBranch` here.

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

## Capability Exhaustion Gate (MANDATORY)

No prompt, step, verdict, or status update may route work back to a human until every autonomous path has been exhausted and the exhaustion is documented. This gate exists because shallow checks ("not in the Keychain", "not in the first vault searched") have repeatedly been escalated as NOT-CAPABLE and converted into manual human work (see SOC-68), and because actions with an obvious CLI/MCP equivalent have been handed back as "dashboard work" (see BES-119).

Before any NOT-CAPABLE conclusion, or any instruction that a human retrieve, mint, configure, deploy, click, or paste anything, the executor MUST check all of the following and record the result of each:

0. **Credential binding manifest (check FIRST).** If the task needs a known credential for a project/operation, resolve it before any vault search: run `python3 -m cyrus_supervisor.credentials <project> <operation>` (or `~/Developer/infra-config/scripts/resolve-credential.sh <project> <operation>`) from the infra-config repo. A declared binding is authoritative ... use that `op://` reference and SKIP the discovery search below. Only if the resolver hard-fails with `UndeclaredBindingError` do you proceed to the vault search. To materialise the secret non-interactively, append `--read` (it reads via the service-account token; never triggers a biometric prompt).
1. **1Password ... Social Club account only** (service account `sc-service-account`). Search ALL accessible vaults with multiple terms (service name, "API", "token", "key", "global", "master"). A single-vault title grep is not a search. Never query the Propell or davidsons-aus accounts.
2. **Derivable credentials** ... a parent credential that can MINT the needed one counts as having it. A Cloudflare Global API Key or Tokens:Write token can mint scoped tokens via the API; most providers have an equivalent. Derivation is mandatory, not optional.
3. **Host state** ... environment variables, `~/.cyrus/`, `~/Developer/infra-config/`, project `.env*` files, launchd plists, macOS Keychain.
4. **Direct API/CLI/MCP paths** ... whether an already-authenticated API, CLI, or MCP tool can perform the action without the missing credential at all.
5. **Action capability (applies even when NO credential is missing)** ... before instructing a human to create, deploy, provision, configure, click, or paste anything, confirm that no installed CLI (`gh`, `vercel`, `wrangler`, `op`, ...) and no connected MCP (Vercel, Cloudflare, GitHub, Linear, ...) already performs the action. Consult the Executor Capability Manifest if present; otherwise verify live (`--help`, `--dry-run`, a list/status subcommand). "It looks like dashboard work" is not evidence: most dashboard actions have a CLI or API equivalent (Vercel project create + env add + deploy; Cloudflare DNS; GitHub repo/PR). The burden is to prove no tool covers it, not to assume none does.

A NOT-CAPABLE verdict is valid ONLY if it lists every location checked, the exact commands or queries used, and why each path failed.

Human handback is permitted only for: interactive-only auth (browser OAuth / device flows), credentials confirmed absent from all of the above, irreversible high-stakes actions, or genuine judgment calls.

## Guard Conditions (write to intent)

A STOP or guard condition must test the actual risk it exists to prevent, not a proxy that is merely easier to express. A proxy that over-fires trains the executor to treat guards as advisory, which erodes their authority for the case that genuinely matters.

- State the intent, then choose a check that matches it exactly. If the check can fire when nothing is actually at risk, it is a proxy ... tighten it.
- Worked example: "STOP if `git status --porcelain` is non-empty" is a proxy for "STOP if there are uncommitted changes to tracked files". `porcelain` also lists untracked files, which a checkout or fast-forward cannot destroy, so the proxy over-fires. Write the intent-matching form: STOP if `git status --porcelain=v1 | grep -v '^??'` is non-empty (uncommitted tracked changes only).
- The test before shipping a guard: could it fire in a situation where proceeding is actually safe? If yes, rewrite it so the literal condition and the correct behaviour coincide.

## Validation Checklist

Before delivering any prompt, verify ALL of the following:

- [ ] Title includes `{LINEAR-KEY}-{N}` (or descriptive title for ad hoc)
- [ ] All file paths are fully qualified (no placeholders, no `~` in non-shell contexts)
- [ ] Git identity block is present before the commit step
- [ ] Commit & push is the FINAL numbered step, explicitly separated
- [ ] Commit message includes `{LINEAR-KEY}-{N}`
- [ ] Branch strategy is correct for the task type
- [ ] **Base branch is NOT mentioned in prompt prose** (let Cyrus resolve from config; use `[repo=name#branch]` syntax only if explicit override is required)
- [ ] Verification step exists (build, test, lint as appropriate)
- [ ] Rules block is present
- [ ] Rules block includes "Do not remove existing functionality unless explicitly instructed"
- [ ] Concurrency classification is stated
- [ ] No instructions say "see above" or reference context outside the prompt
- [ ] Repo path matches the Linear project's `Surface > Repo` (verify against the project description)
- [ ] Test Contract section is present (for Code tasks without an explicit waiver)
- [ ] If this is a Cyrus config edit: source-of-truth mirror, pm2 restart, and status check are all in the steps
- [ ] Every step that can fail on a missing credential or permission is preceded by a Capability Exhaustion Gate discovery phase
- [ ] The deliverable ends with a Handback Audit block, and every item in it carries an allowed category plus evidence
- [ ] Every STOP/guard condition tests intent, not a proxy (see Guard Conditions)
- [ ] Literal emails / URLs / values-to-copy are wrapped in backticks (auto-linkify guard)

## Delivery Format

### Cyrus-handled (primary use case)
The prompt IS the Linear issue. Title goes in the Linear title; the rest goes in the Linear description body. Cyrus picks it up on label or status change.

### Ad hoc manual execution
The prompt is a standalone Markdown artifact at `/mnt/user-data/outputs/`. Planning context and concurrency summary stay in the chat body, not in the prompt file.

File naming: `{LINEAR-KEY}-{N}-{kebab-case-description}.md` (e.g., `ANY-19-csp-reporting-endpoint.md`). For ad hoc without a Linear issue: `{kebab-case-description}.md`.

The attached Linear sub-document is the single source of truth for the prompt. Fetch the current version at execution time (Linear `get_document`) rather than running a pasted or cached copy ... a post-delivery revision silently supersedes earlier copies. Incident: a SOC-158 session ran a pre-correction prompt and shipped a defect the revision had already fixed.

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
- **Never specify the base branch in prompt prose** ("branch from main", "create a branch off staging"). Cyrus resolves the base from config via `GitService.determineBaseBranch()`; contradicting it in prose causes recovery loops. Use `[repo=name#branch]` in the Linear description for explicit overrides.
- Never conclude NOT-CAPABLE from a single-location credential check
- Never hand a human a task that an available parent credential could derive or an authenticated API could perform
- Never hand a human a deploy/provision/config action without first checking the installed CLIs and connected MCPs that perform it (see BES-119: a Vercel deploy was handed back when vercel + gh + op and the Vercel MCP all covered it)
- Never write a STOP/guard condition as a proxy that over-fires (e.g. "porcelain non-empty" when the intent is uncommitted *tracked* changes). A guard that fires when proceeding is safe erodes the authority of guards that matter ... see Guard Conditions.
- Never leave a bare email or URL in a prompt delivered through Linear or Notion. Those surfaces auto-linkify them (a bare `michael.d@propell.au` becomes a `[...](mailto:...)` link), and the executor copies the wrapped form verbatim into the target file, corrupting it. Wrap any literal address, URL, or value-to-be-copied in inline backticks so it survives the round-trip. (SOC-158.)

## Related

- `starting-a-new-project` ... uses this skill for Phase 4 (Cyrus config wiring) and Phase 5 (scaffold issue)
- `scoping-and-queuing-tasks` ... the upstream procedure that defines the test spec consumed by the Test Contract
- `reviewing-completed-work` ... the downstream procedure for the supervisor verdict
- `wiki/decisions/linear-cyrus-replaces-paperclip.md` ... why Linear is the prompt-delivery surface

## Handback Audit (MANDATORY final output)

Every deliverable produced under this skill ... plan, scoped issue, execution prompt, verdict, or status update ... MUST end with a Handback Audit block. Emit it in this labelled-field form, one field per line, so it stays scannable in chat and when pasted into Notion:

**HANDBACK AUDIT** · {N} handbacks · {M} decisions pending

**1. {imperative action}**
- **Category** · {interactive-only auth | credential confirmed absent | irreversible high-stakes | judgment call}
- **Blocked because** · {one line: what was checked, why no autonomous path exists}
- **Already autonomous** · {what was done inside the boundary, so the handback's scope is visible}
- **Return to me** · {the exact artefact to paste back; omit this line when there is none}

...repeat the numbered block per handback item...

**Decisions pending (not handbacks)**
- {item} ... {why it is a decision, and what you do once the operator calls it}

Block rules:
- The header counts both: `{N} handbacks` is the number of numbered items; `{M} decisions pending` is the number of entries below. Omit the Decisions pending section when M = 0.
- A judgment call you will action yourself once the operator decides is a decision pending, never a handback ... do not bury it inside a handback item's evidence.
- When N = 0, emit `**HANDBACK AUDIT** · 0 handbacks · nothing owed by you` (followed by the Decisions pending section only if M > 0).

An item that cannot be mapped to an allowed category with evidence is a defect: convert it into an autonomous step or execution prompt before delivery. A deliverable missing this block fails validation. The categories and evidence standard are defined by the Capability Exhaustion Gate in the writing-execution-prompts skill.
