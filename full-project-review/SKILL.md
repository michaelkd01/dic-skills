---
name: full-project-review
description: Use when Michael wants a multi-source catch-up on one venture since a given date ... triggers include "full project review", "review propell", "review bespoke", "what's happened on {venture}", "catch me up on {venture} since {date}", "what have I missed on {venture}". Resolves a scope token to a venture in the project identity registry, parses a from-date window, then pulls comms (Gmail, Slack), doc changes (Notion), outstanding tasks (Todoist), the Project's own chat threads, and (for dev ventures) Linear + GitHub ... everything since that date. Read-only: it never sends comms and never mutates any source. Returns an inline digest split into NEEDS ACTION vs AWARENESS and pushes a dated snapshot to the venture's Notion Overview page.
---

# Full Project Review (since-date, multi-source)

You are giving Michael a verified catch-up on ONE venture across every source it touches, bounded to a since-date window. Each run is a fresh, stateless session ... there is no anchor to read or write. State lives in the sources themselves; you read them and report.

This is the inbox-facing sibling of `resuming-active-work` (dev-status reconstruction of one Claude Project) and `todoist-review` (task triage). Where `resuming-active-work` verifies Linear against GitHub ground truth, this skill sweeps the wider surface ... email, chat, docs, tasks ... and routes anything actionable to the right existing skill rather than re-implementing it.

Role: Development Planner. This skill reads, orients, and proposes. It never sends a message, never creates a ticket or task, and never edits a source, except the single additive Notion snapshot at the end (Phase 5b). Everything actionable is surfaced for confirmation and handed to `scoping-and-queuing-tasks` or the `todoist-review` promote mechanic.

Compute the current datetime in AEST (Australia/Brisbane) at the start of every run. Reference it as `{NOW}`.

## Phase 1 ... From-date + scope resolution

### From-date `{SINCE}`
Parse the window the user stated and resolve it to an absolute AEST datetime `{SINCE}`. This is stateless ... derive `{SINCE}` purely from `{NOW}` and the stated window; do NOT read or write any session anchor.

| Stated | `{SINCE}` |
|---|---|
| "last N days", "past N days" | `{NOW}` minus N days |
| "last week", "past week" | `{NOW}` minus 7 days |
| "last two weeks", "last fortnight" | `{NOW}` minus 14 days |
| "last month", "past month" | `{NOW}` minus 1 calendar month |
| an ISO date ("since 2026-07-01") | that date at 00:00 AEST |
| unstated | default: `{NOW}` minus 7 days |

Express `{SINCE}` as `YYYY-MM-DD` (and keep the time component for tools that accept it). For Gmail's `after:` operator, also compute `{SINCE_EPOCH}` or the `YYYY/MM/DD` form it expects.

### Scope
Identity lives in the project identity registry at `wiki/projects/_registry.md` in Obsidian ... the same source `resuming-active-work` uses. Resolve in this order:

1. **Read the registry** ... `read_note` on `wiki/projects/_registry.md`. Fields per venture: `key`, `aliases`, `linear-team`, `linear-projects`, `repos`, `obsidian`, `notion`, and (once populated per SOC-158) `gmail`, `slack`. An optional `people:` field (comma-separated key stakeholder names) sharpens the Phase 3 discovery and meetings relevance filters; absence degrades gracefully to key + aliases only.
2. **Pick the entry** ... if the current Claude Project's custom instructions contain a line `REGISTRY KEY: {key}`, use that entry directly. Otherwise form a hypothesis from Project-scoped memory and recent chats (`conversation_search` / `recent_chats`, which see only this Project) and match it to an entry by `key` or `aliases`.
3. **Confirm only if ambiguous** ... if no entry matches with confidence, ask which `key` applies rather than guessing.

Token aliases (mirror the registry): `propell`/`pro` -> propell; `anytime`/`any` -> anytimeinterview; `bespoke`/`bes` -> bespoke.

If the token resolves to no entry, STOP and report the unrecognised token. Do not silently fall back.

State the resolved scope and window back in one line before proceeding, e.g.:
`Reviewing: propell (PRO team, repos propell-sf + portal) ... since 2026-06-29 (last two weeks).`

## Phase 2 ... Source matrix

Which sources apply is hard-coded per venture below (on/off). The ADDRESSES for each on-source (Gmail account, Slack workspace, Notion page id, Todoist project, Linear team, repos) come from the registry entry ... the matrix says *whether* to pull, the registry says *from where*.

| Project | Gmail | Slack | Notion | Meetings | Todoist | Threads | Linear | GitHub |
|---|---|---|---|---|---|---|---|---|
| propell | on | on | on | on | on | on | off | off |
| anytimeinterview | on | on | on | on | on | on | on | on |
| bespoke | on | on | on | on | on | on | on | on |

Rationale (do not re-derive per run): all three ventures have an active Slack workspace (Propell Slack; Social Club Slack for AnytimeInterview; Bespoke Slack), so Slack is on for each. AnytimeInterview and Bespoke are the dev ventures (wired Linear team + repos), so Linear + GitHub are on. Propell has no wired Linear team or repos, so Linear + GitHub are off ... it is treated as non-dev here. Notion, Todoist and Threads are on for every venture. A source that is off is skipped silently by design; a source that is on but has no registry address is skipped and reported unresolved (Phase 6). Meetings is on for every venture: the Notion AI meeting-notes data source is workspace-global and cross-venture, so relevance filtering happens at pull time (see Phase 3), not in this matrix.

## Phase 3 ... Per-source pulls (read-only, each filtered to `> {SINCE}`)

Pull each `on` source in full for the resolved scope. Gather first; do not synthesise yet. Every call below is read-only.

- **Gmail** ... `google_ro__search_gmail_messages` on the registry `gmail:` account, query `after:{SINCE}` (Gmail `YYYY/MM/DD` form) plus any venture domain/label filters. Fetch bodies (`get_gmail_messages_content_batch`, FULL_CONTENT) ONLY for action-worthy hits ... threads that look like a request, decision, or deadline. Do not body-fetch newsletters or receipts.
- **Slack** ... search the registry `slack:` workspace since `{SINCE}` (`slack_search_public_and_private`). Workspace-wide unless the registry lists specific channels, in which case scope to those. Pull thread context (`slack_read_thread`) only for messages that look actionable.
- **Notion** ... `notion-fetch` the venture's PROJECT DOCS Overview page (registry `notion:` id) plus any named strategy/board pages in the registry entry. Keep only content with `last_edited_time > {SINCE}`. Note what changed, who changed it, and any decisions recorded. Then run the DISCOVERY SWEEP: one or two `notion-search` semantic queries built from the registry entry ... the venture `key`, its `aliases`, the venture's full trading name, and the `people:` names if present (e.g. for bespoke: "Bespoke Property Concierge BPC HSP concierge" plus a people-oriented query). Run WITHOUT a date filter so relevance, not recency, drives recall. Classify each hit: (1) registry-named page already pulled -> skip; (2) venture-relevant AND edited > {SINCE} -> add to the Notion changed-docs findings; (3) venture-relevant but outside the window (agreements, equity/legal docs, old meeting notes, strategy copies) -> list once under a DISCOVERED heading in BY SOURCE as context, not activity; (4) cross-venture noise (security reviews, supervisor digests, other ventures' pages that merely mention the key) -> drop. Flag duplicate/stale copies of canonical docs (multiple pages with near-identical titles) as a documentation-hygiene candidate routed to the documentation-review skill.
- **Meetings** ... `notion-query-meeting-notes` filtered to `created_time` within `{SINCE}`->`{NOW}` (exact daterange). The data source is cross-venture with no project property, so relevance-filter the returned rows to the venture: match title and (on fetch) content against the registry `key`, `aliases`, and `people:` names. For each relevant note, `notion-fetch` the page WITHOUT `include_transcript` first ... the summary and Action Items blocks are usually sufficient; fetch the transcript only when an action item is ambiguous. Extract: attendees, decisions, action items, and any commitments with owners. CAVEAT: the query tool may omit the attendees property in its response ... when it does, identify participants from transcript context and mark them as inferred, never as confirmed metadata. Older venture meetings surfaced by the discovery sweep (outside the meetings date window) are reported under DISCOVERED, not re-pulled.
- **Todoist** ... list active outstanding tasks in the venture's Todoist project (`find-tasks`; venture key -> project per `todoist-review`'s scope map). Surface count, overdue, and P1/P2 titles only. Defer full triage detail to `todoist-review` ... do NOT re-implement its classification, promotion, or nudge mechanics here.
- **Threads** ... `recent_chats` across the `{SINCE}`->`{NOW}` window plus targeted `conversation_search` for the venture's active topics. NOTE: this sees ONLY the current Claude Project's chats ... conversations in other Projects are invisible to this pull, so treat thread findings as partial and never as the complete record.
- **Linear + GitHub** (dev ventures only) ... reuse the `resuming-active-work` Phase 2 pull block verbatim:
  - **Linear**: `list_issues` filtered by team/project and state; enumerate epic children with `parentId`; `get_issue` with `includeRelations: true` to capture linked PRs, labels, and blocking relations. Capture state, assignee, last update, linked PR refs. Filter to issues updated `> {SINCE}`.
  - **GitHub**: `search_pull_requests` for open and recently merged PRs on each repo in scope; `pull_request_read` (`get_files`, `get_diff`) for PRs of interest; `get_check_runs` for CI status; `list_commits` / `list_branches` for stale branches. Filter to activity `> {SINCE}`.

## Phase 4 ... Synthesis

Group every finding into two buckets, tagged by source:

- **NEEDS ACTION** ... anything that implies Michael must do something: an unanswered email asking a question, a Slack request, a decision awaiting him, an overdue or blocking task, a merged PR still needing a Linear close-out, a CI failure. Each item carries its source, a one-line description, and a proposed route (below).
- **AWARENESS** ... things that happened but need no action from him: FYI emails, informational Slack, doc edits by others, PRs merged and clean, tasks already progressing.

Additionally sweep the pulled comms, threads, and meeting notes for **uncaptured action items** ... work discussed or requested but never turned into a Todoist task or Linear ticket. Be conservative; prefer surfacing a candidate for confirmation over inventing one. Meeting-note commitments are first-class uncaptured-item candidates: a deliverable promised in a meeting with no matching Linear ticket, no Todoist task, or a matching ticket untouched since before the meeting is surfaced for confirmation.

Routing (proposal only ... never auto-execute):
- Uncaptured item that needs real scoping -> hand to `scoping-and-queuing-tasks` on confirmation.
- Uncaptured item that is a simple task -> propose it via the `todoist-review` promote mechanic (a `## PROPOSED ...` draft), on confirmation.
- Anything needing code -> hand to `writing-execution-prompts` on confirmation.

Never auto-create a ticket or task, and never send a reply, draft, or message. The user confirms first, every time.

## Phase 5 ... Output

### (a) Inline digest
Render inline in the session using the template below. Any diagram uses a light theme.

### (b) Notion snapshot
Mirror `resuming-active-work` Phase 7: push a dated snapshot to the venture's PROJECT DOCS Overview page (registry `notion:` id) as an additive block ... a heading `Full review snapshot ... {NOW date}` followed by the digest's NEEDS ACTION / AWARENESS summary and a one-line note stating the window reviewed (`since {SINCE}`). Additive only ... append, do not overwrite existing content. This is the sole write this skill performs.

## Output Template

```
FULL PROJECT REVIEW: {scope} ... since {SINCE} ({window phrase})

NEEDS ACTION
- [{source}] {one-line} ... {proposed route: scope | todoist-promote | exec-prompt | reply-draft}

AWARENESS
- [{source}] {one-line}

UNCAPTURED (confirm to capture)
- {one-liner} ... from {source/thread} ... route {scoping-and-queuing-tasks | todoist-promote}

BY SOURCE
- Gmail: {n} threads since {SINCE} ({a} action-worthy) | or "unresolved: no gmail: in registry" | or "off"
- Slack: {n} messages | "off" | "unresolved"
- Notion: {n} pages edited since {SINCE} · discovery: {d} related pages ({k} outside registry)
- Meetings: {n} notes in window, {r} venture-relevant | "unavailable: {error}"
- DISCOVERED (context, no action implied): {out-of-window venture pages worth knowing about, one line each; omit heading when empty}
- Todoist: {n} open ({o} overdue, {p1} P1) ... full triage: run todoist-review
- Threads: {n} chats in window (this Project only)
- Linear: {n} issues touched | "off (non-dev)"
- GitHub: {n} PRs ({m} merged, {o} open) | "off (non-dev)"

SNAPSHOT
- Pushed to Notion {notion page title} ... "Full review snapshot {NOW date}, since {SINCE}"

HANDBACK AUDIT · {N} handbacks · {M} decisions pending
1. {action routed to Michael}
   Category · {interactive-only auth | credential confirmed absent | irreversible high-stakes | judgment call}
   Blocked because · {why no autonomous path exists ... e.g. sending a reply is outward-facing and needs his sign-off}
   Return to me · {what to paste/confirm; omit if none}
(N = 0): nothing owed by you.

DECISIONS PENDING (not handbacks)
- {item} ... {what I do once you call it, e.g. "confirm and I create the Todoist task / route to scoping-and-queuing-tasks"}
```

## Phase 6 ... Graceful degradation

- If a venture entry lacks a `gmail:` or `slack:` field (registry not yet populated per SOC-158), SKIP that source and report it as `unresolved: no {field} in registry` in the BY SOURCE block. Do not error, and do not fabricate an address.
- If a source's MCP is unreachable, report that source as `unavailable: {error}` and continue with the rest ... one dead source never stops the run.
- If `notion-query-meeting-notes` is unavailable (tool absent from the loaded Notion manifest) or returns no rows, report `Meetings: unavailable` or `Meetings: 0 in window` in BY SOURCE and continue. Never substitute a generic `notion-search` for the meeting-notes query ... it returns non-meeting pages and inflates the count. If the discovery sweep returns only noise, report `discovery: 0 relevant` rather than padding DISCOVERED.
- If Notion has no Overview page for the venture, render the inline digest and report the snapshot as `not pushed: no notion: page in registry`. Do not create a page unprompted.
- If the token is unrecognised (Phase 1), STOP before any pull and report the token.

## Capability Exhaustion Gate (runtime handbacks)

Before routing anything in the HANDBACK AUDIT to Michael, exhaust the autonomous paths: a read the tools can do (any MCP pull) is never a handback; a task/ticket you could draft is surfaced as a DECISION PENDING, not a handback. Only genuinely outward-facing or judgment actions land in the audit ... sending a reply (outward-facing, needs sign-off), an irreversible mutation, or a real judgment call. Every audit item maps to one of the four allowed categories with a one-line reason, or it is converted to an autonomous step / decision-pending before delivery. An uncategorisable item is a defect.

## Related Skills
- `resuming-active-work` ... dev-status reconstruction of one Claude Project (this skill reuses its registry resolution and its Linear/GitHub pull block)
- `todoist-review` ... full task triage and the `promote to linear` mechanic (this skill defers task detail to it)
- `scoping-and-queuing-tasks` ... for any uncaptured item that needs real scoping
- `writing-execution-prompts` ... for any surfaced item that needs code
