import { useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="space-y-4 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
        <h1 className="text-xl font-bold font-display text-dark-100">Check your inbox</h1>
        <p className="text-sm text-dark-400">
          If an account exists for <span className="text-dark-200 font-medium">{email}</span>, we've sent a password reset link. Click it within 60 minutes.
        </p>
        <Link to="/login" className="inline-flex items-center justify-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 hover:underline transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">Forgot password?</h1>
        <p className="text-sm text-dark-500">Enter your email and we'll send you a reset link.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input pl-10"
          />
        </div>
        <button type="submit" disabled={busy || !email}
          className="w-full btn btn-primary py-3 rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
        </button>
      </form>

      <div className="text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-dark-500 hover:text-dark-200 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
