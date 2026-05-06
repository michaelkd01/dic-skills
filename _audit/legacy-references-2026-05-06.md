# Skills Legacy-Reference Audit — 2026-05-06

Working dir: `/Users/michaeldavidson/Developer/dic-skills`
Scope: every `SKILL.md` reachable from the working dir (recursive).
Mode: READ-ONLY recon. No skill files were modified.
Purpose: feed the rewrite of these skills onto the Linear + Cyrus execution layer.

> Classification key
> - **BLOCK** — gates execution; must be replaced before the skill can run on Linear/Cyrus
> - **WARN** — terminology drift; reword but not load-bearing
> - **KEEP** — still valid in the new world (e.g. project↔repo path mapping)

> Cross-cutting fact: **no SKILL.md anywhere in this directory mentions "Linear", "Cyrus", or an `ANY-` issue prefix.** Zero forward-compatible references exist today. Every active workflow skill is wired to Paperclip-MCP and/or the Notion TASK QUEUE.

---

## 1. Inventory

| File | Bytes | Lines | name | description (truncated) | References Linear/Cyrus/ANY-? |
|---|---|---|---|---|---|
| `scoping-and-queuing-tasks/SKILL.md` | 11,301 | 261 | scoping-and-queuing-tasks | Procedural checklist for scoping a task from first mention to queued with a Claude Code prompt | no |
| `tq-triage/SKILL.md` | 8,399 | 157 | tq-triage | Nightly triage of failed and blocked tasks with deep root-cause analysis | no |
| `starting-a-new-project/SKILL.md` | 5,490 | 152 | starting-a-new-project | Step-by-step procedure for bootstrapping a new project from naming to first queued task | no |
| `test-queue-generator/SKILL.md` | 5,389 | 106 | test-queue-generator | Generates test queue entry for the day | no |
| `hourly-supervisor-review/SKILL.md` | 8,837 | 214 | hourly-supervisor-review | Scheduled agent that reviews in-review tasks, auto-passes verified work, and flags uncertain items via Slack DM | no |
| `reviewing-completed-work/SKILL.md` | 9,408 | 249 | reviewing-completed-work | Procedural checklist for validating task execution outputs and issuing PASS/FIX/REJECT verdicts | no |
| `writing-execution-prompts/SKILL.md` | 7,808 | 183 | writing-execution-prompts | Standard format, rules, and validation checklist for producing Claude Code execution prompts | no |
| `researching-options-and-decisions/SKILL.md` | 5,483 | 129 | researching-options-and-decisions | Standardized approach for evaluating options, presenting tradeoffs, and documenting architecture decisions | no |
| `evaluating-new-ideas/SKILL.md` | 10,847 | 276 | evaluating-new-ideas | Gated evaluation framework for early-stage project ideas, from first mention to Go/Park/Kill | no |
| `codex-rescue/SKILL.md` | 5,491 | 138 | codex-rescue | Delegate stuck or failing work to OpenAI Codex from within manual Claude Code sessions | no |
| `mermaid-diagrams/SKILL.md` | 7,366 | 216 | mermaid-diagrams | Comprehensive guide for creating software diagrams using Mermaid syntax… | no |
| `mobile-ios-design/SKILL.md` | 7,376 | 272 | mobile-ios-design | Master iOS Human Interface Guidelines and SwiftUI patterns for building native iOS apps… | no |
| `frontend-design/SKILL.md` | 4,274 | 41 | frontend-design | Create distinctive, production-grade frontend interfaces… | no |
| `ux-design/SKILL.md` | 10,533 | 397 | ux-design | UX design methodology and external consultation… | no |
| `backend-patterns/SKILL.md` | 13,415 | 587 | backend-patterns | Backend architecture patterns, API design, database optimization, and server-side best practices… | no |
| `icon-sources/SKILL.md` | 10,373 | 303 | icon-sources | Standardised icon selection and integration for all frontend builds… | no |
| `_public/file-reading/SKILL.md` | 12,284 | 345 | file-reading | Use this skill when a file has been uploaded but its content is NOT in your context… | no |
| `_public/xlsx/SKILL.md` | 11,463 | 291 | xlsx | Use this skill any time a spreadsheet file is the primary input or output… | no |
| `_public/pdf/SKILL.md` | 8,072 | 314 | pdf | Use this skill whenever the user wants to do anything with PDF files… | no |
| `_public/pptx/SKILL.md` | 9,642 | 231 | pptx | Use this skill any time a .pptx file is involved in any way… | no |
| `_public/frontend-design/SKILL.md` | 4,440 | 42 | frontend-design | Create distinctive, production-grade frontend interfaces… | no |
| `_public/product-self-knowledge/SKILL.md` | 2,605 | 65 | product-self-knowledge | Stop and consult this skill whenever your response would include specific facts about Anthropic's products… | no |
| `_public/docx/SKILL.md` | 20,084 | 590 | docx | Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files)… | no |
| `_public/pdf-reading/SKILL.md` | 10,942 | 305 | pdf-reading | Use this skill when you need to read, inspect, or extract content from PDF files… | no |

24 SKILL.md files total. **Twelve** are clean of legacy references entirely (the design / format / Anthropic-public skills). **Twelve** carry varying loads of legacy references and need rewriting against Linear + Cyrus.

---

## 2. Per-skill findings (legacy hits only)

Files not listed below had zero legacy hits and need no rewrite for the migration:
`mermaid-diagrams`, `mobile-ios-design`, `frontend-design`, `ux-design`, `icon-sources`, `backend-patterns`, and the entire `_public/` tree. (Trace-only matches are noted at the bottom of §2.)

### 2.1 `scoping-and-queuing-tasks/SKILL.md` — heavy legacy, BLOCK-class

| Line | Hit | Class | Note |
|---|---|---|---|
| 12 | "All status transitions must comply with the ADR-003 valid_transitions map. Invalid transitions are rejected by the state machine in code." | **BLOCK** | ADR-003 is the Notion-pipeline state machine. Linear has its own workflow states; replace with Linear team workflow rules. |
| 18 | "**Paperclip task tools**: `list_issues` (search/filter by `status`, `projectId`, `assigneeAgentId`), `create_issue`, `update_issue`, `put_issue_document`…" | **BLOCK** | Whole tool surface needs swap to `mcp__claude_ai_Linear__*` (`list_issues`, `save_issue`, `save_document`, `save_comment`). |
| 20 | "Notion PROJECT DOCS: fallback when Obsidian doesn't have the content" | WARN | Obsidian-first remains valid; Notion fallback may stay or migrate to Linear docs. |
| 29 | "Search Paperclip via `list_issues`…" | **BLOCK** | Linear search pattern differs (team scope, status names). |
| 31 | "Fetch any attached documents via issue document keys (e.g., `spec`, `prompt`, `execution-log`)" | **BLOCK** | Linear has no `put_issue_document` doc-key concept — use sub-pages, comments, or attachments. Whole "spec/prompt/execution-log" doc-key system is Paperclip-specific. |
| 42–43 | Architecture & Decisions / Overview lookup via Obsidian, Notion fallback | KEEP | Project-context lookup pattern is valid post-migration. |
| 54 | "Step 3 ... Validate / Refine **Acceptance Criteria**" | KEEP | AC reused on Linear (treat as task-body section). |
| 62 | "Scope is achievable within Max Iterations (default 15, increase for complex tasks)" | **BLOCK** | "Max Iterations" is a Notion TASK QUEUE property used by the orchestrator state machine. Cyrus has no such field. |
| 69 | "**Applies to:** Code tasks (Task Type = Code). Skip for Scaffold, Management, and Research tasks. Also skip if the task has Skip Tests = YES." | **BLOCK** | Task Type and Skip Tests are TASK QUEUE properties. Replace with Linear labels. |
| 100 | "Task cannot move to `todo` until test spec is approved" | **BLOCK** | `todo` is a Paperclip lifecycle state name. Linear status names (e.g. `Backlog`, `Todo`, `In Progress`, `In Review`, `Done`) need confirming for the new workflow. |
| 123 | "### Step 4 ... Create or Update the Task in Paperclip" | **BLOCK** | Header rename + tool swap. |
| 125–142 | `create_issue` field table (`companyId`, `projectId`, `assigneeAgentId`, `parentId`) | **BLOCK** | Linear field names differ (`teamId`, `projectId` semantics, `assigneeId`, `parentId`). Several values (DickBot/AnytimeInterview/Bespoke/GymToGreen/ScreenTimeMath as *companies*) become Linear *teams* or labels. |
| 148–158 | Description template fields: Task Type, Category, **Branch Strategy**, **Repo Path**, **Max Iterations**, **Human Hours Est**, **Acceptance Criteria** | mixed | `Branch Strategy`, `Repo Path`, `Acceptance Criteria` → **KEEP** (still useful in any task body). `Max Iterations`, `Human Hours Est`, `Task Type`, `Category` → **BLOCK** (Notion-property semantics; reframe as labels or omit). |
| 161 | "Attach the full spec (if lengthy) via `put_issue_document` with `key: \"spec\"`" | **BLOCK** | Replace with Linear sub-document or attachment. |
| 163–171 | Status decision rules using `todo` / `backlog` / `in_progress` / `in_review` / `done` | **BLOCK** | Confirm exact Linear status set for the migration team and replace verbatim. |
| 173–185 | Human Hours Estimation Guide | KEEP | Useful concept; keep as a Linear field/label or estimate description. |
| 187–194 | Validation gate (HHE / Repo Path / Branch Strategy) | mixed | KEEP the validation idea, BLOCK the property names. |
| 208 | "Attach the prompt to the Paperclip issue via `put_issue_document` with `key: \"prompt\"`." | **BLOCK** | Cyrus typically reads the issue body / a sub-doc. Replace with Linear sub-document or @-tagged comment that Cyrus consumes. |
| 217, 220–223 | `cd ~/Developer/{repo} && claude` / merge sequence | KEEP | Repo path + git merge sequence remains valid; only the surrounding wrapper changes (Cyrus may invoke Claude Code automatically). |
| 230–232 | Deploy reminder, deploy hook lookup | KEEP | Deploy hook concept survives migration. |
| 240 | "Using `~/Developer/` instead of `/Users/michaeldavidson/Developer/` in Repo Path" | KEEP | General path-normalisation rule. |
| 245–259 | Project → Repo Path Mapping table | **KEEP** | The most reusable artefact in this skill. Survives untouched. |

### 2.2 `tq-triage/SKILL.md` — heavy legacy, BLOCK-class. Orchestrator-specific.

| Line | Hit | Class | Note |
|---|---|---|---|
| 6 | "# Orchestrator Nightly Review ... Failed & Blocked Task Triage" | **BLOCK** | Whole skill is Orchestrator-specific. |
| 10 | `https://www.notion.so/31e3257afd0a817f8e5cea831f4c358e` workflow doc URL | **BLOCK** | Notion-only workflow source. Replace with Linear-equivalent runbook. |
| 16 | `collection://5da08552-f08b-4734-9784-3019be7dd1a2` (TASK QUEUE) | **BLOCK** | Notion DB UUID — does not exist in Linear. |
| 17, 25 | `view://3183257a-fd0a-80d5-a23f-000c635b11ca` (Blocked - Failed view) | **BLOCK** | Notion view URL. Replace with a Linear filter / saved view. |
| 25 | "Status = Failed or Blocked" | **BLOCK** | `Failed` is not a Linear default status; confirm replacement (`Cancelled`, `Blocked`, custom label, etc.). |
| 26–33 | Read fields: Name, Task ID, Project, Task Type, Category, Acceptance Criteria, **Execution Log**, **Blocked Reason**, **Iterations Used vs Max Iterations**, **Retry Count and Max Retries**, **Shared Files**, **Repo Path** | **BLOCK** | All except `Acceptance Criteria` and `Repo Path` are TASK QUEUE properties with no Linear equivalent. Need redesign for Cyrus telemetry / Linear comments. |
| 28 | "Execution Log" referenced repeatedly (lines 28, 52, 84, 94, 105, 117, 121) | **BLOCK** | Notion field. Replace with Cyrus run output / Linear comments / attachments. |
| 29, 65, 99, 106, 113, 114, 122 | "Blocked Reason" | **BLOCK** | TASK QUEUE property. |
| 30, 61, 83 | "Iterations Used vs Max Iterations" / "Max Iterations" / "Bumped to {new_max}" | **BLOCK** | No equivalent in Linear/Cyrus. Recovery semantics need redesign. |
| 31 | "Retry Count and Max Retries" | **BLOCK** | TASK QUEUE property. |
| 32 | "Shared Files (cross-task dependency signal)" | **BLOCK** | TASK QUEUE property. |
| 38–40 | Notion Architecture/Overview lookup, `notion-get-comments` | mixed | Lookup pattern (Obsidian → fallback) **KEEP**; specific tool name **BLOCK**. |
| 86, 100, 107, 113, 117, 123 | "Set Status = Ready" | **BLOCK** | `Ready` is a TASK QUEUE status; Linear equivalent (e.g. `Todo`/`Backlog`) must be confirmed. |
| 87, 102, 109, 125, 129 | `[Nightly Triage] Root cause: …` comment templates | KEEP | Comment-template idea remains; only the post target changes. |
| 138 | `mcp__df83bf65-c74e-444c-bcc0-0aa31f18d29a__slack_send_message` (Slack tool ID) | KEEP | Slack notifier is independent of Linear/Cyrus. |
| 152 | "Blocked - Failed view" | **BLOCK** | Same as line 17. |

### 2.3 `starting-a-new-project/SKILL.md` — heavy legacy, BLOCK-class.

| Line | Hit | Class | Note |
|---|---|---|---|
| 3 | description: "…to first queued task" | KEEP (already migrated; description does not say Paperclip) |
| 10 | "having a scaffold issue ready in Paperclip" | **BLOCK** | Replace with Linear. |
| 12 | "Execution (Paperclip and Notion setup) happens directly via tools in chat" | **BLOCK** | Replace with Linear (and decide whether Notion PROJECT DOCS persists post-migration). |
| 23 | Companies list "DickBot, AnytimeInterview, Bespoke, GymToGreen, ScreenTimeMath" | WARN | These are Paperclip *company* groupings. May survive as Linear *teams* or labels — needs explicit mapping in the rewrite. |
| 35 | "search Obsidian and Notion PROJECT DOCS for existing uses" | WARN | Obsidian remains, Notion PROJECT DOCS may or may not. |
| 40, 42 | "**2a. Create Project in Paperclip**" / `create_project` | **BLOCK** | Replace with Linear `save_project`. |
| 47–58 | "PROJECT DOCS" via Notion data source `3083257a-fd0a-8088-bbcc-000bdd488971` | **BLOCK** | Notion DB UUID. |
| 49 | `notion-update-data-source` with the famous "restate ALL existing options" warning | **BLOCK** | Notion-specific; gone if PROJECT DOCS migrates to Linear documents. |
| 56–67 | Standard project docs (Overview / Architecture & Decisions / Roadmap / Chat Log) created in Notion | mixed | The four-doc convention is **KEEP**-able (still useful in Linear documents or Obsidian); the *Notion creation mechanism* is **BLOCK**. |
| 71–93 | "Create a scaffold issue in Paperclip via `create_issue`" with `companyId`, `projectId`, `status: todo`, `labelIds: [scaffold]`, description block including **Task Type**, **Branch Strategy**, **Repo Path**, **Max Iterations**, **Human Hours Est**, **Acceptance Criteria** | mixed | Same pattern as scoping-and-queuing-tasks: tool call is **BLOCK**, AC + Branch Strategy + Repo Path **KEEP**, Task Type / Max Iterations / Human Hours Est **BLOCK**. |
| 95–134 | Python / Next.js / Swift scaffold AC blocks | KEEP | Stack-specific scaffolds remain valid. |
| 142 | "- Paperclip: Project created in {CompanyName}" | **BLOCK** |  |
| 143 | "- Notion: PROJECT DOCS created (Overview, Architecture, Roadmap, Chat Log)" | **BLOCK** unless PROJECT DOCS persists |
| 144 | "Scaffold issue: {issue ID}, status: todo" | **BLOCK** | `todo` status name. |
| 146 | "the scaffold issue moves to in_progress when you or an agent picks it up. No auto-pipeline" | **BLOCK** | Cyrus *is* the auto-pipeline; this paragraph reverses post-migration. |

### 2.4 `test-queue-generator/SKILL.md` — heavy legacy, BLOCK-class. Notion-only workflow.

| Line | Hit | Class | Note |
|---|---|---|---|
| 6, 10 | "Cowork Job 1 ... Nightly Test Queue Generator" / "Orchestrator project" | **BLOCK** | Skill is Orchestrator-specific. |
| 14 | `collection://5da08552-f08b-4734-9784-3019be7dd1a2` TASK QUEUE | **BLOCK** | Notion DB UUID. |
| 15 | `view://31b3257a-fd0a-8007-b05d-000cdfe3c733` Awaiting Test view | **BLOCK** | Notion view URL. Awaiting Test status only exists on TASK QUEUE. |
| 16 | `collection://31e3257a-fd0a-8007-9c35-000b8ab79a25` TEST QUEUE database | **BLOCK** | Note this DB ID is *not* in the original BLOCK list but is a TEST QUEUE-only Notion DB. **Add to the migration target list.** |
| 17 | Slack channel `#md_task_scoping` (`C0AJZ7RKU20`) | KEEP | Slack delivery survives migration. |
| 18 | "ORCH ... Nightly Test Queue Workflow ... Scope (in PROJECT DOCS)" | **BLOCK** | Notion-only doc reference. |
| 22 | "Step 1 ... Query **Awaiting Test** tasks" | **BLOCK** | Awaiting Test is a TASK QUEUE-only status. |
| 24 | `notion-query-database-view` | **BLOCK** | Notion-only tool. |
| 24, 65 | `Task ID (TQ-xxx)` / `{TQ-ID} ... {Task Name}` | **BLOCK** | TQ- prefix is Notion-only. Linear will use team-prefixed IDs (e.g. `ANY-123`). |
| 28, 30 | `notion-get-comments`, "## Test Brief" comment convention | **BLOCK** | Replace with Linear comments (`mcp__claude_ai_Linear__list_comments`). The `## Test Brief` *body* convention can be **KEEP**. |
| 30 | "Acceptance Criteria from the task's properties" | **BLOCK** | "Properties" implies Notion. AC body convention is **KEEP**. |
| 34 | TEST QUEUE search via `notion-search` | **BLOCK** |  |
| 36 | `notion-fetch` | **BLOCK** |  |
| 37 | "Extract all task IDs (TQ-xxx)" | **BLOCK** | Same as line 24 — issue ID prefix changes. |
| 50 | "Create a new page in the TEST QUEUE database" | **BLOCK** | Migrate to either a Linear document, a daily-rolled Linear issue, or stay in Notion (decision out of scope for this audit). |
| 52–60 | TEST QUEUE properties (`Name`, `Date`, `Status`, `Tasks for testing`, `Carried Forward`, `Checked Count`, `Total Actions`) | **BLOCK** | Notion property model. |
| 65 | `heading_2: {TQ-ID} ... {Task Name}` | **BLOCK** | Same TQ- prefix issue. |
| 96 | "no longer in the Awaiting Test view" | **BLOCK** | Awaiting Test view + view-driven query. |

### 2.5 `hourly-supervisor-review/SKILL.md` — heavy legacy, BLOCK-class.

| Line | Hit | Class | Note |
|---|---|---|---|
| 10 | "reviews all tasks in the `in_review` status" | **BLOCK** | `in_review` is the Paperclip lifecycle name. Linear equivalent is `In Review` (string differs). |
| 12 | "Role: Supervisor. Do not plan or execute code ... only validate, update Paperclip, and notify." | **BLOCK** | Replace "update Paperclip" with "update Linear". |
| 16 | "Paperclip task tools: `list_issues` (filter by `status`, `projectId`, `assigneeAgentId`), `update_issue`, `put_issue_document`, `comment_on_issue`" | **BLOCK** | Linear tool swap. `put_issue_document` has no direct equivalent. `assigneeAgentId` filter does not map cleanly. |
| 18 | "Notion PROJECT DOCS: fallback when Obsidian doesn't have the content" | WARN |  |
| 19 | `collection://fd45405d-5bb1-4ad0-aaff-9ac15801649e` Supervisor Review Log DB | **BLOCK** | This Notion DB UUID is not on the original BLOCK list but is referenced here. **Add to migration target list.** Decide whether to keep in Notion or move to Linear. |
| 20 | Slack DM target `U0CHWC4M9` | KEEP |  |
| 32 | "Query Paperclip via `list_issues` with `status: 'in_review'` for each relevant company (DickBot, AnytimeInterview, Bespoke, GymToGreen, ScreenTimeMath)" | **BLOCK** | Tool, status name, company list. |
| 41–46 | Read full issue, fetch attached documents (`execution-log`, `spec`, `prompt`), check for `supervisor-review` doc, check `manual-review-only` label, Architecture/Overview lookup | mixed | Doc-key model **BLOCK**; label model **KEEP** (Linear has labels); lookup pattern **KEEP**. |
| 53 | "Read the `execution-log` document (primary evidence of what was done)" | **BLOCK** | Cyrus emits run logs differently — typically into the issue as a comment or linked artifact. |
| 54 | "Read the `spec` document for acceptance criteria" | **BLOCK** | Doc-key model. |
| 61–63 | `cd {Repo Path} && git log` / `git status` / `git log main..HEAD` | KEEP | Git-evidence collection unchanged. |
| 70 | "If osascript fails or **Repo Path** doesn't exist…" | KEEP | Repo Path field name; rename target may change but concept survives. |
| 107 | "set `status` → `done`" | **BLOCK** | Linear status name TBD (`Done` likely matches but verify). |
| 108–111 | `put_issue_document` with `key: "supervisor-review"` | **BLOCK** | Replace with Linear sub-doc or comment. |
| 112–116 | feature-branch merge sequence via osascript | KEEP | Git mechanics survive. |
| 118 | "rely on the per-project deploy hook configured in that project's Architecture doc (Obsidian first, Notion fallback)" | KEEP / WARN | Pattern survives; "Notion fallback" decision pending. |
| 122 | "Leave `status` as `in_review`" | **BLOCK** | Status string. |
| 139 | Supervisor Review Log create-page in Notion | **BLOCK** | Same as line 19. |
| 161 | "No tasks in in_review status" | **BLOCK** | Status string. |
| 202 | "If Paperclip query fails → log error, send Slack error notification, exit" | **BLOCK** | Tool surface. |

### 2.6 `reviewing-completed-work/SKILL.md` — moderate legacy, BLOCK-class on tool surface.

| Line | Hit | Class | Note |
|---|---|---|---|
| 12 | "after the Planner generates a test specification (Step 3.5 of scoping)" | KEEP | Conceptual flow survives. |
| 19 | "Paperclip task tools: `list_issues`, `update_issue`, `put_issue_document`, `comment_on_issue`" | **BLOCK** | Linear tool swap. |
| 21 | "PROJECT DOCS database (Notion fallback): `3083257a-fd0a-8088-bbcc-000bdd488971`" | **BLOCK** | One of the four BLOCK-list Notion UUIDs. |
| 22 | "Architecture & Decisions page: `3163257a-fd0a-8171-894a-eb2b6a0d297d`" | **BLOCK** | Notion page UUID on the BLOCK list. |
| 32 | "Query the issue in Paperclip via `list_issues`…" | **BLOCK** |  |
| 35 | "If **Skip Tests** = YES or **Task Type** ≠ Code, this mode does not apply" | **BLOCK** | TASK QUEUE properties. |
| 104 | "Query the issue in Paperclip via `list_issues`…" | **BLOCK** |  |
| 106 | "Acceptance Criteria from `spec` document (the definition of done)" | mixed | AC concept **KEEP**; `spec` doc-key **BLOCK**. |
| 107 | "Branch Strategy (from description)" | KEEP |  |
| 135 | "Execution output (visible in Paperclip issue comments/run transcript)" | **BLOCK** | Replace with Linear comments / Cyrus run transcript. |
| 140 | "B3.5. Validate Test Contract (Code tasks only)" | KEEP | Test-contract idea is platform-neutral. |
| 203 | "B6. Update Paperclip" | **BLOCK** | Header rename. |
| 208 | "set `status` → `done`" | **BLOCK** | Status string. |
| 209 | "Attach verdict summary via `put_issue_document` with `key: \"supervisor-review\"`" | **BLOCK** | Doc-key model. |
| 217 | "set `status` → `todo`" | **BLOCK** |  |
| 221 | "set `status` → `backlog`" | **BLOCK** |  |
| 230 | "Deploy hook (if needed): Check the project's Architecture doc (Obsidian first, Notion fallback)" | KEEP / WARN |  |

### 2.7 `writing-execution-prompts/SKILL.md` — moderate legacy, BLOCK-class on policy gates.

| Line | Hit | Class | Note |
|---|---|---|---|
| 12 | "All status transitions referenced in prompts must comply with **ADR-003 valid_transitions** map." | **BLOCK** | ADR-003 is Notion-pipeline. Replace with Linear workflow rules. |
| 32 | "Skip only for: Scaffold tasks, Management tasks, or tasks with **Skip Tests** = YES." | **BLOCK** | Skip Tests is TASK QUEUE-only. Replace with a Linear label (e.g. `skip-tests`). |
| 127–132 | Scaffold Tasks block: `Branch Strategy: direct-main`, "Skip Test Contract section", "On success: status goes to **Done** (not **Awaiting Test**)" | mixed | Branch Strategy / direct-main **KEEP**; "Awaiting Test" **BLOCK** (TASK QUEUE-only status). Linear default would be `In Review` or a custom column. |
| 134–136 | "Management Tasks (Notion-only, no code changes) — Do NOT send through the pipeline ... they fail on the git commit step. Handle directly in chat via Notion MCP tools" | **BLOCK** | "Management" task type and the "Notion MCP" handoff both need rephrasing. The git-commit-failure rationale should be reframed for the Cyrus invocation contract. |
| 165 | Validation checklist item: "Test Contract section is present (for Code tasks without Skip Tests)" | **BLOCK** | Same Skip Tests issue. |
| 179 | "Never use `claude-opus-4-5-20250529` ... the current model is `claude-opus-4-6`" | WARN | Model-pin policy is independent of the work-surface migration but is *itself* outdated as of 2026-05-06 (current is Opus 4.7). Flag for separate update; not part of Linear/Cyrus rewrite. |
| 182 | "Never skip the Test Contract for Code tasks" | KEEP | Concept-level. |

### 2.8 `researching-options-and-decisions/SKILL.md` — moderate legacy, BLOCK-class on doc IDs.

| Line | Hit | Class | Note |
|---|---|---|---|
| 30 | "Fetch the project's Architecture & Decisions doc from PROJECT DOCS (`3083257a-fd0a-8088-bbcc-000bdd488971`)" | **BLOCK** | Notion DB UUID on the BLOCK list. |
| 41 | Example decision: "store generated test specs inline in the **Paperclip issue description** or as a separate document via `put_issue_document`" | **BLOCK** | Example must be rewritten to reference Linear. |
| 92–100 | "Add an ADR entry to the project's Architecture & Decisions doc in Notion" template | mixed | ADR template **KEEP**; Notion delivery target **WARN**. |
| 104 | "Create issue(s) in Paperclip following the scoping-and-queuing-tasks skill" | **BLOCK** | Replace with Linear. |
| 110 | "Tasks created: {**TQ-IDs** if any}" | **BLOCK** | TQ- prefix → team-prefixed Linear IDs. |
| 129 | "Forgetting to document the decision in Notion after it's made" | WARN | Notion delivery may persist or migrate; rewording. |

### 2.9 `evaluating-new-ideas/SKILL.md` — light legacy, mostly clean.

| Line | Hit | Class | Note |
|---|---|---|---|
| 33 | "PROJECT DOCS database: `3083257a-fd0a-8088-bbcc-000bdd488971`" | **BLOCK** | Notion DB UUID on the BLOCK list. Used here only for cross-referencing existing project names. |
| 32 | "IDEA LOG database: `collection://dfeab587-d3fd-4d14-871b-063a92cf17ff`" | WARN | Not on the BLOCK list — this is the IDEA LOG, distinct from TASK QUEUE / PROJECT DOCS. May persist in Notion regardless of work-surface migration. **Decision needed: keep IDEA LOG in Notion or migrate.** |
| 164 | "Create via `notion-create-pages`…" | WARN | Tool stays valid if IDEA LOG stays in Notion. |
| 230–239 | Chat Log update template | KEEP |  |
| 243 | "hand off to `starting-a-new-project`" | KEEP | Skill chain reference. |

### 2.10 `codex-rescue/SKILL.md` — effectively clean.

| Line | Hit | Class | Note |
|---|---|---|---|
| 10 | "burning iterations on a problem it can't solve" | KEEP | "Iterations" used in the generic Claude Code sense. No TASK QUEUE coupling. |
| 30 | "Max iterations burned. Claude Code has exhausted its iteration budget…" | KEEP | Same. |
| 91 | "Claude Code hit max iterations…" | KEEP | Same. |

No work needed here for the Linear/Cyrus migration.

### 2.11 Trace-only matches (non-blocking false positives)

| File | Line | Match | Why ignored |
|---|---|---|---|
| `_public/pdf-reading/SKILL.md` | 219 | "paperclip icons in viewers" | Refers to PDF-attachment UI affordance. Not the Paperclip system. |
| `mermaid-diagrams/SKILL.md` | 187 | "Notion, Obsidian, Confluence - Built-in support" | Lists rendering targets for Mermaid. Not pipeline coupling. |
| `backend-patterns/SKILL.md` | 502 | "// Job execution logic" | Code comment in a generic job-queue example. Not "Execution Log" the property. |

---

## 3. Pattern roll-up across all skills

| Pattern | Files affected | Lines (count) | Class |
|---|---|---|---|
| `paperclip` / `Paperclip` (case-insensitive, semantic only — not the pdf-icon match) | 5 (`scoping-and-queuing-tasks`, `tq-triage` [implicit via tools], `starting-a-new-project`, `hourly-supervisor-review`, `reviewing-completed-work`, `researching-options-and-decisions`, `writing-execution-prompts` [via Notion-MCP reference]) | 22 explicit hits | **BLOCK** |
| `mission control` / `mc mcp` | 0 | 0 | n/a — no skill text references these |
| `TASK QUEUE` (literal) | 2 (`test-queue-generator`, `tq-triage`) | 5 hits | **BLOCK** |
| `TQ-ID` / `TQ-` prefix | 3 (`test-queue-generator`, `researching-options-and-decisions`, indirectly `tq-triage` via "Task ID") | 4 hits | **BLOCK** |
| `Awaiting Test` | 1 (`test-queue-generator`) | 11 hits | **BLOCK** |
| `Awaiting Ack` | 0 | 0 | n/a |
| `Pre-planning` | 0 | 0 | n/a |
| `Manual Queue` | 0 | 0 | n/a |
| `Sort Order` | 0 | 0 | n/a |
| `Repo Path` | 4 (`scoping-and-queuing-tasks`, `hourly-supervisor-review`, `tq-triage`, `starting-a-new-project`) | 11 hits | **KEEP** (concept survives; field-name TBD) |
| `Skip Tests` | 3 (`scoping-and-queuing-tasks`, `writing-execution-prompts`, `reviewing-completed-work`) | 6 hits | **BLOCK** (replace with Linear label) |
| `Branch Strategy` | 5 (`scoping-and-queuing-tasks`, `hourly-supervisor-review`, `reviewing-completed-work`, `writing-execution-prompts`, `starting-a-new-project`) | 8 hits | **KEEP** (still useful in body) |
| `Execution Method` | 0 | 0 | n/a |
| `Iterations Used` | 1 (`tq-triage`) | 2 hits | **BLOCK** |
| `Max Iterations` | 3 (`scoping-and-queuing-tasks`, `tq-triage`, `starting-a-new-project`) | 7 hits | **BLOCK** |
| `Self Modifying` | 0 | 0 | n/a |
| `Acceptance Criteria` | 7 (`scoping-and-queuing-tasks`, `tq-triage`, `reviewing-completed-work`, `hourly-supervisor-review`, `test-queue-generator`, `starting-a-new-project`, `ux-design`) | 9 hits | **KEEP** (reused in Linear; ux-design hit is design-section header, also KEEP) |
| `Blocked Reason` | 1 (`tq-triage`) | 6 hits | **BLOCK** |
| `Execution Log` | 1 (`tq-triage`) (plus the false-positive in `backend-patterns:502`) | 8 semantic hits | **BLOCK** |
| `Human Hours Est` | 1 (`scoping-and-queuing-tasks`) (plus 1 in `starting-a-new-project`) | 5 hits | **BLOCK** (Notion property) |
| Notion DB UUID `5da08552-…` (TASK QUEUE) | 2 (`test-queue-generator`, `tq-triage`) | 2 hits | **BLOCK** |
| Notion DB UUID `3083257a-…` (PROJECT DOCS) | 4 (`starting-a-new-project` ×2, `reviewing-completed-work`, `researching-options-and-decisions`, `evaluating-new-ideas`) | 5 hits | **BLOCK** |
| Notion DB UUID `0ab3257a-…` | 0 | 0 | n/a — does not appear anywhere in the skills |
| Notion page UUID `3163257a-…` (Architecture & Decisions) | 1 (`reviewing-completed-work`) | 1 hit | **BLOCK** |
| `view://3183257a` (Blocked - Failed view) | 1 (`tq-triage`) | 2 hits | **BLOCK** |
| `view://31b3257a` (Awaiting Test view) | 1 (`test-queue-generator`) | 1 hit | **BLOCK** |
| `~/Developer/orchestrator` | 0 | 0 | n/a |
| `tq-sync` | 0 | 0 | n/a |
| `launchd` (any) | 0 | 0 | n/a |
| `valid_transitions` | 2 (`scoping-and-queuing-tasks`, `writing-execution-prompts`) | 2 hits | **BLOCK** |
| `ADR-003` | same as above | 2 hits | **BLOCK** |
| `Pre-planning` / `Manual Queue` / `Awaiting Ack` / `Sort Order` / `Self Modifying` / `Execution Method` | none of the above strings appear | 0 | n/a — no migration work for these |
| `in_review` (status string) | 1 (`hourly-supervisor-review`) (plus 1 mention in `scoping-and-queuing-tasks:170`) | 4 hits | **BLOCK** (confirm Linear status name match) |
| `~/Developer/{repo}` mapping | 4+ | many | **KEEP** (fundamental, survives migration) |

### Notion UUIDs *not* on the original BLOCK list but found in the skills

These three UUIDs power skills today and need a migration decision (keep in Notion vs migrate to Linear):

| UUID | Skill | Role |
|---|---|---|
| `collection://31e3257a-fd0a-8007-9c35-000b8ab79a25` | `test-queue-generator` | TEST QUEUE database (daily checklist pages) |
| `collection://fd45405d-5bb1-4ad0-aaff-9ac15801649e` | `hourly-supervisor-review` | Supervisor Review Log database |
| `collection://dfeab587-d3fd-4d14-871b-063a92cf17ff` | `evaluating-new-ideas` | IDEA LOG database |

Also found: a Notion *page* URL embedded in tq-triage as the workflow source: `https://www.notion.so/31e3257afd0a817f8e5cea831f4c358e` (the same hex that fronts the TEST QUEUE DB UUID — probably the workflow doc that lives in the same data source).

---

## 4. Suggested rewrite priorities

Ranked by amount of BLOCK-class rework required:

1. **`tq-triage`** — entire skill is Orchestrator-specific. Whole-file rewrite required. Decide first whether nightly triage even applies under Cyrus (Cyrus has its own retry semantics). If retained, redesign without TASK QUEUE properties (`Iterations Used`, `Max Retries`, `Blocked Reason`, `Execution Log`, `Shared Files`).
2. **`test-queue-generator`** — entire skill assumes TASK QUEUE Awaiting Test view. Whole-file rewrite. Decide whether daily test-queue page lives in Linear (as a daily issue) or stays in Notion. The `## Test Brief` body convention can survive.
3. **`hourly-supervisor-review`** — whole-file rewrite. Tool surface, status names, doc-key model, Supervisor Review Log destination all need replacement. Conservative-bias rules and Slack notification logic can survive verbatim.
4. **`scoping-and-queuing-tasks`** — heavy targeted rewrite. The Project → Repo Path table at lines 245–259 is the most reusable artefact in the entire repo and should be lifted out as a shared resource. Description metadata block (Task Type / Branch Strategy / Repo Path / Max Iterations / Human Hours Est / Acceptance Criteria) needs reshaping into Linear-native fields + body conventions.
5. **`starting-a-new-project`** — heavy targeted rewrite. Replace Paperclip `create_project` and Notion PROJECT DOCS provisioning with Linear team/project + Linear documents (or whichever target survives). Stack-specific scaffold AC blocks survive untouched.
6. **`writing-execution-prompts`** — moderate. Drop ADR-003 reference, rephrase Skip Tests and Task Type as Linear labels, replace "Awaiting Test" status mention. Most of the prompt-structure rules (sections 1–7, branch naming, concurrency classification, anti-patterns) are platform-neutral and survive. Side-issue: line 179 model pin to `claude-opus-4-6` is itself outdated (current is Opus 4.7); flag for a separate update.
7. **`reviewing-completed-work`** — moderate. Tool surface, doc-key model, status strings, Notion DB UUIDs replaced; verdict semantics (PASS/FIX-MINOR/FIX-MAJOR/REJECT) and validation principles survive untouched.
8. **`researching-options-and-decisions`** — light. Replace one Notion DB UUID, one Paperclip example sentence, one TQ-IDs reference, one "Create issue(s) in Paperclip" handoff. ADR template and analysis structure survive entirely.
9. **`evaluating-new-ideas`** — very light. Only one BLOCK-list UUID hit (`3083257a-…` for cross-checking project-name uniqueness). IDEA LOG itself is at a separate UUID (`dfeab587-…`); no migration urgency unless that DB is moving too. Skill is mostly platform-neutral.
10. **`codex-rescue`** — no migration work.
11. The other twelve skills (`mermaid-diagrams`, `mobile-ios-design`, `frontend-design`, `ux-design`, `icon-sources`, `backend-patterns`, all `_public/*`) — no migration work for the Linear/Cyrus rewrite.

---

## 5. Cross-cutting recommendations for the rewrite

These are observations, not actions taken in this audit:

- **Status name dictionary.** Multiple skills (scoping, supervisor, reviewing, writing-execution-prompts) hard-code Paperclip status names (`todo`, `in_progress`, `in_review`, `done`, `backlog`). Confirm the exact Linear team workflow states up front and replace verbatim. Recommend building a small shared resource (e.g. a `_shared/STATES.md`) so the four skills share one source of truth.
- **Replace the `put_issue_document` doc-key model.** Six skills depend on doc keys (`spec`, `prompt`, `execution-log`, `supervisor-review`, `test-spec`). Linear has no equivalent. Decide once: sub-pages, attachments, or structured comments — and apply uniformly.
- **Project → Repo Path table is the crown jewel.** It is referenced explicitly only in `scoping-and-queuing-tasks` but is implicitly required by `tq-triage`, `hourly-supervisor-review`, `reviewing-completed-work`, and `starting-a-new-project`. Lift it into a shared resource (e.g. `_shared/repo-paths.md`) and have the skills reference it.
- **Confirm fate of TASK QUEUE-only properties** (`Max Iterations`, `Human Hours Est`, `Execution Log`, `Blocked Reason`, `Retry Count`, `Shared Files`, `Skip Tests`, `Task Type`). For each: keep as Linear label / keep as body section / drop entirely. The audit cannot decide this; it depends on the new pipeline design.
- **Notion-vs-Linear for non-task data.** PROJECT DOCS, IDEA LOG, TEST QUEUE, and Supervisor Review Log are *not* TASK QUEUE — they could remain in Notion even if tasks move to Linear. The audit flags this but the migration design has to decide.
- **No skill currently mentions Cyrus or Linear.** Whatever rewrite happens, every load-bearing skill needs explicit instructions on how to invoke / observe Cyrus runs and how to address Linear issues by team-prefixed ID. Right now there is zero forward-compatible scaffolding to build on.

---

*End of audit. Output file is the only file written by this run; no other files were created, modified, moved, or deleted.*
