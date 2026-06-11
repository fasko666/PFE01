# -*- coding: utf-8 -*-
"""
Shared theme constants for the Panda PFE report (classic BTS academic style).
Colors are stored as hex strings; helpers convert to whatever each backend needs
(PIL wants RGB tuples, ReportLab wants HexColor, python-docx wants RGBColor).
"""

# ── Document palette (classic BTS / Word "Blue Accent 1" family) ───────────────
TITLE_BLUE   = "#1F6FC0"   # centered chapter titles
HEADING_BLUE = "#1F6FC0"   # I / II / III section headers (bold italic)
SUBHEAD_BLUE = "#1F6FC0"   # 1 / 2 / 3 subsection headers (bold)
FRONT_BLUE   = "#5B9BD5"   # centered front-matter titles (Sommaire, Résumé…)
BODY_BLACK   = "#111111"   # body text
CAPTION_GRAY = "#595959"   # figure / table captions
LINK_BLUE    = "#1155CC"   # hyperlinks
RULE_GRAY    = "#BFBFBF"   # thin rules
TABLE_HEAD   = "#1F4E79"   # table header fill
TABLE_HEAD_T = "#FFFFFF"   # table header text
TABLE_ALT    = "#EAF1F9"   # zebra row
TABLE_LINE   = "#9DB7D5"   # table grid

# ── Diagram palette (PIL) ──────────────────────────────────────────────────────
D_BG      = "#FFFFFF"
D_INK     = "#1B2430"
D_MUTED   = "#5B6470"
D_LINE    = "#3A4655"
D_BLUE    = "#2E74B5"
D_NAVY    = "#1F4E79"
D_TEAL    = "#2BA8A1"
D_GREEN   = "#2E9E5B"
D_ORANGE  = "#E08A2B"
D_RED     = "#D1495B"
D_PURPLE  = "#7E57C2"
D_GREY    = "#8A93A3"
D_FILL_B  = "#EAF1F9"   # light blue fill
D_FILL_T  = "#E3F4F2"   # light teal fill
D_FILL_G  = "#E7F6EC"   # light green fill
D_FILL_O  = "#FBEFDD"   # light orange fill
D_FILL_P  = "#EFE7F8"   # light purple fill
D_FILL_K  = "#F1F4F8"   # light grey fill

# ── Cover / identity ───────────────────────────────────────────────────────────
COVER = {
    "royaume":     "Royaume du Maroc",
    "ministere":   "Ministère de l'Éducation Nationale\ndu préscolaire & des sports",
    "academie":    "Académie régionale de Fès - Meknès",
    "direction":   "Direction provinciale de TAZA",
    "centre":      "Centre de préparation Brevet de Technicien Supérieur",
    "lycee":       "Lycée Technique - Taza",
    "filiere":     "Filière : Développement Digital — option Web Full Stack",
    "report_kind": "RAPPORT DE PFE",
    "project_title": "Conception et réalisation d'une plateforme\nde mise en relation entre freelances et clients",
    "students":    ["EL MERNISSI Ayoub", "EL AZZOUZI Omar"],
    "encadrant":   "Hamid EL BOURAKKADI",
    "centre_formation": "Lycée Technique - Taza",
    "year":        "2025 – 2026",
}


def hex_to_rgb(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
