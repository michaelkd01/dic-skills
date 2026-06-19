#!/usr/bin/env python3
"""Prepare brand logo assets for the HSP generators.

The source horizontal-lockup SVG (copied from bespoke-website-main) ships with an
undefined `.cls-1` class, so it renders black by default and the supplied
"WHITE"/"BLACK" files are byte-identical. This one-off build step injects the
brand fill colours and produces:

  assets/brand/BPC_HORIZONTALLOGO_WHITE.svg     (fill #FFFFFF)
  assets/brand/BPC_HORIZONTALLOGO_CHARCOAL.svg  (fill #181818)
  assets/brand/logo-white.png                   (raster, for charcoal pages)
  assets/brand/logo-charcoal.png                (raster, for light pages)

PNGs are required because python-docx cannot embed SVG. Run from the skill root:
    python3 generators/prepare_assets.py
"""
import re
from pathlib import Path

import cairosvg

BRAND = Path(__file__).resolve().parent.parent / "assets" / "brand"
SOURCE = BRAND / "BPC_HORIZONTALLOGO_WHITE.svg"  # source lockup (black by default)

WHITE = "#FFFFFF"
CHARCOAL = "#181818"
PNG_WIDTH = 1500  # viewBox is 500x150 -> 3x for crisp print


def recolour(svg_text: str, fill: str) -> str:
    """Force every path fill to `fill` by defining the .cls-1 class."""
    style = f"<style>.cls-1{{fill:{fill} !important;}}</style>"
    if "<defs>" in svg_text:
        return svg_text.replace("<defs>", "<defs>\n    " + style, 1)
    return re.sub(r"(<svg[^>]*>)", r"\1\n  " + style, svg_text, count=1)


def main() -> None:
    src = SOURCE.read_text()

    white_svg = recolour(src, WHITE)
    charcoal_svg = recolour(src, CHARCOAL)

    (BRAND / "BPC_HORIZONTALLOGO_WHITE.svg").write_text(white_svg)
    (BRAND / "BPC_HORIZONTALLOGO_CHARCOAL.svg").write_text(charcoal_svg)

    cairosvg.svg2png(
        bytestring=white_svg.encode(),
        write_to=str(BRAND / "logo-white.png"),
        output_width=PNG_WIDTH,
    )
    cairosvg.svg2png(
        bytestring=charcoal_svg.encode(),
        write_to=str(BRAND / "logo-charcoal.png"),
        output_width=PNG_WIDTH,
    )
    print("Wrote: BPC_HORIZONTALLOGO_WHITE.svg, BPC_HORIZONTALLOGO_CHARCOAL.svg, "
          "logo-white.png, logo-charcoal.png")


if __name__ == "__main__":
    main()
