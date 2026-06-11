# -*- coding: utf-8 -*-
"""Chapitre 2 : Analyse et spécification des besoins."""
from blocks_helpers import H1, H2, H3, P, B, NOTE, FIG, TBL


def _uc(acteur, pre, nominal, alt, post):
    return TBL(None,
               [["Acteur(s)", acteur],
                ["Pré-conditions", pre],
                ["Scénario nominal", nominal],
                ["Scénarios alternatifs", alt],
                ["Post-conditions", post]],
               widths=[0.22, 0.78])


def ch2():
    return [
        H1("Chapitre 2 : Analyse et spécification des besoins"),

        P("L'analyse des besoins est une étape déterminante qui conditionne la qualité de la conception et "
          "de la réalisation. Ce chapitre identifie les **acteurs** du système, recense les **besoins "
          "fonctionnels** et **non fonctionnels**, puis les formalise à l'aide du langage **UML**. Il "
          "présente le diagramme de cas d'utilisation global, complété par la description textuelle des "
          "cas d'utilisation les plus significatifs."),

        H2("I", "Identification des acteurs"),
        P("Un acteur représente une entité externe — humaine ou logicielle — qui interagit avec le "
          "système. Panda distingue les acteurs humains, porteurs de rôles métier, des acteurs externes "
          "que sont les services tiers intégrés."),
        H3("1", "Acteurs humains"),
        TBL(["Acteur", "Description et responsabilités"],
            [["Visiteur", "Internaute non authentifié : parcourt les offres, les freelances et le catalogue, "
                          "consulte les pages publiques, puis s'inscrit ou se connecte."],
             ["Client", "Utilisateur authentifié qui publie des offres, étudie les propositions reçues, "
                        "achète des services, finance le séquestre, valide les jalons et évalue les freelances."],
             ["Freelance", "Utilisateur authentifié qui complète son profil et son portfolio, postule aux "
                           "offres, vend des services packagés, livre les jalons, suit son temps et demande "
                           "ses retraits."],
             ["Agence", "Entité regroupant plusieurs freelances sous une même bannière ; le propriétaire "
                        "invite des membres et gère l'activité collective."],
             ["Administrateur", "Supervise la plateforme : modération du catalogue, gestion des utilisateurs, "
                                "validation des vérifications d'identité, traitement des retraits et "
                                "arbitrage des litiges."]],
            caption="Acteurs humains de la plateforme Panda",
            widths=[0.18, 0.82]),
        H3("2", "Acteurs externes (systèmes tiers)"),
        TBL(["Acteur externe", "Rôle dans le système"],
            [["Stripe", "Encaissement des dépôts (Checkout) et versement des retraits (Connect/Payout)."],
             ["Google (OAuth)", "Fournisseur d'identité pour l'authentification sociale via Socialite."],
             ["Serveur IA (Ollama / Mistral)", "Génération de propositions, mise en correspondance et "
                                               "analyse de profils."],
             ["Service de notifications Web Push", "Acheminement des notifications navigateur (VAPID)."]],
            caption="Acteurs externes intégrés à la plateforme",
            widths=[0.30, 0.70]),

        H2("II", "Besoins fonctionnels"),
        P("Les besoins fonctionnels décrivent les services que le système doit rendre. Compte tenu de la "
          "richesse du périmètre, ils sont présentés par **module fonctionnel**."),
        H3("1", "Authentification et compte"),
        P("La gestion du compte constitue le point d'entrée de la plateforme et le socle de la confiance. "
          "Elle doit être à la fois simple pour l'utilisateur et solide face aux menaces."),
        B(["Inscription par e-mail/mot de passe ou via Google (OAuth) ；",
           "Connexion sécurisée par jeton et déconnexion ；",
           "Vérification de l'adresse e-mail et du numéro de téléphone ；",
           "Authentification à deux facteurs (2FA) par code temporel (TOTP) et codes de secours ；",
           "Réinitialisation du mot de passe et gestion du profil (avatar, informations) ；",
           "Vérification d'identité (KYC) avec pièces justificatives."]),
        H3("2", "Offres, propositions et profils"),
        P("Ce module incarne le premier modèle de mise en relation, à l'initiative du **client** qui "
          "exprime un besoin auquel les freelances répondent par des propositions."),
        B(["Publication, modification et suppression d'offres par le client ；",
           "Recherche et filtrage des offres et des freelances (catégorie, budget, compétences) ；",
           "Soumission d'une proposition par le freelance (lettre, montant) ；",
           "Acceptation, refus ou retrait d'une proposition ；",
           "Gestion du profil freelance : titre, biographie, compétences, portfolio, disponibilité ；",
           "Enregistrement de freelances favoris et constitution de listes de talents."]),
        H3("3", "Catalogue de services"),
        P("Le catalogue incarne le second modèle, à l'initiative du **freelance** qui propose des "
          "prestations standardisées à prix fixe, que le client achète directement."),
        B(["Création par le freelance de services packagés à plusieurs paliers (basique, standard, premium) ；",
           "Modération du catalogue par l'administrateur (approbation/rejet) ；",
           "Achat d'un palier par le client (commande) ；",
           "Livraison, validation et évaluation de la commande."]),
        H3("4", "Contrats et collaboration"),
        P("Une fois l'accord conclu, le **contrat** encadre et trace la collaboration, du premier livrable "
          "jusqu'à la clôture, en structurant le travail en jalons mesurables."),
        B(["Création automatique d'un contrat à l'acceptation d'une proposition ou d'une commande ；",
           "Découpage du contrat en **jalons** (montant, échéance) ；",
           "Soumission, approbation ou rejet d'un jalon ；",
           "Partage de **fichiers** versionnés liés au contrat ；",
           "**Suivi du temps** pour les contrats horaires (démarrage/arrêt, récapitulatif hebdomadaire) ；",
           "Demande et réponse d'**extension** de délai ；",
           "Suivi d'activité, analyse et génération de **PDF** du contrat."]),
        H3("5", "Paiements et finance"),
        P("Le module financier est le plus **sensible** : il manipule l'argent réel des utilisateurs et "
          "matérialise la promesse de confiance de la plateforme à travers le séquestre."),
        B(["Portefeuille personnel avec solde disponible, en séquestre et en attente ；",
           "Dépôt de fonds via Stripe ；",
           "**Financement du séquestre** d'un contrat par le client ；",
           "**Libération d'un jalon** : versement au freelance après prélèvement de la commission ；",
           "Demande de **retrait** par le freelance et validation/refus par l'administrateur ；",
           "Configuration Stripe Connect pour les versements ；",
           "Facturation hebdomadaire pour les contrats horaires et abonnements."]),
        H3("6", "Communication, IA et administration"),
        P("Ces modules transverses fluidifient les échanges entre les parties, accélèrent les tâches "
          "répétitives grâce à l'IA et outillent la supervision de la plateforme."),
        B(["**Messagerie temps réel** : conversations, pièces jointes, accusés de lecture, réactions ；",
           "**Notifications** in-app et Web Push ；",
           "**Assistant IA** : génération de propositions, mise en correspondance, analyse de profil, "
           "recherche intelligente ；",
           "Gestion d'**agences** : invitations, membres, transfert de propriété ；",
           "**Back-office** : tableau de bord, gestion des utilisateurs, modération, KYC, finance, litiges."]),

        H2("III", "Besoins non fonctionnels"),
        P("Les besoins non fonctionnels caractérisent la **qualité** attendue du système, indépendamment "
          "des fonctionnalités. Ils sont au moins aussi importants que les premiers pour une plateforme "
          "transactionnelle."),
        TBL(["Catégorie", "Exigence"],
            [["Sécurité", "Mots de passe hachés (bcrypt), jetons Sanctum, 2FA, vérification d'identité, "
                          "limitation de débit (throttling), politiques d'autorisation, journal d'audit, "
                          "vérification de signature des webhooks."],
             ["Intégrité financière", "Atomicité (transactions SQL), verrouillage (FOR UPDATE), écriture "
                                       "comptable double, idempotence des opérations, précision décimale."],
             ["Performance", "Réponses rapides de l'API, requêtes Eloquent optimisées, index plein-texte "
                             "pour la recherche, cache Redis, pagination."],
             ["Fiabilité", "Comportement stable face aux entrées invalides, gestion explicite des erreurs, "
                          "cohérence garantie des soldes."],
             ["Ergonomie", "Interface responsive (TailwindCSS), navigation intuitive, retours visuels "
                          "(toasts), temps réel pour la messagerie."],
             ["Maintenabilité", "Architecture en couches, séparation des responsabilités, services métier "
                                "réutilisables, code versionné et conteneurisé."],
             ["Scalabilité", "Découplage front/back, file d'attente asynchrone, conception sans état de "
                            "l'API, déploiement par conteneurs."]],
            caption="Besoins non fonctionnels de la plateforme",
            widths=[0.24, 0.76]),

        H2("IV", "Langage de modélisation adopté"),
        P("Pour formaliser l'analyse et la conception, nous avons adopté le langage **UML** (*Unified "
          "Modeling Language*), standard de la modélisation des systèmes logiciels orientés objet. UML "
          "offre une famille de diagrammes complémentaires permettant de représenter aussi bien la "
          "structure statique du système (diagrammes de cas d'utilisation, de classes) que son "
          "comportement dynamique (diagrammes de séquence, d'états). Pour la base de données, nous avons "
          "complété UML par la méthode **Merise** (modèles conceptuel et logique de données), bien adaptée "
          "à la conception relationnelle."),
        P("Dans ce chapitre, nous nous concentrons sur le **diagramme de cas d'utilisation**, qui offre "
          "une vision globale et fonctionnelle du système, intelligible par toutes les parties prenantes. "
          "Les diagrammes structurels et dynamiques sont présentés au chapitre 3, consacré à la conception."),

        H2("V", "Diagramme de cas d'utilisation global"),
        P("Le diagramme de cas d'utilisation global synthétise les interactions entre les acteurs et les "
          "grandes fonctionnalités du système. Chaque *cas d'utilisation* représente une unité de service "
          "rendue à un acteur. La figure suivante présente cette vue d'ensemble."),
        FIG("usecase", "Diagramme de cas d'utilisation global de la plateforme Panda"),
        P("On observe que de nombreux cas dépendent du cas *« S'authentifier »* (relation d'inclusion) et "
          "que les acteurs externes (Stripe, IA) interviennent en support de cas spécifiques. Les rôles "
          "Client et Freelance partagent certains cas transverses (messagerie, gestion du profil), tandis "
          "que l'Administrateur dispose de cas de supervision exclusifs."),

        H2("VI", "Description textuelle des cas d'utilisation"),
        P("Afin de préciser le comportement attendu, nous détaillons ci-après quelques cas d'utilisation "
          "représentatifs sous forme de fiches descriptives."),

        H3("1", "Cas « S'authentifier »"),
        _uc("Visiteur",
            "Le visiteur possède un compte (ou en crée un).",
            "1) Le visiteur saisit son e-mail et son mot de passe. 2) Le système applique une limitation de "
            "débit, vérifie les identifiants (bcrypt). 3) Si la 2FA est active, un code temporel est exigé. "
            "4) Le système émet un jeton Bearer (Sanctum). 5) Le client stocke le jeton et accède à son espace.",
            "2a) Identifiants invalides → message d'erreur. 3a) Code 2FA erroné → nouvel essai. "
            "1b) Authentification via Google (OAuth) en alternative.",
            "L'utilisateur est authentifié ; un jeton est associé à sa session."),

        H3("2", "Cas « Publier une offre »"),
        _uc("Client",
            "Le client est authentifié.",
            "1) Le client ouvre le formulaire de publication. 2) Il renseigne titre, description, "
            "catégorie, budget et type. 3) Le système valide les données (FormRequest). 4) L'offre est "
            "enregistrée et publiée. 5) Elle devient visible et indexée pour la recherche.",
            "3a) Données incomplètes → erreurs de validation affichées. 4a) Le client enregistre un "
            "brouillon avant publication.",
            "Une nouvelle offre est créée et ouverte aux propositions des freelances."),

        H3("3", "Cas « Postuler à une offre »"),
        _uc("Freelance",
            "Le freelance est authentifié et l'offre est ouverte.",
            "1) Le freelance consulte le détail de l'offre. 2) Il rédige une proposition (lettre, montant), "
            "éventuellement assistée par l'IA. 3) Le système enregistre la proposition. 4) Le client en est "
            "notifié.",
            "2a) Le freelance demande une génération de proposition à l'IA puis l'édite. "
            "3a) Le freelance retire sa proposition tant qu'elle n'est pas acceptée.",
            "Une proposition est rattachée à l'offre et visible par le client."),

        H3("4", "Cas « Financer le séquestre et valider un jalon »"),
        _uc("Client",
            "Un contrat actif existe et le client dispose d'un solde suffisant.",
            "1) Le client finance le séquestre du contrat (les fonds quittent son solde disponible et sont "
            "bloqués). 2) Le freelance soumet un jalon livré. 3) Le client approuve le jalon. 4) Le système "
            "(LedgerService) prélève la commission, crédite le freelance et marque le jalon comme payé, de "
            "manière atomique et idempotente.",
            "1a) Solde insuffisant → invitation à déposer des fonds (Stripe). 3a) Le client rejette le "
            "jalon avec un motif → le freelance re-livre. 3b) Litige → gel du contrat et arbitrage admin.",
            "Le jalon est payé ; le freelance est crédité ; chaque mouvement est tracé dans le grand livre."),

        H3("5", "Cas « Vendre un service et passer commande »"),
        _uc("Freelance, Client",
            "Le freelance possède un service publié et modéré ; le client est authentifié.",
            "1) Le freelance crée un service à paliers (basique/standard/premium). 2) L'administrateur "
            "modère et approuve le service. 3) Le client choisit un palier et passe commande (paiement). "
            "4) Le freelance livre la commande. 5) Le client valide et évalue la prestation.",
            "2a) Service rejeté → notification au freelance avec motif. 4a) Livraison non conforme → "
            "demande de révision par le client.",
            "La commande est complétée, le freelance crédité et une évaluation enregistrée."),

        H3("6", "Cas « Demander un retrait »"),
        _uc("Freelance, Administrateur",
            "Le freelance dispose d'un solde disponible supérieur au minimum requis.",
            "1) Le freelance demande un retrait (montant, méthode). 2) Les fonds passent du solde "
            "disponible au solde en attente. 3) L'administrateur examine la demande. 4) En cas "
            "d'approbation, un versement Stripe est déclenché ; le webhook confirme le retrait.",
            "1a) Solde insuffisant ou inférieur au minimum → refus. 3a) Rejet par l'admin → fonds "
            "re-crédités au solde disponible. 4a) Échec Stripe → re-crédit automatique et statut « échoué ».",
            "Le retrait est complété (ou rejeté) ; chaque étape est tracée dans le grand livre."),

        H3("7", "Cas « Vérifier l'identité (KYC) »"),
        _uc("Freelance/Client, Administrateur",
            "L'utilisateur est authentifié.",
            "1) L'utilisateur soumet ses pièces justificatives. 2) Le système enregistre la demande "
            "(statut « en attente »). 3) L'administrateur consulte la file de vérification. 4) Il approuve "
            "ou rejette la demande. 5) L'utilisateur est notifié du résultat.",
            "4a) Rejet → motif communiqué et nouvelle soumission possible.",
            "Le statut de vérification de l'utilisateur est mis à jour."),

        H3("8", "Cas « Gérer une agence »"),
        _uc("Agence (propriétaire), Freelance",
            "Le propriétaire dispose d'un compte autorisé à créer une agence.",
            "1) Le propriétaire crée l'agence (nom, présentation). 2) Il invite des freelances par "
            "jeton. 3) Les freelances acceptent ou refusent l'invitation. 4) Le propriétaire gère les "
            "membres et peut transférer la propriété.",
            "3a) Refus de l'invitation → le freelance n'est pas ajouté. 4a) Retrait d'un membre par le "
            "propriétaire.",
            "L'agence regroupe plusieurs freelances sous une bannière commune."),

        NOTE("Ces fiches illustrent l'importance des **scénarios alternatifs** (erreurs, litiges, "
             "abandons) : sur une plateforme transactionnelle, ils sont aussi critiques que le scénario "
             "nominal et structurent une grande partie de la logique applicative."),

        H3("9", "Matrice de traçabilité des exigences"),
        P("Afin de garantir que chaque besoin identifié trouve une réponse dans la solution, nous avons "
          "établi une matrice de traçabilité reliant les exigences aux modules qui les satisfont."),
        TBL(["Exigence", "Module / composant", "Couverture"],
            [["Inscription, connexion, OAuth, 2FA", "AuthController, Sanctum, Socialite, TwoFactor", "Complète"],
             ["Publication d'offres et propositions", "JobController, ProposalController", "Complète"],
             ["Catalogue de services et commandes", "CatalogProjectController, CatalogOrderController", "Complète"],
             ["Contrats, jalons, fichiers, temps", "ContractController et contrôleurs associés", "Complète"],
             ["Paiement sous séquestre", "LedgerService, PaymentController", "Complète"],
             ["Dépôts et retraits Stripe", "StripeService, StripeWebhookController", "Complète"],
             ["Messagerie temps réel", "ChatController, événements + Reverb", "Complète"],
             ["Notifications et Web Push", "NotificationController, PushSubscription", "Complète"],
             ["Assistant IA", "AIController, service de modèle de langage", "Complète"],
             ["Agences et talents", "AgencyController, TalentListController", "Complète"],
             ["Vérification d'identité (KYC)", "IdentityVerificationController", "Complète"],
             ["Administration et modération", "AdminController, AdminFinanceController", "Complète"]],
            caption="Matrice de traçabilité des exigences vers les composants",
            widths=[0.40, 0.42, 0.18]),

        H2("VII", "Conclusion du chapitre"),
        P("Ce chapitre a recensé et structuré les besoins de la plateforme. Nous avons identifié les "
          "acteurs, détaillé les besoins fonctionnels par module et précisé les exigences non "
          "fonctionnelles — au premier rang desquelles la sécurité et l'intégrité financière. Le langage "
          "UML nous a permis de formaliser ces besoins, à travers le diagramme de cas d'utilisation global "
          "et la description des cas les plus significatifs. Ces éléments constituent le cahier des charges "
          "sur lequel s'appuie la **conception** détaillée, objet du chapitre suivant."),
    ]
