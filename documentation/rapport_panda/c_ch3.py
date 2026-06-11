# -*- coding: utf-8 -*-
"""Chapitre 3 : Conception de la solution."""
from blocks_helpers import H1, H2, H3, P, B, NOTE, CODE, FIG, TBL


def ch3():
    return [
        H1("Chapitre 3 : Conception de la solution"),

        P("Après avoir spécifié les besoins, ce chapitre détaille la **conception** de Panda. Il présente "
          "successivement l'architecture globale et logicielle, les mécanismes de sécurité, la "
          "modélisation objet (diagramme de classes), les comportements dynamiques (diagrammes de "
          "séquence et d'états), puis la conception de la base de données et les choix technologiques. "
          "L'objectif est de traduire les exigences en une architecture claire, sécurisée et maintenable."),

        H2("I", "Architecture globale"),
        P("Panda adopte une architecture **découplée** de type *client-serveur* à trois niveaux, "
          "structurée autour d'une **API REST** et d'une **application monopage** (*Single Page "
          "Application*). Le front-end React communique avec le back-end Laravel exclusivement par des "
          "appels HTTP/JSON sécurisés, l'authentification reposant sur un **jeton Bearer** (Sanctum) "
          "transmis dans l'en-tête `Authorization`. Cette séparation nette des responsabilités améliore "
          "la maintenabilité, autorise une évolution indépendante des deux couches et prépare une "
          "éventuelle ouverture à d'autres clients (application mobile)."),
        FIG("architecture", "Architecture générale en trois couches et services externes"),
        P("La **couche de présentation** (React) gère les interfaces, les formulaires, l'état applicatif "
          "(Zustand) et la communication temps réel (Laravel Echo). La **couche application** (Laravel) "
          "concentre la logique métier : routage, middlewares, validation, services et règles "
          "d'autorisation. La **couche de données** (MySQL) assure le stockage relationnel et l'intégrité "
          "référentielle, complétée par Redis pour le cache et la file d'attente. Autour de ce noyau "
          "gravitent les **services externes** : Stripe (paiements), Google (OAuth), Laravel Reverb "
          "(WebSockets) et un serveur de modèle de langage (IA)."),
        TBL(["Couche", "Technologie", "Rôle principal"],
            [["Présentation", "React 19 · Vite · TailwindCSS · Zustand", "Interfaces, état, interactions, temps réel"],
             ["Application", "Laravel 12 (PHP 8.2) · Sanctum", "API REST, logique métier, sécurité, services"],
             ["Données", "MySQL 8 · Eloquent ORM · Redis", "Persistance, intégrité, cache, file d'attente"]],
            caption="Synthèse des couches de l'architecture",
            widths=[0.22, 0.42, 0.36]),

        H2("II", "Architecture logicielle en couches"),
        P("Côté back-end, Panda applique le patron **MVC** de Laravel, enrichi d'une **couche de services "
          "métier** dédiée. Ce choix est essentiel : il permet d'extraire la logique complexe (et "
          "notamment financière) des contrôleurs pour la concentrer dans des services réutilisables, "
          "testables et garants de la cohérence. Une requête traverse ainsi une chaîne de responsabilités "
          "clairement délimitée."),
        FIG("mvc", "Organisation en couches du back-end (MVC enrichi de services métier)"),
        P("Le traitement d'une requête suit le cheminement suivant : la **route** dirige vers un "
          "**contrôleur**, après passage par les **middlewares** (authentification, limitation de débit, "
          "rôle). La validation est déléguée à un **FormRequest**. Le contrôleur orchestre alors le "
          "traitement en s'appuyant sur un **service métier**, qui manipule les **modèles Eloquent** et la "
          "base de données. Des préoccupations transverses — **politiques d'autorisation**, **événements "
          "et écouteurs** (notifications, audit, diffusion temps réel) — s'appliquent tout au long de la "
          "chaîne. La réponse est finalement sérialisée en JSON."),
        NOTE("Le principe directeur est la **séparation des responsabilités** : un contrôleur orchestre "
             "mais ne contient pas la logique métier sensible ; celle-ci réside dans des services "
             "(`LedgerService`, `StripeService`, `NotificationService`, etc.), seuls habilités à muter les "
             "données critiques."),
        H3("1", "Vue en paquetages"),
        P("D'un point de vue logique, l'application se décompose en **paquetages** cohérents, chacun "
          "regroupant les contrôleurs, services et modèles d'un même domaine. Ce découpage favorise la "
          "modularité et limite le couplage entre domaines."),
        TBL(["Paquetage", "Contenu et responsabilité"],
            [["Auth", "Inscription, connexion, OAuth, 2FA, réinitialisation, KYC"],
             ["Marketplace", "Offres, propositions, catalogue, recherche, profils"],
             ["Contracts", "Contrats, jalons, fichiers, temps, extensions, activité"],
             ["Payments", "Portefeuille, séquestre, retraits, Stripe, facturation"],
             ["Communication", "Messagerie temps réel, notifications, Web Push"],
             ["AI", "Génération, correspondance, analyse, recherche intelligente"],
             ["Talent & Agency", "Favoris, listes de talents, agences et invitations"],
             ["Admin", "Tableau de bord, modération, finance, gestion des litiges"]],
            caption="Décomposition logique en paquetages",
            widths=[0.24, 0.76]),

        H2("III", "Sécurité et authentification"),
        P("La sécurité étant une exigence de premier ordre, Panda met en œuvre une **défense en "
          "profondeur** combinant plusieurs mécanismes complémentaires."),
        B(["**Authentification par jeton** : Laravel Sanctum émet un jeton Bearer à la connexion ; "
           "chaque requête protégée le présente dans l'en-tête `Authorization` ;",
           "**Authentification à deux facteurs (2FA)** : code temporel TOTP et codes de secours, pour "
           "renforcer la protection des comptes sensibles ;",
           "**Authentification sociale** : connexion via Google (OAuth 2.0) à l'aide de Laravel Socialite ;",
           "**Hachage des mots de passe** : algorithme bcrypt ; aucun mot de passe n'est stocké en clair ;",
           "**Limitation de débit** (*throttling*) : les routes d'authentification (10 req/min), de "
           "réinitialisation (5 req/min) et d'IA (20 req/min) sont protégées contre les abus ;",
           "**Politiques d'autorisation** (*Policies*) : chaque action sensible vérifie que l'utilisateur "
           "y est habilité (par exemple, seul le client d'un contrat peut en libérer les jalons) ;",
           "**Vérification d'identité (KYC)** : soumission et validation de pièces justificatives ;",
           "**Journal d'audit** (*audit logs*) : traçabilité des actions sensibles ;",
           "**Vérification de signature** des webhooks Stripe et **idempotence** des événements reçus."]),
        P("Le diagramme de séquence ci-dessous illustre le processus d'authentification, intégrant la "
          "limitation de débit, la vérification des identifiants et la 2FA."),
        FIG("seq_auth", "Diagramme de séquence — authentification (Sanctum + 2FA)"),
        P("Le **cycle de vie du jeton** est maîtrisé : émis à la connexion, il peut être révoqué à la "
          "déconnexion et n'est jamais exposé au-delà du strict nécessaire. Côté client, il est conservé "
          "de façon contrôlée et systématiquement joint aux requêtes par l'intercepteur Axios. Cette "
          "approche, sans état côté serveur, est parfaitement adaptée à une application monopage et "
          "facilite la montée en charge."),
        P("La **protection des données personnelles** complète ce dispositif : les informations sensibles "
          "(pièces d'identité du KYC) sont stockées sur un disque privé, non accessible publiquement, et "
          "ne sont consultables que par l'administrateur via des points d'accès protégés. Les actions "
          "critiques sont par ailleurs consignées dans un **journal d'audit**, assurant la traçabilité "
          "indispensable à toute investigation ultérieure."),

        H2("IV", "Diagramme de classes"),
        P("Le diagramme de classes modélise la structure statique du système : les entités métier, leurs "
          "attributs et leurs relations. Il constitue la traduction objet du domaine et le fondement de "
          "l'architecture de la base de données. En raison de la richesse du modèle (plus de 30 classes), "
          "il est présenté en **trois sous-systèmes** distincts, chacun regroupant des classes cohérentes "
          "par domaine fonctionnel."),

        H3("a", "Sous-système 1 — Identité, Sécurité & Finance"),
        P("Ce premier sous-système regroupe les entités liées à la **gestion des utilisateurs**, à la "
          "**sécurité** et au **noyau financier**. On y trouve la classe centrale `User` avec ses profils "
          "associés (`FreelancerProfile`, `ClientProfile`) et la vérification d'identité "
          "(`IdentityVerification`). Le noyau financier comprend `Wallet` (portefeuille à trois soldes : "
          "disponible, séquestre, en attente), `Transaction` (grand livre en double-entrée, immuable) et "
          "`WithdrawalRequest` (demandes de retrait avec cycle de validation)."),
        FIG("class_part1", "Diagramme de classes — Sous-système 1 : Identité, Sécurité & Finance"),
        TBL(["Classe", "Rôle dans le sous-système"],
            [["User", "Entité centrale : agrège l'identité, le rôle et les préférences de chaque acteur"],
             ["FreelancerProfile", "Profil freelance : compétences, tarif horaire, disponibilité, portfolio"],
             ["ClientProfile", "Profil client : entreprise, secteur, localisation"],
             ["IdentityVerification", "KYC : pièces justificatives, statut (pending/approved/rejected)"],
             ["Wallet", "Portefeuille : 3 soldes distincts (balance, escrow_balance, pending_balance)"],
             ["Transaction", "Grand livre : chaque mouvement financier, immuable, avec balance_after"],
             ["WithdrawalRequest", "Demande de retrait vers Stripe Connect, validée par l'admin"]],
            caption="Classes du sous-système Identité, Sécurité & Finance",
            widths=[0.28, 0.72]),

        H3("b", "Sous-système 2 — Marketplace, Contrats & Communication"),
        P("Ce deuxième sous-système constitue le **cœur opérationnel** de la plateforme. La classe "
          "`Contract` en est le pivot absolu : elle naît de l'acceptation d'une `Proposal` ou d'une "
          "`CatalogOrder`, relie le client et le freelance, et constitue le contexte de tous les "
          "jalons, fichiers, transactions et conversations. Le flux complet de mise en relation "
          "est visible : `JobPosting` → `Proposal` → `Contract` → `Milestone` → paiement libéré."),
        FIG("class_part2", "Diagramme de classes — Sous-système 2 : Marketplace, Contrats & Communication"),
        TBL(["Classe", "Rôle dans le sous-système"],
            [["JobPosting", "Offre publiée par le client : titre, budget, catégorie, statut"],
             ["Proposal", "Candidature du freelance : lettre, montant, délai, statut"],
             ["Contract", "Pivot : lie client + freelance, porte l'escrow_amount et le statut (litige)"],
             ["Milestone", "Jalon d'un contrat : montant, soumission, approbation, libération"],
             ["ContractFile", "Fichier versionné attaché au contrat (livrables)"],
             ["TimeEntry", "Entrée de suivi du temps (contrats horaires)"],
             ["Conversation", "Canal de messagerie lié à un contrat ou une offre"],
             ["Message", "Message temps réel avec accusé de lecture et réactions"],
             ["Review", "Évaluation bilatérale post-mission (note + commentaire)"]],
            caption="Classes du sous-système Marketplace, Contrats & Communication",
            widths=[0.28, 0.72]),

        H3("c", "Sous-système 3 — Catalogue, Agences & Talents"),
        P("Ce troisième sous-système couvre les fonctionnalités différenciantes de Panda : le "
          "**catalogue de services packagés** (inspiré de Fiverr), la **gestion des agences** "
          "(regroupement de freelances sous une bannière) et les **listes de talents**. L'IA est "
          "représentée par `AiHistory` qui historise chaque interaction avec le modèle de langage. "
          "`TaxDocument` trace les obligations fiscales annuelles des freelances."),
        FIG("class_part3", "Diagramme de classes — Sous-système 3 : Catalogue, Agences & Talents"),
        TBL(["Classe", "Rôle dans le sous-système"],
            [["CatalogProject", "Service packagé du freelance : 3 paliers tarifaires, modération admin"],
             ["CatalogOrder", "Commande d'un palier par un client : cycle de livraison complet"],
             ["CatalogReview", "Évaluation d'une commande catalogue"],
             ["Agency", "Agence : bannière regroupant plusieurs freelances, propriétaire désigné"],
             ["AgencyMember", "Appartenance d'un freelance à une agence (rôle : owner/admin/member)"],
             ["AgencyInvitation", "Invitation sécurisée par jeton à rejoindre une agence"],
             ["TalentList", "Liste de freelances favoris constituée par un client"],
             ["SavedFreelancer", "Favori d'un freelance dans une liste de talents"],
             ["AiHistory", "Historique des interactions IA (prompt, réponse, tokens utilisés)"],
             ["TaxDocument", "Document fiscal annuel généré pour les freelances actifs"]],
            caption="Classes du sous-système Catalogue, Agences & Talents",
            widths=[0.28, 0.72]),
        P("On distingue plusieurs regroupements cohérents dans l'ensemble du modèle : les entités "
          "d'**identité** (`User`, profils) ; le **flux de mise en relation** (`JobPosting` → `Proposal` "
          "→ `Contract` → `Milestone`) ; le **noyau financier** (`Wallet`, `Transaction`) ; la "
          "**communication** (`Conversation`, `Message`, `Review`) ; et le **catalogue** "
          "(`CatalogProject`, `CatalogOrder`). La classe `Contract` joue un rôle pivot absolu : elle relie "
          "un client et un freelance, agrège des jalons et constitue le contexte des mouvements financiers "
          "et des conversations."),

        H3("1", "Groupe Identité et Authentification"),
        P("Ce groupe regroupe les classes liées à la gestion des utilisateurs et de leurs profils :"),
        TBL(["Classe", "Attributs principaux", "Relations clés"],
            [["User", "id, name, email, password, role, email_verified_at, two_factor_secret", "1 FreelancerProfile, 1 ClientProfile, 1 Wallet"],
             ["FreelancerProfile", "user_id, title, bio, skills, hourly_rate, availability, rating", "many Proposals, many CatalogProjects"],
             ["ClientProfile", "user_id, company_name, description, location, website", "many JobPostings, many CatalogOrders"],
             ["Agency", "id, owner_id, name, description, slug, logo", "many FreelancerProfiles (membres)"],
             ["IdentityVerification", "user_id, status, document_type, document_path, reviewed_at", "1 User"]],
            caption="Classes du groupe Identité",
            widths=[0.24, 0.44, 0.32]),

        H3("2", "Groupe Marketplace (Offres et Propositions)"),
        P("Ce groupe modélise le premier circuit de mise en relation (le client publie, le freelance postule) :"),
        TBL(["Classe", "Attributs principaux", "Relations clés"],
            [["JobPosting", "id, client_id, title, description, category, budget, type, status", "many Proposals, 0..1 Contract"],
             ["Proposal", "id, job_id, freelancer_id, cover_letter, amount, duration, status", "1 JobPosting, 1 Freelancer"],
             ["CatalogProject", "id, freelancer_id, title, description, category, status, slug", "3 CatalogTiers, many CatalogOrders"],
             ["CatalogTier", "id, catalog_id, tier, price, delivery_days, description, revisions", "1 CatalogProject"],
             ["CatalogOrder", "id, client_id, tier_id, status, delivery_at, requirements", "1 CatalogTier, 1 Contract"]],
            caption="Classes du groupe Marketplace",
            widths=[0.24, 0.46, 0.30]),

        H3("3", "Groupe Contrats et Jalons"),
        P("Ce groupe modélise la collaboration une fois l'accord conclu. Le `Contract` est la "
          "**classe pivot** autour de laquelle gravitent toutes les activités opérationnelles :"),
        TBL(["Classe", "Attributs principaux", "Relations clés"],
            [["Contract", "id, client_id, freelancer_id, source_type, source_id, status, total_amount", "many Milestones, 1 Conversation"],
             ["Milestone", "id, contract_id, title, amount, due_date, status, submitted_at", "1 Contract, many Transactions"],
             ["ContractFile", "id, contract_id, uploader_id, filename, path, size, version", "1 Contract"],
             ["TimeEntry", "id, contract_id, freelancer_id, started_at, stopped_at, duration_minutes", "1 Contract"],
             ["ExtensionRequest", "id, contract_id, requested_by, new_due_date, reason, status", "1 Contract"]],
            caption="Classes du groupe Contrats et Jalons",
            widths=[0.24, 0.46, 0.30]),

        H3("4", "Groupe Finance (Wallet et Transactions)"),
        P("Ce groupe constitue le **noyau financier** de la plateforme. Il implémente un "
          "**grand livre comptable en double-entrée** garantissant l'intégrité de chaque "
          "mouvement de fonds :"),
        TBL(["Classe", "Attributs principaux", "Rôle"],
            [["Wallet", "id, user_id, balance_available, balance_escrow, balance_pending, currency", "Portefeuille de l'utilisateur"],
             ["Transaction", "id, wallet_id, type, amount, balance_after, reference_type, reference_id, idempotency_key", "Écriture comptable unitaire"],
             ["WithdrawalRequest", "id, freelancer_id, amount, method, status, stripe_payout_id, processed_at", "Demande de retrait"],
             ["StripeWebhookEvent", "id, stripe_event_id, type, payload, processed, processed_at", "Idempotence des webhooks"]],
            caption="Classes du groupe Finance",
            widths=[0.22, 0.48, 0.30]),

        H3("5", "Groupe Communication et Évaluations"),
        P("Ce groupe couvre la messagerie temps réel entre les parties et le système d'évaluations "
          "post-mission, essentiels à la confiance sur la plateforme :"),
        TBL(["Classe", "Attributs principaux", "Relations clés"],
            [["Conversation", "id, contract_id, type, last_message_at", "2 Users (participants), many Messages"],
             ["Message", "id, conversation_id, sender_id, content, type, read_at", "1 Conversation, many Attachments"],
             ["MessageReaction", "id, message_id, user_id, emoji", "1 Message"],
             ["Review", "id, contract_id, reviewer_id, reviewee_id, rating, comment, type", "1 Contract, 2 Users"],
             ["Notification", "id, user_id, type, data, read_at, notifiable_type, notifiable_id", "1 User"]],
            caption="Classes du groupe Communication et Évaluations",
            widths=[0.24, 0.46, 0.30]),

        H2("V", "Diagrammes de séquence dynamiques"),
        P("Au-delà de la structure, les diagrammes de séquence décrivent les **interactions temporelles** "
          "entre objets pour les scénarios les plus critiques. Nous en présentons trois, complétés par une "
          "description pas-à-pas mettant en évidence les invariants et les garde-fous."),
        H3("1", "Financement du séquestre et libération de jalon"),
        P("Ce scénario est le cœur transactionnel de la plateforme. Il met en jeu le `LedgerService`, qui "
          "garantit l'atomicité et l'intégrité de chaque mouvement de fonds."),
        FIG("seq_escrow", "Diagramme de séquence — financement du séquestre et libération de jalon"),
        P("Le scénario se déroule en deux temps. Lors du **financement du séquestre** :"),
        B(["1. Le client appelle `POST /payments/contracts/{id}/fund-escrow` avec le montant souhaité ;",
           "2. Le contrôleur délègue au `LedgerService.fundEscrow()` ;",
           "3. Le service ouvre une transaction SQL et verrouille le portefeuille du client (`FOR UPDATE`) ;",
           "4. Il vérifie que le solde disponible est suffisant ; sinon, il lève une exception métier ;",
           "5. Il décrémente `balance` et incrémente `escrow_balance` du portefeuille ;",
           "6. Il incrémente `escrow_amount` du contrat et crée une écriture dans `transactions` ;",
           "7. La transaction SQL est validée (commit) ; le freelance est notifié."]),
        P("Lors de la **libération d'un jalon** :"),
        B(["1. Le client approuve le jalon (`POST /milestones/{id}/approve`) ;",
           "2. `LedgerService.releaseMilestone()` vérifie que le contrat n'est pas en litige ;",
           "3. Il calcule la commission (taux paramétrable dans `platform_settings`) ;",
           "4. Sous verrou SQL, il effectue trois écritures atomiques : drainage séquestre (client), "
              "crédit commission (plateforme), crédit net (freelance) ;",
           "5. Chaque écriture enregistre `balance_after` (solde résultant), garantissant la réconciliabilité ;",
           "6. Le jalon passe à l'état `paid` et le contrat est réévalué (complet si tous les jalons sont payés) ;",
           "7. Le freelance reçoit une notification de crédit et un événement est consigné dans l'activité du contrat."]),
        NOTE("La **clé d'idempotence** jointe à chaque opération garantit qu'un appel dupliqué (rejeu réseau, "
             "double clic) ne produit qu'une seule écriture — propriété critique sur une plateforme financière."),
        H3("2", "Dépôt de fonds via Stripe"),
        P("Le dépôt s'appuie sur Stripe Checkout. La confirmation du paiement parvient de façon asynchrone "
          "par un **webhook** signé, dont l'idempotence est assurée par la table `stripe_webhook_events`."),
        FIG("seq_stripe", "Diagramme de séquence — dépôt de fonds via Stripe"),
        P("La séquence de dépôt illustre la gestion des événements asynchrones :"),
        B(["1. Le client initie un dépôt : `POST /payments/deposit` — le contrôleur demande à Stripe une session Checkout ;",
           "2. L'interface React redirige l'utilisateur vers la page de paiement hébergée par Stripe ;",
           "3. L'utilisateur saisit ses informations de carte ; Stripe valide le paiement ;",
           "4. Stripe envoie un webhook `payment_intent.succeeded` au point d'accès public `/payments/stripe/webhook` ;",
           "5. Le contrôleur vérifie la signature HMAC (secret de webhook Stripe) ; toute requête non signée est rejetée ;",
           "6. L'idempotence est vérifiée : si l'identifiant de l'événement existe déjà dans `stripe_webhook_events`, "
              "la requête est ignorée (renvoi 200 sans traitement) ;",
           "7. Le `LedgerService.deposit()` est appelé avec la clé d'idempotence = identifiant de l'événement Stripe ;",
           "8. Le portefeuille du client est crédité et une écriture immuable est ajoutée au grand livre."]),
        H3("3", "Génération de proposition par IA"),
        P("Le freelance peut solliciter l'assistant IA pour rédiger une première version de proposition, "
          "qu'il édite ensuite. L'appel au modèle est limité en débit pour maîtriser les coûts, et chaque "
          "interaction est historisée."),
        FIG("seq_ai", "Diagramme de séquence — génération de proposition assistée par IA"),
        P("La séquence de génération IA met en évidence le rôle de l'historisation et de la limitation :"),
        B(["1. Le freelance consulte une offre et clique sur « Générer une proposition avec l'IA » ;",
           "2. La requête `POST /ai/generate-proposal` est soumise au middleware de limitation "
              "(`throttle:20,1` — 20 requêtes par minute) ;",
           "3. `AIController` extrait l'offre et le profil du freelance, puis construit le prompt contextualisé ;",
           "4. Le service IA envoie le prompt au serveur Ollama (Mistral) en HTTP local ;",
           "5. Le modèle génère le texte de proposition ; la réponse est renvoyée au contrôleur ;",
           "6. L'échange (prompt + réponse + tokens utilisés) est persisté dans `ai_histories` ;",
           "7. Le texte généré est retourné au front-end ; le freelance le lit, l'adapte et soumet la proposition."]),

        H2("VI", "Choix technologiques"),
        P("Les technologies ont été sélectionnées pour leur maturité, leur écosystème et leur adéquation "
          "au besoin. Les tableaux suivants récapitulent la pile retenue."),
        TBL(["Back-end", "Rôle"],
            [["Laravel 12 (PHP 8.2)", "Framework MVC, API REST, écosystème riche"],
             ["Laravel Sanctum", "Authentification par jeton pour SPA"],
             ["Laravel Socialite", "Authentification OAuth (Google)"],
             ["Laravel Reverb", "Serveur WebSocket pour le temps réel"],
             ["Stripe PHP SDK", "Paiements, Checkout et Connect"],
             ["MySQL 8 · Eloquent ORM", "Base relationnelle et couche d'abstraction"],
             ["Redis", "Cache, sessions et file d'attente"]],
            caption="Pile technologique back-end",
            widths=[0.34, 0.66]),
        TBL(["Front-end", "Rôle"],
            [["React 19 + Vite", "Bibliothèque UI et outil de build rapide"],
             ["TailwindCSS", "Framework CSS utilitaire, design responsive"],
             ["Zustand", "Gestion d'état globale légère"],
             ["React Router · Axios", "Navigation SPA et client HTTP"],
             ["Laravel Echo · Pusher-js", "Réception des événements temps réel"],
             ["Framer Motion · Recharts", "Animations et visualisation de données"]],
            caption="Pile technologique front-end",
            widths=[0.34, 0.66]),
        TBL(["Services tiers & IA", "Rôle"],
            [["Stripe (Checkout + Connect)", "Encaissement des dépôts et versement des retraits"],
             ["Google OAuth (Socialite)", "Connexion sociale en un clic"],
             ["Ollama + Mistral 7B", "Serveur local de modèle de langage (IA générative)"],
             ["Laravel Reverb", "Serveur WebSocket open-source pour le temps réel"],
             ["Web Push (VAPID)", "Notifications push navigateur sans application mobile"]],
            caption="Services tiers et IA intégrés",
            widths=[0.34, 0.66]),

        H3("1", "Environnement et outils de développement"),
        P("Au-delà de la pile applicative, un ensemble d'outils a structuré l'environnement de "
          "développement tout au long du projet. Leur choix a été guidé par la productivité, "
          "la collaboration et la reproductibilité."),
        TBL(["Outil", "Catégorie", "Usage dans le projet"],
            [["Visual Studio Code", "Éditeur de code", "Développement back-end (PHP/Laravel) et front-end (React/JSX) avec extensions dédiées"],
             ["Composer", "Gestionnaire PHP", "Installation et mise à jour des dépendances Laravel et paquets PHP"],
             ["npm + Vite", "Build front-end", "Gestion des paquets JavaScript et serveur de développement avec rechargement instantané"],
             ["Git + GitHub", "Versionnement", "Historique du code, branches, revues et sauvegarde distante du projet"],
             ["Postman", "Test d'API", "Test manuel et documentation interactive de tous les points d'API REST"],
             ["phpMyAdmin", "Administration BDD", "Visualisation et manipulation de la base de données MySQL en développement"],
             ["Docker + Compose", "Conteneurisation", "Environnement de déploiement reproductible (nginx, PHP-FPM, MySQL, Redis, Reverb)"],
             ["Ollama", "IA locale", "Serveur de modèle de langage exécuté en local (Mistral 7B) pour les services IA"],
             ["Stripe CLI", "Test paiements", "Simulation de webhooks Stripe en local pour tester le cycle de paiement complet"],
             ["Draw.io / PlantUML", "Modélisation", "Création des diagrammes UML (cas d'utilisation, classes, séquence, états)"],
             ["Figma", "UI/UX", "Maquettage des interfaces avant implémentation React"]],
            caption="Outils et environnement de développement du projet Panda",
            widths=[0.24, 0.20, 0.56]),

        H3("2", "Pourquoi Laravel et React ?"),
        P("Le choix de **Laravel 12** comme framework back-end repose sur plusieurs avantages décisifs "
          "pour ce projet :"),
        B(["**Écosystème complet** : Sanctum (auth), Sanctum (tokens), Socialite (OAuth), Reverb "
           "(WebSockets), Horizon (queues), Telescope (debug) — tout est natif ou premier niveau ;",
           "**Éloquent ORM** : syntaxe expressive des relations, migrations versionnées, factories "
           "et seeders pour les tests automatisés ;",
           "**Artisan CLI** : génération de code, migrations, tests et tâches planifiées depuis "
           "la ligne de commande ;",
           "**Architecture MVC enrichie** : séparation claire des responsabilités, politiques "
           "d'autorisation natives, FormRequests pour la validation centralisée ;",
           "**Communauté et documentation** : base d'utilisateurs mondiale, documentation exhaustive "
           "et mises à jour régulières."]),
        P("Le choix de **React 19** comme bibliothèque front-end est justifié par :"),
        B(["**Composants réutilisables** : chaque élément d'interface est un composant autonome, "
           "facilitant la maintenance et la cohérence visuelle ;",
           "**State management** : Zustand offre une gestion d'état globale légère sans la "
           "complexité de Redux ;",
           "**Vite** : serveur de développement ultra-rapide avec HMR (remplacement de module à "
           "chaud), idéal pour les itérations rapides ;",
           "**Écosystème** : React Router pour la navigation SPA, Axios pour les requêtes API, "
           "Framer Motion pour les animations, Recharts pour la visualisation ;",
           "**TailwindCSS** : classes utilitaires permettant un design cohérent et responsive "
           "sans écrire de CSS personnalisé."]),
        NOTE("La combinaison **Laravel REST API + React SPA** est aujourd'hui le standard de "
             "facto pour les applications web modernes nécessitant performance, sécurité et "
             "évolutivité. Cette architecture découplée permet également d'envisager une "
             "application mobile native consommant la même API sans modification du back-end."),

        H2("VII", "Conclusion du chapitre"),
        P("Ce chapitre a présenté la conception complète de Panda : une architecture découplée et en "
          "couches, des mécanismes de sécurité en profondeur, une modélisation objet structurée autour du "
          "contrat, des comportements dynamiques formalisés par des diagrammes de séquence, et les choix "
          "technologiques retenus. Cette conception fournit un plan directeur cohérent. Le chapitre suivant "
          "en présente la **réalisation** concrète, illustrée par des extraits de code et la présentation "
          "des interfaces."),
    ]
