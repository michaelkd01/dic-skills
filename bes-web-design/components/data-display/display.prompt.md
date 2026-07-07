**BPC display primitives** — `Eyebrow` and `Tag`.

`Eyebrow` is the all-caps tracked label that sits above almost every BPC headline and marks sections. Reach for it constantly.

```jsx
<Eyebrow>No two homes are the same</Eyebrow>
<Eyebrow tone="inverse">Our philosophy</Eyebrow>
```

`Tag` is a quiet status/category chip — pills are the only place BPC uses full rounding. Use it sparingly (status, category, a small image-corner marker).

```jsx
<Tag>In practice</Tag>
<Tag variant="solid">Oat</Tag>
<Tag variant="dark">By invitation</Tag>
```

Tones for Eyebrow: `muted` (default), `strong`, `inverse` (on charcoal). Never use color-tinted icon chips or emoji here.
