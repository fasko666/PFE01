# -*- coding: utf-8 -*-
"""
render_pdf.py — render the shared block list to a classic-BTS-styled PDF (ReportLab).
Times New Roman body, Calibri blue headings, real TOC + Table of figures (multiBuild),
page numbers bottom-left, figure/table captions.
"""
import os
from PIL import Image as PILImage
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Image, Table, TableStyle, PageBreak, KeepTogether,
                                Preformatted, FrameBreak, NextPageTemplate)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

import theme as T

FONTS = "C:/Windows/Fonts"


def _reg(name, file, fallback="arial.ttf"):
    try:
        pdfmetrics.registerFont(TTFont(name, os.path.join(FONTS, file)))
    except Exception:
        pdfmetrics.registerFont(TTFont(name, os.path.join(FONTS, fallback)))


def register_fonts():
    # Times New Roman everywhere (regular / bold / italic / bold-italic)
    _reg("TNR", "times.ttf"); _reg("TNR-B", "timesbd.ttf")
    _reg("TNR-I", "timesi.ttf"); _reg("TNR-BI", "timesbi.ttf")
    pdfmetrics.registerFontFamily("TNR", normal="TNR", bold="TNR-B", italic="TNR-I", boldItalic="TNR-BI")


CONTENT_W = A4[0] - 2 * 2.2 * cm


# ── document template with TOC / LOF / LOT notifications + page numbers ──────────
class PandaDoc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(filename, pagesize=A4,
                         leftMargin=2.4 * cm, rightMargin=2.4 * cm,
                         topMargin=2.4 * cm, bottomMargin=2.2 * cm, **kw)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="main")
        cover = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="cover")
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[cover], onPage=self._cover_page),
            PageTemplate(id="normal", frames=[frame], onPage=self._number_page),
        ])

    def _number_page(self, canv, doc):
        canv.saveState()
        canv.setFont("TNR", 11)
        canv.setFillColor(HexColor("#333333"))
        canv.drawString(2.4 * cm, 1.3 * cm, str(doc.page))
        canv.restoreState()

    def _cover_page(self, canv, doc):
        canv.saveState()
        canv.setFont("TNR", 11)
        canv.setFillColor(HexColor("#333333"))
        canv.drawString(2.4 * cm, 1.3 * cm, str(doc.page))
        canv.restoreState()

    def afterFlowable(self, flowable):
        if flowable.__class__.__name__ != "Paragraph":
            return
        sn = flowable.style.name
        txt = flowable.getPlainText()
        if sn == "H1Chapter":
            self.notify("TOCEntry", (0, txt, self.page))
        elif sn == "H2Sec":
            self.notify("TOCEntry", (1, txt, self.page))
        elif sn == "H3Sub":
            self.notify("TOCEntry", (2, txt, self.page))
        elif sn == "FigCaption":
            self.notify("LOFEntry", (0, txt, self.page))
        elif sn == "TabCaption":
            self.notify("LOTEntry", (0, txt, self.page))


class LOF(TableOfContents):
    def notify(self, kind, stuff):
        if kind == "LOFEntry":
            self.addEntry(*stuff)


class LOT(TableOfContents):
    def notify(self, kind, stuff):
        if kind == "LOTEntry":
            self.addEntry(*stuff)


# ── styles ──────────────────────────────────────────────────────────────────────
def build_styles():
    ss = getSampleStyleSheet()
    S = {}
    S["body"] = ParagraphStyle("body", fontName="TNR", fontSize=12, leading=21,
                               alignment=TA_JUSTIFY, spaceAfter=9, textColor=HexColor(T.BODY_BLACK))
    S["h1"] = ParagraphStyle("H1Chapter", fontName="TNR-B", fontSize=19, leading=24,
                             alignment=TA_CENTER, textColor=HexColor(T.TITLE_BLUE),
                             spaceBefore=10, spaceAfter=16)
    S["h2"] = ParagraphStyle("H2Sec", fontName="TNR-BI", fontSize=14.5, leading=19,
                             textColor=HexColor(T.HEADING_BLUE), spaceBefore=17, spaceAfter=9)
    S["h3"] = ParagraphStyle("H3Sub", fontName="TNR-B", fontSize=12.5, leading=16,
                             textColor=HexColor(T.SUBHEAD_BLUE), spaceBefore=13, spaceAfter=6,
                             leftIndent=14)
    S["h4"] = ParagraphStyle("H4", fontName="TNR-BI", fontSize=11.5, leading=15,
                             textColor=HexColor("#333333"), spaceBefore=7, spaceAfter=3, leftIndent=22)
    S["fm_title"] = ParagraphStyle("FMTitle", fontName="TNR-B", fontSize=20, leading=26,
                                    alignment=TA_CENTER, textColor=HexColor(T.FRONT_BLUE), spaceAfter=18)
    S["bullet"] = ParagraphStyle("bullet", parent=S["body"], leftIndent=24, firstLineIndent=-12,
                                 spaceAfter=5, leading=18, alignment=TA_LEFT)
    S["bullet2"] = ParagraphStyle("bullet2", parent=S["bullet"], leftIndent=46, firstLineIndent=-12)
    S["figcap"] = ParagraphStyle("FigCaption", fontName="TNR-I", fontSize=9.5, leading=12,
                                 alignment=TA_CENTER, textColor=HexColor(T.CAPTION_GRAY), spaceBefore=6, spaceAfter=16)
    S["tabcap"] = ParagraphStyle("TabCaption", fontName="TNR-I", fontSize=9.5, leading=12,
                                 alignment=TA_CENTER, textColor=HexColor(T.CAPTION_GRAY), spaceBefore=4, spaceAfter=12)
    S["cell"] = ParagraphStyle("cell", fontName="TNR", fontSize=9.5, leading=12.5, textColor=HexColor(T.BODY_BLACK))
    S["cellh"] = ParagraphStyle("cellh", fontName="TNR-B", fontSize=9.5, leading=12.5, textColor=colors.white)
    S["code"] = ParagraphStyle("code", fontName="Courier", fontSize=8.3, leading=11, textColor=HexColor("#1B2430"))
    S["codecap"] = ParagraphStyle("codecap", fontName="TNR-B", fontSize=9.5, leading=12,
                                  textColor=HexColor(T.HEADING_BLUE), spaceBefore=6, spaceAfter=2)
    S["note"] = ParagraphStyle("note", parent=S["body"], leftIndent=10, rightIndent=8, spaceBefore=2, spaceAfter=2)
    # cover styles
    S["cv_small"] = ParagraphStyle("cv_small", fontName="TNR", fontSize=12, leading=18, alignment=TA_CENTER)
    S["cv_kind"] = ParagraphStyle("cv_kind", fontName="TNR-B", fontSize=17, leading=22, alignment=TA_CENTER,
                                  textColor=HexColor(T.HEADING_BLUE))
    S["cv_title"] = ParagraphStyle("cv_title", fontName="TNR-B", fontSize=52, leading=58, alignment=TA_CENTER,
                                   textColor=HexColor(T.TITLE_BLUE))
    S["cv_sub"] = ParagraphStyle("cv_sub", fontName="TNR-I", fontSize=15, leading=20, alignment=TA_CENTER,
                                 textColor=HexColor("#333333"))
    S["cv_lbl"] = ParagraphStyle("cv_lbl", fontName="TNR-B", fontSize=12.5, leading=18, textColor=HexColor(T.HEADING_BLUE))
    S["cv_val"] = ParagraphStyle("cv_val", fontName="TNR", fontSize=12.5, leading=18)
    return S


# ── helpers ─────────────────────────────────────────────────────────────────────
def _img_flowable(path, max_w=CONTENT_W, max_h=23 * cm):
    iw, ih = PILImage.open(path).size
    ratio = iw / ih
    w = max_w
    h = w / ratio
    if h > max_h:
        h = max_h
        w = h * ratio
    if w < max_w * 0.55:          # portrait: center by widening to full content width
        w = max_w * 0.55           # minimum 55 % of content width for readability
        h = w / ratio
        if h > max_h:
            h = max_h
            w = h * ratio
    return Image(path, width=w, height=h)


def _table(block, S):
    headers, rows = block[1], block[2]
    n = block[3]; cap = block[4]; widths = block[5] if len(block) > 5 else None
    from inlines import to_rl
    data = []
    if headers:
        data.append([Paragraph(to_rl(h), S["cellh"]) for h in headers])
    for r in rows:
        data.append([Paragraph(to_rl(str(c)), S["cell"]) for c in r])
    ncol = len(headers) if headers else (len(rows[0]) if rows else 1)
    if widths:
        cw = [w * CONTENT_W for w in widths]
    else:
        cw = [CONTENT_W / ncol] * ncol
    t = Table(data, colWidths=cw, repeatRows=1 if headers else 0)
    st = [
        ("FONTNAME", (0, 0), (-1, -1), "TNR"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor(T.TABLE_LINE)),
    ]
    if headers:
        st += [("BACKGROUND", (0, 0), (-1, 0), HexColor(T.TABLE_HEAD)),
               ("TEXTCOLOR", (0, 0), (-1, 0), colors.white)]
        for i in range(1, len(data)):
            if i % 2 == 0:
                st.append(("BACKGROUND", (0, i), (-1, i), HexColor(T.TABLE_ALT)))
    t.setStyle(TableStyle(st))
    flow = [t]
    if cap:
        flow.append(Paragraph(f"Tableau {n}: {cap}", S["tabcap"]))
    else:
        flow.append(Spacer(1, 8))
    return KeepTogether(flow) if (len(rows) <= 14) else flow[0] if not cap else flow


def _code(block, S):
    cap, txt = block[1], block[2]
    lines = [Preformatted(txt, S["code"])]
    inner = Table([[lines]], colWidths=[CONTENT_W])
    inner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#F5F7FA")),
        ("BOX", (0, 0), (-1, -1), 1, HexColor("#C5CDD8")),
        ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    out = []
    if cap:
        out.append(Paragraph(cap, S["codecap"]))
    out.append(inner)
    out.append(Spacer(1, 10))
    return out


def _cover(S):
    cov = T.COVER
    fl = [Spacer(1, 0.7 * cm)]
    fl.append(Paragraph("Royaume du Maroc", S["cv_small"]))
    fl.append(Spacer(1, 0.15 * cm))
    fl.append(Paragraph(cov["ministere"], ParagraphStyle("f", parent=S["cv_small"], fontName="TNR-I", fontSize=10)))
    fl.append(Spacer(1, 0.4 * cm))
    # Institution box
    box_data = [[Paragraph(f"{cov['academie']}<br/>{cov['direction']}<br/>{cov['centre']}",
                           ParagraphStyle("bx", fontName="TNR", fontSize=12, leading=18, alignment=TA_CENTER))]]
    box = Table(box_data, colWidths=[CONTENT_W * 0.85])
    box.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.5, HexColor(T.TITLE_BLUE)),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    fl.append(box)
    fl.append(Spacer(1, 1.7 * cm))
    fl.append(Paragraph(cov["report_kind"], S["cv_kind"]))
    fl.append(Spacer(1, 0.5 * cm))
    title_text = cov["project_title"].replace("\n", "<br/>")
    fl.append(Paragraph(f'<b>{title_text}</b>',
                        ParagraphStyle("ptitle", fontName="TNR-B", fontSize=17, leading=24, alignment=TA_CENTER)))
    fl.append(Spacer(1, 2.2 * cm))
    # students / encadrant table
    studs = "<br/>".join(cov["students"])
    left = Paragraph(f'<font name="TNR-B" color="{T.HEADING_BLUE}">Réalisé par :</font><br/>{studs}',
                     ParagraphStyle("l", fontName="TNR", fontSize=13, leading=20, alignment=TA_CENTER))
    right = Paragraph(f'<font name="TNR-B" color="{T.HEADING_BLUE}">Encadré par :</font><br/>{cov["encadrant"]}',
                      ParagraphStyle("r", fontName="TNR", fontSize=13, leading=20, alignment=TA_CENTER))
    tb = Table([[left, right]], colWidths=[CONTENT_W / 2, CONTENT_W / 2])
    tb.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    fl.append(tb)
    fl.append(Spacer(1, 1.8 * cm))
    fl.append(Paragraph(f'<b>Centre de formation :</b><br/>{cov["lycee"]}',
                        ParagraphStyle("cf", fontName="TNR", fontSize=12, leading=18, alignment=TA_CENTER)))
    fl.append(Spacer(1, 1.8 * cm))
    fl.append(Paragraph(cov["year"],
                        ParagraphStyle("y", fontName="TNR-B", fontSize=13, leading=18, alignment=TA_CENTER,
                                       textColor=HexColor(T.HEADING_BLUE))))
    fl.append(NextPageTemplate("normal"))
    fl.append(PageBreak())
    return fl


def _toc_obj(kind):
    from reportlab.lib.styles import ParagraphStyle as PS
    lvl = [
        PS("toc0", fontName="TNR-B", fontSize=12, leading=20, leftIndent=6, textColor=HexColor(T.HEADING_BLUE)),
        PS("toc1", fontName="TNR", fontSize=11, leading=17, leftIndent=26),
        PS("toc2", fontName="TNR-I", fontSize=10.5, leading=15, leftIndent=48, textColor=HexColor("#444444")),
    ]
    if kind == "toc":
        t = TableOfContents()
    elif kind == "lof":
        t = LOF()
    else:
        t = LOT()
    t.levelStyles = lvl if kind == "toc" else [lvl[1]]
    t.dotsMinLevel = 0
    return t


# ── main render ──────────────────────────────────────────────────────────────────
def render(blocks, out_path):
    from inlines import to_rl
    register_fonts()
    S = build_styles()
    doc = PandaDoc(out_path)
    story = []

    def fm(title, paras):
        story.append(Paragraph(title, S["fm_title"]))
        for p in paras:
            story.append(Paragraph(to_rl(p), S["body"]))
        story.append(PageBreak())

    for b in blocks:
        k = b[0]
        if k == "cover":
            story += _cover(S)
        elif k == "frontmatter":
            fm(b[1], b[2])
        elif k == "toc":
            story.append(Paragraph("Sommaire", S["fm_title"]))
            story.append(_toc_obj("toc"))
            story.append(PageBreak())
        elif k == "lof":
            story.append(Paragraph("Table des figures", S["fm_title"]))
            story.append(_toc_obj("lof"))
            story.append(PageBreak())
        elif k == "lot":
            story.append(Paragraph("Liste des tableaux", S["fm_title"]))
            story.append(_toc_obj("lot"))
            story.append(PageBreak())
        elif k == "h1":
            if not (story and isinstance(story[-1], PageBreak)):
                story.append(PageBreak())
            story.append(Spacer(1, 0.3 * cm))
            story.append(Paragraph(b[1], S["h1"]))
            story.append(Spacer(1, 0.15 * cm))
        elif k == "h2":
            story.append(Paragraph(f'{b[1]}.&nbsp;&nbsp;{b[2]}', S["h2"]))
        elif k == "h3":
            story.append(Paragraph(f'{b[1]}&nbsp;&nbsp;{b[2]}', S["h3"]))
        elif k == "h4":
            story.append(Paragraph(f'{b[1]}.&nbsp;{b[2]}', S["h4"]))
        elif k == "p":
            story.append(Paragraph(to_rl(b[1]), S["body"]))
        elif k == "bullets":
            items, lvl = b[1], (b[2] if len(b) > 2 else 0)
            sty = S["bullet"] if lvl == 0 else S["bullet2"]
            mark = "•" if lvl == 0 else "–"
            for it in items:
                story.append(Paragraph(f'<font color="{T.HEADING_BLUE}">{mark}</font>&nbsp;&nbsp;{to_rl(it)}', sty))
            story.append(Spacer(1, 4))
        elif k == "numbered":
            for i, it in enumerate(b[1], 1):
                story.append(Paragraph(f'<font color="{T.HEADING_BLUE}"><b>{i}.</b></font>&nbsp;&nbsp;{to_rl(it)}', S["bullet"]))
            story.append(Spacer(1, 4))
        elif k == "figure":
            path, n, cap = b[1], b[2], b[3]
            img = _img_flowable(path)
            cap_para = Paragraph(f"Figure {n}: {cap}", S["figcap"])
            # Large figures (nearly full-page height): skip KeepTogether to avoid clipping
            if img.drawHeight > 17 * cm:
                story.append(img)
                story.append(cap_para)
                story.append(Spacer(1, 0.3 * cm))
            else:
                story.append(KeepTogether([img, cap_para]))
        elif k == "table":
            res = _table(b, S)
            if isinstance(res, list):
                story += res
            else:
                story.append(res)
        elif k == "code":
            story += _code(b, S)
        elif k == "note":
            inner = Table([[Paragraph(to_rl(b[1]), S["note"])]], colWidths=[CONTENT_W])
            inner.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), HexColor("#EAF1F9")),
                ("LINEBEFORE", (0, 0), (0, -1), 3.5, HexColor(T.HEADING_BLUE)),
                ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]))
            story.append(inner); story.append(Spacer(1, 8))
        elif k == "spacer":
            story.append(Spacer(1, b[1]))
        elif k == "pagebreak":
            story.append(PageBreak())

    doc.multiBuild(story)
    return doc.page
