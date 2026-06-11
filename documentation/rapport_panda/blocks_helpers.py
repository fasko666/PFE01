# -*- coding: utf-8 -*-
"""Block constructors + figure/table numbering pass shared by all content modules."""
import os

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")

# block constructors -----------------------------------------------------------
def P(t):                 return ("p", t)
def H1(t):                return ("h1", t)
def H2(r, t):             return ("h2", r, t)
def H3(n, t):             return ("h3", n, t)
def H4(l, t):             return ("h4", l, t)
def B(items, lvl=0):      return ("bullets", list(items), lvl)
def NL(items):            return ("numbered", list(items))
def NOTE(t):              return ("note", t)
def CODE(cap, txt):       return ("code", cap, txt)
def FIG(key, caption):    return ("figure_ref", key, caption)
def TBL(h, rows, caption=None, widths=None): return ("table_raw", h, rows, caption, widths)
def PB():                 return ("pagebreak",)
def SP(pts=12):           return ("spacer", pts)
def FM(title, *paras):    return ("frontmatter", title, list(paras))

COVER = ("cover",)
TOC = ("toc",)
LOF = ("lof",)
LOT = ("lot",)


def number(blocks):
    """Resolve figure_ref/table_raw into numbered, path-resolved blocks."""
    out, fig, tab = [], 0, 0
    for b in blocks:
        if b[0] == "figure_ref":
            fig += 1
            out.append(("figure", os.path.join(ASSETS, f"fig_{b[1]}.png"), fig, b[2]))
        elif b[0] == "table_raw":
            headers, rows, cap, widths = b[1], b[2], b[3], b[4]
            if cap:
                tab += 1
                out.append(("table", headers, rows, tab, cap, widths))
            else:
                out.append(("table", headers, rows, 0, None, widths))
        else:
            out.append(b)
    return out
