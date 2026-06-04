import { useState, useMemo } from 'react';
import { resolveFooter } from '../../utils/footerLinks';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, ChevronDown, ChevronLeft, ChevronRight, ArrowRight,
  PenSquare, UserCheck, MessageCircle, DollarSign, Check,
  Users as UsersIcon, Calendar, Briefcase,
} from 'lucide-react';

/* ─── Inline social SVG icons (avoids needing newer lucide-react) ── */
const SocialIcon = ({ d, label }) => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-label={label}>
    <path d={d} />
  </svg>
);
const SOCIAL = [
  { label: 'Facebook',  d: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.24 0-1.63.78-1.63 1.58v1.88h2.78l-.44 2.9h-2.34V22c4.78-.8 8.44-4.94 8.44-9.94Z' },
  { label: 'LinkedIn',  d: 'M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 18.34V10.6H5.67v7.74h2.67Zm-1.34-8.9a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1Zm11.34 8.9v-4.24c0-2.27-1.21-3.32-2.82-3.32-1.3 0-1.88.71-2.2 1.21V10.6h-2.66c.04.75 0 7.74 0 7.74h2.66v-4.32c0-.24.02-.48.09-.65.19-.48.62-.97 1.36-.97.95 0 1.34.73 1.34 1.8v4.14h2.23Z' },
  { label: 'X',         d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.69l-5.244-6.852L4.97 21.75H1.66l7.73-8.838L1.254 2.25h6.857l4.74 6.27 5.393-6.27Zm-1.16 17.55h1.833L7.084 4.126H5.117l11.967 15.674Z' },
  { label: 'YouTube',   d: 'M21.6 7.2a2.55 2.55 0 0 0-1.8-1.81C18.21 5 12 5 12 5s-6.21 0-7.8.39A2.55 2.55 0 0 0 2.4 7.2 26.6 26.6 0 0 0 2 12a26.6 26.6 0 0 0 .4 4.8 2.55 2.55 0 0 0 1.8 1.81C5.79 19 12 19 12 19s6.21 0 7.8-.39a2.55 2.55 0 0 0 1.8-1.81A26.6 26.6 0 0 0 22 12a26.6 26.6 0 0 0-.4-4.8ZM10 15V9l5.2 3-5.2 3Z' },
  { label: 'Instagram', d: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.95c-3.15 0-3.5.01-4.74.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.27.83-.39.39-.63.76-.83 1.27-.15.39-.33.97-.38 2.04-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.07.23 1.65.38 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.15.97.33 2.04.38 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.27-.83.39-.39.63-.76.83-1.27.15-.39.33-.97.38-2.04.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.07-.23-1.65-.38-2.04-.2-.51-.44-.88-.83-1.27-.39-.39-.76-.63-1.27-.83-.39-.15-.97-.33-2.04-.38-1.24-.06-1.59-.07-4.74-.07Zm0 3.32a4.57 4.57 0 1 1 0 9.14 4.57 4.57 0 0 1 0-9.14Zm0 7.54a2.97 2.97 0 1 0 0-5.94 2.97 2.97 0 0 0 0 5.94Zm5.81-7.74a1.07 1.07 0 1 1-2.14 0 1.07 1.07 0 0 1 2.14 0Z' },
];
import PandaLogo from '../../components/ui/PandaLogo';
import ResourceSubNav from '../../components/layout/ResourceSubNav';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Data ───────────────────────────────────────────────────── */
const TRUSTED_BRANDS = ['Microsoft', 'airbnb', 'AUTOMATTIC', 'BISSELL', 'Nasdaq'];

const SUCCESS_STORIES = [
  { brand: 'Microsoft',  color: 'from-blue-500/20 to-cyan-500/10',     accent: 'text-blue-300',   title: 'How Microsoft scaled video production while driving cost savings' },
  { brand: 'Airbnb',     color: 'from-pink-500/20 to-red-500/10',      accent: 'text-pink-300',   title: 'How Airbnb built a global localization pipeline' },
  { brand: 'Automattic', color: 'from-violet-500/20 to-purple-500/10', accent: 'text-violet-300', title: 'How Automattic augments its distributed team with PANDA' },
  { brand: 'Nasdaq',     color: 'from-emerald-500/20 to-teal-500/10',  accent: 'text-emerald-300',title: 'Nasdaq brought on data engineers to accelerate insights' },
];

const REVIEWS = [
  { title: 'Great platform for freelancers — My Year-Long Experience With PANDA', stars: 5, size: '1-50 employees',   date: 'Jan 21, 2025', category: 'Development & IT',   name: 'Shivani S.',
    body: 'I have been working with PANDA since last 1 year and it was a great experience has been mostly positive and I easily found clients that matches my skills. The communication with client is smooth and …' },
  { title: 'PANDA is great for freelancing', stars: 5, size: '1-50 employees',    date: 'Jan 8, 2025',  category: 'Writing & Translation', name: 'Amy E.',
    body: 'I love how easy the website and app are to use. It\'s very well organized and user friendly. When I have a project, I use it daily, especially for the time tracking and the messaging features. Download…' },
  { title: 'PANDA user since 2020',        stars: 5, size: '51-1000 employees', date: 'Dec 13, 2024', category: 'Sales & Marketing',    name: 'Bernadeth C.',
    body: 'I like how easy it is to find jobs on this platform and get interviewed in as early as a week of waiting.' },
  { title: 'PANDA review',                 stars: 3, size: '51-1000 employees', date: 'Dec 10, 2024', category: 'Sales & Marketing',    name: 'Carmela M.',
    body: 'You can find legit client and start earning at home' },
  { title: 'Finding Top Talent Quickly with PANDA Enterprise', stars: 4, size: '1-50 employees',  date: 'Nov 25, 2024', category: 'Sales & Marketing', name: 'Karrie C.',
    body: 'I can quickly find and hire highly skilled professionals for our projects.' },
  { title: 'Best freelancing website for experience manufacturing/industrial sector Engineers.', stars: 4, size: '1-50 employees',  date: 'Oct 25, 2024', category: 'Development & IT', name: 'SudhaRSHAN R.',
    body: 'The initial payment of the client are reasonable and the client is across from the world. So getting exposure to work is more, even earning more money per hour rate also good' },
  { title: 'Best freelancing tool',        stars: 5, size: '1-50 employees',   date: 'Sep 9, 2024',  category: 'Development & IT',     name: 'Dinesh P.',
    body: 'PANDA is most use friendly application you\'ll ever find as freelancing tool. Compare to other tools like fiber, truelancer etc. PANDA provide easy option for freelancers and hirers.' },
];

const SPECIALIZATIONS = [
  { name: 'All specializations',    count: null },
  { name: 'Development & IT',       count: 67 },
  { name: 'Design & Creative',      count: 7 },
  { name: 'Sales & Marketing',      count: 14 },
  { name: 'Writing & Translation',  count: 2 },
  { name: 'Adm & Customer Support', count: 4 },
];

const HOW_IT_WORKS = [
  { icon: PenSquare,  title: 'Post a job',         desc: 'Tell us what you need. Provide as many details as possible, but don\'t worry about getting it perfect.' },
  { icon: UserCheck,  title: 'Talent comes to you', desc: 'Get qualified proposals within 24 hours, and meet the candidates you\'re excited about. Hire as soon as you\'re ready.' },
  { icon: MessageCircle, title: 'Collaborate easily', desc: 'Use PANDA to chat or video call, share files, and track project progress right from the app.' },
  { icon: DollarSign, title: 'Payment simplified',  desc: 'Receive invoices and make payments through PANDA. Only pay for work you authorize.' },
];

const WHY_CHOOSE = [
  {
    title: 'How PTS blends human empathy with smart dealmaking',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop',
    stats: [{ k: '15%', v: 'increase in deal closure rates' }, { k: 'Faster', v: 'time to close' }],
  },
  {
    title: 'CoreStory taps PANDA to support fast-paced AI innovation',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop',
    stats: [{ k: '300', v: 'developers hired' }, { k: '80%', v: 'project time reduced' }],
  },
  {
    title: 'How Liquid Screen Design scaled with a reliable, global team of freelancers',
    img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop',
    stats: [{ k: '7', v: 'departments served by freelancers' }, { k: '20%', v: 'YoY productivity growth' }],
  },
];

const FAQ = [
  { q: 'Is PANDA a legitimate platform for hiring freelancers?',
    a: 'Yes, PANDA is a legitimate and trusted platform used by businesses of all sizes to find and hire skilled freelancers. PANDA uses secure systems, transparent profiles, and work tracking features to ensure quality and trust.' },
  { q: 'Can I trust freelancers on PANDA?',
    a: 'Yes, many clients successfully hire trusted freelancers on PANDA every day. PANDA uses profile verification, Job Success Scores (JSS), client feedback, and talent badges to help identify professionals with a proven track record.' },
  { q: 'How does PANDA compare to other freelance platforms?',
    a: 'PANDA stands out for its scale, built-in protections, and flexibility across project types. Unlike some platforms that specialize in one industry or focus only on short-term gigs, PANDA supports everything from quick tasks to long-term enterprise hires.' },
  { q: 'Are PANDA clients real and reliable?',
    a: 'Yes, the clients on PANDA are real businesses and individuals hiring for a wide range of projects. PANDA uses client verification, hiring and payment history, and feedback systems to provide freelancers with insight into who they\'re working with.' },
  { q: 'What kind of work can I get done on PANDA?',
    a: 'PANDA supports a wide range of work, from short-term tasks to complex, long-term projects. Clients use PANDA to hire for everything from graphic design and copywriting to software development, customer support, and AI work.' },
  { q: 'Do businesses have success hiring on PANDA?',
    a: 'Yes, many businesses find success hiring freelancers on PANDA. From startups to 30% of Fortune 500 companies, clients use the platform to access skilled talent quickly and cost-effectively.' },
  { q: 'Is it safe to make payments through PANDA?',
    a: 'Yes, payments on PANDA are secure and backed by features designed to protect both clients and freelancers. For fixed-price projects, PANDA holds project funds securely and only releases them when agreed-upon milestones are completed.' },
];

const TOP_SKILLS_TABS = ['Top skills', 'Trending skills', 'Top skills in US', 'Project Catalog'];
const TOP_SKILLS = {
  'Top skills': [
    'Generative AI Specialists', 'Data Entry Specialists', 'Video Editors', 'Data Analyst',
    'Shopify Developer', 'Ruby on Rails Developer', 'Android Developer', 'Bookkeeper',
    'Content Writer', 'Copywriter', 'Data Scientist', 'Front-End Developer',
    'Game Developer', 'Graphic Designer', 'iOS Developer', 'Java Developer',
    'JavaScript Developer', 'Logo Designer', 'Mobile App Developer', 'PHP Developer',
    'Python Developer', 'Resume Writer', 'SEO Expert', 'Social Media Manager',
    'Software Developer', 'Software Engineer', 'Technical Writer', 'UI Designer',
    'UX Designer', 'Virtual Assistant', 'Web Designer', 'WordPress Developer',
  ],
  'Trending skills': ['Prompt Engineer', 'AI Agent Developer', 'LLM Engineer', 'Rust Developer', 'Blockchain Developer', 'AR/VR Developer', 'Data Engineer', 'MLOps Engineer'],
  'Top skills in US': ['React Developer', 'Full-Stack Developer', 'Salesforce Developer', 'DevOps Engineer', 'iOS Developer', 'Product Designer', 'Tech Recruiter', 'Brand Strategist'],
  'Project Catalog': ['Logo Design', 'Resume Writing', 'Social Media Setup', 'WordPress Website', 'SEO Audit', 'Mobile App MVP', 'Pitch Deck', 'Voice Over'],
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

/* ─── Star rating ───────────────────────────────────────────── */
function StarRating({ stars }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-dark-700'}`}
        />
      ))}
      <span className="ml-2 text-2xs font-semibold text-dark-400">{stars}/5</span>
    </div>
  );
}

/* ─── Success Stories carousel ──────────────────────────────── */
function SuccessCarousel() {
  const [idx, setIdx] = useState(0);
  const total = SUCCESS_STORIES.length;
  const s = SUCCESS_STORIES[idx];

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 mb-6">Customer Success Stories</h2>
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden"
      >
        <div className="grid md:grid-cols-2">
          <div className={`relative bg-gradient-to-br ${s.color} aspect-[5/4] md:aspect-auto flex items-center justify-center p-12`}>
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className={`text-4xl md:text-5xl font-bold font-display ${s.accent}`}>{s.brand}</div>
          </div>
          <div className="p-8 md:p-10 flex items-center">
            <h3 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight">{s.title}</h3>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-dark-700 text-xs font-semibold text-dark-300 hover:border-primary-500/50 hover:text-primary-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span className="text-xs text-dark-400 font-mono"><span className="text-dark-100 font-semibold">{idx + 1}</span> / {total}</span>
        <button onClick={() => setIdx((i) => Math.min(total - 1, i + 1))} disabled={idx === total - 1}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Reviews list with filter sidebar ──────────────────────── */
function ReviewsList() {
  const [sort, setSort] = useState('Most recent');
  const [selected, setSelected] = useState(['All specializations']);
  const [showAll, setShowAll] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const toggleSpec = (name) => {
    if (name === 'All specializations') { setSelected(['All specializations']); return; }
    setSelected((s) => {
      const without = s.filter((x) => x !== 'All specializations' && x !== name);
      return s.includes(name) ? (without.length ? without : ['All specializations']) : [...without, name];
    });
  };

  const filtered = useMemo(() => {
    if (selected.includes('All specializations')) return REVIEWS;
    return REVIEWS.filter((r) => selected.includes(r.category));
  }, [selected]);

  const visible = showAll ? filtered : filtered.slice(0, 7);

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-8">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-20 h-fit">
        <div className="space-y-6">
          {/* Sort */}
          <div className="border-b border-dark-800 pb-5">
            <div className="text-xs font-bold text-dark-100 mb-3 flex items-center justify-between">
              Sort by <ChevronDown className="w-3 h-3 text-dark-500" />
            </div>
            <button
              onClick={() => setOpenSort(!openSort)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-dark-700 bg-dark-900 text-xs text-dark-200 hover:border-dark-600"
            >
              {sort}
              <ChevronDown className={`w-3.5 h-3.5 text-dark-500 transition-transform ${openSort ? 'rotate-180' : ''}`} />
            </button>
            {openSort && (
              <div className="mt-2 rounded-lg border border-dark-700 bg-dark-900 overflow-hidden">
                {['Most recent', 'Highest rated', 'Most helpful'].map((opt) => (
                  <button key={opt} onClick={() => { setSort(opt); setOpenSort(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-dark-800 transition-colors ${sort === opt ? 'text-primary-300 font-semibold' : 'text-dark-300'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specialization */}
          <div className="border-b border-dark-800 pb-5">
            <div className="text-xs font-bold text-dark-100 mb-3 flex items-center justify-between">
              Specialization <ChevronDown className="w-3 h-3 text-dark-500" />
            </div>
            <div className="space-y-2">
              {SPECIALIZATIONS.map((spec) => {
                const checked = selected.includes(spec.name);
                return (
                  <label key={spec.name} className="flex items-center gap-2.5 cursor-pointer group">
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                      checked ? 'bg-primary-500 border-primary-500' : 'border-dark-600 group-hover:border-dark-500'
                    }`}>
                      {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </span>
                    <input type="checkbox" checked={checked} onChange={() => toggleSpec(spec.name)} className="hidden" />
                    <span className="text-xs text-dark-200 group-hover:text-dark-100 flex-1">
                      {spec.name}
                      {spec.count !== null && <span className="text-dark-500 ml-1">({spec.count})</span>}
                    </span>
                  </label>
                );
              })}
              <button className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 pt-1">
                <ChevronDown className="w-3 h-3" /> See more
              </button>
            </div>
          </div>

          {/* Client company size */}
          <div>
            <div className="text-xs font-bold text-dark-100 flex items-center justify-between cursor-pointer">
              Client company size <ChevronDown className="w-3 h-3 text-dark-500" />
            </div>
          </div>
        </div>
      </aside>

      {/* Reviews */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 mb-6">
          What clients say about freelancers on PANDA
        </h2>
        <div className="space-y-4">
          {visible.map((r, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="rounded-2xl border border-dark-800 bg-dark-900/60 p-5 hover:border-primary-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-bold text-dark-100">"{r.title}"</h3>
                <StarRating stars={r.stars} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-dark-500 mb-2.5">
                <span className="flex items-center gap-1.5"><UsersIcon className="w-3 h-3" /> Company size: {r.size}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {r.date}</span>
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-dark-800 border border-dark-700 text-2xs font-medium text-dark-300 mb-3">
                {r.category}
              </span>
              <p className="text-xs text-dark-300 leading-relaxed mb-3">
                {r.body}{' '}
                {r.body.length > 100 && <button className="text-primary-400 font-semibold hover:text-primary-300 underline underline-offset-2">More</button>}
              </p>
              <div className="flex items-center gap-2.5 pt-3 border-t border-dark-800">
                <div className="w-7 h-7 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center">
                  <UsersIcon className="w-3.5 h-3.5 text-dark-500" />
                </div>
                <span className="text-xs font-semibold text-dark-200">{r.name}</span>
              </div>
            </motion.article>
          ))}
        </div>

        {!showAll && filtered.length > 7 && (
          <div className="flex justify-center mt-8">
            <button onClick={() => setShowAll(true)}
              className="px-7 py-2.5 rounded-full border border-primary-500/40 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 hover:border-primary-500/60 transition-all">
              Show more reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── FAQ accordion ─────────────────────────────────────────── */
function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <div className="rounded-3xl bg-dark-900 border border-dark-800 p-8 md:p-12">
      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight">
          Frequently asked<br />questions
        </h2>
        <div className="divide-y divide-dark-800">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="py-5">
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full text-left flex items-start justify-between gap-4 group">
                  <h3 className="text-sm md:text-base font-bold text-dark-100 group-hover:text-primary-300 transition-colors leading-snug">
                    {item.q}
                  </h3>
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
export default function Reviews() {
  const [skillTab, setSkillTab] = useState('Top skills');

  return (
    <div className="min-h-screen bg-dark-950" style={{ paddingTop: 60 }}>

      <ResourceSubNav />

      {/* ── Hero ── */}
      <section className="container-custom pt-12 pb-16">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold font-display text-dark-100 tracking-tight leading-[1.05] mb-6"
            >
              Reviews on PANDA:<br />
              From <span className="gradient-text">real clients</span>,<br />
              for real clients
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base text-dark-400 leading-relaxed max-w-xl mb-7"
            >
              From startups to large enterprises, discover how businesses have achieved their goals partnering with top freelancers on PANDA.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/register"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
                Join PANDA <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right stats card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-3xl bg-dark-900 border border-dark-800 p-8 space-y-8"
          >
            <div>
              <StarRating stars={5} />
              <div className="text-3xl md:text-4xl font-bold font-display text-dark-100 mt-3">2.9 million reviews on PANDA</div>
              <div className="text-xs text-dark-400 mt-2">of freelancers by clients</div>
            </div>
            <div className="border-t border-dark-800 pt-6">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-yellow-400/40 text-yellow-400/40'}`} />)}
                <span className="ml-2 text-2xs font-semibold text-dark-400">4.7/5</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold font-display text-dark-100 mt-3">Nearly 2,000 reviews on G2</div>
              <div className="text-xs text-dark-400 mt-2">of PANDA by G2 peer reviewers</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trusted by ── */}
      <section className="container-custom pb-16">
        <div className="rounded-2xl border border-dark-800 bg-dark-900/60 px-6 md:px-10 py-7">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-10">
            <span className="text-2xs text-dark-500 tracking-[0.3em] uppercase shrink-0">Trusted by</span>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 flex-1">
              {TRUSTED_BRANDS.map((b) => (
                <span key={b} className="text-lg font-display font-bold text-dark-300 hover:text-dark-100 transition-colors">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Success Stories carousel ── */}
      <section className="container-custom pb-20">
        <SuccessCarousel />
      </section>

      {/* ── Reviews list ── */}
      <section className="container-custom pb-20">
        <ReviewsList />
      </section>

      {/* ── How it works ── */}
      <section className="py-20 border-t border-dark-800 bg-dark-950">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">
            How it works
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.title} {...fadeUp(i * 0.07)}
                  className="rounded-2xl border border-dark-800 bg-dark-900/40 p-6 hover:border-primary-500/30 transition-all">
                  <Icon className="w-7 h-7 text-primary-400 mb-5" strokeWidth={1.5} />
                  <h3 className="text-base font-bold font-display text-dark-100 mb-3 leading-tight">{s.title}</h3>
                  <p className="text-xs text-dark-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="flex justify-center gap-3 mt-10">
            <Link to="/register" className="px-6 py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
              Join PANDA
            </Link>
            <Link to="/how-it-works" className="px-6 py-2.5 rounded-full border border-primary-500/40 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 transition-all">
              Learn how to hire
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why customers choose PANDA ── */}
      <section className="py-20 border-t border-dark-800 bg-dark-900">
        <div className="container-custom">
          <motion.h2 {...fadeUp(0)} className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-10">
            Why customers choose PANDA
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-4">
            {WHY_CHOOSE.map((c, i) => (
              <motion.div key={c.title} {...fadeUp(i * 0.07)}
                whileHover={{ y: -6 }}
                className="relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer group">
                <img src={c.img} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-lg font-bold font-display text-white leading-tight mb-4">{c.title}</h3>
                  <div className="space-y-2 mb-5">
                    {c.stats.map((s, si) => (
                      <div key={si} className="border-t border-white/20 pt-2">
                        <div className="text-base font-bold text-white">{s.k}</div>
                        <div className="text-2xs text-white/70">{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <button className="self-start px-5 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all">
                    Read more
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote + Stats panel ── */}
      <section className="py-20 bg-dark-950">
        <div className="container-custom grid md:grid-cols-2 gap-4">
          <motion.div {...fadeUp(0)} className="rounded-3xl bg-dark-900 border border-dark-800 p-8 md:p-10">
            <p className="text-base md:text-lg text-dark-100 leading-relaxed font-display">
              "Whether I'm looking for someone with a skill we're not familiar with, or we have someone in our network, I'll still post a job on PANDA first."
            </p>
            <div className="mt-6 pt-5 border-t border-dark-800">
              <div className="text-sm font-semibold text-dark-100">Kim Darling,</div>
              <div className="text-xs text-dark-500">CEO and co-founder</div>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="relative rounded-3xl bg-dark-900 border border-dark-800 p-8 md:p-10 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] gap-6">
              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-bold font-display text-dark-100">24 hours</div>
                  <div className="text-xs text-dark-500 mt-1">to find and hire a designer</div>
                </div>
                <div className="h-px bg-dark-800" />
                <div>
                  <div className="text-3xl font-bold font-display text-dark-100">3 weeks</div>
                  <div className="text-xs text-dark-500 mt-1">to get a design vs. months</div>
                </div>
              </div>
              {/* Emerald Tiger badge */}
              <div className="hidden md:flex items-center">
                <div className="relative w-32 h-32 rounded-full border-2 border-emerald-500/40 flex items-center justify-center bg-dark-900">
                  <div className="absolute inset-2 rounded-full border border-emerald-500/20" />
                  <div className="text-center">
                    <div className="text-[8px] font-bold text-emerald-300 tracking-[0.2em] uppercase">Emerald</div>
                    <div className="text-[8px] font-bold text-emerald-300 tracking-[0.2em] uppercase">Tiger</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA card ── */}
      <section className="py-10 bg-dark-950">
        <div className="container-custom">
          <motion.div {...fadeUp(0)} className="grid md:grid-cols-[1.2fr_1fr] gap-0 rounded-3xl overflow-hidden border border-dark-800 bg-dark-900">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold font-display text-dark-100 leading-tight mb-6">
                Connect with talent that gets you, and hire them to take your business to the <span className="gradient-text">next level.</span>
              </h2>
              <div className="flex gap-3">
                <Link to="/register" className="px-6 py-2.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all">
                  Sign up for free
                </Link>
                <Link to="/how-it-works" className="px-6 py-2.5 rounded-full border border-primary-500/40 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 transition-all">
                  Learn how to hire
                </Link>
              </div>
            </div>
            <div className="relative aspect-[5/4] md:aspect-auto bg-gradient-to-br from-amber-700/20 to-dark-900 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-dark-950">
        <div className="container-custom">
          <FAQSection />
        </div>
      </section>

      {/* ── Top skills section ── */}
      <section className="py-20 border-t border-dark-800 bg-dark-950">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[260px_1fr] gap-12">
            <div className="space-y-4">
              {TOP_SKILLS_TABS.map((t) => (
                <button key={t} onClick={() => setSkillTab(t)}
                  className={`block text-left w-full text-2xl md:text-3xl font-bold font-display transition-colors ${
                    skillTab === t ? 'text-primary-400' : 'text-dark-500 hover:text-dark-200'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 bg-dark-900/40 border border-dark-800 rounded-2xl p-8">
              {TOP_SKILLS[skillTab].map((s) => (
                <button key={s} className="text-left text-sm text-dark-300 hover:text-primary-300 transition-colors">
                  {s}
                </button>
              ))}
            </div>
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
                    <li key={l}>
                      <Link to={resolveFooter(l)} className="text-xs text-dark-400 hover:text-dark-100 transition-colors" >{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-dark-800">
            <div className="flex items-center gap-4">
              <span className="text-xs text-dark-500">Follow us</span>
              {SOCIAL.map((s) => (
                <a key={s.label} onClick={(e) => e.preventDefault()} href="#" aria-label={s.label}
                   className="w-7 h-7 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 hover:border-dark-500 transition-colors">
                  <SocialIcon d={s.d} label={s.label} />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-dark-500">Mobile app</span>
              <a onClick={(e) => e.preventDefault()} href="#" aria-label="iOS app" className="w-7 h-7 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 hover:border-dark-500 transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 1.2a4.6 4.6 0 0 1-1.1 3.2c-.8 1-2 1.7-3.2 1.6a4.4 4.4 0 0 1 1.1-3.2c.8-1 2.1-1.6 3.2-1.6Zm4 17.4c-.6 1.4-1.4 2.7-2.6 3.4a4 4 0 0 1-2.2.6c-.9 0-1.5-.3-2.4-.3-.9 0-1.6.3-2.4.3a3.8 3.8 0 0 1-2.2-.6c-1.2-.7-2.1-2-2.7-3.4-1.3-2.9-1.3-6.2 0-8.9 1-2.1 2.7-3.3 4.6-3.4.9 0 1.7.3 2.4.3.7 0 1.5-.3 2.4-.3 1.7 0 3.3.9 4.3 2.5-3.8 2.1-3.2 7.6.8 9.8Z"/></svg>
              </a>
              <a onClick={(e) => e.preventDefault()} href="#" aria-label="Android app" className="w-7 h-7 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 hover:border-dark-500 transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 9.5 19 6.8c.1-.2 0-.5-.2-.6-.2-.1-.5 0-.6.2L16.6 9c-1.4-.6-3-1-4.6-1s-3.2.4-4.6 1L5.8 6.4c-.1-.2-.4-.3-.6-.2-.2.1-.3.4-.2.6L6.5 9.5C4.5 10.8 3 13 3 15.5h18c0-2.5-1.5-4.7-3.5-6Zm-9 3.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm7 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"/></svg>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5 mt-10">
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
