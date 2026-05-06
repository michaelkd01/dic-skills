---
name: starting-a-new-project
description: Step-by-step procedure for bootstrapping a new project from naming to first Linear issue ready for Cyrus
---

# New Project Kickoff Runbook

## Context

This runbook is triggered when the user wants to start a new project. It covers everything from naming to having a scaffold issue ready in Linear and wired to Cyrus. The goal is zero missed steps ... every project gets the same infrastructure.

Active execution layer: Cyrus driven by Linear. Knowledge layer: Obsidian + Notion PROJECT DOCS.

Role: Development Planner throughout.

## Inputs Required

Before starting, confirm with the user:

1. **Project name** (e.g., "SOABridge")
2. **Project code** (short prefix, e.g., `SOA`)
3. **Repo folder name** (directory in `~/Developer/`, e.g., `soabridge`)
4. **Tech stack** (Python, TypeScript/Next.js, Swift, etc.)
5. **Brief purpose** (one sentence)
6. **Linear placement decision**: own team, or scope label inside an existing team? Generally each *business* gets its own Linear workspace; sub-projects within a business can share a team with scope labels.

Use `ask_user_input_v0` to collect bounded choices (tech stack, Linear placement). Use open-ended questions for name and purpose.

## Workflow

### Phase 1 ... Naming & Validation

1. Confirm the repo folder name follows conventions:
   - Lowercase
   - No spaces
   - Matches `git@github.com:michaelkd01/{name}.git`
2. Confirm the project name is unique across the portfolio (check `_shared/repo-paths.md` and Notion PROJECT DOCS Project select)
3. Construct the full repo path: `/Users/michaeldavidson/Developer/{folder-name}`

### Phase 2 ... Linear Setup

**If creating a new Linear team:**

1. In Linear UI: Create Team with the desired prefix
2. Mirror the canonical workflow states from AnytimeInterview: `Backlog`, `Todo`, `In Progress`, `Investigation Complete`, `In Review`, `Done`, `Canceled`, `Duplicate`
3. Add canonical labels: `Investigate`, `CI Failed`, `Feature`, `Improvement`, `Bug`
4. Add scope labels per the workspace's scope structure

**If using an existing team with a scope label:**

1. Add a scope label for the new project if it doesn't exist (via Linear UI or `Linear` MCP if available in this chat)
2. Document the scope label in `_shared/repo-paths.md`

### Phase 3 ... Knowledge Layer Setup

**Obsidian:**

1. Create `wiki/projects/{slug}.md` with the standard project frontmatter and headings (Purpose, Stack, Status, Connections)
2. Create `wiki/projects/{slug}/architecture/` directory for ADRs as the project develops

**Notion PROJECT DOCS** (fallback / external collaboration):

1. Add the project to the PROJECT DOCS database `Project` select if it doesn't exist. **CRITICAL:** restate ALL existing options when adding a new one. Omitted options are silently deleted.
2. Create the standard four docs in a single `Notion:notion-create-pages` batch with parent `{'data_source_id': '3083257a-fd0a-8088-bbcc-000bdd488971'}`:

| Doc Name | Doc Type | Initial Content |
|---|---|---|
| `{Code} ... Overview` | Overview | Purpose, tech stack, status, key constraints |
| `{Code} ... Architecture & Decisions` | Architecture | Architecture section + empty Decisions section with ADR template |
| `{Code} ... Roadmap` | Roadmap | Phased plan or "To be defined" |
| `{Code} ... Chat Log` | Chat Log | Header and empty first entry template |

Set `Project` and `Status: Active` on all docs.

### Phase 4 ... Cyrus Configuration

Add the new repo to `~/.cyrus/config.json` on the Mac Mini under the appropriate workspace block:
- `repository`: `michaelkd01/{folder-name}`
- `baseBranch`: typically `staging` or `main` per repo convention
- Any scope-label routing if applicable

`pm2 restart cyrus` to apply.

### Phase 5 ... Update _shared/repo-paths.md

Add the new project to the canonical Project ↔ Repo Path table.

### Phase 6 ... Scaffold Issue

Create a scaffold issue in Linear via `Linear:save_issue`:

```
title: Scaffold {ProjectName} repo
team: {team key}
state: Todo
labels: [scaffold, {scope label if applicable}]
priority: 2 (High)
description:
  ## Context
  Bootstrapping the {ProjectName} repo for first commits.

  ## Acceptance Criteria
  {stack-specific AC, see below}
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

### Phase 7 ... Confirm & Summarize

Post a summary:

```
Project {ProjectName} ({Code}) initialized:
- Linear: {team / scope label} configured
- Knowledge: Obsidian project page + Notion PROJECT DOCS (Overview, Architecture, Roadmap, Chat Log)
- Cyrus: workspace block added, restart applied
- Repo path: /Users/michaeldavidson/Developer/{folder-name} (added to _shared/repo-paths.md)
- Scaffold issue: {identifier}, state: Todo
- Next: Cyrus picks up scaffold and opens initial PR
```

## Post-Scaffold Checklist

- [ ] Verify repo exists on GitHub at `michaelkd01/{folder-name}`
- [ ] Verify Cyrus opened the initial PR
- [ ] Supervisor verdict on the scaffold PR (see `reviewing-completed-work`)
- [ ] First real task can be created
