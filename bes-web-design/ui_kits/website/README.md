# BPC Website — UI Kit

A high-fidelity recreation of the Bespoke Property Concierge marketing homepage, composed from the design system's own components (`Logo`, `Button`, `Eyebrow`, `Card`, `Tag`, `Input`, `Textarea`, `Select`).

> **Note on sources.** No production web codebase was provided for BPC. This kit is built from the brand guidelines, the approved holding page, and the brand asset inventory — it represents the brand faithfully but is not a copy of a shipped site. If/when the real `bespoke-website` repo is attached, reconcile against it.

## Files
- `index.html` — loads React + the compiled DS bundle, mounts the page. Also tagged as a **Starting Point**.
- `sections.jsx` — all page sections (`Nav`, `Hero`, `Intro`, `ServiceGrid`, `QuoteBlock`, `Residences`, `CTASection`, `EnquiryModal`, `Footer`) plus the `App` shell.

## Interactions
- Nav is transparent over the hero and turns to a frosted pastel bar on scroll; the logo + CTA invert accordingly.
- "Enquire" / "Request an introduction" open a working **enquiry modal** (name · email · location · notes) that confirms on submit.
- Residence cards and nav links use the BPC hover vocabulary (hairline → charcoal border; links fade to 60%).

## How it composes the system
Layout sections use inline styles against the CSS custom properties; every interactive primitive is a real DS component pulled from `window.DesignSystem_ec4586`. Edit a token in `tokens/` and this kit reflects it.
