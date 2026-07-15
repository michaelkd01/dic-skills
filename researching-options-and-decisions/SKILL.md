---
name: researching-options-and-decisions
description: Standardized approach for evaluating options, presenting tradeoffs, and documenting architecture decisions
---

# Research & Decision Framework

## Context

This skill is triggered when the user brings a new idea, architecture question, technology choice, or design decision that requires evaluation before implementation. The output is a structured analysis that leads to a documented decision ... not a code change.

Role: Development Planner throughout.

## When to Use

- "Should we use X or Y?"
- "I'm thinking about adding Z to the system"
- "What's the best approach for ...?"
- "How should we handle ...?"
- Evaluating a new tool, service, library, or pattern
- Any question where the answer becomes an ADR or shapes the roadmap
- **Any request framed as building or self-hosting something a managed or OSS category exists for** ... this fires the Build-vs-Buy Gate below, even when the user did not ask for an evaluation

## Build-vs-Buy Gate (fires BEFORE Step 1)

Most work in this skill arrives already framed as a decision ("X or Y?"). The expensive mistakes don't. They arrive framed as a **build**: "let's set up X", "I'll self-host Y", "we need to stand up Z". That framing is a *how*, and it has silently removed *buy* from the room before any evaluation runs. Once a task enters as a build it flows straight to `scoping-and-queuing-tasks` and execution, and this skill never fires. This gate is the interrupt that stops that.

Worked failure: MCPX was self-hosted over multiple months to give the agents Google Workspace access. A managed provider (Composio) would have covered most of it. The build was never wrong to *consider* ... it was wrong to proceed to without a build-vs-buy scan ever running, because it never arrived framed as a decision. What made it the wrong call ... the 7-day OAuth churn and the verification wall ... was operational tail, invisible in any feature comparison (SOC auth-churn thread, 2026-07-15; ADR pending).

### Trigger ... the shape, not the words

Fire this gate whenever a request implies **building, self-hosting, or standing up a capability for which a managed or off-the-shelf category plausibly exists** ... gateways, queues, auth brokers, schedulers, syncs, dashboards, integrations, pipelines, and the like. The trigger is the *category*, not the phrasing. If a vendor or OSS category exists for the thing, the gate fires.

Claude raises this gate **proactively**, even when the task was framed as a build and no evaluation was requested. The Planner instinct is to help build the thing *well* ... scope it, prompt it, ship it cleanly. This gate's job is to force the prior question first: should it be built at all. Not raising it is the exact failure this gate exists to prevent.

### The reframe (mandatory first move)

Restate the build as an **outcome**, stripping the implementation:

- "self-host a Workspace gateway" -> "give my agents durable Workspace access"
- "stand up a Postgres task queue" -> "move tasks from A to B reliably"
- "build a nightly sync" -> "keep X fresh from Y"

Evaluate the *outcome*. A build framed as a how has already eliminated buy; the outcome framing puts it back on the table.

### Time-box

This is a scan, not a project: ~30-60 min, 2-4 options, one pass. It either clears the build or flags a buy worth a full Step 1-6 evaluation. If the scan is genuinely inconclusive, escalate to the full workflow ... but the default is a fast scan. The gate must never become the reason nothing ships.

### Score the operational tail, not the feature list

A feature comparison almost always favours build, because build feels like more control. The axis that actually flips build-vs-buy is **total cost to *operate* over ~12 months**, including everything invisible at build time:

- auth and credential lifecycle ... token expiry, re-consent, verification walls
- upgrades, patching, breakage from upstream changes
- the failure tail ... what breaks unattended, and who fixes it
- the operator's own time, priced as a real cost

Build-cost is a one-time number and the *least* informative one. Score operate-cost.

### Output

A one-screen verdict: the reframed outcome, 2-4 options scored on 12-month operate-cost, and a **BUILD / BUY / SPLIT** call. If BUILD wins, the ADR must record *why build beat buy*, so it can be revisited when the landscape shifts ... vendors move fast, and a buy that loses today can win in six months. Then continue into the workflow below to formalise.

## Workflow

### Step 1 ... Gather Existing Context

Before forming any opinion, check what already exists:

1. **Search project knowledge** for related architecture decisions, prior discussions, existing patterns
2. **Fetch the project's Architecture & Decisions** ... Obsidian first (`wiki/projects/{slug}/architecture/`, `wiki/decisions/`); Notion PROJECT DOCS as fallback
3. **Search past conversations** for prior discussions on this topic (use `conversation_search`)
4. **Check the Roadmap** if this might affect sequencing

Document what you found. If a prior decision exists that this question touches, reference it explicitly ("This relates to ADR-011 which established ...").

### Step 2 ... Define the Decision

State clearly in one sentence what is being decided. Examples:
- "Whether to use Vercel Password Protection, Vercel Authentication, or a Next.js middleware gate for dashboard auth"
- "Whether to execute tasks via Claude Code CLI or Claude API"
- "Whether to keep PROJECT DOCS in Notion or migrate to Linear documents"

### Step 3 ... Research Options

For each viable option:

1. **Web search** for current pricing, documentation, known limitations (use `web_search` + `web_fetch` for authoritative sources)
2. **Check project knowledge** for any internal constraints that affect feasibility
3. **Assess against the existing architecture** ... does this option require changes to existing ADRs?

Aim for 2-4 options. If there are more, consolidate similar ones. If there's truly only one viable option, explain why alternatives were eliminated.

### Step 4 ... Present Analysis

Use this standard format:

```
## Decision: {one-sentence statement of what's being decided}

### Options

| | Option A: {name} | Option B: {name} | Option C: {name} |
|---|---|---|---|
| **How it works** | {1-2 sentences} | {1-2 sentences} | {1-2 sentences} |
| **Cost** | {$, time, complexity} | {$, time, complexity} | {$, time, complexity} |
| **Implementation effort** | {hours/issues} | {hours/issues} | {hours/issues} |
| **Maintenance burden** | {ongoing cost} | {ongoing cost} | {ongoing cost} |
| **12-mo operate cost** (auth lifecycle, upgrades, failure tail, your time) | {estimate} | {estimate} | {estimate} |
| **Constraints/Risks** | {what could go wrong} | {what could go wrong} | {what could go wrong} |
| **Affects existing ADRs** | {yes/no, which} | {yes/no, which} | {yes/no, which} |

### Recommendation

{Option X} because {concrete reasoning tied to the constraints above}.

{If the recommendation has a significant tradeoff, state it: "The tradeoff is ... {what you give up}. This is acceptable because {why}."}

### Implementation Path (if approved)

1. {First thing that happens}
2. {Second thing}
3. {Estimated issue count and scope}
```

### Step 5 ... Get Decision

Present the analysis and ask the user to confirm direction. Use `ask_user_input_v0` for bounded choices. Frame as yes/no or Option A/B/C ... not open-ended.

### Step 6 ... Document the Decision

Once the user confirms:

1. **If it's an architectural decision:** Add an ADR entry to the project's Architecture & Decisions. Write to Obsidian (`wiki/projects/{slug}/architecture/{slug}.md` or `wiki/decisions/{slug}.md`); mirror to Notion PROJECT DOCS for external collaborators if applicable. Format:
   ```
   **ADR-{NNN}: {Title}**
   Decision: {what was decided}
   Context: {why this decision was needed}
   Alternatives considered: {brief list}
   Consequences: {what changes as a result}
   Date: {YYYY-MM-DD}
   ```

2. **If it affects the roadmap:** Update the project's Roadmap

3. **If it creates implementation work:** Create issue(s) in Linear following the `scoping-and-queuing-tasks` skill

4. **Update the Chat Log** for the relevant project with a structured entry:
   ```
   ### {Date} ... {Topic}
   **Decision:** {what was decided}
   **Issues created:** {Linear identifiers if any}
   **Docs updated:** {which docs were changed}
   ```

## Quality Standards

- Never recommend an option without checking its current pricing/availability (web search)
- Never propose something that contradicts an existing ADR without explicitly flagging the conflict
- Always include implementation effort estimates ... "this is easy" is not an estimate
- Score cost-to-*operate* over ~12 months (auth lifecycle, upgrades, failure tail, operator time), not build-cost or feature count ... build-cost is the least informative number
- When a task arrives framed as a build, run the Build-vs-Buy Gate before any scoping ... a build framing is not a decision, it is an un-evaluated assumption
- Always state the tradeoff of the recommended option, not just its benefits
- If the decision is reversible, say so. If it's hard to reverse, say that too.
- Prefer options that minimize ongoing maintenance burden for a solo developer

## Anti-Patterns

- Presenting options without a recommendation ("here are three choices, what do you think?" ... always recommend one)
- Recommending the most complex option because it's "more robust" without weighing implementation cost
- Skipping Step 1 and proposing something that contradicts an existing decision
- Researching only one option in depth and treating the others as strawmen
- Forgetting to document the decision after it's made
- Letting a build-framed or self-host-framed task flow to `scoping-and-queuing-tasks` without running the Build-vs-Buy Gate ... this is the MCPX failure: a build that never got evaluated because it never arrived as a decision
- Comparing options on features/capability instead of cost-to-operate ... capability comparisons systematically favour build and hide the operational tail that actually decides it
