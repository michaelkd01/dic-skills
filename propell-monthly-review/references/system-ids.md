# System IDs ... Propell Monthly Review

Read at the start of every run. If any ID returns not-found, halt and report.

## Notion

| Component | Type | ID |
| --- | --- | --- |
| Propell Weekly Summary (Pilot) | parent page | `3a43257a-fd0a-81a1-bf53-d9d0c72b386c` |
| Business Context & Assumptions | page | `3a43257a-fd0a-8164-bc7e-df079977b586` |
| Watch Items | data source | `9eb7a42c-8730-4f19-a1bd-014ae6893438` |
| Weekly Summaries | data source | `dc5fd0e4-e6fc-479d-b4a1-752870f30b4e` |
| Monthly Reviews | data source | `11d725f2-8f9b-4990-89c5-412150b1f384` |

### Monthly Reviews schema
Month (title, "Month YYYY"), Date (date, first of month), Published (checkbox), Headline (text), then number properties: Funded Value Month, Funded vs Target, New Value Month, Conv New-Approved Month, Conv Approved-Funded Month, WA Rate Month, Arrears Month-End Pct, Approved Lost Month, Watch Items Opened, Watch Items Closed, Meetings Analysed, Actions Raised, Actions Completed.

Conventions: rates/percentages as decimals (0.06 = 6%). Currency AUD whole dollars. "Funded vs Target" = month actual / monthly target.

## Meeting notes

- Standalone AI meeting-note pages, not in a database (as at Jul 2026).
- Discovery: Notion search, title pattern "Propell Weekly Ops & Leadership Team Meeting" ... ALSO search "Propel Weekly Ops" (misspelling observed in live notes), filtered to the target month.
- Structure: meeting-notes block with summary (action items + sectioned discussion), operator notes, transcript (fetch transcript only when a specific claim needs verification).
- Known example: 14 Jul 2026 note, page `39c3257a-fd0a-802d-ae07-e84329abd349`.

## Tableau (month-grain verification only)

Same site and datasources as the weekly skill; retrieval query-datasource (VizQL) only.

| Datasource | LUID |
| --- | --- |
| Case with Reference Date For Pipeline | `dea7a483-76e0-48ba-a7fc-ddc211ac60eb` |
| Arrears Extract Combined | `7c130d9e-c274-43dc-a058-6a29afce1ffc` |
| Contract Repayment Schedule With Weekly Forecast | `6fbd653e-8cd8-43c4-9693-d668a9daba1a` |

Month-grain queries follow the same manifest definitions as weekly, swapped to TRUNC_MONTH grain. Known defect: get-view-data returns scaffold ... prohibited.

## Source of truth hierarchy

1. Metric definitions, targets, flag rules: Notion Context page manifest.
2. System locations: this file.
3. On disagreement between this file and live structure: halt and report.
