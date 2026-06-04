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
const TABS = ['Strategy & Planning', 'Channel Execution', 'Creative & Conversion'];

const EXPERTS = {
  'Strategy & Planning': [
    {
      name: 'Kathleen L.',
      specialty: 'Growth Marketing Expert',
      badge: 'Top Rated Plus',
      badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      badgeIcon: '🏆',
      rating: 4.9,
      rate: '$170',
      jobs: 27,
      review: 'Kathleen and her team are incredible … a wonderful group of humans that can take your project where you need it to go and beyond!',
      reviewerInitials: 'MC',
      reviewerName: 'Melody C.',
      avatar: 'https://ui-avatars.com/api/?name=Kathleen+L&background=d97706&color=fff&size=400&bold=true',
    },
    {
      name: 'April B.',
      specialty: 'Paid Media Strategist | Digital Marketer',
      badge: 'Expert-Vetted',
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      badgeIcon: '🥇',
      rating: 5.0,
      rate: '$80',
      jobs: 24,
      review: 'Working with April was such a great experience! … a smart PPC strategy that brought us strong results.',
      reviewerInitials: 'CC',
      reviewerName: 'Cassie C.',
      avatar: 'https://ui-avatars.com/api/?name=April+B&background=4361ff&color=fff&size=400&bold=true',
    },
    {
      name: 'Daniel B.',
      specialty: 'Paid Digital Media Strategist',
      badge: 'Expert-Vetted',
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      badgeIcon: '🥇',
      rating: 5.0,
      rate: '$100',
      jobs: 95,
      review: 'Daniel was absolutely incredible … The results we generated from our Facebook ad campaigns were exactly what we needed.',
      reviewerInitials: 'CF',
      reviewerName: 'Cameron F.',
      avatar: 'https://ui-avatars.com/api/?name=Daniel+B&background=059669&color=fff&size=400&bold=true',
    },
  ],
  'Channel Execution': [
    {
      name: 'Marcus T.',
      specialty: 'Google Ads & Search Specialist',
      badge: 'Top Rated Plus',
      badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      badgeIcon: '🏆',
      rating: 5.0,
      rate: '$135',
      jobs: 412,
      review: 'Marcus rebuilt our Search account from the ground up. Quality score is up across every campaign and CPA dropped 30%.',
      reviewerInitials: 'EL',
      reviewerName: 'Erin L.',
      avatar: 'https://ui-avatars.com/api/?name=Marcus+T&background=0891b2&color=fff&size=400&bold=true',
    },
    {
      name: 'Sara V.',
      specialty: 'Meta & TikTok Ads Buyer',
      badge: 'Expert-Vetted',
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      badgeIcon: '🥇',
      rating: 4.9,
      rate: '$110',
      jobs: 187,
      review: "Sara's creative testing framework cut our CAC in half within 90 days. Best media buyer we've ever worked with.",
      reviewerInitials: 'JT',
      reviewerName: 'Julian T.',
      avatar: 'https://ui-avatars.com/api/?name=Sara+V&background=ec4899&color=fff&size=400&bold=true',
    },
    {
      name: 'Devon R.',
      specialty: 'YouTube & Programmatic Lead',
      badge: 'Top Rated',
      badgeColor: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
      badgeIcon: '⭐',
      rating: 5.0,
      rate: '$95',
      jobs: 121,
      review: 'Devon built our full-funnel YouTube strategy from cold to retargeting. ROAS hit 4× in month two.',
      reviewerInitials: 'AM',
      reviewerName: 'Anna M.',
      avatar: 'https://ui-avatars.com/api/?name=Devon+R&background=8b5cf6&color=fff&size=400&bold=true',
    },
  ],
  'Creative & Conversion': [
    {
      name: 'Imani O.',
      specialty: 'Performance Creative Director',
      badge: 'Top Rated Plus',
      badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      badgeIcon: '🏆',
      rating: 5.0,
      rate: '$140',
      jobs: 215,
      review: 'Imani delivered 30 ad variants in two weeks. Three of them became our best-performing creatives ever.',
      reviewerInitials: 'TS',
      reviewerName: 'Tom S.',
      avatar: 'https://ui-avatars.com/api/?name=Imani+O&background=10b981&color=fff&size=400&bold=true',
    },
    {
      name: 'Liam K.',
      specialty: 'Landing Page & CRO Designer',
      badge: 'Expert-Vetted',
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      badgeIcon: '🥇',
      rating: 4.9,
      rate: '$120',
      jobs: 88,
      review: "Liam shipped a new landing page that lifted conversion by 38% in one week. Process was tight, comms were great.",
      reviewerInitials: 'PG',
      reviewerName: 'Priya G.',
      avatar: 'https://ui-avatars.com/api/?name=Liam+K&background=f59e0b&color=fff&size=400&bold=true',
    },
    {
      name: 'Reina S.',
      specialty: 'UGC & Video Ads Producer',
      badge: 'Top Rated',
      badgeColor: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
      badgeIcon: '⭐',
      rating: 4.8,
      rate: '$85',
      jobs: 263,
      review: 'Reina sources, scripts, and edits our UGC creator output. Saves us a full-time hire and the work is on-brand every time.',
      reviewerInitials: 'BV',
      reviewerName: 'Ben V.',
      avatar: 'https://ui-avatars.com/api/?name=Reina+S&background=ef4444&color=fff&size=400&bold=true',
    },
  ],
};

const PROJECTS = [
  {
    title: 'Build a full paid ads engine to drive growth (B2B / SaaS)',
    skills: ['Paid Strategy', 'Google Ads', '+2'],
    desc: "We're looking for a team to plan, launch, and scale paid campaigns. This includes strategy, campaign setup, audience targeting.",
    pricing: 'Fixed-price', budget: '$7,000.00',
    duration: '1 to 3 months', level: 'Advanced',
  },
  {
    title: 'Launch and scale a new product with paid ads',
    skills: ['Meta Ads', 'Ad creative', 'Google Ads', '+3'],
    desc: "We're looking for a team to plan, launch, and scale paid campaigns for a new product, covering messaging, creative, and testing.",
    pricing: 'Hourly', budget: '$170/hr',
    duration: '2 to 4 months', level: 'Advanced level',
  },
  {
    title: 'Fix under-performance and reduce wasted spend',
    skills: ['Campaign Optimization', 'Analytics', '+5'],
    desc: 'Audit and improve existing campaigns, refining targeting, budgets, and tracking to reduce wasted spend, boost efficiency, and drive ROI.',
    pricing: 'Fixed-price', budget: '$3,000.00',
    duration: '3 to 6 months', level: 'Expert level',
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
  {
    q: 'How do I scale my paid ads?',
    a: "Scaling paid ads isn't just about increasing budget. It requires tightening your targeting, improving creative, optimizing landing pages, and building a feedback loop between what you spend and what converts. Most businesses hit a ceiling when one of those legs isn't pulling its weight — a strategist can diagnose the bottleneck before you spend more.",
  },
  {
    q: 'Should I manage paid ads myself or hire someone?',
    a: "DIY works when you're testing a channel for the first time or running small budgets. Once you're spending enough that inefficiency has a real cost, or you're running across multiple platforms, hiring specialists pays for itself. A PPC consultant or full media buyer typically returns 2–4× their fee in saved ad spend within the first 90 days.",
  },
  {
    q: 'How much should I spend on paid ads?',
    a: "There's no universal answer, but a useful starting point is to work backward from your target cost per acquisition and customer lifetime value rather than picking a budget number first. A performance marketer or Google Ads expert can model what your minimum testing budget needs to be to get a statistically meaningful signal in your category.",
  },
  {
    q: 'Can PANDA help me scale my paid campaigns?',
    a: "Scaling paid ads requires more than one skill set, and PANDA has all of them. You can hire a media buyer to own spend and strategy, a Google Ads expert or Facebook ads specialist for channel-specific execution, a performance marketer to coordinate across the funnel, plus dedicated UGC creators, landing-page designers, and analysts to keep the feedback loop tight.",
  },
];

const FOOTER_COLS = [
  { title: 'For Clients', items: ['How to hire', 'Talent Marketplace', 'Project Catalog', 'Hire an agency', 'Enterprise', 'Business Plus', 'Any hire', 'Contract-to-hire', 'Direct Contracts', 'Hire worldwide', 'Hire in the USA'] },
  { title: 'For Talent', items: ['How to find work', 'Direct Contracts', 'Find freelance jobs worldwide', 'Find freelance jobs in the USA', 'Win work with ads', 'Exclusive resources with Freelancer Plus'] },
  { title: 'Resources', items: ['Help & support', 'Success stories', 'PANDA reviews', 'Resources', 'Blog', 'Affiliate program', 'Refer a client', 'Free Business Tools', 'Release notes'] },
  { title: 'Company', items: ['About us', 'Leadership', 'Investor relations', 'Careers', 'Our impact', 'Press', 'Contact us', 'Partners', 'Trust, safety & security', 'Modern slavery statement'] },
];

/* ─── Expert card ───────────────────────────────────────────── */
function ExpertCard({ expert, delay }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      whileHover={{ y: -6 }}
      className="rounded-3xl overflow-hidden border border-dark-800 bg-dark-900 hover:border-primary-500/40 hover:shadow-[0_25px_60px_-15px_rgba(67,97,255,0.25)] transition-all flex flex-col"
    >
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
              <span>{expert.badgeIcon}</span>
              {expert.badge}
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
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="ml-1 text-2xs font-bold text-dark-300">5.0</span>
          </div>
          <p className="text-2xs text-dark-300 leading-relaxed italic mb-3">"{expert.review}"</p>
          <div className="flex items-center gap-2 pt-2 border-t border-dark-700/50">
            <span className="w-5 h-5 rounded-full bg-dark-700 text-2xs font-bold text-dark-200 flex items-center justify-center">
              {expert.reviewerInitials}
            </span>
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

/* ─── Project card ──────────────────────────────────────────── */
function ProjectCard({ project, delay }) {
  return (
    <motion.div {...fadeUp(delay)} className="rounded-3xl border border-dark-800 bg-dark-900 p-6 hover:border-primary-500/40 transition-all">
      <h3 className="text-lg font-bold font-display text-dark-100 leading-tight mb-3">{project.title}</h3>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.skills.map((s, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-full text-2xs font-medium ${
            s.startsWith('+') ? 'bg-dark-800 text-dark-400' : 'bg-primary-500/10 text-primary-300 border border-primary-500/30'
          }`}>
            {s}
          </span>
        ))}
      </div>
      <p className="text-xs text-dark-400 leading-relaxed mb-5">{project.desc}</p>
      <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs mb-5 pt-4 border-t border-dark-800">
        <div className="flex items-center gap-1.5 text-dark-300">
          <FileText className="w-3.5 h-3.5 text-dark-500" />
          {project.pricing}
        </div>
        <div className="flex items-center gap-1.5 text-dark-300">
          <DollarSign className="w-3.5 h-3.5 text-dark-500" />
          {project.budget}
        </div>
        <div className="flex items-center gap-1.5 text-dark-300">
          <Clock className="w-3.5 h-3.5 text-dark-500" />
          {project.duration}
        </div>
        <div className="flex items-center gap-1.5 text-dark-300">
          <Sparkles className="w-3.5 h-3.5 text-dark-500" />
          {project.level}
        </div>
      </div>
      <button className="w-full py-2.5 rounded-full border border-primary-500/50 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 hover:border-primary-500 transition-all">
        Post a job like this
      </button>
    </motion.div>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <div className="rounded-3xl bg-dark-900 border border-dark-800 p-8 md:p-12">
      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight">
          Questions you<br />might have
        </h2>
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
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs md:text-sm text-dark-400 leading-relaxed pt-3">{item.a}</p>
                      <button className="text-xs font-semibold text-primary-400 hover:text-primary-300 mt-3">Read more</button>
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
export default function ScalePaidAds() {
  const [tab, setTab] = useState('Strategy & Planning');
  const experts = EXPERTS[tab];

  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 80 }}>

      {/* ── Hero ── */}
      <section className="container-custom pt-10 pb-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold font-display text-dark-100 tracking-tight leading-[1.05] mb-5"
        >
          Scale your <span className="gradient-text">paid ads</span>, profitably
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base text-dark-400 max-w-2xl mx-auto mb-8"
        >
          Build a team of vetted strategists, creatives, and media experts who can drive performance across channels.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Link to="/jobs/post"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
            Build your team <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 mt-10 text-sm"
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-dark-100 font-bold">4.9</span>
            <span className="text-dark-400">avg. client rating</span>
          </div>
          <span className="hidden md:block w-px h-5 bg-dark-700" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-dark-400" />
            <span className="text-dark-100 font-bold">3 days</span>
            <span className="text-dark-400">avg. time to hire</span>
          </div>
          <span className="hidden md:block w-px h-5 bg-dark-700" />
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-dark-400" />
            <span className="text-dark-100 font-bold">9,800+</span>
            <span className="text-dark-400">projects completed</span>
          </div>
        </motion.div>
      </section>

      {/* ── Experts tabs ── */}
      <section className="container-custom pb-20">
        <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 text-center mb-8">
          Build your all-star ad team
        </motion.h2>

        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-full border border-dark-800 bg-dark-900 gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-5 py-2 rounded-full text-xs font-semibold transition-colors ${
                  tab === t ? 'text-primary-300' : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                {tab === t && (
                  <motion.span layoutId="ads-tab" className="absolute inset-0 rounded-full bg-primary-500/15 border border-primary-500/40" />
                )}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {experts.map((e, i) => <ExpertCard key={e.name} expert={e} delay={i * 0.06} />)}
        </div>
      </section>

      {/* ── Paid media projects in flight ── */}
      <section className="py-20 border-t border-dark-800 bg-dark-900">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">
            Paid media projects <span className="text-dark-400 font-normal">— currently in flight</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-5">
            {PROJECTS.map((p, i) => <ProjectCard key={p.title} project={p} delay={i * 0.06} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 border-t border-dark-800 bg-dark-950">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100">
              How it works
            </motion.h2>
            <Link to="/how-it-works"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary-500/40 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 transition-all">
              Get the full picture
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.title} {...fadeUp(i * 0.07)}
                  className="rounded-2xl border border-dark-800 bg-dark-900 p-7">
                  <Icon className="w-6 h-6 text-primary-400 mb-5" strokeWidth={1.5} />
                  <h3 className="text-base font-bold font-display text-dark-100 mb-2">{s.title}</h3>
                  <p className="text-xs text-dark-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Agency banner ── */}
      <section className="py-12 bg-dark-950">
        <div className="container-custom">
          <motion.div {...fadeUp(0)} className="relative rounded-3xl overflow-hidden border border-dark-800 aspect-[16/5] bg-gradient-to-br from-amber-700/30 via-dark-900 to-dark-950">
            <img
              src="https://images.unsplash.com/photo-1521119989659-a83eee488004?w=1600&auto=format&fit=crop"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-70"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/70 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 md:px-12">
              <div className="max-w-md">
                <h3 className="text-2xl md:text-3xl font-bold font-display text-white leading-tight mb-2">
                  High-stakes work?
                </h3>
                <h3 className="text-2xl md:text-3xl font-bold font-display text-white leading-tight mb-4">
                  Consider an agency
                </h3>
                <p className="text-sm text-dark-200 mb-5 max-w-sm">
                  A vetted team or agency can tackle complex work end-to-end — with minimal management required.
                </p>
                <Link to="/freelancers"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
                  Hire an agency <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trusted by ── */}
      <section className="py-16 border-y border-dark-800 bg-dark-900">
        <div className="container-custom">
          <p className="text-center text-2xs text-dark-500 tracking-[0.3em] uppercase mb-8">
            Trusted by 800,000 growing businesses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {BRANDS.map((b) => (
              <span key={b} className="text-base font-display font-bold text-dark-400 hover:text-dark-100 transition-colors">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Takeaways ── */}
      <section className="py-20 bg-dark-950">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">
            Takeaways <span className="text-dark-400 font-normal">— from businesses like yours</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TAKEAWAYS.map((t, i) => (
              <motion.div key={t.name} {...fadeUp(i * 0.07)}
                className="rounded-3xl border border-dark-800 bg-dark-900 p-7 flex flex-col">
                <p className="text-sm text-dark-200 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-dark-800">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-bold text-dark-100">{t.name}</div>
                    <div className="text-xs text-dark-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 bg-dark-950">
        <div className="container-custom">
          <FAQSection />
        </div>
      </section>

      {/* ── Final CTA banner ── */}
      <section className="py-16 bg-dark-950">
        <div className="container-custom">
          <motion.div {...fadeUp(0)}
            className="relative rounded-3xl overflow-hidden p-14 md:p-20 text-center bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600">
            <div className="absolute inset-0 bg-grid opacity-15" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-7">
                Build the team who can build what's next
              </h2>
              <Link to="/register"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-emerald-700 text-sm font-semibold hover:bg-dark-50 transition-all">
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
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
