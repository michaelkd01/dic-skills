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

## Workflow

### Step 1 ... Gather Existing Context

Before forming any opinion, check what already exists:

1. **Search project knowledge** for related architecture decisions, prior discussions, existing patterns
2. **Fetch the project's Architecture & Decisions doc** from PROJECT DOCS (`3083257a-fd0a-8088-bbcc-000bdd488971`)
3. **Search past conversations** for prior discussions on this topic (use `conversation_search`)
4. **Check the Roadmap doc** if this might affect sequencing

Document what you found. If a prior decision exists that this question touches, reference it explicitly ("This relates to ADR-011 which established ...").

### Step 2 ... Define the Decision

State clearly in one sentence what is being decided. Examples:
- "Whether to use Vercel Password Protection, Vercel Authentication, or a Next.js middleware gate for dashboard auth"
- "Whether to execute Delegator tasks via Claude Code CLI or Claude API"
- "Whether to store generated test specs inline in the Paperclip issue description or as a separate document via `put_issue_document`"

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
| **Implementation effort** | {hours/tasks} | {hours/tasks} | {hours/tasks} |
| **Maintenance burden** | {ongoing cost} | {ongoing cost} | {ongoing cost} |
| **Constraints/Risks** | {what could go wrong} | {what could go wrong} | {what could go wrong} |
| **Affects existing ADRs** | {yes/no, which} | {yes/no, which} | {yes/no, which} |

### Recommendation

{Option X} because {concrete reasoning tied to the constraints above}.

{If the recommendation has a significant tradeoff, state it: "The tradeoff is ... {what you give up}. This is acceptable because {why}."}

### Implementation Path (if approved)

1. {First thing that happens}
2. {Second thing}
3. {Estimated task count and scope}
```

### Step 5 ... Get Decision

Present the analysis and ask the user to confirm direction. Use `ask_user_input` for bounded choices. Frame as yes/no or Option A/B/C ... not open-ended.

### Step 6 ... Document the Decision

Once the user confirms:

1. **If it's an architectural decision:** Add an ADR entry to the project's Architecture & Decisions doc in Notion. Format:
   ```
   **ADR-{NNN}: {Title}**
   Decision: {what was decided}
   Context: {why this decision was needed}
   Alternatives considered: {brief list}
   Consequences: {what changes as a result}
   Date: {YYYY-MM-DD}
   ```

2. **If it affects the roadmap:** Update the project's Roadmap doc

3. **If it creates implementation work:** Create issue(s) in Paperclip following the scoping-and-queuing-tasks skill

4. **Update the Chat Log** for the relevant project with a structured entry:
   ```
   ### {Date} ... {Topic}
   **Decision:** {what was decided}
   **Tasks created:** {TQ-IDs if any}
   **Docs updated:** {which docs were changed}
   ```

## Quality Standards

- Never recommend an option without checking its current pricing/availability (web search)
- Never propose something that contradicts an existing ADR without explicitly flagging the conflict
- Always include implementation effort estimates ... "this is easy" is not an estimate
- Always state the tradeoff of the recommended option, not just its benefits
- If the decision is reversible, say so. If it's hard to reverse, say that too.
- Prefer options that minimize ongoing maintenance burden for a solo developer

## Anti-Patterns

- Presenting options without a recommendation ("here are three choices, what do you think?" ... always recommend one)
- Recommending the most complex option because it's "more robust" without weighing implementation cost
- Skipping Step 1 and proposing something that contradicts an existing decision
- Researching only one option in depth and treating the others as strawmen
- Forgetting to document the decision in Notion after it's made
