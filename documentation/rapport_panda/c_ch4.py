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

        H2("VIII", "Présentation des interfaces"),
        P("Cette section parcourt les principales interfaces de Panda, conçues avec React et TailwindCSS "
          "dans un souci de clarté, de cohérence et de responsivité. *(Les captures présentées sont des "
          "maquettes fidèles de l'application.)*"),

        H3("1", "Page d'accueil et pages publiques"),
        P("La page d'accueil présente la proposition de valeur de la plateforme, oriente le visiteur vers "
          "les deux parcours (trouver un talent / trouver une mission) et met en avant les garanties de "
          "sécurité. Des pages publiques (tarifs, entreprises, ressources) complètent la vitrine."),
        FIG("ui_landing", "Page d'accueil de la plateforme Panda"),
        P("Cette page met en avant :"),
        B(["une **barre de recherche** orientant immédiatement vers les offres ou les talents ;",
           "des **indicateurs de confiance** (nombre de freelances, taux de satisfaction, paiement sécurisé) ;",
           "une présentation des **catégories** de compétences les plus demandées ;",
           "des appels à l'action clairs (« Trouver un talent », « Trouver une mission ») ;",
           "un **pied de page** riche : ressources, tarifs, entreprises, mentions légales."]),

        H3("2", "Authentification et inscription"),
        P("Les écrans d'authentification proposent la connexion classique, la connexion via Google et la "
          "création de compte avec choix du rôle (client ou freelance). La 2FA et la vérification "
          "d'identité renforcent ensuite la sécurité du compte."),
        FIG("ui_login", "Écran de connexion (e-mail/mot de passe et OAuth Google)"),
        FIG("ui_register", "Écran d'inscription avec choix du rôle"),
        P("Le parcours d'authentification intègre :"),
        B(["la **connexion** par e-mail/mot de passe avec validation et messages d'erreur explicites ;",
           "la **connexion sociale** via Google (OAuth) en un clic ;",
           "l'**inscription** avec choix du rôle (client ou freelance) et confirmation du mot de passe ;",
           "la **réinitialisation** du mot de passe par e-mail ;",
           "l'activation de la **2FA** et la **vérification d'identité** depuis les paramètres du compte."]),

        H3("3", "Tableaux de bord"),
        P("Chaque rôle dispose d'un tableau de bord adapté, synthétisant les indicateurs clés et donnant "
          "accès aux actions courantes. Le client suit ses offres, contrats et dépenses ; le freelance "
          "suit ses missions, gains et propositions ; l'administrateur pilote la plateforme."),
        FIG("ui_client", "Tableau de bord du client"),
        FIG("ui_freelancer", "Tableau de bord du freelance"),
        FIG("ui_admin", "Tableau de bord de l'administrateur"),
        P("Les indicateurs et actions diffèrent selon le rôle :"),
        B(["**Client** : solde, fonds en séquestre, contrats actifs, offres publiées et propositions reçues ;",
           "**Freelance** : gains, propositions envoyées, contrats en cours, note moyenne et missions livrées ;",
           "**Administrateur** : utilisateurs, transactions, retraits en attente, files de modération et "
           "de vérification d'identité, indicateurs financiers de la plateforme."]),

        H3("4", "Offres et propositions"),
        P("La place de marché des offres permet de rechercher et de filtrer les missions par catégorie, "
          "budget et compétences. Le client publie une offre via un formulaire validé ; le freelance "
          "consulte le détail et soumet une proposition, éventuellement assistée par l'IA."),
        FIG("ui_jobs", "Place de marché des offres"),
        B(["**recherche plein-texte** et filtres (catégorie, budget, type, compétences) ;",
           "affichage des offres sous forme de **cartes** synthétiques avec statut ;",
           "page de **détail** présentant la mission, le budget et les propositions ;",
           "**enregistrement** d'une offre en favori pour y revenir plus tard ;",
           "soumission d'une **proposition**, avec assistance optionnelle de l'IA."]),

        H3("5", "Freelances et profils"),
        P("La place de marché des talents met en valeur les profils des freelances : compétences, "
          "portfolio, évaluations et tarifs. Le client peut enregistrer ses favoris et constituer des "
          "listes de talents pour ses futurs projets."),
        FIG("ui_talent", "Place de marché des freelances"),
        B(["fiches freelances avec **photo, titre, compétences, tarif** et note moyenne ;",
           "filtres par **compétence**, disponibilité et fourchette de tarif ;",
           "page de **profil détaillé** : biographie, portfolio, évaluations reçues ;",
           "ajout aux **favoris** et constitution de **listes de talents** nommées ;",
           "lancement direct d'une **conversation** ou d'une proposition de contrat."]),

        H3("6", "Contrats et jalons"),
        P("La page de détail d'un contrat centralise l'ensemble de la collaboration : jalons, fichiers "
          "versionnés, suivi du temps, demandes d'extension, fil d'activité, analyse et messagerie "
          "contextuelle. Le client finance le séquestre et valide les jalons ; le freelance livre son "
          "travail."),
        FIG("ui_contract", "Détail d'un contrat — jalons, fichiers et suivi du temps"),
        P("La page de contrat s'organise en onglets :"),
        B(["**Jalons** : création, soumission, validation/rejet, suivi de l'avancement ;",
           "**Fichiers** : dépôt, versionnement et téléchargement des livrables ;",
           "**Temps** : chronomètre de suivi et récapitulatif hebdomadaire (contrats horaires) ;",
           "**Extensions** : demande et réponse de prolongation de délai ;",
           "**Activité** : journal chronologique des événements du contrat ;",
           "**Analyse** et **messagerie** contextuelle, plus génération du **PDF** du contrat."]),

        H3("7", "Paiements et portefeuille"),
        P("L'espace de paiement présente le portefeuille (solde disponible, en séquestre, en attente), "
          "l'historique des transactions, le dépôt de fonds via Stripe et la demande de retrait. Chaque "
          "mouvement est tracé et réconciliable."),
        FIG("ui_payments", "Portefeuille et gestion des paiements"),
        B(["trois soldes distincts : **disponible**, **en séquestre** et **en attente** ;",
           "**dépôt** de fonds via Stripe Checkout et **retrait** vers Stripe Connect ;",
           "**historique** détaillé et filtrable de toutes les transactions ;",
           "suivi de l'état des **retraits** (en attente, approuvé, complété, rejeté) ;",
           "factures hebdomadaires pour les **contrats horaires** et les abonnements."]),

        H3("8", "Messagerie"),
        P("La messagerie temps réel relie clients et freelances autour des offres et des contrats. Elle "
          "affiche l'état de présence, les accusés de lecture et les réactions, et autorise le partage de "
          "pièces jointes."),
        FIG("ui_chat", "Messagerie temps réel"),
        B(["liste des **conversations** triées par activité récente ;",
           "**indicateur de saisie** (« en train d'écrire ») et statut de présence ;",
           "**accusés** de réception et de lecture des messages ;",
           "**réactions**, édition et suppression des messages ;",
           "partage de **pièces jointes** et conversations liées aux offres et contrats."]),

        H3("9", "Assistant IA"),
        P("L'assistant IA accompagne l'utilisateur : rédaction de propositions, mise en correspondance "
          "entre une offre et les profils les plus pertinents, et analyse de profil. Il accélère les "
          "tâches répétitives tout en laissant l'utilisateur maître du résultat final."),
        FIG("ui_ai", "Assistant d'intelligence artificielle"),
        B(["**génération de proposition** à partir d'une offre et du profil du freelance ;",
           "**mise en correspondance** d'une offre avec les freelances les plus pertinents ;",
           "**analyse de profil** et suggestions d'amélioration ;",
           "**recherche intelligente** en langage naturel ;",
           "**assistant conversationnel** pour guider l'utilisateur ；historisation des échanges."]),

        H3("10", "Design responsive et expérience utilisateur"),
        P("Une attention constante a été portée à l'**expérience utilisateur**. Construites avec "
          "TailwindCSS, toutes les interfaces sont **responsives** et s'adaptent harmonieusement au "
          "téléphone, à la tablette et à l'ordinateur. Au-delà de l'adaptabilité, plusieurs principes ont "
          "guidé la conception de l'interface :"),
        B(["**Cohérence visuelle** : une charte graphique unifiée (couleurs, typographie, composants) ;",
           "**Retours immédiats** : notifications *toast*, états de chargement et messages d'erreur clairs ;",
           "**Navigation intuitive** : barre de navigation, menu latéral contextuel et fil d'Ariane ;",
           "**Animations mesurées** (Framer Motion) renforçant la lisibilité sans distraire ;",
           "**Visualisation de données** (Recharts) pour les tableaux de bord et les statistiques ;",
           "**Accessibilité** : contrastes suffisants, navigation au clavier et libellés explicites."]),
        P("Ce soin apporté à l'interface est déterminant : sur une place de marché, la qualité de "
          "l'expérience conditionne directement la confiance et l'engagement des utilisateurs."),

        H2("IX", "Conclusion du chapitre"),
        P("Ce chapitre a illustré la réalisation de Panda, de l'organisation du code aux interfaces, en "
          "passant par les briques techniques les plus exigeantes. Le moteur financier, la sécurité, le "
          "temps réel, l'intégration de Stripe et l'IA ont été présentés à travers des extraits de code "
          "représentatifs. La plateforme obtenue est fonctionnelle, cohérente et fidèle à la conception. "
          "Le chapitre suivant aborde la **validation** de ce travail : tests, sécurité et déploiement."),
    ]
