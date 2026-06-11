# -*- coding: utf-8 -*-
"""Front matter: cover, remerciement, dédicace, résumé, abstract, sommaire, tables."""
from blocks_helpers import COVER, TOC, LOF, LOT, FM


def front():
    return [
        COVER,

        FM("Remerciement",
           "Au terme de ce projet de fin d'études, nous tenons à exprimer notre profonde gratitude "
           "à toutes les personnes qui ont contribué, de près ou de loin, à la réussite de ce travail.",
           "Nous adressons nos remerciements les plus sincères à notre **encadrant pédagogique** pour "
           "sa disponibilité, ses conseils avisés et son suivi attentif tout au long de la réalisation "
           "de la plateforme **Panda**. Son accompagnement et ses orientations techniques ont été "
           "déterminants pour mener ce projet à son terme.",
           "Nous remercions également l'ensemble du corps professoral de la filière "
           "**Développement Digital — option Web Full Stack** du Centre de Préparation au BTS du "
           "Lycée Technique de Taza, pour la qualité de la formation dispensée durant ces deux années "
           "et pour les compétences techniques et humaines qu'ils nous ont transmises.",
           "Nos remerciements vont enfin à nos **familles** et à nos **proches**, pour leur soutien "
           "moral constant, leur patience et leurs encouragements, sans lesquels ce travail n'aurait "
           "pu aboutir. Que toutes les personnes ayant participé à ce projet trouvent ici l'expression "
           "de notre reconnaissance."),

        FM("Dédicace",
           "Nous dédions ce modeste travail à nos parents, pour leurs sacrifices et leur amour "
           "inconditionnel ; à nos enseignants, qui ont éclairé notre parcours ; et à tous ceux qui "
           "croient que la technologie peut rendre le travail plus juste, plus libre et plus accessible."),

        FM("Résumé",
           "Ce rapport présente la conception et le développement de **Panda**, une plateforme web "
           "full-stack de mise en relation entre **freelances** et **clients**, réalisée dans le cadre "
           "de notre projet de fin d'études en BTS Développement Digital. L'objectif est de proposer une "
           "place de marché numérique complète couvrant l'ensemble du cycle de collaboration : "
           "publication d'offres et candidatures, vente de services packagés, contractualisation, suivi "
           "des jalons et du temps, et surtout un système de **paiement sécurisé par séquestre (escrow)** "
           "garantissant la confiance entre les parties.",
           "Sur le plan technique, l'application repose sur une architecture moderne découplée : une "
           "**API REST Laravel 12** (PHP 8.2) exposant la logique métier, une **interface React 19** "
           "(single-page application) côté client, et une base de données **MySQL**. L'authentification "
           "s'appuie sur **Laravel Sanctum** (jetons Bearer), renforcée par l'authentification à deux "
           "facteurs (2FA) et une vérification d'identité (KYC). Le cœur financier est assuré par un "
           "**moteur de grand livre comptable** à écriture double, transactionnel et idempotent, intégré "
           "à **Stripe** pour les dépôts et les versements. La plateforme intègre par ailleurs une "
           "**messagerie temps réel** (Laravel Reverb / WebSockets), des fonctions d'**intelligence "
           "artificielle** (génération de propositions, mise en correspondance) et un module d'agences.",
           "Les tests menés ont confirmé la fiabilité du moteur de paiement et la robustesse de "
           "l'architecture. En conclusion, ce projet illustre la mise en œuvre concrète d'une application "
           "professionnelle complète, sécurisée et évolutive, répondant à un besoin réel du marché du "
           "travail indépendant.",
           "**Mots-clés :** marketplace, freelance, escrow, Laravel, React, MySQL, Sanctum, Stripe, "
           "WebSocket, API REST, paiement sécurisé, intelligence artificielle."),

        FM("Abstract",
           "This report presents the design and development of **Panda**, a full-stack web platform "
           "connecting **freelancers** with **clients**, carried out as part of our final-year project in "
           "the BTS Digital Development program. The goal is to deliver a complete digital marketplace "
           "covering the entire collaboration lifecycle: job posting and proposals, productized service "
           "selling, contracting, milestone and time tracking, and — most importantly — a secure "
           "**escrow-based payment system** that guarantees trust between parties.",
           "Technically, the application relies on a modern decoupled architecture: a **Laravel 12 REST "
           "API** (PHP 8.2) exposing the business logic, a **React 19 single-page application** on the "
           "client side, and a **MySQL** database. Authentication is built on **Laravel Sanctum** (Bearer "
           "tokens), hardened with two-factor authentication (2FA) and identity verification (KYC). The "
           "financial core is handled by a transactional, idempotent **double-entry ledger engine** "
           "integrated with **Stripe** for deposits and payouts. The platform also features **real-time "
           "messaging** (Laravel Reverb / WebSockets), **artificial-intelligence** helpers (proposal "
           "generation, matching) and an agency module.",
           "The tests carried out confirmed the reliability of the payment engine and the robustness of "
           "the architecture. In conclusion, this project demonstrates the concrete implementation of a "
           "complete, secure and scalable professional application that addresses a real need in the "
           "freelance labour market.",
           "**Keywords:** marketplace, freelance, escrow, Laravel, React, MySQL, Sanctum, Stripe, "
           "WebSocket, REST API, secure payment, artificial intelligence."),

        TOC,
        LOF,
        LOT,
    ]
