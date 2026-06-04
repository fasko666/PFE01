import { Link } from 'react-router-dom';
import { resolveFooter } from '../../utils/footerLinks';
import { motion } from 'framer-motion';
import {
  Globe, Sparkles, MessageSquare, Palette, Zap, TrendingUp,
  ArrowRight, CheckCircle2, Building2,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Data ──────────────────────────────────────────────────── */
const OUTCOMES = [
  {
    icon: Globe,
    title: 'Build my website',
    desc: 'Web design, development and more.',
    bullets: ['Custom websites & landing pages', 'WordPress / Shopify / Webflow', 'Mobile-first responsive design'],
    cta: 'Start a website project',
    href: '/get-outcomes/build-website',
    color: 'from-blue-500/20 to-cyan-500/10',
    accent: 'text-blue-300',
    border: 'hover:border-blue-500/40',
  },
  {
    icon: Palette,
    title: 'Design my brand',
    desc: 'Logo, brand identity and more.',
    bullets: ['Logos & visual identity', 'Brand guidelines & systems', 'Marketing creative assets'],
    cta: 'Brief a brand designer',
    color: 'from-pink-500/20 to-rose-500/10',
    accent: 'text-pink-300',
    border: 'hover:border-pink-500/40',
  },
  {
    icon: TrendingUp,
    title: 'Scale my paid ad campaigns',
    desc: 'Growth marketing, media strategy and more.',
    bullets: ['Meta · Google · TikTok ads', 'Creative testing & iteration', 'Performance dashboards'],
    cta: 'Hire a growth marketer',
    href: '/get-outcomes/scale-paid-ads',
    color: 'from-emerald-500/20 to-green-500/10',
    accent: 'text-emerald-300',
    border: 'hover:border-emerald-500/40',
  },
  {
    icon: Zap,
    title: 'Automate my workflows',
    desc: 'Planning, integration, AI agents and more.',
    bullets: ['Zapier / n8n / Make.com', 'Custom AI agent pipelines', 'API & system integrations'],
    cta: 'Build an automation',
    color: 'from-amber-500/20 to-yellow-500/10',
    accent: 'text-amber-300',
    border: 'hover:border-amber-500/40',
  },
  {
    icon: MessageSquare,
    title: 'Handle customer support with AI',
    desc: 'Chatbots, AI agents, systems and more.',
    bullets: ['LLM-powered support agents', 'Knowledge base & RAG setup', 'Intercom / Zendesk / Crisp'],
    cta: 'Deploy an AI support agent',
    href: '/get-outcomes/handle-support',
    color: 'from-violet-500/20 to-purple-500/10',
    accent: 'text-violet-300',
    border: 'hover:border-violet-500/40',
  },
  {
    icon: Sparkles,
    title: 'Build my sales pipeline',
    desc: 'Lead generation, AI outreach and more.',
    bullets: ['Outbound list building', 'Cold email / LinkedIn automation', 'CRM hygiene & playbooks'],
    cta: 'Hire a pipeline specialist',
    color: 'from-indigo-500/20 to-blue-500/10',
    accent: 'text-indigo-300',
    border: 'hover:border-indigo-500/40',
  },
];

const STEPS = [
  { num: '01', title: 'Tell us the outcome', desc: 'Describe the result you want — not the role, the role we figure out.' },
  { num: '02', title: 'We assemble the team', desc: 'Vetted PANDA specialists matched by skill, availability and timezone.' },
  { num: '03', title: 'You approve the plan',  desc: 'Fixed scope, fixed milestones, fixed price. No surprise hours.' },
  { num: '04', title: 'Ship and pay on delivery', desc: 'Escrow holds funds until every milestone is approved by you.' },
];

const FOOTER_COLS = [
  { title: 'For Clients', items: ['How to hire', 'Talent Marketplace', 'Project Catalog', 'Hire an agency', 'Enterprise', 'Business Plus', 'Any hire', 'Contract-to-hire', 'Direct Contracts', 'Hire worldwide', 'Hire in the USA'] },
  { title: 'For Talent', items: ['How to find work', 'Direct Contracts', 'Find freelance jobs worldwide', 'Find freelance jobs in the USA', 'Win work with ads', 'Exclusive resources with Freelancer Plus'] },
  { title: 'Resources', items: ['Help & support', 'Success stories', 'PANDA reviews', 'Resources', 'Blog', 'Affiliate program', 'Refer a client', 'Free Business Tools', 'Release notes'] },
  { title: 'Company', items: ['About us', 'Leadership', 'Investor relations', 'Careers', 'Our impact', 'Press', 'Contact us', 'Partners', 'Trust, safety & security', 'Modern slavery statement'] },
];

/* ─── Outcome card ──────────────────────────────────────────── */
function OutcomeCard({ outcome, delay }) {
  const Icon = outcome.icon;
  return (
    <motion.div
      {...fadeUp(delay)}
      whileHover={{ y: -6 }}
      className={`group rounded-3xl border border-dark-800 bg-dark-900 p-7 transition-all ${outcome.border} hover:shadow-[0_25px_60px_-15px_rgba(67,97,255,0.25)]`}
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${outcome.color} border border-dark-700 flex items-center justify-center mb-5`}>
        <Icon className={`w-6 h-6 ${outcome.accent}`} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold font-display text-dark-100 leading-tight mb-2 group-hover:text-primary-300 transition-colors">
        {outcome.title}
      </h3>
      <p className="text-sm text-dark-400 leading-relaxed mb-5">{outcome.desc}</p>
      <ul className="space-y-2 mb-6">
        {outcome.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-dark-300 leading-relaxed">
            <CheckCircle2 className={`w-3.5 h-3.5 ${outcome.accent} shrink-0 mt-0.5`} strokeWidth={2} />
            {b}
          </li>
        ))}
      </ul>
      <Link
        to={outcome.href || '/freelancers'}
        className="inline-flex items-center gap-2 text-xs font-semibold text-primary-400 hover:text-primary-300 group-hover:gap-3 transition-all"
      >
        {outcome.cta} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function GetOutcomes() {
  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 80 }}>

      {/* ── Hero ── */}
      <section className="container-custom pt-10 pb-16">
        <div className="grid lg:grid-cols-[1fr_360px] gap-12 items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-300 text-xs font-medium mb-7"
            >
              <Sparkles className="w-3 h-3" />
              Drive larger-scale work
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold font-display text-dark-100 tracking-tight leading-[1.05] mb-5"
            >
              Get the <span className="gradient-text">outcomes</span>,<br />not just the hours.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base text-dark-400 leading-relaxed max-w-xl"
            >
              Build specialized teams of vetted PANDA freelancers for complex projects.
              Pick the outcome you want — we handle the staffing, scoping, and delivery.
            </motion.p>
          </div>

          {/* Right intro card mirroring the Upwork mega-menu left pane */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl border border-dark-800 bg-dark-900 p-7"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5 text-primary-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-dark-100 mb-2">Drive larger-scale work</h3>
            <p className="text-xs text-dark-400 leading-relaxed mb-5">
              Build specialized teams for complex projects — assembled, managed, and delivered for you.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
            >
              Talk to PANDA <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Outcomes grid (matches mega-menu layout) ── */}
      <section className="container-custom pb-20">
        <motion.div {...fadeUp(0)} className="mb-10">
          <div className="text-2xs font-bold text-primary-400 uppercase tracking-widest mb-3">Outcomes</div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-dark-100">
            Pick the result. We'll deliver it.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {OUTCOMES.map((o, i) => (
            <OutcomeCard key={o.title} outcome={o} delay={i * 0.06} />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 border-t border-dark-800 bg-dark-900">
        <div className="container-custom">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <div className="text-2xs font-bold text-primary-400 uppercase tracking-widest mb-3">How outcomes work</div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-dark-100">
              Four steps. Zero surprises.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                {...fadeUp(i * 0.07)}
                className="rounded-2xl border border-dark-800 bg-dark-950 p-6"
              >
                <div className="text-3xl font-bold font-mono text-primary-400 mb-4">{s.num}</div>
                <h3 className="text-sm font-bold text-dark-100 mb-2 leading-tight">{s.title}</h3>
                <p className="text-xs text-dark-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-dark-950">
        <div className="container-custom">
          <motion.div
            {...fadeUp(0)}
            className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600"
          >
            <div className="absolute inset-0 bg-grid opacity-15" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-5">
                Ready to scope your outcome?
              </h2>
              <p className="text-white/80 text-sm md:text-base mb-8 max-w-xl mx-auto">
                Tell us what you want delivered. We'll match you with the right team in 24 hours.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/jobs/post" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-primary-700 text-sm font-semibold hover:bg-dark-50 transition-all">
                  Post a project <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/pricing" className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 backdrop-blur transition-all">
                  See pricing
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black border-t border-dark-800 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-dark-100 mb-4 tracking-wide">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.items.map((l) => (
                    <li key={l}><Link to={resolveFooter(l)} className="text-xs text-dark-400 hover:text-dark-100 transition-colors" >{l}</Link></li>
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
