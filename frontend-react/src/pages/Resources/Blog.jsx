import { useState, useMemo } from 'react';
import { resolveFooter } from '../../utils/footerLinks';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Briefcase, FileText, Sparkles } from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';
import ResourceSubNav from '../../components/layout/ResourceSubNav';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Data ──────────────────────────────────────────────────── */
const TAGS = ['All', 'Company News', 'People & Culture', 'Product & Innovation', 'Social Impact', 'Research & Reports'];

const FEATURED_POST = {
  tag: 'Research & Reports',
  title: 'How SMBs Are Turning AI Into Growth',
  excerpt: "New PANDA research shows how SMBs are pairing AI with flexible talent to move faster, close skill gaps, and turn AI adoption into growth.",
  date: 'May 4, 2026',
  img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&auto=format&fit=crop',
  href: '/updates',
};

const POSTS = [
  {
    tag: 'Product & Innovation',
    title: 'Uma Recruiter: How We Built an Agentic Solution to Talent Matching and Hiring',
    date: 'May 5, 2026',
    img: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&auto=format&fit=crop',
    gradient: 'from-stone-700 to-stone-900',
    href: '/updates',
  },
  {
    tag: 'Product & Innovation',
    title: 'PANDA Updates Spring 2026: Helping SMBs Get Work Done with AI',
    date: 'May 5, 2026',
    img: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&auto=format&fit=crop',
    gradient: 'from-amber-700 to-amber-900',
    href: '/updates',
  },
  {
    tag: 'Research & Reports',
    title: "The Last Mile Problem: Why the Best Off-the-Shelf LLMs Aren't Always Good Enough",
    date: 'Apr 15, 2026',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop',
    gradient: 'from-orange-700 to-red-900',
    href: '/updates',
  },
  {
    tag: 'Social Impact',
    title: "The PANDA Foundation's 2026 Focus: Investing in the Future of Early-Career Work",
    date: 'Mar 25, 2026',
    img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop',
    gradient: 'from-indigo-700 to-purple-900',
    href: '/updates',
  },
  {
    tag: 'Product & Innovation',
    title: "Transparency You Can See: Inside PANDA's New Account Health Hub",
    date: 'Dec 11, 2025',
    img: 'https://images.unsplash.com/photo-1587613991119-fbbe8e90531d?w=800&auto=format&fit=crop',
    gradient: 'from-stone-600 to-stone-900',
    href: '/updates',
  },
  {
    tag: 'Social Impact',
    title: 'The PANDA Foundation Partners With Nonprofits To Expand Human Potential',
    date: 'Dec 4, 2025',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop',
    gradient: 'from-emerald-700 to-teal-900',
    href: '/updates',
  },
];

const NEWS_TABS = ['Press releases', 'Research', 'PANDA in the news'];

const NEWS = {
  'Press releases': [
    { date: 'May 7, 2026',      title: 'A Message from Hayden Brown, PANDA CEO' },
    { date: 'May 5, 2026',      title: 'PANDA Updates Spring 2026: New Innovations to Help Small Businesses Get Ambitious Work Done' },
    { date: 'April 9, 2026',    title: "PANDA's Work Marketplace Comes to ChatGPT" },
    { date: 'February 4, 2026', title: "PANDA's In-Demand Skills 2026: Demand for Top AI Skills More Than Doubles as AI Is Embedded Into Everyday Work" },
  ],
  'Research': [
    { date: 'April 22, 2026', title: 'How SMBs Are Turning AI Into Growth — Full Report' },
    { date: 'March 18, 2026', title: 'The State of Independent Work 2026: Annual Workforce Index' },
    { date: 'February 11, 2026', title: 'AI Skill Premium Report: What Top Talent Earns in 2026' },
    { date: 'January 9, 2026', title: 'Future of Work Forecast: 5 Trends Reshaping Enterprise Hiring' },
  ],
  'PANDA in the news': [
    { date: 'May 6, 2026',  title: 'PANDA featured in TechCrunch on the future of freelance hiring' },
    { date: 'April 28, 2026', title: 'Forbes interviews PANDA CEO on the rise of AI work agents' },
    { date: 'April 12, 2026', title: 'Bloomberg: How PANDA is rethinking the future of independent work' },
    { date: 'March 30, 2026', title: 'WIRED profile of PANDA — building the marketplace of tomorrow' },
  ],
};

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

/* ─── Post card ─────────────────────────────────────────────── */
function PostCard({ post, delay }) {
  return (
    <motion.article
      {...fadeUp(delay)}
      whileHover={{ y: -6 }}
      className="group rounded-2xl overflow-hidden border border-dark-800 bg-dark-900 hover:border-primary-500/40 hover:shadow-[0_20px_50px_-15px_rgba(67,97,255,0.3)] transition-all cursor-pointer"
    >
      <Link to={post.href} className="block">
        <div className={`relative aspect-[5/3] overflow-hidden bg-gradient-to-br ${post.gradient}`}>
          {post.img && (
            <img
              src={post.img}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>
        <div className="p-5">
          <span className="inline-block px-2.5 py-1 rounded-md bg-dark-800 border border-dark-700 text-2xs font-semibold text-dark-300 mb-3">
            {post.tag}
          </span>
          <h3 className="text-base font-bold font-display text-dark-100 leading-tight group-hover:text-primary-300 transition-colors mb-3">
            {post.title}
          </h3>
          <div className="text-xs text-dark-500">{post.date}</div>
        </div>
      </Link>
    </motion.article>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function Blog() {
  const [tag, setTag] = useState('All');
  const [page, setPage] = useState(1);
  const [newsTab, setNewsTab] = useState('Press releases');
  const totalPages = 19;

  const filtered = useMemo(() => {
    if (tag === 'All') return POSTS;
    return POSTS.filter((p) => p.tag === tag);
  }, [tag]);

  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 60 }}>

      <ResourceSubNav />

      {/* ── Hero ── */}
      <section className="container-custom pt-12 pb-12">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold font-display text-dark-100 tracking-tight leading-[1.05] mb-5"
            >
              PANDA <span className="gradient-text">Blog</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base text-dark-400 leading-relaxed max-w-md"
            >
              Read updates on PANDA's products, corporate initiatives, and partnerships to get insight into the world's work marketplace.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Tabs ── */}
      <section className="container-custom mb-8">
        <div className="flex flex-wrap items-center gap-1 border-b border-dark-800 pb-1 overflow-x-auto">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => { setTag(t); setPage(1); }}
              className={`relative px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                tag === t ? 'text-primary-300' : 'text-dark-400 hover:text-dark-100'
              }`}
            >
              {t}
              {tag === t && (
                <motion.span
                  layoutId="blog-tab"
                  className="absolute bottom-[-5px] inset-x-3 h-0.5 bg-primary-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured post ── */}
      <section className="container-custom mb-12">
        <Link to={FEATURED_POST.href}>
          <motion.div
            {...fadeUp(0)}
            whileHover={{ y: -4 }}
            className="grid lg:grid-cols-2 gap-6 rounded-3xl overflow-hidden border border-dark-800 bg-dark-900 hover:border-primary-500/40 transition-all cursor-pointer group"
          >
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="inline-block self-start px-2.5 py-1 rounded-md bg-dark-800 border border-dark-700 text-2xs font-semibold text-dark-300 mb-5">
                {FEATURED_POST.tag}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-dark-100 leading-tight group-hover:text-primary-300 transition-colors mb-4">
                {FEATURED_POST.title}
              </h2>
              <p className="text-sm text-dark-400 leading-relaxed mb-5">
                {FEATURED_POST.excerpt}
              </p>
              <div className="text-xs text-dark-500">{FEATURED_POST.date}</div>
            </div>
            <div className="relative aspect-[5/4] lg:aspect-auto overflow-hidden bg-gradient-to-br from-amber-700/30 to-dark-950">
              <img
                src={FEATURED_POST.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </motion.div>
        </Link>
      </section>

      {/* ── Posts grid ── */}
      <section className="container-custom mb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <PostCard key={p.title} post={p} delay={i * 0.06} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-dark-500">No posts yet in this category.</div>
        )}
      </section>

      {/* ── Pagination ── */}
      <section className="container-custom mb-24">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-dark-700 text-xs font-semibold text-dark-300 hover:border-primary-500/50 hover:text-primary-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-xs text-dark-400 font-mono">
            <span className="text-dark-100 font-semibold">{page}</span> / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ── Latest news ── */}
      <section className="container-custom mb-20">
        <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-3">
          Latest news about <span className="gradient-text">PANDA</span>
        </motion.h2>
        <motion.p {...fadeUp(0.05)} className="text-sm text-dark-400 mb-8 max-w-2xl">
          Supporting you with data, trends, and insights you need to succeed today and prepare for tomorrow.
        </motion.p>

        {/* News tabs */}
        <div className="flex items-center gap-1 border-b border-dark-800 mb-8 overflow-x-auto">
          {NEWS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setNewsTab(t)}
              className={`relative px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                newsTab === t ? 'text-primary-300' : 'text-dark-400 hover:text-dark-100'
              }`}
            >
              {t}
              {newsTab === t && (
                <motion.span
                  layoutId="news-tab"
                  className="absolute bottom-[-1px] inset-x-4 h-0.5 bg-primary-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {NEWS[newsTab].map((n, i) => (
            <motion.div
              key={n.title}
              {...fadeUp(i * 0.05)}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-dark-900 border border-dark-800 p-5 hover:border-primary-500/40 transition-all flex flex-col"
            >
              <div className="text-2xs text-dark-500 mb-3">{n.date}</div>
              <h3 className="text-sm font-bold text-dark-100 leading-snug mb-5 flex-1">{n.title}</h3>
              <Link to="/updates" className="text-xs font-semibold text-primary-400 hover:text-primary-300 inline-flex items-center gap-1.5 self-start">
                Read news <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Join the marketplace ── */}
      <section className="py-20 bg-dark-950 border-t border-dark-800">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">
            Join the world's work marketplace
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-5">
            <motion.div {...fadeUp(0.05)} className="rounded-3xl overflow-hidden border border-dark-800 bg-dark-900 flex">
              <div className="aspect-square w-44 shrink-0 bg-gradient-to-br from-stone-700/40 to-dark-950 hidden sm:block relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-stone-400" strokeWidth={1.25} />
                </div>
              </div>
              <div className="p-7 flex-1 flex flex-col justify-center">
                <h3 className="text-lg md:text-xl font-bold font-display text-dark-100 leading-tight mb-5">
                  Find talent your way and get things done.
                </h3>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 self-start px-6 py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
                >
                  Find talent <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="rounded-3xl overflow-hidden border border-dark-800 bg-dark-900 flex">
              <div className="aspect-square w-44 shrink-0 bg-gradient-to-br from-emerald-700/30 to-dark-950 hidden sm:block relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Briefcase className="w-12 h-12 text-emerald-400" strokeWidth={1.25} />
                </div>
                <Sparkles className="absolute top-4 right-4 w-5 h-5 text-amber-300" />
              </div>
              <div className="p-7 flex-1 flex flex-col justify-center">
                <h3 className="text-lg md:text-xl font-bold font-display text-dark-100 leading-tight mb-5">
                  Find work you love with like-minded clients.
                </h3>
                <Link
                  to="/search?type=jobs"
                  className="inline-flex items-center gap-2 self-start px-6 py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
                >
                  Find work <ArrowRight className="w-3.5 h-3.5" />
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
