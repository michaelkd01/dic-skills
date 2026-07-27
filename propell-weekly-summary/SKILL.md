---
name: propell-weekly-summary
description: Produce the Propell weekly results summary from Tableau data with persistent context in Notion. Trigger on "run the weekly summary", "weekly summary for week ending", "propell weekly", "run the pack summary", "weekly results summary", or when Michael provides the week's funding availability figures and asks for the summary. Reads business context, open watch items, and prior weeks from Notion; extracts metrics from Tableau via query-datasource per the binding manifest; computes deltas and flags; drafts in a fixed template with judgment placeholders; publishes to Notion only on explicit approval. Do NOT use for ad-hoc Tableau queries or one-off metric lookups ... only for the full weekly summary run.
---

# Propell Weekly Summary

Weekly summary pipeline over the six-report Tableau pack (Pipeline, Conversions, Performance, Brokers, Credit & Portfolio Health, Forecasting). Continuity is structural: every run inherits open watch items and prior-week baselines from Notion, so the narrative accumulates rather than restarting.

**Requires:** Tableau and Notion connectors in the conversation. If either is missing, stop and say so.

**All system IDs (Notion pages, data sources, Tableau LUIDs) live in `references/system-ids.md`. Read it first, every run.**

## Non-negotiable rules

1. The **metric manifest on the Notion Context page is binding**. Query only the datasources and definitions it specifies. The skill file never overrides the manifest ... if they conflict, the manifest wins and the conflict is reported.
2. Extraction is **query-datasource (VizQL) only**. Never use get-view-data (returns a test scaffold on this site). get-view-image only as a manual debugging aid, never for values.
3. If a manifest query fails or a connector errors, **halt and report**. Never improvise an alternative field, never substitute a guessed value, never present a partial extraction as complete.
4. **Nothing is published without explicit approval.** The draft-review-publish gate is hard.
5. State what the numbers show; never invent causation. Judgment, causation, and forward view belong in placeholders for the operator.

## Workflow

### Step 1 ... Collect manual input

Funding availability is not in Tableau. Require from the operator before extraction:
- Available funds ($k)
- Ringfenced funds ($k)
- Funds available for new approvals ($k)

Also confirm the target week ending (a Sunday). If funding figures are not provided, ask once; proceed only if the operator explicitly says to skip, and record the skip in Run Notes. Invite the emailed pack PDFs as an optional input at the same time ... if provided, they drive Step 3a reconciliation.

### Step 2 ... Read state from Notion

From the pilot parent page (IDs in references/system-ids.md):
- **Business Context & Assumptions**: regime statement, targets, flag rules, metric manifest (including per-metric ASSUMED/CONFIRMED status and known variances).
- **Watch Items DB**: every item with Status = Open or Monitoring. Each MUST be addressed in the draft with current-week evidence.
- **Weekly Summaries DB**: last 4 entries, for WoW and 4-week baselines. If fewer exist, use what's there and note it.

### Step 3 ... Extract from Tableau

Run the manifest queries for the target week against the specified datasource LUIDs. For every metric the manifest marks ASSUMED or flags for verification (e.g. "VERIFY on first run"), record the retrieved value verbatim for reconciliation against the emailed pack. When a verification passes, propose a manifest status note update for operator approval.

Plausibility bounds (halt and report on breach, do not publish):
- Weekly funded value outside $0–$2M
- Weekly new deal value outside $0–$15M
- Any conversion rate outside 0–150%
- WA rate outside 1.5–4.0%
- Arrears total % outside 0–10%

### Step 3a ... Pack reconciliation (when pack PDFs are provided)

Reconcile every extracted metric against the pack before drafting:
- Divergence within 5% relative: PASS ... note the variance in Run Notes.
- Divergence beyond 5%: present the pack figure in the draft, put the extracted figure and the specific divergence in Run Notes, and propose a manifest status update.
- Any metric whose manifest status is VERIFICATION FAILED always publishes the pack figure.
- A grain mismatch (e.g. broker companies vs individual brokers) is a definition defect: propose the manifest edit, never silently pick a side.

### Step 4 ... Compute

Per metric: WoW delta, 4-week average delta, MTD position, variance to target (targets from the Context page). A conversion with a zero denominator is null, not 0% ... store the property empty and write "not computable" in the draft.

### Step 5 ... Evaluate flags

Apply the flag rules from the Context page exactly as written there. Each triggered flag becomes a headline candidate and, if no existing watch item covers it, a proposed new watch item. Flags never auto-publish or auto-create anything.

### Step 6 ... Draft

Fixed section order, no deviation:
1. **Headline** ... one or two sentences, the week's binding story
2. **Funding & capacity**
3. **Demand & pipeline**
4. **Conversion**
5. **Lost deals**
6. **Margin & credit quality**
7. **Brokers**
8. **Watch items** ... one line each: status, weeks open, this week's evidence
9. **Decision point** ... only if one genuinely exists; omit otherwise

Style: every bullet carries number + comparison (prior week or target) + implication. No bullet without a delta or target reference. Australian English, ellipses not dashes, no emojis, no filler.

Insert **[OPERATOR: ...]** placeholders wherever causation, forward view, or commercial context is required. During pilot the operator is Michael; post-rollout, Khai.

### Step 7 ... Present for review (publish gate)

Present to the operator:
- The full draft
- The placeholder list
- Watch item proposals (open/close) with the triggering evidence
- **Run Notes**: extraction anomalies, ASSUMED-metric retrieved values vs any pack figures provided, definitions applied, skipped inputs

Then stop. Do not publish. If the operator supplies pack figures and any ASSUMED or verification-flagged metric diverges >5%, flag it prominently and recommend investigating before publish.

### Step 8 ... Publish (on approval only)

1. Create the Weekly Summaries entry: all metric properties populated (rates as decimals, values in AUD), final approved body as content, Run Notes in a toggle, Published checked, Date = week-ending Sunday.
2. Update Watch Items exactly per the operator's decisions: refresh Latest Evidence on all open items; open/close only as approved (closures get a Resolution Note).
3. Output the final email-ready body as plain text.

## Maintenance

- Definition changes (e.g. Ken confirming an ASSUMED metric) are made on the Notion Context page manifest with a Change Log line ... never in this skill file.
- If the manifest and observed Tableau schema drift apart (field renamed, datasource republished), halt, report the specific mismatch, and propose the manifest edit for approval.
