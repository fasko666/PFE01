"""
Genere les diagrammes UML FreeNest en images PNG via PlantUML — version maj. juin 2026
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
title Use Case Global -- FreeNest (Vue Complete)

actor "Freelancer" as FL #LightGreen
actor "Client"     as CL #LightBlue
actor "Admin"      as ADM #LightCoral
actor "Google OAuth" as G <<external>>
actor "Ollama IA"    as AI <<external>>
actor "Stripe"       as ST <<external>>

rectangle "FreeNest" {
  package "Authentification & Securite" {
    (S'inscrire) as REG
    (Se connecter) as LOGIN
    (OAuth Google) as GOAUTH
    (Reset mot de passe) as RESET
    (2FA TOTP) as TFA
    (Onboarding 5 etapes) as ONBOARD
    (KYC / Identite) as KYC
  }
  package "Marketplace" {
    (Publier une offre) as POST
    (Parcourir les offres) as BROWSE
    (Recherche globale) as SEARCH
    (Catalogue services) as CATALOG
  }
  package "Propositions & Contrats" {
    (Soumettre proposition) as SUBMIT
    (Generer via IA) as AIPR
    (Accepter / Rejeter) as ACCEPT
    (Gerer les jalons) as MILE
    (Suivi du temps) as TIMER
    (Extension contrat) as EXT
  }
  package "Paiements & Finance" {
    (Deposer via Stripe) as DEP
    (Financer l'escrow) as ESC
    (Liberer paiement) as REL
    (Retirer gains) as WITHD
    (Abonnement plan) as PLAN
  }
  package "Communication" {
    (Messagerie temps reel) as MSG
    (Reactions / Lecture) as REACT
    (Notifications Push) as PUSH
  }
  package "IA & Recherche" {
    (Generation proposition) as GEN
    (Matching freelancers) as MATCH
    (Analyser profil) as ANAL
    (Chat IA) as CHAT
    (Recherche intelligente) as SMART
  }
  package "Agences & Talents" {
    (Creer agence) as AGENCY
    (Inviter membre) as INVITE
    (Listes talents) as TLIST
    (Sauvegarder freelancer) as SFREQ
  }
  package "Administration" {
    (Dashboard admin) as DASH
    (Gerer KYC) as AKYD
    (Finance admin) as AFIN
    (Moderer catalogue) as ACAT
    (Gerer utilisateurs) as USERS
  }
}

FL --> REG
FL --> LOGIN
FL --> GOAUTH
FL --> RESET
FL --> TFA
FL --> ONBOARD
FL --> KYC
FL --> BROWSE
FL --> SEARCH
FL --> SUBMIT
FL --> AIPR
FL --> MILE
FL --> TIMER
FL --> WITHD
FL --> MSG
FL --> REACT
FL --> GEN
FL --> ANAL
FL --> CHAT
FL --> SMART
FL --> CATALOG
FL --> AGENCY
FL --> INVITE

CL --> REG
CL --> LOGIN
CL --> POST
CL --> ACCEPT
CL --> MILE
CL --> EXT
CL --> DEP
CL --> ESC
CL --> REL
CL --> PLAN
CL --> MSG
CL --> MATCH
CL --> TLIST
CL --> SFREQ
CL --> CATALOG

ADM --> DASH
ADM --> AKYD
ADM --> AFIN
ADM --> ACAT
ADM --> USERS

GOAUTH ..> G  : <<uses>>
AIPR   ..> AI : <<uses>>
MATCH  ..> AI : <<uses>>
GEN    ..> AI : <<uses>>
DEP    ..> ST : <<uses>>
WITHD  ..> ST : <<uses>>
PLAN   ..> ST : <<uses>>
PUSH   ..> PUSH : WebPush
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
  package "Compte et Securite" {
    (S'inscrire par email) as REG
    (Connexion Google) as GOOGLE
    (Reset mot de passe) as RESET
    (Activer 2FA TOTP) as TFA
    (Onboarding 5 etapes) as OB
    (Modifier profil) as EDIT
    (Verifier identite KYC) as KYC
    (Centre fiscal) as TAX
  }
  package "Portfolio et Competences" {
    (Ajouter projet portfolio) as PORT
    (Gerer competences) as SKILL
    (Definir niveaux) as LEVEL
  }
  package "Marketplace" {
    (Parcourir les offres) as BROWSE
    (Recherche globale) as GSEARCH
    (Filtrer par categorie) as FCAT
    (Consulter une offre) as VIEW
  }
  package "Catalogue de Services" {
    (Creer service) as CCAT
    (Definir tiers tarifs) as TIER
    (Gerer commandes recues) as CORD
    (Livrer commande) as DELIVER
  }
  package "Propositions" {
    (Soumettre proposition) as SUB
    (Generer via IA) as AIR
    (Definir jalons) as MIL
    (Voir mes propositions) as MYPROP
    (Retirer proposition) as WITHD
  }
  package "Contrats et Jalons" {
    (Voir mes contrats) as CONTRACT
    (Soumettre jalon termine) as SUBM
    (Upload fichiers livres) as UPLOAD
    (Suivi du temps) as TIMER
  }
  package "Finance" {
    (Consulter portefeuille) as WAL
    (Retirer gains Stripe) as CASH
    (Factures hebdomadaires) as WINV
  }
  package "Agences" {
    (Creer mon agence) as CAGENCY
    (Inviter des membres) as CINV
  }
  package "IA" {
    (Analyser mon profil) as ANAL
    (Chat assistant IA) as CHAT
    (Recherche intelligente) as SMART
  }
}

FL --> REG
FL --> GOOGLE
FL --> RESET
FL --> TFA
FL --> OB
FL --> EDIT
FL --> KYC
FL --> TAX
FL --> PORT
FL --> SKILL
FL --> LEVEL
FL --> BROWSE
FL --> GSEARCH
FL --> FCAT
FL --> VIEW
FL --> CCAT
FL --> TIER
FL --> CORD
FL --> DELIVER
FL --> SUB
FL --> AIR
FL --> MIL
FL --> MYPROP
FL --> WITHD
FL --> CONTRACT
FL --> SUBM
FL --> UPLOAD
FL --> TIMER
FL --> WAL
FL --> CASH
FL --> WINV
FL --> CAGENCY
FL --> CINV
FL --> ANAL
FL --> CHAT
FL --> SMART

SUB .> AIR : <<extend>>
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
  package "Compte et Securite" {
    (S'inscrire) as REG
    (Se connecter) as LOGIN
    (2FA TOTP) as TFA
    (Reset mot de passe) as RESET
    (Profil entreprise) as CPRO
    (Centre fiscal) as TAX
  }
  package "Gestion Offres" {
    (Creer une offre) as CREATE
    (Definir budget et comp.) as SETDET
    (Publier l'offre) as PUB
    (Modifier offre) as EDIT
    (Cloturer offre) as CLOSE
  }
  package "Catalogue" {
    (Parcourir services) as BCAT
    (Commander un service) as OCAT
    (Valider livraison) as VCAT
    (Laisser un avis) as RCAT
  }
  package "Recrutement et Talents" {
    (Parcourir freelancers) as BROWSE
    (Matching IA) as MATCH
    (Sauvegarder freelancer) as SAVE
    (Creer liste talents) as TLIST
    (Consulter propositions) as PROPS
    (Accepter proposition) as ACCEPT
    (Rejeter proposition) as REJECT
  }
  package "Contrats et Jalons" {
    (Voir mes contrats) as CON
    (Financer un jalon) as DEFMIL
    (Approuver jalon) as APR
    (Demander corrections) as CORR
    (Demander extension) as EXT
    (Ouvrir un litige) as DISP
  }
  package "Finance" {
    (Deposer des fonds Stripe) as DEP
    (Liberer paiement) as REL
    (Historique transactions) as HIST
    (Abonnement plan) as PLAN
  }
  package "Communication" {
    (Messagerie temps reel) as MSG
    (Evaluer freelancer) as REVI
    (Notifications push) as NOTIF
  }
}

CL --> REG
CL --> LOGIN
CL --> TFA
CL --> RESET
CL --> CPRO
CL --> TAX
CL --> CREATE
CL --> SETDET
CL --> PUB
CL --> EDIT
CL --> CLOSE
CL --> BCAT
CL --> OCAT
CL --> VCAT
CL --> RCAT
CL --> BROWSE
CL --> MATCH
CL --> SAVE
CL --> TLIST
CL --> PROPS
CL --> ACCEPT
CL --> REJECT
CL --> CON
CL --> DEFMIL
CL --> APR
CL --> CORR
CL --> EXT
CL --> DISP
CL --> DEP
CL --> REL
CL --> HIST
CL --> PLAN
CL --> MSG
CL --> REVI
CL --> NOTIF

ACCEPT .> CON   : <<include>>
APR    .> REL   : <<include>>
DISP   .> CORR  : <<extend>>
@enduml
""",

"04_use_case_admin": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam actorStyle awesome
skinparam usecase {
  BackgroundColor #FFE8E8
  BorderColor #E53935
}
left to right direction
title Use Case -- Administrateur (Detail)

actor "Admin" as ADM #LightCoral

rectangle "Espace Admin" {
  package "Dashboard et Analytics" {
    (Voir tableau de bord) as DASH
    (Consulter analytics) as ANALY
    (Rapports plateforme) as REPORT
  }
  package "Gestion Utilisateurs" {
    (Lister utilisateurs) as USERS
    (Bannir un utilisateur) as BAN
    (Verifier un compte) as VERIFY
    (Voir details utilisateur) as UDET
  }
  package "KYC -- Verification Identite" {
    (Consulter file KYC) as KQUEUE
    (Examiner documents) as KDOC
    (Approuver KYC) as KAPPR
    (Rejeter KYC) as KREJ
  }
  package "Finance" {
    (Dashboard finance) as FDASH
    (Voir retraits en attente) as FWITH
    (Approuver retrait) as FAPPR
    (Rejeter retrait) as FREJ
    (Parametres plateforme) as FSET
  }
  package "Documents Fiscaux" {
    (Examiner tax documents) as TLIST
    (Approuver document) as TAPPR
    (Rejeter document) as TREJ
  }
  package "Moderation Catalogue" {
    (Voir services en attente) as CQUEUE
    (Approuver service) as CAPPR
    (Rejeter service) as CREJ
  }
  package "Litiges" {
    (Examiner litiges) as DISP
    (Resoudre litige) as RESOLV
  }
}

ADM --> DASH
ADM --> ANALY
ADM --> REPORT
ADM --> USERS
ADM --> BAN
ADM --> VERIFY
ADM --> UDET
ADM --> KQUEUE
ADM --> KDOC
ADM --> KAPPR
ADM --> KREJ
ADM --> FDASH
ADM --> FWITH
ADM --> FAPPR
ADM --> FREJ
ADM --> FSET
ADM --> TLIST
ADM --> TAPPR
ADM --> TREJ
ADM --> CQUEUE
ADM --> CAPPR
ADM --> CREJ
ADM --> DISP
ADM --> RESOLV

KAPPR .> KQUEUE : <<include>>
FAPPR .> FWITH  : <<include>>
RESOLV .> DISP  : <<include>>
@enduml
""",

"05_class_diagram": """
@startuml
skinparam classAttributeIconSize 0
skinparam classFontSize 9
skinparam linetype ortho
skinparam backgroundColor #FAFAFA
skinparam class {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
  HeaderBackgroundColor #2196F3
  HeaderFontColor white
}
title Diagramme de Classes -- FreeNest (Majeur juin 2026)

class User {
  +id: int
  +name: string
  +email: string
  +role: enum[freelancer|client|admin]
  +avatar: string
  +google_id: string
  +two_factor_secret: string
  +two_factor_confirmed: boolean
  +phone: string
  +phone_verified: boolean
  +is_verified: boolean
  +connects: int
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
  +availability: enum
  +languages: json
}

class ClientProfile {
  +company_name: string
  +industry: string
  +total_spent: decimal
  +payment_verified: boolean
}

class Contract {
  +title: string
  +type: enum[hourly|fixed]
  +amount: decimal
  +escrow_amount: decimal
  +status: enum
  +deadline_at: timestamp
  +is_archived: boolean
  +dispute_reason: text
  +dispute_resolved_at: timestamp
}

class Milestone {
  +title: string
  +amount: decimal
  +status: enum
  +due_at: timestamp
  +submitted_at: timestamp
  +approved_at: timestamp
  +submission_note: text
}

class TimeLog {
  +started_at: timestamp
  +stopped_at: timestamp
  +minutes: int
  +note: string
}

class ContractExtension {
  +old_deadline: timestamp
  +new_deadline: timestamp
  +reason: text
  +status: enum[pending|accepted|rejected]
}

class ContractFile {
  +name: string
  +path: string
  +size: int
  +version: int
  +uploaded_by_id: int
}

class ContractActivity {
  +event: string
  +metadata: json
  +performed_by_id: int
}

class Agency {
  +name: string
  +slug: string
  +description: text
  +logo: string
  +owner_id: int
}

class AgencyMember {
  +agency_id: int
  +user_id: int
  +role: enum[owner|admin|member]
}

class AgencyInvitation {
  +email: string
  +token: string
  +role: enum
  +expires_at: timestamp
}

class CatalogProject {
  +title: string
  +slug: string
  +description: text
  +status: enum[pending|approved|rejected]
  +tiers: json
  +category: string
}

class CatalogOrder {
  +tier: enum[basic|standard|premium]
  +price: decimal
  +status: enum
  +delivery_note: text
}

class IdentityVerification {
  +document_type: enum
  +document_front: string
  +document_back: string
  +selfie: string
  +status: enum[pending|approved|rejected]
  +admin_notes: text
}

class TaxDocument {
  +type: enum[W9|W8BEN|VAT]
  +data: json
  +pdf_path: string
  +status: enum
}

class Subscription {
  +stripe_id: string
  +stripe_status: string
  +stripe_price: string
  +trial_ends_at: timestamp
  +ends_at: timestamp
}

class Wallet {
  +balance: decimal
  +pending_balance: decimal
  +escrow_balance: decimal
}

class Withdrawal {
  +amount: decimal
  +fee: decimal
  +net_amount: decimal
  +status: enum[pending|approved|rejected]
  +stripe_transfer_id: string
}

class WeeklyInvoice {
  +week_start: date
  +week_end: date
  +hours: decimal
  +rate: decimal
  +total: decimal
  +status: enum[pending|paid]
}

class TalentList {
  +name: string
  +description: text
  +is_private: boolean
}

class Message {
  +body: text
  +type: enum[text|file|image]
  +is_read: boolean
  +edited_at: timestamp
  +deleted_at: timestamp
}

class MessageReaction {
  +emoji: string
  +user_id: int
  +message_id: int
}

class AuditLog {
  +user_id: int
  +action: string
  +metadata: json
  +ip_address: string
}

User "1" *-- "0..1" FreelancerProfile
User "1" *-- "0..1" ClientProfile
User "1" *-- "1"    Wallet
User "1" o-- "N"    Contract : client/freelancer
User "1" o-- "N"    AuditLog
User "1" o-- "0..1" IdentityVerification
User "1" o-- "0..1" TaxDocument
User "1" o-- "0..1" Subscription

Contract "1" *-- "N" Milestone
Contract "1" *-- "N" TimeLog
Contract "1" *-- "N" ContractFile
Contract "1" *-- "N" ContractExtension
Contract "1" *-- "N" ContractActivity

Agency "1" *-- "N" AgencyMember
Agency "1" *-- "N" AgencyInvitation

CatalogProject "1" *-- "N" CatalogOrder

Wallet "1" *-- "N" Withdrawal
Wallet "1" *-- "N" WeeklyInvoice

Message "1" *-- "N" MessageReaction

User "N" -- "N" TalentList : membre de
@enduml
""",

"06_erd": """
@startuml
skinparam backgroundColor #FFFDF0
skinparam class {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
  HeaderBackgroundColor #E67E22
  HeaderFontColor white
}
skinparam linetype ortho
title ERD -- FreeNest (35+ tables, juin 2026)

entity "users" as U {
  * id: INT <<PK>>
  --
  name, email, role
  two_factor_secret
  phone, connects
}

entity "freelancer_profiles" as FP {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  title, hourly_rate, avg_rating
  availability, languages
}

entity "client_profiles" as CP {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  company_name, total_spent
}

entity "contracts" as CO {
  * id: INT <<PK>>
  --
  client_id: INT <<FK>>
  freelancer_id: INT <<FK>>
  job_id, proposal_id
  type, amount, status
  is_archived, dispute_reason
}

entity "milestones" as MI {
  * id: INT <<PK>>
  --
  contract_id: INT <<FK>>
  title, amount, status
  submitted_at, approved_at
}

entity "time_logs" as TL {
  * id: INT <<PK>>
  --
  contract_id: INT <<FK>>
  user_id: INT <<FK>>
  started_at, stopped_at, minutes
}

entity "contract_files" as CF {
  * id: INT <<PK>>
  --
  contract_id: INT <<FK>>
  name, path, version
  uploaded_by_id: INT <<FK>>
}

entity "contract_extensions" as CE {
  * id: INT <<PK>>
  --
  contract_id: INT <<FK>>
  old_deadline, new_deadline
  status: ENUM
}

entity "contract_activities" as CA {
  * id: INT <<PK>>
  --
  contract_id: INT <<FK>>
  event, metadata, performed_by_id
}

entity "agencies" as AG {
  * id: INT <<PK>>
  --
  owner_id: INT <<FK>>
  name, slug, description
}

entity "agency_members" as AGM {
  * id: INT <<PK>>
  --
  agency_id: INT <<FK>>
  user_id: INT <<FK>>
  role: ENUM
}

entity "agency_invitations" as AGI {
  * id: INT <<PK>>
  --
  agency_id: INT <<FK>>
  email, token, role
  expires_at
}

entity "catalog_projects" as CAT {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  title, slug, tiers, status
}

entity "catalog_orders" as CORD {
  * id: INT <<PK>>
  --
  catalog_project_id: INT <<FK>>
  buyer_id: INT <<FK>>
  tier, price, status
}

entity "identity_verifications" as KYC {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  document_type, status
  admin_notes
}

entity "tax_documents" as TAX {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  type: ENUM, data, status
}

entity "subscriptions" as SUB {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  stripe_id, stripe_status
  stripe_price, ends_at
}

entity "wallets" as WA {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  balance, pending_balance
  escrow_balance
}

entity "withdrawals" as WITH {
  * id: INT <<PK>>
  --
  wallet_id: INT <<FK>>
  amount, fee, net_amount
  status, stripe_transfer_id
}

entity "weekly_invoices" as WI {
  * id: INT <<PK>>
  --
  contract_id: INT <<FK>>
  week_start, week_end
  hours, rate, total, status
}

entity "transactions" as TR {
  * id: INT <<PK>>
  --
  wallet_id: INT <<FK>>
  type, amount, fee, status
}

entity "talent_lists" as TLI {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  name, is_private
}

entity "messages" as MSG {
  * id: INT <<PK>>
  --
  conversation_id: INT <<FK>>
  sender_id: INT <<FK>>
  body, type, is_read
  edited_at, deleted_at
}

entity "message_reactions" as MR {
  * id: INT <<PK>>
  --
  message_id: INT <<FK>>
  user_id: INT <<FK>>
  emoji: VARCHAR
}

entity "audit_logs" as AL {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  action, metadata, ip_address
}

entity "push_subscriptions" as PS {
  * id: INT <<PK>>
  --
  user_id: INT <<FK>>
  endpoint, public_key, auth_token
}

U ||--o| FP    : "profil"
U ||--o| CP    : "profil"
U ||--|| WA    : "portefeuille"
U ||--o{ CO    : "client/freelancer"
U ||--o| KYC   : "kyc"
U ||--o| TAX   : "fiscal"
U ||--o| SUB   : "abonnement"
U ||--o{ AL    : "audit"
U ||--o{ PS    : "push"

CO ||--o{ MI   : "jalons"
CO ||--o{ TL   : "temps"
CO ||--o{ CF   : "fichiers"
CO ||--o{ CE   : "extensions"
CO ||--o{ CA   : "activite"
CO ||--o{ WI   : "factures hebdo"

AG ||--o{ AGM  : "membres"
AG ||--o{ AGI  : "invitations"

CAT ||--o{ CORD : "commandes"

WA ||--o{ TR   : "transactions"
WA ||--o{ WITH : "retraits"

MSG ||--o{ MR  : "reactions"

U ||--o{ TLI   : "listes talents"
@enduml
""",

"07_sequence_inscription": """
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
FL -> FE : Formulaire {nom, email, password, role:'freelancer'}
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

FE -> FC : PUT /api/freelancer/onboarding {category, hourly_rate, languages...}
FC -> DB : UPDATE freelancer_profiles
DB --> FC : OK
FC --> FE : HTTP 200 {profile complet}
FE --> FL : Tableau de bord freelancer
@enduml
""",

"08_sequence_oauth": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center
title Sequence -- Connexion Google OAuth 2.0

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

AUTH -> GOOGLE : Echange code -> access_token
GOOGLE --> AUTH : {id, name, email, picture}

AUTH -> DB : SELECT user WHERE google_id=X OR email=Y

alt Utilisateur existant
  DB --> AUTH : User trouve
  AUTH -> DB : UPDATE last_seen_at
else Nouvel utilisateur
  DB --> AUTH : NULL
  AUTH -> DB : INSERT users + INSERT profils
end

AUTH -> AUTH : user->createToken()
AUTH --> FE : Redirect /auth/callback?token=xxx
FE -> FE : Stocke token localStorage
FE --> USR : Connecte - Dashboard
@enduml
""",

"09_sequence_2fa": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center
title Sequence -- Activation 2FA TOTP

actor "Utilisateur" as USR
participant "Frontend" as FE
participant "TwoFactorController" as TFC
participant "Google Authenticator" as GA
database "MySQL" as DB

USR -> FE : Accede aux parametres securite
FE -> TFC : POST /api/two-factor/enable
TFC -> TFC : Genere secret TOTP aleatoire
TFC -> DB : UPDATE users SET two_factor_secret=secret
TFC --> FE : {qr_code_url, secret}

FE --> USR : Affiche QR Code
USR -> GA : Scanne le QR Code
GA --> USR : Affiche code TOTP 6 chiffres

USR -> FE : Saisit le code TOTP
FE -> TFC : POST /api/two-factor/confirm {code:'123456'}
TFC -> TFC : Verifie TOTP (algorithme time-based)

alt Code valide
  TFC -> DB : UPDATE two_factor_confirmed=true
  TFC -> DB : INSERT recovery_codes [8 codes]
  TFC --> FE : HTTP 200 + codes de secours
  FE --> USR : 2FA active - Codes de secours affiches
else Code invalide
  TFC --> FE : HTTP 422 {error: 'Code invalide'}
  FE --> USR : Erreur - Reessayez
end
@enduml
""",

"10_sequence_escrow": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center
title Sequence -- Paiement Escrow Stripe (4 phases)

actor "Client" as CL
actor "Freelancer" as FL
participant "Frontend" as FE
participant "StripeController" as STC
participant "PaymentController" as PAY
participant "Stripe API" as STRIPE
database "MySQL" as DB

== Phase 1 : Depot Stripe ==
CL -> FE : Clique "Deposer des fonds"
FE -> STC : POST /api/payments/stripe/deposit-session
STC -> STRIPE : createCheckoutSession({amount:1500$})
STRIPE --> STC : {url: checkout.stripe.com/...}
STC --> FE : {url}
FE --> CL : Redirect Stripe Checkout

CL -> STRIPE : Paye par carte (3D Secure)
STRIPE -> PAY : Webhook checkout.session.completed
PAY -> DB : wallet.balance += 1500
PAY --> STRIPE : HTTP 200

== Phase 2 : Escrow ==
CL -> FE : Finance jalon 1 (300$)
FE -> PAY : POST /api/payments/contracts/{id}/fund-escrow
PAY -> DB : balance -= 300, escrow_balance += 300, milestone='funded'
PAY --> FE : OK
FE --> FL : Notification: Jalon finance - commencez !

== Phase 3 : Livraison ==
FL -> FE : Soumet jalon termine + fichiers
FE -> PAY : PUT /api/milestones/{id}/submit
PAY -> DB : milestone.status = 'submitted'
FE --> CL : Notification: Revision requise !

== Phase 4 : Liberation ==
CL -> FE : Approuve le travail
FE -> PAY : POST /api/payments/milestones/{id}/release
note right : commission = 300 x 10% = 30$\nnet freelancer = 270$
PAY -> DB : BEGIN TRANSACTION
PAY -> DB : escrow -= 300\nfreelancer.balance += 270\nmilestone='approved'\nINSERT 2 transactions
PAY -> DB : COMMIT
PAY --> FE : {net_received: 270$}
FE --> FL : +270$ credites !
@enduml
""",

"11_sequence_ia": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center
title Sequence -- Generation de Proposition par IA (Ollama Mistral 7B)

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

AIC -> AIC : Construit le prompt structure
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

"12_sequence_kyc": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam sequenceMessageAlign center
title Sequence -- Verification d'Identite KYC

actor "Freelancer" as FL
actor "Admin" as ADM
participant "Frontend" as FE
participant "IdentityVerificationController" as KYC
participant "Storage" as STG
database "MySQL" as DB

== Soumission des documents ==
FL -> FE : Accede a /settings/identity
FE -> KYC : GET /api/verify-identity/status
KYC -> DB : SELECT identity_verifications WHERE user_id=X
DB --> KYC : {status: 'none'}
KYC --> FE : {status: 'not_submitted'}

FL -> FE : Upload: passeport + selfie
FE -> KYC : POST /api/verify-identity\n{document_type, front, back, selfie}
KYC -> STG : Storage::disk('local')->put(files)
KYC -> DB : INSERT identity_verifications {status:'pending'}
KYC --> FE : HTTP 201 {status: 'pending'}
FE --> FL : Documents en cours de verification

== Traitement Admin ==
ADM -> FE : Accede a /admin/kyc
FE -> KYC : GET /api/admin/kyc
KYC -> DB : SELECT WHERE status='pending'
DB --> KYC : Liste des soumissions
KYC --> FE : HTTP 200 {verifications}

ADM -> FE : Examine les documents
FE -> KYC : GET /api/admin/kyc/{id}
KYC -> STG : Sert le fichier via route signee
STG --> ADM : Documents affiches

ADM -> FE : Clique "Approuver"
FE -> KYC : POST /api/admin/kyc/{id}/approve
KYC -> DB : UPDATE identity_verifications SET status='approved'
KYC -> DB : UPDATE users SET is_verified=true
KYC -> DB : INSERT audit_logs {action:'kyc_approved'}
KYC --> FE : HTTP 200
FE --> FL : Notification: Identite verifiee !
@enduml
""",

"13_sequence_contrat": """
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
PC -> DB : UPDATE job_postings SET status='in_progress'
PC -> DB : INSERT contracts {job_id, proposal_id, client_id, freelancer_id, amount, status:'active'}
DB --> PC : contract {id:33}
PC -> DB : INSERT milestones[] (depuis proposal.milestones JSON)
PC -> DB : COMMIT

PC -> CC : createConversation(contract_id:33)
CC -> DB : INSERT conversations + participants

PC -> DB : INSERT notifications [client + freelancer]

PC --> FE : HTTP 200 {contract, conversation_id}
FE --> CL : Contrat #33 cree !
FE --> FL : Proposition acceptee !
@enduml
""",

"14_activity_cycle": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam activity {
  BackgroundColor #EBF5FB
  BorderColor #2196F3
  ArrowColor #1565C0
}
title Activite -- Cycle de Vie Complet d'une Mission FreeNest

|#AED6F1|Client|
|#A9DFBF|Freelancer|
|#FAD7A0|Systeme|

|Client|
start
:Publie une offre;

|Systeme|
:statut = 'open';
:Notifie les freelancers;

|Freelancer|
:Parcourt les offres;
if (Interesse ?) then (Oui)
  if (Utilise IA ?) then (Oui)
    :Generation IA proposition;
  else (Non)
    :Redige manuellement;
  endif
  :Soumet proposition + jalons;
else (Non)
  stop
endif

|Systeme|
:Proposition = 'pending';

|Client|
:Examine propositions;
if (Accepte ?) then (Oui)
  :Accepte proposition #N;
else (Non)
  stop
endif

|Systeme|
:Contrat cree;
:Conversation ouverte;
:Autres props rejetees;

|Client|
:Finance escrow jalon 1;

|Freelancer|
:Realise le travail;
:Soumet le jalon + fichiers;

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
    :Contrat = 'completed';
    :Echanges des avis;
    stop
  endif
else if (Demande corrections) then (Oui)
  |Freelancer|
  backward: Corrige et resoumet;
else (Litige)
  |Systeme|
  :contract.status = 'disputed';
  :Admin arbitre;
  stop
endif
@enduml
""",

"15_activity_escrow": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam activity {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
  ArrowColor #D35400
}
title Activite -- Flux de Paiement Escrow + Stripe

|#AED6F1|Client|
|#A9DFBF|Freelancer|
|#FAD7A0|Systeme|

|Client|
start

:Acces portefeuille;
:Clique "Deposer des fonds";

|Systeme|
:Cree session Stripe Checkout;

|Client|
:Paye par carte via Stripe;

|Systeme|
:Webhook checkout.session.completed;
:wallet.balance += montant;
:Transaction credit enregistree;

|Client|
:Selectionne jalon a financer;
:Clique "Financer l'escrow";

|Systeme|
if (balance >= montant ?) then (Oui)
  :balance -= montant;
  :escrow_balance += montant;
  :milestone.status = 'funded';
else (Non)
  :Erreur "Solde insuffisant";
  |Client|
  backward: Depose plus de fonds;
endif

|Freelancer|
:Realise le travail;
:Soumet le jalon;

|Systeme|
:milestone.status = 'submitted';

|Client|
:Revise les livrables;
if (Approuve ?) then (Oui)
  :Libere le paiement;
  |Systeme|
  :commission = montant x 10%;
  :escrow -= montant;
  :freelancer.balance += 90%;
  :2 transactions enregistrees;
  :Notification freelancer;
  stop
else if (Corrections) then (Oui)
  |Freelancer|
  backward: Corrige et resoumet;
else (Litige)
  |Systeme|
  :contract.status = 'disputed';
  :Admin arbitre;
  stop
endif
@enduml
""",

"16_state_contrat": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam state {
  BackgroundColor #FFF9E6
  BorderColor #E67E22
  ArrowColor #D35400
}
title Etats d'un Contrat -- FreeNest

[*] --> active : Proposition acceptee

active --> paused    : Travail suspendu
active --> completed : Tous jalons approuves
active --> disputed  : Litige ouvert
active --> cancelled : Annulation mutuelle

paused --> active : Reprise du travail

disputed --> active    : Litige resolu (freelancer)
disputed --> cancelled : Litige resolu (client)

completed --> archived : Contrat archive
cancelled  --> archived : Contrat archive

archived --> [*]
completed --> [*]

note right of disputed
  Admin peut resoudre:
  - En faveur freelancer -> active
  - En faveur client -> cancelled
  (PDF litige genere)
end note
@enduml
""",

"17_state_milestone": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam state {
  BackgroundColor #F0E6FF
  BorderColor #8E44AD
  ArrowColor #7D3C98
}
title Etats d'un Jalon (Milestone) -- FreeNest

[*] --> pending : Contrat cree

pending   --> funded    : Client finance l'escrow
funded    --> submitted : Freelancer soumet le travail
submitted --> approved  : Client approuve\n-> Paiement libere
submitted --> funded    : Client demande corrections
submitted --> disputed  : Litige ouvert

disputed  --> approved  : Admin - freelancer gagne
disputed  --> pending   : Admin - remboursement client

approved --> [*] : 90% au freelancer

note right of funded
  Argent bloque
  en escrow
  securise
end note

note right of submitted
  Fichiers joints
  Notes de soumission
end note
@enduml
""",

"18_state_catalog_order": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam state {
  BackgroundColor #E8F5E9
  BorderColor #27AE60
  ArrowColor #1E8449
}
title Etats d'une Commande Catalogue (CatalogOrder)

[*] --> pending : Client commande un service

pending --> in_progress : Freelancer demarre

in_progress --> delivered : Freelancer livre les fichiers

delivered --> completed : Client accepte la livraison\n-> Avis possible
delivered --> revision   : Client demande revision

revision --> delivered : Freelancer re-livre

completed --> [*]

note right of delivered
  Client peut laisser
  un avis (1-5 etoiles)
  apres completion
end note
@enduml
""",

"19_state_kyc": """
@startuml
skinparam backgroundColor #FAFAFA
skinparam state {
  BackgroundColor #FFF3E0
  BorderColor #FF6F00
  ArrowColor #E65100
}
title Etats de la Verification d'Identite (KYC)

[*] --> not_submitted : Utilisateur cree

not_submitted --> pending : Upload documents\n(passeport/CNI + selfie)

pending --> approved : Admin approuve\n(is_verified=true)
pending --> rejected : Admin rejette\n(avec motif)

rejected --> pending : Utilisateur resoumet\ndes documents corriges

approved --> [*]

note right of approved
  Retrait de fonds
  debloque
  Audit log cree
end note
@enduml
""",

"20_deployment": """
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
title Diagramme de Deploiement -- FreeNest (Docker, juin 2026)

node "GitHub Actions CI/CD" {
  component "backend.yml\n(PHP lint, tests, build)" as CI_B
  component "frontend.yml\n(ESLint, Vite, Vitest)" as CI_F
}

node "Docker Host (Production)" {
  node "Container: Frontend" {
    component "React 19 SPA\n(Nginx + nginx.conf)" as REACT
    component "Service Worker\n(sw.js Push)" as SW
  }
  node "Container: Backend" {
    component "Laravel 12 API\n(PHP 8.2-FPM)" as LARAVEL
    component "Laravel Queues\n(jobs, emails)" as QUEUE
    component "Laravel Scheduler\n(HourlyInvoices)" as SCHED
  }
  node "Container: Soketi" {
    component "WebSocket Server\n(Pusher-compatible)" as SOKETI
  }
  node "Container: MySQL 8.0" {
    database "freenest_db\n(35+ tables)" as DB
  }
  node "Container: Redis" {
    database "Cache + Sessions\n+ Queues" as REDIS
  }
  node "Container: Ollama" {
    component "Mistral 7B\nlocalhost:11434" as OLLAMA
  }
}

cloud "Stripe (SaaS)" {
  component "Stripe Checkout\n+ Connect\n+ Webhooks" as STRIPE
}
cloud "Google (SaaS)" {
  component "Google OAuth 2.0" as GOOGLE
}

REACT -down-> LARAVEL   : REST API\n(Bearer Token)
REACT -down-> SOKETI    : WebSocket\n(Socket.IO)
LARAVEL -down-> DB      : SQL / Eloquent
LARAVEL -down-> REDIS   : Cache / Queue
LARAVEL -right-> OLLAMA : HTTP POST\n(IA requests)
LARAVEL -up-> STRIPE    : Payments API
LARAVEL -up-> GOOGLE    : OAuth2
STRIPE -down-> LARAVEL  : Webhooks POST
CI_B -down-> LARAVEL    : Deploy on merge
CI_F -down-> REACT      : Deploy on merge
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
        print("FAIL: " + name + " | " + result.stderr[:200])
        fail += 1

print("\nTotal: " + str(ok) + " OK / " + str(fail) + " FAILED")
