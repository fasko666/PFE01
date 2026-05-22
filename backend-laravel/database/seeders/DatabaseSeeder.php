<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Skill;
use App\Models\JobPosting;
use App\Models\FreelancerProfile;
use App\Models\ClientProfile;
use App\Models\Wallet;
use App\Models\Subscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Categories ────────────────────────────────────────────────────────
        $catData = [
            ['name' => 'Development & IT',      'slug' => 'development-it',  'icon' => 'code',   'sort_order' => 0],
            ['name' => 'Design & Creative',     'slug' => 'design-creative', 'icon' => 'design', 'sort_order' => 1],
            ['name' => 'AI & Machine Learning', 'slug' => 'ai-ml',           'icon' => 'ai',     'sort_order' => 2],
            ['name' => 'Writing & Translation', 'slug' => 'writing',         'icon' => 'write',  'sort_order' => 3],
            ['name' => 'Sales & Marketing',     'slug' => 'sales-marketing', 'icon' => 'chart',  'sort_order' => 4],
            ['name' => 'Mobile Development',    'slug' => 'mobile-dev',      'icon' => 'mobile', 'sort_order' => 5],
        ];
        foreach ($catData as $c) {
            Category::create(array_merge($c, ['is_active' => true]));
        }

        $devCat    = Category::where('slug', 'development-it')->first()->id;
        $designCat = Category::where('slug', 'design-creative')->first()->id;
        $aiCat     = Category::where('slug', 'ai-ml')->first()->id;
        $writeCat  = Category::where('slug', 'writing')->first()->id;
        $mktCat    = Category::where('slug', 'sales-marketing')->first()->id;
        $mobCat    = Category::where('slug', 'mobile-dev')->first()->id;

        // ── Skills ────────────────────────────────────────────────────────────
        $skillNames = [
            'PHP','Laravel','React','Vue.js','Node.js','Python','JavaScript','TypeScript',
            'MySQL','PostgreSQL','Docker','AWS','Figma','UI Design','UX Design','Branding',
            'Machine Learning','TensorFlow','NLP','Data Science','React Native','Flutter',
            'GraphQL','Redis','Kubernetes','Go','Rust','Swift','Kotlin','Unity',
            'SEO','Content Writing','Copywriting','Email Marketing','Google Ads',
        ];
        foreach ($skillNames as $s) {
            Skill::create(['name' => $s, 'slug' => Str::slug($s), 'category_id' => $devCat, 'is_active' => true]);
        }

        // ── Admin ─────────────────────────────────────────────────────────────
        $admin = User::create([
            'name' => 'Admin FreeNest', 'username' => 'admin',
            'email' => 'admin@freenest.io', 'password' => Hash::make('password'),
            'role' => 'admin', 'is_verified' => true, 'is_active' => true,
            'avatar' => 'https://randomuser.me/api/portraits/men/0.jpg',
        ]);
        Wallet::create(['user_id' => $admin->id]);
        Subscription::create(['user_id' => $admin->id, 'plan' => 'enterprise', 'connects_balance' => 9999]);

        // ── Freelancers ───────────────────────────────────────────────────────
        $freelancers = [
            [
                'name' => 'Alex Johnson',       'username' => 'alex_johnson',
                'email' => 'alex@freenest.io',  'country' => 'US',
                'avatar' => 'https://randomuser.me/api/portraits/men/11.jpg',
                'title' => 'Senior Full-Stack Developer (Laravel & React)',
                'bio'   => 'Senior full-stack developer with 7+ years building scalable SaaS platforms. Specialist in Laravel APIs and React frontends. Delivered 50+ projects across fintech and e-commerce.',
                'rate'  => 85, 'level' => 'expert', 'rating' => 4.9, 'jobs' => 58, 'top' => true,
                'skills' => ['Laravel','React','MySQL','Docker','TypeScript'],
            ],
            [
                'name' => 'Sofia Martinez',     'username' => 'sofia_design',
                'email' => 'sofia@freenest.io', 'country' => 'ES',
                'avatar' => 'https://randomuser.me/api/portraits/women/21.jpg',
                'title' => 'UI/UX Designer & Brand Identity Specialist',
                'bio'   => 'Award-winning designer crafting user-centric digital experiences. I turn complex problems into elegant interfaces. Worked with startups and Fortune 500 companies.',
                'rate'  => 65, 'level' => 'expert', 'rating' => 4.95, 'jobs' => 44, 'top' => true,
                'skills' => ['Figma','UI Design','UX Design','Branding'],
            ],
            [
                'name' => 'Karim Tahiri',       'username' => 'karim_ai',
                'email' => 'karim@freenest.io', 'country' => 'MA',
                'avatar' => 'https://randomuser.me/api/portraits/men/32.jpg',
                'title' => 'AI/ML Engineer & Data Scientist',
                'bio'   => 'Machine learning engineer specializing in NLP, computer vision, and production AI deployments. 5+ years of research and industry experience.',
                'rate'  => 90, 'level' => 'expert', 'rating' => 4.95, 'jobs' => 27, 'top' => true,
                'skills' => ['Python','Machine Learning','TensorFlow','NLP','Data Science'],
            ],
            [
                'name' => 'Lena Fischer',        'username' => 'lena_dev',
                'email' => 'lena@freenest.io',  'country' => 'DE',
                'avatar' => 'https://randomuser.me/api/portraits/women/44.jpg',
                'title' => 'Backend & Cloud Infrastructure Engineer',
                'bio'   => 'DevOps engineer and backend specialist. Expert in Kubernetes, AWS, CI/CD pipelines, and microservices architecture. Passionate about performance and reliability.',
                'rate'  => 80, 'level' => 'expert', 'rating' => 4.85, 'jobs' => 36, 'top' => true,
                'skills' => ['Node.js','Docker','AWS','PostgreSQL','Kubernetes'],
            ],
            [
                'name' => 'James Okafor',        'username' => 'james_mobile',
                'email' => 'james@freenest.io', 'country' => 'NG',
                'avatar' => 'https://randomuser.me/api/portraits/men/55.jpg',
                'title' => 'React Native & Flutter Mobile Developer',
                'bio'   => 'Mobile developer with 4+ years shipping cross-platform apps. Built apps with 500k+ downloads. Strong focus on smooth animations and native-like performance.',
                'rate'  => 60, 'level' => 'intermediate', 'rating' => 4.8, 'jobs' => 29, 'top' => false,
                'skills' => ['React Native','Flutter','JavaScript','TypeScript'],
            ],
            [
                'name' => 'Amira Hassan',        'username' => 'amira_write',
                'email' => 'amira@freenest.io', 'country' => 'EG',
                'avatar' => 'https://randomuser.me/api/portraits/women/62.jpg',
                'title' => 'Technical Writer & Content Strategist',
                'bio'   => 'Technical writer and content strategist with deep experience in SaaS documentation, blog content, and developer guides. Fluent in English, Arabic, and French.',
                'rate'  => 45, 'level' => 'expert', 'rating' => 4.9, 'jobs' => 61, 'top' => true,
                'skills' => ['Content Writing','Copywriting','SEO'],
            ],
            [
                'name' => 'Lucas Dupont',        'username' => 'lucas_vue',
                'email' => 'lucas@freenest.io', 'country' => 'FR',
                'avatar' => 'https://randomuser.me/api/portraits/men/73.jpg',
                'title' => 'Vue.js & Nuxt.js Frontend Engineer',
                'bio'   => 'Frontend engineer passionate about building fast, accessible web apps with Vue 3 and Nuxt. 5+ years experience with component libraries and SSR.',
                'rate'  => 70, 'level' => 'expert', 'rating' => 4.7, 'jobs' => 33, 'top' => false,
                'skills' => ['Vue.js','JavaScript','TypeScript','GraphQL'],
            ],
            [
                'name' => 'Priya Sharma',        'username' => 'priya_ds',
                'email' => 'priya@freenest.io', 'country' => 'IN',
                'avatar' => 'https://randomuser.me/api/portraits/women/83.jpg',
                'title' => 'Data Scientist & Python Automation Expert',
                'bio'   => 'Data scientist with strong background in predictive modeling, data pipelines, and business intelligence. Experience at top tech companies in Bangalore and London.',
                'rate'  => 55, 'level' => 'expert', 'rating' => 4.88, 'jobs' => 41, 'top' => true,
                'skills' => ['Python','Data Science','Machine Learning','PostgreSQL'],
            ],
            [
                'name' => 'Omar Benali',         'username' => 'omar_go',
                'email' => 'omar@freenest.io',  'country' => 'DZ',
                'avatar' => 'https://randomuser.me/api/portraits/men/87.jpg',
                'title' => 'Go & Rust Systems Engineer',
                'bio'   => 'Systems engineer building high-performance backends with Go and Rust. Specialized in real-time APIs, WebSockets, and distributed systems.',
                'rate'  => 95, 'level' => 'expert', 'rating' => 4.92, 'jobs' => 19, 'top' => true,
                'skills' => ['Go','Rust','PostgreSQL','Redis','Docker'],
            ],
            [
                'name' => 'Emma Wilson',         'username' => 'emma_marketing',
                'email' => 'emma@freenest.io',  'country' => 'GB',
                'avatar' => 'https://randomuser.me/api/portraits/women/90.jpg',
                'title' => 'Digital Marketing & SEO Strategist',
                'bio'   => 'Performance marketer helping SaaS and e-commerce brands grow through data-driven SEO, paid ads, and conversion optimization. 300%+ average ROI across clients.',
                'rate'  => 50, 'level' => 'expert', 'rating' => 4.82, 'jobs' => 52, 'top' => false,
                'skills' => ['SEO','Google Ads','Email Marketing','Copywriting'],
            ],
        ];

        foreach ($freelancers as $f) {
            $u = User::create([
                'name' => $f['name'], 'username' => $f['username'], 'email' => $f['email'],
                'password' => Hash::make('password'), 'role' => 'freelancer',
                'country' => $f['country'], 'avatar' => $f['avatar'],
                'is_verified' => true, 'is_active' => true,
            ]);
            FreelancerProfile::create([
                'user_id' => $u->id, 'title' => $f['title'], 'bio' => $f['bio'],
                'hourly_rate' => $f['rate'], 'experience_level' => $f['level'],
                'avg_rating' => $f['rating'], 'total_jobs' => $f['jobs'],
                'total_earned' => $f['rate'] * $f['jobs'] * 8,
                'total_reviews' => $f['jobs'], 'success_rate' => rand(95, 100),
                'is_top_rated' => $f['top'], 'availability' => 'available',
            ]);
            Wallet::create(['user_id' => $u->id, 'balance' => $f['rate'] * $f['jobs'] * 2]);
            Subscription::create(['user_id' => $u->id, 'plan' => 'freelancer_plus', 'connects_balance' => 80]);
            $skills = Skill::whereIn('name', $f['skills'])->get();
            foreach ($skills as $sk) {
                $u->skills()->attach($sk->id, ['level' => 'expert']);
            }
        }

        // ── Clients ───────────────────────────────────────────────────────────
        $clients = [
            [
                'name' => 'Nathan Rivera',       'username' => 'nathan_tech',
                'email' => 'client1@freenest.io','country' => 'US',
                'avatar' => 'https://randomuser.me/api/portraits/men/15.jpg',
                'company' => 'NovaTech Solutions', 'industry' => 'Technology',
                'balance' => 12000, 'jobs_posted' => 14, 'total_spent' => 45000,
            ],
            [
                'name' => 'Claire Dubois',       'username' => 'claire_startup',
                'email' => 'client2@freenest.io','country' => 'FR',
                'avatar' => 'https://randomuser.me/api/portraits/women/28.jpg',
                'company' => 'Bloom Digital Agency', 'industry' => 'Marketing',
                'balance' => 7500, 'jobs_posted' => 9, 'total_spent' => 28000,
            ],
            [
                'name' => 'Mohammed Al-Rashid',  'username' => 'mohammed_biz',
                'email' => 'client3@freenest.io','country' => 'AE',
                'avatar' => 'https://randomuser.me/api/portraits/men/38.jpg',
                'company' => 'Gulf Ventures Group', 'industry' => 'Finance',
                'balance' => 25000, 'jobs_posted' => 21, 'total_spent' => 92000,
            ],
            [
                'name' => 'Yuki Tanaka',         'username' => 'yuki_games',
                'email' => 'client4@freenest.io','country' => 'JP',
                'avatar' => 'https://randomuser.me/api/portraits/women/47.jpg',
                'company' => 'Pixel Dreams Studio', 'industry' => 'Gaming',
                'balance' => 15000, 'jobs_posted' => 11, 'total_spent' => 38000,
            ],
            [
                'name' => 'David Osei',          'username' => 'david_health',
                'email' => 'client5@freenest.io','country' => 'GH',
                'avatar' => 'https://randomuser.me/api/portraits/men/58.jpg',
                'company' => 'HealthBridge Africa', 'industry' => 'Healthcare',
                'balance' => 5000, 'jobs_posted' => 6, 'total_spent' => 18000,
            ],
            [
                'name' => 'Isabella Conti',      'username' => 'isabella_ecom',
                'email' => 'client6@freenest.io','country' => 'IT',
                'avatar' => 'https://randomuser.me/api/portraits/women/67.jpg',
                'company' => 'Luxe Commerce SRL', 'industry' => 'E-Commerce',
                'balance' => 9000, 'jobs_posted' => 8, 'total_spent' => 31000,
            ],
        ];

        $clientUsers = [];
        foreach ($clients as $c) {
            $u = User::create([
                'name' => $c['name'], 'username' => $c['username'], 'email' => $c['email'],
                'password' => Hash::make('password'), 'role' => 'client',
                'country' => $c['country'], 'avatar' => $c['avatar'],
                'is_verified' => true, 'is_active' => true,
            ]);
            ClientProfile::create([
                'user_id' => $u->id, 'company_name' => $c['company'],
                'industry' => $c['industry'], 'payment_verified' => true,
                'total_jobs_posted' => $c['jobs_posted'],
                'total_spent' => $c['total_spent'],
                'avg_rating' => round(4.5 + mt_rand(0, 5) / 10, 1),
                'total_reviews' => $c['jobs_posted'],
            ]);
            Wallet::create(['user_id' => $u->id, 'balance' => $c['balance']]);
            Subscription::create(['user_id' => $u->id, 'plan' => 'business', 'connects_balance' => 0]);
            $clientUsers[] = $u;
        }

        // ── Jobs ──────────────────────────────────────────────────────────────
        $jobs = [
            // Development
            [
                'client' => 0, 'cat' => $devCat, 'status' => 'open',
                'title' => 'Build a SaaS Dashboard with Laravel & React',
                'type' => 'fixed', 'min' => 2000, 'max' => 5000, 'level' => 'expert',
                'skills' => ['Laravel','React','MySQL','TypeScript'],
                'desc' => 'We need a senior full-stack developer to build a modern SaaS analytics dashboard. Features: user auth, role-based access, real-time charts, REST API, and a clean TailwindCSS UI. Laravel 12 + React 18.',
            ],
            [
                'client' => 0, 'cat' => $devCat, 'status' => 'open',
                'title' => 'E-Commerce Platform with Laravel & Vue.js',
                'type' => 'fixed', 'min' => 1500, 'max' => 4000, 'level' => 'intermediate',
                'skills' => ['PHP','Laravel','Vue.js','MySQL'],
                'desc' => 'Building a full e-commerce platform: product catalog, cart, Stripe checkout, order management, and admin panel. Must have proven Laravel 10+ and Vue 3 experience.',
            ],
            [
                'client' => 0, 'cat' => $devCat, 'status' => 'in_progress',
                'title' => 'RESTful API Development for Fintech App',
                'type' => 'hourly', 'min' => 60, 'max' => 100, 'level' => 'expert',
                'skills' => ['Node.js','PostgreSQL','Docker','TypeScript'],
                'desc' => 'Need an experienced backend developer to design and implement a secure RESTful API for a fintech application. JWT auth, rate limiting, webhook handling, and full Swagger documentation required.',
            ],
            // Mobile
            [
                'client' => 1, 'cat' => $mobCat, 'status' => 'open',
                'title' => 'React Native Shopping App (iOS & Android)',
                'type' => 'fixed', 'min' => 3000, 'max' => 8000, 'level' => 'expert',
                'skills' => ['React Native','JavaScript','TypeScript'],
                'desc' => 'Building a polished cross-platform shopping app with product listings, cart, push notifications, Stripe payments, and smooth animations. 100k+ target users on day one.',
            ],
            [
                'client' => 3, 'cat' => $mobCat, 'status' => 'open',
                'title' => 'Flutter Game Companion App',
                'type' => 'fixed', 'min' => 2500, 'max' => 6000, 'level' => 'expert',
                'skills' => ['Flutter','Kotlin','Swift'],
                'desc' => 'We need a Flutter developer to build a companion mobile app for our mobile game. Features: leaderboard, achievements, in-app purchases, real-time chat, and push notifications.',
            ],
            // AI/ML
            [
                'client' => 2, 'cat' => $aiCat, 'status' => 'open',
                'title' => 'Customer Churn Prediction ML Model',
                'type' => 'hourly', 'min' => 70, 'max' => 110, 'level' => 'expert',
                'skills' => ['Python','Machine Learning','Data Science'],
                'desc' => 'Build a machine learning model to predict customer churn from historical data. Deliver a production-ready Python API endpoint with model documentation and performance metrics.',
            ],
            [
                'client' => 2, 'cat' => $aiCat, 'status' => 'open',
                'title' => 'NLP Chatbot for Customer Support Automation',
                'type' => 'fixed', 'min' => 2000, 'max' => 5000, 'level' => 'expert',
                'skills' => ['NLP','Python','TensorFlow'],
                'desc' => 'AI-powered chatbot for customer support. Must handle FAQs, classify intent, escalate to humans, and integrate with our helpdesk. Rasa, LangChain, or OpenAI experience preferred.',
            ],
            [
                'client' => 4, 'cat' => $aiCat, 'status' => 'open',
                'title' => 'Medical Image Analysis with Computer Vision',
                'type' => 'fixed', 'min' => 4000, 'max' => 10000, 'level' => 'expert',
                'skills' => ['Python','TensorFlow','Machine Learning'],
                'desc' => 'We need a CV specialist to build a model that detects abnormalities in medical X-ray images. FDA-compliance awareness is a plus. Must deliver validated model with >90% accuracy.',
            ],
            // Design
            [
                'client' => 1, 'cat' => $designCat, 'status' => 'open',
                'title' => 'Brand Identity & Logo Design for Marketing Agency',
                'type' => 'fixed', 'min' => 800, 'max' => 2000, 'level' => 'intermediate',
                'skills' => ['Branding','Figma','UI Design'],
                'desc' => 'Looking for a talented brand designer to create a complete brand identity: logo, color palette, typography, business cards, and brand guidelines document. Creative portfolio required.',
            ],
            [
                'client' => 5, 'cat' => $designCat, 'status' => 'open',
                'title' => 'UX Redesign for Luxury E-Commerce Website',
                'type' => 'fixed', 'min' => 1500, 'max' => 4000, 'level' => 'expert',
                'skills' => ['UX Design','Figma','UI Design'],
                'desc' => 'Full UX audit and redesign of our luxury e-commerce site. Deliverables: user research report, wireframes, hi-fi Figma prototype, and design system. Experience with high-end brands preferred.',
            ],
            // Writing
            [
                'client' => 1, 'cat' => $writeCat, 'status' => 'open',
                'title' => 'SaaS Blog Content — 8 Technical Articles/Month',
                'type' => 'hourly', 'min' => 35, 'max' => 60, 'level' => 'intermediate',
                'skills' => ['Content Writing','SEO','Copywriting'],
                'desc' => 'We need a skilled technical writer to produce 8 in-depth blog articles per month covering SaaS, cloud, and developer topics. SEO-optimized, audience: CTOs and developers.',
            ],
            [
                'client' => 4, 'cat' => $writeCat, 'status' => 'open',
                'title' => 'Healthcare App — User Documentation & Help Center',
                'type' => 'fixed', 'min' => 600, 'max' => 1500, 'level' => 'intermediate',
                'skills' => ['Content Writing','Copywriting'],
                'desc' => 'Create complete user documentation, FAQ, and help center content for our healthcare mobile app. Clear, empathetic writing style required. Medical writing experience is a plus.',
            ],
            // Marketing
            [
                'client' => 2, 'cat' => $mktCat, 'status' => 'open',
                'title' => 'Google Ads & SEO Campaign for B2B SaaS',
                'type' => 'hourly', 'min' => 50, 'max' => 90, 'level' => 'expert',
                'skills' => ['Google Ads','SEO','Email Marketing'],
                'desc' => 'Performance marketer needed to manage Google Ads campaigns and SEO strategy for our B2B SaaS. Target: $5 CPA on demo requests. Experience with HubSpot and Salesforce preferred.',
            ],
            [
                'client' => 5, 'cat' => $mktCat, 'status' => 'open',
                'title' => 'Email Marketing Automation — Klaviyo Setup',
                'type' => 'fixed', 'min' => 500, 'max' => 1200, 'level' => 'intermediate',
                'skills' => ['Email Marketing','Copywriting'],
                'desc' => 'Set up full Klaviyo email automation flows for our e-commerce store: welcome series, abandoned cart, post-purchase, winback. Write all email copy and design templates.',
            ],
            // Infrastructure
            [
                'client' => 0, 'cat' => $devCat, 'status' => 'open',
                'title' => 'Kubernetes Cluster Setup & CI/CD Pipeline',
                'type' => 'fixed', 'min' => 1000, 'max' => 3000, 'level' => 'expert',
                'skills' => ['Kubernetes','Docker','AWS'],
                'desc' => 'Set up production-grade Kubernetes cluster on AWS EKS with Helm charts, auto-scaling, monitoring (Grafana/Prometheus), and GitHub Actions CI/CD. Must deliver full documentation.',
            ],
        ];

        foreach ($jobs as $j) {
            $client = $clientUsers[$j['client']];
            JobPosting::create([
                'client_id'       => $client->id,
                'title'           => $j['title'],
                'description'     => $j['desc'],
                'category_id'     => $j['cat'],
                'skills'          => $j['skills'],
                'type'            => $j['type'],
                'experience_level'=> $j['level'],
                'budget_min'      => $j['min'],
                'budget_max'      => $j['max'],
                'status'          => $j['status'],
                'visibility'      => 'public',
                'proposals_count' => rand(2, 30),
                'views_count'     => rand(40, 800),
            ]);
        }

        $this->command->info('');
        $this->command->info('✅ FreeNest seeded successfully! (password: password)');
        $this->command->info('');
        $this->command->info('  Admin     → admin@freenest.io');
        $this->command->info('  Clients   → client1@freenest.io … client6@freenest.io');
        $this->command->info('  Freelancers → alex / sofia / karim / lena / james / amira / lucas / priya / omar / emma @freenest.io');
        $this->command->info('');
    }
}
