import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, ChevronDown, LogOut, Settings,
  Search, UserCircle2,
  ShieldCheck, BadgeCheck, UserPlus, Sun, Moon, Monitor,
} from 'lucide-react';
import PandaLogo from '../ui/PandaLogo';
import NotificationPanel from '../ui/NotificationPanel';
import UserAvatar from '../ui/UserAvatar';
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
    heading: 'Find work',
    headingStyle: 'bold',
    items: [
      { label: 'Search for jobs',      href: '/jobs' },
      { label: 'Saved jobs',           href: '/jobs' },
      { label: 'Proposals and offers', href: '/my-proposals' },
    ],
  },
  {
    heading: 'My work',
    headingStyle: 'label',
    items: [
      { label: 'My contracts',   href: '/my-jobs' },
      { label: 'My timesheets',  href: '/my-jobs' },
      { label: 'Work diary',     href: '/my-jobs' },
      { label: 'AI assistant',   href: '/ai-assistant' },
    ],
  },
];

const MANAGE_WORK = [
  {
    heading: 'Active and past work',
    items: [
      { label: 'Your contracts',           href: '/my-jobs' },
      { label: 'Hourly contract activity', href: '/my-jobs' },
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

const SEARCH_TYPES = ['Talent', 'Jobs'];

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
  const { theme, setTheme } = useThemeStore();

  const [openMenu,    setOpenMenu]    = useState(null);
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [activeCat,   setActiveCat]   = useState(0);
  const [onlineMsg,   setOnlineMsg]   = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType,  setSearchType]  = useState('Talent');
  const [typeOpen,    setTypeOpen]    = useState(false);
  const [themeOpen,   setThemeOpen]   = useState(false);

  const closeTimer = useRef(null);
  const navRef     = useRef(null);
  const typeRef    = useRef(null);

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
      if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const open  = (name) => { clearTimeout(closeTimer.current); setOpenMenu(name); };
  const close = ()     => { closeTimer.current = setTimeout(() => setOpenMenu(null), 140); };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    const type = searchType === 'Jobs' ? 'jobs' : 'talent';
    navigate(`/search?q=${encodeURIComponent(q)}&type=${type}`);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    setOpenMenu(null);
    setShowNotifs(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const go = (path) => { setOpenMenu(null); setShowNotifs(false); navigate(path); };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-dark-950/90 backdrop-blur-xl border-b border-dark-700/50"
      style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04)' }}
    >
      <div className="h-full max-w-[1440px] mx-auto px-5 flex items-center gap-2">

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
            {isClient ? (
              <Trigger label="Hire talent" isOpen={openMenu === 'talent'} onEnter={() => open('talent')} onLeave={close}>
                <PlainGrouped sections={HIRE_TALENT} onGo={go} width={240} />
              </Trigger>
            ) : isFreelancer ? (
              <Trigger label="Find work" isOpen={openMenu === 'talent'} onEnter={() => open('talent')} onLeave={close}>
                <PlainGrouped sections={FIND_WORK} onGo={go} width={220} />
              </Trigger>
            ) : (
              <Trigger label="Find Talent" isOpen={openMenu === 'talent'} onEnter={() => { open('talent'); setActiveCat(0); }} onLeave={close}>
                <MegaMenu cats={TALENT_CATS} activeCat={activeCat} setActiveCat={setActiveCat} onGo={go} onClose={() => setOpenMenu(null)} />
              </Trigger>
            )}

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

            <Trigger label="Why PANDA" isOpen={openMenu === 'why'} onEnter={() => open('why')} onLeave={close}>
              <WhyPandaMenu onGo={go} />
            </Trigger>

            {[['Pricing', '/pricing'], ['Enterprise', '/']].map(([lbl, href]) => (
              <Link key={lbl} to={href} className="px-3 py-2 text-[13px] font-medium text-dark-400 hover:text-dark-100 hover:bg-dark-800/70 rounded-lg transition-all">
                {lbl}
              </Link>
            ))}
          </div>
        )}

        {/* ── Right side ── */}
        {!token ? (
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Public search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center mr-2">
              <div
                className="flex items-center bg-dark-900 border border-dark-700 rounded-full overflow-hidden transition-all focus-within:border-dark-500 focus-within:bg-dark-800/80 hover:border-dark-600"
                style={{ height: 36 }}
              >
                <Search className="w-3.5 h-3.5 text-dark-500 ml-3.5 shrink-0" strokeWidth={2} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search"
                  className="bg-transparent pl-2 pr-2 text-[13px] text-dark-100 placeholder:text-dark-500 outline-none w-40 lg:w-56"
                />
                <div className="relative border-l border-dark-700 h-full flex items-center" ref={typeRef}>
                  <button
                    type="button"
                    onClick={() => setTypeOpen((v) => !v)}
                    className="flex items-center gap-1 px-3.5 h-full text-[13px] font-medium text-dark-300 hover:bg-dark-700/60 transition-colors"
                  >
                    {searchType}
                    <ChevronDown
                      className={`w-3 h-3 text-dark-500 transition-transform ${typeOpen ? 'rotate-180' : ''}`}
                      strokeWidth={2.5}
                    />
                  </button>
                  {typeOpen && (
                    <div className="absolute right-0 top-full mt-1 w-28 bg-dark-800 border border-dark-700 rounded-xl shadow-float overflow-hidden z-50">
                      {SEARCH_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setSearchType(t); setTypeOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                            searchType === t ? 'bg-dark-700 font-semibold text-dark-100' : 'text-dark-300 hover:bg-dark-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>

            <Link to="/login"
              className="text-[13px] font-medium text-dark-400 hover:text-dark-100 px-4 py-2 rounded-lg hover:bg-dark-800/70 transition-all">
              Log in
            </Link>
            <Link to="/register"
              className="text-[13px] font-semibold bg-primary-500 text-white px-5 py-2 rounded-full hover:bg-primary-600 transition-all shadow-glow">
              Sign up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 ml-auto shrink-0">

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center mr-1.5">
              <div
                className="flex items-center bg-dark-800/80 border border-dark-700/80 rounded-lg overflow-hidden transition-all focus-within:border-dark-500 focus-within:bg-dark-800"
                style={{ height: 34 }}
              >
                <Search className="w-3.5 h-3.5 text-dark-500 ml-3 shrink-0" strokeWidth={2} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search…"
                  className="bg-transparent pl-2 pr-2 text-[13px] text-dark-100 placeholder:text-dark-500 outline-none w-36"
                />
                <div className="relative border-l border-dark-700/80 h-full flex items-center" ref={typeRef}>
                  <button type="button" onClick={() => setTypeOpen((v) => !v)}
                    className="flex items-center gap-1 px-2.5 h-full text-[12px] font-medium text-dark-400 hover:bg-dark-700/60 transition-colors">
                    {searchType}
                    <ChevronDown className={`w-3 h-3 text-dark-500 transition-transform ${typeOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                  </button>
                  {typeOpen && (
                    <div className="absolute right-0 top-full mt-1 w-24 bg-dark-800 border border-dark-700 rounded-xl shadow-float overflow-hidden z-50">
                      {SEARCH_TYPES.map((t) => (
                        <button key={t} type="button" onClick={() => { setSearchType(t); setTypeOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${searchType === t ? 'bg-dark-700 font-semibold text-dark-100' : 'text-dark-300 hover:bg-dark-700'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>

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
                      <UserAvatar user={user} size={36} className="ring-2 ring-dark-700 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-dark-100 truncate">{user?.name}</span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-dark-800 text-dark-400 border border-dark-700">
                            Free
                          </span>
                        </div>
                        <div className="text-[11px] text-dark-500 truncate mt-0.5">{user?.email}</div>
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

                    {/* Upgrade CTA */}
                    <div className="px-4 py-2.5 border-b border-dark-800">
                      <button onClick={() => go('/settings')}
                        className="w-full text-left px-3 py-2.5 rounded-xl border border-yellow-500/25 bg-yellow-500/8 hover:bg-yellow-500/12 transition-colors">
                        <div className="text-[13px] font-semibold text-yellow-400">Try Business Plus →</div>
                        <div className="text-[11px] text-yellow-600/80 mt-0.5 leading-snug">
                          Upgrade for faster access to the top 1% of talent.
                        </div>
                      </button>
                    </div>

                    {/* Menu items */}
                    <div className="py-1 border-b border-dark-800">
                      <PRow icon={ShieldCheck} label="Account health"    onClick={() => go('/settings')} />
                      <PRow icon={BadgeCheck}  label="Membership plan"   onClick={() => go('/settings')} />
                      <PRow icon={UserPlus}    label="Invite a coworker" onClick={() => go('/settings')} />

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
              className="w-full text-left px-4 py-2 text-[13px] text-dark-300 hover:bg-dark-800/70 hover:text-dark-100 transition-colors leading-snug">
              {item.label}
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
