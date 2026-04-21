---
name: starting-a-new-project
description: Step-by-step procedure for bootstrapping a new project from naming to first queued task
---

# New Project Kickoff Runbook

## Context

This runbook is triggered when the user wants to start a new project. It covers everything from naming to having a scaffold issue ready in Paperclip. The goal is zero missed steps ... every project gets the same infrastructure.

Role: Development Planner throughout. Execution (Paperclip and Notion setup) happens directly via tools in chat.

## Inputs Required

Before starting, confirm with the user:

1. **Project name** (display name, e.g., "SOABridge")
2. **Project code** (short prefix for doc naming, e.g., "SOA")
3. **Repo folder name** (what the directory will be called in `~/Developer/`, e.g., "soabridge")
4. **Tech stack** (Python, TypeScript/Next.js, Swift, etc.)
5. **Brief purpose** (one sentence ... what does this project do?)
6. **Target company** (DickBot for infrastructure/cross-cutting, or specific: AnytimeInterview, Bespoke, GymToGreen, ScreenTimeMath)

Use `ask_user_input` to collect bounded choices (tech stack, company). Use open-ended questions for name and purpose.

## Workflow

### Phase 1 ... Naming & Validation

1. Confirm the repo folder name follows conventions:
   - Lowercase (npm/GitHub compatibility)
   - No spaces (causes path issues in scripts)
   - Matches what `git@github.com:michaelkd01/{name}.git` will be
2. Confirm the project code is unique (search Obsidian and Notion PROJECT DOCS for existing uses)
3. Construct the full repo path: `/Users/michaeldavidson/Developer/{folder-name}`

### Phase 2 ... Platform Setup

**2a. Create Project in Paperclip**

Create the project in the correct Paperclip company via `create_project`:
- Choose the target company (DickBot for infrastructure/cross-cutting, or the specific company if the project clearly belongs to one)
- Query `list_projects` for the target company first to avoid creating duplicates
- Set the project name to match the display name

**2b. Add Project to PROJECT DOCS select options (Notion)**

Use `notion-update-data-source` on `3083257a-fd0a-8088-bbcc-000bdd488971`:
```
ALTER COLUMN "Project" SET SELECT({all existing options}, '{NewProject}':color)
```

**CRITICAL:** You must restate ALL existing project options when adding a new one. Omitted options are silently deleted. Query the current options first.

**2c. Create standard project docs (Notion)**

Use `notion-create-pages` with parent `{'data_source_id': '3083257a-fd0a-8088-bbcc-000bdd488971'}`.

Create all of these in a single batch call:

| Doc Name | Doc Type | Initial Content |
|---|---|---|
| `{Code} ... Overview` | Overview | Purpose, tech stack, status, key constraints |
| `{Code} ... Architecture & Decisions` | Architecture | Architecture section (even if minimal), empty Decisions section with ADR template |
| `{Code} ... Roadmap` | Roadmap | Phased plan or "To be defined" |
| `{Code} ... Chat Log` | Chat Log | Header and empty first entry template |

Set `Project` and `Status: Active` on all docs.

### Phase 3 ... Scaffold Issue

Create a scaffold issue in Paperclip via `create_issue`:

```
title: Scaffold {ProjectName} repo
companyId: {target company ID}
projectId: {project ID from Phase 2a}
status: todo
priority: medium
labelIds: [scaffold]
description: |
  ## Task Details
  - **Task Type:** Scaffold
  - **Category:** Chore
  - **Branch Strategy:** direct-main
  - **Repo Path:** /Users/michaeldavidson/Developer/{folder-name}
  - **Max Iterations:** 5
  - **Human Hours Est:** 0.25

  ## Acceptance Criteria
  {stack-specific, see below}
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

### Phase 4 ... Confirm & Summarize

Post a summary to the user:

```
Project {ProjectName} ({Code}) initialized:
- Paperclip: Project created in {CompanyName}
- Notion: PROJECT DOCS created (Overview, Architecture, Roadmap, Chat Log)
- Scaffold issue: {issue ID}, status: todo
- Repo path: /Users/michaeldavidson/Developer/{folder-name}
- Next: the scaffold issue moves to in_progress when you or an agent picks it up. No auto-pipeline ... manual pickup only.
```

## Post-Scaffold Checklist (after the scaffold issue is executed)

- [ ] Verify repo exists on GitHub at `michaelkd01/{folder-name}`
- [ ] First real task can be created
