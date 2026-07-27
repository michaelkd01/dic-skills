---
name: propell-monthly-review
description: Produce the Propell monthly strategic review ... longer-horizon trajectories, themes, and a narrative-vs-numbers wash of the team's weekly meeting notes against performance data and plan. Trigger on "run the monthly review", "monthly review for [month]", "propell monthly", "monthly rollup", "wash the meeting notes against the numbers", or when Michael asks how the month went at a strategic level. Reads the Weekly Summaries time series, Watch Items history, and the month's team meeting notes from Notion; verifies month-grain figures against Tableau; classifies trajectories; audits meeting claims and action items against outcomes. Michael-only output ... never distributed to the team. Do NOT use for the weekly summary run (propell-weekly-summary) or for ad-hoc metric lookups.
---

# Propell Monthly Review

Monthly strategic layer over the weekly summary pipeline. Where the weekly answers "what changed this week", the monthly answers "what is actually happening": trajectory, theme, and whether the team's narrative matches the data.

**Requires:** Notion connector (mandatory) and Tableau connector (for month-grain verification ... degrade gracefully if absent, see Step 3).

**All system IDs live in `references/system-ids.md`. Read it first, every run.**

**Audience rule (hard):** This is a chairman's document. The narrative-vs-numbers wash evaluates management claims against outcomes. Output goes to Michael only ... never to the team, never referenced in team-facing material, regardless of the weekly pipeline's distribution status.

## Non-negotiable rules

1. Metric definitions, targets, and flag rules come from the Notion Context page manifest ... same binding source as the weekly skill. Never redefine here.
2. Tableau extraction is query-datasource (VizQL) only. Never get-view-data.
3. Distinguish rigorously between **data** (retrieved numbers), **team narrative** (what meeting notes claim), and **interpretation** (the skill's synthesis). The Direction section and all trajectory claims about the future are labelled interpretation.
4. Quote meeting notes minimally and neutrally in the wash ... the purpose is alignment-checking, not building a case against anyone. Attribute claims to "the meeting" unless the operator asks for attribution.
5. Nothing publishes without explicit approval. Draft, review, then publish.
6. If fewer than 3 weekly entries exist for the month, say so and produce a reduced review rather than fabricating trend confidence.

## Workflow

### Step 1 ... Scope

Confirm the target calendar month with the operator. Default: the most recently completed month.

### Step 2 ... Read state from Notion

- **Business Context & Assumptions** (Context page): regime, targets, manifest, monthly targets.
- **Weekly Summaries DB**: all entries in the target month plus the prior month (for MoM); read both metric properties and summary bodies (bodies carry the qualitative record).
- **Watch Items DB**: everything Open or Monitoring, plus anything opened or resolved during the month. Note Date Opened for weeks-open arithmetic.
- **Monthly Reviews DB**: prior month's entry, if any, for continuity ... its Direction section is last month's forecast, to be scored against this month's actuals.

### Step 3 ... Meeting notes discovery and ingestion

Find the month's team meeting notes via Notion search on title pattern **"Propell Weekly Ops & Leadership Team Meeting"** (also try the observed misspelling "Propel Weekly Ops") filtered to the month window. The notes are AI meeting-note pages: read the structured summary and action items; fetch the transcript only if a specific claim needs verification.

From each meeting extract:
- **Claims about performance** (e.g. "volumes stable", "credit quality improving significantly") ... anything asserting a state or trend of the business
- **Commitments and action items** with owner where stated
- **Forward statements** (e.g. "five approved deals very likely to proceed")
- **Decisions** (policy, credit settings, broker switches)

If no meeting notes are found for the month, proceed without the wash and say so prominently.

### Step 4 ... Month-grain verification (Tableau)

If Tableau is connected, pull the canonical monthly figures per the manifest: monthly funded value/volume vs monthly target, monthly cohort conversions, month-end arrears snapshot, monthly approved lost, monthly WA rate. Reconcile against the sum/average of the weekly entries; report divergence >5% in Run Notes. If Tableau is not connected, derive month figures from the weekly entries and mark every derived figure "(derived from weeklies, unverified)".

### Step 5 ... Analyse

**Trajectories.** Classify each open/recently-closed watch item and each core metric:
- **Accelerating** ... moving further from target/tolerance, rate worsening
- **Persistent** ... unchanged in level and direction for 3+ weeks
- **Fading** ... moving back toward target, not yet inside tolerance
- **Resolved** ... inside tolerance 2+ consecutive weeks, or watch item closed with evidence
- **Emerged** ... appeared this month with no prior-month signal

**Narrative vs numbers wash.** Sort every extracted claim into:
- **Confirmed** ... data supports it (state which metric and value)
- **Not yet visible** ... plausible but unsupported by current data; carry forward as an open claim with what evidence would confirm it
- **Contradicted** ... data shows otherwise (state both sides neutrally; timing differences are noted as timing, not contradiction)
- **Blind spots** ... material data movements (any flag-rule trigger during the month) that no meeting discussed

**Action follow-through.** Actions raised across the month's meetings: completed / carried (still open, mentioned again) / dropped (raised once, never mentioned again, not done). Dropped items are listed explicitly ... they are the leading indicator of execution drift.

**Forecast scoring.** If the prior Monthly Review's Direction section made calls, score each: right / wrong / undetermined.

### Step 6 ... Draft

Fixed section order:
1. **Month headline** ... one or two sentences
2. **Scoreboard** ... table: metric, month actual, monthly target, prior month, MoM. Derived figures marked.
3. **Trajectories** ... grouped by classification, one line each with evidence
4. **Narrative vs numbers** ... the four buckets; blind spots last and unmissable
5. **Action follow-through** ... counts plus the dropped list
6. **Last month's calls** ... forecast scoring (omit if no prior entry)
7. **Direction (interpretation)** ... where next month lands if trajectories hold; the one or two decisions the data says are approaching; explicitly labelled as interpretation
8. **[OPERATOR: ...]** placeholders wherever chairman-level context is required (board dynamics, Altor negotiations, anything outside the data)

Style: Australian English, ellipses not dashes, no emojis, number + comparison + implication per bullet, no filler.

### Step 7 ... Review gate

Present the draft, the placeholder list, and Run Notes (meetings found and analysed, extraction anomalies, derived-vs-verified status, wash items needing operator judgment). Stop. Do not publish.

### Step 8 ... Publish (on approval only)

1. Create the Monthly Reviews entry: metric properties populated (rates as decimals, AUD), approved body as content, Run Notes in a toggle, Published checked, Date = first of month, Month title "Month YYYY".
2. Propose (never auto-apply) any watch-item consequences: a "not yet visible" claim worth tracking, or a blind spot warranting a new item ... these route through the operator into the Watch Items DB.
3. No email output by default ... this document does not leave the operator.

## Maintenance

Definition changes happen on the Notion Context page, never here. If the meeting note title pattern changes or notes move into a database, update `references/system-ids.md` and note it in the Context page change log.
