# DIAGRAMMES UML COMPLETS — PANDA (PANDA)
### Projet de Fin d'Études — Ayoub Elmernissi — 2025/2026

> **Comment utiliser ces diagrammes :**
> Copiez chaque bloc `@startuml ... @enduml` sur **[plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)**
> ou utilisez l'extension **PlantUML** dans VS Code (Ctrl+Shift+P → "Preview Current Diagram")

---

## TABLE DES MATIÈRES

| # | Diagramme | Type |
|---|-----------|------|
| 1 | Diagramme des cas d'utilisation — Vue globale | Use Case |
| 2 | Diagramme des cas d'utilisation — Freelancer | Use Case |
| 3 | Diagramme des cas d'utilisation — Client | Use Case |
| 4 | Diagramme des cas d'utilisation — Admin | Use Case |
| 5 | Diagramme de classes complet | Class |
| 6 | Diagramme Entité-Relation (ERD) | ERD |
| 7 | Séquence — Inscription & Onboarding Freelancer | Sequence |
| 8 | Séquence — Connexion Google OAuth | Sequence |
| 9 | Séquence — Publication d'offre et soumission de proposition | Sequence |
| 10 | Séquence — Acceptation de proposition & création de contrat | Sequence |
| 11 | Séquence — Paiement Escrow complet | Sequence |
| 12 | Séquence — Génération de proposition par IA | Sequence |
| 13 | Séquence — Messagerie temps réel | Sequence |
| 14 | Diagramme d'activité — Cycle de vie d'une mission | Activity |
| 15 | Diagramme d'activité — Flux de paiement Escrow | Activity |
| 16 | Diagramme d'état — États d'une offre (JobPosting) | State |
| 17 | Diagramme d'état — États d'une proposition | State |
| 18 | Diagramme d'état — États d'un contrat | State |
| 19 | Diagramme d'état — États d'un jalon (Milestone) | State |
| 20 | Diagramme de déploiement | Deployment |
| 21 | Diagramme de composants | Component |

---

## 1. CAS D'UTILISATION — VUE GLOBALE

```plantuml
@startuml UC01_GlobalPanda
left to right direction
skinparam actorStyle awesome
skinparam packageStyle rectangle
skinparam backgroundColor #FAFAFA
skinparam usecase {
  BackgroundColor #E8F4FD
  BorderColor #2196F3
  ArrowColor #2196F3
}

title Diagramme des Cas d'Utilisation — Panda (Vue Globale)

actor "Freelancer" as FL #LightGreen
actor "Client"     as CL #LightBlue
actor "Admin"      as ADM #LightCoral

actor "Google\nOAuth" as GOOGLE <<external>> #LightYellow
actor "Ollama\nMistral" as AI <<external>> #Lavender
actor "Stripe" as STRIPE <<external>> #Wheat

rectangle "Panda — Marketplace Freelance" {

  package "Authentification" #F0F8FF {
    usecase "S'inscrire" as REG
    usecase "Se connecter" as LOGIN
    usecase "OAuth Google" as GOAUTH
    usecase "Onboarding" as ONBOARD
    usecase "Se déconnecter" as LOGOUT
  }

  package "Gestion des Offres" #F0FFF0 {
    usecase "Publier une offre" as POST_JOB
    usecase "Parcourir les offres" as BROWSE_JOBS
    usecase "Rechercher des offres" as SEARCH
    usecase "Consulter une offre" as VIEW_JOB
    usecase "Sauvegarder une offre" as SAVE_JOB
  }

  package "Propositions & Contrats" #FFFAF0 {
    usecase "Soumettre une proposition" as SUBMIT_PROP
    usecase "Générer proposition (IA)" as AI_PROP
    usecase "Accepter une proposition" as ACCEPT_PROP
    usecase "Rejeter une proposition" as REJECT_PROP
    usecase "Gérer les jalons" as MILESTONES
    usecase "Consulter mes propositions" as MY_PROPS
  }

  package "Profils & Portfolio" #FFF0F5 {
    usecase "Gérer son profil" as PROFILE
    usecase "Gérer le portfolio" as PORTFOLIO
    usecase "Gérer les compétences" as SKILLS
    usecase "Consulter profil freelancer" as VIEW_PROFILE
  }

  package "Paiements & Escrow" #F5F5DC {
    usecase "Déposer des fonds" as DEPOSIT
    usecase "Financer l'escrow" as FUND_ESCROW
    usecase "Libérer un paiement" as RELEASE
    usecase "Consulter le portefeuille" as WALLET
    usecase "Retirer ses gains" as WITHDRAW
  }

  package "Communication" #F0FFFF {
    usecase "Envoyer un message" as SEND_MSG
    usecase "Voir les conversations" as CONVERSATIONS
    usecase "Notifications" as NOTIFS
  }

  package "Évaluations" #F5FFFA {
    usecase "Laisser un avis" as REVIEW
    usecase "Voir les avis" as VIEW_REVIEWS
  }

  package "IA Assistant" #FAF0E6 {
    usecase "Matching freelancers" as MATCH
    usecase "Analyser son profil" as ANALYZE
    usecase "Chat assistant IA" as CHAT_AI
    usecase "Recherche intelligente" as SMART_SEARCH
  }

  package "Administration" #FFE4E1 {
    usecase "Dashboard admin" as ADMIN_DASH
    usecase "Gérer les utilisateurs" as ADMIN_USERS
    usecase "Bannir un utilisateur" as BAN
    usecase "Vérifier un compte" as VERIFY
    usecase "Voir les analytics" as ANALYTICS
  }
}

' Freelancer
FL --> REG
FL --> LOGIN
FL --> GOAUTH
FL --> ONBOARD
FL --> BROWSE_JOBS
FL --> SEARCH
FL --> VIEW_JOB
FL --> SAVE_JOB
FL --> SUBMIT_PROP
FL --> AI_PROP
FL --> MY_PROPS
FL --> MILESTONES
FL --> PROFILE
FL --> PORTFOLIO
FL --> SKILLS
FL --> WALLET
FL --> WITHDRAW
FL --> SEND_MSG
FL --> CONVERSATIONS
FL --> NOTIFS
FL --> REVIEW
FL --> VIEW_REVIEWS
FL --> ANALYZE
FL --> CHAT_AI
FL --> LOGOUT

' Client
CL --> REG
CL --> LOGIN
CL --> GOAUTH
CL --> POST_JOB
CL --> VIEW_PROFILE
CL --> ACCEPT_PROP
CL --> REJECT_PROP
CL --> MILESTONES
CL --> DEPOSIT
CL --> FUND_ESCROW
CL --> RELEASE
CL --> WALLET
CL --> SEND_MSG
CL --> CONVERSATIONS
CL --> NOTIFS
CL --> REVIEW
CL --> MATCH
CL --> SMART_SEARCH
CL --> LOGOUT

' Admin
ADM --> LOGIN
ADM --> ADMIN_DASH
ADM --> ADMIN_USERS
ADM --> BAN
ADM --> VERIFY
ADM --> ANALYTICS

' Dépendances externes
GOAUTH ..> GOOGLE : <<uses>>
AI_PROP ..> AI    : <<uses>>
MATCH   ..> AI    : <<uses>>
CHAT_AI ..> AI    : <<uses>>
ANALYZE ..> AI    : <<uses>>
DEPOSIT ..> STRIPE : <<uses>>

' Inclusions
SUBMIT_PROP ..> AI_PROP : <<include>>
ACCEPT_PROP ..> FUND_ESCROW : <<extend>>

@enduml
```

---

## 2. CAS D'UTILISATION — FREELANCER (DÉTAIL)

```plantuml
@startuml UC02_Freelancer
left to right direction
skinparam actorStyle awesome
title Cas d'Utilisation — Freelancer (Détail)

actor "Freelancer" as FL

rectangle "Espace Freelancer — Panda" {

  package "Compte & Profil" {
    usecase "S'inscrire avec email" as REG_EMAIL
    usecase "S'inscrire via Google" as REG_GOOGLE
    usecase "Compléter l'onboarding\n(5 étapes)" as ONBOARD
    usecase "Modifier son profil" as EDIT_PROFILE
    usecase "Changer de mot de passe" as CHANGE_PWD
    usecase "Upload photo de profil" as UPLOAD_AVATAR
  }

  package "Portfolio & Compétences" {
    usecase "Ajouter un projet portfolio" as ADD_PORTFOLIO
    usecase "Modifier un projet" as EDIT_PORTFOLIO
    usecase "Supprimer un projet" as DEL_PORTFOLIO
    usecase "Ajouter une compétence" as ADD_SKILL
    usecase "Supprimer une compétence" as DEL_SKILL
    usecase "Définir son niveau\npar compétence" as SKILL_LEVEL
  }

  package "Marketplace" {
    usecase "Parcourir les offres" as BROWSE
    usecase "Filtrer par catégorie" as FILTER_CAT
    usecase "Filtrer par budget" as FILTER_BUDGET
    usecase "Consulter le détail\nd'une offre" as VIEW_JOB
    usecase "Sauvegarder une offre" as SAVE
  }

  package "Propositions" {
    usecase "Soumettre une proposition" as SUBMIT
    usecase "Générer via IA" as GEN_AI
    usecase "Définir les jalons" as SET_MILESTONES
    usecase "Voir mes propositions" as MY_PROPS
    usecase "Retirer une proposition" as WITHDRAW_PROP
  }

  package "Contrats & Missions" {
    usecase "Voir mes contrats actifs" as MY_CONTRACTS
    usecase "Soumettre un jalon terminé" as SUBMIT_MILESTONE
    usecase "Consulter les termes\ndu contrat" as VIEW_CONTRACT
  }

  package "Finance" {
    usecase "Consulter mon portefeuille" as WALLET
    usecase "Voir l'historique des gains" as TRANSACTIONS
    usecase "Retirer mes gains" as CASH_OUT
  }

  package "Communication & IA" {
    usecase "Écrire un message" as MSG
    usecase "Demander à l'IA\nd'analyser mon profil" as IA_ANALYZE
    usecase "Utiliser le chat IA" as IA_CHAT
    usecase "Évaluer un client" as LEAVE_REVIEW
  }
}

FL --> REG_EMAIL
FL --> REG_GOOGLE
FL --> ONBOARD
FL --> EDIT_PROFILE
FL --> CHANGE_PWD
FL --> UPLOAD_AVATAR
FL --> ADD_PORTFOLIO
FL --> EDIT_PORTFOLIO
FL --> DEL_PORTFOLIO
FL --> ADD_SKILL
FL --> DEL_SKILL
FL --> SKILL_LEVEL
FL --> BROWSE
FL --> FILTER_CAT
FL --> FILTER_BUDGET
FL --> VIEW_JOB
FL --> SAVE
FL --> SUBMIT
FL --> GEN_AI
FL --> SET_MILESTONES
FL --> MY_PROPS
FL --> WITHDRAW_PROP
FL --> MY_CONTRACTS
FL --> SUBMIT_MILESTONE
FL --> VIEW_CONTRACT
FL --> WALLET
FL --> TRANSACTIONS
FL --> CASH_OUT
FL --> MSG
FL --> IA_ANALYZE
FL --> IA_CHAT
FL --> LEAVE_REVIEW

SUBMIT ..> GEN_AI : <<extend>>
SUBMIT ..> SET_MILESTONES : <<include>>

@enduml
```

---

## 3. CAS D'UTILISATION — CLIENT (DÉTAIL)

```plantuml
@startuml UC03_Client
left to right direction
skinparam actorStyle awesome
title Cas d'Utilisation — Client (Détail)

actor "Client" as CL

rectangle "Espace Client — Panda" {

  package "Compte" {
    usecase "S'inscrire" as REG
    usecase "Se connecter\n(email ou Google)" as LOGIN
    usecase "Compléter profil\nentreprise" as COMPANY_PROFILE
  }

  package "Gestion des Offres" {
    usecase "Créer une offre d'emploi" as CREATE_JOB
    usecase "Définir le budget\n(horaire ou forfait)" as SET_BUDGET
    usecase "Choisir les compétences\nrequises" as SET_SKILLS
    usecase "Définir la durée\net le niveau requis" as SET_DETAILS
    usecase "Publier l'offre" as PUBLISH
    usecase "Modifier une offre" as EDIT_JOB
    usecase "Clôturer une offre" as CLOSE_JOB
    usecase "Voir mes offres publiées" as MY_JOBS
  }

  package "Recrutement" {
    usecase "Parcourir les freelancers" as BROWSE_FL
    usecase "Consulter profil complet\nd'un freelancer" as VIEW_PROFILE
    usecase "Voir le portfolio\nd'un freelancer" as VIEW_PORTFOLIO
    usecase "Consulter les propositions\nreçues" as VIEW_PROPOSALS
    usecase "Accepter une proposition" as ACCEPT
    usecase "Rejeter une proposition" as REJECT
    usecase "Utiliser l'IA pour\ntrouver des talents" as AI_MATCH
  }

  package "Gestion de Contrat" {
    usecase "Créer un contrat" as CREATE_CONTRACT
    usecase "Définir les jalons\net délais" as DEFINE_MILESTONES
    usecase "Réviser le travail soumis" as REVIEW_WORK
    usecase "Approuver un jalon" as APPROVE_MILESTONE
    usecase "Demander une correction" as REQUEST_REVISION
    usecase "Ouvrir un litige" as OPEN_DISPUTE
    usecase "Clôturer le contrat" as CLOSE_CONTRACT
  }

  package "Finance" {
    usecase "Déposer des fonds\n(carte ou virement)" as DEPOSIT
    usecase "Financer l'escrow\npour un jalon" as FUND_ESCROW
    usecase "Libérer un paiement" as RELEASE_PAYMENT
    usecase "Voir historique\ndes transactions" as HISTORY
  }

  package "Communication" {
    usecase "Messagerie freelancer" as MSG
    usecase "Laisser un avis\nsur le freelancer" as REVIEW
  }
}

CL --> REG
CL --> LOGIN
CL --> COMPANY_PROFILE
CL --> CREATE_JOB
CL --> SET_BUDGET
CL --> SET_SKILLS
CL --> SET_DETAILS
CL --> PUBLISH
CL --> EDIT_JOB
CL --> CLOSE_JOB
CL --> MY_JOBS
CL --> BROWSE_FL
CL --> VIEW_PROFILE
CL --> VIEW_PORTFOLIO
CL --> VIEW_PROPOSALS
CL --> ACCEPT
CL --> REJECT
CL --> AI_MATCH
CL --> CREATE_CONTRACT
CL --> DEFINE_MILESTONES
CL --> REVIEW_WORK
CL --> APPROVE_MILESTONE
CL --> REQUEST_REVISION
CL --> OPEN_DISPUTE
CL --> CLOSE_CONTRACT
CL --> DEPOSIT
CL --> FUND_ESCROW
CL --> RELEASE_PAYMENT
CL --> HISTORY
CL --> MSG
CL --> REVIEW

CREATE_JOB ..> SET_BUDGET : <<include>>
CREATE_JOB ..> SET_SKILLS : <<include>>
ACCEPT ..> CREATE_CONTRACT : <<include>>
APPROVE_MILESTONE ..> RELEASE_PAYMENT : <<include>>

@enduml
```

---

## 4. CAS D'UTILISATION — ADMIN (DÉTAIL)

```plantuml
@startuml UC04_Admin
left to right direction
skinparam actorStyle awesome
title Cas d'Utilisation — Administrateur

actor "Admin" as ADM

rectangle "Panneau d'Administration — Panda" {

  package "Dashboard" {
    usecase "Voir le tableau de bord\nglobal" as DASH
    usecase "Voir les KPIs\n(utilisateurs, revenus, jobs)" as KPI
    usecase "Voir les graphiques\nd'activité" as CHARTS
  }

  package "Gestion Utilisateurs" {
    usecase "Lister tous les utilisateurs" as LIST_USERS
    usecase "Rechercher un utilisateur" as SEARCH_USER
    usecase "Voir profil complet\nd'un utilisateur" as VIEW_USER
    usecase "Bannir un utilisateur" as BAN_USER
    usecase "Débannir un utilisateur" as UNBAN_USER
    usecase "Vérifier/certifier\nun compte" as VERIFY_USER
    usecase "Retirer la vérification" as UNVERIFY_USER
  }

  package "Modération" {
    usecase "Voir les offres publiées" as VIEW_JOBS
    usecase "Supprimer une offre\ninappropriée" as DEL_JOB
    usecase "Voir les contrats actifs" as VIEW_CONTRACTS
    usecase "Intervenir sur un litige" as RESOLVE_DISPUTE
  }

  package "Analytics & Rapports" {
    usecase "Voir statistiques\npar période" as STATS
    usecase "Voir les revenus\nde la plateforme" as REVENUE
    usecase "Voir top freelancers" as TOP_FL
    usecase "Voir top clients" as TOP_CL
    usecase "Exporter un rapport" as EXPORT
  }
}

ADM --> DASH
ADM --> KPI
ADM --> CHARTS
ADM --> LIST_USERS
ADM --> SEARCH_USER
ADM --> VIEW_USER
ADM --> BAN_USER
ADM --> UNBAN_USER
ADM --> VERIFY_USER
ADM --> UNVERIFY_USER
ADM --> VIEW_JOBS
ADM --> DEL_JOB
ADM --> VIEW_CONTRACTS
ADM --> RESOLVE_DISPUTE
ADM --> STATS
ADM --> REVENUE
ADM --> TOP_FL
ADM --> TOP_CL
ADM --> EXPORT

DASH ..> KPI : <<include>>
DASH ..> CHARTS : <<include>>

@enduml
```

---

## 5. DIAGRAMME DE CLASSES COMPLET

```plantuml
@startuml CD05_ClassesCompletes
skinparam classAttributeIconSize 0
skinparam classFontSize 11
skinparam linetype ortho
skinparam backgroundColor #FAFAFA
skinparam class {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
  ArrowColor #1565C0
  HeaderBackgroundColor #2196F3
  HeaderFontColor white
}

title Diagramme de Classes — Panda

' ────────────── UTILISATEURS ──────────────
class User {
  +id: int
  +name: string
  +username: string
  +email: string
  +password: string
  +role: enum [freelancer|client|admin]
  +avatar: string
  +country: string
  +timezone: string
  +phone: string
  +phone_verified: boolean
  +is_verified: boolean
  +is_active: boolean
  +is_online: boolean
  +last_seen_at: timestamp
  +google_id: string
  +github_id: string
  +created_at: timestamp
  --
  +freelancerProfile(): FreelancerProfile
  +clientProfile(): ClientProfile
  +wallet(): Wallet
  +subscription(): Subscription
  +portfolios(): Collection
  +jobPostings(): Collection
  +proposals(): Collection
  +contracts(): Collection
  +conversations(): Collection
  +aiHistories(): Collection
}

class FreelancerProfile {
  +id: int
  +user_id: int
  +title: string
  +bio: text
  +hourly_rate: decimal
  +experience_level: enum [entry|intermediate|expert]
  +availability: string
  +weekly_hours: int
  +success_rate: decimal
  +total_jobs: int
  +total_earned: decimal
  +avg_rating: decimal
  +total_reviews: int
  +is_top_rated: boolean
  +is_top_rated_plus: boolean
  +is_available: boolean
  +profile_visibility: string
  ' Onboarding fields
  +category: string
  +specialties: json
  +experience: text
  +education: json
  +date_of_birth: date
  +address: string
  +languages: json
  +video_intro: string
  +linkedin_url: string
  +github_url: string
  +website_url: string
  +certifications: json
  +badges: json
  --
  +user(): User
  +skills(): Collection
}

class ClientProfile {
  +id: int
  +user_id: int
  +company_name: string
  +company_size: string
  +industry: string
  +about: text
  +total_jobs_posted: int
  +total_spent: decimal
  +avg_rating: decimal
  +total_reviews: int
  +payment_verified: boolean
  +preferred_payment_method: string
  --
  +user(): User
}

' ────────────── CATÉGORIES & COMPÉTENCES ──────────────
class Category {
  +id: int
  +name: string
  +slug: string
  +icon: string
  +description: text
  +parent_id: int
  +sort_order: int
  +is_active: boolean
  --
  +parent(): Category
  +children(): Collection
  +jobs(): Collection
}

class Skill {
  +id: int
  +name: string
  +slug: string
  +category_id: int
  +is_active: boolean
  --
  +category(): Category
  +freelancers(): Collection
}

class Portfolio {
  +id: int
  +user_id: int
  +title: string
  +description: text
  +project_url: string
  +images: json
  +skills: json
  +completed_at: date
  +is_featured: boolean
  +views: int
  --
  +user(): User
}

' ────────────── OFFRES D'EMPLOI ──────────────
class JobPosting {
  +id: int
  +client_id: int
  +category_id: int
  +title: string
  +description: text
  +skills: json
  +type: enum [hourly|fixed]
  +experience_level: enum [entry|intermediate|expert]
  +budget_min: decimal
  +budget_max: decimal
  +duration: string
  +location_requirement: string
  +attachments: json
  +status: enum [draft|open|in_progress|completed|cancelled]
  +visibility: string
  +is_featured: boolean
  +is_urgent: boolean
  +proposals_count: int
  +views_count: int
  +expires_at: timestamp
  --
  +client(): User
  +category(): Category
  +proposals(): Collection
}

' ────────────── PROPOSITIONS ──────────────
class Proposal {
  +id: int
  +job_id: int
  +freelancer_id: int
  +cover_letter: text
  +bid_amount: decimal
  +bid_type: enum [hourly|fixed]
  +estimated_duration: int
  +duration_unit: string
  +milestones: json
  +attachments: json
  +status: enum [pending|accepted|rejected|withdrawn]
  +is_ai_generated: boolean
  +connects_used: int
  --
  +job(): JobPosting
  +freelancer(): User
  +contract(): Contract
}

' ────────────── CONTRATS & JALONS ──────────────
class Contract {
  +id: int
  +job_id: int
  +proposal_id: int
  +client_id: int
  +freelancer_id: int
  +title: string
  +description: text
  +type: enum [hourly|fixed]
  +amount: decimal
  +escrow_amount: decimal
  +status: enum [active|paused|completed|cancelled|disputed]
  +started_at: timestamp
  +ended_at: timestamp
  +deadline_at: timestamp
  +terms: text
  --
  +job(): JobPosting
  +proposal(): Proposal
  +client(): User
  +freelancer(): User
  +milestones(): Collection
  +reviews(): Collection
}

class Milestone {
  +id: int
  +contract_id: int
  +title: string
  +description: text
  +amount: decimal
  +status: enum [pending|funded|submitted|approved|disputed]
  +due_at: timestamp
  +submitted_at: timestamp
  +approved_at: timestamp
  +submission_notes: text
  +attachments: json
  +sort_order: int
  --
  +contract(): Contract
}

' ────────────── ÉVALUATIONS ──────────────
class Review {
  +id: int
  +contract_id: int
  +reviewer_id: int
  +reviewee_id: int
  +rating: decimal
  +comment: text
  +breakdown: json
  +is_public: boolean
  --
  +contract(): Contract
  +reviewer(): User
  +reviewee(): User
}

' ────────────── FINANCE ──────────────
class Wallet {
  +id: int
  +user_id: int
  +balance: decimal
  +pending_balance: decimal
  +escrow_balance: decimal
  +currency: string
  --
  +user(): User
  +transactions(): Collection
}

class Transaction {
  +id: int
  +wallet_id: int
  +user_id: int
  +contract_id: int
  +milestone_id: int
  +reference: string
  +type: enum [credit|escrow|debit]
  +amount: decimal
  +fee: decimal
  +currency: string
  +status: enum [pending|completed|failed|refunded]
  +description: text
  +metadata: json
  +payment_method: string
  +stripe_payment_id: string
  --
  +wallet(): Wallet
  +contract(): Contract
}

class Subscription {
  +id: int
  +user_id: int
  +plan: string
  +stripe_subscription_id: string
  +connects_balance: int
  +monthly_fee: decimal
  +status: string
  +trial_ends_at: timestamp
  +current_period_end: timestamp
  --
  +user(): User
}

' ────────────── MESSAGERIE ──────────────
class Conversation {
  +id: int
  +type: enum [direct|group]
  +contract_id: int
  +job_id: int
  +title: string
  +last_message_at: timestamp
  --
  +participants(): Collection
  +messages(): Collection
  +lastMessage(): Message
}

class Message {
  +id: int
  +conversation_id: int
  +sender_id: int
  +body: text
  +type: enum [text|file|image]
  +attachments: json
  +metadata: json
  +is_read: boolean
  +read_at: timestamp
  +reply_to_id: int
  --
  +conversation(): Conversation
  +sender(): User
  +replyTo(): Message
}

' ────────────── INTELLIGENCE ARTIFICIELLE ──────────────
class AiHistory {
  +id: int
  +user_id: int
  +type: enum [proposal|search|match|summary|chat|cv_analysis]
  +input: json
  +output: json
  +model: string
  +tokens_used: int
  +created_at: timestamp
  --
  +user(): User
}

' ════════ ASSOCIATIONS ════════

User "1" *-down- "0..1" FreelancerProfile : possède >
User "1" *-down- "0..1" ClientProfile : possède >
User "1" *-right- "1" Wallet : a >
User "1" *-right- "0..1" Subscription : souscrit >
User "1" o-right- "N" Portfolio : publie >
User "N" -- "N" Skill : maîtrise\n[freelancer_skills\n(with level)]
User "N" -- "N" Conversation : participe\n[participants]

User "1" o-down- "N" JobPosting : publie (client) >
User "1" o-down- "N" Proposal : soumet (freelancer) >
User "1" o-down- "N" AiHistory : génère >

JobPosting "N" o-- "1" Category : appartient à >
JobPosting "1" o-down- "N" Proposal : reçoit >

Proposal "0..1" -down-> "1" Contract : génère >

Contract "1" *-down- "N" Milestone : décomposé en >
Contract "1" o-right- "N" Review : évalué par >
Contract "N" o-- "1" JobPosting

Wallet "1" *-down- "N" Transaction : enregistre >
Transaction "N" o-- "0..1" Contract
Transaction "N" o-- "0..1" Milestone

Conversation "1" *-down- "N" Message : contient >
Message "N" o-- "0..1" Message : répond à >

@enduml
```

---

## 6. DIAGRAMME ENTITÉ-RELATION (ERD)

```plantuml
@startuml ERD06_Panda
!define TABLE(name, desc) class name as "desc" << (T,#FFAAAA) >>
!define PK(x) <u>x</u>
!define FK(x) <i>x</i>

skinparam linetype ortho
skinparam class {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
  ArrowColor #E67E22
}

title Diagramme Entité-Relation — Panda

entity users {
  * PK(id): INT
  --
  name: VARCHAR(255)
  username: VARCHAR(100)
  email: VARCHAR(255) UNIQUE
  password: VARCHAR(255)
  role: ENUM('freelancer','client','admin')
  avatar: VARCHAR(500)
  country: VARCHAR(100)
  google_id: VARCHAR(255)
  is_verified: BOOLEAN
  is_active: BOOLEAN
  is_online: BOOLEAN
}

entity freelancer_profiles {
  * PK(id): INT
  --
  FK(user_id): INT
  title: VARCHAR(255)
  bio: TEXT
  hourly_rate: DECIMAL(10,2)
  experience_level: ENUM
  weekly_hours: INT
  success_rate: DECIMAL(5,2)
  total_jobs: INT
  total_earned: DECIMAL(12,2)
  avg_rating: DECIMAL(3,2)
  category: VARCHAR(100)
  specialties: JSON
  languages: JSON
}

entity client_profiles {
  * PK(id): INT
  --
  FK(user_id): INT
  company_name: VARCHAR(255)
  company_size: VARCHAR(50)
  industry: VARCHAR(100)
  about: TEXT
  total_jobs_posted: INT
  total_spent: DECIMAL(12,2)
  payment_verified: BOOLEAN
}

entity categories {
  * PK(id): INT
  --
  FK(parent_id): INT [nullable]
  name: VARCHAR(100)
  slug: VARCHAR(100) UNIQUE
  icon: VARCHAR(100)
  sort_order: INT
  is_active: BOOLEAN
}

entity skills {
  * PK(id): INT
  --
  FK(category_id): INT
  name: VARCHAR(100)
  slug: VARCHAR(100) UNIQUE
  is_active: BOOLEAN
}

entity freelancer_skills {
  * PK(id): INT
  --
  FK(freelancer_profile_id): INT
  FK(skill_id): INT
  level: ENUM('beginner','intermediate','expert')
}

entity portfolios {
  * PK(id): INT
  --
  FK(user_id): INT
  title: VARCHAR(255)
  description: TEXT
  project_url: VARCHAR(500)
  images: JSON
  skills: JSON
  completed_at: DATE
  is_featured: BOOLEAN
}

entity job_postings {
  * PK(id): INT
  --
  FK(client_id): INT
  FK(category_id): INT
  title: VARCHAR(255)
  description: LONGTEXT
  skills: JSON
  type: ENUM('hourly','fixed')
  experience_level: ENUM
  budget_min: DECIMAL(10,2)
  budget_max: DECIMAL(10,2)
  status: ENUM
  is_featured: BOOLEAN
  is_urgent: BOOLEAN
  proposals_count: INT
  views_count: INT
  expires_at: TIMESTAMP
}

entity proposals {
  * PK(id): INT
  --
  FK(job_id): INT
  FK(freelancer_id): INT
  cover_letter: TEXT
  bid_amount: DECIMAL(10,2)
  bid_type: ENUM('hourly','fixed')
  estimated_duration: INT
  milestones: JSON
  attachments: JSON
  status: ENUM('pending','accepted','rejected','withdrawn')
  is_ai_generated: BOOLEAN
  connects_used: INT
}

entity contracts {
  * PK(id): INT
  --
  FK(job_id): INT
  FK(proposal_id): INT
  FK(client_id): INT
  FK(freelancer_id): INT
  title: VARCHAR(255)
  type: ENUM('hourly','fixed')
  amount: DECIMAL(12,2)
  escrow_amount: DECIMAL(12,2)
  status: ENUM
  started_at: TIMESTAMP
  deadline_at: TIMESTAMP
  terms: TEXT
}

entity milestones {
  * PK(id): INT
  --
  FK(contract_id): INT
  title: VARCHAR(255)
  description: TEXT
  amount: DECIMAL(10,2)
  status: ENUM('pending','funded','submitted','approved','disputed')
  due_at: TIMESTAMP
  submitted_at: TIMESTAMP
  approved_at: TIMESTAMP
  sort_order: INT
}

entity reviews {
  * PK(id): INT
  --
  FK(contract_id): INT
  FK(reviewer_id): INT
  FK(reviewee_id): INT
  rating: DECIMAL(3,2)
  comment: TEXT
  breakdown: JSON
  is_public: BOOLEAN
}

entity wallets {
  * PK(id): INT
  --
  FK(user_id): INT
  balance: DECIMAL(12,2)
  pending_balance: DECIMAL(12,2)
  escrow_balance: DECIMAL(12,2)
  currency: VARCHAR(3)
}

entity transactions {
  * PK(id): INT
  --
  FK(wallet_id): INT
  FK(user_id): INT
  FK(contract_id): INT [nullable]
  FK(milestone_id): INT [nullable]
  reference: VARCHAR(100) UNIQUE
  type: ENUM('credit','escrow','debit')
  amount: DECIMAL(12,2)
  fee: DECIMAL(12,2)
  status: ENUM
  stripe_payment_id: VARCHAR(255)
}

entity conversations {
  * PK(id): INT
  --
  FK(contract_id): INT [nullable]
  type: ENUM('direct','group')
  title: VARCHAR(255)
  last_message_at: TIMESTAMP
}

entity conversation_participants {
  * PK(id): INT
  --
  FK(conversation_id): INT
  FK(user_id): INT
}

entity messages {
  * PK(id): INT
  --
  FK(conversation_id): INT
  FK(sender_id): INT
  FK(reply_to_id): INT [nullable]
  body: TEXT
  type: ENUM('text','file','image')
  attachments: JSON
  is_read: BOOLEAN
  read_at: TIMESTAMP
}

entity subscriptions {
  * PK(id): INT
  --
  FK(user_id): INT
  plan: VARCHAR(50)
  connects_balance: INT
  monthly_fee: DECIMAL(8,2)
  status: VARCHAR(50)
}

entity ai_histories {
  * PK(id): INT
  --
  FK(user_id): INT
  type: ENUM('proposal','search','match','summary','chat','cv_analysis')
  input: JSON
  output: JSON
  model: VARCHAR(100)
  tokens_used: INT
}

' Relations
users ||--o| freelancer_profiles : "1..1"
users ||--o| client_profiles     : "1..1"
users ||--|| wallets              : "1..1"
users ||--o| subscriptions        : "0..1"
users ||--o{ portfolios           : "0..N"
users ||--o{ job_postings         : "0..N"
users ||--o{ proposals            : "0..N"
users ||--o{ ai_histories         : "0..N"

freelancer_profiles ||--o{ freelancer_skills : "0..N"
skills              ||--o{ freelancer_skills : "0..N"

categories ||--o{ categories   : "parent/enfant"
categories ||--o{ skills       : "0..N"
categories ||--o{ job_postings : "0..N"

job_postings ||--o{ proposals : "0..N"

proposals ||--o| contracts : "0..1"

contracts ||--o{ milestones : "1..N"
contracts ||--o{ reviews    : "0..2"

wallets ||--o{ transactions : "0..N"

conversations ||--o{ conversation_participants : "2..N"
conversations ||--o{ messages                 : "0..N"

@enduml
```

---

## 7. SÉQUENCE — INSCRIPTION ET ONBOARDING FREELANCER

```plantuml
@startuml SEQ07_InscriptionOnboarding
skinparam sequenceMessageAlign center
skinparam backgroundColor #FAFAFA
skinparam sequence {
  ArrowColor #2196F3
  ActorBorderColor #2196F3
  LifeLineBorderColor #2196F3
  ParticipantBackgroundColor #EBF5FB
  ParticipantBorderColor #2196F3
}

title Séquence — Inscription & Onboarding Freelancer

actor "Freelancer" as FL
participant "React\nFrontend" as FE
participant "AuthController\n(Laravel)" as AUTH
participant "FreelancerController\n(Laravel)" as FC
database "MySQL" as DB

== Étape 1 : Inscription ==
FL -> FE : Remplit formulaire\n{nom, email, password, role:"freelancer"}
FE -> AUTH : POST /api/auth/register\nContent-Type: application/json
AUTH -> AUTH : Validation des données\n(email unique, password min 8)
AUTH -> DB : INSERT INTO users\n{name, email, password:hashed, role:"freelancer"}
DB --> AUTH : user {id: 12}
AUTH -> DB : INSERT INTO freelancer_profiles\n{user_id: 12} (profil vide)
DB --> AUTH : profile créé
AUTH -> AUTH : user->createToken("auth_token")
AUTH --> FE : HTTP 201\n{token: "1|xxxxx", user: {...}}
FE -> FE : localStorage.setItem("token", token)
FE --> FL : Redirection vers /onboarding

== Étape 2 : Onboarding — Catégorie ==
FL -> FE : Sélectionne catégorie principale\n+ spécialités
FE -> FE : Stocke localement (state)

== Étape 3 : Onboarding — Expérience ==
FL -> FE : Décrit son expérience\n+ niveau (entry/intermediate/expert)
FE -> FE : Stocke localement (state)

== Étape 4 : Onboarding — Formation ==
FL -> FE : Renseigne formation\n(diplôme, institution, année)

== Étape 5 : Onboarding — Disponibilité & Tarif ==
FL -> FE : Disponibilité : "full-time"\nHeures/semaine : 40\nTarif horaire : 35$/h

== Étape 6 : Upload Photo & Langues ==
FL -> FE : Upload photo profil (JPG/PNG)\n+ sélectionne langues parlées

== Finalisation de l'onboarding ==
FE -> FC : PUT /api/freelancer/onboarding\nAuthorization: Bearer {token}\n{category, specialties, experience,\n education, hourly_rate, languages, avatar}
FC -> FC : Validation des données
FC -> DB : UPDATE freelancer_profiles\nSET category, specialties, experience,\n hourly_rate, languages, ...\nWHERE user_id = 12
DB --> FC : Succès
FC -> FC : Déplace la photo vers storage/
FC --> FE : HTTP 200\n{message: "Onboarding complété", profile: {...}}
FE --> FL : Redirection vers /dashboard/freelancer\n🎉 "Bienvenue sur Panda !"

@enduml
```

---

## 8. SÉQUENCE — CONNEXION GOOGLE OAUTH

```plantuml
@startuml SEQ08_GoogleOAuth
skinparam sequenceMessageAlign center
title Séquence — Authentification Google OAuth

actor "Utilisateur" as USR
participant "React\nFrontend" as FE
participant "Laravel\nAuthController" as AUTH
participant "Google\nOAuth Server" as GOOGLE
database "MySQL" as DB

USR -> FE : Clique "Continuer avec Google"
FE -> FE : window.location.href = "/auth/google/redirect"
FE -> AUTH : GET /auth/google/redirect
AUTH -> AUTH : Socialite::driver('google')\n.redirect()
AUTH --> USR : Redirection HTTP 302\nhttps://accounts.google.com/oauth/...

USR -> GOOGLE : Affiche page de consentement\n"Panda souhaite accéder à..."
USR -> GOOGLE : Autorise et sélectionne son compte

GOOGLE -> AUTH : Callback\nGET /auth/google/callback\n?code=4/0AXXX&state=yyy

AUTH -> GOOGLE : Échange le code contre\nun access_token
GOOGLE --> AUTH : {access_token, id_token,\nuser: {id, name, email, picture}}

AUTH -> DB : SELECT * FROM users\nWHERE google_id = 'GXXX'\nOR email = 'user@gmail.com'

alt Utilisateur déjà existant
  DB --> AUTH : User trouvé (id: 5)
  AUTH -> DB : UPDATE users\nSET last_seen_at = NOW(),\n avatar = picture,\n google_id = 'GXXX'
else Nouvel utilisateur
  DB --> AUTH : NULL (pas trouvé)
  AUTH -> DB : INSERT INTO users\n{name, email, google_id,\n avatar: picture,\n role: "freelancer",\n is_active: true}
  DB --> AUTH : User créé (id: 47)
  AUTH -> DB : INSERT INTO freelancer_profiles\n{user_id: 47}
end

AUTH -> AUTH : $user->createToken("google_auth")
AUTH --> FE : Redirect HTTP 302\nhttp://localhost:5173/auth/callback\n?token=47|xxxxxx&user_id=47

FE -> FE : Extrait token de l'URL\nlocalStorage.setItem("token", token)
FE -> AUTH : GET /api/auth/me\nAuthorization: Bearer 47|xxxxxx
AUTH -> DB : SELECT user WHERE id=47\nWITH freelancerProfile, clientProfile
DB --> AUTH : User complet
AUTH --> FE : HTTP 200 {user: {...}}
FE --> USR : Connecté ✓\nRedirection vers /dashboard

@enduml
```

---

## 9. SÉQUENCE — PUBLICATION D'OFFRE ET SOUMISSION DE PROPOSITION

```plantuml
@startuml SEQ09_JobProposal
skinparam sequenceMessageAlign center
title Séquence — Publication Offre & Soumission Proposition

actor "Client" as CL
actor "Freelancer" as FL
participant "Frontend\nReact" as FE
participant "JobController" as JC
participant "ProposalController" as PC
database "MySQL" as DB

== Publication d'une offre ==
CL -> FE : Clique "Publier une offre"
FE -> FE : Affiche formulaire PostJob.jsx
CL -> FE : Remplit :\n- Titre, Description\n- Catégorie : "Web Development"\n- Compétences : ["React", "Node.js"]\n- Type : "fixed"\n- Budget : 800$ - 1500$\n- Durée : "1-3 months"\n- Niveau : "intermediate"
FE -> JC : POST /api/jobs\nAuthorization: Bearer {client_token}\n{title, description, category_id: 3,\n skills: [...], budget_min: 800, ...}
JC -> JC : Validate request\n(title required, budget_min <= budget_max)
JC -> DB : INSERT INTO job_postings\n{client_id: 8, category_id: 3, title:...\n status: "open", views_count: 0}
DB --> JC : job {id: 42}
JC --> FE : HTTP 201\n{job: {id:42, title:..., status:"open"}}
FE --> CL : "Offre publiée ✓"\nRedirection vers /jobs/42

== Le freelancer trouve l'offre ==
FL -> FE : Parcourt JobsMarketplace.jsx
FE -> JC : GET /api/jobs?category=3&type=fixed\n&budget_min=500
JC -> DB : SELECT job_postings\nWHERE status='open'\nAND category_id=3 ... PAGINATE(15)
DB --> JC : [{job_id:42, ...}, ...]
JC --> FE : HTTP 200 {jobs: [...], total: 87}
FE --> FL : Affiche la liste filtrée

FL -> FE : Clique sur l'offre #42
FE -> JC : GET /api/jobs/42
JC -> DB : SELECT job WHERE id=42\nINCREMENT views_count
DB --> JC : job complet
JC --> FE : HTTP 200 {job: {..., views_count: 14}}
FE --> FL : Affiche JobDetail.jsx

== Soumission d'une proposition ==
FL -> FE : Clique "Soumettre une proposition"
FE -> FE : Affiche formulaire de proposition
FL -> FE : Saisit :\n- Lettre de motivation\n- Montant : 1200$\n- Durée : 6 semaines\n- Jalons : [{titre, montant, délai}]
FE -> PC : POST /api/proposals\nAuthorization: Bearer {freelancer_token}\n{job_id:42, cover_letter:"...",\n bid_amount:1200, bid_type:"fixed",\n estimated_duration:6,\n milestones:[...]}
PC -> PC : Vérifie le rôle freelancer\nVérifie le solde de connects
PC -> DB : INSERT INTO proposals\n{job_id:42, freelancer_id:15,\n status:"pending", connects_used:2}
PC -> DB : UPDATE subscriptions\nSET connects_balance -= 2\nWHERE user_id=15
DB --> PC : proposal {id: 89}
PC --> FE : HTTP 201 {proposal: {id:89, status:"pending"}}
FE --> FL : "Proposition envoyée ✓\n(2 connects utilisés)"

== Client reçoit une notification ==
PC -> DB : INSERT INTO notifications\n{user_id:8, type:"new_proposal",\n body:"Nouvelle proposition sur votre offre"}
FE --> CL : 🔔 Notification temps réel

@enduml
```

---

## 10. SÉQUENCE — ACCEPTATION DE PROPOSITION ET CRÉATION DE CONTRAT

```plantuml
@startuml SEQ10_AcceptContract
skinparam sequenceMessageAlign center
title Séquence — Acceptation Proposition → Création de Contrat

actor "Client" as CL
actor "Freelancer" as FL
participant "Frontend" as FE
participant "ProposalController" as PC
participant "ChatController" as CC
database "MySQL" as DB

CL -> FE : Ouvre ses propositions reçues
FE -> PC : GET /api/jobs/42/proposals\nAuthorization: Bearer {client_token}
PC -> DB : SELECT proposals WHERE job_id=42\nWITH freelancer.freelancerProfile
DB --> PC : [{proposal_id:89, freelancer:..., bid:1200$}, ...]
PC --> FE : HTTP 200 {proposals: [...]}
FE --> CL : Affiche les propositions reçues

CL -> FE : Consulte le profil du freelancer #15
CL -> FE : Décide d'accepter la proposition #89
FE -> PC : POST /api/proposals/89/accept\nAuthorization: Bearer {client_token}

PC -> DB : BEGIN TRANSACTION

PC -> DB : UPDATE proposals\nSET status = 'accepted'\nWHERE id = 89
PC -> DB : UPDATE proposals\nSET status = 'rejected'\nWHERE job_id=42 AND id != 89
PC -> DB : UPDATE job_postings\nSET status = 'in_progress'\nWHERE id = 42

PC -> DB : INSERT INTO contracts {\n  job_id: 42,\n  proposal_id: 89,\n  client_id: 8,\n  freelancer_id: 15,\n  title: "Développeur React pour SaaS",\n  type: "fixed",\n  amount: 1200.00,\n  escrow_amount: 0,\n  status: "active",\n  started_at: NOW(),\n  deadline_at: NOW() + 6_weeks\n}
DB --> PC : contract {id: 33}

PC -> DB : INSERT INTO milestones\n[\n  {contract_id:33, title:"Maquettes UI", amount:300, sort:1},\n  {contract_id:33, title:"Frontend complet", amount:600, sort:2},\n  {contract_id:33, title:"Livraison finale", amount:300, sort:3}\n]

PC -> DB : COMMIT TRANSACTION

' Créer la conversation automatiquement
PC -> CC : createConversation({type:"direct",\n  contract_id:33,\n  participants:[8, 15]})
CC -> DB : INSERT INTO conversations\n{type:"direct", contract_id:33}
CC -> DB : INSERT INTO conversation_participants\n[{conv_id:X, user_id:8}, {conv_id:X, user_id:15}]

PC -> DB : INSERT INTO notifications\n[{user_id:15, type:"proposal_accepted"},\n {user_id:8, type:"contract_created"}]

PC --> FE : HTTP 200 {\n  contract: {id:33, ...},\n  conversation_id: X\n}

FE --> CL : "Contrat #33 créé ✓\nLe freelancer a été notifié"
FE --> FL : 🔔 "Votre proposition a été acceptée !\nContrat créé — démarrez la conversation"

@enduml
```

---

## 11. SÉQUENCE — PAIEMENT ESCROW COMPLET

```plantuml
@startuml SEQ11_EscrowComplet
skinparam sequenceMessageAlign center
title Séquence — Flux de Paiement Escrow (Complet)

actor "Client" as CL
actor "Freelancer" as FL
participant "Frontend" as FE
participant "PaymentController" as PAY
database "MySQL" as DB

== Phase 1 : Dépôt de fonds ==
CL -> FE : Ouvre son portefeuille
FE -> PAY : GET /api/payments/wallet\nAuthorization: Bearer {client_token}
PAY -> DB : SELECT wallets WHERE user_id=8
DB --> PAY : {balance:0, pending:0, escrow:0}
PAY --> FE : HTTP 200 {wallet}
FE --> CL : Affiche wallet vide

CL -> FE : Clique "Déposer des fonds"\nMontant : 1500$
FE -> PAY : POST /api/payments/deposit\n{amount: 1500, payment_method: "card"}
PAY -> DB : BEGIN TRANSACTION
PAY -> DB : UPDATE wallets\nSET balance = balance + 1500\nWHERE user_id = 8
PAY -> DB : INSERT INTO transactions {\n  wallet_id, user_id:8,\n  type:"credit",\n  amount:1500, fee:0,\n  status:"completed"\n}
PAY -> DB : COMMIT
PAY --> FE : HTTP 200\n{wallet: {balance:1500}}
FE --> CL : "1500$ crédités ✓"

== Phase 2 : Financement de l'escrow ==
CL -> FE : Ouvre contrat #33 → Jalon 1 "Maquettes UI"\nClique "Financer l'escrow (300$)"
FE -> PAY : POST /api/payments/fund-escrow\n{milestone_id:101, amount:300}

PAY -> DB : SELECT wallets WHERE user_id=8
DB --> PAY : {balance:1500}
PAY -> PAY : VÉRIFIE balance >= 300 ✓

PAY -> DB : BEGIN TRANSACTION
PAY -> DB : UPDATE wallets\nSET balance = 1500 - 300 = 1200\n    escrow_balance = 0 + 300 = 300\nWHERE user_id = 8
PAY -> DB : UPDATE milestones\nSET status = 'funded'\nWHERE id = 101
PAY -> DB : INSERT INTO transactions {\n  type:"escrow", amount:300\n}
PAY -> DB : COMMIT
PAY --> FE : HTTP 200 "Escrow financé ✓"
FE --> CL : "300$ bloqués en escrow\npour le Jalon 1"
FE --> FL : 🔔 "Jalon 1 financé — vous pouvez commencer !"

== Phase 3 : Livraison du travail ==
FL -> FE : Termine le travail du jalon 1
FL -> FE : Clique "Soumettre le jalon"
FE -> PAY : PUT /api/milestones/101/submit\n{submission_notes:"Maquettes Figma disponibles à..."}
PAY -> DB : UPDATE milestones\nSET status='submitted',\n    submitted_at=NOW(),\n    submission_notes="..."
PAY -> DB : INSERT INTO notifications\n{user_id:8, type:"milestone_submitted",\n body:"Jalon 1 soumis pour révision"}
PAY --> FE : HTTP 200
FE --> FL : "Jalon soumis ✓"
FE --> CL : 🔔 "Jalon 1 soumis — veuillez réviser"

== Phase 4 : Approbation et libération ==
CL -> FE : Révise le travail → Approuve
FE -> PAY : POST /api/payments/release-milestone\n{contract_id:33, milestone_id:101}

PAY -> DB : SELECT wallets\n  WHERE user_id IN (8, 15)
DB --> PAY : client_wallet, freelancer_wallet

PAY -> PAY : commission = 300 × 0.10 = 30$\nnet_freelancer = 300 - 30 = 270$

PAY -> DB : BEGIN TRANSACTION
PAY -> DB : UPDATE wallets client\nSET escrow_balance = 300 - 300 = 0\nWHERE user_id = 8
PAY -> DB : UPDATE wallets freelancer\nSET balance = balance + 270\nWHERE user_id = 15
PAY -> DB : INSERT INTO transactions [{\n  user_id:8, type:"debit",\n  amount:300, fee:30\n},{\n  user_id:15, type:"credit",\n  amount:270, fee:0\n}]
PAY -> DB : UPDATE milestones\nSET status='approved',\n    approved_at=NOW()\nWHERE id=101
PAY -> DB : COMMIT TRANSACTION
PAY -> DB : INSERT INTO notifications [\n  {user_id:15, type:"payment_released",\n   body:"270$ crédités sur votre compte"},\n  {user_id:8, type:"milestone_approved"}\n]
PAY --> FE : HTTP 200\n{message:"Paiement libéré",\n freelancer_received:270,\n platform_fee:30}
FE --> CL : "Paiement de 270$ libéré ✓"
FE --> FL : 🔔 "+270$ crédités sur votre portefeuille"

@enduml
```

---

## 12. SÉQUENCE — GÉNÉRATION DE PROPOSITION PAR IA

```plantuml
@startuml SEQ12_AIProposal
skinparam sequenceMessageAlign center
title Séquence — Génération de Proposition par IA (Ollama/Mistral)

actor "Freelancer" as FL
participant "Frontend\nReact" as FE
participant "AIController\n(Laravel)" as AIC
participant "Ollama API\n(localhost:11434)" as OLLAMA
database "MySQL" as DB

FL -> FE : Consulte l'offre #42\nClique "Générer avec IA"
FE -> AIC : POST /api/ai/generate-proposal\nAuthorization: Bearer {token}\n{job_id: 42}

AIC -> DB : SELECT job_postings WHERE id=42
DB --> AIC : {title:"Dev React SaaS",\n description:"...",\n skills:["React","Node.js"],\n budget_max:1500}

AIC -> DB : SELECT freelancer_profiles\nWHERE user_id = {current_user}\nWITH skills, portfolios
DB --> AIC : {title:"Développeur Full-Stack",\n hourly_rate:35,\n experience:"5 ans",\n skills:["React","Laravel","TypeScript"]}

AIC -> AIC : Construit le prompt :
note right of AIC
**Prompt envoyé à Mistral :**
"Tu es un expert en propositions freelance.
Offre : Développeur React pour SaaS
  Budget: 800$-1500$, Durée: 1-3 mois
  Compétences requises: React, Node.js

Profil freelancer :
  Titre: Développeur Full-Stack
  Expérience: 5 ans
  Compétences: React, Laravel, TypeScript

Rédige une proposition professionnelle
en français, 200-250 mots, structurée :
intro, expérience pertinente, approche,
CTA. Sois concis et convaincant."
end note

AIC -> OLLAMA : POST /api/generate\n{\n  model: "mistral",\n  prompt: "...",\n  stream: false\n}

alt Ollama disponible (succès)
  OLLAMA --> AIC : {\n  response: "Bonjour, suite à votre annonce\npour un développeur React...",\n  tokens_used: 412\n}
  AIC -> DB : INSERT INTO ai_histories {\n  user_id, type:"proposal",\n  input:{job_id:42},\n  output:{text:"Bonjour..."},\n  model:"mistral",\n  tokens_used:412\n}
  AIC --> FE : HTTP 200\n{proposal_text:"Bonjour, suite à votre\nannonce pour un développeur\nReact...", tokens_used:412}
else Ollama indisponible (fallback)
  OLLAMA --> AIC : Erreur connexion (timeout)
  AIC -> AIC : Utilise la réponse de fallback\npré-définie adaptée au contexte
  AIC --> FE : HTTP 200\n{proposal_text:"[Texte de fallback]",\n is_fallback:true}
end

FE -> FE : Pré-remplit le textarea\nde la proposition
FE --> FL : Affiche la proposition générée\navec bouton "Utiliser cette proposition"
FL -> FE : Ajuste le texte si nécessaire\nclique "Soumettre la proposition"

@enduml
```

---

## 13. SÉQUENCE — MESSAGERIE TEMPS RÉEL

```plantuml
@startuml SEQ13_Messagerie
skinparam sequenceMessageAlign center
title Séquence — Messagerie Temps Réel (Socket.IO + API)

actor "Freelancer" as FL
actor "Client" as CL
participant "Messages.jsx\n(Frontend FL)" as FE_FL
participant "Messages.jsx\n(Frontend CL)" as FE_CL
participant "Socket.IO\nServer" as SOCKET
participant "ChatController\n(Laravel)" as CHAT
database "MySQL" as DB

== Connexion WebSocket ==
FE_FL -> SOCKET : socket.connect()\nwith {token: bearer_token}
SOCKET --> FE_FL : Connected ✓
FE_FL -> SOCKET : socket.emit("join_room", {conversation_id: 7})

FE_CL -> SOCKET : socket.connect()
SOCKET --> FE_CL : Connected ✓
FE_CL -> SOCKET : socket.emit("join_room", {conversation_id: 7})

== Chargement de l'historique ==
FE_FL -> CHAT : GET /api/chat/conversations/7/messages\n?page=1&per_page=20\nAuthorization: Bearer {token}
CHAT -> DB : SELECT messages\nWHERE conversation_id=7\nORDER BY created_at DESC\nLIMIT 20 OFFSET 0
DB --> CHAT : [20 derniers messages]
CHAT --> FE_FL : HTTP 200\n{messages:[...], has_more:true}
FE_FL --> FL : Affiche les 20 derniers messages

== Envoi d'un message ==
FL -> FE_FL : Tape "Bonjour ! J'ai commencé\nles maquettes Figma."
FL -> FE_FL : Clique "Envoyer" (ou Entrée)

par [Persistance DB + Temps réel simultanés]
  FE_FL -> CHAT : POST /api/chat/conversations/7/messages\n{body:"Bonjour ! J'ai commencé...",\n type:"text"}
  CHAT -> DB : INSERT INTO messages {\n  conversation_id:7,\n  sender_id:15,\n  body:"Bonjour !...",\n  type:"text",\n  is_read:false\n}
  DB --> CHAT : message {id: 234}
  CHAT -> DB : UPDATE conversations\nSET last_message_at=NOW()\nWHERE id=7
  CHAT --> FE_FL : HTTP 201 {message:{id:234,...}}

  FE_FL -> SOCKET : socket.emit("send_message", {\n  conversation_id:7,\n  message:{id:234, body:"...", sender_id:15}\n})
  SOCKET -> FE_CL : socket.on("new_message", {message:{id:234,...}})
end

FE_FL --> FL : Message affiché côté envoi
FE_CL --> CL : Message affiché instantanément ⚡

== Marquer comme lu ==
CL -> FE_CL : Ouvre la conversation
FE_CL -> CHAT : PUT /api/chat/conversations/7/read\nAuthorization: Bearer {client_token}
CHAT -> DB : UPDATE messages\nSET is_read=true, read_at=NOW()\nWHERE conversation_id=7\nAND sender_id != 8 (client)\nAND is_read=false
DB --> CHAT : 3 messages marqués lus
CHAT --> FE_CL : HTTP 200 {read_count: 3}
FE_CL -> SOCKET : socket.emit("messages_read", {conversation_id:7})
SOCKET -> FE_FL : socket.on("messages_read") ✓
FE_FL --> FL : ✓✓ (double check = lu)

@enduml
```

---

## 14. DIAGRAMME D'ACTIVITÉ — CYCLE DE VIE COMPLET D'UNE MISSION

```plantuml
@startuml ACT14_CycleVieMission
skinparam backgroundColor #FAFAFA
skinparam activity {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
  ArrowColor #1565C0
  StartColor #2196F3
  EndColor #1565C0
}
title Diagramme d'Activité — Cycle de Vie d'une Mission Panda

|#LightBlue|Client|
|#LightGreen|Freelancer|
|#FFF9C4|Système|

|Client|
start

:Inscription / Connexion;
:Complète profil entreprise;
:Publie une offre d'emploi\n(titre, budget, compétences, délai);

|Système|
:Offre publiée → statut "open";
:Notification aux freelancers\nde la catégorie;

|Freelancer|
:Parcourt les offres;
if (Offre intéressante ?) then (Oui)
  :Consulte les détails de l'offre;
  if (Utilise l'IA ?) then (Oui)
    :Génère une proposition\nvia Ollama/Mistral;
  else (Non)
    :Rédige manuellement;
  endif
  :Définit montant et jalons;
  :Soumet la proposition\n(-2 connects);
else (Non)
  :Continue à parcourir;
  stop
endif

|Système|
:Proposition créée → statut "pending";
:Notifie le client;

|Client|
:Reçoit et examine les propositions;
if (Satisfait d'une proposition ?) then (Oui)
  :Accepte la proposition;
else (Non)
  :Rejette la ou les propositions;
  |Freelancer|
  :Notification de rejet;
  stop
endif

|Système|
:Contrat créé automatiquement;
:Autres propositions → rejetées;
:Offre → statut "in_progress";
:Conversation créée entre les deux;

|Client|
:Dépose des fonds dans le portefeuille;
:Finance l'escrow du premier jalon;

|Système|
:Milestone → statut "funded";
:Notifie le freelancer;

|Freelancer|
:Commence le travail;
repeat
  :Travaille sur le jalon;
  :Soumet le jalon terminé\n(notes + livrables);
  |Système|
  :Milestone → statut "submitted";
  :Notifie le client;
  |Client|
  :Révise le travail livré;
  if (Approuve ?) then (Oui)
    :Libère le paiement;
    |Système|
    :Déduit 10% de commission;
    :Crédite 90% au freelancer;
    :Milestone → statut "approved";
  else (Correction demandée)
    :Demande des modifications;
    |Freelancer|
    :Effectue les corrections;
  endif
repeat while (Jalons restants ?) is (Oui)
→ (Non)

|Système|
:Contrat → statut "completed";

|Client|
:Évalue le freelancer (⭐1-5);

|Freelancer|
:Évalue le client (⭐1-5);

|Système|
:Mise à jour des statistiques profil;
:avg_rating, total_jobs, total_earned;

stop

@enduml
```

---

## 15. DIAGRAMME D'ACTIVITÉ — FLUX DE PAIEMENT ESCROW

```plantuml
@startuml ACT15_FluxEscrow
title Diagramme d'Activité — Flux de Paiement Escrow
skinparam activity {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
  ArrowColor #D35400
}

|#AED6F1|Client|
|#A9DFBF|Freelancer|
|#FAD7A0|Système|

|Client|
start

:Accède à son portefeuille;
:Dépose des fonds\n(carte bancaire / virement);

|Système|
:wallet.balance += montant_dépôt;
:Transaction de type "credit"\nenregistrée;

|Client|
:Sélectionne un contrat actif;
:Choisit un jalon à financer;
:Clique "Financer l'escrow";

|Système|
if (balance >= montant_jalon ?) then (Oui)
  :wallet.balance -= montant_jalon;
  :wallet.escrow_balance += montant_jalon;
  :milestone.status = "funded";
  :Notification → Freelancer;
else (Solde insuffisant)
  :Affiche erreur "Solde insuffisant";
  |Client|
  :Dépose des fonds supplémentaires;
  backward: Retente;
endif

|Freelancer|
:Reçoit la notification\n"Jalon financé — commencez";
:Réalise le travail;
:Soumet le jalon\n(notes + fichiers livrables);

|Système|
:milestone.status = "submitted";
:Notification → Client;

|Client|
:Révise les livrables;

if (Approuve ?) then (Oui — travail satisfaisant)
  :Clique "Libérer le paiement";
  |Système|
  :commission = montant × 10%;
  :net_freelancer = montant × 90%;
  :client_wallet.escrow_balance -= montant;
  :freelancer_wallet.balance += net;
  :milestone.status = "approved";
  :2 transactions enregistrées;
  :Notifications envoyées;
  |Freelancer|
  :Reçoit les gains (90%);
else if (Demande corrections) then (Oui)
  :Envoie un message\navec les modifications demandées;
  |Freelancer|
  :Réalise les corrections;
  backward: Resoumet;
else (Litige)
  |Client|
  :Ouvre un litige;
  |Système|
  :contract.status = "disputed";
  :Alerte admin plateforme;
  :Admin arbitre manuellement;
  stop
endif

if (Autres jalons ?) then (Oui)
  |Client|
  backward: Finance le prochain jalon;
else (Non — tous les jalons terminés)
  |Système|
  :contract.status = "completed";
  stop
endif

@enduml
```

---

## 16. DIAGRAMME D'ÉTAT — OFFRE D'EMPLOI (JobPosting)

```plantuml
@startuml STATE16_JobPosting
skinparam state {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
  ArrowColor #1565C0
}
title Diagramme d'État — Offre d'Emploi (JobPosting)

[*] --> draft : Client crée\nl'offre (non publiée)

draft --> open : Client publie\nl'offre

open --> in_progress : Une proposition\nest acceptée

open --> cancelled : Client annule\nl'offre

in_progress --> completed : Contrat terminé\navec succès

in_progress --> cancelled : Client ou freelancer\nannule

open --> open : Propositions reçues\n(proposals_count++)

note right of open
  L'offre est visible
  dans le marketplace
  et accepte des
  propositions
end note

note right of in_progress
  Un contrat est actif
  Aucune nouvelle
  proposition acceptée
end note

completed --> [*]
cancelled --> [*]

@enduml
```

---

## 17. DIAGRAMME D'ÉTAT — PROPOSITION

```plantuml
@startuml STATE17_Proposal
skinparam state {
  BackgroundColor #F0FFF0
  BorderColor #27AE60
  ArrowColor #1E8449
}
title Diagramme d'État — Proposition (Proposal)

[*] --> pending : Freelancer\nsoumet

pending --> accepted : Client accepte\n→ Contrat créé

pending --> rejected : Client rejette

pending --> withdrawn : Freelancer\nretire

accepted --> [*] : Contrat actif

rejected --> [*]
withdrawn --> [*]

note right of pending
  La proposition est
  visible par le client
  et en attente de
  décision
end note

note right of accepted
  Toutes les autres
  propositions du même
  job passent en "rejected"
end note

@enduml
```

---

## 18. DIAGRAMME D'ÉTAT — CONTRAT

```plantuml
@startuml STATE18_Contract
skinparam state {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
  ArrowColor #D35400
}
title Diagramme d'État — Contrat (Contract)

[*] --> active : Proposition acceptée\nContrat créé

active --> paused : Travail suspendu\n(accord mutuel)

active --> completed : Tous jalons\napprouvés

active --> disputed : Litige ouvert\npar une partie

active --> cancelled : Annulation\nmutuellement acceptée

paused --> active : Reprise du travail

disputed --> active : Litige résolu\nen faveur du freelancer

disputed --> cancelled : Litige résolu\nen faveur du client

completed --> [*] : Évaluations\neffectuées

cancelled --> [*] : Fonds escrow\nremboursés

note right of active
  État normal d'un
  contrat en cours de
  réalisation
end note

note right of disputed
  L'admin intervient
  pour arbitrer le
  litige
end note

@enduml
```

---

## 19. DIAGRAMME D'ÉTAT — JALON (Milestone)

```plantuml
@startuml STATE19_Milestone
skinparam state {
  BackgroundColor #F5F5DC
  BorderColor #8B8000
  ArrowColor #6B6B00
}
title Diagramme d'État — Jalon (Milestone)

[*] --> pending : Contrat créé\nJalon défini

pending --> funded : Client finance\nl'escrow

funded --> submitted : Freelancer soumet\nle travail terminé

submitted --> approved : Client approuve\n→ Paiement libéré

submitted --> funded : Client demande\ndes corrections

submitted --> disputed : Litige ouvert\nsur ce jalon

disputed --> approved : Admin décide en\nfaveur du freelancer

disputed --> pending : Admin décide en\nfaveur du client\n(remboursement)

approved --> [*] : Paiement\neffectué (90%)

note right of funded
  L'argent est bloqué
  en escrow côté client.
  Le freelancer peut
  commencer à travailler.
end note

note right of submitted
  Le freelancer a livré
  son travail. Le client
  a un délai pour
  l'approuver.
end note

@enduml
```

---

## 20. DIAGRAMME DE DÉPLOIEMENT

```plantuml
@startuml DEPLOY20_Deployment
skinparam node {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
}
skinparam database {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
}
title Diagramme de Déploiement — Panda (Environnement Développement)

node "Poste Développeur\n(Windows 11)" {

  node "Navigateur Web\n(Chrome / Firefox)" {
    component "React 19\n+ Vite\nlocalhost:5173" as REACT
  }

  node "Serveur PHP\nPHP 8.2 / Artisan" {
    component "Laravel 12\nAPI REST\nlocalhost:8000" as LARAVEL
    component "Sanctum\n(Auth Tokens)" as SANCTUM
    component "Socialite\n(Google OAuth)" as SOCIALITE
  }

  node "Serveur Base de Données\nMySQL 8.0" {
    database "panda_db\n(19 tables)" as DB
  }

  node "Serveur IA\nOllama" {
    component "Mistral 7B\nlocalhost:11434" as OLLAMA
  }

  node "Serveur WebSocket\nSocket.IO" {
    component "Socket.IO Server\nlocalhost:3001" as SOCKETIO
  }
}

cloud "Services Externes" {
  node "Google Cloud" {
    component "Google OAuth 2.0\naccounts.google.com" as GOOGLE_OAUTH
  }
  node "Stripe" {
    component "Stripe API\napi.stripe.com" as STRIPE_API
  }
}

REACT -down-> LARAVEL : HTTP/REST\nAxios\nBearer Token
REACT -down-> SOCKETIO : WebSocket\nSocket.IO Client
LARAVEL -down-> DB : SQL\nEloquent ORM
LARAVEL -right-> OLLAMA : HTTP POST\n/api/generate
LARAVEL -up-> GOOGLE_OAUTH : OAuth2 Flow\nSocialite
LARAVEL -up-> STRIPE_API : Paiements\nStripe SDK

note bottom of OLLAMA
  Modèle Mistral 7B
  tourne localement
  (4GB RAM requis)
  Fallback si indisponible
end note

note bottom of DB
  19 tables
  ~200 colonnes
  Migrations versionnées
end note

@enduml
```

---

## 21. DIAGRAMME DE COMPOSANTS

```plantuml
@startuml COMP21_Components
skinparam component {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
  ArrowColor #1565C0
}
title Diagramme de Composants — Panda

package "Frontend React" {
  package "Pages" {
    [Landing.jsx] as LANDING
    [Login.jsx / Register.jsx] as AUTH_PAGES
    [Onboarding.jsx] as ONBOARD_PAGE
    [JobsMarketplace.jsx] as JOBS_PAGE
    [JobDetail.jsx] as JOB_DETAIL
    [FreelancerDashboard.jsx] as FL_DASH
    [ClientDashboard.jsx] as CL_DASH
    [AdminDashboard.jsx] as ADM_DASH
    [Messages.jsx] as MSG_PAGE
    [Payments.jsx] as PAY_PAGE
    [AIAssistant.jsx] as AI_PAGE
    [FreelancerProfile.jsx] as PROFILE_PAGE
  }

  package "Composants UI" {
    [GlobalNavbar.jsx] as NAVBAR
    [AuthScene3D.jsx] as SCENE3D
    [NotificationPanel.jsx] as NOTIF
    [NavSearch.jsx] as SEARCH_COMP
    [UserAvatar.jsx] as AVATAR
    [PandaLogo.jsx] as LOGO
  }

  package "State Management" {
    [Zustand Store\n(auth, jobs, chat)] as STORE
    [AuthContext.jsx] as AUTH_CTX
  }

  package "API Layer" {
    [Axios Instance\n(baseURL + interceptors)] as AXIOS
  }
}

package "Backend Laravel" {
  package "Controllers" {
    [AuthController] as AUTH_CTRL
    [JobController] as JOB_CTRL
    [ProposalController] as PROP_CTRL
    [FreelancerController] as FL_CTRL
    [ChatController] as CHAT_CTRL
    [PaymentController] as PAY_CTRL
    [AIController] as AI_CTRL
    [ReviewController] as REV_CTRL
    [AdminController] as ADM_CTRL
    [NotificationController] as NOTIF_CTRL
  }

  package "Middleware" {
    [auth:sanctum] as SANCTUM_MID
    [role:freelancer] as ROLE_FL
    [role:client] as ROLE_CL
    [role:admin] as ROLE_ADM
  }

  package "Models Eloquent" {
    [User] as U_MODEL
    [JobPosting] as JP_MODEL
    [Proposal] as PROP_MODEL
    [Contract + Milestone] as CONTRACT_MODEL
    [Wallet + Transaction] as WALLET_MODEL
    [Conversation + Message] as MSG_MODEL
  }
}

package "Externe" {
  [MySQL 8.0] as MYSQL
  [Ollama / Mistral] as OLLAMA_EXT
  [Google OAuth] as GOOGLE_EXT
  [Socket.IO] as SOCKET_EXT
}

' Connexions Frontend → Backend
AXIOS --> AUTH_CTRL
AXIOS --> JOB_CTRL
AXIOS --> PROP_CTRL
AXIOS --> FL_CTRL
AXIOS --> CHAT_CTRL
AXIOS --> PAY_CTRL
AXIOS --> AI_CTRL
AXIOS --> NOTIF_CTRL

' Connexions Pages → Composants
AUTH_PAGES --> SCENE3D
JOBS_PAGE --> NAVBAR
JOBS_PAGE --> SEARCH_COMP
FL_DASH --> NAVBAR
FL_DASH --> NOTIF

' Connexions State
AUTH_PAGES --> AUTH_CTX
AUTH_CTX --> AXIOS
STORE --> AXIOS

' Middleware
AUTH_CTRL --> SANCTUM_MID
JOB_CTRL --> SANCTUM_MID
FL_CTRL --> ROLE_FL
PAY_CTRL --> ROLE_CL
ADM_CTRL --> ROLE_ADM

' Models → DB
U_MODEL --> MYSQL
JP_MODEL --> MYSQL
CONTRACT_MODEL --> MYSQL
WALLET_MODEL --> MYSQL
MSG_MODEL --> MYSQL

' External
AI_CTRL --> OLLAMA_EXT
AUTH_CTRL --> GOOGLE_EXT
MSG_PAGE --> SOCKET_EXT

@enduml
```

---

## RÉCAPITULATIF FINAL

| # | Diagramme | Couverture |
|---|-----------|-----------|
| 1 | Use Case Global | Tous acteurs, tous modules |
| 2 | Use Case Freelancer | Détail complet des fonctions |
| 3 | Use Case Client | Détail complet des fonctions |
| 4 | Use Case Admin | Gestion plateforme |
| 5 | Diagramme de Classes | 17 classes, toutes relations |
| 6 | ERD | 19 tables SQL avec types |
| 7 | Séquence Inscription+Onboarding | Flux complet 6 étapes |
| 8 | Séquence OAuth Google | Flux Socialite complet |
| 9 | Séquence Job+Proposition | Publication et soumission |
| 10 | Séquence Acceptation+Contrat | Création auto du contrat |
| 11 | Séquence Escrow | 4 phases de paiement |
| 12 | Séquence IA | Génération proposition Ollama |
| 13 | Séquence Messagerie | Socket.IO + persistance |
| 14 | Activité Cycle de vie | Mission de A à Z |
| 15 | Activité Escrow | Flux paiement détaillé |
| 16 | État JobPosting | 5 états de l'offre |
| 17 | État Proposal | 4 états de la proposition |
| 18 | État Contract | 5 états du contrat |
| 19 | État Milestone | 6 états du jalon |
| 20 | Déploiement | Architecture serveurs |
| 21 | Composants | Architecture logicielle |

---

> **Rendu en ligne :** [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)
> **Extension VS Code :** `jebbs.plantuml` → Ctrl+Shift+P → "Preview Current Diagram"
