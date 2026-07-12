---
name: tax-prep-au
description: Annual Australian tax prep pipeline across Michael's entities (Personal, Social Club Ventures, Remida Trust, Propell-reimbursable), operated from Claude Cowork against the tax folder. Use whenever the user mentions tax prep, tax time, EOFY, end of financial year, deductions, categorising expenses, tax workpapers, prior-year returns, BAS prep support, or preparing documents for the accountant ... even if they only ask a partial question like "what can I deduct", "find my receipts", or "check last year's return". Reviews prior-year submissions for continuity (missed recurring deductions, carry-forwards), mines Gmail for invoices/receipts, cross-matches against bank statement CSVs from the tax folder, allocates spend to entity buckets, flags AU deduction candidates, and writes per-entity accountant-ready workpapers back into the tax folder. It never gives tax advice or decides judgment calls.
---

# AU Tax Prep Pipeline (tax-prep-au)

## Context

Michael operates multiple entities: himself personally, Social Club (company), a trust, and Propell (where he is Executive Chair ... Propell-related spend is *reimbursable by Propell*, never a Social Club deduction). Tax prep pain is evidence gathering and categorisation, not lodgement. This skill produces an evidenced, categorised workpaper pack for his accountant. It does not lodge, does not advise, does not decide.

Tracking issue: SOC-130 (SC Internal).

## Hard rules ... read before anything else

1. **Never give tax advice.** Flag candidates; the accountant decides. Phrase all deduction output as "candidate ... confirm with accountant".
2. **Never silently allocate an ambiguous transaction.** Confidence < high → REVIEW list with a one-line reason. `other/REVIEW` is honest; a guessed bucket is a defect.
3. **Never decide apportionment** (business-use %, home office method choice, phone/internet splits, trust distribution, anything Div 7A-adjacent). These go in the "Accountant judgment required" section.
4. **Redact account numbers** in every output artifact (keep last 4 digits only).
5. **Never request or process banking credentials.** Statements are uploaded as CSV/PDF exports only.
6. **Entity map is canonical.** All allocation runs through `references/entity-buckets.md`. If a vendor is missing, add it to the run's proposed-mapping-additions list; do not invent an allocation.
7. **Prior-year folders are read-only.** Phase 0 reads them; nothing ever writes to or renames anything under a prior FY directory. Current-year writes go only to `FY{yy}/workpapers/` and `FY{yy}/evidence/`.
8. **Never delete, move, or rename any pre-existing file, anywhere in the tax root, under any circumstance.** This includes duplicates, "obsolete" prior outputs, and misfiled documents. If a delete/move/rename ever appears necessary, stop, do not act, and list it as a handback item for Michael to action manually. Declining Cowork's delete-confirmation prompt is the correct behaviour if one ever appears during a run ... its appearance is itself a defect to report.
9. **All inputs are immutable.** Files in `statements/`, pre-existing files in `evidence/`, and everything under prior FY folders are never edited in place, reformatted, re-saved, or "cleaned up" ... not even to fix encoding or headers. Any transformation happens on an in-memory or working copy; only new output files are ever written.
10. **Create-only writes, proven by manifest.** The skill never modifies an existing file. Each run writes exclusively new files into its own run folder (see Operating environment). Every run ends with a file-operations manifest (see Phase 6) attesting: files created (with paths and checksums), 0 files modified, 0 files deleted, 0 files moved or renamed. If reality deviates from that attestation in any way, the deviation is reported in the manifest and in the chat handback ... never silently.

## Operating environment

**Primary home: Claude Cowork (desktop).** Resolve the tax folder per `references/tax-folder.md` before anything else, in this order:

1. Cowork-granted local folder (Filesystem tools) whose path matches the tax-folder config
2. Google Drive folder "Tax - BrizTax" via Drive MCP (folder ID in `references/tax-folder.md`)
3. Neither reachable → claude.ai fallback mode: session uploads in, `/mnt/user-data/outputs/` out, and say so explicitly in the run header

Folder convention inside the tax root (create missing directories on first touch):

```
{TAX_ROOT}/
  FY{yy}/statements/    ... bank/card CSV exports (input, immutable)
  FY{yy}/evidence/      ... saved invoices/receipts (input; skill may ADD new files here, never modify existing)
  FY{yy}/workpapers/
    run-{yyyy-mm-dd-hhmm}/  ... ALL outputs for a single run (create-only)
  FY{yy-1}/, FY{yy-2}/  ... prior years: returns, accountant packs, workpapers (read-only input to Phase 0)
```

Never modify anything under a prior-year folder. Prior years are read-only evidence.

**Run isolation:** at run start, create `FY{yy}/workpapers/run-{yyyy-mm-dd-hhmm}/` and write every output there. Prior run folders are never touched, overwritten, or deleted ... superseded runs are Michael's to prune manually. New files saved to `evidence/` (email attachments) use a `{date}-{vendor}-{descriptor}` filename; if that name already exists, append a suffix rather than overwrite.

## Inputs required before running

- FY window (e.g., FY26 = 2025-07-01 to 2026-06-30)
- Tax folder resolved (above); statements present in `FY{yy}/statements/` (CSV preferred; PDF acceptable). In fallback mode, statements uploaded to the session
- Gmail MCP active
- `references/entity-buckets.md` read and current (check its status flag; while allocation split is unconfirmed, apply its stated confidence rules)

If statements are missing, run the email sweep and Phase 0 anyway and output a partial pack clearly labelled UNVERIFIED (email evidence without bank confirmation).

## Pipeline

### Phase 0 ... Prior-year continuity review

Purpose: nothing claimed, declared, or carried forward last year silently vanishes this year.

1. Inventory prior-year folders (`FY{yy-1}`, and `FY{yy-2}` if present): lodged returns, notices of assessment, accountant workpapers, depreciation schedules ... per entity (Personal, Social Club Ventures, Remida Trust)
2. Extract from each prior return/workpaper (PDF reading per the pdf-reading skill):
   - Every deduction category claimed, with amount
   - Every income source declared (salary, dividends + franking, interest, trust distributions, business income, rental)
   - Carried-forward items: capital losses, depreciation pools / low-value pools, borrowing-cost amortisation, unused concessional super cap, prior-year trust loss positions
   - One-off vs recurring flags per line
3. Build the continuity matrix: prior-year line → present this year? → status:
   - PRESENT (matched in this year's data)
   - MISSING ... recurring item with no current-year trace (e.g., income protection premium claimed FY25, no FY26 evidence found)
   - CARRY-FORWARD ... must appear in this year's return regardless of new transactions; list opening balance and source document
   - ENDED ... evidence it genuinely stopped (subscription cancelled, asset disposed ... note disposal may itself be a CGT event → accountant flag)
4. Feed MISSING items into the Phase 1 email sweep as targeted vendor/category queries before declaring them absent
5. Output `FY{yy}-continuity-review.md` in workpapers: matrix + carried-forward register + CGT-event flags

If no prior-year documents exist in the tax folder, say so in the run header and list what to request from the accountant (prior returns + depreciation schedules per entity) in the missing-docs output.

### Phase 1 ... Email evidence sweep (Gmail MCP)

Search the FY window month-by-month with `Gmail:search_threads`. Query families (run each, dedupe by thread):

- `invoice OR receipt OR "tax invoice"`
- `subscription OR renewal OR "payment confirmation" OR "payment received"`
- Vendor-targeted passes for every vendor in the entity map (cheap, high precision)

For each hit extract: vendor, date, amount, currency, GST shown (Y/N/amount), what was purchased, entity signal (which email account / project it relates to), message link. Build `email_evidence.csv`.

Also sweep for **deductible-activity signals** that may not be purchases: professional memberships, courses/conferences, donations with DGR receipts, income protection insurance, interest statements, dividend statements, private health statements. These feed the deduction-candidates memo.

### Phase 2 ... Statement normalisation

Parse every uploaded statement into a single normalised table: date, description, amount, direction, account (last-4), source file. Dedupe transfers between own accounts (matched opposite pairs within 3 days) and mark them `internal-transfer`, excluded from allocation.

### Phase 3 ... Cross-match

Match email evidence to bank lines on amount (± FX/GST tolerance 2%) and date (± 5 days), then vendor-string fuzzy match. Outcomes per bank line: MATCHED (evidence link), UNMATCHED-SPEND (no evidence; if recurring or > $50, goes on the missing-docs list), and per evidence row: UNMATCHED-EVIDENCE (invoice with no bank line ... possibly paid from an account not provided; list which).

### Phase 4 ... Entity bucket allocation

Allocate every non-internal transaction using `references/entity-buckets.md`:

1. Exact vendor map hit → allocate, confidence HIGH
2. Category-rule hit (e.g., "*.dev-infra*") → allocate, confidence MEDIUM
3. Inference from email evidence context → allocate, confidence MEDIUM, note reasoning
4. No signal or conflicting signal → bucket `REVIEW`, one-line reason

Personal spend identified in a business account (or vice versa) is always flagged, never dropped ... the accountant needs mixed-use visibility.

### Phase 5 ... Deduction candidate flags (AU)

Scan allocated data and email signals for candidates. Standard checklist (flag with evidence, never conclude):

- Home office: fixed rate (PCG 2023/1, 70c/hr FY25 rate ... verify current-year rate via web search at run time) vs actual cost; needs hours records ... flag whether any exist
- Phone/internet/electricity business portion
- Depreciating assets / instant asset write-off purchases (verify current-year threshold via web search at run time)
- Professional memberships and subscriptions (e.g., AICD), professional fees (accounting, legal ... noting capital vs revenue nature is accountant territory)
- Self-education, conferences, travel with business purpose signals
- Concessional super contributions and notice-of-intent status
- Donations with DGR receipts
- Motor vehicle: flag if any business-travel signals exist; method choice is accountant territory
- Income-side completeness: dividend/interest/distribution statements found vs expected

### Phase 6 ... Output pack

Follow the xlsx skill for workbook creation. Write to `{TAX_ROOT}/FY{yy}/workpapers/run-{yyyy-mm-dd-hhmm}/` (fallback mode: `/mnt/user-data/outputs/`):

1. `FY{yy}-workpapers-{entity}.xlsx` per entity ... transactions sheet (date, vendor, description, amount, GST, category, confidence, evidence link), summary-by-category sheet
2. `FY{yy}-REVIEW.xlsx` ... every flagged item with reason, blank Decision column for Michael/accountant
3. `FY{yy}-continuity-review.md` ... from Phase 0: matrix, carried-forward register, CGT-event flags
4. `FY{yy}-deduction-candidates.md` ... memo per checklist above, each item marked "confirm with accountant"
5. `FY{yy}-missing-docs.md` ... unmatched spend needing receipts, statements/accounts not provided, income statements not found, MISSING continuity items still unexplained after the targeted sweep
6. Proposed additions to the vendor map (paste-ready for `entity-buckets.md`)
7. `FY{yy}-run-manifest.md` ... the file-operations manifest required by Hard Rule 10:
   - **Created:** every file written this run ... relative path, size, sha256 (first 12 chars). Includes any new files added to `evidence/`.
   - **Modified:** must be `NONE`. Any entry here is a defect ... explain what happened and why.
   - **Deleted / moved / renamed:** must be `NONE`. Any entry here is a critical defect.
   - **Read-only inputs touched:** list of input files read (paths only), confirming read-only access.

End every run with a Handback Audit block (per scoping-and-queuing-tasks convention) listing what needs Michael (uploads, decisions) vs the accountant (judgment items). The Handback Audit MUST open with a one-line manifest attestation, e.g. `File ops: 14 created · 0 modified · 0 deleted · manifest: run-2026-07-08-1140/FY26-run-manifest.md` ... so the integrity claim is visible in chat without opening the folder.

## After the first run

Update `references/entity-buckets.md` with confirmed mappings, set its flag to CONFIRMED, and comment results on SOC-130.
