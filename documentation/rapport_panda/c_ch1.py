# -*- coding: utf-8 -*-
"""Chapitre 1 : Contexte général et conduite du projet."""
from blocks_helpers import H1, H2, H3, P, B, NL, NOTE, FIG, TBL


def ch1():
    return [
        H1("Chapitre 1 : Contexte général et conduite du projet"),

        P("Ce premier chapitre pose les fondations du projet. Il en précise le cadre académique, "
          "présente le domaine métier — le marché du travail indépendant — et la problématique à "
          "laquelle Panda entend répondre. Il propose ensuite une étude des solutions existantes, définit "
          "les objectifs et le périmètre de notre plateforme, et expose enfin la méthodologie de conduite "
          "et la planification que nous avons adoptées pour mener le projet à bien."),

        H2("I", "Cadre du projet"),
        P("Ce projet s'inscrit dans le cadre de la formation **BTS — Développement Digital, option Web "
          "Full Stack**, une filière professionnalisante de deux années post-baccalauréat dispensée au "
          "Centre de Préparation au BTS du Lycée Technique de Taza. Le projet de fin d'études (PFE) en "
          "constitue l'aboutissement : il a pour vocation de placer l'étudiant en situation réelle de "
          "conception et de développement d'une application complète, depuis l'analyse du besoin jusqu'à "
          "la livraison d'un produit fonctionnel."),
        P("Au-delà de la simple démonstration de compétences techniques, ce travail vise à développer des "
          "qualités professionnelles essentielles : l'analyse et la formalisation d'un besoin, la "
          "planification, la prise de décision en environnement contraint, l'autonomie et la rigueur. "
          "Nous avons délibérément choisi un sujet ambitieux — une place de marché transactionnelle — afin "
          "de nous confronter aux problématiques réelles d'une application professionnelle moderne : "
          "sécurité, intégrité des données financières, montée en charge et expérience utilisateur."),

        H2("II", "Le marché du travail indépendant"),
        P("Le *freelancing* désigne l'exercice d'une activité professionnelle de manière indépendante, "
          "généralement à la prestation ou au projet, sans lien de subordination salariale. Porté par la "
          "généralisation du travail à distance, par la flexibilité recherchée tant par les professionnels "
          "que par les entreprises, et par la maturité des outils numériques, ce mode de travail connaît "
          "une croissance soutenue à l'échelle mondiale. Les domaines concernés sont nombreux : "
          "développement informatique, design graphique, rédaction et traduction, marketing digital, "
          "conseil, montage vidéo, etc."),
        P("Ce marché met en présence deux grandes catégories d'acteurs. D'un côté, les **clients** "
          "(particuliers, entrepreneurs, entreprises) qui cherchent à confier une mission précise à un "
          "professionnel compétent, dans un délai et un budget maîtrisés. De l'autre, les **freelances** "
          "qui souhaitent trouver des missions, valoriser leur expertise, gérer leur activité et être "
          "rémunérés de façon fiable. Entre les deux s'interpose le besoin d'une **plateforme de "
          "confiance**, capable d'organiser la rencontre, d'encadrer la collaboration et — point crucial — "
          "de sécuriser le paiement."),
        P("Deux grands modèles de collaboration coexistent sur ce marché. Le premier, dit *« appel "
          "d'offres »*, part du **besoin du client** : celui-ci publie une mission, reçoit des "
          "candidatures (propositions) et sélectionne le freelance le plus adapté. Le second, dit *« "
          "service packagé »*, part de l'**offre du freelance** : celui-ci propose des prestations "
          "standardisées à prix fixe que le client achète directement. Panda a fait le choix d'intégrer "
          "ces **deux modèles** au sein d'une même plateforme, afin de couvrir l'ensemble des situations "
          "et de maximiser les opportunités de mise en relation."),
        P("Le tableau suivant met en regard les attentes des deux profils d'utilisateurs, qui structurent "
          "directement les fonctionnalités de la plateforme."),
        TBL(["Attentes du client", "Attentes du freelance"],
            [["Trouver rapidement un profil qualifié", "Accéder à un flux régulier de missions"],
             ["Comparer compétences, avis et tarifs", "Valoriser son expertise et son portfolio"],
             ["Maîtriser le budget et les délais", "Être certain d'être payé pour son travail"],
             ["Ne payer que pour un travail conforme", "Gérer simplement son activité et ses revenus"],
             ["Communiquer et suivre l'avancement", "Encadrer la relation par un contrat clair"]],
            caption="Attentes croisées des clients et des freelances",
            widths=[0.50, 0.50]),

        H2("III", "Problématique"),
        P("La mise en relation, à elle seule, ne suffit pas. Le véritable défi d'une marketplace de "
          "services réside dans la **gestion de la confiance** entre des parties qui ne se connaissent pas. "
          "Plusieurs risques se posent concrètement :"),
        B(["**Risque pour le client** : payer d'avance et ne jamais recevoir le travail, ou recevoir une "
           "prestation non conforme à ce qui avait été convenu ;",
           "**Risque pour le freelance** : livrer un travail conséquent et ne jamais être payé, ou subir "
           "des retards de paiement répétés ;",
           "**Risque d'intégrité financière** : sur une plateforme manipulant l'argent de tiers, la "
           "moindre erreur de calcul, double paiement ou incohérence de solde est inacceptable ;",
           "**Risque de communication** : l'absence d'un canal d'échange fiable et tracé entre les "
           "parties favorise les malentendus et complique la résolution des litiges ;",
           "**Risque de sécurité** : usurpation d'identité, comptes frauduleux, accès non autorisé aux "
           "données personnelles et financières."]),
        P("La problématique centrale de ce projet peut donc se formuler ainsi : *comment concevoir une "
          "plateforme web qui mette efficacement en relation freelances et clients, tout en garantissant "
          "la sécurité financière, l'intégrité des transactions et la confiance entre des parties "
          "distantes ?* C'est à cette question que Panda apporte une réponse, en plaçant le **séquestre de "
          "fonds (escrow)** et la traçabilité comptable au cœur de son architecture."),

        H2("IV", "Étude de l'existant"),
        P("Avant de concevoir notre solution, nous avons analysé les principales plateformes du marché "
          "afin d'en dégager les bonnes pratiques et les standards attendus. Quatre acteurs de référence "
          "ont été étudiés."),
        H3("1", "Plateformes de référence"),
        B(["**Upwork** : leader mondial orienté missions à l'heure ou au forfait. Propose des contrats, "
           "un suivi du temps, un séquestre, des jalons et une facturation hebdomadaire. Modèle de "
           "référence pour la partie *« offres et propositions »* ;",
           "**Fiverr** : centré sur des **services packagés** (« gigs ») proposés par les freelances avec "
           "des paliers de prix (basique, standard, premium). Modèle de référence pour la partie "
           "*« catalogue de services »* ;",
           "**Malt** : plateforme européenne premium ciblant les profils tech et créatifs, avec un fort "
           "accent sur la qualité des profils et la facturation ;",
           "**Freelancer.com / ComeUp** : places de marché généralistes combinant appels d'offres et "
           "services packagés."]),
        P("De cette analyse, nous retenons que les fonctionnalités jugées indispensables par le marché "
          "sont : un système de profils riches, une recherche performante, un mécanisme de candidature, "
          "un **paiement sous séquestre avec jalons**, une messagerie intégrée, un système d'évaluation, "
          "et une gestion des litiges. Panda s'inspire de ces standards en combinant les deux grands "
          "modèles — *offres/propositions* (façon Upwork) et *services packagés* (façon Fiverr) — au sein "
          "d'une même plateforme."),
        H3("2", "Tableau comparatif"),
        P("Le tableau suivant synthétise le positionnement de Panda par rapport aux solutions existantes."),
        TBL(["Fonctionnalité", "Upwork", "Fiverr", "Panda"],
            [["Offres + propositions (appels d'offres)", "Oui", "Non", "Oui"],
             ["Services packagés (catalogue à paliers)", "Non", "Oui", "Oui"],
             ["Paiement sous séquestre (escrow)", "Oui", "Oui", "Oui"],
             ["Jalons de paiement", "Oui", "Limité", "Oui"],
             ["Suivi du temps & facturation horaire", "Oui", "Non", "Oui"],
             ["Messagerie temps réel intégrée", "Oui", "Oui", "Oui"],
             ["Assistant IA (propositions, matching)", "Partiel", "Partiel", "Oui"],
             ["Gestion d'agences", "Oui", "Non", "Oui"],
             ["Vérification d'identité (KYC) & 2FA", "Oui", "Oui", "Oui"],
             ["Code source maîtrisé (projet académique)", "Non", "Non", "Oui"]],
            caption="Positionnement comparatif de Panda face aux plateformes de référence",
            widths=[0.40, 0.18, 0.18, 0.24]),
        NOTE("Le parti pris de Panda est de **réunir en une seule plateforme** les deux grands modèles du "
             "marché (appels d'offres et services packagés) et d'en maîtriser intégralement la chaîne "
             "technique, jusqu'au moteur de paiement, dans un cadre pédagogique."),

        H2("V", "Solution proposée : la plateforme Panda"),
        P("**Panda** est une plateforme web full-stack qui couvre l'ensemble du cycle de collaboration "
          "entre freelances et clients. Elle se distingue par la richesse de son périmètre fonctionnel et "
          "par la robustesse de son socle technique, en particulier financier."),
        H3("1", "Objectif principal"),
        P("Concevoir et développer une place de marché numérique sécurisée permettant à des clients de "
          "publier des besoins et d'acheter des services, à des freelances de proposer leurs compétences "
          "et d'être rémunérés de manière fiable, le tout encadré par un système de paiement sous "
          "séquestre garantissant l'intérêt des deux parties."),
        H3("2", "Objectifs spécifiques"),
        TBL(["Objectif", "Bénéfice attendu"],
            [["Authentification robuste (Sanctum, 2FA, OAuth)", "Sécuriser l'accès et l'identité des utilisateurs"],
             ["Profils riches client / freelance / agence", "Valoriser les compétences et inspirer confiance"],
             ["Offres, propositions et catalogue de services", "Couvrir les deux modèles du marché"],
             ["Contrats, jalons, suivi du temps et fichiers", "Encadrer et tracer la collaboration"],
             ["Moteur de paiement par séquestre (escrow)", "Garantir la sécurité financière et la confiance"],
             ["Messagerie temps réel", "Fluidifier la communication entre les parties"],
             ["Assistant IA & vérification d'identité (KYC)", "Améliorer la productivité et la sécurité"],
             ["Back-office d'administration & de modération", "Piloter, modérer et arbitrer les litiges"]],
            caption="Objectifs spécifiques du projet et bénéfices attendus",
            widths=[0.55, 0.45]),
        H3("3", "Périmètre du projet"),
        P("**Périmètre fonctionnel.** Inscription et authentification multi-rôles ; gestion des profils ; "
          "publication d'offres et soumission de propositions ; catalogue de services packagés et "
          "commandes ; contrats, jalons, fichiers, suivi du temps et extensions ; portefeuille, séquestre, "
          "retraits et facturation ; messagerie temps réel ; évaluations ; notifications ; intelligence "
          "artificielle ; agences ; vérification d'identité ; administration."),
        P("**Périmètre technique.** API REST Laravel 12 (PHP 8.2), SPA React 19 (Vite, TailwindCSS), base "
          "de données MySQL, authentification Sanctum, intégration Stripe, WebSockets via Laravel Reverb, "
          "et un serveur de modèle de langage (Ollama/Mistral) pour les fonctions d'IA."),
        P("**Hors périmètre.** Application mobile native, internationalisation multi-devises avancée, "
          "intégrations comptables externes et programmes de fidélité ne font pas partie de la version "
          "présentée, mais sont envisagés comme perspectives d'évolution (cf. chapitre 6)."),
        H3("4", "Modèle économique"),
        P("Comme les plateformes de référence, Panda repose sur un modèle de **commission**. La "
          "plateforme se rémunère à la libération des fonds, en prélevant un pourcentage sur le montant "
          "versé au freelance (commission paramétrable, fixée à 10 % par défaut). S'y ajoutent des frais "
          "fixes sur les retraits et, optionnellement, des **abonnements** offrant des avantages (mise en "
          "avant, crédits de candidature). Ce modèle aligne l'intérêt de la plateforme sur la réussite des "
          "transactions : elle ne gagne que lorsque la collaboration aboutit. Les paramètres financiers "
          "sont centralisés dans la table `platform_settings`, modifiables par l'administrateur sans "
          "redéploiement."),
        H3("5", "Priorisation des fonctionnalités (MoSCoW)"),
        P("Pour piloter le périmètre, nous avons priorisé les fonctionnalités selon la méthode **MoSCoW** "
          "(*Must, Should, Could, Won't*), qui distingue l'essentiel du souhaitable."),
        TBL(["Priorité", "Fonctionnalités"],
            [["Must (indispensable)", "Authentification, offres/propositions, contrats, jalons, séquestre, "
                                      "libération, portefeuille, messagerie"],
             ["Should (important)", "Catalogue de services, retraits Stripe, évaluations, notifications, "
                                    "vérification d'identité, recherche"],
             ["Could (souhaitable)", "Assistant IA, agences, listes de talents, suivi du temps, abonnements"],
             ["Won't (hors version)", "Application mobile native, multi-devises, intégrations comptables "
                                      "externes"]],
            caption="Priorisation MoSCoW des fonctionnalités",
            widths=[0.24, 0.76]),

        H2("VI", "Méthodologie de conduite de projet"),
        P("Compte tenu de l'ampleur du périmètre et de la nature évolutive des besoins, nous avons adopté "
          "une démarche **agile et itérative**, inspirée de Scrum mais adaptée aux contraintes d'un projet "
          "académique. Plutôt que de figer l'intégralité des spécifications en amont (approche en cascade), "
          "nous avons découpé le travail en **incréments fonctionnels** livrables et testables, organisés "
          "en *sprints* d'environ deux à trois semaines."),
        H3("1", "Principes appliqués"),
        B(["**Développement incrémental** : chaque sprint livre un module complet et fonctionnel "
           "(authentification, puis offres, puis contrats, puis paiements, etc.) ;",
           "**Priorisation par la valeur et le risque** : les briques les plus risquées (le moteur de "
           "paiement) ont été traitées tôt et consolidées en priorité ;",
           "**Intégration continue** : le code est versionné avec **Git**, chaque fonctionnalité étant "
           "développée puis intégrée à la branche principale après validation ;",
           "**Tests au fil de l'eau** : les comportements critiques (séquestre, libération de jalon) sont "
           "couverts par des tests automatisés dès leur écriture ;",
           "**Revue régulière** : un point d'avancement périodique permet de réajuster les priorités et "
           "de valider les incréments."]),
        H3("2", "Découpage en sprints"),
        TBL(["Sprint", "Objectif principal", "Durée"],
            [["S0 — Cadrage", "Analyse des besoins, conception UML, maquettes, mise en place du dépôt", "2 sem."],
             ["S1 — Socle", "Authentification, modèles, migrations, profils, sécurité", "3 sem."],
             ["S2 — Marketplace", "Offres, propositions, recherche, catalogue de services", "3 sem."],
             ["S3 — Collaboration", "Contrats, jalons, fichiers, suivi du temps, extensions", "3 sem."],
             ["S4 — Paiements", "Portefeuille, séquestre, LedgerService, Stripe, retraits", "3 sem."],
             ["S5 — Communication & IA", "Messagerie temps réel, IA, catalogue, agences", "3 sem."],
             ["S6 — Qualité & livraison", "Tests, sécurité, dockerisation, rapport, soutenance", "3 sem."]],
            caption="Découpage du projet en sprints",
            widths=[0.20, 0.62, 0.18]),
        H3("3", "Gestion des risques"),
        P("Tout projet comporte des risques. Les avoir identifiés en amont nous a permis d'anticiper des "
          "mesures de réduction et de protéger l'avancement."),
        TBL(["Risque", "Impact", "Mesure de réduction"],
            [["Complexité du moteur de paiement", "Élevé", "Traitement prioritaire, tests approfondis, garde-fous"],
             ["Ampleur du périmètre fonctionnel", "Élevé", "Découpage en sprints, priorisation MoSCoW"],
             ["Temps limité (parallèle aux cours)", "Moyen", "Planning Gantt, incréments livrables"],
             ["Intégration de services tiers", "Moyen", "Maquettage, environnement de test (clés sandbox)"],
             ["Régressions lors des évolutions", "Moyen", "Tests automatisés, versionnement Git"]],
            caption="Principaux risques du projet et mesures de réduction",
            widths=[0.34, 0.14, 0.52]),

        H2("VII", "Planification — diagramme de Gantt"),
        P("La planification du projet a été formalisée au moyen d'un **diagramme de Gantt**, qui ordonne "
          "les grandes phases dans le temps et met en évidence leur durée et leur enchaînement. Cette "
          "représentation nous a permis de répartir l'effort de manière équilibrée et de suivre "
          "l'avancement par rapport aux échéances. La figure ci-dessous présente le planning prévisionnel."),
        FIG("gantt", "Diagramme de Gantt — planification prévisionnelle du projet Panda"),
        P("Les phases de conception et de développement du socle ont volontairement été dotées d'une marge "
          "confortable, car elles conditionnent l'ensemble des modules suivants. La phase de paiement, "
          "identifiée comme la plus critique, a fait l'objet d'une attention particulière et de tests "
          "approfondis avant de poursuivre."),

        H2("VIII", "Conclusion du chapitre"),
        P("Ce premier chapitre a défini le cadre du projet, caractérisé le marché du travail indépendant "
          "et formulé la problématique de la confiance, au cœur de toute place de marché de services. "
          "L'étude de l'existant a confirmé les standards attendus et précisé le positionnement de Panda, "
          "qui réunit appels d'offres et services packagés autour d'un moteur de paiement sécurisé. Enfin, "
          "la méthodologie agile et la planification adoptées ont été exposées. Le chapitre suivant "
          "approfondit l'**analyse et la spécification des besoins**, formalisées à l'aide du langage UML."),
    ]
