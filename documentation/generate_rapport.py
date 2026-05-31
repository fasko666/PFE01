"""
Génère le rapport de stage FreeNest au format Word (.docx)
"""
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

doc = Document()

# ── Page size A4 ──────────────────────────────────────────────
section = doc.sections[0]
section.page_width  = Cm(21)
section.page_height = Cm(29.7)
section.left_margin   = Cm(2.5)
section.right_margin  = Cm(2.5)
section.top_margin    = Cm(2.5)
section.bottom_margin = Cm(2.5)

# ── Styles de base ────────────────────────────────────────────
def set_font(run, name="Calibri", size=11, bold=False, color=None):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)

def heading(doc, text, level=1, color=(0,70,127)):
    p = doc.add_heading(text, level=level)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    for run in p.runs:
        run.font.color.rgb = RGBColor(*color)
        run.font.name = "Calibri"
    return p

def para(doc, text, size=11, bold=False, color=None, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p = doc.add_paragraph()
    p.alignment = align
    run = p.add_run(text)
    set_font(run, size=size, bold=bold, color=color)
    p.paragraph_format.space_after = Pt(4)
    return p

def bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet")
    run = p.add_run(text)
    set_font(run, size=11)
    p.paragraph_format.left_indent = Cm(1 + level * 0.5)
    p.paragraph_format.space_after = Pt(2)
    return p

def add_table(doc, headers, rows, col_widths=None):
    t = doc.add_table(rows=1+len(rows), cols=len(headers))
    t.style = "Table Grid"
    # En-tête
    hdr = t.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = h
        for run in hdr[i].paragraphs[0].runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(255,255,255)
        tc = hdr[i]._tc
        tcPr = tc.get_or_add_tcPr()
        shd = OxmlElement('w:shd')
        shd.set(qn('w:val'), 'clear')
        shd.set(qn('w:color'), 'auto')
        shd.set(qn('w:fill'), '005288')
        tcPr.append(shd)
        hdr[i].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    # Données
    for r_idx, row in enumerate(rows):
        cells = t.rows[r_idx+1].cells
        for c_idx, val in enumerate(row):
            cells[c_idx].text = str(val)
            cells[c_idx].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in cells[c_idx].paragraphs[0].runs:
                run.font.size = Pt(10)
        # Alternance de couleur
        if r_idx % 2 == 0:
            for cell in cells:
                tc = cell._tc
                tcPr = tc.get_or_add_tcPr()
                shd = OxmlElement('w:shd')
                shd.set(qn('w:val'), 'clear')
                shd.set(qn('w:color'), 'auto')
                shd.set(qn('w:fill'), 'EBF5FB')
                tcPr.append(shd)
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in t.rows:
                row.cells[i].width = Cm(w)
    doc.add_paragraph()
    return t

def code_block(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent  = Cm(1)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after  = Pt(4)
    run = p.add_run(text)
    run.font.name = "Courier New"
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(0,60,0)
    # fond gris clair via shading
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), 'F4F4F4')
    pPr.append(shd)
    return p

def page_break(doc):
    doc.add_page_break()

def hr(doc):
    p = doc.add_paragraph()
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), '005288')
    pBdr.append(bottom)
    pPr.append(pBdr)
    p.paragraph_format.space_after = Pt(6)

# ════════════════════════════════════════════════════════════════
#  PAGE DE GARDE
# ════════════════════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(60)
run = p.add_run("RAPPORT DE STAGE / PROJET DE FIN D'ÉTUDES")
set_font(run, size=18, bold=True, color=(0, 82, 136))

p2 = doc.add_paragraph()
p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
p2.paragraph_format.space_before = Pt(20)
run2 = p2.add_run("FreeNest")
set_font(run2, size=36, bold=True, color=(0, 120, 215))

p3 = doc.add_paragraph()
p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
run3 = p3.add_run("Conception et Développement d'une Marketplace Freelance\nFull-Stack avec Intelligence Artificielle")
set_font(run3, size=16, color=(60,60,60))

doc.add_paragraph()
doc.add_paragraph()
hr(doc)
doc.add_paragraph()

info_lines = [
    ("Réalisé par",    "Ayoub Elmernissi"),
    ("Email",          "ayoubelmerniss55@gmail.com"),
    ("Établissement",  "[Nom de l'établissement]"),
    ("Filière",        "Développement Web / Génie Informatique"),
    ("Niveau",         "[BTS / Licence / Master]"),
    ("Année",          "2025 – 2026"),
    ("Encadrant",      "[Nom de l'encadrant pédagogique]"),
]
for label, value in info_lines:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = p.add_run(f"{label} : ")
    set_font(r1, size=12, bold=True, color=(0,82,136))
    r2 = p.add_run(value)
    set_font(r2, size=12)

page_break(doc)

# ════════════════════════════════════════════════════════════════
#  REMERCIEMENTS
# ════════════════════════════════════════════════════════════════
heading(doc, "REMERCIEMENTS", 1)
para(doc,
    "Je tiens à exprimer ma sincère gratitude à toutes les personnes qui ont contribué "
    "à la réalisation de ce projet de fin d'études.")
para(doc,
    "Je remercie en premier lieu mon encadrant pédagogique pour ses précieux conseils, "
    "sa disponibilité et son suivi tout au long de ce travail. Ses remarques constructives "
    "m'ont permis de progresser tant sur le plan technique qu'organisationnel.")
para(doc,
    "Je remercie également l'ensemble de l'équipe enseignante de ma filière pour la qualité "
    "de la formation dispensée, qui m'a fourni les outils nécessaires pour aborder un projet "
    "d'une telle envergure.")
para(doc,
    "Enfin, je dédie ce travail à ma famille et à mes amis dont le soutien indéfectible "
    "a été une source de motivation constante.")
page_break(doc)

# ════════════════════════════════════════════════════════════════
#  RÉSUMÉ
# ════════════════════════════════════════════════════════════════
heading(doc, "RÉSUMÉ", 1)
para(doc,
    "FreeNest est une marketplace freelance full-stack développée dans le cadre d'un projet "
    "de fin d'études. La plateforme met en relation des clients souhaitant externaliser des "
    "missions et des freelancers proposant leurs services, à travers un système de propositions, "
    "de contrats structurés et de paiements sécurisés par escrow.")
para(doc,
    "Le projet repose sur une architecture moderne découplée : Laravel 12 (PHP) pour le backend "
    "API REST, React 19 pour l'interface utilisateur, et MySQL pour la persistance des données. "
    "Il intègre également Ollama/Mistral pour les fonctionnalités d'intelligence artificielle "
    "(génération de propositions, matching, analyse de profil), Socket.IO pour la messagerie "
    "en temps réel et Google OAuth pour l'authentification sociale.")

p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(6)
r = p.add_run("Mots-clés : ")
set_font(r, bold=True, size=11)
r2 = p.add_run(
    "Marketplace, Freelance, Laravel, React, REST API, Escrow, Intelligence Artificielle, "
    "Ollama, Mistral, OAuth, Socket.IO, MySQL, Full-Stack"
)
set_font(r2, size=11)

doc.add_paragraph()
heading(doc, "ABSTRACT", 1)
para(doc,
    "FreeNest is a full-stack freelance marketplace built as a final year project. The platform "
    "connects clients with independent professionals through a proposal system, structured "
    "contracts, and secure escrow-based payments. Built with Laravel 12 (backend API), "
    "React 19 (frontend), and MySQL, it also features Ollama/Mistral AI integration, "
    "real-time messaging via Socket.IO, and Google OAuth authentication.")
page_break(doc)

# ════════════════════════════════════════════════════════════════
#  SOMMAIRE
# ════════════════════════════════════════════════════════════════
heading(doc, "SOMMAIRE", 1)
sommaire = [
    ("1.",   "Introduction", ""),
    ("2.",   "Contexte et Problématique", ""),
    ("3.",   "Présentation du Projet FreeNest", ""),
    ("4.",   "Analyse des Besoins", ""),
    ("  4.1","Besoins fonctionnels", ""),
    ("  4.2","Besoins non fonctionnels", ""),
    ("  4.3","Acteurs du système", ""),
    ("5.",   "Conception et Modélisation", ""),
    ("  5.1","Architecture générale", ""),
    ("  5.2","Structure des répertoires", ""),
    ("6.",   "Stack Technologique", ""),
    ("7.",   "Réalisation — Les 8 Modules", ""),
    ("  7.1","Module Authentification & Onboarding", ""),
    ("  7.2","Module Marketplace des Offres", ""),
    ("  7.3","Module Propositions & Contrats", ""),
    ("  7.4","Module Paiements & Escrow", ""),
    ("  7.5","Module Messagerie Temps Réel", ""),
    ("  7.6","Module Intelligence Artificielle", ""),
    ("  7.7","Module Profils & Portfolio", ""),
    ("  7.8","Module Administration", ""),
    ("8.",   "Base de Données", ""),
    ("9.",   "Sécurité", ""),
    ("10.",  "Difficultés et Solutions", ""),
    ("11.",  "Tests et Validation", ""),
    ("12.",  "Conclusion et Perspectives", ""),
    ("13.",  "Annexes", ""),
]
for num, title, page in sommaire:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(f"{num}  {title}")
    r.font.size = Pt(11)
    r.font.name = "Calibri"
    if not num.startswith("  "):
        r.font.bold = True
        r.font.color.rgb = RGBColor(0,82,136)
page_break(doc)

# ════════════════════════════════════════════════════════════════
#  1. INTRODUCTION
# ════════════════════════════════════════════════════════════════
heading(doc, "1. INTRODUCTION", 1)
para(doc,
    "Le marché du travail indépendant (freelance) connaît une transformation profonde à l'échelle "
    "mondiale. Selon les études récentes, plus d'un tiers de la population active mondiale "
    "exercera une activité freelance d'ici 2030. Des plateformes comme Upwork, Fiverr ou Malt "
    "ont démontré la viabilité et la demande croissante pour des marketplaces connectant clients "
    "et prestataires indépendants.")
para(doc,
    "C'est dans ce contexte que s'inscrit FreeNest, une marketplace freelance complète développée "
    "de bout en bout dans le cadre de ce projet de fin d'études. FreeNest se distingue par "
    "l'intégration native de l'intelligence artificielle pour assister les freelancers dans la "
    "rédaction de propositions et les clients dans la recherche de talents, ainsi que par un "
    "système de paiement sécurisé par escrow garantissant la confiance entre les deux parties.")
para(doc,
    "Ce rapport présente l'intégralité du travail réalisé : de l'analyse des besoins à la "
    "conception architecturale, du développement des modules fonctionnels à l'intégration de "
    "l'IA, en passant par la sécurisation des paiements et la mise en place de la messagerie "
    "en temps réel.")

# ════════════════════════════════════════════════════════════════
#  2. CONTEXTE ET PROBLÉMATIQUE
# ════════════════════════════════════════════════════════════════
heading(doc, "2. CONTEXTE ET PROBLÉMATIQUE", 1)
heading(doc, "2.1 Contexte du marché freelance", 2)
para(doc,
    "Le travail indépendant représente aujourd'hui un secteur économique majeur en pleine "
    "croissance. Les plateformes existantes présentent cependant plusieurs lacunes importantes :")
bullet(doc, "Barrière linguistique : les leaders du marché (Upwork, Fiverr) sont majoritairement en anglais")
bullet(doc, "IA réservée au premium : les fonctionnalités d'intelligence artificielle nécessitent des abonnements coûteux")
bullet(doc, "Commissions élevées : certaines plateformes prélèvent jusqu'à 20% par transaction")
bullet(doc, "Interfaces complexes : peu adaptées aux nouveaux utilisateurs")

heading(doc, "2.2 Problématique", 2)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(10)
p.paragraph_format.space_after  = Pt(10)
p.paragraph_format.left_indent  = Cm(1)
p.paragraph_format.right_indent = Cm(1)
run = p.add_run(
    "« Comment concevoir et développer une marketplace freelance moderne, sécurisée et enrichie "
    "par l'intelligence artificielle, capable de mettre en relation efficacement clients et "
    "freelancers tout en garantissant la sécurité des paiements et la qualité des échanges ? »"
)
set_font(run, size=12, bold=True, color=(0,82,136))

heading(doc, "2.3 Solution proposée : FreeNest", 2)
add_table(doc,
    ["Problème identifié", "Solution FreeNest"],
    [
        ["Langue et accessibilité",   "Interface en français, UX simplifiée et moderne"],
        ["IA inaccessible",           "Ollama/Mistral intégré, gratuit pour tous les utilisateurs"],
        ["Commission élevée",         "Commission fixe 10% transparente"],
        ["Paiement non sécurisé",     "Système d'escrow : l'argent est bloqué avant le début du travail"],
        ["Manque de transparence",    "Jalons, contrats, historique complet des transactions"],
    ],
    col_widths=[7, 9]
)

# ════════════════════════════════════════════════════════════════
#  3. PRÉSENTATION DU PROJET
# ════════════════════════════════════════════════════════════════
heading(doc, "3. PRÉSENTATION DU PROJET FREENEST", 1)
add_table(doc,
    ["Élément", "Détail"],
    [
        ["Nom du projet",  "FreeNest (alias Panda)"],
        ["Type",           "Marketplace B2B/B2C Freelance"],
        ["Backend",        "Laravel 12 (PHP 8.2+)"],
        ["Frontend",       "React 19 + Vite"],
        ["Base de données","MySQL 8.0"],
        ["Authentification","Sanctum + JWT + Google OAuth"],
        ["Intelligence IA","Ollama (modèle Mistral 7B)"],
        ["Temps réel",     "Socket.IO 4.8"],
        ["Paiements",      "Système Escrow maison + Stripe ready"],
        ["Nombre de tables","19 tables"],
        ["Endpoints API",  "40+ routes REST"],
        ["Composants React","53+ composants"],
    ],
    col_widths=[5, 11]
)

para(doc, "FreeNest est structuré autour de deux types d'utilisateurs principaux :", bold=True)
bullet(doc, "Freelancer : professionnel indépendant qui crée un profil, soumet des propositions (avec aide IA), gère ses contrats et reçoit ses paiements via un portefeuille numérique.")
bullet(doc, "Client : entreprise ou particulier qui publie des offres d'emploi, sélectionne des freelancers, crée des contrats avec jalons et libère les paiements après validation du travail.")

# ════════════════════════════════════════════════════════════════
#  4. ANALYSE DES BESOINS
# ════════════════════════════════════════════════════════════════
heading(doc, "4. ANALYSE DES BESOINS", 1)
heading(doc, "4.1 Besoins Fonctionnels", 2)

modules_besoins = {
    "Authentification": [
        "Inscription par email/mot de passe avec choix du rôle (freelancer/client)",
        "Connexion via Google OAuth (Laravel Socialite)",
        "Tokens Bearer par session (Sanctum), révocables à la déconnexion",
        "Processus d'onboarding guidé en 5 étapes pour les freelancers",
        "Vérification de téléphone et changement de mot de passe",
    ],
    "Marketplace des Offres": [
        "Publication d'offres avec budget, compétences, durée, niveau requis",
        "Recherche par mots-clés, catégorie, budget, type de contrat",
        "Filtres avancés et tri (récent, budget, popularité)",
        "Sauvegarde d'offres favorites",
        "Catégories hiérarchiques (parent/enfant)",
    ],
    "Propositions & Contrats": [
        "Soumission de proposition : lettre, montant, durée, jalons optionnels",
        "Génération automatique via IA (Ollama/Mistral)",
        "Acceptation/rejet de proposition par le client",
        "Création automatique du contrat lors de l'acceptation",
        "Gestion des jalons : soumission, révision, approbation",
    ],
    "Paiements & Escrow": [
        "Portefeuille numérique avec 3 soldes (disponible, en attente, escrow)",
        "Dépôt de fonds et financement de l'escrow par jalon",
        "Libération du paiement après approbation (commission 10%)",
        "Historique complet des transactions",
    ],
    "Messagerie Temps Réel": [
        "Conversations directes freelancer/client et liées à un contrat",
        "Envoi de texte, fichiers et images avec pièces jointes",
        "Réponse ciblée à un message spécifique (threading)",
        "Indicateur de lecture (vu/non vu) et pagination scroll infini",
    ],
    "Intelligence Artificielle": [
        "Génération de proposition adaptée à l'offre et au profil freelancer",
        "Matching : suggestions de freelancers pour une offre client",
        "Analyse et amélioration de profil freelancer",
        "Chat assistant contextuel sur la plateforme",
        "Recherche en langage naturel (smart search)",
    ],
    "Profils & Portfolio": [
        "Profil complet : titre, bio, tarif, niveau, disponibilité, langues",
        "Gestion du portfolio (images, description, URL, compétences)",
        "Gestion des compétences avec niveau de maîtrise",
        "Badges : Top Rated, Top Rated Plus, vérifié",
    ],
    "Administration": [
        "Tableau de bord analytique (utilisateurs, jobs, revenus, transactions)",
        "Gestion des utilisateurs : ban, vérification, consultation",
        "Rapports et analytics de la plateforme",
    ],
}
for mod, items in modules_besoins.items():
    heading(doc, f"Module {mod}", 3)
    for item in items:
        bullet(doc, item)

heading(doc, "4.2 Besoins Non Fonctionnels", 2)
add_table(doc,
    ["Besoin", "Exigence", "Implémentation"],
    [
        ["Performance",     "Réponses API < 500ms",          "Laravel + Eloquent optimisé"],
        ["Sécurité",        "Auth sécurisée, données protégées", "Sanctum + bcrypt + CORS"],
        ["Scalabilité",     "Architecture découplée",        "API REST stateless"],
        ["Temps réel",      "Messages instantanés",          "Socket.IO"],
        ["Accessibilité",   "Interface responsive",          "TailwindCSS responsive"],
        ["UX moderne",      "Interface fluide et attrayante","Three.js + Framer Motion"],
        ["IA disponible",   "IA même sans Ollama",           "Système de fallback"],
    ],
    col_widths=[4, 5, 7]
)

heading(doc, "4.3 Acteurs du Système", 2)
add_table(doc,
    ["Acteur", "Type", "Rôle"],
    [
        ["Freelancer",    "Utilisateur principal", "Professionnel indépendant cherchant des missions"],
        ["Client",        "Utilisateur principal", "Entreprise ou particulier cherchant des talents"],
        ["Admin",         "Utilisateur interne",   "Gère la plateforme et modère les utilisateurs"],
        ["Google OAuth",  "Système externe",       "Fournisseur d'identité pour la connexion sociale"],
        ["Ollama/Mistral","Système externe",       "Moteur IA pour les fonctionnalités intelligentes"],
        ["Stripe",        "Système externe",       "Processeur de paiement (intégration prête)"],
        ["Socket.IO",     "Système interne",       "Serveur WebSocket pour la messagerie temps réel"],
    ],
    col_widths=[4, 4, 8]
)

# ════════════════════════════════════════════════════════════════
#  5. CONCEPTION
# ════════════════════════════════════════════════════════════════
heading(doc, "5. CONCEPTION ET MODÉLISATION", 1)
para(doc,
    "Les diagrammes UML complets (cas d'utilisation, classes, séquences, états, déploiement) "
    "sont fournis séparément en haute résolution dans le dossier 'uml_diagrams/'.")

heading(doc, "5.1 Architecture Générale", 2)
para(doc,
    "FreeNest suit une architecture Full-Stack découplée (Headless Architecture) : "
    "le frontend et le backend sont deux applications indépendantes qui communiquent "
    "exclusivement via une API REST JSON sécurisée par des tokens Bearer.")
code_block(doc,
    "NAVIGATEUR  →  React 19 + Vite (localhost:5173)\n"
    "                      │\n"
    "              HTTPS REST API (JSON)\n"
    "              Authorization: Bearer {token}\n"
    "                      │\n"
    "SERVEUR     →  Laravel 12 API (localhost:8000)\n"
    "               Controllers → Middleware → Models\n"
    "                      │\n"
    "BASE DE DONNÉES  →  MySQL 8.0 (19 tables)\n"
    "                      │\n"
    "IA              →  Ollama/Mistral (localhost:11434)"
)
para(doc,
    "Avantages de cette architecture : séparation des responsabilités, scalabilité horizontale, "
    "possibilité de créer une application mobile sans modifier le backend, et testabilité "
    "indépendante de chaque couche.")

heading(doc, "5.2 Structure des Répertoires", 2)
code_block(doc,
    "PFE-O1/\n"
    "├── backend-laravel/\n"
    "│   ├── app/Http/Controllers/   (10 contrôleurs)\n"
    "│   │   ├── AuthController.php\n"
    "│   │   ├── JobController.php\n"
    "│   │   ├── ProposalController.php\n"
    "│   │   ├── FreelancerController.php\n"
    "│   │   ├── ChatController.php\n"
    "│   │   ├── PaymentController.php\n"
    "│   │   ├── AIController.php\n"
    "│   │   ├── ReviewController.php\n"
    "│   │   ├── AdminController.php\n"
    "│   │   └── NotificationController.php\n"
    "│   ├── app/Models/             (17 modèles Eloquent)\n"
    "│   ├── database/migrations/    (migrations versionnées)\n"
    "│   └── routes/api.php          (40+ endpoints)\n"
    "│\n"
    "└── frontend-react/\n"
    "    └── src/\n"
    "        ├── pages/              (53+ composants)\n"
    "        ├── stores/             (Zustand state management)\n"
    "        └── components/         (composants réutilisables)"
)

# ════════════════════════════════════════════════════════════════
#  6. STACK TECHNOLOGIQUE
# ════════════════════════════════════════════════════════════════
heading(doc, "6. STACK TECHNOLOGIQUE", 1)
heading(doc, "6.1 Backend — Laravel 12", 2)
add_table(doc,
    ["Package", "Version", "Utilisation"],
    [
        ["laravel/framework",        "12.0",  "Framework PHP principal (MVC + ORM)"],
        ["laravel/sanctum",          "4.3",   "Authentification par tokens Bearer"],
        ["laravel/socialite",        "5.27",  "OAuth social (Google)"],
        ["tymon/jwt-auth",           "2.3",   "JSON Web Tokens"],
        ["spatie/laravel-permission","6.25",  "Gestion des rôles et permissions"],
        ["intervention/image",       "3.11",  "Traitement des images (avatars)"],
    ],
    col_widths=[5, 2.5, 8.5]
)

heading(doc, "6.2 Frontend — React 19", 2)
add_table(doc,
    ["Package", "Version", "Utilisation"],
    [
        ["react",              "19.2.6",  "Interface utilisateur réactive"],
        ["react-router-dom",   "7.15.1",  "Navigation SPA (Single Page App)"],
        ["tailwindcss",        "3.4.19",  "Framework CSS utilitaire"],
        ["zustand",            "5.0.13",  "State management global"],
        ["axios",              "1.16.1",  "Client HTTP pour les appels API"],
        ["framer-motion",      "12.39.0", "Animations et transitions fluides"],
        ["three + @react-three","—",      "Rendu 3D interactif (landing page)"],
        ["socket.io-client",   "4.8.3",   "Messagerie temps réel (WebSocket)"],
        ["recharts",           "3.8.1",   "Graphiques dans les dashboards"],
        ["react-hot-toast",    "2.6.0",   "Notifications d'actions utilisateur"],
        ["date-fns",           "4.2.1",   "Manipulation des dates"],
    ],
    col_widths=[4.5, 2.5, 9]
)

# ════════════════════════════════════════════════════════════════
#  7. RÉALISATION — LES 8 MODULES
# ════════════════════════════════════════════════════════════════
heading(doc, "7. RÉALISATION — LES 8 MODULES", 1)

# 7.1 Auth
heading(doc, "7.1 Module Authentification et Onboarding", 2)
para(doc,
    "Le système d'authentification repose sur Laravel Sanctum pour les tokens Bearer "
    "et Laravel Socialite pour l'OAuth Google. Chaque utilisateur se voit assigner "
    "un rôle dès l'inscription (freelancer, client ou admin), ce qui conditionne l'ensemble "
    "des accès à l'API.")
para(doc, "Extrait de code — Inscription :", bold=True)
code_block(doc,
    "public function register(Request $request)\n"
    "{\n"
    "    $user = User::create([\n"
    "        'name'     => $request->name,\n"
    "        'email'    => $request->email,\n"
    "        'password' => Hash::make($request->password),\n"
    "        'role'     => $request->role,\n"
    "    ]);\n"
    "    if ($request->role === 'freelancer') {\n"
    "        $user->freelancerProfile()->create([]);\n"
    "    } else {\n"
    "        $user->clientProfile()->create([]);\n"
    "    }\n"
    "    $token = $user->createToken('auth_token')->plainTextToken;\n"
    "    return response()->json(['token' => $token, 'user' => $user], 201);\n"
    "}"
)
para(doc,
    "L'onboarding freelancer est un processus guidé en 5 étapes qui permet de compléter "
    "progressivement le profil : catégorie principale, niveau d'expérience, formation, "
    "disponibilité/tarif, et photo de profil.")

# 7.2 Marketplace
heading(doc, "7.2 Module Marketplace des Offres", 2)
para(doc,
    "Les offres d'emploi (JobPostings) constituent le cœur de la marketplace. Un client "
    "publie une offre en précisant le titre, la description, la catégorie, les compétences "
    "requises, le budget (min/max), le type de contrat (horaire ou forfait) et le niveau "
    "d'expérience attendu. Les freelancers peuvent parcourir et filtrer ces offres selon "
    "plusieurs critères combinables.")
para(doc, "Cycle de vie d'une offre :", bold=True)
para(doc, "draft  →  open  →  in_progress  →  completed  (ou cancelled)")

# 7.3 Propositions
heading(doc, "7.3 Module Propositions et Contrats", 2)
para(doc,
    "Lorsqu'un freelancer identifie une offre, il soumet une proposition contenant une lettre "
    "de motivation, un montant proposé, une durée estimée et des jalons optionnels. L'IA peut "
    "générer automatiquement cette lettre à partir du contexte de l'offre et du profil du "
    "freelancer.")
para(doc,
    "Lorsque le client accepte une proposition, le système crée automatiquement un contrat "
    "structuré avec les jalons définis, met l'offre en statut 'in_progress' et crée une "
    "conversation de messagerie entre les deux parties.")

# 7.4 Paiements
heading(doc, "7.4 Module Paiements et Escrow", 2)
para(doc,
    "Chaque utilisateur possède un portefeuille numérique (Wallet) avec trois soldes distincts :")
bullet(doc, "balance : solde disponible pour retrait ou financement")
bullet(doc, "pending_balance : fonds en attente de confirmation")
bullet(doc, "escrow_balance : fonds bloqués pour un contrat en cours")
para(doc,
    "Le flux de paiement suit 4 phases : dépôt de fonds → financement de l'escrow "
    "→ soumission du jalon par le freelancer → approbation par le client avec libération "
    "automatique (90% au freelancer, 10% de commission plateforme).")
para(doc, "Extrait de code — Libération de paiement :", bold=True)
code_block(doc,
    "public function releaseMilestone(Request $request)\n"
    "{\n"
    "    $commission    = $milestone->amount * 0.10;\n"
    "    $freelancerNet = $milestone->amount - $commission;\n"
    "\n"
    "    DB::transaction(function() use ($clientWallet, $freelancerWallet,\n"
    "                                    $milestone, $freelancerNet) {\n"
    "        $clientWallet->escrow_balance -= $milestone->amount;\n"
    "        $clientWallet->save();\n"
    "        $freelancerWallet->balance    += $freelancerNet;\n"
    "        $freelancerWallet->save();\n"
    "        $milestone->update(['status' => 'approved', 'approved_at' => now()]);\n"
    "    });\n"
    "\n"
    "    return response()->json(['net_received' => $freelancerNet]);\n"
    "}"
)

# 7.5 Messagerie
heading(doc, "7.5 Module Messagerie Temps Réel", 2)
para(doc,
    "La messagerie combine Socket.IO pour la livraison instantanée des messages et l'API "
    "REST Laravel pour la persistance en base de données. Deux types de conversations sont "
    "supportés : directes (freelancer ↔ client) et liées à un contrat. Les fonctionnalités "
    "incluent l'envoi de texte/fichiers/images, les réponses ciblées (threading), "
    "l'indicateur de lecture et la pagination par scroll infini.")

# 7.6 IA
heading(doc, "7.6 Module Intelligence Artificielle", 2)
para(doc,
    "Le module IA s'appuie sur Ollama, un serveur d'inférence local, avec le modèle "
    "Mistral 7B. Le contrôleur AIController récupère le contexte (offre + profil), "
    "construit un prompt structuré et envoie une requête HTTP à Ollama. Toutes les "
    "interactions sont enregistrées dans la table ai_histories.")
add_table(doc,
    ["Fonctionnalité", "Endpoint", "Bénéfice utilisateur"],
    [
        ["Génération proposition",  "POST /api/ai/generate-proposal", "Lettre adaptée en quelques secondes"],
        ["Matching freelancers",    "POST /api/ai/match-freelancers",  "Suggestions intelligentes pour le client"],
        ["Analyse de profil",       "POST /api/ai/analyze-profile",   "Conseils d'amélioration personnalisés"],
        ["Chat assistant",          "POST /api/ai/chat",              "Aide contextuelle sur la plateforme"],
        ["Recherche intelligente",  "POST /api/ai/smart-search",      "Interprétation du langage naturel"],
    ],
    col_widths=[4.5, 5.5, 6]
)

# 7.7 Profils
heading(doc, "7.7 Module Profils et Portfolio", 2)
para(doc,
    "Chaque freelancer dispose d'un profil public riche incluant : titre professionnel, "
    "biographie, tarif horaire, badges (Top Rated, vérifié), compétences avec niveaux, "
    "galerie de projets portfolio, statistiques (taux de succès, total gagné, note moyenne) "
    "et avis des clients précédents.")

# 7.8 Admin
heading(doc, "7.8 Module Administration", 2)
para(doc,
    "Le tableau de bord administrateur offre une vue globale de la plateforme : nombre "
    "total d'utilisateurs par rôle, offres publiées, volume des transactions, propositions "
    "en attente et revenus de la plateforme. L'admin peut bannir des utilisateurs, "
    "leur attribuer le badge 'vérifié' et consulter les analytics détaillés.")

# ════════════════════════════════════════════════════════════════
#  8. BASE DE DONNÉES
# ════════════════════════════════════════════════════════════════
heading(doc, "8. BASE DE DONNÉES", 1)
para(doc,
    "La base de données MySQL compte 19 tables organisées en 5 domaines fonctionnels. "
    "Toutes les modifications de schéma sont versionnées via les migrations Laravel.")
add_table(doc,
    ["#", "Table", "Domaine", "Description"],
    [
        ["1",  "users",                    "Auth",        "Comptes de tous les utilisateurs"],
        ["2",  "personal_access_tokens",   "Auth",        "Tokens Sanctum Bearer"],
        ["3",  "freelancer_profiles",      "Profils",     "Profil détaillé du freelancer"],
        ["4",  "client_profiles",          "Profils",     "Profil détaillé du client"],
        ["5",  "categories",               "Marketplace", "Catégories hiérarchiques de métiers"],
        ["6",  "skills",                   "Marketplace", "Compétences disponibles"],
        ["7",  "freelancer_skills",        "Marketplace", "Liaison many-to-many freelancer ↔ skills"],
        ["8",  "portfolios",               "Profils",     "Projets portfolio des freelancers"],
        ["9",  "job_postings",             "Marketplace", "Offres d'emploi publiées"],
        ["10", "proposals",                "Missions",    "Propositions des freelancers"],
        ["11", "contracts",                "Missions",    "Contrats freelancer/client"],
        ["12", "milestones",               "Missions",    "Jalons d'un contrat"],
        ["13", "reviews",                  "Missions",    "Évaluations post-contrat"],
        ["14", "conversations",            "Chat",        "Fils de messagerie"],
        ["15", "messages",                 "Chat",        "Messages individuels"],
        ["16", "wallets",                  "Finance",     "Portefeuilles numériques"],
        ["17", "transactions",             "Finance",     "Historique des mouvements financiers"],
        ["18", "subscriptions",            "Finance",     "Abonnements et crédits (connects)"],
        ["19", "ai_histories",             "IA",          "Historique des requêtes IA"],
    ],
    col_widths=[0.8, 4, 2.5, 8.7]
)

# ════════════════════════════════════════════════════════════════
#  9. SÉCURITÉ
# ════════════════════════════════════════════════════════════════
heading(doc, "9. SÉCURITÉ", 1)
add_table(doc,
    ["Couche", "Mécanisme", "Détail"],
    [
        ["Authentification",   "Sanctum Bearer Token",         "Token unique par session, révocable immédiatement"],
        ["Authentification",   "Google OAuth (Socialite)",     "Délégation à Google, pas de mot de passe stocké"],
        ["Autorisation",       "Middleware de rôle",           "role:freelancer / role:client / role:admin"],
        ["Validation",         "Form Requests Laravel",        "Tous les inputs validés côté serveur"],
        ["Données sensibles",  "bcrypt (Hash::make)",          "Mots de passe hachés avec salage"],
        ["Réseau",             "CORS configuré",               "Seul le domaine frontend autorisé"],
        ["Secrets",            "Variables d'environnement",    "Clés API dans .env, jamais dans le code"],
        ["Uploads",            "Intervention/Image",           "Vérification du type MIME réel des fichiers"],
    ],
    col_widths=[3.5, 4, 8.5]
)

# ════════════════════════════════════════════════════════════════
#  10. DIFFICULTÉS ET SOLUTIONS
# ════════════════════════════════════════════════════════════════
heading(doc, "10. DIFFICULTÉS RENCONTRÉES ET SOLUTIONS", 1)
add_table(doc,
    ["Difficulté", "Cause", "Solution apportée"],
    [
        ["Configuration CORS",          "Origines différentes (8000/5173)",  "cors.php + SANCTUM_STATEFUL_DOMAINS=localhost:5173"],
        ["Migration Sanctum absente",   "Table tokens manquante",            "Migration dédiée personal_access_tokens"],
        ["Middleware rôle non reconnu", "Alias non déclaré",                 "Correction des alias dans bootstrap/app.php"],
        ["Palettes Tailwind manquantes","Shades non définis",                "Ajout des palettes 50→950 dans tailwind.config.js"],
        ["Ollama indisponible",         "Serveur non démarré",               "Système try/catch avec réponses fallback prédéfinies"],
        ["3 soldes Wallet complexes",   "Logique métier délicate",           "DB::transaction() avec 3 opérations atomiques"],
        ["Upload d'images",             "Type MIME et stockage",             "Intervention/Image + storage/app/public"],
        ["Champs onboarding absents",   "Profil incomplet au départ",        "Migration additive add_onboarding_fields"],
        ["OAuth redirect frontend",     "Token non transmis",                "Redirect avec ?token= dans l'URL de callback"],
    ],
    col_widths=[4, 3.5, 8.5]
)

# ════════════════════════════════════════════════════════════════
#  11. TESTS ET VALIDATION
# ════════════════════════════════════════════════════════════════
heading(doc, "11. TESTS ET VALIDATION", 1)
add_table(doc,
    ["Parcours testé", "Résultat"],
    [
        ["Inscription freelancer → onboarding complet",         "✓ OK"],
        ["Connexion Google OAuth",                              "✓ OK"],
        ["Publication d'une offre client",                      "✓ OK"],
        ["Soumission de proposition (classique + IA)",          "✓ OK"],
        ["Acceptation proposition → création de contrat auto",  "✓ OK"],
        ["Financement escrow d'un jalon",                       "✓ OK"],
        ["Soumission + approbation jalon → paiement libéré",   "✓ OK"],
        ["Messagerie temps réel entre freelancer et client",    "✓ OK"],
        ["Gestion du portfolio (ajout/suppression)",            "✓ OK"],
        ["Dashboard admin avec statistiques",                   "✓ OK"],
        ["Accès refusé si mauvais rôle (403)",                  "✓ OK"],
    ],
    col_widths=[13, 3]
)

# ════════════════════════════════════════════════════════════════
#  12. CONCLUSION ET PERSPECTIVES
# ════════════════════════════════════════════════════════════════
heading(doc, "12. CONCLUSION ET PERSPECTIVES", 1)
heading(doc, "12.1 Bilan", 2)
para(doc,
    "Ce projet de fin d'études m'a permis de concevoir et livrer une application web "
    "full-stack de niveau production, en maîtrisant l'ensemble de la chaîne de développement "
    "moderne : de l'API REST au rendu 3D, de l'authentification OAuth à l'intégration de "
    "l'intelligence artificielle, et du système d'escrow à la messagerie temps réel.")
para(doc, "Réalisations en chiffres :", bold=True)
bullet(doc, "19 tables de base de données modélisées et migrées")
bullet(doc, "40+ endpoints REST API développés et sécurisés")
bullet(doc, "53+ composants React créés")
bullet(doc, "3 systèmes d'authentification (email, Google OAuth, token Bearer)")
bullet(doc, "5 fonctionnalités IA intégrées (Ollama/Mistral)")
bullet(doc, "1 système de paiement escrow fonctionnel (commission 10%)")
bullet(doc, "1 messagerie temps réel opérationnelle (Socket.IO)")
bullet(doc, "1 interface 3D interactive (Three.js)")

heading(doc, "12.2 Perspectives d'évolution", 2)
add_table(doc,
    ["Horizon", "Évolution"],
    [
        ["Court terme",  "Déploiement en production (VPS + Nginx + SSL Let's Encrypt)"],
        ["Court terme",  "Intégration Stripe pour les paiements réels"],
        ["Court terme",  "Tests automatisés (PHPUnit + Vitest)"],
        ["Moyen terme",  "Application mobile (React Native)"],
        ["Moyen terme",  "IA avancée (embeddings vectoriels, recherche sémantique)"],
        ["Moyen terme",  "Vérification d'identité (KYC)"],
        ["Long terme",   "Internationalisation multi-langue (FR / EN / AR)"],
        ["Long terme",   "Programme d'affiliation et API publique"],
    ],
    col_widths=[3.5, 12.5]
)

# ════════════════════════════════════════════════════════════════
#  13. ANNEXES
# ════════════════════════════════════════════════════════════════
page_break(doc)
heading(doc, "13. ANNEXES", 1)
heading(doc, "Annexe A — Endpoints API principaux", 2)
endpoints = [
    ("AUTH",     "POST /api/auth/register",              "Inscription"),
    ("AUTH",     "POST /api/auth/login",                 "Connexion"),
    ("AUTH",     "GET  /auth/google/redirect",           "OAuth Google"),
    ("JOBS",     "GET  /api/jobs",                       "Liste des offres"),
    ("JOBS",     "POST /api/jobs",                       "Créer une offre [client]"),
    ("JOBS",     "GET  /api/jobs/{id}",                  "Détail d'une offre"),
    ("PROPOSALS","POST /api/proposals",                  "Soumettre une proposition [freelancer]"),
    ("PROPOSALS","POST /api/proposals/{id}/accept",      "Accepter [client]"),
    ("PAYMENTS", "POST /api/payments/deposit",           "Déposer des fonds"),
    ("PAYMENTS", "POST /api/payments/fund-escrow",       "Financer l'escrow [client]"),
    ("PAYMENTS", "POST /api/payments/release-milestone", "Libérer un paiement [client]"),
    ("AI",       "POST /api/ai/generate-proposal",       "Générer une proposition [freelancer]"),
    ("AI",       "POST /api/ai/match-freelancers",       "Trouver des freelancers [client]"),
    ("CHAT",     "GET  /api/chat/conversations",         "Mes conversations"),
    ("CHAT",     "POST /api/chat/conversations/{id}/messages", "Envoyer un message"),
    ("ADMIN",    "GET  /api/admin/dashboard",            "Tableau de bord admin"),
    ("ADMIN",    "POST /api/admin/users/{id}/ban",       "Bannir un utilisateur"),
]
add_table(doc,
    ["Domaine", "Endpoint", "Description"],
    endpoints,
    col_widths=[2.5, 7, 6.5]
)

heading(doc, "Annexe B — Variables d'environnement clés", 2)
code_block(doc,
    "APP_NAME=FreeNest\n"
    "APP_URL=http://localhost:8000\n"
    "DB_CONNECTION=mysql\n"
    "DB_DATABASE=freenest_db\n"
    "SANCTUM_STATEFUL_DOMAINS=localhost:5173\n"
    "FRONTEND_URL=http://localhost:5173\n"
    "GOOGLE_CLIENT_ID=your_google_client_id\n"
    "GOOGLE_CLIENT_SECRET=your_google_secret\n"
    "GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback\n"
    "OLLAMA_URL=http://localhost:11434\n"
    "OLLAMA_MODEL=mistral\n"
    "STRIPE_KEY=pk_test_...\n"
    "STRIPE_SECRET=sk_test_..."
)

# ── Pied de page ──────────────────────────────────────────────
for section in doc.sections:
    footer = section.footer
    p = footer.paragraphs[0]
    p.clear()
    r = p.add_run("Rapport de Stage — FreeNest — Ayoub Elmernissi — 2025/2026")
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(120,120,120)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER

# ── Numérotation des pages ────────────────────────────────────
for section in doc.sections:
    footer = section.footer
    p = footer.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.text = 'PAGE'
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'end')
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(120,120,120)

# ── Sauvegarde ────────────────────────────────────────────────
out = r"C:\Users\Pro\Desktop\PFE O1\documentation\FreeNest_Rapport_de_Stage.docx"
doc.save(out)
print("OK - Rapport Word cree : " + out)
