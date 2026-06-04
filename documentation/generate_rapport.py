"""
Genere le rapport de stage FreeNest au format Word (.docx) — version maj. juin 2026
"""
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

doc = Document()

section = doc.sections[0]
section.page_width  = Cm(21)
section.page_height = Cm(29.7)
section.left_margin   = Cm(2.5)
section.right_margin  = Cm(2.5)
section.top_margin    = Cm(2.5)
section.bottom_margin = Cm(2.5)

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
    for r_idx, row in enumerate(rows):
        cells = t.rows[r_idx+1].cells
        for c_idx, val in enumerate(row):
            cells[c_idx].text = str(val)
            cells[c_idx].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in cells[c_idx].paragraphs[0].runs:
                run.font.size = Pt(10)
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

# ═══════════════════════════════════════════════════════════════
#  PAGE DE GARDE
# ═══════════════════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(60)
run = p.add_run("RAPPORT DE STAGE / PROJET DE FIN D'ETUDES")
set_font(run, size=18, bold=True, color=(0, 82, 136))

p2 = doc.add_paragraph()
p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
p2.paragraph_format.space_before = Pt(20)
run2 = p2.add_run("FreeNest")
set_font(run2, size=36, bold=True, color=(0, 120, 215))

p3 = doc.add_paragraph()
p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
run3 = p3.add_run("Conception et Developpement d'une Marketplace Freelance\nFull-Stack avec Intelligence Artificielle")
set_font(run3, size=14, color=(60,60,60))

hr(doc)

info = [
    ("Etudiant",     "Ayoub Elmernissi"),
    ("Email",        "ayoubelmerniss55@gmail.com"),
    ("Formation",    "Licence Professionnelle Informatique"),
    ("Annee",        "2025 - 2026"),
    ("Projet",       "FreeNest — Plateforme Freelance (PFE)"),
    ("Technologies", "Laravel 12  |  React 19  |  MySQL  |  Docker  |  Stripe"),
    ("Date",         "Juin 2026"),
]
for label, val in info:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = p.add_run(label + " : ")
    set_font(r1, bold=True, color=(0,82,136))
    r2 = p.add_run(val)
    set_font(r2, color=(30,30,30))

page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  REMERCIEMENTS
# ═══════════════════════════════════════════════════════════════
heading(doc, "Remerciements", 1)
para(doc, "Je tiens a exprimer ma profonde gratitude envers toutes les personnes qui ont contribue a la realisation de ce projet de fin d'etudes.")
para(doc, "Je remercie particulierement mon encadrant pedagogique pour ses conseils avisees, sa disponibilite et ses orientations tout au long de ce travail.")
para(doc, "Mes remerciements vont egalement a ma famille et mes amis pour leur soutien moral et leur encouragement constant durant cette periode de travail intense.")
para(doc, "Enfin, je remercie la communaute open-source dont les outils (Laravel, React, Stripe, Docker, PlantUML) ont rendu ce projet possible.")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  RESUME
# ═══════════════════════════════════════════════════════════════
heading(doc, "Resume", 1)
para(doc, "FreeNest est une marketplace freelance full-stack de niveau production, developpee dans le cadre d'un Projet de Fin d'Etudes. La plateforme met en relation des freelancers et des clients au travers d'un ecosysteme complet comprenant : gestion de contrats et jalons, paiements en escrow via Stripe, messagerie temps reel avec Laravel Echo/WebSockets, catalogue de services (style Fiverr), gestion d'agences, intelligence artificielle locale (Ollama/Mistral 7B), verification d'identite (KYC), authentification a deux facteurs (2FA), notifications push Web, facturation par abonnement, centre fiscal, et deploiement Docker avec pipelines CI/CD GitHub Actions.")
para(doc, "Cote backend, le projet repose sur Laravel 12 avec Sanctum (tokens Bearer), Socialite (OAuth Google), Spatie Permissions et Stripe (paiements + Connect). Cote frontend, React 19 + Vite avec TailwindCSS 3.4, Zustand 5.0, Framer Motion 12, Three.js et Socket.IO 4.8 offrent une experience utilisateur premium.")
para(doc, "La base de donnees MySQL compte 35+ tables relationnelles. L'API REST expose 100+ endpoints. Le frontend contient 80+ composants React repartis sur 50+ pages. L'application est containerisee avec Docker et deployee via GitHub Actions (CI/CD).")
hr(doc)
para(doc, "Mots-cles : Laravel 12, React 19, Stripe, Escrow, WebSockets, IA, Docker, GitHub Actions, KYC, 2FA, Marketplace Freelance, Agences, Catalogue, PFE", size=10, color=(80,80,80))
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  SOMMAIRE
# ═══════════════════════════════════════════════════════════════
heading(doc, "Table des Matieres", 1)
chapters = [
    ("1",  "Introduction et Contexte du Projet"),
    ("2",  "Analyse des Besoins et Specifications"),
    ("3",  "Architecture Technique"),
    ("4",  "Base de Donnees (35+ Tables)"),
    ("5",  "Authentification, Securite et 2FA"),
    ("6",  "Marketplace : Offres, Propositions, Catalogue"),
    ("7",  "Contrats, Jalons et Suivi du Temps"),
    ("8",  "Systeme de Paiement Escrow et Stripe"),
    ("9",  "Messagerie Temps Reel et Notifications Push"),
    ("10", "Intelligence Artificielle (Ollama / Mistral 7B)"),
    ("11", "Agences et Gestion des Talents"),
    ("12", "Administration, KYC et Finance"),
    ("13", "Deploiement Docker et CI/CD"),
    ("14", "Tests et Qualite"),
    ("15", "Bilan et Perspectives"),
]
for num, title in chapters:
    p = doc.add_paragraph()
    r1 = p.add_run(f"Chapitre {num} — ")
    set_font(r1, bold=True, color=(0,82,136))
    r2 = p.add_run(title)
    set_font(r2)
doc.add_paragraph()
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 1 — INTRODUCTION
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 1 — Introduction et Contexte du Projet", 1)
heading(doc, "1.1 Contexte General", 2)
para(doc, "Le marche mondial du travail freelance connaît une croissance exponentielle. Des plateformes comme Upwork, Fiverr et Malt ont democratise l'acces aux talents independants. Cependant, ces plateformes souffrent de frais eleves (20%+), d'interfaces vieillissantes et d'une dependance aux intermediaires opaques.")
para(doc, "FreeNest (nom de code : Panda) est une reponse academique et technique a cette problematique : une marketplace freelance complete, moderne et production-ready, concue dans le cadre d'un Projet de Fin d'Etudes (PFE).")

heading(doc, "1.2 Objectifs du Projet", 2)
para(doc, "L'objectif principal est de concevoir et developper une plateforme freelance full-stack de niveau professionnel, integrant :")
bullet(doc, "Un systeme de gestion de contrats et jalons complet")
bullet(doc, "Des paiements securises en escrow via Stripe (10% de commission plateforme)")
bullet(doc, "Une messagerie temps reel avec Laravel Echo et WebSockets")
bullet(doc, "Un catalogue de services productises (style Fiverr)")
bullet(doc, "La gestion d'agences avec invitation de membres")
bullet(doc, "Une IA locale (Ollama/Mistral 7B) pour 5 fonctionnalites intelligentes")
bullet(doc, "La verification d'identite KYC et l'authentification 2FA")
bullet(doc, "Un deploiement Docker avec CI/CD GitHub Actions")

heading(doc, "1.3 Perimetre Fonctionnel", 2)
para(doc, "FreeNest couvre l'ensemble du cycle de vie d'une mission freelance : de l'inscription jusqu'a la cloture du contrat et le retrait des gains. La plateforme s'adresse a trois types d'utilisateurs : Freelancers, Clients, et Administrateurs. Elle inclut egalement un systeme d'Agences permettant a des groupes de freelancers de collaborer sous une marque commune.")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 2 — ANALYSE DES BESOINS
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 2 — Analyse des Besoins et Specifications", 1)
heading(doc, "2.1 Acteurs du Systeme", 2)
add_table(doc,
    ["Acteur", "Role", "Acces Principal"],
    [
        ["Freelancer",    "Prestataire de services",  "Profil, Propositions, Contrats, Portefeuille, Catalogue"],
        ["Client",        "Donneur d'ordres",          "Offres, Recrutement, Escrow, Contrats, Talent Lists"],
        ["Admin",         "Gestionnaire plateforme",   "Dashboard, KYC, Finance, Moderation Catalogue"],
        ["Google OAuth",  "Fournisseur d'identite",    "Connexion sociale (Socialite)"],
        ["Stripe",        "Passerelle de paiement",    "Depot, Escrow, Connect, Webhooks"],
        ["Ollama/Mistral","Moteur IA local",            "Generation, Matching, Chat, Analyse, Recherche"],
    ],
    [5, 5, 7]
)

heading(doc, "2.2 Cas d'Utilisation Principaux", 2)
para(doc, "Les cas d'utilisation couvrent l'ensemble du parcours utilisateur :")
bullet(doc, "Authentification : inscription email, connexion Google OAuth 2.0, reset mot de passe, 2FA TOTP")
bullet(doc, "Onboarding : processus guidee en 5 etapes pour les freelancers")
bullet(doc, "Marketplace : publication, recherche full-text, filtres avances, sauvegarde d'offres")
bullet(doc, "Catalogue : services productises avec tiers, commandes, livraisons et avis")
bullet(doc, "Propositions : soumission manuelle ou generee par IA, jalons integres")
bullet(doc, "Contrats : cycle de vie complet, fichiers, suivi du temps, extensions, PDF")
bullet(doc, "Paiements : depot Stripe, escrow, liberation par jalon, retrait via Stripe Connect")
bullet(doc, "Messagerie : conversations temps reel, reactions, accusees de lecture, fichiers")
bullet(doc, "Agences : creation, invitation de membres, transfert de propriete")
bullet(doc, "KYC : upload documents, file admin, approbation/rejet")
bullet(doc, "Facturation : abonnements Stripe (plans), factures hebdomadaires horaires")
bullet(doc, "Administration : tableau de bord, gestion utilisateurs, finance, moderation")

heading(doc, "2.3 Exigences Non Fonctionnelles", 2)
add_table(doc,
    ["Categorie", "Exigence"],
    [
        ["Performance",   "Reponse API < 200ms (hors IA). Lazy loading React, code splitting Vite."],
        ["Securite",      "Bearer tokens Sanctum, 2FA TOTP, HTTPS, rate limiting, validation stricte, KYC."],
        ["Scalabilite",   "Architecture Docker, queues Laravel, indexes full-text MySQL."],
        ["Disponibilite", "CI/CD GitHub Actions, pipelines de test automatises."],
        ["UX",            "Design premium, animations Framer Motion, mode sombre/clair, responsive."],
        ["Conformite",    "Tax Center (W-9/W-8BEN/VAT), audit logs, RGPD-ready."],
    ],
    [4, 13]
)
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 3 — ARCHITECTURE
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 3 — Architecture Technique", 1)
heading(doc, "3.1 Vue d'Ensemble", 2)
para(doc, "FreeNest adopte une architecture microservices-ready basee sur la separation stricte frontend/backend, communicant via une API REST documentee et un canal WebSocket temps reel.")
add_table(doc,
    ["Couche", "Technologie", "Version", "Role"],
    [
        ["Backend",       "Laravel",          "12.x",    "API REST, Auth, Business Logic, Events"],
        ["Frontend",      "React + Vite",     "19 / 6.x","SPA, routing, state, animations 3D"],
        ["Base de donnees","MySQL",            "8.0",     "35+ tables relationnelles, full-text"],
        ["Temps reel",    "Socket.IO / Echo", "4.8 / 2.x","WebSockets, chat, notifications"],
        ["IA",            "Ollama / Mistral", "0.3 / 7B","Generation, matching, analyse"],
        ["Paiements",     "Stripe",           "2024",    "Cards, Connect, Webhooks, Invoices"],
        ["Conteneurisation","Docker + Compose","26.x",   "Dev et prod containerises"],
        ["CI/CD",         "GitHub Actions",   "-",       "Tests, lint, build, deploy auto"],
    ],
    [3.5, 4, 2, 7]
)

heading(doc, "3.2 Stack Backend (Laravel 12)", 2)
para(doc, "Le backend Laravel 12 expose une API REST versionnee sous /api/. Il utilise :")
bullet(doc, "Laravel Sanctum : authentification par tokens Bearer stateless")
bullet(doc, "Laravel Socialite : OAuth 2.0 avec Google")
bullet(doc, "Spatie Laravel Permission : gestion des roles (freelancer / client / admin)")
bullet(doc, "Laravel Echo Server : broadcast d'evenements WebSocket")
bullet(doc, "Stripe PHP SDK : paiements, Connect, Webhooks")
bullet(doc, "Intervention/Image : traitement et redimensionnement des images")
bullet(doc, "Laravel Queues : taches asynchrones (emails, IA, webhooks)")
bullet(doc, "Rate Limiting : protection des endpoints sensibles (auth: 10/min, IA: 20/min)")

heading(doc, "3.3 Stack Frontend (React 19)", 2)
add_table(doc,
    ["Bibliotheque", "Version", "Usage"],
    [
        ["React",             "19.x",  "UI declarative, Concurrent Mode, Suspense"],
        ["Vite",              "6.x",   "Build ultra-rapide, HMR, code splitting"],
        ["TailwindCSS",       "3.4",   "Design system, dark/light mode, CSS variables"],
        ["Zustand",           "5.0",   "State management global (auth, chat, theme)"],
        ["Framer Motion",     "12.x",  "Animations fluides, page transitions"],
        ["Three.js + R3F",    "0.170+","Globe 3D interactif (landing page)"],
        ["Socket.IO Client",  "4.8",   "WebSocket temps reel (chat, notifications)"],
        ["Recharts",          "3.8",   "Graphiques dashboard (revenus, activite)"],
        ["Axios",             "1.16",  "Client HTTP, interceptors token + refresh"],
        ["React Hot Toast",   "2.x",   "Notifications toast premium"],
        ["React Router DOM",  "7.x",   "SPA routing, protected routes, lazy loading"],
    ],
    [4, 2, 11]
)

heading(doc, "3.4 Architecture des Evenements Temps Reel", 2)
para(doc, "Le systeme de messagerie temps reel repose sur Laravel Broadcasting avec les evenements suivants :")
add_table(doc,
    ["Evenement", "Declencheur", "Abonnes"],
    [
        ["MessageSent",            "Envoi d'un message",              "Participants de la conversation"],
        ["MessageEdited",          "Edition d'un message",            "Participants de la conversation"],
        ["MessageDeleted",         "Suppression d'un message",        "Participants de la conversation"],
        ["MessageRead",            "Lecture d'un message",            "Emetteur du message"],
        ["MessageDelivered",       "Livraison d'un message",          "Emetteur du message"],
        ["MessageReactionToggled", "Reaction emoji sur message",      "Participants de la conversation"],
        ["UserTyping",             "Indicateur de frappe",            "Participants de la conversation"],
        ["ConversationUpdated",    "Mise a jour meta-conversation",   "Participants de la conversation"],
        ["NotificationCreated",    "Creation d'une notification",     "Utilisateur destinataire"],
        ["WeeklyInvoiceGenerated", "Facture hebdomadaire emise",       "Freelancer concerne"],
        ["WeeklyInvoicePaid",      "Facture hebdomadaire payee",       "Client concerne"],
    ],
    [5, 5, 7]
)

heading(doc, "3.5 CI/CD et Deploiement", 2)
para(doc, "Deux pipelines GitHub Actions automatisent le cycle de livraison :")
bullet(doc, "backend.yml : PHP lint, tests PHPUnit, analyse statique, build Docker image")
bullet(doc, "frontend.yml : npm install, ESLint, Vite build, tests Vitest")
para(doc, "La containerisation Docker utilise un Dockerfile multi-stage pour le backend (PHP-FPM + Nginx) et un Dockerfile Nginx pour le frontend. Un docker-compose.yml orchestre l'ensemble des services en local et en production.")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 4 — BASE DE DONNEES
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 4 — Base de Donnees (35+ Tables)", 1)
heading(doc, "4.1 Schema General", 2)
para(doc, "La base de donnees MySQL 8.0 est organisee en domaines fonctionnels. Des index FULLTEXT sont ajoutes sur les champs de recherche (titre, description, bio, competences) pour les requetes de recherche globale.")

heading(doc, "4.2 Tables par Domaine", 2)
add_table(doc,
    ["Domaine", "Tables", "Description"],
    [
        ["Utilisateurs",    "users, personal_access_tokens",                                          "Comptes, roles, 2FA, phone, tokens Sanctum"],
        ["Profils",         "freelancer_profiles, client_profiles",                                   "Profils etendus par role, onboarding, stats"],
        ["Competences",     "categories, skills, freelancer_skills",                                  "Taxonomie hierarchique, niveaux"],
        ["Portfolio",       "portfolios",                                                             "Projets portfolio avec images JSON"],
        ["Offres",          "job_postings, saved_jobs",                                               "Offres clients, statuts, sauvegarde"],
        ["Propositions",    "proposals",                                                              "Propositions freelancers, jalons JSON"],
        ["Contrats",        "contracts, contract_activities, contract_extensions, contract_files",    "Cycle de vie complet, fichiers, historique"],
        ["Jalons",          "milestones",                                                             "Decoupe du travail, statuts, escrow"],
        ["Temps",           "time_logs",                                                              "Suivi temps horaire par contrat"],
        ["Paiements",       "wallets, transactions, withdrawals, stripe_webhook_events",              "Escrow 3 balances, historique, retraits"],
        ["Facturation",     "subscriptions, subscription_items, weekly_invoices",                    "Plans Stripe, factures hebdo horaires"],
        ["Catalogue",       "catalog_projects, catalog_project_images, catalog_orders, catalog_reviews, saved_catalog_projects", "Services productises (Fiverr-like)"],
        ["Agences",         "agencies, agency_members, agency_invitations",                          "Groupes freelancers, invitations token"],
        ["Messagerie",      "conversations, messages, message_reactions",                             "Chat temps reel, reactions emoji"],
        ["Avis",            "reviews",                                                               "Notations post-contrat"],
        ["IA",              "ai_histories",                                                           "Logs des appels Ollama, tokens"],
        ["Talents",         "talent_lists, saved_freelancers",                                       "Listes curees, signets freelancers"],
        ["KYC / Compliance","identity_verifications, tax_documents, audit_logs",                     "Verif. identite, fisc., piste audit"],
        ["Notifications",   "notifications, push_subscriptions",                                     "Notif. in-app + Web Push"],
        ["Platform",        "platform_settings",                                                     "Parametres plateforme (commission, etc.)"],
    ],
    [3, 6, 7.5]
)

heading(doc, "4.3 Wallet a 3 Balances", 2)
para(doc, "Chaque utilisateur dispose d'un portefeuille (table wallets) avec trois balances distinctes :")
add_table(doc,
    ["Balance", "Role", "Mouvement"],
    [
        ["balance",         "Fonds disponibles et retirables",   "Incremente lors de liberation de paiement (90%)"],
        ["pending_balance", "Fonds en attente de validation",    "Utilisee pour les transferts en cours"],
        ["escrow_balance",  "Fonds bloques en garantie",         "Debite du client, libere au freelancer via jalon"],
    ],
    [4, 6, 7]
)
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 5 — AUTHENTIFICATION ET SECURITE
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 5 — Authentification, Securite et 2FA", 1)
heading(doc, "5.1 Inscription et Connexion", 2)
para(doc, "FreeNest propose deux methodes d'authentification :")
bullet(doc, "Email / Mot de passe : validation stricte (unique, bcrypt), token Sanctum retourne")
bullet(doc, "Google OAuth 2.0 : via Laravel Socialite, creation ou liaison de compte automatique")
para(doc, "Le flux d'onboarding en 5 etapes guide les nouveaux freelancers (categorie, niveau, formation, tarif, photo/langues) avant d'acceder au tableau de bord.")

heading(doc, "5.2 Reinitialisation du Mot de Passe", 2)
para(doc, "Un systeme de reset par email en deux etapes est implemente :")
bullet(doc, "POST /api/auth/forgot-password : envoie un email avec lien signe (throttle: 5/min)")
bullet(doc, "POST /api/auth/reset-password : valide le token, met a jour le mot de passe")

heading(doc, "5.3 Authentification a Deux Facteurs (2FA TOTP)", 2)
para(doc, "Le module 2FA TOTP (Time-based One-Time Password) est integre directement :")
add_table(doc,
    ["Endpoint", "Action"],
    [
        ["GET  /api/two-factor/status",             "Statut d'activation du 2FA"],
        ["POST /api/two-factor/enable",             "Genere secret + QR Code (Google Authenticator)"],
        ["POST /api/two-factor/confirm",            "Confirme le code TOTP pour activer"],
        ["POST /api/two-factor/disable",            "Desactive le 2FA"],
        ["GET  /api/two-factor/recovery-codes",     "Codes de secours (8 codes jetables)"],
        ["POST /api/two-factor/recovery-codes/regenerate", "Regenere les codes de secours"],
    ],
    [8, 9]
)

heading(doc, "5.4 Verification d'Identite KYC", 2)
para(doc, "Le processus KYC (Know Your Customer) permet a la plateforme de verifier l'identite des utilisateurs avant de les autoriser a retirer des fonds :")
bullet(doc, "L'utilisateur soumet ses documents (passeport, CNI, justificatif de domicile) via upload")
bullet(doc, "Les documents sont stockes en local (Storage::disk('local')) et jamais exposes publiquement")
bullet(doc, "L'admin examine la file KYC via /api/admin/kyc et approuve ou rejette")
bullet(doc, "Le statut est expose via GET /api/verify-identity/status")

heading(doc, "5.5 Rate Limiting et Securite Generale", 2)
bullet(doc, "Auth endpoints : throttle 10 req/min (brute-force protection)")
bullet(doc, "Password reset : throttle 5 req/min (anti-spam)")
bullet(doc, "IA endpoints : throttle 20 req/min (protection des couts)")
bullet(doc, "Search public : throttle 60/120 req/min (autocomplete)")
bullet(doc, "Validation Laravel stricte sur toutes les entrees (Form Requests)")
bullet(doc, "Audit logs : toute action sensible est tracee dans la table audit_logs")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 6 — MARKETPLACE
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 6 — Marketplace : Offres, Propositions, Catalogue", 1)
heading(doc, "6.1 Gestion des Offres d'Emploi", 2)
para(doc, "Les clients publient des offres d'emploi avec titre, description, budget (min/max), type (horaire/fixe), competences requises et categorie. Chaque offre passe par un cycle de statuts : draft -> open -> in_progress -> completed / cancelled.")
para(doc, "La recherche utilise des index FULLTEXT MySQL pour des recherches ultra-rapides sur titre, description et competences. Des filtres permettent le tri par categorie, budget, type et date.")

heading(doc, "6.2 Systeme de Propositions", 2)
para(doc, "Les freelancers soumettent des propositions avec :")
bullet(doc, "Lettre de motivation (manuelle ou generee par IA Ollama)")
bullet(doc, "Montant propose (bid_amount)")
bullet(doc, "Decoupe en jalons (milestones JSON)")
bullet(doc, "Flag is_ai_generated pour la transparence")
para(doc, "Le client peut accepter (ce qui cree automatiquement un contrat) ou rejeter. L'acceptation rejette automatiquement toutes les autres propositions pour cette offre.")

heading(doc, "6.3 Catalogue de Services (Style Fiverr)", 2)
para(doc, "En plus des offres, FreeNest propose un Catalogue de services productises ou les freelancers vendent des prestations standardisees :")
add_table(doc,
    ["Fonctionnalite", "Description"],
    [
        ["CatalogProject", "Service avec titre, description, tiers tarifaires (Basic/Standard/Premium), images"],
        ["CatalogOrder",   "Commande d'un tier, livraison de fichiers, validation client"],
        ["CatalogReview",  "Note et avis post-commande (1-5 etoiles)"],
        ["Saved Catalog",  "Sauvegarde de services favoris"],
        ["Moderation Admin","L'admin approuve ou rejette les services avant publication"],
    ],
    [5, 12]
)

heading(doc, "6.4 Recherche Globale", 2)
para(doc, "Le SearchController fournit deux endpoints :")
bullet(doc, "GET /api/search : recherche unifiee sur offres, freelancers, services, agences")
bullet(doc, "GET /api/search/suggest : autocomplete temps reel (throttle 120/min)")
para(doc, "Les index FULLTEXT MySQL sur les champs cles garantissent des resultats pertinents en moins de 50ms.")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 7 — CONTRATS, JALONS, TEMPS
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 7 — Contrats, Jalons et Suivi du Temps", 1)
heading(doc, "7.1 Cycle de Vie d'un Contrat", 2)
para(doc, "Un contrat est cree automatiquement lors de l'acceptation d'une proposition. Il suit un cycle de vie strict :")
add_table(doc,
    ["Statut", "Description", "Transition"],
    [
        ["active",    "Contrat en cours",             "Depuis creation (proposition acceptee)"],
        ["paused",    "Travail suspendu",              "Depuis active, retour possible"],
        ["completed", "Tous jalons approuves",         "Fin normale du contrat"],
        ["disputed",  "Litige ouvert",                 "Resolu par admin (freelancer gagne ou remboursement)"],
        ["cancelled", "Annulation mutuelle",           "Accord des deux parties ou admin"],
    ],
    [3, 6, 8]
)

heading(doc, "7.2 Fonctionnalites Avancees des Contrats", 2)
add_table(doc,
    ["Fonctionnalite", "Endpoint", "Description"],
    [
        ["Fichiers",       "POST /contracts/{id}/files",       "Upload de fichiers livres avec versioning"],
        ["Suivi du temps", "POST /contracts/{id}/time/start",  "Timer horaire start/stop, log en base"],
        ["Extensions",     "POST /contracts/{id}/extensions",  "Demande d'extension de deadline, approbation"],
        ["Analytics",      "GET /contracts/{id}/analytics",    "Stats: temps passe, jalons, budget reste"],
        ["Activite",       "GET /contracts/{id}/activity",     "Journal d'activite chronologique"],
        ["PDF",            "GET /contracts/{id}/pdf",          "Export PDF du contrat signe"],
        ["PDF Litige",     "GET /contracts/{id}/dispute-pdf",  "PDF du dossier de litige pour arbitrage"],
        ["Archive",        "POST /contracts/{id}/archive",     "Archivage des contrats termines"],
    ],
    [3.5, 5.5, 8]
)

heading(doc, "7.3 Workflow des Jalons", 2)
para(doc, "Chaque contrat est decoupee en jalons (milestones). Chaque jalon suit son propre cycle de vie :")
add_table(doc,
    ["Statut Jalon", "Acteur", "Action"],
    [
        ["pending",   "Systeme",    "Cree lors de la creation du contrat"],
        ["funded",    "Client",     "Client finance l'escrow (POST /payments/contracts/{id}/fund-escrow)"],
        ["submitted", "Freelancer", "Freelancer soumet son travail avec fichiers et notes"],
        ["approved",  "Client",     "Client approuve -> paiement libere automatiquement (90%)"],
        ["rejected",  "Client",     "Client demande des corrections -> retour a 'funded'"],
        ["disputed",  "Admin",      "Admin arbitre -> 'approved' ou 'pending' (remboursement)"],
    ],
    [3.5, 3, 11]
)

heading(doc, "7.4 Suivi du Temps (Time Tracking)", 2)
para(doc, "Pour les contrats horaires, un systeme de suivi du temps est integre :")
bullet(doc, "POST /contracts/{id}/time/start : demarre un timer (cree un TimeLog ouvert)")
bullet(doc, "POST /contracts/{id}/time/stop : arrete le timer (calcule la duree en minutes)")
bullet(doc, "GET /contracts/{id}/time/weekly : resume hebdomadaire avec calcul de facturation")
para(doc, "Les WeeklyInvoices sont generees automatiquement via une commande Laravel schedulee (HourlyGenerateInvoicesCommand), avec evenements WeeklyInvoiceGenerated et WeeklyInvoicePaid.")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 8 — PAIEMENTS ESCROW ET STRIPE
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 8 — Systeme de Paiement Escrow et Stripe", 1)
heading(doc, "8.1 Architecture du Systeme de Paiement", 2)
para(doc, "FreeNest integre Stripe comme passerelle de paiement principale. Le systeme supporte deux modes de depot :")
bullet(doc, "Stripe Checkout Session : paiement par carte bancaire securise (3D Secure)")
bullet(doc, "Stripe Connect : les freelancers connectent leur compte bancaire pour recevoir des virements")

heading(doc, "8.2 Flux de Paiement Escrow", 2)
para(doc, "Le flux en 4 phases garantit la securite des deux parties :")
add_table(doc,
    ["Phase", "Action", "Effet en Base de Donnees"],
    [
        ["1. Depot",     "Client recharge son solde via Stripe Checkout", "wallet.balance += montant - fees"],
        ["2. Escrow",    "Client bloque des fonds pour un jalon",          "balance -= X, escrow_balance += X, milestone='funded'"],
        ["3. Livraison", "Freelancer soumet son travail",                  "milestone.status = 'submitted'"],
        ["4. Liberation","Client approuve le travail",                     "escrow -= X, freelancer.balance += 90%, 2 transactions INSERT, COMMIT atomique"],
    ],
    [3, 5, 9]
)

heading(doc, "8.3 Stripe Connect et Retraits", 2)
para(doc, "Les freelancers peuvent retirer leurs gains via Stripe Connect Express :")
bullet(doc, "POST /payments/stripe/connect/onboard : cree une session d'onboarding Stripe Connect")
bullet(doc, "GET /payments/stripe/connect/status : verifie si le compte est pleinement configure")
bullet(doc, "POST /payments/withdrawals : demande un retrait (soumis a approbation admin si non-KYC)")
bullet(doc, "L'admin valide ou rejette les retraits via /api/admin/finance/withdrawals/{id}/approve")

heading(doc, "8.4 Stripe Webhooks", 2)
para(doc, "Le StripeWebhookController gere les evenements Stripe entrants :")
bullet(doc, "checkout.session.completed : confirme un depot Stripe, credite le portefeuille")
bullet(doc, "account.updated : met a jour le statut Stripe Connect du freelancer")
bullet(doc, "invoice.paid : confirme le paiement d'un abonnement")
bullet(doc, "Signature HMAC verifiee (Stripe::constructEvent) — aucune auth Sanctum sur ce endpoint")

heading(doc, "8.5 Abonnements (Plans)", 2)
para(doc, "FreeNest propose un systeme d'abonnement Stripe pour des plans premium (acces a des fonctionnalites avancees, plus de 'connects', mise en avant) :")
bullet(doc, "GET /api/plans : catalogue public des plans (prix, features)")
bullet(doc, "POST /api/billing/checkout : cree une session Stripe Checkout pour souscription")
bullet(doc, "POST /api/billing/swap : change de plan (upgrade/downgrade)")
bullet(doc, "GET /api/billing/portal : acces au portail de facturation Stripe")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 9 — MESSAGERIE ET NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 9 — Messagerie Temps Reel et Notifications Push", 1)
heading(doc, "9.1 Architecture de la Messagerie", 2)
para(doc, "La messagerie repose sur Laravel Echo Server pour le broadcast et Socket.IO 4.8 cote client. Les conversations sont liees a des contrats ou sont des discussions directes entre utilisateurs.")

heading(doc, "9.2 Fonctionnalites de Chat", 2)
add_table(doc,
    ["Fonctionnalite", "Endpoint / Evenement", "Description"],
    [
        ["Envoyer message",      "POST /chat/conversations/{id}/send",    "Texte, fichiers, images"],
        ["Editer message",       "PUT /chat/messages/{id}",               "Modification avec historique"],
        ["Supprimer message",    "DELETE /chat/messages/{id}",            "Suppression douce"],
        ["Reactions emoji",      "POST /chat/messages/{id}/reactions",    "Toggle emoji (like, love, etc.)"],
        ["Accusee de lecture",   "POST /chat/conversations/{id}/read",    "Marquer tous les messages comme lus"],
        ["Indicateur frappe",    "POST /chat/conversations/{id}/typing",  "Broadcast 'X est en train d'ecrire...'"],
        ["Livraison",            "POST /chat/messages/{id}/delivered",    "Confirmation reception"],
        ["Piece jointe",         "POST /chat/.../attachment",             "Upload et envoi de fichiers"],
        ["Recherche conversation","GET /chat/conversations/search",       "Recherche par nom ou message"],
    ],
    [4, 6, 7]
)

heading(doc, "9.3 Notifications Push Web", 2)
para(doc, "FreeNest implemente la Web Push API (VAPID) pour les notifications navigateur :")
bullet(doc, "Service Worker (sw.js) enregistre cote client pour recevoir les push")
bullet(doc, "POST /api/push/subscribe : enregistre l'endpoint push du navigateur")
bullet(doc, "DELETE /api/push/subscribe : desabonnement")
bullet(doc, "Les notifications sont envoyees via webpush() pour les evenements cles (message recu, contrat mis a jour, jalon approuve)")
bullet(doc, "browserNotify.js : API Notification navigateur avec icone et son (sound.js)")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 10 — INTELLIGENCE ARTIFICIELLE
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 10 — Intelligence Artificielle (Ollama / Mistral 7B)", 1)
heading(doc, "10.1 Architecture IA", 2)
para(doc, "FreeNest integre un moteur d'IA local via Ollama avec le modele Mistral 7B. Cette approche garantit la confidentialite des donnees (pas d'envoi vers des APIs externes) et elimine les couts variables d'API comme OpenAI.")
add_table(doc,
    ["Fonctionnalite IA", "Endpoint", "Description"],
    [
        ["Generation de proposition","POST /api/ai/generate-proposal", "Redige une proposition personnalisee a partir du profil freelancer + details offre"],
        ["Matching freelancers",     "POST /api/ai/match-freelancers",  "Recommande les meilleurs freelancers pour une offre client"],
        ["Analyse de profil",        "POST /api/ai/analyze-profile",    "Donne des conseils pour optimiser le profil freelancer"],
        ["Chat assistant",           "POST /api/ai/chat",               "Assistant IA conversationnel (questions/reponses contextuelles)"],
        ["Recherche intelligente",   "POST /api/ai/smart-search",       "Recherche semantique au-dela des mots-cles"],
    ],
    [5, 5, 7.5]
)

heading(doc, "10.2 Fallback en Cas d'Indisponibilite", 2)
para(doc, "Si Ollama est indisponible (service arrete), le controller retourne une reponse de fallback pre-generee avec le flag is_fallback: true. Cette approche garantit que l'interface reste fonctionnelle en toute circonstance.")

heading(doc, "10.3 Protection des Couts", 2)
para(doc, "Tous les endpoints IA sont proteges par un rate limiter strict (throttle:20,1 — 20 requetes par minute par utilisateur). Chaque appel est logue dans ai_histories avec le nombre de tokens utilises, permettant un audit et une facturation future par usage.")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 11 — AGENCES ET TALENTS
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 11 — Agences et Gestion des Talents", 1)
heading(doc, "11.1 Systeme d'Agences", 2)
para(doc, "FreeNest permet a des groupes de freelancers de se regrouper sous une agence avec une marque commune. Une agence peut avoir plusieurs membres avec des roles distincts.")
add_table(doc,
    ["Fonctionnalite", "Description"],
    [
        ["Creation",              "POST /api/agencies — createur devient owner automatiquement"],
        ["Invitation",            "POST /api/agencies/{id}/invitations — email + token unique envoye"],
        ["Acceptation",           "POST /api/agencies/invitations/{token}/accept"],
        ["Gestion des membres",   "Roles: owner, admin, member — visualisation et retrait"],
        ["Transfert propriete",   "POST /api/agencies/{id}/transfer-ownership"],
        ["Page publique",         "GET /api/agencies/{id} — repertoire public des agences"],
    ],
    [4, 13]
)

heading(doc, "11.2 Gestion des Talents (Clients)", 2)
para(doc, "Les clients disposent d'outils pour organiser les freelancers qu'ils suivent :")
bullet(doc, "Saved Freelancers : signets rapides (un clic) — GET/POST/DELETE /api/saved-freelancers")
bullet(doc, "Talent Lists : listes nommees et curees de freelancers (type 'liste favoris React', 'designers UI')")
bullet(doc, "Les listes permettent d'ajouter ou retirer des membres avec notes personnelles")

heading(doc, "11.3 Centre Fiscal", 2)
para(doc, "Le TaxCenter permet aux utilisateurs de gerer leurs documents fiscaux :")
bullet(doc, "Soumission de formulaires W-9 (USA), W-8BEN (international), VAT (Europe)")
bullet(doc, "Export PDF des documents fiscaux")
bullet(doc, "Validation et approbation admin via /api/admin/tax-documents")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 12 — ADMINISTRATION, KYC, FINANCE
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 12 — Administration, KYC et Finance", 1)
heading(doc, "12.1 Tableau de Bord Admin", 2)
para(doc, "L'espace admin (protege par middleware 'admin' + double verification en controller) donne acces a :")
bullet(doc, "Statistiques plateforme : utilisateurs, offres, revenus, contrats")
bullet(doc, "Gestion utilisateurs : ban, verification, details")
bullet(doc, "Analytics avancees")

heading(doc, "12.2 Finance Admin", 2)
add_table(doc,
    ["Endpoint Admin Finance", "Action"],
    [
        ["GET /admin/finance/dashboard",                  "Vue d'ensemble : GMV, commissions, retraits en attente"],
        ["GET /admin/finance/withdrawals",                "Liste des demandes de retrait a traiter"],
        ["POST /admin/finance/withdrawals/{id}/approve",  "Approuve un retrait (declenche virement Stripe)"],
        ["POST /admin/finance/withdrawals/{id}/reject",   "Rejette un retrait avec motif"],
        ["GET /admin/finance/settings",                   "Parametres plateforme (taux commission, limites)"],
        ["PUT /admin/finance/settings",                   "Mise a jour des parametres"],
    ],
    [8, 9]
)

heading(doc, "12.3 File KYC Admin", 2)
para(doc, "L'admin dispose d'une interface de traitement KYC :")
bullet(doc, "GET /admin/kyc : liste des soumissions en attente")
bullet(doc, "GET /admin/kyc/{id} : detail avec acces securise aux fichiers documents")
bullet(doc, "POST /admin/kyc/{id}/approve : approuve, met a jour le statut utilisateur")
bullet(doc, "POST /admin/kyc/{id}/reject : rejette avec message d'explication")
bullet(doc, "Les fichiers sensibles sont servis via route signee avec verification Storage::exists")

heading(doc, "12.4 Audit Logs", 2)
para(doc, "Toutes les actions sensibles (approbation/rejet KYC, modifications admin, changements de mot de passe) sont tracees dans la table audit_logs avec : user_id, action, metadata JSON, ip_address, created_at. Cela garantit une piste d'audit complete pour la conformite.")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 13 — DOCKER ET CI/CD
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 13 — Deploiement Docker et CI/CD", 1)
heading(doc, "13.1 Containerisation Docker", 2)
para(doc, "L'application est entierement containerisee pour garantir la reproductibilite des environnements de developpement et de production.")
add_table(doc,
    ["Service", "Image", "Description"],
    [
        ["backend",  "Dockerfile multi-stage (PHP 8.2-FPM + Nginx)", "API Laravel 12, queues, scheduler"],
        ["frontend", "Dockerfile Nginx (Vite build)",                "SPA React 19 servie par Nginx"],
        ["mysql",    "mysql:8.0",                                    "Base de donnees MySQL"],
        ["redis",    "redis:7-alpine",                               "Cache, sessions, queues Laravel"],
        ["soketi",   "quay.io/soketi/soketi",                        "Serveur WebSocket compatible Pusher"],
        ["ollama",   "ollama/ollama",                                "Moteur IA local Mistral 7B"],
    ],
    [3, 7, 7]
)

heading(doc, "13.2 Pipelines CI/CD GitHub Actions", 2)
para(doc, "Deux workflows YAML automatisent le cycle de livraison :")
bullet(doc, "backend.yml : PHP CS Fixer, PHPStan (analyse statique), PHPUnit (tests), build image Docker")
bullet(doc, "frontend.yml : npm ci, ESLint, Vite build, Vitest (tests unitaires React)")
para(doc, "Les pipelines se declenchent sur chaque push et pull request vers la branche main. Un echec d'un test bloque le merge automatiquement.")

heading(doc, "13.3 Configuration Production", 2)
para(doc, "Le frontend est configure avec un nginx.conf dedie qui gere :")
bullet(doc, "Gzip compression pour les assets JS/CSS/HTML")
bullet(doc, "Cache-Control headers (assets: 1 an, index.html: no-cache)")
bullet(doc, "try_files pour le routing SPA React (toutes les routes -> index.html)")
bullet(doc, "Service Worker (sw.js) pour les Push Notifications")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 14 — TESTS ET QUALITE
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 14 — Tests et Qualite", 1)
heading(doc, "14.1 Tests Backend", 2)
bullet(doc, "PHPUnit : tests unitaires des controllers et services critiques (paiements, escrow, KYC)")
bullet(doc, "Laravel HTTP Tests : tests d'integration des endpoints API")
bullet(doc, "Test de la signature Stripe Webhook : verification du rejet des requetes non signees")

heading(doc, "14.2 Tests Frontend", 2)
bullet(doc, "Vitest : tests unitaires des composants React (formulaires, logique metier)")
bullet(doc, "ESLint + Prettier : conformite du code, style uniforme")
bullet(doc, "React Testing Library : tests comportementaux des composants UI")

heading(doc, "14.3 Qualite du Code", 2)
add_table(doc,
    ["Outil", "Cible", "Objectif"],
    [
        ["PHPStan (niveau 6)", "Backend Laravel",  "Detection d'erreurs de types statiques"],
        ["PHP CS Fixer",       "Backend Laravel",  "Conformite PSR-12"],
        ["ESLint",             "Frontend React",   "Linting JavaScript/JSX"],
        ["Prettier",           "Frontend React",   "Formatage automatique"],
        ["Docker healthcheck", "Tous services",    "Verification de sante des containers"],
    ],
    [4, 4, 9]
)
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  CHAPITRE 15 — BILAN ET PERSPECTIVES
# ═══════════════════════════════════════════════════════════════
heading(doc, "Chapitre 15 — Bilan et Perspectives", 1)
heading(doc, "15.1 Bilan Technique", 2)
para(doc, "FreeNest est une application de niveau production integrant des technologies de pointe. Le tableau suivant resume les chiffres cles du projet :")
add_table(doc,
    ["Metrique", "Valeur"],
    [
        ["Tables de base de donnees",  "35+"],
        ["Endpoints API REST",          "100+"],
        ["Pages React",                 "50+"],
        ["Composants React",            "80+"],
        ["Evenements WebSocket",        "11"],
        ["Fonctionnalites IA",          "5"],
        ["Pipelines CI/CD",             "2 (backend + frontend)"],
        ["Services Docker",             "6+"],
        ["Taux de commission",          "10% par transaction"],
        ["Lignes de code (total)",      "~25 000+"],
    ],
    [8, 9]
)

heading(doc, "15.2 Competences Acquises", 2)
bullet(doc, "Architecture full-stack decouplee (API REST + SPA)")
bullet(doc, "Paiements en ligne securises (Stripe, escrow, webhooks)")
bullet(doc, "Temps reel avec Laravel Broadcasting et Socket.IO")
bullet(doc, "Securite avancee : 2FA TOTP, KYC, audit logs, rate limiting")
bullet(doc, "DevOps : Docker, GitHub Actions, Nginx, CI/CD")
bullet(doc, "Integration IA locale avec Ollama et Mistral 7B")
bullet(doc, "Conception de base de donnees relationnelles complexes (35+ tables)")

heading(doc, "15.3 Perspectives d'Evolution", 2)
para(doc, "Plusieurs axes d'amelioration peuvent enrichir FreeNest a l'avenir :")
bullet(doc, "Application mobile React Native (iOS + Android)")
bullet(doc, "Migration vers une architecture microservices (Auth Service, Payment Service, AI Service)")
bullet(doc, "Integration de modeles IA multimodaux pour l'analyse de portfolios images/videos")
bullet(doc, "Systeme de mise en relation video integre (contractuel, rencontres initiales)")
bullet(doc, "Expansion internationale : multi-devises, traduction i18n, portails regionaux")
bullet(doc, "Programme de certifications freelancers avec examen en ligne")
bullet(doc, "Kubernetes pour l'orchestration des containers en production haute disponibilite")

heading(doc, "15.4 Conclusion", 2)
para(doc, "Ce projet de fin d'etudes represente une realisation technique complete et ambitieuse. FreeNest va bien au-dela d'un simple projet academique : c'est une application de marketplace full-stack de niveau production, containerisee, testee, securisee et dotee d'une IA locale. Il demontre la maitrise de l'ensemble de la chaine de valeur logicielle : de la conception de la base de donnees aux pipelines CI/CD, en passant par l'integration de paiements et l'intelligence artificielle.")
para(doc, "Ce projet illustre parfaitement la vision d'une marketplace freelance moderne, alternative credible aux plateformes etablies, construite avec les outils et pratiques de l'industrie 2026.")
page_break(doc)

# ═══════════════════════════════════════════════════════════════
#  ANNEXES
# ═══════════════════════════════════════════════════════════════
heading(doc, "Annexes", 1)
heading(doc, "A. Liste Complete des Endpoints API", 2)
add_table(doc,
    ["Domaine", "Methodes", "Prefix"],
    [
        ["Authentification",    "register, login, logout, me, updateProfile, changePassword, forgot, reset, verifyPhone", "/api/auth/"],
        ["2FA",                 "status, enable, confirm, disable, qrCode, recoveryCodes, regenerate",          "/api/two-factor/"],
        ["KYC",                 "status, store, adminIndex, adminShow, approve, reject",                         "/api/verify-identity/"],
        ["Offres",              "index, show, store, update, destroy, save, myJobs, categories",                 "/api/jobs/"],
        ["Propositions",        "index, store, myProposals, accept, reject, withdraw",                           "/api/proposals/"],
        ["Freelancer",          "index, show, updateProfile, onboarding, addSkills, portfolio, dashboard",       "/api/freelancer/"],
        ["Contrats",            "index, myActive, myCompleted, myDisputed, show, complete, cancel, dispute, resolveDispute, archive, pdf", "/api/contracts/"],
        ["Jalons",              "index, store, show, update, destroy, submit, approve, reject",                  "/api/milestones/"],
        ["Temps",               "index, weekly, start, stop",                                                    "/api/contracts/{id}/time/"],
        ["Extensions",          "index, store, respond",                                                         "/api/contract-extensions/"],
        ["Fichiers Contrat",    "index, store, download, storeVersion, destroy",                                 "/api/contract-files/"],
        ["Paiements",           "wallet, overview, deposit, fundEscrow, releaseMilestone, withdrawals, stripe", "/api/payments/"],
        ["Facturation",         "current, checkout, swap, cancel, resume, portal, invoices, weekly",            "/api/billing/"],
        ["Chat",                "conversations, start, messages, send, search, typing, read, delivered, edit, delete, react, attachment", "/api/chat/"],
        ["IA",                  "generateProposal, matchFreelancers, chat, analyzeProfile, smartSearch",         "/api/ai/"],
        ["Catalogue",           "index, show, store, update, destroy, save, orders, checkout, deliver, review", "/api/catalog/"],
        ["Agences",             "index, show, store, update, destroy, members, invite, accept, decline, transfer", "/api/agencies/"],
        ["Talents",             "savedFreelancers, talentLists, CRUD + members",                                 "/api/saved-freelancers/ + /talent-lists/"],
        ["Fiscal",              "index, store, show, pdf, adminIndex, approve, reject",                          "/api/tax-documents/"],
        ["Recherche",           "search, suggest",                                                               "/api/search/"],
        ["Push",                "vapidKey, subscribe, unsubscribe",                                              "/api/push/"],
        ["Avis",                "forFreelancer, store, destroy",                                                 "/api/reviews/"],
        ["Admin",               "dashboard, users, ban, verify, analytics, finance, KYC, catalog",              "/api/admin/"],
    ],
    [3.5, 7, 7]
)

heading(doc, "B. Structure des Dossiers", 2)
code_block(doc, """backend-laravel/
  app/
    Http/Controllers/API/   # 30+ controllers organises par domaine
    Models/                 # 40+ modeles Eloquent
    Events/                 # 11 evenements WebSocket
    Listeners/              # Handlers d'evenements
    Http/Requests/          # Form Requests (validation)
    Http/Middleware/        # admin, EnsurePlan, throttle
  database/
    migrations/             # 30+ fichiers de migration
  routes/
    api.php                 # 100+ endpoints REST
    channels.php            # Canaux WebSocket
  .github/workflows/        # CI/CD GitHub Actions

frontend-react/
  src/
    pages/                  # 50+ pages organisees par domaine
    components/             # 80+ composants reutilisables
    store/                  # Zustand stores (auth, chat, theme)
    api/                    # Axios client + index.js (toutes les fonctions API)
    lib/                    # echo.js, browserNotify.js, sound.js, webPush.js
    utils/                  # Utilitaires (footerLinks, etc.)
  Dockerfile                # Build Nginx production
  nginx.conf                # Configuration Nginx SPA
  public/sw.js              # Service Worker Push Notifications""")

# Sauvegarde
out = r"C:\Users\Pro\Desktop\PFE O1\documentation\FreeNest_Rapport_de_Stage.docx"
doc.save(out)
print("OK - Rapport Word cree : " + out)
