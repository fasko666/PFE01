"""
Genere les diagrammes UML FreeNest en images PNG via PlantUML
"""
import os, subprocess

BASE    = r"C:\Users\Pro\Desktop\PFE O1\documentation"
UML_DIR = os.path.join(BASE, "uml_diagrams")
os.makedirs(UML_DIR, exist_ok=True)
PLANTUML = os.path.join(BASE, "plantuml.jar")

DIAGRAMS = {

"01_use_case_global": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam actorStyle awesome
skinparam usecase {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
}
skinparam packageStyle rectangle
left to right direction
title Use Case -- FreeNest (Vue Globale)

actor "Freelancer" as FL #LightGreen
actor "Client"     as CL #LightBlue
actor "Admin"      as ADM #LightCoral
actor "Google OAuth" as G <<external>>
actor "Ollama IA"    as AI <<external>>

rectangle "FreeNest" {
  package "Authentification" {
    (S'inscrire) as REG
    (Se connecter) as LOGIN
    (OAuth Google) as GOAUTH
    (Onboarding) as ONBOARD
  }
  package "Marketplace Offres" {
    (Publier une offre) as POST
    (Parcourir les offres) as BROWSE
    (Rechercher offres) as SEARCH
    (Sauvegarder offre) as SAVE
  }
  package "Propositions & Contrats" {
    (Soumettre proposition) as SUBMIT
    (Generer via IA) as AIPR
    (Accepter / Rejeter) as ACCEPT
    (Gerer les jalons) as MILE
  }
  package "Paiements Escrow" {
    (Deposer des fonds) as DEP
    (Financer l'escrow) as ESC
    (Liberer paiement) as REL
    (Portefeuille) as WAL
  }
  package "Communication" {
    (Messagerie temps reel) as MSG
    (Notifications) as NOTIF
  }
  package "IA Assistant" {
    (Generation proposition) as GEN
    (Matching freelancers) as MATCH
    (Analyser profil) as ANAL
    (Chat IA) as CHAT
  }
  package "Administration" {
    (Dashboard admin) as DASH
    (Gerer utilisateurs) as USERS
    (Analytics) as ANALY
  }
}

FL --> REG
FL --> LOGIN
FL --> GOAUTH
FL --> ONBOARD
FL --> BROWSE
FL --> SEARCH
FL --> SAVE
FL --> SUBMIT
FL --> AIPR
FL --> MILE
FL --> WAL
FL --> MSG
FL --> GEN
FL --> ANAL
FL --> CHAT

CL --> REG
CL --> LOGIN
CL --> POST
CL --> ACCEPT
CL --> MILE
CL --> DEP
CL --> ESC
CL --> REL
CL --> MSG
CL --> MATCH

ADM --> DASH
ADM --> USERS
ADM --> ANALY

GOAUTH ..> G  : <<uses>>
AIPR   ..> AI : <<uses>>
MATCH  ..> AI : <<uses>>
GEN    ..> AI : <<uses>>
@enduml
""",

"02_use_case_freelancer": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam actorStyle awesome
skinparam usecase {
  BackgroundColor #E8F8E8
  BorderColor #27AE60
}
left to right direction
title Use Case -- Freelancer (Detail)

actor "Freelancer" as FL #LightGreen

rectangle "Espace Freelancer" {
  package "Compte et Profil" {
    (S'inscrire par email) as REG
    (Connexion Google) as GOOGLE
    (Onboarding 5 etapes) as OB
    (Modifier profil) as EDIT
    (Upload photo) as PHOTO
  }
  package "Portfolio et Competences" {
    (Ajouter projet portfolio) as PORT
    (Modifier projet) as EDITP
    (Gerer competences) as SKILL
    (Definir niveaux) as LEVEL
  }
  package "Marketplace" {
    (Parcourir les offres) as BROWSE
    (Filtrer par categorie) as FCAT
    (Filtrer par budget) as FBUD
    (Consulter une offre) as VIEW
    (Sauvegarder offre) as SAVE
  }
  package "Propositions" {
    (Soumettre proposition) as SUB
    (Generer via IA) as AI
    (Definir jalons) as MIL
    (Voir mes propositions) as MYPROP
    (Retirer proposition) as WITHD
  }
  package "Missions et Finance" {
    (Voir mes contrats) as CONTRACT
    (Soumettre jalon termine) as SUBM
    (Consulter portefeuille) as WAL
    (Retirer mes gains) as CASH
  }
  package "IA" {
    (Analyser mon profil) as ANAL
    (Chat assistant IA) as CHAT
  }
}

FL --> REG
FL --> GOOGLE
FL --> OB
FL --> EDIT
FL --> PHOTO
FL --> PORT
FL --> EDITP
FL --> SKILL
FL --> LEVEL
FL --> BROWSE
FL --> FCAT
FL --> FBUD
FL --> VIEW
FL --> SAVE
FL --> SUB
FL --> AI
FL --> MIL
FL --> MYPROP
FL --> WITHD
FL --> CONTRACT
FL --> SUBM
FL --> WAL
FL --> CASH
FL --> ANAL
FL --> CHAT

SUB .> AI  : <<extend>>
SUB .> MIL : <<include>>
@enduml
""",

"03_use_case_client": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam actorStyle awesome
skinparam usecase {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
}
left to right direction
title Use Case -- Client (Detail)

actor "Client" as CL #LightBlue

rectangle "Espace Client" {
  package "Compte" {
    (S'inscrire) as REG
    (Se connecter) as LOGIN
    (Profil entreprise) as CPRO
  }
  package "Gestion Offres" {
    (Creer une offre) as CREATE
    (Definir budget et comp.) as SETDET
    (Publier l'offre) as PUB
    (Modifier offre) as EDIT
    (Voir mes offres) as MYJOBS
    (Cloturer offre) as CLOSE
  }
  package "Recrutement" {
    (Parcourir freelancers) as BROWSE
    (Voir profil freelancer) as VIEW
    (Voir portfolio) as PORT
    (Consulter propositions) as PROPS
    (Accepter proposition) as ACCEPT
    (Rejeter proposition) as REJECT
    (Matching IA) as MATCH
  }
  package "Contrats et Jalons" {
    (Creer contrat) as CON
    (Definir jalons) as DEFMIL
    (Reviser le travail) as REV
    (Approuver jalon) as APR
    (Demander corrections) as CORR
    (Ouvrir un litige) as DISP
  }
  package "Finance" {
    (Deposer des fonds) as DEP
    (Financer l'escrow) as ESC
    (Liberer paiement) as REL
    (Historique transactions) as HIST
  }
  package "Communication" {
    (Messagerie) as MSG
    (Evaluer freelancer) as REVI
  }
}

CL --> REG
CL --> LOGIN
CL --> CPRO
CL --> CREATE
CL --> SETDET
CL --> PUB
CL --> EDIT
CL --> MYJOBS
CL --> CLOSE
CL --> BROWSE
CL --> VIEW
CL --> PORT
CL --> PROPS
CL --> ACCEPT
CL --> REJECT
CL --> MATCH
CL --> CON
CL --> DEFMIL
CL --> REV
CL --> APR
CL --> CORR
CL --> DISP
CL --> DEP
CL --> ESC
CL --> REL
CL --> HIST
CL --> MSG
CL --> REVI

ACCEPT .> CON : <<include>>
APR    .> REL : <<include>>
@enduml
""",

"04_class_diagram": """
@startuml
skinparam classAttributeIconSize 0
skinparam classFontSize 10
skinparam linetype ortho
skinparam backgroundColor #FAFAFA
skinparam class {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
  HeaderBackgroundColor #2196F3
  HeaderFontColor white
}
title Diagramme de Classes -- FreeNest

class User {
  +id: int
  +name: string
  +email: string
  +role: enum[freelancer|client|admin]
  +avatar: string
  +is_verified: boolean
  +google_id: string
}

class FreelancerProfile {
  +title: string
  +bio: text
  +hourly_rate: decimal
  +experience_level: enum
  +avg_rating: decimal
  +total_jobs: int
  +total_earned: decimal
  +is_top_rated: boolean
  +category: string
}

class ClientProfile {
  +company_name: string
  +industry: string
  +total_spent: decimal
  +payment_verified: boolean
}

class Category {
  +name: string
  +slug: string
  +parent_id: int
}

class Skill {
  +name: string
  +slug: string
  +category_id: int
}

class Portfolio {
  +title: string
  +project_url: string
  +images: json
  +is_featured: boolean
}

class JobPosting {
  +title: string
  +description: text
  +type: enum[hourly|fixed]
  +budget_min: decimal
  +budget_max: decimal
  +status: enum
  +proposals_count: int
}

class Proposal {
  +cover_letter: text
  +bid_amount: decimal
  +status: enum
  +is_ai_generated: boolean
  +connects_used: int
}

class Contract {
  +title: string
  +type: enum
  +amount: decimal
  +escrow_amount: decimal
  +status: enum
  +deadline_at: timestamp
}

class Milestone {
  +title: string
  +amount: decimal
  +status: enum
  +due_at: timestamp
  +submitted_at: timestamp
  +approved_at: timestamp
}

class Review {
  +rating: decimal
  +comment: text
  +breakdown: json
}

class Wallet {
  +balance: decimal
  +pending_balance: decimal
  +escrow_balance: decimal
}

class Transaction {
  +type: enum[credit|escrow|debit]
  +amount: decimal
  +fee: decimal
  +status: enum
}

class Conversation {
  +type: enum[direct|group]
}

class Message {
  +body: text
  +type: enum[text|file|image]
  +is_read: boolean
}

class AiHistory {
  +type: enum
  +input: json
  +output: json
  +tokens_used: int
}

User "1" *-- "0..1" FreelancerProfile : possede >
User "1" *-- "0..1" ClientProfile     : possede >
User "1" *-- "1"    Wallet            : a >
User "1" o-- "N"    Portfolio         : publie >
User "N" -- "N"     Skill
User "N" -- "N"     Conversation

User "1" o-- "N" JobPosting
User "1" o-- "N" Proposal
User "1" o-- "N" AiHistory

JobPosting "N" o-- "1" Category
JobPosting "1" o-- "N" Proposal

Proposal "0..1" --> "1" Contract : genere >

Contract "1" *-- "N" Milestone : contient >
Contract "1" o-- "N" Review    : evalue >

Wallet "1" *-- "N" Transaction : enregistre >

Conversation "1" *-- "N" Message : contient >
@enduml
""",

"05_erd": """
@startuml
skinparam backgroundColor #FFFDF0
skinparam class {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
  HeaderBackgroundColor #E67E22
  HeaderFontColor white
}
skinparam linetype ortho
title ERD -- FreeNest (19 tables)

entity "users" as U {
  * id: INT <<PK>>
  --
  name: VARCHAR
  email: VARCHAR UNIQUE
  role: ENUM
  google_id: VARCHAR
}

entity "freelancer_profiles" as FP {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  title: VARCHAR
  hourly_rate: DECIMAL
  avg_rating: DECIMAL
}

entity "client_profiles" as CP {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  company_name: VARCHAR
  total_spent: DECIMAL
}

entity "categories" as CAT {
  * id: INT <<PK>>
  --
  parent_id: INT <<FK>>
  name: VARCHAR
  slug: VARCHAR
}

entity "skills" as SK {
  * id: INT <<PK>>
  --
  category_id: INT <<FK>>
  name: VARCHAR
}

entity "job_postings" as JP {
  * id: INT <<PK>>
  --
  client_id: INT <<FK>>
  category_id: INT <<FK>>
  title: VARCHAR
  budget_min: DECIMAL
  status: ENUM
}

entity "proposals" as PR {
  * id: INT <<PK>>
  --
  job_id: INT <<FK>>
  freelancer_id: INT <<FK>>
  bid_amount: DECIMAL
  status: ENUM
}

entity "contracts" as CO {
  * id: INT <<PK>>
  --
  job_id: INT <<FK>>
  proposal_id: INT <<FK>>
  client_id: INT <<FK>>
  freelancer_id: INT <<FK>>
  amount: DECIMAL
  status: ENUM
}

entity "milestones" as MI {
  * id: INT <<PK>>
  --
  contract_id: INT <<FK>>
  title: VARCHAR
  amount: DECIMAL
  status: ENUM
}

entity "reviews" as RV {
  * id: INT <<PK>>
  --
  contract_id: INT <<FK>>
  reviewer_id: INT <<FK>>
  rating: DECIMAL
}

entity "wallets" as WA {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  balance: DECIMAL
  escrow_balance: DECIMAL
}

entity "transactions" as TR {
  * id: INT <<PK>>
  --
  wallet_id: INT <<FK>>
  type: ENUM
  amount: DECIMAL
  fee: DECIMAL
}

entity "conversations" as CV {
  * id: INT <<PK>>
  --
  type: ENUM
  contract_id: INT <<FK>>
}

entity "messages" as MSG {
  * id: INT <<PK>>
  --
  conversation_id: INT <<FK>>
  sender_id: INT <<FK>>
  body: TEXT
}

entity "ai_histories" as AI {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  type: ENUM
  tokens_used: INT
}

U ||--o| FP  : "1..1"
U ||--o| CP  : "1..1"
U ||--|| WA  : "1..1"
U ||--o{ JP  : "publie"
U ||--o{ PR  : "soumet"
U ||--o{ AI  : "genere"

CAT ||--o{ JP : "categorise"
CAT ||--o{ SK : "groupe"

JP ||--o{ PR : "recoit"
PR ||--o| CO : "genere"

CO ||--o{ MI : "contient"
CO ||--o{ RV : "evalue"

WA ||--o{ TR : "enregistre"

CV ||--o{ MSG : "contient"
@enduml
""",

"06_sequence_inscription": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center
skinparam sequence {
  ArrowColor #2196F3
  ParticipantBackgroundColor #EBF5FB
  ParticipantBorderColor #2196F3
}
title Sequence -- Inscription et Onboarding Freelancer

actor "Freelancer" as FL
participant "React Frontend" as FE
participant "AuthController" as AUTH
participant "FreelancerController" as FC
database "MySQL" as DB

== Inscription ==
FL -> FE : Formulaire {nom, email, password, role:"freelancer"}
FE -> AUTH : POST /api/auth/register
AUTH -> DB : INSERT users + INSERT freelancer_profiles
DB --> AUTH : user {id:12}
AUTH -> AUTH : createToken()
AUTH --> FE : HTTP 201 {token, user}
FE --> FL : Redirection /onboarding

== Onboarding 5 etapes ==
FL -> FE : Etape 1 : Categorie + specialites
FL -> FE : Etape 2 : Niveau experience
FL -> FE : Etape 3 : Formation
FL -> FE : Etape 4 : Disponibilite + tarif horaire
FL -> FE : Etape 5 : Photo + langues

FE -> FC : PUT /api/freelancer/onboarding\n{category, hourly_rate, languages...}
FC -> DB : UPDATE freelancer_profiles
DB --> FC : OK
FC --> FE : HTTP 200 {profile complet}
FE --> FL : Tableau de bord freelancer
@enduml
""",

"07_sequence_oauth": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center
title Sequence -- Connexion Google OAuth

actor "Utilisateur" as USR
participant "Frontend" as FE
participant "AuthController" as AUTH
participant "Google OAuth" as GOOGLE
database "MySQL" as DB

USR -> FE : Clique "Continuer avec Google"
FE -> AUTH : GET /auth/google/redirect
AUTH -> GOOGLE : Socialite redirect
GOOGLE --> USR : Page consentement Google

USR -> GOOGLE : Autorise l'application
GOOGLE -> AUTH : Callback ?code=xxx

AUTH -> GOOGLE : Echange code vers access_token
GOOGLE --> AUTH : {id, name, email, picture}

AUTH -> DB : SELECT user WHERE google_id=X OR email=Y

alt Utilisateur existant
  DB --> AUTH : User trouve
  AUTH -> DB : UPDATE last_seen_at
else Nouvel utilisateur
  DB --> AUTH : NULL
  AUTH -> DB : INSERT users + INSERT freelancer_profiles
end

AUTH -> AUTH : user->createToken()
AUTH --> FE : Redirect /auth/callback?token=xxx
FE -> FE : Stocke token localStorage
FE --> USR : Connecte - Dashboard
@enduml
""",

"08_sequence_escrow": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center
title Sequence -- Paiement Escrow (4 phases)

actor "Client" as CL
actor "Freelancer" as FL
participant "Frontend" as FE
participant "PaymentController" as PAY
database "MySQL" as DB

== Phase 1 : Depot de fonds ==
CL -> FE : Depose 1500$
FE -> PAY : POST /api/payments/deposit
PAY -> DB : wallet.balance += 1500
PAY --> FE : {balance: 1500$}

== Phase 2 : Financement escrow ==
CL -> FE : Finance jalon 1 (300$)
FE -> PAY : POST /api/payments/fund-escrow
PAY -> DB : wallet.balance -= 300\nwallet.escrow += 300\nmilestone.status = 'funded'
PAY --> FE : Escrow finance
FE --> FL : Jalon finance - commencez !

== Phase 3 : Livraison ==
FL -> FE : Soumet jalon termine
FE -> PAY : PUT /api/milestones/{id}/submit
PAY -> DB : milestone.status = 'submitted'
FE --> CL : Revision requise !

== Phase 4 : Liberation du paiement ==
CL -> FE : Approuve le travail
FE -> PAY : POST /api/payments/release-milestone
note right : commission = 300 x 10% = 30$\nnet freelancer = 270$
PAY -> DB : BEGIN TRANSACTION\nclient.escrow -= 300\nfreelancer.balance += 270\nmilestone.status = 'approved'\nCOMMIT
PAY --> FE : {net_received: 270$}
FE --> FL : +270$ credites !
@enduml
""",

"09_sequence_ia": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center
title Sequence -- Generation de Proposition par IA

actor "Freelancer" as FL
participant "Frontend" as FE
participant "AIController" as AIC
participant "Ollama Mistral 7B" as OLLAMA
database "MySQL" as DB

FL -> FE : Clique "Generer avec IA" sur offre #42
FE -> AIC : POST /api/ai/generate-proposal {job_id:42}

AIC -> DB : SELECT job_postings WHERE id=42
DB --> AIC : {title, description, skills, budget}

AIC -> DB : SELECT freelancer_profiles (current user)
DB --> AIC : {title, experience, skills, hourly_rate}

AIC -> AIC : Construit le prompt structure :
note right of AIC
  "Tu es expert en propositions freelance.
   Offre: Dev React SaaS - Budget 800-1500$
   Profil: Full-Stack 5 ans - 35$/h
   Redige une proposition pro en francais,
   200-250 mots. Sois convaincant."
end note

AIC -> OLLAMA : POST /api/generate {model:'mistral', prompt}

alt Ollama disponible
  OLLAMA --> AIC : {response: "Bonjour...", tokens: 412}
  AIC -> DB : INSERT ai_histories {tokens: 412}
  AIC --> FE : HTTP 200 {proposal_text}
else Ollama indisponible (fallback)
  OLLAMA --> AIC : Erreur connexion
  AIC --> FE : HTTP 200 {proposal_text: fallback, is_fallback:true}
end

FE --> FL : Proposition pre-remplie
FL -> FE : Ajuste et soumet
@enduml
""",

"10_sequence_contrat": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center
title Sequence -- Acceptation Proposition et Creation Contrat

actor "Client" as CL
actor "Freelancer" as FL
participant "Frontend" as FE
participant "ProposalController" as PC
participant "ChatController" as CC
database "MySQL" as DB

CL -> FE : Consulte les propositions recues
FE -> PC : GET /api/jobs/42/proposals
PC -> DB : SELECT proposals WITH freelancer_profiles
DB --> PC : Liste des propositions
PC --> FE : HTTP 200 {proposals}

CL -> FE : Accepte la proposition #89
FE -> PC : POST /api/proposals/89/accept

PC -> DB : BEGIN TRANSACTION
PC -> DB : UPDATE proposals SET status='accepted' WHERE id=89
PC -> DB : UPDATE proposals SET status='rejected' WHERE job_id=42 AND id!=89
PC -> DB : UPDATE job_postings SET status='in_progress' WHERE id=42

PC -> DB : INSERT contracts {\n  job_id:42, proposal_id:89,\n  client_id:8, freelancer_id:15,\n  amount:1200, status:'active'\n}
DB --> PC : contract {id:33}

PC -> DB : INSERT milestones []\n(depuis proposal.milestones JSON)

PC -> DB : COMMIT

PC -> CC : createConversation(contract_id:33, [8,15])
CC -> DB : INSERT conversations + participants

PC -> DB : INSERT notifications []\n(client + freelancer)

PC --> FE : HTTP 200 {contract, conversation_id}
FE --> CL : Contrat #33 cree !
FE --> FL : Proposition acceptee - Contrat cree !
@enduml
""",

"11_activity_cycle": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam activity {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
  ArrowColor #1565C0
}
title Activite -- Cycle de Vie d'une Mission FreeNest

|#AED6F1|Client|
|#A9DFBF|Freelancer|
|#FAD7A0|Systeme|

|Client|
start
:Publie une offre d'emploi;

|Systeme|
:Offre statut = "open";
:Notifie les freelancers;

|Freelancer|
:Browse les offres;
if (Interesse ?) then (Oui)
  if (Utilise IA ?) then (Oui)
    :Generation IA de la proposition;
  else (Non)
    :Redige manuellement;
  endif
  :Soumet la proposition;
else (Non)
  stop
endif

|Systeme|
:Proposition = "pending";
:Notifie le client;

|Client|
:Examine les propositions;
if (Accepte ?) then (Oui)
  :Accepte la proposition;
else (Non)
  stop
endif

|Systeme|
:Contrat cree automatiquement;
:Conversation ouverte;

|Client|
:Finance l'escrow du 1er jalon;

|Freelancer|
:Realise le travail;
:Soumet le jalon;

|Client|
:Revise les livrables;
if (Approuve ?) then (Oui)
  :Libere le paiement;
  |Systeme|
  :Freelancer recoit 90%;
  :Commission 10% plateforme;
  if (Jalons restants ?) then (Oui)
    |Client|
    backward: Finance prochain jalon;
  else (Non)
    :Contrat = "completed";
    :Echange des avis;
    stop
  endif
else (Corrections)
  |Freelancer|
  backward: Corrige et resoumet;
endif
@enduml
""",

"12_activity_escrow": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam activity {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
  ArrowColor #D35400
}
title Activite -- Flux de Paiement Escrow

|#AED6F1|Client|
|#A9DFBF|Freelancer|
|#FAD7A0|Systeme|

|Client|
start

:Accede a son portefeuille;
:Depose des fonds;

|Systeme|
:wallet.balance += montant;
:Transaction credit enregistree;

|Client|
:Selectionne un jalon a financer;
:Clique "Financer l'escrow";

|Systeme|
if (balance >= montant ?) then (Oui)
  :wallet.balance -= montant;
  :wallet.escrow_balance += montant;
  :milestone.status = "funded";
else (Non)
  :Erreur "Solde insuffisant";
  |Client|
  backward: Depose plus de fonds;
endif

|Freelancer|
:Realise le travail;
:Soumet le jalon;

|Systeme|
:milestone.status = "submitted";
:Notifie le client;

|Client|
:Revise les livrables;
if (Approuve ?) then (Oui)
  :Libere le paiement;
  |Systeme|
  :commission = montant x 10%;
  :client.escrow -= montant;
  :freelancer.balance += 90%;
  :2 transactions enregistrees;
  stop
else if (Corrections) then (Oui)
  |Freelancer|
  backward: Corrige et resoumet;
else (Litige)
  |Systeme|
  :contract.status = "disputed";
  :Alerte admin;
  stop
endif
@enduml
""",

"13_state_job": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam state {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
  ArrowColor #1565C0
}
title Etats d'une Offre d'Emploi (JobPosting)

[*] --> draft : Client cree l'offre

draft --> open : Client publie

open --> in_progress : Proposition acceptee\\nContrat cree

open --> cancelled : Client annule

in_progress --> completed : Tous jalons approuves

in_progress --> cancelled : Annulation mutuelle

completed --> [*]
cancelled --> [*]

note right of open
  Visible dans
  le marketplace
  - accepte des
  propositions
end note
@enduml
""",

"14_state_proposal": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam state {
  BackgroundColor #F0FFF0
  BorderColor #27AE60
  ArrowColor #1E8449
}
title Etats d'une Proposition

[*] --> pending : Freelancer soumet

pending --> accepted : Client accepte\\n(Contrat cree)
pending --> rejected : Client rejette
pending --> withdrawn : Freelancer retire

accepted --> [*]
rejected --> [*]
withdrawn --> [*]

note right of accepted
  Toutes les autres
  propositions du meme
  job passent a "rejected"
end note
@enduml
""",

"15_state_contract": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam state {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
  ArrowColor #D35400
}
title Etats d'un Contrat

[*] --> active : Proposition acceptee

active --> paused    : Travail suspendu
active --> completed : Tous jalons approuves
active --> disputed  : Litige ouvert
active --> cancelled : Annulation acceptee

paused --> active : Reprise du travail

disputed --> active    : Litige resolu (freelancer)
disputed --> cancelled : Litige resolu (client)

completed --> [*]
cancelled --> [*]
@enduml
""",

"16_state_milestone": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam state {
  BackgroundColor #F0E6FF
  BorderColor #8E44AD
  ArrowColor #7D3C98
}
title Etats d'un Jalon (Milestone)

[*] --> pending : Contrat cree

pending   --> funded    : Client finance l'escrow
funded    --> submitted : Freelancer soumet le travail
submitted --> approved  : Client approuve\\n-> Paiement libere
submitted --> funded    : Client demande corrections
submitted --> disputed  : Litige ouvert

disputed  --> approved  : Admin - freelancer gagne
disputed  --> pending   : Admin - remboursement client

approved --> [*] : 90% au freelancer

note right of funded
  Argent bloque
  en escrow
end note
@enduml
""",

"17_deployment": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam node {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
}
skinparam database {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
}
title Diagramme de Deploiement -- FreeNest

node "Poste Developpeur (Windows 11)" {
  node "Navigateur Web" {
    component "React 19 + Vite\\nlocalhost:5173" as REACT
  }
  node "PHP 8.2 / Artisan" {
    component "Laravel 12 API\\nlocalhost:8000" as LARAVEL
    component "Sanctum\\n+ Socialite" as AUTH
  }
  node "MySQL 8.0" {
    database "freenest_db\\n19 tables" as DB
  }
  node "Ollama" {
    component "Mistral 7B\\nlocalhost:11434" as OLLAMA
  }
  node "Node.js" {
    component "Socket.IO\\nlocalhost:3001" as SOCKET
  }
}

cloud "Services Externes" {
  component "Google OAuth 2.0" as GOOGLE
  component "Stripe API" as STRIPE
}

REACT -down-> LARAVEL : REST API\\nBearer Token
REACT -down-> SOCKET  : WebSocket\\nSocket.IO
LARAVEL -down-> DB     : SQL / Eloquent
LARAVEL -right-> OLLAMA : HTTP POST
LARAVEL -up-> GOOGLE  : OAuth2
LARAVEL -up-> STRIPE  : Paiements
@enduml
""",

}

ok = fail = 0
for name, src in DIAGRAMS.items():
    puml_path = os.path.join(UML_DIR, f"{name}.puml")
    with open(puml_path, "w", encoding="utf-8") as f:
        f.write(src.strip())
    result = subprocess.run(
        ["java", "-jar", PLANTUML, "-tpng", "-charset", "UTF-8", puml_path],
        capture_output=True, text=True
    )
    png_path = puml_path.replace(".puml", ".png")
    if os.path.exists(png_path):
        print("OK: " + name + ".png")
        ok += 1
    else:
        print("FAIL: " + name + " | " + result.stderr[:150])
        fail += 1

print("\nTotal: " + str(ok) + " OK / " + str(fail) + " FAILED")
