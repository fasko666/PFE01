import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, AlertTriangle, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 60_000;
const EMAIL_RE     = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Input class — fully theme-aware via dark-* tokens */
const fieldCls = (err) =>
  `input ${err
    ? 'border-red-500/60 bg-red-500/5 focus:border-red-400 focus:ring-red-500/20'
    : ''
  }`;

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

export default function Login() {
  const navigate               = useNavigate();
  const [params]               = useSearchParams();
  const { login }              = useAuthStore();
  const { fetch: fetchNotifs } = useNotificationStore();

  const [step,        setStep]        = useState('email');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [attempts,    setAttempts]    = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown,   setCountdown]   = useState(0);

  const lockedOut = lockedUntil && Date.now() < lockedUntil;

  useEffect(() => {
    if (!lockedOut) return;
    const id = setInterval(() => {
      const left = Math.ceil((lockedUntil - Date.now()) / 1000);
      setCountdown(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil, lockedOut]);

  useEffect(() => {
    if (params.get('error') === 'google_auth_failed')
      toast.error('Google sign-in failed. Please try again.');
  }, []);

  const redirect = (u) => {
    if (u.role === 'admin')       navigate('/admin/dashboard');
    else if (u.role === 'client') navigate('/client/dashboard');
    else                          navigate('/freelancer/dashboard');
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!email.trim())          { setError('Please enter your email'); return; }
    if (!EMAIL_RE.test(email))  { setError('Enter a valid email address'); return; }
    setError('');
    setStep('password');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (lockedOut) return;
    if (!password) { setError('Please enter your password'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, password });
      const u = data.user || data;
      await fetchNotifs();
      toast.success(`Welcome back, ${u.name?.split(' ')[0]}!`);
      setAttempts(0);
      redirect(u);
    } catch (err) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setCountdown(60);
      } else {
        const msg = err.response?.data?.message || 'Incorrect password. Please try again.';
        setError(msg);
        if (MAX_ATTEMPTS - next <= 2)
          toast.error(`${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? '' : 's'} left`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => { window.location.href = `${API_BASE}/auth/google`; };

  const demoLogin = async (demoEmail) => {
    setLoading(true);
    try {
      const data = await login({ email: demoEmail, password: 'password' });
      const u = data.user || data;
      await fetchNotifs();
      toast.success(`Logged in as ${u.name}`);
      redirect(u);
    } catch {
      toast.error('Demo login failed — is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const slide = {
    initial:    { opacity: 0, x: 18 },
    animate:    { opacity: 1, x: 0 },
    exit:       { opacity: 0, x: -18 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  };

  return (
    <div className="space-y-6">

      {/* Logo + title */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">
          Log in to PANDA
        </h1>
        <p className="text-sm text-dark-500">Welcome back — let's get you in</p>
      </div>

      {/* Lockout banner */}
      <AnimatePresence>
        {lockedOut && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 p-3.5 bg-red-500/8 border border-red-500/25 rounded-xl text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
            <span>Account locked. Wait <strong className="text-red-300">{countdown}s</strong> before trying again.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline error */}
      <AnimatePresence>
        {error && !lockedOut && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-red-400 text-center -mb-2">
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ── Step 1: Email ── */}
        {step === 'email' && (
          <motion.div key="email" {...slide} className="space-y-3">
            <form onSubmit={handleContinue} className="space-y-3" noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className={fieldCls(!!error)}
                placeholder="Email address"
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full btn btn-primary py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
              >
                Continue
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-dark-700/60" />
              <span className="text-xs text-dark-500 font-medium">or</span>
              <div className="flex-1 h-px bg-dark-700/60" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 hover:bg-dark-700 hover:border-dark-600 transition-all text-sm font-medium text-dark-200"
            >
              <span className="flex items-center justify-center w-5 h-5 shrink-0">
                <GoogleIcon />
              </span>
              Continue with Google
            </button>

            {/* Sign up */}
            <div className="pt-4 border-t border-dark-700/60 text-center space-y-3">
              <p className="text-sm text-dark-500">Don&apos;t have a PANDA account?</p>
              <Link
                to="/register"
                className="block w-full py-3 rounded-xl border border-dark-600 text-dark-300 text-sm font-semibold hover:bg-dark-800 hover:border-dark-500 hover:text-dark-100 transition-all text-center"
              >
                Create account
              </Link>
            </div>

            {/* Demo quick-access */}
            <div className="pt-3 border-t border-dark-700/40">
              <p className="text-xs text-dark-600 text-center mb-2">Quick demo access</p>
              <div className="flex gap-2 justify-center">
                {[
                  { label: 'Freelancer', email: 'youness@freenest.io' },
                  { label: 'Client',     email: 'client1@freenest.io' },
                  { label: 'Admin',      email: 'admin@freenest.io' },
                ].map((d) => (
                  <button
                    key={d.email}
                    onClick={() => demoLogin(d.email)}
                    disabled={loading}
                    className="text-xs px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-dark-400 hover:bg-dark-700 hover:text-dark-200 transition-all disabled:opacity-40"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Password ── */}
        {step === 'password' && (
          <motion.div key="password" {...slide} className="space-y-3">
            {/* Email chip + back */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-dark-800 border border-dark-700">
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); setPassword(''); }}
                className="p-1.5 rounded-lg text-dark-500 hover:text-dark-100 hover:bg-dark-700 transition-colors shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <span className="text-sm text-dark-300 font-medium truncate flex-1">{email}</span>
            </div>

            <form onSubmit={handleSignIn} className="space-y-3" noValidate>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className={`${fieldCls(!!error)} pr-11`}
                  placeholder="Password"
                  autoComplete="current-password"
                  autoFocus
                  disabled={loading || lockedOut}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPw
                    ? <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                    : <Eye    className="w-4 h-4" strokeWidth={1.75} />
                  }
                </button>
              </div>

              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-xs text-dark-500 hover:text-dark-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || lockedOut || !password}
                className="w-full btn btn-primary py-3 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : lockedOut ? `Locked — ${countdown}s` : 'Log in'}
              </button>
            </form>

            <p className="text-center text-xs text-dark-600 pt-1 flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3 text-green-500" strokeWidth={2} />
              256-bit SSL encrypted
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
