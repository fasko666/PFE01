# -*- coding: utf-8 -*-
"""Front matter: cover, remerciement, dédicace, résumé, abstract, sommaire, tables."""
from blocks_helpers import COVER, TOC, LOF, LOT, FM


def front():
    return [
        COVER,

        FM("Remerciement",
           "Nous tenons à exprimer nos plus sincères remerciements à **M. Hamid EL BOURAKKADI**, "
           "notre encadrant pédagogique, pour son accompagnement tout au long de ce projet. Sa "
           "disponibilité, ses conseils et son soutien ont été précieux pour mener à bien ce travail.",
           "Nous remercions également l'ensemble de l'équipe pédagogique de la filière **Développement "
           "Web Full Stack** du centre BTS de Taza pour les connaissances et compétences transmises "
           "durant ces deux années de formation.",
           "Un remerciement spécial à nos **familles** et nos **proches** pour leur patience, leur "
           "soutien moral constant et leurs encouragements, sans lesquels ce projet n'aurait pas été "
           "possible.",
           "Enfin, nous remercions toutes les personnes qui ont contribué de près ou de loin à la "
           "réussite de ce projet."),

        FM("Résumé",
           "Ce projet consiste en la conception et le développement d'une **plateforme web de mise en "
           "relation entre freelances et clients**. L'objectif principal est de faciliter la publication "
           "de services, la recherche de prestataires et la gestion des missions en ligne. La plateforme "
           "permet aux utilisateurs de créer un profil, de proposer ou rechercher des services, et de "
           "gérer les missions avec un suivi clair et efficace.",
           "Sur le plan technique, l'application repose sur une architecture découplée : une "
           "**API REST Laravel 12** côté serveur, une **interface React 19** côté client, et une base "
           "de données **MySQL**. L'authentification s'appuie sur Laravel Sanctum, renforcée par la "
           "double authentification (2FA). Le module de paiement implémente un système de **séquestre "
           "(escrow)** sécurisé intégré à Stripe. La plateforme intègre également une **messagerie "
           "temps réel** (WebSockets) et des fonctions d'**intelligence artificielle**.",
           "Ce travail inclut l'analyse des besoins, la conception de l'architecture du système, "
           "le développement complet de l'application et la validation des fonctionnalités. "
           "L'ensemble du projet vise à offrir une solution pratique, intuitive et sécurisée pour "
           "les freelances et leurs clients, améliorant ainsi l'efficacité des collaborations en ligne.",
           "**Mots-clés :** marketplace, freelance, séquestre, Laravel, React, MySQL, Sanctum, Stripe, "
           "WebSocket, API REST, paiement sécurisé, intelligence artificielle."),

        FM("Abstract",
           "This project focuses on the design and development of a **web platform connecting "
           "freelancers with clients**. The main objective is to simplify service posting, freelancer "
           "search, and online project management.",
           "The platform allows users to create profiles, offer or search for services, and manage "
           "tasks with clear and effective tracking. Technically, the application is built on a "
           "decoupled architecture: a **Laravel 12 REST API** on the server side, a **React 19** "
           "single-page application on the client side, and a **MySQL** database. Authentication uses "
           "Laravel Sanctum with two-factor authentication (2FA). Payments are secured through an "
           "**escrow system** integrated with Stripe, alongside **real-time messaging** (WebSockets) "
           "and **AI-powered** features.",
           "The work includes requirements analysis, system architecture design, application "
           "development, and functional validation. Overall, the project aims to provide a practical, "
           "intuitive, and accessible solution for freelancers and clients, enhancing the efficiency "
           "of online collaborations.",
           "**Keywords:** marketplace, freelance, escrow, Laravel, React, MySQL, Sanctum, Stripe, "
           "WebSocket, REST API, secure payment, artificial intelligence."),

        TOC,
        LOF,
        LOT,
    ]
