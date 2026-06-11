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
          "attributs et leurs relations. Il constitue la traduction objet du domaine et la base de la "
          "conception de la base de données. La figure suivante en présente les classes principales."),
        FIG("class", "Diagramme de classes — entités métier principales"),
        P("On distingue plusieurs regroupements cohérents : les entités d'**identité** (`User`, "
          "`FreelancerProfile`, `ClientProfile`, `Agency`) ; le **flux de mise en relation** (`JobPosting` "
          "→ `Proposal` → `Contract` → `Milestone`) ; le **noyau financier** (`Wallet`, `Transaction`) ; "
          "la **communication** (`Conversation`, `Message`, `Review`) ; et le **catalogue** "
          "(`CatalogProject`, `CatalogOrder`). La classe `Contract` joue un rôle pivot : elle relie un "
          "client et un freelance, agrège des jalons et constitue le contexte des mouvements financiers et "
          "des conversations."),

        H2("V", "Diagrammes de séquence dynamiques"),
        P("Au-delà de la structure, les diagrammes de séquence décrivent les **interactions temporelles** "
          "entre objets pour les scénarios les plus critiques. Nous en présentons trois."),
        H3("1", "Financement du séquestre et libération de jalon"),
        P("Ce scénario est le cœur transactionnel de la plateforme. Il met en jeu le `LedgerService`, qui "
          "garantit l'atomicité et l'intégrité de chaque mouvement de fonds."),
        FIG("seq_escrow", "Diagramme de séquence — financement du séquestre et libération de jalon"),
        P("À la libération, le service calcule la **commission** de la plateforme, crédite le freelance du "
          "montant net, débite le séquestre et enregistre chaque écriture en **double-entrée** avec son "
          "solde résultant (`balance_after`), le tout dans une **transaction verrouillée** et "
          "**idempotente**."),
        H3("2", "Dépôt de fonds via Stripe"),
        P("Le dépôt s'appuie sur Stripe Checkout. La confirmation du paiement parvient de façon asynchrone "
          "par un **webhook** signé, dont l'idempotence est assurée par la table `stripe_webhook_events`."),
        FIG("seq_stripe", "Diagramme de séquence — dépôt de fonds via Stripe"),
        H3("3", "Génération de proposition par IA"),
        P("Le freelance peut solliciter l'assistant IA pour rédiger une première version de proposition, "
          "qu'il édite ensuite. L'appel au modèle est limité en débit pour maîtriser les coûts, et chaque "
          "interaction est historisée."),
        FIG("seq_ai", "Diagramme de séquence — génération de proposition assistée par IA"),

        H2("VI", "Diagrammes d'états"),
        P("Les diagrammes d'états-transitions décrivent le **cycle de vie** des objets métier soumis à des "
          "changements d'état. Deux entités le justifient particulièrement : le contrat et le jalon."),
        FIG("state_contract", "Diagramme d'états — cycle de vie d'un contrat"),
        P("Un contrat naît **actif** à l'acceptation d'une proposition. Il peut être mené à son terme "
          "(**terminé**) lorsque tous les jalons sont payés, **annulé**, ou basculer en **litige** ; dans "
          "ce dernier cas, l'arbitrage de l'administrateur le fait évoluer vers un état **résolu**. Le gel "
          "d'un contrat en litige suspend toute libération de fonds — garde-fou implémenté directement "
          "dans le moteur de paiement."),
        FIG("state_milestone", "Diagramme d'états — cycle de vie d'un jalon"),
        P("Un jalon est initialement **en attente**. Le freelance le **soumet** une fois le travail livré ; "
          "le client l'**approuve** (déclenchant le versement, état **payé**) ou le **rejette** avec un "
          "motif, autorisant une re-soumission."),

        H2("VII", "Conception de la base de données"),
        P("La base de données relationnelle est la colonne vertébrale de la persistance. Sa conception a "
          "suivi la méthode **Merise** : un modèle conceptuel (MCD) indépendant de toute technologie, puis "
          "sa traduction en modèle logique (MLD) directement implémentable en MySQL."),
        H3("1", "Modèle Conceptuel de Données (MCD)"),
        P("Le MCD représente les **entités**, leurs **attributs** et les **associations** qui les relient, "
          "assorties de leurs cardinalités. La figure suivante en présente une vue centrée sur les "
          "entités principales."),
        FIG("mcd", "Modèle Conceptuel de Données (MCD) — vue principale"),
        H3("2", "Modèle Logique de Données (MLD)"),
        P("Le MLD traduit le MCD en **schéma relationnel** : chaque entité devient une table, chaque "
          "association se matérialise par des clés étrangères (notées #) ou des tables de liaison. Les "
          "clés primaires sont soulignées. Le schéma simplifié des tables principales est le suivant :"),
        CODE("Modèle Logique de Données (extrait des tables principales)",
             "users(id, name, email, password, role, is_platform, two_factor_secret, ...)\n"
             "freelancer_profiles(id, #user_id, title, bio, hourly_rate, availability, ...)\n"
             "client_profiles(id, #user_id, company, website, ...)\n"
             "job_postings(id, #client_id, #category_id, title, description, budget, type, status)\n"
             "proposals(id, #job_id, #freelancer_id, cover_letter, bid_amount, status)\n"
             "contracts(id, #client_id, #freelancer_id, #job_id, #proposal_id, title, type,\n"
             "          escrow_amount, status, disputed_at, dispute_reason)\n"
             "milestones(id, #contract_id, title, amount, status, approved_at, #created_by)\n"
             "wallets(id, #user_id, balance, pending_balance, escrow_balance, currency)\n"
             "transactions(id, #wallet_id, #user_id, #contract_id, #milestone_id, reference,\n"
             "             type, direction, amount, fee, balance_after, idempotency_key, status)\n"
             "withdrawals(id, #user_id, #wallet_id, amount, fee, net, method, status, #reviewed_by)\n"
             "conversations(id, type, #contract_id, #job_id, last_message_at)\n"
             "messages(id, #conversation_id, #sender_id, body, type, attachments, read_at, #reply_to_id)\n"
             "reviews(id, #contract_id, #reviewer_id, #reviewee_id, rating, comment)\n"
             "catalog_projects(id, #freelancer_id, title, slug, tiers, status)\n"
             "catalog_orders(id, #catalog_project_id, #buyer_id, tier, amount, status)\n"
             "agencies(id, #owner_id, name, slug, bio)   ·   subscriptions(id, #user_id, plan, status)"),
        H3("3", "Dictionnaire de données (extrait)"),
        P("Le dictionnaire de données précise, pour chaque table, le type et la signification des champs. "
          "Nous en donnons un extrait pour les deux tables au cœur de l'intégrité financière : `wallets` "
          "et `transactions`."),
        TBL(["Champ (wallets)", "Type", "Description"],
            [["id", "BIGINT (PK)", "Identifiant du portefeuille"],
             ["user_id", "BIGINT (FK)", "Propriétaire du portefeuille"],
             ["balance", "DECIMAL(12,2)", "Solde disponible (retirable)"],
             ["pending_balance", "DECIMAL(12,2)", "Fonds en attente (retrait en cours)"],
             ["escrow_balance", "DECIMAL(12,2)", "Fonds bloqués en séquestre"],
             ["currency", "VARCHAR", "Devise (USD par défaut)"]],
            caption="Dictionnaire de données — table wallets",
            widths=[0.26, 0.22, 0.52]),
        TBL(["Champ (transactions)", "Type", "Description"],
            [["id", "BIGINT (PK)", "Identifiant de la transaction"],
             ["wallet_id / user_id", "BIGINT (FK)", "Portefeuille et utilisateur concernés"],
             ["contract_id / milestone_id", "BIGINT (FK, nul.)", "Contexte financier éventuel"],
             ["reference", "VARCHAR (unique)", "Référence lisible (DEP-…, ESC-…, PAY-…)"],
             ["type", "ENUM", "credit, debit, escrow, release, refund, withdrawal, fee"],
             ["direction", "ENUM", "in / out (sens du mouvement)"],
             ["amount / fee", "DECIMAL(12,2)", "Montant et frais associés"],
             ["balance_after", "DECIMAL(12,2)", "Solde résultant (immuable, pour l'audit)"],
             ["idempotency_key", "VARCHAR (nul.)", "Clé garantissant l'unicité de l'opération"],
             ["status", "ENUM", "pending, completed, failed, cancelled"]],
            caption="Dictionnaire de données — table transactions",
            widths=[0.26, 0.22, 0.52]),
        P("La table `transactions` constitue un **grand livre** (*ledger*) : chaque ligne y est immuable "
          "et conserve le solde résultant, ce qui permet de **reconstituer et de vérifier** à tout moment "
          "le solde d'un portefeuille par simple sommation — propriété fondamentale pour l'auditabilité."),
        P("Les tables `contracts` et `milestones`, qui structurent la collaboration, sont également "
          "centrales. Leur dictionnaire est présenté ci-dessous."),
        TBL(["Champ (contracts)", "Type", "Description"],
            [["id", "BIGINT (PK)", "Identifiant du contrat"],
             ["client_id / freelancer_id", "BIGINT (FK)", "Parties au contrat"],
             ["job_id / proposal_id", "BIGINT (FK, nul.)", "Origine du contrat (offre/proposition)"],
             ["title", "VARCHAR", "Intitulé du contrat"],
             ["type", "ENUM", "fixed (forfait) / hourly (horaire)"],
             ["escrow_amount", "DECIMAL(12,2)", "Montant actuellement sous séquestre"],
             ["status", "ENUM", "active, completed, cancelled, disputed"],
             ["disputed_at / dispute_reason", "DATETIME / TEXT", "Informations de litige éventuel"]],
            caption="Dictionnaire de données — table contracts",
            widths=[0.30, 0.22, 0.48]),
        TBL(["Champ (milestones)", "Type", "Description"],
            [["id", "BIGINT (PK)", "Identifiant du jalon"],
             ["contract_id", "BIGINT (FK)", "Contrat de rattachement"],
             ["title", "VARCHAR", "Description du jalon"],
             ["amount", "DECIMAL(12,2)", "Montant associé"],
             ["status", "ENUM", "pending, submitted, paid, rejected"],
             ["approved_at", "DATETIME (nul.)", "Date de validation/paiement"],
             ["created_by", "BIGINT (FK)", "Auteur de la création du jalon"]],
            caption="Dictionnaire de données — table milestones",
            widths=[0.30, 0.22, 0.48]),
        TBL(["Champ (job_postings / proposals)", "Type", "Description"],
            [["job.title / description", "VARCHAR / TEXT", "Intitulé et énoncé de l'offre"],
             ["job.budget / type", "DECIMAL / ENUM", "Budget et nature (forfait/horaire)"],
             ["job.category_id", "BIGINT (FK)", "Catégorie de compétence"],
             ["job.status", "ENUM", "open, closed, draft"],
             ["proposal.bid_amount", "DECIMAL(12,2)", "Montant proposé par le freelance"],
             ["proposal.cover_letter", "TEXT", "Lettre de motivation"],
             ["proposal.status", "ENUM", "pending, accepted, rejected, withdrawn"]],
            caption="Dictionnaire de données — tables job_postings et proposals",
            widths=[0.30, 0.22, 0.48]),

        H3("4", "Règles de gestion"),
        P("La cohérence du système est garantie par un ensemble de **règles de gestion** explicites, "
          "implémentées dans les services et les politiques d'autorisation :"),
        B(["**RG1** — Un contrat naît exclusivement de l'acceptation d'une proposition ou d'une commande ;",
           "**RG2** — Seul le client d'un contrat peut financer son séquestre et libérer ses jalons ;",
           "**RG3** — Un jalon ne peut être libéré que s'il a été *soumis* et que le séquestre est suffisant ;",
           "**RG4** — Un contrat *en litige* bloque toute libération de fonds jusqu'à arbitrage ;",
           "**RG5** — La commission de la plateforme est prélevée à la libération (10 % par défaut) ;",
           "**RG6** — Un retrait est soumis à un montant minimum et à un frais fixe, puis validé par un admin ;",
           "**RG7** — Toute opération financière est atomique, verrouillée et idempotente ;",
           "**RG8** — Un service du catalogue n'est visible qu'après modération par l'administrateur."]),

        H3("5", "Vue d'ensemble des tables de la base"),
        P("Le schéma complet compte une cinquantaine de tables. Le tableau suivant les regroupe par "
          "domaine fonctionnel afin d'en offrir une vision synthétique."),
        TBL(["Domaine", "Tables principales"],
            [["Identité & comptes", "users, freelancer_profiles, client_profiles, identity_verifications, "
                                    "personal_access_tokens"],
             ["Offres & propositions", "job_postings, proposals, saved_jobs, categories, skills, "
                                       "freelancer_skills"],
             ["Catalogue de services", "catalog_projects, catalog_project_images, catalog_orders, "
                                       "catalog_reviews, saved_catalog_projects"],
             ["Contrats & collaboration", "contracts, milestones, contract_files, contract_activities, "
                                          "time_logs, contract_extensions"],
             ["Finance", "wallets, transactions, withdrawals, weekly_invoices, platform_settings, "
                         "stripe_webhook_events"],
             ["Abonnements", "subscriptions, subscription_items"],
             ["Communication", "conversations, conversation_participants, messages, message_reactions"],
             ["Notifications", "notifications, push_subscriptions"],
             ["Talents & agences", "saved_freelancers, talent_lists, talent_list_freelancers, agencies, "
                                   "agency_members, agency_invitations"],
             ["Évaluations & IA", "reviews, ai_histories"],
             ["Transverses & système", "audit_logs, tax_documents, portfolios, sessions, cache, jobs, "
                                       "failed_jobs"]],
            caption="Vue d'ensemble des tables de la base, par domaine",
            widths=[0.26, 0.74]),
        P("Cette organisation reflète fidèlement les modules fonctionnels de l'application et illustre la "
          "richesse du domaine couvert par Panda. Les contraintes d'intégrité référentielle (clés "
          "étrangères) garantissent la cohérence entre ces tables — par exemple, la suppression d'un "
          "utilisateur propage en cascade la suppression de son portefeuille et de ses profils."),

        H2("VIII", "Choix technologiques"),
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

        H2("IX", "Conclusion du chapitre"),
        P("Ce chapitre a présenté la conception complète de Panda : une architecture découplée et en "
          "couches, des mécanismes de sécurité en profondeur, une modélisation objet structurée autour du "
          "contrat, des comportements dynamiques formalisés par des diagrammes de séquence et d'états, et "
          "une base de données rigoureusement conçue selon Merise. Cette conception fournit un plan "
          "directeur cohérent. Le chapitre suivant en présente la **réalisation** concrète, illustrée par "
          "des extraits de code et la présentation des interfaces."),
    ]
