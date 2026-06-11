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
          "rendue à un acteur. En raison de sa richesse fonctionnelle, le diagramme complet est présenté "
          "en **trois parties** successives, chacune couvrant un ensemble cohérent de modules."),

        H3("a", "Partie 1 — Authentification, Administrateur & Annonces"),
        P("La première partie couvre les modules fondamentaux : la gestion du compte (inscription, "
          "connexion, 2FA, OAuth, KYC), l'espace administrateur et la place de marché des annonces. "
          "On y observe que **S'authentifier** est la porte d'entrée systématique — toutes les actions "
          "métier en dépendent par inclusion. L'Administrateur dispose de cas exclusifs (modération, "
          "arbitrage, vérification KYC) inaccessibles aux autres rôles."),
        FIG("usecase_part1", "Diagramme de cas d'utilisation — Partie 1 : Authentification, Administrateur & Annonces"),
        B(["**Acteurs** : Visiteur, Client, Freelance, Administrateur ;",
           "**Cas clés** : Créer un compte, Se connecter (email / Google OAuth), Activer la 2FA, "
              "Réinitialiser le mot de passe, Vérifier l'identité (KYC) ;",
           "**Administrateur** : Gérer les utilisateurs, Valider les vérifications KYC, "
              "Modérer le catalogue, Consulter le tableau de bord ;",
           "**Annonces** : Publier une offre (Client), Rechercher des freelances, "
              "Consulter les profils, Enregistrer des favoris."]),

        H3("b", "Partie 2 — Catalogue, Contrats, Paiements & Communication"),
        P("La deuxième partie décrit le cœur opérationnel de la plateforme : la création et l'achat de "
          "services packagés (catalogue), la gestion complète du cycle de vie d'un contrat (jalons, "
          "fichiers, suivi du temps, extensions), le moteur de paiement par séquestre et la messagerie "
          "temps réel. C'est ici que la valeur centrale de Panda — **la confiance financière** — est "
          "pleinement matérialisée. Les acteurs externes Stripe et Laravel Reverb interviennent "
          "respectivement sur les paiements et la communication."),
        FIG("usecase_part2", "Diagramme de cas d'utilisation — Partie 2 : Catalogue, Contrats, Paiements & Communication"),
        B(["**Catalogue** : Créer un service packagé (Freelance), Passer commande (Client), "
              "Livrer une commande, Évaluer la prestation ;",
           "**Contrats** : Créer un jalon, Soumettre/approuver/rejeter un jalon, "
              "Partager des fichiers, Suivre le temps, Demander une extension ;",
           "**Paiements** : Déposer des fonds (via Stripe), Financer le séquestre, "
              "Libérer un jalon, Demander un retrait, Gérer les litiges ;",
           "**Communication** : Envoyer/recevoir des messages (temps réel), "
              "Partager des pièces jointes, Réagir aux messages."]),

        H3("c", "Partie 3 — Notifications, Agences, IA & Marketplace"),
        P("La troisième partie regroupe les modules transverses et enrichissants : le système de "
          "notifications (in-app et Web Push), la gestion des agences et des listes de talents, "
          "l'assistant d'intelligence artificielle et la place de marché des freelances. Elle illustre "
          "les fonctionnalités différenciantes de Panda par rapport aux plateformes classiques : "
          "l'IA pour accélérer les tâches répétitives et les agences pour structurer les équipes "
          "de freelances."),
        FIG("usecase_part3", "Diagramme de cas d'utilisation — Partie 3 : Notifications, IA, Agences & Marketplace"),
        B(["**Notifications** : Recevoir des alertes in-app, Activer les notifications Web Push, "
              "Gérer les préférences de notification ;",
           "**IA** : Générer une proposition, Obtenir une mise en correspondance, "
              "Analyser un profil, Recherche intelligente, Assistant conversationnel ;",
           "**Agences** : Créer une agence, Inviter des membres, Gérer les membres, "
              "Transférer la propriété ;",
           "**Talents** : Constituer une liste de talents, Gérer les favoris."]),
        P("Ce diagramme complet couvre neuf modules fonctionnels distincts. On observe que de nombreux "
          "cas dépendent du cas *« S'authentifier »* (relation d'inclusion) et "
          "que les acteurs externes (Stripe, IA) interviennent en support de cas spécifiques. Les rôles "
          "Client et Freelance partagent certains cas transverses (messagerie, gestion du profil), tandis "
          "que l'Administrateur dispose de cas de supervision exclusifs."),

        H3("1", "Module I — Authentification et gestion du compte"),
        P("Ce module constitue le **point d'entrée** obligatoire de la plateforme. Tout utilisateur "
          "doit s'authentifier avant d'accéder aux fonctionnalités principales. La relation "
          "d'**inclusion** (*include*) entre la majorité des autres cas et « S'authentifier » "
          "matérialise la contrainte de sécurité : aucune action métier n'est possible sans session "
          "valide. Les cas d'utilisation couverts sont :"),
        B(["**Créer un compte** : inscription par e-mail et mot de passe, avec vérification de l'adresse "
           "e-mail par lien de confirmation envoyé automatiquement ;",
           "**Se connecter** : authentification par identifiants ou via Google (OAuth 2.0) grâce à "
           "Laravel Socialite — le jeton Bearer Sanctum est émis à l'issue de cette étape ;",
           "**Activer / gérer la 2FA** : mise en place de l'authentification à deux facteurs (code "
           "TOTP généré par application, codes de secours à usage unique) ;",
           "**Réinitialiser le mot de passe** : envoi d'un lien signé et limité dans le temps par e-mail ;",
           "**Vérifier l'identité (KYC)** : soumission de pièces justificatives pour validation "
           "par l'administrateur avant l'accès aux fonctions financières ;",
           "**Gérer le profil** : mise à jour des informations personnelles, avatar, biographie "
           "et préférences de notification."]),

        H3("2", "Module II — Espace Administrateur"),
        P("L'administrateur dispose d'un espace de supervision qui lui permet de contrôler "
          "l'ensemble de l'activité de la plateforme. Ses cas exclusifs sont :"),
        B(["**Gérer les utilisateurs** : consultation, suspension ou suppression des comptes, "
           "réinitialisation des accès en cas de compromission ;",
           "**Modérer le catalogue** : approbation ou rejet des services soumis par les freelances, "
           "avec communication du motif de refus ;",
           "**Valider les vérifications d'identité (KYC)** : examen de la file de demandes "
           "en attente, prise de décision et notification à l'utilisateur ;",
           "**Gérer les retraits** : approbation ou refus des demandes de retrait des freelances, "
           "déclenchement des versements Stripe Connect ;",
           "**Arbitrer les litiges** : résolution des conflits entre clients et freelances, "
           "avec possibilité de débloquer ou d'annuler un contrat gelé ;",
           "**Consulter le tableau de bord** : statistiques globales (revenus, utilisateurs "
           "actifs, commissions collectées, activité transactionnelle)."]),

        H3("3", "Module III — Annonces et Freelances"),
        P("Ce module couvre le premier modèle de mise en relation, à l'initiative du **client** "
          "qui publie un besoin auquel les freelances répondent :"),
        B(["**Publier une offre** : création d'une annonce avec titre, description, catégorie, "
           "budget et type de mission (forfait ou tarif horaire) ;",
           "**Rechercher des freelances** : filtrage multicritères par compétences, catégorie, "
           "tarif, disponibilité et localisation géographique ;",
           "**Consulter un profil freelance** : visualisation du portfolio, des compétences, "
           "des évaluations et de l'historique de missions réalisées ;",
           "**Enregistrer des favoris** : constitution de listes de talents pour accès rapide "
           "lors de prochains projets ;",
           "**Gérer son profil freelance** : renseignement du titre, de la biographie, "
           "des compétences, du portfolio, de la disponibilité et du tarif horaire."]),

        H3("4", "Module IV — Freelance et Services (Catalogue)"),
        P("Ce module matérialise le second modèle de mise en relation, à l'initiative du "
          "**freelance** qui propose des services packagés directement achetables :"),
        B(["**Créer un service packagé** : définition de trois paliers (basique, standard, "
           "premium) avec description, prix fixé, délai de livraison et liste des livrables ;",
           "**Gérer son portfolio** : ajout et organisation de réalisations passées "
           "illustrant les compétences et la qualité du travail du freelance ;",
           "**Livrer une commande** : soumission des livrables dans le délai imparti, "
           "communication avec le client, gestion des révisions demandées ;",
           "**Gérer sa disponibilité** : paramétrage du statut (disponible, occupé, "
           "en pause) et du délai de réponse moyen visible sur le profil public."]),

        H3("5", "Module V — Propositions et Offres"),
        P("Ce module gère le cycle de vie complet des propositions soumises par les "
          "freelances en réponse aux offres publiées par les clients :"),
        B(["**Soumettre une proposition** : rédaction d'une lettre de motivation, "
           "fixation du montant proposé et du délai estimé ; l'assistant IA "
           "peut générer un premier jet que le freelance édite et personnalise ;",
           "**Consulter les propositions reçues** : le client visualise, compare "
           "et évalue toutes les candidatures reçues sur son offre ;",
           "**Accepter ou refuser une proposition** : l'acceptation déclenche "
           "automatiquement la création d'un contrat actif entre les deux parties ;",
           "**Retirer une proposition** : le freelance peut annuler sa candidature "
           "tant qu'elle n'a pas encore été acceptée par le client."]),

        H3("6", "Module VI — Gestion des Paiements (Séquestre / Escrow)"),
        P("Ce module est le **cœur financier** de la plateforme. Il implémente le "
          "mécanisme de séquestre qui garantit la confiance entre les parties :"),
        B(["**Déposer des fonds** : alimentation du portefeuille via Stripe Checkout ; "
           "la confirmation du paiement arrive de façon asynchrone par webhook signé ;",
           "**Financer le séquestre** : le client bloque les fonds d'un contrat ; "
           "ils quittent son solde disponible et entrent en séquestre, inaccessibles "
           "jusqu'à validation d'un jalon ;",
           "**Soumettre et valider un jalon** : le freelance livre le travail, "
           "le client approuve et les fonds sont libérés automatiquement, "
           "déduction faite de la commission de la plateforme ;",
           "**Demander un retrait** : le freelance transfère son solde disponible "
           "vers son compte bancaire via Stripe Connect/Payout ;",
           "**Consulter l'historique financier** : visualisation de toutes les "
           "transactions et du journal comptable en double-entrée."]),

        H3("7", "Module VII — Dialogue Structuré (Messagerie et Contrats)"),
        P("Ce module assure la communication et le suivi opérationnel dans le "
          "cadre des contrats actifs :"),
        B(["**Échanger des messages** : messagerie temps réel par WebSocket "
           "(Laravel Reverb + Echo) avec pièces jointes, accusés de lecture "
           "et réactions aux messages ;",
           "**Découper le contrat en jalons** : définition de jalons mesurables "
           "avec montant, description et date d'échéance ;",
           "**Partager des fichiers versionnés** : envoi de livrables et "
           "documents de travail attachés au contrat ;",
           "**Suivre le temps** : chronométrage en temps réel pour les contrats "
           "horaires, avec récapitulatif hebdomadaire et facturation automatique ;",
           "**Demander une extension de délai** : le freelance peut solliciter "
           "un délai supplémentaire que le client accepte ou refuse."]),

        H3("8", "Module VIII — Agences et Talents"),
        P("Ce module permet à des freelances de se regrouper sous une même "
          "bannière professionnelle et aux clients d'organiser leurs prestataires :"),
        B(["**Créer une agence** : le propriétaire définit le nom, la présentation "
           "et l'identité visuelle de l'agence ;",
           "**Inviter des membres** : envoi d'invitations par jeton sécurisé "
           "aux freelances que l'agence souhaite intégrer ;",
           "**Gérer les membres** : acceptation des invitations, retrait de "
           "membres, transfert de la propriété de l'agence ;",
           "**Constituer des listes de talents** : les clients organisent leurs "
           "freelances favoris en listes thématiques pour simplifier la "
           "sélection lors de futurs projets."]),

        H3("9", "Module IX — Notifications"),
        P("Ce module transverse assure que chaque acteur est informé en temps "
          "réel des événements qui le concernent sur la plateforme :"),
        B(["**Notifications in-app** : alertes dans l'interface pour toute "
           "action sur une offre, proposition, contrat, paiement ou message ;",
           "**Notifications Web Push** : alertes navigateur (VAPID/Service Worker) "
           "même lorsque l'application n'est pas ouverte en premier plan ;",
           "**Gérer les préférences** : chaque utilisateur configure les types "
           "d'événements pour lesquels il souhaite être notifié."]),

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
