---
name: starting-a-new-project
description: Step-by-step procedure for bootstrapping a new project from naming to first pipeline-ready task
---

# New Project Kickoff Runbook

## Context

This runbook is triggered when the user wants to start a new project. It covers everything from naming to having a scaffold task ready for the pipeline. The goal is zero missed steps ... every project gets the same infrastructure.

Role: Development Planner throughout. Execution (Notion setup) happens directly via tools in chat.

## Inputs Required

Before starting, confirm with the user:

1. **Project name** (display name in Notion, e.g., "SOABridge")
2. **Project code** (short prefix for doc naming, e.g., "SOA")
3. **Repo folder name** (what the directory will be called in `~/Developer/`, e.g., "soabridge")
4. **Tech stack** (Python, TypeScript/Next.js, Swift, etc.)
5. **Brief purpose** (one sentence ... what does this project do?)

Use `ask_user_input` to collect bounded choices (tech stack, execution method preferences). Use open-ended questions for name and purpose.

## Workflow

### Phase 1 ... Naming & Validation

1. Confirm the repo folder name follows conventions:
   - Lowercase (npm/GitHub compatibility)
   - No spaces (causes path issues in scripts)
   - Matches what `git@github.com:michaelkd01/{name}.git` will be
2. Confirm the project code is unique (not already used in PROJECT DOCS)
3. Construct the full repo path: `/Users/michaeldavidson/Developer/{folder-name}`

### Phase 2 ... Notion Setup

Execute all of these directly via Notion MCP tools. Do NOT create tasks for this ... it's management work.

**2a. Add Project to TASK QUEUE select options**

Use `notion-update-data-source` on `5da08552-f08b-4734-9784-3019be7dd1a2`:
```
ALTER COLUMN "Project" SET SELECT({all existing options}, '{NewProject}':color)
```

**CRITICAL:** You must restate ALL existing project options when adding a new one. Omitted options are silently deleted. Query the current options first.

Current known projects (verify before using):
AI-BOS, AIAssistant, AIFund, Arc, Bespoke, BIStack, CaddieAI, ContextEngine, Delegator, Orchestrator, Propell, ScreenTimeMath, SOABridge

**2b. Add Project to PROJECT DOCS select options**

Use `notion-update-data-source` on `3083257a-fd0a-8088-bbcc-000bdd488971`:
```
ALTER COLUMN "Project" SET SELECT({all existing options}, '{NewProject}':color)
```

Same critical rule applies ... restate all existing options.

**2c. Create standard project docs**

Use `notion-create-pages` with parent `{'data_source_id': '3083257a-fd0a-8088-bbcc-000bdd488971'}`.

Create all of these in a single batch call:

| Doc Name | Doc Type | Initial Content |
|---|---|---|
| `{Code} ... Overview` | Overview | Purpose, tech stack, status, key constraints |
| `{Code} ... Architecture & Decisions` | Architecture | Architecture section (even if minimal), empty Decisions section with ADR template |
| `{Code} ... Roadmap` | Roadmap | Phased plan or "To be defined" |
| `{Code} ... Chat Log` | Chat Log | Header and empty first entry template |

Set `Project` and `Status: Active` on all docs.

### Phase 3 ... Scaffold Task

Create a scaffold task in the TASK QUEUE:

```
Name: Scaffold {ProjectName} repo
Project: {ProjectName}
Task Type: Scaffold
Category: Chore
Priority: 1 - High
Branch Strategy: direct-main
Status: Ready
Execution Method: Pipeline
Self Modifying: __NO__
Max Iterations: 5
Human Hours Est: 0.25
Sort Order: {next available}
Repo Path: /Users/michaeldavidson/Developer/{folder-name}
Acceptance Criteria: {stack-specific, see below}
```

**Python scaffold AC:**
```
1. Create repo at ~/Developer/{folder-name} with:
   - pyproject.toml (uv-managed, Python 3.12+)
   - src/{package_name}/__init__.py
   - src/{package_name}/main.py with placeholder
   - tests/test_main.py with one passing test
   - .gitignore (Python)
   - CLAUDE.md with project context, commands, architecture
   - README.md
2. ruff check passes
3. pytest passes
4. git init, initial commit, push to michaelkd01/{folder-name}
```

**TypeScript/Next.js scaffold AC:**
```
1. Create repo at ~/Developer/{folder-name} with:
   - Next.js app (npx create-next-app)
   - TypeScript configured
   - Tailwind CSS configured
   - .gitignore (Node)
   - CLAUDE.md with project context, commands, architecture
   - README.md
2. npm run build passes
3. npx tsc --noEmit passes
4. git init, initial commit, push to michaelkd01/{folder-name}
```

**Swift/iOS scaffold AC:**
```
1. Create Xcode project at ~/Developer/{folder-name} with:
   - SwiftUI app target
   - Test target with one passing test
   - .gitignore (Xcode/Swift)
   - CLAUDE.md with project context, commands, architecture
   - README.md
2. xcodebuild clean build passes
3. git init, initial commit, push to michaelkd01/{folder-name}
```

### Phase 4 ... Clone Map Update

The Mac Mini's nightly security audit and heartbeat agent auto-clone repos using a CLONE_MAP in `deploy/macos/wrapper-security-audit.sh`. The new repo needs to be added.

Create a task (or note for the next manual session):
- Add `{folder-name}` to the CLONE_MAP in `wrapper-security-audit.sh`
- If the folder name differs from the GitHub repo name, add the mapping explicitly
- If the repo has a non-main default branch, add to the BRANCH_MAP

### Phase 5 ... Confirm & Summarize

Post a summary to the user:

```
Project {ProjectName} ({Code}) initialized:
- Notion: PROJECT DOCS created (Overview, Architecture, Roadmap, Chat Log)
- TASK QUEUE: Project select option added
- Scaffold task: TQ-{ID} at Sort Order {N}, Status: Ready
- Repo path: /Users/michaeldavidson/Developer/{folder-name}
- Next: Pipeline picks up scaffold, then Clone Map update for Mac Mini
```

## Post-Scaffold Checklist (after pipeline runs the scaffold)

- [ ] Verify repo exists on GitHub at `michaelkd01/{folder-name}`
- [ ] Verify Mac Mini can clone it (heartbeat will attempt auto-clone)
- [ ] First real task can be created
