---
name: strategic-review
description: Advisory strategist. Use when Michael wants a project's strategy reviewed against its Linear backlog with a ranked proposal of what should become Ready next ... triggers include "strategic review", "what's next up", "goals vs backlog", "review the roadmap against the backlog", "strategy review for {project}". Resolves a scope token to a Linear team, project, and its Strategy doc; maps ranked Strategic Priorities to backlog coverage; and proposes scoped next-up items for the operator to approve. Advisory only ... never creates, moves, or promotes tickets; approved items feed scoping-and-queuing-tasks. Do NOT use for executing or promoting work, for reviewing completed work (reviewing-completed-work), or for daily monitoring (the Daily Brief agent).
---

# Strategic Review (Advisory Strategist)

## Context
Advisory front-of-funnel strategist. Reads a project's ranked Strategic Priorities and its Linear backlog, and proposes what should become Ready next for the operator to approve. Phase 1 (advisory) of the strategist path; it never acts on tickets.

Role: Development Planner throughout. Advisory only.

## Hard Boundary (read first)
- This skill MUST NOT create, move, promote, delegate, or edit any Linear ticket. Zero Linear write calls in a run.
- Output is a proposal for Michael. Approved items are handed to `scoping-and-queuing-tasks`, which owns AC, prompt, and Ready promotion.
- If the Strategy doc is missing or has no ranked priorities, emit a GAP and stop. Never invent priorities.

## Step 1 ... Resolve Scope
Accept a scope token (e.g. "bespoke", "anytime", "propell", "infra").
1. Read `wiki/projects/_registry.md` (Obsidian) for the token to Linear-team + project mapping.
2. Resolve the Strategy doc: `raw/notion/{project}-strategy.md` (Obsidian); Notion PROJECT DOCS "{ProjectCode} ... Strategy" as fallback.
3. Known mapping (fallback if the registry is unclear):

| Token | Linear team | Strategy doc |
|---|---|---|
| bespoke | Bespoke (BES) | raw/notion/bespoke-strategy.md |
| propell | Propell (PRO) | raw/notion/propell-strategy.md |
| anytime | Anytime Interview (ANY) | raw/notion/anytime-strategy.md (GAP if absent) |
| infra | SC Internal (SOC) | (GAP if absent) |

If no token is given, ask which project ... one question, do not guess.

## Step 2 ... Read the Anchor
Locate blocks by HEADING NAME, not section number ... strategy docs vary in numbering (the template puts Strategic Priorities at Section 2, but real docs may differ, e.g. the Bespoke doc uses "4. Strategic Priorities").
1. Find the ranked-priorities block: the heading whose text contains "Strategic Priorities" (case-insensitive), ignoring any leading number. Read the ranked priorities under it ... the anchor.
2. Find the watch-signals block: the heading containing "What the Agent Should Watch", falling back to "Open Strategic Questions" if that is what the doc uses. Read it if present.
3. If no "Strategic Priorities" heading exists, or it contains no ranked priorities: emit `GAP: {project} has no ranked Strategic Priorities. Populate the Strategy doc's Strategic Priorities section before a strategic review.` and stop. Do not fall back to section-number matching.

## Step 3 ... Pull the Backlog
1. Via Linear MCP, list the team's issues across Backlog, Ready, Todo, In Progress, In Review (read-only).
2. Record current Ready-pool size and In Progress / In Review counts for the headroom check.

## Step 4 ... Ground-Truth Any "Done"
For any backlog item the review leans on that claims Done or merged: verify against GitHub that the linked PR has `merged_at` populated (the `merged` boolean is unreliable). Never trust Linear state alone. Note the check in the output.

## Step 5 ... Build the Coherence Map
Map each ranked priority to its backlog coverage:
- Priority to the issues that serve it (by explicit link, project, or clear topical match).
- Flag each priority with zero backlog coverage (a strategic gap).
- Flag each backlog item that serves no priority (drift ... candidate to cut or re-justify).

## Step 6 ... Build the Ranked Next-Up Proposal
From the top-ranked priorities with headroom, propose N items to become Ready. For each:
- Priority served (by rank).
- Scope stub: problem (one sentence), rough AC direction, target repo/surface, rough file territory.
- Supersession pre-check: is any in-flight or queued item about to remove or replace this surface? If so, flag and hold (see scoping-and-queuing-tasks Step 1).
Order by priority rank first, then unblock-value, then effort.

## Step 7 ... Headroom Check
Compare the proposal against Ready-pool size and the WIP caps in `wiki/decisions/linear-pipeline-states-and-wip-caps.md`. Never propose past capacity ... trim N to fit and say what was deferred.

## Step 8 ... Output
Three sections, Notion-pasteable, ellipses not dashes:
1. Coherence map (optional light-theme Mermaid, in-chat only ... do not push to Notion).
2. Ranked next-up proposal (the N items).
3. Headroom summary plus any GAP or drift flags.
End by asking Michael to approve, edit, or drop each proposed item.

## Step 9 ... Log the Run
Append to `wiki/strategist/runs/{YYYY-MM-DD}.md` (Obsidian, create if absent):
- Timestamp, scope token, anchor version (Strategy doc last_edited).
- Each proposed item plus priority served.
- An `approved / overridden / deferred` field per item, filled after Michael responds.
This log is the agreement-rate record ... the named gate metric for any future autonomous-promotion decision (Phase 3).

## Handback Audit (mandatory)
End every run with a HANDBACK AUDIT block per the house standard. Advisory runs normally carry 0 handbacks (the operator's approve/edit/drop is a decision pending, not a handback).

## See Also
- `scoping-and-queuing-tasks` ... consumes approved items (owns AC, prompt, promotion)
- `reviewing-completed-work` ... the ground-truth verification standard reused in Step 4
- `researching-options-and-decisions` ... when a proposed item needs an evaluation before scoping
- `raw/notion/strategy-doc-template.md` ... the anchor's schema (Strategic Priorities + watch-signals sections; numbering varies by doc, so match by heading, not number)
