import { useState } from 'react';
import { resolveFooter } from '../../utils/footerLinks';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ArrowRight, Check, Play, X, Sparkles,
  Bot, Code2, Paintbrush2, TrendingUp, PenLine, Users,
  Calculator, Scale, GraduationCap, Building2, Star, Shield,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

const HERO_IMG =
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1600&q=80';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] },
});

const QUICK_CATS = [
  { label: 'Web design',     q: 'web design' },
  { label: 'AI development', q: 'ai developer' },
  { label: 'Video editing',  q: 'video editor' },
  { label: 'Google Ads',     q: 'google ads' },
];

const BRAND_LOGOS = ['airbnb', 'databricks', 'cloudflare', 'scale', 'Microsoft', 'grammarly', 'bambooHR', 'shutterstock'];

const CATEGORIES = [
  { name: 'AI Services',                icon: Bot,           gradient: 'from-primary-500 to-accent-500' },
  { name: 'Development & IT',           icon: Code2,         gradient: 'from-primary-500 to-cyan-500' },
  { name: 'Design & Creative',          icon: Paintbrush2,   gradient: 'from-pink-500 to-accent-500' },
  { name: 'Sales & Marketing',          icon: TrendingUp,    gradient: 'from-accent-500 to-fuchsia-500' },
  { name: 'Writing & Translation',      icon: PenLine,       gradient: 'from-cyan-500 to-blue-500' },
  { name: 'Admin & Support',            icon: Users,         gradient: 'from-violet-500 to-primary-500' },
  { name: 'Finance & Accounting',       icon: Calculator,    gradient: 'from-indigo-500 to-accent-500' },
  { name: 'Legal',                      icon: Scale,         gradient: 'from-blue-500 to-violet-500' },
  { name: 'HR & Training',              icon: GraduationCap, gradient: 'from-fuchsia-500 to-pink-500' },
  { name: 'Engineering & Architecture', icon: Building2,     gradient: 'from-cyan-500 to-indigo-500' },
];

const HOW_HIRING = [
  { title: 'Posting jobs is always free', img: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80', overlay: 'all in one place' },
  { title: 'Get proposals and hire',      img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80' },
  { title: 'Pay when work is done',       img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=600&q=80' },
];

const HOW_FREELANCE = [
  { title: 'Build your profile in minutes', img: 'https://images.unsplash.com/photo-1573164713619-24c711fe7878?auto=format&fit=crop&w=600&q=80' },
  { title: 'Browse jobs that match',        img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80' },
  { title: 'Get paid securely',             img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80' },
];

const PLANS = [
  {
    name: 'Basic',
    sub: 'For occasional hiring and one-off projects',
    pitch: 'Hire skilled freelancers fast — without long-term commitments or extra overhead.',
    bullets: [
      'Marketplace access — skilled freelancers across thousands of skills',
      'Talent profiles — portfolios, ratings, and work history',
      'Hiring tools — proposals and terms in one place',
      'Project workspace — messages, files, and status in one view',
      'Protected payments — escrow-backed pay tied to approved work',
    ],
    cta: 'Get started for free',
    popular: false,
  },
  {
    name: 'Business Plus',
    sub: 'For ongoing work, repeat hiring, and teams',
    pitch: 'Premium tools, vetted talent, and team controls for running freelance work at scale.',
    bullets: [
      'Curated shortlists — we surface top matches so you can hire faster',
      'Expert-Vetted talent — access to the top 1% of PANDA freelancers',
      'Team workspace — shared hiring with roles and permissions',
      'Centralized billing — keep team spend in one place',
      'Priority support — faster help to keep projects moving',
    ],
    cta: 'Get started for free',
    popular: true,
  },
];

const TESTIMONIALS = [
  { quote: '"We discovered CTO-level expertise on the platform — someone who had already served as a startup CTO — willing to contribute to our open-source project. That kind of talent brings tremendous value to us."', name: 'Saswata Basu, CEO',      company: 'Züs',                  avatar: 'https://i.pravatar.cc/100?img=12' },
  { quote: '"PANDA isn\'t just a hiring platform for us — it\'s a strategic partner. It\'s helped us fill every technical gap, accelerate our delivery from months to weeks, and bring on leaders who\'ve become foundational."',  name: 'David Wrench, Co-Founder', company: 'Datajoi',              avatar: 'https://i.pravatar.cc/100?img=33' },
  { quote: '"I found two awesome candidates and wound up hiring an AI freelancer based in Paris. I love the platform and the amount of talent I have access to."',                                                              name: 'Matt See, Co-Founder',     company: 'Lighthouse',           avatar: 'https://i.pravatar.cc/100?img=53' },
  { quote: '"PANDA is paramount to the success that we\'ve had. We can\'t accomplish what we do without our PANDA staff. We fully consider them part of our team."',                                                              name: 'Bryan Goltzman, CEO',      company: 'Liquid Screen Design', avatar: 'https://i.pravatar.cc/100?img=14' },
  { quote: '"In this early stage we really need to be lean and prove out everything. Being able to find the right people and interview different talents has been really awesome."',                                            name: 'Jen Libby, Founder',       company: 'Promly',               avatar: 'https://i.pravatar.cc/100?img=47' },
  { quote: '"The safety features are nice, but what really builds our confidence in PANDA is how we consistently find experts who deliver on highly technical, complex projects."',                                             name: 'Gabriel Richman, Founder', company: 'Omic',                 avatar: 'https://i.pravatar.cc/100?img=60' },
];

const BADGES = [
  { tag: 'BEST SOFTWARE', label: 'Top 50',          sub: 'AI PRODUCTS' },
  { tag: 'WINTER 2026',   label: 'Leader',          sub: 'SMALL BUSINESS' },
  { tag: 'WINTER 2026',   label: 'Best Results',    sub: 'SMALL BUSINESS' },
  { tag: 'WINTER 2026',   label: 'Best Usability',  sub: 'SMALL BUSINESS' },
  { tag: 'WINTER 2026',   label: 'Easiest Setup',   sub: 'MID-MARKET' },
  { tag: 'WINTER 2026',   label: 'Easiest To Use',  sub: 'MID-MARKET' },
  { tag: 'WINTER 2026',   label: 'Best Meets Reqs', sub: 'MID-MARKET' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [intent, setIntent]         = useState('hire');
  const [howTab, setHowTab]         = useState('hiring');
  const [search, setSearch]         = useState('');
  const [priceQ, setPriceQ]         = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    const type = intent === 'hire' ? 'talent' : 'jobs';
    navigate(`/search?q=${encodeURIComponent(q)}&type=${type}`);
  };

  return (
    <div className="bg-dark-950 text-dark-100 overflow-x-hidden relative" style={{ paddingTop: 64 }}>

      {/* ── Decorative top glows ── */}
      <div aria-hidden className="absolute top-16 left-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute top-32 right-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Promo banner ── */}
      {showBanner && (
        <div className="px-4 pt-6 relative z-10">
          <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-primary-500/15 via-accent-500/15 to-primary-500/15 border border-primary-500/30 px-6 py-4 flex items-center gap-4 backdrop-blur-sm">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </span>
            <p className="text-sm text-dark-200 flex-1">
              <span className="font-semibold text-dark-50">New on PANDA.</span> Hire the top 1% of talent with Business Plus.
            </p>
            <Link to="/pricing" className="text-sm font-semibold text-primary-400 hover:text-primary-300 inline-flex items-center gap-1.5 group whitespace-nowrap">
              Get started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button onClick={() => setShowBanner(false)} className="text-dark-500 hover:text-dark-200 transition-colors" aria-label="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="px-4 pt-6 relative z-10">
        <div className="max-w-5xl mx-auto relative rounded-[28px] overflow-hidden h-[500px] sm:h-[580px] shadow-[0_30px_80px_-20px_rgba(67,97,255,0.45)]">
          <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          {/* Dark + brand-tinted overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark-950/95 via-accent-900/55 to-primary-900/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/85 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: 'radial-gradient(circle at 80% 30%, rgba(139,47,255,0.4), transparent 40%), radial-gradient(circle at 20% 80%, rgba(67,97,255,0.4), transparent 40%)',
          }} />

          <div className="relative z-10 p-8 sm:p-14 max-w-2xl h-full flex flex-col justify-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.05] tracking-tight mb-5"
            >
              Work at the speed<br />
              of your{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">ambition</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-white/90 leading-relaxed mb-7 max-w-lg font-medium"
            >
              Hire experts who use AI to amplify their talent, turning complex work into high-impact business outcomes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-flex rounded-full border border-white/25 bg-white/5 backdrop-blur-md p-1 mb-4 self-start"
            >
              {[['hire', 'I want to hire'], ['work', 'I want to work']].map(([id, label]) => (
                <button key={id} onClick={() => setIntent(id)}
                  className={`px-5 sm:px-8 py-2 rounded-full text-sm font-semibold transition-all ${
                    intent === id ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30' : 'text-white/70 hover:text-white'
                  }`}>
                  {label}
                </button>
              ))}
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-dark-900 border border-dark-700 rounded-full p-1.5 shadow-2xl max-w-xl"
            >
              <div className="flex-1 px-4">
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder={intent === 'hire' ? 'Describe what you need to hire for...' : 'What kind of work are you looking for?'}
                  className="w-full bg-transparent text-sm text-dark-100 placeholder:text-dark-500 outline-none py-2"
                />
              </div>
              <button type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/40 transition-all">
                <Search className="w-4 h-4" strokeWidth={2.5} />
                Search
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap gap-2 mt-5"
            >
              {QUICK_CATS.map((c) => (
                <button key={c.label}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(c.q)}&type=${intent === 'hire' ? 'talent' : 'jobs'}`)}
                  className="px-4 py-1.5 rounded-full border border-white/30 backdrop-blur-md text-white text-xs font-medium hover:bg-white/15 hover:border-white/50 transition-all inline-flex items-center gap-1.5">
                  {c.label} <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trusted by ── */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-2xs font-semibold text-dark-500 tracking-[0.2em] uppercase mb-8">Trusted by 800,000 clients</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 gap-y-5">
            {BRAND_LOGOS.map((b) => (
              <span key={b} className="text-lg font-bold text-dark-500 hover:text-primary-400 transition-colors lowercase">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp(0)} className="text-3xl sm:text-4xl font-bold font-display text-dark-50 mb-10">
            Find experts for every type of work
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div key={c.name} {...fadeUp(i * 0.04)}>
                  <Link
                    to={`/search?q=${encodeURIComponent(c.name)}&type=talent`}
                    className="block p-5 rounded-2xl border border-dark-800 bg-dark-900 hover:border-primary-500/50 hover:shadow-[0_15px_40px_-12px_rgba(67,97,255,0.4)] transition-all group h-full relative overflow-hidden"
                  >
                    <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity`} />
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <div className="text-sm font-semibold text-dark-100 leading-snug group-hover:text-primary-300 transition-colors relative">{c.name}</div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
            <motion.h2 {...fadeUp(0)} className="text-3xl sm:text-4xl font-bold font-display text-dark-50">How it works</motion.h2>
            <div className="inline-flex rounded-full border border-dark-700 p-1 bg-dark-900">
              {[['hiring', 'For hiring'], ['finding', 'For finding work']].map(([id, label]) => (
                <button key={id} onClick={() => setHowTab(id)}
                  className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    howTab === id ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow' : 'text-dark-400 hover:text-dark-100'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {(howTab === 'hiring' ? HOW_HIRING : HOW_FREELANCE).map((s, i) => (
              <motion.div key={s.title} {...fadeUp(i * 0.07)} className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-dark-900 mb-4 ring-1 ring-dark-800">
                  <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {s.overlay && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/85 via-accent-900/65 to-dark-950/85" />
                      <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                        all in <span className="ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white">one place</span>
                      </span>
                    </>
                  )}
                  <span className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-primary-600 shadow-lg">
                    <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-dark-100 group-hover:text-primary-300 transition-colors">{s.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing insights ── */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden text-white grid lg:grid-cols-2 min-h-[360px] relative border border-dark-800"
             style={{ background: 'linear-gradient(135deg, #0a0a1c 0%, #1c0f3e 50%, #0a0a1c 100%)' }}>
          <div className="absolute top-0 right-0 w-full h-full opacity-60" style={{
            backgroundImage: 'radial-gradient(circle at 75% 50%, rgba(139,47,255,0.4), transparent 50%), radial-gradient(circle at 25% 80%, rgba(67,97,255,0.3), transparent 50%)',
          }} />

          <div className="relative z-10 p-10 sm:p-14 flex flex-col justify-center">
            <h3 className="text-3xl sm:text-4xl font-bold font-display mb-4 leading-tight">
              Get insights into<br />
              <span className="bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text text-transparent">freelancer pricing</span>
            </h3>
            <p className="text-sm text-white/70 mb-6 max-w-md leading-relaxed">
              We'll calculate the average cost for freelancers with the skills you need.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); if (priceQ.trim()) navigate(`/search?q=${encodeURIComponent(priceQ.trim())}&type=talent`); }}
              className="flex items-center gap-2 bg-dark-950 border border-dark-700 rounded-full p-1.5 max-w-md shadow-xl"
            >
              <input value={priceQ} onChange={(e) => setPriceQ(e.target.value)}
                placeholder="To start, describe what you need done."
                className="flex-1 px-4 py-2 bg-transparent text-sm text-dark-100 placeholder:text-dark-500 outline-none"
              />
              <button type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/40 transition-all">
                Next <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </form>
          </div>

          <div className="relative hidden lg:flex items-center justify-center p-8">
            <svg viewBox="0 0 300 300" className="w-72 h-72 relative">
              <defs>
                <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4361ff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((rot) => (
                <ellipse key={rot} cx="150" cy="80" rx="22" ry="80"
                  fill="none" stroke="url(#petalGrad)" strokeWidth="2.5"
                  transform={`rotate(${rot} 150 150)`} />
              ))}
              <circle cx="150" cy="150" r="9" fill="#a855f7" />
              <circle cx="150" cy="150" r="22" fill="none" stroke="#4361ff" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Pricing plans ── */}
      <section className="py-20 px-4 relative overflow-hidden z-10">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-dark-50 mb-3">Choose how you want to hire</h2>
            <p className="text-sm text-dark-400">Flexible options designed to fit your hiring needs</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {PLANS.map((p, i) => (
              <motion.div key={p.name} {...fadeUp(i * 0.1)}
                className={`relative rounded-3xl p-8 bg-dark-900 transition-all overflow-hidden ${
                  p.popular
                    ? 'border-2 border-primary-500 shadow-[0_20px_60px_-15px_rgba(67,97,255,0.45)]'
                    : 'border border-dark-800'
                }`}>
                {p.popular && (
                  <>
                    <div className="absolute -top-px right-8 px-3 py-1 rounded-b-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white text-2xs font-bold tracking-widest uppercase">Popular</div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-2xl" />
                  </>
                )}
                <h3 className="text-xl font-bold font-display text-dark-50 mb-1 relative">{p.name}</h3>
                <p className="text-xs text-dark-500 mb-5 relative">{p.sub}</p>
                <p className="text-sm text-dark-300 leading-relaxed mb-5 relative">{p.pitch}</p>
                <div className="border-t border-dark-800 pt-5 mb-6 relative">
                  <div className="text-sm font-semibold text-dark-100 mb-4">
                    {p.name === 'Basic' ? 'Basic includes:' : 'Everything in Basic, plus:'}
                  </div>
                  <ul className="space-y-3">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex gap-2.5 items-start">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                        </span>
                        <span className="text-xs text-dark-300 leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/register"
                  className={`block w-full text-center py-3 rounded-full text-sm font-semibold transition-all relative ${
                    p.popular
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg hover:shadow-primary-500/40'
                      : 'bg-transparent border border-primary-500 text-primary-300 hover:bg-primary-500/10'
                  }`}>
                  {p.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-7">
            <Link to="/pricing" className="text-sm font-semibold text-primary-400 hover:text-primary-300 underline underline-offset-4">
              Compare features across plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 relative z-10">
        <div className="absolute top-20 left-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-10">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
              <Star className="w-5 h-5 text-white" fill="currentColor" />
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-dark-50">Proven results on PANDA</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} {...fadeUp(i * 0.05)}
                className="bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-sm flex flex-col hover:border-primary-500/40 hover:shadow-[0_15px_40px_-12px_rgba(67,97,255,0.3)] transition-all relative overflow-hidden">
                <div className="absolute -top-px left-0 w-12 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-b" />
                <p className="text-sm text-dark-200 leading-relaxed flex-1">{t.quote}</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-dark-800">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-dark-100 truncate">{t.name}</div>
                    <div className="text-2xs text-primary-400">{t.company}</div>
                  </div>
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full shrink-0 object-cover ring-2 ring-primary-500/30" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── G2 badges ── */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp(0)} className="flex items-center justify-center gap-3 mb-10">
            <Shield className="w-7 h-7 text-primary-400" strokeWidth={1.8} />
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-dark-50">Trusted by growing businesses</h2>
          </motion.div>
          <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
            {BADGES.map((b, i) => (
              <motion.div key={b.label + i} {...fadeUp(i * 0.04)} className="relative w-24 sm:w-28">
                <div className="border-2 border-primary-500/30 rounded-md py-2 px-2 text-center bg-dark-900">
                  <div className="text-[8px] font-bold text-primary-300 tracking-widest leading-tight flex items-center justify-center gap-1">
                    {b.tag}
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                  </div>
                  <div className="text-sm font-bold font-display text-dark-100 leading-tight my-1">{b.label}</div>
                  <div className="text-[8px] font-bold text-dark-500 tracking-widest mt-1">{b.sub}</div>
                </div>
                <svg viewBox="0 0 100 30" className="w-full h-5 -mt-px">
                  <defs>
                    <linearGradient id={`rib${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4361ff" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <polygon points="0,0 100,0 100,5 50,30 0,5" fill={`url(#rib${i})`} opacity="0.85" />
                </svg>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 px-4 relative z-10">
        <motion.div {...fadeUp(0)}
          className="max-w-5xl mx-auto rounded-3xl overflow-hidden p-14 text-center relative shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #4361ff 0%, #6e3fff 50%, #a855f7 100%)' }}
        >
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 1px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 1px, transparent 2px)',
            backgroundSize: '50px 50px',
          }} />
          <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white mb-3 leading-tight">
            Find freelancers who can help you build what's next
          </h2>
          <p className="text-sm text-white/90 mb-7 max-w-md mx-auto">
            Join 500,000+ professionals who trust PANDA for their most important work.
          </p>
          <Link to="/freelancers"
            className="inline-block px-8 py-3 rounded-full bg-white text-primary-700 text-sm font-bold hover:bg-zinc-100 transition-all shadow-lg hover:scale-105">
            Explore freelancers
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-dark-900 border-t border-dark-800 py-14 px-4 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <PandaLogo className="w-5 h-5" invert />
                </div>
                <span className="font-black font-display text-dark-50 text-base tracking-widest uppercase">PANDA</span>
              </div>
              <p className="text-xs text-dark-500 max-w-xs leading-relaxed">
                The modern freelance marketplace that matches world-class talent with innovative businesses globally.
              </p>
            </div>
            {[
              { title: 'For Freelancers', links: ['Find Work', 'Create Profile', 'Community', 'Resources'] },
              { title: 'For Clients',     links: ['Post a Job', 'Find Talent', 'Managed Services', 'Enterprise'] },
              { title: 'Company',         links: ['About', 'Blog', 'Careers', 'Trust & Safety'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold text-dark-100 mb-4 tracking-wide">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link to={resolveFooter(l)} className="text-xs text-dark-500 hover:text-primary-300 transition-colors" >{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-dark-800 gap-4">
            <p className="text-xs text-dark-600">© 2026 PANDA. All rights reserved.</p>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <Link key={l} to={resolveFooter(l)} className="text-xs text-dark-600 hover:text-dark-400 transition-colors" >{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
