"""
Panda — 3 diagrammes UML COMPLETS (version finale)
"""
import subprocess, os

JAR    = r"C:\Users\Pro\Desktop\PFE O1\documentation\plantuml.jar"
OUTDIR = r"C:\Users\Pro\Desktop\PFE O1\documentation\uml_diagrams"
os.makedirs(OUTDIR, exist_ok=True)

DIAGRAMS = {}

# ══════════════════════════════════════════════════════════════════════════════
#  1. SEQUENCE — Flux complet avec TOUS les modules
# ══════════════════════════════════════════════════════════════════════════════
DIAGRAMS["Panda_Sequence_Complet"] = r"""@startuml
!theme plain
skinparam backgroundColor #FFFFFF
skinparam sequenceArrowThickness 1.8
skinparam sequenceArrowColor #003466
skinparam sequenceLifeLineBorderColor #003466
skinparam sequenceLifeLineBackgroundColor #EBF5FB
skinparam participantBackgroundColor #003466
skinparam participantFontColor #FFFFFF
skinparam participantBorderColor #003466
skinparam participantFontSize 12
skinparam noteFontSize 10
skinparam noteBackgroundColor #FFFDE7
skinparam noteBorderColor #F9A825
skinparam sequenceGroupBodyBackgroundColor #F8F9FA
skinparam sequenceGroupBorderColor #0078D4
skinparam sequenceGroupFontColor #003466
skinparam defaultFontSize 11

title Panda -- Diagramme de Sequence Complet (Tous les Modules)

actor "Freelancer" as FL
actor "Client" as CL
actor "Admin" as AD
participant "React 19" as FE
participant "Laravel 12 API" as API
participant "LedgerService" as LS
participant "Stripe" as ST
participant "Reverb WS" as WS
participant "Ollama AI" as AI
database "MySQL 8" as DB

== MODULE 1 : Inscription Email + 2FA ==

CL -> FE : POST /register { name, email, password }
FE -> API : POST /api/auth/register
API -> DB : INSERT users (role=client, bcrypt)
API -> DB : INSERT wallets (balance=0, escrow=0)
API -> FE : 200 { token: Bearer xxxxx }
FE -> FE : localStorage.setItem('token')

CL -> FE : Activer 2FA
FE -> API : POST /api/two-factor/enable
API -> API : TotpService::generateSecret()
API -> API : Crypt::encryptString(secret) AES-256
API -> DB : UPDATE users SET two_factor_secret=encrypted
API -> FE : { otpauth_uri, qr_code }
CL -> FE : Saisir code TOTP (30s window)
FE -> API : POST /api/two-factor/confirm { code }
API -> API : TotpService::verify() OK
API -> DB : SET two_factor_confirmed_at=now()
API -> API : AuditLogService::log('2fa.enabled')
API -> FE : { recovery_codes[8] }

== MODULE 2 : Google OAuth 2.0 ==

FL -> FE : Cliquer "Connexion Google"
FE -> FE : window.location = /auth/google/redirect
FE -> API : GET /api/auth/google/redirect
API -> API : Socialite::driver('google')->redirect()
API -> FE : 302 -> accounts.google.com/o/oauth2/auth
FL -> FL : Autoriser Panda sur Google
FL -> FE : Redirection callback /auth/google/callback
FE -> API : GET /api/auth/google/callback?code=xxx
API -> API : Socialite::driver('google')->user()
API -> DB : SELECT users WHERE google_id=X OR email=Y
note right of API
  Si compte existant -> liaison
  Si nouveau -> creation auto
  role=freelancer par defaut OAuth
end note
API -> DB : INSERT ou UPDATE users (google_id, avatar)
API -> DB : INSERT wallets si nouveau
API -> FE : 200 { token: Bearer }

== MODULE 3 : KYC Verification ==

FL -> FE : Soumettre passeport + selfie
FE -> API : POST /api/verify-identity (multipart)
API -> API : Storage::disk('local') -- hors webroot
API -> DB : INSERT identity_verifications (status=pending)
API -> FE : 200 submitted

AD -> FE : Consulter file KYC admin
FE -> API : GET /admin/kyc
API -> DB : SELECT identity_verifications (status=pending)
API -> FE : { verifications[] }
AD -> FE : Acceder au fichier
FE -> API : GET /admin/kyc/file/{b64_path} [route signee]
API -> API : Storage::exists() check
API -> FE : File stream (jamais chemin direct)

AD -> FE : Approuver KYC
FE -> API : POST /admin/kyc/{id}/approve
API -> DB : UPDATE users SET is_verified=true
API -> API : AuditLogService::log('kyc.approved')
API -> WS : Event KycApproved (canal user.{id})
WS -> FL : Notification : compte verifie

== MODULE 4 : Offres, Propositions et IA ==

CL -> FE : Creer une offre
FE -> API : POST /api/jobs { title, budget, skills, type }
API -> DB : INSERT job_postings (status=open, FULLTEXT)
API -> FE : 201 { job }

FL -> FE : Recherche full-text
FE -> API : GET /api/jobs?q=react&type=fixed&budget_min=500
API -> DB : MATCH(title,description) AGAINST ('react*' BOOLEAN)
API -> FE : { jobs[], total, pages }

FL -> FE : Generer proposition par IA
FE -> API : POST /api/ai/generate-proposal { job_id }
API -> DB : SELECT job + freelancer_profile
API -> AI : POST /api/generate { model:mistral, prompt: profil+offre, stream:false }
AI -> API : { response: "Dear Client, I am..." }
API -> DB : INSERT ai_histories (type=proposal, tokens_used)
API -> FE : { proposal_text, is_ai_generated:true }

FL -> FE : Matcher freelancers (client)
FE -> API : POST /api/ai/match-freelancers { job_id }
API -> API : Scoring algo: intersection(skills_job, skills_fl)
API -> DB : SELECT top 10 freelancers par score
API -> FE : { freelancers[], match_score[] }

FL -> FE : Soumettre proposition
FE -> API : POST /api/jobs/{id}/proposals { bid, milestones:[] }
API -> DB : INSERT proposals (is_ai_generated=true)
API -> WS : Event ProposalReceived (canal user.{client_id})
WS -> CL : Notification nouvelle proposition

== MODULE 5 : Contrat, Jalons et Temps ==

CL -> FE : Accepter la proposition
FE -> API : POST /api/proposals/{id}/accept
API -> DB : BEGIN TRANSACTION
API -> DB : UPDATE proposals SET status=accepted
API -> DB : UPDATE autres SET status=rejected
API -> DB : INSERT contracts (pending -> active)
API -> DB : INSERT milestones (depuis JSON)
API -> DB : INSERT conversations (liee contrat)
API -> DB : INSERT contract_activities (milestone.created)
API -> DB : COMMIT
API -> WS : Event ContractCreated (user.{fl_id})
WS -> FL : Notification contrat cree
API -> FE : 201 { contract, milestones[] }

FL -> FE : Demarrer timer
FE -> API : POST /api/contracts/{id}/time/start
API -> DB : INSERT time_logs (started_at=now(), ended_at=NULL)

FL -> FE : Uploader fichier livre
FE -> API : POST /api/contracts/{id}/files (multipart)
API -> DB : INSERT contract_files (version=1, parent_id=NULL)
API -> DB : INSERT contract_activities (file.uploaded)
API -> FE : 201 { file }

FL -> FE : Demander extension deadline
FE -> API : POST /api/contracts/{id}/extensions { new_deadline, reason }
API -> DB : INSERT contract_extensions (status=pending)
API -> WS : Event ExtensionRequested (user.{client_id})
CL -> FE : Accepter extension
FE -> API : POST /api/contract-extensions/{id}/respond { accept:true }
API -> DB : UPDATE contract_extensions SET status=accepted
API -> DB : UPDATE contracts SET deadline=new_deadline
API -> DB : INSERT contract_activities (extension.accepted)

FL -> FE : Soumettre jalon
FE -> API : POST /api/milestones/{id}/submit { notes, attachments:[] }
API -> DB : UPDATE milestones SET status=submitted, attachments=JSON
API -> DB : INSERT contract_activities (milestone.submitted)
API -> WS : Event MilestoneSubmitted (user.{client_id})

CL -> FE : Approuver jalon ($500)
FE -> API : POST /api/milestones/{id}/approve
API -> LS : releaseMilestone(client, milestone, 500)
LS -> DB : SELECT wallet(client+freelancer+platform) FOR UPDATE
LS -> DB : UPDATE wallet(client) escrow -= 500
LS -> DB : UPDATE wallet(freelancer) balance += 450 [x0.90]
LS -> DB : UPDATE wallet(platform) balance += 50 [x0.10]
LS -> DB : INSERT transactions x2 (commission + credit)
LS -> LS : VERIFY SUM(tx) == wallet.balance
API -> WS : Event MilestoneApproved (user.{fl_id})
WS -> FL : +$450 disponibles

CL -> FE : Ouvrir litige
FE -> API : POST /api/contracts/{id}/dispute { reason }
API -> DB : UPDATE contracts SET status=disputed, dispute_opened_by=client
API -> DB : INSERT contract_activities (dispute.opened)
AD -> FE : Resoudre litige en faveur freelancer
FE -> API : POST /api/contracts/{id}/resolve-dispute { winner:freelancer }
API -> LS : releaseMilestone(admin, milestone)
API -> DB : UPDATE contracts SET status=active

== MODULE 6 : Paiement Escrow et Stripe ==

CL -> FE : Deposer fonds (Stripe Checkout)
FE -> API : POST /api/payments/stripe/deposit-session { amount:1500 }
API -> ST : Stripe::checkout.session.create { amount_cents:150000 }
ST -> API : { id, url: checkout.stripe.com/... }
API -> FE : { checkout_url }
CL -> ST : Paiement carte (3D Secure)
ST -> API : Webhook checkout.session.completed [HMAC verifie]
API -> DB : SELECT stripe_webhook_events WHERE stripe_event_id=X
note right of API
  Idempotence : si event deja traite
  -> ignore silencieusement
end note
API -> LS : deposit(client, 1500.00)
LS -> DB : SELECT wallet FOR UPDATE
LS -> DB : UPDATE wallet SET balance=1500
LS -> DB : INSERT transactions (idempotency_key UNIQUE)
API -> DB : INSERT stripe_webhook_events (processed_at=now())

CL -> FE : Financer jalon escrow
FE -> API : POST /api/contracts/{id}/fund-escrow { amount:500 }
API -> LS : fundEscrow(client, contract, 500)
LS -> DB : SELECT wallet FOR UPDATE
LS -> DB : UPDATE wallet SET balance=1000, escrow_balance=500
LS -> DB : UPDATE contracts SET escrow_amount=500
LS -> DB : INSERT transactions (type=escrow, direction=out)

FL -> FE : Retirer ses gains
FE -> API : POST /api/payments/withdrawals { amount:400, method:stripe }
API -> LS : verif balance >= 402 (400+fee 2)
API -> DB : INSERT withdrawals (status=pending, net=398)

AD -> FE : Approuver retrait
FE -> API : POST /admin/finance/withdrawals/{id}/approve
API -> ST : Stripe::Transfer::create (amount:39800, destination:acct_...)
ST -> API : { transfer_id }
API -> LS : withdrawal(freelancer, net=398)
LS -> DB : UPDATE wallet SET balance -= 400
LS -> DB : INSERT transactions (type=withdrawal, fee=2)
API -> DB : UPDATE withdrawals SET status=approved
API -> API : AuditLogService::log('withdrawal.approved')

== MODULE 7 : Abonnements Stripe ==

FL -> FE : Souscrire plan Premium
FE -> API : POST /api/billing/checkout { plan_slug:premium }
API -> ST : Stripe::checkout.session.create (mode=subscription)
ST -> API : { checkout_url }
FL -> ST : Paiement carte abonnement
ST -> API : Webhook invoice.paid
API -> DB : INSERT subscriptions (plan_slug=premium, status=active)
API -> WS : Event SubscriptionActivated (user.{fl_id})

FL -> FE : Annuler abonnement
FE -> API : POST /api/billing/cancel
API -> ST : Stripe::Subscription::cancel()
API -> DB : UPDATE subscriptions SET ends_at=period_end
ST -> API : Webhook customer.subscription.deleted
API -> DB : UPDATE subscriptions SET stripe_status=canceled

== MODULE 8 : Catalogue de Services ==

FL -> FE : Creer service catalogue
FE -> API : POST /api/catalog { title, tiers:{basic,standard,premium} }
API -> DB : INSERT catalog_projects (status=pending)
AD -> FE : Approuver le service
FE -> API : POST /admin/catalog/{id}/approve
API -> DB : UPDATE catalog_projects SET status=approved

CL -> FE : Commander service (tier Standard $150)
FE -> API : POST /api/orders/checkout { catalog_id, tier:standard }
API -> API : CatalogCheckoutService::checkout()
API -> LS : deduct(client, 150) depuis wallet
LS -> DB : UPDATE wallet(client) balance -= 150
LS -> DB : INSERT transactions (type=debit)
API -> DB : INSERT catalog_orders (status=in_progress)
API -> WS : Event OrderCreated (user.{fl_id})

FL -> FE : Livrer le service
FE -> API : POST /api/orders/{id}/deliver { deliverable, notes }
API -> DB : UPDATE catalog_orders SET status=delivered
API -> WS : Event OrderDelivered (user.{cl_id})

CL -> FE : Valider la livraison
FE -> API : POST /api/orders/{id}/complete
API -> LS : releaseCatalogPayment(freelancer, 150)
LS -> DB : UPDATE wallet(freelancer) balance += 135 [x0.90]
LS -> DB : UPDATE wallet(platform) balance += 15 [x0.10]
API -> DB : UPDATE catalog_orders SET status=completed

CL -> FE : Laisser un avis
FE -> API : POST /api/orders/{id}/review { rating:5, comment }
API -> DB : INSERT catalog_reviews
API -> DB : UPDATE catalog_projects SET avg_rating

== MODULE 9 : Agences ==

FL -> FE : Creer une agence
FE -> API : POST /api/agencies { name, slug, description }
API -> DB : INSERT agencies (owner_id=FL)
API -> DB : INSERT agency_members (role=owner)
API -> FE : 201 { agency }

FL -> FE : Inviter un membre
FE -> API : POST /api/agencies/{id}/invitations { email }
API -> DB : INSERT agency_invitations (token=UNIQUE, expires=+7j)
API -> API : Mail::send invitation avec lien token

FL -> FE : Accepter invitation (nouveau membre)
FE -> API : POST /api/agencies/invitations/{token}/accept
API -> DB : SELECT agency_invitations WHERE token=X AND expires>now()
API -> DB : INSERT agency_members (role=member)
API -> DB : DELETE agency_invitations
API -> FE : 200 { agency }

== MODULE 10 : Messagerie Temps Reel ==

FL -> FE : Envoyer message
FE -> API : POST /api/conversations/{id}/send { body }
API -> DB : INSERT messages (sender_id, body, type=text)
API -> WS : Event MessageSent (PrivateChannel conversation.{id})
note over WS
  broadcastWith() slim payload :
  id, sender_id, body, created_at
  Jamais le modele Eloquent complet
end note
WS -> WS : Auth canal Sanctum Bearer
WS -> CL : message.sent temps reel

FL -> FE : Reagir a un message (emoji)
FE -> API : POST /api/messages/{id}/reactions { emoji: heart }
API -> DB : INSERT ou DELETE message_reactions (toggle)
API -> WS : Event ReactionToggled (conversation.{id})
WS -> CL : reaction mise a jour temps reel

CL -> FE : Indiquer frappe
FE -> API : POST /api/conversations/{id}/typing { is_typing:true }
API -> WS : Event UserTyping (conversation.{id})
WS -> FL : indicateur de frappe visible

FE -> API : POST /api/conversations/{id}/read
API -> DB : UPDATE conversation_participants SET last_read_at=now()
API -> WS : Event MessageRead (conversation.{id})
WS -> FL : double coche lue

== MODULE 11 : Notifications Push Web ==

FL -> FE : Autoriser les notifications
FE -> FE : navigator.serviceWorker.register('sw.js')
FE -> FE : PushManager.subscribe({ vapidPublicKey })
FE -> API : GET /api/push/vapid-public-key
API -> FE : { public_key: VAPID_PUBLIC }
FE -> API : POST /api/push/subscribe { endpoint, keys }
API -> DB : INSERT push_subscriptions

API -> FL : Envoyer notification push (hors session)
API -> API : WebPush::sendNotification(subscription, payload)
FL -> FL : Service Worker recoit push event
FL -> FL : self.registration.showNotification('Panda')
note right of FL
  Notification visible meme
  si onglet ferme (VAPID)
end note

== MODULE 12 : IA Analyse et Smart Search ==

FL -> FE : Analyser mon profil
FE -> API : POST /api/ai/analyze-profile
API -> DB : SELECT freelancer_profile + skills + reviews
API -> AI : POST /api/generate { prompt: "Analyse ce profil JSON..." }
AI -> API : { score:78, strengths:[], weaknesses:[], suggestions:[] }
API -> DB : INSERT ai_histories (type=analyze)
API -> FE : { analysis JSON }

CL -> FE : Recherche intelligente
FE -> API : POST /api/ai/smart-search { query:"dev React senior Paris 3 ans" }
API -> AI : POST /api/generate { prompt: "Convertir en JSON params..." }
AI -> API : { keywords:[], skills:[], budget_range, experience_level }
API -> DB : SELECT freelancers MATCH criteres
API -> FE : { freelancers[], params_used }

FL -> FE : Chat assistant IA
FE -> API : POST /api/ai/chat { message:"Comment optimiser mon profil?" }
API -> AI : POST /api/generate { system:"PANDA AI assistant", prompt:message }
AI -> API : { response: "Voici mes conseils..." }
API -> DB : INSERT ai_histories (type=chat)
API -> FE : { reply }

@enduml
"""

# ══════════════════════════════════════════════════════════════════════════════
#  2. CLASS — TOUS les modeles, attributs, methodes et relations
# ══════════════════════════════════════════════════════════════════════════════
DIAGRAMS["Panda_Class_Complet"] = r"""@startuml
!theme plain
skinparam backgroundColor #FFFFFF
skinparam classBackgroundColor #EBF5FB
skinparam classBorderColor #003466
skinparam classFontColor #003466
skinparam classFontSize 11
skinparam classAttributeFontSize 10
skinparam arrowColor #005A9C
skinparam arrowThickness 1.5
skinparam noteBackgroundColor #FFFDE7
skinparam noteBorderColor #F9A825
skinparam defaultFontSize 10
skinparam linetype ortho

title Panda -- Diagramme de Classes Complet (Tous les Modeles)

' ────────── UTILISATEURS ──────────────────────────────────────────────────
package "Utilisateurs & Securite" #E8F4FD {

  class User {
    +id : bigint <<PK>>
    +name : string
    +username : string <<unique>>
    +email : string <<unique>>
    +password : string <<bcrypt>>
    +role : enum[freelancer|client|admin]
    +avatar : string
    +country : string
    +timezone : string
    +phone : string
    +phone_verified : boolean
    +is_active : boolean
    +is_verified : boolean
    +is_online : boolean
    +is_platform : boolean
    +connects_balance : decimal
    +google_id : string
    +github_id : string
    +two_factor_secret : text <<AES-256>>
    +two_factor_recovery_codes : text <<AES-256>>
    +two_factor_confirmed_at : datetime
    +last_seen_at : datetime
    +deleted_at : datetime <<softDelete>>
    --
    +hasEnabledTwoFactorAuthentication() : bool
    +subscribed(slug) : bool
    +isFreelancer() : bool
    +isClient() : bool
    +isAdmin() : bool
    +getAvatarUrlAttribute() : string
  }

  class FreelancerProfile {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +bio : text
    +title : string
    +hourly_rate : decimal
    +experience_level : enum[entry|mid|senior|expert]
    +availability : enum[full_time|part_time|not_available]
    +avg_rating : decimal(3,2)
    +total_reviews : int
    +total_earned : decimal
    +total_jobs : int
    +payment_verified : boolean
    +languages : json
    +education : json
    +certifications : json
    +is_featured : boolean
  }

  class ClientProfile {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +company_name : string
    +company_size : string
    +industry : string
    +website : string
    +description : text
    +total_spent : decimal
    +total_jobs_posted : int
    +hire_rate : decimal
    +avg_rating : decimal
  }

  class Wallet {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +balance : decimal(12,2)
    +pending_balance : decimal(12,2)
    +escrow_balance : decimal(12,2)
  }

  class IdentityVerification {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +document_type : enum[passport|id_card|driving_license]
    +document_front_path : string
    +document_back_path : string
    +selfie_path : string
    +status : enum[pending|approved|rejected]
    +admin_notes : text
    +reviewed_by : bigint <<FK>>
    +reviewed_at : datetime
  }

  class AuditLog {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +action : string
    +metadata : json
    +ip_address : string
    +user_agent : string
  }

  class Portfolio {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +title : string
    +description : text
    +project_url : string
    +images : json
    +is_featured : boolean
  }

  class PushSubscription {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +endpoint : text
    +public_key : string
    +auth_token : string
  }
}

' ────────── MARKETPLACE ───────────────────────────────────────────────────
package "Marketplace" #E8F8F5 {

  class JobPosting {
    +id : bigint <<PK>>
    +client_id : bigint <<FK>>
    +category_id : bigint <<FK>>
    +title : string <<FULLTEXT>>
    +description : text <<FULLTEXT>>
    +type : enum[hourly|fixed]
    +budget_min : decimal
    +budget_max : decimal
    +status : enum[draft|open|in_progress|completed|cancelled]
    +required_skills : json
    +duration : string
    +experience_level : enum
    +proposals_count : int
    +views_count : int
  }

  class Proposal {
    +id : bigint <<PK>>
    +job_id : bigint <<FK>>
    +freelancer_id : bigint <<FK>>
    +cover_letter : text
    +bid_amount : decimal
    +milestones : json
    +estimated_duration : int
    +status : enum[pending|accepted|rejected|withdrawn]
    +is_ai_generated : boolean
    +connects_used : int
    +submitted_at : datetime
  }

  class Category {
    +id : bigint <<PK>>
    +name : string
    +slug : string
    +parent_id : bigint <<FK>>
    +icon : string
    +description : text
  }

  class Skill {
    +id : bigint <<PK>>
    +name : string
    +category_id : bigint <<FK>>
    +slug : string
  }

  class FreelancerSkill {
    +user_id : bigint <<FK>>
    +skill_id : bigint <<FK>>
    +level : enum[beginner|intermediate|expert]
  }

  class SavedJob {
    +user_id : bigint <<FK>>
    +job_id : bigint <<FK>>
    +created_at : datetime
  }

  class Review {
    +id : bigint <<PK>>
    +contract_id : bigint <<FK>>
    +reviewer_id : bigint <<FK>>
    +reviewee_id : bigint <<FK>>
    +rating : decimal(3,2)
    +comment : text
    +breakdown : json
    +is_public : boolean
  }
}

' ────────── CONTRATS ──────────────────────────────────────────────────────
package "Contrats & Jalons" #FEF9E7 {

  class Contract {
    +id : bigint <<PK>>
    +client_id : bigint <<FK>>
    +freelancer_id : bigint <<FK>>
    +job_id : bigint <<FK>>
    +proposal_id : bigint <<FK>>
    +title : string
    +type : enum[fixed|hourly]
    +status : enum[pending|active|paused|completed|cancelled|disputed]
    +fixed_price : decimal
    +hourly_rate : decimal
    +weekly_limit : int
    +escrow_amount : decimal
    +starts_at : datetime
    +deadline : date
    +completed_at : datetime
    +dispute_opened_by : bigint <<FK>>
    +dispute_reason : text
    +resolved_by : bigint <<FK>>
    +archived_at : datetime
    +deleted_at : datetime <<softDelete>>
    --
    {static} ALLOWED_TRANSITIONS : array
    {static} TERMINAL_STATUSES : array
    +canTransitionTo(status) : bool
    +isTerminal() : bool
    +hasParticipant(user) : bool
  }

  class Milestone {
    +id : bigint <<PK>>
    +contract_id : bigint <<FK>>
    +created_by : bigint <<FK>>
    +title : string
    +description : text
    +amount : decimal
    +status : enum[pending|funded|submitted|approved|rejected|disputed]
    +due_at : datetime
    +submitted_at : datetime
    +approved_at : datetime
    +submission_notes : text
    +submitted_by : bigint <<FK>>
    +rejection_reason : text
    +attachments : json
    +sort_order : int
  }

  class ContractFile {
    +id : bigint <<PK>>
    +contract_id : bigint <<FK>>
    +uploader_id : bigint <<FK>>
    +original_name : string
    +stored_path : string
    +mime_type : string
    +size_bytes : bigint
    +version : int
    +parent_id : bigint <<FK,self>>
    +description : text
    +deleted_at : datetime <<softDelete>>
  }

  class ContractActivity {
    +id : bigint <<PK>>
    +contract_id : bigint <<FK>>
    +actor_id : bigint <<FK>>
    +type : string
    +data : json
    +created_at : datetime
    ' append-only - no UPDATE/DELETE
  }

  class TimeLog {
    +id : bigint <<PK>>
    +contract_id : bigint <<FK>>
    +freelancer_id : bigint <<FK>>
    +started_at : datetime
    +ended_at : datetime
    +duration_seconds : int
    +memo : string
    +screenshot_url : string
  }

  class ContractExtension {
    +id : bigint <<PK>>
    +contract_id : bigint <<FK>>
    +requested_by : bigint <<FK>>
    +old_deadline : date
    +new_deadline : date
    +reason : text
    +status : enum[pending|accepted|rejected]
    +responded_at : datetime
  }
}

' ────────── FINANCE ───────────────────────────────────────────────────────
package "Finance & Paiements" #FDF2F8 {

  class Transaction {
    +id : bigint <<PK>>
    +wallet_id : bigint <<FK>>
    +user_id : bigint <<FK>>
    +type : enum[credit|debit|escrow|commission|withdrawal|refund]
    +direction : enum[in|out]
    +amount : decimal(12,2)
    +fee : decimal(12,2)
    +balance_after : decimal(12,2)
    +reference_type : string
    +reference_id : bigint
    +idempotency_key : string <<unique>>
    +description : text
    +counterparty_user_id : bigint <<FK>>
    +metadata : json
  }

  class Withdrawal {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +amount : decimal
    +fee : decimal
    +net : decimal
    +method : enum[stripe|bank|paypal|wise|crypto]
    +status : enum[pending|approved|rejected]
    +stripe_transfer_id : string
    +rejection_reason : text
    +processed_at : datetime
  }

  class Subscription {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +type : string
    +stripe_id : string
    +stripe_status : string
    +stripe_price : string
    +plan_slug : string
    +quantity : int
    +trial_ends_at : datetime
    +ends_at : datetime
    --
    +active() : bool
  }

  class WeeklyInvoice {
    +id : bigint <<PK>>
    +contract_id : bigint <<FK>>
    +freelancer_id : bigint <<FK>>
    +client_id : bigint <<FK>>
    +week_start : date
    +week_end : date
    +hours : decimal(8,2)
    +rate : decimal
    +total : decimal
    +status : enum[pending|paid|cancelled]
    +paid_at : datetime
  }

  class StripeWebhookEvent {
    +id : bigint <<PK>>
    +stripe_event_id : string <<unique>>
    +event_type : string
    +payload : json
    +processed_at : datetime
    ' Idempotence : ignore si deja traite
  }

  class PlatformSetting {
    +id : bigint <<PK>>
    +key : string <<unique>>
    +value : string
    +description : text
    ' fee.freelancer_pct = 0.10
    ' fee.client_pct    = 0.05
    ' fee.withdrawal_flat = 2.00
    ' fee.deposit_pct   = 0.029
    ' fee.deposit_flat  = 0.30
    ' withdrawal.min    = 20.00
  }
}

' ────────── COMMUNICATION ─────────────────────────────────────────────────
package "Communication & Notifications" #F4ECF7 {

  class Conversation {
    +id : bigint <<PK>>
    +title : string
    +contract_id : bigint <<FK>>
    +last_message_at : datetime
    +last_message_preview : string
  }

  class ConversationParticipant {
    +conversation_id : bigint <<FK>>
    +user_id : bigint <<FK>>
    +last_read_at : datetime
    +is_muted : boolean
  }

  class Message {
    +id : bigint <<PK>>
    +conversation_id : bigint <<FK>>
    +sender_id : bigint <<FK>>
    +body : text
    +type : enum[text|file|image|system|audio]
    +attachment_path : string
    +attachment_name : string
    +reply_to_id : bigint <<FK,self>>
    +is_edited : boolean
    +edited_at : datetime
    +deleted_at : datetime <<softDelete>>
  }

  class MessageReaction {
    +id : bigint <<PK>>
    +message_id : bigint <<FK>>
    +user_id : bigint <<FK>>
    +emoji : string
  }

  class Notification {
    +id : string <<UUID,PK>>
    +notifiable_id : bigint
    +notifiable_type : string
    +type : string
    +data : json
    +read_at : datetime
  }
}

' ────────── CATALOGUE & AGENCES ───────────────────────────────────────────
package "Catalogue, Agences & Talents" #EAFAF1 {

  class CatalogProject {
    +id : bigint <<PK>>
    +freelancer_id : bigint <<FK>>
    +category_id : bigint <<FK>>
    +title : string
    +slug : string <<unique>>
    +description : text
    +tiers : json
    +status : enum[pending|approved|rejected]
    +avg_rating : decimal
    +total_orders : int
    +is_featured : boolean
  }

  class CatalogOrder {
    +id : bigint <<PK>>
    +catalog_project_id : bigint <<FK>>
    +client_id : bigint <<FK>>
    +freelancer_id : bigint <<FK>>
    +tier : enum[basic|standard|premium]
    +price : decimal
    +status : enum[pending|in_progress|delivered|completed|revision|cancelled]
    +requirements : text
    +delivery_date : datetime
    +revision_count : int
    +completed_at : datetime
  }

  class CatalogReview {
    +id : bigint <<PK>>
    +catalog_order_id : bigint <<FK>>
    +catalog_project_id : bigint <<FK>>
    +client_id : bigint <<FK>>
    +rating : decimal(3,2)
    +comment : text
  }

  class Agency {
    +id : bigint <<PK>>
    +owner_id : bigint <<FK>>
    +name : string
    +slug : string <<unique>>
    +description : text
    +logo : string
    +website : string
    +is_verified : boolean
    +member_count : int
  }

  class AgencyMember {
    +agency_id : bigint <<FK>>
    +user_id : bigint <<FK>>
    +role : enum[owner|admin|member]
    +joined_at : datetime
  }

  class AgencyInvitation {
    +id : bigint <<PK>>
    +agency_id : bigint <<FK>>
    +email : string
    +token : string <<unique>>
    +expires_at : datetime
    +invited_by : bigint <<FK>>
  }

  class TalentList {
    +id : bigint <<PK>>
    +client_id : bigint <<FK>>
    +name : string
    +description : text
    +is_private : boolean
  }

  class SavedFreelancer {
    +client_id : bigint <<FK>>
    +freelancer_id : bigint <<FK>>
    +list_id : bigint <<FK>>
    +notes : text
  }

  class TaxDocument {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +type : enum[W9|W8BEN|VAT]
    +data : json
    +pdf_path : string
    +status : enum[pending|approved|rejected]
    +reviewed_by : bigint <<FK>>
    +reviewed_at : datetime
  }

  class AiHistory {
    +id : bigint <<PK>>
    +user_id : bigint <<FK>>
    +type : enum[proposal|chat|analyze|match|smart_search]
    +input : json
    +output : json
    +model : string
    +tokens_used : int
    +fallback_used : boolean
  }
}

' ─────────────── Relations ────────────────────────────────────────────────
User "1" --o "0..1" FreelancerProfile
User "1" --o "0..1" ClientProfile
User "1" --o "1"    Wallet
User "1" --o "*"    Portfolio
User "1" --o "*"    AuditLog
User "1" --o "0..1" IdentityVerification
User "1" --o "*"    PushSubscription
User "1" --o "*"    Subscription
User "1" --o "*"    AiHistory
User "1" --o "*"    JobPosting : posts (client)
User "1" --o "*"    Proposal   : submits (freelancer)
User "*" --o "*"    Skill      : via FreelancerSkill

JobPosting "1" --o "*"    Proposal
JobPosting "1" --o "0..1" Contract
Proposal   "1" --o "0..1" Contract

Contract "1" --o "*"    Milestone
Contract "1" --o "*"    ContractFile
Contract "1" --o "*"    ContractActivity
Contract "1" --o "*"    TimeLog
Contract "1" --o "*"    ContractExtension
Contract "1" --o "0..1" Review
Contract "1" --o "0..1" Conversation
Contract "1" --o "*"    WeeklyInvoice
ContractFile "0..1" --o "*" ContractFile : versions(parent_id)

Wallet "1" --o "*" Transaction
Wallet "1" --o "*" Withdrawal

Conversation "1" --o "*" ConversationParticipant
Conversation "1" --o "*" Message
Message "1"      --o "*" MessageReaction
Message "0..1"   --o "*" Message : reply_to

Agency  "1" --o "*" AgencyMember
Agency  "1" --o "*" AgencyInvitation
TalentList "1" --o "*" SavedFreelancer
CatalogProject "1" --o "*" CatalogOrder
CatalogOrder   "1" --o "0..1" CatalogReview

note top of Contract
  Machine d'etat:
  pending  -> [active, cancelled]
  active   -> [paused, completed, cancelled, disputed]
  paused   -> [active, cancelled, disputed]
  disputed -> [active, completed, cancelled]
  completed, cancelled : TERMINAL
end note

note bottom of Transaction
  LedgerService 6 Garanties:
  1. DB::transaction() atomique
  2. SELECT FOR UPDATE no race
  3. Double-entree comptable
  4. balance_after immutable
  5. idempotency_key UNIQUE
  6. Invariant SUM verifie
end note

note right of PlatformSetting
  Commissions configurables admin :
  freelancer_pct  = 10%
  client_pct      = 5%
  withdrawal_flat = $2.00
  deposit_pct     = 2.9%
  withdrawal_min  = $20.00
end note

@enduml
"""

# ══════════════════════════════════════════════════════════════════════════════
#  3. USE CASE — Tous les acteurs par domaine (layout top to bottom)
# ══════════════════════════════════════════════════════════════════════════════
DIAGRAMS["Panda_UseCase_Complet"] = r"""@startuml
!theme plain
left to right direction
skinparam backgroundColor #FFFFFF
skinparam usecaseBackgroundColor #DDEEFF
skinparam usecaseBorderColor #003466
skinparam usecaseFontSize 10
skinparam usecaseFontColor #003466
skinparam actorBackgroundColor #003466
skinparam actorFontColor #003466
skinparam actorBorderColor #001a33
skinparam actorFontSize 12
skinparam packageBackgroundColor #F4F8FB
skinparam packageBorderColor #0078D4
skinparam packageBorderThickness 2
skinparam packageFontColor #003466
skinparam packageFontSize 12
skinparam arrowColor #005A9C
skinparam arrowThickness 1.5
skinparam noteFontSize 9
skinparam defaultFontSize 10

title Panda -- Diagramme de Cas d'Utilisation Complet

' ── Acteurs humains (gauche) ──────────────────────────────────────────────
actor "Freelancer" as FL
actor "Client" as CL
actor "Admin" as AD

' ── Systemes externes (droite) ────────────────────────────────────────────
actor "Google OAuth" as GO
actor "Stripe API" as ST
actor "Ollama Mistral" as AI
actor "Laravel Reverb" as RV

rectangle "Panda Platform" {

  package "01. Authentification" #E3F2FD {
    (Inscription email) as A1
    (Connexion email / mdp) as A2
    (OAuth2 Google) as A3
    (Reinitialiser mot de passe) as A4
    (Activer 2FA TOTP) as A5
    (Codes de secours 2FA) as A6
    (Onboarding 5 etapes) as A7
    (Verification KYC) as A8
    (Profil public) as A9
  }

  package "02. Marketplace" #E8F5E9 {
    (Publier une offre) as B1
    (Recherche FULLTEXT) as B2
    (Filtrer offres) as B3
    (Recherche globale) as B4
    (Sauvegarder offre) as B5
    (Parcourir freelancers) as B6
    (Voir profil freelancer) as B7
    (Gerer mes offres) as B8
  }

  package "03. Propositions et IA" #FFF8E1 {
    (Soumettre proposition) as C1
    (Generer proposition IA) as C2
    (Analyser profil IA) as C3
    (Matcher freelancers IA) as C4
    (Recherche intelligente IA) as C5
    (Chat assistant IA) as C6
    (Accepter proposition) as C7
  }

  package "04. Contrats et Jalons" #FFF3E0 {
    (Gerer contrats actifs) as D1
    (Creer jalons) as D2
    (Financer jalon escrow) as D3
    (Soumettre travail jalon) as D4
    (Approuver jalon) as D5
    (Rejeter / Revision) as D6
    (Ouvrir litige) as D7
    (Upload fichiers version) as D8
    (Timer start / stop) as D9
    (Analytics contrat) as D10
    (Extension deadline) as D11
    (Export PDF contrat) as D12
    (Laisser un avis) as D13
  }

  package "05. Paiements et Finance" #FCE4EC {
    (Deposer fonds Stripe) as E1
    (Wallet 3 balances) as E2
    (Liberer jalon) as E3
    (Retrait gains) as E4
    (Stripe Connect) as E5
    (Plan premium) as E6
    (Portail abonnement) as E7
    (Factures hebdo) as E8
  }

  package "06. Messagerie RT" #EDE7F6 {
    (Envoyer message RT) as F1
    (Reactions emoji) as F2
    (Accuses lu / livraison) as F3
    (Indicateur de frappe) as F4
    (Notifications Push Web) as F5
    (Notifications in-app) as F6
  }

  package "07. Catalogue Services" #E8EAF6 {
    (Creer service 3 tiers) as G1
    (Commander service) as G2
    (Livrer service) as G3
    (Valider livraison) as G4
    (Evaluer service) as G5
  }

  package "08. Agences et Talents" #F1F8E9 {
    (Creer agence) as H1
    (Inviter membres token) as H2
    (Rejoindre agence) as H3
    (Listes de talents) as H4
    (Sauvegarder freelancers) as H5
    (Documents fiscaux W9/VAT) as H6
  }

  package "09. Administration" #FFEBEE {
    (Dashboard statistiques) as I1
    (Gerer utilisateurs) as I2
    (Valider KYC) as I3
    (Approuver retraits) as I4
    (Configurer commissions) as I5
    (Moderer catalogue) as I6
    (Audit logs) as I7
    (Resoudre litiges) as I8
    (Valider docs fiscaux) as I9
  }
}

' ── Freelancer ─────────────────────────────────────────────────────────────
FL --> A1
FL --> A2
FL --> A3
FL --> A5
FL --> A6
FL --> A7
FL --> A8
FL --> A9
FL --> B2
FL --> B3
FL --> B4
FL --> B7
FL --> C1
FL --> C2
FL --> C3
FL --> C6
FL --> D1
FL --> D2
FL --> D4
FL --> D8
FL --> D9
FL --> D10
FL --> D11
FL --> D12
FL --> D13
FL --> E2
FL --> E4
FL --> E5
FL --> E6
FL --> E8
FL --> F1
FL --> F2
FL --> F3
FL --> F4
FL --> F5
FL --> F6
FL --> G1
FL --> G3
FL --> H1
FL --> H2
FL --> H3
FL --> H6

' ── Client ─────────────────────────────────────────────────────────────────
CL --> A1
CL --> A2
CL --> A3
CL --> A5
CL --> A8
CL --> A9
CL --> B1
CL --> B2
CL --> B3
CL --> B4
CL --> B5
CL --> B6
CL --> B7
CL --> B8
CL --> C4
CL --> C5
CL --> C6
CL --> C7
CL --> D1
CL --> D3
CL --> D5
CL --> D6
CL --> D7
CL --> D11
CL --> D12
CL --> D13
CL --> E1
CL --> E2
CL --> E3
CL --> E6
CL --> E7
CL --> F1
CL --> F2
CL --> F3
CL --> F4
CL --> F5
CL --> F6
CL --> G2
CL --> G4
CL --> G5
CL --> H1
CL --> H2
CL --> H4
CL --> H5
CL --> H6

' ── Admin ──────────────────────────────────────────────────────────────────
AD --> I1
AD --> I2
AD --> I3
AD --> I4
AD --> I5
AD --> I6
AD --> I7
AD --> I8
AD --> I9

' ── Systemes externes ──────────────────────────────────────────────────────
GO --> A3 : OAuth2 token
ST --> E1 : checkout webhook
ST --> E3 : Stripe Transfer
ST --> E5 : Connect Express
ST --> E6 : subscription events
AI --> C2 : Mistral 7B
AI --> C3
AI --> C4
AI --> C5
AI --> C6
RV --> F1 : message.sent
RV --> F2 : reaction.toggled
RV --> F3 : message.read
RV --> F4 : user.typing
RV --> F5 : push event
RV --> F6 : notification.created

' ── Relations structurelles ────────────────────────────────────────────────
C2 ..> C1 : <<include>>
E3 ..> D3 : <<include>>
I3 ..> A8 : <<include>>
C7 ..> D1 : <<include>>

@enduml
"""





# ─────────────────────────────────────────────────────────────────────────────
def generate(name, uml_text):
    puml_path = os.path.join(OUTDIR, f"{name}.puml")
    png_path  = os.path.join(OUTDIR, f"{name}.png")

    with open(puml_path, 'w', encoding='utf-8') as f:
        f.write(uml_text.strip())

    result = subprocess.run(
        ["java", "-jar", JAR,
         "-tpng", "-charset", "UTF-8",
         "-DPLANTUML_LIMIT_SIZE=65536",
         puml_path, "-o", OUTDIR],
        capture_output=True, text=True
    )

    if result.returncode == 0 and os.path.exists(png_path):
        size = os.path.getsize(png_path) // 1024
        print(f"OK  {name}.png  ({size} KB)")
    else:
        print(f"ERR {name}")
        out = (result.stderr + result.stdout)[:600]
        if out: print(out)

print("Generation des 3 diagrammes UML complets...")
for name, uml in DIAGRAMS.items():
    generate(name, uml)
print("\nFichiers dans :", OUTDIR)
