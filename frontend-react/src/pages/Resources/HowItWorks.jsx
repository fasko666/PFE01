import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PenSquare, Users, CheckCircle2, ArrowRight, Star,
  Play, Pause, Mic, MicOff, Video, Hand, MessageSquare, Phone, Maximize2,
  Sparkles, Code2, Scale, Calculator, Share2, Award, Trophy, Medal, ThumbsUp, Zap,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Three-step data ───────────────────────────────────────── */
const STEPS = [
  {
    icon: PenSquare,
    title: 'Post your project',
    desc: 'Answer a few guided prompts to craft your job post.',
  },
  {
    icon: Users,
    title: 'Hire experts',
    desc: 'AI-powered tools can help hone in on a qualified fit.',
  },
  {
    icon: CheckCircle2,
    title: 'Drive results',
    desc: 'Collaborate, receive work and pay securely.',
  },
];

/* ─── Confidence cards data ─────────────────────────────────── */
const CONFIDENCE = [
  { kind: 'portfolio', label: 'Review previous work',  desc: 'Browse freelancer portfolios to see real examples of their work.' },
  { kind: 'reviews',   label: 'See what others thought', desc: 'Read freelancer reviews to gauge their communication, reliability, and quality.' },
  { kind: 'call',      label: 'Talk to talent directly', desc: 'Message or video chat with freelancers to learn more about their experience and skills.' },
  { kind: 'ai',        label: 'Uma, PANDA\'s AI tool',  desc: 'Let Uma highlight what matters most in each profile, so choosing the right fit feels easier.' },
];

const CATEGORIES = [
  { name: 'Development & IT',     icon: Code2 },
  { name: 'Legal',                icon: Scale },
  { name: 'Finance & Accounting', icon: Calculator },
  { name: 'Social Media Marketing', icon: Share2 },
];

/* ─── G2-style award badges ─────────────────────────────────── */
const AWARDS = [
  { season: 'Best Software', year: '2026', label: 'Top 50',           sub: 'HR Products',     icon: Trophy, ringColor: 'from-red-500 to-orange-500' },
  { season: 'Spring 2026', year: '',       label: 'Leader',            sub: 'Small Business',  icon: Medal,   ringColor: 'from-yellow-400 to-amber-500' },
  { season: 'Spring 2026', year: '',       label: 'Best Results',      sub: 'Small Business',  icon: Zap,     ringColor: 'from-red-500 to-pink-500' },
  { season: 'Spring 2026', year: '',       label: 'Best Usability',    sub: 'Small Business',  icon: ThumbsUp,ringColor: 'from-yellow-400 to-amber-500' },
  { season: 'Spring 2026', year: '',       label: 'Most Implementable',sub: 'Small Business',  icon: Award,   ringColor: 'from-blue-400 to-indigo-500' },
  { season: 'Spring 2026', year: '',       label: 'Easiest Setup',     sub: 'Mid-Market',      icon: Medal,   ringColor: 'from-blue-400 to-indigo-500' },
  { season: 'Spring 2026', year: '',       label: 'Easiest To Use',    sub: 'Mid-Market',      icon: ThumbsUp,ringColor: 'from-yellow-400 to-amber-500' },
];

/* ─── Hero video-call mockup ────────────────────────────────── */
function HeroCallMockup() {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-dark-950 border border-dark-800 aspect-video shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)]">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black" />

      {/* 2 video tiles */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 md:px-12 grid grid-cols-2 gap-3 md:gap-6">
        {[
          { name: 'Karim B.', bg: 'from-amber-700/40 via-dark-800 to-dark-900' },
          { name: 'Elena R.', bg: 'from-rose-700/30 via-dark-800 to-dark-900',  ring: true },
        ].map((p) => (
          <div
            key={p.name}
            className={`relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br ${p.bg} ${p.ring ? 'ring-2 ring-green-400/80' : ''}`}
          >
            {/* fake avatar circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=4361ff&color=fff&size=200&bold=true`}
                alt={p.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full ring-4 ring-white/10 object-cover"
              />
            </div>
            {/* mic chip */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/50 backdrop-blur">
              <Mic className="w-3 h-3 text-white" strokeWidth={2.5} />
              <span className="text-2xs font-medium text-white">{p.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 px-6 pb-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-dark-400 font-medium">Project meet and greet</span>

          <div className="flex items-center gap-2">
            {[Mic, Video, Maximize2, Hand].map((Icon, i) => (
              <span key={i} className="w-8 h-8 rounded-full bg-dark-800/80 border border-dark-700 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-dark-200" strokeWidth={1.75} />
              </span>
            ))}
            <button className="px-4 h-8 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
              Leave
            </button>
          </div>

          <div className="flex items-center gap-2 text-dark-400">
            <span className="w-8 h-8 rounded-full bg-dark-800/80 border border-dark-700 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.75} />
            </span>
            <span className="w-8 h-8 rounded-full bg-dark-800/80 border border-dark-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </div>

      {/* Right-side player controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
        {[Play, Pause, MicOff].map((Icon, i) => (
          <span key={i} className="w-8 h-8 rounded-full bg-dark-800/80 border border-dark-700 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-dark-300" strokeWidth={1.75} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Confidence card mockups ───────────────────────────────── */
function ConfidenceVisual({ kind }) {
  if (kind === 'portfolio') {
    return (
      <div className="relative h-44 flex items-center justify-center">
        {/* fake portfolio card stack */}
        <div className="absolute w-32 h-40 rounded-xl bg-dark-800 border border-dark-700 rotate-[-8deg] shadow-xl" style={{ left: '20%' }}>
          <div className="p-2 space-y-1.5">
            <div className="h-12 rounded-md bg-gradient-to-br from-emerald-500/30 to-emerald-700/40" />
            <div className="h-1.5 rounded-full bg-dark-700" />
            <div className="h-1.5 rounded-full bg-dark-700 w-2/3" />
            <div className="h-1.5 rounded-full bg-dark-700 w-1/2" />
            <div className="h-6 rounded-md bg-emerald-500/20 mt-2" />
          </div>
        </div>
        <div className="absolute w-32 h-40 rounded-xl bg-dark-800 border border-dark-700 rotate-[6deg] shadow-xl" style={{ right: '20%' }}>
          <div className="p-2 space-y-1.5">
            <div className="h-12 rounded-md bg-gradient-to-br from-blue-500/30 to-indigo-700/40" />
            <div className="h-1.5 rounded-full bg-dark-700" />
            <div className="h-1.5 rounded-full bg-dark-700 w-3/4" />
            <div className="h-1.5 rounded-full bg-dark-700 w-1/2" />
            <div className="h-6 rounded-md bg-blue-500/20 mt-2" />
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'reviews') {
    return (
      <div className="h-44 flex items-center justify-center">
        <div className="w-full max-w-[260px] rounded-xl bg-dark-800 border border-dark-700 p-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <img
              src="https://ui-avatars.com/api/?name=Camille+M&background=ec4899&color=fff&size=80&bold=true"
              alt="Camille M"
              className="w-9 h-9 rounded-full"
            />
            <div className="flex-1">
              <div className="text-xs font-bold text-dark-100">Camille Moreau</div>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <span className="text-2xs font-semibold text-emerald-400">$280.00</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-1.5 rounded-full bg-dark-700" />
            <div className="h-1.5 rounded-full bg-dark-700 w-4/5" />
            <div className="h-1.5 rounded-full bg-dark-700 w-3/5" />
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'call') {
    return (
      <div className="h-44 flex items-center justify-center px-2">
        <div className="w-full rounded-xl bg-black border border-dark-700 aspect-video shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
            {[
              { n: 'Alex K.', c: 'from-amber-600/40 to-amber-900/50' },
              { n: 'Maya R.', c: 'from-rose-600/40 to-pink-900/50' },
            ].map((p) => (
              <div key={p.n} className={`relative rounded-lg bg-gradient-to-br ${p.c} flex items-center justify-center overflow-hidden`}>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.n)}&background=4361ff&color=fff&size=120&bold=true`}
                  className="w-14 h-14 rounded-full ring-2 ring-white/10"
                  alt={p.n}
                />
                <span className="absolute bottom-1 left-1 text-2xs text-white font-medium px-1.5 py-0.5 bg-black/50 backdrop-blur rounded">
                  {p.n}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  // ai
  return (
    <div className="h-44 flex items-center justify-center">
      <div className="w-full max-w-[260px] rounded-xl bg-dark-800 border border-dark-700 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://ui-avatars.com/api/?name=Susanna+W&background=7c3aed&color=fff&size=80&bold=true"
              alt="Susanna W."
              className="w-12 h-12 rounded-full"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 ring-2 ring-dark-800" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-dark-100">Susanna W.</div>
            <div className="text-2xs text-dark-500">Full-Stack Developer</div>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-500/15 border border-primary-500/30">
          <Sparkles className="w-3 h-3 text-primary-300" />
          <span className="text-2xs font-bold text-primary-300">Best Match</span>
        </div>
      </div>
    </div>
  );
}

/* ─── G2 Badge component ────────────────────────────────────── */
function G2Badge({ award }) {
  const Icon = award.icon;
  return (
    <div className="flex flex-col items-center text-center group cursor-default">
      <div className="relative">
        {/* Ribbon body */}
        <div className="relative w-[88px] h-[120px] bg-dark-900 border-2 border-dark-700 group-hover:border-primary-500/50 transition-colors"
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)' }}>
          {/* Top G2-style badge */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-7 h-5 rounded-sm bg-red-500 flex items-center justify-center">
            <span className="text-[8px] font-black text-white tracking-tight">G2</span>
          </div>
          <div className="pt-7 px-2 text-center">
            <div className="text-[7px] font-bold text-dark-500 tracking-widest uppercase">
              {award.season} {award.year}
            </div>
            <div className="mt-1 text-[10px] font-black text-dark-100 leading-tight">
              {award.label}
            </div>
            <div className="mt-1 text-[7px] font-semibold text-dark-500 tracking-wide uppercase">
              {award.sub}
            </div>
          </div>
          {/* Colored ring at bottom */}
          <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${award.ringColor}`}
               style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 80 }}>

      {/* ── Hero ── */}
      <section className="container-custom pt-10 pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold font-display text-dark-100 tracking-tight leading-[1.05] mb-4"
        >
          How <span className="gradient-text">PANDA</span> works
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base text-dark-400 max-w-2xl mx-auto"
        >
          From defining your project to managing work and payments, this is how to work on PANDA.
        </motion.p>

        {/* Hero video mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-4xl mx-auto mt-10"
        >
          <HeroCallMockup />
        </motion.div>

        {/* 3 steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-14">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.title} {...fadeUp(i * 0.08)} className="text-center">
                <div className="inline-flex w-12 h-12 rounded-2xl bg-dark-900 border border-dark-700 items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold font-display text-dark-100 mb-2">{s.title}</h3>
                <p className="text-xs text-dark-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div {...fadeUp(0.3)} className="mt-10">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
          >
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ── Feel confident ── */}
      <section className="py-20 border-y border-dark-800 bg-dark-900">
        <div className="container-custom">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-3">
              Feel confident in who you're hiring
            </h2>
            <p className="text-dark-400 text-sm">So the right choice feels clear, not complicated</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONFIDENCE.map((c, i) => (
              <motion.div
                key={c.kind}
                {...fadeUp(i * 0.07)}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-dark-800 bg-dark-950 hover:border-primary-500/30 transition-all overflow-hidden"
              >
                <div className="bg-dark-900/60 border-b border-dark-800">
                  <ConfidenceVisual kind={c.kind} />
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-dark-100 mb-2">{c.label}</h3>
                  <p className="text-xs text-dark-400 leading-relaxed">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business Plus banner ── */}
      <section className="py-20 bg-dark-950">
        <div className="container-custom max-w-5xl">
          <motion.div
            {...fadeUp(0)}
            className="grid md:grid-cols-[1.1fr_1fr] gap-0 rounded-3xl overflow-hidden border border-dark-800 bg-dark-900"
          >
            <div className="relative aspect-[5/4] md:aspect-auto bg-gradient-to-br from-amber-700/30 via-dark-900 to-dark-950 overflow-hidden flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop"
                alt="Person at desk"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark-950/30 to-transparent" />
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight mb-4">
                Try friction-free hiring with <span className="gradient-text">Business Plus</span>
              </h2>
              <p className="text-sm text-dark-400 mb-6">
                No sales calls, no subscription fees, no cost to join.
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
              >
                Explore Business Plus <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Small business, substantial impact ── */}
      <section className="py-20 border-t border-dark-800 bg-dark-950">
        <div className="container-custom">
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-3">
              Small business, substantial impact
            </h2>
            <p className="text-sm text-dark-400">Build your own skill-specific team across categories</p>
          </motion.div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {CATEGORIES.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div key={c.name} {...fadeUp(i * 0.05)}>
                  <Link
                    to="/freelancers"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-dark-700 bg-dark-900 text-xs font-semibold text-dark-200 hover:border-primary-500/50 hover:text-primary-300 hover:shadow-glow transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                    {c.name}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Testimonial video panel */}
          <motion.div {...fadeUp(0.1)} className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden border border-dark-800 aspect-video bg-gradient-to-br from-amber-700/20 via-dark-900 to-dark-950">
              <img
                src="https://images.unsplash.com/photo-1573497019703-fce64af0ad65?w=1200&auto=format&fit=crop"
                alt="Founder testimonial"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Play button overlay */}
              <button className="absolute inset-0 flex items-center justify-center group">
                <span className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-2xl transition-all group-hover:scale-110">
                  <Play className="w-6 h-6 text-dark-950 ml-1" fill="currentColor" />
                </span>
              </button>

              {/* Bottom controls */}
              <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                <span className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                  <Pause className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                </span>
                <span className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                  <MicOff className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trusted by growing businesses (G2 badges) ── */}
      <section className="py-20 border-t border-dark-800 bg-dark-900">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 text-center mb-12">
            Trusted by growing businesses
          </motion.h2>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {AWARDS.map((a, i) => (
              <motion.div key={i} {...fadeUp(i * 0.05)}>
                <G2Badge award={a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 bg-dark-950">
        <div className="container-custom">
          <motion.div
            {...fadeUp(0)}
            className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600"
          >
            <div className="absolute inset-0 bg-grid opacity-15" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-3 leading-tight">
                Ready to move from ideas
              </h2>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-8 leading-tight">
                to real results?
              </h2>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-primary-700 text-sm font-semibold hover:bg-dark-50 transition-all"
              >
                Get started today <ArrowRight className="w-4 h-4" />
              </Link>
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
                <span className="font-black font-display text-dark-100 text-base tracking-widest uppercase">PANDA</span>
              </div>
              <p className="text-xs text-dark-500 max-w-xs leading-relaxed">
                The AI-powered freelance marketplace that matches world-class talent with innovative businesses globally.
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
                      <a href="#" className="text-xs text-dark-500 hover:text-dark-300 transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-dark-800/60 gap-4">
            <p className="text-xs text-dark-600">© 2026 PANDA. All rights reserved.</p>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <a key={l} href="#" className="text-xs text-dark-600 hover:text-dark-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
