# dic-skills

Skill library for the Linear + Cyrus execution stack. Operator skills (procedural, planning) live at the repo root; shared platform skills under `_public/`.

## Role Assignment

Skills are organised by which role in the three-role model consumes them.

### Development Planner
- `starting-a-new-project` ... bootstrap a project end-to-end (Linear, Obsidian, Cyrus, scaffold)
- `scoping-and-queuing-tasks` ... scope a task and put it on Linear
- `writing-execution-prompts` ... structure for execution prompts
- `evaluating-new-ideas` ... gated evaluation of early-stage ideas
- `researching-options-and-decisions` ... evaluate options, document decisions

### Execution (Cyrus / Claude Code)
- `writing-execution-prompts` ... shared with planner; defines the consumed contract
- `frontend-design` ... distinctive, production-grade frontend UI
- `backend-patterns` ... API design, database, server-side patterns
- `mobile-ios-design` ... iOS HIG and SwiftUI
- `ux-design` ... user flows, wireframes, interaction patterns
- `icon-sources` ... Iconify vs Flaticon routing
- `codex-rescue` ... delegate stuck work to OpenAI Codex

### Supervisor
- `reviewing-completed-work` ... PASS / FIX / REJECT verdicts on PRs
- `hourly-supervisor-review` ... scheduled supervisor sweep

### Cross-role
- `mermaid-diagrams` ... diagram authoring

## Structure

- `/` ... role-facing procedural skills (one folder per skill, each with a `SKILL.md`)
- `/_public` ... shared platform skills (document creation, file reading)
- `/_shared` ... shared content referenced across skills
- `/_audit` ... audit and review notes

## How skills are used

- **Claude.ai chat sessions:** uploaded via Settings → Skills, mounted at `/mnt/skills/user/`
- **Cyrus and Claude Code manual sessions:** read from the local checkout at `/Users/michaeldavidson/Developer/dic-skills/`

## Related

- `wiki/decisions/linear-cyrus-replaces-paperclip.md` ... why this is the current execution model
- `wiki/decisions/strict-mcp-config-for-agents.md` ... tooling surface conventions for Cyrus
