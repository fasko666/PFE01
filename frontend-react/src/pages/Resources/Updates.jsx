import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Sparkles, Calendar, FileText, Video,
  Users, MessageSquare, ArrowRight, Briefcase,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';
import ResourceSubNav from '../../components/layout/ResourceSubNav';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Inline social SVGs (lucide-react v1.16 lacks brand icons) ── */
const SHARE_ICONS = [
  { label: 'Facebook', d: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.24 0-1.63.78-1.63 1.58v1.88h2.78l-.44 2.9h-2.34V22c4.78-.8 8.44-4.94 8.44-9.94Z' },
  { label: 'LinkedIn', d: 'M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 18.34V10.6H5.67v7.74h2.67Zm-1.34-8.9a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1Zm11.34 8.9v-4.24c0-2.27-1.21-3.32-2.82-3.32-1.3 0-1.88.71-2.2 1.21V10.6h-2.66c.04.75 0 7.74 0 7.74h2.66v-4.32c0-.24.02-.48.09-.65.19-.48.62-.97 1.36-.97.95 0 1.34.73 1.34 1.8v4.14h2.23Z' },
  { label: 'X',        d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.69l-5.244-6.852L4.97 21.75H1.66l7.73-8.838L1.254 2.25h6.857l4.74 6.27 5.393-6.27Zm-1.16 17.55h1.833L7.084 4.126H5.117l11.967 15.674Z' },
];

/* ─── Sub-nav ───────────────────────────────────────────────── */
const SUBNAV = ['Resource Center', 'Categories', 'Content Types', 'Featured', 'More'];

/* ─── Related articles ──────────────────────────────────────── */
const RELATED = [
  {
    tag: 'Product & Innovation',
    title: 'PANDA Updates Summer 2025: AI Innovation that Amplifies Human Brilliance',
    date: 'July 23, 2025',
    img: 'from-cyan-500/30 via-blue-700/40 to-indigo-900',
    label: 'Artificial intelligence × Human brilliance',
  },
  {
    tag: 'Product & Innovation',
    title: 'PANDA Updates Fall 2024: AI Innovation and New Solutions for Better Work Outcomes',
    date: 'October 16, 2024',
    img: 'from-lime-500/30 via-green-700/40 to-emerald-900',
    label: 'Merge & Plus',
  },
];

/* ─── Footer columns ────────────────────────────────────────── */
const FOOTER_COLS = [
  {
    title: 'For Clients',
    items: ['How to hire', 'Talent Marketplace', 'Project Catalog', 'Hire an agency', 'Enterprise', 'Business Plus', 'Any hire', 'Contract-to-hire', 'Direct Contracts', 'Hire worldwide', 'Hire in the USA'],
  },
  {
    title: 'For Talent',
    items: ['How to find work', 'Direct Contracts', 'Find freelance jobs worldwide', 'Find freelance jobs in the USA', 'Win work with ads', 'Exclusive resources with Freelancer Plus'],
  },
  {
    title: 'Resources',
    items: ['Help & support', 'Success stories', 'PANDA reviews', 'Resources', 'Blog', 'Affiliate program', 'Refer a client', 'Free Business Tools', 'Release notes'],
  },
  {
    title: 'Company',
    items: ['About us', 'Leadership', 'Investor relations', 'Careers', 'Our impact', 'Press', 'Contact us', 'Partners', 'Trust, safety & security', 'Modern slavery statement'],
  },
];

/* ─── Hero dashboard mockup ─────────────────────────────────── */
function HeroDashboard() {
  return (
    <div className="relative aspect-[16/8] rounded-3xl overflow-hidden border border-dark-800 bg-gradient-to-br from-amber-900/40 via-dark-900 to-black shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]">
      {/* Background gradient suggesting a person silhouette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_30%,rgba(0,0,0,0.6)_100%)]" />

      {/* Monitor screen mockup */}
      <div className="absolute left-[6%] top-1/2 -translate-y-1/2 w-[55%] aspect-[16/10] rounded-xl bg-black border border-dark-700 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 to-black p-4 flex flex-col">
          <div className="text-2xs text-dark-500 mb-3">PANDA</div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs md:text-base font-bold text-white leading-tight">
                Grow at the speed<br />of your ambition
              </div>
              <div className="text-2xs text-dark-400 hidden md:block leading-relaxed">
                Hire experts who use AI to amplify how fast and impactful — turning everyone into a brand creator
              </div>
              <button className="hidden md:inline-flex mt-2 px-3 py-1 rounded-full bg-primary-500 text-white text-2xs font-semibold">
                Connect with an expert
              </button>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-primary-500/30 to-accent-500/30 border border-dark-700" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-3">
            <div className="h-3 rounded bg-dark-800" />
            <div className="h-3 rounded bg-dark-800" />
            <div className="h-3 rounded bg-dark-800" />
          </div>
        </div>
      </div>

      {/* Second monitor (code editor look) */}
      <div className="absolute right-[8%] top-[16%] w-[28%] aspect-[16/12] rounded-lg bg-black border border-dark-700 shadow-xl overflow-hidden">
        <div className="p-2 space-y-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-1.5">
              <div className="w-3 text-2xs text-dark-700 font-mono">{i + 1}</div>
              <div className={`h-1.5 rounded ${i % 3 === 0 ? 'bg-cyan-500/40' : i % 3 === 1 ? 'bg-purple-500/40' : 'bg-emerald-500/40'}`} style={{ width: `${30 + Math.random() * 50}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Headphones person silhouette gradient overlay */}
      <div className="absolute right-0 bottom-0 w-[40%] h-[70%] bg-gradient-to-t from-orange-700/30 via-amber-800/20 to-transparent pointer-events-none" />
    </div>
  );
}

/* ─── Body mockup for "Uma Recruiter shortlisting" ──────────── */
function UmaMockup() {
  return (
    <div className="relative aspect-video rounded-3xl overflow-hidden border border-dark-800 bg-black p-6 md:p-8 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-black to-dark-900" />
      <div className="relative grid grid-cols-2 gap-4 h-full">
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-2xs font-bold text-dark-100">Customizing My App Product</span>
          </div>
          <div className="text-2xs text-dark-500 mb-2">Template</div>
          <div className="flex items-center gap-2 text-2xs text-dark-400 mb-3">
            <span>$100</span>
            <span>$25,000/hr</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">4 hires</span>
          </div>
          <div className="text-2xs text-dark-500 leading-relaxed mb-2">
            May 1, 2023 → May 5, 2023
          </div>
          <div className="flex gap-1 flex-wrap">
            {['Restop', 'Loud', 'Web Design'].map((t) => (
              <span key={t} className="px-1.5 py-0.5 rounded bg-dark-800 text-2xs text-dark-300">{t}</span>
            ))}
          </div>
          <p className="text-2xs text-dark-400 leading-relaxed mt-3">
            <span className="font-semibold text-dark-100">Job description:</span> "Prototype and conduct user testing to ensure a smooth and intuitive user…"
          </p>
        </div>
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-4">
          <div className="text-2xs font-bold text-emerald-300 mb-2">Generated by Uma · PANDA's Mindful AI</div>
          <div className="text-2xs text-dark-500 mb-2">From recently completed jobs</div>
          <div className="mt-3">
            <div className="text-2xs font-semibold text-dark-100 mb-2">Skills used</div>
            <div className="flex gap-1 flex-wrap">
              {['Web Design', 'Wix', 'Node.js'].map((t) => (
                <span key={t} className="px-1.5 py-0.5 rounded-full bg-primary-500/15 text-primary-300 text-2xs font-medium">{t}</span>
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-1.5 rounded-full bg-dark-800" style={{ width: `${60 + Math.random() * 30}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Body mockup for "In-meeting contract generator" ───────── */
function ContractMockup() {
  return (
    <div className="relative aspect-video rounded-3xl overflow-hidden border border-dark-800 bg-black shadow-2xl">
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/90 text-2xs font-bold text-white">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> REC
      </div>
      <div className="grid grid-cols-2 h-full">
        {/* Video tile */}
        <div className="relative bg-gradient-to-br from-orange-700/30 via-dark-900 to-black flex items-center justify-center overflow-hidden">
          <img
            src="https://ui-avatars.com/api/?name=Alex+M&background=4361ff&color=fff&size=300&bold=true"
            alt=""
            className="w-32 h-32 md:w-44 md:h-44 rounded-full ring-4 ring-white/10"
          />
        </div>
        {/* Conversation guide panel */}
        <div className="bg-dark-900 border-l border-dark-700 p-5 ring-2 ring-lime-400/40">
          <div className="text-xs font-bold text-dark-100 mb-1">Conversation guide</div>
          <div className="text-2xs text-dark-500 mb-4 leading-relaxed">
            Discuss these topics, and Uma, PANDA's Mindful AI, will turn the details into a draft offer.
          </div>
          <div className="space-y-2.5">
            {[
              { t: 'Background',    s: 'Updated at 04:30 by Alex' },
              { t: 'Work',          s: 'Updated at 04:32 by Alex' },
              { t: 'Scope',         s: 'Updated at 04:35 by Alex' },
              { t: 'Success',       s: "What do you make this project a success?" },
            ].map((row) => (
              <div key={row.t} className="flex items-start gap-2 p-2 rounded-lg bg-dark-800/60 border border-dark-700/50">
                <span className="w-3.5 h-3.5 rounded-full border border-dark-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-2xs font-semibold text-dark-100">{row.t}</div>
                  <div className="text-2xs text-dark-500 mt-0.5 truncate">{row.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function Updates() {
  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 60 }}>

      <ResourceSubNav />

      {/* ── Article layout ── */}
      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-[1fr_220px] gap-10">

          {/* ── Article main column ── */}
          <article className="max-w-3xl">
            {/* Title block */}
            <motion.h1 {...fadeUp(0)} className="text-4xl md:text-5xl font-bold font-display text-primary-400 leading-[1.05] tracking-tight mb-7">
              PANDA Updates Spring 2026: Helping SMBs Get Work Done with AI
            </motion.h1>

            {/* Authors */}
            <motion.div {...fadeUp(0.05)} className="flex items-center gap-6 mb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://ui-avatars.com/api/?name=Lily+Ng&background=ec4899&color=fff&size=80&bold=true"
                  alt="Lily Ng"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-semibold text-dark-100">Lily Ng</span>
              </div>
              <div className="flex items-center gap-2.5">
                <img
                  src="https://ui-avatars.com/api/?name=Matt+Jaffe&background=4361ff&color=fff&size=80&bold=true"
                  alt="Matt Jaffe"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-semibold text-dark-100">Matt Jaffe</span>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="text-xs text-dark-500 mb-6">May 5, 2026</motion.div>

            {/* Breadcrumbs */}
            <motion.nav {...fadeUp(0.15)} className="flex items-center gap-2 text-xs text-dark-500 pb-4 border-b border-dark-800 mb-8">
              <Link to="/" className="hover:text-dark-200 transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-dark-300">PANDA Updates Spring 2026: Helping SMBs Get Work Done with AI</span>
            </motion.nav>

            {/* Hero image */}
            <motion.div {...fadeUp(0.2)} className="mb-10">
              <HeroDashboard />
            </motion.div>

            {/* Body */}
            <div className="space-y-6 text-sm text-dark-300 leading-relaxed">
              <motion.p {...fadeUp(0)}>
                <span className="text-dark-100">Small and medium-sized businesses (SMBs)</span> are building new products,
                entering new markets, and solving new complex challenges in the AI era, often with
                lean teams and <span className="text-dark-100">limited time.</span>
              </motion.p>

              <motion.p {...fadeUp(0)}>
                The challenge isn't ambition. It's execution.{' '}
                <span className="text-emerald-400 font-semibold">Nearly half of SMBs say</span> finding
                qualified talent is one of their biggest challenges, and more are turning to independent
                professionals as a way to stay agile and navigate today's tough macro environment.<sup>1</sup>
              </motion.p>

              <motion.p {...fadeUp(0)}>
                Take it from <span className="text-emerald-400 font-semibold">Omic</span>, a small
                business using AI to accelerate drug discovery and end disease, that relies on highly
                specialized expertise that is difficult to source through traditional hiring. With
                PANDA, their search for the right experts went from months to days, and they were
                able to operate at a much larger scale than their in-house team alone would allow.
              </motion.p>

              <motion.p {...fadeUp(0)} className="font-semibold text-dark-100">
                PANDA Updates Spring 2026 is designed for these businesses.
              </motion.p>

              {/* Section 1 */}
              <motion.h2 {...fadeUp(0)} className="text-2xl md:text-3xl font-bold font-display text-dark-100 pt-6 leading-tight">
                Uma leads what's new for SMBs
              </motion.h2>

              <motion.p {...fadeUp(0)}>
                PANDA Updates Spring 2026 introduces new capabilities powered by <span className="text-dark-100 font-semibold">Uma™</span>,
                PANDA's AI work agent, developed to help SMBs find, hire, and work with independent
                talent more effectively. It also brings a more intelligent platform experience, with
                a reimagined homepage and simpler navigation that make the full value of PANDA easier
                to unlock.
              </motion.p>

              <motion.div {...fadeUp(0.05)} className="my-8">
                <UmaMockup />
              </motion.div>

              <motion.ul {...fadeUp(0)} className="space-y-4 list-disc pl-5 marker:text-primary-500">
                <li>
                  <span className="font-semibold text-dark-100">Uma Recruiter shortlisting</span> — Uma
                  automatically identifies and surfaces the most relevant professionals for a project
                  based on requirements and past work. Currently available to Business Plus clients,
                  this feature is now available in the Basic plan, and delivers a curated list of
                  top-matching talent within six hours.
                </li>
                <li>
                  <span className="font-semibold text-dark-100">PANDA app in ChatGPT</span> — Talent
                  discovery and first steps toward hiring can{' '}
                  <span className="text-emerald-400 font-semibold">now happen directly within ChatGPT</span>.
                  Businesses can explore experts and move toward hiring without leaving the
                  conversation where the idea was hatched.
                </li>
              </motion.ul>

              {/* Quote */}
              <motion.blockquote {...fadeUp(0)} className="border-l-4 border-primary-500 pl-5 my-8 italic text-dark-200">
                <p className="text-dark-300 mb-3">
                  As Matt Klein, digital director at Keiser Corporation, a fitness equipment manufacturer
                  in California, put it:
                </p>
                <p className="text-base text-dark-100 not-italic font-display">
                  "Having access to top-tier freelancers on PANDA — we were able to identify and hire
                  a strong contractor for a major initiative almost immediately. That early success
                  gave us the confidence to lean further into the platform."
                </p>
              </motion.blockquote>

              {/* Section 2 */}
              <motion.h2 {...fadeUp(0)} className="text-2xl md:text-3xl font-bold font-display text-dark-100 pt-6 leading-tight">
                Working: Start sooner and stay on track
              </motion.h2>

              <motion.p {...fadeUp(0)}>
                Hiring faster is only part of the equation. Keeping work moving once a project begins
                is just as important, and managing freelance work isn't always straightforward. Our
                research shows that{' '}
                <span className="text-emerald-400 font-semibold">managing freelancer relationships</span> remains
                a top challenge for smaller companies, while speed to complete projects matters for
                teams that can't afford delays.
              </motion.p>

              <motion.p {...fadeUp(0)}>
                The new features in our Spring 2026 release — including enhancements in{' '}
                <span className="text-emerald-400 font-semibold">Business Plus</span>, our premium
                offering for growing SMBs — help businesses move from scoping conversations to
                execution, and stay aligned throughout.
              </motion.p>

              <motion.h3 {...fadeUp(0)} className="text-base font-bold text-dark-100 pt-4">What's new:</motion.h3>

              <motion.ul {...fadeUp(0)} className="space-y-4 list-disc pl-5 marker:text-primary-500">
                <li>
                  <span className="font-semibold text-dark-100">In-meeting contract generator</span> —
                  Key details from PANDA video meetings are captured, and Uma uses them to guide the
                  development of a contract, helping businesses and talent move from discussion to
                  hire faster. PANDA video meetings now also include faster AI-produced recaps,
                  transcripts, and mobile compatibility.
                </li>
              </motion.ul>

              <motion.div {...fadeUp(0.05)} className="my-8">
                <ContractMockup />
              </motion.div>
            </div>
          </article>

          {/* ── Share sidebar (sticky) ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <div className="rounded-2xl bg-dark-900 border border-dark-800 p-5">
                <div className="text-xs font-bold text-dark-100 mb-4">Share</div>
                <div className="flex items-center gap-2.5">
                  {SHARE_ICONS.map((s) => (
                    <a key={s.label} href="#" aria-label={s.label}
                       className="w-9 h-9 rounded-full border border-dark-700 flex items-center justify-center text-dark-300 hover:text-primary-300 hover:border-primary-500/50 transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d={s.d} /></svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Related articles ── */}
      <section className="py-16 border-t border-dark-800 bg-dark-950">
        <div className="container-custom max-w-5xl">
          <motion.h2 {...fadeUp(0)} className="text-2xl font-bold font-display text-dark-100 mb-8">
            More from the blog
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-5">
            {RELATED.map((r, i) => (
              <motion.article key={r.title} {...fadeUp(i * 0.07)} whileHover={{ y: -6 }}
                className="group rounded-2xl overflow-hidden border border-dark-800 bg-dark-900 hover:border-primary-500/40 transition-all cursor-pointer">
                <div className={`relative aspect-video bg-gradient-to-br ${r.img} flex items-center justify-center p-8`}>
                  <div className="absolute inset-0 bg-grid opacity-10" />
                  <div className="relative text-base md:text-lg font-bold font-display text-white text-center leading-tight">
                    {r.label}
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-2xs font-semibold text-primary-400 uppercase tracking-widest">{r.tag}</span>
                  <h3 className="text-base font-bold font-display text-dark-100 leading-tight mt-2 mb-3 group-hover:text-primary-300 transition-colors">
                    {r.title}
                  </h3>
                  <div className="text-xs text-dark-500">{r.date}</div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join the marketplace ── */}
      <section className="py-20 bg-dark-950">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10 text-center">
            Join the world's work marketplace
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            <motion.div {...fadeUp(0.05)} className="rounded-3xl overflow-hidden border border-dark-800 bg-dark-900">
              <div className="aspect-[16/9] bg-gradient-to-br from-emerald-700/30 via-emerald-900/40 to-dark-950 flex items-center justify-center relative">
                {/* Illustration: handshake + document */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-emerald-300" strokeWidth={1.25} />
                  </div>
                  <Sparkles className="absolute -top-3 -right-3 w-5 h-5 text-amber-300" />
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-lg md:text-xl font-bold font-display text-dark-100 mb-5 leading-tight">
                  Find talent your way and get things done.
                </h3>
                <Link to="/register"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
                  Find Talent <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="rounded-3xl overflow-hidden border border-dark-800 bg-dark-900">
              <div className="aspect-[16/9] bg-gradient-to-br from-stone-700/30 via-stone-900/40 to-dark-950 flex items-center justify-center relative">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-stone-500/15 border border-stone-500/30 flex items-center justify-center">
                    <Briefcase className="w-10 h-10 text-stone-300" strokeWidth={1.25} />
                  </div>
                  <Sparkles className="absolute -top-3 -right-3 w-5 h-5 text-amber-300" />
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-lg md:text-xl font-bold font-display text-dark-100 mb-5 leading-tight">
                  Find work you love with like-minded clients.
                </h3>
                <Link to="/jobs"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
                  Find Work <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Big dark footer ── */}
      <footer className="bg-black border-t border-dark-800 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-dark-100 mb-4 tracking-wide">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.items.map((l) => (
                    <li key={l}><a href="#" className="text-xs text-dark-400 hover:text-dark-100 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2.5 pt-8 border-t border-dark-800">
            <div className="w-7 h-7 bg-dark-900 rounded-lg flex items-center justify-center ring-1 ring-white/10">
              <PandaLogo className="w-5 h-5" invert />
            </div>
            <span className="font-black font-display text-dark-100 text-base tracking-widest uppercase">PANDA</span>
            <span className="ml-auto text-2xs text-dark-600">© 2026 PANDA. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
