import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Clock,
  Loader2, Shield, ExternalLink, Banknote,
} from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending:    { color: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30', label: 'Pending'    },
  approved:   { color: 'text-blue-300   bg-blue-500/10   border-blue-500/30',   label: 'Approved'   },
  processing: { color: 'text-blue-300   bg-blue-500/10   border-blue-500/30',   label: 'Processing' },
  rejected:   { color: 'text-red-300    bg-red-500/10    border-red-500/30',    label: 'Rejected'   },
  failed:     { color: 'text-red-300    bg-red-500/10    border-red-500/30',    label: 'Failed'     },
  completed:  { color: 'text-green-300  bg-green-500/10  border-green-500/30',  label: 'Completed'  },
};

const METHODS = [
  { id: 'stripe', label: 'Stripe Connect',  desc: 'Instant payouts via Stripe (requires Connect onboarding)' },
  { id: 'bank',   label: 'Bank Transfer',   desc: 'ACH / SEPA — 3-5 business days' },
  { id: 'paypal', label: 'PayPal',          desc: 'Instant to your PayPal email' },
  { id: 'wise',   label: 'Wise',            desc: 'International transfer, low fees' },
];

export default function Withdraw() {
  const [overview, setOverview] = useState(null);
  const [connect,  setConnect]  = useState(null);
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [amount,  setAmount]  = useState('');
  const [method,  setMethod]  = useState('stripe');
  const [details, setDetails] = useState({ email: '', account_number: '', routing_number: '' });
  const [submitting, setSubmitting] = useState(false);
  const [connecting,  setConnecting]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [ov, status, hist] = await Promise.all([
        api.payments.overview(),
        api.payments.stripeConnectStatus().catch(() => ({ data: { data: null } })),
        api.payments.myWithdrawals(),
      ]);
      setOverview(ov.data?.data);
      setConnect(status.data?.data || null);
      setHistory(hist.data?.data?.data || []);
    } catch {
      toast.error('Could not load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await api.payments.stripeConnectOnboard();
      const url = res.data?.data?.onboarding_url;
      if (url) window.location.href = url;
      else throw new Error();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Stripe Connect not configured yet — contact admin');
      setConnecting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > Number(overview?.available || 0)) return toast.error('Insufficient available balance');
    if (method === 'stripe' && !connect?.payouts_enabled) {
      return toast.error('Complete Stripe Connect onboarding first');
    }

    const payoutDetails = method === 'paypal'
      ? { email: details.email }
      : method === 'bank'
      ? { account_number: details.account_number, routing_number: details.routing_number }
      : {};

    setSubmitting(true);
    try {
      await api.payments.requestWithdrawal({ amount: amt, method, payout_details: payoutDetails });
      toast.success('Withdrawal request submitted');
      setAmount('');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  const connectActive = connect?.payouts_enabled === true;
  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/payments" className="w-9 h-9 rounded-full border border-dark-700 flex items-center justify-center text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-dark-50">Withdraw funds</h1>
          <p className="text-sm text-dark-400">Cash out your earnings to your bank, PayPal, or Stripe Connect.</p>
        </div>
      </div>

      {/* Balance summary */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'Available',  value: overview?.available || 0,           tone: 'text-green-400'   },
          { label: 'Pending',    value: overview?.pending || 0,             tone: 'text-yellow-300'  },
          { label: 'In escrow',  value: overview?.in_escrow || 0,           tone: 'text-blue-300'    },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
            <div className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-1.5">{s.label}</div>
            <div className={`text-2xl font-bold font-display ${s.tone}`}>{fmt(s.value)}</div>
          </div>
        ))}
      </div>

      {/* Stripe Connect status card */}
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-dark-100">Stripe Connect</h3>
              {connectActive && (
                <span className="inline-flex items-center gap-1 text-2xs font-semibold text-green-300 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              )}
              {connect?.status === 'pending' && (
                <span className="inline-flex items-center gap-1 text-2xs font-semibold text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> Pending verification
                </span>
              )}
            </div>
            <p className="text-xs text-dark-400 leading-relaxed mb-3">
              {connectActive
                ? 'You can receive instant payouts via Stripe.'
                : 'Connect your Stripe account to receive instant payouts. Verification takes 5-10 minutes.'}
            </p>
            {!connectActive && (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all disabled:opacity-60"
              >
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                {connecting ? 'Redirecting…' : 'Connect Stripe account'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-dark-800 bg-dark-900 p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <Banknote className="w-5 h-5 text-primary-400" />
          <h2 className="text-base font-bold text-dark-100">Request withdrawal</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-dark-300 mb-2">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="20"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="20.00"
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-dark-100 placeholder:text-dark-500 outline-none focus:border-primary-500/50"
            />
          </div>
          <p className="text-2xs text-dark-500 mt-1.5">Minimum $20 — $2 flat fee per withdrawal</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-dark-300 mb-2">Payout method</label>
          <div className="grid sm:grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  method === m.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                }`}
              >
                <div className="text-xs font-semibold text-dark-100">{m.label}</div>
                <div className="text-2xs text-dark-500 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {method === 'paypal' && (
          <div>
            <label className="block text-xs font-semibold text-dark-300 mb-2">PayPal email</label>
            <input
              type="email"
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-dark-100 placeholder:text-dark-500 outline-none focus:border-primary-500/50"
            />
          </div>
        )}

        {method === 'bank' && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-2">Account number</label>
              <input
                value={details.account_number}
                onChange={(e) => setDetails({ ...details, account_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-dark-100 outline-none focus:border-primary-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-300 mb-2">Routing / IBAN</label>
              <input
                value={details.routing_number}
                onChange={(e) => setDetails({ ...details, routing_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-dark-100 outline-none focus:border-primary-500/50"
              />
            </div>
          </div>
        )}

        {method === 'stripe' && !connectActive && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>You need to complete Stripe Connect onboarding before selecting this method.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || (method === 'stripe' && !connectActive)}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {submitting ? 'Submitting…' : 'Request withdrawal'}
        </button>
      </form>

      {/* History */}
      <div className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-800">
          <h2 className="text-sm font-bold text-dark-100">Withdrawal history</h2>
        </div>
        {history.length === 0 ? (
          <div className="text-center text-xs text-dark-500 py-12">No withdrawals yet</div>
        ) : (
          <div className="divide-y divide-dark-800">
            {history.map((w) => {
              const badge = STATUS_BADGE[w.status] || STATUS_BADGE.pending;
              return (
                <div key={w.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4 text-dark-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-dark-100">{fmt(w.amount)}</div>
                    <div className="text-2xs text-dark-500 mt-0.5">
                      {w.method?.toUpperCase()} · Fee {fmt(w.fee)} · Net {fmt(w.net)} · {new Date(w.created_at).toLocaleDateString()}
                    </div>
                    {w.rejection_reason && (
                      <div className="text-2xs text-red-300 mt-1">Reason: {w.rejection_reason}</div>
                    )}
                  </div>
                  <span className={`text-2xs font-semibold px-2 py-1 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
