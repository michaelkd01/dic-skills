#!/usr/bin/env python3
"""Build the glossy, magazine-style Home Stewardship Plan PDF from parsed HSP
JSON.

    python3 generators/build_glossy.py /tmp/hsp.json [--out DIR] [--photos DIR]

Renders an image-led HTML+CSS template (bundled brand fonts, full-bleed
architectural photography on section openers with a ~30% charcoal overlay,
findings as elegant data spreads) to HSP-<address-slug>-glossy.pdf via
WeasyPrint. The standalone HTML is always written alongside the PDF so an
operator can print to PDF from Chrome if WeasyPrint cannot render in the
environment.

An optional --photos DIR supplies property hero shots; absent that, the bundled
brand imagery in assets/imagery/ is used.
"""
import argparse
import html
import json
from pathlib import Path

import hsp_common as hc

FALLBACK_IMAGES = [
    "drake-TWbpI0JTgRU-unsplash.jpg",
    "alef-morais.jpg",
    "HouseImg_JLeung_Unsplash.jpg",
    "rhemakallianpur.jpg",
    "QL.jpg",
    "JaneDain.jpg",
]


def uri(path: Path) -> str:
    return Path(path).resolve().as_uri()


def esc(s) -> str:
    return html.escape(str(s or ""))


def gather_photos(photos_dir):
    """Return a list of file URIs for section-opener imagery."""
    imgs = []
    if photos_dir:
        p = Path(photos_dir)
        if p.is_dir():
            for f in sorted(p.iterdir()):
                if f.suffix.lower() in (".jpg", ".jpeg", ".png"):
                    imgs.append(uri(f))
    if not imgs:
        imgs = [uri(hc.IMAGERY / n) for n in FALLBACK_IMAGES if (hc.IMAGERY / n).exists()]
    if not imgs:  # last resort: any image in the bundle
        imgs = [uri(f) for f in sorted(hc.IMAGERY.glob("*.jpg"))]
    return imgs


def css(font_uris):
    return f"""
@font-face {{ font-family:'Aviano Serif'; src:url('{font_uris["aviano_light"]}'); font-weight:300; }}
@font-face {{ font-family:'Familjen Grotesk'; src:url('{font_uris["familjen_400"]}'); font-weight:400; }}
@font-face {{ font-family:'Familjen Grotesk'; src:url('{font_uris["familjen_500"]}'); font-weight:500; }}
@font-face {{ font-family:'Familjen Grotesk'; src:url('{font_uris["familjen_600"]}'); font-weight:600; }}
@font-face {{ font-family:'Familjen Grotesk'; src:url('{font_uris["familjen_700"]}'); font-weight:700; }}

@page {{ size: A4; margin: 0; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html {{ font-family:'Familjen Grotesk', sans-serif; color:{hc.CHARCOAL}; }}

.page {{ position:relative; width:210mm; height:297mm; overflow:hidden;
        page-break-after:always; background:{hc.PASTEL}; }}
.page:last-child {{ page-break-after:auto; }}

.display {{ font-family:'Aviano Serif'; font-weight:300; letter-spacing:-0.130em; line-height:1.08; }}
.kicker {{ font-weight:600; letter-spacing:0.22em; text-transform:uppercase; font-size:8.5pt; color:{hc.LATTE}; }}
.body {{ font-size:10.5pt; line-height:1.6; }}

/* --- charcoal cover / closing --- */
.charcoal {{ background:{hc.CHARCOAL}; color:#fff; }}
.charcoal .kicker {{ color:{hc.OAT}; }}
.cover-inner {{ position:absolute; top:50%; left:24mm; right:24mm;
                transform:translateY(-50%); text-align:center; }}
.cover-logo {{ width:84mm; margin:0 auto 16mm; display:block; }}
.cover-title {{ font-size:30pt; color:#fff; margin:6mm 0 8mm; }}
.cover-meta {{ font-size:11pt; color:{hc.OAT}; line-height:1.9; }}
.rule {{ width:40mm; height:1px; background:{hc.LATTE}; margin:8mm auto; border:0; }}

/* --- content frame --- */
.content {{ padding:22mm 24mm; }}
.brandbar {{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14mm; }}
.brandbar img {{ height:9mm; }}
.brandbar .addr {{ font-size:8.5pt; color:{hc.LATTE}; letter-spacing:0.04em; text-align:right; }}
.h-display {{ font-size:26pt; margin:3mm 0 6mm; }}
.lead {{ font-size:11pt; line-height:1.7; margin-bottom:5mm; }}
.sig {{ font-weight:600; margin-top:7mm; }}
.sig-sub {{ color:{hc.LATTE}; font-size:9.5pt; }}

/* --- at a glance --- */
.stats {{ display:flex; gap:5mm; margin:8mm 0; }}
.stat {{ flex:1; background:#fff; border:1px solid {hc.OAT}; border-radius:2mm;
         padding:7mm 4mm; text-align:center; }}
.stat .num {{ font-family:'Aviano Serif'; font-weight:300; letter-spacing:-0.06em; font-size:34pt; }}
.stat .lbl {{ font-size:8.5pt; color:{hc.LATTE}; margin-top:2mm; line-height:1.3; }}

/* --- section opener (photo + charcoal overlay) --- */
.opener {{ position:relative; color:#fff; }}
.opener .bg {{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }}
.opener .veil {{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(24,24,24,0.30) 0%, rgba(24,24,24,0.30) 55%, rgba(24,24,24,0.66) 100%); }}
.opener .cap {{ position:absolute; left:24mm; right:24mm; bottom:26mm; }}
.opener .num {{ font-family:'Aviano Serif'; font-weight:300; letter-spacing:-0.04em;
                font-size:16pt; color:{hc.OAT}; }}
.opener .ttl {{ font-family:'Aviano Serif'; font-weight:300; letter-spacing:-0.130em;
                font-size:38pt; margin:3mm 0 4mm; }}
.opener .blurb {{ font-size:11.5pt; line-height:1.6; max-width:130mm; color:#f3efeb; }}
.opener .kicker {{ color:{hc.OAT}; }}

/* --- item spreads --- */
.items {{ padding:20mm 24mm; }}
.items-head {{ display:flex; align-items:baseline; justify-content:space-between;
               border-bottom:1px solid {hc.OAT}; padding-bottom:4mm; margin-bottom:6mm; }}
.items-head .h {{ font-family:'Aviano Serif'; font-weight:300; letter-spacing:-0.130em; font-size:20pt; }}
.item {{ break-inside:avoid; padding:5mm 0; border-bottom:1px solid #ece7e1; }}
.item:last-child {{ border-bottom:0; }}
.item .top {{ display:flex; align-items:baseline; justify-content:space-between; }}
.item .name {{ font-weight:600; font-size:12.5pt; }}
.item .tag {{ font-size:8pt; font-weight:600; letter-spacing:0.12em; text-transform:uppercase;
              color:{hc.LATTE}; white-space:nowrap; padding-left:6mm; }}
.item .desc {{ font-size:10.5pt; line-height:1.55; margin-top:2mm; }}
.item .why {{ font-size:9.5pt; color:{hc.LATTE}; margin-top:2mm; }}
.item .why b {{ font-weight:600; letter-spacing:0.1em; text-transform:uppercase; font-size:8pt; }}
.empty {{ color:{hc.LATTE}; font-size:11pt; padding:6mm 0; }}
.note {{ color:{hc.LATTE}; font-size:9.5pt; margin-top:10mm; }}
"""


def opener_page(num, title, blurb, kicker, img_uri):
    return f"""
<div class="page opener">
  <img class="bg" src="{img_uri}">
  <div class="veil"></div>
  <div class="cap">
    <div class="kicker">{esc(kicker)}</div>
    <div class="num">{esc(num)}</div>
    <div class="ttl">{esc(title)}</div>
    <div class="blurb">{esc(blurb)}</div>
  </div>
</div>"""


def items_page(heading, items, monitor=False):
    rows = []
    if not items:
        rows.append(f'<div class="empty">{esc(hc.EMPTY_SECTION_NOTE)}</div>')
    for it in items:
        if monitor:
            tag = esc(it.get("priority", "Monitor"))
        else:
            tag = esc(it.get("priority", "")) + " &nbsp;·&nbsp; " + esc(it.get("indicative_cost", "By quotation"))
        why = ""
        if it.get("why_it_matters"):
            why = f'<div class="why"><b>Why it matters</b> &nbsp; {esc(it["why_it_matters"])}</div>'
        rows.append(f"""
    <div class="item">
      <div class="top"><span class="name">{esc(it["title"])}</span><span class="tag">{tag}</span></div>
      <div class="desc">{esc(it["description"])}</div>
      {why}
    </div>""")
    return f"""
<div class="page">
  <div class="items">
    <div class="items-head"><span class="h">{esc(heading)}</span>
      <span class="kicker">Home Stewardship Plan</span></div>
    {''.join(rows)}
  </div>
</div>"""


def build_html(data, photos):
    meta = data["metadata"]
    counts = data["counts"]
    font_uris = {k: uri(v) for k, v in hc.FONT_FILES.items()}

    def photo(i):
        return photos[i % len(photos)] if photos else ""

    pages = []

    # 1. Cover (charcoal)
    period = esc(meta.get("plan_period") or "Annual assessment")
    cover_meta = []
    if meta.get("client_name"):
        cover_meta.append(f'Prepared for {esc(meta["client_name"])}')
    if meta.get("date"):
        cover_meta.append(f'Assessed {esc(meta["date"])}')
    if meta.get("concierge"):
        cover_meta.append(f'Your Concierge · {esc(meta["concierge"])}')
    pages.append(f"""
<div class="page charcoal">
  <div class="cover-inner">
    <img class="cover-logo" src="{uri(hc.LOGO_WHITE_PNG)}">
    <div class="kicker">Home Stewardship Plan</div>
    <div class="display cover-title">{esc(meta.get("property_address",""))}</div>
    <hr class="rule">
    <div class="cover-meta">{'<br>'.join(cover_meta)}</div>
  </div>
</div>""")

    # 2. Overview letter + at a glance (content)
    letter = "".join(f"<p class='lead'>{esc(b.strip())}</p>"
                     for b in data["overview_letter"].split("\n\n"))
    sig = ""
    if meta.get("concierge"):
        sig = (f'<div class="sig">{esc(meta["concierge"])}</div>'
               f'<div class="sig-sub">Your Concierge, Bespoke Property Concierge</div>')
    stats = "".join(
        f'<div class="stat"><div class="num">{counts[k]}</div><div class="lbl">{lbl}</div></div>'
        for k, lbl in [("assessed", "elements assessed"),
                       ("satisfactory", "in satisfactory condition"),
                       ("recommended", "works recommended"),
                       ("monitor", "items to monitor")]
    )
    pages.append(f"""
<div class="page">
  <div class="content">
    <div class="brandbar"><img src="{uri(hc.LOGO_CHARCOAL_PNG)}">
      <div class="addr">{esc(meta.get("property_address",""))}<br>{period}</div></div>
    <div class="kicker">Introduction</div>
    <div class="display h-display">Your Home Stewardship Plan</div>
    {letter}
    {sig}
    <div class="stats">{stats}</div>
    <p class="body">{esc(data["satisfactory_summary"])}</p>
  </div>
</div>""")

    # 3-5. Recommendation sections (opener photo + items)
    for i, sec in enumerate(hc.SECTIONS):
        items = data["sections"].get(sec["key"], [])
        pages.append(opener_page(f"{i+1:02d}", sec["title"], sec["blurb"],
                                 "Recommended works", photo(i)))
        pages.append(items_page(sec["title"], items))

    # 6. Items to monitor
    pages.append(opener_page("04", "Items to Monitor",
                             "These items need no action today. We note them so nothing "
                             "escapes attention, and review each at your next assessment.",
                             "Under watch", photo(3)))
    pages.append(items_page("Items to Monitor", data["monitor_items"], monitor=True))

    # 7. Closing (charcoal)
    pages.append(f"""
<div class="page charcoal">
  <div class="cover-inner">
    <img class="cover-logo" src="{uri(hc.LOGO_WHITE_PNG)}">
    <div class="kicker">Your Concierge</div>
    <div class="display cover-title">Your home is in<br>careful hands.</div>
    <hr class="rule">
    <div class="cover-meta">{esc(hc.CONTACT_LINE)}<br>
      Meticulous care for homes that deserve perfection.</div>
  </div>
</div>""")

    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>{css(font_uris)}</style></head><body>{''.join(pages)}</body></html>"""


def build(data, out_dir):
    slug = data["metadata"].get("address_slug") or "property"
    out_dir = Path(out_dir)
    html_path = out_dir / f"HSP-{slug}-glossy.html"
    pdf_path = out_dir / f"HSP-{slug}-glossy.pdf"

    photos = gather_photos(None)
    doc_html = build_html(data, photos)
    html_path.write_text(doc_html, encoding="utf-8")

    pdf_ok = False
    try:
        from weasyprint import HTML
        HTML(string=doc_html, base_url=str(hc.SKILL_ROOT)).write_pdf(str(pdf_path))
        pdf_ok = True
    except Exception as exc:  # pragma: no cover
        print(f"[warn] WeasyPrint could not render ({exc}).")
        print(f"       Standalone HTML written to {html_path} — open in Chrome and "
              f"print to PDF as a fallback.")
    return pdf_path if pdf_ok else None, html_path


def main():
    ap = argparse.ArgumentParser(description="Build the glossy HSP PDF")
    ap.add_argument("json", help="parsed HSP JSON (from parse_hsa.py)")
    ap.add_argument("--out", default=".", help="output directory")
    ap.add_argument("--photos", default=None, help="optional folder of property photos")
    args = ap.parse_args()
    data = json.load(open(args.json, encoding="utf-8"))
    if args.photos:
        # rebuild html with operator-supplied photos
        photos = gather_photos(args.photos)
        slug = data["metadata"].get("address_slug") or "property"
        out_dir = Path(args.out)
        html_path = out_dir / f"HSP-{slug}-glossy.html"
        pdf_path = out_dir / f"HSP-{slug}-glossy.pdf"
        doc_html = build_html(data, photos)
        html_path.write_text(doc_html, encoding="utf-8")
        try:
            from weasyprint import HTML
            HTML(string=doc_html, base_url=str(hc.SKILL_ROOT)).write_pdf(str(pdf_path))
            print(f"Wrote {pdf_path}")
        except Exception as exc:
            print(f"[warn] WeasyPrint could not render ({exc}); HTML at {html_path}")
        print(f"Wrote {html_path}")
        return
    pdf_path, html_path = build(data, args.out)
    if pdf_path:
        print(f"Wrote {pdf_path}")
    print(f"Wrote {html_path}")


if __name__ == "__main__":
    main()
