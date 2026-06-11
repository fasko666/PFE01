# -*- coding: utf-8 -*-
"""Introduction générale."""
from blocks_helpers import H1, P


def intro():
    return [
        H1("Introduction générale"),

        P("La transformation numérique a profondément bouleversé le monde du travail au cours de la "
          "dernière décennie. L'essor du **travail indépendant** — le *freelancing* — en constitue l'une "
          "des manifestations les plus marquantes : de plus en plus de professionnels choisissent de "
          "proposer leurs compétences à distance, tandis que les entreprises, de la *start-up* à la grande "
          "organisation, externalisent une part croissante de leurs projets vers des talents qualifiés, "
          "où qu'ils se trouvent. Cette nouvelle économie, dite *économie des plateformes*, repose sur des "
          "places de marché numériques capables de mettre en relation l'offre et la demande de "
          "compétences, tout en sécurisant la transaction qui les unit."),

        P("Cependant, cette mise en relation soulève une difficulté centrale : la **confiance**. Comment "
          "un client peut-il être certain de ne payer que pour un travail effectivement livré et conforme ? "
          "Comment un freelance peut-il être assuré d'être rémunéré une fois la prestation réalisée ? "
          "Sur un marché où les deux parties ne se connaissent pas et ne se rencontrent jamais "
          "physiquement, l'absence de tiers de confiance constitue un frein majeur. Les plateformes "
          "internationales de référence (Upwork, Fiverr, Malt, Freelancer.com) ont répondu à ce problème "
          "par des mécanismes de **séquestre de fonds** (escrow), de jalons de paiement et de gestion des "
          "litiges, devenus aujourd'hui des standards incontournables du secteur."),

        P("C'est dans ce contexte que s'inscrit notre projet de fin d'études : la conception et le "
          "développement de **Panda**, une plateforme web complète de mise en relation entre freelances et "
          "clients. Loin de se limiter à un simple annuaire ou à un formulaire de contact, Panda ambitionne "
          "de couvrir l'intégralité du cycle de vie d'une collaboration : depuis la découverte d'un talent "
          "ou d'une offre, jusqu'au versement final des fonds, en passant par la contractualisation, le "
          "suivi des livrables et la communication. Le projet met un soin particulier à reproduire, dans un "
          "cadre académique, les briques techniques les plus exigeantes d'une telle plateforme — au premier "
          "rang desquelles un **moteur de paiement par séquestre** fiable et auditable."),

        P("Ce travail nous a permis de mobiliser et d'approfondir l'ensemble des compétences acquises "
          "durant notre formation : modélisation et conception logicielle (UML, Merise), développement "
          "back-end avec le framework **Laravel**, développement front-end avec la bibliothèque **React**, "
          "conception de bases de données relationnelles avec **MySQL**, sécurité applicative, intégration "
          "de services tiers (Stripe, OAuth, intelligence artificielle) et communication temps réel. "
          "Il nous a également confrontés aux réalités d'un projet d'envergure : arbitrages de périmètre, "
          "gestion de la complexité et exigence de qualité."),

        P("Le présent rapport rend compte de la démarche suivie et des résultats obtenus. Il s'organise "
          "en **six chapitres**. Le **premier** présente le contexte général du projet, la problématique, "
          "l'étude de l'existant et la méthodologie de conduite adoptée. Le **deuxième** est consacré à "
          "l'analyse et à la spécification des besoins, formalisées à l'aide du langage UML. Le "
          "**troisième** détaille la conception de la solution : architecture, sécurité, modélisation "
          "objet, diagrammes dynamiques et conception de la base de données. Le **quatrième** décrit la "
          "réalisation effective, en s'appuyant sur des extraits de code significatifs et une présentation "
          "des interfaces. Le **cinquième** aborde les tests, la sécurité et le déploiement. Le "
          "**sixième**, enfin, dresse le bilan du projet, ses limites et ses perspectives d'évolution, "
          "avant une conclusion générale."),
    ]
