---
name: evaluating-new-ideas
description: Gated evaluation framework for early-stage project ideas, from first mention to Go/Park/Kill
---

# Idea Evaluation Framework

## Context

This skill is triggered when the user brings a new idea for evaluation ... their own, from a contact, from a discussion paper, or from a napkin sketch. The idea does not yet exist as a project. The goal is to determine whether it *should* exist as a project, and to document the reasoning either way.

Role: Development Planner throughout.

This skill sits *before* `starting-a-new-project` in the lifecycle. Its output is a Go/Park/Kill decision and a documented evaluation in the IDEA LOG. Only a **Go** outcome triggers `starting-a-new-project`.

## When to Use

- "New idea alert" / "I've been thinking about ..."
- Someone sends a discussion paper, pitch, or concept doc
- "What do you think of this?" with a business concept attached
- "Could we build X?" where X is a new product or business, not a feature of an existing project
- Any conversation where the question is "should this thing exist?" rather than "how should we build this thing?"

## When NOT to Use

- Technical architecture decisions within an existing project ... use `researching-options-and-decisions`
- Feature ideas for an existing project ... use `scoping-and-queuing-tasks`
- "Let's start building X" where the decision has already been made ... use `starting-a-new-project`

## Resources

- **IDEA LOG database**: `collection://dfeab587-d3fd-4d14-871b-063a92cf17ff`
- **PROJECT DOCS database**: `3083257a-fd0a-8088-bbcc-000bdd488971`
- **Chat Log**: Log material outcomes per standard memory instructions

## Evaluation Structure

The evaluation runs through three gates. Each gate ends with a decision: **proceed**, **park**, or **kill**. If an idea fails at any gate, the evaluation stops ... do not continue to subsequent gates. Document the outcome and the reasoning at whatever gate it reached.

---

### Gate 1 ... Problem & Market (Does this deserve to exist?)

Minimum viable evaluation. Every idea goes through this.

**1a. Problem Clarity**

- What is the problem being solved?
- Who experiences this problem? Be specific ... job title, context, frequency.
- How do they solve it today? What's painful about the current approach?
- How badly does it hurt? (Annoyance vs hair-on-fire)

Sources: user's description, attached documents, web search for market context.

**1b. Buyer-Pain Alignment**

- Who pays for the solution?
- Is the buyer the same person who feels the pain?
- If not ... what's the path from pain-feeler to budget-holder?
- Would the buyer actively seek this out, or does it need to be sold?

This is the single most important filter. If the person who pays doesn't feel the pain, the idea needs an exceptionally strong channel or regulatory driver to survive. Flag this clearly.

**1c. Market & Competitive Landscape**

- Web search for existing solutions, competitors, adjacent tools
- What's their traction? (Funding, reviews, market presence, pricing)
- Where are the gaps? What's nobody doing well?
- Is the market growing, stable, or shrinking?
- Is this an established category or a new one?

Research depth: 3-5 web searches minimum. Fetch at least one authoritative source (industry report, competitor site, regulatory body). Do not skim ... get concrete data points on competitor pricing, scale, and weaknesses.

**Gate 1 Decision Point**

Present findings and ask the user to confirm direction using `ask_user_input`:

- **Proceed to Gate 2** ... problem is real, buyer alignment exists (or has a viable path), competitive landscape has a gap
- **Park** ... interesting but unclear, needs more info, not the right time to evaluate further
- **Kill** ... fatal flaw identified (no real pain, buyer misalignment, saturated market with no gap)

If killed or parked, skip to **Document Outcome**.

---

### Gate 2 ... Viability & Build (Can this work as a business you can build?)

Only reached if Gate 1 passes.

**2a. Business Model Viability**

- How does it make money? (Subscription, transactional, licensing, equity, rev share, etc.)
- What are the rough unit economics? (Price point, cost to serve, margins)
- Is the pricing defensible? (What anchors exist in the market?)
- What's the minimum viable revenue to justify the effort?

**2b. Build Complexity**

- Can this be built with the current stack? (Next.js, Swift, Python)
- Rough build effort estimate for MVP (days/weeks, not months)
- Are there hard technical dependencies? (APIs, regulatory, third-party integrations, hardware)
- Does it require capabilities outside the current toolset? (e.g., ML model training, real-time video, payments infrastructure)

**2c. Revenue Timeline**

- How long from first build to first dollar?
- What has to happen between "built" and "paid"? (App Store approval, sales cycle, regulatory approval, partnership setup)
- Is there a path to revenue within 90 days of build completion?
- Does revenue require a sales team, or can it be self-serve / referral driven?

**Gate 2 Decision Point**

Present findings and ask the user to confirm direction using `ask_user_input`:

- **Proceed to Gate 3** ... business model works, you can build it, revenue timeline is acceptable
- **Park** ... model needs refinement, or build effort is too high right now given current commitments
- **Kill** ... economics don't work, build complexity is prohibitive, or time-to-revenue is too long

If killed or parked, skip to **Document Outcome**.

---

### Gate 3 ... Strategic Fit (Is this the right thing to build right now?)

Only reached if Gate 2 passes.

**3a. Timing / Window**

- Is there a reason to move now vs later?
- Is there a closing window? (Technology shift, regulatory change, competitor gap that will close)
- Is the market ready, or is this too early?
- Will waiting 6 months materially change the opportunity?

**3b. Defensibility / Moat**

- Once built, how hard is it for someone to replicate?
- What creates switching costs or lock-in? (Data, integrations, relationships, operational maturity)
- Is the moat in the tech, the process, the relationships, or the brand?
- How durable is the moat over 12-24 months?

**3c. Strategic Fit**

- Does this play to the user's existing strengths? (Tech stack, industry knowledge, network)
- Does it compound with or complement existing projects?
- Does the user have a credible right to win in this space?
- Is there a personal motivation or interest beyond the economics?

**Gate 3 Decision Point**

Present findings and ask the user to confirm final direction using `ask_user_input`:

- **Go** ... passes all gates, proceed to `starting-a-new-project`
- **Park** ... passes on merit but timing or strategic fit isn't right now
- **Kill** ... no moat, bad timing, or doesn't fit the portfolio

---

## Document Outcome

Regardless of the outcome, create an entry in the **IDEA LOG** database.

### IDEA LOG Entry

Create via `notion-create-pages` with the following properties:

| Property | Value |
|---|---|
| Name | {Idea name ... short, descriptive} |
| Source | {Who brought it ... "Michael", "Damian Cramp", "Brad", etc.} |
| Date Evaluated | {Today's date} |
| Gate Reached | {Gate 1 / Gate 2 / Gate 3} |
| Outcome | {Go / Park / Kill} |
| Thread Link | {URL of this conversation} |

### Page Content

Write the evaluation as page content using this structure:

```
## Summary
{2-3 sentence description of the idea}

## Gate 1 ... Problem & Market
### Problem Clarity
{Findings}

### Buyer-Pain Alignment
{Findings}

### Market & Competitive Landscape
{Findings}

### Gate 1 Outcome: {Proceed / Park / Kill}
{Reasoning ... 1-2 sentences}

## Gate 2 ... Viability & Build
{Only if Gate 1 passed}

### Business Model Viability
{Findings}

### Build Complexity
{Findings}

### Revenue Timeline
{Findings}

### Gate 2 Outcome: {Proceed / Park / Kill}
{Reasoning ... 1-2 sentences}

## Gate 3 ... Strategic Fit
{Only if Gate 2 passed}

### Timing / Window
{Findings}

### Defensibility / Moat
{Findings}

### Strategic Fit
{Findings}

### Gate 3 Outcome: {Go / Park / Kill}
{Reasoning ... 1-2 sentences}

## Final Verdict: {GO / PARK / KILL}
{One paragraph summary of why}
```

### Chat Log

Update the Chat Log for "General" (or the relevant project if one exists) with:

```
### {Date} ... Idea Evaluation: {Idea Name}
**Outcome:** {Go / Park / Kill} at Gate {N}
**Reason:** {One sentence}
**IDEA LOG entry:** {link}
```

### On Go Outcome

If the final verdict is **Go**, confirm with the user and then hand off to `starting-a-new-project`. The IDEA LOG entry becomes the reference document for the new project's Overview page.

### On Park Outcome

Note what would need to change for this to be re-evaluated. Add a "Revisit Trigger" line to the IDEA LOG entry:
```
**Revisit Trigger:** {what would need to change ... e.g., "Regulatory landscape shifts", "Current project load decreases", "A potential co-founder with domain expertise appears"}
```

### On Kill Outcome

Document the kill reason clearly. This is valuable ... it prevents the same idea resurfacing without new information. The kill reason should be specific and falsifiable:
- Good: "Buyer (hiring manager) doesn't feel the pain that the product solves (referee experience)"
- Bad: "Doesn't seem viable"

## Quality Standards

- Never skip Gate 1. Every idea gets at minimum a problem/buyer/market assessment.
- Always do real web research ... don't evaluate competitive landscape from memory alone. Minimum 3 web searches at Gate 1, more at Gate 2 if pricing or regulatory research is needed.
- Always state a recommendation at each gate. Don't present findings without a view.
- Kill early, kill clearly. A clean kill at Gate 1 is better than a vague park at Gate 3.
- Distinguish between "this is a bad idea" (Kill) and "this isn't the right time" (Park). They require different documentation.
- Park is not a soft kill. A parked idea should have a concrete revisit trigger ... if it doesn't, it's probably a kill.
- The evaluation depth should match the idea's complexity. A casual mention over coffee doesn't need the same depth as a full discussion paper with financial projections.

## Anti-Patterns

- Evaluating only the upside without stress-testing the business model
- Skipping buyer-pain alignment because the problem "obviously" exists
- Researching one competitor and declaring the market "crowded" or "empty"
- Continuing to Gate 2 or 3 when Gate 1 has a fatal flaw, just to be thorough
- Producing a Go recommendation without a concrete next step
- Parking everything because nothing is perfect ... if nothing ever gets a Go, the bar is too high
- Killing ideas based on "you're already busy" ... that's a prioritisation question, not a viability question. Assess viability first, then let the user decide on timing.
