# dic-skills

Operator skill library for DickBot agents running on Paperclip.

## Structure

- `/` — User-defined procedural skills (agent workflows, planning procedures)
- `/_public` — Shared platform skills (document creation, file reading)

## Agent Skill Assignments

| Skill | Agent |
|---|---|
| scoping-and-queuing-tasks | Pre-planner |
| writing-execution-prompts | Pre-planner |
| evaluating-new-ideas | Pre-planner |
| starting-a-new-project | Pre-planner |
| researching-options-and-decisions | Pre-planner |
| reviewing-completed-work | Supervisor |
| hourly-supervisor-review | Supervisor |
| tq-triage | Supervisor |
| test-queue-generator | Supervisor |
| writing-execution-prompts | Executor |
| mermaid-diagrams | All |
| frontend-design | Executor |
| backend-patterns | Executor |
| mobile-ios-design | Executor |
| ux-design | Executor |
| icon-sources | Executor |
| codex-rescue | Executor |

## Registering in Paperclip

Each skill is registered via GitHub URL in the Paperclip Skills UI.
Format: `https://github.com/michaelkd01/dic-skills/tree/main/{skill-folder}`
