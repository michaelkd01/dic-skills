#!/usr/bin/env python3
"""Shared constants and helpers for the HSP generators.

Holds the brand tokens (palette, fonts), asset paths, the three HSP section
definitions (ADR-008), and the client-facing language library that turns raw
assessment categories into calm, premium copy. Both build_docx.py and
build_glossy.py consume the same parsed structure produced by parse_hsa.py, so
all shared vocabulary lives here.
"""
from pathlib import Path

# --- Paths -----------------------------------------------------------------
SKILL_ROOT = Path(__file__).resolve().parent.parent
ASSETS = SKILL_ROOT / "assets"
FONTS = ASSETS / "fonts"
BRAND = ASSETS / "brand"
IMAGERY = ASSETS / "imagery"

# --- Brand tokens (exact values per the brand guideline) -------------------
CHARCOAL = "#181818"
PASTEL = "#F9F8F7"
LATTE = "#987F6A"
OAT = "#D9D1C7"
WHITE = "#FFFFFF"

# Display: Aviano Serif Light, kerning -130 (brand guideline). Body: Familjen Grotesk.
DISPLAY_FONT = "Aviano Serif Light"
DISPLAY_FONT_FAMILY = "Aviano Serif"
BODY_FONT = "Familjen Grotesk"
DISPLAY_KERNING = -130  # brand letter-spacing/kerning token

# Font files (bundled, self-contained)
FONT_FILES = {
    "aviano_light": FONTS / "AvianoSerif-Light.otf",
    "aviano_regular": FONTS / "AvianoSerif-Regular.otf",
    "familjen_400": FONTS / "FamiljenGrotesk-400.ttf",
    "familjen_500": FONTS / "FamiljenGrotesk-500.ttf",
    "familjen_600": FONTS / "FamiljenGrotesk-600.ttf",
    "familjen_700": FONTS / "FamiljenGrotesk-700.ttf",
}

LOGO_WHITE_PNG = BRAND / "logo-white.png"
LOGO_CHARCOAL_PNG = BRAND / "logo-charcoal.png"

CONTACT_LINE = "Bespoke Property Concierge  ·  concierge@bespokepropertyconcierge.com.au"

# --- HSP sections (ADR-008) ------------------------------------------------
# Order is the document order. `key` matches the parsed JSON section keys.
SECTIONS = [
    {
        "key": "essential_repairs",
        "title": "Essential Repairs",
        "blurb": "Immediate safety and repair items we recommend addressing first.",
    },
    {
        "key": "programmed_maintenance",
        "title": "Programmed Maintenance Schedule",
        "blurb": "Ongoing, preventive care to keep your home performing at its best.",
    },
    {
        "key": "enhancement_plan",
        "title": "Enhancement Plan",
        "blurb": "Considered improvements to elevate comfort, value and enjoyment.",
    },
]
SECTION_KEYS = [s["key"] for s in SECTIONS]
EMPTY_SECTION_NOTE = "No items at this time."

STATES = ("satisfactory", "recommended-work", "monitor")
