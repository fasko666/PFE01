# PRÉSENTATION — SOUTENANCE PFE
## Panda — Marketplace Freelance Full-Stack avec IA
### Ayoub Elmernissi — 2025/2026

> **Format :** 20 diapositives — Durée : 20–25 minutes
> **Outil :** PowerPoint / Google Slides / Canva
> Chaque section = 1 diapositive

---

## ══════════════════════════════════════
## SLIDE 1 — PAGE DE TITRE
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║                                                      ║
║          🐼  F R E E N E S T                        ║
║                                                      ║
║     Conception et Développement d'une               ║
║     Marketplace Freelance Full-Stack                 ║
║     avec Intelligence Artificielle                   ║
║                                                      ║
║  ─────────────────────────────────────────────────  ║
║  Présenté par : Ayoub Elmernissi                     ║
║  Filière      : [Votre filière]                      ║
║  Établissement: [Nom de l'établissement]             ║
║  Année        : 2025–2026                            ║
║                                                      ║
║  [Capture d'écran de la landing page 3D Panda]    ║
╚══════════════════════════════════════════════════════╝
```

**Notes :** Commencer par une phrase d'accroche :
> *"Imaginez une plateforme où un client publie une offre, l'IA propose les meilleurs freelancers, et le paiement est garanti par un système d'escrow sécurisé. C'est Panda."*

---

## ══════════════════════════════════════
## SLIDE 2 — PLAN DE LA PRÉSENTATION
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  PLAN                                                ║
║                                                      ║
║  1.  Contexte et Problématique          2 min        ║
║  2.  Présentation de Panda           2 min        ║
║  3.  Technologies utilisées             2 min        ║
║  4.  Architecture du système            2 min        ║
║  5.  Modules développés                 5 min        ║
║  6.  Fonctionnalités avancées           4 min        ║
║  7.  Base de données                    1 min        ║
║  8.  Sécurité                           1 min        ║
║  9.  Démonstration live                 4 min        ║
║  10. Bilan et Perspectives              2 min        ║
║                                         ─────        ║
║                               Total :  25 min        ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 3 — CONTEXTE ET PROBLÉMATIQUE
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  CONTEXTE : Le marché freelance en plein essor       ║
║                                                      ║
║  📊  +36% de la population active mondiale           ║
║       travaillera en freelance d'ici 2030            ║
║                                                      ║
║  ❌  PROBLÈMES DES PLATEFORMES ACTUELLES             ║
║                                                      ║
║  ┌─────────────┬──────────────────────────────────┐  ║
║  │ Problème    │ Description                      │  ║
║  ├─────────────┼──────────────────────────────────┤  ║
║  │ Langue      │ Plateformes majoritairement en   │  ║
║  │             │ anglais (Upwork, Fiverr)          │  ║
║  │ IA Premium  │ Fonctions IA réservées aux       │  ║
║  │             │ abonnements payants coûteux       │  ║
║  │ Commission  │ Jusqu'à 20% prélevés sur         │  ║
║  │             │ chaque transaction                │  ║
║  │ Complexité  │ Interface peu intuitive pour     │  ║
║  │             │ les nouveaux utilisateurs         │  ║
║  └─────────────┴──────────────────────────────────┘  ║
║                                                      ║
║  ✅  SOLUTION → Panda                             ║
╚══════════════════════════════════════════════════════╝
```

**Notes :** Insister sur la problématique locale/régionale et le manque d'une plateforme adaptée au marché marocain/francophone.

---

## ══════════════════════════════════════
## SLIDE 4 — PRÉSENTATION DE PANDA
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  QU'EST-CE QUE PANDA ?                           ║
║                                                      ║
║  Une marketplace freelance complète                  ║
║  ┌────────────────────────────────────────────────┐  ║
║  │  CLIENT          ◄────────────►  FREELANCER    │  ║
║  │  Publie des              Propose ses           │  ║
║  │  offres                  services              │  ║
║  │     │                        │                 │  ║
║  │     └───────── PANDA ─────┘                 │  ║
║  │              (Intermédiaire de                 │  ║
║  │               confiance + IA)                  │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                      ║
║  ✨ DIFFÉRENCIATEURS                                 ║
║  🤖 IA intégrée pour tous (Ollama/Mistral)           ║
║  🔒 Paiement escrow sécurisé (10% commission)        ║
║  🌐 Interface 3D moderne (Three.js)                  ║
║  ⚡ Messagerie temps réel (Socket.IO)                ║
║  🔑 Connexion Google OAuth                           ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 5 — TECHNOLOGIES UTILISÉES
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  STACK TECHNOLOGIQUE                                 ║
║                                                      ║
║  BACKEND                    FRONTEND                 ║
║  ┌──────────────────┐       ┌──────────────────┐    ║
║  │ Laravel 12       │       │ React 19         │    ║
║  │ PHP 8.2          │       │ Vite             │    ║
║  │ Sanctum 4.3      │       │ TailwindCSS 3.4  │    ║
║  │ Socialite 5.27   │       │ Zustand 5.0      │    ║
║  │ JWT Auth 2.3     │       │ Framer Motion 12 │    ║
║  │ Spatie Perms 6.25│       │ Three.js / R3F   │    ║
║  │ Intervention/Img │       │ Recharts 3.8     │    ║
║  └──────────────────┘       └──────────────────┘    ║
║                                                      ║
║  BASE DE DONNÉES            SPÉCIAL                  ║
║  ┌──────────────────┐       ┌──────────────────┐    ║
║  │ MySQL 8.0        │       │ Ollama (IA)      │    ║
║  │ Migrations       │       │ Mistral 7B       │    ║
║  │ Eloquent ORM     │       │ Socket.IO 4.8    │    ║
║  │ 19 tables        │       │ Axios 1.16       │    ║
║  │ Relations FK     │       │ date-fns 4.2     │    ║
║  └──────────────────┘       └──────────────────┘    ║
║                                                      ║
║  [Afficher les logos de chaque technologie]          ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 6 — ARCHITECTURE DU SYSTÈME
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  ARCHITECTURE FULL-STACK DÉCOUPLÉE                   ║
║                                                      ║
║  ┌──────────────────────────────────┐                ║
║  │  FRONTEND  React 19 + Vite       │                ║
║  │  (port 5173)                     │                ║
║  │  - 53+ composants React          │                ║
║  │  - State: Zustand stores         │                ║
║  │  - Requêtes: Axios               │                ║
║  └──────────────┬───────────────────┘                ║
║                 │ HTTPS REST API                     ║
║                 │ Bearer Token (Sanctum)             ║
║                 │ JSON                               ║
║  ┌──────────────▼───────────────────┐                ║
║  │  BACKEND  Laravel 12 (port 8000) │                ║
║  │  - 10 contrôleurs               │                ║
║  │  - Middleware Auth + Rôles       │                ║
║  │  - 17 modèles Eloquent           │                ║
║  │  - 40+ endpoints REST            │                ║
║  └─────────┬──────────┬─────────────┘                ║
║            │          │                              ║
║  ┌─────────▼──┐  ┌────▼──────────┐                  ║
║  │  MySQL     │  │ Ollama IA     │                  ║
║  │  (19 tables│  │ port:11434    │                  ║
║  └────────────┘  └───────────────┘                  ║
╚══════════════════════════════════════════════════════╝
```

**Notes :** Expliquer pourquoi une architecture découplée : scalabilité, séparation des responsabilités, possibilité de créer une app mobile plus tard.

---

## ══════════════════════════════════════
## SLIDE 7 — MODULES DÉVELOPPÉS (VUE GLOBALE)
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  8 MODULES PRINCIPAUX                                ║
║                                                      ║
║  ┌─────────────────┐   ┌─────────────────┐          ║
║  │ 1. AUTH          │   │ 2. MARKETPLACE  │          ║
║  │   - Email/Pwd    │   │   - Offres      │          ║
║  │   - Google OAuth │   │   - Recherche   │          ║
║  │   - Onboarding   │   │   - Freelancers │          ║
║  └─────────────────┘   └─────────────────┘          ║
║  ┌─────────────────┐   ┌─────────────────┐          ║
║  │ 3. PROPOSITIONS  │   │ 4. CONTRATS     │          ║
║  │   - Soumission   │   │   - Création    │          ║
║  │   - IA Generate  │   │   - Jalons      │          ║
║  │   - Accept/Reject│   │   - Suivi       │          ║
║  └─────────────────┘   └─────────────────┘          ║
║  ┌─────────────────┐   ┌─────────────────┐          ║
║  │ 5. PAIEMENTS     │   │ 6. MESSAGERIE   │          ║
║  │   - Escrow       │   │   - Temps réel  │          ║
║  │   - Wallet       │   │   - Socket.IO   │          ║
║  │   - Commission   │   │   - Fichiers    │          ║
║  └─────────────────┘   └─────────────────┘          ║
║  ┌─────────────────┐   ┌─────────────────┐          ║
║  │ 7. INTELLIGENCE  │   │ 8. ADMIN        │          ║
║  │   ARTIFICIELLE   │   │   - Dashboard   │          ║
║  │   - 5 features IA│   │   - Utilisateurs│          ║
║  │   - Ollama/Mistral│  │   - Analytics   │          ║
║  └─────────────────┘   └─────────────────┘          ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 8 — MODULE : AUTHENTIFICATION & ONBOARDING
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  MODULE 1 — AUTHENTIFICATION & ONBOARDING            ║
║                                                      ║
║  3 méthodes d'authentification                       ║
║  ┌──────────────────────────────────────────────┐    ║
║  │ Email + Mot de passe  → Sanctum Bearer Token │    ║
║  │ Google OAuth          → Socialite + Token    │    ║
║  │ JWT Auth              → Stateless API        │    ║
║  └──────────────────────────────────────────────┘    ║
║                                                      ║
║  ONBOARDING FREELANCER (5 étapes guidées)            ║
║                                                      ║
║  ①──②──③──④──⑤                                     ║
║  Cat Exp For Dispo Photo                             ║
║                                                      ║
║  ① Catégorie principale + spécialités                ║
║  ② Niveau d'expérience (entry/mid/expert)            ║
║  ③ Formation et éducation                            ║
║  ④ Disponibilité + heures/sem + tarif horaire        ║
║  ⑤ Photo de profil + langues parlées                 ║
║                                                      ║
║  [Capture d'écran de la page Login avec 3D]          ║
║  [Capture d'écran de l'onboarding step 1]            ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 9 — MODULE : MARKETPLACE & OFFRES
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  MODULE 2 — MARKETPLACE DES OFFRES                   ║
║                                                      ║
║  CÔTÉ CLIENT : Publier une offre                     ║
║  ┌────────────────────────────────────────────────┐  ║
║  │  Titre • Description • Catégorie • Compétences │  ║
║  │  Budget min/max • Type (horaire/forfait)        │  ║
║  │  Durée • Niveau requis • Urgent/Featured        │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                      ║
║  CÔTÉ FREELANCER : Trouver des offres                ║
║  ┌────────────────────────────────────────────────┐  ║
║  │  🔍 Recherche par mots-clés                    │  ║
║  │  🏷️  Filtre catégorie (hiérarchique)            │  ║
║  │  💰 Filtre budget (min/max)                    │  ║
║  │  ⭐ Filtre niveau d'expérience                  │  ║
║  │  📅 Tri : récent / budget / popularité         │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                      ║
║  Statuts d'une offre :                               ║
║  draft → open → in_progress → completed             ║
║                    ↘ cancelled                       ║
║                                                      ║
║  [Capture d'écran JobsMarketplace.jsx]               ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 10 — MODULE : PROPOSITIONS & CONTRATS
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  MODULE 3 & 4 — PROPOSITIONS & CONTRATS              ║
║                                                      ║
║  CYCLE DE VIE D'UNE MISSION :                        ║
║                                                      ║
║  CLIENT              PANDA          FREELANCER    ║
║    │                    │                  │         ║
║    │  Publie une offre  │                  │         ║
║    │──────────────────▶│                  │         ║
║    │                    │   Browse offres  │         ║
║    │                    │◀─────────────────│         ║
║    │                    │  Soumet proposi  │         ║
║    │                    │◀─────────────────│         ║
║    │  Reçoit notif      │                  │         ║
║    │◀──────────────────│                  │         ║
║    │                    │                  │         ║
║    │  Accepte →         │  Contrat créé ✓  │         ║
║    │──────────────────▶│──────────────────▶         ║
║    │                    │                  │         ║
║                                                      ║
║  CONTRAT = titre + type + montant + jalons + délai   ║
║  Création AUTOMATIQUE lors de l'acceptation          ║
║                                                      ║
║  [Capture d'écran JobDetail.jsx + formulaire prop.]  ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 11 — MODULE : PAIEMENTS ESCROW
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  MODULE 5 — SYSTÈME DE PAIEMENT ESCROW               ║
║                                                      ║
║  PORTEFEUILLE (chaque utilisateur) :                 ║
║  ┌─────────────────────────────────────────────┐     ║
║  │ 💳 balance          = 1 200 $  (disponible) │     ║
║  │ ⏳ pending_balance  =    50 $  (en attente)  │     ║
║  │ 🔒 escrow_balance   =   300 $  (bloqué)     │     ║
║  └─────────────────────────────────────────────┘     ║
║                                                      ║
║  FLUX DE PAIEMENT SÉCURISÉ :                         ║
║                                                      ║
║  ① Client dépose 1500$                               ║
║  ② Client finance l'escrow (300$ pour jalon 1)       ║
║  ③ Freelancer livre le travail → soumet le jalon     ║
║  ④ Client approuve                                   ║
║       ↓                                             ║
║  Commission plateforme : 300$ × 10% = 30$            ║
║  Freelancer reçoit    : 300$ × 90% = 270$            ║
║                                                      ║
║  ✅ SÉCURITÉ : L'argent est bloqué AVANT le début    ║
║     du travail → garanti pour les deux parties       ║
║                                                      ║
║  [Capture d'écran Payments.jsx + wallet]             ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 12 — MODULE : INTELLIGENCE ARTIFICIELLE
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  MODULE 7 — INTELLIGENCE ARTIFICIELLE                ║
║                                                      ║
║  Intégration : Ollama (Mistral 7B) — Local           ║
║                                                      ║
║  ┌──────┐  Requête  ┌──────────────┐  Prompt         ║
║  │ User │──────────▶│ AIController │──────────────▶  ║
║  └──────┘           └──────────────┘      Ollama     ║
║                            │          ◀──────────    ║
║                     MySQL (ai_histories)             ║
║                                                      ║
║  5 FONCTIONNALITÉS IA                                ║
║  ┌──────────────────────────────────────────────┐    ║
║  │ 🖊️  Génération de proposition                │    ║
║  │     → Lettre adaptée à l'offre en 2 secondes │    ║
║  │ 🎯 Matching freelancers                      │    ║
║  │     → Meilleurs profils pour une offre       │    ║
║  │ 🔍 Recherche intelligente                    │    ║
║  │     → Comprend le langage naturel            │    ║
║  │ 📊 Analyse de profil                         │    ║
║  │     → Conseils d'amélioration personnalisés  │    ║
║  │ 💬 Chat assistant                            │    ║
║  │     → Aide contextuelle sur la plateforme    │    ║
║  └──────────────────────────────────────────────┘    ║
║                                                      ║
║  Fallback automatique si Ollama indisponible ✓       ║
║                                                      ║
║  [Capture d'écran AIAssistant.jsx]                   ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 13 — MODULE : MESSAGERIE TEMPS RÉEL
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  MODULE 6 — MESSAGERIE TEMPS RÉEL                    ║
║                                                      ║
║  ARCHITECTURE :                                      ║
║  ┌─────────────────────────────────────────────┐     ║
║  │  Freelancer ◄──── Socket.IO ────► Client    │     ║
║  │      │                                 │    │     ║
║  │      └─── HTTP API (Laravel) ──────────┘    │     ║
║  │                   │                         │     ║
║  │              MySQL (persistance)            │     ║
║  └─────────────────────────────────────────────┘     ║
║                                                      ║
║  FONCTIONNALITÉS :                                   ║
║  ✓ Conversations directes (freelancer ↔ client)      ║
║  ✓ Conversations liées à un contrat                  ║
║  ✓ Envoi de texte, fichiers, images                  ║
║  ✓ Réponse à un message spécifique (thread)          ║
║  ✓ Indicateur "vu" (read_at)                         ║
║  ✓ Pagination scroll infini (chargement lazzy)       ║
║  ✓ Conversation créée automatiquement lors           ║
║    de l'acceptation d'une proposition                ║
║                                                      ║
║  [Capture d'écran Messages.jsx]                      ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 14 — BASE DE DONNÉES
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  BASE DE DONNÉES — 19 TABLES                         ║
║                                                      ║
║  UTILISATEURS          MARKETPLACE                   ║
║  ├── users             ├── categories               ║
║  ├── freelancer_profiles├── skills                  ║
║  ├── client_profiles   ├── freelancer_skills        ║
║  ├── portfolios        ├── job_postings             ║
║  └── subscriptions     └── proposals               ║
║                                                      ║
║  CONTRATS & FINANCES   COMMUNICATION & IA            ║
║  ├── contracts         ├── conversations            ║
║  ├── milestones        ├── conv_participants        ║
║  ├── reviews           ├── messages                 ║
║  ├── wallets           └── ai_histories             ║
║  ├── transactions                                    ║
║  └── personal_access_tokens                         ║
║                                                      ║
║  STATS                                               ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║  19 tables • ~200 colonnes • 15+ relations FK        ║
║  Migrations versionnées • Eloquent ORM               ║
║                                                      ║
║  [Schéma ERD simplifié]                              ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 15 — SÉCURITÉ
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  SÉCURITÉ — COUCHES DE PROTECTION                    ║
║                                                      ║
║  ┌─────────────────────────────────────────────┐     ║
║  │ Couche 1 : AUTHENTIFICATION                 │     ║
║  │   • Sanctum Bearer Token par session        │     ║
║  │   • Révocable immédiatement à la déco       │     ║
║  │   • Google OAuth (délégation à Google)      │     ║
║  ├─────────────────────────────────────────────┤     ║
║  │ Couche 2 : AUTORISATION                     │     ║
║  │   • Middleware role:freelancer / client      │     ║
║  │   • Principe de moindre privilège           │     ║
║  │   • Client ne peut PAS soumettre de prop.   │     ║
║  ├─────────────────────────────────────────────┤     ║
║  │ Couche 3 : VALIDATION DES DONNÉES           │     ║
║  │   • Form Requests Laravel côté serveur      │     ║
║  │   • Types vérifiés + longueurs max          │     ║
║  ├─────────────────────────────────────────────┤     ║
║  │ Couche 4 : DONNÉES SENSIBLES                │     ║
║  │   • Mots de passe hachés (bcrypt)           │     ║
║  │   • Secrets dans .env (jamais en dur)       │     ║
║  │   • CORS configuré (domain whitelist)       │     ║
║  └─────────────────────────────────────────────┘     ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 16 — INTERFACE UTILISATEUR
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  INTERFACE UTILISATEUR — 53+ COMPOSANTS REACT        ║
║                                                      ║
║  TECHNOLOGIES UI NOTABLES                            ║
║                                                      ║
║  🌐 Three.js + React Three Fiber                     ║
║     → Scène 3D interactive sur la landing page       ║
║     → Fond animé sur les pages d'auth                ║
║                                                      ║
║  🎬 Framer Motion 12                                 ║
║     → Transitions fluides entre les pages           ║
║     → Animations hover, reveal, parallax            ║
║                                                      ║
║  📊 Recharts                                         ║
║     → Graphiques dans les dashboards                 ║
║     → Évolution des revenus, activité               ║
║                                                      ║
║  🔔 React Hot Toast                                   ║
║     → Notifications d'actions utilisateur           ║
║                                                      ║
║  🎨 TailwindCSS                                       ║
║     → Design system cohérent                        ║
║     → Palette de couleurs personnalisée             ║
║     → Interface dark/light ready                    ║
║                                                      ║
║  [Collage captures d'écran des pages principales]    ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 17 — DÉMONSTRATION LIVE
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  DÉMONSTRATION LIVE 🚀                               ║
║                                                      ║
║  SCÉNARIO 1 : INSCRIPTION FREELANCER (2 min)         ║
║  ① S'inscrire comme freelancer                       ║
║  ② Processus onboarding 5 étapes                     ║
║  ③ Tableau de bord freelancer                        ║
║                                                      ║
║  SCÉNARIO 2 : WORKFLOW COMPLET (2 min)               ║
║  ④ Client publie une offre d'emploi                  ║
║  ⑤ Freelancer génère une proposition via IA          ║
║  ⑥ Client accepte → Contrat créé automatiquement     ║
║  ⑦ Client finance l'escrow                          ║
║  ⑧ Messagerie temps réel entre les deux             ║
║                                                      ║
║  BONUS si temps (30 sec) :                           ║
║  ⑨ Dashboard admin avec statistiques                ║
║                                                      ║
║  URLs :                                              ║
║  Frontend : http://localhost:5173                    ║
║  Backend  : http://localhost:8000                    ║
║  IA       : http://localhost:11434                   ║
╚══════════════════════════════════════════════════════╝
```

**Notes :** Préparer les deux applications lancées AVANT la présentation. Avoir des captures d'écran en backup si le démarrage échoue.

---

## ══════════════════════════════════════
## SLIDE 18 — DIFFICULTÉS ET SOLUTIONS
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  DIFFICULTÉS RENCONTRÉES & SOLUTIONS                 ║
║                                                      ║
║  ┌────────────────────┬───────────────────────────┐  ║
║  │ Difficulté         │ Solution                  │  ║
║  ├────────────────────┼───────────────────────────┤  ║
║  │ CORS Laravel/React │ Config cors.php +         │  ║
║  │                    │ SANCTUM_STATEFUL_DOMAINS   │  ║
║  ├────────────────────┼───────────────────────────┤  ║
║  │ Migration Sanctum  │ Migration dédiée          │  ║
║  │ absente            │ personal_access_tokens    │  ║
║  ├────────────────────┼───────────────────────────┤  ║
║  │ Middleware rôle    │ Correction aliases dans   │  ║
║  │ non reconnu        │ bootstrap/app.php          │  ║
║  ├────────────────────┼───────────────────────────┤  ║
║  │ Tailwind palettes  │ Ajout shades 50-950 dans  │  ║
║  │ manquantes         │ tailwind.config.js         │  ║
║  ├────────────────────┼───────────────────────────┤  ║
║  │ Ollama indisponible│ Système de fallback        │  ║
║  │ en production      │ avec réponses prédéfinies  │  ║
║  ├────────────────────┼───────────────────────────┤  ║
║  │ Escrow 3 soldes    │ Transactions atomiques     │  ║
║  │ complexe           │ DB::transaction() Laravel  │  ║
║  └────────────────────┴───────────────────────────┘  ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 19 — BILAN DES COMPÉTENCES
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  COMPÉTENCES ACQUISES                                ║
║                                                      ║
║  TECHNIQUES                                          ║
║  Laravel Backend API  ████████████████░░   80%       ║
║  React 19 Frontend    ███████████████░░░   75%       ║
║  BDD Relationnelle    ████████████████████ 90%       ║
║  API REST Design      █████████████████░░  85%       ║
║  Sécurité Web         ████████████░░░░░░   60%       ║
║  Intégration IA       █████████░░░░░░░░░   45%       ║
║                                                      ║
║  RÉALISATIONS CHIFFRÉES                              ║
║  ┌─────────────────────────────────────────────┐     ║
║  │ ✅ 19 tables de BDD modélisées et migrées   │     ║
║  │ ✅ 40+ endpoints REST API développés        │     ║
║  │ ✅ 53+ composants React créés               │     ║
║  │ ✅ 3 systèmes d'authentification            │     ║
║  │ ✅ 5 fonctionnalités IA intégrées           │     ║
║  │ ✅ 1 système d'escrow fonctionnel           │     ║
║  │ ✅ 1 messagerie temps réel                  │     ║
║  │ ✅ 1 interface 3D interactive               │     ║
║  └─────────────────────────────────────────────┘     ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## SLIDE 20 — CONCLUSION ET PERSPECTIVES
## ══════════════════════════════════════

```
╔══════════════════════════════════════════════════════╗
║  CONCLUSION ET PERSPECTIVES                          ║
║                                                      ║
║  Panda est une plateforme complète et             ║
║  opérationnelle, couvrant l'ensemble du              ║
║  cycle de vie d'une mission freelance.               ║
║                                                      ║
║  PERSPECTIVES D'ÉVOLUTION                            ║
║                                                      ║
║  🚀 Court terme                                      ║
║     • Déploiement en production (VPS + Nginx)        ║
║     • Intégration Stripe (paiements réels)           ║
║     • Tests automatisés (PHPUnit + Vitest)           ║
║                                                      ║
║  📱 Moyen terme                                      ║
║     • Application mobile (React Native)             ║
║     • IA avancée (embeddings, recherche sémantique)  ║
║     • Vérification d'identité (KYC)                 ║
║                                                      ║
║  🌍 Long terme                                       ║
║     • Internationalisation (FR / EN / AR)           ║
║     • Programme d'affiliation                       ║
║     • API publique pour intégrations tierces        ║
║                                                      ║
║  ─────────────────────────────────────────────────  ║
║              MERCI POUR VOTRE ATTENTION !            ║
║                 Questions ?                          ║
║        ayoubelmerniss55@gmail.com                    ║
╚══════════════════════════════════════════════════════╝
```

---

## ══════════════════════════════════════
## NOTES POUR LE PRÉSENTATEUR
## ══════════════════════════════════════

### Timing recommandé
| Section | Durée |
|---------|-------|
| Slides 1-2 (intro + plan) | 2 min |
| Slides 3-4 (contexte + présentation) | 3 min |
| Slides 5-6 (tech + archi) | 3 min |
| Slides 7-13 (modules) | 6 min |
| Slides 14-15 (BDD + sécu) | 2 min |
| Slides 16-17 (UI + démo) | 5 min |
| Slides 18-20 (difficultés + bilan + conclusion) | 4 min |
| **Total** | **25 min** |

---

### Questions fréquentes du jury — Réponses préparées

**Q: Pourquoi Laravel plutôt que Node.js ?**
> Laravel offre une rapidité de développement supérieure grâce à son ORM Eloquent, son écosystème complet (Sanctum, Socialite), et mes compétences préexistantes. Node.js aurait nécessité plus de configuration.

**Q: Comment fonctionne concrètement l'IA ?**
> Ollama est un serveur IA qui tourne localement. Je lui envoie un prompt structuré en HTTP POST avec le contexte (offre + profil freelancer). Mistral génère le texte, je le retourne au frontend. Un système de fallback gère l'indisponibilité.

**Q: L'escrow est-il vraiment sécurisé ?**
> Oui — les trois soldes (balance/pending/escrow) sont séparés. Chaque libération passe par une transaction MySQL atomique (DB::transaction). L'argent ne peut pas être libéré sans approbation explicite du client.

**Q: Quelle est la scalabilité de l'application ?**
> L'architecture découplée (API stateless) permet d'ajouter des serveurs backend sans toucher au frontend. À terme : Redis pour le cache, Laravel Queues pour les tâches asynchrones, et load balancing possible.

**Q: Avez-vous testé l'application ?**
> Tests manuels complets sur tous les parcours utilisateur. Validation Laravel sur tous les inputs. Gestion des erreurs HTTP standards. Les tests automatisés (PHPUnit) sont dans les perspectives d'évolution.

**Q: Comment avez-vous géré la sécurité des uploads ?**
> Intervention/Image vérifie le type MIME réel du fichier (pas juste l'extension), redimensionne les images, et stocke dans storage/app/public avec un nom hashé aléatoire.

---

### Conseils pratiques
1. **Parler lentement et clairement** sur les slides techniques
2. **Pointer l'écran** lors de la démo pour guider le regard du jury
3. **Préparer les apps localement** avant d'entrer dans la salle
4. **Avoir des captures d'écran** de chaque fonctionnalité en backup
5. **Ne pas lire les slides** — les utiliser comme support visuels
6. **Mentionner les difficultés** montre la maturité technique

---

*Présentation préparée par Ayoub Elmernissi — Panda PFE 2025/2026*
