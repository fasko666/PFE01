import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, MapPin, Briefcase, ArrowRight, BadgeCheck, ChevronRight, Home,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Avatar helper ─────────────────────────────────────────── */
const avatar = (name, bg) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=120&bold=true`;

/* ─── Skill catalog ─────────────────────────────────────────── */
/* Each skill entry drives title, breadcrumbs, rating, reviews, and 6 freelancer cards. */
const SKILLS = {
  'ai-video-creators': {
    title: 'AI Video Creators',
    category: { label: 'Emerging Tech Freelancers', slug: 'emerging-tech' },
    source: 'G2', rating: 4.5, reviewsLabel: 'More than 3,000 reviews on G2', subLabel: 'of PANDA by G2 peer reviewers',
    freelancers: [
      { name: 'Muhammad I.', location: 'Rajanpur, Pakistan',         rate: '$20', rating: 5.0, jobs: 31, bio: 'Bringing your ideas to life with fast, cinematic AI video creation. I help clients produce high-quality AI-driven videos and…', skills: ['Generative AI Prompt', 'Storyboard', 'Social'] },
      { name: 'Ikponmwosa E.',location: 'Lagos, Nigeria',             rate: '$13', rating: 4.4, jobs: 68, bio: '🔥 Anything long-term, send them my way. I turn your ideas into AI videos that are fast, polished, and dangerously engaging.', skills: ['Motion Graphics', 'Explainer Video', 'Animation'] },
      { name: 'Muneer A.',   location: 'Dera Ghazi Khan, Pakistan',   rate: '$15', rating: 4.8, jobs: 86, bio: 'AI Video Generator | Higgsfield AI Video Generator | AI Avatar Videos | AI UGC Creator | Veo, Sora, Kling, HeyGen.', skills: ['AI Video Generator', 'AI Video Generation'] },
      { name: 'Abdul R.',    location: 'Rajanpur, Pakistan',          rate: '$25', rating: 5.0, jobs: 12, bio: 'I specialize in high-converting AI videos, AI avatar videos, cinematic AI ads, and viral AI UGC content designed to stop the scroll.', skills: ['AI Video Generation', 'AI Text-to-Image', 'AI'] },
      { name: 'Eric R.',     location: 'Los Angeles, California',     rate: '$50', rating: 5.0, jobs: 48, bio: 'Cinematic AI Video Director | Veo 3, Runway Gen-3 | Paid Ads, UGC and CTV. I create commercial-grade AI videos and ads.', skills: ['AI Video Generation', 'AI Content Creation'] },
      { name: 'Olena Z.',    location: 'Porto, Portugal',             rate: '$40', rating: 5.0, jobs: 43, bio: 'I turn product photos, scripts, and brand messaging into AI UGC ads, real estate B-roll, and conversion-focused video content for Meta.', skills: ['AI Video Generation', 'UGC', 'Adobe Premiere'] },
    ],
  },

  'full-stack-developers': {
    title: 'Full Stack Developers',
    category: { label: 'Development & IT Talent', slug: 'development-it' },
    rating: 4.8, reviewsLabel: 'Clients rate our Full Stack Developers', subLabel: 'Based on 75,309 client reviews',
    freelancers: [
      { name: 'Tien L.',      location: 'Ho Chi Minh City, Vietnam', rate: '$10', rating: 5.0, jobs: 12,  bio: 'Passionate full-stack engineer with 5+ years of hands-on experience in developing scalable websites/applications using a wide range of technologies.', skills: ['JavaScript', 'Web Application', 'Google Sheets'] },
      { name: 'Arun K.',      location: 'Bilaspur, India',           rate: '$23', rating: 4.8, jobs: 17,  bio: 'I build scalable backend systems, automation solutions, and data-driven applications using Python. With 5+ years of experience, I specialize…', skills: ['Python', 'Django', 'FastAPI', 'Automation'] },
      { name: 'Ratish D.',    location: 'Mohali, India',             rate: '$25', rating: 5.0, jobs: 11,  bio: "Engineering isn't just coding — it's a revenue decision. The right architecture, efficient backend logic, and scalable cloud…",                                                  skills: ['Full-Stack Development', 'JavaScript', 'React'] },
      { name: 'Oleksandr K.', location: 'Kyiv, Ukraine',             rate: '$30', rating: 4.7, jobs: 279, bio: '🔥 I help startups and growing businesses build fast, scalable web and mobile apps using Python, Laravel, React Native, and React. I work as a full-stack…', skills: ['Full-Stack Development', 'API Integration'] },
      { name: 'Mustafa G.',   location: 'Karachi, Pakistan',         rate: '$15', rating: 5.0, jobs: 29,  bio: "Hello, I'm Mustafa Ghouri — a Full-Stack Developer and MERN Stack specialist with 6+ years of professional experience building scalable…",                                       skills: ['JavaScript', 'WordPress', 'React', 'HTML'] },
      { name: 'Artem C.',     location: 'Kyiv, Ukraine',             rate: '$40', rating: 4.2, jobs: 118, bio: '🚀 My name is Artem, Co Founder and CTO of JoinToIT. I am a Full Stack Developer with more than 12 years of experience building SaaS…',                                            skills: ['Full-Stack Development', 'API', 'API Integration'] },
    ],
  },

  'chatbot-developers': {
    title: 'Chatbot Developers',
    category: { label: 'Emerging Tech Freelancers', slug: 'emerging-tech' },
    rating: 4.8, reviewsLabel: 'Clients rate our Chatbot Developers', subLabel: 'Based on 1,109 client reviews',
    freelancers: [
      { name: 'Syed A.',         location: 'Lahore, Pakistan',     rate: '$35', rating: 4.7, jobs: 52,  bio: '🌐 🚀 MVP / SAAS Specialist Expertise in | AI Developer | RAG | LLM | AI Integration | Python | OpenAI API Integration | Artificial intelligence.', skills: ['Chatbot Development', 'Artificial Intelligence'] },
      { name: 'Waqar Hussain S.',location: 'Fort McMurray, Canada',rate: '$15', rating: 4.6, jobs: 68,  bio: 'I CONSULT first, then AUTOMATE. If you already know exactly what needs to be automated and how, we can jump straight into execution. But in…',          skills: ['Tech & IT', 'AI Agent Development', 'AI Chatbot'] },
      { name: 'Jaikishan P.',    location: 'Surat, India',          rate: '$22', rating: 5.0, jobs: 32,  bio: 'If your team is still doing manually what AI should be handling, I build the systems that close that gap. I have automated 75-80% of manual…',          skills: ['Chatbot Development', 'Automation', 'AI Agents'] },
      { name: 'Atul K.',         location: 'Noida, India',          rate: '$25', rating: 4.9, jobs: 155, bio: 'Top Rated AI Engineer & Full-Stack Developer | 8+ Years | 1% of PANDA | 100% Job Success ✅ $300K+ Total earnings ✅ 8+ Years…',                          skills: ['AI Bot', 'AI Chatbot', 'AI Development'] },
      { name: 'Muhammad S.',     location: 'Burewala, Pakistan',    rate: '$20', rating: 5.0, jobs: 14,  bio: 'AI Chatbot Developer specializing in OpenAI chatbots, AI agents, and automation systems for businesses. I build AI chatbots that capture…',             skills: ['AI Agent Development', 'AI App Development'] },
      { name: 'Awais N.',        location: 'Lahore, Pakistan',      rate: '$40', rating: 4.9, jobs: 109, bio: 'I have spent 8 years at the intersection of data, AI, and the question nobody wants to ask "does it actually deliver results?" From forecasting…',     skills: ['Chatbot Development', 'Natural Language Processing'] },
    ],
  },

  'react-developers': {
    title: 'React Developers',
    category: { label: 'Development & IT Talent', slug: 'development-it' },
    rating: 4.9, reviewsLabel: 'Clients rate our React Developers', subLabel: 'Based on 42,180 client reviews',
    freelancers: [
      { name: 'Hassan A.',  location: 'Dubai, UAE',           rate: '$110', rating: 5.0, jobs: 632, bio: 'React + Next.js + Node specialist. I rebuilt 50+ marketing sites and dashboards. Code quality and handoff are my obsessions.', skills: ['React', 'Next.js', 'TypeScript'] },
      { name: 'Maya R.',    location: 'Tel Aviv, Israel',     rate: '$95',  rating: 5.0, jobs: 187, bio: 'Frontend engineer focused on conversion-friendly React UIs. Figma → pixel-perfect React in days, not weeks.',                    skills: ['React', 'Tailwind', 'Framer Motion'] },
      { name: 'Mateus P.',  location: 'São Paulo, Brazil',    rate: '$85',  rating: 4.9, jobs: 401, bio: 'React + React Native developer building web and mobile apps for startups across LATAM and the US. Strong on state and accessibility.', skills: ['React', 'React Native', 'Redux'] },
      { name: 'Priya N.',   location: 'Bangalore, India',     rate: '$70',  rating: 5.0, jobs: 218, bio: 'Senior React engineer specializing in dashboards, data tables, and complex form flows. Type-safe codebases by default.',          skills: ['React', 'TypeScript', 'React Query'] },
      { name: 'Daniel K.',  location: 'Berlin, Germany',      rate: '$120', rating: 4.9, jobs: 95,  bio: 'Performance-focused React developer. Core Web Vitals, hydration optimization, and micro-frontends are my comfort zone.',           skills: ['React', 'Vite', 'Performance'] },
      { name: 'Sofia E.',   location: 'Madrid, Spain',        rate: '$95',  rating: 4.8, jobs: 312, bio: 'B2B SaaS React specialist. I have shipped admin panels for 30+ SaaS products. Headless UI patterns and design systems.',            skills: ['React', 'Storybook', 'Design Systems'] },
    ],
  },

  'ui-ux-designers': {
    title: 'UI/UX Designers',
    category: { label: 'Design & Creative Talent', slug: 'design-creative' },
    rating: 4.9, reviewsLabel: 'Clients rate our UI/UX Designers', subLabel: 'Based on 58,420 client reviews',
    freelancers: [
      { name: 'Oren T.',      location: 'Tel Aviv, Israel',  rate: '$145', rating: 4.9, jobs: 954, bio: 'Sr. UX/UI & Graphic Designer | Branding & Web. I lead end-to-end product redesigns for B2B SaaS and consumer apps.', skills: ['UI Design', 'UX Research', 'Figma'] },
      { name: 'Phil S.',      location: 'London, UK',        rate: '$90',  rating: 5.0, jobs: 43,  bio: 'B2B SaaS Product Designer | AI-Native. I ship full product flows from research to handoff, every two weeks.',     skills: ['Product Design', 'Prototyping', 'AI UX'] },
      { name: 'Jonathan D.',  location: 'Austin, TX',        rate: '$125', rating: 4.8, jobs: 80,  bio: 'UX/UI Designer | AI SaaS & B2B Workflows. Clean, thoughtful design that meets the criteria the first time.',         skills: ['UI Design', 'B2B SaaS', 'Workflows'] },
      { name: 'Imani O.',     location: 'Lagos, Nigeria',    rate: '$140', rating: 5.0, jobs: 215, bio: 'Performance creative director crossing into product UX. Brands love the consistency from ad creative to product UI.',  skills: ['Brand', 'Product Design', 'Motion'] },
      { name: 'Liam K.',      location: 'Dublin, Ireland',   rate: '$120', rating: 4.9, jobs: 88,  bio: 'Landing page & CRO designer. My pages convert. 38% lift on the average client engagement.',                              skills: ['Landing Pages', 'CRO', 'Webflow'] },
      { name: 'Reina S.',     location: 'Tokyo, Japan',      rate: '$85',  rating: 4.8, jobs: 263, bio: 'UGC + Product UX double-threat. I bring video creator instincts to mobile-first product design.',                       skills: ['Mobile UX', 'UGC', 'Figma'] },
    ],
  },

  'logo-designers': {
    title: 'Logo Designers',
    category: { label: 'Design & Creative Talent', slug: 'design-creative' },
    rating: 4.9, reviewsLabel: 'Clients rate our Logo Designers', subLabel: 'Based on 38,200 client reviews',
    freelancers: [
      { name: 'Nadia K.', location: 'Casablanca, Morocco', rate: '$45',  rating: 5.0, jobs: 412, bio: 'Brand identity & logo designer for 400+ startups. I deliver 3 concepts in 48h and unlimited revisions until you love it.', skills: ['Logo Design', 'Brand Identity', 'Typography'] },
      { name: 'Julian T.',location: 'Barcelona, Spain',    rate: '$65',  rating: 4.9, jobs: 287, bio: 'Strategic logo design rooted in brand workshops. I do not just draw marks — I build identities that scale.',                 skills: ['Logo Design', 'Brand Strategy', 'Print'] },
      { name: 'Aisha B.', location: 'Cairo, Egypt',        rate: '$30',  rating: 5.0, jobs: 521, bio: 'Vector-perfect logos with full brand guidelines included. Tech, food, fashion, fintech — over 500 brands shipped.',             skills: ['Logo Design', 'Vector', 'Brand Guidelines'] },
      { name: 'Rocco V.', location: 'Milan, Italy',        rate: '$110', rating: 5.0, jobs: 92,  bio: 'Award-winning Italian designer for premium and luxury brands. Editorial typography is my signature.',                            skills: ['Luxury Brand', 'Typography', 'Editorial'] },
      { name: 'Sana M.',  location: 'Karachi, Pakistan',   rate: '$25',  rating: 4.8, jobs: 633, bio: 'Affordable, professional logos for small businesses. Fast turnaround and clean source files every time.',                        skills: ['Logo Design', 'Small Business', 'Adobe Illustrator'] },
      { name: 'Eddie F.', location: 'Brooklyn, NY',        rate: '$130', rating: 4.9, jobs: 175, bio: 'Logo + motion designer. I deliver both the static mark and an animated version your team can use anywhere.',                    skills: ['Logo Design', 'Motion Branding', 'After Effects'] },
    ],
  },

  'content-writers': {
    title: 'Content Writers',
    category: { label: 'Writing & Translation Talent', slug: 'writing-translation' },
    rating: 4.8, reviewsLabel: 'Clients rate our Content Writers', subLabel: 'Based on 51,090 client reviews',
    freelancers: [
      { name: 'Amelia R.', location: 'Toronto, Canada',  rate: '$75', rating: 5.0, jobs: 412, bio: 'B2B SaaS content writer. I have built content engines that drove 80K+ monthly organic visits for SaaS pricing pages.', skills: ['Content Writing', 'B2B SaaS', 'SEO'] },
      { name: 'Kabir J.',  location: 'Mumbai, India',    rate: '$30', rating: 4.9, jobs: 720, bio: 'Long-form blog and article writer. I have ghostwritten for 50+ Forbes, Inc., and Entrepreneur contributors.',           skills: ['Long-form', 'Blog Writing', 'Ghostwriting'] },
      { name: 'Sophie H.', location: 'Paris, France',    rate: '$85', rating: 5.0, jobs: 168, bio: 'Bilingual EN/FR content writer for luxury, beauty, and travel brands. I write to convert in two languages.',           skills: ['Bilingual', 'Luxury', 'Travel'] },
      { name: 'Marcus L.', location: 'Cape Town, SA',    rate: '$50', rating: 4.8, jobs: 305, bio: 'Tech content writer covering AI, fintech, and developer tools. 800+ published pieces on top-tier blogs.',                skills: ['Tech Writing', 'AI', 'Developer Tools'] },
      { name: 'Yui M.',    location: 'Singapore',        rate: '$70', rating: 4.9, jobs: 248, bio: 'APAC-focused content strategist. I research, write, and edit for brands expanding into Southeast Asia.',                 skills: ['Content Strategy', 'APAC', 'Editing'] },
      { name: 'Ben V.',    location: 'Amsterdam, NL',    rate: '$95', rating: 5.0, jobs: 119, bio: 'Newsletter and thought-leadership writer. I help founders sound like the smartest person in their inbox.',               skills: ['Newsletters', 'Thought Leadership', 'Founder Voice'] },
    ],
  },

  'seo-experts': {
    title: 'SEO Experts',
    category: { label: 'Sales & Marketing Talent', slug: 'sales-marketing' },
    rating: 4.8, reviewsLabel: 'Clients rate our SEO Experts', subLabel: 'Based on 22,650 client reviews',
    freelancers: [
      { name: 'Priya N.',  location: 'Bangalore, India',   rate: '$130', rating: 5.0, jobs: 218, bio: 'Technical SEO strategist specializing in Core Web Vitals, internal linking, and rendering. Doubled traffic for 30+ SaaS clients.', skills: ['Technical SEO', 'Core Web Vitals', 'Audits'] },
      { name: 'Daniel K.', location: 'Berlin, Germany',    rate: '$120', rating: 4.9, jobs: 95,  bio: 'CRO + SEO consultant. I do not just rank pages — I make them convert.',                                                                skills: ['SEO', 'CRO', 'Analytics'] },
      { name: 'Sofia E.',  location: 'Madrid, Spain',      rate: '$95',  rating: 4.8, jobs: 312, bio: 'B2B SEO lead. I build content engines that drive demo requests, not just traffic.',                                                  skills: ['B2B SEO', 'Content', 'Strategy'] },
      { name: 'Hiro T.',   location: 'Osaka, Japan',       rate: '$80',  rating: 4.9, jobs: 175, bio: 'International SEO specialist for brands expanding into APAC. Multilingual hreflang done right.',                                     skills: ['International SEO', 'hreflang', 'APAC'] },
      { name: 'Lena P.',   location: 'Warsaw, Poland',     rate: '$70',  rating: 5.0, jobs: 263, bio: 'Programmatic SEO for marketplaces and directories. 100K+ pages, fully indexed, no thin content.',                                    skills: ['Programmatic SEO', 'Marketplaces', 'Indexing'] },
      { name: 'Yusuf A.',  location: 'Istanbul, Turkey',   rate: '$55',  rating: 4.8, jobs: 488, bio: 'Local SEO and Google Business Profile expert for service businesses across MEA and Europe.',                                          skills: ['Local SEO', 'GBP', 'Reviews'] },
    ],
  },
};

/* ─── Popular skill pills (homepage of /find-talent) ────────── */
const POPULAR_SKILLS = [
  { label: 'AI Video Creators',     slug: 'ai-video-creators' },
  { label: 'Full Stack Developers', slug: 'full-stack-developers' },
  { label: 'Chatbot Developers',    slug: 'chatbot-developers' },
  { label: 'React Developers',      slug: 'react-developers' },
  { label: 'UI/UX Designers',       slug: 'ui-ux-designers' },
  { label: 'Logo Designers',        slug: 'logo-designers' },
  { label: 'Content Writers',       slug: 'content-writers' },
  { label: 'SEO Experts',           slug: 'seo-experts' },
];

const AVATAR_COLORS = ['4361ff', 'ec4899', '059669', '8b5cf6', 'f59e0b', 'ef4444'];

const FOOTER_COLS = [
  { title: 'For Clients', items: ['How to hire', 'Talent Marketplace', 'Project Catalog', 'Hire an agency', 'Enterprise', 'Business Plus', 'Any hire', 'Contract-to-hire', 'Direct Contracts', 'Hire worldwide', 'Hire in the USA'] },
  { title: 'For Talent', items: ['How to find work', 'Direct Contracts', 'Find freelance jobs worldwide', 'Find freelance jobs in the USA', 'Win work with ads', 'Exclusive resources with Freelancer Plus'] },
  { title: 'Resources', items: ['Help & support', 'Success stories', 'PANDA reviews', 'Resources', 'Blog', 'Affiliate program', 'Refer a client', 'Free Business Tools', 'Release notes'] },
  { title: 'Company', items: ['About us', 'Leadership', 'Investor relations', 'Careers', 'Our impact', 'Press', 'Contact us', 'Partners', 'Trust, safety & security', 'Modern slavery statement'] },
];

/* ─── Freelancer card ───────────────────────────────────────── */
function FreelancerCard({ f, delay }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      whileHover={{ y: -6 }}
      className="rounded-3xl border border-dark-800 bg-dark-900 p-5 hover:border-primary-500/40 hover:shadow-[0_25px_60px_-15px_rgba(67,97,255,0.25)] transition-all flex flex-col"
    >
      <div className="flex items-start gap-3 mb-4">
        <img src={f.avatar} alt={f.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-sm font-bold text-dark-100">{f.name}</h3>
            <BadgeCheck className="w-3.5 h-3.5 text-primary-400" />
          </div>
          <div className="flex items-center gap-1 text-2xs text-dark-500 mb-2">
            <MapPin className="w-3 h-3" />
            {f.location}
          </div>
          <div className="flex items-center gap-3 text-2xs">
            <span className="text-dark-200 font-semibold">{f.rate}<span className="text-dark-500 font-normal">/hr</span></span>
            <span className="inline-flex items-center gap-1 text-dark-300 font-semibold">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {f.rating.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1 text-dark-300 font-semibold">
              <Briefcase className="w-3 h-3 text-dark-500" />
              {f.jobs} jobs
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-dark-300 leading-relaxed mb-4 line-clamp-3 flex-1">{f.bio}</p>

      <div className="flex items-center gap-1.5 mb-5 overflow-hidden">
        {f.skills.slice(0, 3).map((s) => (
          <span key={s} className="px-2.5 py-1 rounded-full text-2xs font-medium bg-dark-800 text-dark-200 whitespace-nowrap">
            {s}
          </span>
        ))}
        <button className="w-6 h-6 rounded-full bg-dark-800 text-dark-400 flex items-center justify-center hover:bg-dark-700 transition-colors shrink-0">
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <Link
        to="/freelancers"
        className="block w-full text-center py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
      >
        See profile
      </Link>
    </motion.div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function FindTalent() {
  const { skill } = useParams();
  const slug = skill || 'ai-video-creators';
  const data = SKILLS[slug] || SKILLS['ai-video-creators'];
  const [page, setPage] = useState(1);

  /* attach avatars deterministically per index */
  const freelancers = useMemo(
    () => data.freelancers.map((f, i) => ({ ...f, avatar: avatar(f.name, AVATAR_COLORS[i % AVATAR_COLORS.length]) })),
    [data]
  );
  const visible = freelancers.slice(0, page * 6);

  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 80 }}>

      {/* Hero */}
      <section className="container-custom pt-10 pb-12 text-center">
        <motion.h1
          key={slug}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-4xl md:text-5xl font-bold font-display text-dark-100 tracking-tight leading-[1.05] mb-5"
        >
          Hire the Best <span className="gradient-text">{data.title}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-1 text-sm flex-wrap"
        >
          <span className="text-dark-300">{data.reviewsLabel}</span>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => {
              const filled = i < Math.floor(data.rating);
              const half = i === Math.floor(data.rating) && data.rating % 1 >= 0.4;
              return (
                <Star
                  key={i}
                  className={`w-4 h-4 ${filled || half ? 'fill-yellow-400 text-yellow-400' : 'fill-yellow-400/60 text-yellow-400/60'}`}
                />
              );
            })}
          </div>
          <span className="text-dark-100 font-bold">{data.rating.toFixed(1)}/5</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-2xs text-dark-500 mb-7"
        >
          {data.subLabel}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            to="/jobs/post"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
          >
            Hire freelancers <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Breadcrumbs */}
      <section className="container-custom pb-6">
        <nav className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-dark-500">
          <Link to="/" className="hover:text-dark-200 transition-colors flex items-center">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <span className="text-dark-700">/</span>
          <Link to="/find-talent" className="text-primary-400 hover:text-primary-300 transition-colors">
            {data.category.label}
          </Link>
          <span className="text-dark-700">/</span>
          <span className="text-dark-300">{data.title}</span>
        </nav>
      </section>

      {/* Freelancers grid */}
      <section className="container-custom pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {visible.map((f, i) => <FreelancerCard key={f.name} f={f} delay={i * 0.05} />)}
        </div>

        {visible.length < freelancers.length && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-7 py-2.5 rounded-full border border-primary-500/40 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 hover:border-primary-500 transition-all"
            >
              View more freelancers
            </button>
          </div>
        )}
      </section>

      {/* Popular skills */}
      <section className="container-custom py-16 border-t border-dark-800">
        <motion.div {...fadeUp(0)} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 mb-3">
            Browse popular talent
          </h2>
          <p className="text-sm text-dark-400">Hand-picked categories of top-rated freelancers</p>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
          {POPULAR_SKILLS.map((s, i) => (
            <motion.div key={s.slug} {...fadeUp(i * 0.02)}>
              <Link
                to={`/find-talent/${s.slug}`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                  s.slug === slug
                    ? 'border-primary-500/60 bg-primary-500/10 text-primary-300'
                    : 'border-dark-700 bg-dark-900 text-dark-200 hover:border-primary-500/40 hover:text-primary-300 hover:bg-dark-800'
                }`}
              >
                Hire {s.label}
                <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-dark-950">
        <div className="container-custom">
          <motion.div
            {...fadeUp(0)}
            className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600"
          >
            <div className="absolute inset-0 bg-grid opacity-15" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-5">
                Ready to find your next great hire?
              </h2>
              <p className="text-white/80 text-sm md:text-base mb-7 max-w-xl mx-auto">
                Post a job in minutes and get matched with vetted talent in 24 hours.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/jobs/post" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-primary-700 text-sm font-semibold hover:bg-dark-50 transition-all">
                  Post a job <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/pricing" className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 backdrop-blur transition-all">
                  See pricing
                </Link>
              </div>
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
                <ul className="space-y-2.5">{col.items.map((l) => <li key={l}><a href="#" className="text-xs text-dark-400 hover:text-dark-100 transition-colors">{l}</a></li>)}</ul>
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
