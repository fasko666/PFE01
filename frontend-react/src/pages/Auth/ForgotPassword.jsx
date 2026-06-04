import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import http from '../../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await http.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not send reset link');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Wrapper>
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold font-display text-dark-50 mb-2">Check your inbox</h1>
        <p className="text-sm text-dark-400 mb-6">
          If an account exists for <span className="text-dark-200 font-medium">{email}</span>, we've sent a password reset link. Click it within 60 minutes.
        </p>
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <h1 className="text-xl font-bold font-display text-dark-50 mb-1">Forgot password?</h1>
      <p className="text-sm text-dark-400 mb-6">Enter your email and we'll send you a reset link.</p>

      <form onSubmit={submit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-600 outline-none focus:border-primary-500/50"
          />
        </div>
        <button type="submit" disabled={busy || !email}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold disabled:opacity-40 transition-colors">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-dark-500 hover:text-dark-200">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
      </div>
    </Wrapper>
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
