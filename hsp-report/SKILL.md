---
name: hsp-report
description: Generate the two client-facing Home Stewardship Plan (HSP) deliverables — a branded Word document and a glossy PDF — from a raw SafetyCulture Home Safety Assessment (HSA) export. Use whenever an operator needs to turn a completed HSA into a client-ready HSP.
---

# HSP Report Generator

Turn a raw SafetyCulture **Home Safety Assessment (HSA)** export into the two
client-facing **Home Stewardship Plan (HSP)** deliverables for Bespoke Property
Concierge:

1. a clean, **branded Word document** (`HSP-<address-slug>.docx`), and
2. a **glossy, magazine-style PDF** (`HSP-<address-slug>-glossy.pdf`).

The HSA is the internal field capture and is **never exposed to the client**.
This skill performs the synthesis: classify every assessed element, rewrite it
into calm, premium language, and lay it out to brand.

## When to use
An operator has a completed HSA Word export and needs the client-ready HSP. The
skill is self-contained: all fonts, the logo, and fallback imagery are bundled.

---

## Synthesis rules

- **Input**: an HSA Word export from SafetyCulture (raw inspection findings,
  photos, checklist responses). It is internal-only.
- **Classify** every assessed element into one of three states:
  `satisfactory`, `recommended-work`, or `monitor`.
- **Bucket** each `recommended-work` item into exactly one of the three HSP
  sections (ADR-008):
  - **Essential Repairs** — immediate safety or repair items.
  - **Programmed Maintenance Schedule** — ongoing, preventive, scheduled care.
  - **Enhancement Plan** — client-driven capital improvements.
- **Rewrite** all client-facing text into calm, premium, non-alarming language.
  Never reproduce raw inspector notes, defect codes, or technical jargon. Never
  expose the raw HSA to the client.
- **No pricing** in the HSP — pricing lives in Simpro quotes. Each item carries
  a short title, a plain-language description, a one-line "why it matters", and
  an indicative priority (shown as `By quotation`).
- The HSP is **not client-ready** until all three sections plus the satisfactory
  summary and monitor list are populated. A section may legitimately be empty,
  but the generator still renders its heading and a "No items at this time."
  note.

How the SafetyCulture export maps in (the parser keys off the per-category
`Item | Response | Priority` tables):

| HSA `Response`     | HSP state          |
|--------------------|--------------------|
| Satisfactory       | `satisfactory`     |
| Action required    | `recommended-work` |
| Monitor            | `monitor`          |
| Not present / N/A  | assessed, uncounted |

| HSA `Priority` (on an action item) | HSP section                    |
|------------------------------------|--------------------------------|
| Immediate                          | Essential Repairs              |
| Programmed                         | Programmed Maintenance Schedule |
| Enhancement                        | Enhancement Plan               |

`parse_hsa.py` does a deterministic first pass (classification, bucketing, and
calm template copy). When running the skill, **review the JSON and refine the
per-item copy** for the specific property before generating — the templates are
a premium starting point, not the final word. Cross-referenced items (e.g. a
pool-barrier item appearing in both §8 and §18) are consolidated.

---

## Document structure (both formats)

Cover (logo, property address, client name, date) → Overview letter → Property
at a glance (counts: elements assessed / satisfactory / recommended / monitor) →
Essential Repairs → Programmed Maintenance Schedule → Enhancement Plan → Items
to Monitor → Closing (logo, contact line).

## Brand tokens

- **Palette**: charcoal `#181818`, pastel `#F9F8F7`, latte `#987F6A`, oat `#D9D1C7`.
- **Display font**: Aviano Serif Light, letter-spacing/kerning `-130` (i.e.
  `-0.130em`, per brand guideline). **Body font**: Familjen Grotesk.
- **Cover and closing pages**: charcoal background, white logo lockup.
- **Light content pages**: pastel background, charcoal logo.
- **Glossy section openers**: full-colour architectural photography with a ~30%
  charcoal overlay.

## Runtime inputs

- The HSA Word export (**required**).
- An **optional** folder of property photos for the glossy hero shots; if
  absent, the glossy falls back to `assets/imagery/`.
- Property/client metadata (address, client name, concierge, date) — parsed
  from the HSA where present, otherwise supplied by the operator via the
  `--address / --client / --concierge / --date / --period` flags on
  `parse_hsa.py`.

---

## Usage

```bash
cd hsp-report

# 1. Parse the HSA export into the intermediate JSON (review/refine the copy).
python3 generators/parse_hsa.py path/to/HSA.docx > /tmp/hsp.json
#   ...optionally override metadata not present in the export:
#   python3 generators/parse_hsa.py path/to/HSA.docx --client "Jane Doe" --date "11 June 2026" > /tmp/hsp.json

# 2a. Build the branded Word document.
python3 generators/build_docx.py /tmp/hsp.json            # -> HSP-<slug>.docx

# 2b. Build the glossy PDF (optionally pass property photos for the openers).
python3 generators/build_glossy.py /tmp/hsp.json          # -> HSP-<slug>-glossy.pdf (+ .html)
#   python3 generators/build_glossy.py /tmp/hsp.json --photos path/to/property-photos/
```

Outputs land in the current directory (or `--out DIR`). Use `--out` to direct
them wherever the operator collates client deliverables.

**Dependencies** (`pip install -r generators/requirements.txt --break-system-packages`):
`python-docx`, `weasyprint`, `cairosvg`, `Pillow`, `fontTools`.

**PDF fallback**: `build_glossy.py` always writes the standalone
`HSP-<slug>-glossy.html` alongside the PDF. If WeasyPrint cannot render in the
environment, open that HTML in Chrome and *Print → Save as PDF* (A4, margins
none, background graphics on).

**One-off asset prep**: `generators/prepare_assets.py` recolours the source
logo SVG to true white and charcoal and rasterises the PNGs the Word generator
needs. The committed assets are already prepared; re-run only if the source
logo changes.

A reference build for the Site 8 fixture is committed under
`fixtures/expected-output/`.

---

## Assets (resolved sources)

All assets are bundled inside `hsp-report/` so the skill is self-contained.

- **Fonts** (`assets/fonts/`):
  - `AvianoSerif-Light.otf`, `AvianoSerif-Regular.otf` — copied from
    `bespoke-website-main/assets/fonts/`.
  - `FamiljenGrotesk-400/500/600/700.ttf` — static regular / medium / semibold /
    bold weights from the Fontsource CDN
    (`cdn.jsdelivr.net/fontsource/fonts/familjen-grotesk@latest`, ex
    [Google Fonts](https://fonts.google.com/specimen/Familjen+Grotesk)).
- **Brand** (`assets/brand/`):
  - `BPC_HORIZONTALLOGO_WHITE.svg` / `BPC_HORIZONTALLOGO_CHARCOAL.svg` — the
    horizontal lockup from `bespoke-website-main/assets/logos/` (the source
    file's `.cls-1` class was undefined, so `prepare_assets.py` injects the
    white `#FFFFFF` and charcoal `#181818` fills).
  - `logo-white.png` / `logo-charcoal.png` — rasters of the above (python-docx
    cannot embed SVG).
- **Imagery** (`assets/imagery/`): six full-colour architectural brand photos
  from the Bespoke brand IMAGEBOARD
  (`iCloud .../Brand/BRAND GUIDELINES/BRANDGUIDELINES/IMAGEBOARD`), downscaled to
  ≤2200px for print. Used as fallback glossy section-opener stock.

## Fixture

`fixtures/site8-hsa.docx` is the **real** Site 8 alpha HSA export
(`BPC_HSA_Sample_Site8.docx`, 15 Annie Street, Hamilton QLD). Its shape:
**126 elements assessed, 81 satisfactory, 23 action items (10 Immediate, 13
Programmed, 0 Enhancement → consolidated to 19 distinct works), 15 monitor, 7
N/A.** The worked figures above are illustrative of this sample, not a claim
about any client's home.

## Files

```
hsp-report/
  SKILL.md
  assets/{fonts,brand,imagery}/        # bundled, self-contained
  generators/
    hsp_common.py                      # brand tokens, paths, section defs, copy library
    parse_hsa.py                       # HSA .docx -> intermediate JSON
    build_docx.py                      # JSON -> branded .docx (fonts embedded)
    build_glossy.py                    # JSON -> glossy .pdf (+ .html fallback)
    font_embed.py                      # OOXML obfuscated-font embedding
    prepare_assets.py                  # one-off logo recolour + rasterise
    requirements.txt
  fixtures/
    site8-hsa.docx                     # real Site 8 HSA export
    expected-output/                   # committed reference build
```
