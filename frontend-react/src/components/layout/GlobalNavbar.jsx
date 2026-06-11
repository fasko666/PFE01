import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, ChevronDown, LogOut, Settings,
  UserCircle2, User, TrendingUp, Zap,
  ShieldCheck, BadgeCheck, Sun, Moon, Monitor,
  Menu, X, Search as SearchIcon, ExternalLink,
} from 'lucide-react';
import PandaLogo from '../ui/PandaLogo';
import NotificationPanel from '../ui/NotificationPanel';
import UserAvatar from '../ui/UserAvatar';
import NavSearch from '../ui/NavSearch';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import useThemeStore from '../../store/themeStore';
import toast from 'react-hot-toast';

/* ── Animation presets ─────────────────────────────────── */
const DD = {
  initial:    { opacity: 0, y: 6, scale: 0.98 },
  animate:    { opacity: 1, y: 0, scale: 1 },
  exit:       { opacity: 0, y: 6, scale: 0.98 },
  transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
};

/* ── Dropdown data ─────────────────────────────────────── */
const HIRE_TALENT = [
  {
    heading: 'Manage jobs and offers',
    headingStyle: 'bold',
    items: [
      { label: 'Job posts and proposals', href: '/my-jobs' },
      { label: 'Pending offers',          href: '/my-jobs' },
    ],
  },
  {
    heading: 'Find freelancers',
    headingStyle: 'label',
    items: [
      { label: 'Post a job',          href: '/jobs/post' },
      { label: 'Search for talent',   href: '/freelancers' },
      { label: "Talent you've hired", href: '/freelancers' },
      { label: "Talent you've saved", href: '/freelancers' },
      { label: 'Direct contracts',    href: '/my-jobs' },
    ],
  },
];

const FIND_WORK = [
  {
    heading: null,
    items: [
      { label: 'Find work',            href: '/search?type=jobs' },
      { label: 'Saved jobs',           href: '/jobs/saved' },
      { label: 'Proposals and offers', href: '/my-proposals' },
    ],
  },
  {
    heading: 'Reach more clients',
    headingStyle: 'label',
    items: [
      { label: 'Your services',    href: '/freelancer/profile' },
      { label: 'Promote with ads', href: '/settings', external: true },
      { label: 'Direct contracts', href: '/contracts' },
    ],
  },
];

const DELIVER_WORK = [
  {
    heading: null,
    items: [
      { label: 'Your active contracts', href: '/contracts?tab=active'    },
      { label: 'Contract history',      href: '/contracts?tab=completed' },
      { label: 'Hourly work diary',     href: '/my-jobs'                 },
    ],
  },
];

const MANAGE_FINANCES = [
  {
    heading: null,
    items: [
      { label: 'Financial overview',      href: '/payments' },
      { label: 'Your reports',            href: '/reports' },
      { label: 'Billings and earnings',   href: '/payments' },
      { label: 'Transactions',            href: '/payments' },
      { label: 'Certificate of earnings', href: '/payments', external: true },
    ],
  },
  {
    heading: 'Payments',
    headingStyle: 'label',
    items: [
      { label: 'Withdraw earnings', href: '/payments' },
    ],
  },
  {
    heading: 'Taxes',
    headingStyle: 'label',
    items: [
      { label: 'Tax forms',       href: '/payments' },
      { label: 'Tax information', href: '/payments' },
    ],
  },
];

const MANAGE_WORK = [
  {
    heading: 'Active and past work',
    items: [
      { label: 'Your contracts',           href: '/contracts' },
      { label: 'Hourly contract activity', href: '/contracts' },
    ],
  },
  {
    heading: null,
    items: [
      { label: 'Timesheets',         href: '/my-jobs' },
      { label: 'Time by freelancer', href: '/reports' },
      { label: 'Work diaries',       href: '/my-jobs' },
      { label: 'Custom export',      href: '/reports' },
    ],
  },
];

const REPORTS = [
  { label: 'Weekly financial summary', href: '/reports' },
  { label: 'Transaction history',      href: '/payments' },
  { label: 'Spending by activity',     href: '/reports' },
];

const TALENT_CATS = [
  {
    id: 'dev', label: 'Development & IT',
    items: [
      { label: 'Full Stack Developers', desc: 'End-to-end web development',   href: '/find-talent/full-stack-developers' },
      { label: 'React Developers',      desc: 'React, Vue, Angular experts',  href: '/find-talent/react-developers' },
      { label: 'Backend Developers',    desc: 'APIs, databases, server-side', href: '/find-talent/full-stack-developers' },
      { label: 'Mobile Developers',     desc: 'iOS, Android, React Native',   href: '/find-talent/full-stack-developers' },
    ],
  },
  {
    id: 'ai', label: 'AI & Machine Learning',
    items: [
      { label: 'AI Video Creators',  desc: 'Veo, Sora, Kling, Runway',       href: '/find-talent/ai-video-creators' },
      { label: 'Chatbot Developers', desc: 'AI for support and sales',       href: '/find-talent/chatbot-developers' },
      { label: 'AI Developers',      desc: 'Custom AI apps and features',    href: '/find-talent/chatbot-developers' },
      { label: 'Automation Experts', desc: 'Streamline business processes',  href: '/find-talent/chatbot-developers' },
    ],
  },
  {
    id: 'design', label: 'Design & Creative',
    items: [
      { label: 'UI/UX Designers',   desc: 'User-centered interface design', href: '/find-talent/ui-ux-designers' },
      { label: 'Logo Designers',    desc: 'Brand identity and marks',       href: '/find-talent/logo-designers' },
      { label: 'Graphic Designers', desc: 'Logos, branding, print',         href: '/find-talent/logo-designers' },
    ],
  },
  {
    id: 'marketing', label: 'Marketing',
    items: [
      { label: 'SEO Experts',       desc: 'Search engine optimization', href: '/find-talent/seo-experts' },
      { label: 'Digital Marketing', desc: 'Full-funnel strategy',       href: '/find-talent/seo-experts' },
      { label: 'Social Media',      desc: 'Content and community',      href: '/find-talent/seo-experts' },
    ],
  },
  {
    id: 'writing', label: 'Writing & Content',
    items: [
      { label: 'Content Writers', desc: 'Blog posts and articles', href: '/find-talent/content-writers' },
      { label: 'Copywriters',     desc: 'Compelling sales copy',   href: '/find-talent/content-writers' },
      { label: 'Translators',     desc: 'Multi-language content',  href: '/find-talent/content-writers' },
    ],
  },
];

/* ── Get outcomes mega-menu data ───────────────────────── */
const GET_OUTCOMES = {
  intro: {
    heading: 'Drive larger-scale work',
    sub: 'Build specialized teams for complex projects',
  },
  outcomes: [
    [
      { label: 'Build my website',              desc: 'Web design, development and more',          href: '/get-outcomes/build-website' },
      { label: 'Scale my paid ad campaigns',    desc: 'Growth marketing, media strategy and more', href: '/get-outcomes/scale-paid-ads' },
      { label: 'Handle customer support with AI', desc: 'Chatbots, AI agents, systems and more',   href: '/get-outcomes/handle-support' },
    ],
    [
      { label: 'Design my brand',       desc: 'Logo, brand identity and more',              href: '/get-outcomes' },
      { label: 'Automate my workflows', desc: 'Planning, integration, AI agents and more', href: '/get-outcomes' },
      { label: 'Build my sales pipeline',desc: 'Lead generation, AI outreach and more',    href: '/get-outcomes' },
    ],
  ],
};

/* ── Find work mega-menu data ─────────────────────────── */
const FIND_WORK_CATS = [
  {
    id: 'ai', label: 'AI & Automation',
    items: [
      { label: 'Artificial Intelligence', desc: 'Work on cutting-edge AI projects',     href: '/jobs/category/ai' },
      { label: 'AI Model Training',       desc: 'Label, train and fine-tune AI models',  href: '/jobs/category/ai-training' },
      { label: 'AI Content Creation',     desc: 'Write and edit AI-assisted content',    href: '/jobs/category/ai-content' },
      { label: 'AI Writing',              desc: 'Write with and about AI',                href: '/jobs/category/ai-writing' },
      { label: 'Chatbot',                 desc: 'Deploy conversational bots',             href: '/jobs/category/chatbot' },
      { label: 'AI Generated Video',      desc: 'Create generated video content',         href: '/jobs/category/ai-video' },
      { label: 'Prompt Engineering',      desc: 'Craft prompts for better AI outputs',    href: '/jobs/category/prompt' },
      { label: 'Generative AI',           desc: 'Build with generative AI tools',         href: '/jobs/category/generative-ai' },
      { label: 'Automation',              desc: 'Workflows that cut manual work',         href: '/jobs/category/automation' },
      { label: 'ChatGPT',                 desc: 'Projects using ChatGPT and OpenAI',      href: '/jobs/category/chatgpt' },
    ],
  },
  {
    id: 'dev', label: 'Development & IT',
    items: [
      { label: 'Full Stack Development', desc: 'End-to-end web development',     href: '/jobs?category=fullstack' },
      { label: 'Frontend Development',   desc: 'React, Vue, Angular projects',    href: '/jobs?category=frontend' },
      { label: 'Backend Development',    desc: 'APIs, databases, microservices', href: '/jobs?category=backend' },
      { label: 'Mobile Apps',            desc: 'iOS, Android, React Native',      href: '/jobs?category=mobile' },
      { label: 'DevOps & Cloud',         desc: 'AWS, GCP, Kubernetes, CI/CD',     href: '/jobs?category=devops' },
      { label: 'QA & Testing',           desc: 'Manual, automation, performance', href: '/jobs?category=qa' },
      { label: 'Data Engineering',       desc: 'Pipelines, warehouses, ETL',      href: '/jobs?category=data-eng' },
      { label: 'Cybersecurity',          desc: 'Pentest, security audits',        href: '/jobs?category=security' },
    ],
  },
  {
    id: 'marketing', label: 'Marketing',
    items: [
      { label: 'SEO',                    desc: 'On-page, technical, off-page',    href: '/jobs?category=seo' },
      { label: 'Paid Ads',               desc: 'Google, Meta, TikTok campaigns',  href: '/jobs?category=paid-ads' },
      { label: 'Social Media',           desc: 'Strategy, content, community',    href: '/jobs?category=social' },
      { label: 'Email Marketing',        desc: 'Campaigns, automations, flows',   href: '/jobs?category=email' },
      { label: 'Content Strategy',       desc: 'Editorial planning and growth',   href: '/jobs?category=content' },
      { label: 'Brand Marketing',        desc: 'Positioning and brand building',  href: '/jobs?category=brand' },
    ],
  },
  {
    id: 'design', label: 'Design & Creative',
    items: [
      { label: 'UI/UX Design',           desc: 'Product and interface design',    href: '/jobs?category=uiux' },
      { label: 'Logo & Branding',        desc: 'Logos and visual identity',       href: '/jobs?category=branding' },
      { label: 'Graphic Design',         desc: 'Print, social, illustrations',    href: '/jobs?category=graphic' },
      { label: 'Motion Graphics',        desc: 'After Effects, animations',        href: '/jobs?category=motion' },
      { label: '3D & AR/VR',             desc: 'Blender, Cinema 4D, Unity',        href: '/jobs?category=3d' },
      { label: 'Presentation Design',    desc: 'Decks, pitch and reports',         href: '/jobs?category=presentation' },
    ],
  },
  {
    id: 'video', label: 'Video & Audio',
    items: [
      { label: 'Video Editing',          desc: 'Premiere, DaVinci, post-prod',     href: '/jobs?category=video-edit' },
      { label: 'Voice Over',             desc: 'Commercial, narration, IVR',       href: '/jobs?category=voice' },
      { label: 'Audio Production',       desc: 'Mixing, mastering, podcasts',      href: '/jobs?category=audio' },
      { label: 'Animation',              desc: '2D and 3D animation',              href: '/jobs?category=animation' },
      { label: 'YouTube Content',        desc: 'Channel growth and editing',        href: '/jobs?category=youtube' },
    ],
  },
  {
    id: 'writing', label: 'Writing & Content',
    items: [
      { label: 'Copywriting',            desc: 'Sales, web, ad copy',              href: '/jobs?category=copy' },
      { label: 'Blog & Article Writing', desc: 'SEO-optimized long-form',          href: '/jobs?category=blog' },
      { label: 'Technical Writing',      desc: 'Docs, API reference, guides',       href: '/jobs?category=tech-writing' },
      { label: 'Translation',            desc: 'Multi-language content',            href: '/jobs?category=translation' },
      { label: 'Editing & Proofreading', desc: 'Polish and quality assurance',      href: '/jobs?category=editing' },
      { label: 'Resume Writing',         desc: 'CV, LinkedIn, cover letters',       href: '/jobs?category=resume' },
    ],
  },
  {
    id: 'admin', label: 'Admin & Support',
    items: [
      { label: 'Virtual Assistant',      desc: 'Inbox, calendar, research',         href: '/jobs?category=va' },
      { label: 'Data Entry',             desc: 'Spreadsheets and clean-up',         href: '/jobs?category=data-entry' },
      { label: 'Customer Support',       desc: 'Chat, email, phone support',         href: '/jobs?category=support' },
      { label: 'Project Management',     desc: 'Scrum, Asana, Jira workflows',       href: '/jobs?category=pm' },
      { label: 'Bookkeeping',            desc: 'QuickBooks, Xero, reconciliation',   href: '/jobs?category=bookkeeping' },
    ],
  },
];

const FIND_WORK_FOOTER = [
  { label: 'See all jobs',        href: '/search?type=jobs' },
  { label: 'Win work with ads',   href: '/search?type=jobs' },
  { label: 'Ways to earn',        href: '/how-it-works' },
];

/* ── Why PANDA mega-menu data ──────────────────────────── */
const WHY_PANDA = {
  intro: {
    heading: 'Learn about PANDA',
    sub: 'Get to know the platform built for the future of work',
  },
  columns: [
    {
      title: 'Resources',
      items: [
        { label: 'Success Stories',  desc: 'Discover how teams work strategically to grow', href: '/success-stories' },
        { label: 'Reviews',          desc: "See what it's like to collaborate on PANDA",     href: '/reviews' },
        { label: 'How to hire',      desc: 'Learn the different ways you can get work done', href: '/how-it-works' },
        { label: 'How to find work', desc: 'Learn about how to grow on your terms',           href: '/how-it-works' },
      ],
    },
    {
      title: "What's new",
      items: [
        { label: 'PANDA Updates',     desc: 'Our latest products, features, and partners',     href: '/updates' },
        { label: 'Research Institute',desc: 'Insights and tools for business leaders',          href: '/research' },
        { label: 'Blog',              desc: "News and stories from the world's work marketplace", href: '/blog' },
        { label: 'Release notes',     desc: 'Our latest product news and improvements',         href: '/updates' },
      ],
    },
  ],
};

/* ── Main component ────────────────────────────────────── */
export default function GlobalNavbar() {
  const { user, token, logout } = useAuthStore();
  const { unreadCount, fetch: fetchNotifs } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome   = location.pathname === '/';
  const { theme, setTheme } = useThemeStore();

  const [openMenu,    setOpenMenu]    = useState(null);
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [activeCat,   setActiveCat]   = useState(0);
  const [onlineMsg,   setOnlineMsg]   = useState(true);
  const [themeOpen,   setThemeOpen]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const closeTimer = useRef(null);
  const navRef     = useRef(null);

  const isFreelancer = user?.role === 'freelancer';
  const isClient     = user?.role === 'client';

  useEffect(() => {
    if (!token) return;
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(id);
  }, [token]);

  useEffect(() => {
    const h = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const open  = (name) => { clearTimeout(closeTimer.current); setOpenMenu(name); };
  const close = ()     => { closeTimer.current = setTimeout(() => setOpenMenu(null), 140); };

  // Auto-close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    setOpenMenu(null);
    setShowNotifs(false);
    setMobileOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const go = (path) => { setOpenMenu(null); setShowNotifs(false); setMobileOpen(false); navigate(path); };

  // Mobile menu items derived from role
  const mobileNavItems = !token
    ? [
        { label: 'Find Talent', href: '/freelancers' },
        { label: 'Find Work',   href: '/search?type=jobs' },
        { label: 'Pricing',     href: '/pricing' },
        { label: 'Enterprise',  href: '/enterprise' },
        { label: 'How it works', href: '/how-it-works' },
        { label: 'Blog',        href: '/blog' },
      ]
    : isClient
    ? [
        { label: 'Dashboard',   href: '/client/dashboard' },
        { label: 'Post a Job',  href: '/jobs/post' },
        { label: 'My Jobs',     href: '/my-jobs' },
        { label: 'Find Talent', href: '/freelancers' },
        { label: 'Messages',    href: '/messages' },
        { label: 'Payments',    href: '/payments' },
        { label: 'Reports',     href: '/reports' },
        { label: 'Settings',    href: '/settings' },
      ]
    : isFreelancer
    ? [
        { label: 'Dashboard',     href: '/freelancer/dashboard' },
        { label: 'Find Work',     href: '/search?type=jobs' },
        { label: 'My Proposals',  href: '/my-proposals' },
        { label: 'My Jobs',       href: '/my-jobs' },
        { label: 'Messages',      href: '/messages' },
        { label: 'Payments',      href: '/payments' },
        { label: 'AI Assistant',  href: '/ai-assistant' },
        { label: 'Profile',       href: '/freelancer/profile' },
        { label: 'Settings',      href: '/freelancer/settings' },
      ]
    : [
        { label: 'Admin Dashboard', href: '/admin/dashboard' },
        { label: 'Users',           href: '/freelancers' },
        { label: 'Jobs',            href: '/search?type=jobs' },
        { label: 'Messages',        href: '/messages' },
        { label: 'Payments',        href: '/payments' },
      ];

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 h-[60px] backdrop-blur-xl bg-dark-950/95 border-b border-dark-700/60"
      style={{ boxShadow: '0 2px 12px -4px rgba(0,0,0,0.08)' }}
    >
      <div className="navbar-header h-full max-w-[1440px] mx-auto px-4 sm:px-5 flex items-center gap-2">

        {/* ── Mobile hamburger (circle button like Upwork) ── */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-dark-700 text-dark-100 hover:bg-dark-800/70 transition-all shrink-0"
        >
          {mobileOpen
            ? <X className="w-4 h-4" strokeWidth={2.5} />
            : <Menu className="w-4 h-4" strokeWidth={2.5} />}
        </button>

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-3 group">
          <div className="w-7 h-7 bg-dark-800 border border-dark-700/80 rounded-lg flex items-center justify-center transition-colors group-hover:border-dark-600">
            <PandaLogo className="w-[18px] h-[18px]" invert />
          </div>
          <span className="font-black font-display text-dark-100 text-sm tracking-widest uppercase hidden sm:block">
            PANDA
          </span>
        </Link>

        {/* ── Authenticated nav ── */}
        {token && (
          <div className="hidden md:flex items-center gap-0 flex-1">
            {isFreelancer ? (
              <>
                <Trigger label="Find work" isOpen={openMenu === 'talent'} onEnter={() => open('talent')} onLeave={close}>
                  <PlainGrouped sections={FIND_WORK} onGo={go} width={230} />
                </Trigger>
                <Trigger label="Deliver work" isOpen={openMenu === 'manage'} onEnter={() => open('manage')} onLeave={close}>
                  <PlainGrouped sections={DELIVER_WORK} onGo={go} width={230} />
                </Trigger>
                <Trigger label="Manage finances" isOpen={openMenu === 'reports'} onEnter={() => open('reports')} onLeave={close}>
                  <PlainGrouped sections={MANAGE_FINANCES} onGo={go} width={250} />
                </Trigger>
              </>
            ) : isClient ? (
              <>
                <Trigger label="Hire talent" isOpen={openMenu === 'talent'} onEnter={() => open('talent')} onLeave={close}>
                  <PlainGrouped sections={HIRE_TALENT} onGo={go} width={240} />
                </Trigger>
                <Trigger label="Manage work" isOpen={openMenu === 'manage'} onEnter={() => open('manage')} onLeave={close}>
                  <PlainGrouped sections={MANAGE_WORK} onGo={go} width={230} />
                </Trigger>
                <Trigger label="Reports" isOpen={openMenu === 'reports'} onEnter={() => open('reports')} onLeave={close}>
                  <div className="py-2" style={{ width: 240 }}>
                    {REPORTS.map((item) => (
                      <button key={item.label} onClick={() => go(item.href)}
                        className="w-full text-left px-4 py-2.5 text-[13px] text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors">
                        {item.label}
                      </button>
                    ))}
                  </div>
                </Trigger>
              </>
            ) : (
              <>
                <Trigger label="Find Talent" isOpen={openMenu === 'talent'} onEnter={() => { open('talent'); setActiveCat(0); }} onLeave={close}>
                  <MegaMenu cats={TALENT_CATS} activeCat={activeCat} setActiveCat={setActiveCat} onGo={go} onClose={() => setOpenMenu(null)} />
                </Trigger>
                <Trigger label="Manage work" isOpen={openMenu === 'manage'} onEnter={() => open('manage')} onLeave={close}>
                  <PlainGrouped sections={MANAGE_WORK} onGo={go} width={230} />
                </Trigger>
              </>
            )}

            <Link to="/messages"
              className="px-3 py-2 text-[13px] font-medium text-dark-400 hover:bg-dark-800/70 hover:text-dark-100 rounded-lg transition-all">
              Messages
            </Link>
          </div>
        )}

        {/* ── Public nav ── */}
        {!token && (
          <div className="hidden md:flex items-center gap-0 ml-4 flex-1">
            <Trigger label="Find Talent" isOpen={openMenu === 'talent'} onEnter={() => { open('talent'); setActiveCat(0); }} onLeave={close}>
              <MegaMenu cats={TALENT_CATS} activeCat={activeCat} setActiveCat={setActiveCat} onGo={go} onClose={() => setOpenMenu(null)} compact />
            </Trigger>

            <Trigger label="Get outcomes" isOpen={openMenu === 'outcomes'} onEnter={() => open('outcomes')} onLeave={close}>
              <GetOutcomesMenu onGo={go} />
            </Trigger>

            <Trigger label="Find work" isOpen={openMenu === 'findwork'} onEnter={() => open('findwork')} onLeave={close}>
              <FindWorkMenu onGo={go} onClose={() => setOpenMenu(null)} />
            </Trigger>

            <Trigger label="Why PANDA" isOpen={openMenu === 'why'} onEnter={() => open('why')} onLeave={close}>
              <WhyPandaMenu onGo={go} />
            </Trigger>

            {[['Pricing', '/pricing'], ['Enterprise', '/enterprise']].map(([lbl, href]) => (
              <Link key={lbl} to={href} className="px-3 py-2 text-[13px] font-medium text-dark-400 hover:text-dark-100 hover:bg-dark-800/70 rounded-lg transition-all">
                {lbl}
              </Link>
            ))}
          </div>
        )}

        {/* ── Right side ── */}
        {!token ? (
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
            {/* Public search bar — desktop only; mobile uses the search icon below */}
            {!isHome && (
              <div className="hidden md:block mr-2">
                <NavSearch variant="public" />
              </div>
            )}

            {/* Mobile search icon (circle button like Upwork) */}
            <button
              onClick={() => navigate('/search')}
              aria-label="Search"
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-dark-700 text-dark-100 hover:bg-dark-800/70 transition-all"
            >
              <SearchIcon className="w-4 h-4" strokeWidth={2.5} />
            </button>

            {/* Log in — hidden on small phones to save space */}
            <Link to="/login"
              className="hidden sm:inline-block text-[13px] font-medium text-dark-300 hover:text-dark-100 px-3 sm:px-4 py-2 rounded-lg hover:bg-dark-800/70 transition-all">
              Log in
            </Link>

            {/* Sign up — always visible, primary brand button */}
            <Link to="/register"
              className="text-[13px] font-semibold bg-primary-500 text-white px-4 sm:px-5 py-2 rounded-full hover:bg-primary-600 transition-all">
              Sign up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 ml-auto shrink-0">

            {/* Search — hidden on home (hero already has one) */}
            {!isHome && (
              <div className="hidden lg:block mr-1.5">
                <NavSearch variant="compact" />
              </div>
            )}

            {/* Help */}
            <button title="Help"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:bg-dark-800/70 hover:text-dark-100 transition-all text-sm font-semibold">
              ?
            </button>

            {/* Notifications bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifs((v) => !v); setOpenMenu(null); }}
                title="Notifications"
                className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all text-dark-400 hover:bg-dark-800/70 hover:text-dark-100 ${showNotifs ? 'bg-dark-800 text-dark-100' : ''}`}>
                <Bell className="w-[17px] h-[17px]" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-primary-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-dark-950">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>
              <AnimatePresence>
                {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
              </AnimatePresence>
            </div>

            {/* Profile dropdown */}
            <div className="relative"
              onMouseEnter={() => { open('profile'); setShowNotifs(false); }}
              onMouseLeave={close}>
              <button
                title="Account"
                className={`flex items-center justify-center rounded-full transition-all overflow-hidden ${openMenu === 'profile' ? 'ring-2 ring-primary-500/50' : 'hover:ring-2 hover:ring-dark-600'}`}>
                {user?.avatar_url ? (
                  <UserAvatar user={user} size={32} ring={false} />
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center rounded-full text-dark-400 hover:bg-dark-800/70 hover:text-dark-100 bg-dark-800/40">
                    <UserCircle2 className="w-[20px] h-[20px]" strokeWidth={1.5} />
                  </span>
                )}
              </button>

              <AnimatePresence>
                {openMenu === 'profile' && (
                  <motion.div
                    {...DD}
                    className="absolute right-0 top-full mt-2 w-[272px] card shadow-float"
                    onMouseEnter={() => open('profile')}
                    onMouseLeave={close}
                    style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                  >
                    {/* User header */}
                    <div className="px-4 py-3.5 flex items-center gap-3 border-b border-dark-800">
                      <UserAvatar user={user} size={40} className="ring-2 ring-dark-700 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-dark-100 truncate">{user?.name}</div>
                        <div className="text-[11px] text-dark-400 capitalize truncate mt-0.5">{user?.role}</div>
                      </div>
                    </div>

                    {/* Online toggle */}
                    <div className="px-4 py-2.5 flex items-center justify-between border-b border-dark-800">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${onlineMsg ? 'bg-green-400' : 'bg-dark-600'}`} />
                        <span className="text-[13px] text-dark-300">Online for messages</span>
                      </div>
                      <button
                        onClick={() => setOnlineMsg((v) => !v)}
                        style={{ width: 36, height: 20 }}
                        className={`relative rounded-full transition-colors shrink-0 ${onlineMsg ? 'bg-green-500' : 'bg-dark-700'}`}>
                        <span className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${onlineMsg ? 'translate-x-[16px]' : 'translate-x-[2px]'}`} />
                      </button>
                    </div>

                    {/* Menu items */}
                    <div className="py-1 border-b border-dark-800">
                      <PRow icon={User}        label="Your profile"      onClick={() => go(isFreelancer ? '/freelancer/profile' : '/settings')} />
                      {isFreelancer && (
                        <PRow icon={TrendingUp} label="Stats and trends"  onClick={() => go('/reports')} />
                      )}
                      <PRow icon={ShieldCheck} label="Account health"    onClick={() => go('/settings')} />
                      <PRow icon={BadgeCheck}  label="Membership plan"   onClick={() => go('/settings')} />
                      {isFreelancer && (
                        <button
                          onClick={() => go('/settings')}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-dark-300 hover:bg-dark-800/70 hover:text-dark-100 transition-colors">
                          <Zap className="w-3.5 h-3.5 text-dark-500 shrink-0" strokeWidth={1.75} />
                          <span>Connects</span>
                          <span className="ml-auto text-[11px] text-dark-500 font-medium">
                            {user?.subscription?.connects_balance ?? 0} left
                          </span>
                        </button>
                      )}

                      {/* Theme submenu */}
                      <div>
                        <button onClick={() => setThemeOpen((v) => !v)}
                          className="w-full flex items-center justify-between px-4 py-2 text-[13px] text-dark-300 hover:bg-dark-800/70 hover:text-dark-100 transition-colors">
                          <span className="flex items-center gap-2.5">
                            {theme === 'dark'
                              ? <Moon    className="w-3.5 h-3.5 text-dark-400 shrink-0" strokeWidth={1.75} />
                              : theme === 'system'
                              ? <Monitor className="w-3.5 h-3.5 text-dark-400 shrink-0" strokeWidth={1.75} />
                              : <Sun     className="w-3.5 h-3.5 text-dark-400 shrink-0" strokeWidth={1.75} />
                            }
                            Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </span>
                          <ChevronDown className={`w-3 h-3 text-dark-600 transition-transform ${themeOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                        </button>
                        <AnimatePresence>
                          {themeOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden bg-dark-800/60">
                              {[
                                { id: 'light',  Icon: Sun,     label: 'Light'  },
                                { id: 'dark',   Icon: Moon,    label: 'Dark'   },
                                { id: 'system', Icon: Monitor, label: 'System' },
                              ].map(({ id, Icon, label }) => (
                                <button key={id}
                                  onClick={() => { setTheme(id); setThemeOpen(false); }}
                                  className={`w-full flex items-center gap-2.5 pl-10 pr-4 py-2 text-[13px] transition-colors ${theme === id ? 'font-semibold text-dark-100' : 'text-dark-400 hover:text-dark-100 hover:bg-dark-700/60'}`}>
                                  <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                                  {label}
                                  {theme === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <PRow icon={Settings} label="Account settings" onClick={() => go('/settings')} />
                    </div>

                    <div className="py-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-dark-400 hover:text-red-400 hover:bg-red-500/8 transition-colors">
                        <LogOut className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                        Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}
      </div>

      {/* ─── Mobile drawer ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 top-[60px] bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Panel — Upwork-style: clean white surface, plain nav list, sticky bottom bar */}
            <motion.div
              key="mobile-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{ backgroundColor: '#ffffff', color: '#18181b' }}
              className="md:hidden fixed top-[60px] left-0 right-0 bottom-0 z-50 overflow-y-auto overscroll-contain flex flex-col shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)]"
            >
              {/* Search row at top */}
              <div className="px-5 py-4 flex items-center justify-end border-b" style={{ borderColor: '#e4e4e7' }}>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/search');
                  }}
                  aria-label="Search"
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
                  style={{ color: '#18181b' }}
                >
                  <SearchIcon className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              {/* User card (if logged in) */}
              {token && user && (
                <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: '#e4e4e7' }}>
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=4361ff&color=fff`}
                    alt={user.name}
                    className="w-11 h-11 rounded-full shrink-0"
                    style={{ outline: '2px solid #e4e4e7' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold truncate" style={{ color: '#18181b' }}>{user.name}</div>
                    <div className="text-xs capitalize truncate" style={{ color: '#71717a' }}>{user.role}</div>
                  </div>
                </div>
              )}

              {/* Nav links — big tap targets, plain text, chevron on right */}
              <nav className="flex-1 py-2 pb-24">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.href + item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-5 py-4 text-base font-medium hover:bg-zinc-50 transition-colors"
                    style={{ color: '#18181b' }}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="w-4 h-4 -rotate-90" style={{ color: '#71717a' }} strokeWidth={2} />
                  </Link>
                ))}

                {/* Sign-out link (logged-in only) — styled as a normal row */}
                {token && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-5 py-4 text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" strokeWidth={2} />
                      Sign out
                    </span>
                  </button>
                )}
              </nav>

              {/* Sticky bottom bar: Log in + Sign up (only when logged out) */}
              {!token && (
                <div
                  className="sticky bottom-0 left-0 right-0 px-5 py-4 border-t flex items-center gap-3"
                  style={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7' }}
                >
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-semibold px-4 py-2.5"
                    style={{ color: '#18181b' }}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-sm font-semibold py-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ── Nav trigger ───────────────────────────────────────── */
function Trigger({ label, isOpen, onEnter, onLeave, children, to }) {
  const navigate = useNavigate();
  const onClickLabel = () => { if (to) navigate(to); };
  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        onClick={onClickLabel}
        className={`flex items-center gap-0.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-all text-dark-400 hover:bg-dark-800/70 hover:text-dark-100 ${isOpen ? 'bg-dark-800/70 text-dark-100' : ''}`}
      >
        {label}
        <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...DD}
            className="absolute left-0 top-full mt-2 card overflow-hidden"
            style={{
              minWidth: 240,
              boxShadow: '0 16px 48px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Grouped dropdown ──────────────────────────────────── */
function PlainGrouped({ sections, onGo, width }) {
  return (
    <div style={{ width }} className="py-2">
      {sections.map((section, si) => (
        <div key={si}>
          {si > 0 && <div className="my-1.5 mx-4 h-px bg-dark-800" />}

          {section.heading && (
            section.headingStyle === 'bold' ? (
              <div className="px-4 pt-2 pb-1.5">
                <span className="text-[13px] font-bold text-dark-100">{section.heading}</span>
              </div>
            ) : (
              <div className="px-4 pt-2 pb-1">
                <span className="text-[11px] font-semibold text-dark-500 uppercase tracking-widest">{section.heading}</span>
              </div>
            )
          )}

          {section.items.map((item) => (
            <button
              key={item.label}
              onClick={() => onGo(item.href)}
              className="w-full text-left px-4 py-2 text-[13px] text-dark-300 hover:bg-dark-800/70 hover:text-dark-100 transition-colors leading-snug flex items-center gap-1.5">
              <span className="flex-1">{item.label}</span>
              {item.external && <ExternalLink className="w-3 h-3 text-dark-600 shrink-0" strokeWidth={1.75} />}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Mega menu ─────────────────────────────────────────── */
function MegaMenu({ cats, activeCat, setActiveCat, onGo, onClose, compact }) {
  const w = compact ? 480 : 640;
  return (
    <div className="flex" style={{ width: w }}>
      <div className="w-48 bg-dark-800/60 border-r border-dark-700/60 py-2 shrink-0">
        <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-5 mb-1.5 pt-1">Categories</p>
        {cats.map((cat, i) => (
          <button
            key={cat.id}
            onMouseEnter={() => setActiveCat(i)}
            onClick={() => onGo(`/freelancers?category=${cat.id}`)}
            className={`w-full text-left flex items-center justify-between px-5 py-2 text-[13px] transition-all ${
              activeCat === i
                ? 'bg-dark-900/80 text-dark-100 font-semibold'
                : 'text-dark-400 hover:text-dark-200'
            }`}>
            {cat.label}
            {activeCat === i && <ChevronDown className="w-3 h-3 -rotate-90 shrink-0" strokeWidth={2.5} />}
          </button>
        ))}
        <div className="px-5 pt-2 mt-1 border-t border-dark-700/60">
          <Link to="/freelancers" onClick={onClose} className="text-[12px] text-primary-400 hover:text-primary-300 transition-colors">
            See all talent →
          </Link>
        </div>
      </div>
      <div className="flex-1 p-4">
        <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-3">{cats[activeCat]?.label}</p>
        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-2'} gap-0.5`}>
          {cats[activeCat]?.items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="p-3 rounded-xl hover:bg-dark-800/60 transition-all group">
              <div className="text-[13px] font-semibold text-dark-100 group-hover:text-primary-300 transition-colors">{item.label}</div>
              <div className="text-[11px] text-dark-500 mt-0.5">{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Get outcomes mega-menu ────────────────────────────── */
function GetOutcomesMenu({ onGo }) {
  return (
    <div className="grid grid-cols-[220px_1fr_1fr]" style={{ width: 820 }}>
      {/* Left intro pane */}
      <div className="p-5 bg-dark-800/40 border-r border-dark-700/60">
        <div className="text-[13px] font-bold text-dark-100 leading-snug">{GET_OUTCOMES.intro.heading}</div>
        <p className="text-[11px] text-dark-500 mt-2 leading-relaxed">{GET_OUTCOMES.intro.sub}</p>
      </div>

      {/* Two outcome columns */}
      {GET_OUTCOMES.outcomes.map((col, ci) => (
        <div key={ci} className="p-4">
          {ci === 0 && (
            <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-2 mb-2">
              Outcomes
            </div>
          )}
          {ci === 1 && <div className="h-[26px]" />}
          <div className="space-y-0.5">
            {col.map((it) => (
              <button
                key={it.label}
                onClick={() => onGo(it.href)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors group"
              >
                <div className="text-[13px] font-semibold text-dark-100 group-hover:text-primary-300 transition-colors leading-tight">
                  {it.label}
                </div>
                <div className="text-[11px] text-dark-500 mt-0.5 leading-snug">{it.desc}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Find work mega-menu ───────────────────────────────── */
function FindWorkMenu({ onGo, onClose }) {
  const [activeCat, setActiveCat] = useState(0);
  const cat = FIND_WORK_CATS[activeCat];
  const half = Math.ceil(cat.items.length / 2);
  const col1 = cat.items.slice(0, half);
  const col2 = cat.items.slice(half);

  return (
    <div className="flex flex-col" style={{ width: 880 }}>
      <div className="grid grid-cols-[220px_1fr_1fr]">
        {/* Left categories pane */}
        <div className="bg-dark-800/50 border-r border-dark-700/60 py-3">
          <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-5 mb-2 pt-1">Categories</p>
          {FIND_WORK_CATS.map((c, i) => (
            <button
              key={c.id}
              onMouseEnter={() => setActiveCat(i)}
              onClick={() => onGo(`/jobs?category=${c.id}`)}
              className={`w-full text-left flex items-center justify-between px-5 py-2 text-[13px] transition-all ${
                activeCat === i
                  ? 'bg-dark-900 text-dark-100 font-semibold'
                  : 'text-dark-300 hover:text-dark-100'
              }`}
            >
              {c.label}
              <ChevronDown className={`w-3 h-3 -rotate-90 shrink-0 transition-opacity ${activeCat === i ? 'opacity-100' : 'opacity-50'}`} strokeWidth={2.5} />
            </button>
          ))}
        </div>

        {/* Two item columns */}
        {[col1, col2].map((items, ci) => (
          <div key={ci} className={`p-4 ${ci === 0 ? '' : 'border-l border-dark-700/40'}`}>
            {ci === 0 && (
              <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-3 mb-2.5">
                {cat.label}
              </div>
            )}
            {ci !== 0 && <div className="h-[18px] mb-2.5" />}
            <div className="space-y-0.5">
              {items.map((it) => (
                <button
                  key={it.label}
                  onClick={() => onGo(it.href)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors group"
                >
                  <div className="text-[13px] font-semibold text-dark-100 group-hover:text-primary-300 transition-colors leading-tight">
                    {it.label}
                  </div>
                  <div className="text-[11px] text-dark-500 mt-0.5 leading-snug">{it.desc}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer row */}
      <div className="border-t border-dark-700/60 px-5 py-3 flex items-center gap-6">
        {FIND_WORK_FOOTER.map((f) => (
          <button
            key={f.label}
            onClick={() => onGo(f.href)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-dark-200 hover:text-primary-300 transition-colors"
          >
            {f.label}
            <ChevronDown className="w-3 h-3 -rotate-90" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Why PANDA mega-menu ───────────────────────────────── */
function WhyPandaMenu({ onGo }) {
  return (
    <div className="grid grid-cols-[220px_1fr_1fr]" style={{ width: 760 }}>
      {/* Left intro pane */}
      <div className="p-5 bg-dark-800/40 border-r border-dark-700/60">
        <div className="text-[13px] font-bold text-dark-100 leading-snug">{WHY_PANDA.intro.heading}</div>
        <p className="text-[11px] text-dark-500 mt-2 leading-relaxed">{WHY_PANDA.intro.sub}</p>
      </div>

      {/* Two columns */}
      {WHY_PANDA.columns.map((col) => (
        <div key={col.title} className="p-4">
          <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-2 mb-2">
            {col.title}
          </div>
          <div className="space-y-0.5">
            {col.items.map((it) => (
              <button
                key={it.label}
                onClick={() => onGo(it.href)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors group"
              >
                <div className="text-[13px] font-semibold text-dark-100 group-hover:text-primary-300 transition-colors leading-tight">
                  {it.label}
                </div>
                <div className="text-[11px] text-dark-500 mt-0.5 leading-snug">{it.desc}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Profile menu row ──────────────────────────────────── */
function PRow({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-dark-300 hover:bg-dark-800/70 hover:text-dark-100 transition-colors">
      {Icon && <Icon className="w-3.5 h-3.5 text-dark-500 shrink-0" strokeWidth={1.75} />}
      {label}
    </button>
  );
}
