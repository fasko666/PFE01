import { useState } from 'react';
import { resolveFooter } from '../../utils/footerLinks';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Clock, CheckCircle2, BadgeCheck, ArrowRight, DollarSign,
  PenSquare, Users, Sparkles, ChevronDown, Briefcase, FileText,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Data ──────────────────────────────────────────────────── */
const TABS = ['Workflow Automation', 'Chatbot Automation', 'AI Support Systems'];

const EXPERTS = {
  'Workflow Automation': [
    {
      name: 'Nick G.',
      specialty: 'AI, ML & Data Science Expert',
      badge: 'Expert-Vetted',
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      badgeIcon: '🥇',
      rating: 5.0,
      rate: '$150',
      jobs: 175,
      review: 'Nick was excellent to work with! He took the time to understand the problem … provided feedback on how AI/ML can be utilized to automate the process.',
      reviewerInitials: 'CM',
      reviewerName: 'Christopher M.',
      avatar: 'https://ui-avatars.com/api/?name=Nick+G&background=4361ff&color=fff&size=400&bold=true',
    },
    {
      name: 'Elizabeth Alexandra D.',
      specialty: 'AI Automation Specialist | n8n & Custom AI Dev',
      badge: 'Top Rated Plus',
      badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      badgeIcon: '🏆',
      rating: 4.9,
      rate: '$67',
      jobs: 111,
      review: 'Highly recommended writer who can understand the scope and intent without a lot of direction.',
      reviewerInitials: 'SA',
      reviewerName: 'Shawn A.',
      avatar: 'https://ui-avatars.com/api/?name=Elizabeth+Alexandra+D&background=ec4899&color=fff&size=400&bold=true',
    },
    {
      name: 'Dhruv B.',
      specialty: 'AI Automation Expert | n8n & GHL',
      badge: 'Top Rated Plus',
      badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      badgeIcon: '🏆',
      rating: 5.0,
      rate: '$100',
      jobs: 30,
      review: 'Dhruv did an outstanding job … identifying better approaches, refining the structure, and making the system more scalable and effective.',
      reviewerInitials: 'JU',
      reviewerName: 'Jim U.',
      avatar: 'https://ui-avatars.com/api/?name=Dhruv+B&background=059669&color=fff&size=400&bold=true',
    },
  ],
  'Chatbot Automation': [
    {
      name: 'Aiko M.',
      specialty: 'LLM Chatbot Developer | OpenAI · Anthropic',
      badge: 'Top Rated Plus',
      badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      badgeIcon: '🏆',
      rating: 5.0,
      rate: '$135',
      jobs: 218,
      review: 'Aiko built our entire support chatbot in 10 days. Deflection rate hit 62% in the first month. Exceptional work.',
      reviewerInitials: 'RB',
      reviewerName: 'Rachel B.',
      avatar: 'https://ui-avatars.com/api/?name=Aiko+M&background=0891b2&color=fff&size=400&bold=true',
    },
    {
      name: 'Tomás R.',
      specialty: 'Conversational AI Engineer | Voiceflow · Dialogflow',
      badge: 'Expert-Vetted',
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      badgeIcon: '🥇',
      rating: 4.9,
      rate: '$110',
      jobs: 142,
      review: 'Tomás designed a complex multi-intent flow that just works. Customers actually thank the bot instead of asking for a human.',
      reviewerInitials: 'JK',
      reviewerName: 'Jamie K.',
      avatar: 'https://ui-avatars.com/api/?name=Tomas+R&background=f59e0b&color=fff&size=400&bold=true',
    },
    {
      name: 'Hana P.',
      specialty: 'Intercom & Zendesk Bot Specialist',
      badge: 'Top Rated',
      badgeColor: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
      badgeIcon: '⭐',
      rating: 5.0,
      rate: '$85',
      jobs: 364,
      review: 'Hana migrated our entire help center to a Resolution Bot in two weeks. Tickets dropped 40%.',
      reviewerInitials: 'NV',
      reviewerName: 'Noah V.',
      avatar: 'https://ui-avatars.com/api/?name=Hana+P&background=8b5cf6&color=fff&size=400&bold=true',
    },
  ],
  'AI Support Systems': [
    {
      name: 'Mateo F.',
      specialty: 'RAG & Knowledge Base Engineer',
      badge: 'Expert-Vetted',
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      badgeIcon: '🥇',
      rating: 5.0,
      rate: '$140',
      jobs: 96,
      review: 'Mateo set up our RAG pipeline over 4,000 help docs. Answers are accurate and the hallucination rate is essentially zero.',
      reviewerInitials: 'KC',
      reviewerName: 'Kira C.',
      avatar: 'https://ui-avatars.com/api/?name=Mateo+F&background=10b981&color=fff&size=400&bold=true',
    },
    {
      name: 'Yara T.',
      specialty: 'Support Ops Architect | LangChain · Zapier',
      badge: 'Top Rated',
      badgeColor: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
      badgeIcon: '⭐',
      rating: 4.9,
      rate: '$95',
      jobs: 187,
      review: 'Yara automated our entire ticket triage with AI. Response time went from 12 hours to 3 minutes.',
      reviewerInitials: 'AP',
      reviewerName: 'Ava P.',
      avatar: 'https://ui-avatars.com/api/?name=Yara+T&background=ef4444&color=fff&size=400&bold=true',
    },
    {
      name: 'Bashar D.',
      specialty: 'AI Voice Agent Developer | Vapi · Retell',
      badge: 'Top Rated Plus',
      badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      badgeIcon: '🏆',
      rating: 4.8,
      rate: '$120',
      jobs: 73,
      review: 'Bashar built an inbound voice agent that handles 80% of our calls. Customers say they cannot tell it apart from a human.',
      reviewerInitials: 'EL',
      reviewerName: 'Eli L.',
      avatar: 'https://ui-avatars.com/api/?name=Bashar+D&background=7c3aed&color=fff&size=400&bold=true',
    },
  ],
};

const PROJECTS = [
  {
    title: 'Build a 24/7 AI support agent for our SaaS',
    skills: ['LLM', 'RAG', '+3'],
    desc: "We need a chatbot trained on our help center to handle Tier-1 questions and route Tier-2/3 to humans with context.",
    pricing: 'Fixed-price', budget: '$5,500.00',
    duration: '1 to 2 months', level: 'Advanced',
  },
  {
    title: 'Automate ticket triage and routing',
    skills: ['Zapier', 'n8n', 'OpenAI', '+2'],
    desc: 'Build an automation that classifies incoming tickets, sets priority, assigns owner, and drafts an initial reply.',
    pricing: 'Hourly', budget: '$95/hr',
    duration: '2 to 3 months', level: 'Intermediate level',
  },
  {
    title: 'Migrate from Zendesk to AI-first support stack',
    skills: ['Intercom', 'Fin AI', '+4'],
    desc: 'Move our entire support workflow to an AI-first platform. Migration, agent training, and reporting dashboards required.',
    pricing: 'Fixed-price', budget: '$9,000.00',
    duration: '3 to 5 months', level: 'Expert level',
  },
];

const HOW_IT_WORKS = [
  { icon: PenSquare,    title: 'Browse experts',       desc: 'Answer guided prompts to craft your job post.' },
  { icon: Users,        title: 'Hire and collaborate', desc: 'Smart tools help you hone in on the most qualified fit fast.' },
  { icon: CheckCircle2, title: 'Drive results',        desc: 'Collaborate, receive work and pay securely.' },
];

const BRANDS = ['Calendly', 'SEMRUSH', 'toast', 'coinbase', 'zapier', 'wayfair', 'datajoi'];

const TAKEAWAYS = [
  {
    quote: "We discovered CTO-level expertise on the platform — someone who had already served as a startup CTO — willing to contribute to our open-source project. That kind of talent brings tremendous value to us.",
    name: 'Saswata Basu',
    role: 'Züs, CEO',
    avatar: 'https://ui-avatars.com/api/?name=Saswata+Basu&background=4361ff&color=fff&size=200&bold=true',
  },
  {
    quote: "PANDA isn't just a hiring platform for us — it's a strategic partner. It's helped us fill every technical gap, accelerate our delivery from months to weeks, and even bring on leaders who've become foundational to our business.",
    name: 'David Wrench',
    role: 'Datajoi, Co-Founder and CEO',
    avatar: 'https://ui-avatars.com/api/?name=David+Wrench&background=10b981&color=fff&size=200&bold=true',
  },
  {
    quote: "PANDA is paramount to the success that we've had. We can't accomplish what we do without our PANDA staff … it's awkward for me to say PANDA or freelancer staff, because we fully consider them part of our team.",
    name: 'Bryan Goltzman',
    role: 'Liquid Screen Design, CEO',
    avatar: 'https://ui-avatars.com/api/?name=Bryan+Goltzman&background=f59e0b&color=fff&size=200&bold=true',
  },
];

const FAQ = [
  { q: 'What does an AI support system actually replace?',
    a: 'A well-built AI support system can take over Tier-1 questions (password resets, order status, billing FAQs, basic product questions), route Tier-2 to the right human with full context, and draft replies for Tier-3. The goal is not to eliminate the team — it is to free them to do work only humans can do.' },
  { q: 'How long does it take to deploy an AI support agent?',
    a: 'For a chatbot trained on existing help content, expect 2–4 weeks for a production-ready agent. RAG-based systems with custom integrations to your ticket platform take 4–8 weeks. Voice agents and multi-channel deployments can take 8–12 weeks.' },
  { q: 'Will customers know they are talking to AI?',
    a: 'Yes — and you should be transparent about it. The best implementations announce the agent up-front and offer a clear "talk to a human" escape hatch. CSAT is consistently higher when customers feel in control of the handoff.' },
  { q: 'How much does it cost to build an AI support system?',
    a: 'A solid chatbot trained on your help center runs $3K–$8K to build and $50–$300/month to operate (LLM tokens). Full RAG + ticket automation + voice usually lands $10K–$30K plus monthly platform fees. Most clients break even on agent labor savings in 2–6 months.' },
];

const FOOTER_COLS = [
  { title: 'For Clients', items: ['How to hire', 'Talent Marketplace', 'Project Catalog', 'Hire an agency', 'Enterprise', 'Business Plus', 'Any hire', 'Contract-to-hire', 'Direct Contracts', 'Hire worldwide', 'Hire in the USA'] },
  { title: 'For Talent', items: ['How to find work', 'Direct Contracts', 'Find freelance jobs worldwide', 'Find freelance jobs in the USA', 'Win work with ads', 'Exclusive resources with Freelancer Plus'] },
  { title: 'Resources', items: ['Help & support', 'Success stories', 'PANDA reviews', 'Resources', 'Blog', 'Affiliate program', 'Refer a client', 'Free Business Tools', 'Release notes'] },
  { title: 'Company', items: ['About us', 'Leadership', 'Investor relations', 'Careers', 'Our impact', 'Press', 'Contact us', 'Partners', 'Trust, safety & security', 'Modern slavery statement'] },
];

/* ─── Reused sub-components (identical to BuildWebsite/ScalePaidAds) ── */
function ExpertCard({ expert, delay }) {
  return (
    <motion.div {...fadeUp(delay)} whileHover={{ y: -6 }}
      className="rounded-3xl overflow-hidden border border-dark-800 bg-dark-900 hover:border-primary-500/40 hover:shadow-[0_25px_60px_-15px_rgba(67,97,255,0.25)] transition-all flex flex-col">
      <div className="aspect-square overflow-hidden bg-dark-800">
        <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="text-base font-bold font-display text-dark-100">{expert.name}</h3>
          <BadgeCheck className="w-4 h-4 text-primary-400" />
        </div>
        <p className="text-xs text-dark-400 mb-4 leading-snug">{expert.specialty}</p>
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-2xs font-semibold ${expert.badgeColor}`}>
              <span>{expert.badgeIcon}</span>{expert.badge}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-dark-400">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span><span className="text-dark-200 font-semibold">{expert.rating}</span> client rating</span>
          </div>
          <div className="flex items-center gap-1.5 text-dark-400">
            <DollarSign className="w-3.5 h-3.5 text-dark-500" />
            <span><span className="text-dark-200 font-semibold">{expert.rate}</span>/hr rate</span>
          </div>
          <div className="flex items-center gap-1.5 text-dark-400">
            <Briefcase className="w-3.5 h-3.5 text-dark-500" />
            <span><span className="text-dark-200 font-semibold">{expert.jobs}</span> total jobs</span>
          </div>
        </div>
        <div className="rounded-xl bg-dark-800/60 border border-dark-700/50 p-4 mb-4 flex-1">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
            <span className="ml-1 text-2xs font-bold text-dark-300">5.0</span>
          </div>
          <p className="text-2xs text-dark-300 leading-relaxed italic mb-3">"{expert.review}"</p>
          <div className="flex items-center gap-2 pt-2 border-t border-dark-700/50">
            <span className="w-5 h-5 rounded-full bg-dark-700 text-2xs font-bold text-dark-200 flex items-center justify-center">{expert.reviewerInitials}</span>
            <span className="text-2xs text-dark-300 font-medium">{expert.reviewerName}</span>
          </div>
        </div>
        <button className="w-full py-2.5 rounded-full border border-primary-500/50 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 hover:border-primary-500 transition-all">
          Add to your team
        </button>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, delay }) {
  return (
    <motion.div {...fadeUp(delay)} className="rounded-3xl border border-dark-800 bg-dark-900 p-6 hover:border-primary-500/40 transition-all">
      <h3 className="text-lg font-bold font-display text-dark-100 leading-tight mb-3">{project.title}</h3>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.skills.map((s, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-full text-2xs font-medium ${s.startsWith('+') ? 'bg-dark-800 text-dark-400' : 'bg-primary-500/10 text-primary-300 border border-primary-500/30'}`}>{s}</span>
        ))}
      </div>
      <p className="text-xs text-dark-400 leading-relaxed mb-5">{project.desc}</p>
      <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs mb-5 pt-4 border-t border-dark-800">
        <div className="flex items-center gap-1.5 text-dark-300"><FileText className="w-3.5 h-3.5 text-dark-500" />{project.pricing}</div>
        <div className="flex items-center gap-1.5 text-dark-300"><DollarSign className="w-3.5 h-3.5 text-dark-500" />{project.budget}</div>
        <div className="flex items-center gap-1.5 text-dark-300"><Clock className="w-3.5 h-3.5 text-dark-500" />{project.duration}</div>
        <div className="flex items-center gap-1.5 text-dark-300"><Sparkles className="w-3.5 h-3.5 text-dark-500" />{project.level}</div>
      </div>
      <button className="w-full py-2.5 rounded-full border border-primary-500/50 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 hover:border-primary-500 transition-all">Post a job like this</button>
    </motion.div>
  );
}

function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <div className="rounded-3xl bg-dark-900 border border-dark-800 p-8 md:p-12">
      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight">Questions you<br />might have</h2>
        <div className="divide-y divide-dark-800">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="py-5">
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full text-left flex items-start justify-between gap-4 group">
                  <h3 className="text-sm md:text-base font-bold text-dark-100 group-hover:text-primary-300 transition-colors leading-snug">{item.q}</h3>
                  <ChevronDown className={`w-4 h-4 text-dark-500 shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <p className="text-xs md:text-sm text-dark-400 leading-relaxed pt-3">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function HandleSupport() {
  const [tab, setTab] = useState('Workflow Automation');
  const experts = EXPERTS[tab];

  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 80 }}>

      {/* Hero */}
      <section className="container-custom pt-10 pb-14 text-center">
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold font-display text-dark-100 tracking-tight leading-[1.05] mb-5">
          Build <span className="gradient-text">support</span> that runs like clockwork
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base text-dark-400 max-w-2xl mx-auto mb-8">
          Hire a team of experts to set up AI systems that manage inquiries, resolve issues, and respond to customers 24/7.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <Link to="/jobs/post" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
            Build your team <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 mt-10 text-sm">
          <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span className="text-dark-100 font-bold">4.8</span><span className="text-dark-400">avg. client rating</span></div>
          <span className="hidden md:block w-px h-5 bg-dark-700" />
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-dark-400" /><span className="text-dark-100 font-bold">3 days</span><span className="text-dark-400">avg. time to hire</span></div>
          <span className="hidden md:block w-px h-5 bg-dark-700" />
          <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-dark-400" /><span className="text-dark-100 font-bold">9,700+</span><span className="text-dark-400">projects completed</span></div>
        </motion.div>
      </section>

      {/* Experts */}
      <section className="container-custom pb-20">
        <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 text-center mb-8">
          Human expertise for every part of your AI automation
        </motion.h2>
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-full border border-dark-800 bg-dark-900 gap-1">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative px-5 py-2 rounded-full text-xs font-semibold transition-colors ${tab === t ? 'text-primary-300' : 'text-dark-400 hover:text-dark-200'}`}>
                {tab === t && <motion.span layoutId="sup-tab" className="absolute inset-0 rounded-full bg-primary-500/15 border border-primary-500/40" />}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {experts.map((e, i) => <ExpertCard key={e.name} expert={e} delay={i * 0.06} />)}
        </div>
      </section>

      {/* Projects */}
      <section className="py-20 border-t border-dark-800 bg-dark-900">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">
            Support automation projects <span className="text-dark-400 font-normal">— currently in flight</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-5">
            {PROJECTS.map((p, i) => <ProjectCard key={p.title} project={p} delay={i * 0.06} />)}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-dark-800 bg-dark-950">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100">How it works</motion.h2>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary-500/40 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 transition-all">Get the full picture</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.title} {...fadeUp(i * 0.07)} className="rounded-2xl border border-dark-800 bg-dark-900 p-7">
                  <Icon className="w-6 h-6 text-primary-400 mb-5" strokeWidth={1.5} />
                  <h3 className="text-base font-bold font-display text-dark-100 mb-2">{s.title}</h3>
                  <p className="text-xs text-dark-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agency banner */}
      <section className="py-12 bg-dark-950">
        <div className="container-custom">
          <motion.div {...fadeUp(0)} className="relative rounded-3xl overflow-hidden border border-dark-800 aspect-[16/5] bg-gradient-to-br from-amber-700/30 via-dark-900 to-dark-950">
            <img src="https://images.unsplash.com/photo-1521119989659-a83eee488004?w=1600&auto=format&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/70 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 md:px-12">
              <div className="max-w-md">
                <h3 className="text-2xl md:text-3xl font-bold font-display text-white leading-tight mb-2">High-stakes work?</h3>
                <h3 className="text-2xl md:text-3xl font-bold font-display text-white leading-tight mb-4">Consider an agency</h3>
                <p className="text-sm text-dark-200 mb-5 max-w-sm">A vetted team or agency can tackle complex work end-to-end — with minimal management required.</p>
                <Link to="/agencies" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
                  Hire an agency <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-16 border-y border-dark-800 bg-dark-900">
        <div className="container-custom">
          <p className="text-center text-2xs text-dark-500 tracking-[0.3em] uppercase mb-8">Trusted by 800,000 growing businesses</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {BRANDS.map((b) => <span key={b} className="text-base font-display font-bold text-dark-400 hover:text-dark-100 transition-colors">{b}</span>)}
          </div>
        </div>
      </section>

      {/* Takeaways */}
      <section className="py-20 bg-dark-950">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">
            Takeaways <span className="text-dark-400 font-normal">— from businesses like yours</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TAKEAWAYS.map((t, i) => (
              <motion.div key={t.name} {...fadeUp(i * 0.07)} className="rounded-3xl border border-dark-800 bg-dark-900 p-7 flex flex-col">
                <p className="text-sm text-dark-200 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-dark-800">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div><div className="text-sm font-bold text-dark-100">{t.name}</div><div className="text-xs text-dark-500">{t.role}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-dark-950">
        <div className="container-custom"><FAQSection /></div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-dark-950">
        <div className="container-custom">
          <motion.div {...fadeUp(0)} className="relative rounded-3xl overflow-hidden p-14 md:p-20 text-center bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600">
            <div className="absolute inset-0 bg-grid opacity-15" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-7">Build the team who can build what's next</h2>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-emerald-700 text-sm font-semibold hover:bg-dark-50 transition-all">
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-dark-800 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-dark-100 mb-4 tracking-wide">{col.title}</h4>
                <ul className="space-y-2.5">{col.items.map((l) => <li key={l}><Link to={resolveFooter(l)} className="text-xs text-dark-400 hover:text-dark-100 transition-colors" >{l}</Link></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2.5 pt-8 border-t border-dark-800">
            <div className="w-7 h-7 bg-dark-900 rounded-lg flex items-center justify-center ring-1 ring-white/10"><PandaLogo className="w-5 h-5" invert /></div>
            <span className="font-black font-display text-dark-100 text-base tracking-widest uppercase">PANDA</span>
            <span className="ml-auto text-2xs text-dark-600">© 2026 PANDA. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
