# -*- coding: utf-8 -*-
"""Chapitre 6 : Bilan et perspectives."""
from blocks_helpers import H1, H2, P, B, NOTE, TBL


def ch6():
    return [
        H1("Chapitre 6 : Bilan et perspectives"),

        P("Ce dernier chapitre prend du recul sur le projet. Il dresse le bilan des compétences acquises, "
          "revient sur les difficultés rencontrées et les contraintes du projet, puis ouvre sur les "
          "perspectives d'évolution de la plateforme."),

        H2("I", "Bilan des compétences techniques acquises"),
        P("La réalisation de Panda, par son ampleur, a constitué un terrain d'apprentissage exceptionnel. "
          "Elle nous a permis de consolider et d'approfondir un large éventail de compétences techniques :"),
        B(["**Conception logicielle** : modélisation UML (cas d'utilisation, classes, séquence, états) et "
           "conception de bases de données relationnelles avec Merise ;",
           "**Développement back-end** : maîtrise du framework Laravel, conception d'une API REST, patron "
           "MVC enrichi de services métier, ORM Eloquent, migrations versionnées ;",
           "**Développement front-end** : application monopage React, gestion d'état (Zustand), routage, "
           "consommation d'API, design responsive avec TailwindCSS ;",
           "**Sécurité applicative** : authentification par jeton, 2FA, OAuth, politiques d'autorisation, "
           "limitation de débit, KYC, journal d'audit ;",
           "**Intégrité transactionnelle** : conception d'un grand livre à écriture double, transactions, "
           "verrouillage, idempotence et précision décimale ;",
           "**Intégration de services tiers** : Stripe (paiements et versements), Google OAuth, modèle de "
           "langage pour l'IA, Web Push ;",
           "**Temps réel** : diffusion d'événements via WebSockets (Laravel Reverb / Echo) ;",
           "**Industrialisation** : versionnement Git, tests automatisés, conteneurisation Docker."]),
        P("Plus encore que la maîtrise d'outils isolés, ce projet nous a appris à **assembler** un "
          "écosystème technique cohérent : faire dialoguer un front-end et un back-end découplés, intégrer "
          "des services tiers hétérogènes, et garantir la cohérence d'un ensemble complexe. Cette vision "
          "d'architecte, qui dépasse la simple écriture de code, constitue sans doute l'acquis le plus "
          "précieux de cette expérience."),

        H2("II", "Compétences transversales"),
        P("Au-delà de la technique, ce projet a renforcé des compétences humaines et méthodologiques "
          "essentielles à la vie professionnelle :"),
        B(["Analyse et formalisation d'un besoin complexe en un cahier des charges structuré ;",
           "Gestion de projet agile : découpage en incréments, priorisation par la valeur et le risque ;",
           "Gestion du temps et respect d'échéances, en parallèle de la formation ;",
           "Capacité d'adaptation et résolution autonome de problèmes techniques pointus ;",
           "Rédaction d'une documentation technique claire et d'un rapport structuré ;",
           "Esprit de synthèse et prise de décision face aux arbitrages de périmètre."]),

        H2("III", "Difficultés rencontrées"),
        P("Comme tout projet d'envergure, Panda a présenté plusieurs défis qui ont nécessité recherche, "
          "réflexion et rigueur :"),
        B(["**Intégrité financière** : garantir qu'aucune opération concurrente ne puisse corrompre les "
           "soldes a imposé une étude approfondie des transactions et des verrous SQL ;",
           "**Idempotence** : concevoir des opérations rejouables sans effet de bord, indispensables face "
           "aux webhooks et aux re-tentatives réseau ;",
           "**Communication temps réel** : la mise en place du serveur WebSocket et la synchronisation de "
           "l'état côté React ont demandé une bonne compréhension du modèle événementiel ;",
           "**Ampleur du périmètre** : la richesse fonctionnelle a exigé une organisation rigoureuse pour "
           "éviter la dette technique et préserver la cohérence de l'ensemble ;",
           "**Intégration de l'IA** : la maîtrise des coûts et la gestion des temps de réponse du modèle "
           "ont nécessité limitation de débit et historisation."]),
        NOTE("Chaque difficulté a été l'occasion d'un apprentissage durable. La rigueur imposée par le "
             "moteur financier, en particulier, nous a sensibilisés à un niveau d'exigence propre aux "
             "applications critiques."),

        H2("IV", "Contraintes et limites"),
        P("Le projet a été mené dans un cadre académique, avec ses contraintes propres : un **temps "
          "limité**, mené en parallèle de la formation, et l'absence d'un environnement de production "
          "réel à grande échelle. Certaines fonctionnalités, bien qu'esquissées ou conçues, n'ont pas été "
          "menées à un niveau de finition complet : la gestion fine des litiges multi-jalons, "
          "l'internationalisation multi-devises, ou encore certaines optimisations de performance sous "
          "forte charge. Ces limites n'enlèvent rien à la cohérence de l'ensemble et constituent autant de "
          "pistes d'amélioration."),

        H2("V", "Perspectives d'évolution"),
        P("Panda a été conçue pour évoluer. Plusieurs axes d'enrichissement se dessinent naturellement, "
          "regroupés ci-dessous par ordre de priorité et d'impact attendu."),
        TBL(["Axe d'évolution", "Description", "Impact attendu"],
            [["Application mobile native", "Application iOS/Android consommant l'API REST existante, "
                                           "avec notifications push natives", "Portée élargie"],
             ["Internationalisation", "Support multi-langues (i18n) et multi-devises avec conversion "
                                      "en temps réel et conformité fiscale par pays", "Expansion géographique"],
             ["Recommandation IA avancée", "Moteur de mise en correspondance fondé sur l'historique "
                                           "des collaborations, les compétences et les évaluations", "Qualité des mises en relation"],
             ["Tableau de bord analytique", "Statistiques détaillées pour freelances (revenus, taux "
                                            "d'acceptation) et administration (KPIs financiers, GMV)", "Pilotage et rétention"],
             ["Programme de confiance", "Badges de certification, niveaux d'expérience, garanties "
                                        "de remboursement et résolution assistée des litiges", "Confiance et conversion"],
             ["Passage à l'échelle", "Cache avancé, CDN, montée en charge horizontale, "
                                     "observabilité (Prometheus, Grafana, alertes)", "Performance et fiabilité"],
             ["Intégrations comptables", "Export vers des outils de facturation et de comptabilité "
                                         "(QuickBooks, Zoho, Sage) pour les agences et freelances", "Valeur pour les pros"],
             ["Messagerie vocale/vidéo", "Appels intégrés entre clients et freelances, sans quitter "
                                         "la plateforme, pour accélérer les prises de décision", "Collaboration enrichie"]],
            caption="Axes d'évolution envisagés pour la plateforme Panda",
            widths=[0.26, 0.52, 0.22]),

        H2("VI", "Synthèse du projet"),
        P("Le tableau suivant dresse une synthèse comparative du projet, en regard des objectifs initiaux "
          "fixés dans le cahier des charges."),
        TBL(["Objectif initial", "Réalisé ?", "Observations"],
            [["Authentification multi-rôles (Sanctum, 2FA, OAuth)", "Oui", "Complète : email, Google, 2FA TOTP"],
             ["Gestion des profils freelance, client, agence", "Oui", "Profils riches avec portfolio et compétences"],
             ["Offres, propositions et catalogue de services", "Oui", "Deux modèles complets (appels d'offres + catalogue)"],
             ["Contrats, jalons, suivi du temps, fichiers", "Oui", "Extensions, activité et PDF de contrat inclus"],
             ["Moteur de paiement par séquestre (escrow)", "Oui", "LedgerService avec double-entrée et idempotence"],
             ["Messagerie temps réel (WebSockets)", "Oui", "Laravel Reverb + Echo, réactions et pièces jointes"],
             ["Intelligence artificielle (5 services)", "Oui", "Génération, matching, analyse, recherche, assistant"],
             ["Vérification d'identité KYC", "Oui", "Upload documents, revue admin, badge profil"],
             ["Back-office d'administration complet", "Oui", "Dashboard, modération, KYC, finance, retraits"],
             ["Déploiement conteneurisé Docker", "Oui", "Docker Compose avec nginx, PHP-FPM, MySQL, Redis, Reverb"],
             ["Tests automatisés", "Oui", "PHPUnit : unitaires + fonctionnels, moteur financier couvert"],
             ["Abonnements (plans payants)", "Partiel", "Structure en place, flows de paiement à affiner"]],
            caption="Récapitulatif des objectifs initiaux et de leur réalisation",
            widths=[0.44, 0.12, 0.44]),

        H2("VII", "Conclusion du chapitre"),
        P("Ce chapitre a dressé un bilan globalement très positif : Panda a permis de mobiliser un large "
          "spectre de compétences et de livrer une plateforme cohérente et ambitieuse. Les difficultés "
          "rencontrées ont nourri des apprentissages durables, et les limites identifiées ouvrent des "
          "perspectives d'évolution stimulantes. La conclusion générale qui suit synthétise l'apport de "
          "ce projet."),
    ]
