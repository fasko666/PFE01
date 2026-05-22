import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { api } from '../../api';
import toast from 'react-hot-toast';
import PandaLogo from '../../components/ui/PandaLogo';

const GOALS = [
  { value: 'first_client', label: 'Land my first client' },
  { value: 'long_term', label: 'Build a long-term freelance career' },
  { value: 'extra_income', label: 'Earn additional income' },
  { value: 'agency', label: 'Grow my freelance agency' },
];

const EXPERIENCE = [
  { value: 'new', label: "I'm new to freelancing" },
  { value: 'some', label: "I've freelanced occasionally" },
  { value: 'full_time', label: "I freelance full-time" },
];

const WORK_PREF = [
  { value: 'open', label: 'Open to any opportunity' },
  { value: 'actively', label: 'Actively seeking projects' },
  { value: 'selective', label: 'Only when I find the right fit' },
];

const INTRO_METHOD = [
  {
    value: 'manual',
    label: 'Fill out manually',
    desc: 'Enter your details step by step',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    value: 'linkedin',
    label: 'Import from LinkedIn',
    desc: 'Coming soon',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
    disabled: true,
  },
];

const SKILLS_LIST = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Django', 'Laravel', 'PHP',
  'JavaScript', 'TypeScript', 'Java', 'Go', 'Swift', 'Kotlin',
  'UI/UX Design', 'Figma', 'Photoshop', 'Branding',
  'Copywriting', 'SEO', 'Content Writing', 'Video Editing', 'Motion Graphics',
  'Data Science', 'Machine Learning', 'AI/ML', 'TensorFlow',
  'DevOps', 'Docker', 'Kubernetes', 'AWS', 'Azure',
];

const CLIENT_CATEGORIES = [
  { id: 1, icon: '💻', label: 'Development & IT' },
  { id: 2, icon: '🎨', label: 'Design & Creative' },
  { id: 3, icon: '🤖', label: 'AI & Machine Learning' },
  { id: 4, icon: '✍️', label: 'Writing & Translation' },
  { id: 5, icon: '📈', label: 'Sales & Marketing' },
];

function QuestionStep({ title, subtitle, options, selected, onSelect, disabled = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-2xl font-bold font-display text-white">{title}</h2>
        {subtitle && <p className="text-dark-400 text-sm mt-1.5">{subtitle}</p>}
      </div>
      <div className="space-y-2.5">
        {options.map((opt) => {
          const isDisabled = disabled.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => !isDisabled && onSelect(opt.value)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                isDisabled
                  ? 'border-dark-800 bg-dark-900/50 opacity-50 cursor-not-allowed'
                  : selected === opt.value
                  ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                  : 'border-dark-700 bg-dark-800/30 hover:border-dark-600 hover:bg-dark-800/60'
              }`}
            >
              {opt.icon && (
                <div className={`shrink-0 ${selected === opt.value ? 'text-primary-400' : 'text-dark-400'}`}>
                  {opt.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">{opt.label}</div>
                {opt.desc && <div className="text-xs text-dark-500 mt-0.5">{opt.desc}</div>}
              </div>
              <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                selected === opt.value ? 'border-primary-500 bg-primary-500' : 'border-dark-600'
              }`}>
                {selected === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [answers, setAnswers] = useState({
    goal: '',
    experience: '',
    work_pref: '',
    intro_method: '',
    category_id: '',
  });

  const [profile, setProfile] = useState({
    title: '',
    bio: '',
    hourly_rate: '',
    country: '',
    skills: [],
  });

  const isFreelancer = user?.role === 'freelancer';

  const freelancerSteps = ['goal', 'experience', 'work_pref', 'intro', 'profile', 'skills', 'rate'];
  const clientSteps = ['category'];
  const steps = isFreelancer ? freelancerSteps : clientSteps;
  const totalSteps = steps.length;
  const currentStepKey = steps[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const toggleSkill = (skill) =>
    setProfile((p) => ({
      ...p,
      skills: p.skills.includes(skill)
        ? p.skills.filter((s) => s !== skill)
        : p.skills.length < 10 ? [...p.skills, skill] : p.skills,
    }));

  const finish = async () => {
    setLoading(true);
    try {
      if (isFreelancer) {
        await api.freelancers.updateProfile({
          title: profile.title,
          bio: profile.bio,
          hourly_rate: profile.hourly_rate,
          country: profile.country,
        });
        if (profile.skills.length > 0) {
          await api.freelancers.addSkills({ skills: profile.skills });
        }
      }
      toast.success('Profile ready! Welcome to PANDA.');
      navigate(isFreelancer ? '/freelancer/dashboard' : '/client/dashboard');
    } catch {
      toast.error('Failed to save — you can update your profile later');
      navigate(isFreelancer ? '/freelancer/dashboard' : '/client/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else finish();
  };

  const canContinue = () => {
    switch (currentStepKey) {
      case 'goal': return !!answers.goal;
      case 'experience': return !!answers.experience;
      case 'work_pref': return !!answers.work_pref;
      case 'intro': return !!answers.intro_method;
      case 'profile': return !!profile.title.trim();
      case 'skills': return true;
      case 'rate': return true;
      case 'category': return !!answers.category_id;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-dark-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center ring-1 ring-white/10">
            <PandaLogo className="w-5 h-5" invert />
          </div>
          <span className="font-black font-display text-white text-sm tracking-widest uppercase">PANDA</span>
        </div>
        <button
          onClick={finish}
          disabled={loading}
          className="text-sm text-dark-400 hover:text-white transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-dark-800">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* Freelancer: Goal */}
            {currentStepKey === 'goal' && (
              <QuestionStep
                key="goal"
                title="What's your biggest goal?"
                subtitle="We'll personalize your experience based on your answer."
                options={GOALS}
                selected={answers.goal}
                onSelect={(v) => setAnswers((a) => ({ ...a, goal: v }))}
              />
            )}

            {/* Freelancer: Experience */}
            {currentStepKey === 'experience' && (
              <QuestionStep
                key="experience"
                title="Have you freelanced before?"
                options={EXPERIENCE}
                selected={answers.experience}
                onSelect={(v) => setAnswers((a) => ({ ...a, experience: v }))}
              />
            )}

            {/* Freelancer: Work preference */}
            {currentStepKey === 'work_pref' && (
              <QuestionStep
                key="work_pref"
                title="How would you like to work?"
                options={WORK_PREF}
                selected={answers.work_pref}
                onSelect={(v) => setAnswers((a) => ({ ...a, work_pref: v }))}
              />
            )}

            {/* Freelancer: How to tell about yourself */}
            {currentStepKey === 'intro' && (
              <QuestionStep
                key="intro"
                title="How would you like to tell us about yourself?"
                subtitle="Choose the quickest option for you."
                options={INTRO_METHOD}
                selected={answers.intro_method}
                onSelect={(v) => setAnswers((a) => ({ ...a, intro_method: v }))}
                disabled={['linkedin']}
              />
            )}

            {/* Freelancer: Profile details */}
            {currentStepKey === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold font-display text-white">Build your profile</h2>
                  <p className="text-dark-400 text-sm mt-1.5">This is how clients will find and evaluate you.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="input-label">Professional title *</label>
                    <input
                      type="text"
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="input"
                      placeholder="e.g. Full Stack Developer | React & Laravel Expert"
                    />
                  </div>
                  <div>
                    <label className="input-label">Professional bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="input h-28 resize-none"
                      placeholder="Describe your experience, expertise, and what makes you unique..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Country</label>
                      <input
                        type="text"
                        value={profile.country}
                        onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                        className="input"
                        placeholder="Morocco"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Freelancer: Skills */}
            {currentStepKey === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold font-display text-white">What are your top skills?</h2>
                  <p className="text-dark-400 text-sm mt-1.5">Select up to 10 skills that define your expertise.</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-500">Selected: {profile.skills.length}/10</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto scrollbar-none">
                  {SKILLS_LIST.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        profile.skills.includes(skill)
                          ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                          : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600 hover:text-dark-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Freelancer: Rate */}
            {currentStepKey === 'rate' && (
              <motion.div
                key="rate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold font-display text-white">Now, let's set your hourly rate</h2>
                  <p className="text-dark-400 text-sm mt-1.5">Clients will see this rate on your profile. You can change it anytime.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="input-label">Hourly rate (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
                      <input
                        type="number"
                        value={profile.hourly_rate}
                        onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                        className="input pl-8"
                        placeholder="50"
                        min="5"
                        max="500"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 text-xs">/hr</span>
                    </div>
                  </div>
                  {profile.hourly_rate > 0 && (
                    <div className="p-4 rounded-2xl bg-dark-800/50 border border-dark-700 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Your rate</span>
                        <span className="text-white font-medium">${profile.hourly_rate}/hr</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Service fee (10%)</span>
                        <span className="text-red-400">-${(profile.hourly_rate * 0.1).toFixed(2)}/hr</span>
                      </div>
                      <div className="h-px bg-dark-700" />
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-dark-300">You receive</span>
                        <span className="text-green-400">${(profile.hourly_rate * 0.9).toFixed(2)}/hr</span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-dark-600">Platform fee is 10% — lower than most competitors. You can update your rate from your profile settings anytime.</p>
                </div>
              </motion.div>
            )}

            {/* Client: Category */}
            {currentStepKey === 'category' && (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold font-display text-white">What do you primarily need done?</h2>
                  <p className="text-dark-400 text-sm mt-1.5">We'll surface the best talent for your needs.</p>
                </div>
                <div className="space-y-2.5">
                  {CLIENT_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setAnswers((a) => ({ ...a, category_id: c.id }))}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                        answers.category_id === c.id
                          ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                          : 'border-dark-700 bg-dark-800/30 hover:border-dark-600 hover:bg-dark-800/60'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{c.icon}</span>
                      <span className="font-semibold text-white flex-1">{c.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                        answers.category_id === c.id ? 'border-primary-500 bg-primary-500' : 'border-dark-600'
                      }`}>
                        {answers.category_id === c.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn btn-ghost flex-1"
              >
                Back
              </button>
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={next}
              disabled={!canContinue() || loading}
              className="btn btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Finishing...
                </span>
              ) : step < totalSteps - 1 ? 'Continue' : 'Get Started'}
            </motion.button>
          </div>

          <p className="text-center text-xs text-dark-600 mt-4">
            Step {step + 1} of {totalSteps}
          </p>
        </div>
      </div>
    </div>
  );
}
