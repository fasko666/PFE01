import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Settings, Tag, Eye, Check, DollarSign,
  Clock, MapPin, Wifi, X, Rocket, ChevronLeft,
} from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

const STEPS = [
  { label: 'Basics',        icon: FileText },
  { label: 'Details',       icon: Settings },
  { label: 'Skills & Budget', icon: Tag },
  { label: 'Review',        icon: Eye },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function PostJob() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    job_type: 'fixed',
    experience_level: 'intermediate',
    budget_min: '',
    budget_max: '',
    project_duration: '',
    location: '',
    is_remote: true,
    skills_required: [],
  });

  useEffect(() => {
    api.jobs.categories().then((r) => setCategories(r.data.data || []));
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const s = skillInput.trim().replace(',', '');
      if (s && !form.skills_required.includes(s) && form.skills_required.length < 15) {
        update('skills_required', [...form.skills_required, s]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (s) => update('skills_required', form.skills_required.filter((x) => x !== s));

  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim()) return 'Job title is required';
      if (!form.description.trim() || form.description.length < 50) return 'Description must be at least 50 characters';
    }
    if (step === 1 && !form.category_id) return 'Please select a category';
    if (step === 2) {
      if (!form.budget_min || !form.budget_max) return 'Budget range is required';
      if (Number(form.budget_min) > Number(form.budget_max)) return 'Min budget must be less than max';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) return toast.error(err);
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.jobs.create(form);
      toast.success('Job posted successfully!');
      navigate(`/jobs/${res.data.data.id}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) toast.error(Object.values(errors)[0]?.[0]);
      else toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">Post a Job</h1>
        <p className="text-sm text-dark-500 mt-1">Reach 500K+ skilled freelancers on PANDA</p>
      </motion.div>

      {/* Progress stepper */}
      <motion.div {...fadeUp(0.05)} className="flex items-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > i;
          const active = step === i;
          return (
            <div key={s.label} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  done ? 'bg-primary-500 text-white' :
                  active ? 'bg-primary-500/20 text-primary-400 ring-1 ring-primary-500/50' :
                  'bg-dark-800 text-dark-600'
                }`}>
                  {done
                    ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    : <Icon className="w-3.5 h-3.5" strokeWidth={active ? 2 : 1.5} />
                  }
                </div>
                <span className={`text-xs hidden sm:block whitespace-nowrap ${active ? 'text-white font-medium' : done ? 'text-dark-400' : 'text-dark-600'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${step > i ? 'bg-primary-500/60' : 'bg-dark-800'}`} />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Form card */}
      <motion.div {...fadeUp(0.1)} className="card p-6 space-y-5">
        {/* Step 0: Basics */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
            <h2 className="font-semibold text-dark-100 text-base">Job Basics</h2>
            <div>
              <label className="input-label">Job Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                className="input"
                placeholder="e.g. Build a React Dashboard with REST API integration"
                maxLength={100}
              />
              <p className="text-xs text-dark-600 mt-1">{form.title.length}/100 characters</p>
            </div>
            <div>
              <label className="input-label">Job Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="input h-44 resize-none"
                placeholder="Describe the project scope, goals, and specific requirements. Be detailed to attract qualified candidates."
              />
              <p className={`text-xs mt-1 ${form.description.length < 50 ? 'text-dark-600' : 'text-green-500'}`}>
                {form.description.length} characters (min 50)
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
            <h2 className="font-semibold text-dark-100 text-base">Project Details</h2>
            <div>
              <label className="input-label">Category *</label>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => update('category_id', c.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      form.category_id == c.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 hover:border-dark-600 bg-dark-800/50'
                    }`}
                  >
                    <span className="text-sm font-medium text-white flex-1">{c.name}</span>
                    {form.category_id == c.id && <Check className="w-4 h-4 text-primary-400 shrink-0" strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Experience Level</label>
                <select value={form.experience_level} onChange={(e) => update('experience_level', e.target.value)} className="input">
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="input-label">Duration</label>
                <select value={form.project_duration} onChange={(e) => update('project_duration', e.target.value)} className="input">
                  <option value="">Not sure</option>
                  <option value="less_than_week">Less than a week</option>
                  <option value="1_3_months">1â€“3 months</option>
                  <option value="3_6_months">3â€“6 months</option>
                  <option value="more_than_6_months">6+ months</option>
                </select>
              </div>
            </div>
            <div>
              <label className="input-label flex items-center gap-1.5">
                <MapPin className="w-3 h-3" strokeWidth={2} />
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className="input"
                placeholder="e.g. Remote, New York, Parisâ€¦"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => update('is_remote', !form.is_remote)}
                className={`relative w-10 h-6 rounded-full transition-all ${form.is_remote ? 'bg-primary-500' : 'bg-dark-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_remote ? 'left-5' : 'left-1'}`} />
              </button>
              <span className="text-sm text-dark-300 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-dark-500" strokeWidth={2} />
                Remote work allowed
              </span>
            </div>
          </motion.div>
        )}

        {/* Step 2: Skills & Budget */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
            <h2 className="font-semibold text-dark-100 text-base">Skills & Budget</h2>
            <div>
              <label className="input-label">Required Skills</label>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                className="input"
                placeholder="Type a skill and press Enter (e.g. React, Node.jsâ€¦)"
              />
              <p className="text-xs text-dark-600 mt-1">Press Enter or comma to add Â· {form.skills_required.length}/15 skills</p>
              {form.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.skills_required.map((s) => (
                    <span key={s} className="badge badge-primary flex items-center gap-1">
                      {s}
                      <button onClick={() => removeSkill(s)} className="hover:text-white ml-0.5">
                        <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="input-label">Job Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 'fixed',  icon: DollarSign, l: 'Fixed Price',  d: 'One-time payment for the full project' },
                  { v: 'hourly', icon: Clock,      l: 'Hourly Rate',  d: 'Pay by the hour as work is done' },
                ].map((t) => {
                  const TIcon = t.icon;
                  return (
                    <button
                      key={t.v}
                      onClick={() => update('job_type', t.v)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        form.job_type === t.v ? 'border-primary-500 bg-primary-500/10' : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
                      }`}
                    >
                      <TIcon className={`w-4 h-4 mb-2 ${form.job_type === t.v ? 'text-primary-400' : 'text-dark-500'}`} strokeWidth={2} />
                      <div className="text-sm font-medium text-white">{t.l}</div>
                      <div className="text-xs text-dark-500 mt-0.5">{t.d}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="input-label">Budget Range (USD) *</label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">$</span>
                  <input
                    type="number"
                    value={form.budget_min}
                    onChange={(e) => update('budget_min', e.target.value)}
                    className="input pl-7"
                    placeholder="Min"
                    min="5"
                  />
                </div>
                <span className="text-dark-600 font-bold">â€“</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">$</span>
                  <input
                    type="number"
                    value={form.budget_max}
                    onChange={(e) => update('budget_max', e.target.value)}
                    className="input pl-7"
                    placeholder="Max"
                    min="5"
                  />
                </div>
                {form.job_type === 'hourly' && <span className="text-dark-500 text-sm whitespace-nowrap">/hr</span>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
            <h2 className="font-semibold text-dark-100 text-base">Review & Post</h2>
            <div className="space-y-4 p-4 rounded-xl bg-dark-800/50 border border-dark-700">
              <div>
                <span className="text-xs text-dark-500 font-medium uppercase tracking-wide">Title</span>
                <p className="text-sm font-semibold text-white mt-1">{form.title}</p>
              </div>
              <div>
                <span className="text-xs text-dark-500 font-medium uppercase tracking-wide">Description</span>
                <p className="text-sm text-dark-300 mt-1 line-clamp-3">{form.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: 'Budget', v: `$${form.budget_min}â€“$${form.budget_max}${form.job_type === 'hourly' ? '/hr' : ''}` },
                  { l: 'Type', v: form.job_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price' },
                  { l: 'Experience', v: form.experience_level },
                  { l: 'Remote', v: form.is_remote ? 'Yes' : 'No' },
                ].map((f) => (
                  <div key={f.l}>
                    <span className="text-xs text-dark-500 font-medium uppercase tracking-wide">{f.l}</span>
                    <p className="text-sm text-white mt-0.5 capitalize">{f.v}</p>
                  </div>
                ))}
              </div>
              {form.skills_required.length > 0 && (
                <div>
                  <span className="text-xs text-dark-500 font-medium uppercase tracking-wide">Skills</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {form.skills_required.map((s) => <span key={s} className="badge badge-primary text-2xs">{s}</span>)}
                  </div>
                </div>
              )}
            </div>
            <div className="p-3.5 rounded-xl bg-primary-500/5 border border-primary-500/20">
              <p className="text-xs text-dark-400 leading-relaxed">
                By posting this job, you agree to our <span className="text-primary-400 cursor-pointer hover:underline">Terms of Service</span>.
                Your job will be visible to 500K+ freelancers immediately after posting.
              </p>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2 border-t border-dark-800">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn btn-ghost gap-1.5">
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <motion.button whileTap={{ scale: 0.98 }} onClick={next} className="btn btn-primary flex-1">
              Continue
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              disabled={loading}
              className="btn btn-primary flex-1 gap-2"
            >
              <Rocket className="w-3.5 h-3.5" strokeWidth={2} />
              {loading ? 'Postingâ€¦' : 'Post Job'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

