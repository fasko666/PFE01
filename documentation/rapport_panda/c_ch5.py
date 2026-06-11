# -*- coding: utf-8 -*-
"""Chapitre 5 : Tests, sécurité et déploiement."""
from blocks_helpers import H1, H2, H3, P, B, NOTE, CODE, FIG, TBL


def ch5():
    return [
        H1("Chapitre 5 : Tests, sécurité et déploiement"),

        P("La qualité d'une plateforme transactionnelle ne se mesure pas seulement à ses fonctionnalités, "
          "mais à sa **fiabilité**, à sa **sécurité** et à sa capacité à être **déployée** sereinement. Ce "
          "chapitre présente la stratégie de tests adoptée, en insistant sur la validation du moteur "
          "financier, fait la synthèse des mesures de sécurité, puis décrit l'architecture de déploiement "
          "conteneurisée."),

        H2("I", "Stratégie de tests"),
        P("Nous avons adopté une stratégie de tests **automatisés** centrée sur les comportements "
          "critiques, à l'aide de **PHPUnit** (intégré à Laravel). Deux grandes familles de tests ont été "
          "écrites : des **tests unitaires**, qui vérifient une unité de logique isolée (un service, une "
          "méthode), et des **tests fonctionnels** (*feature tests*), qui exercent un point d'API de bout "
          "en bout — de la requête HTTP à la base de données."),
        B(["**Tests d'authentification** : inscription, connexion, limitation de débit, 2FA, "
           "réinitialisation de mot de passe ;",
           "**Tests du flux métier** : publication d'offre, soumission et acceptation de proposition, "
           "création de contrat, cycle de vie des jalons ;",
           "**Tests du moteur financier** : dépôt, séquestre, libération, retrait, remboursement, litige ;",
           "**Tests d'autorisation** : un utilisateur ne peut agir que dans le périmètre de ses droits ;",
           "**Tests de validation** : rejet des entrées invalides par les FormRequests."]),
        P("Le tableau ci-dessous récapitule la couverture par domaine fonctionnel et le type de tests "
          "associé."),
        TBL(["Domaine", "Type de tests", "Priorité"],
            [["Authentification & sécurité", "Fonctionnels + unitaires", "Élevée"],
             ["Moteur financier (ledger, escrow)", "Unitaires + fonctionnels", "Critique"],
             ["Contrats & jalons", "Fonctionnels", "Élevée"],
             ["Offres, propositions, catalogue", "Fonctionnels", "Moyenne"],
             ["Messagerie & notifications", "Fonctionnels", "Moyenne"],
             ["Autorisation (policies)", "Fonctionnels", "Élevée"],
             ["Validation des entrées", "Unitaires", "Moyenne"]],
            caption="Couverture des tests par domaine fonctionnel",
            widths=[0.42, 0.38, 0.20]),

        H2("II", "Validation du moteur financier"),
        P("Le `LedgerService` a fait l'objet d'une attention toute particulière, car la moindre faille y "
          "serait critique. Au-delà des cas nominaux, les tests vérifient des **invariants** et des "
          "**scénarios limites** : que se passe-t-il en cas d'appel dupliqué, de solde insuffisant, de "
          "double approbation, ou de contrat en litige ?"),
        CODE("Exemple de test fonctionnel — la libération crédite le bon montant net (principe)",
             "public function test_release_credite_le_freelance_du_montant_net(): void\n"
             "{\n"
             "    // étant donné un séquestre financé et un jalon soumis de 100\n"
             "    $this->ledger->fundEscrow($client, $contract, 100);\n"
             "    $milestone = Milestone::factory()->submitted()->create(['amount' => 100]);\n"
             "\n"
             "    // quand le client libère le jalon\n"
             "    $this->ledger->releaseMilestone($client, $milestone);\n"
             "\n"
             "    // alors : freelance +90, plateforme +10, jalon = payé, séquestre = 0\n"
             "    $this->assertEquals(90, $freelancer->wallet->balance);\n"
             "    $this->assertEquals('paid', $milestone->fresh()->status);\n"
             "}"),
        P("Le tableau suivant récapitule un échantillon des cas de test du moteur financier et leurs "
          "résultats."),
        TBL(["Cas de test", "Attendu", "Résultat"],
            [["Dépôt de fonds", "Solde crédité, transaction tracée", "Conforme"],
             ["Financement du séquestre", "balance ↓, escrow ↑, atomique", "Conforme"],
             ["Libération de jalon (commission 10 %)", "Freelance +net, plateforme +frais", "Conforme"],
             ["Appel dupliqué (même clé)", "Aucune double écriture (idempotent)", "Conforme"],
             ["Solde insuffisant", "Opération refusée, état inchangé", "Conforme"],
             ["Libération sur contrat en litige", "Bloquée par garde-fou", "Conforme"],
             ["Retrait : demande puis rejet admin", "Fonds re-crédités au solde", "Conforme"],
             ["Invariant Σ(transactions) = solde", "Égalité vérifiée", "Conforme"]],
            caption="Échantillon des cas de test du moteur financier",
            widths=[0.46, 0.34, 0.20]),
        NOTE("**Résultat :** l'ensemble des comportements financiers critiques se comporte conformément "
             "aux attentes, y compris dans les scénarios concurrents et d'erreur. La cohérence des soldes "
             "est garantie par construction (transactions, verrous, double-entrée)."),

        H2("III", "Scénarios de tests fonctionnels"),
        P("En complément des tests automatisés, une **recette fonctionnelle manuelle** a été réalisée afin "
          "de valider les parcours utilisateurs de bout en bout, dans un navigateur et avec les données "
          "de test. Chaque scénario est défini par ses préconditions, la séquence d'actions effectuée et "
          "le résultat attendu. Le tableau suivant en présente un panorama représentatif, couvrant "
          "l'ensemble des modules fonctionnels."),
        TBL(["Scénario", "Module", "Résultat attendu", "Statut"],
            [["Inscription d'un freelance avec choix de rôle", "Auth", "Compte créé, e-mail de vérification envoyé, redirection vers dashboard", "Conforme"],
             ["Connexion Google OAuth (premier accès)", "Auth", "Compte créé via OAuth, rôle demandé, jeton Sanctum émis", "Conforme"],
             ["Activation 2FA (TOTP) depuis les paramètres", "Auth / Sécurité", "QR code affiché, code TOTP validé, 2FA activée", "Conforme"],
             ["Soumission KYC (passeport + selfie)", "Sécurité / Admin", "Documents uploadés, statut = pending, admin notifié", "Conforme"],
             ["Approbation KYC par l'administrateur", "Admin", "Statut = approved, badge KYC visible sur le profil", "Conforme"],
             ["Publication d'une offre par un client", "Marketplace", "Offre visible dans la liste, statut = open, catégorie filtrée", "Conforme"],
             ["Recherche d'offres par catégorie et budget", "Marketplace", "Résultats filtrés correctement, pagination fonctionnelle", "Conforme"],
             ["Soumission d'une proposition avec assistance IA", "Marketplace / IA", "Proposition enregistrée, IA génère un texte de couverture, client notifié", "Conforme"],
             ["Acceptation d'une proposition par le client", "Contrats", "Contrat créé automatiquement, les deux parties notifiées", "Conforme"],
             ["Création d'un jalon par le freelance", "Contrats", "Jalon enregistré (status=pending), visible dans l'onglet jalons", "Conforme"],
             ["Dépôt de fonds via Stripe Checkout", "Paiements", "Redirection Stripe, webhook reçu, solde disponible crédité", "Conforme"],
             ["Financement du séquestre par le client", "Paiements", "balance ↓, escrow_balance ↑, contrat mis à jour", "Conforme"],
             ["Soumission d'un jalon livré", "Contrats", "Status = submitted, client notifié pour révision", "Conforme"],
             ["Validation (libération) d'un jalon", "Paiements", "Freelance crédité (net 90 %), commission prélevée (10 %), jalon = paid", "Conforme"],
             ["Rejet d'un jalon par le client", "Contrats", "Status = rejected, motif enregistré, freelance notifié", "Conforme"],
             ["Déclenchement d'un litige sur un contrat", "Contrats", "Status = disputed, libérations bloquées, admin alerté", "Conforme"],
             ["Résolution du litige par l'administrateur", "Admin / Paiements", "Fonds distribués selon décision admin, litige clos", "Conforme"],
             ["Commande d'un service catalogue (palier standard)", "Catalogue", "Commande créée, paiement traité, freelance notifié", "Conforme"],
             ["Envoi et réception de message temps réel", "Messagerie", "Message affiché instantanément chez le destinataire (WebSocket)", "Conforme"],
             ["Réaction et édition d'un message", "Messagerie", "Réaction visible en temps réel, message édité mis à jour", "Conforme"],
             ["Demande de retrait (Stripe Connect)", "Paiements", "Demande enregistrée (pending), admin notifié pour approbation", "Conforme"],
             ["Approbation et transfert du retrait", "Admin / Paiements", "Transfert Stripe déclenché, statut = completed, historique mis à jour", "Conforme"],
             ["Dépôt d'un fichier sur un contrat", "Collaboration", "Fichier stocké, versionné, téléchargeable par les deux parties", "Conforme"],
             ["Suivi du temps (démarrer / arrêter)", "Collaboration", "Entrée de temps créée, récapitulatif hebdomadaire mis à jour", "Conforme"],
             ["Soumission d'une évaluation post-contrat", "Évaluations", "Note et commentaire visibles sur le profil public du destinataire", "Conforme"],
             ["Tentative d'accès admin sans rôle admin", "Sécurité", "Réponse 403 Forbidden, aucune donnée exposée", "Conforme"],
             ["Enregistrement d'une offre en favori", "Marketplace", "Offre sauvegardée, visible dans la liste des favoris du client", "Conforme"],
             ["Constitution d'une liste de talents", "Talents", "Liste créée, freelances ajoutés, liste renommable et partageable", "Conforme"]],
            caption="Scénarios de tests fonctionnels manuels — résultats de recette",
            widths=[0.34, 0.18, 0.34, 0.14]),
        P("L'ensemble des parcours critiques a été validé avec succès. Les quelques points d'amélioration "
          "relevés — principalement des cas limites d'interface (messages d'erreur à affiner, transitions "
          "d'état à harmoniser) — ont été corrigés avant la livraison finale. La couverture fonctionnelle "
          "est donc complète et conforme aux exigences initiales."),

        H2("V", "Synthèse de la sécurité"),
        P("La sécurité de Panda repose sur une **défense en profondeur** : plutôt qu'une barrière unique, "
          "plusieurs couches indépendantes se renforcent mutuellement. Le tableau suivant synthétise les "
          "mesures mises en œuvre et la menace qu'elles adressent."),
        TBL(["Mesure", "Menace adressée"],
            [["Hachage bcrypt des mots de passe", "Fuite de la base / vol d'identifiants"],
             ["Jetons Sanctum + 2FA (TOTP)", "Usurpation de compte"],
             ["Limitation de débit (throttling)", "Force brute, credential stuffing, abus d'API"],
             ["Politiques d'autorisation (Policies)", "Élévation de privilèges, accès non autorisé"],
             ["Validation systématique (FormRequest)", "Données malveillantes, injection"],
             ["Requêtes préparées (Eloquent/PDO)", "Injection SQL"],
             ["Vérification de signature des webhooks", "Falsification d'événements de paiement"],
             ["Idempotence des opérations financières", "Double paiement, rejeu"],
             ["Vérification d'identité (KYC)", "Comptes frauduleux, blanchiment"],
             ["Journal d'audit", "Traçabilité, investigation post-incident"]],
            caption="Synthèse des mesures de sécurité (défense en profondeur)",
            widths=[0.46, 0.54]),

        H2("VI", "Déploiement"),
        P("Pour garantir la portabilité et la reproductibilité de l'environnement, Panda est conçu pour "
          "être **conteneurisé** avec **Docker**. Chaque service tourne dans son propre conteneur, "
          "orchestré par **Docker Compose**, ce qui élimine les divergences entre les postes de "
          "développement et la production."),
        FIG("deploy", "Diagramme de déploiement — conteneurs Docker"),
        P("L'architecture de déploiement comprend : un **reverse-proxy** (nginx) assurant le routage et "
          "le TLS, le conteneur **applicatif** (PHP-FPM/Laravel) servant l'API, le **front-end** React "
          "compilé et servi statiquement, la base **MySQL** (sur volume persistant), **Redis** (cache et "
          "file d'attente), le serveur **Reverb** (WebSockets) et un **worker** traitant les tâches "
          "asynchrones (notifications, e-mails, facturation hebdomadaire)."),
        H3("1", "Optimisations de performance"),
        P("Plusieurs dispositifs concourent à de bonnes performances : **index plein-texte** MySQL pour "
          "accélérer la recherche d'offres et de freelances, **cache Redis** pour les données fréquemment "
          "consultées, **pagination** systématique des listes, **chargement anticipé** des relations "
          "Eloquent (pour éviter le problème des requêtes N+1), et exécution **asynchrone** des tâches "
          "lourdes (envoi d'e-mails, notifications, facturation) via une file d'attente. Le découplage "
          "front/back et la conception sans état de l'API facilitent par ailleurs une éventuelle montée "
          "en charge horizontale."),
        H3("2", "Intégration et déploiement continus"),
        P("Le dépôt est outillé pour l'**intégration continue** : à chaque évolution, la suite de tests "
          "est exécutée automatiquement, garantissant qu'aucune régression n'est introduite. Cette "
          "discipline, associée au versionnement Git, sécurise l'évolution du code et prépare un "
          "**déploiement continu** vers un environnement d'hébergement."),
        CODE("Mise en service (principe)",
             "docker compose up -d --build         # démarrage de la pile\n"
             "php artisan migrate --force          # application des migrations\n"
             "php artisan queue:work               # traitement des tâches asynchrones\n"
             "php artisan reverb:start             # serveur WebSocket temps réel\n"
             "npm run build                        # build du front-end React"),
        P("Avant chaque livraison, une phase de **recette** vérifie manuellement les parcours critiques de "
          "bout en bout (inscription → publication d'offre → proposition → contrat → séquestre → "
          "libération), en complément des tests automatisés. La combinaison des tests de "
          "**non-régression** (rejoués à chaque évolution) et de la recette fonctionnelle garantit qu'une "
          "nouvelle fonctionnalité n'altère pas les comportements existants, condition essentielle de la "
          "confiance sur une plateforme financière."),

        H2("VII", "Conclusion du chapitre"),
        P("Ce chapitre a démontré que Panda n'est pas seulement fonctionnelle, mais **fiable**, "
          "**sécurisée** et **déployable**. La stratégie de tests, focalisée sur le moteur financier, a "
          "confirmé l'intégrité des opérations critiques. La synthèse de la sécurité a mis en évidence une "
          "défense en profondeur cohérente. Enfin, la conteneurisation Docker garantit un déploiement "
          "reproductible. Le dernier chapitre dresse le bilan global du projet et ouvre sur ses "
          "perspectives."),
    ]
