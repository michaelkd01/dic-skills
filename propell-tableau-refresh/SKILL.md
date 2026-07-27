---
name: propell-tableau-refresh
description: Refresh the existing-book runoff data (weekly Interest Due / Principal Due schedule) in the Propell FY27–FY31 forecast workbook from Tableau, as a governed, logged event. Trigger on "refresh the Tableau data", "refresh the forecast data", "update the existing book runoff", "the model's Tableau sheet is stale", "pull the latest repayment schedule into the model", or whenever the forecast workbook's existing-book schedule needs updating for any reason. Requires the Tableau MCP connector in-session. Do NOT trigger for ad hoc Tableau queries or metric lookups, the weekly summary run (propell-weekly-summary), or any edit to the model's Drivers/assumptions (that is the change-review workflow).
---

# Propell Tableau Refresh

Refreshes the `Tableau` sheet of `Propell - Forecast FY27 to FY31 (Base Case)` ... the weekly existing-book runoff schedule that drives Revenue rows 12–13 ... from the live Tableau datasource. Deliberately NOT a live Excel connection: the workbook travels to Altor and must stay static, self-contained, and versioned. Every refresh is a two-step governed event: this session extracts and generates a prompt; a Claude in Excel session applies it, reconciles, and logs it.

## Why this design (do not "improve" it into a live link)

A Power Query / REST connection would embed credentials in a file that leaves the building, break on every other machine, and let numbers shift under an unlogged refresh ... the exact failure mode the workbook's change-control system exists to prevent. Direct `query-datasource` extraction gives typed, full-precision data (PDF/screenshot ingestion is prohibited as a data path for the same reason as in the weekly summary).

## Workbook facts (verify, don't assume ... conventions may have moved)

- `Tableau` sheet: title rows 1–2; row 4 = week-commencing dates across columns from B; row 5 = `Interest  Due`; row 6 = `Principal  Due`. Historically stored as TEXT (dates and numbers), consumed by `Revenue!Y12:CF13` via `SUMPRODUCT(DATEVALUE(...))` coercion. A one-time migration to typed values is part of the first refresh.
- The `Tableau` sheet is deliberately unprotected. `Revenue` is protected (no password).
- Change control: visible `Change Log` sheet, hidden `Snapshot` sheet with versioned full-state blocks, version cell `Drivers!C4`. A data refresh changes model outputs with no driver change ... it MUST write its own Change Log row and Snapshot block, or the next change review will flag it as an unexplained logic/data event (its case B).

## Step 1 ... Extract from Tableau

Datasource: **Contract Repayment Schedule**, LUID `6fbd653e-8cd8-43c4-9693-d668a9daba1a`.

1. Run `get-datasource-metadata` first ... always, before querying a datasource in a new session.
2. `query-datasource` for the full remaining contractual schedule: weekly grain, week-commencing date, total Interest Due, total Principal Due, from the current week to the final contractual repayment week of the book. Pull the ENTIRE remaining horizon ... never truncate to the old sheet's width; a truncated tail silently understates old-book income.
3. Rules that have bitten before: `query-datasource` (VizQL) is the only permitted extraction method ... `get-view-data` returns scaffold and is prohibited. `QUANTITATIVE_DATE` filters take date granularity (`YYYY-MM-DD`), not datetimes. On a connector timeout, one cold-start retry, then halt and report.
4. Sanity-check the extract before generating anything: weekly totals are positive and of plausible magnitude (dollars, thousands-scale weekly for this book); dates are consecutive weeks; the horizon end is reported against the model horizon (Jun-2031). If the schedule ends after Jun-2031, note that the model window truncates it (acceptable); if data looks malformed, stop.

## Step 2 ... Generate the Claude in Excel prompt

Produce a standalone prompt (markdown, complete, no placeholders) for a fresh Claude in Excel session, containing the extracted data inline as the write payload. The prompt must instruct:

1. **Pre-flight**: read `Tableau!A4:A6` labels and detect whether `B4` holds text or a real date (decides migration). Read `Revenue!Y12` and `Y13` formulas. Record current values of `Revenue!Y12:CF13` (the monthly aggregation) as the pre-refresh comparison vector, and `Summary!D9:H9` (Loan Income by FY).
2. **Write**: clear the existing schedule region (row 4–6, column B to the old extent), then write the new schedule as TYPED values ... real Excel dates in row 4, numerics in rows 5–6 ... extending to the full extracted horizon. Never text.
3. **Migration (first refresh only, when B4 was text)**: unprotect `Revenue`, update the row 12 and 13 aggregation formulas to compare real dates (drop the `DATEVALUE()` wrapper, keep the SUMPRODUCT window logic identical) and widen their Tableau column range to cover the new extent; re-protect, no password. On later refreshes where B4 is already a date, only widen the range if the horizon grew.
4. **Reconcile (this replaces the zero-delta gate ... outputs are SUPPOSED to move)**: full recalc, zero formula errors; `Revenue!Y12:CF13` resolves numerically everywhere (no #VALUE! ... the classic symptom of text/typed mismatch); report the pre- vs post-refresh monthly deltas and the `Summary!D9:H9` deltas as the impact statement. Large deltas are findings to report, not errors to fix.
5. **Change control**: append a `Change Log` row (date, time, next version increment, author, `Tableau existing-book schedule refreshed from Contract Repayment Schedule datasource; horizon {old end} -> {new end}{; typed-data migration applied}`, reason `Scheduled data refresh`, impact from the reconciliation deltas); append a `Snapshot` version block in the established shape; bump `Drivers!C4` (unprotect for the one edit, re-protect); Claude Log row with time; save.
6. **Rules block**: touch nothing except the `Tableau` sheet, the two `Revenue` aggregation rows (migration only), and the change-control sheets; no rows/columns inserted or deleted; columns M..X on other sheets untouched; data written verbatim from the payload, never adjusted.

## Step 3 ... Hand over and close

Deliver the generated prompt to the operator to run in Claude in Excel (fresh session). When the completion report returns, verify: reconciliation deltas are explicable (runoff drift since last refresh), the Change Log and Snapshot writes landed, and the version incremented. The refresh is not "done" until the logged save is confirmed.

## Failure modes to watch

- **#VALUE! in Revenue rows 12–13** ... typed/text mismatch between the written data and the aggregation formulas; the migration step was skipped or half-applied.
- **Loan income steps down sharply at a specific month** ... horizon truncation; check the written extent against the extracted extent.
- **Next change review flags "outputs moved, no driver change"** ... the refresh skipped its Change Log/Snapshot close-out; write them retrospectively before anything else changes.
