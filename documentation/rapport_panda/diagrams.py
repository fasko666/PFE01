# -*- coding: utf-8 -*-
"""
diagrams.py — generate all figures for the Panda PFE report as PNG files using PIL.
Each diagram is drawn as a vector-style raster so the SAME PNG can be embedded in
both the Word (.docx) and PDF outputs, guaranteeing identical visuals.

Run directly to (re)generate every PNG into ./assets/.
"""
import os
from PIL import Image, ImageDraw, ImageFont
from theme import (hex_to_rgb, D_BG, D_INK, D_MUTED, D_LINE, D_BLUE, D_NAVY, D_TEAL,
                   D_GREEN, D_ORANGE, D_RED, D_PURPLE, D_GREY, D_FILL_B, D_FILL_T,
                   D_FILL_G, D_FILL_O, D_FILL_P, D_FILL_K)

FONT_DIR = "C:/Windows/Fonts"
ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
os.makedirs(ASSETS, exist_ok=True)

_FCACHE = {}
def font(size, bold=False, italic=False):
    key = (size, bold, italic)
    if key in _FCACHE:
        return _FCACHE[key]
    name = "arial.ttf"
    if bold and italic: name = "arialbi.ttf"
    elif bold:          name = "arialbd.ttf"
    elif italic:        name = "ariali.ttf"
    try:
        f = ImageFont.truetype(os.path.join(FONT_DIR, name), size)
    except Exception:
        f = ImageFont.truetype(os.path.join(FONT_DIR, "arial.ttf"), size)
    _FCACHE[key] = f
    return f

def C(h):  # hex -> rgb
    return hex_to_rgb(h)

# ── primitives ────────────────────────────────────────────────────────────────
def canvas(w, h, bg=D_BG):
    img = Image.new("RGB", (w, h), C(bg))
    return img, ImageDraw.Draw(img)

def tsize(d, text, f):
    b = d.textbbox((0, 0), text, font=f)
    return b[2] - b[0], b[3] - b[1]

def text_c(d, cx, cy, text, f, fill=D_INK):
    w, h = tsize(d, text, f)
    d.text((cx - w / 2, cy - h / 2), text, font=f, fill=C(fill) if isinstance(fill, str) else fill)

def text_l(d, x, y, text, f, fill=D_INK):
    d.text((x, y), text, font=f, fill=C(fill) if isinstance(fill, str) else fill)

def wrap(d, text, f, max_w):
    words, lines, cur = text.split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) <= max_w:
            cur = t
        else:
            if cur: lines.append(cur)
            cur = wd
    if cur: lines.append(cur)
    return lines

def text_wrap_c(d, cx, cy, text, f, max_w, fill=D_INK, lh=None):
    lines = wrap(d, text, f, max_w)
    _, hh = tsize(d, "Ag", f)
    lh = lh or int(hh * 1.35)
    total = lh * len(lines)
    y = cy - total / 2
    for ln in lines:
        text_c(d, cx, y + lh / 2, ln, f, fill)
        y += lh

def box(d, x, y, w, h, fill=D_FILL_B, outline=D_NAVY, radius=14, width=3,
        title=None, title_f=None, title_fill=None, lines=None, body_f=None,
        body_fill=D_MUTED, pad=14, title_center=True):
    d.rounded_rectangle([x, y, x + w, y + h], radius=radius,
                        fill=C(fill) if fill else None,
                        outline=C(outline) if outline else None, width=width)
    cy = y + pad
    if title:
        tf = title_f or font(22, bold=True)
        tfill = title_fill or D_INK
        if title_center:
            text_wrap_c(d, x + w / 2, y + (h * 0.32 if not lines else pad + 14),
                        title, tf, w - 2 * pad, tfill)
        else:
            text_l(d, x + pad, cy, title, tf, tfill)
        cy += 30
    if lines:
        bf = body_f or font(15)
        for ln in lines:
            text_l(d, x + pad, cy, ln, bf, body_fill)
            cy += 22

def arrow(d, x1, y1, x2, y2, color=D_LINE, width=3, head=11, dashed=False, double=False):
    col = C(color)
    if dashed:
        dash(d, x1, y1, x2, y2, col, width)
    else:
        d.line([x1, y1, x2, y2], fill=col, width=width)
    import math
    ang = math.atan2(y2 - y1, x2 - x1)
    for sgn in ((1,) if not double else (1, -1)):
        ax, ay = (x2, y2) if sgn == 1 else (x1, y1)
        a = ang if sgn == 1 else ang + math.pi
        p1 = (ax - head * math.cos(a - 0.4), ay - head * math.sin(a - 0.4))
        p2 = (ax - head * math.cos(a + 0.4), ay - head * math.sin(a + 0.4))
        d.polygon([(ax, ay), p1, p2], fill=col)

def dash(d, x1, y1, x2, y2, color, width=2, dl=12, gap=8):
    import math
    col = C(color) if isinstance(color, str) else color
    total = math.hypot(x2 - x1, y2 - y1)
    if total == 0: return
    dx, dy = (x2 - x1) / total, (y2 - y1) / total
    n = int(total // (dl + gap)) + 1
    for i in range(n):
        s = i * (dl + gap)
        e = min(s + dl, total)
        d.line([x1 + dx * s, y1 + dy * s, x1 + dx * e, y1 + dy * e], fill=col, width=width)

def actor(d, cx, top, label, color=D_NAVY, scale=1.0):
    col = C(color); s = scale
    r = int(15 * s)
    head = [cx - r, top, cx + r, top + 2 * r]
    d.ellipse(head, outline=col, width=3)
    by = top + 2 * r
    d.line([cx, by, cx, by + int(40 * s)], fill=col, width=3)          # body
    d.line([cx - int(26 * s), by + int(14 * s), cx + int(26 * s), by + int(14 * s)], fill=col, width=3)  # arms
    d.line([cx, by + int(40 * s), cx - int(20 * s), by + int(70 * s)], fill=col, width=3)  # leg
    d.line([cx, by + int(40 * s), cx + int(20 * s), by + int(70 * s)], fill=col, width=3)  # leg
    f = font(int(17 * s), bold=True)
    text_c(d, cx, by + int(70 * s) + int(16 * s), label, f, color)

def usecase(d, cx, cy, w, h, text, fill=D_FILL_B, outline=D_BLUE):
    d.ellipse([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2],
              fill=C(fill), outline=C(outline), width=2)
    text_wrap_c(d, cx, cy, text, font(14), w - 24, D_INK)

def title_bar(d, w, text, sub=None, color=D_NAVY):
    d.rectangle([0, 0, w, 70], fill=C(color))
    text_c(d, w / 2, 30, text, font(26, bold=True), "#FFFFFF")
    if sub:
        text_c(d, w / 2, 54, sub, font(15), "#D7E3F2")

def save(img, name):
    p = os.path.join(ASSETS, name)
    img.save(p, "PNG")
    return p

# ── 1. Architecture 3-tiers ─────────────────────────────────────────────────────
def d_architecture():
    W, H = 1600, 1040
    img, d = canvas(W, H)
    title_bar(d, W, "Architecture générale de PANDA", "SPA React  ·  API REST Laravel  ·  Base MySQL  ·  Services externes")
    # tiers
    box(d, 60, 120, 460, 250, D_FILL_B, D_BLUE, title="COUCHE PRÉSENTATION",
        title_f=font(20, bold=True), title_fill=D_NAVY, title_center=False,
        lines=["React 19 + Vite + TailwindCSS", "Zustand (état global)", "React Router · Axios", "Laravel Echo (WebSocket)",
               "Framer Motion · Recharts"], body_f=font(16))
    box(d, 575, 120, 460, 250, D_FILL_T, D_TEAL, title="COUCHE APPLICATION (API)",
        title_f=font(20, bold=True), title_fill="#1B6E68", title_center=False,
        lines=["Laravel 12 (PHP 8.2+)", "Routes /api · Sanctum (Bearer)", "Middleware · FormRequests",
               "Controllers · Services métier", "Policies · Events / Listeners"], body_f=font(16))
    box(d, 1090, 120, 450, 250, D_FILL_G, D_GREEN, title="COUCHE DONNÉES",
        title_f=font(20, bold=True), title_fill="#1E7A43", title_center=False,
        lines=["MySQL 8 (≈55 tables)", "Eloquent ORM", "Migrations versionnées", "Redis (cache · file d'attente)",
               "Stockage fichiers (disk)"], body_f=font(16))
    arrow(d, 520, 230, 575, 230, D_LINE, 4, double=True)
    arrow(d, 1035, 230, 1090, 230, D_LINE, 4, double=True)
    text_c(d, 547, 205, "HTTPS / JSON", font(13), D_MUTED)
    text_c(d, 1062, 205, "PDO", font(13), D_MUTED)
    # external services
    ex = [("Stripe", "Paiements · Connect", D_FILL_P, D_PURPLE),
          ("Google OAuth", "Socialite", D_FILL_O, D_ORANGE),
          ("Laravel Reverb", "WebSockets temps réel", D_FILL_B, D_BLUE),
          ("Ollama / Mistral", "IA générative", D_FILL_T, D_TEAL),
          ("Web Push (VAPID)", "Notifications", D_FILL_K, D_GREY)]
    x = 60; y = 470; bw = 290; bh = 130
    text_l(d, 60, 430, "SERVICES & INTÉGRATIONS EXTERNES", font(20, bold=True), D_NAVY)
    for i, (t, s, fl, ol) in enumerate(ex):
        bx = 60 + (i % 5) * 300
        box(d, bx, y, bw, bh, fl, ol, radius=12, width=2)
        text_wrap_c(d, bx + bw / 2, y + 46, t, font(19, bold=True), bw - 20, D_INK)
        text_wrap_c(d, bx + bw / 2, y + 92, s, font(14), bw - 20, D_MUTED)
        arrow(d, bx + bw / 2, 470, 800, 370, D_GREY, 2, dashed=True)
    # request lifecycle strip
    yy = 700
    text_l(d, 60, yy, "CYCLE DE VIE D'UNE REQUÊTE", font(20, bold=True), D_NAVY)
    steps = ["Navigateur", "Route /api", "Middleware\n(auth, throttle)", "Controller",
             "FormRequest\n(validation)", "Service métier", "Eloquent / MySQL", "Réponse JSON"]
    sx = 60; sw = 175; sy = 745
    for i, st in enumerate(steps):
        bx = sx + i * (sw + 10)
        if bx + sw > W - 40:
            break
        d.rounded_rectangle([bx, sy, bx + sw, sy + 90], radius=10, fill=C(D_FILL_K), outline=C(D_LINE), width=2)
        text_wrap_c(d, bx + sw / 2, sy + 45, st.replace("\n", " "), font(14, bold=True), sw - 16, D_INK)
        if i < len(steps) - 1 and bx + sw + 10 + sw <= W - 40:
            arrow(d, bx + sw, sy + 45, bx + sw + 10, sy + 45, D_LINE, 3)
    # second row of lifecycle
    yy2 = 880
    steps2 = ["Service métier", "Eloquent / MySQL", "Events → Listeners", "Broadcast (Reverb)", "Réponse JSON 200"]
    for i, st in enumerate(steps2):
        bx = 60 + i * 300
        if bx + 280 > W - 40: break
        d.rounded_rectangle([bx, yy2, bx + 280, yy2 + 80], radius=10, fill=C(D_FILL_T), outline=C(D_TEAL), width=2)
        text_wrap_c(d, bx + 140, yy2 + 40, st, font(15, bold=True), 260, D_INK)
        if i < len(steps2) - 1:
            arrow(d, bx + 280, yy2 + 40, bx + 300, yy2 + 40, D_LINE, 3)
    return save(img, "fig_architecture.png")

# ── 2. MVC / couches Laravel ────────────────────────────────────────────────────
def d_mvc():
    W, H = 1500, 980
    img, d = canvas(W, H)
    title_bar(d, W, "Organisation en couches du backend (MVC + Services)")
    layers = [
        ("Routes (routes/api.php)", "Déclaration des points d'entrée REST, préfixes et groupes de middleware", D_FILL_B, D_BLUE),
        ("Middleware", "auth:sanctum · throttle · admin · vérification de rôle (defense in depth)", D_FILL_K, D_GREY),
        ("Controllers (Http/Controllers/API)", "Orchestration de la requête, délégation, formatage de la réponse JSON", D_FILL_T, D_TEAL),
        ("FormRequests", "Validation et autorisation des entrées avant traitement", D_FILL_O, D_ORANGE),
        ("Services métier (app/Services)", "LedgerService · StripeService · NotificationService · HourlyBillingService …", D_FILL_P, D_PURPLE),
        ("Models / Eloquent ORM", "User · Contract · Milestone · Wallet · Transaction … relations & scopes", D_FILL_G, D_GREEN),
        ("Base de données MySQL", "Tables, contraintes d'intégrité, transactions ACID, verrous FOR UPDATE", D_FILL_B, D_NAVY),
    ]
    x, w = 220, 1060
    y = 110; h = 104; gap = 16
    for i, (t, s, fl, ol) in enumerate(layers):
        d.rounded_rectangle([x, y, x + w, y + h], radius=12, fill=C(fl), outline=C(ol), width=3)
        text_l(d, x + 22, y + 22, t, font(21, bold=True), D_INK)
        text_l(d, x + 22, y + 58, s, font(15), D_MUTED)
        if i < len(layers) - 1:
            arrow(d, x + w / 2, y + h, x + w / 2, y + h + gap, D_LINE, 3, double=True)
        y += h + gap
    # side annotations
    d.rounded_rectangle([40, 130, 190, 360], radius=12, fill=C(D_FILL_K), outline=C(D_LINE), width=2)
    text_wrap_c(d, 115, 245, "Requête HTTP entrante (haut → bas)", font(16, bold=True), 130, D_NAVY)
    d.rounded_rectangle([1300, 620, 1460, 860], radius=12, fill=C(D_FILL_K), outline=C(D_LINE), width=2)
    text_wrap_c(d, 1380, 740, "Policies & Events transversaux (audit, notifications, broadcast)", font(15, bold=True), 140, D_NAVY)
    return save(img, "fig_mvc.png")

# ── 3. Use-case global ──────────────────────────────────────────────────────────
def d_usecase():
    W, H = 1600, 1180
    img, d = canvas(W, H)
    title_bar(d, W, "Diagramme de cas d'utilisation global — PANDA")
    # system boundary
    d.rounded_rectangle([330, 110, 1270, 1120], radius=18, outline=C(D_NAVY), width=3)
    text_c(d, 800, 135, "« Système »  PANDA", font(20, bold=True), D_NAVY)
    # actors left
    actor(d, 120, 200, "Visiteur", D_GREY)
    actor(d, 120, 420, "Client", D_BLUE)
    actor(d, 120, 660, "Freelance", D_TEAL)
    actor(d, 120, 900, "Agence", D_PURPLE)
    # actors right
    actor(d, 1480, 300, "Admin", D_RED)
    actor(d, 1480, 560, "Stripe", D_ORANGE)
    actor(d, 1480, 780, "IA (Mistral)", D_GREEN)
    # use cases grouped
    groups = [
        (470, 210, "S'inscrire / Se connecter\n(OAuth, 2FA)", D_FILL_K),
        (470, 320, "Parcourir offres & freelances", D_FILL_K),
        (470, 430, "Publier une offre", D_FILL_B),
        (470, 540, "Gérer propositions reçues", D_FILL_B),
        (470, 650, "Financer l'escrow", D_FILL_B),
        (470, 760, "Valider un jalon / Payer", D_FILL_B),
        (790, 270, "Postuler (proposition)", D_FILL_T),
        (790, 390, "Gérer profil & portfolio", D_FILL_T),
        (790, 510, "Vendre un service (catalogue)", D_FILL_T),
        (790, 630, "Suivre le temps / livrer", D_FILL_T),
        (790, 750, "Demander un retrait", D_FILL_T),
        (790, 870, "Discuter (messagerie)", D_FILL_K),
        (1100, 300, "Gérer une agence", D_FILL_P),
        (1100, 430, "Générer une proposition IA", D_FILL_G),
        (1100, 560, "Vérifier identité (KYC)", D_FILL_K),
        (1100, 690, "Modérer & administrer", D_FILL_O),
        (1100, 820, "Gérer paiements / litiges", D_FILL_O),
    ]
    pts = {}
    for (x, y, t, fl) in groups:
        usecase(d, x, y, 250, 92, t, fl)
        pts[t] = (x, y)
    def link(ax, ay, t, color=D_LINE, dashed=False):
        x, y = pts[t]
        arrow(d, ax, ay, x - 125, y, color, 2, dashed=dashed)
    # visitor
    link(165, 210, "S'inscrire / Se connecter\n(OAuth, 2FA)", D_GREY)
    link(165, 230, "Parcourir offres & freelances", D_GREY)
    # client
    for t in ["Publier une offre", "Gérer propositions reçues", "Financer l'escrow",
              "Valider un jalon / Payer", "Discuter (messagerie)"]:
        link(165, 440, t, D_BLUE)
    # freelance
    for t in ["Postuler (proposition)", "Gérer profil & portfolio", "Vendre un service (catalogue)",
              "Suivre le temps / livrer", "Demander un retrait", "Discuter (messagerie)"]:
        link(165, 680, t, D_TEAL)
    # agence
    link(165, 920, "Gérer une agence", D_PURPLE)
    # admin
    for t in ["Modérer & administrer", "Gérer paiements / litiges", "Vérifier identité (KYC)"]:
        x, y = pts[t]; arrow(d, 1435, 320, x + 125, y, D_RED, 2)
    # stripe
    x, y = pts["Gérer paiements / litiges"]; arrow(d, 1435, 575, x + 125, y, D_ORANGE, 2, dashed=True)
    x, y = pts["Demander un retrait"]; arrow(d, 1435, 580, x + 125, y, D_ORANGE, 2, dashed=True)
    # IA
    x, y = pts["Générer une proposition IA"]; arrow(d, 1435, 790, x + 125, y, D_GREEN, 2, dashed=True)
    text_c(d, 800, 1150, "« include » / « extends » entre cas d'utilisation non représentés pour la lisibilité",
           font(13, italic=True), D_MUTED)
    return save(img, "fig_usecase.png")

# ── 4. Diagramme de classes ─────────────────────────────────────────────────────
def d_class():
    W, H = 1640, 1180
    img, d = canvas(W, H)
    title_bar(d, W, "Diagramme de classes (entités métier principales)")

    def cls(x, y, w, name, attrs, methods=None, fill=D_FILL_B, ol=D_NAVY):
        hf = font(18, bold=True); af = font(14)
        head_h = 38
        ah = 22 * len(attrs) + 14
        mh = (22 * len(methods) + 14) if methods else 0
        h = head_h + ah + mh
        d.rectangle([x, y, x + w, y + h], fill=C(fill), outline=C(ol), width=2)
        d.rectangle([x, y, x + w, y + head_h], fill=C(ol), outline=C(ol))
        text_c(d, x + w / 2, y + head_h / 2, name, hf, "#FFFFFF")
        yy = y + head_h + 8
        for a in attrs:
            text_l(d, x + 10, yy, a, af, D_INK); yy += 22
        if methods:
            d.line([x, yy + 2, x + w, yy + 2], fill=C(ol), width=1); yy += 10
            for m in methods:
                text_l(d, x + 10, yy, m, af, "#2B4A6F"); yy += 22
        return (x, y, w, h)

    user = cls(60, 110, 300, "User",
               ["+ id : bigint", "+ name / email", "+ role : client|freelancer|admin",
                "+ password (bcrypt)", "+ two_factor_secret", "+ is_platform : bool"],
               ["+ wallet() : Wallet", "+ contracts()"], D_FILL_B, D_NAVY)
    cls(60, 470, 300, "FreelancerProfile",
        ["+ user_id (FK)", "+ title / bio / hourly_rate", "+ skills[] · portfolio[]", "+ availability"],
        None, D_FILL_T, D_TEAL)
    cls(60, 690, 300, "ClientProfile",
        ["+ user_id (FK)", "+ company / website", "+ spend_total"], None, D_FILL_T, D_TEAL)
    cls(60, 870, 300, "Wallet",
        ["+ user_id (FK)", "+ balance : decimal", "+ pending_balance", "+ escrow_balance", "+ currency"],
        ["+ lock()"], D_FILL_G, D_GREEN)

    job = cls(430, 110, 300, "JobPosting",
              ["+ id · client_id (FK)", "+ title / description", "+ budget · type", "+ category_id (FK)", "+ status"],
              None, D_FILL_B, D_NAVY)
    prop = cls(430, 360, 300, "Proposal",
               ["+ job_id (FK)", "+ freelancer_id (FK)", "+ cover_letter", "+ bid_amount", "+ status"],
               None, D_FILL_O, D_ORANGE)
    contract = cls(430, 600, 320, "Contract",
                   ["+ id · client_id / freelancer_id", "+ job_id / proposal_id (FK, nul.)",
                    "+ title · type (fixed|hourly)", "+ escrow_amount : decimal",
                    "+ status : active|completed|…", "+ disputed_at · dispute_reason"],
                   ["+ complete() · dispute()"], D_FILL_B, D_NAVY)
    milestone = cls(430, 920, 320, "Milestone",
                    ["+ contract_id (FK)", "+ title · amount", "+ status : pending|submitted|paid", "+ approved_at"],
                    None, D_FILL_O, D_ORANGE)

    tx = cls(820, 110, 330, "Transaction",
             ["+ wallet_id (FK) · user_id", "+ contract_id / milestone_id (FK)", "+ reference (unique)",
              "+ type · direction (in|out)", "+ amount · fee · balance_after", "+ idempotency_key · status"],
             None, D_FILL_G, D_GREEN)
    review = cls(820, 410, 300, "Review",
                 ["+ contract_id (FK, nul.)", "+ reviewer / reviewee", "+ rating (1-5)", "+ comment"],
                 None, D_FILL_K, D_GREY)
    conv = cls(820, 620, 300, "Conversation",
               ["+ type · contract_id / job_id", "+ last_message_at"], None, D_FILL_B, D_BLUE)
    msg = cls(820, 800, 300, "Message",
              ["+ conversation_id (FK)", "+ sender_id (FK)", "+ body · type · attachments", "+ read_at · reply_to_id"],
              None, D_FILL_B, D_BLUE)

    catp = cls(1210, 110, 360, "CatalogProject",
               ["+ freelancer_id (FK)", "+ title · slug · category", "+ tiers (basic/standard/premium)", "+ status (modéré)"],
               None, D_FILL_P, D_PURPLE)
    cato = cls(1210, 330, 360, "CatalogOrder",
               ["+ catalog_project_id (FK)", "+ buyer_id (FK)", "+ tier · amount", "+ status : paid|delivered|done"],
               None, D_FILL_P, D_PURPLE)
    agency = cls(1210, 560, 360, "Agency",
                 ["+ owner_id (FK)", "+ name · slug · bio", "+ members[] (pivot)"], None, D_FILL_T, D_TEAL)
    sub = cls(1210, 760, 360, "Subscription",
              ["+ user_id (FK)", "+ plan : free|…|enterprise", "+ connects_balance", "+ stripe_subscription_id", "+ status"],
              None, D_FILL_O, D_ORANGE)

    # relations (simple lines)
    def rel(a, b, color=D_LINE):
        ax = a[0] + a[2]; ay = a[1] + a[3] / 2
        bx = b[0]; by = b[1] + b[3] / 2
        d.line([ax, ay, bx, by], fill=C(color), width=2)
    rel(user, job); rel(job, prop); rel(prop, contract); rel(contract, milestone)
    rel(user, contract); rel(contract, tx); rel(user, tx)
    rel(conv, msg); rel(catp, cato)
    text_c(d, W / 2, H - 24, "1..* relations détaillées dans le MCD et le dictionnaire de données",
           font(13, italic=True), D_MUTED)
    return save(img, "fig_class.png")

# ── 5. MCD (Merise) ─────────────────────────────────────────────────────────────
def d_mcd():
    W, H = 1600, 1080
    img, d = canvas(W, H)
    title_bar(d, W, "Modèle Conceptuel de Données (MCD)")

    def ent(x, y, w, name, attrs, fill=D_FILL_B, ol=D_NAVY):
        hf = font(17, bold=True); af = font(13)
        head = 34; h = head + 20 * len(attrs) + 12
        d.rectangle([x, y, x + w, y + h], fill="white", outline=C(ol), width=2)
        d.rectangle([x, y, x + w, y + head], fill=C(ol))
        text_c(d, x + w / 2, y + head / 2, name, hf, "#FFFFFF")
        yy = y + head + 8
        for a in attrs:
            text_l(d, x + 10, yy, a, af, D_INK); yy += 20
        return (x, y, w, h)

    def assoc(cx, cy, label, fill=D_FILL_O, ol=D_ORANGE):
        w, h = 120, 56
        d.ellipse([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], fill=C(fill), outline=C(ol), width=2)
        text_c(d, cx, cy, label, font(13, bold=True), D_INK)
        return (cx, cy)

    def conn(a, ax, ay, c, card_a="", card_c=""):
        cx, cy = c
        d.line([ax, ay, cx, cy], fill=C(D_LINE), width=2)
        mx, my = (ax + cx) / 2, (ay + cy) / 2
        if card_a: text_c(d, (ax + mx) / 2, (ay + my) / 2 - 12, card_a, font(12, bold=True), D_NAVY)
        if card_c: text_c(d, (cx + mx) / 2, (cy + my) / 2 - 12, card_c, font(12, bold=True), D_NAVY)

    u = ent(640, 110, 320, "UTILISATEUR",
            ["id_user", "name", "email (U)", "password", "role", "is_platform"], D_FILL_B, D_NAVY)
    jp = ent(80, 130, 270, "OFFRE (JobPosting)",
             ["id_job", "title", "description", "budget", "status"], D_FILL_B, D_BLUE)
    fp = ent(1230, 120, 300, "PROFIL_FREELANCE",
             ["id_profile", "title", "hourly_rate", "bio"], D_FILL_T, D_TEAL)
    ct = ent(640, 470, 320, "CONTRAT",
             ["id_contract", "title", "type", "escrow_amount", "status"], D_FILL_B, D_NAVY)
    ms = ent(1180, 470, 320, "JALON (Milestone)",
             ["id_milestone", "title", "amount", "status", "approved_at"], D_FILL_O, D_ORANGE)
    wl = ent(80, 470, 300, "PORTEFEUILLE",
             ["id_wallet", "balance", "escrow_balance", "pending_balance"], D_FILL_G, D_GREEN)
    tx = ent(80, 760, 330, "TRANSACTION",
             ["id_tx", "reference (U)", "type", "amount", "balance_after", "status"], D_FILL_G, D_GREEN)
    cv = ent(640, 800, 300, "CONVERSATION",
             ["id_conv", "type", "last_message_at"], D_FILL_K, D_GREY)
    mg = ent(1180, 800, 320, "MESSAGE",
             ["id_msg", "body", "type", "read_at"], D_FILL_K, D_GREY)

    a1 = assoc(490, 200, "publier")
    conn(jp, 350, 200, a1, "0,N", "1,1"); conn(u, 640, 180, a1, "1,1", "0,N")
    a2 = assoc(800, 340, "engage")
    conn(u, 800, 230, a2, "1,1", "0,N"); conn(ct, 800, 470, a2, "0,N", "1,1")
    a3 = assoc(890, 510, "découpe")
    conn(ct, 960, 510, a3, "1,1", "1,N"); conn(ms, 1180, 510, a3, "1,N", "1,1")
    a4 = assoc(420, 360, "possède")
    conn(u, 700, 250, a4, "1,1", "1,1"); conn(wl, 230, 470, a4, "1,1", "1,1")
    a5 = assoc(240, 630, "enregistre")
    conn(wl, 230, 580, a5, "1,1", "0,N"); conn(tx, 240, 760, a5, "0,N", "1,1")
    a6 = assoc(1090, 300, "rédige")
    conn(u, 960, 200, a6, "1,1", "1,1"); conn(fp, 1230, 240, a6, "0,1", "1,1")
    a7 = assoc(890, 820, "contient")
    conn(cv, 940, 830, a7, "1,1", "1,N"); conn(mg, 1180, 830, a7, "1,N", "1,1")
    text_c(d, W / 2, H - 22, "Cardinalités Merise (min,max) — (U) = attribut unique",
           font(13, italic=True), D_MUTED)
    return save(img, "fig_mcd.png")

# ── sequence diagram helper ─────────────────────────────────────────────────────
def seq_base(title, actors, msgs, W=1600, note=None, fname="fig_seq.png", H=1080):
    img, d = canvas(W, H)
    title_bar(d, W, title)
    n = len(actors)
    margin = 80
    span = (W - 2 * margin) / (n - 1) if n > 1 else 0
    xs = [int(margin + i * span) for i in range(n)]
    top = 120; bottom = H - 60
    for i, (name, col) in enumerate(actors):
        x = xs[i]
        d.rounded_rectangle([x - 110, top, x + 110, top + 56], radius=10, fill=C(col), outline=C(col))
        text_wrap_c(d, x, top + 28, name, font(16, bold=True), 205, "#FFFFFF")
        dash(d, x, top + 56, x, bottom, D_LINE, 2)
    y = top + 110
    af = font(15)
    for m in msgs:
        frm, to, label = m[0], m[1], m[2]
        kind = m[3] if len(m) > 3 else "sync"
        if frm == to:  # self-call
            x = xs[frm]
            d.line([x, y, x + 60, y], fill=C(D_LINE), width=2)
            d.line([x + 60, y, x + 60, y + 26], fill=C(D_LINE), width=2)
            arrow(d, x + 60, y + 26, x, y + 26, D_LINE, 2)
            text_l(d, x + 70, y - 8, label, af, D_INK)
            y += 56
            continue
        x1, x2 = xs[frm], xs[to]
        color = D_GREEN if kind == "return" else D_LINE
        arrow(d, x1, y, x2, y, color, 2, dashed=(kind == "return"))
        midx = (x1 + x2) / 2
        text_wrap_c(d, midx, y - 16, label, af, abs(x2 - x1) - 30, D_INK)
        y += 50
    if note:
        d.rounded_rectangle([margin, bottom - 70, W - margin, bottom - 14], radius=8,
                            fill=C(D_FILL_O), outline=C(D_ORANGE), width=2)
        text_wrap_c(d, W / 2, bottom - 42, note, font(14, italic=True), W - 2 * margin - 30, D_INK)
    return save(img, fname)

def d_seq_auth():
    actors = [("Utilisateur\n(SPA React)", D_BLUE), ("API\n/auth/login", D_NAVY),
              ("AuthController", D_TEAL), ("Sanctum / DB", D_GREEN), ("TwoFactor\n(TOTP)", D_PURPLE)]
    msgs = [
        (0, 1, "POST /auth/login (email, mot de passe)"),
        (1, 1, "throttle:10,1 (anti brute-force)"),
        (1, 2, "login()"),
        (2, 3, "vérifie identifiants (bcrypt)"),
        (3, 2, "utilisateur valide", "return"),
        (2, 4, "2FA activée ? exiger code TOTP"),
        (4, 2, "code vérifié", "return"),
        (2, 3, "createToken() → jeton Bearer"),
        (3, 2, "personal_access_token", "return"),
        (2, 1, "200 { user, token }", "return"),
        (1, 0, "stocke le jeton (Zustand) → routes protégées", "return"),
    ]
    return seq_base("Diagramme de séquence — Authentification (Sanctum + 2FA)", actors, msgs,
                    note="Le jeton Bearer est ensuite joint à l'en-tête Authorization de chaque requête API.",
                    fname="fig_seq_auth.png")

def d_seq_escrow():
    actors = [("Client", D_BLUE), ("API Payments", D_NAVY), ("LedgerService", D_PURPLE),
              ("MySQL\n(verrous)", D_GREEN), ("Freelance", D_TEAL)]
    msgs = [
        (0, 1, "POST /payments/contracts/{id}/fund-escrow"),
        (1, 2, "fundEscrow(client, contract, montant)"),
        (2, 3, "BEGIN · SELECT … FOR UPDATE (wallet + contract)"),
        (2, 3, "balance ↓ , escrow_balance ↑ , escrow_amount ↑"),
        (2, 3, "INSERT transaction (type=escrow, idempotency_key)"),
        (3, 2, "COMMIT", "return"),
        (2, 1, "200 escrow financé", "return"),
        (4, 1, "Livraison du jalon → submit"),
        (0, 1, "POST /payments/milestones/{id}/release"),
        (1, 2, "releaseMilestone(client, milestone)"),
        (2, 3, "commission = montant × 10% ; payout = montant − commission"),
        (2, 3, "platform.balance ↑ ; freelancer.balance ↑ ; escrow ↓"),
        (2, 3, "double-entrée + balance_after (audit)"),
        (3, 2, "COMMIT", "return"),
        (2, 4, "fonds crédités au freelance", "return"),
    ]
    return seq_base("Diagramme de séquence — Escrow & libération de jalon", actors, msgs,
                    note="Atomicité garantie : DB transaction, verrous FOR UPDATE, écriture double-entrée et clé d'idempotence.",
                    fname="fig_seq_escrow.png", H=1140)

def d_seq_stripe():
    actors = [("Client", D_BLUE), ("API", D_NAVY), ("Stripe\nCheckout", D_PURPLE),
              ("Webhook\nController", D_TEAL), ("LedgerService", D_GREEN)]
    msgs = [
        (0, 1, "POST /payments/stripe/deposit-session"),
        (1, 2, "crée une session Checkout (montant)"),
        (2, 1, "url de paiement", "return"),
        (1, 0, "redirection vers Stripe", "return"),
        (0, 2, "saisit la carte · paie"),
        (2, 3, "POST /payments/stripe/webhook (signé)"),
        (3, 3, "vérifie la signature · idempotence (stripe_webhook_events)"),
        (3, 4, "deposit(user, montant)"),
        (4, 3, "wallet.balance ↑ · transaction", "return"),
        (3, 2, "200 reçu", "return"),
    ]
    return seq_base("Diagramme de séquence — Dépôt de fonds via Stripe", actors, msgs,
                    note="Le webhook est public mais protégé par vérification de signature et table d'idempotence.",
                    fname="fig_seq_stripe.png", H=980)

def d_seq_ai():
    actors = [("Freelance", D_BLUE), ("API /ai", D_NAVY), ("AIController", D_TEAL),
              ("Ollama /\nMistral", D_PURPLE), ("ai_histories", D_GREEN)]
    msgs = [
        (0, 1, "POST /ai/generate-proposal (offre, profil)"),
        (1, 1, "throttle:20,1 (protection coût LLM)"),
        (1, 2, "generateProposal()"),
        (2, 3, "prompt structuré → modèle"),
        (3, 2, "texte de proposition", "return"),
        (2, 4, "INSERT historique (type=proposal, tokens_used)"),
        (2, 1, "proposition générée", "return"),
        (1, 0, "affichage + édition", "return"),
    ]
    return seq_base("Diagramme de séquence — Génération de proposition par IA", actors, msgs,
                    note="Cas similaires : match-freelancers, analyze-profile, smart-search, chat (assistant).",
                    fname="fig_seq_ai.png", H=900)

# ── 9. Gantt ────────────────────────────────────────────────────────────────────
def d_gantt():
    W, H = 1600, 760
    img, d = canvas(W, H)
    title_bar(d, W, "Diagramme de Gantt — Planification du projet")
    tasks = [
        ("Étude & cadrage / analyse des besoins", 0, 2, D_BLUE),
        ("Conception (UML, MCD/MLD, maquettes)", 2, 2, D_TEAL),
        ("Socle backend : auth, modèles, migrations", 4, 3, D_NAVY),
        ("Marketplace : offres, propositions, profils", 6, 3, D_BLUE),
        ("Contrats, jalons, suivi du temps", 8, 3, D_PURPLE),
        ("Paiements & escrow (LedgerService, Stripe)", 10, 3, D_GREEN),
        ("Messagerie temps réel, IA, catalogue, agences", 12, 3, D_ORANGE),
        ("Tests, sécurité, dockerisation", 14, 2, D_RED),
        ("Rédaction du rapport & soutenance", 15, 2, D_GREY),
    ]
    weeks = 17
    x0, y0 = 520, 110
    cw = (W - x0 - 40) / weeks
    rh = 56
    for w in range(weeks + 1):
        x = x0 + w * cw
        d.line([x, y0, x, y0 + rh * len(tasks)], fill=C("#E2E6EC"), width=1)
        if w < weeks:
            text_c(d, x + cw / 2, y0 - 16, f"S{w+1}", font(12), D_MUTED)
    for i, (name, start, dur, col) in enumerate(tasks):
        y = y0 + i * rh
        d.line([40, y + rh / 2, x0, y + rh / 2], fill=C("#EDEFF3"), width=1)
        text_l(d, 40, y + rh / 2 - 9, name, font(15), D_INK)
        bx = x0 + start * cw + 4
        bw = dur * cw - 8
        d.rounded_rectangle([bx, y + 12, bx + bw, y + rh - 12], radius=8, fill=C(col), outline=C(col))
        text_c(d, bx + bw / 2, y + rh / 2, f"{dur} sem.", font(13, bold=True), "#FFFFFF")
    return save(img, "fig_gantt.png")

# ── 10. Déploiement Docker ──────────────────────────────────────────────────────
def d_deploy():
    W, H = 1500, 900
    img, d = canvas(W, H)
    title_bar(d, W, "Diagramme de déploiement (conteneurs Docker)")
    d.rounded_rectangle([60, 110, W - 60, H - 70], radius=18, outline=C(D_NAVY), width=3)
    text_l(d, 90, 130, "Hôte Docker  (docker-compose)", font(20, bold=True), D_NAVY)
    cont = [
        ("nginx", "Reverse-proxy · TLS\nport 80/443", D_FILL_B, D_BLUE, 90, 200),
        ("php-fpm (Laravel)", "API REST · queues\nartisan", D_FILL_T, D_TEAL, 470, 200),
        ("vite / nginx (React)", "SPA build statique", D_FILL_B, D_BLUE, 850, 200),
        ("mysql:8", "Données persistantes\n(volume)", D_FILL_G, D_GREEN, 90, 420),
        ("redis", "Cache · sessions\nfile d'attente", D_FILL_O, D_ORANGE, 470, 420),
        ("reverb", "WebSocket\ntemps réel", D_FILL_P, D_PURPLE, 850, 420),
        ("worker (queue)", "Jobs asynchrones\nnotifications · mails", D_FILL_K, D_GREY, 1230 - 380 + 380, 420),
    ]
    boxes = {}
    for (t, s, fl, ol, x, y) in cont[:6]:
        d.rounded_rectangle([x, y, x + 330, y + 140], radius=12, fill=C(fl), outline=C(ol), width=3)
        text_c(d, x + 165, y + 40, t, font(20, bold=True), D_INK)
        text_wrap_c(d, x + 165, y + 95, s.replace("\n", " "), font(15), 300, D_MUTED)
        boxes[t] = (x, y)
    # worker box on its own
    d.rounded_rectangle([90, 640, 420, 760], radius=12, fill=C(D_FILL_K), outline=C(D_GREY), width=3)
    text_c(d, 255, 675, "worker (queue:work)", font(19, bold=True), D_INK)
    text_wrap_c(d, 255, 720, "Jobs asynchrones · notifications · e-mails · facturation hebdomadaire", font(14), 300, D_MUTED)
    # external
    d.rounded_rectangle([900, 640, 1410, 760], radius=12, fill="white", outline=C(D_PURPLE), width=2)
    text_c(d, 1155, 672, "Services externes", font(18, bold=True), D_PURPLE)
    text_wrap_c(d, 1155, 718, "Stripe · Google OAuth · serveur LLM (Ollama/Mistral) · stockage objet", font(14), 480, D_MUTED)
    # links
    arrow(d, 255, 340, 255, 420, D_LINE, 2)
    arrow(d, 635, 340, 635, 420, D_LINE, 2)
    arrow(d, 420, 270, 470, 270, D_LINE, 2, double=True)
    arrow(d, 800, 270, 850, 270, D_LINE, 2, double=True)
    return save(img, "fig_deploy.png")

# ── 11/12. State diagrams ───────────────────────────────────────────────────────
def state_diagram(title, states, transitions, fname, W=1500, H=620):
    img, d = canvas(W, H)
    title_bar(d, W, title)
    pos = {}
    for (name, x, y, col) in states:
        w, h = 230, 78
        d.rounded_rectangle([x, y, x + w, y + h], radius=18, fill=C(col), outline=C(D_NAVY), width=2)
        text_wrap_c(d, x + w / 2, y + h / 2, name, font(16, bold=True), w - 20, D_INK)
        pos[name] = (x, y, w, h)
    # initial node
    d.ellipse([60, 150, 84, 174], fill=C(D_INK))
    for (a, b, label) in transitions:
        if a == "*":
            ax, ay = 84, 162
        else:
            x, y, w, h = pos[a]; ax, ay = x + w, y + h / 2
        x2, y2, w2, h2 = pos[b]; bx, by = x2, y2 + h2 / 2
        if a != "*" and pos[a][1] != y2:  # vertical-ish
            ax, ay = pos[a][0] + pos[a][2] / 2, pos[a][1] + pos[a][3]
            bx, by = x2 + w2 / 2, y2
        arrow(d, ax, ay, bx, by, D_LINE, 2)
        text_c(d, (ax + bx) / 2, (ay + by) / 2 - 12, label, font(13, italic=True), D_NAVY)
    return save(img, fname)

def d_state_contract():
    states = [
        ("Actif", 150, 220, D_FILL_B),
        ("En litige", 560, 110, D_FILL_O),
        ("Terminé", 980, 220, D_FILL_G),
        ("Annulé", 560, 360, D_FILL_K),
        ("Résolu", 980, 110, D_FILL_T),
    ]
    trans = [
        ("*", "Actif", "création (proposition acceptée)"),
        ("Actif", "Terminé", "tous jalons payés / complete()"),
        ("Actif", "En litige", "dispute()"),
        ("Actif", "Annulé", "cancel()"),
        ("En litige", "Résolu", "resolve-dispute (admin)"),
    ]
    return state_diagram("Diagramme d'états — Contrat", states, trans, "fig_state_contract.png", H=560)

def d_state_milestone():
    states = [
        ("En attente", 150, 220, D_FILL_K),
        ("Soumis", 540, 220, D_FILL_O),
        ("Payé", 950, 130, D_FILL_G),
        ("Rejeté", 540, 380, D_FILL_B),
    ]
    trans = [
        ("*", "En attente", "création"),
        ("En attente", "Soumis", "submit() (freelance)"),
        ("Soumis", "Payé", "approve() → release"),
        ("Soumis", "Rejeté", "reject() (client)"),
        ("Rejeté", "Soumis", "re-soumission"),
    ]
    return state_diagram("Diagramme d'états — Jalon (Milestone)", states, trans, "fig_state_milestone.png", H=560)

# ── UI mockup frame (reusable for "screenshots") ────────────────────────────────
def mockup(title, fname, kind="dashboard", subtitle=None, accent=D_BLUE):
    W, H = 1500, 900
    img, d = canvas(W, H, "#EEF1F5")
    # browser chrome
    d.rounded_rectangle([30, 30, W - 30, H - 30], radius=16, fill="white", outline=C("#D4DAE2"), width=2)
    d.rounded_rectangle([30, 30, W - 30, 92], radius=16, fill=C("#F3F5F9"), outline=C("#D4DAE2"), width=2)
    for i, c in enumerate([D_RED, D_ORANGE, D_GREEN]):
        d.ellipse([60 + i * 28, 52, 80 + i * 28, 72], fill=C(c))
    d.rounded_rectangle([170, 48, W - 80, 76], radius=12, fill="white", outline=C("#D4DAE2"), width=1)
    text_l(d, 188, 55, "https://panda.ma/" + kind, font(14), D_MUTED)
    # top app bar
    d.rectangle([32, 94, W - 32, 150], fill=C(D_NAVY))
    d.ellipse([56, 106, 92, 142], fill="#FFFFFF")
    d.ellipse([60, 104, 74, 118], fill=C(D_INK)); d.ellipse([74, 104, 88, 118], fill=C(D_INK))
    d.ellipse([66, 116, 74, 124], fill=C(D_INK)); d.ellipse([74, 116, 82, 124], fill=C(D_INK))
    text_l(d, 102, 110, "PANDA", font(22, bold=True), "#FFFFFF")
    for i, m in enumerate(["Offres", "Talents", "Messages", "Contrats", "Paiements"]):
        text_l(d, 360 + i * 150, 114, m, font(15), "#CBD8EA")
    d.ellipse([W - 90, 104, W - 50, 144], fill=C(accent))

    if kind in ("dashboard", "admin", "freelancer", "client"):
        # sidebar
        d.rectangle([32, 150, 270, H - 32], fill=C("#F5F7FA"))
        for i, m in enumerate(["Tableau de bord", "Mes offres", "Propositions", "Contrats",
                               "Portefeuille", "Messagerie", "Paramètres"]):
            yy = 180 + i * 52
            if i == 0:
                d.rounded_rectangle([46, yy - 8, 256, yy + 30], radius=8, fill=C(D_FILL_B))
            text_l(d, 60, yy, m, font(15, bold=(i == 0)), D_NAVY if i == 0 else D_MUTED)
        # KPI cards
        kx = 300
        for i, (lab, val, col) in enumerate([("Solde", "$ 1 240", D_GREEN), ("En escrow", "$ 800", D_BLUE),
                                             ("Contrats actifs", "5", D_PURPLE), ("Note", "4.9 / 5", D_ORANGE)]):
            x = kx + i * 290
            d.rounded_rectangle([x, 185, x + 265, 305], radius=12, fill="white", outline=C("#E1E6ED"), width=2)
            text_l(d, x + 20, 205, lab, font(15), D_MUTED)
            text_l(d, x + 20, 235, val, font(30, bold=True), col)
        # table
        d.rounded_rectangle([300, 330, W - 60, H - 70], radius=12, fill="white", outline=C("#E1E6ED"), width=2)
        d.rectangle([302, 332, W - 62, 380], fill=C("#F1F4F9"))
        for i, htxt in enumerate(["Élément", "Statut", "Montant", "Date", "Action"]):
            text_l(d, 330 + i * 220, 348, htxt, font(14, bold=True), D_NAVY)
        for r in range(7):
            yy = 392 + r * 58
            if r % 2: d.rectangle([302, yy - 6, W - 62, yy + 46], fill=C("#FAFBFD"))
            text_l(d, 330, yy + 8, f"Ligne d'exemple #{r+1}", font(14), D_INK)
            badge = ["Actif", "Payé", "En attente", "Soumis"][r % 4]
            bc = [D_GREEN, D_BLUE, D_ORANGE, D_PURPLE][r % 4]
            d.rounded_rectangle([330 + 220, yy + 4, 330 + 220 + 110, yy + 32], radius=12, fill=C(bc))
            text_c(d, 330 + 220 + 55, yy + 18, badge, font(13, bold=True), "#FFFFFF")
            text_l(d, 330 + 440, yy + 8, f"$ {(r+1)*120}", font(14), D_INK)
            text_l(d, 330 + 660, yy + 8, "12/06/2025", font(14), D_MUTED)
    elif kind == "auth":
        d.rounded_rectangle([520, 230, 980, 760], radius=16, fill="white", outline=C("#E1E6ED"), width=2)
        text_c(d, 750, 290, title, font(26, bold=True), D_NAVY)
        if subtitle: text_c(d, 750, 330, subtitle, font(15), D_MUTED)
        for i, lab in enumerate(["Adresse e-mail", "Mot de passe"]):
            yy = 380 + i * 90
            text_l(d, 560, yy, lab, font(14), D_MUTED)
            d.rounded_rectangle([560, yy + 24, 940, yy + 66], radius=8, fill="#FFFFFF", outline=C("#CBD2DC"), width=2)
        d.rounded_rectangle([560, 560, 940, 612], radius=10, fill=C(accent))
        text_c(d, 750, 586, "Se connecter", font(17, bold=True), "#FFFFFF")
        d.line([560, 650, 940, 650], fill=C("#E1E6ED"), width=1)
        d.rounded_rectangle([560, 670, 940, 716], radius=10, fill="#FFFFFF", outline=C("#CBD2DC"), width=2)
        text_c(d, 750, 693, "Continuer avec Google", font(15, bold=True), D_INK)
    else:  # generic content / landing
        d.rectangle([32, 150, W - 32, H - 32], fill="white")
        text_c(d, W / 2, 300, title, font(34, bold=True), D_NAVY)
        if subtitle:
            text_wrap_c(d, W / 2, 360, subtitle, font(18), W - 300, D_MUTED)
        for i in range(3):
            x = 220 + i * 380
            d.rounded_rectangle([x, 460, x + 320, 720], radius=14, fill=C(D_FILL_B), outline=C("#E1E6ED"), width=2)
            d.ellipse([x + 130, 500, x + 190, 560], fill=C(accent))
            text_c(d, x + 160, 600, ["Trouver des talents", "Publier une offre", "Être payé en sécurité"][i],
                   font(18, bold=True), D_NAVY)
    # caption strip
    d.rectangle([32, H - 60, W - 32, H - 32], fill=C("#F3F5F9"))
    text_c(d, W / 2, H - 46, title, font(15, italic=True), D_MUTED)
    return save(img, fname)

# ── master ──────────────────────────────────────────────────────────────────────
def generate_all():
    out = {}
    out["architecture"] = d_architecture()
    out["mvc"] = d_mvc()
    out["usecase"] = d_usecase()
    out["class"] = d_class()
    out["mcd"] = d_mcd()
    out["seq_auth"] = d_seq_auth()
    out["seq_escrow"] = d_seq_escrow()
    out["seq_stripe"] = d_seq_stripe()
    out["seq_ai"] = d_seq_ai()
    out["gantt"] = d_gantt()
    out["deploy"] = d_deploy()
    out["state_contract"] = d_state_contract()
    out["state_milestone"] = d_state_milestone()
    # UI mockups
    out["ui_landing"]   = mockup("Page d'accueil — Panda", "fig_ui_landing.png", "landing",
                                 "Mettre en relation freelances et clients, avec paiement sécurisé par escrow.", D_BLUE)
    out["ui_login"]     = mockup("Page de connexion", "fig_ui_login.png", "auth",
                                 "Accédez à votre espace Panda", D_BLUE)
    out["ui_register"]  = mockup("Page d'inscription", "fig_ui_register.png", "auth",
                                 "Créer un compte client ou freelance", D_TEAL)
    out["ui_client"]    = mockup("Tableau de bord — Client", "fig_ui_client.png", "client", accent=D_BLUE)
    out["ui_freelancer"]= mockup("Tableau de bord — Freelance", "fig_ui_freelancer.png", "freelancer", accent=D_TEAL)
    out["ui_admin"]     = mockup("Tableau de bord — Administrateur", "fig_ui_admin.png", "admin", accent=D_RED)
    out["ui_jobs"]      = mockup("Place de marché des offres", "fig_ui_jobs.png", "content",
                                 "Rechercher et filtrer les offres par catégorie, budget et compétences.", D_BLUE)
    out["ui_talent"]    = mockup("Place de marché des freelances", "fig_ui_talent.png", "content",
                                 "Parcourir les profils, compétences et portfolios des freelances.", D_TEAL)
    out["ui_contract"]  = mockup("Détail d'un contrat (jalons, fichiers, temps)", "fig_ui_contract.png", "dashboard", accent=D_PURPLE)
    out["ui_payments"]  = mockup("Portefeuille & paiements", "fig_ui_payments.png", "dashboard", accent=D_GREEN)
    out["ui_chat"]      = mockup("Messagerie temps réel", "fig_ui_chat.png", "content",
                                 "Conversations liées aux offres et contrats, en temps réel via WebSocket.", D_BLUE)
    out["ui_ai"]        = mockup("Assistant IA", "fig_ui_ai.png", "content",
                                 "Génération de propositions, matching et analyse de profil par IA.", D_GREEN)
    return out


def make_emblem():
    """Stylised Moroccan emblem (green pentagram) for the report cover."""
    import math
    S = 360
    img, d = canvas(S, S, "#FFFFFF")
    cx, cy, R = S / 2, S / 2 + 4, 122
    pts = []
    for i in range(5):
        a = -math.pi / 2 + i * 2 * math.pi / 5
        pts.append((cx + R * math.cos(a), cy + R * math.sin(a)))
    order = [0, 2, 4, 1, 3, 0]
    poly = [pts[o] for o in order]
    d.line(poly, fill=C("#0B6B3A"), width=15, joint="curve")
    return save(img, "emblem.png")


if __name__ == "__main__":
    res = generate_all()
    for k, v in res.items():
        print(f"{k:16s} -> {os.path.basename(v)}")
    print(f"\n{len(res)} figures générées dans {ASSETS}")
