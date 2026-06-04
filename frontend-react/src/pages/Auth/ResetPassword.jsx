import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import http from '../../api/axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors,   setErrors]   = useState({});
  const [busy,     setBusy]     = useState(false);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    if (!token || !email) toast.error('Invalid reset link — please request a new one.');
  }, [token, email]);

  const submit = async (e) => {
    e.preventDefault();
    setErrors({}); setBusy(true);
    try {
      await http.post('/auth/reset-password', {
        token, email, password, password_confirmation: confirm,
      });
      setDone(true);
      setTimeout(() => nav('/login'), 2000);
    } catch (err) {
      setErrors(err?.response?.data?.errors || {});
      toast.error(err?.response?.data?.message || 'Reset failed');
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <Wrapper>
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold font-display text-dark-50 mb-2">Password updated</h1>
        <p className="text-sm text-dark-400">Redirecting to sign in…</p>
      </Wrapper>
    );
  }

  const tooShort = password.length < 8;
  const mismatch = confirm && confirm !== password;

  return (
    <Wrapper>
      <h1 className="text-xl font-bold font-display text-dark-50 mb-1">Set a new password</h1>
      <p className="text-sm text-dark-400 mb-6 truncate">For {email || '(unknown)'} </p>

      <form onSubmit={submit} className="space-y-4 text-left">
        <Field label="New password" error={errors.password?.[0] || (tooShort && password ? 'Min 8 chars, mixed case + a number' : '')}>
          <PwInput value={password} onChange={setPassword} />
        </Field>
        <Field label="Confirm new password" error={mismatch ? "Doesn't match" : ''}>
          <PwInput value={confirm} onChange={setConfirm} />
        </Field>

        <button type="submit" disabled={busy || tooShort || mismatch || !token || !email}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold disabled:opacity-40 transition-colors">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset password'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="text-xs text-dark-500 hover:text-dark-200">Back to sign in</Link>
      </div>
    </Wrapper>
  );
}

function PwInput({ value, onChange }) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
      <input type="password" required value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-dark-700 bg-dark-900 text-sm text-dark-100 outline-none focus:border-primary-500/50" />
    </div>
  );
}
function Field({ label, error, children }) {
  return (
    <label className="block">
      <div className="text-2xs text-dark-500 font-semibold uppercase tracking-wider mb-1">{label}</div>
      {children}
      {error && <p className="text-2xs text-red-400 mt-1">{error}</p>}
    </label>
  );
}
function Wrapper({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto rounded-2xl border border-dark-800 bg-dark-900 p-6 text-center">
      {children}
    </motion.div>
  );
}
