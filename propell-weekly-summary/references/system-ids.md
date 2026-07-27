# System IDs ... Propell Weekly Summary

Read at the start of every run. If any ID returns not-found, halt and report ... do not search for substitutes.

## Notion

| Component | Type | ID |
| --- | --- | --- |
| Propell Weekly Summary (Pilot) | parent page | `3a43257a-fd0a-81a1-bf53-d9d0c72b386c` |
| Business Context & Assumptions | page | `3a43257a-fd0a-8164-bc7e-df079977b586` |
| Watch Items | data source | `9eb7a42c-8730-4f19-a1bd-014ae6893438` |
| Weekly Summaries | data source | `dc5fd0e4-e6fc-479d-b4a1-752870f30b4e` |
| Run Instructions (Pilot) | page | `3a43257a-fd0a-818b-ac28-ebab3aa954a4` |

### Watch Items schema
Name (title), Status (select: Open / Monitoring / Resolved), Date Opened (date), Trigger Metric (text), Trigger Value (text), Latest Evidence (text), Resolution Note (text).

### Weekly Summaries schema
Week Ending (title, format "W/E DD Month YYYY"), Date (date, week-ending Sunday), Published (checkbox), Headline (text), then number properties: New Value, New Volume, Approved Value, Approved Volume, Funded Value, Funded Volume, Conv New-Approved, Conv Approved-Funded, Conv New-Funded, WA Rate, Awaiting Completion Value, Awaiting Completion Count, Arrears Total Pct, Arrears In-Arrears Pct, Approved Lost MTD, Active Brokers, Funding Available New Approvals.

Conventions: rates and percentages as decimals (0.06 = 6%). Currency in AUD whole dollars.

## Tableau

Site: Propell production. Retrieval: query-datasource (VizQL) only.

| Datasource | LUID | Carries |
| --- | --- | --- |
| Case with Reference Date For Pipeline | `dea7a483-76e0-48ba-a7fc-ddc211ac60eb` | Case spine: new / approved / funded / lost / conversions / WA rate / brokers / awaiting completion |
| Arrears Extract Combined | `7c130d9e-c274-43dc-a058-6a29afce1ffc` | Arrears buckets (latest timestamp snapshot) |
| Contract Repayment Schedule With Weekly Forecast | `6fbd653e-8cd8-43c4-9693-d668a9daba1a` | Expected principal / interest, active loans |
| Lending Contract For Pipeline | `23458d56-c01f-432e-8166-e28bcffa973b` | Loan book (supporting) |

Known parameters on the case spine: `Selected Date`, `Date Opened After`.

Known site defect: get-view-data returns scaffold `test,1,1,1` on every worksheet ... prohibited for this pipeline.

Known schema drift (27/07/26): Deal Decision value 'Approved - Conditional' has been removed from the case spine; awaiting completion uses Deal Decision = 'Approved' + Deal Status = 'In Progress' (definition lives in the manifest). 'Days Since Approval Group' returns 'Other' via VizQL ... aging comes from the pack's Awaiting Completion detail table, not this field.

Known extraction notes (updated 28/07/26, per Ken/Neal):
- **Approved lost ... RESOLVED (27/07).** The built-in measure `Amount Approved: Lost` is Cancelled-only and sums drawdown (Amount Approved = Drawdown_Amount__c) ... never use it. Pack basis, confirmed: SUM(Total Loan Amount) where Deal Decision = 'Approved' AND Deal Status IN ('Cancelled', 'Expired'), Approved Lost Date in period, all reasons including Unknown. Definition lives in the manifest; verify reproduction on next run.
- **WA interest rate ... RESOLVED (28/07).** The pack-side calc was the error; Neal fixed it and added a tooltip showing the cases behind the calculation. The extraction formula is authoritative (definition in the manifest). Floor-flag suspension lifted. Verify against the fixed tooltip on next run.
- **Funded definition (28/07).** Canonical form is two conditions: Deal Status = 'Funded' AND Deal Decision = 'Approved'. The loans this excludes are hardship restructured loans, which never have a Deal Decision set ... correct exclusions by design, not data errors. The Deal Decision condition and the Refinance Reason != Hardship filter are structurally equivalent for this population; keep both for robustness.

## Source of truth hierarchy

1. **Metric definitions, targets, flag rules:** Notion Context page (manifest section). Always current; this file never duplicates them.
2. **System locations:** this file.
3. If this file and live Notion/Tableau structure disagree, halt and report the mismatch.

## Weekly cadence reference

Week ending = Sunday. Weeks run Mon–Sun AEST. Standard run day: Monday after Tableau refresh, targeting the just-ended week.
