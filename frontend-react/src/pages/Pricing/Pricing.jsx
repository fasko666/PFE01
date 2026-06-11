import { useState } from 'react';
import { resolveFooter } from '../../utils/footerLinks';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Info, Sparkles } from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

/* ─── Plans ─────────────────────────────────────────────────── */
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Hire for occasional, project-based work',
    fee: '5%',
    feeNote: 'service fee',
    example: 'For example, a $100 contract would cost $105 in total',
    bullets: [
      { strong: 'Marketplace access', text: '— skilled freelancers across thousands of skills' },
      { strong: 'Talent profiles', text: '— portfolios, ratings, and work history' },
      { strong: 'Hiring tools', text: '— proposals and terms in one place' },
      { strong: 'Project workspace', text: '— messages, files, and status in one view' },
      { strong: 'Protected payments', text: '— only pay for approved work from escrow' },
    ],
    cta: 'Get started for free',
    ctaTo: '/register',
    popular: false,
  },
  {
    id: 'business',
    name: 'Business Plus',
    tagline: 'Hire for complex, ongoing work at scale',
    fee: '10%',
    feeNote: 'service fee',
    example: 'For example, a $100 contract would cost $110 in total',
    bullets: [
      { strong: 'Curated shortlists', text: '— find top talent faster with smart recommendations' },
      { strong: 'Expert-Vetted talent', text: '— access to the top 1% of PANDA talent' },
      { strong: 'Smart hiring tools', text: '— hire faster and with more confidence' },
      { strong: 'Centralized billing', text: '— keep team spend in one place' },
      { strong: 'Team workspace', text: '— shared hiring with roles and permissions' },
    ],
    cta: 'Get started for free',
    ctaTo: '/register',
    popular: true,
  },
];

/* ─── Comparison rows ───────────────────────────────────────── */
const COMPARISON = [
  {
    group: 'Discover trusted talent',
    rows: [
      { label: "Access to PANDA's global work marketplace", basic: 'yes', business: 'yes' },
      { label: 'ID-verified talent only',                  basic: 'yes', business: 'yes' },
      { label: 'Verified reviews and work history',        basic: 'yes', business: 'yes' },
      { label: 'Easily filter to top freelancers',         basic: 'yes', business: 'yes' },
      { label: 'Expert-Vetted talent',                     basic: 'no',  business: 'yes' },
      { label: 'Curated shortlists of top candidates',     basic: 'Limited access', business: 'Unlimited access' },
      { label: 'Summarized freelancer work and hours log', basic: 'Limited access', business: 'Unlimited access' },
    ],
  },
  {
    group: 'Engage the right candidates',
    rows: [
      { label: 'Freelancer invites per job post', basic: '30',     business: '60' },
      { label: 'Direct messages',                  basic: '5 per day', business: '10 per day' },
      { label: 'Direct contracts',                 basic: 'yes',    business: 'yes' },
    ],
  },
  {
    group: 'Collaborate and hire',
    rows: [
      { label: 'Message, share files, and voice or video call', basic: 'yes', business: 'yes' },
      { label: 'Built-in time tracking tools',                  basic: 'yes', business: 'yes' },
      { label: 'Automatic team enrollment with company email',  basic: 'no',  business: 'yes' },
      { label: 'Admin access for multiple users',               basic: 'no',  business: 'yes' },
      { label: 'Advanced team management and permissions',      basic: 'no',  business: 'yes' },
    ],
  },
  {
    group: 'Manage and pay',
    rows: [
      { label: 'Contract initiation fees',                  basic: 'yes', business: 'yes' },
      { label: 'Payment protection and dispute resolution', basic: 'yes', business: 'yes' },
      { label: 'Operational and financial reporting',       basic: 'yes', business: 'yes' },
      { label: 'Enhanced performance, time and spend reporting', basic: 'no', business: 'yes' },
      { label: '30-day payment terms',                      basic: 'no',  business: 'yes' },
    ],
  },
  {
    group: 'Receive support',
    rows: [
      { label: 'Customer support access', basic: 'yes',          business: 'Premium 24/7' },
      { label: 'API integration access',  basic: 'yes',          business: 'yes' },
    ],
  },
];

const BRAND_LOGOS = ['Calendly', 'SEMRUSH', 'toast', 'coinbase', 'zapier', 'wayfair', 'datajoi'];

/* ─── FAQ ───────────────────────────────────────────────────── */
const FAQ = [
  {
    q: "What is PANDA's client service fee and how is it calculated?",
    a: "For the Basic plan, when you hire on PANDA, you pay a 3% or 5% Marketplace fee on all payments that you make to freelancers for fixed-price and hourly projects, Project Catalog projects, bonuses, and Direct Contracts.",
  },
  {
    q: 'When do I pay a client service fee?',
    a: 'For the Basic plan and Business Plus plan, you only pay a client service fee when you make a payment and your default billing method will be charged automatically for the balance due.',
  },
  {
    q: 'Can I change my plan later on?',
    a: 'Any client with Account Admin access can upgrade their account at any time. There are no penalties or restrictions for upgrading. Any client with Admin Full access can request to downgrade their Business Plus plan.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'To see which billing method options are available to you, visit your profile setting. Note: Based on your location, your options may vary. We accept major credit cards, PayPal, and bank transfers in most regions.',
  },
  {
    q: 'Are there any other fees?',
    a: 'Both the Basic and Business Plus plans do not include upfront costs to join. Optional add-ons like Connects bundles for freelancers and premium support tiers are available separately.',
  },
  {
    q: 'What are Contract Initiation Fees?',
    a: 'Contract Initiation Fees are one-time fees charged to clients when starting a new Marketplace or Project Catalog contract with a freelancer or agency on PANDA. The fee ranges from $0.99 to $14.99 per contract.',
  },
  {
    q: 'How do I get 30-day payment terms?',
    a: 'Business Plus clients in the U.S. may apply for monthly invoicing with 30-day payment terms through our third-party partner. The application process requires submitting business details and supporting documentation.',
  },
  {
    q: 'How does PANDA make money?',
    a: 'PANDA earns revenue through service fees on both sides of the marketplace. Clients pay a service fee on contracts — 5% on Basic and 10% on Business Plus. Talent pays a service fee ranging from 5% to 15% per contract.',
  },
];

/* ─── Footer columns ─────────────────────────────────────────── */
const FOOTER_COLS = [
  {
    title: 'For Clients',
    links: [
      'How to hire', 'Talent Marketplace', 'Project Catalog', 'Hire an agency',
      'Enterprise', 'Business Plus', 'Any hire', 'Contract-to-hire',
      'Direct Contracts', 'Hire worldwide', 'Hire in the USA',
    ],
  },
  {
    title: 'For Talent',
    links: [
      'How to find work', 'Direct Contracts', 'Find freelance jobs worldwide',
      'Find freelance jobs in the USA', 'We work with ads',
      'Exclusive resources with Freelancer Plus',
    ],
  },
  {
    title: 'Resources',
    links: [
      'Help & support', 'Success stories', 'PANDA reviews', 'Resources',
      'Blog', 'Affiliate program', 'Refer a client', 'Free Business Tools',
      'Release notes',
    ],
  },
  {
    title: 'Company',
    links: [
      'About us', 'Leadership', 'Investor relations', 'Careers',
      'Our impact', 'Press', 'Contact us', 'Partners',
      'Trust, safety & security', 'Modern slavery statement',
    ],
  },
];

/* ─── Cell renderer ─────────────────────────────────────────── */
function Cell({ value, highlighted }) {
  if (value === 'yes') {
    return (
      <div className="flex items-center justify-center">
        <span className="w-6 h-6 rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-green-400" strokeWidth={2.5} />
        </span>
      </div>
    );
  }
  if (value === 'no') {
    return <div className="text-center text-dark-700">—</div>;
  }
  return (
    <div className={`text-center text-xs font-medium ${highlighted ? 'text-primary-300' : 'text-dark-200'}`}>
      {value}
    </div>
  );
}

/* ─── Pricing card ──────────────────────────────────────────── */
function PricingCard({ plan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-3xl p-6 sm:p-8 border transition-all ${
        plan.popular
          ? 'border-primary-500/40 bg-gradient-to-br from-primary-500/10 via-dark-900 to-dark-900 shadow-[0_30px_80px_-20px_rgba(67,97,255,0.35)]'
          : 'border-dark-800 bg-dark-900'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-px right-8 px-3 py-1 rounded-b-lg bg-primary-500 text-white text-2xs font-bold tracking-widest uppercase">
          Popular
        </div>
      )}

      <h3 className="text-2xl sm:text-3xl font-bold font-display text-dark-100 mb-2">{plan.name}</h3>
      <p className="text-sm text-dark-400 mb-6">{plan.tagline}</p>

      <Link
        to={plan.ctaTo}
        className={`block w-full text-center py-3 rounded-full text-sm font-semibold mb-7 transition-all ${
          plan.popular
            ? 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-glow'
            : 'bg-transparent border border-dark-700 text-dark-100 hover:border-primary-500/50 hover:text-primary-300'
        }`}
      >
        {plan.cta}
      </Link>

      <div className="text-sm font-semibold text-dark-300 mb-3">
        {plan.id === 'basic' ? 'Basic includes:' : 'Everything in Basic, plus:'}
      </div>

      <ul className="space-y-3 mb-7">
        {plan.bullets.map((b, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="w-5 h-5 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-primary-400" strokeWidth={2.5} />
            </span>
            <span className="text-xs text-dark-300 leading-relaxed">
              <span className="font-semibold text-dark-100">{b.strong}</span>
              {b.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="pt-5 border-t border-dark-800">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold font-display text-dark-100">{plan.fee}</span>
          <span className="text-sm text-dark-400">{plan.feeNote}</span>
        </div>
        <p className="text-2xs text-dark-500 leading-relaxed flex items-center gap-1.5">
          {plan.example}
          <Info className="w-3 h-3 text-dark-600 shrink-0" />
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Comparison group ──────────────────────────────────────── */
function ComparisonGroup({ group, rows }) {
  const [openRow, setOpenRow] = useState(null);
  return (
    <div className="border-t border-dark-800">
      <h3 className="text-base font-bold font-display text-dark-100 px-4 py-5">{group}</h3>
      {rows.map((row, idx) => {
        const isOpen = openRow === idx;
        return (
          <div key={idx} className="border-t border-dark-800/60">
            <div className="grid grid-cols-[1fr_90px_90px] sm:grid-cols-[1fr_140px_140px] md:grid-cols-[1fr_180px_180px] items-center">
              <button
                onClick={() => setOpenRow(isOpen ? null : idx)}
                className="flex items-center gap-2 px-4 py-4 text-left text-xs text-dark-200 hover:text-dark-100 transition-colors"
              >
                <span>{row.label}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-dark-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div className="py-4 px-3">
                <Cell value={row.basic} />
              </div>
              <div className="py-4 px-3 bg-primary-500/[0.04]">
                <Cell value={row.business} highlighted />
              </div>
            </div>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4 text-2xs text-dark-500 leading-relaxed max-w-2xl"
              >
                Hover any feature on either plan to learn more about what's included and how it's used during the hiring workflow.
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function Pricing() {
  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 60 }}>

      {/* ── Hero ── */}
      <section className="pt-12 sm:pt-20 pb-10 sm:pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold font-display text-dark-100 leading-[1.1] sm:leading-[1.05] tracking-tight mb-5"
          >
            Flexible pricing that scales<br />
            with your <span className="gradient-text">business</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base text-dark-400 leading-relaxed mb-4"
          >
            Access skilled experts who can support one-time projects or complex, ongoing work.
            It's free to get started — pay only when you hire.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-dark-500"
          >
            Looking to work?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 underline underline-offset-4">
              Join as a freelancer
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="pb-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {PLANS.map((p) => (
              <PricingCard key={p.id} plan={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Features comparison ── */}
      <section className="py-20 border-t border-dark-800 bg-dark-950">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            {/* Sticky comparison header */}
            <div className="grid grid-cols-[1fr_90px_90px] sm:grid-cols-[1fr_140px_140px] md:grid-cols-[1fr_180px_180px] items-end gap-0 border-b-2 border-dark-800 pb-6 mb-2">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-display text-dark-100">Key Features</h2>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold font-display text-dark-100">Basic</div>
                <div className="text-2xs text-dark-500 mb-3">5% service fee</div>
                <Link
                  to="/register"
                  className="inline-block px-6 py-2 rounded-full border border-dark-700 text-xs font-semibold text-dark-100 hover:border-primary-500/50 hover:text-primary-300 transition-all"
                >
                  Sign up
                </Link>
              </div>
              <div className="text-center bg-primary-500/[0.04] rounded-t-2xl pt-3 pb-3 px-3 -mb-px border-t border-x border-primary-500/20">
                <div className="text-xl font-bold font-display text-dark-100">Business Plus</div>
                <div className="text-2xs text-dark-500 mb-3">10% service fee</div>
                <Link
                  to="/register"
                  className="inline-block px-6 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
                >
                  Sign up
                </Link>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden">
              {COMPARISON.map((g) => (
                <ComparisonGroup key={g.group} group={g.group} rows={g.rows} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted logos ── */}
      <section className="py-16 bg-dark-900 border-y border-dark-800">
        <div className="container-custom">
          <p className="text-center text-2xs text-dark-500 tracking-[0.3em] uppercase mb-8">
            Trusted by 800,000 clients
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {BRAND_LOGOS.map((b) => (
              <span
                key={b}
                className="text-base font-display font-bold text-dark-400 hover:text-dark-200 transition-colors"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Case study ── */}
      <section className="py-24 bg-dark-950">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dark-800">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="text-2xs text-dark-500 ml-2 font-mono">PANDA · Manage work · Reports</div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded bg-primary-500/15 text-primary-300 text-2xs font-semibold">Expert-Vetted</span>
                <span className="px-2 py-0.5 rounded bg-dark-800 text-dark-400 text-2xs">Top Rated Plus</span>
                <span className="px-2 py-0.5 rounded bg-dark-800 text-dark-400 text-2xs">Top Rated</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Sofie J.', role: 'Virtual Assistant Coordinator', earn: '$70K+', score: '99%' },
                  { name: 'Brian F.',  role: 'Chatbot Developer · NLP & ML', earn: '$70K+', score: '97%' },
                  { name: 'Samantha L.', role: 'Virtual Receptionist',         earn: '$70K+', score: '95%' },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-800/50 border border-dark-700/40">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=4361ff&color=fff&size=40`}
                      className="w-8 h-8 rounded-full"
                      alt={c.name}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-dark-100">{c.name}</div>
                      <div className="text-2xs text-dark-500 truncate">{c.role}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xs text-green-400 font-semibold">{c.score}</div>
                      <div className="text-2xs text-dark-500">{c.earn} earned</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-4 leading-tight">
                How Demco runs like a company twice its size
              </h3>
              <p className="text-sm text-dark-400 leading-relaxed mb-7">
                Business Plus scales what headcount can't. Demco brought in specialized
                freelancers across departments and expanded like a company twice its size.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Try Business Plus
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Final CTA banner ── */}
      <section className="py-16 bg-dark-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden p-16 text-center bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600"
          >
            <div className="absolute inset-0 bg-grid opacity-15" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-7">
                Take the first step toward real results
              </h2>
              <Link
                to="/register"
                className="inline-block px-8 py-3 rounded-full bg-white text-primary-700 text-sm font-semibold hover:bg-dark-50 transition-all"
              >
                Get started today
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-dark-950">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto bg-dark-900 border border-dark-800 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-[260px_1fr] gap-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight sticky top-24">
                  Frequently asked questions
                </h2>
              </div>
              <div className="divide-y divide-dark-800">
                {FAQ.map((item, i) => (
                  <FaqItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comprehensive footer ── */}
      <footer className="bg-black text-dark-300 pt-14 pb-8">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-white mb-5 tracking-wide uppercase">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link to={resolveFooter(l)} className="text-xs text-dark-400 hover:text-white transition-colors" >{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Socials row */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-dark-800/60 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xs font-semibold text-white uppercase tracking-widest mr-2">Follow us</span>
              {[
                { name: 'Facebook', d: 'M22 12.061C22 6.504 17.523 2 12 2S2 6.504 2 12.061c0 5.022 3.657 9.184 8.438 9.939v-7.03H7.898v-2.91h2.54V9.845c0-2.522 1.492-3.915 3.777-3.915 1.094 0 2.238.196 2.238.196v2.476h-1.26c-1.243 0-1.63.775-1.63 1.57v1.888h2.773l-.443 2.908h-2.33V22c4.78-.755 8.437-4.917 8.437-9.939z' },
                { name: 'LinkedIn', d: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.339 18.337V9.725H5.667v8.612h2.672zM7.003 8.575a1.546 1.546 0 1 0 0-3.093 1.546 1.546 0 0 0 0 3.093zm11.335 9.762v-4.717c0-2.31-.499-4.085-3.198-4.085-1.297 0-2.168.711-2.524 1.385h-.036V9.725h-2.564v8.612h2.669v-4.262c0-1.123.213-2.21 1.604-2.21 1.371 0 1.39 1.282 1.39 2.282v4.19h2.659z' },
                { name: 'Twitter', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { name: 'YouTube', d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                { name: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.645.07-4.849.07-3.205 0-3.584-.012-4.85-.07-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.069-1.645-.069-4.849 0-3.205.012-3.584.07-4.85.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 5.775.13 4.602.396 3.635 1.363 2.668 2.33 2.402 3.503 2.344 4.781 2.286 6.061 2.272 6.469 2.272 9.728s.014 3.667.072 4.947c.058 1.278.324 2.451 1.291 3.418.967.967 2.14 1.233 3.418 1.291 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.278-.058 2.451-.324 3.418-1.291.967-.967 1.233-2.14 1.291-3.418.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.278-.324-2.451-1.291-3.418C19.398.396 18.225.13 16.947.072 15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
              ].map((s) => (
                <a
                  key={s.name}
                  onClick={(e) => e.preventDefault()} href="#"
                  aria-label={s.name}
                  className="w-8 h-8 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-white hover:border-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a onClick={(e) => e.preventDefault()} href="#" className="flex items-center gap-1.5 text-2xs text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.5 12.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                Mobile app
              </a>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-dark-800/60 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                <PandaLogo className="w-5 h-5" />
              </div>
              <span className="font-black font-display text-white text-sm tracking-widest uppercase">PANDA</span>
            </div>
            <p className="text-2xs text-dark-500">© 2026 PANDA Global Inc.</p>
            <div className="flex gap-5 flex-wrap justify-center">
              {['Terms of Service', 'Privacy Policy', 'CA Notice at Collection', 'Cookie Settings', 'Accessibility', 'Desktop App'].map((l) => (
                <Link key={l} to={resolveFooter(l)} className="text-2xs text-dark-500 hover:text-white transition-colors" >{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── FAQ collapsible item ──────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 text-left group"
      >
        <span className={`text-sm md:text-base font-semibold transition-colors ${open ? 'text-primary-300' : 'text-dark-100 group-hover:text-primary-300'}`}>
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 mt-1 shrink-0 transition-all ${open ? 'rotate-180 text-primary-300' : 'text-dark-500 group-hover:text-dark-300'}`}
          strokeWidth={2}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0, marginTop: open ? 12 : 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <p className="text-xs md:text-sm text-dark-400 leading-relaxed pr-8">{a}</p>
        <a onClick={(e) => e.preventDefault()} href="#" className="inline-block mt-3 text-2xs text-primary-400 hover:text-primary-300 font-semibold tracking-wide">
          Read more
        </a>
      </motion.div>
    </div>
  );
}
