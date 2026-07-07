**BPC Logo** — renders an official BPC logo asset (never recreate the mark). Choose the lockup and colourway; set `basePath` to wherever `assets/logos` sits relative to your page.

```jsx
<Logo variant="horizontal" color="white" height={36} basePath="../../assets/logos" />
<Logo variant="iso" color="black" height={40} />
```

Variants: `lockup` (stacked combination mark) · `horizontal` (thin headers/footers) · `iso` (the script "B" monogram alone) · `textmark` (type only) · `box` (icon-in-box). Colours: `black` / `white` (primary) and `db` / `lb` / `o` (secondary brown palette — lockup & iso only).

Rules: never place a dark variant on a dark background (use `white`), never stretch, never drop-shadow. The iso "B" is a logo, not a decorative icon — use at brand moments only.
