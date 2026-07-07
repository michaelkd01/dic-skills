# Bespoke Property Concierge — Design System

> Tailored stewardship for prestige homes.

Bespoke Property Concierge (BPC) provides bespoke, proactive management for luxury residences — a dedicated Concierge backed by an expert team, a trusted panel of subcontractors, and a proprietary technology platform. BPC brings tailored stewardship to premium, high-value residential homes through careful oversight of maintenance, improvements, and long-term care.

The brand is defined by three pillars: **Quality**, **Human-centred**, **Exclusive** — expressed through restrained typography, a signature charcoal-and-white core palette, a secondary warm-brown palette (Espresso / Latte / Oat), and a hand-drawn cursive "B" monogram that embodies the personalisation at the heart of the service.

---

## Sources

- **Brand Guidelines PDF** — `BRANDGUIDELINES_BPC_FA.pdf` (20 pages, Final Approved, Mar 2026). Extracted text was the basis for tone + visual rules below.
- **Brand Asset Inventory** — developer-handover inventory of every logo / favicon / collateral file and its intended use.
- **Logo / SVG assets** — `assets/logos/` and `assets/favicons/`.
- **Font files** — Familjen Grotesk (variable) + Aviano Serif (Light/Regular/Bold/Black) in `fonts/`.
- **Reference imagery** — `assets/imagery/` (warm, natural-light residential + lifestyle photography).
- **Holding page** — `BPC Holding Page.html`, the approved single-page prototype.
- **No production web codebase** was provided. The website UI kit is therefore a faithful brand recreation, not a copy of shipped code (see CAVEATS).

---

## CONTENT FUNDAMENTALS

**Voice.** BPC speaks like a discreet, long-trusted family steward — confident without being loud, warm without being casual. It treats the reader as an equal whose time is valuable and whose standards are high. It never oversells; restraint does the selling.

**Perspective.** Third-person about the brand ("Bespoke Property Concierge brings tailored stewardship…"); second-person to the homeowner ("what you could be doing with the time freed up by BPC"). Avoid "we" except in a signed letter or testimonial.

**Casing.**
- Body copy: sentence case.
- Display / logomark descriptors: all-caps (Aviano Serif is unicase — `text-transform: uppercase` is correct).
- Section labels / eyebrows: all-caps, generous tracking (~0.18em).
- Never title-case headlines.

**Tone tokens.** *Quiet sophistication. Trust. Heritage. Warmth. Exclusivity. Quality.* Copy should feel letterpressed onto a business card, not splashed on a web banner.

**Sentence rhythm.** Short declarative statements, often fragments. Let whitespace carry the weight:

> *Much like the people who own them, no two homes are the same. Bespoke Property Concierge intends to keep it that way.*

**Do** — service-led nouns ("stewardship", "oversight", "care") over action verbs; pair a factual claim with a human framing; keep headlines under 8 words.

**Don't** — no emoji, ever. No exclamation marks. No "world-class / revolutionary / seamless" startup vocabulary. No all-caps body copy for emphasis (use Familjen Grotesk italic or a weight change). No client-facing abbreviations (spell out "Bespoke Property Concierge" first, then optionally "BPC").

---

## VISUAL FOUNDATIONS

### Type
Two-family system, intentionally restrained:
- **Familjen Grotesk** (variable, 400–700) — the workhorse for ALL body, UI, navigation, buttons, and most headlines.
- **Aviano Serif Light** — unicase display serif, used only as a *statement* typeface for large marketing headlines and in the logo lockup. Needs kerning −130 (≈ `letter-spacing: -0.01em`) and must stay BIG (poor legibility small).

Hierarchy mirrors the logo: **script / display / supporting**.

### Color
- **Primary:** Charcoal `#181818` + White `#FFFFFF` + Pastel `#F9F8F7` (use Pastel over pure white on screen to cut glare).
- **Secondary (warm browns):** Espresso `#3a2f2b`, Latte `#987f6a`, Oat `#d9d1c7`, each with 20/40/60/80% steps.
- **Hard rule:** never combine Charcoal AND Espresso as the dark in one composition. Pick one. Secondary palette is for accents on crossover.

### Backgrounds
Default Pastel or White. Hero / full-bleed = a single high-quality warm photograph (no gradients over imagery, no illustration, no repeating texture). Inverse surfaces use Charcoal, never pure black.

### Imagery
Warm natural light, muted warm cast, subtle (not stylised) grain. Premium residential interiors + architecture, and human-connection moments. Avoid cold blue casts, HDR, heavy grades, stock-office smiles.

### Spacing
4px base grid; whitespace is a brand asset. Page gutters 48–96px desktop; section stacking 64–128px.

### Borders & radii
Hard edges dominate — most cards, buttons, blocks are `border-radius: 0`. Inputs/chips may use 2–4px. Pills (999px) only for tags/status. Hairline borders `1px rgba(24,24,24,0.12)`.

### Shadows & elevation
Restrained. The brand forbids drop-shadowing the logo; extend that to the UI. Elevation comes from whitespace and 1px borders, not heavy shadows. When needed, soft warm-black tints (`--bpc-shadow-*`).

### Animation
Easing `cubic-bezier(0.22,0.61,0.36,1)` standard, `cubic-bezier(0.16,1,0.3,1)` entrances. 160–480ms (240ms default). Fades and slow reveals — no springy physics. Image reveals 480–800ms fade + slight scale (1.02 → 1.0).

### Hover / press
Text links → `opacity: 0.6`. Buttons → invert fill ↔ ground. Cards → hairline border raises to Charcoal (no shadow jump). Press → 96% scale, 160ms.

### Transparency & blur
Sparingly: scrolled header `rgba(249,248,247,0.85)` + `blur(12px)`; hero overlay `rgba(24,24,24,0.25–0.45)` solid tint (not gradient). No glassmorphism decoration, no blurred purple orbs.

### Layout
Fixed top nav (transparent on hero, solid on scroll). Content max-width ~1320px; reading measure ~68ch. Asymmetry welcome (letterhead composition) — never center-stack everything.

### Cards
Flat (default): 1px hairline border, radius 0–4px, white/pastel fill, no shadow. Image-led: image top, hairline bottom edge, Grotesk semibold title, charcoal-60 meta. Elevated (rare): white fill + soft shadow, no border.

---

## ICONOGRAPHY

The brand package ships **no icon font or custom icon set** — guidelines cover logo, type, colour, imagery only. The "B" monogram is the dominant graphic device and is treated with reverence (strict minimum sizes, never stretched, never drop-shadowed).

For UI work, substitute **Lucide** (CDN `https://unpkg.com/lucide@latest/`) — 1.5px stroke, flat/stroked, MIT-licensed. **This is a substitution; flag to the user.** Rules: `currentColor`, 1.5px, 20–24px, no filled glyphs, no colour-tinted icons, no icon-in-circle decoration, never emoji, never Unicode pictographs (★ ✓ →) as icons. The "B" iso mark is a logo, not a decorative icon.

Logo assets live in `assets/logos/` — lockups (`BPC_LOGOLOCKUP_*`), horizontal (`BPC_HORIZONTALLOGO_*`), iso monogram (`BPC_LOGOISO_*`), textmark, box variants, and the DB/LB/O secondary colourways. Use the `Logo` component rather than hand-picking files.

---

## Index — repo layout

```
styles.css            ← GLOBAL CSS ENTRY (consumers link this). @import lines only.
tokens/
  fonts.css           ← @font-face (Familjen Grotesk + Aviano Serif)
  colors.css          ← primary + secondary palettes, semantic fg/bg/border
  typography.css      ← type tokens + element base styles (.bpc-display, h1–h4…)
  spacing.css         ← spacing, radii, borders, elevation, motion, layout
fonts/                ← webfont binaries
assets/
  logos/  favicons/  imagery/
components/
  buttons/      → Button
  forms/        → Input · Textarea · Select
  surfaces/     → Card
  data-display/ → Eyebrow · Tag
  brand/        → Logo
preview/              ← foundation specimen cards (Type / Colors / Spacing / Brand)
ui_kits/website/      ← marketing homepage recreation (+ Starting Point)
BPC Holding Page.html ← approved single-page prototype
README.md  SKILL.md
```

**Components** (all under `window.<Namespace>` once compiled): `Button`, `Input`, `Textarea`, `Select`, `Card`, `Eyebrow`, `Tag`, `Logo`. Each has a `.d.ts` contract, a `.prompt.md` usage note, and a `@dsCard` demo in its directory.

**Starting points:** `Button`, `Card`, and the website homepage screen.

---

## CAVEATS & open questions for the user

1. **No production web codebase** was supplied, so the website UI kit is a brand-faithful recreation rather than a copy of shipped code. If a real repo exists, attach it via the Import menu and I'll reconcile.
2. **Iconography is a substitution** (Lucide). Confirm or send BPC's preferred set.
3. **Font licensing.** Aviano Serif is typically a commercial Adobe/paid license — confirm web-embed rights before deploying the `.otf` binaries publicly.
4. **No sample slide template** was provided, so no `slides/` was generated. Say the word and I'll add one.
5. **Aviano Serif weights** ship as static OTFs (Light / Regular / Bold / Black). Tell me if you need intermediate weights.
