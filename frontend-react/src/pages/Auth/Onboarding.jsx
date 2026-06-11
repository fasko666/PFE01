import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Pencil, ChevronDown, Calendar, Camera, CheckCircle2, Settings, LogOut, Trash2,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { api } from '../../api';
import toast from 'react-hot-toast';
import PandaLogo from '../../components/ui/PandaLogo';
import UserAvatar from '../../components/ui/UserAvatar';
import { compressImage } from '../../utils/imageCompressor';

const TOTAL = 9;

/* ─── Step 2 categories + specialties ─────────────────────── */
const CATEGORIES = [
  { name: 'Accounting & Consulting', specialties: ['Financial Planning', 'Personal & Professional Coaching', 'Recruiting & Talent Sourcing', 'Tax Preparation', 'Other'] },
  { name: 'Admin Support',           specialties: ['Data Entry', 'Virtual Assistance', 'Project Management', 'Transcription'] },
  { name: 'Customer Service',        specialties: ['Customer Service Reps', 'Tech Support', 'Community Management'] },
  { name: 'Data Science & Analytics',specialties: ['Data Mining & Management', 'Data Visualization', 'Machine Learning', 'A/B Testing'] },
  { name: 'Design & Creative',       specialties: ['Logo Design', 'Web & Mobile Design', 'Illustration', 'Motion Graphics', 'Video Production'] },
  { name: 'Engineering & Architecture', specialties: ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Interior Design'] },
  { name: 'IT & Networking',         specialties: ['Network & System Administration', 'Database Administration', 'DevOps Engineering', 'Information Security'] },
  { name: 'Legal',                   specialties: ['Corporate Law', 'Contract Law', 'Intellectual Property', 'Paralegal Services'] },
  { name: 'Sales & Marketing',       specialties: ['Lead Generation', 'Telemarketing', 'SEO', 'SEM', 'Social Media Marketing', 'Email Marketing'] },
  { name: 'Translation',             specialties: ['English to Spanish', 'English to French', 'English to German', 'Other Languages'] },
  { name: 'Web, Mobile & Software Dev', specialties: ['Web Development', 'Mobile Development', 'Game Development', 'QA & Testing', 'Scripts & Utilities'] },
  { name: 'Writing',                 specialties: ['Content Writing', 'Copywriting', 'Editing & Proofreading', 'Technical Writing', 'Resume Writing'] },
];

/* Suggested skills based on category — keyed by category name */
const SKILL_SUGGESTIONS = {
  'Accounting & Consulting':       ['Coaching', 'Business Coaching', 'Career Coaching', 'Continuing Professional Development', 'Professional Tone', 'Life Coaching'],
  'Admin Support':                 ['Data Entry', 'Virtual Assistant', 'Microsoft Excel', 'Customer Support', 'Project Management', 'Email Communication'],
  'Customer Service':              ['Customer Service', 'Phone Support', 'Email Support', 'Zendesk', 'Intercom', 'Live Chat'],
  'Data Science & Analytics':      ['Python', 'SQL', 'Tableau', 'Power BI', 'Machine Learning', 'Data Analysis'],
  'Design & Creative':             ['Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'UI/UX Design', 'Brand Identity Design', 'Logo Design'],
  'Engineering & Architecture':    ['AutoCAD', 'SolidWorks', 'Revit', '3D Modeling', 'MATLAB', 'Structural Engineering'],
  'IT & Networking':               ['AWS', 'Linux', 'DevOps', 'Docker', 'Cybersecurity', 'Network Administration'],
  'Legal':                         ['Contract Drafting', 'Legal Research', 'Intellectual Property Law', 'Compliance', 'Paralegal Services'],
  'Sales & Marketing':             ['SEO', 'Google Ads', 'Social Media Marketing', 'Lead Generation', 'Email Marketing', 'Copywriting'],
  'Translation':                   ['English Translation', 'Spanish Translation', 'French Translation', 'German Translation', 'Localization'],
  'Web, Mobile & Software Dev':    ['React', 'Node.js', 'TypeScript', 'Python', 'PHP', 'iOS Development', 'Android Development'],
  'Writing':                       ['Content Writing', 'SEO Writing', 'Copywriting', 'Blog Writing', 'Editing', 'Proofreading'],
};

const LANGUAGES = ['Amharic', 'Arabic', 'Bengali', 'Chinese (Mandarin)', 'Dutch', 'French', 'German', 'Hindi', 'Italian', 'Japanese', 'Korean', 'Portuguese', 'Russian', 'Spanish', 'Swahili', 'Turkish', 'Urdu', 'Vietnamese'];
const PROFICIENCY = ['Basic', 'Conversational', 'Fluent', 'Native or bilingual'];

const initialState = {
  category: '',
  specialties: [],
  skills: [],
  title: '',
  experience: [],
  education: [],
  languages: [{ language: 'English', level: 'Basic' }],
  bio: '',
  hourlyRate: '',
  dob: '',
  country: 'Morocco',
  street: '', apt: '', city: '', state: '', zip: '',
  phoneCountry: '+212', phone: '',
  photoUrl: '',
};

const SERVICE_FEE_PCT = 0.10;

/* ─── Header (logo + profile menu) ──────────────────────── */
function TopBar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 bg-dark-950 border-b border-dark-800">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-dark-900 rounded-lg flex items-center justify-center ring-1 ring-white/10">
            <PandaLogo className="w-5 h-5" invert />
          </div>
          <span className="font-black font-display text-dark-100 text-base tracking-widest uppercase">PANDA</span>
        </div>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="w-9 h-9 rounded-full ring-1 ring-dark-700 hover:ring-dark-500 overflow-hidden transition-all">
            <UserAvatar user={user} size={36} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-dark-700 bg-dark-900 shadow-2xl py-2 z-50">
              <div className="px-3.5 py-3 border-b border-dark-800 flex items-center gap-3">
                <UserAvatar user={user} size={36} className="shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-dark-100 truncate">{user?.name || 'Freelancer'}</div>
                  <div className="text-2xs text-dark-500">Freelancer</div>
                </div>
              </div>
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors">
                <Settings className="w-3.5 h-3.5" /> Close Account
              </button>
              <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Progress bar ──────────────────────────────────────── */
function Progress({ step }) {
  return (
    <div className="mb-7">
      <div className="text-xs font-bold text-dark-300 mb-2">{step}/{TOTAL}</div>
      <div className="h-1 rounded-full bg-dark-800 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${(step / TOTAL) * 100}%` }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="h-full bg-dark-100"
        />
      </div>
    </div>
  );
}

/* ─── Reusable pill button ──────────────────────────────── */
function PillButton({ active, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
        active
          ? 'bg-dark-100 text-dark-950 border-dark-100'
          : 'bg-transparent text-dark-200 border-dark-700 hover:border-primary-500/40 hover:text-primary-300'
      } ${className}`}
    >
      {children}
    </button>
  );
}

/* ─── Main component ────────────────────────────────────── */
export default function Onboarding() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  // photoDisplay: what to show in the UI (existing avatar URL or new base64 pick)
  // form.photoUrl: only set when the user actually picks a NEW file (base64), sent to backend
  const [photoDisplay, setPhotoDisplay] = useState(user?.avatar_url || '');

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const next = () => setStep((s) => Math.min(TOTAL + 1, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const toggleSkill = (s) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(s)
        ? f.skills.filter((x) => x !== s)
        : f.skills.length < 15 ? [...f.skills, s] : f.skills,
    }));
  };

  const toggleSpecialty = (s) => {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : f.specialties.length < 3 ? [...f.specialties, s] : f.specialties,
    }));
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        category:      form.category,
        specialties:   form.specialties,
        skills:        form.skills,
        title:         form.title,
        experience:    form.experience,
        education:     form.education,
        languages:     form.languages,
        bio:           form.bio,
        hourly_rate:   parseFloat(form.hourlyRate || 0),
        date_of_birth: form.dob || null,
        country:       form.country,
        address: { street: form.street, apt: form.apt, city: form.city, state: form.state, zip: form.zip },
        phone:         `${form.phoneCountry} ${form.phone}`.trim(),
        avatar:        form.photoUrl || null,
      };

      const { data } = await api.freelancers.onboarding(payload);

      // Update local store with fresh user (and the new avatar_url if backend stored a new file)
      const freshUser = data?.data;
      if (setUser && user) {
        setUser({
          ...user,
          ...(freshUser ? {
            avatar_url: freshUser.avatar_url ?? user.avatar_url,
            country:    freshUser.country    ?? user.country,
            phone:      freshUser.phone      ?? user.phone,
          } : {}),
          onboarding_completed: true,
        });
      }

      toast.success('Profile created!');
      setStep(TOTAL + 1);
    } catch (err) {
      const msg = err?.response?.data?.message
        || (err?.response?.data?.errors && Object.values(err.response.data.errors)[0]?.[0])
        || 'Could not submit — try again';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Photo file picker ──────────────────────────────── */
  const photoInputRef = useRef(null);
  const openPhotoPicker = () => photoInputRef.current?.click();
  const onPhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    try {
      const compressed = await compressImage(file);
      set({ photoUrl: compressed }); // base64 → sent to backend
      setPhotoDisplay(compressed);   // shown in UI
    } catch {
      toast.error('Could not read image. Try another file.');
    }
  };

  const activeCat = CATEGORIES.find((c) => c.name === form.category);
  const suggestions = SKILL_SUGGESTIONS[form.category] || SKILL_SUGGESTIONS['Accounting & Consulting'];

  /* ─── Step renders ───────────────────────────────────── */
  const renderStep = () => {
    switch (step) {
      /* ─── Step 2: Category + Specialties ─── */
      case 1:
        return (
          <>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-2 leading-tight">
              Great, so what kind of work are you here to do?
            </h1>
            <p className="text-sm text-dark-400 mb-7">Don't worry, you can change these choices later on.</p>

            <div className="grid md:grid-cols-2 gap-10 border-t border-dark-800 pt-6">
              <div>
                <div className="text-xs font-semibold text-dark-500 mb-4">Select 1 category</div>
                <div className="space-y-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => set({ category: c.name, specialties: [] })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        form.category === c.name
                          ? 'bg-dark-800 text-primary-300 font-semibold'
                          : 'text-dark-200 hover:bg-dark-800/60 hover:text-dark-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-dark-500 mb-4">Now, select 1 to 3 specialties</div>
                {activeCat ? (
                  <div className="space-y-2">
                    {activeCat.specialties.map((s) => (
                      <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                          form.specialties.includes(s) ? 'bg-primary-500 border-primary-500' : 'border-dark-600 group-hover:border-dark-500'
                        }`}>
                          {form.specialties.includes(s) && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                        </span>
                        <input type="checkbox" checked={form.specialties.includes(s)} onChange={() => toggleSpecialty(s)} className="hidden" />
                        <span className="text-sm text-dark-200 group-hover:text-dark-100">{s}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-dark-500 italic">Pick a category to see specialties</div>
                )}
              </div>
            </div>
          </>
        );

      /* ─── Step 3: Skills ─── */
      case 2:
        return (
          <div className="grid md:grid-cols-[1fr_280px] gap-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-2 leading-tight">
                Nearly there! What work are you here to do?
              </h1>
              <p className="text-sm text-dark-400 mb-2 max-w-2xl">
                Your skills show clients what you can offer, and help us choose which jobs to recommend to you. Add or remove the ones we've suggested, or start typing to pick more. It's up to you.
              </p>
              <button className="text-xs text-primary-400 hover:text-primary-300 underline underline-offset-4 mb-7">
                Why choosing carefully matters
              </button>

              <label className="block text-xs font-semibold text-dark-300 mb-2">Your skills</label>
              <div className="flex flex-wrap gap-2 items-center px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 min-h-[48px] mb-2">
                {form.skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-2xs font-semibold">
                    {s}
                    <button onClick={() => toggleSkill(s)} className="hover:text-primary-100">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={form.skills.length ? '' : 'Enter skills here'}
                  className="flex-1 min-w-[140px] bg-transparent text-sm text-dark-100 placeholder:text-dark-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      e.preventDefault();
                      const v = e.currentTarget.value.trim();
                      if (form.skills.length < 15 && !form.skills.includes(v)) toggleSkill(v);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="text-2xs text-dark-500 text-right mb-7">Max 15 skills</div>

              <div className="text-xs font-semibold text-dark-300 mb-3">Suggested skills</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      form.skills.includes(s)
                        ? 'bg-primary-500/15 border-primary-500/40 text-primary-300'
                        : 'border-dark-700 text-dark-200 hover:border-primary-500/40 hover:text-primary-300'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Pro tip card */}
            <div className="rounded-2xl bg-dark-900 border border-dark-800 p-5 h-fit">
              <div className="flex items-center gap-2.5 mb-3">
                <img src="https://ui-avatars.com/api/?name=Pro+Tip&background=4361ff&color=fff&size=80&bold=true" alt="" className="w-9 h-9 rounded-full" />
              </div>
              <p className="text-sm text-dark-200 leading-relaxed mb-3">
                "PANDA's algorithm will recommend specific job posts to you based on your skills. So choose them carefully to get the best match!"
              </p>
              <div className="text-2xs text-dark-500">PANDA Pro Tip</div>
            </div>
          </div>
        );

      /* ─── Step 4: Title ─── */
      case 3:
        return (
          <>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-2 leading-tight">
              Got it. Now, add a title to tell the world what you do.
            </h1>
            <p className="text-sm text-dark-400 mb-7 max-w-2xl">
              It's the very first thing clients see, so make it count. Stand out by describing your expertise in your own words.
            </p>

            <label className="block text-xs font-semibold text-dark-300 mb-2">Your professional role</label>
            <div className="relative max-w-md">
              <input
                type="text"
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="e.g. Senior Full-Stack Developer"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
              {form.title && (
                <button onClick={() => set({ title: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-dark-500 hover:text-dark-100">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        );

      /* ─── Step 5: Experience ─── */
      case 4:
        return (
          <>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-2 leading-tight">
              If you have relevant work experience, add it here.
            </h1>
            <p className="text-sm text-dark-400 mb-7 max-w-2xl">
              Freelancers who add their experience are twice as <span className="text-primary-400 font-semibold">likely to win work</span>. But if you're just starting out, you can still create a great profile. Just head on to the next page.
            </p>

            <div className="space-y-3 mb-4">
              {form.experience.map((e, i) => (
                <div key={i} className="rounded-2xl border border-dark-800 bg-dark-900 p-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-dark-100">{e.title}</div>
                    <div className="text-xs text-dark-400">{e.company} · {e.years}</div>
                  </div>
                  <button onClick={() => set({ experience: form.experience.filter((_, idx) => idx !== i) })} className="text-dark-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const title = window.prompt('Job title?');
                if (!title) return;
                const company = window.prompt('Company?') || 'Self-employed';
                const years   = window.prompt('Years (e.g. 2020 - Present)?') || '';
                set({ experience: [...form.experience, { title, company, years }] });
              }}
              className="w-full max-w-md flex flex-col items-center justify-center px-6 py-12 rounded-2xl border-2 border-dashed border-dark-700 bg-dark-900/40 hover:bg-dark-900 hover:border-primary-500/40 transition-all group"
            >
              <span className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-base font-semibold text-dark-200 group-hover:text-dark-100">Add experience</span>
            </button>
          </>
        );

      /* ─── Step 6: Education ─── */
      case 5:
        return (
          <>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-2 leading-tight">
              Clients like to know what you know - add your education here.
            </h1>
            <p className="text-sm text-dark-400 mb-7 max-w-2xl">
              You don't have to have a degree. Adding any relevant education helps make your profile more visible.
            </p>

            <div className="space-y-3 mb-4">
              {form.education.map((e, i) => (
                <div key={i} className="rounded-2xl border border-dark-800 bg-dark-900 p-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-dark-100">{e.school}</div>
                    <div className="text-xs text-dark-400">{e.degree} · {e.years}</div>
                  </div>
                  <button onClick={() => set({ education: form.education.filter((_, idx) => idx !== i) })} className="text-dark-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const school = window.prompt('School / institution?');
                if (!school) return;
                const degree = window.prompt('Degree / field?') || '';
                const years  = window.prompt('Years (e.g. 2018 - 2022)?') || '';
                set({ education: [...form.education, { school, degree, years }] });
              }}
              className="w-full max-w-md flex flex-col items-center justify-center px-6 py-12 rounded-2xl border-2 border-dashed border-dark-700 bg-dark-900/40 hover:bg-dark-900 hover:border-primary-500/40 transition-all group"
            >
              <span className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-base font-semibold text-dark-200 group-hover:text-dark-100">Add education</span>
            </button>
          </>
        );

      /* ─── Step 7: Languages ─── */
      case 6: {
        const update = (i, patch) => {
          const next = [...form.languages];
          next[i] = { ...next[i], ...patch };
          set({ languages: next });
        };
        const remove = (i) => set({ languages: form.languages.filter((_, idx) => idx !== i) });
        return (
          <>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-2 leading-tight">
              Looking good. Next, tell us which languages you speak.
            </h1>
            <p className="text-sm text-dark-400 mb-7 max-w-3xl">
              PANDA is global, so clients are often interested to know what languages you speak. English is a must, but do you speak any other languages?
            </p>

            <div className="space-y-3 max-w-3xl">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:gap-4 text-xs font-semibold text-dark-300">
                <span>Language</span><span>Proficiency</span><span className="w-8" />
              </div>
              {form.languages.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:gap-4 items-center">
                  {i === 0 ? (
                    <div className="px-3 py-2.5 text-sm text-primary-400">English (all profiles include this)</div>
                  ) : (
                    <select
                      value={row.language}
                      onChange={(e) => update(i, { language: e.target.value })}
                      className="px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 focus:outline-none focus:border-primary-500/50"
                    >
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  )}
                  <select
                    value={row.level}
                    onChange={(e) => update(i, { level: e.target.value })}
                    className="px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 focus:outline-none focus:border-primary-500/50"
                  >
                    <option value="">My level is</option>
                    {PROFICIENCY.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {i === 0
                    ? <span className="w-8" />
                    : <button onClick={() => remove(i)} className="w-8 h-8 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-red-400 hover:border-red-400/40"><Trash2 className="w-3.5 h-3.5" /></button>
                  }
                </div>
              ))}
            </div>

            <button
              onClick={() => set({ languages: [...form.languages, { language: 'Spanish', level: 'Conversational' }] })}
              className="inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-full border border-primary-500/40 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add a language
            </button>
          </>
        );
      }

      /* ─── Step 8: Bio ─── */
      case 7:
        return (
          <div className="grid md:grid-cols-[1fr_320px] gap-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-2 leading-tight">
                Great. Now write a bio to tell the world about yourself.
              </h1>
              <p className="text-sm text-dark-400 mb-7 max-w-2xl">
                Help people get to know you at a glance. What work do you do best? Tell them clearly, using paragraphs or bullet points. You can always{' '}
                <span className="text-primary-400 underline">edit later</span>; just make sure you proofread now.
              </p>

              <textarea
                value={form.bio}
                onChange={(e) => set({ bio: e.target.value.slice(0, 5000) })}
                placeholder="Write something about yourself..."
                className="w-full h-44 px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50 resize-none"
              />
              <div className="text-2xs text-dark-500 text-right mt-1">{5000 - form.bio.length} characters left</div>
            </div>

            {/* Live preview card */}
            <div className="rounded-2xl bg-dark-900 border border-dark-800 p-5 h-fit">
              <div className="relative w-24 h-24 mx-auto mb-3">
                {photoDisplay
                  ? <img src={photoDisplay} className="w-24 h-24 rounded-full object-cover ring-1 ring-dark-700" alt="" />
                  : <UserAvatar user={user} size={96} className="ring-1 ring-dark-700" />
                }
                <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-400 ring-2 ring-dark-900" />
              </div>
              <div className="text-center text-lg font-bold text-dark-100 mb-1">{user?.name || 'Your Name'}</div>
              <div className="flex items-center justify-center gap-3 text-2xs text-dark-400 mb-4 pb-4 border-b border-dark-800">
                <span>★ 5.0</span>
                <span>${form.hourlyRate || '0.00'}/hr</span>
                <span>0 jobs</span>
              </div>
              <p className="text-xs text-dark-300 leading-relaxed whitespace-pre-wrap line-clamp-[12]">
                {form.bio || 'Your bio will appear here as you type. Share what you do best.'}
              </p>
            </div>
          </div>
        );

      /* ─── Step 9: Hourly rate ─── */
      case 8: {
        const rate = parseFloat(form.hourlyRate || 0);
        const fee = +(rate * SERVICE_FEE_PCT).toFixed(2);
        const youGet = +(rate - fee).toFixed(2);
        const valid = rate >= 3 && rate <= 999;
        return (
          <>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-2 leading-tight">
              Now, let's set your hourly rate.
            </h1>
            <p className="text-sm text-dark-400 mb-7 max-w-3xl">
              Clients will <span className="text-primary-400">see this rate on your profile and in search results</span> once you publish your profile. You can adjust your rate every time you submit a proposal.
            </p>

            <div className="border-y border-dark-800 py-7 space-y-7 max-w-3xl">
              <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <div className="text-base font-bold text-dark-100">Hourly rate</div>
                  <div className="text-xs text-dark-400 mt-1">Total amount the client will see.</div>
                  {!valid && form.hourlyRate && (
                    <div className="text-2xs text-red-400 mt-1.5 flex items-center gap-1">⓵ Enter a rate between $3.00 and $999.00.</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.hourlyRate}
                    onChange={(e) => set({ hourlyRate: e.target.value })}
                    placeholder="0.00"
                    className="w-32 px-3 py-2 rounded-lg border border-dark-700 bg-dark-900 text-sm text-right text-dark-100 focus:outline-none focus:border-primary-500/50"
                  />
                  <span className="text-xs text-dark-400">/hr</span>
                </div>
              </div>

              <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-base font-bold text-dark-100">Service fee</div>
                    <button className="text-xs text-primary-400 underline">Learn more</button>
                  </div>
                  <p className="text-xs text-dark-400 mt-1 max-w-md">
                    This helps us run the platform and provide services like payment protection and customer support. Fees vary and are shown before contract acceptance.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={fee ? `-$${fee.toFixed(2)}` : '$0.00'}
                    className="w-32 px-3 py-2 rounded-lg border border-dark-700 bg-dark-800 text-sm text-right text-dark-300"
                  />
                  <span className="text-xs text-dark-400">/hr</span>
                </div>
              </div>

              <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <div className="text-base font-bold text-dark-100">You'll get</div>
                  <div className="text-xs text-dark-400 mt-1">The estimated amount you'll receive after service fees</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={youGet ? `$${youGet.toFixed(2)}` : '$0.00'}
                    className="w-32 px-3 py-2 rounded-lg border border-dark-700 bg-dark-900 text-sm text-right text-dark-100"
                  />
                  <span className="text-xs text-dark-400">/hr</span>
                </div>
              </div>
            </div>
          </>
        );
      }

      /* ─── Step 10: Personal details ─── */
      case 9:
        return (
          <>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-2 leading-tight">
              A few last details, then you can check and publish your profile.
            </h1>
            <p className="text-sm text-dark-400 mb-7 max-w-3xl">
              A professional photo helps you build trust with your clients. To keep things safe and simple, they'll pay you through us - which is why we need your personal information.
            </p>

            <div className="grid md:grid-cols-[180px_1fr] gap-8">
              <div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPhotoSelected}
                />
                <div className="relative w-32 h-32 mx-auto md:mx-0 rounded-full bg-gradient-to-br from-amber-700/40 to-purple-600/30 flex items-center justify-center overflow-hidden border border-dark-700">
                  {photoDisplay ? (
                    <img src={photoDisplay} className="w-full h-full object-cover" alt="Your profile" />
                  ) : (
                    <Camera className="w-8 h-8 text-dark-400" />
                  )}
                  <button
                    type="button"
                    onClick={openPhotoPicker}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-dark-950 hover:bg-emerald-400 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={openPhotoPicker}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary-500/40 text-primary-300 text-xs font-semibold hover:bg-primary-500/10 transition-all"
                >
                  <Pencil className="w-3 h-3" />
                  {photoDisplay ? 'Change photo' : 'Upload photo'}
                </button>
                {form.photoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      set({ photoUrl: '' });
                      setPhotoDisplay(user?.avatar_url || '');
                    }}
                    className="mt-2 block text-xs text-dark-500 hover:text-red-400 mx-auto md:mx-0"
                  >
                    Remove photo
                  </button>
                )}
                <p className="text-2xs text-dark-500 mt-3 max-w-[180px]">250×250 min · 5MB max. JPG, PNG.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-dark-300 mb-1.5">Date of Birth <span className="text-red-400">*</span></label>
                  <div className="relative max-w-sm">
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => set({ dob: e.target.value })}
                      placeholder="yyyy-mm-dd"
                      className="w-full px-3 py-2.5 pr-10 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 mb-1.5">Country <span className="text-red-400">*</span></label>
                  <select
                    value={form.country}
                    onChange={(e) => set({ country: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 focus:outline-none focus:border-primary-500/50"
                  >
                    {['Morocco', 'United States', 'United Kingdom', 'France', 'Spain', 'Germany', 'India', 'Bangladesh', 'Pakistan', 'Egypt', 'Other'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark-300 mb-1.5">Street address <span className="text-red-400">*</span></label>
                    <input value={form.street} onChange={(e) => set({ street: e.target.value })} placeholder="Enter street address"
                      className="w-full px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark-300 mb-1.5">Apt/Suite</label>
                    <input value={form.apt} onChange={(e) => set({ apt: e.target.value })} placeholder="(Optional)"
                      className="w-full px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark-300 mb-1.5">City <span className="text-red-400">*</span></label>
                    <input value={form.city} onChange={(e) => set({ city: e.target.value })} placeholder="Enter city"
                      className="w-full px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark-300 mb-1.5">State/Province</label>
                    <input value={form.state} onChange={(e) => set({ state: e.target.value })} placeholder="Enter state/province"
                      className="w-full px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark-300 mb-1.5">ZIP/Postal code</label>
                    <input value={form.zip} onChange={(e) => set({ zip: e.target.value })} placeholder="Enter ZIP/Postal code"
                      className="w-full px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-300 mb-1.5">Phone <span className="text-red-400">*</span></label>
                  <div className="flex gap-2 max-w-sm">
                    <select value={form.phoneCountry} onChange={(e) => set({ phoneCountry: e.target.value })}
                      className="w-24 px-2 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 focus:outline-none focus:border-primary-500/50">
                      <option value="+212">+212</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+33">+33</option>
                      <option value="+91">+91</option>
                    </select>
                    <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="Enter number"
                      className="flex-1 px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50" />
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      /* ─── Step 11: Profile review ─── */
      case 10:
        return <ProfileReview form={form} user={user} photoDisplay={photoDisplay} onSubmit={handleSubmit} submitting={submitting} onEdit={(s) => setStep(s)} />;

      /* ─── Step 12: Connects ─── */
      case 11:
        return <ConnectsScreen onContinue={() => navigate('/freelancer/dashboard')} />;

      default:
        return null;
    }
  };

  /* ─── Bottom navigation ──────────────────────────────── */
  const NextLabel = {
    2: 'Next, add your skills',
    3: 'Next, your profile title',
    4: 'Next, add your experience',
    5: 'Next, add your education',
    6: 'Next, add languages',
    7: 'Next, write an overview',
    8: 'Next, set your rate',
    9: 'Next, add your photo and location',
    10: 'Review your profile',
  }[step] || 'Next';

  const skipAvailable = [5, 6].includes(step);

  /* Validation per step */
  const canProceed = (() => {
    if (step === 1)  return form.category && form.specialties.length >= 1;
    if (step === 2)  return form.skills.length >= 1;
    if (step === 3)  return form.title.trim().length > 0;
    if (step === 6)  return form.languages[0]?.level;
    if (step === 7)  return form.bio.trim().length > 0;
    if (step === 8)  return parseFloat(form.hourlyRate) >= 3 && parseFloat(form.hourlyRate) <= 999;
    if (step === 9) return form.dob && form.street && form.city && form.phone;
    return true;
  })();

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <TopBar user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 pb-32">
        {step <= 9 && <Progress step={step} />}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {step <= 9 && (
        <footer className="fixed bottom-0 inset-x-0 bg-dark-950/95 backdrop-blur border-t border-dark-800 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
            <button onClick={back}
              disabled={step <= 1}
              className="px-4 sm:px-6 py-2.5 rounded-full border border-dark-700 text-xs font-semibold text-dark-200 hover:border-dark-500 hover:text-dark-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Back
            </button>

            <div className="flex items-center gap-3 sm:gap-5">
              {skipAvailable && (
                <button onClick={next} className="text-xs font-semibold text-dark-300 hover:text-dark-100 transition-colors hidden sm:inline">
                  Skip for now
                </button>
              )}
              <button
                onClick={step === 9 ? () => setStep(10) : next}
                disabled={!canProceed}
                className="px-4 sm:px-6 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {NextLabel}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

/* ─── Profile review (step 11) ──────────────────────────── */
function ProfileReview({ form, user, photoDisplay, onSubmit, submitting, onEdit }) {
  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-8">
      <div className="space-y-4">
        <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-dark-800 shrink-0">
              {photoDisplay ? <img src={photoDisplay} alt="" className="w-full h-full object-cover" /> : <UserAvatar user={user} size={80} />}
              <button onClick={() => onEdit(10)} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-dark-900">
                <Pencil className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-dark-100">{user?.name || 'Your Name'}</div>
              <div className="text-2xs text-dark-500 mt-0.5">{form.city || 'Your City'}, {form.country || 'Country'}</div>
              <div className="text-2xs text-dark-500 mt-0.5">9:10 PM local time</div>
            </div>
            <button onClick={() => onEdit(10)} className="w-7 h-7 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100">
              <Pencil className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-dark-800 flex items-start gap-3">
            <div className="text-sm font-semibold text-dark-100 flex-1">{form.title || 'Your professional title'}</div>
            <button onClick={() => onEdit(4)} className="w-7 h-7 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100">
              <Pencil className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <p className="text-xs text-dark-300 leading-relaxed flex-1 whitespace-pre-wrap">{form.bio || 'No bio yet.'}</p>
            <button onClick={() => onEdit(8)} className="w-7 h-7 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 shrink-0">
              <Pencil className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-dark-800 flex items-end justify-between">
            <div>
              <div className="text-xl font-bold text-dark-100">${form.hourlyRate || '0.00'}</div>
              <div className="text-2xs text-dark-500">Hourly rate</div>
            </div>
            <button onClick={() => onEdit(9)} className="w-7 h-7 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100">
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        </div>

        <SectionCard title="Skills" onEdit={() => onEdit(3)}>
          <div className="text-2xs text-dark-500 mb-2">Self-reported</div>
          <div className="flex flex-wrap gap-1.5">
            {form.skills.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-dark-800 border border-dark-700 text-2xs font-medium text-dark-200">{s}</span>
            ))}
            {form.skills.length === 0 && <span className="text-xs text-dark-500">No skills added</span>}
          </div>
        </SectionCard>

        <SectionCard title="Work history" plus onEdit={() => onEdit(5)}>
          {form.experience.length === 0
            ? <div className="text-xs text-dark-500">No items to display.</div>
            : form.experience.map((e, i) => (
                <div key={i} className="text-xs text-dark-300">
                  <div className="font-semibold text-dark-100">{e.title}</div>
                  <div className="text-dark-500">{e.company} · {e.years}</div>
                </div>
              ))}
        </SectionCard>

        <SectionCard title="Education" plus onEdit={() => onEdit(6)}>
          {form.education.length === 0
            ? <div className="text-xs text-dark-500">No items to display.</div>
            : form.education.map((e, i) => (
                <div key={i} className="text-xs text-dark-300">
                  <div className="font-semibold text-dark-100">{e.school}</div>
                  <div className="text-dark-500">{e.degree} · {e.years}</div>
                </div>
              ))}
        </SectionCard>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
          <h3 className="text-sm font-bold text-dark-100 mb-3 flex items-center justify-between">
            Languages
            <button onClick={() => onEdit(7)} className="w-6 h-6 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100">
              <Pencil className="w-3 h-3" />
            </button>
          </h3>
          <ul className="space-y-1.5 text-xs">
            {form.languages.map((l, i) => (
              <li key={i}>
                <span className="font-semibold text-dark-100">{l.language}:</span> <span className="text-dark-400">{l.level || '—'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-dark-100 border border-dark-100 p-5">
          <p className="text-xs text-dark-700 leading-relaxed mb-4">
            Make any edits you want, then submit your profile. You can make more changes after it's live.
          </p>
          <button onClick={onSubmit} disabled={submitting}
            className="w-full px-5 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 transition-colors">
            {submitting ? 'Submitting…' : 'Submit profile'}
          </button>
        </div>
      </aside>
    </div>
  );
}

function SectionCard({ title, plus, onEdit, children }) {
  return (
    <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
      <h3 className="text-sm font-bold text-dark-100 mb-3 flex items-center justify-between">
        {title}
        <button onClick={onEdit} className="w-6 h-6 rounded-full border border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100">
          {plus ? <Plus className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
        </button>
      </h3>
      {children}
    </div>
  );
}

/* ─── Step 12 — Connects upsell ─────────────────────────── */
function ConnectsScreen({ onContinue }) {
  return (
    <div className="max-w-3xl mx-auto pt-8">
      <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-1 leading-tight">
        Your profile is ready!
      </h1>
      <h2 className="text-3xl md:text-4xl font-bold font-display text-dark-100 mb-5 leading-tight">
        Now, you'll need Connects to bid on jobs.
      </h2>
      <p className="text-xs text-dark-400 mb-10">
        Connects are virtual tokens you'll use to pursue jobs and start earning.{' '}
        <a href="#" className="text-primary-400 underline">Learn more</a>
      </p>

      {/* Freelancer Plus banner */}
      <div className="rounded-2xl bg-black border border-dark-700 overflow-hidden grid md:grid-cols-[1.4fr_1fr] mb-6">
        <div className="p-8 md:p-10 text-white">
          <div className="text-2xs font-black tracking-widest uppercase text-dark-300 mb-3">Freelancer Plus</div>
          <div className="text-2xl md:text-3xl font-bold font-display mb-5">
            <span className="text-white">$9.99</span>{' '}
            <span className="line-through text-dark-500 text-base">$19.99</span>{' '}
            <span className="text-base font-semibold">for your first month</span>
          </div>
          <ul className="space-y-2 text-sm text-dark-200 mb-7">
            {[
              '100 Connects monthly (plus an extra 50 Connects today)',
              'Real-time, customizable job alerts',
              '0% service fee when you bring new clients',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
          <button onClick={onContinue} className="px-6 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400 transition-colors">
            Upgrade
          </button>
          <p className="text-2xs text-dark-500 mt-4">Limited time offer. $19.99 after your first month. Cancel anytime.</p>
        </div>
        <div className="bg-primary-600 p-8 md:p-10 flex flex-col justify-center text-white">
          <p className="text-base md:text-lg font-bold font-display leading-tight mb-5">
            With Freelancer Plus, members win 40% more contracts on average.
          </p>
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <img key={i} src={`https://ui-avatars.com/api/?name=U${i}&background=fff&color=4361ff&size=64`} className="w-9 h-9 rounded-full ring-2 ring-primary-600" alt="" />
            ))}
          </div>
        </div>
      </div>

      {/* Starter pack */}
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-7">
        <h3 className="text-base font-bold text-dark-100 mb-2">Or get a 100 Connects starter pack</h3>
        <p className="text-xs text-dark-400 mb-5">Use to bid on jobs, or signal you're open to work and boost your visibility with ads.</p>
        <div className="flex items-center gap-4">
          <button onClick={onContinue} className="px-6 py-2 rounded-full border border-primary-500/40 text-primary-300 text-xs font-bold hover:bg-primary-500/10 transition-all">
            Buy for $15
          </button>
          <span className="text-2xs text-dark-400">⏱ Get 50 Connects free for a limited time</span>
        </div>
      </div>

      <div className="text-xs text-dark-400 mt-6">
        Subscribe or buy later so you can bid on jobs.{' '}
        <button onClick={onContinue} className="text-primary-400 hover:text-primary-300 underline">
          Browse without bidding →
        </button>
      </div>
    </div>
  );
}
