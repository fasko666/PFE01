import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Users, Cpu, Palette, Code2, Calculator, Briefcase,
  TrendingUp, Building2, Award, PenLine,
  FileText, BookOpen, BarChart3, Trophy, Wrench, ScrollText, Mic,
  Sparkles, MessageSquare, HeadphonesIcon, Megaphone, HelpCircle,
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────── */
const CATEGORIES = [
  { name: 'Admin & Customer Support', icon: Users,       color: 'text-blue-400'    },
  { name: 'AI Services',              icon: Cpu,         color: 'text-violet-400'  },
  { name: 'Design & Creative',        icon: Palette,     color: 'text-pink-400'    },
  { name: 'Development & IT',         icon: Code2,       color: 'text-cyan-400'    },
  { name: 'Finance & Accounting',     icon: Calculator,  color: 'text-emerald-400' },
  { name: 'Hiring & Management',      icon: Briefcase,   color: 'text-amber-400'   },
  { name: 'Sales & Marketing',        icon: TrendingUp,  color: 'text-green-400'   },
  { name: 'Small Business Insights',  icon: Building2,   color: 'text-orange-400'  },
  { name: 'Work & Career',            icon: Award,       color: 'text-rose-400'    },
  { name: 'Writing & Translation',    icon: PenLine,     color: 'text-teal-400'    },
];

const CONTENT_TYPES = [
  { name: 'Articles',          desc: 'Hiring deep dives, industry trends, and more.',   icon: FileText,  href: '/blog'            },
  { name: 'Ebooks',            desc: 'Management best practices, trends, and more.',    icon: BookOpen,  href: '/updates'         },
  { name: 'Research',          desc: 'Data on how the world of work is changing.',      icon: BarChart3, href: '/research'        },
  { name: 'Success Stories',   desc: 'How PANDA enables businesses to succeed.',         icon: Trophy,    href: '/success-stories' },
  { name: 'Tools',             desc: 'Calculators for estimating costs and performance.',icon: Wrench,    href: '/pricing'         },
  { name: 'White Papers',      desc: 'Trends impacting business success.',               icon: ScrollText,href: '/updates'         },
  { name: 'Work Week Podcast', desc: 'Episodes on the future of work, backed by PANDA research.', icon: Mic, href: '/updates'   },
];

const FEATURED = [
  { title: 'What Is Freelancing? Basics and Popular Jobs', gradient: 'from-emerald-400 to-emerald-700', icon: '📋' },
  { title: 'How to Write a Cover Letter',                  gradient: 'from-stone-400 to-stone-700',     icon: '✉️' },
  { title: 'Web Design vs. Web Development',               gradient: 'from-pink-500 to-rose-700',       icon: '💻' },
  { title: 'Most In-Demand Jobs and Skills',               gradient: 'from-sky-400 to-blue-700',        icon: '💼' },
  { title: 'Tips to Help You Succeed as a Freelance Professional', gradient: 'from-green-400 to-emerald-700', icon: '🎯' },
  { title: 'How Much Does It Cost to Build a Website?',    gradient: 'from-slate-400 to-slate-700',     icon: '🧮' },
  { title: 'Highest-Paying Freelance Job',                 gradient: 'from-amber-400 to-orange-700',    icon: '💰' },
  { title: 'How To Pay Freelancers',                       gradient: 'from-emerald-400 to-teal-700',    icon: '💳' },
  { title: 'How to Become a Virtual Assistant',            gradient: 'from-rose-400 to-red-700',        icon: '🎧' },
  { title: 'Top 10 Online Jobs for Students',              gradient: 'from-lime-400 to-green-700',      icon: '📚' },
];

const MORE = [
  {
    col: [
      { name: 'Blog',           desc: "Updates on PANDA's products and initiatives", icon: Megaphone,    href: '/blog'    },
      { name: 'Community',      desc: 'A place to connect with others who use PANDA', icon: MessageSquare, href: '/updates' },
      { name: 'Leading Voices', desc: 'Insights from top talent available for hire through PANDA', icon: Sparkles, href: '/updates' },
    ],
  },
  {
    col: [
      { name: 'Calculators', desc: 'Easy-to-use calculators and tools to help run your business', icon: Calculator, href: '/pricing' },
      { name: 'Help Center', desc: 'Answers to common questions about using PANDA',                icon: HelpCircle, href: '/' },
    ],
  },
  {
    header: 'Get started with PANDA',
    col: [
      { name: 'How To Use PANDA as a Freelancer (Beginner\'s Guide)', href: '/how-it-works' },
      { name: 'How To Post a Job on PANDA',         href: '/jobs/post'     },
      { name: 'How To Hire Freelancers on PANDA',   href: '/how-it-works'  },
    ],
    plain: true,
  },
];

/* ─── Component ─────────────────────────────────────────────── */
export default function ResourceSubNav() {
  const [open, setOpen] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const ITEMS = [
    { key: 'resource',   label: 'Resource Center', hasMenu: false, to: '/success-stories' },
    { key: 'categories', label: 'Categories',      hasMenu: true },
    { key: 'types',      label: 'Content Types',   hasMenu: true },
    { key: 'featured',   label: 'Featured',        hasMenu: true },
    { key: 'more',       label: 'More',            hasMenu: true },
  ];

  return (
    <div ref={ref} className="border-y border-dark-800 bg-dark-950 sticky top-[60px] z-30">
      <div className="container-custom py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {ITEMS.map((it) => (
            <div key={it.key} className="relative">
              {it.hasMenu ? (
                <button
                  onMouseEnter={() => setOpen(it.key)}
                  onClick={() => setOpen(open === it.key ? null : it.key)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    open === it.key ? 'bg-dark-800 text-dark-100' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800/60'
                  }`}
                >
                  {it.label}
                  <ChevronDown className={`w-3 h-3 transition-transform ${open === it.key ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link
                  to={it.to}
                  className="block px-3 py-2 rounded-lg text-xs font-semibold text-dark-300 hover:text-dark-100 hover:bg-dark-800/60 transition-colors"
                >
                  {it.label}
                </Link>
              )}
            </div>
          ))}

          <div className="ml-auto hidden md:flex items-center gap-2 text-2xs text-dark-500">
            <span>New? Learn</span>
            <Link to="/search?type=jobs" className="text-primary-400 hover:text-primary-300 underline underline-offset-4">how to start freelancing</Link>
            <span>or</span>
            <Link to="/freelancers" className="text-primary-400 hover:text-primary-300 underline underline-offset-4">hire freelancers</Link>
          </div>
        </div>

        {/* ── Mega panels ── */}
        <AnimatePresence>
          {open === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              onMouseLeave={() => setOpen(null)}
              className="absolute left-0 right-0 top-full mt-1 mx-auto bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl p-6 max-w-5xl"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  return (
                    <Link
                      key={c.name}
                      to="/success-stories"
                      onClick={() => setOpen(null)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 hover:border-primary-500/40 hover:bg-dark-800 transition-all group"
                    >
                      <span className={`w-8 h-8 rounded-lg bg-dark-900 border border-dark-700 flex items-center justify-center shrink-0 group-hover:border-primary-500/40 transition-colors`}>
                        <Icon className={`w-4 h-4 ${c.color}`} strokeWidth={1.75} />
                      </span>
                      <span className="text-xs font-semibold text-dark-200 group-hover:text-dark-100 leading-tight">
                        {c.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {open === 'types' && (
            <motion.div
              key="types"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              onMouseLeave={() => setOpen(null)}
              className="absolute left-0 right-0 top-full mt-1 mx-auto bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl p-6 max-w-5xl"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
                {CONTENT_TYPES.map((c) => {
                  const Icon = c.icon;
                  return (
                    <Link
                      key={c.name}
                      to={c.href}
                      onClick={() => setOpen(null)}
                      className="group block"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-3.5 h-3.5 text-primary-400 shrink-0" strokeWidth={1.75} />
                        <div className="text-sm font-bold text-dark-100 group-hover:text-primary-300 transition-colors leading-tight">
                          {c.name}
                        </div>
                      </div>
                      <p className="text-2xs text-dark-500 leading-relaxed pl-5">{c.desc}</p>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {open === 'featured' && (
            <motion.div
              key="featured"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              onMouseLeave={() => setOpen(null)}
              className="absolute left-0 right-0 top-full mt-1 mx-auto bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl p-6 max-w-5xl"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {FEATURED.map((f) => (
                  <Link
                    key={f.title}
                    to="/updates"
                    onClick={() => setOpen(null)}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-dark-800 bg-dark-900 hover:border-primary-500/40 transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center text-xl shrink-0 shadow-sm`}>
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-dark-100 group-hover:text-primary-300 transition-colors leading-snug">
                        {f.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {open === 'more' && (
            <motion.div
              key="more"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              onMouseLeave={() => setOpen(null)}
              className="absolute left-0 right-0 top-full mt-1 mx-auto bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl p-6 max-w-5xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                {MORE.map((column, ci) => (
                  <div key={ci} className="space-y-5">
                    {column.header && (
                      <div className="text-xs font-bold text-dark-100 mb-2">{column.header}</div>
                    )}
                    {column.col.map((item) => {
                      if (column.plain) {
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setOpen(null)}
                            className="block px-3 py-2.5 rounded-lg border border-dark-700 text-xs text-dark-200 hover:border-primary-500/40 hover:text-primary-300 hover:bg-dark-800/60 transition-colors"
                          >
                            {item.name}
                          </Link>
                        );
                      }
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setOpen(null)}
                          className="group block"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {Icon && <Icon className="w-3.5 h-3.5 text-primary-400 shrink-0" strokeWidth={1.75} />}
                            <div className="text-sm font-bold text-dark-100 group-hover:text-primary-300 transition-colors leading-tight">
                              {item.name}
                            </div>
                          </div>
                          {item.desc && <p className="text-2xs text-dark-500 leading-relaxed pl-5">{item.desc}</p>}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
