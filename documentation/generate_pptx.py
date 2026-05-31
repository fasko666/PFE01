"""
Genere la presentation FreeNest au format PowerPoint (.pptx)
20 slides professionnelles avec design moderne
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Cm
from pptx.enum.dml import MSO_THEME_COLOR
import os

UML = r"C:\Users\Pro\Desktop\PFE O1\documentation\uml_diagrams"

# ── Palette couleurs FreeNest ─────────────────────────────────
BLUE_DARK   = RGBColor(0,   52,  102)   # #003466
BLUE_MAIN   = RGBColor(0,   82,  136)   # #005288
BLUE_LIGHT  = RGBColor(0,  120,  215)   # #0078D7
BLUE_PALE   = RGBColor(235, 245, 255)   # #EBF5FF
ORANGE      = RGBColor(230, 126,  34)   # #E67E22
GREEN       = RGBColor( 39, 174,  96)   # #27AE60
WHITE       = RGBColor(255, 255, 255)
GREY_DARK   = RGBColor( 60,  60,  60)
GREY_MED    = RGBColor(100, 100, 100)
GREY_LIGHT  = RGBColor(245, 247, 250)   # #F5F7FA

W = Inches(13.33)   # widescreen 16:9
H = Inches(7.5)

prs = Presentation()
prs.slide_width  = W
prs.slide_height = H

BLANK = prs.slide_layouts[6]   # blank

# ══════════════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════════════
def rgb_hex(r,g,b): return RGBColor(r,g,b)

def add_rect(slide, x, y, w, h, fill_rgb, alpha=None):
    shape = slide.shapes.add_shape(1, x, y, w, h)  # MSO_SHAPE_TYPE.RECTANGLE=1
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_rgb
    shape.line.fill.background()
    return shape

def add_text(slide, text, x, y, w, h,
             font_size=18, bold=False, color=WHITE,
             align=PP_ALIGN.LEFT, wrap=True, font="Calibri"):
    txBox = slide.shapes.add_textbox(x, y, w, h)
    tf    = txBox.text_frame
    tf.word_wrap = wrap
    p     = tf.paragraphs[0]
    p.alignment = align
    run   = p.add_run()
    run.text      = text
    run.font.name = font
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.color.rgb = color
    return txBox

def add_img(slide, path, x, y, w, h=None):
    if not os.path.exists(path):
        return None
    if h:
        return slide.shapes.add_picture(path, x, y, w, h)
    else:
        return slide.shapes.add_picture(path, x, y, w)

def bullet_list(slide, items, x, y, w, h,
                font_size=16, color=GREY_DARK, icon="  •  "):
    txBox = slide.shapes.add_textbox(x, y, w, h)
    tf    = txBox.text_frame
    tf.word_wrap = True
    first = True
    for item in items:
        if first:
            p = tf.paragraphs[0]
            first = False
        else:
            p = tf.add_paragraph()
        p.space_before = Pt(3)
        run = p.add_run()
        run.text      = icon + item
        run.font.size = Pt(font_size)
        run.font.name = "Calibri"
        run.font.color.rgb = color
    return txBox

def two_col_list(slide, items, x, y, w, h, font_size=14, color=GREY_DARK):
    """Split list into 2 columns."""
    half = len(items) // 2 + len(items) % 2
    col_w = w // 2 - Inches(0.1)
    bullet_list(slide, items[:half], x,        y, col_w, h, font_size, color)
    bullet_list(slide, items[half:], x+col_w+Inches(0.2), y, col_w, h, font_size, color)

def slide_header(slide, title, subtitle=None,
                 bar_color=BLUE_MAIN, title_color=WHITE,
                 bar_h=Inches(1.15)):
    """Top bar with title."""
    add_rect(slide, 0, 0, W, bar_h, bar_color)
    add_text(slide, title,
             Inches(0.4), Inches(0.12), Inches(12), Inches(0.7),
             font_size=28, bold=True, color=title_color)
    if subtitle:
        add_text(slide, subtitle,
                 Inches(0.4), Inches(0.78), Inches(12), Inches(0.4),
                 font_size=15, bold=False, color=RGBColor(200,220,255))
    add_rect(slide, 0, bar_h, W, Inches(0.04), ORANGE)

def slide_bg(slide, color=GREY_LIGHT):
    add_rect(slide, 0, 0, W, H, color)

def divider(slide, y, color=BLUE_LIGHT, h=Inches(0.03)):
    add_rect(slide, Inches(0.4), y, Inches(12.5), h, color)

def badge(slide, text, x, y, bg=BLUE_LIGHT, fg=WHITE, font_size=13):
    bw = Inches(2.2)
    bh = Inches(0.38)
    r  = slide.shapes.add_shape(5, x, y, bw, bh)  # rounded rect
    r.fill.solid()
    r.fill.fore_color.rgb = bg
    r.line.fill.background()
    tf = r.text_frame
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = tf.paragraphs[0].add_run()
    run.text      = text
    run.font.size = Pt(font_size)
    run.font.bold = True
    run.font.color.rgb = fg
    run.font.name = "Calibri"
    return r

def stat_box(slide, number, label, x, y, bg=BLUE_MAIN):
    bw, bh = Inches(2.0), Inches(1.4)
    add_rect(slide, x, y, bw, bh, bg)
    add_text(slide, number, x, y+Inches(0.18), bw, Inches(0.7),
             font_size=30, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, label,  x, y+Inches(0.82), bw, Inches(0.55),
             font_size=12,  bold=False, color=RGBColor(200,225,255),
             align=PP_ALIGN.CENTER)

def info_row(slide, label, value, x, y, label_w=Inches(3.5), total_w=Inches(9)):
    add_text(slide, label+"  :", x, y, label_w, Inches(0.38),
             font_size=14, bold=True, color=BLUE_MAIN)
    add_text(slide, value, x+label_w, y, total_w-label_w, Inches(0.38),
             font_size=14, bold=False, color=GREY_DARK)

def tech_pill(slide, label, x, y, bg=BLUE_MAIN):
    w, h = Inches(1.9), Inches(0.4)
    r = slide.shapes.add_shape(5, x, y, w, h)
    r.fill.solid()
    r.fill.fore_color.rgb = bg
    r.line.fill.background()
    tf = r.text_frame
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    run = tf.paragraphs[0].add_run()
    run.text      = label
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = WHITE
    run.font.name = "Calibri"

# ══════════════════════════════════════════════════════════════
#  SLIDE 1 — PAGE DE TITRE
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
# Fond degrade simule : partie gauche sombre, droite claire
add_rect(sl, 0,        0, W,            H, BLUE_DARK)
add_rect(sl, Inches(7),0, Inches(6.33), H, BLUE_MAIN)
# Bande orange verticale
add_rect(sl, Inches(7)-Inches(0.08), 0, Inches(0.08), H, ORANGE)

add_text(sl, "FREENEST", Inches(0.6), Inches(0.9), Inches(6), Inches(1.2),
         font_size=60, bold=True, color=WHITE, font="Calibri")
add_text(sl, "Marketplace Freelance Full-Stack", Inches(0.6), Inches(2.0),
         Inches(6.2), Inches(0.6),
         font_size=22, bold=False, color=RGBColor(180,210,255))
add_text(sl, "avec Intelligence Artificielle",   Inches(0.6), Inches(2.55),
         Inches(6.2), Inches(0.6),
         font_size=22, bold=False, color=ORANGE)

add_rect(sl, Inches(0.6), Inches(3.3), Inches(5.5), Inches(0.04), ORANGE)

rows = [
    ("Realise par",  "Ayoub Elmernissi"),
    ("Email",        "ayoubelmerniss55@gmail.com"),
    ("Etablissement","[Nom de l'etablissement]"),
    ("Filiere",      "Developpement Web / Informatique"),
    ("Annee",        "2025 – 2026"),
]
for i,(l,v) in enumerate(rows):
    yy = Inches(3.55) + i*Inches(0.62)
    add_text(sl, l+" :", Inches(0.6), yy, Inches(1.7), Inches(0.55),
             font_size=13, bold=True, color=ORANGE)
    add_text(sl, v,     Inches(2.35), yy, Inches(4.5), Inches(0.55),
             font_size=13, bold=False, color=RGBColor(200,220,255))

# Panneau droit - infos clés
add_text(sl, "Technologies Cles", Inches(7.3), Inches(0.7), Inches(5.5), Inches(0.55),
         font_size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
techs = ["Laravel 12","React 19","MySQL","Ollama / Mistral",
         "Socket.IO","Three.js","Sanctum","TailwindCSS","Framer Motion","Stripe Ready"]
for i,t in enumerate(techs):
    row, col = divmod(i,2)
    tech_pill(sl, t, Inches(7.4)+col*Inches(2.1), Inches(1.35)+row*Inches(0.56),
              bg=BLUE_DARK if i%3==0 else (GREEN if i%3==1 else ORANGE))

add_text(sl, "Rapport de PFE  |  Ayoub Elmernissi",
         0, H-Inches(0.4), W, Inches(0.4),
         font_size=11, color=RGBColor(120,150,200), align=PP_ALIGN.CENTER)

# ══════════════════════════════════════════════════════════════
#  SLIDE 2 — PLAN
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Plan de la Presentation",
             "FreeNest — Marketplace Freelance avec IA")

items_plan = [
    ("1.",  "Contexte et Problematique"),
    ("2.",  "Presentation de FreeNest"),
    ("3.",  "Technologies utilisees"),
    ("4.",  "Architecture du systeme"),
    ("5.",  "Module Authentification & Onboarding"),
    ("6.",  "Module Marketplace et Offres"),
    ("7.",  "Module Propositions et Contrats"),
    ("8.",  "Module Paiements & Escrow"),
    ("9.",  "Module Messagerie Temps Reel"),
    ("10.", "Module Intelligence Artificielle"),
    ("11.", "Base de donnees"),
    ("12.", "Securite"),
    ("13.", "Demonstration Live"),
    ("14.", "Difficultes et Solutions"),
    ("15.", "Bilan et Perspectives"),
]
half = 8
for i,(num,title) in enumerate(items_plan[:half]):
    y  = Inches(1.35)+i*Inches(0.67)
    add_rect(sl, Inches(0.4), y, Inches(0.5), Inches(0.45), BLUE_MAIN)
    add_text(sl, num, Inches(0.4), y, Inches(0.5), Inches(0.45),
             font_size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(sl, title, Inches(1.0), y, Inches(5.3), Inches(0.45),
             font_size=14, bold=False, color=GREY_DARK)
for i,(num,title) in enumerate(items_plan[half:]):
    y  = Inches(1.35)+i*Inches(0.67)
    add_rect(sl, Inches(6.9), y, Inches(0.5), Inches(0.45), ORANGE)
    add_text(sl, num, Inches(6.9), y, Inches(0.5), Inches(0.45),
             font_size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(sl, title, Inches(7.5), y, Inches(5.4), Inches(0.45),
             font_size=14, bold=False, color=GREY_DARK)

# ══════════════════════════════════════════════════════════════
#  SLIDE 3 — CONTEXTE ET PROBLEMATIQUE
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Contexte et Problematique",
             "Le marche du travail freelance en plein essor")

add_text(sl, "Le marche freelance represente +36% de la population active mondiale d'ici 2030.",
         Inches(0.4), Inches(1.2), Inches(12.5), Inches(0.5),
         font_size=16, bold=False, color=GREY_DARK)

# 4 cartes problemes
problems = [
    (BLUE_MAIN,  "Langue",         "Upwork / Fiverr\nmajoritairement\nen anglais"),
    (ORANGE,     "IA Premium",     "Fonctions IA\nreservees aux\nabonnements chers"),
    (GREEN,      "Commissions",    "Jusqu'a 20%\nprelevement par\ntransaction"),
    (RGBColor(142,68,173), "Complexite", "Interfaces peu\nintuitives pour\nles debutants"),
]
for i,(bg,title,desc) in enumerate(problems):
    x = Inches(0.4) + i*Inches(3.2)
    add_rect(sl, x, Inches(1.9), Inches(3.0), Inches(2.1), bg)
    add_text(sl, title, x, Inches(1.92), Inches(3.0), Inches(0.6),
             font_size=17, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(sl, desc,  x, Inches(2.55), Inches(3.0), Inches(1.2),
             font_size=13, bold=False, color=RGBColor(220,240,255),
             align=PP_ALIGN.CENTER)

add_rect(sl, 0, Inches(4.22), W, Inches(0.06), ORANGE)

add_text(sl, "Solution : FreeNest",
         Inches(0.4), Inches(4.4), Inches(4), Inches(0.55),
         font_size=22, bold=True, color=BLUE_MAIN)
add_text(sl, "Une marketplace moderne, accessible, avec IA gratuite et paiement escrow transparent.",
         Inches(0.4), Inches(4.95), Inches(12.5), Inches(0.55),
         font_size=16, bold=False, color=GREY_DARK)

features = ["IA integree pour tous","Commission fixe 10%","Escrow securise","Interface 3D moderne","OAuth Google","Temps reel Socket.IO"]
for i,f in enumerate(features):
    row,col = divmod(i,3)
    badge(sl, f, Inches(0.4)+col*Inches(4.2), Inches(5.7)+row*Inches(0.55),
          bg=BLUE_MAIN if row==0 else ORANGE, fg=WHITE, font_size=12)

# ══════════════════════════════════════════════════════════════
#  SLIDE 4 — PRESENTATION FREENEST
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Presentation de FreeNest",
             "Marketplace Freelance Full-Stack avec Intelligence Artificielle")

infos = [
    ("Nom",             "FreeNest  (alias Panda)"),
    ("Type",            "Marketplace B2B / B2C Freelance"),
    ("Backend",         "Laravel 12  (PHP 8.2+)"),
    ("Frontend",        "React 19  +  Vite  +  TailwindCSS"),
    ("Base de donnees", "MySQL 8.0  —  19 tables"),
    ("Authentification","Sanctum  +  JWT  +  Google OAuth"),
    ("Intelligence IA", "Ollama  (modele Mistral 7B)"),
    ("Temps reel",      "Socket.IO 4.8"),
    ("Paiements",       "Systeme Escrow  +  Stripe Ready"),
]
for i,(l,v) in enumerate(infos):
    y = Inches(1.3)+i*Inches(0.55)
    if i%2==0:
        add_rect(sl, Inches(0.3), y, Inches(8.5), Inches(0.5), BLUE_PALE)
    info_row(sl, l, v, Inches(0.35), y+Inches(0.07))

# Stats droite
for val,lbl,bg in [
    ("19","Tables BDD",    BLUE_MAIN),
    ("40+","Endpoints API",ORANGE),
    ("53+","Composants",   GREEN),
    ("5","Features IA",    RGBColor(142,68,173)),
]:
    idx = [("19","Tables BDD",BLUE_MAIN),("40+","Endpoints API",ORANGE),
           ("53+","Composants",GREEN),("5","Features IA",RGBColor(142,68,173))].index((val,lbl,bg))
    stat_box(sl, val, lbl,
             Inches(9.1)+Inches(0.05)*(idx%2), Inches(1.3)+(idx//2)*Inches(1.6)+idx%2*Inches(0.1), bg)

# ══════════════════════════════════════════════════════════════
#  SLIDE 5 — TECHNOLOGIES
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Stack Technologique",
             "Technologies modernes choisies pour performance et maintenabilite")

sections = [
    ("BACKEND",          BLUE_MAIN, [
        "Laravel 12     —  Framework PHP MVC",
        "Sanctum 4.3    —  Auth tokens Bearer",
        "Socialite 5.27 —  OAuth Google",
        "Spatie 6.25    —  Roles et permissions",
        "JWT Auth 2.3   —  JSON Web Tokens",
        "Intervention   —  Traitement images",
    ]),
    ("FRONTEND",         ORANGE, [
        "React 19.2     —  UI reactive",
        "Vite           —  Build ultra-rapide",
        "TailwindCSS 3.4—  Styles utilitaires",
        "Zustand 5.0    —  State management",
        "Three.js + R3F —  Rendu 3D",
        "Framer Motion  —  Animations",
    ]),
    ("BASE DE DONNEES",  GREEN, [
        "MySQL 8.0      —  SGBDR relationnel",
        "Eloquent ORM   —  Requetes elegantes",
        "19 tables      —  Schema complet",
        "Migrations     —  Versionnees",
    ]),
    ("SPECIAL",          RGBColor(142,68,173), [
        "Ollama / Mistral 7B  —  IA locale",
        "Socket.IO 4.8        —  Temps reel",
        "Axios 1.16           —  Client HTTP",
        "Recharts 3.8         —  Graphiques",
        "Stripe SDK           —  Paiements",
    ]),
]
col_w = Inches(3.2)
for i,(title,color,items) in enumerate(sections):
    x = Inches(0.3) + i*col_w
    add_rect(sl, x, Inches(1.25), col_w-Inches(0.1), Inches(0.5), color)
    add_text(sl, title, x, Inches(1.27), col_w-Inches(0.1), Inches(0.46),
             font_size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    for j,item in enumerate(items):
        y = Inches(1.85)+j*Inches(0.7)
        if j%2==0:
            add_rect(sl, x, y, col_w-Inches(0.1), Inches(0.65), RGBColor(240,245,255))
        add_text(sl, item, x+Inches(0.1), y+Inches(0.1),
                 col_w-Inches(0.25), Inches(0.5),
                 font_size=12, bold=False, color=GREY_DARK)

# ══════════════════════════════════════════════════════════════
#  SLIDE 6 — ARCHITECTURE
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Architecture du Systeme",
             "Full-Stack decouple — API REST stateless")

layers = [
    (BLUE_LIGHT,  "NAVIGATEUR  (Chrome / Firefox)",
     "React 19 + Vite  —  port 5173\n53+ composants  |  Zustand  |  Axios"),
    (BLUE_MAIN,   "BACKEND  (Laravel 12)",
     "10 Controleurs  |  40+ Endpoints REST\nMiddleware Auth + Roles  |  17 Modeles Eloquent"),
    (ORANGE,      "BASE DE DONNEES  (MySQL 8.0)",
     "19 tables  |  200+ colonnes  |  15+ relations FK\nMigrations versionnees"),
    (GREEN,       "IA & TEMPS REEL",
     "Ollama / Mistral 7B  (port 11434)\nSocket.IO Server  (port 3001)"),
]
for i,(bg,title,desc) in enumerate(layers):
    y = Inches(1.25)+i*Inches(1.38)
    add_rect(sl, Inches(1.5), y, Inches(10), Inches(1.22), bg)
    add_text(sl, title, Inches(1.6), y+Inches(0.1), Inches(9.8), Inches(0.48),
             font_size=16, bold=True, color=WHITE)
    add_text(sl, desc,  Inches(1.6), y+Inches(0.58), Inches(9.8), Inches(0.58),
             font_size=13, bold=False, color=RGBColor(220,240,255))
    if i < len(layers)-1:
        add_text(sl, "REST API  |  Bearer Token  |  JSON",
                 Inches(4.5), y+Inches(1.22), Inches(4.3), Inches(0.3),
                 font_size=11, bold=False, color=GREY_MED, align=PP_ALIGN.CENTER)

add_text(sl,
    "Avantages : Separation des responsabilites  —  Scalabilite horizontale  —  App mobile possible sans modifier le backend",
    Inches(0.4), Inches(6.95), Inches(12.5), Inches(0.45),
    font_size=12, bold=False, color=GREY_MED, align=PP_ALIGN.CENTER)

# ══════════════════════════════════════════════════════════════
#  SLIDE 7 — AUTHENTIFICATION & ONBOARDING
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Module 1 — Authentification & Onboarding",
             "3 methodes d'auth  |  Onboarding freelancer en 5 etapes")

# Gauche : 3 methodes
add_text(sl, "3 Methodes d'Authentification",
         Inches(0.4), Inches(1.3), Inches(5.8), Inches(0.5),
         font_size=17, bold=True, color=BLUE_MAIN)
methods = [
    (BLUE_MAIN, "Email + Mot de passe", "Sanctum Bearer Token\nRevocable a la deconnexion"),
    (ORANGE,    "Google OAuth",         "Laravel Socialite\nCreation auto du compte"),
    (GREEN,     "JWT Auth",             "JSON Web Tokens\nAPI stateless"),
]
for i,(bg,title,desc) in enumerate(methods):
    y = Inches(1.9)+i*Inches(1.2)
    add_rect(sl, Inches(0.4), y, Inches(0.08), Inches(0.95), bg)
    add_rect(sl, Inches(0.5), y, Inches(5.5),  Inches(0.95), RGBColor(245,248,252))
    add_text(sl, title, Inches(0.65), y+Inches(0.08), Inches(5.3), Inches(0.42),
             font_size=15, bold=True,  color=bg)
    add_text(sl, desc,  Inches(0.65), y+Inches(0.5),  Inches(5.3), Inches(0.42),
             font_size=12, bold=False, color=GREY_DARK)

# Droite : Onboarding 5 etapes
add_text(sl, "Onboarding Freelancer — 5 Etapes",
         Inches(6.5), Inches(1.3), Inches(6.4), Inches(0.5),
         font_size=17, bold=True, color=BLUE_MAIN)
steps = [
    ("1","Categorie principale  +  Specialites"),
    ("2","Niveau d'experience  (entry / mid / expert)"),
    ("3","Formation et education"),
    ("4","Disponibilite  +  Heures/sem  +  Tarif"),
    ("5","Photo de profil  +  Langues parlees"),
]
for i,(num,text) in enumerate(steps):
    y = Inches(1.88)+i*Inches(0.96)
    add_rect(sl, Inches(6.5), y, Inches(0.55), Inches(0.75),
             BLUE_MAIN if i<4 else GREEN)
    add_text(sl, num, Inches(6.5), y, Inches(0.55), Inches(0.75),
             font_size=20, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(sl, text, Inches(7.15), y+Inches(0.15), Inches(5.7), Inches(0.5),
             font_size=14, bold=False, color=GREY_DARK)
    if i < 4:
        add_rect(sl, Inches(6.72), y+Inches(0.75), Inches(0.1), Inches(0.2), BLUE_LIGHT)

# ══════════════════════════════════════════════════════════════
#  SLIDE 8 — MARKETPLACE ET OFFRES
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Module 2 — Marketplace des Offres",
             "Publication, recherche et filtrage des offres d'emploi")

add_text(sl, "Cote CLIENT — Publier une offre",
         Inches(0.4), Inches(1.3), Inches(5.8), Inches(0.5),
         font_size=16, bold=True, color=BLUE_MAIN)
client_fields = [
    "Titre et description detaillee","Categorie et competences (JSON)",
    "Type : horaire ou forfait","Budget minimum / maximum",
    "Niveau d'experience requis","Duree estimee du projet",
    "Options : mis en avant / urgent",
]
bullet_list(sl, client_fields, Inches(0.4), Inches(1.85), Inches(5.8), Inches(3.0),
            font_size=13, color=GREY_DARK)

divider(sl, Inches(5.0))

add_text(sl, "Cycle de vie d'une offre :",
         Inches(0.4), Inches(5.1), Inches(5), Inches(0.45),
         font_size=14, bold=True, color=BLUE_MAIN)
states = [("draft","Brouillon",GREY_MED),("open","Ouverte",GREEN),
          ("in_progress","En cours",ORANGE),("completed","Terminee",BLUE_MAIN)]
for i,(code,label,col) in enumerate(states):
    x = Inches(0.4)+i*Inches(3.0)
    add_rect(sl, x, Inches(5.65), Inches(2.6), Inches(0.65), col)
    add_text(sl, label+"\n("+code+")", x, Inches(5.65), Inches(2.6), Inches(0.65),
             font_size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    if i<3:
        add_text(sl, "->", x+Inches(2.6), Inches(5.78), Inches(0.4), Inches(0.38),
                 font_size=16, bold=True, color=GREY_MED)

# Droite : filtres
add_text(sl, "Cote FREELANCER — Recherche & Filtres",
         Inches(6.5), Inches(1.3), Inches(6.4), Inches(0.5),
         font_size=16, bold=True, color=BLUE_MAIN)
filters = [
    ("Mots-cles",   "Recherche dans titre et description"),
    ("Categorie",   "Hierarchie parent / enfant"),
    ("Budget",      "Min / Max configurable"),
    ("Type",        "Horaire ou forfait"),
    ("Experience",  "Entry / Mid / Expert"),
    ("Tri",         "Recents / Budget / Popularite"),
]
for i,(lbl,val) in enumerate(filters):
    y = Inches(1.88)+i*Inches(0.77)
    add_rect(sl, Inches(6.5), y, Inches(1.4), Inches(0.6), BLUE_MAIN)
    add_text(sl, lbl, Inches(6.5), y, Inches(1.4), Inches(0.6),
             font_size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(sl, val, Inches(8.05), y+Inches(0.1), Inches(4.8), Inches(0.45),
             font_size=13, bold=False, color=GREY_DARK)

# ══════════════════════════════════════════════════════════════
#  SLIDE 9 — PROPOSITIONS ET CONTRATS
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Module 3 & 4 — Propositions et Contrats",
             "Soumission, acceptation et creation automatique du contrat")

# Workflow central
workflow = [
    (BLUE_MAIN,  "CLIENT",     "Publie\nune offre"),
    (BLUE_LIGHT, "SYSTEME",    "Notifie les\nfreelancers"),
    (GREEN,      "FREELANCER", "Soumet une\nproposition"),
    (ORANGE,     "IA",         "Genere la\nlettre (optionnel)"),
    (BLUE_MAIN,  "CLIENT",     "Accepte\nla proposition"),
    (GREEN,      "SYSTEME",    "CONTRAT\nCREE AUTO"),
]
for i,(bg,actor,action) in enumerate(workflow):
    x = Inches(0.3)+i*Inches(2.15)
    add_rect(sl, x, Inches(1.25), Inches(1.95), Inches(0.4), bg)
    add_text(sl, actor, x, Inches(1.25), Inches(1.95), Inches(0.4),
             font_size=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_rect(sl, x, Inches(1.72), Inches(1.95), Inches(1.0), RGBColor(240,245,255))
    add_text(sl, action, x, Inches(1.78), Inches(1.95), Inches(0.9),
             font_size=13, bold=False, color=GREY_DARK, align=PP_ALIGN.CENTER)
    if i<5:
        add_text(sl, ">>>", x+Inches(1.95), Inches(2.05), Inches(0.2), Inches(0.4),
                 font_size=14, bold=True, color=ORANGE, align=PP_ALIGN.CENTER)

add_rect(sl, 0, Inches(2.9), W, Inches(0.05), ORANGE)

# Proposition details
add_text(sl, "Une Proposition contient :",
         Inches(0.4), Inches(3.05), Inches(5.8), Inches(0.45),
         font_size=15, bold=True, color=BLUE_MAIN)
prop_items = [
    "Lettre de motivation (ou generee par IA)",
    "Montant propose (bid_amount)",
    "Duree estimee + unite",
    "Jalons optionnels (JSON)",
    "Pieces jointes",
    "Marque si IA generated",
]
bullet_list(sl, prop_items, Inches(0.4), Inches(3.55), Inches(5.8), Inches(2.8),
            font_size=13, color=GREY_DARK)

# Contrat details
add_text(sl, "Un Contrat contient :",
         Inches(6.8), Inches(3.05), Inches(6), Inches(0.45),
         font_size=15, bold=True, color=BLUE_MAIN)
contract_items = [
    "Liaison Job + Proposition + 2 users",
    "Type : horaire ou forfait",
    "Montant total + escrow_amount",
    "Statuts : active / paused / completed",
    "Jalons avec montants et delais",
    "Date de debut et deadline",
]
bullet_list(sl, contract_items, Inches(6.8), Inches(3.55), Inches(6.0), Inches(2.8),
            font_size=13, color=GREY_DARK)

add_text(sl, "Creation AUTOMATIQUE du contrat lors de l'acceptation  —  Conversation ouverte automatiquement",
         Inches(0.4), Inches(6.9), Inches(12.5), Inches(0.45),
         font_size=13, bold=True, color=BLUE_MAIN, align=PP_ALIGN.CENTER)

# ══════════════════════════════════════════════════════════════
#  SLIDE 10 — PAIEMENTS ESCROW
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Module 5 — Paiements & Escrow",
             "Systeme de paiement securise avec 3 soldes distincts")

# Wallet
add_text(sl, "PORTEFEUILLE (Wallet)",
         Inches(0.4), Inches(1.3), Inches(4), Inches(0.45),
         font_size=16, bold=True, color=BLUE_MAIN)
wallets = [
    (BLUE_MAIN,  "balance",          "Solde disponible",  "$1 200"),
    (ORANGE,     "pending_balance",  "En attente",        "$50"),
    (RGBColor(142,68,173), "escrow_balance", "Bloque escrow", "$300"),
]
for i,(bg,field,label,ex) in enumerate(wallets):
    y = Inches(1.85)+i*Inches(0.85)
    add_rect(sl, Inches(0.4), y, Inches(0.08), Inches(0.7), bg)
    add_rect(sl, Inches(0.5), y, Inches(5.0),  Inches(0.7), RGBColor(240,245,252))
    add_text(sl, field,  Inches(0.6), y+Inches(0.05), Inches(3.0), Inches(0.35),
             font_size=13, bold=True, color=bg)
    add_text(sl, label,  Inches(0.6), y+Inches(0.38), Inches(3.0), Inches(0.3),
             font_size=11, bold=False, color=GREY_MED)
    add_text(sl, ex,     Inches(4.0), y+Inches(0.15), Inches(1.4), Inches(0.4),
             font_size=16, bold=True, color=bg, align=PP_ALIGN.RIGHT)

# 4 phases
add_text(sl, "Les 4 Phases du Paiement Securise",
         Inches(6.3), Inches(1.3), Inches(6.6), Inches(0.45),
         font_size=16, bold=True, color=BLUE_MAIN)
phases = [
    (BLUE_MAIN,  "1. DEPOT",      "Client depose 1 500$\nwallet.balance += 1500"),
    (ORANGE,     "2. ESCROW",     "Finance jalon (300$)\nbalance-=300 / escrow+=300"),
    (GREEN,      "3. LIVRAISON",  "Freelancer soumet\nmilestone.status = 'submitted'"),
    (RGBColor(142,68,173), "4. LIBERATION", "Client approuve\n90% freelancer + 10% commission"),
]
for i,(bg,title,desc) in enumerate(phases):
    x = Inches(6.3)+i*Inches(1.72)
    add_rect(sl, x, Inches(1.88), Inches(1.62), Inches(2.0), bg)
    add_text(sl, title, x, Inches(1.9), Inches(1.62), Inches(0.55),
             font_size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(sl, desc,  x, Inches(2.5), Inches(1.62), Inches(1.3),
             font_size=11, bold=False, color=RGBColor(220,240,255),
             align=PP_ALIGN.CENTER)

add_rect(sl, 0, Inches(4.1), W, Inches(0.05), ORANGE)

# Commission
add_text(sl, "Modele economique :",
         Inches(0.4), Inches(4.25), Inches(5), Inches(0.45),
         font_size=16, bold=True, color=BLUE_MAIN)
add_text(sl, "Commission plateforme = 10%  par liberation",
         Inches(0.4), Inches(4.8), Inches(12.5), Inches(0.45),
         font_size=15, bold=False, color=GREY_DARK)
add_text(sl, "Exemple : Jalon 300$   =>   Freelancer recoit 270$   |   Plateforme gagne 30$",
         Inches(0.4), Inches(5.35), Inches(12.5), Inches(0.45),
         font_size=14, bold=True, color=ORANGE)

# Security points
sec_items = [
    "L'argent est bloque AVANT le debut du travail",
    "Freelancer garanti : impossible de ne pas etre paye si le jalon est approuve",
    "Client garanti : l'argent n'est libere QUE sur son approbation",
    "Transactions atomiques MySQL : DB::transaction()",
]
bullet_list(sl, sec_items, Inches(0.4), Inches(5.95), Inches(12.5), Inches(1.4),
            font_size=13, color=GREY_DARK, icon="  [OK]  ")

# ══════════════════════════════════════════════════════════════
#  SLIDE 11 — MESSAGERIE TEMPS REEL
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Module 6 — Messagerie Temps Reel",
             "Socket.IO + Laravel API REST  —  Persistance et instantaneite")

# Architecture
add_text(sl, "Architecture", Inches(0.4), Inches(1.3), Inches(5.8), Inches(0.45),
         font_size=16, bold=True, color=BLUE_MAIN)
layers2 = [
    (BLUE_MAIN,  "Freelancer (React)",   "socket.send()  +  HTTP POST"),
    (ORANGE,     "Socket.IO Server",     "Broadcast instantane au destinataire"),
    (GREEN,      "Laravel API",          "Validation + persistance MySQL"),
    (RGBColor(142,68,173), "MySQL",      "Messages stockes + conversations"),
]
for i,(bg,title,desc) in enumerate(layers2):
    y = Inches(1.85)+i*Inches(1.1)
    add_rect(sl, Inches(0.4), y, Inches(5.6), Inches(0.95), bg)
    add_text(sl, title, Inches(0.55), y+Inches(0.08), Inches(5.4), Inches(0.42),
             font_size=14, bold=True, color=WHITE)
    add_text(sl, desc,  Inches(0.55), y+Inches(0.52), Inches(5.4), Inches(0.38),
             font_size=12, bold=False, color=RGBColor(220,240,255))

# Features
add_text(sl, "Fonctionnalites", Inches(6.5), Inches(1.3), Inches(6.4), Inches(0.45),
         font_size=16, bold=True, color=BLUE_MAIN)
feat = [
    ("Direct",           "Freelancer <-> Client"),
    ("Groupe",           "Lie a un contrat specifique"),
    ("Fichiers",         "Texte / images / documents"),
    ("Threading",        "Reponse a un message cible"),
    ("Lu / Non-lu",      "is_read  +  read_at timestamp"),
    ("Pagination",       "Chargement lazy au scroll"),
    ("Auto-creation",    "A l'acceptation d'une proposition"),
]
for i,(lbl,val) in enumerate(feat):
    y = Inches(1.88)+i*Inches(0.73)
    add_rect(sl, Inches(6.5), y, Inches(2.2), Inches(0.6), BLUE_MAIN)
    add_text(sl, lbl, Inches(6.5), y, Inches(2.2), Inches(0.6),
             font_size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(sl, val, Inches(8.8), y+Inches(0.1), Inches(4.6), Inches(0.45),
             font_size=13, bold=False, color=GREY_DARK)

# ══════════════════════════════════════════════════════════════
#  SLIDE 12 — INTELLIGENCE ARTIFICIELLE
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Module 7 — Intelligence Artificielle",
             "Ollama / Mistral 7B  —  5 fonctionnalites IA integ rees")

# Flux
add_text(sl, "Flux d'Integration IA",
         Inches(0.4), Inches(1.3), Inches(8), Inches(0.45),
         font_size=16, bold=True, color=BLUE_MAIN)
flux = ["Utilisateur", "AIController", "MySQL (contexte)", "Ollama / Mistral", "ai_histories", "Frontend"]
flux_bg=[BLUE_LIGHT,BLUE_MAIN,GREEN,ORANGE,RGBColor(142,68,173),BLUE_LIGHT]
for i,(f,bg) in enumerate(zip(flux,flux_bg)):
    x = Inches(0.35)+i*Inches(2.15)
    add_rect(sl, x, Inches(1.85), Inches(1.95), Inches(0.65), bg)
    add_text(sl, f, x, Inches(1.87), Inches(1.95), Inches(0.62),
             font_size=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    if i<5:
        add_text(sl, ">>>", x+Inches(1.95), Inches(1.95), Inches(0.2), Inches(0.45),
                 font_size=13, bold=True, color=GREY_MED, align=PP_ALIGN.CENTER)

add_rect(sl, 0, Inches(2.65), W, Inches(0.05), ORANGE)

# 5 features
add_text(sl, "5 Fonctionnalites IA", Inches(0.4), Inches(2.8), Inches(8), Inches(0.45),
         font_size=16, bold=True, color=BLUE_MAIN)
ia_features = [
    (BLUE_MAIN,  "Generation Proposition", "Lettre adaptee a l'offre\net au profil freelancer"),
    (ORANGE,     "Matching Freelancers",    "Meilleures suggestions\npour une offre client"),
    (GREEN,      "Analyse de Profil",       "Conseils personnalises\npour ameliorer son profil"),
    (RGBColor(142,68,173), "Chat Assistant","Aide contextuelle\nsur la plateforme"),
    (RGBColor(41,128,185), "Smart Search",  "Recherche en\nlangage naturel"),
]
for i,(bg,title,desc) in enumerate(ia_features):
    x = Inches(0.3)+i*Inches(2.6)
    add_rect(sl, x, Inches(3.3), Inches(2.45), Inches(2.8), bg)
    add_text(sl, title, x, Inches(3.32), Inches(2.45), Inches(0.7),
             font_size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(sl, desc,  x, Inches(4.1), Inches(2.45), Inches(1.8),
             font_size=12, bold=False, color=RGBColor(220,240,255),
             align=PP_ALIGN.CENTER)

add_text(sl,
    "Fallback automatique : si Ollama est indisponible, des reponses pre-definies intelligentes sont retournees",
    Inches(0.4), Inches(6.35), Inches(12.5), Inches(0.45),
    font_size=13, bold=True, color=ORANGE, align=PP_ALIGN.CENTER)

# ══════════════════════════════════════════════════════════════
#  SLIDE 13 — BASE DE DONNEES  (avec diagramme ERD)
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Base de Donnees — 19 Tables",
             "MySQL 8.0  |  Eloquent ORM  |  Migrations versionnees")

# Image ERD
erd_path = os.path.join(UML, "05_erd.png")
if os.path.exists(erd_path):
    add_img(sl, erd_path, Inches(0.3), Inches(1.3), Inches(7.8))

# Tableau recap
groups = [
    ("Auth / Profils", BLUE_MAIN, "users, freelancer_profiles,\nclient_profiles, subscriptions,\npersonal_access_tokens"),
    ("Marketplace",    ORANGE,    "categories, skills,\nfreelancer_skills, portfolios,\njob_postings"),
    ("Missions",       GREEN,     "proposals, contracts,\nmilestones, reviews"),
    ("Finance",        RGBColor(142,68,173), "wallets, transactions"),
    ("Communication",  BLUE_LIGHT,"conversations, messages"),
    ("IA",             RGBColor(41,128,185), "ai_histories"),
]
for i,(grp,bg,tables) in enumerate(groups):
    y = Inches(1.3)+i*Inches(1.0)
    if i >= 4:
        y = Inches(1.3)+(i-2)*Inches(1.0)
        x = Inches(11.1)
    else:
        x = Inches(8.4)
    add_rect(sl, x, y, Inches(0.2), Inches(0.88), bg)
    add_rect(sl, x+Inches(0.2), y, Inches(5.2), Inches(0.88), RGBColor(245,248,252))
    add_text(sl, grp, x+Inches(0.28), y+Inches(0.04), Inches(5.0), Inches(0.38),
             font_size=13, bold=True, color=bg)
    add_text(sl, tables, x+Inches(0.28), y+Inches(0.42), Inches(5.0), Inches(0.44),
             font_size=10, bold=False, color=GREY_MED)

# ══════════════════════════════════════════════════════════════
#  SLIDE 14 — DIAGRAMMES UML
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Diagrammes UML — Vue d'ensemble",
             "17 diagrammes couvrant tous les aspects du systeme")

imgs = [
    ("01_use_case_global.png",   "Use Case Global",        Inches(0.3),  Inches(1.3),  Inches(4.1)),
    ("04_class_diagram.png",     "Classes",                Inches(4.55), Inches(1.3),  Inches(4.1)),
    ("11_activity_cycle.png",    "Activite Cycle Mission", Inches(8.8),  Inches(1.3),  Inches(4.2)),
    ("08_sequence_escrow.png",   "Sequence Escrow",        Inches(0.3),  Inches(4.3),  Inches(4.1)),
    ("15_state_contract.png",    "Etats Contrat",          Inches(4.55), Inches(4.3),  Inches(4.1)),
    ("17_deployment.png",        "Deploiement",            Inches(8.8),  Inches(4.3),  Inches(4.2)),
]
for path,label,x,y,w in imgs:
    full = os.path.join(UML, path)
    if os.path.exists(full):
        add_img(sl, full, x, y, w)
    add_text(sl, label, x, y-Inches(0.3), w, Inches(0.28),
             font_size=11, bold=True, color=BLUE_MAIN, align=PP_ALIGN.CENTER)

# ══════════════════════════════════════════════════════════════
#  SLIDE 15 — SECURITE
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Securite — 4 Couches de Protection",
             "Authentification  |  Autorisation  |  Validation  |  Donnees")

layers_sec = [
    (BLUE_MAIN, "Couche 1 : AUTHENTIFICATION",
     ["Sanctum Bearer Token — unique par session", "Revocable immediatement a la deconnexion",
      "Google OAuth — delegation a Google (pas de mdp stocke)"]),
    (ORANGE,    "Couche 2 : AUTORISATION",
     ["Middleware role:freelancer / role:client / role:admin", "Principe de moindre privilege",
      "Un etudiant ne peut PAS acceder aux routes admin"]),
    (GREEN,     "Couche 3 : VALIDATION",
     ["Form Requests Laravel cote serveur", "Types verifies + longueurs max",
      "Codes HTTP standards (401, 403, 422, 500)"]),
    (RGBColor(142,68,173), "Couche 4 : DONNEES SENSIBLES",
     ["Mots de passe haches avec bcrypt (Hash::make)", "Secrets dans .env — jamais en dur dans le code",
      "CORS configure — seul le domaine frontend autorise"]),
]
for i,(bg,title,items) in enumerate(layers_sec):
    row, col = divmod(i, 2)
    x = Inches(0.3) + col*Inches(6.5)
    y = Inches(1.3) + row*Inches(2.8)
    add_rect(sl, x, y, Inches(6.2), Inches(0.5), bg)
    add_text(sl, title, x, y, Inches(6.2), Inches(0.5),
             font_size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    for j,item in enumerate(items):
        add_text(sl, "  >  "+item, x, y+Inches(0.58)+j*Inches(0.6),
                 Inches(6.2), Inches(0.55),
                 font_size=13, bold=False, color=GREY_DARK)

# ══════════════════════════════════════════════════════════════
#  SLIDE 16 — DEMONSTRATION
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Demonstration Live",
             "http://localhost:5173  |  http://localhost:8000  |  http://localhost:11434")

scenarios = [
    (BLUE_MAIN, "Scenario 1 : Inscription Freelancer  (2 min)", [
        "S'inscrire en tant que freelancer",
        "Processus onboarding : 5 etapes completes",
        "Tableau de bord freelancer — statistiques",
    ]),
    (ORANGE,    "Scenario 2 : Workflow Client  (2 min)", [
        "Publier une offre d'emploi",
        "Consulter les profils freelancers",
        "Accepter une proposition → Contrat cree auto",
    ]),
    (GREEN,     "Scenario 3 : IA et Paiement  (2 min)", [
        "Freelancer genere une proposition via Ollama IA",
        "Client finance l'escrow → Freelancer livre",
        "Liberation du paiement et messagerie temps reel",
    ]),
    (RGBColor(142,68,173), "Bonus : Admin Dashboard  (30 sec)", [
        "Statistiques globales de la plateforme",
        "Gestion des utilisateurs (ban, verifier)",
        "Analytics et revenus",
    ]),
]
for i,(bg,title,steps) in enumerate(scenarios):
    row, col = divmod(i, 2)
    x = Inches(0.3)+col*Inches(6.5)
    y = Inches(1.3)+row*Inches(2.8)
    add_rect(sl, x, y, Inches(6.2), Inches(0.5), bg)
    add_text(sl, title, x, y, Inches(6.2), Inches(0.5),
             font_size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    for j,step in enumerate(steps):
        add_text(sl, "  "+str(j+1)+".  "+step,
                 x, y+Inches(0.58)+j*Inches(0.65),
                 Inches(6.2), Inches(0.6),
                 font_size=13, bold=False, color=GREY_DARK)

# ══════════════════════════════════════════════════════════════
#  SLIDE 17 — DIFFICULTES ET SOLUTIONS
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Difficultes Rencontrees & Solutions",
             "Problemes reels resolus au cours du developpement")

problems_solutions = [
    ("Configuration CORS",       "Origines Laravel:8000 / React:5173 differentes",
     "cors.php + SANCTUM_STATEFUL_DOMAINS"),
    ("Migration Sanctum absente","Table personal_access_tokens manquante",
     "Migration dediee 2026_05_19_..."),
    ("Middleware non reconnu",   "Alias non declares dans bootstrap",
     "Correction withMiddleware() dans app.php"),
    ("Palettes Tailwind",        "Shades CSS non definis",
     "Ajout 50-950 dans tailwind.config.js"),
    ("Ollama indisponible",      "Serveur IA non demarre",
     "try/catch avec reponses fallback"),
    ("Escrow 3 soldes",          "Logique atomique complexe",
     "DB::transaction() Laravel"),
    ("Upload images",            "Type MIME et stockage securise",
     "Intervention/Image + storage/app/public"),
    ("Onboarding champs abs.",   "Profil incomplet apres inscription",
     "Migration additive add_onboarding_fields"),
]
add_rect(sl, Inches(0.3), Inches(1.25), Inches(4.0), Inches(0.42), BLUE_MAIN)
add_rect(sl, Inches(4.35),Inches(1.25), Inches(4.0), Inches(0.42), ORANGE)
add_rect(sl, Inches(8.7), Inches(1.25), Inches(4.3), Inches(0.42), GREEN)
for label,col in [("Difficulte",BLUE_MAIN),("Cause",ORANGE),("Solution",GREEN)]:
    x = {"Difficulte":Inches(0.3),"Cause":Inches(4.35),"Solution":Inches(8.7)}[label]
    add_text(sl, label, x, Inches(1.25), Inches(4.0), Inches(0.42),
             font_size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

for i,(diff,cause,sol) in enumerate(problems_solutions):
    y = Inches(1.73)+i*Inches(0.68)
    bg_row = RGBColor(245,248,252) if i%2==0 else WHITE
    add_rect(sl, Inches(0.3),  y, Inches(4.0), Inches(0.62), bg_row)
    add_rect(sl, Inches(4.35), y, Inches(4.0), Inches(0.62), bg_row)
    add_rect(sl, Inches(8.7),  y, Inches(4.3), Inches(0.62), bg_row)
    add_text(sl, diff,  Inches(0.4),  y+Inches(0.1), Inches(3.8), Inches(0.45),
             font_size=12, bold=True,  color=BLUE_MAIN)
    add_text(sl, cause, Inches(4.45), y+Inches(0.1), Inches(3.8), Inches(0.45),
             font_size=11, bold=False, color=GREY_DARK)
    add_text(sl, sol,   Inches(8.8),  y+Inches(0.1), Inches(4.1), Inches(0.45),
             font_size=11, bold=True,  color=GREEN)

# ══════════════════════════════════════════════════════════════
#  SLIDE 18 — COMPETENCES ACQUISES
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Competences Acquises",
             "Bilan technique et personnel du projet")

# Barres de competences
skills_data = [
    ("Base de donnees relationnelles", 90, BLUE_MAIN),
    ("API REST Laravel",               82, ORANGE),
    ("Frontend React 19",              76, GREEN),
    ("Securite web",                   68, RGBColor(142,68,173)),
    ("Integration IA (Ollama)",        55, RGBColor(41,128,185)),
    ("Temps reel (Socket.IO)",         60, RGBColor(39,174,96)),
]
add_text(sl, "Competences Techniques",
         Inches(0.4), Inches(1.3), Inches(6), Inches(0.45),
         font_size=16, bold=True, color=BLUE_MAIN)
BAR_W = Inches(5.5)
for i,(skill,pct,col) in enumerate(skills_data):
    y = Inches(1.88)+i*Inches(0.8)
    add_text(sl, skill, Inches(0.4), y, Inches(4.5), Inches(0.35),
             font_size=13, bold=False, color=GREY_DARK)
    add_rect(sl, Inches(0.4), y+Inches(0.38), BAR_W, Inches(0.28), RGBColor(220,230,245))
    add_rect(sl, Inches(0.4), y+Inches(0.38), int(BAR_W*pct/100), Inches(0.28), col)
    add_text(sl, str(pct)+"%", Inches(0.4)+int(BAR_W*pct/100)+Inches(0.05),
             y+Inches(0.38), Inches(0.5), Inches(0.28),
             font_size=11, bold=True, color=col)

# Stats chiffres droite
add_text(sl, "Realisations en Chiffres",
         Inches(7.0), Inches(1.3), Inches(5.9), Inches(0.45),
         font_size=16, bold=True, color=BLUE_MAIN)
stats_num = [
    ("19",  "Tables BDD",         BLUE_MAIN),
    ("40+", "Endpoints API",      ORANGE),
    ("53+", "Composants React",   GREEN),
    ("3",   "Auth methods",       RGBColor(142,68,173)),
    ("5",   "Features IA",        RGBColor(41,128,185)),
    ("10%", "Commission escrow",  RGBColor(39,174,96)),
]
for i,(num,lbl,col) in enumerate(stats_num):
    row, c = divmod(i, 3)
    x = Inches(7.0)+c*Inches(1.95)
    y = Inches(1.85)+row*Inches(1.55)
    add_rect(sl, x, y, Inches(1.8), Inches(1.35), col)
    add_text(sl, num, x, y+Inches(0.18), Inches(1.8), Inches(0.65),
             font_size=28, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(sl, lbl, x, y+Inches(0.85), Inches(1.8), Inches(0.44),
             font_size=11, bold=False, color=RGBColor(210,230,255),
             align=PP_ALIGN.CENTER)

# ══════════════════════════════════════════════════════════════
#  SLIDE 19 — PERSPECTIVES
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
slide_bg(sl)
slide_header(sl, "Perspectives d'Evolution",
             "FreeNest — Feuille de route future")

horizons = [
    (BLUE_MAIN,  "Court terme",   [
        "Deploiement production (VPS + Nginx + SSL)",
        "Integration Stripe pour paiements reels",
        "Tests automatises (PHPUnit + Vitest)",
        "Redis pour le cache et les queues",
    ]),
    (ORANGE,     "Moyen terme",   [
        "Application mobile React Native",
        "IA avancee : embeddings + recherche semantique",
        "Verification d'identite (KYC)",
        "Notifications push",
    ]),
    (GREEN,      "Long terme",    [
        "Internationalisation FR / EN / AR",
        "Programme d'affiliation",
        "API publique pour integrations tierces",
        "Multi-devise et localisation",
    ]),
]
for i,(bg,horizon,items) in enumerate(horizons):
    x = Inches(0.3)+i*Inches(4.35)
    add_rect(sl, x, Inches(1.25), Inches(4.1), Inches(0.55), bg)
    add_text(sl, horizon, x, Inches(1.25), Inches(4.1), Inches(0.55),
             font_size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    for j,item in enumerate(items):
        y = Inches(1.9)+j*Inches(0.75)
        add_rect(sl, x, y, Inches(4.1), Inches(0.65),
                 RGBColor(240,245,252) if j%2==0 else WHITE)
        add_text(sl, "  >  "+item, x, y+Inches(0.1), Inches(4.1), Inches(0.5),
                 font_size=13, bold=False, color=GREY_DARK)

divider(sl, Inches(5.15))
add_text(sl, "Compétences à approfondir :",
         Inches(0.4), Inches(5.3), Inches(4), Inches(0.42),
         font_size=15, bold=True, color=BLUE_MAIN)
next_skills = ["DevOps (Docker, CI/CD)","Tests automatises","Performance (Redis)","ML / Embeddings vectoriels"]
for i,s in enumerate(next_skills):
    badge(sl, s, Inches(0.4)+i*Inches(3.2), Inches(5.85),
          bg=BLUE_MAIN if i%2==0 else ORANGE)

# ══════════════════════════════════════════════════════════════
#  SLIDE 20 — CONCLUSION
# ══════════════════════════════════════════════════════════════
sl = prs.slides.add_slide(BLANK)
add_rect(sl, 0, 0, W, H, BLUE_DARK)
add_rect(sl, 0, 0, W, Inches(0.08), ORANGE)
add_rect(sl, 0, H-Inches(0.08), W, Inches(0.08), ORANGE)

add_text(sl, "FREENEST",
         Inches(0.5), Inches(0.7), Inches(12), Inches(1.3),
         font_size=56, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_text(sl, "Marketplace Freelance Full-Stack avec Intelligence Artificielle",
         Inches(0.5), Inches(1.85), Inches(12), Inches(0.6),
         font_size=20, bold=False, color=RGBColor(180,210,255), align=PP_ALIGN.CENTER)

add_rect(sl, Inches(3.5), Inches(2.55), Inches(6.3), Inches(0.05), ORANGE)

add_text(sl, "Merci pour votre attention !",
         Inches(0.5), Inches(2.75), Inches(12), Inches(0.7),
         font_size=30, bold=True, color=ORANGE, align=PP_ALIGN.CENTER)

checklist = [
    "19 tables MySQL  |  40+ endpoints API  |  53+ composants React",
    "5 fonctionnalites IA (Ollama/Mistral)  |  Escrow 10% commission",
    "Messagerie Socket.IO  |  OAuth Google  |  Interface 3D Three.js",
]
for i,item in enumerate(checklist):
    add_text(sl, item, Inches(0.5), Inches(3.6)+i*Inches(0.6), Inches(12), Inches(0.55),
             font_size=15, bold=False, color=RGBColor(200,225,255), align=PP_ALIGN.CENTER)

add_rect(sl, Inches(3.5), Inches(5.4), Inches(6.3), Inches(0.05), BLUE_LIGHT)

add_text(sl, "Questions ?",
         Inches(0.5), Inches(5.6), Inches(12), Inches(0.6),
         font_size=26, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_text(sl, "Ayoub Elmernissi   |   ayoubelmerniss55@gmail.com",
         Inches(0.5), Inches(6.25), Inches(12), Inches(0.5),
         font_size=16, bold=False, color=RGBColor(180,210,255), align=PP_ALIGN.CENTER)
add_text(sl, "Projet de Fin d'Etudes  —  2025 / 2026",
         Inches(0.5), Inches(6.78), Inches(12), Inches(0.45),
         font_size=14, bold=False, color=RGBColor(140,170,210), align=PP_ALIGN.CENTER)

# ══════════════════════════════════════════════════════════════
#  SAUVEGARDE
# ══════════════════════════════════════════════════════════════
out = r"C:\Users\Pro\Desktop\PFE O1\documentation\FreeNest_Presentation.pptx"
prs.save(out)
print("OK - Presentation PowerPoint creee : " + out)
print("Slides : " + str(len(prs.slides)))
