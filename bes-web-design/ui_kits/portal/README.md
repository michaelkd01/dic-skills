# BPC Portal — UI Kit (Application mode)

The Application-mode counterpart to `ui_kits/website/`. A logged-in client-portal screen composed from the design system's own components (`Logo`, `Select`, `Button`, `Card`, `Tag`, `Eyebrow`), grounded in the Site 8 dataset.

> **Mode.** This is the reference for **Application** surfaces (portal, dashboards, any logged-in view) — see the Modes section in `SKILL.md`. Familjen Grotesk throughout, hairline surfaces, tracked eyebrows, `Tag` status pills, solid nav, dense-but-calm. Deliberately no Aviano display type and no full-bleed imagery — that vocabulary belongs to Promotional mode.

## Files
- `index.html` — loads React + the compiled DS bundle, mounts the page. Tagged as a **Starting Point**.
- `portal.jsx` — the portal screen: `PortalNav` (solid bar + property switcher), `PageHead`, `StatStrip`, `ActionPlan` (the three HSP tiers), `QuoteApproval` (with a working approve → authorised state and the QBCC over-$20,000 disclosure), `Activity` feed, `PortalFooter`.

## What it demonstrates
- **Action-plan tier grouping** — Essential / Programmed / Enhancements, the structure behind a Home Stewardship Plan.
- **Quote approval as a recommendation, not an invoice** — recommendation-led hierarchy (scope before money), one inclusive figure stated once, the Approve · Ask your concierge · Not now decision triad, the over-$20,000 QBCC disclosure kept small at the edge, and an interactive approve state.
- **Concierge-panel activity** — the push-notification vocabulary ("subcontractor on site") as a calm feed.
- **Application-mode density** — KPI strip, hairline item rows, status as `Tag` not colour, tabular numerals.

## How it composes the system
Layout uses inline styles against the `--bpc-*` custom properties; every primitive is a real DS component from `window.BPCDesignSystem_ec4586`. Edit a token in `tokens/` and this kit reflects it. The sample data (15 Annie Street, quotes 12349–12353) is illustrative — swap for live Simpro data when wiring the real portal.
