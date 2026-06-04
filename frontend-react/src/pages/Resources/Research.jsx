import { useState, useMemo } from 'react';
import { resolveFooter } from '../../utils/footerLinks';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronDown, ChevronLeft, ChevronRight, ArrowRight, Play, Headphones, ExternalLink,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';
import ResourceSubNav from '../../components/layout/ResourceSubNav';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Inline LinkedIn icon (lucide v1 lacks it) ─── */
const LinkedInSVG = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 18.34V10.6H5.67v7.74h2.67Zm-1.34-8.9a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1Zm11.34 8.9v-4.24c0-2.27-1.21-3.32-2.82-3.32-1.3 0-1.88.71-2.2 1.21V10.6h-2.66c.04.75 0 7.74 0 7.74h2.66v-4.32c0-.24.02-.48.09-.65.19-.48.62-.97 1.36-.97.95 0 1.34.73 1.34 1.8v4.14h2.23Z" />
  </svg>
);

/* ─── Data ──────────────────────────────────────────────────── */
const FEATURED = {
  date: 'Mar 11, 2026',
  title: 'Reimagining Meetings and AI: A Conversation with Dr. Rebecca Hinds',
  excerpt: 'Dr. Rebecca Hinds shares her research on improving the effectiveness of meetings in the age of AI.',
  img: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=1200&auto=format&fit=crop',
};

const CATEGORIES = ['All', 'Future of Work', 'AI & Skills', 'Hiring Trends', 'Productivity', 'Workforce Insights'];

const ARTICLES = [
  { date: 'Mar 11, 2026', title: 'Reimagining Meetings and AI: A Conversation with Dr. Rebecca Hinds', category: 'AI & Skills',         img: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=600&auto=format&fit=crop', gradient: 'from-blue-700 to-indigo-900' },
  { date: 'Feb 4, 2026',  title: 'In-Demand Skills 2026: A Market View of Skills Demand in an AI Economy', category: 'AI & Skills',     img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&auto=format&fit=crop', gradient: 'from-amber-700 to-orange-900' },
  { date: 'Jan 8, 2026',  title: 'PANDA Monthly Hiring Report: A Growing Focus on Operational Skills',     category: 'Hiring Trends',  img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop', gradient: 'from-emerald-700 to-teal-900' },
  { date: 'Dec 10, 2025', title: 'Flash Teams as the Future of Work: A Conversation with Dr. Melissa Valentine and Dr. Michael Bernstein', category: 'Future of Work', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&auto=format&fit=crop', gradient: 'from-amber-600 to-yellow-900' },
  { date: 'Dec 5, 2025',  title: 'PANDA Monthly Hiring Report: Communication Skills in Demand',           category: 'Hiring Trends',   img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop', gradient: 'from-stone-700 to-stone-900' },
  { date: 'Nov 5, 2025',  title: 'PANDA Monthly Hiring Report: Growing Demand For Seasonal Support',      category: 'Hiring Trends',   img: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&auto=format&fit=crop', gradient: 'from-rose-700 to-red-900' },
  { date: 'Oct 29, 2025', title: 'The Key to Growth: How Small Businesses Turn Disruption Into an Edge',  category: 'Workforce Insights', img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop', gradient: 'from-indigo-700 to-purple-900' },
  { date: 'Oct 2, 2025',  title: 'PANDA Monthly Hiring Report: Increasing Demand for Skills That Combat AI "Workslop"', category: 'Hiring Trends', img: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=600&auto=format&fit=crop', gradient: 'from-teal-700 to-cyan-900' },
  { date: 'Sep 5, 2025',  title: 'PANDA Monthly Hiring Report: AI Amplifies Demand for Human Skills',     category: 'AI & Skills',     img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop', gradient: 'from-amber-700 to-yellow-900' },
  { date: 'Jul 9, 2025',  title: 'From Tools to Teammates: Navigating the New Human-AI Relationship',     category: 'AI & Skills',     img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop', gradient: 'from-sky-700 to-blue-900' },
  { date: 'Jun 30, 2025', title: "AI Trends on the World's Work Marketplace: How AI Is Reshaping the Way Humans Work", category: 'Future of Work', img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop', gradient: 'from-stone-600 to-stone-900' },
  { date: 'Jun 30, 2025', title: 'Creating effective partnerships between people and AI: A conversation with Dr. Jenna Butler', category: 'Productivity', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop', gradient: 'from-orange-600 to-red-900' },
];

const EXPERTS = [
  {
    name: 'Gabby Burlacu, Ph.D',
    role: 'Senior Research Manager, PANDA Research Institute',
    bio: 'Dr. Gabby Burlacu is a Senior Research Manager at PANDA, focused on how organizations evolve their talent strategies in a rapidly evolving world of work. Her research has shaped workforce transformation efforts at Fortune 500 companies and appears in peer-reviewed journals and books. She holds a Ph.D. in industrial-organizational psychology from Portland State University and brings deep expertise in workplace behavior and inclusive, agile work models.',
    img: 'https://ui-avatars.com/api/?name=Gabby+Burlacu&background=ec4899&color=fff&size=300&bold=true',
  },
  {
    name: 'Ted Liu, Ph.D',
    role: 'Economist, PANDA Research Institute',
    bio: 'Dr. Ted Liu is an Economist at PANDA, where he studies how AI and technological change are transforming the labor market and reshaping skill demand. He holds a Ph.D. in economics from the University of California, Santa Cruz, and specializes in labor market dynamics and quantitative research. His work informs PANDA\'s insights on workforce shifts, economic opportunity, and policy.',
    img: 'https://ui-avatars.com/api/?name=Ted+Liu&background=4361ff&color=fff&size=300&bold=true',
  },
  {
    name: 'Takeshi Matsuda',
    role: 'Research Analyst, PANDA Research Institute',
    bio: "Takeshi Matsuda is a Research Analyst at PANDA, focusing on how technological progress is reshaping the landscape of work and skills. He holds a B.Sc. in quantitative economics and data science from Beloit College, with research interests in behavioral economics and labor markets. His work contributes to PANDA's research on evolving workforce dynamics and the future of work.",
    img: 'https://ui-avatars.com/api/?name=Takeshi+Matsuda&background=7c3aed&color=fff&size=300&bold=true',
  },
];

const PARTNER = {
  name: 'Dr. Nicholas Bloom',
  bio: 'Dr. Nicholas Bloom, professor of economics at Stanford University and senior fellow at the Stanford Institute for Economic Policy Research, is an expert on remote work, organizational productivity, and AI\'s impact on workplace dynamics.',
  img: 'https://ui-avatars.com/api/?name=Nicholas+Bloom&background=059669&color=fff&size=300&bold=true',
};

const NEWS = [
  { date: 'February 16, 2026', source: 'FAST COMPANY', title: 'Fast Company: Demand for AI-related skills is up 109% since last year. What that means for you' },
  { date: 'February 10, 2026', source: 'Entrepreneur', title: "Entrepreneur: Companies Can't Hire Fast Enough for Workers With These In-Demand Skills — Do You Qualify?" },
  { date: 'February 10, 2026', source: 'FAST COMPANY', title: 'Fast Company: Job hiring is growing fastest for this AI skill—and it\'s not coding' },
];

const FOOTER_COLS = [
  { title: 'For Clients', items: ['How to hire', 'Talent Marketplace', 'Project Catalog', 'Hire an agency', 'Enterprise', 'Business Plus', 'Any hire', 'Contract-to-hire', 'Direct Contracts', 'Hire worldwide', 'Hire in the USA'] },
  { title: 'For Talent', items: ['How to find work', 'Direct Contracts', 'Find freelance jobs worldwide', 'Find freelance jobs in the USA', 'Win work with ads', 'Exclusive resources with Freelancer Plus'] },
  { title: 'Resources', items: ['Help & support', 'Success stories', 'PANDA reviews', 'Resources', 'Blog', 'Affiliate program', 'Refer a client', 'Free Business Tools', 'Release notes'] },
  { title: 'Company', items: ['About us', 'Leadership', 'Investor relations', 'Careers', 'Our impact', 'Press', 'Contact us', 'Partners', 'Trust, safety & security', 'Modern slavery statement'] },
];

const PER_PAGE = 6;

/* ─── Main page ─────────────────────────────────────────────── */
export default function Research() {
  const [cat, setCat] = useState('All');
  const [page, setPage] = useState(1);
  const [catOpen, setCatOpen] = useState(false);

  const filtered = useMemo(() => {
    if (cat === 'All') return ARTICLES;
    return ARTICLES.filter((a) => a.category === cat);
  }, [cat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 60 }}>

      <ResourceSubNav />

      {/* ── Hero ── */}
      <section className="container-custom pt-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden border border-dark-800 aspect-[16/7] bg-gradient-to-br from-amber-900/40 via-dark-900 to-dark-950"
        >
          <img
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1600&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/70 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="px-8 md:px-16 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold font-display text-white leading-[1.05] tracking-tight mb-4">
                The <span className="gradient-text">PANDA</span><br />Research Institute
              </h1>
              <p className="text-base md:text-lg text-dark-200 leading-relaxed mb-6 max-w-md">
                Changing work one insight at a time.
              </p>
              <Link
                to="#latest"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-dark-950 text-sm font-semibold hover:bg-dark-50 transition-all"
              >
                Learn more
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Latest Research ── */}
      <section id="latest" className="container-custom pb-16">
        <motion.h2 {...fadeUp(0)} className="text-2xl md:text-3xl font-bold font-display text-dark-100 mb-6">
          Latest Research
        </motion.h2>
        <Link to="/updates">
          <motion.div
            {...fadeUp(0.05)}
            whileHover={{ y: -4 }}
            className="grid lg:grid-cols-[1.1fr_1fr] gap-6 items-center rounded-3xl border border-dark-800 bg-dark-900 overflow-hidden hover:border-primary-500/40 transition-all cursor-pointer group"
          >
            <div className="relative aspect-video lg:aspect-auto lg:h-full overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-900">
              <img
                src={FEATURED.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="p-8 md:p-12">
              <div className="text-2xs font-bold text-dark-500 uppercase tracking-widest mb-3">{FEATURED.date}</div>
              <h3 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight mb-4 group-hover:text-primary-300 transition-colors">
                {FEATURED.title}
              </h3>
              <p className="text-sm text-dark-400 leading-relaxed">{FEATURED.excerpt}</p>
            </div>
          </motion.div>
        </Link>
      </section>

      {/* ── More from the Research Institute ── */}
      <section className="container-custom pb-12">
        <motion.h2 {...fadeUp(0)} className="text-xl md:text-2xl font-bold font-display text-dark-100 mb-5">
          More from the Research Institute
        </motion.h2>

        {/* Category dropdown */}
        <div className="mb-8 max-w-xs">
          <div className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2">Category</div>
          <div className="relative">
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-200 hover:border-dark-600 transition-colors"
            >
              {cat}
              <ChevronDown className={`w-3.5 h-3.5 text-dark-500 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
            </button>
            {catOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 z-10 rounded-lg border border-dark-700 bg-dark-900 overflow-hidden shadow-xl">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCat(c); setCatOpen(false); setPage(1); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-dark-800 transition-colors ${cat === c ? 'text-primary-300 font-semibold' : 'text-dark-300'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Articles grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((a, i) => (
            <motion.article
              key={a.title}
              {...fadeUp(i * 0.05)}
              whileHover={{ y: -4 }}
              className="group rounded-2xl overflow-hidden border border-dark-800 bg-dark-900 hover:border-primary-500/40 transition-all cursor-pointer"
            >
              <Link to="/updates" className="block">
                <div className={`relative aspect-video overflow-hidden bg-gradient-to-br ${a.gradient}`}>
                  <img
                    src={a.img}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div className="p-5">
                  <div className="text-2xs font-bold text-dark-500 uppercase tracking-widest mb-2">{a.date}</div>
                  <h3 className="text-sm font-bold font-display text-dark-100 leading-snug group-hover:text-primary-300 transition-colors">
                    {a.title}
                  </h3>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-10">
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

      {/* ── Podcast banner ── */}
      <section className="container-custom pb-20">
        <motion.div
          {...fadeUp(0)}
          className="relative rounded-3xl overflow-hidden border border-dark-800 bg-dark-900 grid md:grid-cols-[1.2fr_1fr]"
        >
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight mb-2">
              Work is changing fast.
            </h2>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight mb-7">
              Let's talk about it.
            </h2>
            <Link
              to="/updates"
              className="inline-flex items-center gap-2 self-start px-6 py-2.5 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
            >
              <Headphones className="w-4 h-4" />
              Listen to the podcast
            </Link>
          </div>
          <div className="relative bg-dark-800 p-6 md:p-10 flex items-center">
            {/* "Work Week" visualization */}
            <div className="w-full">
              <div className="text-lg md:text-xl font-bold font-display text-dark-100 mb-3">Work</div>
              <div className="flex gap-1.5 mb-3">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-12 md:h-14 rounded-md ${
                      i === 0 || i === 6 ? 'bg-dark-700' : 'bg-gradient-to-b from-green-400 to-green-600'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg md:text-xl font-bold font-display text-dark-100">Week</div>
                <div className="text-2xs text-dark-500 tracking-widest uppercase">PANDA Research Institute</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── About ── */}
      <section className="container-custom pb-20 max-w-4xl mx-auto">
        <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-7">
          About the PANDA Research Institute
        </motion.h2>
        <motion.div {...fadeUp(0.05)} className="space-y-5 text-sm text-dark-300 leading-relaxed">
          <p>
            The world of work is not the same as it was just a few years ago and leaders are facing brand new
            challenges as a result. The old work playbook is gone, and in its place, there are debates and
            decisions around workforce location, worker arrangements, and flexibility. However, leaders do not
            need to navigate this new world of work on their own.
          </p>
          <p>
            The PANDA Research Institute is committed to studying the fundamental shifts in the workforce and
            providing business leaders with the tools and insights they need to navigate the here and now while
            preparing their organization for the future. Using our proprietary platform data, global survey
            research, partnerships, and academic collaborations, we will produce evidence-based insights to
            create the blueprint for the new way of work.
          </p>
        </motion.div>
      </section>

      {/* ── Meet the experts ── */}
      <section className="container-custom pb-20 max-w-5xl mx-auto">
        <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">
          Meet the experts
        </motion.h2>
        <div className="space-y-10">
          {EXPERTS.map((e, i) => (
            <motion.div
              key={e.name}
              {...fadeUp(i * 0.07)}
              className="grid md:grid-cols-[1fr_280px] gap-8 items-start pb-10 border-b border-dark-800 last:border-b-0"
            >
              <div>
                <div className="text-2xs font-bold text-primary-400 uppercase tracking-widest mb-3">{e.role}</div>
                <h3 className="text-2xl font-bold font-display text-dark-100 mb-4">{e.name}</h3>
                <p className="text-sm text-dark-400 leading-relaxed mb-4">{e.bio}</p>
                <a onClick={(e) => e.preventDefault()} href="#" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300">
                  <LinkedInSVG className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              </div>
              <div className="order-first md:order-last">
                <img
                  src={e.img}
                  alt={e.name}
                  className="w-full aspect-square rounded-2xl object-cover border border-dark-800"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Strategic Partners ── */}
      <section className="container-custom pb-20 max-w-5xl mx-auto">
        <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-6">
          Meet our Strategic Partners
        </motion.h2>
        <motion.p {...fadeUp(0.05)} className="text-sm text-dark-400 leading-relaxed mb-10 max-w-3xl">
          <span className="text-dark-100 font-semibold">Guiding the Future of Work at the Intersection of AI and Economics:</span>{' '}
          The Economic Advisory Council (EAC) is a strategic partner to the PANDA Research Institute, bringing
          together world-renowned economists and researchers from institutions like MIT, Stanford, and Georgetown.
          Formed to deepen our understanding of AI's impact on work, the Council ensures our research, insights,
          and innovations are grounded in real-world economic theory and labor market data. Learn more about the
          council members below.
        </motion.p>

        <motion.div {...fadeUp(0.1)} className="grid md:grid-cols-[1fr_280px] gap-8 items-start rounded-3xl border border-dark-800 bg-dark-900 p-8">
          <div>
            <h3 className="text-2xl font-bold font-display text-dark-100 mb-3">{PARTNER.name}</h3>
            <p className="text-sm text-dark-400 leading-relaxed">{PARTNER.bio}</p>
          </div>
          <div className="order-first md:order-last">
            <img
              src={PARTNER.img}
              alt={PARTNER.name}
              className="w-full aspect-square rounded-2xl object-cover border border-dark-800"
            />
          </div>
        </motion.div>
      </section>

      {/* ── In the news ── */}
      <section className="container-custom pb-20 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100">
            In the news
          </motion.h2>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
          >
            Explore All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {NEWS.map((n, i) => (
            <motion.article
              key={n.title}
              {...fadeUp(i * 0.07)}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden hover:border-primary-500/40 transition-all cursor-pointer"
            >
              <Link to="/blog" className="block">
                <div className="aspect-video bg-dark-950 border-b border-dark-800 flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-black font-display text-dark-100 tracking-wide uppercase">
                    {n.source}
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-2xs font-bold text-dark-500 uppercase tracking-widest mb-3">{n.date}</div>
                  <h3 className="text-sm font-bold text-dark-100 leading-snug">{n.title}</h3>
                </div>
              </Link>
            </motion.article>
          ))}
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
