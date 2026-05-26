import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, TrendingUp, Palette, Code2, Users, Calculator,
  ArrowRight, PenSquare, UserCheck, DollarSign, ChevronDown, Play, Pause, MicOff,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Inline social SVGs ─── */
const SOCIAL = [
  { label: 'Facebook',  d: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.24 0-1.63.78-1.63 1.58v1.88h2.78l-.44 2.9h-2.34V22c4.78-.8 8.44-4.94 8.44-9.94Z' },
  { label: 'LinkedIn',  d: 'M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 18.34V10.6H5.67v7.74h2.67Zm-1.34-8.9a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1Zm11.34 8.9v-4.24c0-2.27-1.21-3.32-2.82-3.32-1.3 0-1.88.71-2.2 1.21V10.6h-2.66c.04.75 0 7.74 0 7.74h2.66v-4.32c0-.24.02-.48.09-.65.19-.48.62-.97 1.36-.97.95 0 1.34.73 1.34 1.8v4.14h2.23Z' },
  { label: 'X',         d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.69l-5.244-6.852L4.97 21.75H1.66l7.73-8.838L1.254 2.25h6.857l4.74 6.27 5.393-6.27Zm-1.16 17.55h1.833L7.084 4.126H5.117l11.967 15.674Z' },
  { label: 'YouTube',   d: 'M21.6 7.2a2.55 2.55 0 0 0-1.8-1.81C18.21 5 12 5 12 5s-6.21 0-7.8.39A2.55 2.55 0 0 0 2.4 7.2 26.6 26.6 0 0 0 2 12a26.6 26.6 0 0 0 .4 4.8 2.55 2.55 0 0 0 1.8 1.81C5.79 19 12 19 12 19s6.21 0 7.8-.39a2.55 2.55 0 0 0 1.8-1.81A26.6 26.6 0 0 0 22 12a26.6 26.6 0 0 0-.4-4.8ZM10 15V9l5.2 3-5.2 3Z' },
  { label: 'Instagram', d: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.95c-3.15 0-3.5.01-4.74.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.27.83-.39.39-.63.76-.83 1.27-.15.39-.33.97-.38 2.04-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.07.23 1.65.38 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.15.97.33 2.04.38 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.27-.83.39-.39.63-.76.83-1.27.15-.39.33-.97.38-2.04.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.07-.23-1.65-.38-2.04-.2-.51-.44-.88-.83-1.27-.39-.39-.76-.63-1.27-.83-.39-.15-.97-.33-2.04-.38-1.24-.06-1.59-.07-4.74-.07Zm0 3.32a4.57 4.57 0 1 1 0 9.14 4.57 4.57 0 0 1 0-9.14Zm0 7.54a2.97 2.97 0 1 0 0-5.94 2.97 2.97 0 0 0 0 5.94Zm5.81-7.74a1.07 1.07 0 1 1-2.14 0 1.07 1.07 0 0 1 2.14 0Z' },
];

/* ─── Data ──────────────────────────────────────────────────── */
const SUB_NAV = ['Development & IT', 'Design & Creative', 'Sales & Marketing', 'Writing & Translation', 'Admin & Customer Support', 'Finance & Accounting'];

const BRANDS = ['Calendly', 'SEMRUSH', 'toast', 'coinbase', 'zapier', 'wayfair', 'datajoi'];

const TOP_CATEGORIES = [
  {
    icon: BrainCircuit,
    title: 'Data Science & Analytics',
    items: ['AI Development', 'Data Analytics', 'Machine Learning', 'Big Data'],
  },
  {
    icon: TrendingUp,
    title: 'Sales & Marketing',
    items: ['Social Media Marketing', 'SEO', 'Email Marketing', 'Lead Generation'],
  },
  {
    icon: Palette,
    title: 'Design & Creative',
    items: ['Graphic Design', 'Video Production', 'Branding', 'User Experience'],
  },
  {
    icon: Code2,
    title: 'Development & IT',
    items: ['Web Development', 'Mobile App Development', 'DevOps', 'Cyber Security'],
  },
  {
    icon: Users,
    title: 'Admin & Customer Support',
    items: ['Virtual Assistance', 'Customer Service', 'Data Entry', 'Project Management'],
  },
  {
    icon: Calculator,
    title: 'Finance & Accounting',
    items: ['Bookkeeping', 'Financial Analysis', 'Tax Preparation', 'Payroll'],
  },
];

const HOW_IT_WORKS = [
  { icon: PenSquare,   title: 'Define your need',         desc: 'Start with your project goals and choose the category that best fits your needs. From web design to AI development, PANDA offers agencies across every specialty.' },
  { icon: UserCheck,   title: 'Browse agencies & hire',   desc: 'Explore a curated marketplace of thousands of vetted agencies. Filter by expertise, reviews, and budget to find your best match.' },
  { icon: DollarSign,  title: 'Manage work and get results', desc: 'Manage your projects end-to-end in one place. Approve the final output and pay through PANDA.' },
];

const AGENCY_CATS = {
  'Development & IT': [
    ['Cyber Security', 'IT Services', 'App Development', 'Robotics', 'iOS App Development', 'Web Development'],
    ['Wordpress Development', 'Android App Development', 'Shopify Development', 'Game Development', 'Mobile App Design', 'Software Development'],
  ],
  'Design & Creative': [
    ['Brand Identity', 'Graphic Design', 'Illustration', 'Logo Design', 'UI/UX Design', 'Motion Graphics'],
    ['Video Editing', 'Animation', 'Packaging Design', 'Print Design', 'Photography', 'Presentation Design'],
  ],
  'Sales & Marketing': [
    ['Search Engine Optimization', 'Pay-Per-Click', 'Social Media Marketing', 'Email Marketing', 'Content Marketing', 'Influencer Marketing'],
    ['Affiliate Marketing', 'Lead Generation', 'Sales Funnels', 'Marketing Strategy', 'Conversion Rate Optimization', 'Public Relations'],
  ],
  'Writing & Translation': [
    ['Content Writing', 'Copywriting', 'Technical Writing', 'Translation', 'Proofreading', 'Editing'],
    ['Ghostwriting', 'Resume Writing', 'Grant Writing', 'Localization', 'Subtitling', 'Transcription'],
  ],
  'Admin & Customer Support': [
    ['Virtual Assistance', 'Data Entry', 'Customer Service', 'Project Management', 'Transcription', 'Calendar Management'],
    ['Help Desk Support', 'Live Chat Support', 'Email Handling', 'CRM Management', 'Order Processing', 'Research Assistance'],
  ],
  'Finance & Accounting': [
    ['Bookkeeping', 'Accounting', 'Financial Modeling', 'Tax Preparation', 'Payroll', 'Auditing'],
    ['CFO Services', 'Budgeting & Forecasting', 'QuickBooks', 'Xero Setup', 'Financial Analysis', 'Accounts Receivable'],
  ],
};

const FAQ = [
  { q: 'What is an agency on PANDA?',
    a: 'Agencies on PANDA are teams of professionals who work together to deliver services across a range of specialties, from design and development to marketing and data science. Agencies can take on larger or more complex projects, often bringing multiple skill sets together to deliver end-to-end solutions.' },
  { q: 'How is working with an agency different from hiring a freelancer?',
    a: 'Agencies offer a team-based approach, which can be helpful for projects that require multiple skills, faster turnaround times, or ongoing support. While freelancers typically work independently, agencies can assign the right experts to different parts of your project and scale resources as your needs grow.' },
  { q: 'What should I expect during the hiring process?',
    a: 'During the hiring process, agencies will typically review your project requirements, share relevant experience or past work, and may ask follow-up questions to better understand your goals. You can compare proposals, communicate directly with agencies, and choose the partner that best fits your needs.' },
  { q: 'How do payments and contracts work with agencies?',
    a: "You can work with agencies using fixed-price or hourly contracts, just like with freelancers. Payments are made through PANDA's secure system, and you only release funds once agreed-upon milestones are completed or hours are logged and approved." },
  { q: 'How can I attract the right agencies to my project?',
    a: 'Providing a clear and detailed project brief — including your goals, scope, timeline, and budget — helps agencies understand your needs and submit more relevant proposals. Well-defined projects are more likely to attract experienced agencies with the right expertise.' },
];

const FOOTER_COLS = [
  { title: 'For Clients', items: ['How to hire', 'Talent Marketplace', 'Project Catalog', 'Hire an agency', 'Enterprise', 'Business Plus', 'Any hire', 'Contract-to-hire', 'Direct Contracts', 'Hire worldwide', 'Hire in the USA'] },
  { title: 'For Talent', items: ['How to find work', 'Direct Contracts', 'Find freelance jobs worldwide', 'Find freelance jobs in the USA', 'Win work with ads', 'Exclusive resources with Freelancer Plus'] },
  { title: 'Resources', items: ['Help & support', 'Success stories', 'PANDA reviews', 'Resources', 'Blog', 'Affiliate program', 'Refer a client', 'Free Business Tools', 'Release notes'] },
  { title: 'Company', items: ['About us', 'Leadership', 'Investor relations', 'Careers', 'Our impact', 'Press', 'Contact us', 'Partners', 'Trust, safety & security', 'Modern slavery statement'] },
];

/* ─── FAQ ───────────────────────────────────────────────────── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <div className="rounded-3xl bg-dark-900 border border-dark-800 p-8 md:p-12">
      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight">Frequently asked<br />questions</h2>
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
export default function Agencies() {
  const [activeCat, setActiveCat] = useState('Development & IT');

  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 60 }}>

      {/* Sub-nav */}
      <div className="border-y border-dark-800 bg-dark-950 sticky top-[60px] z-30">
        <div className="container-custom py-3">
          <div className="flex items-center gap-1 flex-wrap text-xs">
            <span className="px-3 py-2 font-bold text-primary-300">Agencies</span>
            <span className="text-dark-700 mx-1">|</span>
            {SUB_NAV.map((s) => (
              <button key={s} onClick={() => setActiveCat(s)}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors ${activeCat === s ? 'text-primary-300 bg-primary-500/10' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800/60'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero (split) */}
      <section className="container-custom py-12">
        <motion.div {...fadeUp(0)}
          className="rounded-3xl border border-dark-800 bg-dark-900 overflow-hidden grid lg:grid-cols-2 gap-0">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-dark-100 leading-[1.05] tracking-tight mb-5">
              Scale your business with an <span className="gradient-text">agency</span>
            </h1>
            <p className="text-sm md:text-base text-dark-400 leading-relaxed mb-7 max-w-md">
              Whether you need specialized support or end-to-end execution, the right agency is ready to help you grow.
            </p>
            <Link to="/freelancers"
              className="inline-flex items-center gap-2 self-start px-7 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
              Get started today <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative aspect-[5/4] lg:aspect-auto bg-gradient-to-br from-blue-700/40 via-dark-900 to-dark-950">
            <img src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=1200&auto=format&fit=crop" alt=""
              className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
        </motion.div>
      </section>

      {/* Trusted by */}
      <section className="container-custom pb-16">
        <p className="text-center text-2xs text-dark-500 tracking-[0.3em] uppercase mb-8">Trusted by 800,000 clients</p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {BRANDS.map((b) => <span key={b} className="text-base font-display font-bold text-dark-400 hover:text-dark-100 transition-colors">{b}</span>)}
        </div>
      </section>

      {/* Top categories */}
      <section className="container-custom pb-20">
        <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">
          Explore our most in-demand categories
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOP_CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.title} {...fadeUp(i * 0.06)} whileHover={{ y: -6 }}
                className="rounded-3xl border border-dark-800 bg-dark-900 p-7 hover:border-primary-500/40 hover:shadow-[0_25px_60px_-15px_rgba(67,97,255,0.25)] transition-all">
                <Icon className="w-9 h-9 text-primary-400 mb-5" strokeWidth={1.25} />
                <h3 className="text-lg font-bold font-display text-dark-100 mb-4">{c.title}</h3>
                <ul className="space-y-2.5">
                  {c.items.map((it) => (
                    <li key={it}>
                      <Link to="/freelancers" className="text-xs text-primary-400 hover:text-primary-300 hover:underline underline-offset-4">{it}</Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-dark-800 bg-dark-950">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">How it works</motion.h2>
          <div className="grid md:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.title} {...fadeUp(i * 0.07)} className="rounded-2xl border border-dark-800 bg-dark-900 p-7">
                  <Icon className="w-7 h-7 text-primary-400 mb-5" strokeWidth={1.5} />
                  <h3 className="text-base font-bold font-display text-dark-100 mb-3 leading-tight">{s.title}</h3>
                  <p className="text-xs text-dark-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agencies offer team-based solutions banner */}
      <section className="py-12 bg-dark-950">
        <div className="container-custom">
          <motion.div {...fadeUp(0)} className="rounded-3xl border border-dark-800 bg-dark-900 overflow-hidden grid md:grid-cols-[1fr_1.2fr]">
            {/* Left: video tile */}
            <div className="relative aspect-video md:aspect-auto bg-black overflow-hidden flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop" alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 right-4 flex flex-col gap-1">
                <span className="text-xs font-bold text-white">$500k+ in earnings</span>
                <span className="text-xs font-bold text-white">100+ 5-star reviews</span>
              </div>
              <button className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-2xl transition-all">
                <Play className="w-5 h-5 text-dark-950 ml-0.5" fill="currentColor" />
              </button>
              <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                <span className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center"><Pause className="w-3 h-3 text-white" strokeWidth={1.75} /></span>
                <span className="w-7 h-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center"><MicOff className="w-3 h-3 text-white" strokeWidth={1.75} /></span>
              </div>
            </div>
            {/* Right: copy */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight mb-4">
                Agencies offer team-based solutions for complex projects
              </h3>
              <p className="text-sm text-dark-400 leading-relaxed mb-6">
                See how Jacqueline's agency partners with businesses to deliver high-quality, impactful results using AI and expert teams.
              </p>
              <Link to="/freelancers"
                className="inline-flex items-center gap-2 self-start px-6 py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
                Hire an agency today <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search for agencies by category */}
      <section className="py-20 border-t border-dark-800 bg-dark-950">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">
            Search for agencies by category
          </motion.h2>
          <div className="rounded-3xl bg-dark-900 border border-dark-800 p-6 md:p-10">
            <div className="grid lg:grid-cols-[260px_1fr] gap-10">
              {/* Left tabs */}
              <div className="space-y-2">
                {SUB_NAV.map((s) => (
                  <button key={s} onClick={() => setActiveCat(s)}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-base md:text-lg font-bold font-display transition-colors ${
                      activeCat === s ? 'text-primary-400 bg-primary-500/10' : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800/60'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
              {/* Right grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {(AGENCY_CATS[activeCat] || []).flat().map((skill) => (
                  <Link key={skill} to="/freelancers"
                    className="text-xs text-dark-200 hover:text-primary-300 transition-colors py-1">
                    {skill}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-dark-950">
        <div className="container-custom"><FAQSection /></div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-dark-950">
        <div className="container-custom">
          <motion.div {...fadeUp(0)}
            className="relative rounded-3xl overflow-hidden p-14 md:p-20 text-center bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600">
            <div className="absolute inset-0 bg-grid opacity-15" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-7">
                Bring your ideas to life with the right agency
              </h2>
              <Link to="/register"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-emerald-700 text-sm font-semibold hover:bg-dark-50 transition-all">
                Get started for free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Big dark footer */}
      <footer className="bg-black border-t border-dark-800 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-dark-100 mb-4 tracking-wide">{col.title}</h4>
                <ul className="space-y-2.5">{col.items.map((l) => <li key={l}><a href="#" className="text-xs text-dark-400 hover:text-dark-100 transition-colors">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 pt-8 border-t border-dark-800">
            <div className="flex items-center gap-4">
              <span className="text-xs text-dark-500">Follow us</span>
              {SOCIAL.map((s) => (
                <a key={s.label} href="#" aria-label={s.label}
                   className="w-7 h-7 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 hover:border-dark-500 transition-colors">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d={s.d} /></svg>
                </a>
              ))}
            </div>
            <div className="md:ml-auto flex items-center gap-2.5">
              <div className="w-7 h-7 bg-dark-900 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                <PandaLogo className="w-5 h-5" invert />
              </div>
              <span className="font-black font-display text-dark-100 text-base tracking-widest uppercase">PANDA</span>
            </div>
          </div>
          <div className="text-2xs text-dark-600 mt-4">© 2015 - 2026 PANDA Global LLC</div>
        </div>
      </footer>
    </div>
  );
}
