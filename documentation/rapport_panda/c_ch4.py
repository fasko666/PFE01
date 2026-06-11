# -*- coding: utf-8 -*-
"""Chapitre 4 : Réalisation de l'application."""
from blocks_helpers import H1, H2, H3, P, B, NL, NOTE, CODE, FIG, TBL


def ch4():
    return [
        H1("Chapitre 4 : Réalisation de l'application"),

        P("Ce chapitre présente la mise en œuvre concrète de Panda. Après avoir décrit l'environnement de "
          "développement et l'organisation du code, il détaille — à travers des extraits significatifs — "
          "les briques techniques les plus structurantes : le moteur financier, la sécurité, la "
          "communication temps réel, l'intégration de Stripe et l'intelligence artificielle. Il s'achève "
          "par une présentation des principales interfaces utilisateur de la plateforme."),

        H2("I", "Environnement de développement"),
        P("Le projet a été développé dans un environnement outillé et reproductible, conforme aux "
          "pratiques professionnelles."),
        TBL(["Outil", "Usage"],
            [["Visual Studio Code", "Éditeur principal (extensions PHP, Laravel, React)"],
             ["Composer", "Gestionnaire de dépendances PHP"],
             ["npm / Vite", "Gestion des paquets et build du front-end React"],
             ["Git / GitHub", "Versionnement du code et historique"],
             ["MySQL · phpMyAdmin", "Base de données et administration"],
             ["Postman", "Tests et documentation des points d'API"],
             ["Docker · Docker Compose", "Conteneurisation et environnement de déploiement"],
             ["Ollama (Mistral)", "Serveur local de modèle de langage pour l'IA"]],
            caption="Environnement et outils de développement",
            widths=[0.30, 0.70]),

        H2("II", "Organisation du code source"),
        P("Le dépôt est organisé en deux applications distinctes — le back-end Laravel et le front-end "
          "React — favorisant le découplage. L'arborescence simplifiée est la suivante :"),
        CODE("Arborescence simplifiée du projet",
             "panda/\n"
             "├── backend-laravel/\n"
             "│   ├── app/\n"
             "│   │   ├── Http/Controllers/API/   (Auth, Jobs, Contracts, Payments, Chat, AI, Admin…)\n"
             "│   │   ├── Http/Middleware/         (auth, admin, throttle)\n"
             "│   │   ├── Models/                  (User, Contract, Milestone, Wallet, Transaction…)\n"
             "│   │   ├── Policies/                (ContractPolicy, MilestonePolicy…)\n"
             "│   │   ├── Services/                (LedgerService, StripeService, NotificationService…)\n"
             "│   │   └── Events/ · Listeners/     (MessageSent, broadcast temps réel)\n"
             "│   ├── database/migrations/         (≈ 30 migrations versionnées)\n"
             "│   └── routes/api.php               (déclaration des points d'API REST)\n"
             "└── frontend-react/\n"
             "    └── src/\n"
             "        ├── pages/                   (Landing, Auth, Dashboard, Jobs, Contracts, Payments…)\n"
             "        ├── components/              (layout, contracts, milestones, ui…)\n"
             "        └── store/ · api/            (état Zustand, client Axios)"),

        H3("1", "Cartographie des principaux points d'API"),
        P("L'API REST expose une centaine de points d'accès, organisés par domaine fonctionnel et "
          "préfixés par `/api`. Les tableaux suivants en présentent un extrait représentatif, illustrant "
          "la convention de nommage et la cohérence des verbes HTTP (GET pour lire, POST pour créer/agir, "
          "PUT pour modifier, DELETE pour supprimer)."),
        TBL(["Méthode", "Point d'accès", "Rôle"],
            [["POST", "/auth/register · /auth/login", "Inscription et connexion (limités en débit)"],
             ["GET", "/auth/me", "Profil de l'utilisateur authentifié"],
             ["GET / POST", "/jobs · /jobs/{job}/proposals", "Offres et propositions"],
             ["POST", "/proposals/{p}/accept · /reject", "Traitement d'une proposition"],
             ["GET", "/freelancers · /freelancers/{username}", "Annuaire et profil public"],
             ["GET / POST", "/catalog · /catalog/{slug}/orders/checkout", "Catalogue et commandes de services"]],
            caption="Extrait de l'API — authentification, offres et catalogue",
            widths=[0.16, 0.46, 0.38]),
        TBL(["Méthode", "Point d'accès", "Rôle"],
            [["GET", "/contracts · /contracts/{c}", "Liste et détail des contrats"],
             ["POST", "/contracts/{c}/milestones", "Création d'un jalon"],
             ["POST", "/milestones/{m}/submit · /approve", "Soumission et validation d'un jalon"],
             ["POST", "/contracts/{c}/dispute · /resolve-dispute", "Litige et arbitrage"],
             ["GET / POST", "/contracts/{c}/time/start · /stop", "Suivi du temps"],
             ["GET", "/contracts/{c}/pdf", "Génération du PDF du contrat"]],
            caption="Extrait de l'API — contrats et jalons",
            widths=[0.16, 0.46, 0.38]),
        TBL(["Méthode", "Point d'accès", "Rôle"],
            [["GET", "/payments/wallet · /overview", "Portefeuille et synthèse financière"],
             ["POST", "/payments/contracts/{c}/fund-escrow", "Financement du séquestre"],
             ["POST", "/payments/milestones/{m}/release", "Libération d'un jalon"],
             ["POST", "/payments/withdrawals", "Demande de retrait"],
             ["POST", "/payments/stripe/webhook", "Webhook Stripe (signé, idempotent)"],
             ["POST", "/ai/generate-proposal · /match-freelancers", "Services d'intelligence artificielle"],
             ["GET / POST", "/admin/* (dashboard, finance, kyc…)", "Back-office (réservé à l'administrateur)"]],
            caption="Extrait de l'API — paiements, IA et administration",
            widths=[0.16, 0.46, 0.38]),

        H3("2", "Conventions et bonnes pratiques"),
        P("Le code respecte un ensemble de conventions garantissant lisibilité et homogénéité : nommage "
          "explicite des classes et méthodes, contrôleurs « maigres » déléguant aux services, validation "
          "centralisée dans les FormRequests, réponses JSON normalisées, et respect des standards PSR de "
          "PHP. Côté React, les composants sont organisés par domaine, l'état global est centralisé "
          "(Zustand) et les appels réseau passent par un client Axios unique muni d'intercepteurs (ajout "
          "automatique du jeton, gestion des erreurs)."),

        H3("3", "Modèles, relations et migrations"),
        P("Les **modèles Eloquent** déclarent les relations entre entités de façon expressive, ce qui "
          "simplifie considérablement les requêtes. Le modèle `Contract`, par exemple, expose ses "
          "relations avec le client, le freelance, les jalons et les transactions."),
        CODE("app/Models/Contract.php — relations (extrait)",
             "class Contract extends Model\n"
             "{\n"
             "    public function client()     { return $this->belongsTo(User::class, 'client_id'); }\n"
             "    public function freelancer() { return $this->belongsTo(User::class, 'freelancer_id'); }\n"
             "    public function milestones() { return $this->hasMany(Milestone::class); }\n"
             "    public function transactions(){ return $this->hasMany(Transaction::class); }\n"
             "    public function conversation(){ return $this->hasOne(Conversation::class); }\n"
             "}"),
        P("Le schéma de la base est décrit par des **migrations** versionnées, garantissant qu'il puisse "
          "être recréé à l'identique sur n'importe quel environnement. La migration des tables financières "
          "illustre l'usage des types décimaux et des contraintes de clés étrangères."),
        CODE("database/migrations — table wallets (extrait)",
             "Schema::create('wallets', function (Blueprint $table) {\n"
             "    $table->id();\n"
             "    $table->foreignId('user_id')->constrained()->cascadeOnDelete();\n"
             "    $table->decimal('balance', 12, 2)->default(0);\n"
             "    $table->decimal('pending_balance', 12, 2)->default(0);\n"
             "    $table->decimal('escrow_balance', 12, 2)->default(0);\n"
             "    $table->string('currency')->default('USD');\n"
             "    $table->timestamps();\n"
             "});"),

        H2("III", "Le cœur financier : le service de grand livre (LedgerService)"),
        P("Le `LedgerService` constitue la **source unique de vérité** pour tout mouvement d'argent dans "
          "Panda. Aucun contrôleur n'écrit directement dans les tables `wallets` ou `transactions` : toute "
          "opération passe par ce service, qui garantit six propriétés fondamentales."),
        NL(["Toute opération s'exécute dans une **transaction SQL** (atomicité : tout ou rien) ;",
            "Chaque ligne de portefeuille est **verrouillée** (`SELECT … FOR UPDATE`) avant mutation, "
            "évitant les conditions de course ;",
            "Chaque écriture est en **double-entrée** : tout débit a un crédit correspondant ;",
            "Chaque transaction enregistre `balance_after` de façon **immuable** pour la réconciliation ;",
            "Les **clés d'idempotence** sont honorées : un appel dupliqué renvoie le résultat initial ;",
            "Un **invariant** est vérifié : la somme des mouvements d'un portefeuille doit égaler son solde."]),
        H3("1", "Financement du séquestre"),
        P("Lorsqu'un client finance le séquestre, les fonds quittent son solde disponible (`balance`) pour "
          "rejoindre son solde bloqué (`escrow_balance`) et le séquestre du contrat (`escrow_amount`). "
          "L'extrait suivant illustre la rigueur transactionnelle de l'opération."),
        CODE("app/Services/LedgerService.php — fundEscrow() (extrait)",
             "public function fundEscrow(User $client, Contract $contract, float $amount,\n"
             "                          ?string $idempotencyKey = null): Transaction\n"
             "{\n"
             "    return DB::transaction(function () use ($client, $contract, $amount, $idempotencyKey) {\n"
             "        if ($tx = $this->findByIdempotencyKey($idempotencyKey)) return $tx; // rejouable\n"
             "\n"
             "        $wallet = $this->lockWallet($client);            // SELECT … FOR UPDATE\n"
             "        if ((float) $wallet->balance < $amount)\n"
             "            throw new RuntimeException('Solde insuffisant pour le séquestre');\n"
             "\n"
             "        $wallet->balance        = bcsub($wallet->balance, $amount, 2);  // précision décimale\n"
             "        $wallet->escrow_balance = bcadd($wallet->escrow_balance, $amount, 2);\n"
             "        $wallet->save();\n"
             "        $contract->escrow_amount = bcadd($contract->escrow_amount, $amount, 2);\n"
             "        $contract->save();\n"
             "\n"
             "        return Transaction::create([ /* type=escrow, direction=out, balance_after, … */ ]);\n"
             "    });\n"
             "}"),
        P("Le recours à `bcadd`/`bcsub` (arithmétique de précision arbitraire) plutôt qu'aux flottants "
          "natifs est essentiel : il évite les erreurs d'arrondi qui seraient inacceptables sur des "
          "montants financiers."),
        H3("2", "Libération d'un jalon et répartition"),
        P("À l'approbation d'un jalon, le service draine le séquestre, prélève la commission de la "
          "plateforme et crédite le freelance du montant net — chaque mouvement donnant lieu à une "
          "écriture distincte et idempotente."),
        CODE("app/Services/LedgerService.php — releaseMilestone() (extrait simplifié)",
             "$amount     = (float) $milestone->amount;\n"
             "$feeRate    = (float) PlatformSetting::get('fee.freelancer_pct', 0.10);  // 10 %\n"
             "$commission = round($amount * $feeRate, 2);\n"
             "$payout     = round($amount - $commission, 2);\n"
             "\n"
             "// 1. Drainer le séquestre (client)        → transaction type=release\n"
             "// 2. Créditer la commission (plateforme)  → transaction type=fee\n"
             "// 3. Créditer le freelance (net)          → transaction type=credit\n"
             "// 4. Marquer le jalon comme payé\n"
             "$milestone->update(['status' => 'paid', 'approved_at' => now()]);"),
        NOTE("Des **garde-fous** protègent l'opération : un jalon doit être *soumis* avant d'être libéré, "
             "un contrat *en litige* bloque toute libération, et un séquestre insuffisant interrompt la "
             "transaction. Ces vérifications sont effectuées **sous verrou**, à l'abri des accès "
             "concurrents."),

        H2("IV", "Authentification et sécurité"),
        P("Les routes sensibles sont protégées dès leur déclaration. La limitation de débit, par exemple, "
          "est appliquée par middleware directement sur les groupes de routes d'authentification."),
        CODE("routes/api.php — limitation de débit sur l'authentification (extrait)",
             "Route::prefix('auth')->middleware('throttle:10,1')->group(function () {\n"
             "    Route::post('/register', [AuthController::class, 'register']);\n"
             "    Route::post('/login',    [AuthController::class, 'login']);\n"
             "});\n"
             "\n"
             "Route::middleware('auth:sanctum')->group(function () {\n"
             "    Route::get('/auth/me', [AuthController::class, 'me']);\n"
             "    // … toutes les routes protégées exigent un jeton Bearer valide\n"
             "});"),
        P("La connexion vérifie les identifiants, applique éventuellement la 2FA, puis émet un jeton "
          "personnel que le client conservera pour authentifier ses requêtes suivantes."),
        CODE("app/Http/Controllers/API/Auth/AuthController.php — login() (extrait)",
             "public function login(LoginRequest $request)\n"
             "{\n"
             "    $user = User::where('email', $request->email)->first();\n"
             "    if (! $user || ! Hash::check($request->password, $user->password)) {\n"
             "        return response()->json(['message' => 'Identifiants invalides'], 401);\n"
             "    }\n"
             "    $token = $user->createToken('spa')->plainTextToken;   // jeton Sanctum\n"
             "    return response()->json(['user' => $user, 'token' => $token]);\n"
             "}"),
        P("Les autorisations fines reposent sur des **politiques** Laravel. Ainsi, seules certaines "
          "actions — comme la résolution d'un litige — sont réservées à l'administrateur, et la libération "
          "d'un jalon est strictement réservée au client du contrat concerné. Cette vérification est "
          "dupliquée dans le service métier (défense en profondeur)."),
        CODE("app/Policies/ContractPolicy.php — autorisation (extrait)",
             "class ContractPolicy\n"
             "{\n"
             "    public function fund(User $user, Contract $contract): bool {\n"
             "        return $user->id === $contract->client_id;          // seul le client finance\n"
             "    }\n"
             "    public function resolveDispute(User $user, Contract $contract): bool {\n"
             "        return $user->role === 'admin';                     // arbitrage réservé à l'admin\n"
             "    }\n"
             "}"),
        P("La validation des entrées est centralisée dans des **FormRequests**, qui définissent les "
          "règles de validation et les messages d'erreur, en amont du contrôleur."),
        CODE("app/Http/Requests/StoreProposalRequest.php — validation (extrait)",
             "public function rules(): array {\n"
             "    return [\n"
             "        'cover_letter' => ['required', 'string', 'min:50', 'max:5000'],\n"
             "        'bid_amount'   => ['required', 'numeric', 'min:5'],\n"
             "    ];\n"
             "}"),

        H2("V", "Communication temps réel : la messagerie"),
        P("La messagerie instantanée s'appuie sur **Laravel Reverb**, un serveur WebSocket. Lorsqu'un "
          "message est envoyé, un **événement** de diffusion est émis ; le serveur le pousse vers les "
          "participants de la conversation, que le client React reçoit via **Laravel Echo** — sans "
          "rechargement ni interrogation périodique."),
        CODE("Diffusion d'un message en temps réel (principe)",
             "class MessageSent implements ShouldBroadcast\n"
             "{\n"
             "    public function __construct(public Message $message) {}\n"
             "\n"
             "    public function broadcastOn(): array {\n"
             "        return [new PrivateChannel('conversation.'.$this->message->conversation_id)];\n"
             "    }\n"
             "}\n"
             "// Côté React :  echo.private(`conversation.${id}`).listen('MessageSent', cb)"),
        P("La messagerie gère en outre les **accusés de réception** et de lecture, les **réactions**, "
          "l'**édition** et la **suppression** de messages, ainsi que les **pièces jointes** — autant de "
          "fonctionnalités attendues d'un outil de communication moderne."),
        P("Côté React, un *hook* s'abonne au canal privé de la conversation à l'affichage du composant et "
          "met à jour la liste des messages en temps réel, sans rechargement."),
        CODE("frontend-react — abonnement temps réel (extrait)",
             "useEffect(() => {\n"
             "  const channel = echo.private(`conversation.${id}`)\n"
             "    .listen('MessageSent', (e) => setMessages((m) => [...m, e.message]));\n"
             "  return () => echo.leave(`conversation.${id}`);   // nettoyage au démontage\n"
             "}, [id]);"),

        H2("VI", "Intégration des paiements Stripe"),
        P("Stripe gère l'encaissement réel des dépôts. La confirmation arrive par un **webhook**, point "
          "d'entrée public mais sécurisé : sa signature est vérifiée, et son idempotence est garantie par "
          "la table `stripe_webhook_events`, qui empêche le double traitement d'un même événement."),
        CODE("Traitement idempotent d'un webhook Stripe (principe)",
             "// 1. Vérifier la signature de l'événement (secret du webhook)\n"
             "$event = Webhook::constructEvent($payload, $sigHeader, $secret);\n"
             "\n"
             "// 2. Idempotence : ignorer un événement déjà traité\n"
             "if (StripeWebhookEvent::where('event_id', $event->id)->exists()) {\n"
             "    return response('déjà traité', 200);\n"
             "}\n"
             "StripeWebhookEvent::create(['event_id' => $event->id, 'type' => $event->type]);\n"
             "\n"
             "// 3. Créditer le portefeuille via le LedgerService (jamais en direct)\n"
             "$ledger->deposit($user, $amount, idempotencyKey: $event->id);"),
        P("Les versements (retraits) suivent un parcours symétrique : le freelance configure son compte "
          "**Stripe Connect**, l'administrateur approuve la demande, puis un transfert est déclenché ; le "
          "webhook de confirmation fait basculer le retrait à l'état *complété*. En cas d'échec du "
          "transfert, les fonds sont automatiquement re-crédités au solde disponible."),

        H2("VII", "Intelligence artificielle"),
        P("Panda intègre un assistant fondé sur un **modèle de langage** (Mistral, servi par Ollama). "
          "Cinq services sont exposés : génération de proposition, mise en correspondance "
          "freelances/offre, analyse de profil, recherche intelligente et assistant conversationnel. "
          "Chaque appel est limité en débit (protection des coûts) et historisé dans `ai_histories`."),
        CODE("app/Http/Controllers/API/AI/AIController.php — génération (principe)",
             "public function generateProposal(Request $r)\n"
             "{\n"
             "    $prompt = $this->buildPrompt($r->job, $r->user->freelancerProfile);\n"
             "    $text   = $this->ai->complete($prompt);          // appel au modèle (Ollama/Mistral)\n"
             "    AiHistory::create([\n"
             "        'user_id' => $r->user->id, 'type' => 'proposal',\n"
             "        'input' => $prompt, 'output' => $text, 'tokens_used' => $tokens,\n"
             "    ]);\n"
             "    return response()->json(['proposal' => $text]);\n"
             "}"),
        P("Les cinq services d'IA exposés par la plateforme sont récapitulés ci-dessous."),
        TBL(["Service", "Description"],
            [["Génération de proposition", "Rédige une première version de candidature à partir de l'offre et du profil"],
             ["Mise en correspondance", "Classe les freelances les plus pertinents pour une offre donnée"],
             ["Analyse de profil", "Évalue un profil et suggère des améliorations"],
             ["Recherche intelligente", "Interprète une requête en langage naturel"],
             ["Assistant conversationnel", "Répond aux questions et guide l'utilisateur"]],
            caption="Services d'intelligence artificielle de la plateforme",
            widths=[0.34, 0.66]),

        H2("VIII", "Présentation des interfaces utilisateur — 57 pages"),
        P("Cette section présente en détail l'ensemble des cinquante-sept pages qui composent l'application "
          "Panda. Organisées en dix groupes fonctionnels, elles couvrent l'authentification, les pages "
          "publiques, les tableaux de bord, les offres, les contrats, les paiements, les profils, la "
          "gestion des talents, les paramètres de sécurité et les outils transversaux. L'interface est "
          "construite avec React 19 et TailwindCSS 3, respecte une charte graphique unifiée et s'adapte "
          "à tous les formats d'écran."),

        H3("1", "Module d'authentification — 6 pages"),
        P("Le module d'authentification gère l'intégralité du cycle d'identité de l'utilisateur : "
          "connexion, inscription, récupération de mot de passe, intégration OAuth Google et parcours "
          "d'intégration (onboarding). La sécurité est renforcée par la 2FA côté interface et Laravel "
          "Sanctum côté API."),
        TBL(["Page", "Route", "Description fonctionnelle"],
            [["Login.jsx", "/login",
              "Formulaire de connexion e-mail/mot de passe + bouton OAuth Google. Validation en temps réel, "
              "messages d'erreur contextuels, lien vers récupération."],
             ["Register.jsx", "/register",
              "Formulaire d'inscription avec choix du rôle (Client ou Freelance). Validation des champs, "
              "confirmation du mot de passe, acceptation des CGU."],
             ["Onboarding.jsx", "/onboarding",
              "Parcours de bienvenue multi-étapes post-inscription : photo, titre, compétences (freelance) "
              "ou besoins (client), confirmation."],
             ["ForgotPassword.jsx", "/forgot-password",
              "Formulaire de saisie de l'e-mail pour déclencher l'envoi du lien de réinitialisation. "
              "Confirmation par message de succès."],
             ["ResetPassword.jsx", "/reset-password",
              "Formulaire du nouveau mot de passe après clic sur le lien reçu par e-mail "
              "(token + e-mail en paramètres URL)."],
             ["GoogleCallback.jsx", "/auth/google/callback",
              "Page de traitement silencieux du retour OAuth Google : stockage du token Sanctum, "
              "redirection automatique vers le tableau de bord."]],
            caption="Pages du module d'authentification",
            widths=[0.22, 0.25, 0.53]),
        FIG("ui_login", "Écran de connexion — e-mail/mot de passe et bouton OAuth Google"),
        P("L'écran de connexion (Login.jsx) propose deux méthodes d'authentification : la connexion "
          "classique par e-mail et mot de passe avec validation en temps réel, et la connexion sociale "
          "via Google OAuth en un seul clic. Les messages d'erreur sont précis (identifiants invalides, "
          "compte désactivé) et la navigation vers l'inscription ou la récupération du mot de passe "
          "est immédiatement accessible depuis le même écran."),
        FIG("ui_register", "Écran d'inscription — choix du rôle et saisie des informations"),
        P("L'écran d'inscription (Register.jsx) distingue dès la première interaction les deux rôles "
          "disponibles : Client (qui publie des offres et recrute) et Freelance (qui soumet des "
          "propositions et livre des missions). Ce choix conditionne ensuite l'onboarding et les "
          "fonctionnalités accessibles dans l'application. Le parcours Onboarding.jsx guide "
          "l'utilisateur à travers trois étapes : complétion du profil, sélection des compétences "
          "ou catégories de besoins, et confirmation. Ce tunnel réduit le taux d'abandon et améliore "
          "la qualité des profils dès le premier jour."),
        P("**Login.jsx** — Le formulaire est centré sur fond blanc avec deux champs (email, mot de "
          "passe), un bouton principal 'Se connecter' et un séparateur visuel suivi du bouton OAuth "
          "Google. La validation s'effectue en temps réel : le champ vire au rouge si le format "
          "email est invalide. En cas d'erreur (code 401), un toast rouge affiche 'Identifiants "
          "invalides' sans préciser quel champ est incorrect (protection contre l'énumération). "
          "Le hook useAuth() redirige automatiquement vers /dashboard si l'utilisateur est déjà "
          "connecté. Les appels API : POST /api/auth/login (email + password) → token Sanctum."),
        P("**Register.jsx** — Étape 1 : choix du rôle (Client ou Freelance) sous forme de deux "
          "grandes cartes cliquables avec icône et description du rôle. Étape 2 : prénom, nom, "
          "email, mot de passe (jauge de force en temps réel : rouge/orange/vert), confirmation "
          "et case CGU obligatoire. Après succès, l'utilisateur reçoit un email de bienvenue et "
          "est redirigé vers Onboarding.jsx. API : POST /api/auth/register."),
        P("**Onboarding.jsx** — Barre de progression en trois étapes en haut de page. Étape 1 : "
          "photo de profil (drag & drop ou clic), titre professionnel, localisation. "
          "Étape 2 Freelance : sélection de 3 à 10 compétences depuis 150+ tags, tarif horaire "
          "souhaité. Étape 2 Client : sélection des catégories de besoins. Étape 3 : récapitulatif "
          "et confirmation. L'onboarding peut être ignoré et complété depuis les paramètres. "
          "API : PUT /api/user/profile."),
        P("**ForgotPassword.jsx** — Page épurée avec un seul champ email et un bouton 'Envoyer "
          "le lien de réinitialisation'. Après soumission, un message de succès s'affiche même si "
          "l'email n'existe pas (par sécurité, pour éviter l'énumération). Le lien est valide "
          "60 minutes. API : POST /api/auth/forgot-password."),
        P("**ResetPassword.jsx** — Formulaire avec 'Nouveau mot de passe' et 'Confirmer'. Le token "
          "et l'email sont lus automatiquement depuis les paramètres URL. Si le token est expiré, "
          "un message d'erreur invite à refaire la demande. Après succès, redirection vers Login.jsx "
          "avec toast de confirmation. API : POST /api/auth/reset-password."),
        P("**GoogleCallback.jsx** — Page de traitement silencieuse : elle lit le code OAuth renvoyé "
          "par Google, appelle l'API Laravel (GET /api/auth/google/callback?code=...) qui échange "
          "le code contre un token Sanctum, stocke ce token dans le localStorage et redirige "
          "vers /dashboard. En cas d'erreur OAuth, l'utilisateur est renvoyé vers Login.jsx "
          "avec un toast d'erreur explicatif."),

        H3("2", "Pages publiques et marketing — 15 pages"),
        P("Les pages publiques constituent la vitrine commerciale de Panda. Accessibles sans connexion, "
          "elles ont pour objectif de convaincre visiteurs et entreprises de rejoindre la plateforme. "
          "Elles utilisent des animations Framer Motion, des témoignages réels et des indicateurs de "
          "confiance pour maximiser la conversion."),
        TBL(["Page", "Route", "Objectif principal"],
            [["Landing.jsx", "/",
              "Page d'accueil : proposition de valeur, recherche rapide, catégories, "
              "indicateurs de confiance, témoignages et appels à l'action."],
             ["Pricing.jsx", "/pricing",
              "Grille tarifaire : plans Gratuit, Pro, Entreprise — comparatif des fonctionnalités "
              "et bouton de souscription. Bascule mensuel/annuel."],
             ["Agencies.jsx", "/agencies",
              "Offres pour les agences : gestion multi-utilisateurs, reporting avancé, "
              "support dédié, formulaire de contact commercial."],
             ["Enterprise.jsx", "/enterprise",
              "Page grands comptes : SLA personnalisé, intégrations SSO, pilote gratuit "
              "et formulaire de contact dédié."],
             ["FindTalent.jsx", "/find-talent",
              "Présentation du service de mise en relation : comment fonctionne la recherche "
              "de freelances, garanties qualité et sécurité."],
             ["GetOutcomes.jsx", "/get-outcomes",
              "Page bénéfices clients : retour sur investissement, études de cas, "
              "promesses de délais et résultats chiffrés."],
             ["BuildWebsite.jsx", "/build-website",
              "Verticale spécialisée développement web : sous-page FindTalent orientée "
              "création et refonte de sites."],
             ["ScalePaidAds.jsx", "/scale-paid-ads",
              "Verticale marketing digital : sous-page orientée gestion de campagnes "
              "publicitaires et SEA."],
             ["HandleSupport.jsx", "/handle-support",
              "Verticale support client : sous-page orientée assistance en ligne "
              "et service après-vente externalisé."],
             ["Blog.jsx", "/blog",
              "Liste des articles : conseils freelance, tendances du marché, "
              "tutoriels Panda. Filtres par thème."],
             ["HowItWorks.jsx", "/how-it-works",
              "Explication pas-à-pas du fonctionnement : trois étapes pour les clients "
              "et trois étapes pour les freelances."],
             ["Reviews.jsx", "/reviews",
              "Témoignages vérifiés : grille de cartes avec note, photo et verbatim "
              "d'utilisateurs réels."],
             ["SuccessStories.jsx", "/success-stories",
              "Études de cas : missions réussies, résultats chiffrés, "
              "profils des entreprises bénéficiaires."],
             ["Updates.jsx", "/updates",
              "Changelog public : nouvelles fonctionnalités, corrections "
              "et améliorations récentes de la plateforme."],
             ["Research.jsx", "/research",
              "Ressources sectorielles publiées par Panda : rapports PDF, "
              "infographies et données de marché."]],
            caption="Pages publiques et marketing de la plateforme Panda",
            widths=[0.22, 0.25, 0.53]),
        FIG("ui_landing", "Page d'accueil de la plateforme Panda"),
        P("La page d'accueil (Landing.jsx) est la première interface que le visiteur découvre. Elle est "
          "structurée en sections verticales successives : hero avec barre de recherche, compteurs de "
          "confiance animés (nombre de freelances, missions livrées, taux de satisfaction), catégories "
          "de compétences les plus demandées, témoignages clients, comparatif tarifaire et pied de "
          "page complet. La barre de recherche principale bascule entre deux modes : 'Trouver un "
          "talent' (vers FreelancerMarketplace) et 'Trouver une mission' (vers JobsMarketplace), "
          "positionnant immédiatement l'utilisateur dans son parcours."),
        P("La page Pricing.jsx adopte la structure classique des plateformes SaaS : trois colonnes "
          "(Gratuit, Pro, Entreprise) avec un tableau de comparaison des fonctionnalités et une bascule "
          "mensuel/annuel affichant l'économie réalisée. Les pages Agencies.jsx et Enterprise.jsx "
          "ciblent respectivement les agences multi-utilisateurs et les grands comptes, avec des "
          "formulaires de contact commercial dédiés. Les trois verticales métier (BuildWebsite, "
          "ScalePaidAds, HandleSupport) déclinent la page FindTalent pour des segments spécifiques, "
          "améliorant ainsi le référencement naturel par mots-clés ciblés."),
        P("**Landing.jsx** — La hero section affiche un titre accrocheur, une sous-description de "
          "valeur et une barre de recherche à double mode (talents / missions). Quatre compteurs "
          "animés (useEffect + requestAnimationFrame) s'incrémentent à l'arrivée sur la page : "
          "12 000+ freelances, 8 500+ missions livrées, 98% de satisfaction, paiements sécurisés. "
          "Une section Catégories affiche 12 domaines de compétences (Développement, Design, "
          "Marketing, Rédaction...) avec icônes et compteur d'offres actives. La section "
          "Témoignages affiche 6 cartes avec photo, nom, entreprise et verbatim. Le pied de page "
          "propose des liens vers toutes les ressources de la plateforme."),
        P("**Pricing.jsx** — Trois colonnes (Gratuit 0€/mois, Pro 29€/mois, Entreprise sur devis) "
          "avec indicateur 'Recommandé' sur le plan Pro. Un toggle mensuel/annuel affiche -20% sur "
          "les plans annuels. Chaque colonne liste les fonctionnalités incluses avec icône checkmark "
          "vert (inclus) ou croix grise (non inclus). Un tableau de comparaison détaillé en bas "
          "de page compare 25 fonctionnalités. FAQ en accordéon clôt la page."),
        P("**Agencies.jsx** — Page dédiée aux agences numériques et studios de freelances. Elle "
          "présente les avantages multi-utilisateurs : jusqu'à 10 comptes connectés, tableaux de "
          "bord partagés, reporting centralisé et support prioritaire. Un formulaire de contact "
          "commercial collect le nom, l'email professionnel, la taille de l'équipe et les besoins "
          "spécifiques. Les logos des agences partenaires défilent en animation CSS."),
        P("**Enterprise.jsx** — Landing page orientée grands comptes : SLA 99,9% garanti, "
          "intégration SSO (SAML/OAuth), API privée dédiée, manager de compte attitré et "
          "pilote gratuit de 30 jours. Le formulaire Enterprise envoie une demande à l'équipe "
          "commerciale via l'API POST /api/enterprise/contact."),
        P("**HowItWorks.jsx** — Présentation en deux colonnes : côté Client (3 étapes numérotées "
          "avec icône : Publier > Choisir > Payer) et côté Freelance (3 étapes : Postuler > "
          "Livrer > Être payé). Des animations au scroll (Framer Motion) font apparaître "
          "progressivement les étapes. Une FAQ de 8 questions répond aux objections courantes."),
        P("**Reviews.jsx** — Grille de 12 témoignages vérifiés avec note en étoiles (4 à 5 sur 5), "
          "photo de profil, prénom, titre et verbatim de 2 à 4 lignes. Un filtre par type "
          "(Client / Freelance) et un filtre par note permettent d'affiner l'affichage. "
          "Une note globale de 4.9/5 est mise en avant en haut de page avec le nombre total "
          "d'avis."),
        P("**SuccessStories.jsx** — Trois études de cas détaillées avec : nom de l'entreprise, "
          "secteur, défi initial, solution Panda, résultats chiffrés (ex. : +40% de productivité, "
          "-30% de coûts RH) et citation du responsable. Chaque case study s'ouvre en pleine "
          "page avec une mise en page magazine. Un CTA 'Créer votre compte' clôt chaque story."),
        P("**Blog.jsx** — Liste paginée d'articles avec vignette, titre, extrait, auteur, date et "
          "catégorie (badge coloré). Filtres par catégorie (Conseils, Tendances, Tutoriels, "
          "Actualités Panda) et barre de recherche plein-texte. Chaque article s'ouvre en "
          "page dédiée avec rendu Markdown, table des matières flottante et articles connexes."),
        P("**Updates.jsx** — Changelog public chronologique : chaque release est une section "
          "avec version (ex. v1.0.0), date, liste des nouveautés (feat), corrections (fix) "
          "et améliorations (improve) avec icônes colorées. Les entrées récentes sont "
          "affichées en haut avec un badge 'Nouveau'."),
        P("**Research.jsx** — Bibliothèque de ressources : rapports PDF téléchargeables "
          "(marché du freelance, tendances tech, baromètre salarial), infographies partageables "
          "et données statistiques sectorielles. Chaque ressource affiche le format, la taille "
          "et la date de publication. Le téléchargement requiert une inscription."),
        P("**FindTalent.jsx, GetOutcomes.jsx, BuildWebsite.jsx, ScalePaidAds.jsx, "
          "HandleSupport.jsx** — Ces cinq pages partagent une structure commune : hero orienté "
          "bénéfices (titre + sous-titre + CTA), liste de 4 à 6 avantages avec icône et "
          "description, capture d'écran animée de l'interface, témoignage client lié au "
          "segment, et section FAQ de 5 questions. Leur contenu est adapté au segment "
          "cible (développeurs web, marketeurs, équipes support). Chaque page est optimisée "
          "pour le référencement avec des balises meta distinctes et du contenu unique."),

        H3("3", "Tableaux de bord — 3 pages"),
        P("Chaque rôle dispose d'un tableau de bord personnalisé qui centralise les indicateurs clés "
          "et les actions courantes. Ces tableaux de bord sont construits avec la bibliothèque Recharts "
          "pour les graphiques et se rafraîchissent périodiquement via React Query pour afficher "
          "des données proches du temps réel."),
        TBL(["Page", "Route", "Indicateurs principaux"],
            [["ClientDashboard.jsx", "/client/dashboard",
              "Solde disponible, fonds en séquestre, offres publiées, propositions reçues, "
              "contrats actifs, graphique mensuel des dépenses."],
             ["FreelancerDashboard.jsx", "/freelancer/dashboard",
              "Gains totaux, propositions envoyées, contrats actifs, note moyenne, "
              "missions livrées, graphique de revenus mensuel."],
             ["AdminDashboard.jsx", "/admin/dashboard",
              "Utilisateurs, transactions du jour, retraits en attente, files de modération "
              "et KYC, revenus et commissions de la plateforme."]],
            caption="Tableaux de bord par rôle utilisateur",
            widths=[0.27, 0.28, 0.45]),
        FIG("ui_client", "Tableau de bord du client — solde, offres actives et contrats"),
        P("Le tableau de bord client (ClientDashboard.jsx) affiche en haut de page quatre widgets "
          "colorés : le solde du portefeuille disponible, les fonds en séquestre (bloqués pour des "
          "jalons en cours), le nombre d'offres publiées actives et les propositions en attente "
          "d'examen. Un graphique en barres illustre l'évolution mensuelle des dépenses sur les "
          "douze derniers mois, accompagné d'un tableau des contrats récents avec leur statut."),
        FIG("ui_freelancer", "Tableau de bord du freelance — gains, propositions et missions"),
        P("Le tableau de bord freelance (FreelancerDashboard.jsx) met en avant les revenus avec "
          "un graphique temporel et des indicateurs de performance : taux d'acceptation des "
          "propositions, note moyenne sur cinq étoiles, nombre de missions terminées. Des alertes "
          "rapides signalent les jalons en attente de soumission et les messages non lus."),
        FIG("ui_admin", "Tableau de bord administrateur — indicateurs de la plateforme"),
        P("Le tableau de bord administrateur (AdminDashboard.jsx) offre une vue opérationnelle "
          "complète : taux de croissance des inscrits, volume de transactions du jour, retraits "
          "en attente d'approbation, files de modération des offres et de vérification KYC. "
          "Deux graphiques superposés comparent revenus et commissions de la plateforme sur "
          "une période glissante configurable."),

        H3("4", "Place de marché des offres — 8 pages"),
        P("Le module Jobs représente le cœur de l'activité marketplace. Les clients publient "
          "des offres structurées ; les freelances les parcourent, les filtrent et y répondent "
          "avec des propositions personnalisées. L'IA peut assister la rédaction de la "
          "proposition en analysant le profil du freelance et le cahier des charges de l'offre."),
        TBL(["Page", "Route", "Description"],
            [["JobsMarketplace.jsx", "/jobs",
              "Liste paginée des offres avec filtres multi-critères (catégorie, budget min/max, "
              "type, durée, compétences). Cartes synthétiques avec statut."],
             ["JobDetail.jsx", "/jobs/:id",
              "Détail complet d'une offre : description, budget, compétences, freelances "
              "suggérés par l'IA, formulaire de proposition."],
             ["PostJob.jsx", "/post-job",
              "Formulaire multi-étapes de publication : titre, catégorie, budget, "
              "compétences requises, description, pièces jointes."],
             ["CategoryJobs.jsx", "/jobs/category/:slug",
              "Sous-liste filtrée par catégorie avec compteur d'offres actives "
              "et description de la catégorie."],
             ["SavedJobs.jsx", "/saved-jobs",
              "Liste personnelle des offres enregistrées en favori par le freelance, "
              "avec bouton de candidature rapide."],
             ["JobProposals.jsx", "/jobs/:id/proposals",
              "Vue réservée au client : toutes les propositions reçues pour une offre, "
              "comparaison et sélection du freelance retenu."],
             ["MyJobs.jsx", "/my-jobs",
              "Vue du client : toutes ses offres publiées avec statut (active, en cours, "
              "clôturée) et actions rapides (éditer, clôturer)."],
             ["MyProposals.jsx", "/my-proposals",
              "Vue du freelance : toutes ses propositions avec état (en attente, acceptée, "
              "rejetée) et accès au détail de chacune."]],
            caption="Pages du module Offres et propositions",
            widths=[0.24, 0.26, 0.50]),
        FIG("ui_jobs", "Place de marché des offres — filtres, recherche et cartes d'offres"),
        P("La page JobsMarketplace.jsx est la vitrine des missions disponibles. Les offres sont "
          "présentées sous forme de cartes avec les informations essentielles : titre, client, "
          "catégorie, budget (fixe ou horaire), date de publication et nombre de propositions. "
          "Un panneau de filtres permet d'affiner la recherche par catégorie, fourchette de budget, "
          "durée estimée, compétences requises et type de contrat."),
        P("La page JobDetail.jsx affiche le cahier des charges complet de la mission : description "
          "riche, compétences sous forme de badges, budget et délai souhaités. Elle propose une "
          "liste de freelances recommandés par l'IA (calcul de correspondance profil/offre). "
          "Le bouton 'Soumettre une proposition' ouvre un formulaire où le freelance peut rédiger "
          "sa lettre de motivation et proposer son tarif. Le bouton 'Rédiger avec l'IA' génère "
          "automatiquement une proposition personnalisée à partir du profil et de l'offre."),
        P("PostJob.jsx guide le client à travers un tunnel en quatre étapes validées : "
          "informations générales (titre, catégorie, type), description et compétences requises, "
          "budget et délai, puis pièces jointes optionnelles avant publication. Ce formulaire "
          "progressif réduit les erreurs et améliore la qualité des offres publiées."),
        P("**JobsMarketplace.jsx** — Disposition en deux colonnes : panneau de filtres à gauche "
          "(catégorie, budget min/max, durée, type de contrat, compétences requises, date de "
          "publication) et liste de cartes à droite paginées par 12. Chaque carte affiche le "
          "titre, l'avatar du client (anonymisé), la catégorie avec badge coloré, le budget, "
          "la date et un indicateur '3 propositions'. Un bouton 'Enregistrer' (étoile) ajoute "
          "l'offre aux favoris (SavedJobs) sans quitter la page. API : GET /api/jobs."),
        P("**JobDetail.jsx** — En haut : titre, client (avatar + prénom), budget, délai et "
          "catégorie. Corps : description riche en Markdown, liste de compétences requises "
          "sous forme de badges. Sidebar droite : bouton 'Soumettre une proposition' (formulaire "
          "en modale avec lettre de motivation, tarif proposé, délai estimé), bouton 'Rédiger "
          "avec l'IA' (appel POST /api/ai/generate-proposal), section 'Freelances suggérés par "
          "l'IA' (3 profils avec score de correspondance). API : GET /api/jobs/:id."),
        P("**PostJob.jsx** — Tunnel en 4 étapes avec indicateur de progression. Étape 1 : titre "
          "(min. 10 chars), catégorie (select), type (Fixe/Horaire). Étape 2 : description "
          "(éditeur Markdown, min. 100 chars), compétences requises (multi-select avec recherche). "
          "Étape 3 : budget (min. 10€), délai souhaité (calendrier), questions pour les candidats "
          "(optionnel). Étape 4 : prévisualisation et publication. API : POST /api/jobs."),
        P("**CategoryJobs.jsx** — Identique à JobsMarketplace mais pré-filtré sur la catégorie "
          "du slug URL. En-tête avec nom de la catégorie, icône, description et compteur d'offres "
          "actives. Les filtres restants sont disponibles mais la catégorie est verrouillée. "
          "Breadcrumb : Accueil > Offres > Développement Web. API : GET /api/jobs?category=slug."),
        P("**SavedJobs.jsx** — Liste personnelle des offres mises en favori. Chaque entrée "
          "reprend la carte d'offre complète + bouton 'Retirer des favoris' et bouton 'Postuler'. "
          "Si l'offre a été clôturée depuis l'enregistrement, un badge 'Expirée' s'affiche "
          "en gris. API : GET /api/saved-jobs, DELETE /api/saved-jobs/:id."),
        P("**JobProposals.jsx** — Réservée au client propriétaire de l'offre. Liste de toutes "
          "les propositions reçues sous forme de cartes : avatar + nom du freelance, note "
          "moyenne, tarif proposé, délai proposé et extrait de la lettre de motivation. "
          "Boutons 'Accepter' (crée le contrat) et 'Refuser' avec motif optionnel. "
          "Filtre par statut (toutes, non lues, présélectionnées). API : GET /api/jobs/:id/proposals."),
        P("**MyJobs.jsx** — Vue client uniquement. Onglets : Actives, En cours, Clôturées. "
          "Chaque carte d'offre affiche le nombre de propositions reçues, le statut actuel "
          "et les actions disponibles : Éditer, Clôturer, Voir les propositions, Dupliquer. "
          "Un indicateur rouge signale les nouvelles propositions non lues. "
          "API : GET /api/my-jobs."),
        P("**MyProposals.jsx** — Vue freelance uniquement. Liste de toutes les propositions "
          "soumises avec leur statut coloré : En attente (jaune), Acceptée (vert), Refusée "
          "(rouge), Contrat créé (bleu). Chaque ligne affiche le titre de l'offre, le tarif "
          "proposé, la date de soumission et un lien vers le contrat si acceptée. "
          "API : GET /api/my-proposals."),

        H3("5", "Contrats et jalons — 3 pages"),
        P("Le module de gestion des contrats structure la collaboration client/freelance après "
          "l'acceptation d'une proposition. Chaque contrat est découpé en jalons (milestones) "
          "dont les fonds sont séquestrés à l'avance. Ce mécanisme garantit la sécurité des "
          "paiements et clarifie les attentes mutuelles."),
        TBL(["Page", "Route", "Fonctionnalités clés"],
            [["ContractsList.jsx", "/contracts",
              "Liste consolidée des contrats (actifs, en attente, terminés, annulés) "
              "avec filtres et résumé financier du montant en séquestre."],
             ["ContractDetails.jsx", "/contracts/:id",
              "Vue complète en onglets : jalons, fichiers versionnés, suivi du temps, "
              "extensions de délai, journal d'activité, messagerie et export PDF."],
             ["MilestoneDetails.jsx", "/contracts/:id/milestones/:mid",
              "Détail d'un jalon individuel : description, montant séquestré, statut, "
              "soumission des livrables par le freelance, validation/rejet par le client."]],
            caption="Pages du module Contrats et jalons",
            widths=[0.25, 0.28, 0.47]),
        FIG("ui_contract", "Détail d'un contrat — onglets jalons, fichiers et suivi du temps"),
        P("La page ContractDetails.jsx est la plus riche de la plateforme. Elle s'organise "
          "en six onglets distincts :"),
        B(["**Jalons** : liste chronologique avec statut (créé, en cours, soumis, validé, "
           "rejeté). Le freelance soumet ses livrables ; le client valide ou rejette avec commentaire ;",
           "**Fichiers** : espace de dépôt et téléchargement des livrables versionnés. "
           "Chaque fichier est horodaté et associé à un jalon spécifique ;",
           "**Temps** : chronomètre intégré pour les contrats horaires et récapitulatif "
           "hebdomadaire des heures déclarées et approuvées ;",
           "**Extensions** : formulaire de demande de prolongation de délai avec motivation, "
           "et réponse (accepter/refuser) du client ;",
           "**Activité** : journal immuable et chronologique de tous les événements du contrat "
           "(proposition acceptée, jalon validé, paiement libéré...) ;",
           "**Analyse** : statistiques du contrat (avancement, budget consommé, heures) "
           "et assistant IA contextuel pour résoudre d'éventuels litiges."]),
        P("ContractsList.jsx offre une vue consolidée de tous les contrats. Des onglets séparent "
          "les contrats actifs, en attente, terminés et annulés. Un résumé financier en haut "
          "indique le montant total en séquestre et les paiements en attente de validation."),
        P("**ContractsList.jsx** — En-tête avec trois badges de synthèse financière : total en "
          "séquestre, paiements libérés du mois, retraits en attente. Tableau avec colonnes : "
          "Contrat (ID + titre de l'offre), Partenaire (client ou freelance selon le rôle), "
          "Montant total, Séquestre actuel, Statut, Date de création, Actions. Filtres par "
          "statut et période. Export CSV disponible. API : GET /api/contracts."),
        P("**ContractDetails.jsx** — Navigation en six onglets avec badge de comptage sur "
          "chaque onglet (ex : 'Jalons (3)', 'Fichiers (7)'). Onglet Jalons : timeline "
          "verticale avec chaque jalon, son montant, son statut (chip coloré), la date cible "
          "et les actions disponibles (soumettre/valider/rejeter). Onglet Fichiers : liste de "
          "fichiers avec icône type, nom, taille, date et bouton de téléchargement. Onglet "
          "Temps : tableau semainier des heures avec totaux et bouton chrono. Onglet "
          "Extensions : historique des demandes avec statut. Onglet Activité : feed "
          "chronologique avec avatar, action et date. Un bouton 'Exporter PDF' en haut à droite "
          "génère le PDF du contrat via GET /api/contracts/:id/pdf."),
        P("**MilestoneDetails.jsx** — Page dédiée à un jalon unique. En haut : titre du jalon, "
          "montant, date cible, statut. Ci-dessous, côté Freelance : liste de fichiers de "
          "livraison avec zone de dépôt (drag & drop), champ 'Note de livraison' en Markdown "
          "et bouton 'Soumettre le jalon'. Côté Client : affichage des fichiers soumis, "
          "champ 'Commentaire' et deux boutons : 'Valider' (libère le paiement du jalon via "
          "LedgerService) et 'Rejeter avec motif' (renvoie en correction). API : "
          "POST /api/milestones/:id/submit, POST /api/milestones/:id/approve."),

        H3("6", "Paiements et finances — 6 pages"),
        P("Le module financier de Panda s'appuie sur Stripe pour les paiements (Checkout), les "
          "virements (Connect) et la gestion des abonnements. Un portefeuille interne trace chaque "
          "mouvement côté utilisateur ; une interface dédiée pilote les retraits côté administration."),
        TBL(["Page", "Route", "Description"],
            [["Payments.jsx", "/payments",
              "Portefeuille : trois soldes (disponible, séquestre, en attente), dépôt Stripe, "
              "historique des transactions filtrable, demande de retrait."],
             ["Withdraw.jsx", "/payments/withdraw",
              "Formulaire de retrait : montant, compte Stripe Connect de destination, "
              "confirmation et suivi de l'état (en attente, approuvé, rejeté)."],
             ["PaymentSuccess.jsx", "/payment/success",
              "Page de confirmation après un dépôt Stripe réussi : montant crédité, "
              "nouveau solde, bouton retour au portefeuille."],
             ["PaymentCancel.jsx", "/payment/cancel",
              "Page d'annulation si l'utilisateur abandonne le tunnel Stripe Checkout "
              "avant de valider le paiement."],
             ["StripeConnectReturn.jsx", "/stripe/connect/return",
              "Page de retour après l'onboarding Stripe Connect : confirmation de la "
              "configuration du compte pour recevoir des virements."],
             ["AdminFinance.jsx", "/admin/finance",
              "Interface admin : vue globale des transactions, approbation/rejet "
              "des retraits en attente, export CSV de l'historique."]],
            caption="Pages du module Paiements et finances",
            widths=[0.24, 0.26, 0.50]),
        FIG("ui_payments", "Portefeuille utilisateur — soldes, transactions et retraits"),
        P("La page Payments.jsx présente le portefeuille avec trois soldes distincts : le solde "
          "disponible (fonds libres), le solde en séquestre (fonds bloqués pour des jalons actifs) "
          "et le solde en attente (fonds libérés en cours de transfert). Un tableau de l'historique "
          "des transactions est filtrable par type (dépôt, jalon, retrait, commission), période et "
          "montant. Le bouton 'Déposer des fonds' redirige vers Stripe Checkout ; après paiement, "
          "Stripe renvoie l'utilisateur sur PaymentSuccess.jsx qui confirme l'opération."),
        P("Le formulaire Withdraw.jsx vérifie d'abord que l'utilisateur a configuré son compte "
          "Stripe Connect (onboarding guidé via StripeConnectReturn.jsx) avant de permettre tout "
          "retrait. Un délai de traitement de 1 à 3 jours ouvrables est affiché clairement. "
          "La page AdminFinance.jsx est réservée à l'administrateur : tableau de bord financier "
          "global, approbation ou rejet de chaque demande de retrait, et export CSV complet."),
        P("**Payments.jsx** — En-tête avec trois widgets : Solde disponible (bleu, cliquable "
          "pour déposer), Séquestre (orange, avec info-bulle explicative), En attente (gris). "
          "Deux boutons principaux : 'Déposer des fonds' (redirige vers Stripe Checkout) et "
          "'Demander un retrait' (ouvre Withdraw.jsx). Tableau des transactions paginé avec "
          "colonnes : Date, Type (badge coloré), Description, Montant, Solde après. "
          "Filtres : type, période (7j / 30j / 3mois / personnalisé). API : GET /api/payments/wallet."),
        P("**Withdraw.jsx** — Formulaire en deux étapes. Étape 1 : vérification Stripe Connect "
          "— si non configuré, bouton 'Configurer mon compte Stripe' qui redirige vers "
          "l'onboarding Stripe (GET /api/payments/stripe/connect/onboard). Si configuré, "
          "affichage du compte Stripe lié. Étape 2 : saisie du montant (min. 10€, max = solde "
          "disponible), récapitulatif des frais (0% pour les freelances Pro), confirmation. "
          "API : POST /api/payments/withdrawals."),
        P("**PaymentSuccess.jsx** — Page de confirmation post-Stripe Checkout. Elle lit le "
          "session_id en paramètre URL, appelle l'API pour confirmer le dépôt "
          "(GET /api/payments/stripe/confirm?session_id=...) et affiche : montant crédité, "
          "nouveau solde disponible, et deux CTA ('Financer un séquestre' / 'Voir les offres')."),
        P("**PaymentCancel.jsx** — Page affichée si l'utilisateur clique 'Retour' dans Stripe "
          "Checkout avant de payer. Message d'information neutre, bouton 'Réessayer' (relance "
          "Checkout) et bouton 'Revenir au portefeuille'. Aucun débit n'a eu lieu."),
        P("**StripeConnectReturn.jsx** — Traite le retour de l'onboarding Stripe Connect. "
          "Appelle GET /api/payments/stripe/connect/status pour vérifier si l'onboarding est "
          "complet. Si oui : message de succès 'Compte configuré, vous pouvez recevoir des "
          "paiements'. Si non (onboarding partiel) : bouton 'Compléter la configuration'."),
        P("**AdminFinance.jsx** — Réservée aux administrateurs. En-tête : total des transactions "
          "du jour, volume mensuel, commissions perçues. Tableau des retraits en attente avec "
          "colonnes : Utilisateur, Montant, Compte Stripe, Date de demande, Statut. Pour chaque "
          "retrait : bouton 'Approuver' (déclenche le transfert Stripe) et 'Rejeter avec motif'. "
          "Historique complet filtrable + bouton 'Exporter CSV'. "
          "API : GET /api/admin/finance, POST /api/admin/withdrawals/:id/approve."),

        H3("7", "Talents et profils freelance — 3 pages"),
        P("Le module Freelance regroupe la place de marché des talents, les profils publics des "
          "freelances et la page de configuration du profil professionnel. Ces pages constituent la "
          "vitrine du freelance sur la plateforme et déterminent sa visibilité auprès des clients."),
        TBL(["Page", "Route", "Description"],
            [["FreelancerMarketplace.jsx", "/freelancers",
              "Liste paginée des freelances avec filtres (compétences, disponibilité, tarif, note). "
              "Cartes avec photo, titre, compétences et indicateurs."],
             ["FreelancerProfile.jsx", "/freelancers/:id",
              "Profil public complet : biographie, photo, compétences, tarif horaire, "
              "portfolio, évaluations reçues, bouton de contact."],
             ["FreelancerSettings.jsx", "/freelancer/settings",
              "Paramètres du profil professionnel : photo, titre, biographie, compétences, "
              "tarif, disponibilité et ajout de projets au portfolio."]],
            caption="Pages du module Talents et profils freelance",
            widths=[0.26, 0.26, 0.48]),
        FIG("ui_talent", "Place de marché des freelances — cartes avec compétences et tarifs"),
        P("La place de marché FreelancerMarketplace.jsx présente les freelances sous forme de "
          "cartes visuelles comportant la photo, le nom, le titre professionnel, les compétences "
          "principales (badges colorés), le tarif horaire et la note moyenne. Les filtres permettent "
          "de sélectionner par compétence, fourchette de tarif, disponibilité immédiate et note "
          "minimale."),
        P("La page FreelancerProfile.jsx (profil public) s'organise en deux colonnes : à gauche "
          "la sidebar avec la photo, les indicateurs clés (note, missions, ancienneté) et les "
          "boutons d'action (Contacter, Enregistrer) ; à droite les onglets Biographie, Portfolio, "
          "Compétences et Évaluations. Le portfolio affiche les projets avec image, titre et lien. "
          "Les évaluations sont horodatées et signées uniquement par des clients ayant effectivement "
          "collaboré avec ce freelance."),
        P("FreelancerSettings.jsx permet au freelance de personnaliser entièrement son profil : "
          "photo de profil, titre accrocheur, biographie, sélection des compétences depuis un "
          "référentiel normalisé, tarif horaire, disponibilité (disponible, partiellement "
          "disponible, indisponible) et gestion du portfolio de projets."),
        P("**FreelancerMarketplace.jsx** — Disposition en deux colonnes. Panneau de filtres : "
          "barre de recherche textuelle, multi-select de compétences (avec recherche dans la "
          "liste), fourchette de tarif horaire (slider double), disponibilité (checkbox), note "
          "minimale (étoiles). Cartes freelances : avatar, nom, titre, 3 compétences principales "
          "en badges, tarif/h, note (étoiles + nombre d'avis), badge 'Vérifié' si KYC validé. "
          "Pagination infinie (IntersectionObserver). Tri : Pertinence, Tarif croissant/décroissant, "
          "Mieux notés, Plus récents. API : GET /api/freelancers avec query params."),
        P("**FreelancerProfile.jsx** — Layout deux colonnes. Sidebar gauche (sticky) : grande "
          "photo de profil, nom + titre, note (4.9/5 — 48 avis), badges (Vérifié, Disponible, "
          "Top Freelance), statistiques (23 missions, membre depuis 8 mois, taux de réponse "
          "98%), tarif horaire affiché en grand, bouton 'Contacter' (ouvre Messages.jsx avec "
          "conversation pré-créée) et bouton 'Enregistrer' (favori). Contenu principal (onglets): "
          "Biographie (Markdown rendu), Portfolio (grille de projets avec image/titre/lien), "
          "Compétences (nuage de tags avec niveau), Évaluations (liste chronologique avec "
          "note, verbatim, client). API : GET /api/freelancers/:username."),
        P("**FreelancerSettings.jsx** — Interface en sections accordéon. Photo de profil : "
          "zone de dépôt avec prévisualisation et recadrage (react-cropper). Informations de "
          "base : titre, pays, langues. Biographie : éditeur Markdown avec prévisualisation "
          "en temps réel. Compétences : select multi avec recherche dans 150+ tags, glisser "
          "pour réordonner. Tarif : slider avec saisie directe en €/h. Disponibilité : "
          "radio (Disponible / Partiel / Indisponible) + date de retour si partiel. "
          "Portfolio : liste de projets (image, titre, description, lien) avec ajout/suppression. "
          "API : PUT /api/freelancer/profile, POST /api/freelancer/portfolio."),

        H3("8", "Gestion des talents — 3 pages"),
        P("Le module de gestion des talents permet au client d'organiser sa veille sur les profils "
          "freelance. Il peut enregistrer des profils en favoris et les regrouper dans des listes "
          "nommées thématiquement, constituant ainsi un vivier de talents pour ses projets futurs."),
        TBL(["Page", "Route", "Description"],
            [["SavedFreelancers.jsx", "/saved-freelancers",
              "Freelances enregistrés en favori par le client, avec actions rapides : "
              "retirer, contacter, ajouter à une liste nommée."],
             ["TalentLists.jsx", "/talent-lists",
              "Listes de talents créées par le client : nom, description, "
              "nombre de membres, date de création."],
             ["TalentListDetails.jsx", "/talent-lists/:id",
              "Détail d'une liste : freelances membres, ajout/retrait, partage "
              "par lien, notes privées sur chaque profil."]],
            caption="Pages du module Gestion des talents",
            widths=[0.26, 0.26, 0.48]),
        P("SavedFreelancers.jsx centralise tous les profils marqués d'une étoile pendant la "
          "navigation sur la place de marché. Chaque entrée affiche la carte du freelance avec "
          "ses indicateurs clés et deux actions : retirer des favoris ou ajouter à une liste "
          "nommée. Ce raccourci permet de retrouver rapidement un profil sans relancer une "
          "recherche."),
        P("TalentLists.jsx présente les listes thématiques créées par le client sous forme de "
          "cartes (par exemple : 'Développeurs React', 'Designers Figma', 'Comptables'). "
          "Chaque liste affiche son nom, description, nombre de freelances membres et date de "
          "dernière modification. TalentListDetails.jsx ouvre la liste sélectionnée et permet "
          "d'ajouter de nouveaux freelances depuis les favoris, de retirer des membres, "
          "d'ajouter des notes privées sur chaque profil et de partager la liste avec un "
          "collègue via un lien."),
        P("**SavedFreelancers.jsx** — Grille de cartes identiques à FreelancerMarketplace mais "
          "filtrée sur les favoris de l'utilisateur. Bouton 'Retirer' (icône étoile pleine) sur "
          "chaque carte retire instantanément le profil via DELETE /api/saved-freelancers/:id. "
          "Bouton 'Ajouter à une liste' ouvre une modale avec les listes existantes + "
          "option 'Créer une nouvelle liste'. Si aucun favori : état vide avec CTA vers "
          "la place de marché."),
        P("**TalentLists.jsx** — Grille de cartes de listes. Chaque carte affiche : icône "
          "colorée auto-générée depuis le nom, titre de la liste, description courte, "
          "avatars des 3 premiers membres (superposés), compteur total, date de modification. "
          "Bouton '+' en bas à droite ouvre une modale 'Créer une liste' avec nom et description. "
          "API : GET /api/talent-lists, POST /api/talent-lists."),
        P("**TalentListDetails.jsx** — En-tête avec nom, description et bouton 'Partager' "
          "(génère un lien public de lecture seule). Grille de cartes freelances membres avec "
          "bouton 'Retirer de la liste'. Sidebar droite : zone 'Notes' en Markdown persistées "
          "par freelance (notes privées du client). Bouton 'Ajouter des freelances' ouvre un "
          "sélecteur modal depuis les favoris ou par recherche. "
          "API : GET/PUT /api/talent-lists/:id, POST /api/talent-lists/:id/members."),

        H3("9", "Paramètres et sécurité du compte — 3 pages"),
        P("Le module Paramètres regroupe les pages de configuration avancée liées à la sécurité "
          "du compte et à la conformité fiscale. Ces interfaces traitent de sujets sensibles : "
          "double authentification, vérification d'identité (KYC) et déclarations fiscales."),
        TBL(["Page", "Route", "Description"],
            [["TwoFactorSettings.jsx", "/settings/2fa",
              "Activation/désactivation de la 2FA TOTP. QR code à scanner, codes de secours "
              "générés, statut actuel affiché."],
             ["IdentityVerification.jsx", "/settings/identity",
              "Parcours KYC : téléversement des documents d'identité (recto/verso), selfie, "
              "statut de vérification (en attente, vérifié, rejeté avec motif)."],
             ["TaxCenter.jsx", "/settings/tax",
              "Informations fiscales : pays de résidence, numéro fiscal, formulaires "
              "réglementaires, téléchargement des récapitulatifs annuels."]],
            caption="Pages du module Paramètres et sécurité du compte",
            widths=[0.26, 0.26, 0.48]),
        P("La page TwoFactorSettings.jsx guide l'utilisateur en trois étapes : activation depuis "
          "les paramètres, scan du QR code avec une application TOTP (Google Authenticator, "
          "Authy), saisie du code de confirmation et affichage des dix codes de secours à "
          "conserver hors ligne. Une fois activée, la 2FA est exigée à chaque connexion."),
        P("La page IdentityVerification.jsx (vérification KYC) est requise pour les freelances "
          "souhaitant activer les retraits. Elle guide l'utilisateur pour téléverser un document "
          "d'identité valide (carte nationale, passeport ou permis de conduire), un selfie tenant "
          "le document, et éventuellement un justificatif de domicile. Le statut (En attente, "
          "Vérifié, Rejeté avec motif) est affiché en temps réel. TaxCenter.jsx centralise les "
          "obligations fiscales selon le pays de résidence : numéro d'identification fiscale, "
          "formulaires réglementaires et récapitulatifs annuels des transactions téléchargeables."),
        P("**TwoFactorSettings.jsx** — En haut : statut actuel de la 2FA (badge vert 'Activée' "
          "ou gris 'Désactivée'). Si désactivée : bouton 'Activer la 2FA' qui déclenche "
          "POST /api/auth/2fa/enable → reçoit un secret TOTP et génère un QR code (bibliothèque "
          "qrcode.react). L'utilisateur scanne avec Google Authenticator ou Authy, saisit le "
          "code à 6 chiffres pour confirmer, puis reçoit 10 codes de secours à usage unique "
          "qu'il doit copier ou télécharger. Si activée : bouton 'Désactiver' avec confirmation "
          "du mot de passe actuel. API : POST /api/auth/2fa/enable, /2fa/disable, /2fa/verify."),
        P("**IdentityVerification.jsx** — Stepper en 3 étapes. Étape 1 : sélection du type de "
          "document (Carte Nationale, Passeport, Permis de conduire) et téléversement du recto "
          "(zone drag & drop avec prévisualisation). Étape 2 : téléversement du verso + selfie "
          "tenant le document (ou capture par webcam si navigator.mediaDevices disponible). "
          "Étape 3 : récapitulatif et soumission. Après soumission, affichage du statut "
          "'En attente d'examen (1-3 jours ouvrables)'. L'administrateur peut Approuver ou "
          "Rejeter avec motif depuis AdminDashboard. API : POST /api/kyc/submit."),
        P("**TaxCenter.jsx** — Formulaire en deux sections. Section 'Informations fiscales' : "
          "pays de résidence (select), numéro d'identification fiscale (NIF/SIRET/EIN selon le "
          "pays), type de structure (particulier/auto-entrepreneur/société). Section "
          "'Documents fiscaux' : tableau des récapitulatifs annuels téléchargeables en PDF "
          "(générés automatiquement par la plateforme : année, transactions, montant total, "
          "TVA collectée). Notification par email à chaque début d'année. "
          "API : PUT /api/user/tax-info, GET /api/user/tax-documents."),

        H3("10", "Autres fonctionnalités transversales — 6 pages"),
        P("Cette section regroupe les pages transversales qui ne s'inscrivent pas dans un module "
          "unique : la messagerie temps réel, l'assistant IA, les rapports statistiques, la "
          "facturation, la recherche globale et la recherche contextuelle."),
        TBL(["Page", "Route", "Description"],
            [["Messages.jsx", "/messages",
              "Messagerie temps réel (Laravel Reverb/WebSocket) : conversations, réactions, "
              "pièces jointes, indicateur de saisie, statut de présence."],
             ["AIAssistant.jsx", "/ai-assistant",
              "Assistant IA conversationnel (Ollama + Mistral 7B) : rédaction de propositions, "
              "matching offre/profil, analyse, questions en langage naturel."],
             ["Reports.jsx", "/reports",
              "Rapports et statistiques personnalisés : activité, revenus, performance "
              "des offres — graphiques exportables en PNG et CSV."],
             ["Billing.jsx", "/billing",
              "Historique de facturation : abonnements actifs, factures téléchargeables "
              "en PDF, gestion de la carte bancaire."],
             ["GlobalSearch.jsx", "/search",
              "Recherche cross-entités : résultats groupés par offres, freelances, "
              "contrats et messages en une seule vue."],
             ["Search.jsx", "/s",
              "Recherche rapide contextuelle accessible depuis la barre de navigation : "
              "suggestions en temps réel par catégorie."]],
            caption="Pages transversales de l'application Panda",
            widths=[0.22, 0.22, 0.56]),
        FIG("ui_chat", "Messagerie temps réel — liste de conversations et fenêtre de chat"),
        P("La messagerie (Messages.jsx) est alimentée par Laravel Reverb, le serveur WebSocket "
          "officiel de Laravel, et la bibliothèque Echo côté React. La page est divisée en deux "
          "panneaux : à gauche la liste des conversations triées par heure du dernier message, "
          "avec aperçu et indicateur de messages non lus ; à droite la fenêtre de conversation "
          "avec bulles différenciées (envoyé/reçu), horodatage, indicateur 'en train d'écrire', "
          "accusés de lecture, réactions emoji et partage de fichiers."),
        FIG("ui_ai", "Assistant d'intelligence artificielle — interface conversationnelle"),
        P("L'assistant IA (AIAssistant.jsx) s'appuie sur Ollama avec le modèle Mistral 7B "
          "exécuté localement. L'interface adopte le format de chat conversationnel familier. "
          "L'assistant propose quatre modes d'action accessibles par boutons rapides : "
          "'Rédiger une proposition', 'Analyser un profil', 'Trouver des talents correspondants' "
          "et 'Question libre'. L'historique des échanges est persisté en base et affiché sous "
          "forme de thread scrollable."),
        P("La page Reports.jsx propose des rapports visuels personnalisables : les clients "
          "suivent leurs dépenses par catégorie et l'état de leurs offres ; les freelances "
          "suivent leurs revenus mensuels et leur taux de conversion des propositions. "
          "GlobalSearch.jsx offre une recherche cross-entités avec résultats groupés par type, "
          "tandis que Billing.jsx présente l'historique de facturation et permet de télécharger "
          "les factures en PDF."),
        P("**Messages.jsx** — Layout deux colonnes fixes. Colonne gauche (280px) : barre de "
          "recherche pour filtrer les conversations, liste des conversations triées par date "
          "du dernier message, chaque entrée affichant l'avatar de l'interlocuteur, son nom, "
          "l'extrait du dernier message, l'heure et un badge de comptage des messages non lus "
          "(chip rouge). Colonne droite : en-tête avec avatar + nom + statut de présence (point "
          "vert/gris), zone de messages en bulles (bleu à droite pour l'utilisateur, gris à "
          "gauche pour l'interlocuteur), indicateur 'écrit...' animé via WebSocket, horodatage "
          "visible au survol. Zone de saisie en bas : champ texte + bouton pièce jointe "
          "(icône trombone) + bouton envoi (icône avion). Réactions au clic long (6 emojis). "
          "API : GET /api/conversations, GET /api/conversations/:id/messages. "
          "WebSocket : écoute sur canal privé conversation.{id}."),
        P("**AIAssistant.jsx** — Interface de chat en pleine page. En-tête : logo IA + titre "
          "'Assistant Panda'. Quatre boutons d'action rapide (chips cliquables) : 'Rédiger une "
          "proposition', 'Analyser un profil', 'Trouver des talents', 'Question libre'. "
          "Zone de messages : bulles utilisateur (bleu) et bulles IA (blanc avec avatar robot) "
          "avec indicateur de chargement (animation de trois points) pendant la génération. "
          "Le modèle génère la réponse en streaming (Server-Sent Events), les mots apparaissent "
          "progressivement. Bouton 'Copier' sur chaque réponse IA. Historique persisté en "
          "base de données et affiché à la reconnexion. API : POST /api/ai/chat (streaming SSE)."),
        P("**Reports.jsx** — Sélecteur de période en haut (7j / 30j / 3 mois / personnalisé). "
          "Vue Client : graphique barres des dépenses par catégorie de mission, graphique "
          "ligne des contrats actifs/terminés par semaine, tableau des 5 freelances les plus "
          "fréquents. Vue Freelance : graphique ligne des revenus mensuels (brut/net après "
          "commission), taux de conversion des propositions (camembert acceptées/refusées/"
          "en attente), catégories les plus demandées. Tous les graphiques sont exportables "
          "en PNG (clic droit > 'Enregistrer l'image' via canvas). API : GET /api/reports?period=."),
        P("**Billing.jsx** — Tableau 'Abonnements actifs' avec plan, date de souscription, "
          "prochain renouvellement et bouton 'Changer de plan'. Tableau 'Historique des "
          "factures' : date, description (Plan Pro — Janvier 2025), montant TTC, statut "
          "(Payée/Remboursée), bouton PDF. Chaque PDF est généré à la volée par l'API "
          "(GET /api/billing/invoices/:id/pdf). Section 'Méthode de paiement' : derniers "
          "4 chiffres de la carte enregistrée dans Stripe, bouton 'Modifier'."),
        P("**GlobalSearch.jsx** — Barre de recherche large en haut, résultats groupés en "
          "sections : Offres (3 résultats max + lien 'Voir tout'), Freelances (3 max), "
          "Contrats (3 max), Messages (3 max). Chaque résultat est cliquable et redirige "
          "vers la page correspondante. Si aucun résultat : suggestions de recherches "
          "populaires. Debounce 300ms sur la saisie. API : GET /api/search?q=... "
          "Accessible depuis la touche Ctrl+K (raccourci clavier global)."),
        P("**Search.jsx** — Overlay pleine fenêtre déclenché par la barre de navigation. "
          "Affiche les résultats en temps réel dès la 2ème lettre saisie (debounce 200ms). "
          "Résultats regroupés par type avec icônes distinctes. Clavier : flèches haut/bas "
          "pour naviguer, Entrée pour sélectionner, Échap pour fermer. Historique des "
          "5 dernières recherches affiché avant la saisie. "
          "API : GET /api/search/quick?q=... (résultats limités à 10 pour la rapidité)."),

        H3("11", "Design responsive et système de composants"),
        P("Toutes les interfaces de Panda partagent un socle commun : un système de composants "
          "React réutilisables et une charte graphique cohérente implémentée avec TailwindCSS."),
        TBL(["Principe", "Mise en oeuvre technique"],
            [["Responsivité mobile-first",
              "Breakpoints sm/md/lg/xl TailwindCSS. Chaque page testée sur 320 px (téléphone), "
              "768 px (tablette) et 1280 px (bureau)."],
             ["Palette de couleurs",
              "Bleu #1E3A5F (principal), orange #FF6B35 (accent), vert #28A745 (succès), "
              "rouge #DC3545 (erreur), fond #F8F9FA."],
             ["Typographie",
              "Inter (sans-serif) pour les textes courants, JetBrains Mono pour les données "
              "techniques et les montants financiers."],
             ["Retours utilisateur",
              "Toasts de confirmation/erreur (react-hot-toast), skeleton screens "
              "(états de chargement), animations Framer Motion."],
             ["Navigation",
              "GlobalNavbar adaptative avec menu hamburger mobile, barre latérale contextuelle "
              "selon le rôle, fil d'Ariane sur les pages profondes."],
             ["Visualisation de données",
              "Recharts pour les graphiques des tableaux de bord (barres, lignes, "
              "secteurs) avec tooltips interactifs."],
             ["Accessibilité",
              "Contrastes conformes WCAG AA, navigation au clavier, attributs ARIA sur les "
              "composants interactifs, labels explicites sur les formulaires."]],
            caption="Principes de design et mise en oeuvre technique",
            widths=[0.30, 0.70]),
        P("Ce système de composants unifié — boutons, badges, cartes, modales, tableaux, "
          "graphiques — garantit une cohérence visuelle et une maintenabilité élevée. "
          "L'ajout d'une nouvelle fonctionnalité se fait par composition de composants "
          "existants, réduisant le temps de développement et les risques de régression visuelle. "
          "Sur une place de marché, la qualité de l'expérience utilisateur conditionne "
          "directement la confiance et l'engagement des utilisateurs."),

        H2("IX", "Gestion du code source avec GitHub"),
        P("L'intégralité du code source de Panda est versionnée sur **GitHub**, la plateforme de "
          "collaboration la plus répandue dans l'industrie. Le dépôt centralise le back-end "
          "Laravel, le front-end React et les scripts de documentation, offrant un historique "
          "complet, une collaboration structurée et une intégration continue automatisée."),

        H3("1", "Structure et statistiques du dépôt"),
        P("Le dépôt est organisé en deux répertoires principaux reflétant l'architecture "
          "back-end / front-end séparée du projet. Les métriques suivantes illustrent l'ampleur "
          "du travail réalisé."),
        TBL(["Métrique", "Valeur"],
            [["Dépôt GitHub", "github.com/fasko666/panda-freelance"],
             ["Branches actives", "5  (main, develop, feature/payments, feature/ai, hotfix/kyc)"],
             ["Commits totaux", "247"],
             ["Fichiers versionnés", "1 284"],
             ["Lignes de code (PHP + JS/JSX)", "environ 52 000"],
             ["Contributions", "1 contributeur (Ayoub Elmernissi)"],
             ["Tags / Releases", "v0.1, v0.2, v0.3, v0.4, v0.5, v1.0-beta"],
             ["Issues fermées", "14  (0 ouvertes à la livraison)"]],
            caption="Statistiques du dépôt GitHub du projet Panda",
            widths=[0.40, 0.60]),

        H3("2", "Stratégie de branches — Git Flow simplifié"),
        P("Le projet suit une variante simplifiée de **Git Flow**, adaptée au développement "
          "individuel mais conforme aux conventions de l'industrie. Chaque fonctionnalité est "
          "isolée sur une branche dédiée avant d'être fusionnée dans `develop` par pull request, "
          "puis dans `main` lors des releases."),
        CODE("Stratégie de branches Git Flow (projet Panda)",
             "main            → code stable, taguée et déployable en production\n"
             "├── develop     → branche d'intégration des fonctionnalités\n"
             "│   ├── feature/auth         (Login, Register, 2FA, OAuth Google)\n"
             "│   ├── feature/jobs         (Offres, Propositions, PostJob)\n"
             "│   ├── feature/contracts    (Contrats, Jalons, Litiges, PDF)\n"
             "│   ├── feature/payments     (Stripe Checkout, Connect, LedgerService)\n"
             "│   ├── feature/chat         (Reverb WebSocket, Messages, Réactions)\n"
             "│   ├── feature/ai           (Ollama, Mistral, 5 services IA)\n"
             "│   ├── feature/admin        (Back-office, KYC, Finance, Modération)\n"
             "│   └── feature/agencies     (Agences, Pages publiques, Landing)\n"
             "└── hotfix/*    → correctifs urgents : mergés dans main ET develop"),
        TBL(["Branche", "Rôle", "Protection"],
            [["main",
              "Code de production stable et testé",
              "Protégée — merge uniquement via PR avec CI verte"],
             ["develop",
              "Intégration continue des fonctionnalités terminées",
              "Merge direct depuis feature/* autorisé"],
             ["feature/*",
              "Développement isolé d'une fonctionnalité",
              "Supprimée après merge dans develop"],
             ["hotfix/*",
              "Correction urgente d'un bug critique en production",
              "Mergée dans main ET develop, puis supprimée"]],
            caption="Rôles et règles de protection des branches Git",
            widths=[0.20, 0.45, 0.35]),

        H3("3", "Conventions de commit (Conventional Commits)"),
        P("Chaque message de commit suit la spécification **Conventional Commits** qui impose "
          "un format structuré permettant la génération automatique de changelogs et la "
          "compréhension immédiate de l'historique du projet."),
        CODE("Format des messages de commit — exemples réels du projet",
             "feat(auth)     : add Google OAuth2 login with Sanctum token exchange\n"
             "feat(payments) : implement Stripe webhook with idempotency check\n"
             "feat(chat)     : add WebSocket real-time messaging via Laravel Reverb\n"
             "feat(ai)       : integrate Ollama Mistral 7B for proposal generation\n"
             "fix(ledger)    : use bcmath for decimal precision in escrow release\n"
             "fix(kyc)       : handle rejected status edge case in IdentityVerification\n"
             "refactor(jobs) : extract filters into reusable JobFilterSidebar component\n"
             "test(contracts): add milestone approval integration test\n"
             "docs(api)      : update Postman collection with payment endpoints\n"
             "chore(docker)  : optimize Dockerfile with multi-stage build"),
        TBL(["Type", "Signification", "Impacte le changelog"],
            [["feat", "Nouvelle fonctionnalité visible par l'utilisateur", "Oui — section 'Features'"],
             ["fix", "Correction d'un bug", "Oui — section 'Bug Fixes'"],
             ["refactor", "Réécriture sans changement de comportement observable", "Non"],
             ["test", "Ajout ou correction de tests", "Non"],
             ["docs", "Documentation uniquement (README, Swagger, Postman)", "Non"],
             ["chore", "Maintenance, outils, configuration (Docker, Vite, CI)", "Non"],
             ["style", "Formatage du code sans logique (ESLint, Prettier)", "Non"],
             ["perf", "Amélioration des performances (requêtes, cache, lazy-loading)", "Oui"]],
            caption="Types de commits Conventional Commits et impact sur le changelog",
            widths=[0.16, 0.55, 0.29]),

        H3("4", "Pipeline d'intégration continue — GitHub Actions"),
        P("Un workflow **GitHub Actions** est déclenché automatiquement à chaque push sur "
          "`develop` et à chaque pull request vers `main`. Il exécute les tests PHPUnit, "
          "vérifie la qualité du code et compile le front-end React pour détecter toute "
          "régression avant le merge."),
        CODE(".github/workflows/ci.yml — pipeline CI complet",
             "name: CI — Panda Freelance\n"
             "on:\n"
             "  push:          { branches: [develop] }\n"
             "  pull_request:  { branches: [main] }\n"
             "\n"
             "jobs:\n"
             "  backend-tests:\n"
             "    runs-on: ubuntu-latest\n"
             "    services:\n"
             "      mysql: { image: mysql:8, env: { MYSQL_ROOT_PASSWORD: secret,\n"
             "               MYSQL_DATABASE: panda_test } }\n"
             "    steps:\n"
             "      - uses: actions/checkout@v4\n"
             "      - uses: shivammathur/setup-php@v2\n"
             "        with: { php-version: '8.3', extensions: 'pdo_mysql bcmath' }\n"
             "      - run: composer install --no-interaction --prefer-dist\n"
             "      - run: cp .env.testing .env && php artisan key:generate\n"
             "      - run: php artisan migrate --force\n"
             "      - run: php artisan test --parallel --coverage-clover coverage.xml\n"
             "\n"
             "  frontend-build:\n"
             "    runs-on: ubuntu-latest\n"
             "    steps:\n"
             "      - uses: actions/checkout@v4\n"
             "      - uses: actions/setup-node@v4\n"
             "        with: { node-version: '20' }\n"
             "      - run: cd frontend-react && npm ci\n"
             "      - run: cd frontend-react && npm run lint\n"
             "      - run: cd frontend-react && npm run build"),
        TBL(["Étape du pipeline", "Outil", "Seuil de passage"],
            [["Installation dépendances PHP", "Composer 2.7", "Exit code 0"],
             ["Installation dépendances JS", "npm ci (lockfile)", "Exit code 0"],
             ["Lint JavaScript / JSX", "ESLint + Prettier", "0 warning, 0 error"],
             ["Vérification style PHP", "PHP CS Fixer (PSR-12)", "0 violation"],
             ["Migrations de test", "php artisan migrate", "Exit code 0"],
             ["Suite de tests back-end", "PHPUnit 11 (114 tests)", "100% de tests verts"],
             ["Build de production React", "Vite 6 (tree-shaking)", "Pas d'erreur TS/build"],
             ["Couverture de code", "PHPUnit --coverage", "Rapport XML généré et archivé"]],
            caption="Étapes du pipeline CI GitHub Actions",
            widths=[0.35, 0.30, 0.35]),

        H3("5", "Releases et gestion des versions (SemVer)"),
        P("Les releases sont créées manuellement après validation d'un sprint, suivant la "
          "convention **SemVer** (Semantic Versioning : MAJEUR.MINEUR.CORRECTIF). Les notes "
          "de version sont générées depuis les commits Conventional Commits et publiées sur "
          "la page Releases du dépôt."),
        TBL(["Tag", "Sprint", "Contenu principal"],
            [["v0.1.0", "Sprint 1", "Authentification, inscription, 2FA, OAuth Google, migrations initiales"],
             ["v0.2.0", "Sprint 2", "Offres, propositions, place de marché freelances, pages publiques"],
             ["v0.3.0", "Sprint 3", "Contrats, jalons, litige, suivi du temps, export PDF contrat"],
             ["v0.4.0", "Sprint 4", "Portefeuille Stripe, séquestre, libération, retraits, webhooks"],
             ["v0.5.0", "Sprint 5", "Messagerie WebSocket (Reverb), assistant IA (Ollama/Mistral)"],
             ["v1.0.0-beta", "Sprint 6", "Administration, KYC, agences, profils, Docker, CI/CD, 114 tests"]],
            caption="Historique des releases GitHub du projet Panda",
            widths=[0.16, 0.14, 0.70]),
        NOTE("Les tags sont créés sur `main` uniquement après le passage complet du pipeline "
             "CI. Toute release porte un changelog généré automatiquement depuis les commits "
             "feat et fix du sprint correspondant."),

        H2("X", "Gestion de projet avec Jira"),
        P("La conduite du projet a suivi la méthodologie **Scrum**, implémentée dans l'outil "
          "de gestion de projet **Jira** (Atlassian). Ce choix reflète les pratiques "
          "industrielles actuelles et permet un suivi précis par sprints, une gestion "
          "structurée du backlog et une visibilité en temps réel sur l'avancement du projet."),

        H3("1", "Méthodologie Scrum appliquée au projet"),
        P("Scrum est un cadre agile itératif organisé en **sprints** de durée fixe. Pour ce "
          "projet, chaque sprint a duré **deux semaines** et s'est clôturé par une revue de "
          "sprint et une rétrospective. Les cérémonies Scrum ont été adaptées au contexte "
          "d'un projet individuel de fin d'études."),
        TBL(["Cérémonie Scrum", "Fréquence", "Objectif dans le projet Panda"],
            [["Sprint Planning",
              "Début de sprint",
              "Sélectionner les user stories du backlog et estimer les story points. Définir "
              "l'objectif du sprint (sprint goal)."],
             ["Daily Stand-up",
              "Quotidien (adapté)",
              "Journal de bord quotidien : ce qui a été fait, ce qui est prévu, les blocages "
              "identifiés."],
             ["Sprint Review",
              "Fin de sprint",
              "Démonstration des fonctionnalités terminées, vérification des critères "
              "d'acceptation et recueil des retours."],
             ["Sprint Retrospective",
              "Fin de sprint",
              "Analyse des pratiques : ce qui a bien fonctionné, ce qui doit s'améliorer, "
              "actions correctives pour le prochain sprint."],
             ["Backlog Refinement",
              "Milieu de sprint",
              "Affiner, chiffrer et prioriser les user stories du sprint suivant pour "
              "préparer le Sprint Planning."]],
            caption="Cérémonies Scrum appliquées au projet Panda",
            widths=[0.24, 0.18, 0.58]),

        H3("2", "Structure du backlog et Épics"),
        P("Le backlog est organisé en **Épics** thématiques, chacune regroupant plusieurs "
          "**User Stories** exprimées du point de vue de l'utilisateur selon le format "
          "'En tant que [rôle], je souhaite [action] afin de [bénéfice]'. Chaque story est "
          "estimée en **Story Points** selon la suite de Fibonacci (1, 2, 3, 5, 8, 13)."),
        TBL(["Épic", "Contenu", "Story Points"],
            [["AUTH — Authentification",
              "Login, Register, OAuth Google, 2FA, Onboarding, Reset Password, JWT Sanctum",
              "34"],
             ["JOBS — Offres & Propositions",
              "Parcourir, filtrer, publier une offre, soumettre une proposition, "
              "favoris, catégories, mes offres",
              "55"],
             ["CONTRACTS — Contrats & Jalons",
              "Créer un contrat, gérer jalons, soumettre/valider livrable, litige, "
              "suivi du temps, extensions, PDF",
              "89"],
             ["PAYMENTS — Paiements Stripe",
              "Portefeuille, dépôt Stripe Checkout, séquestre, libération, retrait, "
              "Stripe Connect, webhooks idempotents",
              "55"],
             ["CHAT — Messagerie temps réel",
              "Conversations WebSocket, envoi/réception, réactions, pièces jointes, "
              "statut de présence, historique",
              "34"],
             ["AI — Intelligence artificielle",
              "Génération de proposition, matching freelance/offre, analyse de profil, "
              "chatbot conversationnel, historique",
              "21"],
             ["ADMIN — Back-office",
              "Tableau de bord admin, modération des offres, KYC, finance, "
              "gestion des utilisateurs, statistiques",
              "34"],
             ["PUBLIC — Pages marketing",
              "Landing, Pricing, Agencies, Enterprise, HowItWorks, Blog, Reviews, "
              "SuccessStories, verticales métier",
              "21"],
             ["PROFILE — Profils & Talents",
              "Profil freelance, marketplace, favoris, listes de talents, "
              "paramètres, portfolio, évaluations",
              "34"],
             ["DEVOPS — Infrastructure",
              "Docker Compose, Nginx, CI/CD GitHub Actions, déploiement VPS, "
              "variables d'environnement",
              "13"]],
            caption="Épics du backlog Jira avec estimation totale en Story Points",
            widths=[0.26, 0.54, 0.20]),

        H3("3", "Planification des sprints — 6 sprints de 2 semaines"),
        P("Le projet a été réalisé en **six sprints** de deux semaines chacun, couvrant la "
          "totalité du développement depuis la mise en place du squelette technique jusqu'au "
          "déploiement et aux tests finaux. Chaque sprint correspondait à une ou plusieurs "
          "Épics prioritaires, livrées sous forme de fonctionnalités démontrables."),
        TBL(["Sprint", "Période", "Épics", "Livrable principal", "Pts livrés"],
            [["Sprint 1", "Sem. 1-2",
              "AUTH + Setup",
              "API d'authentification complète (inscription, connexion, 2FA, OAuth), "
              "migrations de base, structure du projet",
              "34"],
             ["Sprint 2", "Sem. 3-4",
              "JOBS + PUBLIC",
              "Place de marché des offres, propositions, pages publiques (Landing, Pricing, "
              "HowItWorks, Blog)",
              "48"],
             ["Sprint 3", "Sem. 5-6",
              "CONTRACTS",
              "Contrats complets : jalons, litige, suivi du temps, extensions, "
              "journal d'activité, export PDF",
              "55"],
             ["Sprint 4", "Sem. 7-8",
              "PAYMENTS",
              "Portefeuille complet, Stripe Checkout, Stripe Connect, webhooks "
              "idempotents, retraits avec approbation admin",
              "55"],
             ["Sprint 5", "Sem. 9-10",
              "CHAT + AI",
              "Messagerie WebSocket temps réel (Reverb), assistant IA conversationnel "
              "(Ollama/Mistral), 5 services IA",
              "42"],
             ["Sprint 6", "Sem. 11-12",
              "ADMIN + PROFILE + DEVOPS",
              "Back-office complet, KYC, agences, profils freelance, listes de talents, "
              "Docker, CI/CD, 114 tests",
              "62"]],
            caption="Planification et vélocité des sprints du projet Panda",
            widths=[0.11, 0.11, 0.17, 0.46, 0.15]),
        NOTE("La vélocité a progressé régulièrement de 34 à 62 points par sprint à mesure "
             "que la base technique se consolidait et que les composants réutilisables "
             "s'accumulaient. Les sprints 3 et 4 ont été les plus complexes en raison de "
             "la logique financière et de l'intégration Stripe."),

        H3("4", "Workflow des tickets et types de travaux"),
        P("Chaque ticket Jira suit un workflow en cinq états garantissant la traçabilité "
          "complète de chaque fonctionnalité, de l'idée jusqu'à la mise en production."),
        CODE("Workflow des tickets Jira — cinq états",
             "A FAIRE  →  EN COURS  →  EN REVUE  →  TERMINE  →  FERME\n"
             "\n"
             "A FAIRE   : ticket créé, estimé et priorisé dans le backlog\n"
             "EN COURS  : développement actif (branche feature/* créée sur GitHub)\n"
             "EN REVUE  : code terminé, pull request ouverte, CI doit passer\n"
             "TERMINE   : PR mergée dans develop, fonctionnalité testée en démo\n"
             "FERME     : validé en sprint review, déployé ou planifié en release"),
        TBL(["Type de ticket", "Préfixe Jira", "Description", "Exemple"],
            [["User Story",
              "PANDA-US-*",
              "Fonctionnalité vue par l'utilisateur avec critères d'acceptation mesurables",
              "PANDA-US-12 : En tant que freelance, je peux soumettre une proposition"],
             ["Task",
              "PANDA-T-*",
              "Tâche technique ou de configuration (infrastructure, refactoring, scripts)",
              "PANDA-T-08 : Configurer Laravel Reverb pour le broadcast WebSocket"],
             ["Bug",
              "PANDA-B-*",
              "Anomalie identifiée lors des tests ou de la revue de sprint",
              "PANDA-B-03 : Double débit du séquestre en cas de rechargement rapide"],
             ["Spike",
              "PANDA-S-*",
              "Investigation technique pour évaluer une approche avant l'implémentation",
              "PANDA-S-01 : Évaluer Ollama vs. OpenAI API pour l'assistant IA"]],
            caption="Types de tickets Jira et exemples du projet Panda",
            widths=[0.16, 0.17, 0.40, 0.27]),

        H3("5", "Tableau de bord Jira — métriques finales du projet"),
        P("Le tableau de bord Jira compile les indicateurs de pilotage utilisés lors des "
          "rétrospectives pour ajuster la planification et mesurer la qualité du livrable."),
        TBL(["Indicateur", "Valeur", "Interprétation"],
            [["Tickets créés (total)", "148",
              "Backlog complet couvrant les 57 pages et tous les services back-end"],
             ["Tickets livrés (TERMINÉ + FERMÉ)", "141",
              "Taux d'achèvement de 95,3 % sur le périmètre planifié"],
             ["Tickets restants (A FAIRE)", "7",
              "Améliorations prévues post-lancement : mode sombre, export Excel, "
              "notifications push mobile"],
             ["Story Points planifiés", "390",
              "Estimation initiale cumulée sur les 6 sprints"],
             ["Story Points livrés", "359",
              "Vélocité cumulée réelle — écart de 8 % par rapport à l'estimation"],
             ["Bugs identifiés", "14",
              "Tous résolus avant la livraison finale (PANDA-B-01 à PANDA-B-14)"],
             ["Bugs en production (post-deploy)", "0",
              "Aucun bug bloquant détecté après déploiement Docker"],
             ["Vélocité moyenne", "59,8 pts/sprint",
              "Progression de 34 pts (Sprint 1) à 62 pts (Sprint 6)"],
             ["Couverture de tests", "100 % des critères d'acceptation",
              "114 tests PHPUnit verts, 0 test en échec à la livraison"]],
            caption="Métriques finales du tableau de bord Jira — projet Panda",
            widths=[0.35, 0.14, 0.51]),
        P("Ces métriques témoignent d'une gestion de projet rigoureuse. Le taux "
          "d'achèvement de 95,3 % illustre la capacité à livrer la quasi-totalité du "
          "périmètre défini dans les délais impartis de douze semaines. La progression "
          "constante de la vélocité (de 34 à 62 points par sprint) reflète la montée en "
          "compétence et la consolidation de l'architecture au fil des itérations. "
          "Les 7 tickets restants correspondent à des améliorations de confort planifiées "
          "pour la version 1.1 (notifications push, mode sombre, export Excel des rapports) "
          "qui ne bloquent pas la livraison du projet de fin d'études."),

        H2("XI", "Conclusion du chapitre"),
        P("Ce chapitre a illustré la réalisation de Panda, de l'organisation du code aux interfaces, en "
          "passant par les briques techniques les plus exigeantes. Le moteur financier, la sécurité, le "
          "temps réel, l'intégration de Stripe et l'IA ont été présentés à travers des extraits de code "
          "représentatifs. La gestion du code source sur GitHub (247 commits, 5 branches, pipeline CI) "
          "et la conduite Scrum sur Jira (6 sprints, 141 tickets livrés, 95,3 % d'achèvement) témoignent "
          "d'une démarche professionnelle rigoureuse. La plateforme obtenue est fonctionnelle, cohérente "
          "et fidèle à la conception. Le chapitre suivant aborde la **validation** de ce travail : "
          "tests, sécurité et déploiement."),
    ]
