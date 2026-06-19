#!/usr/bin/env python3
"""Embed the bundled brand fonts into a .docx so the document travels with its
typefaces (Familjen Grotesk + Aviano Serif).

OOXML embeds fonts as "obfuscated" font parts (.odttf): the first 32 bytes of
the font binary are XOR-masked with the 16 bytes of a per-font GUID, in reverse
order (ECMA-376 / the documented Word font-obfuscation scheme). We then:

  * add each .odttf under word/fonts/,
  * declare the odttf Default content type,
  * write word/fontTable.xml mapping each family to its embedded variants,
  * write word/_rels/fontTable.xml.rels with the font relationships,
  * set <w:embedTrueTypeFonts/> in word/settings.xml.

python-docx already ships a fontTable.xml part, its content-type override, and
the document->fontTable relationship, so we only rewrite/extend the above.
"""
import shutil
import zipfile
from pathlib import Path

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
FONT_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/font"
OBF_CT = ('<Default Extension="odttf" '
          'ContentType="application/vnd.openxmlformats-officedocument.obfuscatedFont"/>')

# Deterministic per-variant GUIDs (any valid GUIDs work; fixed for reproducibility).
_GUIDS = [
    "{0A1B2C3D-0001-4E5F-8A9B-000000000001}",
    "{0A1B2C3D-0002-4E5F-8A9B-000000000002}",
    "{0A1B2C3D-0003-4E5F-8A9B-000000000003}",
    "{0A1B2C3D-0004-4E5F-8A9B-000000000004}",
    "{0A1B2C3D-0005-4E5F-8A9B-000000000005}",
    "{0A1B2C3D-0006-4E5F-8A9B-000000000006}",
]


def _key(guid: str) -> bytes:
    h = guid.strip("{}").replace("-", "")
    return bytes.fromhex(h)[::-1]  # 16 bytes, reversed


def _obfuscate(guid: str, data: bytes) -> bytes:
    key = _key(guid)
    b = bytearray(data)
    for i in range(32):
        b[i] ^= key[i % 16]
    return bytes(b)


def embed_fonts(docx_path, font_map):
    """font_map: list of dicts, each
        {"name": family, "regular": Path|None, "bold": Path|None,
         "italic": Path|None, "boldItalic": Path|None}
    """
    docx_path = Path(docx_path)

    # Assign each physical font file an .odttf name, GUID and relationship id.
    files = []  # (odttf_name, src_path, guid, rid)
    fonts_xml = []
    rels_xml = []
    gi = 0
    rid = 1
    for fam in font_map:
        embeds = []
        for variant in ("regular", "bold", "italic", "boldItalic"):
            src = fam.get(variant)
            if not src:
                continue
            guid = _GUIDS[gi % len(_GUIDS)]
            gi += 1
            odttf = f"font{rid}.odttf"
            files.append((odttf, Path(src), guid))
            tag = {"regular": "embedRegular", "bold": "embedBold",
                   "italic": "embedItalic", "boldItalic": "embedBoldItalic"}[variant]
            embeds.append(f'<w:{tag} r:id="rId{rid}" w:fontKey="{guid}" w:subsetted="0"/>')
            rels_xml.append(
                f'<Relationship Id="rId{rid}" Type="{FONT_REL}" '
                f'Target="fonts/{odttf}"/>'
            )
            rid += 1
        if embeds:
            fonts_xml.append(
                f'<w:font w:name="{fam["name"]}">' + "".join(embeds) + "</w:font>"
            )

    font_table = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f'<w:fonts xmlns:w="{W_NS}" xmlns:r="{R_NS}">' + "".join(fonts_xml) + "</w:fonts>"
    )
    font_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f'<Relationships xmlns="{PKG_REL_NS}">' + "".join(rels_xml) + "</Relationships>"
    )

    tmp = docx_path.with_suffix(".embed.tmp")
    with zipfile.ZipFile(docx_path, "r") as zin, \
            zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.namelist():
            data = zin.read(item)
            if item == "[Content_Types].xml":
                txt = data.decode("utf-8")
                if 'Extension="odttf"' not in txt:
                    # insert right after the opening <Types ...> tag
                    idx = txt.index(">", txt.index("<Types")) + 1
                    txt = txt[:idx] + OBF_CT + txt[idx:]
                data = txt.encode("utf-8")
            elif item == "word/settings.xml":
                txt = data.decode("utf-8")
                if "embedTrueTypeFonts" not in txt:
                    idx = txt.index(">", txt.index("<w:settings")) + 1
                    txt = txt[:idx] + "<w:embedTrueTypeFonts/>" + txt[idx:]
                data = txt.encode("utf-8")
            elif item == "word/fontTable.xml":
                data = font_table.encode("utf-8")
            zout.writestr(item, data)
        # new parts
        zout.writestr("word/_rels/fontTable.xml.rels", font_rels)
        for odttf, src, guid in files:
            zout.writestr(f"word/fonts/{odttf}", _obfuscate(guid, src.read_bytes()))

    # Validate the rebuilt package opens before replacing the original.
    from docx import Document
    try:
        Document(str(tmp))
    except Exception:
        tmp.unlink(missing_ok=True)
        raise
    shutil.move(str(tmp), str(docx_path))
    return [f[0] for f in files]
