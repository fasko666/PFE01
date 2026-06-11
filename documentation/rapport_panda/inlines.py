# -*- coding: utf-8 -*-
"""
Tiny inline-markup parser shared by both renderers.
Supports **bold**, *italic* and `monospace` inside a string.
"""
import re
import xml.sax.saxutils as su

_TOKEN = re.compile(r"(\*\*.+?\*\*|\*.+?\*|`.+?`)")


def parse_runs(text):
    """Return a list of (text, bold, italic, mono) runs."""
    runs = []
    for part in _TOKEN.split(text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            runs.append((part[2:-2], True, False, False))
        elif part.startswith("`") and part.endswith("`"):
            runs.append((part[1:-1], False, False, True))
        elif part.startswith("*") and part.endswith("*"):
            runs.append((part[1:-1], False, True, False))
        else:
            runs.append((part, False, False, False))
    return runs


def to_rl(text, mono_font="Courier", mono_color="#9C2D41"):
    """Convert inline markup to ReportLab paragraph markup (escaped)."""
    out = []
    for t, b, i, m in parse_runs(text):
        e = su.escape(t)
        if m:
            out.append(f'<font face="{mono_font}" color="{mono_color}">{e}</font>')
        elif b:
            out.append(f"<b>{e}</b>")
        elif i:
            out.append(f"<i>{e}</i>")
        else:
            out.append(e)
    return "".join(out)
