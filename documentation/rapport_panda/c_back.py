# -*- coding: utf-8 -*-
"""Back matter: conclusion générale, glossaire, références."""
from blocks_helpers import H1, H2, H3, P, B, CODE, TBL


def back():
    return [
        H1("Conclusion générale"),
        P("Au terme de ce projet de fin d'études, nous avons conçu et développé **Panda**, une plateforme "
          "web full-stack de mise en relation entre freelances et clients. Partant d'un constat simple — "
          "la difficulté de bâtir la confiance entre des parties distantes — nous avons construit une "
          "solution complète qui couvre l'ensemble du cycle de collaboration et place la **sécurité "
          "financière** au cœur de son architecture."),
        P("Sur le plan technique, le projet a permis de mettre en œuvre une architecture professionnelle "
          "moderne : une API REST Laravel découplée, une interface React réactive, une base de données "
          "MySQL rigoureusement modélisée, et un ensemble de services tiers intégrés (Stripe, OAuth, "
          "WebSockets, intelligence artificielle). La pièce maîtresse en est le **moteur de grand livre** "
          "à écriture double, transactionnel et idempotent, qui garantit l'intégrité de chaque mouvement "
          "de fonds — du dépôt au versement, en passant par le séquestre et la libération des jalons."),
        P("Au-delà du résultat technique, cette expérience nous a profondément formés. Elle nous a "
          "confrontés aux réalités d'un projet d'envergure : la nécessité d'une conception soignée, "
          "l'exigence de qualité propre aux applications critiques, et l'importance des arbitrages. Elle a "
          "consolidé nos compétences en développement full-stack et renforcé notre autonomie, notre "
          "capacité d'analyse et notre rigueur."),
        P("Ce projet illustre enfin une conviction qui a guidé l'ensemble de notre travail : la "
          "technologie, lorsqu'elle est mise au service d'un besoin réel, peut rendre le travail plus "
          "**juste** et plus **accessible**. En sécurisant la rémunération du freelance et en protégeant "
          "l'investissement du client, Panda ne se contente pas de mettre en relation deux parties : elle "
          "crée les conditions de la confiance, sans laquelle aucune collaboration durable n'est possible. "
          "C'est cette dimension — à la fois technique et humaine — qui donne tout son sens à ce projet."),
        P("Panda n'est pas une fin en soi, mais une fondation solide et évolutive. Les perspectives "
          "esquissées — application mobile, internationalisation, recommandation avancée, passage à "
          "l'échelle — témoignent du potentiel de la plateforme. Nous achevons ce travail avec la "
          "conviction d'avoir mené un projet à la fois ambitieux et abouti, et avec une vision plus claire "
          "et plus assurée du métier de développeur. Pour finir, nous adressons nos remerciements à toutes "
          "les personnes qui nous ont accompagnés et soutenus tout au long de cette aventure."),

        H1("Glossaire"),
        P("Le tableau suivant définit les principaux termes techniques employés dans ce rapport."),
        TBL(["Terme", "Définition"],
            [["API REST", "Interface de programmation exposant des ressources via HTTP selon les principes REST."],
             ["SPA", "Single Page Application : application web chargée une fois et mise à jour dynamiquement."],
             ["Escrow (séquestre)", "Mécanisme par lequel des fonds sont bloqués par un tiers de confiance "
                                    "jusqu'à la réalisation d'une condition (livraison conforme)."],
             ["Jalon (milestone)", "Étape d'un contrat associée à un montant, soumise puis validée."],
             ["Grand livre (ledger)", "Registre comptable où chaque mouvement est enregistré de façon immuable."],
             ["Écriture double", "Principe comptable où tout débit a un crédit correspondant."],
             ["Idempotence", "Propriété d'une opération produisant le même effet, qu'elle soit exécutée "
                            "une ou plusieurs fois."],
             ["Jeton Bearer", "Jeton d'accès transmis dans l'en-tête HTTP Authorization pour authentifier."],
             ["Sanctum", "Système d'authentification par jeton de Laravel, adapté aux SPA."],
             ["2FA / TOTP", "Authentification à deux facteurs par code temporel à usage unique."],
             ["OAuth", "Protocole de délégation d'autorisation (connexion via Google, etc.)."],
             ["KYC", "Know Your Customer : vérification de l'identité d'un utilisateur."],
             ["Webhook", "Requête HTTP émise par un service tiers (Stripe) pour notifier un événement."],
             ["WebSocket", "Protocole de communication bidirectionnelle temps réel."],
             ["ORM", "Object-Relational Mapping : correspondance entre objets et tables relationnelles."],
             ["Throttling", "Limitation du nombre de requêtes par intervalle de temps."],
             ["Migration", "Script versionné décrivant l'évolution du schéma de la base de données."]],
            caption="Glossaire des principaux termes",
            widths=[0.24, 0.76]),

        H1("Références bibliographiques et webographie"),
        P("Les ressources suivantes ont été consultées tout au long de la conception et de la réalisation "
          "du projet."),
        B(["Laravel, *Documentation officielle*, https://laravel.com/docs",
           "Laravel Sanctum, *API Token Authentication*, https://laravel.com/docs/sanctum",
           "Laravel Reverb, *WebSockets temps réel*, https://laravel.com/docs/reverb",
           "React, *Documentation officielle*, https://react.dev",
           "Vite, *Next Generation Frontend Tooling*, https://vitejs.dev",
           "TailwindCSS, *Documentation*, https://tailwindcss.com/docs",
           "Zustand, *State management for React*, https://zustand-demo.pmnd.rs",
           "Stripe, *API Reference & Connect*, https://stripe.com/docs",
           "MySQL, *Reference Manual*, https://dev.mysql.com/doc",
           "Ollama, *Run large language models locally*, https://ollama.com",
           "OMG, *Unified Modeling Language (UML) Specification*, https://www.omg.org/spec/UML",
           "Martin Fowler, *Patterns of Enterprise Application Architecture*, Addison-Wesley.",
           "OpenClassrooms, *Concevez votre site web avec PHP et MySQL*, https://openclassrooms.com"]),

        H1("Annexes"),
        P("Cette section regroupe quelques éléments techniques complémentaires destinés à éclairer la "
          "mise en œuvre du projet."),

        H3("A", "Configuration de l'environnement"),
        P("La configuration de l'application est externalisée dans un fichier d'environnement, ce qui "
          "sépare le code des secrets et facilite le passage d'un environnement à l'autre. En voici un "
          "extrait représentatif (valeurs sensibles masquées)."),
        CODE("backend-laravel/.env (extrait)",
             "APP_NAME=Panda\n"
             "APP_ENV=local\n"
             "DB_CONNECTION=mysql\n"
             "DB_DATABASE=panda\n"
             "DB_USERNAME=root\n"
             "\n"
             "SANCTUM_STATEFUL_DOMAINS=localhost:5173\n"
             "BROADCAST_CONNECTION=reverb\n"
             "REVERB_APP_KEY=********\n"
             "\n"
             "STRIPE_KEY=pk_test_********\n"
             "STRIPE_SECRET=sk_test_********\n"
             "STRIPE_WEBHOOK_SECRET=whsec_********\n"
             "\n"
             "GOOGLE_CLIENT_ID=********\n"
             "OLLAMA_BASE_URL=http://localhost:11434"),

        H3("B", "Exemple de réponse de l'API"),
        P("Les réponses de l'API sont normalisées au format JSON. L'exemple suivant illustre le détail "
          "d'un portefeuille retourné par le point d'accès `/api/payments/wallet`."),
        CODE("Exemple de réponse JSON — portefeuille",
             "{\n"
             '  "wallet": {\n'
             '    "balance": "1240.00",\n'
             '    "escrow_balance": "800.00",\n'
             '    "pending_balance": "0.00",\n'
             '    "currency": "USD"\n'
             "  },\n"
             '  "recent_transactions": [\n'
             '    { "reference": "PAY-3KX…", "type": "credit",  "amount": "90.00" },\n'
             '    { "reference": "ESC-9Q2…", "type": "escrow",  "amount": "800.00" }\n'
             "  ]\n"
             "}"),

        H3("C", "Principaux services métier"),
        P("Le tableau ci-dessous recense les services métier de l'application et leur responsabilité."),
        TBL(["Service", "Responsabilité"],
            [["LedgerService", "Tous les mouvements de fonds (grand livre à écriture double)"],
             ["StripeService", "Sessions de paiement, Connect et versements"],
             ["SubscriptionService", "Gestion des abonnements et des crédits"],
             ["HourlyBillingService", "Facturation hebdomadaire des contrats horaires"],
             ["CatalogCheckoutService", "Commandes du catalogue de services"],
             ["NotificationService", "Émission des notifications in-app et push"],
             ["ContractActivityService", "Journalisation des événements d'un contrat"],
             ["AuditLogService", "Traçabilité des actions sensibles"],
             ["TotpService", "Génération et vérification des codes 2FA"]],
            caption="Principaux services métier de la plateforme",
            widths=[0.32, 0.68]),

        H3("D", "Commandes utiles"),
        P("Quelques commandes Artisan et npm fréquemment utilisées durant le développement :"),
        CODE("Commandes Artisan / npm",
             "php artisan migrate            # appliquer les migrations\n"
             "php artisan db:seed            # injecter les données de démonstration\n"
             "php artisan test               # exécuter la suite de tests\n"
             "php artisan queue:work         # traiter la file d'attente\n"
             "php artisan reverb:start       # démarrer le serveur WebSocket\n"
             "npm run dev                    # serveur de développement front-end\n"
             "npm run build                  # build de production du front-end"),

        H3("E", "Extrait du script de création des tables financières"),
        P("À titre d'illustration, voici le script SQL (généré à partir des migrations) des deux tables "
          "au cœur de l'intégrité financière, avec leurs types décimaux et leurs contraintes."),
        CODE("Schéma SQL — wallets & transactions (extrait)",
             "CREATE TABLE wallets (\n"
             "  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,\n"
             "  user_id         BIGINT UNSIGNED NOT NULL,\n"
             "  balance         DECIMAL(12,2) NOT NULL DEFAULT 0,\n"
             "  pending_balance DECIMAL(12,2) NOT NULL DEFAULT 0,\n"
             "  escrow_balance  DECIMAL(12,2) NOT NULL DEFAULT 0,\n"
             "  currency        VARCHAR(255) NOT NULL DEFAULT 'USD',\n"
             "  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n"
             ");\n"
             "\n"
             "CREATE TABLE transactions (\n"
             "  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,\n"
             "  wallet_id       BIGINT UNSIGNED NOT NULL,\n"
             "  user_id         BIGINT UNSIGNED NOT NULL,\n"
             "  contract_id     BIGINT UNSIGNED NULL,\n"
             "  milestone_id    BIGINT UNSIGNED NULL,\n"
             "  reference       VARCHAR(255) NOT NULL UNIQUE,\n"
             "  type            ENUM('credit','debit','escrow','release','refund','withdrawal','fee'),\n"
             "  amount          DECIMAL(12,2) NOT NULL,\n"
             "  fee             DECIMAL(12,2) NOT NULL DEFAULT 0,\n"
             "  balance_after   DECIMAL(12,2) NULL,\n"
             "  idempotency_key VARCHAR(255) NULL,\n"
             "  status          ENUM('pending','completed','failed','cancelled') DEFAULT 'pending',\n"
             "  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE\n"
             ");"),
    ]
