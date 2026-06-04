import { useState } from 'react';
import { resolveFooter } from '../../utils/footerLinks';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, ChevronDown, Search,
  Sparkles, Video, ShoppingBag, Briefcase, Building2,
  Cpu, Palette, Code2, Calculator, Users, TrendingUp,
  BookOpen, PenLine, Award, ArrowRight,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';
import ResourceSubNav from '../../components/layout/ResourceSubNav';

/* ─── Top sub-nav data ──────────────────────────────────────── */
const CATEGORIES = [
  { name: 'Admin & Customer Support', icon: Users },
  { name: 'AI Services',              icon: Cpu },
  { name: 'Design & Creative',        icon: Palette },
  { name: 'Development & IT',         icon: Code2 },
  { name: 'Finance & Accounting',     icon: Calculator },
  { name: 'Hiring & Management',      icon: Briefcase },
  { name: 'Sales & Marketing',        icon: TrendingUp },
  { name: 'Small Business Insights',  icon: Building2 },
  { name: 'Work & Career',            icon: Award },
  { name: 'Writing & Translation',    icon: PenLine },
];

const CONTENT_TYPES = ['Articles', 'Case studies', 'Guides', 'Videos', 'Webinars'];

const TRUSTED_BRANDS = ['Microsoft', 'airbnb', 'AUTOMATTIC', 'BISSELL', 'Nasdaq'];

/* ─── Featured stories (carousel) ───────────────────────────── */
const FEATURED = [
  {
    brand: 'Microsoft',
    color: 'from-blue-500/20 to-cyan-500/10',
    accent: 'text-blue-300',
    title: 'How Microsoft Scaled Video Production While Driving Cost Savings',
    excerpt: 'Microsoft tapped 80+ specialised freelancers to ship more videos in less time without growing headcount.',
    badge: 'Featured',
    icon: Video,
  },
  {
    brand: 'Airbnb',
    color: 'from-pink-500/20 to-red-500/10',
    accent: 'text-pink-300',
    title: 'Airbnb Built a Global Localization Pipeline With Vetted Freelancers',
    excerpt: 'Real translators in 23 markets shipped product copy 4× faster than the in-house team alone.',
    badge: 'Case study',
    icon: Sparkles,
  },
  {
    brand: 'Automattic',
    color: 'from-violet-500/20 to-purple-500/10',
    accent: 'text-violet-300',
    title: 'How Automattic Augments Its Distributed Team With PANDA Talent',
    excerpt: 'Engineering and product roles filled in days, not months — across 6 time zones.',
    badge: 'Featured',
    icon: Cpu,
  },
  {
    brand: 'Bissell',
    color: 'from-red-500/20 to-orange-500/10',
    accent: 'text-red-300',
    title: 'Bissell Modernized Its E-Commerce Stack With Outside Specialists',
    excerpt: 'A freelance pod rebuilt the checkout flow — lift of 18% conversion in 90 days.',
    badge: 'Case study',
    icon: ShoppingBag,
  },
  {
    brand: 'Nasdaq',
    color: 'from-emerald-500/20 to-teal-500/10',
    accent: 'text-emerald-300',
    title: 'Nasdaq Brought On Data Engineers to Accelerate Insights Delivery',
    excerpt: 'Internal analytics shipping doubled after Nasdaq embedded PANDA freelancers in the data org.',
    badge: 'Featured',
    icon: TrendingUp,
  },
  {
    brand: 'Calendly',
    color: 'from-indigo-500/20 to-blue-500/10',
    accent: 'text-indigo-300',
    title: 'Calendly Tapped Freelance Brand Designers To Refresh Its Identity',
    excerpt: 'A 4-week sprint with vetted designers replaced what would have been a 6-month agency engagement.',
    badge: 'Case study',
    icon: Palette,
  },
];

/* ─── Business stories grid ─────────────────────────────────── */
const BUSINESS_STORIES = [
  {
    company: 'Demco',
    title: 'How Demco runs like a company twice its size',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop',
    category: 'Small Business',
  },
  {
    company: 'Toast',
    title: 'Toast scaled engineering with freelance specialists',
    img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&auto=format&fit=crop',
    category: 'Engineering',
  },
  {
    company: 'Coinbase',
    title: 'Coinbase moved faster on launches with freelance design',
    img: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&auto=format&fit=crop',
    category: 'Design',
  },
  {
    company: 'Wayfair',
    title: 'How Wayfair augments seasonal marketing campaigns',
    img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&auto=format&fit=crop',
    category: 'Marketing',
  },
];

/* ─── Featured carousel ─────────────────────────────────────── */
function FeaturedCarousel() {
  const [idx, setIdx] = useState(0);
  const total = FEATURED.length;
  const story = FEATURED[idx];
  const Icon = story.icon;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 mb-6">Featured Success Stories</h2>

      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-dark-800 bg-dark-900 overflow-hidden"
      >
        <div className="grid md:grid-cols-2">
          <div className={`relative bg-gradient-to-br ${story.color} aspect-[5/4] md:aspect-auto flex items-center justify-center p-12`}>
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative text-center">
              <Icon className={`w-12 h-12 ${story.accent} mx-auto mb-4`} strokeWidth={1.5} />
              <div className={`text-4xl md:text-5xl font-bold font-display ${story.accent}`}>{story.brand}</div>
            </div>
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <span className="inline-flex items-center self-start px-2.5 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-2xs font-semibold uppercase tracking-wider mb-4">
              {story.badge}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight mb-4">
              {story.title}
            </h3>
            <p className="text-sm text-dark-400 leading-relaxed mb-6">{story.excerpt}</p>
            <Link
              to="/success-stories"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all self-start"
            >
              Read story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-dark-700 text-xs font-semibold text-dark-300 hover:border-primary-500/50 hover:text-primary-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span className="text-xs text-dark-400 font-mono">
          <span className="text-dark-100 font-semibold">{idx + 1}</span> / {total}
        </span>
        <button
          onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
          disabled={idx === total - 1}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function SuccessStories() {
  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 60 }}>

      {/* Sub-nav (categories / types / featured / more) */}
      <ResourceSubNav />

      {/* Breadcrumbs */}
      <div className="container-custom pt-10 pb-4">
        <nav className="flex items-center gap-2 text-xs text-dark-500">
          <Link to="/" className="hover:text-dark-200 transition-colors">Resources</Link>
          <span className="text-dark-700">/</span>
          <span className="text-dark-300">Success Stories</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="container-custom pb-10">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold font-display text-dark-100 tracking-tight leading-[1.05] mb-5"
          >
            Success <span className="gradient-text">Stories</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base text-dark-400 leading-relaxed max-w-2xl"
          >
            See what happens when skilled talent meets innovative clients. Read the success
            stories of independent professionals who've built careers freelancing on PANDA.
            Get inspired by what clients have been able to accomplish with the help of expert
            talent. You could be next.
          </motion.p>
        </div>
      </section>

      {/* Trusted by */}
      <section className="container-custom pb-16">
        <div className="rounded-2xl border border-dark-800 bg-dark-900/60 px-6 md:px-10 py-8">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-10">
            <span className="text-2xs text-dark-500 tracking-[0.3em] uppercase shrink-0">
              Trusted by
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-10 md:gap-x-12 gap-y-5 flex-1">
              {TRUSTED_BRANDS.map((b) => (
                <span key={b} className="text-lg font-display font-bold text-dark-300 hover:text-dark-100 transition-colors">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured carousel */}
      <section className="container-custom pb-20">
        <FeaturedCarousel />
      </section>

      {/* Business stories */}
      <section className="container-custom pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100">Business Stories</h2>
            <p className="text-sm text-dark-400 mt-2">How real teams scale with vetted talent</p>
          </div>
          <Link
            to="/success-stories"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
          >
            Explore all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BUSINESS_STORIES.map((s, i) => (
            <motion.div
              key={s.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group rounded-2xl overflow-hidden border border-dark-800 bg-dark-900 hover:border-primary-500/40 hover:shadow-[0_20px_50px_-15px_rgba(67,97,255,0.3)] transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden bg-dark-800">
                <img
                  src={s.img}
                  alt={s.company}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="p-5">
                <span className="text-2xs font-semibold text-primary-400 uppercase tracking-widest">{s.category}</span>
                <h3 className="text-sm font-bold text-dark-100 leading-snug mt-2 group-hover:text-primary-300 transition-colors">
                  {s.title}
                </h3>
                <div className="flex items-center gap-2 mt-4 text-2xs text-dark-500">
                  <span>{s.company}</span>
                  <span className="text-dark-700">·</span>
                  <span>Case study</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories grid */}
      <section className="container-custom pb-20">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 mb-2">Explore by category</h2>
        <p className="text-sm text-dark-400 mb-8">Find stories that match your industry</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.button
                key={c.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                className="flex items-center gap-3 p-4 rounded-2xl border border-dark-800 bg-dark-900/60 hover:border-primary-500/40 hover:bg-dark-900 transition-all text-left group"
              >
                <span className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center shrink-0 group-hover:border-primary-500/40 transition-colors">
                  <Icon className="w-4 h-4 text-primary-400" strokeWidth={1.75} />
                </span>
                <span className="text-xs font-semibold text-dark-200 group-hover:text-dark-100 leading-tight">
                  {c.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* CTA banner */}
      <section className="container-custom pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600"
        >
          <div className="absolute inset-0 bg-grid opacity-15" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">
              Ready to write your own success story?
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-7 max-w-xl mx-auto">
              Join 500,000+ companies hiring the world's best talent on PANDA.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-primary-700 text-sm font-semibold hover:bg-dark-50 transition-all"
              >
                Get started today <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 backdrop-blur transition-all"
              >
                See pricing
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
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
                      <Link to={resolveFooter(l)} className="text-xs text-dark-500 hover:text-dark-300 transition-colors" >{l}</Link>
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
                <Link key={l} to={resolveFooter(l)} className="text-xs text-dark-600 hover:text-dark-400 transition-colors" >{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
