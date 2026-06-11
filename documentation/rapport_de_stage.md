# RAPPORT DE STAGE / PROJET DE FIN D'ÉTUDES
---

**Établissement :** [Nom de votre établissement]  
**Filière :** Développement Web / Génie Informatique  
**Niveau :** [BTS / Licence / Master]  
**Année universitaire :** 2025–2026  

**Réalisé par :** Ayoub Elmernissi  
**Email :** ayoubelmerniss55@gmail.com  

---

## TITRE DU PROJET

> # Panda — Conception et Développement d'une Marketplace Freelance Full-Stack avec Intelligence Artificielle

---

**Encadrant pédagogique :** [Nom du professeur]  
**Encadrant entreprise :** [Nom du tuteur]  
**Lieu :** [Ville / Organisme]  
**Durée :** [Date début] — [Date fin]

---

## REMERCIEMENTS

Je tiens à exprimer ma sincère gratitude à toutes les personnes qui ont rendu ce projet possible.

Je remercie en premier lieu mon encadrant pédagogique pour ses conseils avisés, sa disponibilité et son accompagnement tout au long de ce projet. Ses retours m'ont permis de progresser tant sur le plan technique qu'organisationnel.

Je remercie également toute l'équipe enseignante de ma filière pour la solidité de la formation dispensée, qui m'a fourni les bases nécessaires pour aborder un projet d'une telle envergure.

Enfin, un grand merci à ma famille et à mes amis pour leur soutien constant et leurs encouragements.

---

## RÉSUMÉ

Panda est une marketplace freelance full-stack développée dans le cadre d'un projet de fin d'études. La plateforme permet aux clients de publier des offres d'emploi freelance et aux freelancers de proposer leurs services via un système de propositions, de contrats et de paiements sécurisés par escrow.

Le projet intègre des technologies modernes : **Laravel 12** pour le backend API REST, **React 19** pour l'interface utilisateur, et **Ollama (modèle Mistral)** pour les fonctionnalités d'intelligence artificielle. Il inclut également une messagerie en temps réel via Socket.IO, une authentification OAuth Google, un système de portefeuille numérique et un tableau de bord d'administration complet.

**Mots-clés :** Marketplace, Freelance, Laravel, React, REST API, Escrow, Intelligence Artificielle, Ollama, OAuth, Socket.IO, MySQL

---

## ABSTRACT

Panda is a full-stack freelance marketplace built as a final year project. The platform enables clients to post job listings and freelancers to submit proposals, manage contracts, and receive secure escrow-based payments. Built with Laravel 12 (backend), React 19 (frontend), and Ollama/Mistral AI integration, the system also features real-time messaging, Google OAuth, and a comprehensive admin dashboard.

---

## SOMMAIRE

1. Introduction
2. Contexte et Problématique
3. Présentation du Projet Panda
4. Analyse des Besoins
   - 4.1 Besoins fonctionnels
   - 4.2 Besoins non fonctionnels
   - 4.3 Acteurs du système
5. Conception et Modélisation
   - 5.1 Architecture générale
   - 5.2 Diagramme des cas d'utilisation
   - 5.3 Diagramme de classes
   - 5.4 Diagrammes de séquence
6. Stack Technologique
   - 6.1 Backend — Laravel 12
   - 6.2 Frontend — React 19
   - 6.3 Base de données — MySQL
   - 6.4 Intelligence Artificielle — Ollama/Mistral
   - 6.5 Temps réel — Socket.IO
7. Réalisation
   - 7.1 Module Authentification et Onboarding
   - 7.2 Module Marketplace des Offres
   - 7.3 Module Propositions et Contrats
   - 7.4 Module Paiements et Escrow
   - 7.5 Module Messagerie Temps Réel
   - 7.6 Module Intelligence Artificielle
   - 7.7 Module Profils et Portfolio
   - 7.8 Module Administration
   - 7.9 Module Notifications
8. Base de Données
9. Sécurité
10. Interface Utilisateur
11. Difficultés et Solutions
12. Tests et Validation
13. Conclusion et Perspectives
14. Annexes

---

## 1. INTRODUCTION

Le marché du travail connaît une transformation profonde avec l'essor du travail indépendant (freelance). Selon les études récentes, plus d'un tiers de la population active mondiale exercera une activité freelance d'ici 2030. Des plateformes comme Upwork, Fiverr ou Malt ont démontré la viabilité et la demande croissante pour des marketplaces mettant en relation clients et prestataires indépendants.

C'est dans ce contexte que s'inscrit **Panda**, une marketplace freelance complète que j'ai conçue et développée de A à Z dans le cadre de mon projet de fin d'études. Panda se distingue par l'intégration native de l'intelligence artificielle pour assister les freelancers dans la rédaction de propositions et les clients dans la recherche de talents, ainsi que par un système de paiement sécurisé par escrow garantissant la confiance entre les deux parties.

Ce rapport présente l'ensemble du travail réalisé : de l'analyse des besoins à la conception architecturale, du développement des fonctionnalités à l'intégration de l'IA, en passant par la sécurisation des paiements et la mise en place d'une messagerie en temps réel.

---

## 2. CONTEXTE ET PROBLÉMATIQUE

### 2.1 Contexte du marché freelance

Le travail freelance représente aujourd'hui un secteur économique majeur. Les marketplaces existantes présentent cependant plusieurs lacunes :

- **Barrière linguistique** : les plateformes leaders (Upwork, Fiverr) sont majoritairement en anglais
- **Absence d'IA accessible** : les fonctionnalités IA sont réservées aux abonnements premium
- **Commission élevée** : certaines plateformes prélèvent jusqu'à 20% par transaction
- **Complexité** : les interfaces sont souvent peu intuitives pour les nouveaux utilisateurs

### 2.2 Problématique

**Comment concevoir et développer une marketplace freelance moderne, sécurisée et enrichie par l'intelligence artificielle, capable de mettre en relation efficacement clients et freelancers tout en garantissant la sécurité des paiements et la qualité des échanges ?**

### 2.3 Solution proposée : Panda

Panda répond à cette problématique en proposant :
- Une interface moderne et intuitive (3D, animations)
- Un système d'IA intégré et accessible à tous (Ollama/Mistral)
- Un escrow transparent avec commission fixe de 10%
- Une messagerie temps réel native
- Une authentification simplifiée (Google OAuth)

---

## 3. PRÉSENTATION DU PROJET PANDA

### 3.1 Vue d'ensemble

| Élément | Détail |
|---------|--------|
| **Nom** | Panda (aussi appelé "Panda") |
| **Type** | Marketplace B2B/B2C Freelance |
| **Backend** | Laravel 12 (PHP 8.2+) |
| **Frontend** | React 19 + Vite |
| **Base de données** | MySQL |
| **Authentification** | Sanctum + JWT + Google OAuth |
| **IA** | Ollama (modèle Mistral) |
| **Temps réel** | Socket.IO |
| **Paiements** | Système Escrow maison + Stripe ready |

### 3.2 Deux types d'utilisateurs principaux

**Freelancer :**
> Professionnel indépendant qui crée un profil détaillé, parcourt les offres, soumet des propositions (avec aide IA), gère ses contrats et reçoit ses paiements via un portefeuille numérique.

**Client :**
> Entreprise ou particulier qui publie des offres d'emploi freelance, reçoit et évalue les propositions, crée des contrats avec jalons, finance l'escrow et libère les paiements après validation du travail.

### 3.3 Proposition de valeur

```
Pour le FREELANCER :
✓ Profil professionnel complet avec portfolio
✓ IA pour rédiger des propositions percutantes
✓ Paiement garanti par escrow
✓ Messagerie directe avec les clients
✓ Tableau de bord financier complet

Pour le CLIENT :
✓ Accès à un vivier de talents qualifiés
✓ IA pour trouver les meilleurs profils
✓ Contrats structurés avec jalons et délais
✓ Paiements sécurisés (l'argent est protégé)
✓ Système d'évaluation transparent
```

---

## 4. ANALYSE DES BESOINS

### 4.1 Besoins Fonctionnels

#### Module Authentification
- Inscription par email/mot de passe avec choix du rôle (freelancer/client)
- Connexion via Google OAuth (Laravel Socialite)
- Gestion des tokens Bearer (Sanctum)
- Processus d'onboarding guidé pour les nouveaux freelancers
- Vérification de téléphone
- Changement de mot de passe

#### Module Freelancer
- Profil complet : titre, bio, tarif horaire, niveau d'expérience
- Onboarding multi-étapes : catégorie, spécialités, formation, disponibilité
- Gestion du portfolio (images, description, URL du projet)
- Gestion des compétences avec niveau de maîtrise
- Tableau de bord : revenus, contrats, évaluations
- Paramètres de visibilité du profil

#### Module Client
- Profil entreprise : nom, secteur, taille
- Publication d'offres d'emploi avec budget, compétences, durée
- Consultation et filtrage des propositions reçues
- Acceptation/rejet des propositions
- Création de contrats avec jalons et délais

#### Module Marketplace
- Liste des offres d'emploi avec pagination
- Recherche par mots-clés, catégorie, budget, niveau
- Détail d'une offre avec compteur de vues et propositions
- Sauvegarde d'offres favorites
- Catégories hiérarchiques (parent/enfant)
- Liste des freelancers avec filtres avancés
- Profil public d'un freelancer

#### Module Propositions
- Soumission de proposition : lettre, montant, durée, jalons optionnels
- Génération automatique de proposition via IA
- Historique de mes propositions (statut, montant)
- Acceptation/rejet d'une proposition par le client
- Déduction de "connects" (crédits) par soumission

#### Module Contrats
- Création automatique lors de l'acceptation d'une proposition
- Vue détaillée du contrat (termes, jalons, dates)
- Gestion des jalons : soumission, révision, approbation
- Changement de statut : actif → en cours → terminé

#### Module Paiements
- Portefeuille numérique avec 3 soldes (disponible, en attente, escrow)
- Dépôt de fonds
- Financement de l'escrow par jalon ou contrat global
- Libération du paiement après approbation du jalon
- Historique complet des transactions
- Commission plateforme : 10% sur chaque libération

#### Module Messagerie
- Conversations directes freelancer/client
- Conversations liées à un contrat
- Envoi de texte, fichiers, images
- Réponse à un message spécifique
- Indicateur de lecture (vu/non vu)
- Pagination (scroll infini)

#### Module IA
- Génération de proposition à partir d'une offre d'emploi
- Matching freelancers → suggestions intelligentes pour une offre
- Chat assistant contextuel
- Analyse et amélioration de profil freelancer
- Recherche en langage naturel

#### Module Évaluations
- Évaluation mutuelle client/freelancer après contrat
- Note globale + détail par critère (JSON)
- Historique des avis visibles sur le profil public

#### Module Administration
- Tableau de bord analytique (utilisateurs, jobs, revenus, transactions)
- Gestion des utilisateurs (ban, vérification, consultation)
- Rapports et analytics de la plateforme

#### Module Notifications
- Notifications en temps réel (nouvelle proposition, message, paiement)
- Marquage comme lu (individuel ou tout)

---

### 4.2 Besoins Non Fonctionnels

| Besoin | Exigence | Implémentation |
|--------|---------|----------------|
| **Performance** | Réponses API < 500ms | Laravel + Eloquent optimisé |
| **Sécurité** | Auth sécurisée, données protégées | Sanctum + bcrypt + CORS |
| **Scalabilité** | Architecture découplée | API REST stateless |
| **Temps réel** | Messages instantanés | Socket.IO |
| **Accessibilité** | Interface responsive | TailwindCSS responsive |
| **Expérience UX** | Interface moderne et fluide | Three.js, Framer Motion |
| **Maintenabilité** | Code structuré | MVC + Services |
| **Disponibilité IA** | IA même sans Ollama | Système de fallback |

---

### 4.3 Acteurs du Système

| Acteur | Type | Description |
|--------|------|-------------|
| **Freelancer** | Utilisateur principal | Professionnel indépendant cherchant des missions |
| **Client** | Utilisateur principal | Entreprise ou particulier cherchant des talents |
| **Admin** | Utilisateur interne | Gère la plateforme, modère les utilisateurs |
| **Google OAuth** | Système externe | Fournisseur d'identité pour la connexion sociale |
| **Ollama / Mistral** | Système externe | Moteur IA pour les fonctionnalités intelligentes |
| **Stripe** | Système externe | Processeur de paiement (intégration prête) |
| **Socket.IO** | Système interne | Serveur WebSocket pour la messagerie temps réel |

---

## 5. CONCEPTION ET MODÉLISATION

*(Les diagrammes complets en format PlantUML sont dans le fichier `uml_diagrams.md`)*

### 5.1 Architecture Générale

Panda suit une architecture **Full-Stack Headless** (frontend découplé du backend) :

```
┌─────────────────────────────────────────┐
│   NAVIGATEUR UTILISATEUR                 │
│   React 19 + Vite (localhost:5173)       │
│   - Interface 3D (Three.js)              │
│   - State Management (Zustand)           │
│   - Requêtes API (Axios)                 │
└───────────────────┬─────────────────────┘
                    │ HTTPS — REST API — JSON
                    │ Authorization: Bearer {token}
┌───────────────────▼─────────────────────┐
│   BACKEND API Laravel 12 (localhost:8000)│
│   - Routing → Controllers                │
│   - Middleware (Auth + Roles)            │
│   - Models Eloquent                      │
│   - Services métier                      │
└──────────┬────────────────┬─────────────┘
           │                │
  ┌────────▼────────┐  ┌───▼──────────────┐
  │ MySQL Database  │  │ Ollama (port 11434)│
  │ 17+ tables      │  │ Modèle Mistral     │
  │ Migrations      │  │ IA local           │
  └─────────────────┘  └──────────────────┘
```

### 5.2 Structure des Répertoires

```
PFE-O1/
├── backend-laravel/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── JobController.php
│   │   │   │   ├── ProposalController.php
│   │   │   │   ├── FreelancerController.php
│   │   │   │   ├── ChatController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   ├── AIController.php
│   │   │   │   ├── ReviewController.php
│   │   │   │   ├── AdminController.php
│   │   │   │   └── NotificationController.php
│   │   │   └── Middleware/
│   │   └── Models/
│   │       ├── User.php
│   │       ├── FreelancerProfile.php
│   │       ├── ClientProfile.php
│   │       ├── JobPosting.php
│   │       ├── Proposal.php
│   │       ├── Contract.php
│   │       ├── Milestone.php
│   │       ├── Message.php
│   │       ├── Conversation.php
│   │       ├── Wallet.php
│   │       ├── Transaction.php
│   │       ├── Review.php
│   │       ├── Skill.php
│   │       ├── Category.php
│   │       ├── Portfolio.php
│   │       ├── Subscription.php
│   │       └── AiHistory.php
│   ├── database/migrations/
│   └── routes/api.php              ← 40+ endpoints
│
└── frontend-react/
    └── src/
        ├── pages/                  ← 53+ composants
        ├── stores/                 ← Zustand stores
        ├── hooks/                  ← Custom hooks
        └── components/
            ├── AuthScene3D.jsx
            ├── GlobalNavbar.jsx
            ├── NotificationPanel.jsx
            └── ...
```

### 5.3 Modèle de Données — Relations Principales

```
User (1) ──────── (0..1) FreelancerProfile
User (1) ──────── (0..1) ClientProfile
User (1) ──────── (1)    Wallet ──── (N) Transaction
User (1) ──────── (0..1) Subscription
User (1) ──────── (N)    Portfolio
User (N) ──────── (N)    Skill [via freelancer_skills]
User (N) ──────── (N)    Conversation [via participants]
User (1) ──────── (N)    AiHistory

JobPosting (N) ── (1)    User [client]
JobPosting (N) ── (1)    Category
JobPosting (1) ── (N)    Proposal

Proposal (N) ──── (1)    User [freelancer]
Proposal (0..1) ─ (1)    Contract

Contract (1) ──── (N)    Milestone
Contract (1) ──── (N)    Review

Conversation (1) ─ (N)   Message
```

---

## 6. STACK TECHNOLOGIQUE

### 6.1 Backend — Laravel 12

Laravel est un framework PHP MVC qui offre un écosystème complet pour le développement d'API REST.

**Packages utilisés :**

| Package | Version | Utilisation |
|---------|---------|-------------|
| `laravel/framework` | 12.0 | Framework principal |
| `laravel/sanctum` | 4.3 | Authentification par tokens |
| `laravel/socialite` | 5.27 | OAuth social (Google) |
| `tymon/jwt-auth` | 2.3 | JSON Web Tokens |
| `spatie/laravel-permission` | 6.25 | Gestion des rôles |
| `intervention/image` | 3.11 | Traitement des images (avatar) |

**Architecture MVC étendue :**
```
Route → Middleware → Controller → Model → Database
                          ↓
                      Service (logique métier complexe)
```

### 6.2 Frontend — React 19

React 19 avec le nouveau compilateur offre des performances améliorées et des fonctionnalités modernes.

**Packages clés :**

| Package | Version | Utilisation |
|---------|---------|-------------|
| `react` | 19.2.6 | UI réactive |
| `react-router-dom` | 7.15.1 | Navigation SPA |
| `tailwindcss` | 3.4.19 | Styles utilitaires |
| `zustand` | 5.0.13 | State management |
| `axios` | 1.16.1 | Client HTTP |
| `framer-motion` | 12.39.0 | Animations |
| `three` | — | Rendu 3D |
| `@react-three/fiber` | — | React wrapper Three.js |
| `socket.io-client` | 4.8.3 | Messagerie temps réel |
| `recharts` | 3.8.1 | Graphiques/statistiques |
| `react-hot-toast` | 2.6.0 | Notifications UI |
| `date-fns` | 4.2.1 | Manipulation des dates |

### 6.3 Base de Données — MySQL

MySQL avec les migrations Laravel versionnées pour une gestion évolutive du schéma.

**Migrations créées :**
- `create_users_table` — Comptes utilisateurs
- `create_freelancer_client_profiles_table` — Profils détaillés
- `create_categories_skills_table` — Taxonomie des compétences
- `create_job_postings_proposals_table` — Offres et propositions
- `create_conversations_messages_table` — Messagerie
- `create_contracts_milestones_reviews_table` — Contrats
- `create_wallets_transactions_subscriptions_table` — Paiements
- `create_personal_access_tokens_table` — Sanctum tokens
- `add_onboarding_fields_to_freelancer_profiles` — Onboarding

### 6.4 Intelligence Artificielle — Ollama/Mistral

**Ollama** est un moteur d'IA open-source qui fait tourner des modèles de langage localement.

**Architecture d'intégration :**
```
Frontend → POST /api/ai/generate-proposal
                    ↓
           AIController.php
                    ↓
           Récupère contexte (job + freelancer depuis MySQL)
                    ↓
           Construit un prompt structuré
                    ↓
           POST http://localhost:11434/api/generate
           {model: "mistral", prompt: "..."}
                    ↓
           Mistral génère le texte
                    ↓
           Stockage dans ai_histories
                    ↓
           Réponse JSON → Frontend
```

**Fallback automatique :** Si Ollama est indisponible (erreur réseau), le contrôleur retourne une réponse prédéfinie intelligente.

### 6.5 Temps Réel — Socket.IO

Socket.IO gère la livraison instantanée des messages entre utilisateurs.

**Flux de messagerie :**
```
Freelancer (Chrome) ──→ Socket.IO Server ──→ Client (Firefox)
                              ↕
                     HTTP API (Laravel)
                              ↕
                         MySQL (persistance)
```

---

## 7. RÉALISATION

### 7.1 Module Authentification et Onboarding

#### Inscription classique
L'utilisateur choisit son rôle (freelancer ou client) dès l'inscription. Le système crée automatiquement le profil correspondant (freelancer_profiles ou client_profiles) vide, à compléter ensuite.

```php
// AuthController.php — extrait
public function register(Request $request)
{
    $user = User::create([
        'name'     => $request->name,
        'email'    => $request->email,
        'password' => Hash::make($request->password),
        'role'     => $request->role, // 'freelancer' ou 'client'
    ]);

    if ($request->role === 'freelancer') {
        $user->freelancerProfile()->create([]);
    } else {
        $user->clientProfile()->create([]);
    }

    $token = $user->createToken('auth_token')->plainTextToken;
    return response()->json(['token' => $token, 'user' => $user], 201);
}
```

#### Connexion Google OAuth
Processus en deux étapes : redirection vers Google, puis callback avec récupération/création du compte.

```php
// Callback OAuth — extrait
public function handleGoogleCallback()
{
    $googleUser = Socialite::driver('google')->user();
    $user = User::firstOrCreate(
        ['email' => $googleUser->email],
        [
            'name'      => $googleUser->name,
            'google_id' => $googleUser->id,
            'avatar'    => $googleUser->avatar,
            'role'      => 'freelancer',
        ]
    );
    $token = $user->createToken('auth_token')->plainTextToken;
    return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token);
}
```

#### Onboarding guidé (Freelancer)
Processus multi-étapes guidant le nouveau freelancer pour compléter son profil :

```
Étape 1 → Catégorie principale + spécialités
Étape 2 → Niveau d'expérience (entry/intermediate/expert)
Étape 3 → Formation et éducation
Étape 4 → Disponibilité + heures par semaine + tarif horaire
Étape 5 → Photo de profil + langues parlées
          → Profil activé ✓
```

---

### 7.2 Module Marketplace des Offres

#### Publication d'une offre (Client)

Un client publie une offre avec :
```json
{
  "title": "Développeur React pour application SaaS",
  "description": "Nous cherchons...",
  "category_id": 3,
  "skills": ["React", "TypeScript", "Node.js"],
  "type": "fixed",
  "budget_min": 500,
  "budget_max": 2000,
  "experience_level": "intermediate",
  "duration": "1-3 months",
  "is_featured": false,
  "is_urgent": true
}
```

#### Recherche et filtrage
Les offres sont recherchables avec une combinaison de filtres :
- Mots-clés dans le titre/description
- Catégorie (hiérarchique)
- Budget (min/max)
- Niveau d'expérience
- Type de contrat (horaire/forfait)
- Tri : récent, budget, popularité

---

### 7.3 Module Propositions et Contrats

#### Cycle de vie d'une proposition

```
                    FREELANCER
                        │
            ┌───────────▼──────────────┐
            │  Soumet une proposition   │
            │  - Lettre de motivation   │
            │  - Montant proposé        │
            │  - Durée estimée          │
            │  - Jalons optionnels      │
            │  [optionnel : via IA]     │
            └───────────┬──────────────┘
                        │
                    CLIENT
                        │
            ┌───────────▼──────────────┐
            │  Évalue les propositions  │
            │         │                │
            │  Accepte ──→ Rejette     │
            └───────────┬──────────────┘
                        │ (si acceptée)
            ┌───────────▼──────────────┐
            │  CONTRAT CRÉÉ AUTO.       │
            │  - Jalons définis         │
            │  - Montants par jalon     │
            │  - Délais                 │
            └──────────────────────────┘
```

#### Création automatique du contrat
Quand une proposition est acceptée, le système crée automatiquement un contrat :

```php
// ProposalController.php — extrait
public function accept(Proposal $proposal)
{
    $proposal->update(['status' => 'accepted']);

    $contract = Contract::create([
        'job_id'        => $proposal->job_id,
        'proposal_id'   => $proposal->id,
        'client_id'     => Auth::id(),
        'freelancer_id' => $proposal->freelancer_id,
        'title'         => $proposal->job->title,
        'type'          => $proposal->bid_type,
        'amount'        => $proposal->bid_amount,
        'status'        => 'active',
    ]);

    // Créer les jalons depuis la proposition
    foreach ($proposal->milestones as $m) {
        $contract->milestones()->create($m);
    }

    // Mettre l'offre en statut "en cours"
    $proposal->job->update(['status' => 'in_progress']);

    return response()->json(['contract' => $contract]);
}
```

---

### 7.4 Module Paiements et Escrow

#### Architecture du portefeuille

Chaque utilisateur possède un `Wallet` avec trois soldes distincts :

```
┌────────────────────────────────────────┐
│           WALLET (portefeuille)         │
├────────────────────────────────────────┤
│ balance         = 250.00 $  ← Disponible│
│ pending_balance =  50.00 $  ← En attente│
│ escrow_balance  = 300.00 $  ← Bloqué    │
└────────────────────────────────────────┘
```

#### Flux de paiement sécurisé (étape par étape)

**1. Client dépose des fonds**
```
Client dépose 500$ → wallet.balance += 500
Transaction enregistrée : type=credit, amount=500
```

**2. Client finance l'escrow d'un jalon**
```
Client finance le jalon #1 (200$)
→ wallet.balance -= 200
→ wallet.escrow_balance += 200
→ milestone.status = 'funded'
Transaction : type=escrow, amount=200
```

**3. Freelancer soumet le travail**
```
Freelancer marque le jalon comme terminé
→ milestone.status = 'submitted'
Client reçoit une notification
```

**4. Client libère le paiement**
```php
// PaymentController.php — extrait
public function releaseMilestone(Request $request)
{
    $commission    = $milestone->amount * 0.10; // 10%
    $freelancerNet = $milestone->amount - $commission;

    // Déduire de l'escrow client
    $clientWallet->escrow_balance -= $milestone->amount;
    $clientWallet->save();

    // Créditer le freelancer (net de commission)
    $freelancerWallet->balance += $freelancerNet;
    $freelancerWallet->save();

    // Enregistrer les transactions
    Transaction::create([...commission...]);
    Transaction::create([...freelancer_credit...]);

    $milestone->update(['status' => 'approved', 'approved_at' => now()]);

    return response()->json(['message' => 'Paiement libéré', 'net' => $freelancerNet]);
}
```

#### Modèle économique
- **Commission plateforme :** 10% sur chaque libération de jalon
- **Freelancer reçoit :** 90% du montant du jalon
- **Exemple :** Jalon de 200$ → Freelancer reçoit 180$, plateforme gagne 20$

---

### 7.5 Module Messagerie Temps Réel

#### Types de conversations
- **Direct** : échange privé entre un freelancer et un client
- **Group** : conversation liée à un contrat spécifique

#### Fonctionnalités de messages

| Fonctionnalité | Détail |
|---------------|--------|
| Types de messages | Texte, fichier, image |
| Réponse ciblée | Reply à un message spécifique (reply_to_id) |
| Indicateur lu | is_read + read_at timestamp |
| Pagination | Chargement des anciens messages au scroll |
| Attachements | JSON array de fichiers joints |
| Métadonnées | JSON pour informations supplémentaires |

#### Création automatique de conversation
Lors de l'acceptation d'une proposition, une conversation est automatiquement créée entre le client et le freelancer, liée au contrat.

---

### 7.6 Module Intelligence Artificielle

#### Les 5 fonctionnalités IA de Panda

**1. Génération de proposition**
```
Input  : {job_description, freelancer_profile}
Output : Lettre de motivation professionnelle adaptée à l'offre
```

Prompt envoyé à Mistral :
> "Tu es un expert en rédaction de propositions freelance. Voici une offre d'emploi : [description]. Voici le profil du freelancer : [profil]. Rédige une proposition professionnelle et convaincante en [langue], de 250 mots maximum."

**2. Matching Freelancers**
```
Input  : {job_requirements, budget, skills_needed}
Output : Liste de critères de sélection recommandés + analyse
```

**3. Analyse de profil freelancer**
```
Input  : {freelancer_profile, portfolio, reviews}
Output : Points forts, points faibles, recommandations d'amélioration
```

**4. Chat assistant**
```
Input  : {user_message, conversation_history}
Output : Réponse contextuelle sur la plateforme
```

**5. Recherche intelligente**
```
Input  : "Cherche un développeur React qui parle français et facture moins de 50$/h"
Output : Requête de recherche structurée interprétée en JSON de filtres
```

#### Historique IA
Toutes les interactions sont sauvegardées dans `ai_histories` :
```json
{
  "user_id": 42,
  "type": "proposal",
  "input": {"job_id": 10, "freelancer_id": 42},
  "output": {"text": "Bonjour, je me permets de..."},
  "model": "mistral",
  "tokens_used": 387
}
```

---

### 7.7 Module Profils et Portfolio

#### Profil Freelancer

Le profil public d'un freelancer inclut :
- **En-tête** : photo, nom, titre, pays, tarif horaire
- **Badges** : Top Rated, Top Rated Plus, vérifié
- **Bio** : description professionnelle
- **Compétences** : liste avec niveau (débutant/intermédiaire/expert)
- **Portfolio** : galerie de projets avec images et descriptions
- **Statistiques** : taux de succès, jobs complétés, gains totaux
- **Avis** : évaluations des clients précédents
- **Disponibilité** : heures par semaine, statut actif/inactif

#### Profil Client

- Nom de l'entreprise, secteur, taille
- Historique des offres publiées
- Avis des freelancers ayant travaillé avec eux
- Badge "Paiement vérifié"

---

### 7.8 Module Administration

#### Tableau de bord admin

Le dashboard admin fournit une vue globale de la plateforme :

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Users │  Jobs Posted│  Revenue    │ Proposals   │
│   1,247     │     342     │  $24,580    │   2,891     │
└─────────────┴─────────────┴─────────────┴─────────────┘

Graphique : Inscriptions par mois
Graphique : Volume de transactions
Tableau  : Dernières propositions en attente
```

#### Gestion des utilisateurs

| Action | Endpoint | Effet |
|--------|----------|-------|
| Voir profil | `GET /admin/users/{id}` | Détails complets |
| Bannir | `POST /admin/users/{id}/ban` | `is_active = false` |
| Vérifier | `POST /admin/users/{id}/verify` | `is_verified = true` |
| Analytics | `GET /admin/analytics` | Rapports détaillés |

---

### 7.9 Module Notifications

Chaque action importante génère une notification :
- Nouvelle proposition reçue
- Proposition acceptée/rejetée
- Nouveau message reçu
- Paiement libéré
- Jalon soumis pour révision
- Contrat terminé

Les notifications sont affichées dans un panneau `NotificationPanel.jsx` avec compteur non-lus et marquage individuel/global.

---

## 8. BASE DE DONNÉES

### Tables et descriptions

| # | Table | Rôle |
|---|-------|------|
| 1 | `users` | Comptes utilisateurs (tous rôles) |
| 2 | `personal_access_tokens` | Tokens Sanctum |
| 3 | `freelancer_profiles` | Profil détaillé freelancer |
| 4 | `client_profiles` | Profil détaillé client |
| 5 | `categories` | Catégories de métiers (hiérarchique) |
| 6 | `skills` | Compétences disponibles |
| 7 | `freelancer_skills` | Liaison many-to-many freelancer ↔ skills |
| 8 | `portfolios` | Projets portfolio des freelancers |
| 9 | `job_postings` | Offres d'emploi publiées |
| 10 | `proposals` | Propositions des freelancers |
| 11 | `contracts` | Contrats freelancer/client |
| 12 | `milestones` | Jalons d'un contrat |
| 13 | `reviews` | Évaluations post-contrat |
| 14 | `conversations` | Fils de messagerie |
| 15 | `messages` | Messages individuels |
| 16 | `wallets` | Portefeuilles numériques |
| 17 | `transactions` | Historique des mouvements financiers |
| 18 | `subscriptions` | Abonnements et connects |
| 19 | `ai_histories` | Historique des requêtes IA |

### Schéma relationnel simplifié

```sql
-- Exemple de migration clé : job_postings
Schema::create('job_postings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
    $table->foreignId('category_id')->constrained('categories');
    $table->string('title');
    $table->longText('description');
    $table->json('skills')->default('[]');
    $table->enum('type', ['hourly', 'fixed'])->default('fixed');
    $table->enum('experience_level', ['entry', 'intermediate', 'expert']);
    $table->decimal('budget_min', 10, 2)->nullable();
    $table->decimal('budget_max', 10, 2)->nullable();
    $table->enum('status', ['draft','open','in_progress','completed','cancelled'])->default('open');
    $table->boolean('is_featured')->default(false);
    $table->boolean('is_urgent')->default(false);
    $table->integer('proposals_count')->default(0);
    $table->integer('views_count')->default(0);
    $table->timestamp('expires_at')->nullable();
    $table->timestamps();
});
```

---

## 9. SÉCURITÉ

### 9.1 Authentification par Token (Sanctum)

Chaque requête API authentifiée doit inclure un header :
```http
Authorization: Bearer {token}
```

Le token est :
- Généré lors de la connexion
- Stocké haché dans `personal_access_tokens`
- Révocable immédiatement à la déconnexion
- Unique par session (un utilisateur peut avoir plusieurs tokens)

### 9.2 Contrôle d'accès par rôle

```php
// routes/api.php
// Routes accessibles uniquement aux clients
Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    Route::post('/jobs', [JobController::class, 'store']);
    Route::post('/proposals/{id}/accept', [ProposalController::class, 'accept']);
    Route::post('/payments/fund-escrow', [PaymentController::class, 'fundEscrow']);
});

// Routes accessibles uniquement aux freelancers
Route::middleware(['auth:sanctum', 'role:freelancer'])->group(function () {
    Route::post('/proposals', [ProposalController::class, 'store']);
    Route::put('/freelancer/profile', [FreelancerController::class, 'updateProfile']);
});

// Routes admin uniquement
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::post('/admin/users/{id}/ban', [AdminController::class, 'banUser']);
});
```

### 9.3 Autres mesures de sécurité

- **Hachage bcrypt** pour tous les mots de passe
- **Validation serveur** pour tous les inputs (Form Requests Laravel)
- **CORS** configuré : seul `localhost:5173` est autorisé en développement
- **Variables d'environnement** : aucun secret en dur dans le code
- **Upload sécurisé** : vérification du type MIME et taille des fichiers
- **Protection des routes** : aucun endpoint sensible sans middleware auth

---

## 10. INTERFACE UTILISATEUR

### Pages développées (53+ composants React)

**Pages publiques / landing :**
- `Landing.jsx` — Page d'accueil avec scène 3D (Three.js)
- `Search.jsx` — Recherche globale
- `Pricing.jsx` — Plans tarifaires
- `HowItWorks.jsx` — Explication du service

**Authentification :**
- `Login.jsx` — Connexion (avec bouton Google)
- `Register.jsx` — Inscription avec choix du rôle
- `GoogleCallback.jsx` — Traitement du retour OAuth
- `Onboarding.jsx` — Processus d'onboarding multi-étapes

**Freelancer :**
- `FreelancerDashboard.jsx` — Tableau de bord avec statistiques
- `FreelancerMarketplace.jsx` — Annuaire des freelancers
- `FreelancerProfile.jsx` — Profil public
- `FreelancerSettings.jsx` — Paramètres du compte
- `FindTalent.jsx` — Recherche de talents (côté client)

**Jobs et Propositions :**
- `JobsMarketplace.jsx` — Liste des offres d'emploi
- `JobDetail.jsx` — Détail d'une offre + formulaire de proposition
- `CategoryJobs.jsx` — Offres par catégorie
- `MyJobs.jsx` — Mes offres publiées (client)
- `PostJob.jsx` — Formulaire de publication d'offre
- `MyProposals.jsx` — Mes propositions (freelancer)

**Paiements :**
- `Payments.jsx` — Portefeuille + historique transactions

**Communication :**
- `Messages.jsx` — Interface de messagerie complète

**IA :**
- `AIAssistant.jsx` — Interface du chat IA

**Administration :**
- `AdminDashboard.jsx` — Tableau de bord admin

### Technologies UI notables

- **Three.js + React Three Fiber** : scène 3D interactive sur la landing page et les pages d'auth
- **Framer Motion** : animations fluides (transitions, hover, reveal)
- **TailwindCSS** : design system cohérent avec palette de couleurs personnalisée
- **Recharts** : graphiques du dashboard (revenus, activité)
- **React Hot Toast** : notifications d'actions utilisateur

---

## 11. DIFFICULTÉS ET SOLUTIONS

| # | Difficulté rencontrée | Solution apportée |
|---|----------------------|-------------------|
| 1 | Configuration CORS entre Laravel (8000) et React (5173) | Configuration de `config/cors.php` et `.env` avec `SANCTUM_STATEFUL_DOMAINS=localhost:5173` |
| 2 | Migration Sanctum `personal_access_tokens` absente au démarrage | Création d'une migration dédiée : `2026_05_19_231439_create_personal_access_tokens_table` |
| 3 | Middleware de rôle non reconnu dans les routes | Correction des alias dans `bootstrap/app.php` avec `withMiddleware(function($m) { $m->alias([...]) })` |
| 4 | Variables CSS TailwindCSS (couleurs) non définies | Ajout des palettes complètes (50 à 950) dans `tailwind.config.js` |
| 5 | Ollama IA indisponible en production | Implémentation d'un système de `try/catch` avec réponses de fallback prédéfinies |
| 6 | Gestion complexe des 3 soldes du portefeuille | Modélisation avec 3 champs distincts dans `wallets` + transactions atomiques avec `DB::transaction()` |
| 7 | Upload d'images avec validation et stockage | Utilisation d'Intervention/Image pour redimensionnement + stockage dans `storage/app/public` |
| 8 | Champs onboarding manquants sur `freelancer_profiles` | Migration additive : `2026_05_26_000001_add_onboarding_fields_to_freelancer_profiles` |
| 9 | Persistance du token Google OAuth côté frontend | Redirect avec token en query param + lecture dans `GoogleCallback.jsx` |
| 10 | Scène 3D lente sur certains appareils | Detection des capabilities GPU + dégradation gracieuse (fallback CSS) |

---

## 12. TESTS ET VALIDATION

### Tests effectués

**Tests manuels (parcours utilisateur complet) :**

| Parcours | Statut |
|---------|--------|
| Inscription freelancer → onboarding complet | ✓ |
| Connexion Google OAuth | ✓ |
| Publication d'offre client | ✓ |
| Soumission de proposition (classique + IA) | ✓ |
| Acceptation proposition → création contrat | ✓ |
| Financement escrow | ✓ |
| Soumission + approbation jalon → paiement | ✓ |
| Messagerie en temps réel | ✓ |
| Gestion du portfolio | ✓ |
| Dashboard admin | ✓ |

**Validation des API (via Postman/Thunder Client) :**
- Tous les endpoints documentés et testés
- Vérification des codes HTTP (201, 200, 401, 403, 422)
- Tests d'autorisation (accès refusé si mauvais rôle)

---

## 13. CONCLUSION ET PERSPECTIVES

### Bilan

Ce projet de fin d'études m'a permis de réaliser une application web complète de niveau production, en maîtrisant l'ensemble de la chaîne de développement full-stack :

**Réalisations techniques :**
- ✅ 19 tables de base de données modélisées et migrées
- ✅ 40+ endpoints REST API développés et sécurisés
- ✅ 53+ composants React créés
- ✅ 3 systèmes d'authentification (email, Google OAuth, token Bearer)
- ✅ Module IA complet avec 5 fonctionnalités (Ollama/Mistral)
- ✅ Système de paiement escrow fonctionnel avec commission
- ✅ Messagerie temps réel (Socket.IO)
- ✅ Interface 3D interactive (Three.js)
- ✅ Tableau de bord administrateur complet

**Compétences développées :**
- Architecture REST API avec Laravel
- Développement frontend React 19 (hooks, state management, routing)
- Conception de bases de données relationnelles complexes
- Intégration d'IA (Ollama, prompt engineering)
- Sécurité web (auth, autorisation, validation)
- Paiements sécurisés (escrow)
- Communication temps réel (WebSockets)

### Perspectives d'évolution

**Court terme :**
- Déploiement en production (VPS, Nginx, SSL Let's Encrypt)
- Intégration Stripe pour les paiements réels
- Tests automatisés (PHPUnit, Vitest)

**Moyen terme :**
- Application mobile (React Native)
- IA avancée (embeddings vectoriels, recherche sémantique)
- Système de vérification d'identité (KYC)
- Cache Redis pour les performances

**Long terme :**
- Internationalisation multi-langue (français/anglais/arabe)
- Programme d'affiliation
- API publique pour intégrations tierces

---

## 14. ANNEXES

### Annexe A — Endpoints API principaux

```
AUTH
POST   /api/auth/register            Inscription
POST   /api/auth/login               Connexion
POST   /api/auth/logout              Déconnexion
GET    /api/auth/me                  Profil connecté
PUT    /api/auth/profile             Mise à jour profil
GET    /auth/google/redirect         OAuth Google
GET    /auth/google/callback         Callback OAuth

JOBS
GET    /api/jobs                     Liste des offres
POST   /api/jobs                     Créer une offre [client]
GET    /api/jobs/{id}                Détail d'une offre
PUT    /api/jobs/{id}                Modifier une offre [client]
DELETE /api/jobs/{id}                Supprimer une offre [client]
GET    /api/jobs/my/postings         Mes offres [client]
POST   /api/jobs/{id}/save           Sauvegarder une offre

PROPOSALS
POST   /api/proposals                Soumettre une proposition [freelancer]
GET    /api/proposals/my             Mes propositions [freelancer]
POST   /api/proposals/{id}/accept    Accepter [client]
POST   /api/proposals/{id}/reject    Rejeter [client]

FREELANCER
GET    /api/freelancers              Liste des freelancers
GET    /api/freelancers/{username}   Profil public
PUT    /api/freelancer/profile       Mise à jour profil [freelancer]
PUT    /api/freelancer/onboarding    Compléter onboarding [freelancer]
GET    /api/freelancer/dashboard     Tableau de bord [freelancer]
POST   /api/freelancer/portfolio     Ajouter projet portfolio [freelancer]

PAYMENTS
GET    /api/payments/wallet          Mon portefeuille
POST   /api/payments/deposit         Déposer des fonds
POST   /api/payments/fund-escrow     Financer l'escrow [client]
POST   /api/payments/release-milestone Libérer un paiement [client]
GET    /api/payments/overview        Vue financière globale

AI
POST   /api/ai/generate-proposal     Générer une proposition [freelancer]
POST   /api/ai/match-freelancers     Trouver des freelancers [client]
POST   /api/ai/chat                  Chat assistant
POST   /api/ai/analyze-profile       Analyser profil [freelancer]
POST   /api/ai/smart-search          Recherche intelligente

CHAT
GET    /api/chat/conversations       Mes conversations
POST   /api/chat/conversations       Créer une conversation
GET    /api/chat/conversations/{id}/messages  Messages paginés
POST   /api/chat/conversations/{id}/messages  Envoyer un message
PUT    /api/chat/conversations/{id}/read      Marquer comme lu

REVIEWS
POST   /api/reviews                  Laisser un avis
GET    /api/reviews/freelancer/{id}  Avis d'un freelancer
DELETE /api/reviews/{id}             Supprimer un avis

ADMIN
GET    /api/admin/dashboard          Tableau de bord
GET    /api/admin/users              Liste utilisateurs
POST   /api/admin/users/{id}/ban     Bannir
POST   /api/admin/users/{id}/verify  Vérifier
GET    /api/admin/analytics          Analytics

CATEGORIES
GET    /api/categories               Toutes les catégories
```

### Annexe B — Variables d'environnement

```env
# Application
APP_NAME=Panda
APP_URL=http://localhost:8000
APP_ENV=local

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=panda_db
DB_USERNAME=root
DB_PASSWORD=

# Frontend (pour CORS et redirects OAuth)
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Ollama IA
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Stripe (pour les paiements réels)
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
```

### Annexe C — Captures d'écran

*(Ajouter les captures des pages principales)*

1. Page d'accueil avec scène 3D
2. Page d'inscription / choix du rôle
3. Processus d'onboarding freelancer
4. Marketplace des offres d'emploi
5. Détail d'une offre + soumission de proposition
6. Interface IA (génération de proposition)
7. Tableau de bord freelancer
8. Portefeuille et transactions
9. Interface de messagerie
10. Tableau de bord administrateur

---

*Rapport rédigé par Ayoub Elmernissi — Projet Panda — Année 2025/2026*
