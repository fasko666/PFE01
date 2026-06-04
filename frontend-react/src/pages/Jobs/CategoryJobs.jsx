import { useState, useMemo } from 'react';
import { resolveFooter } from '../../utils/footerLinks';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, ChevronLeft, ChevronRight, ArrowRight, UserCircle2, FileText, ShieldCheck, Play, Lock,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Category preset data ──────────────────────────────────── */
const CATEGORY_PRESETS = {
  ai: {
    title: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    count: 2_768,
    rate: { min: 35, max: 60 },
    inDemand: [
      'Deep Learning', 'Computer Vision', 'Image/Object Recognition', 'OCR Tesseract',
      'Machine Learning', 'PyTorch', 'Data Science', 'Python',
      'Chatbot Development', 'Digital Signal Processing', 'Golang', 'Django',
      'Web Application Development', 'Flutter', 'Data Analyst', 'Geographic Information System (GIS)',
    ],
    similar: [
      'GPT-3 Specialists', 'OpenAI Embeddings Specialists', 'PyTorch Specialists', 'AI Developers',
      'LLM Developers', 'Deep Learning Experts', 'Pattern Recognition Specialists', 'Natural Language Understanding Specialists',
      'AI Researchers', 'OCR Algorithms Specialists', 'Keras Professionals', 'Bag of Words Specialists',
      'GPT-4 Specialists', 'Object Detection Specialists', 'Computer Vision Specialists', 'fastText Specialists',
    ],
    jobs: [
      {
        posted: '1 day ago',
        title: 'AI Developer for Web3 Security',
        meta: 'Hourly · Expert · Est. time: More than 6 months, 30+ hrs/week',
        desc: "Join our team to develop AI models for fraud and anomaly detection in Web3. You'll work with our data team to integrate models into our platform, ensuring seamless data flow and model performance. Thi…",
        skills: ['Blockchain', 'Data Analysis', 'Anomaly Detection', 'Artificial Intelligence', 'Python'],
      },
      {
        posted: '1 day ago',
        title: 'AI & Computer Vision Developer',
        meta: 'Hourly · Intermediate · Est. time: More than 6 months, Less than 30 hrs/week',
        desc: "We're Hiring: AI & Computer Vision Developer We are looking for a passionate AI & Computer Vision Developer to join our team and help build intelligent video surveillance solutions powered by artific…",
        skills: ['Python', 'Computer Vision', 'Artificial Intelligence'],
      },
      {
        posted: '1 day ago',
        title: 'AI Agent Developer for LinkedIn Branding',
        meta: 'Hourly · Intermediate · Est. time: Less than 1 month, Less than 30 hrs/week',
        desc: "AI Agent Developer Needed – LinkedIn Personal Branding for Cybersecurity Professional I'm a cybersecurity professional looking to enhance my LinkedIn profile for personal branding. The goal is to att…",
        skills: ['LinkedIn', 'Social Media Management', 'Branding', 'Prompt Engineering'],
      },
      {
        posted: '1 day ago',
        title: 'Open Claw / Nemo Claw AI Agent Design Build Execute Project',
        meta: 'Hourly · Expert · Est. time: 1 to 3 months, 30+ hrs/week',
        desc: 'We are seeking a skilled freelancer to set up, build, and test a public accounting AI agent for Nemoclaw. The ideal candidate will have experience in AI and public accounting, ensuring the AI agent fu…',
        skills: ['Adobe Photoshop', 'Graphic Design', 'English', 'Adobe Illustrator'],
      },
      {
        posted: '1 day ago',
        title: 'Looking for AI Engineer',
        meta: 'Hourly · Intermediate · Est. time: More than 6 months, Less than 30 hrs/week',
        desc: "I'm looking for an AI full stack engineer to work on - Claude based projects - Claude AI Agents, Claude API - Workflow automations (n8n, make.com) - Twilio, voice kind of projects This role is not s…",
        skills: ['Node.js', 'Artificial Intelligence', 'AI Model Integration', 'Chatbot Development', 'Claude'],
      },
      {
        posted: '1 day ago',
        title: 'Build AI Email Automation for Hotel Management Company — Claude API + PDF Reader',
        meta: 'Fixed-price: $200 · Expert · Est. time: Less than 1 month',
        desc: 'WE NEED: Hotel GMs email daily reports (4-10 PDF attachments) to our operations email. We need automation that: 1. Detects new email with PDF attachments 2. Reads all PDF files automatically 3. Send…',
        skills: ['API Integration', 'API'],
      },
    ],
    article: {
      heading: 'How to Become a Freelance Artificial Intelligence Engineer',
      paragraphs: [
        'Advances in technology allow specialists to understand, build and deliver solutions designed to make life — and business — much easier including artificial intelligence.',
        'If you possess computer programming skills and have a high comfort level developing algorithms, data analysis, neural networks, robotics, or natural language processing, you may have what it takes to become a freelance artificial intelligence engineer on PANDA.',
      ],
      sections: [
        {
          title: 'What does a freelance artificial intelligence engineer do?',
          body: [
            'Freelance artificial intelligence engineers handle the development and programming of algorithm networks that operate like the human brain in order to complete repetitive and complex tasks. Artificial intelligence solutions are incorporated into business and consumer-oriented solutions using machine learning. The result is increased automation, streamlined operations, and greater accuracy.',
            'Data scientists specializing in building artificial intelligence solutions must be familiar with building algorithms, computer programming, statistical analysis, infrastructure development, and API development. These skills allow freelance AI engineers to be deployed in any industry for virtually any company developing AI solutions.',
          ],
        },
        {
          title: 'What skills do I need to become a freelance artificial intelligence engineer?',
          body: [
            'The skills to seek career opportunities as a freelance artificial intelligence engineer are similar to any other technology discipline. Freelancers specializing in artificial intelligence and machine learning algorithms can work on a number of projects requiring a deep understanding of data analytics, data mining, data modeling, and various software frameworks.',
            'Common skills an ideal candidate responding to a freelance artificial intelligence engineer job description should possess include:',
          ],
          bullets: [
            'Programming skills. AI engineers should be well-versed in several computer programming languages, Python, Java, and C++.',
            'Technical skills. In addition to programming skills, knowing the fundamentals of the field of AI and machine learning will make any data engineer a huge asset to the team.',
            'Mathematics skills. To design and build advanced AI models, business representatives feel a thorough knowledge of mathematics, linear algebra, calculus, and probability theory is essential.',
          ],
        },
      ],
    },
  },
};

/* Generic fallback when category isn't in presets */
function buildFallback(slug) {
  const label = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: label,
    slug,
    count: 1200,
    rate: { min: 25, max: 50 },
    inDemand: ['Data Entry', 'Project Management', 'WordPress', 'SEO', 'Adobe Photoshop', 'Microsoft Excel', 'Python', 'JavaScript'],
    similar: [`${label} Specialists`, `Senior ${label} Experts`, `${label} Consultants`, `${label} Strategists`],
    jobs: [],
    article: { heading: `Working as a Freelance ${label} Pro`, paragraphs: [], sections: [] },
  };
}

/* Bell curve SVG for the earnings banner */
function BellCurve({ min, max }) {
  return (
    <svg viewBox="0 0 320 130" className="w-full max-w-sm">
      <defs>
        <linearGradient id="bell-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="rgb(74,222,128)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(74,222,128)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Dashed reference lines */}
      <line x1="100" y1="20" x2="100" y2="110" stroke="rgb(74,222,128)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <line x1="220" y1="20" x2="220" y2="110" stroke="rgb(74,222,128)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      {/* Filled center band */}
      <path
        d="M 100 110 Q 160 -30 220 110 Z"
        fill="url(#bell-fill)"
      />
      {/* Curve outline */}
      <path
        d="M 10 110 Q 80 90 100 70 Q 160 -30 220 70 Q 240 90 310 110"
        fill="none"
        stroke="rgb(74,222,128)"
        strokeWidth="1.5"
      />
      {/* Baseline */}
      <line x1="10" y1="110" x2="310" y2="110" stroke="rgb(82,82,91)" strokeWidth="1" />
      {/* Labels */}
      <text x="100" y="124" textAnchor="middle" className="fill-dark-200" style={{ fontSize: 10, fontWeight: 600 }}>${min}</text>
      <text x="220" y="124" textAnchor="middle" className="fill-dark-200" style={{ fontSize: 10, fontWeight: 600 }}>${max}</text>
    </svg>
  );
}

/* ─── Job card ──────────────────────────────────────────────── */
function JobCard({ job, delay }) {
  return (
    <motion.article {...fadeUp(delay)} className="grid grid-cols-[1fr_140px] gap-6 py-6 border-b border-dark-800">
      <div className="min-w-0">
        <div className="text-2xs text-dark-500 mb-1.5">Posted {job.posted}</div>
        <h3 className="text-base font-bold text-dark-100 leading-snug mb-1.5 hover:text-primary-300 cursor-pointer transition-colors">{job.title}</h3>
        <p className="text-2xs text-dark-400 mb-3">{job.meta}</p>
        <p className="text-xs text-dark-300 leading-relaxed mb-3 line-clamp-3">{job.desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {job.skills.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full bg-dark-800 text-dark-200 text-2xs font-medium hover:bg-dark-700 cursor-pointer transition-colors">{s}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 self-start">
        <Link to="/register" className="text-center py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
          Apply
        </Link>
        <Link to="/register" className="text-center py-2 rounded-full border border-dark-700 text-dark-200 text-xs font-semibold hover:border-primary-500/40 hover:text-primary-300 transition-all">
          Learn more
        </Link>
      </div>
    </motion.article>
  );
}

/* ─── How it works sidebar ──────────────────────────────────── */
const HOW_IT_WORKS = [
  { icon: UserCircle2, title: '1. Create a free profile', desc: 'Showcase your skills, experience & portfolio. Set your rates. Highlight past work. Browse jobs that match your skills and pay rate. Hourly or fixed rate.' },
  { icon: FileText,    title: '2. Bid & secure jobs',     desc: 'Search thousands of projects. Send customized proposals. Offer instant consultations. Interview and get hired. Start immediately. Set payment milestones.' },
  { icon: ShieldCheck, title: '3. Get paid & win more work', desc: 'Track time, deliver work, and get paid. Direct deposit, PayPal, Payoneer, wire transfer, and more. Get reviews, get more clients, and grow your business.' },
];

/* ─── Main page ─────────────────────────────────────────────── */
export default function CategoryJobs() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const key = (slug || params.get('category') || 'ai').toLowerCase();
  const preset = CATEGORY_PRESETS[key] || buildFallback(key);
  const [page, setPage] = useState(1);
  const totalPages = 5;

  const visible = useMemo(() => preset.jobs.slice(0, 6), [preset]);

  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 80 }}>

      {/* ── Hero ── */}
      <section className="container-custom pt-10 pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold font-display text-dark-100 tracking-tight leading-[1.1] mb-5"
        >
          Find the Best <span className="gradient-text">{preset.title}</span> Jobs
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-2.5 text-sm mb-7"
        >
          <span className="text-dark-300 font-semibold">Professionals on PANDA rate clients</span>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="font-bold text-dark-100">4.9/5</span>
        </motion.div>
        <p className="text-2xs text-dark-500 mb-7">On average from 2M+ reviews</p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
          >
            Find work
          </Link>
        </motion.div>
      </section>

      {/* ── Jobs + sidebar ── */}
      <section className="container-custom pb-16">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <h2 className="text-base text-dark-200 mb-4">
              Check out a sample of the <span className="font-bold text-dark-100">{preset.count.toLocaleString()}</span> {preset.title} jobs posted on PANDA
            </h2>
            <div className="text-2xs mb-2">
              <Link to="/jobs" className="text-primary-400 hover:text-primary-300 underline">Find freelance jobs</Link>
              <span className="text-dark-700 mx-2">/</span>
              <span className="text-dark-300">{preset.title} Jobs</span>
            </div>

            <div>
              {visible.length === 0 ? (
                <div className="py-16 text-center text-sm text-dark-500">
                  No sample jobs yet for this category — check back soon.
                </div>
              ) : visible.map((j, i) => <JobCard key={j.title} job={j} delay={i * 0.05} />)}
            </div>

            {/* Pagination */}
            {visible.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-full hover:bg-dark-800 flex items-center justify-center text-dark-300 disabled:opacity-30">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, k) => k + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                      page === n ? 'border border-dark-100 text-dark-100' : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-full hover:bg-dark-800 flex items-center justify-center text-dark-300 disabled:opacity-30">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Sign up to browse more */}
            <div className="flex items-center justify-center gap-4 mt-10">
              <span className="text-sm text-dark-300">Want to browse more {preset.title} jobs?</span>
              <Link to="/register" className="px-5 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
                Sign up
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-6">
              <h3 className="text-lg font-bold font-display text-dark-100">How it works</h3>
              {HOW_IT_WORKS.map((h, i) => {
                const Icon = h.icon;
                return (
                  <motion.div key={h.title} {...fadeUp(i * 0.07)} className="flex gap-3">
                    <span className="w-8 h-8 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary-400" strokeWidth={1.75} />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-dark-100 mb-1.5">{h.title}</h4>
                      <p className="text-2xs text-dark-400 leading-relaxed">{h.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      {/* ── In-demand skills ── */}
      <section className="container-custom pb-16">
        <h2 className="text-lg font-bold font-display text-dark-100 mb-6">Find jobs for other in-demand skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
          {preset.inDemand.map((s) => (
            <a key={s} onClick={(e) => e.preventDefault()} href="#" className="text-xs text-primary-400 hover:text-primary-300 underline underline-offset-4">
              {s} jobs
            </a>
          ))}
        </div>
      </section>

      {/* ── Similar skills ── */}
      <section className="container-custom pb-16">
        <h2 className="text-lg font-bold font-display text-dark-100 mb-6">Similar {preset.title} Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
          {preset.similar.map((s) => (
            <Link key={s} to={resolveFooter(s)} className="text-xs text-primary-400 hover:text-primary-300 underline underline-offset-4" >{s}</Link>
          ))}
        </div>
      </section>

      {/* ── Earnings banner ── */}
      <section className="container-custom pb-16">
        <div className="border-t-2 border-emerald-500/60 pt-1 mb-3" style={{ width: 64 }} />
        <div className="rounded-2xl bg-dark-900 border border-dark-800 p-8 md:p-12 grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-emerald-400 leading-tight mb-2">
              {preset.title} Engineers on PANDA
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-emerald-400 leading-tight mb-5">
              can earn ${preset.rate.min}–${preset.rate.max}/hr.
            </h3>
            <p className="text-xs text-dark-400 mb-7 max-w-md leading-relaxed">
              Learn more below about how you can earn a career on the world's work marketplace.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
              Start earning
            </Link>
          </div>
          <div className="text-center">
            <BellCurve min={preset.rate.min} max={preset.rate.max} />
            <div className="text-2xs text-dark-500 tracking-widest uppercase mt-2">Median hourly rates (USD)</div>
          </div>
        </div>
      </section>

      {/* ── Article ── */}
      <section className="container-custom pb-16 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-emerald-400 mb-5 leading-tight">
          {preset.article.heading}
        </h2>
        <div className="space-y-5 text-sm text-dark-300 leading-relaxed">
          {preset.article.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {preset.article.sections.map((sec, i) => (
            <div key={i} className="pt-3">
              <h3 className="text-xl md:text-2xl font-bold font-display text-emerald-400 mb-4 leading-tight">{sec.title}</h3>
              {sec.body.map((p, j) => <p key={j} className="mb-3">{p}</p>)}
              {sec.bullets && (
                <ul className="list-disc pl-6 space-y-2.5 marker:text-primary-500">
                  {sec.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
        <button className="mt-6 text-xs font-semibold text-primary-400 hover:text-primary-300 underline underline-offset-4">View more</button>
      </section>

      {/* ── Final CTA + Video preview ── */}
      <section className="container-custom pb-20">
        <div className="border-t-2 border-emerald-500/60 pt-1 mb-3" style={{ width: 64 }} />
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-emerald-400 leading-tight mb-4">
              Your next job starts right here
            </h2>
            <p className="text-sm text-dark-400 leading-relaxed mb-6 max-w-md">
              Set up a free profile to showcase your skills, experience and desired pay rate to clients. You choose the payment method that's best for you to easily get paid for your work.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all mb-6">
              Find work
            </Link>
            <div className="flex items-center gap-3 pt-4 border-t border-dark-800">
              <Lock className="w-5 h-5 text-dark-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-dark-100">PANDA Payment Protection</div>
                <div className="text-2xs text-dark-500">Gives you security and peace of mind</div>
              </div>
            </div>
          </div>

          {/* Video preview tile */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-dark-800 bg-gradient-to-br from-emerald-700/30 via-emerald-900/40 to-dark-950 group cursor-pointer">
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="text-base md:text-xl font-bold font-display text-white mb-1 leading-tight">Learn how to find great clients on PANDA</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-black/30 rounded-md backdrop-blur flex items-center justify-center">
                  <PandaLogo className="w-4 h-4" invert />
                </div>
                <span className="text-2xs font-black text-white tracking-widest uppercase">PANDA</span>
              </div>
            </div>
            {/* Play button */}
            <button className="absolute bottom-3 left-3 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 text-dark-950 ml-0.5" fill="currentColor" />
            </button>
            <span className="absolute bottom-4 right-3 text-2xs text-white/80 font-mono">01:14</span>
            {/* Inner side card mock */}
            <div className="absolute right-4 top-4 w-32 md:w-40 aspect-[3/4] rounded-lg bg-dark-950/90 border border-dark-700 p-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                <div className="h-1 flex-1 rounded bg-dark-700" />
              </div>
              <div className="text-2xs text-emerald-300 font-bold mb-1">Doug P.</div>
              <div className="space-y-1">
                {[...Array(4)].map((_, i) => <div key={i} className="h-1 rounded bg-dark-700" style={{ width: `${50 + Math.random() * 40}%` }} />)}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1">
                <div className="h-3 rounded bg-emerald-500/30" />
                <div className="h-3 rounded bg-emerald-500/30" />
                <div className="h-3 rounded bg-emerald-500/30" />
              </div>
              <div className="mt-1.5 space-y-0.5">
                {[...Array(4)].map((_, i) => <div key={i} className="h-1 rounded bg-dark-700" style={{ width: `${30 + Math.random() * 50}%` }} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-dark-900 border-t border-dark-800/60 py-10">
        <div className="container-custom flex items-center gap-2.5">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center ring-1 ring-white/10">
            <PandaLogo className="w-5 h-5" invert />
          </div>
          <span className="font-black font-display text-dark-100 text-base tracking-widest uppercase">PANDA</span>
          <span className="ml-auto text-2xs text-dark-600">© 2026 PANDA. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
