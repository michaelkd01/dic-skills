---
name: bes-web-design
description: Use this skill to generate well-branded interfaces and assets for Bespoke Property Concierge (BPC), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

Bespoke Property Concierge (BPC) is a luxury residential property-management / concierge brand. The system is built on quiet sophistication: a charcoal-and-white core palette, a secondary warm-brown palette (Espresso / Latte / Oat), Familjen Grotesk as the workhorse type, Aviano Serif (unicase) as the large display statement, a hand-drawn "B" monogram, hard edges, restrained shadows, and warm natural-light photography. No emoji, ever.

**Where things live**
- `styles.css` — the single global CSS entry point; link it and use the `--bpc-*` custom properties for all colour, type, spacing, and motion.
- `tokens/` — the token source (colors, typography, spacing, fonts).
- `components/` — React primitives: `Button`, `Input`, `Textarea`, `Select`, `Card`, `Eyebrow`, `Tag`, `Logo`. Each has a `.prompt.md` with a usage example.
- `assets/` — official logos (use the `Logo` component), favicons, reference imagery.
- `ui_kits/website/` — a full marketing-homepage recreation to copy patterns from (Promotional mode).
- `ui_kits/portal/` — an Application-mode client-portal screen (property dashboard, action-plan tiers, quote approval) to copy patterns from.
- `preview/` — foundation specimen cards.

**Modes**
Every surface is one of two modes. Decide by what the surface is _for_, then apply that mode's defaults on top of the shared brand spine. The spine (colour, type families, spacing grid, logo, hard rules) never changes between modes ... only emphasis, density, and component mix do. Never fork or duplicate the spine per mode.

- **Promotional** ... the marketing site, landing pages, holding pages, pitch surfaces. Goal: convey luxury and convert enquiries. Aviano Serif display headlines (large, uppercase, kerned), full-bleed warm photography, generous whitespace (64–128px section stacks), asymmetric letterhead layouts, a transparent-on-hero nav that solidifies on scroll, sparse interactivity. Exemplar: `ui_kits/website/`.
- **Application** ... the client portal, dashboards, any logged-in surface. Goal: clarity, transparency, trust through function. Familjen Grotesk throughout; reserve Aviano for the occasional page title, never for data or labels. Dense but calm: hairline cards (radius 0–4px, no shadow jump), tracked eyebrows as section markers, `Tag` pills for status, and the full set of interactive states (default / hover / active / disabled, plus loading, empty, and error). Solid top nav always (no transparent-hero treatment). Tables, status, and feeds over imagery. Restrained motion (160–240ms). Exemplar: `ui_kits/portal/`.

When a surface is ambiguous (a logged-in landing, a billing summary), default to Application ... function wins once the client is inside.

**Decision surfaces** (Application mode ... approvals, action-plan items, anything the client acts on)
Lead with the recommendation, not the money. Order: plain-language recommendation → urgency/tier → what's involved (the advisory scope) → the figure stated **once**, large, framed inclusive of materials and concierge fee (never a bare "ex GST" line) → the decision → provenance and status small, at the edges. Offer a real decision triad ... Approve · Ask your concierge · Not now ... never a non-decision like "Back". Let layout flex with content density: a single recommendation shows one number and one decision with no subtotals or tier scaffolding; tier grouping (essential / programmed / improvement) only switches on when the structure is genuinely multi-category. Build the invoice skeleton only when there is an invoice to show.

**How to work**
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need. Honour the brand's hard rules: sentence-case body copy, all-caps tracked eyebrows, never combine charcoal AND espresso as the dark, never stretch or drop-shadow the logo, no emoji, no purple gradients.
