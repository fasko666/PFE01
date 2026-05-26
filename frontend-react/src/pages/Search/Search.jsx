import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon, X, ChevronDown, Check, MapPin, BadgeCheck,
  Calendar, DollarSign, Briefcase, ThumbsUp, Sparkles, HelpCircle,
  ArrowLeft, ExternalLink, Star, Play, ChevronLeft, ChevronRight, Plus,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Sub-nav categories ─────────────────────────────────────── */
const SUB_NAV = ['Development & IT', 'AI Services', 'Design & Creative', 'Sales & Marketing', 'Admin & Customer Support'];

/* ─── Talent results ─────────────────────────────────────────── */
const TALENT = [
  {
    name: 'Dipesh S.', title: 'Social Media Marketing Expert', country: 'Nepal',
    jobSuccess: 90, earned: '$60K+', available: true,
    skills: ['Facebook Ads Manager', 'Facebook Advertising', 'Digital Marketing Strategy', '+12'],
    bio: "Tired of boring, lackluster ads that couldn't sell sunscreen in the Sahara? Picture this: you have a product or service that deserves the spotlight, and you want it to shine brighter than a disco ball at a 70s party. Well, fret no…",
    avatar: 'https://ui-avatars.com/api/?name=Dipesh+S&background=4361ff&color=fff&size=120&bold=true',
  },
  {
    name: 'Jarod S.', title: '300M+ Generated For Service & SaaS Businesses. Google Ads + CRO', country: 'United States',
    jobSuccess: 100, earned: '$200K+', available: true, consultations: true,
    skills: ['Google Ads', 'PPC Campaign Setup & Management', 'Display Ad', 'Digital Marketing', '+16'],
    bio: '💯 200% Money Back Guarantee 💯 Month-to-Month 💯 Landers + CRO Included 💯 Google Partner I help service & SaaS businesses drive qualified traffic to their website, turn that traffic into leads, measure which lead…',
    associated: { name: 'Comet Fuel', earned: '$6K+' },
    avatar: 'https://ui-avatars.com/api/?name=Jarod+S&background=8b5cf6&color=fff&size=120&bold=true',
  },
  {
    name: 'Zoreslava H.', title: 'Quality Assurance Engineer | Team Lead | Senior QA | Manual testing', country: 'Ukraine',
    jobSuccess: 99, earned: '$3K+', available: true,
    skills: ['Postman', 'Regression Testing', 'Test Results & Analysis', 'Mobile QA', 'Test Case Design', '+15'],
    bio: 'Greetings! 👋 🌍 True expert in QA. 🏆 8+ years of experience, manual, automating, and refining software end-to-end. 🚀 I help startups and established teams release with confidence by ensuring quality at every stage fro…',
    associated: { name: 'QUARTE', earned: '$90K+' },
    avatar: 'https://ui-avatars.com/api/?name=Zoreslava+H&background=ec4899&color=fff&size=120&bold=true',
  },
  {
    name: 'Ashkan A.', title: 'Python Backend Developer | AI Integration & Automation Specialist', country: 'Turkey',
    jobSuccess: 96, earned: '$45K+', available: true,
    skills: ['Python', 'FastAPI', 'OpenAI API', 'PostgreSQL', '+9'],
    bio: 'Backend engineer with 7+ years specializing in Python, FastAPI, and AI integrations. I build production-grade APIs, ETL pipelines, and AI agents. Recent projects include RAG systems for SaaS startups and automation for…',
    avatar: 'https://ui-avatars.com/api/?name=Ashkan+A&background=10b981&color=fff&size=120&bold=true',
  },
];

/* ─── Job results ────────────────────────────────────────────── */
const JOBS = [
  {
    posted: '4 weeks ago',
    title: 'Instructor Recommendations – Solar, EPA 608 & Carpentry Trainings',
    type: 'Hourly · Intermediate · Est. time: Less than 1 month, Less than 30 hrs/week',
    desc: "I hope you're doing well. I'm reaching out to see if you might have any instructor recommendations for a few upcoming training opportunities we're currently planning. ____________________________ Solar Instructor Opportunity We are looking for a qualified solar instruct…",
    skills: ['Microsoft Excel', 'PDF Conversion', 'Financial Planning', 'Management Consulting', 'Financial Modeling', '+10'],
  },
  {
    posted: '4 weeks ago',
    title: 'Testimonial VIDEO',
    type: 'Hourly · Intermediate · Est. time: Less than 1 month, Less than 30 hrs/week',
    desc: 'Hi, quick paid opportunity 🔥 We\'re looking for Indian male creators to record a short "client experience / case study" style video (30–45 sec). It\'s for a B2B marketing campaign (international audience), so we need a professional, natural delivery in English. No posting required — just recording…',
    skills: ['Spokesperson Video', 'Narrated Presentation', 'Live Action Explainer', 'Video Narration', 'Green Screen', 'TikTok', '+9'],
  },
  {
    posted: '3 weeks ago',
    title: 'Cold Call Demo Setter for Website Design and SaaS Agency',
    type: 'Hourly · $4.00 - $4.00 · Intermediate · Est. time: 1 to 3 months, Less than 30 hrs/week',
    desc: 'We are seeking a proactive and results-driven cold call demo setter to join our website design and SaaS agency. The ideal candidate will be responsible for reaching out to potential clients, setting demos, and generating leads. You should be comfortable speaking on the phone and have …',
    skills: ['Cold Calling', 'Sales', 'Outbound Sales', 'HubSpot'],
  },
  {
    posted: '4 weeks ago',
    title: 'Video Editor for YouTube Channel',
    type: 'Fixed price · Intermediate · Est. budget: $150.00',
    desc: 'I am seeking a skilled video editor to create engaging documentary-style videos for my YouTube channel. The videos are approximately 25 minutes long and require attention to detail to maintain viewer interest. The ideal candidate will have experience in video post-editing and be able to deliver…',
    skills: ['Video Editing', 'Video Post-Editing', 'YouTube Marketing', 'YouTube Development'],
  },
  {
    posted: '3 weeks ago',
    title: 'Looping video of ocean storm for art installation',
    type: 'Fixed price · Intermediate · Est. budget: $300.00',
    desc: 'I need a 30-second seamlessly looping video of a stylized ocean storm — high seas, dark clouds, lightning. For projection in a gallery installation. Resolution 4K, no audio required. Reference materials available on request.',
    skills: ['Video Production', 'Motion Graphics', 'After Effects', '+3'],
  },
];

/* ─── Filter sidebar — Talent ────────────────────────────────── */
function TalentFilters() {
  const [badges, setBadges] = useState([]);
  const [type, setType] = useState('all');
  const [skills, setSkills] = useState([]);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const toggleBadge = (b) => setBadges((s) => s.includes(b) ? s.filter((x) => x !== b) : [...s, b]);
  const toggleSkill = (s) => setSkills((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);

  const BADGES = [
    { name: 'Top Rated Plus', color: 'bg-pink-500' },
    { name: 'Top Rated',      color: 'bg-blue-500' },
    { name: 'Rising Talent',  color: 'bg-green-500' },
  ];

  const SKILLS_BASE = ['Data Entry', 'Java', 'React', 'WordPress', 'Android App Development', 'Adobe Photoshop', 'Python'];
  const SKILLS_MORE = ['Node.js', 'TypeScript', 'Figma', 'SEO', 'Copywriting', 'Shopify'];

  return (
    <aside className="space-y-6">
      {/* Talent badge */}
      <FilterGroup title="Talent badge" hint>
        <div className="space-y-2.5">
          {BADGES.map((b) => (
            <Checkbox key={b.name} checked={badges.includes(b.name)} onChange={() => toggleBadge(b.name)}>
              <span className={`inline-block w-3 h-3 rounded ${b.color} mr-1.5 align-middle`} />
              {b.name}
            </Checkbox>
          ))}
        </div>
      </FilterGroup>

      {/* Skills */}
      <FilterGroup title="Skills">
        <div className="space-y-2.5">
          {SKILLS_BASE.map((s) => (
            <Checkbox key={s} checked={skills.includes(s)} onChange={() => toggleSkill(s)}>{s}</Checkbox>
          ))}
          {showAllSkills && SKILLS_MORE.map((s) => (
            <Checkbox key={s} checked={skills.includes(s)} onChange={() => toggleSkill(s)}>{s}</Checkbox>
          ))}
          <button
            onClick={() => setShowAllSkills(!showAllSkills)}
            className="flex items-center gap-1 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showAllSkills ? 'rotate-180' : ''}`} />
            {showAllSkills ? 'See less' : 'See more'}
          </button>
        </div>
      </FilterGroup>

      <FilterGroup title="Location">
        <Select placeholder="Select talent location" />
      </FilterGroup>

      <FilterGroup title="Talent time zones">
        <Select placeholder="Select talent time zones" />
      </FilterGroup>

      <FilterGroup title="Talent type">
        <div className="space-y-2.5">
          {['Freelancers & Agencies', 'Freelancers', 'Agencies'].map((t) => (
            <Radio key={t} checked={type === t.toLowerCase()} onChange={() => setType(t.toLowerCase())}>
              {t}
            </Radio>
          ))}
        </div>
        <div className="space-y-2.5 mt-3 pt-3 border-t border-dark-800">
          <Checkbox>Open to contract-to-hire</Checkbox>
          <Checkbox>Offers consultations</Checkbox>
        </div>
      </FilterGroup>

      <FilterGroup title="Job success" />
      <FilterGroup title="Earned amount" />
      <FilterGroup title="Hours billed" />
      <FilterGroup title="English level" />
      <FilterGroup title="Other languages" />
    </aside>
  );
}

/* ─── Filter sidebar — Jobs ──────────────────────────────────── */
function JobFilters() {
  return (
    <aside className="space-y-6">
      <FilterGroup title="Category">
        <Select placeholder="Select Categories" />
      </FilterGroup>

      <FilterGroup title="Experience level">
        <div className="space-y-2.5">
          <Checkbox>Entry Level <span className="text-dark-500">(10,281)</span></Checkbox>
          <Checkbox>Intermediate <span className="text-dark-500">(92,065)</span></Checkbox>
          <Checkbox>Expert <span className="text-dark-500">(36,661)</span></Checkbox>
        </div>
      </FilterGroup>

      <FilterGroup title="Job type">
        <div className="space-y-2.5">
          <Checkbox>Hourly <span className="text-dark-500">(87,183)</span></Checkbox>
          <div className="flex gap-2 pl-6">
            <input placeholder="Min" className="w-16 px-2 py-1 rounded-md bg-dark-900 border border-dark-700 text-xs text-dark-200 placeholder:text-dark-600" />
            <span className="text-xs text-dark-500 self-center">/hr</span>
            <input placeholder="Max" className="w-16 px-2 py-1 rounded-md bg-dark-900 border border-dark-700 text-xs text-dark-200 placeholder:text-dark-600" />
            <span className="text-xs text-dark-500 self-center">/hr</span>
          </div>
          <Checkbox>Fixed-Price <span className="text-dark-500">(51,913)</span></Checkbox>
          <div className="space-y-2 pl-6">
            <Checkbox sub>Less than $100 <span className="text-dark-500">(21,861)</span></Checkbox>
            <Checkbox sub>$100 to $500 <span className="text-dark-500">(17,577)</span></Checkbox>
            <Checkbox sub>$500 - $1K <span className="text-dark-500">(5,416)</span></Checkbox>
            <Checkbox sub>$1K - $5K <span className="text-dark-500">(5,802)</span></Checkbox>
            <Checkbox sub>$5K+ <span className="text-dark-500">(1,257)</span></Checkbox>
            <div className="flex gap-2">
              <input placeholder="Min" className="w-16 px-2 py-1 rounded-md bg-dark-900 border border-dark-700 text-xs text-dark-200 placeholder:text-dark-600" />
              <input placeholder="Max" className="w-16 px-2 py-1 rounded-md bg-dark-900 border border-dark-700 text-xs text-dark-200 placeholder:text-dark-600" />
            </div>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Client history">
        <div className="space-y-2.5">
          <Checkbox>No hires <span className="text-dark-500">(44,206)</span></Checkbox>
          <Checkbox>1 to 9 hires <span className="text-dark-500">(37,338)</span></Checkbox>
          <Checkbox>10+ hires <span className="text-dark-500">(57,426)</span></Checkbox>
        </div>
      </FilterGroup>

      <FilterGroup title="Client location" hint>
        <Select placeholder="Select client locations" />
      </FilterGroup>

      <FilterGroup title="Client time zones" hint>
        <Select placeholder="Select client time zones" />
      </FilterGroup>

      <FilterGroup title="Project length">
        <div className="space-y-2.5">
          <Checkbox>Less than one month <span className="text-dark-500">(78,065)</span></Checkbox>
          <Checkbox>1 to 3 months <span className="text-dark-500">(83,409)</span></Checkbox>
          <Checkbox>3 to 6 months <span className="text-dark-500">(59,073)</span></Checkbox>
          <Checkbox>More than 6 months <span className="text-dark-500">(74,283)</span></Checkbox>
        </div>
      </FilterGroup>

      <FilterGroup title="Hours per week">
        <div className="space-y-2.5">
          <Checkbox>Less than 30 hrs/week <span className="text-dark-500">(54,451)</span></Checkbox>
          <Checkbox>More than 30 hrs/week <span className="text-dark-500">(73,500)</span></Checkbox>
        </div>
      </FilterGroup>

      <FilterGroup title="Job duration">
        <div className="space-y-2.5">
          <Checkbox>Contract-to-hire roles <span className="text-dark-500">(29,417)</span></Checkbox>
        </div>
      </FilterGroup>
    </aside>
  );
}

/* ─── Reusable filter components ─────────────────────────────── */
function FilterGroup({ title, hint, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-dark-800 pb-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between mb-3 text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-dark-100">{title}</span>
          {hint && <HelpCircle className="w-3 h-3 text-dark-500" />}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-dark-500 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && children}
    </div>
  );
}

function Select({ placeholder }) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-dark-700 bg-dark-900 text-xs text-dark-300 hover:border-dark-600 transition-colors">
      <span>{placeholder}</span>
      <ChevronDown className="w-3.5 h-3.5 text-dark-500" />
    </button>
  );
}

function Checkbox({ checked, onChange, children, sub }) {
  const [internal, setInternal] = useState(false);
  const isChecked = checked !== undefined ? checked : internal;
  const toggle = () => { onChange ? onChange() : setInternal(!internal); };
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer group ${sub ? 'text-2xs' : 'text-xs'}`}>
      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
        isChecked ? 'bg-primary-500 border-primary-500' : 'border-dark-600 group-hover:border-dark-500'
      }`}>
        {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </span>
      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
      <span className="text-dark-200 group-hover:text-dark-100 flex-1">{children}</span>
    </label>
  );
}

function Radio({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group text-xs">
      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
        checked ? 'border-primary-500' : 'border-dark-600 group-hover:border-dark-500'
      }`}>
        {checked && <span className="w-2 h-2 rounded-full bg-primary-500" />}
      </span>
      <input type="radio" checked={checked} onChange={onChange} className="hidden" />
      <span className="text-dark-200 group-hover:text-dark-100">{children}</span>
    </label>
  );
}

/* ─── Talent result card ─────────────────────────────────────── */
function TalentCard({ t, delay, active, onView }) {
  return (
    <motion.article
      {...fadeUp(delay)}
      onClick={onView}
      className={`border-b border-dark-800 py-6 px-4 -mx-4 rounded-2xl transition-colors group cursor-pointer ${
        active ? 'bg-dark-900' : 'hover:bg-dark-900/40'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-sm font-bold text-dark-100 group-hover:text-primary-300 transition-colors">{t.name}</h3>
              <BadgeCheck className="w-3.5 h-3.5 text-primary-400" />
            </div>
            <p className="text-sm font-semibold text-dark-200 leading-snug mb-1">{t.title}</p>
            <div className="flex items-center gap-1 text-2xs text-dark-500">
              <MapPin className="w-3 h-3" />
              {t.country}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onView && onView(); }}
          className="px-4 py-1.5 rounded-full border border-primary-500/40 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 hover:border-primary-500 transition-all shrink-0"
        >
          View profile
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 ml-16 mb-3 text-2xs">
        <span className="inline-flex items-center gap-1.5 text-primary-400 font-semibold">
          <ThumbsUp className="w-3 h-3" /> {t.jobSuccess}% Job Success
        </span>
        <span className="text-dark-300 font-semibold">{t.earned} earned</span>
        {t.available && (
          <span className="inline-flex items-center gap-1.5 text-primary-300">
            <Sparkles className="w-3 h-3" /> Available now
          </span>
        )}
        {t.consultations && (
          <span className="inline-flex items-center gap-1.5 text-dark-400">
            <Calendar className="w-3 h-3" /> Offers consultations
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 ml-16 mb-3">
        {t.skills.map((s, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-full text-2xs font-medium ${
            s.startsWith('+') ? 'bg-dark-800 text-dark-400' : 'bg-dark-800 text-dark-200 hover:bg-dark-700 cursor-pointer transition-colors'
          }`}>
            {s}
          </span>
        ))}
      </div>

      <p className="text-xs text-dark-400 leading-relaxed ml-16 mb-3 line-clamp-2">{t.bio}</p>

      {t.associated && (
        <div className="ml-16 flex items-center gap-3 p-3 rounded-xl bg-dark-900 border border-dark-800 max-w-md">
          <div className="w-8 h-8 rounded-md bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-primary-300" />
          </div>
          <div className="flex-1">
            <div className="text-2xs text-dark-500">Associated with</div>
            <div className="text-xs font-semibold text-dark-100">{t.associated.name}</div>
          </div>
          <div className="text-xs font-bold text-primary-300">{t.associated.earned}<br /><span className="text-2xs font-normal text-dark-500">earned</span></div>
        </div>
      )}
    </motion.article>
  );
}

/* ─── Profile panel (slides in from the right) ──────────────── */
const PANEL_TABS = ['About', 'Client feedback', 'Work history', 'Portfolio', 'Skills'];

const FAKE_FEEDBACK = [
  { date: 'March 12, 2026',    title: 'Marketing Analytics & Reporting Setup (GA...', rating: 5.0, body: '"10/10! Great to work with! Great quality work and will be working with him with all of my clients."', client: 'Amanda G.' },
  { date: 'November 14, 2025', title: 'BigCommerce, GTM Expert Needed to Imp...',     rating: 5.0, body: '"The task was completed professionally, testing and fixing all the details that arose. Thank you for your work."', client: 'Lukas K.' },
  { date: 'October 2, 2025',   title: 'GA4 audit + Looker Studio dashboards',           rating: 5.0, body: '"Smart, fast, communicative. Highly recommend for any GA4 work."', client: 'Priya N.' },
  { date: 'July 8, 2025',      title: 'Server-side tracking setup for Shopify Plus',    rating: 4.8, body: '"Helped us migrate without losing a single conversion event. Will rehire."', client: 'Sam O.' },
];

const FAKE_JOBS = [
  { title: 'Marketing Analytics & Reporting Setup (GA4 + GoHighLevel) + Training', rating: 5.0, dates: 'Feb 5, 2026 - Mar 12, 2026' },
  { title: 'Server-side GTM implementation for D2C brand',                          rating: 5.0, dates: 'Jan 14, 2026 - Feb 8, 2026' },
  { title: 'Conversion tracking audit + recommendations',                           rating: 4.9, dates: 'Dec 3, 2025 - Jan 5, 2026' },
];

const FAKE_PORTFOLIO = [
  { title: 'GA4 Migration Case Study', tag: 'Analytics' },
  { title: 'GTM Server-side Setup',    tag: 'Tracking' },
  { title: 'Looker Studio Dashboards', tag: 'Reporting' },
];

function ProfilePanel({ talent, onClose }) {
  const [tab, setTab] = useState('About');
  const [fbPage, setFbPage] = useState(1);

  /* lock body scroll when panel is open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const titleStats = { jobs: 70, hours: 395, rating: 4.9, reviews: 43, jobSuccess: talent.jobSuccess || 98 };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Panel */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[920px] bg-dark-950 border-l border-dark-800 z-50 overflow-y-auto"
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-dark-950/95 backdrop-blur border-b border-dark-800">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-dark-800 flex items-center justify-center text-dark-300 hover:text-dark-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <a href="#" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300">
            Open profile in a new window <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Body grid */}
        <div className="grid md:grid-cols-[280px_1fr] gap-6 p-6">

          {/* ─── LEFT column ─── */}
          <div className="md:sticky md:top-20 self-start space-y-5">
            <div className="text-center md:text-left">
              <div className="relative w-24 h-24 mx-auto md:mx-0 mb-4">
                <img src={talent.avatar} alt={talent.name} className="w-full h-full rounded-full object-cover" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-dark-700 border-2 border-dark-950" />
              </div>
              <div className="flex items-center gap-1.5 justify-center md:justify-start mb-1">
                <h2 className="text-lg font-bold font-display text-dark-100">{talent.name}</h2>
                <BadgeCheck className="w-4 h-4 text-primary-400" />
              </div>
              <p className="text-xs text-dark-400 leading-snug mb-3">{talent.title}</p>

              {/* Badges row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-2xs mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 font-semibold">
                  <ThumbsUp className="w-2.5 h-2.5" /> {titleStats.jobSuccess}%
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-semibold">
                  🏆 Top Rated
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-dark-200">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {titleStats.rating} <span className="text-dark-500 font-normal">({titleStats.reviews})</span>
                </span>
              </div>

              <div className="text-2xs text-dark-500 flex items-center justify-center md:justify-start gap-1.5 mb-5">
                <MapPin className="w-3 h-3" />
                {talent.country} <span className="text-dark-700">·</span> 7:37 am local time
              </div>

              {/* Stats blocks */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-xl border border-dark-800 bg-dark-900 p-3 text-center">
                  <div className="text-lg font-bold font-display text-dark-100">{titleStats.jobs}</div>
                  <div className="text-2xs text-dark-500 mt-0.5">Total jobs</div>
                </div>
                <div className="rounded-xl border border-dark-800 bg-dark-900 p-3 text-center">
                  <div className="text-lg font-bold font-display text-dark-100">{titleStats.hours}</div>
                  <div className="text-2xs text-dark-500 mt-0.5">Total hours</div>
                </div>
              </div>

              <button className="w-full py-2.5 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
                Message
              </button>
            </div>
          </div>

          {/* ─── RIGHT column ─── */}
          <div className="space-y-5 min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-dark-900 border border-dark-800 overflow-x-auto scrollbar-none w-fit">
              {PANEL_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative px-4 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                    tab === t ? 'text-white bg-dark-100/95' : 'text-dark-400 hover:text-dark-100'
                  }`}
                  style={tab === t ? { color: '#0a0a0c', background: 'rgb(var(--c-dark-100))' } : {}}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* About */}
            {tab === 'About' && (
              <div className="space-y-5">
                <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                  <h3 className="text-base font-bold font-display text-dark-100 mb-4">About {talent.name}</h3>
                  {/* Video poster */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/40 via-purple-600/30 to-green-700/40 mb-5 group cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-dark-950 ml-0.5" fill="currentColor" />
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 text-base font-bold text-white">I'm {talent.name.split(' ')[0]}</div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <img src={talent.avatar} className="w-9 h-9 rounded-full ring-2 ring-white/30" alt="" />
                    </div>
                  </div>

                  <p className="text-sm text-dark-300 leading-relaxed">
                    🚀 <span className="font-semibold text-dark-100">Top-rated and Certified Google Analytics 4 (GA4)</span> and <span className="font-semibold text-dark-100">Google Tag Manager (GTM)</span> expert with 5+ years of experience in delivering data-driven tracking solutions. I specialize in <span className="font-semibold text-dark-100">Server-Side Tracking, conversion tracking, pixel setups,</span> and advanced analytics integration that enhance data accuracy, optimize marketing efforts, and deliver actionable insights.
                  </p>
                  <button className="text-xs font-semibold text-primary-400 hover:text-primary-300 mt-3">Show more</button>
                </section>

                {/* Client feedback */}
                <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                  <h3 className="text-base font-bold font-display text-dark-100 mb-5">Client feedback ({FAKE_FEEDBACK.length * 7 + 1})</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {FAKE_FEEDBACK.slice((fbPage - 1) * 2, fbPage * 2).map((f, i) => (
                      <div key={i} className="rounded-xl border border-dark-800 bg-dark-950 p-4">
                        <div className="text-xs font-bold text-dark-100 line-clamp-1 mb-2">{f.title}</div>
                        <div className="flex items-center gap-2 text-2xs text-dark-500 mb-2">
                          <Calendar className="w-3 h-3" /> {f.date}
                          <span className="ml-auto inline-flex items-center gap-1 text-dark-300 font-bold">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, j) => <Star key={j} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />)}
                            </div>
                            {f.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-2xs text-dark-300 italic leading-relaxed mb-3">{f.body}</p>
                        <div className="flex items-center gap-1.5 pt-2 border-t border-dark-800 text-2xs text-dark-400">
                          <div className="w-4 h-4 rounded-full bg-dark-700" />
                          {f.client}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-center gap-1 mt-5">
                    <button
                      onClick={() => setFbPage((p) => Math.max(1, p - 1))}
                      disabled={fbPage === 1}
                      className="w-7 h-7 rounded-full hover:bg-dark-800 flex items-center justify-center text-dark-300 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFbPage(n)}
                        className={`w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                          fbPage === n ? 'border border-dark-100 text-dark-100' : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <span className="text-xs text-dark-500 px-1">...</span>
                    <button
                      onClick={() => setFbPage((p) => Math.min(4, p + 1))}
                      disabled={fbPage === 4}
                      className="w-7 h-7 rounded-full hover:bg-dark-800 flex items-center justify-center text-dark-300 disabled:opacity-30"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </section>

                {/* Work history teaser */}
                <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                  <h3 className="text-base font-bold font-display text-dark-100 mb-4">Work history on PANDA</h3>
                  <div className="rounded-xl border border-dark-800 bg-dark-950 p-4 mb-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-500/15 border border-primary-500/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-dark-100 mb-2">Skills that match your search</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(talent.skills || []).filter((s) => !s.startsWith('+')).slice(0, 4).map((s) => (
                          <span key={s} className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-2xs font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-dark-100 mb-3 pb-2 border-b border-dark-800">
                    Completed jobs <span className="text-dark-500 font-normal">{FAKE_JOBS.length * 17}</span>
                  </div>
                  <div className="space-y-3">
                    {FAKE_JOBS.map((j, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-semibold text-dark-100 flex-1">{j.title}</div>
                          <span className="inline-flex items-center gap-1 text-2xs text-dark-300 font-bold shrink-0">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {j.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-2xs text-dark-500 mt-1">Private earnings · <Calendar className="w-3 h-3 inline" /> {j.dates}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Client feedback tab */}
            {tab === 'Client feedback' && (
              <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                <h3 className="text-base font-bold font-display text-dark-100 mb-5">All client feedback</h3>
                <div className="space-y-4">
                  {FAKE_FEEDBACK.map((f, i) => (
                    <div key={i} className="pb-4 border-b border-dark-800 last:border-b-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="text-sm font-bold text-dark-100">{f.title}</div>
                        <span className="inline-flex items-center gap-1 text-xs text-dark-300 font-bold shrink-0">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {f.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-2xs text-dark-500 mb-2">{f.date} · {f.client}</div>
                      <p className="text-xs text-dark-300 italic leading-relaxed">{f.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Work history tab */}
            {tab === 'Work history' && (
              <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                <h3 className="text-base font-bold font-display text-dark-100 mb-5">Completed jobs</h3>
                <div className="space-y-4">
                  {FAKE_JOBS.map((j, i) => (
                    <div key={i} className="pb-4 border-b border-dark-800 last:border-b-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="text-sm font-semibold text-dark-100">{j.title}</div>
                        <span className="inline-flex items-center gap-1 text-xs text-dark-300 font-bold shrink-0">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {j.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-2xs text-dark-500">Private earnings · {j.dates}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Portfolio tab */}
            {tab === 'Portfolio' && (
              <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                <h3 className="text-base font-bold font-display text-dark-100 mb-5">Portfolio</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {FAKE_PORTFOLIO.map((p) => (
                    <div key={p.title} className="rounded-xl overflow-hidden border border-dark-800 bg-dark-950">
                      <div className="aspect-video bg-gradient-to-br from-primary-500/30 to-accent-500/30" />
                      <div className="p-3">
                        <div className="text-xs font-bold text-dark-100 mb-1">{p.title}</div>
                        <span className="text-2xs text-primary-400">{p.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills tab */}
            {tab === 'Skills' && (
              <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                <h3 className="text-base font-bold font-display text-dark-100 mb-5">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(talent.skills || []).filter((s) => !s.startsWith('+')).concat(['GA4', 'Looker Studio', 'BigQuery', 'Server-side GTM', 'Pixel Setup', 'Conversion API']).map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-full bg-dark-800 text-dark-200 text-xs font-medium hover:bg-dark-700 transition-colors">{s}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

/* ─── Job result card ────────────────────────────────────────── */
function JobCard({ j, delay }) {
  return (
    <motion.article {...fadeUp(delay)} className="border-b border-dark-800 py-6 group cursor-pointer">
      <div className="text-2xs text-dark-500 mb-2">Posted {j.posted}</div>
      <h3 className="text-base font-bold text-dark-100 leading-tight mb-2 group-hover:text-primary-300 transition-colors">
        {j.title}
      </h3>
      <p className="text-2xs text-dark-400 mb-3">{j.type}</p>
      <p className="text-xs text-dark-300 leading-relaxed mb-4 line-clamp-2">{j.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {j.skills.map((s, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-full text-2xs font-medium ${
            s.startsWith('+') ? 'bg-dark-800 text-dark-400' : 'bg-dark-800 text-dark-200 hover:bg-dark-700 cursor-pointer transition-colors'
          }`}>
            {s}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function Search() {
  const [params, setParams] = useSearchParams();
  const initialType = params.get('type') === 'jobs' ? 'jobs' : 'talent';
  const [tab, setTab] = useState(initialType);
  const [query, setQuery] = useState(params.get('q') || '');
  const [sortBy, setSortBy] = useState('Relevance');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);

  useEffect(() => {
    const t = params.get('type');
    if (t === 'jobs' || t === 'talent') setTab(t);
    const q = params.get('q');
    if (q !== null) setQuery(q);
  }, [params]);

  const switchTab = (next) => {
    setTab(next);
    const p = new URLSearchParams(params);
    p.set('type', next);
    setParams(p, { replace: true });
  };

  const onSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(params);
    if (query.trim()) p.set('q', query.trim()); else p.delete('q');
    p.set('type', tab);
    setParams(p, { replace: true });
  };

  const filteredTalent = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    if (!q) return TALENT;
    return TALENT.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.skills.join(' ').toLowerCase().includes(q) ||
      t.bio.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredJobs = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    if (!q) return JOBS;
    return JOBS.filter((j) =>
      j.title.toLowerCase().includes(q) ||
      j.desc.toLowerCase().includes(q) ||
      j.skills.join(' ').toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 60 }}>

      {/* Category sub-nav */}
      <div className="border-y border-dark-800 bg-dark-950 sticky top-[60px] z-30">
        <div className="container-custom py-3">
          <div className="flex items-center gap-1 flex-wrap text-xs">
            {SUB_NAV.map((s) => (
              <Link key={s} to={`/search?q=${encodeURIComponent(s)}&type=${tab}`}
                className="px-3 py-2 rounded-lg font-semibold text-dark-300 hover:text-dark-100 hover:bg-dark-800/60 transition-colors">
                {s}
              </Link>
            ))}
            <button className="ml-1 px-3 py-2 rounded-lg font-semibold text-dark-300 hover:text-dark-100 hover:bg-dark-800/60 transition-colors flex items-center gap-1">
              More <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar + tabs */}
      <section className="container-custom pt-8 pb-2">
        <div className="flex items-center gap-4">
          <form onSubmit={onSearch} className="flex-1 relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-10 py-3 rounded-full border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-colors"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); const p = new URLSearchParams(params); p.delete('q'); setParams(p, { replace: true }); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-dark-600 flex items-center justify-center text-dark-500 hover:text-dark-100 hover:border-dark-500 transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </form>
          <Link to="/jobs" className="text-xs font-semibold text-primary-400 hover:text-primary-300 underline underline-offset-4 shrink-0">
            Advanced search
          </Link>
        </div>

        <div className="flex items-center gap-6 mt-6 border-b border-dark-800">
          {['talent', 'jobs'].map((t) => (
            <button key={t} onClick={() => switchTab(t)}
              className={`relative pb-3 text-sm font-bold transition-colors capitalize ${
                tab === t ? 'text-dark-100' : 'text-dark-500 hover:text-dark-300'
              }`}>
              {t}
              {tab === t && <motion.span layoutId="search-tab" className="absolute -bottom-px inset-x-0 h-0.5 bg-dark-100" />}
            </button>
          ))}
        </div>
      </section>

      {/* Body grid */}
      <section className="container-custom py-8">
        <div className="grid lg:grid-cols-[250px_1fr] gap-10">

          {/* Sidebar */}
          <div className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto pr-2 scrollbar-none">
            {tab === 'talent' ? <TalentFilters /> : <JobFilters />}
          </div>

          {/* Results */}
          <div>
            {tab === 'jobs' && (
              <div className="flex justify-end mb-2 relative">
                <button onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dark-700 bg-dark-900 text-xs text-dark-200 hover:border-dark-600 transition-colors">
                  Sort by: <span className="font-semibold text-dark-100">{sortBy}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-dark-500 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 z-10 rounded-lg border border-dark-700 bg-dark-900 overflow-hidden shadow-xl min-w-[180px]">
                    {['Relevance', 'Newest', 'Client spend'].map((opt) => (
                      <button key={opt} onClick={() => { setSortBy(opt); setSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-dark-800 transition-colors ${sortBy === opt ? 'text-primary-300 font-semibold' : 'text-dark-300'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'talent' ? (
              filteredTalent.length === 0 ? (
                <EmptyState query={query} kind="talent" />
              ) : (
                filteredTalent.map((t, i) => (
                  <TalentCard
                    key={t.name}
                    t={t}
                    delay={i * 0.04}
                    active={selectedTalent?.name === t.name}
                    onView={() => setSelectedTalent(t)}
                  />
                ))
              )
            ) : (
              filteredJobs.length === 0 ? (
                <EmptyState query={query} kind="jobs" />
              ) : (
                filteredJobs.map((j, i) => <JobCard key={j.title} j={j} delay={i * 0.04} />)
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-dark-800 py-10">
        <div className="container-custom flex items-center gap-2.5">
          <div className="w-7 h-7 bg-dark-900 rounded-lg flex items-center justify-center ring-1 ring-white/10">
            <PandaLogo className="w-5 h-5" invert />
          </div>
          <span className="font-black font-display text-dark-100 text-base tracking-widest uppercase">PANDA</span>
          <span className="ml-auto text-2xs text-dark-600">© 2026 PANDA. All rights reserved.</span>
        </div>
      </footer>

      {/* Slide-in profile panel */}
      <AnimatePresence>
        {selectedTalent && (
          <ProfilePanel talent={selectedTalent} onClose={() => setSelectedTalent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ query, kind }) {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center mx-auto mb-4">
        <SearchIcon className="w-6 h-6 text-dark-500" />
      </div>
      <p className="text-sm font-semibold text-dark-200">
        No {kind} match {query ? `"${query}"` : 'your filters'} yet
      </p>
      <p className="text-xs text-dark-500 mt-1">Try a different keyword or remove some filters.</p>
    </div>
  );
}
