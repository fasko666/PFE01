import { useState, useMemo, useEffect, useRef } from 'react';
import { resolveFooter } from '../../utils/footerLinks';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon, X, ChevronDown, Check, MapPin, BadgeCheck,
  Calendar, DollarSign, Briefcase, ThumbsUp, Sparkles, HelpCircle,
  ArrowLeft, ExternalLink, Star, Play, ChevronLeft, ChevronRight, Plus,
  SlidersHorizontal,
} from 'lucide-react';
import PandaLogo from '../../components/ui/PandaLogo';
import { api } from '../../api';

/* ─── Map API freelancer → card shape ──────────────────────── */
function mapApiFreelancer(u) {
  const fp = u.freelancer_profile || {};
  const skillNames = (u.skills || []).map((s) => s.name || s).filter(Boolean);
  const visibleSkills = skillNames.slice(0, 5);
  if (skillNames.length > 5) visibleSkills.push(`+${skillNames.length - 5}`);
  const earned = fp.total_earnings ? `$${Math.round(fp.total_earnings / 1000)}K+` : '';
  return {
    id:           u.id,
    name:         u.name,
    username:     u.username,
    title:        fp.title || '',
    country:      u.country || '',
    jobSuccess:   Math.round(fp.job_success_score || fp.avg_rating * 20 || 0),
    earned,
    available:    fp.availability === 'available',
    consultations: !!fp.offers_consultations,
    skills:       visibleSkills.length ? visibleSkills : ['—'],
    bio:          fp.bio || '',
    avatar:       u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=4361ff&color=fff&size=120&bold=true`,
  };
}

/* ─── Map API job → card shape ─────────────────────────────── */
function mapApiJob(j) {
  const rawSkills = j.skills_required || j.skills || [];
  const skillList = Array.isArray(rawSkills) ? rawSkills : [];
  const visibleSkills = skillList.slice(0, 6);
  if (skillList.length > 6) visibleSkills.push(`+${skillList.length - 6}`);
  const budgetParts = [];
  if (j.budget_min) budgetParts.push(`$${j.budget_min}${j.budget_max && j.budget_max !== j.budget_min ? `–$${j.budget_max}` : '+'}`);
  return {
    id:     j.id,
    posted: j.created_at ? new Date(j.created_at).toLocaleDateString() : '',
    title:  j.title,
    type:   [j.type === 'hourly' ? 'Hourly' : 'Fixed price', j.experience_level || '', budgetParts[0] || ''].filter(Boolean).join(' · '),
    desc:   j.description || '',
    skills: visibleSkills,
    status: j.status,
  };
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

/* ─── Sub-nav categories ─────────────────────────────────────── */
const SUB_NAV = ['Development & IT', 'AI Services', 'Design & Creative', 'Sales & Marketing', 'Admin & Customer Support'];


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
function JobFilters({ filters, setFilters }) {
  const toggle = (key, val) =>
    setFilters((f) => ({ ...f, [key]: f[key] === val ? '' : val }));
  const toggleArr = (key, val) =>
    setFilters((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));

  return (
    <aside className="space-y-6">
      <FilterGroup title="Experience level">
        <div className="space-y-2.5">
          {['entry', 'intermediate', 'expert'].map((lvl) => (
            <Checkbox key={lvl} checked={filters.experience.includes(lvl)} onChange={() => toggleArr('experience', lvl)}>
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </Checkbox>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Job type">
        <div className="space-y-2.5">
          <Checkbox checked={filters.job_type === 'hourly'} onChange={() => toggle('job_type', 'hourly')}>Hourly</Checkbox>
          <Checkbox checked={filters.job_type === 'fixed'} onChange={() => toggle('job_type', 'fixed')}>Fixed-Price</Checkbox>
        </div>
      </FilterGroup>

      <FilterGroup title="Budget">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-dark-500">$</span>
          <input
            value={filters.budget_min}
            onChange={(e) => setFilters((f) => ({ ...f, budget_min: e.target.value }))}
            placeholder="Min"
            type="number"
            className="w-20 px-2 py-1.5 rounded-md bg-dark-900 border border-dark-700 text-xs text-dark-200 placeholder:text-dark-600 outline-none focus:border-primary-500/50"
          />
          <span className="text-xs text-dark-500">–</span>
          <input
            value={filters.budget_max}
            onChange={(e) => setFilters((f) => ({ ...f, budget_max: e.target.value }))}
            placeholder="Max"
            type="number"
            className="w-20 px-2 py-1.5 rounded-md bg-dark-900 border border-dark-700 text-xs text-dark-200 placeholder:text-dark-600 outline-none focus:border-primary-500/50"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Project length">
        <div className="space-y-2.5">
          {[
            { label: 'Less than 1 month', value: 'less_than_1_month' },
            { label: '1 to 3 months',    value: '1_to_3_months' },
            { label: '3 to 6 months',    value: '3_to_6_months' },
            { label: 'More than 6 months', value: 'more_than_6_months' },
          ].map(({ label, value }) => (
            <Checkbox key={value} checked={filters.duration === value} onChange={() => toggle('duration', value)}>
              {label}
            </Checkbox>
          ))}
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
  const navigate = useNavigate();
  const handleView = () => {
    if (t.username) navigate(`/freelancers/${t.username}`);
    else onView && onView();
  };

  return (
    <motion.article
      {...fadeUp(delay)}
      onClick={handleView}
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
          onClick={(e) => { e.stopPropagation(); handleView(); }}
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
          <Link key={s} to={resolveFooter(s)} className="text-xs text-primary-400 hover:text-primary-300 underline underline-offset-2" >{s}</Link>
        ))}
      </div>
    </section>
  );
}

function ProfilePanel({ talent, onClose }) {
  const [tab, setTab] = useState('About');
  const [fbPage, setFbPage] = useState(1);
  const [messaging, setMessaging] = useState(false);
  const navigate = useNavigate();
  const { token, user: me } = useAuthStore();

  const handleMessage = async () => {
    if (!token) {
      toast.error('Please log in to message this talent');
      navigate('/login');
      return;
    }
    if (!talent.id) {
      toast.error('This profile preview is read-only — open the full profile to message.');
      return;
    }
    if (me && talent.id === me.id) {
      toast('That\'s you 😄', { icon: '👤' });
      return;
    }
    setMessaging(true);
    try {
      const res = await api.chat.start({ user_id: talent.id });
      const convId = res.data?.data?.id || res.data?.id;
      onClose?.();
      if (convId) navigate(`/messages/${convId}`);
      else        navigate('/messages');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not start conversation');
    } finally {
      setMessaging(false);
    }
  };

  /* lock body scroll when panel is open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const p = talent.profile || {};
  const feedback   = p.feedback      || [];
  const jobs       = p.completedJobs || [];
  const portfolio  = p.portfolio     || [];
  const titleStats = p.stats || { jobs: talent.total_jobs || 0, hours: talent.total_hours || 0, rating: talent.rating || 0, reviews: talent.reviews_count || 0, jobSuccess: talent.jobSuccess || 0 };
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
          <a onClick={(e) => e.preventDefault()} href="#" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300">
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

              <button
                onClick={handleMessage}
                disabled={messaging}
                className="w-full py-2.5 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {messaging ? 'Starting…' : 'Message'}
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

                  {talent.bio ? (
                    <p className="text-sm text-dark-300 leading-relaxed">{talent.bio}</p>
                  ) : (
                    <p className="text-sm text-dark-500 italic">No biography available.</p>
                  )}
                </section>

                {/* Client feedback */}
                <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                  <h3 className="text-base font-bold font-display text-dark-100 mb-5">Client feedback ({feedback.length})</h3>
                  {feedback.length === 0 ? (
                    <p className="text-sm text-dark-500 italic">No feedback yet.</p>
                  ) : (
                  <>
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
                  </>
                  )}
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
                  {jobs.length === 0 ? (
                    <p className="text-sm text-dark-500 italic">No completed jobs to display.</p>
                  ) : (
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
                  )}
                </section>
              </div>
            )}

            {/* Client feedback tab */}
            {tab === 'Client feedback' && (
              <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                <h3 className="text-base font-bold font-display text-dark-100 mb-5">All client feedback</h3>
                {feedback.length === 0 ? (
                  <p className="text-sm text-dark-500 italic">No feedback yet.</p>
                ) : (
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
                )}
              </section>
            )}

            {/* Work history tab */}
            {tab === 'Work history' && (
              <div className="space-y-5">
                <section className="rounded-2xl border border-dark-800 bg-dark-900 p-6">
                  <h3 className="text-base font-bold font-display text-dark-100 mb-1">Completed jobs <span className="text-dark-500 font-normal text-sm ml-1">{jobs.length}</span></h3>
                  <div className="h-0.5 w-24 bg-dark-100 mt-2 mb-5" />
                  {jobs.length === 0 ? (
                    <p className="text-sm text-dark-500 italic">No completed jobs to display.</p>
                  ) : (
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
                  )}
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
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const isFreelancer = user?.role === 'freelancer';

  const goToJob = () => { if (j.id) navigate(`/jobs/${j.id}`); };

  return (
    <motion.article
      {...fadeUp(delay)}
      onClick={goToJob}
      className="border-b border-dark-800 py-6 group cursor-pointer hover:bg-dark-900/30 rounded-xl -mx-2 px-2 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-2xs text-dark-500 mb-1.5">Posted {j.posted}</div>
          <h3 className="text-base font-bold text-dark-100 leading-tight mb-1.5 group-hover:text-primary-300 transition-colors">
            {j.title}
          </h3>
          <p className="text-2xs text-dark-400">{j.type}</p>
        </div>
        {isFreelancer && j.id && j.status !== 'closed' && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${j.id}`); }}
            className="shrink-0 px-4 py-1.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-all"
          >
            Apply now
          </button>
        )}
      </div>
      <p className="text-xs text-dark-300 leading-relaxed mb-4 line-clamp-2">{j.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {j.skills.map((s, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-full text-2xs font-medium ${
            s.startsWith('+') ? 'bg-dark-800 text-dark-400' : 'bg-dark-800 text-dark-200'
          }`}>
            {s}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

const DEFAULT_JOB_FILTERS = { experience: [], job_type: '', budget_min: '', budget_max: '', duration: '' };

/* ─── Main page ──────────────────────────────────────────────── */
export default function Search() {
  const [params, setParams] = useSearchParams();
  const initialType = params.get('type') === 'jobs' ? 'jobs' : 'talent';
  const initialQ    = params.get('q') || '';

  const [tab, setTab]             = useState(initialType);
  const [inputValue, setInputValue] = useState(initialQ);  // what user types (does NOT trigger fetch)
  const [query, setQuery]         = useState(initialQ);    // committed search → drives API fetch
  const [sortBy, setSortBy]       = useState('newest');
  const [sortOpen, setSortOpen]   = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [filters, setFilters]     = useState(DEFAULT_FILTERS);
  const [jobFilters, setJobFilters] = useState(DEFAULT_JOB_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [apiTalent, setApiTalent] = useState([]);
  const [apiJobs, setApiJobs]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const clearFilters = () => { setFilters(DEFAULT_FILTERS); setJobFilters(DEFAULT_JOB_FILTERS); };

  /* ─── Fetch from MySQL whenever the committed query/tab/filters change ─── */
  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    setLoading(true);
    setFetchError(null);

    const fetchPromise = tab === 'jobs'
      ? api.jobs.list({
          search: q || undefined,
          per_page: 50,
          sort: sortBy,
          ...(jobFilters.experience.length === 1 ? { experience_level: jobFilters.experience[0] } : {}),
          ...(jobFilters.job_type   ? { job_type:    jobFilters.job_type }   : {}),
          ...(jobFilters.budget_min ? { budget_min:  jobFilters.budget_min } : {}),
          ...(jobFilters.budget_max ? { budget_max:  jobFilters.budget_max } : {}),
          ...(jobFilters.duration   ? { duration:    jobFilters.duration }   : {}),
        }).then((r) => ({ jobs: (r.data?.data?.data ?? r.data?.data ?? []).map(mapApiJob) }))
      : api.freelancers.list({ search: q || undefined, per_page: 50 })
          .then((r) => ({ talent: (r.data?.data?.data ?? r.data?.data ?? []).map(mapApiFreelancer).filter((t) => !me || t.id !== me.id) }));

    fetchPromise
      .then((res) => {
        if (!cancelled) {
          if (res.jobs)   setApiJobs(res.jobs);
          if (res.talent) setApiTalent(res.talent);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err?.response?.data?.message || 'Could not connect to database. Check your backend is running.';
          setFetchError(msg);
          if (tab === 'jobs') setApiJobs([]); else setApiTalent([]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [query, tab, sortBy, jobFilters, retryCount]);

  /* ─── Sync URL params → input + committed query ─── */
  useEffect(() => {
    const t = params.get('type');
    if (t === 'jobs' || t === 'talent') setTab(t);
    const q = params.get('q') ?? '';
    setInputValue(q);
    setQuery(q);
  }, [params]);

  const switchTab = (next) => {
    setTab(next);
    const p = new URLSearchParams(params);
    p.set('type', next);
    setParams(p, { replace: true });
  };

  /* Submit commits inputValue → query and updates URL */
  const onSearch = (e) => {
    e.preventDefault();
    const q = inputValue.trim();
    setQuery(q);
    const p = new URLSearchParams(params);
    if (q) p.set('q', q); else p.delete('q');
    p.set('type', tab);
    setParams(p, { replace: true });
  };

  const filteredTalent = useMemo(() => {
    const source = apiTalent;
    const q = (query || '').toLowerCase().trim();
    return source.filter((t) => {
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
  }, [apiTalent, query, filters]);

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

  /* Jobs come pre-filtered from MySQL — no client-side filtering needed */
  const filteredJobs = apiJobs;

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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search jobs or talent…"
              className="w-full pl-10 pr-10 py-3 rounded-full border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-colors"
            />
            {inputValue && (
              <button type="button" onClick={() => { setInputValue(''); setQuery(''); const p = new URLSearchParams(params); p.delete('q'); setParams(p, { replace: true }); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-dark-600 flex items-center justify-center text-dark-500 hover:text-dark-100 hover:border-dark-500 transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </form>

          {/* Talent / Jobs dropdown */}
          <SearchTypeDropdown tab={tab} onChange={switchTab} />

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
              : <JobFilters filters={jobFilters} setFilters={setJobFilters} />}
          </div>

          {/* Results */}
          <div>
            {tab === 'jobs' && (
              <div className="flex justify-end mb-2 relative">
                <button onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dark-700 bg-dark-900 text-xs text-dark-200 hover:border-dark-600 transition-colors">
                  Sort by: <span className="font-semibold text-dark-100">{{ newest: 'Newest first', created_at: 'Oldest first', budget_max: 'Budget (high)' }[sortBy] || 'Newest first'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-dark-500 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 z-10 rounded-lg border border-dark-700 bg-dark-900 overflow-hidden shadow-xl min-w-[180px]">
                    {[{ label: 'Newest first', val: 'newest' }, { label: 'Oldest first', val: 'created_at' }, { label: 'Budget (high)', val: 'budget_max' }].map(({ label, val }) => (
                      <button key={val} onClick={() => { setSortBy(val); setSortOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-dark-800 transition-colors ${sortBy === val ? 'text-primary-300 font-semibold' : 'text-dark-300'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'talent' ? (
              loading ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-dark-500">Finding talent…</p>
                </div>
              ) : filteredTalent.length === 0 ? (
                <EmptyState query={query} kind="talent" onClear={activeChips.length > 0 ? clearFilters : null} />
              ) : (
                <>
                  <div className="text-2xs text-dark-500 mb-2 mt-1">
                    Showing <span className="text-dark-200 font-semibold">{filteredTalent.length}</span> {filteredTalent.length === 1 ? 'result' : 'results'}
                    {query && <> for "<span className="text-dark-200 font-semibold">{query}</span>"</>}
                  </div>

                  {filteredTalent.map((t, i) => (
                    <TalentCard
                      key={t.id || t.name}
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
            ) : loading ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-dark-500">Searching database…</p>
              </div>
            ) : fetchError ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <p className="text-sm font-semibold text-red-400">Connection error</p>
                <p className="text-xs text-dark-500 max-w-sm">{fetchError}</p>
                <button
                  onClick={() => setRetryCount((n) => n + 1)}
                  className="mt-2 px-4 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <EmptyState query={query} kind="jobs" />
            ) : (
              <>
                <div className="text-2xs text-dark-500 mb-2 mt-1">
                  Showing <span className="text-dark-200 font-semibold">{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'job' : 'jobs'} from database
                  {query && <> for "<span className="text-dark-200 font-semibold">{query}</span>"</>}
                </div>
                {filteredJobs.map((j, i) => <JobCard key={j.id || j.title} j={j} delay={i * 0.04} />)}
              </>
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
