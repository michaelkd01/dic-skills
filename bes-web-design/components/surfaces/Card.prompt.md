**BPC Card** — the flat, hard-edged surface for residences, services, journal entries. Default is a 1px hairline border with no shadow; hover raises the border to charcoal (no shadow jump). Use `variant="image"` with an `image` for property/lifestyle cards.

```jsx
<Card variant="image" image="assets/imagery/QL.jpg"
      eyebrow="Residence" title="Hamilton Hill" meta="Brisbane · Under stewardship since 2024" interactive />

<Card eyebrow="01 — Oversight" title="Proactive maintenance, meticulously planned.">
  Quarterly inspections and a single point of accountability.
</Card>
```

Variants: `flat` (hairline, default) · `image` (image-led, 4:3 top) · `elevated` (rare — soft warm shadow, no border). Set `interactive` for clickable cards. Never give cards rounded corners with a colored left-border accent — that is off-brand.
