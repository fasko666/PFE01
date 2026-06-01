import { useState, useMemo, useEffect, useRef } from 'react';
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
    name: 'Fahad W.', title: 'Medical Billing Specialist and Coding Project Management, AR Follow-up', country: 'Pakistan',
    jobSuccess: 100, earned: '$40K+', available: true,
    skills: ['Data Entry', 'Computer Skills', 'Medical Records Software', 'Microsoft Word', 'ICD Coding', '+10'],
    bio: 'Thank you for visiting my profile. I have over 12 years of experience working as a Medical Billing Specialist, Virtual Assistant, Data entry/processing, Project Management, Technical Support, and Call Center. I have excellent…',
    avatar: 'https://ui-avatars.com/api/?name=Fahad+W&background=4361ff&color=fff&size=120&bold=true',
    profile: {
      city: 'Rawalpindi, Pakistan',
      localTime: '10:34 am local time',
      since: 'Since 2013, I have worked with several US clients in the medical billing and revenue cycle management industry, helping practices recover revenue and reduce denials.',
      stats: { jobs: 5, hours: '4.8K', rating: 5.0, reviews: 5, jobSuccess: 100 },
      feedback: [
        { date: 'April 10, 2026',    title: 'Medical Billing & RCM Expert to cover Back Log', rating: 5.0, body: '"He knows how to fix and respond on time. Fahad is highly experienced and recommended for Medical Billing Services. His skills really help us to minimize and understand how to keep..."', client: 'Muhammad Arif K.' },
        { date: 'October 20, 2025',  title: 'Accounts Receivable Specialist',                rating: 5.0, body: '"Performed exceptionally well managing the AR for a small PT clinic."', client: 'Lisa N.' },
        { date: 'February 16, 2025', title: 'Medical Biller Required for Collaborate MD',     rating: 5.0, body: '"Fahad provided outstanding medical billing training for our staff. His deep expertise, engaging teaching style, and ability to tailor the sessions to our needs were exceptional. We…"', client: 'Kavin M.' },
        { date: 'June 24, 2022',     title: 'Require Medical billing Specialist for Collaborate MD', rating: 5.0, body: '"Fahad is hard working and dedicated, I will work with Fahad on future projects 100%. Excellent job."', client: 'Fahad H.' },
      ],
      completedJobs: [
        { title: 'Medical Billing & RCM Expert to cover Back Log',                  rating: 5.0, dates: 'Apr 7, 2026 - Apr 10, 2026',  tags: ['Data Entry', 'Microsoft Excel', 'Web Development', 'Graphic Design', 'Logo Design'], desc: 'We are seeking a skilled professional to manage our medical billing and RCM processes. Responsibilities…' },
        { title: 'Accounts Receivable Specialist',                                  rating: 5.0, dates: 'Dec 26, 2023 - Oct 20, 2025', tags: ['Data Entry', 'Microsoft Excel', 'Accounts Receivable', 'Accounts Receivable Management'], desc: 'We are seeking a highly skilled individual to assist with the wind-down process of accounts receivable…' },
        { title: 'Medical Biller Required for Collaborate MD and Rain Tree Software',rating: 5.0, dates: 'Feb 14, 2025 - Feb 16, 2025', tags: ['Data Entry', 'Microsoft Excel', 'Medical Billing & Coding', 'Customer Service'],         desc: 'We are seeking a skilled Medical Biller who is proficient in both Collaborate MD and Rain Tree software…' },
        { title: 'Medical Billing and denial - with ECW experience - *Full time only*',rating: 5.0, dates: 'May 22, 2023 - Dec 7, 2023', tags: ['EMR Data Entry', 'Medical Billing & Coding', 'Phone Communication', 'Administrative S'],     desc: 'Looking for someone to help out with reviewing and Submitting claims, Post EOBs, correct/appeal denials…' },
        { title: 'Require Medical billing Specialist for Collaborate MD',             rating: 5.0, dates: 'Jun 23, 2022 - Jun 24, 2022', tags: ['Microsoft Excel', 'Data Entry', 'Medical Billing & Coding', 'Customer Service'],                 desc: 'Looking for Medical billing Specialist, for the short term project. I have few claims need to be fixed…' },
      ],
      portfolio: [
        { title: 'Practice Suits Complete RCM', tag: 'Data Entry', tags: '+7', gradient: 'from-blue-500/30 via-red-500/20 to-emerald-500/30' },
        { title: 'Collaborate MD',              tag: 'Data Entry', tags: '+2', gradient: 'from-emerald-500/30 to-green-700/30' },
      ],
      skills: ['Data Entry', 'Computer Skills', 'Medical Records Software', 'Microsoft Word', 'ICD Coding', 'Accounts Receivable Management', 'Insurance Claim Submission', 'Administrative Support', 'H-Connect Compusoft EHR', 'Medical Billing & Coding', 'Technical Support', 'Insurance Verification', 'Accounts Receivable', 'Electronic Medical Record', 'Medical Billing'],
        browseSimilar: ['Data Entry Specialists', 'Excel Experts', 'Administrative Assistants', 'Google Docs Experts', 'Verification Specialists'],
    },
  },
  {
    name: 'Ghandour H.', title: 'Automation Engineer | Python, AI, n8n & RPA Systems', country: 'Egypt',
    jobSuccess: 100, earned: '$25K+', available: true, consultations: true,
    skills: ['Web Scraping', 'Automation', 'Python', 'Data Extraction', 'Django', 'Back-End Development', '+14'],
    bio: 'I build automation systems that replace hours of repetitive manual work and keep running reliably for months without anyone touching them. 🚀 Recent builds: A multi-device automation platform handling large-scale…',
    avatar: 'https://ui-avatars.com/api/?name=Ghandour+H&background=8b5cf6&color=fff&size=120&bold=true',
  },
  {
    name: 'Md Jamrul M.', title: 'Senior AI-Enabled E-commerce Specialist | CMS, SEO & Automation', country: 'Bangladesh',
    jobSuccess: 95, earned: '$60K+', available: true, consultations: true,
    skills: ['Microsoft Word', 'Copy & Paste', 'Microsoft Excel', 'Data Entry', 'WordPress', 'PDF Conversion', '+9'],
    bio: 'I help e-commerce brands, agencies, and growing businesses keep their stores, content, and back-office workflows organised, accurate, and scalable. I have been working with international clients since 2015 and on…',
    avatar: 'https://ui-avatars.com/api/?name=Md+Jamrul+M&background=ec4899&color=fff&size=120&bold=true',
  },
  {
    name: 'Raton M.', title: 'B2B Lead Generation | Email-List Building | Any Target Lead | Scraping', country: 'Bangladesh',
    jobSuccess: 100, earned: '$20K+', available: true,
    skills: ['Lead Generation', 'Data Entry', 'Company Research', 'Contact List', 'Data Scraping', '+10'],
    bio: '🎯 "I always deliver more than value" 🎯 ✨ Experience Matters: I am a full-time professional VA with…',
    avatar: 'https://ui-avatars.com/api/?name=Raton+M&background=10b981&color=fff&size=120&bold=true',
  },
  {
    name: 'Aqssa Z.', title: 'PhD Researcher/Content Writer/SPSS Expert', country: 'Pakistan',
    jobSuccess: 97, earned: '$9K+',
    skills: ['SEO Writing', 'Research & Strategy', 'Academic Research', 'Essay Writing', 'Research Proposals', '+8'],
    bio: '👋 Welcome to my profile. ⭐ TOP RATED ⭐ With over 7 years of experience in research and content writing, I am dedicated to delivering high-quality, insightful, and meticulously researched content tailored to your specific…',
    avatar: 'https://ui-avatars.com/api/?name=Aqssa+Z&background=f43f5e&color=fff&size=120&bold=true',
  },
  {
    name: 'MD. Mehedi H.', title: 'Certified GA4 & GTM Expert | Conversion Tracking, Server-Side Specialist', country: 'Bangladesh',
    jobSuccess: 98, earned: '$20K+', available: true,
    skills: ['Google Tag Manager', 'Marketing Analytics', 'Data Visualization', 'Shopify', '+11'],
    bio: '🚀 Top-rated and Certified Google Analytics 4 (GA4) and Google Tag Manager (GTM) expert with 5+ years of experience in delivering data-driven tracking solutions. I specialize in Server-Side Tracking, conversion…',
    avatar: 'https://ui-avatars.com/api/?name=MD+Mehedi+H&background=3b82f6&color=fff&size=120&bold=true',
  },
  {
    name: 'Stefan L.', title: 'WordPress Web Developer | Website security expert | 24h available', country: 'Serbia',
    jobSuccess: 100, earned: '$100K+', available: true,
    skills: ['PHP', 'Search Engine Optimization', 'Web Design', 'WordPress', 'Website', 'Yoast SEO', '+10'],
    bio: 'Experienced WordPress web developer, available 24h, on your service for urgent tasks and long term projects, same as complete server maintenance on daily/weekly level for all time zones! - WordPress website complete…',
    avatar: 'https://ui-avatars.com/api/?name=Stefan+L&background=a855f7&color=fff&size=120&bold=true',
  },
  {
    name: 'Md Makshudul H.', title: 'Google Ads | Google Ads Manager | Search Engine Marketing', country: 'Bangladesh',
    jobSuccess: 100, earned: '$600+', available: true, consultations: true,
    skills: ['Digital Marketing', 'Digital Marketing Materials', 'Digital Marketing Strategy', 'Google Ad Manager', '+11'],
    bio: "Hello, I'm Makshud 👋 Give me something to build, and I'll create a system that works for you 24/7 - consistently delivering results. That's my commitment. If you shoot me a invitation or message, I'll send you a personalised…",
    avatar: 'https://ui-avatars.com/api/?name=Md+Makshudul+H&background=06b6d4&color=fff&size=120&bold=true',
  },
  {
    name: 'Vinod H.', title: 'SEO Expert, Guest Blogger, Blogger Outreach, Guest Posting Service', country: 'India',
    jobSuccess: 100, earned: '$1M+', available: true,
    skills: ['Content SEO', 'SEO Backlinking', 'Search Engine Optimization', 'WordPress', '+10'],
    bio: "I began my career as a software engineer in Mumbai in 2007, moved to Singapore, and eventually founded Walnut Solutions. With over 13 years of experience, I've worked with clients across three regions, specializing in…",
    avatar: 'https://ui-avatars.com/api/?name=Vinod+H&background=eab308&color=fff&size=120&bold=true',
  },
  {
    name: 'Aman H.', title: 'SEO Content Writer | 9+ Years Experience', country: 'India',
    jobSuccess: 100, earned: '$40K+', consultations: true,
    skills: ['SEO Content', 'SEO Writing', 'SEO Keyword Research', 'SEO Competitor Analysis', 'Yoast SEO', '+9'],
    bio: "*Last updated: May, 2026* Hey there! I'm Aman, an on-page SEO expert with 9+ years of expertise working for brands of all sizes. You'd need me for any of these reasons: - Your website isn't getting enough traffic. - You hav…",
    avatar: 'https://ui-avatars.com/api/?name=Aman+H&background=0ea5e9&color=fff&size=120&bold=true',
  },
  {
    name: 'Harjeet K.', title: 'Wordpress/Joomla Expert | Elementor Pro Specialist | LMS | Long-Term Support', country: 'United States',
    jobSuccess: 100, earned: '$90K+',
    skills: ['LearnDash', 'Elementor', 'PHP', 'Web Design', 'BuddyPress', 'WordPress', 'WooCommerce', '+8'],
    bio: 'INDIVIDUAL FREELANCER! TOP RATED PLUS FREELANCER! Available for full time. I bring 9+ years of professional experience in web development and design, including 7 years in IT companies as a web developer…',
    avatar: 'https://ui-avatars.com/api/?name=Harjeet+K&background=84cc16&color=fff&size=120&bold=true',
  },
  {
    name: 'MD Habibul Islam H.', title: 'Converting WordPress Website Expert | Elementor | Divi | Oxygen', country: 'Bangladesh',
    jobSuccess: 100, earned: '$4K+',
    skills: ['WooCommerce', 'Elementor', 'Divi', 'Web Design', 'Web Development', 'Website Redesign', '+9'],
    bio: 'Hello, Looking for a guy who specializes in better converting rate for your WordPress Website? Who also can create stress-free WordPress solutions with Elementor Pro, Divi or Oxygen? With a track record of raising profit…',
    avatar: 'https://ui-avatars.com/api/?name=MD+Habibul+Islam+H&background=22c55e&color=fff&size=120&bold=true',
  },
  {
    name: 'Suman H.', title: 'eCommerce VA, TPT Store, Etsy, Shopify, Canva, PowerPoint, Design', country: 'Bangladesh',
    jobSuccess: 100, earned: '$4K+', available: true,
    skills: ['Data Entry', 'Lead Generation', 'Online Research', 'Store Management', '+11'],
    bio: 'I am a professional freelancer specializing in the Teachers Pay Teachers (TPT) platform, with expertise in instructional design and educational product development. I focus on understanding client requirements and…',
    avatar: 'https://ui-avatars.com/api/?name=Suman+H&background=ef4444&color=fff&size=120&bold=true',
  },
  {
    name: 'Seema R.', title: 'WordPress Data Entry | Admin Services', country: 'India',
    jobSuccess: 100, earned: '$50K+',
    skills: ['Shopify', 'Adobe Photoshop', 'WordPress', 'Magento', 'Administrative Support', '+7'],
    bio: 'My self Seema Rana - having more than 6 years experience in WordPress content management, E-Commerce products uploading, social media management & web research. A very highly self-motivated professional with…',
    avatar: 'https://ui-avatars.com/api/?name=Seema+R&background=f97316&color=fff&size=120&bold=true',
  },
  {
    name: 'Iqbal H.', title: 'Virtual Assistant, Data Entry Specialist, Research, Product Listing', country: 'Bangladesh',
    jobSuccess: 100, earned: '$40K+',
    skills: ['Google Workspace', 'Data Entry', 'Product Listings', 'Microsoft Word', 'Adobe Photoshop', '+8'],
    bio: 'TOP-RATED Virtual Assistant!! 12+ Years Experience. 9000+ Working Hours. Data Entry, Research, Product Listing, Lead generation, ChatGPT, AI Enthusiast. Hey! Are you looking for a fast, detail-oriented, quick-…',
    avatar: 'https://ui-avatars.com/api/?name=Iqbal+H&background=14b8a6&color=fff&size=120&bold=true',
  },
  {
    name: 'Pandurang K.', title: 'PDF Expert | PDF Accessibility, WCAG, Section 505 | MS Word Expert', country: 'India',
    jobSuccess: 97, earned: '$15K+', available: true,
    skills: ['Microsoft Excel', 'Microsoft Word', 'Data Entry', 'Adobe Photoshop', 'Online Research', '+8'],
    bio: 'FYI: $15/hr for the work PDF Accessibility/Remediation, WCAG, Section 505. Hello, I have 15+year experience in multiple Industries E-Publication, E-learning, Financial Documents, Data Management, Data Conversion, and…',
    avatar: 'https://ui-avatars.com/api/?name=Pandurang+K&background=8b5cf6&color=fff&size=120&bold=true',
  },
  {
    name: 'Md. Altab H.', title: 'WordPress, WooCommerce & Elementor Expert', country: 'Bangladesh',
    jobSuccess: 100, earned: '$50K+', consultations: true,
    skills: ['WooCommerce', 'WordPress', 'CMS Product Upload', 'Data Entry', 'Accuracy Verification', '+7'],
    bio: 'Hello! I am a WordPress, WooCommerce & Elementor Expert with experience in building professional, responsive, and SEO-friendly websites. I help businesses, bloggers, and online stores create modern, fast, and…',
    avatar: 'https://ui-avatars.com/api/?name=Md+Altab+H&background=4ade80&color=fff&size=120&bold=true',
  },
  {
    name: 'Md. Mijanur H.', title: 'Virtual Assistant Data Entry Ecommerce Product Listing Image Editing', country: 'Bangladesh',
    jobSuccess: 100, earned: '$15K+', consultations: true,
    skills: ['Data Entry', 'Amazon Seller Central', 'Amazon', 'Product Listings', 'Amazon FBA', '+15'],
    bio: "Hi, I'm Mijan, a full-time eCommerce assistant. I've worked with Amazon, eBay, Walmart, and Shopify, helping brands grow their online presence. I specialize in Storefront Design, A+ Content, Listing Images, and Brand Stor…",
    associated: { name: 'Mijanur Hossain', earned: '' },
    avatar: 'https://ui-avatars.com/api/?name=Md+Mijanur+H&background=f59e0b&color=fff&size=120&bold=true',
  },
  {
    name: 'Okta H.', title: 'Data Entry Specialist, Admin Support, Virtual Assistance', country: 'Indonesia',
    jobSuccess: 100, earned: '$70K+',
    skills: ['Microsoft Word', 'Google Docs', 'Data Entry', 'Microsoft Excel', 'Photo Editing', '+10'],
    bio: "Hi! I'm a dedicated freelancer from Indonesia, and I've been working on PANDA since 2016. Over the years, I've helped clients with a variety of tasks — from data entry, virtual assistance, and internet research to transcription…",
    avatar: 'https://ui-avatars.com/api/?name=Okta+H&background=ec4899&color=fff&size=120&bold=true',
  },
  {
    name: 'Zahid H.', title: 'Graphic & Web Designer | Branding Expert', country: 'Pakistan',
    jobSuccess: 100, earned: '$30K+', consultations: true,
    skills: ['Graphic Design', 'Adobe Illustrator', 'Thumbnail', 'Landing Page', 'Banner Ad Design', '+10'],
    bio: "Hi! I'm a professional Graphic Designer and Web Designer with over 15 years of experience creating high-quality, creative, and results-driven designs for clients worldwide. I specialize in logo design, branding, website design,…",
    avatar: 'https://ui-avatars.com/api/?name=Zahid+H&background=0891b2&color=fff&size=120&bold=true',
  },
];

const PEOPLE_ALSO_SEARCHED = ['k', 'a', 'hacker', 'ha'];

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

/* ─── Filter constants ───────────────────────────────────────── */
const BADGE_OPTIONS = [
  { name: 'Top Rated Plus', color: 'bg-pink-500'  },
  { name: 'Top Rated',      color: 'bg-blue-500'  },
  { name: 'Rising Talent',  color: 'bg-green-500' },
];
const SKILLS_BASE = ['Data Entry', 'Java', 'React', 'WordPress', 'Android App Development', 'Adobe Photoshop', 'Python'];
const SKILLS_MORE = ['Node.js', 'TypeScript', 'Figma', 'SEO', 'Copywriting', 'Shopify'];

const JOB_SUCCESS_OPTS = ['Any job success', '80% & up', '90% & up'];
const EARNED_OPTS      = ['Any amount earned', '$1+ earned', '$100+ earned', '$1K+ earned', '$10K+ earned', 'No earnings yet'];
const HOURS_OPTS       = ['Any hours', '1+ hours billed', '100+ hours billed', '1,000+ hours billed'];
const ENGLISH_OPTS     = ['Any level', 'Basic', 'Conversational', 'Fluent', 'Native or bilingual'];

const DEFAULT_FILTERS = {
  badges: [],
  skills: [],
  type: 'freelancers & agencies',
  contractToHire: false,
  consultations: false,
  jobSuccess: 'Any job success',
  earned: 'Any amount earned',
  hours: 'Any hours',
  english: 'Any level',
};

/* Parse "$40K+", "$1M+", "$600+" into a numeric dollar amount. */
function parseEarned(s) {
  if (!s) return 0;
  const m = s.match(/\$([\d.]+)([KM])?\+?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (m[2] === 'M') return n * 1_000_000;
  if (m[2] === 'K') return n * 1_000;
  return n;
}

/* Derive a talent badge from job success — used since the data doesn't carry an explicit badge. */
function getBadge(t) {
  if (t.jobSuccess >= 100) return 'Top Rated Plus';
  if (t.jobSuccess >= 90)  return 'Top Rated';
  return 'Rising Talent';
}

/* ─── Filter sidebar — Talent ────────────────────────────────── */
function TalentFilters({ filters, setFilters }) {
  const [showAllSkills, setShowAllSkills] = useState(false);

  const toggleBadge = (b) =>
    setFilters((f) => ({ ...f, badges: f.badges.includes(b) ? f.badges.filter((x) => x !== b) : [...f.badges, b] }));
  const toggleSkill = (s) =>
    setFilters((f) => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s] }));
  const setField = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <aside className="space-y-6">
      <FilterGroup title="Talent badge" hint>
        <div className="space-y-2.5">
          {BADGE_OPTIONS.map((b) => (
            <Checkbox key={b.name} checked={filters.badges.includes(b.name)} onChange={() => toggleBadge(b.name)}>
              <span className={`inline-block w-3 h-3 rounded ${b.color} mr-1.5 align-middle`} />
              {b.name}
            </Checkbox>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Skills">
        <div className="space-y-2.5">
          {SKILLS_BASE.map((s) => (
            <Checkbox key={s} checked={filters.skills.includes(s)} onChange={() => toggleSkill(s)}>{s}</Checkbox>
          ))}
          {showAllSkills && SKILLS_MORE.map((s) => (
            <Checkbox key={s} checked={filters.skills.includes(s)} onChange={() => toggleSkill(s)}>{s}</Checkbox>
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
            <Radio key={t} name="t-type" checked={filters.type === t.toLowerCase()} onChange={() => setField('type', t.toLowerCase())}>
              {t}
            </Radio>
          ))}
        </div>
        <div className="space-y-2.5 mt-3 pt-3 border-t border-dark-800">
          <Checkbox checked={filters.contractToHire} onChange={() => setField('contractToHire', !filters.contractToHire)}>
            Open to contract-to-hire
          </Checkbox>
          <Checkbox checked={filters.consultations} onChange={() => setField('consultations', !filters.consultations)}>
            Offers consultations
          </Checkbox>
        </div>
      </FilterGroup>

      <FilterGroup title="Job success">
        <div className="space-y-2.5">
          {JOB_SUCCESS_OPTS.map((j) => (
            <Radio key={j} name="job-success" checked={filters.jobSuccess === j} onChange={() => setField('jobSuccess', j)}>{j}</Radio>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Earned amount">
        <div className="space-y-2.5">
          {EARNED_OPTS.map((e) => (
            <Radio key={e} name="earned" checked={filters.earned === e} onChange={() => setField('earned', e)}>{e}</Radio>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Hours billed">
        <div className="space-y-2.5">
          {HOURS_OPTS.map((h) => (
            <Radio key={h} name="hours" checked={filters.hours === h} onChange={() => setField('hours', h)}>{h}</Radio>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="English level">
        <div className="space-y-2.5">
          {ENGLISH_OPTS.map((l) => (
            <Radio key={l} name="english" checked={filters.english === l} onChange={() => setField('english', l)}>{l}</Radio>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Other languages">
        <Select placeholder="Select other languages" />
      </FilterGroup>
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

function Radio({ checked, onChange, children, name }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group text-xs">
      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
        checked ? 'border-primary-500' : 'border-dark-600 group-hover:border-dark-500'
      }`}>
        {checked && <span className="w-2 h-2 rounded-full bg-primary-500" />}
      </span>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="hidden" />
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

/* ─── Talent/Jobs dropdown ─────────────────────────────────── */
function SearchTypeDropdown({ tab, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const label = tab === 'jobs' ? 'Jobs' : 'Talent';
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-3 rounded-full border border-dark-700 bg-dark-900 text-xs font-semibold text-dark-100 hover:border-dark-600 transition-colors"
      >
        {label}
        <ChevronDown className={`w-3 h-3 text-dark-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-32 rounded-xl border border-dark-700 bg-dark-900 overflow-hidden shadow-xl z-10">
          {['talent', 'jobs'].map((t) => (
            <button
              key={t}
              onClick={() => { onChange(t); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-xs capitalize transition-colors hover:bg-dark-800 ${
                tab === t ? 'text-dark-100 font-bold' : 'text-dark-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Reusable blocks shown across panel tabs ──────────────── */
function PortfolioBlock({ portfolio, count }) {
  return (
    <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
      <h3 className="text-base font-bold font-display text-dark-100 mb-5">Portfolio ({count})</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {portfolio.map((item) => (
          <div key={item.title} className="rounded-xl overflow-hidden border border-dark-800 bg-dark-950">
            <div className={`aspect-video bg-gradient-to-br ${item.gradient || 'from-primary-500/30 to-accent-500/30'}`} />
            <div className="p-3">
              <div className="text-xs font-bold text-dark-100 mb-1.5">{item.title}</div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-2xs font-semibold">{item.tag}</span>
                {item.tags && <span className="px-2 py-0.5 rounded-full bg-dark-800 text-dark-400 text-2xs font-semibold">{item.tags}</span>}
              </div>
            </div>
          </div>
        ))}
        <div className="rounded-xl border border-dark-800 bg-dark-950 flex flex-col items-center justify-center p-6 text-center min-h-[160px]">
          <div className="text-xs text-dark-300 mb-3">Want to see more?</div>
          <Link to="/register" className="px-4 py-1.5 rounded-full border border-primary-500/40 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 transition-all">
            Sign up
          </Link>
        </div>
      </div>
    </section>
  );
}

function SkillsBlock({ skills, talent }) {
  const list = skills || (talent?.skills || []).filter((s) => !s.startsWith('+'));
  if (list.length === 0) return null;
  return (
    <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
      <h3 className="text-base font-bold font-display text-dark-100 mb-4">Skills</h3>
      <div className="flex flex-wrap gap-2">
        {list.map((s) => (
          <span key={s} className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-2xs font-semibold">{s}</span>
        ))}
      </div>
    </section>
  );
}

function SearchOtherTalentBlock({ items }) {
  return (
    <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
      <h3 className="text-base font-bold font-display text-dark-100 mb-4">Search for other talent</h3>
      <div className="relative mb-5">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500" />
        <input placeholder="Search" className="w-full pl-9 pr-3 py-2.5 rounded-full border border-dark-700 bg-dark-950 text-xs text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50 transition-colors" />
      </div>
      <div className="text-sm font-bold text-dark-100 mb-3">Browse similar freelancers</div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        {(items || ['Data Entry Specialists', 'Excel Experts', 'Administrative Assistants', 'Google Docs Experts', 'Verification Specialists']).map((s) => (
          <a key={s} href="#" className="text-xs text-primary-400 hover:text-primary-300 underline underline-offset-2">{s}</a>
        ))}
      </div>
    </section>
  );
}

function ProfilePanel({ talent, onClose }) {
  const [tab, setTab] = useState('About');
  const [fbPage, setFbPage] = useState(1);

  /* lock body scroll when panel is open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const p = talent.profile || {};
  const feedback   = p.feedback     || FAKE_FEEDBACK;
  const jobs       = p.completedJobs || FAKE_JOBS;
  const portfolio  = p.portfolio    || FAKE_PORTFOLIO;
  const titleStats = p.stats || { jobs: 70, hours: 395, rating: 4.9, reviews: 43, jobSuccess: talent.jobSuccess || 98 };
  const totalPages = Math.max(1, Math.ceil(feedback.length / 2));

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
                {p.city || talent.country} <span className="text-dark-700">·</span> {p.localTime || '7:37 am local time'}
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
                  <h3 className="text-base font-bold font-display text-dark-100 mb-5">Client feedback ({feedback.length})</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {feedback.slice((fbPage - 1) * 2, fbPage * 2).map((f, i) => (
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
                    {Array.from({ length: totalPages }, (_, k) => k + 1).map((n) => (
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
                    <button
                      onClick={() => setFbPage((page) => Math.min(totalPages, page + 1))}
                      disabled={fbPage === totalPages}
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
                    Completed jobs <span className="text-dark-500 font-normal">{jobs.length}</span>
                  </div>
                  <div className="space-y-3">
                    {jobs.map((j, i) => (
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
                  {feedback.map((f, i) => (
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
              <div className="space-y-5">
                <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                  <h3 className="text-base font-bold font-display text-dark-100 mb-1">Completed jobs <span className="text-dark-500 font-normal text-sm ml-1">{jobs.length}</span></h3>
                  <div className="h-0.5 w-24 bg-dark-100 mt-2 mb-5" />
                  <div className="space-y-5">
                    {jobs.map((j, i) => (
                      <div key={i} className="pb-5 border-b border-dark-800 last:border-b-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="text-sm font-semibold text-dark-100">{j.title}</div>
                          <span className="inline-flex items-center gap-1 text-xs text-dark-300 font-bold shrink-0">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {j.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-2xs text-dark-500 mb-3">Private earnings · <Calendar className="w-3 h-3 inline" /> {j.dates}</div>
                        {j.tags && (
                          <div className="flex items-center gap-1.5 mb-2 overflow-hidden">
                            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                              {j.tags.map((t) => (
                                <span key={t} className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-2xs font-semibold whitespace-nowrap">{t}</span>
                              ))}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-dark-500 shrink-0" />
                          </div>
                        )}
                        {j.desc && (
                          <p className="text-xs text-dark-400 leading-relaxed mt-2">
                            <span className="font-semibold text-dark-200">Job description: </span>{j.desc}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-5 mt-2 text-xs text-dark-300">
                    {talent.name} has more jobs.{' '}
                    <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold underline underline-offset-2">
                      Create an account to review them
                    </Link>
                  </div>
                </section>

                {/* Portfolio appended on Work history tab */}
                <PortfolioBlock portfolio={portfolio} count={portfolio.length + 1} />
              </div>
            )}

            {/* Portfolio tab */}
            {tab === 'Portfolio' && (
              <div className="space-y-5">
                <PortfolioBlock portfolio={portfolio} count={portfolio.length + 1} />
                <SkillsBlock skills={p.skills} talent={talent} />
                <SearchOtherTalentBlock items={p.browseSimilar} />
              </div>
            )}

            {/* Skills tab */}
            {tab === 'Skills' && (
              <div className="space-y-5">
                <SkillsBlock skills={p.skills} talent={talent} />
                <SearchOtherTalentBlock items={p.browseSimilar} />
              </div>
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
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const clearFilters = () => setFilters(DEFAULT_FILTERS);

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
    return TALENT.filter((t) => {
      /* Text query — name / title / skills / bio */
      if (q) {
        const blob = `${t.name} ${t.title} ${t.skills.join(' ')} ${t.bio}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }

      /* Talent badge — derived from job success */
      if (filters.badges.length > 0) {
        const badge = getBadge(t);
        if (!filters.badges.includes(badge)) return false;
      }

      /* Skill filters — match any selected skill against talent skills (case-insensitive) */
      if (filters.skills.length > 0) {
        const tSkills = (t.skills || []).map((s) => s.toLowerCase());
        const hasAny = filters.skills.some((fs) => tSkills.some((ts) => ts.includes(fs.toLowerCase())));
        if (!hasAny) return false;
      }

      /* Consultations / contract-to-hire */
      if (filters.consultations && !t.consultations) return false;
      if (filters.contractToHire && !t.contractToHire) return false;

      /* Job success */
      if (filters.jobSuccess === '80% & up' && (t.jobSuccess || 0) < 80) return false;
      if (filters.jobSuccess === '90% & up' && (t.jobSuccess || 0) < 90) return false;

      /* Earned amount */
      const earned = parseEarned(t.earned);
      if (filters.earned === '$1+ earned'   && earned < 1)      return false;
      if (filters.earned === '$100+ earned' && earned < 100)    return false;
      if (filters.earned === '$1K+ earned'  && earned < 1_000)  return false;
      if (filters.earned === '$10K+ earned' && earned < 10_000) return false;
      if (filters.earned === 'No earnings yet' && earned > 0)   return false;

      return true;
    });
  }, [query, filters]);

  /* Active filter chip list — for the strip under the tabs */
  const activeChips = useMemo(() => {
    const out = [];
    filters.badges.forEach((b) => out.push({ key: `b-${b}`, label: b, remove: () => setFilters((f) => ({ ...f, badges: f.badges.filter((x) => x !== b) })) }));
    filters.skills.forEach((s) => out.push({ key: `s-${s}`, label: s, remove: () => setFilters((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) })) }));
    if (filters.consultations)  out.push({ key: 'consul', label: 'Offers consultations', remove: () => setFilters((f) => ({ ...f, consultations: false })) });
    if (filters.contractToHire) out.push({ key: 'cth',    label: 'Contract-to-hire',     remove: () => setFilters((f) => ({ ...f, contractToHire: false })) });
    if (filters.jobSuccess !== 'Any job success')  out.push({ key: 'js',  label: filters.jobSuccess, remove: () => setFilters((f) => ({ ...f, jobSuccess: 'Any job success' })) });
    if (filters.earned     !== 'Any amount earned') out.push({ key: 'er',  label: filters.earned,     remove: () => setFilters((f) => ({ ...f, earned: 'Any amount earned' })) });
    if (filters.hours      !== 'Any hours')         out.push({ key: 'hr',  label: filters.hours,      remove: () => setFilters((f) => ({ ...f, hours: 'Any hours' })) });
    if (filters.english    !== 'Any level')         out.push({ key: 'en',  label: filters.english,    remove: () => setFilters((f) => ({ ...f, english: 'Any level' })) });
    return out;
  }, [filters]);

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
          <form onSubmit={onSearch} className="flex-1 relative max-w-2xl">
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

          {/* Talent / Jobs dropdown */}
          <SearchTypeDropdown tab={tab} onChange={switchTab} />

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

        {/* Active filter chips */}
        {tab === 'talent' && activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {activeChips.map((c) => (
              <button
                key={c.key}
                onClick={c.remove}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-dark-100 text-dark-950 text-xs font-semibold hover:bg-dark-200 transition-colors"
              >
                {c.label}
                <X className="w-3 h-3" strokeWidth={2.5} />
              </button>
            ))}
            <button onClick={clearFilters} className="ml-2 text-xs font-semibold text-primary-400 hover:text-primary-300 underline underline-offset-4">
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Body grid */}
      <section className="container-custom py-6 sm:py-8 px-4 sm:px-6">
        {/* Mobile filters toggle */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <button
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-dark-700 bg-dark-900 text-xs font-semibold text-dark-100 hover:border-dark-500 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {mobileFiltersOpen ? 'Hide filters' : 'Show filters'}
          </button>
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid lg:grid-cols-[250px_1fr] gap-6 lg:gap-10">

          {/* Sidebar — hidden on mobile by default */}
          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto pr-2 scrollbar-none pb-4 lg:pb-0`}>
            {tab === 'talent'
              ? <TalentFilters filters={filters} setFilters={setFilters} />
              : <JobFilters />}
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
                <EmptyState query={query} kind="talent" onClear={activeChips.length > 0 ? clearFilters : null} />
              ) : (
                <>
                  <div className="text-2xs text-dark-500 mb-2 mt-1">
                    Showing <span className="text-dark-200 font-semibold">{filteredTalent.length}</span> {filteredTalent.length === 1 ? 'result' : 'results'}
                    {query && <> for "<span className="text-dark-200 font-semibold">{query}</span>"</>}
                  </div>

                  {filteredTalent.slice(0, 12).map((t, i) => (
                    <TalentCard
                      key={t.name}
                      t={t}
                      delay={i * 0.04}
                      active={selectedTalent?.name === t.name}
                      onView={() => setSelectedTalent(t)}
                    />
                  ))}

                  {/* People also searched for — only when there's something to suggest */}
                  {filteredTalent.length > 12 && (
                    <div className="border-b border-dark-800 py-6">
                      <h3 className="text-sm font-bold text-dark-100 mb-4">People also searched for</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PEOPLE_ALSO_SEARCHED.map((s) => (
                          <button
                            key={s}
                            onClick={() => setQuery(s)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-dark-700 bg-dark-900 text-xs text-dark-200 hover:border-primary-500/40 hover:text-primary-300 transition-all text-left"
                          >
                            <SearchIcon className="w-3.5 h-3.5 text-dark-500 shrink-0" />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredTalent.slice(12).map((t, i) => (
                    <TalentCard
                      key={t.name}
                      t={t}
                      delay={i * 0.04}
                      active={selectedTalent?.name === t.name}
                      onView={() => setSelectedTalent(t)}
                    />
                  ))}

                  {/* Pagination */}
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    <button className="w-8 h-8 rounded-full hover:bg-dark-800 flex items-center justify-center text-dark-300 disabled:opacity-30" disabled>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                          n === 1 ? 'border border-dark-100 text-dark-100' : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button className="w-8 h-8 rounded-full hover:bg-dark-800 flex items-center justify-center text-dark-300">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
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

function EmptyState({ query, kind, onClear }) {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center mx-auto mb-4">
        <SearchIcon className="w-6 h-6 text-dark-500" />
      </div>
      <p className="text-sm font-semibold text-dark-200">
        No {kind} match {query ? `"${query}"` : 'your filters'} yet
      </p>
      <p className="text-xs text-dark-500 mt-1 mb-4">Try a different keyword or remove some filters.</p>
      {onClear && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 hover:shadow-glow transition-all"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
