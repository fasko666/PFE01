import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Eye, EyeOff, CheckCircle2, XCircle,
  Mail, Lock, User, ShieldCheck, ArrowLeft, RefreshCw,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import CountrySelect from '../../components/ui/CountrySelect';
import { api } from '../../api';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');

const inputCls = (err) =>
  `input ${err
    ? 'border-red-500/60 bg-red-500/5 focus:border-red-400 focus:ring-red-500/20'
    : ''
  }`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PW_RULES = [
  { test: (p) => p.length >= 8,    label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p),  label: 'One uppercase letter' },
  { test: (p) => /[0-9]/.test(p),  label: 'One number' },
];

function pwStrength(pw) {
  const passed = PW_RULES.filter((r) => r.test(pw)).length;
  return passed; // 0-3
}

const STRENGTH_CONFIG = [
  { label: 'Weak',   bar: 'bg-red-400',    text: 'text-red-500' },
  { label: 'Fair',   bar: 'bg-orange-400', text: 'text-orange-500' },
  { label: 'Good',   bar: 'bg-yellow-400', text: 'text-yellow-600' },
  { label: 'Strong', bar: 'bg-green-500',  text: 'text-green-600' },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

const ROLES = [
  {
    value: 'client',
    title: "I'm a client",
    sub: 'Post jobs and hire freelancers',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: 'freelancer',
    title: "I'm a freelancer",
    sub: 'Find work and grow your career',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function Register() {
  const navigate        = useNavigate();
  const { register }    = useAuthStore();
  const fileRef         = useRef(null);

  const [step,          setStep]         = useState(1); // 1=role, 2=form, 3=verify-email
  const [loading,       setLoading]      = useState(false);
  const [resending,     setResending]    = useState(false);
  const [showPw,        setShowPw]       = useState(false);
  const [showConfirm,   setShowConfirm]  = useState(false);
  const [avatarFile,    setAvatarFile]   = useState(null);
  const [avatarPreview, setAvatarPreview]= useState(null);
  const [errors,        setErrors]       = useState({});
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [form, setForm] = useState({
    role: '', name: '', email: '', password: '', password_confirmation: '', country: '',
  });

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const emailValid  = EMAIL_RE.test(form.email);
  const emailTouched = form.email.length > 0;
  const strength    = pwStrength(form.password);
  const strCfg      = form.password ? STRENGTH_CONFIG[strength - 1] || STRENGTH_CONFIG[0] : null;

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name    = 'Full name is required';
    if (!form.email)        e.email   = 'Email is required';
    else if (!emailValid)   e.email   = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.password_confirmation) e.password_confirmation = "Passwords don't match";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let payload = { ...form };
      if (avatarFile) {
        const base64 = await new Promise((res) => {
          const reader = new FileReader();
          reader.onload = (ev) => res(ev.target.result);
          reader.readAsDataURL(avatarFile);
        });
        payload.avatar = base64;
      }
      await register(payload);
      setRegisteredEmail(form.email);
      setStep(3);
    } catch (err) {
      const serverErrors = err.errors || err.response?.data?.errors || {};
      if (Object.keys(serverErrors).length) {
        setErrors(
          Object.fromEntries(
            Object.entries(serverErrors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
          )
        );
      } else {
        toast.error(err.message || err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.auth.resendVerification?.();
      toast.success('Verification email resent!');
    } catch {
      toast.error('Could not resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const slideProps = (dir = 1) => ({
    initial: { opacity: 0, x: dir * 24 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -dir * 24 },
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  });

  return (
    <div className="space-y-0">
      <AnimatePresence mode="wait">

        {/* ───── Step 1: Role ───── */}
        {step === 1 && (
          <motion.div key="role" {...slideProps(1)} className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">Join PANDA</h1>
              <p className="text-dark-500 text-sm mt-1">Choose how you want to get started</p>
            </div>

            {/* Google sign-up */}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => { window.location.href = `${API_BASE}/auth/google`; }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-dark-700 rounded-xl bg-dark-950 hover:bg-dark-800 hover:border-dark-500 transition-all text-sm font-medium text-dark-200 shadow-sm"
            >
              <GoogleIcon />
              Sign up with Google
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-dark-700/60" />
              <span className="text-xs text-dark-500 font-medium">or choose your role</span>
              <div className="flex-1 h-px bg-dark-700/60" />
            </div>

            <div className="space-y-3">
              {ROLES.map((r) => (
                <motion.button
                  key={r.value}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { update('role', r.value); setStep(2); }}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl border border-dark-700 bg-dark-900 hover:border-primary-500/40 hover:bg-dark-800 text-left transition-all group"
                >
                  <div className="shrink-0 p-2.5 rounded-xl bg-dark-800 group-hover:bg-primary-500/15 text-dark-400 group-hover:text-primary-400 transition-all border border-dark-700 group-hover:border-primary-500/30">
                    {r.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-dark-100 text-sm">{r.title}</p>
                    <p className="text-xs text-dark-500 mt-0.5">{r.sub}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-dark-600 group-hover:border-primary-400 shrink-0 transition-all flex items-center justify-center" />
                </motion.button>
              ))}
            </div>

            <p className="text-center text-sm text-dark-500">
              Already have an account?{' '}
              <Link to="/login" className="text-dark-200 font-bold hover:text-dark-100 transition-colors">Log in</Link>
            </p>
          </motion.div>
        )}

        {/* ───── Step 2: Form ───── */}
        {step === 2 && (
          <motion.div key="form" {...slideProps(1)} className="space-y-5">
            {/* Back + title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-8 h-8 rounded-lg border border-dark-700 bg-dark-950 hover:bg-dark-800 flex items-center justify-center text-dark-400 hover:text-dark-100 transition-all shrink-0"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              </button>
              <div>
                <h1 className="text-xl font-bold font-display text-dark-100">
                  {form.role === 'client' ? 'Hire great talent' : 'Start earning today'}
                </h1>
                <p className="text-dark-500 text-xs mt-0.5">
                  Create your PANDA account as{' '}
                  <span className="font-semibold text-dark-300 capitalize">{form.role}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Avatar */}
              <div className="flex flex-col items-center py-1">
                <div
                  className="relative w-20 h-20 rounded-2xl cursor-pointer overflow-hidden ring-2 ring-dark-700 hover:ring-dark-100 transition-all group"
                  onClick={() => fileRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-dark-800 flex flex-col items-center justify-center gap-1">
                      <User className="w-6 h-6 text-dark-400" strokeWidth={1.5} />
                      <span className="text-[10px] text-dark-400 font-medium">Photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <p className="text-xs text-dark-400 mt-1.5">
                  {avatarPreview ? 'Click to change · Optional' : 'Add profile photo · Optional'}
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-1.5">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" strokeWidth={1.75} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className={`${inputCls(errors.name)} pl-10`}
                    placeholder="Alex Johnson"
                    autoComplete="name"
                    autoFocus
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email with live validation */}
              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" strokeWidth={1.75} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={`${inputCls(errors.email)} pl-10 pr-10`}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {emailTouched && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValid
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" strokeWidth={2} />
                        : <XCircle className="w-4 h-4 text-red-400" strokeWidth={2} />
                      }
                    </span>
                  )}
                </div>
                {errors.email
                  ? <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  : emailTouched && !emailValid
                  ? <p className="text-xs text-red-400 mt-1">Enter a valid email (e.g. you@gmail.com)</p>
                  : emailTouched && emailValid
                  ? <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" strokeWidth={2.5} /> Valid email address</p>
                  : null
                }
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-1.5">Country</label>
                <CountrySelect
                  value={form.country}
                  onChange={(v) => update('country', v)}
                  error={!!errors.country}
                />
                {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" strokeWidth={1.75} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className={`${inputCls(errors.password)} pl-10 pr-11`}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300 transition-colors p-0.5">
                    {showPw ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all ${strength >= i ? (strCfg?.bar || 'bg-dark-400') : 'bg-dark-700'}`} />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${strCfg?.text || 'text-dark-400'}`}>{strCfg?.label}</span>
                      <div className="flex gap-2">
                        {PW_RULES.map((r) => (
                          <span key={r.label} className={`text-[10px] flex items-center gap-0.5 ${r.test(form.password) ? 'text-green-600' : 'text-dark-400'}`}>
                            {r.test(form.password) ? '✓' : '·'} {r.label.split(' ')[1] || r.label.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-dark-300 mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" strokeWidth={1.75} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.password_confirmation}
                    onChange={(e) => update('password_confirmation', e.target.value)}
                    className={`${inputCls(errors.password_confirmation)} pl-10 pr-11`}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300 transition-colors p-0.5">
                    {showConfirm ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>
                )}
                {!errors.password_confirmation && form.password_confirmation && form.password === form.password_confirmation && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} /> Passwords match
                  </p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account…
                  </>
                ) : 'Create my account'}
              </motion.button>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-xs text-dark-400">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" strokeWidth={1.75} />
              <span>Your data is encrypted and secure</span>
            </div>

            <p className="text-center text-xs text-dark-400">
              By creating an account you agree to our{' '}
              <span className="text-dark-300 font-medium cursor-pointer hover:underline">Terms of Service</span>{' '}
              and{' '}
              <span className="text-dark-300 font-medium cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </motion.div>
        )}

        {/* ───── Step 3: Verify Email ───── */}
        {step === 3 && (
          <motion.div key="verify" {...slideProps(1)} className="space-y-6 text-center">
            {/* Animated envelope */}
            <div className="flex justify-center">
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25"
                >
                  <Mail className="w-10 h-10 text-white" strokeWidth={1.5} />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-white"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-dark-100">Check your inbox</h1>
              <p className="text-dark-500 text-sm mt-2 leading-relaxed">
                We sent a verification link to<br />
                <span className="font-semibold text-dark-100">{registeredEmail}</span>
              </p>
            </div>

            <div className="bg-dark-900 border border-dark-700 rounded-2xl p-4 text-left space-y-2.5">
              {[
                'Open the email we just sent you',
                'Click the "Verify my account" link',
                'Start using PANDA',
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/15 border border-primary-500/25 text-primary-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-dark-300">{s}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-dark-400">
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-dark-300 font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
              >
                {resending && <RefreshCw className="w-3 h-3 animate-spin" strokeWidth={2.5} />}
                resend the email
              </button>
            </p>

            {/* Continue to dashboard (for dev / grace period) */}
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full py-3 rounded-xl border border-dark-700 text-sm font-medium text-dark-300 hover:bg-dark-800 hover:border-dark-600 transition-all"
            >
              Continue to dashboard →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
