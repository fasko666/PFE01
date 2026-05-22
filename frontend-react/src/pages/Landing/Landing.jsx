import { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ArrowRight, Shield, MessageSquare, BarChart3,
  Award, Globe, Sparkles, ChevronRight, Star, CheckCircle2,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

const HeroScene3D     = lazy(() => import('../../components/ui/HeroScene3D'));
const Scene3DBackdrop = lazy(() => import('../../components/ui/Scene3DBackdrop'));
const CategoryIcon3D  = lazy(() => import('../../components/ui/CategoryIcon3D'));

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

const STATS = [
  { value: '500K+', label: 'Freelancers' },
  { value: '200K+', label: 'Projects posted' },
  { value: '$2B+',  label: 'Paid out' },
  { value: '98%',   label: 'Success rate' },
];

const CATEGORIES = [
  { name: 'Development & IT',      kind: 'dev',     count: '48K+' },
  { name: 'Design & Creative',     kind: 'design',  count: '35K+' },
  { name: 'AI & Machine Learning', kind: 'ai',      count: '12K+' },
  { name: 'Sales & Marketing',     kind: 'sales',   count: '29K+' },
  { name: 'Writing & Translation', kind: 'writing', count: '22K+' },
  { name: 'Finance & Accounting',  kind: 'finance', count: '18K+' },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    desc: 'Smart algorithms analyze skills, history, and project requirements to surface the perfect match every time.',
    color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30',
  },
  {
    icon: Shield,
    title: 'Escrow Protection',
    desc: 'Funds are held securely until work is approved. Every transaction is protected by our payment guarantee.',
    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30',
  },
  {
    icon: MessageSquare,
    title: 'Instant Collaboration',
    desc: 'Real-time messaging, file sharing, and milestone tracking keep projects moving forward seamlessly.',
    color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    desc: 'Track earnings, project performance, and market trends through a comprehensive analytics dashboard.',
    color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30',
  },
  {
    icon: Award,
    title: 'Verified Credentials',
    desc: 'Identity-verified profiles and performance badges help you identify top talent instantly.',
    color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30',
  },
  {
    icon: Globe,
    title: 'Global Marketplace',
    desc: 'Access talent from 190+ countries with multi-currency support and localized payment methods.',
    color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Full-Stack Developer',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+M&background=4361ff&color=fff&size=80',
    text: 'PANDA transformed my freelance career. The AI proposal generator saves me hours, and clients consistently rate me 5 stars.',
    rating: 5,
    badge: '$82K earned',
    badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    name: 'James R.',
    role: 'Tech Startup CEO',
    avatar: 'https://ui-avatars.com/api/?name=James+R&background=7c3aed&color=fff&size=80',
    text: 'We built our entire product with freelancers from PANDA. The quality is incredible and escrow gives us total peace of mind.',
    rating: 5,
    badge: '47 hired',
    badgeColor: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    name: 'Aisha K.',
    role: 'UI/UX Designer',
    avatar: 'https://ui-avatars.com/api/?name=Aisha+K&background=ec4899&color=fff&size=80',
    text: 'Best platform for designers. Portfolio tools are beautiful, clients are serious, and payments are always on time.',
    rating: 5,
    badge: '$56K earned',
    badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('hire');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(activeTab === 'hire'
        ? `/freelancers?search=${encodeURIComponent(searchQuery)}`
        : `/jobs?search=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 64 }}>

      {/* ── HERO with full 3D scene ── */}
      <section className="relative pt-10 pb-24 overflow-hidden bg-dark-950 min-h-[760px]">
        {/* Full-bleed 3D backdrop visible behind everything */}
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <div className="absolute inset-0 opacity-90">
              <HeroScene3D />
            </div>
          </Suspense>
          {/* Gradient masks so text stays readable on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-transparent to-dark-950" />
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[640px]">

            {/* Left: text + search + stats */}
            <div className="relative z-10">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-300 text-xs font-medium mb-7 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse shrink-0" />
                  Immersive 3D · AI-Powered Marketplace
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-5xl md:text-6xl font-bold font-display text-white leading-[1.07] tracking-tight mb-5 drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)]"
              >
                Hire world-class<br />talent.{' '}
                <span className="gradient-text">Land great work.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-base text-dark-300 mb-8 max-w-lg leading-relaxed"
              >
                PANDA connects businesses with world-class freelancers through AI‑powered matching, secure escrow payments, and real-time collaboration tools — now in an immersive 3D experience.
              </motion.p>

              {/* Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mb-5"
              >
                <div className="bg-dark-900/70 backdrop-blur-xl border border-dark-800 rounded-2xl p-2 shadow-2xl">
                  <div className="flex gap-1 mb-2.5 px-1.5 pt-0.5">
                    {[['hire', 'Hire Talent'], ['work', 'Find Work']].map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => setActiveTab(v)}
                        className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === v ? 'bg-primary-500/20 text-primary-300' : 'text-dark-500 hover:text-dark-200'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" strokeWidth={2} />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        type="text"
                        placeholder={activeTab === 'hire' ? 'React developer, UI designer…' : 'Find jobs by skill, category…'}
                        className="w-full pl-9 pr-3 py-2.5 bg-dark-800/80 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 border border-dark-700 transition-all"
                      />
                    </div>
                    <button type="submit" className="btn-primary btn px-5 text-sm rounded-xl">Search</button>
                  </form>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {['React', 'Node.js', 'UI/UX', 'AI Engineer', 'Laravel', 'Motion Design'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => navigate(`/jobs?search=${tag}`)}
                      className="px-3 py-1 bg-dark-900/60 backdrop-blur border border-dark-800 rounded-lg text-xs text-dark-400 hover:border-primary-500/40 hover:text-dark-200 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-4 gap-px bg-dark-700/60 rounded-2xl overflow-hidden border border-dark-700 backdrop-blur-md"
              >
                {STATS.map((s) => (
                  <div key={s.label} className="bg-dark-950/70 px-4 py-3.5 text-center">
                    <div className="text-lg font-bold font-display text-white">{s.value}</div>
                    <div className="text-2xs text-dark-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: empty (3D model lives in full-bleed background) */}
            <div className="hidden lg:block" />
          </div>
        </div>

        {/* scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-2xs text-dark-400 tracking-[0.3em] uppercase font-mono"
        >
          ↓ scroll to explore
        </motion.div>
      </section>

      {/* ── Categories with 3D icons ── */}
      <section className="relative py-20 bg-dark-950 overflow-hidden">
        <div className="container-custom relative z-10">
          <motion.div {...fadeUp(0)} className="mb-12 text-center">
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest mb-3">Categories</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">Browse in 3D</h2>
            <p className="text-dark-400 text-sm max-w-lg mx-auto">Thousands of verified specialists across every discipline, ready to start</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} {...fadeUp(i * 0.05)}>
                <Link
                  to={`/freelancers?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center p-5 rounded-2xl border border-dark-800 bg-dark-900/40 backdrop-blur-sm hover:bg-dark-900/80 hover:border-primary-500/30 hover:scale-[1.04] hover:shadow-[0_20px_60px_-15px_rgba(67,97,255,0.3)] transition-all duration-300 cursor-pointer group text-center"
                >
                  <Suspense fallback={<div className="w-16 h-16" />}>
                    <CategoryIcon3D kind={cat.kind} />
                  </Suspense>
                  <div className="text-xs font-semibold text-white group-hover:text-primary-300 leading-tight mt-2">{cat.name}</div>
                  <div className="text-2xs text-dark-500 mt-1.5">{cat.count} freelancers</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features with 3D backdrop ── */}
      <section className="relative py-24 border-y border-dark-800 bg-dark-900 overflow-hidden" id="how">
        <Suspense fallback={null}>
          <div className="opacity-50">
            <Scene3DBackdrop preset="features" />
          </div>
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/60 via-transparent to-dark-900/60 pointer-events-none" />

        <div className="container-custom relative z-10">
          <motion.div {...fadeUp(0)} className="mb-16 text-center">
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">Everything you need to succeed</h2>
            <p className="text-dark-400 text-sm max-w-lg mx-auto">Built for modern freelancers and forward-thinking businesses</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  {...fadeUp(i * 0.07)}
                  whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="relative bg-dark-950/70 backdrop-blur-xl border border-dark-800 rounded-2xl p-6 shadow-xl hover:border-primary-500/30 hover:shadow-[0_25px_60px_-15px_rgba(67,97,255,0.35)] transition-all duration-300 group"
                >
                  <div className={`w-11 h-11 rounded-xl border ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${f.color}`} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-dark-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works with 3D backdrop ── */}
      <section className="relative py-24 bg-dark-950 overflow-hidden" id="pricing">
        <Suspense fallback={null}>
          <div className="opacity-60">
            <Scene3DBackdrop preset="how" />
          </div>
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-950/40 to-dark-950 pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp(0)}>
              <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest mb-4">How it works</p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-8 leading-tight">
                Hiring made<br /><span className="gradient-text">brilliantly simple</span>
              </h2>
              <div className="space-y-6">
                {[
                  { num: '01', title: 'Post your job for free',       desc: 'Describe your project, set your budget, and publish in under 5 minutes.' },
                  { num: '02', title: 'Review AI-matched proposals',  desc: 'Our smart algorithm surfaces the best-fit candidates for your specific needs.' },
                  { num: '03', title: 'Collaborate with confidence',  desc: 'Chat, share files, and track milestones in your secure workspace.' },
                  { num: '04', title: 'Pay only when satisfied',      desc: 'Release escrow funds only when work is approved. Zero risk.' },
                ].map((step, i) => (
                  <motion.div key={step.num} {...fadeUp(i * 0.08)} className="flex gap-4 items-start">
                    <div className="w-9 h-9 shrink-0 bg-primary-500/15 border border-primary-500/30 rounded-lg flex items-center justify-center text-xs font-bold text-primary-300 font-mono backdrop-blur-md">{step.num}</div>
                    <div>
                      <div className="text-sm font-semibold text-white mb-1">{step.title}</div>
                      <div className="text-xs text-dark-400 leading-relaxed">{step.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link to="/register" className="btn-primary btn-lg btn mt-8 inline-flex gap-2">
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* 3D floating preview card */}
            <motion.div {...fadeUp(0.15)} className="relative hidden lg:block" style={{ perspective: 1200 }}>
              <motion.div
                animate={{ rotateY: [-4, 4, -4], rotateX: [3, -3, 3] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative bg-dark-900/80 backdrop-blur-xl border border-dark-800 rounded-2xl p-5 space-y-4 shadow-[0_40px_80px_-15px_rgba(67,97,255,0.4)]"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-dark-800">
                  <div className="w-9 h-9 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">AI Match Found</div>
                    <div className="text-xs text-dark-400">3 top candidates · 98% match</div>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/30 text-green-300 text-2xs font-semibold">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Live
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { role: 'React Developer', rate: '$95/hr', score: '99%' },
                    { role: 'Node.js Expert',  rate: '$85/hr', score: '97%' },
                    { role: 'UI/UX Designer',  rate: '$80/hr', score: '95%' },
                  ].map((c) => (
                    <div key={c.role} className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-800/60 border border-dark-700/40">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.role)}&background=4361ff&color=fff&size=32`}
                        className="w-8 h-8 rounded-full"
                        alt={c.role}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white">{c.role}</div>
                        <div className="text-2xs text-dark-400">{c.rate}</div>
                      </div>
                      <span className="text-2xs text-green-400 font-semibold">{c.score}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1 text-xs">Invite to apply</button>
                  <button className="btn btn-ghost btn-sm flex-1 text-xs text-dark-300">View all</button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials with 3D backdrop ── */}
      <section className="relative py-24 bg-dark-900 border-y border-dark-800 overflow-hidden">
        <Suspense fallback={null}>
          <div className="opacity-40">
            <Scene3DBackdrop preset="testimonials" />
          </div>
        </Suspense>
        <div className="container-custom relative z-10">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">Loved by creators worldwide</h2>
            <p className="text-dark-400 text-sm">Join 500,000+ professionals who trust PANDA for their most important work</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                {...fadeUp(i * 0.1)}
                whileHover={{ y: -6 }}
                className="bg-dark-950/70 backdrop-blur-xl border border-dark-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-center gap-0.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-dark-200 leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-3 pt-2 border-t border-dark-800">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">{t.name}</div>
                    <div className="text-2xs text-dark-400">{t.role}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-2xs font-semibold border ${t.badgeColor}`}>{t.badge}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA with full 3D backdrop ── */}
      <section className="relative py-32 overflow-hidden bg-dark-950">
        <Suspense fallback={null}>
          <Scene3DBackdrop preset="cta" />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.div {...fadeUp(0)}>
            <h2 className="text-4xl md:text-6xl font-bold font-display text-white mb-5 leading-tight tracking-tight drop-shadow-2xl">
              Ready to build something<br /><span className="gradient-text">extraordinary?</span>
            </h2>
            <p className="text-dark-300 text-base mb-10 max-w-xl mx-auto leading-relaxed">
              Join 500,000+ professionals who trust PANDA for their most important work.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/register" className="btn-primary btn-lg btn inline-flex gap-2 shadow-[0_20px_60px_-15px_rgba(67,97,255,0.6)]">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/freelancers" className="btn-secondary btn-lg btn inline-flex gap-2 backdrop-blur-md">
                Explore talent <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-5 mt-8 flex-wrap">
              {['Free to join', 'No monthly fees', 'Pay only when you hire'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-dark-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-dark-900 border-t border-dark-800/60 py-14">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center ring-1 ring-white/10">
                  <PandaLogo className="w-5 h-5" invert />
                </div>
                <span className="font-black font-display text-white text-base tracking-widest uppercase">PANDA</span>
              </div>
              <p className="text-xs text-dark-400 max-w-xs leading-relaxed">
                The AI-powered freelance marketplace that matches world-class talent with innovative businesses globally — now in immersive 3D.
              </p>
            </div>
            {[
              { title: 'For Freelancers', links: ['Find Work', 'Create Profile', 'Community', 'Resources'] },
              { title: 'For Clients',     links: ['Post a Job', 'Find Talent', 'Managed Services', 'Enterprise'] },
              { title: 'Company',         links: ['About', 'Blog', 'Careers', 'Trust & Safety'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold text-white mb-4 tracking-wide">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-xs text-dark-400 hover:text-dark-200 transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-dark-800/60 gap-4">
            <p className="text-xs text-dark-500">© 2026 PANDA. All rights reserved.</p>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <a key={l} href="#" className="text-xs text-dark-500 hover:text-dark-300 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
