import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Download, TrendingUp, DollarSign, Clock, FileText,
  ArrowUpRight, ArrowDownLeft, Lock, RotateCcw, BadgeDollarSign,
  Wallet, Receipt, Shield, Loader2, AlertCircle, Award, CreditCard,
  ArrowRight, CheckCircle2, ExternalLink, Banknote, X, Plus,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

/* ─── helpers ─── */
const TX_CONFIG = {
  credit:     { Icon: ArrowUpRight,    color: 'text-green-400',    bg: 'bg-green-500/10 border-green-500/20',     label: 'Credit'     },
  debit:      { Icon: ArrowDownLeft,   color: 'text-red-400',      bg: 'bg-red-500/10 border-red-500/20',         label: 'Debit'      },
  escrow:     { Icon: Lock,            color: 'text-yellow-400',   bg: 'bg-yellow-500/10 border-yellow-500/20',   label: 'Escrow'     },
  release:    { Icon: ArrowUpRight,    color: 'text-green-400',    bg: 'bg-green-500/10 border-green-500/20',     label: 'Release'    },
  refund:     { Icon: RotateCcw,       color: 'text-primary-400',  bg: 'bg-primary-500/10 border-primary-500/20', label: 'Refund'     },
  withdrawal: { Icon: ArrowDownLeft,   color: 'text-dark-300',     bg: 'bg-dark-800 border-dark-700',             label: 'Withdrawal' },
  fee:        { Icon: BadgeDollarSign, color: 'text-dark-500',     bg: 'bg-dark-800 border-dark-700',             label: 'Fee'        },
};

const WITHDRAW_STATUS = {
  pending:    'text-yellow-300 bg-yellow-500/10 border-yellow-500/30',
  approved:   'text-blue-300   bg-blue-500/10   border-blue-500/30',
  processing: 'text-blue-300   bg-blue-500/10   border-blue-500/30',
  rejected:   'text-red-300    bg-red-500/10    border-red-500/30',
  failed:     'text-red-300    bg-red-500/10    border-red-500/30',
  completed:  'text-green-300  bg-green-500/10  border-green-500/30',
};

const TAX_FORM_LABELS  = { w9: 'W-9 (US)', w8ben: 'W-8BEN (non-US)', vat: 'VAT (EU)' };
const TAX_STATUS_COLOR = {
  draft:    'bg-dark-700/40 border-dark-600 text-dark-300',
  submitted:'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  approved: 'bg-green-500/15 border-green-500/30 text-green-300',
  rejected: 'bg-red-500/15 border-red-500/30 text-red-300',
};

const WITHDRAW_METHODS = [
  { id: 'bank',   label: 'Bank Transfer',  desc: 'ACH / SEPA — 3-5 business days' },
  { id: 'paypal', label: 'PayPal',         desc: 'Instant to your PayPal email'   },
  { id: 'wise',   label: 'Wise',           desc: 'International, low fees'        },
  { id: 'stripe', label: 'Stripe Connect', desc: 'Instant payouts via Stripe'     },
];

const SECTION_META = {
  'your-reports': { label: 'Your reports',             icon: BarChart3  },
  overview:       { label: 'Financial overview',       icon: BarChart3  },
  earnings:       { label: 'Billings and earnings',    icon: TrendingUp },
  transactions:   { label: 'Transactions',             icon: DollarSign },
  certificate:    { label: 'Certificate of earnings',  icon: Award      },
  withdraw:       { label: 'Withdraw earnings',        icon: Wallet     },
  'tax-forms':    { label: 'Tax forms',                icon: FileText   },
  'tax-info':     { label: 'Tax information',          icon: Receipt    },
};

const fmt     = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ─── TxRow ─── */
function TxRow({ tx }) {
  const cfg = TX_CONFIG[tx.type] || TX_CONFIG.credit;
  const TxIcon = cfg.Icon;
  const isPositive = ['credit', 'release', 'refund'].includes(tx.type);
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-dark-800/40 transition-colors rounded-xl">
      <div className={`w-9 h-9 rounded-xl border ${cfg.bg} flex items-center justify-center shrink-0`}>
        <TxIcon className={`w-4 h-4 ${cfg.color}`} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark-100 truncate">{tx.description || cfg.label}</p>
        <p className="text-xs text-dark-500">{fmtDate(tx.created_at)} · {cfg.label}</p>
      </div>
      <span className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : '−'}{fmt(tx.amount)}
      </span>
    </div>
  );
}

function TaxField({ label, error, children }) {
  return (
    <label className="block">
      <div className="text-2xs text-dark-500 font-semibold uppercase tracking-wider mb-1">{label}</div>
      {children}
      {error && <p className="text-2xs text-red-400 mt-1">{error}</p>}
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function Reports() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const { section: paramSection } = useParams();
  const isFreelancer = user?.role === 'freelancer';

  const active = (paramSection && SECTION_META[paramSection]) ? paramSection : 'your-reports';
  const meta   = SECTION_META[active];

  const go = (section) => navigate(`/reports/${section}`);

  /* ─── core data ─── */
  const [overview, setOverview] = useState(null);
  const [wallet,   setWallet]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  /* ─── withdraw ─── */
  const [wdHistory,  setWdHistory]  = useState([]);
  const [connect,    setConnect]    = useState(null);
  const [wdAmount,   setWdAmount]   = useState('');
  const [wdMethod,   setWdMethod]   = useState('bank');
  const [wdDetails,  setWdDetails]  = useState({ email: '', account_number: '', routing_number: '' });
  const [submitting, setSubmitting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  /* ─── tax ─── */
  const [taxDocs,     setTaxDocs]    = useState([]);
  const [taxLoading,  setTaxLoading] = useState(false);
  const [showTaxForm, setShowTaxForm]= useState(false);
  const [taxBusy,     setTaxBusy]   = useState(false);
  const [taxErrors,   setTaxErrors] = useState({});
  const [taxField,    setTaxField]  = useState({
    form_type: 'w9', country: 'MA', legal_name: '', tax_id: '',
    address_line1: '', address_line2: '', city: '', state_region: '', postal_code: '',
  });

  /* ─── loaders ─── */
  const loadCore = async () => {
    setLoading(true); setError(null);
    try {
      const [ov, w] = await Promise.all([api.payments.overview(), api.payments.wallet()]);
      setOverview(ov.data.data);
      setWallet(w.data.data);
    } catch {
      setError('Could not load financial data.');
    } finally { setLoading(false); }
  };

  const loadWithdraw = async () => {
    try {
      const [hist, status] = await Promise.all([
        api.payments.myWithdrawals(),
        api.payments.stripeConnectStatus().catch(() => ({ data: { data: null } })),
      ]);
      setWdHistory(hist.data?.data?.data || []);
      setConnect(status.data?.data || null);
    } catch { /* non-fatal */ }
  };

  const loadTax = async () => {
    setTaxLoading(true);
    try { setTaxDocs((await api.taxDocs.list()).data.data || []); }
    catch { toast.error('Failed to load tax documents'); }
    finally { setTaxLoading(false); }
  };

  useEffect(() => { loadCore(); }, []);

  useEffect(() => {
    if (active === 'withdraw')                               loadWithdraw();
    if (active === 'tax-forms' || active === 'tax-info')    loadTax();
  }, [active]);

  /* ─── derived ─── */
  const txs      = wallet?.transactions || [];
  const earnings = txs.filter((t) => ['credit', 'release'].includes(t.type));

  /* ─── handlers ─── */
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await api.payments.stripeConnectOnboard();
      const url = res.data?.data?.onboarding_url;
      if (url) window.location.href = url; else throw new Error();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Stripe Connect not configured yet');
      setConnecting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = Number(wdAmount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > Number(overview?.available || 0)) return toast.error('Insufficient balance');
    if (wdMethod === 'stripe' && !connect?.payouts_enabled) return toast.error('Complete Stripe Connect first');
    const payoutDetails = wdMethod === 'paypal'
      ? { email: wdDetails.email }
      : wdMethod === 'bank'
      ? { account_number: wdDetails.account_number, routing_number: wdDetails.routing_number }
      : {};
    setSubmitting(true);
    try {
      await api.payments.requestWithdrawal({ amount: amt, method: wdMethod, payout_details: payoutDetails });
      toast.success('Withdrawal request submitted');
      setWdAmount('');
      await Promise.all([loadCore(), loadWithdraw()]);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Withdrawal failed');
    } finally { setSubmitting(false); }
  };

  const handleTaxSubmit = async (e) => {
    e.preventDefault(); setTaxErrors({}); setTaxBusy(true);
    try {
      await api.taxDocs.create(taxField);
      setShowTaxForm(false);
      setTaxField({ form_type: 'w9', country: 'MA', legal_name: '', tax_id: '', address_line1: '', address_line2: '', city: '', state_region: '', postal_code: '' });
      toast.success('Submitted for review');
      loadTax();
    } catch (e) {
      setTaxErrors(e?.response?.data?.errors || {});
      toast.error(e?.response?.data?.message || 'Submission failed');
    } finally { setTaxBusy(false); }
  };

  const openTaxPdf = async (docId) => {
    try {
      const res = await fetch(api.taxDocs.pdfUrl(docId), {
        headers: { Authorization: `Bearer ${localStorage.getItem('panda_token') || ''}` },
      });
      const html = await res.text();
      const w = window.open(); w.document.open(); w.document.write(html); w.document.close();
    } catch { toast.error('Could not open PDF'); }
  };

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Page header ── */}
      <div className="mb-6 pb-5 border-b border-dark-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-dark-100">{meta.label}</h1>
            {active !== 'your-reports' && (
              <p className="text-sm text-dark-500 mt-1">
                <button onClick={() => go('your-reports')} className="hover:text-primary-400 transition-colors">Your reports</button>
                {' › '}{meta.label}
              </p>
            )}
          </div>
          {/* Contextual action in header */}
          {(active === 'earnings' || active === 'transactions') && (
            <button className="btn btn-ghost btn-sm gap-1.5 shrink-0">
              <Download className="w-3.5 h-3.5" />Export CSV
            </button>
          )}
          {active === 'tax-forms' && (
            <button onClick={() => setShowTaxForm((v) => !v)}
              className={`btn btn-sm gap-1.5 shrink-0 ${showTaxForm ? 'btn-ghost' : 'btn-primary'}`}
            >
              {showTaxForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showTaxForm ? 'Cancel' : 'Submit new form'}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 mb-5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={loadCore} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1,2,3,4].map((i) => <div key={i} className="card p-5 h-24 skeleton" />)}
          </div>
          <div className="card h-48 skeleton" />
        </div>
      )}

      {!loading && !error && (
        <AnimatePresence mode="wait">

          {/* ════════ YOUR REPORTS HUB ════════ */}
          {active === 'your-reports' && (
            <motion.div key="your-reports"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Welcome strip */}
              <div className="card overflow-hidden">
                <div className="h-20 bg-gradient-to-br from-primary-700/70 via-primary-600/40 to-violet-700/30 relative">
                  <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
                </div>
                <div className="px-6 py-4 -mt-8 relative">
                  <div className="flex items-end justify-between gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-500/15 border-2 border-primary-500/30 flex items-center justify-center">
                      <BarChart3 className="w-7 h-7 text-primary-400" strokeWidth={1.5} />
                    </div>
                    <button onClick={() => go('overview')} className="btn btn-ghost btn-sm gap-1.5 mb-1">
                      <DollarSign className="w-3.5 h-3.5" />Full overview
                    </button>
                  </div>
                  <h2 className="text-lg font-bold text-dark-100">Welcome back, {user?.name?.split(' ')[0]}</h2>
                  <p className="text-sm text-dark-400 mt-0.5">Here's a summary of your financial activity on PANDA.</p>
                </div>
              </div>

              {/* Stat strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: DollarSign, label: 'Available',    value: fmt(overview?.available),    color: 'text-green-400',   bg: 'bg-green-500/10 border-green-500/20'   },
                  { icon: TrendingUp, label: isFreelancer ? 'Total earned' : 'Total spent', value: fmt(isFreelancer ? overview?.total_earned : overview?.total_spent), color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
                  { icon: Lock,       label: 'In escrow',    value: fmt(overview?.in_escrow),    color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20'  },
                  { icon: Clock,      label: 'Pending',      value: fmt(overview?.pending),      color: 'text-dark-300',    bg: 'bg-dark-800 border-dark-700'            },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="card p-4">
                      <div className={`w-7 h-7 rounded-lg border ${s.bg} flex items-center justify-center mb-2`}>
                        <Icon className={`w-3.5 h-3.5 ${s.color}`} strokeWidth={2} />
                      </div>
                      <p className="text-2xs text-dark-500 font-medium">{s.label}</p>
                      <p className="text-lg font-bold text-dark-100 mt-0.5">{s.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Report cards */}
              <div>
                <p className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-3">Reports</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { id: 'overview',     label: 'Financial overview',      desc: 'Full breakdown of your balance, escrow and pending funds.',    icon: BarChart3,  color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
                    { id: 'earnings',     label: 'Billings and earnings',   desc: 'Complete history of every payment you have received.',          icon: TrendingUp, color: 'text-green-400',   bg: 'bg-green-500/10 border-green-500/20'    },
                    { id: 'transactions', label: 'Transactions',            desc: 'All credits, debits, escrow releases and fees in one view.',   icon: DollarSign, color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'      },
                    { id: 'certificate',  label: 'Certificate of earnings', desc: 'Downloadable proof of income for tax or visa purposes.',       icon: Award,      color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20'  },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <button key={card.id} onClick={() => go(card.id)}
                        className="card p-5 text-left hover:border-primary-500/30 transition-all group flex items-start gap-4"
                      >
                        <div className={`w-10 h-10 rounded-xl border ${card.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${card.color}`} strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dark-100 group-hover:text-primary-300 transition-colors">{card.label}</p>
                          <p className="text-xs text-dark-500 mt-1 leading-relaxed">{card.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-dark-700 group-hover:text-dark-400 shrink-0 mt-0.5 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payments & Taxes */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-3">Payments</p>
                  <button onClick={() => go('withdraw')}
                    className="card p-5 text-left hover:border-primary-500/30 transition-all group flex items-start gap-4 w-full"
                  >
                    <div className="w-10 h-10 rounded-xl border bg-dark-800 border-dark-700 flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 text-dark-300" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-100 group-hover:text-primary-300 transition-colors">Withdraw earnings</p>
                      <p className="text-xs text-dark-500 mt-1">Transfer your balance to your bank, PayPal, or Stripe.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dark-700 group-hover:text-dark-400 shrink-0 mt-0.5 transition-colors" />
                  </button>
                </div>

                <div>
                  <p className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-3">Taxes</p>
                  <div className="space-y-2">
                    {[
                      { id: 'tax-forms', label: 'Tax forms',       desc: 'Submit W-9, W-8BEN or VAT documents.' },
                      { id: 'tax-info',  label: 'Tax information', desc: 'Learn about tax obligations on PANDA.'   },
                    ].map((t) => (
                      <button key={t.id} onClick={() => go(t.id)}
                        className="card p-4 text-left hover:border-primary-500/30 transition-all group flex items-center gap-3 w-full"
                      >
                        <Receipt className="w-4 h-4 text-dark-500 shrink-0" strokeWidth={1.75} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dark-100 group-hover:text-primary-300 transition-colors">{t.label}</p>
                          <p className="text-xs text-dark-500 mt-0.5">{t.desc}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-dark-700 group-hover:text-dark-400 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent transactions preview */}
              {txs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-dark-500 uppercase tracking-widest">Recent transactions</p>
                    <button onClick={() => go('transactions')} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                      View all
                    </button>
                  </div>
                  <div className="card overflow-hidden">
                    <div className="p-2">
                      {txs.slice(0, 5).map((tx) => <TxRow key={tx.id} tx={tx} />)}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════ FINANCIAL OVERVIEW ════════ */}
          {active === 'overview' && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: DollarSign, label: 'Available balance', value: fmt(overview?.available),  color: 'text-green-400',   bg: 'bg-green-500/10 border-green-500/20'    },
                  { icon: TrendingUp, label: isFreelancer ? 'Total earned' : 'Total spent', value: fmt(isFreelancer ? overview?.total_earned : overview?.total_spent), color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
                  { icon: Lock,       label: 'In escrow',         value: fmt(overview?.in_escrow),  color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20'  },
                  { icon: Clock,      label: 'Pending',           value: fmt(overview?.pending),    color: 'text-dark-300',    bg: 'bg-dark-800 border-dark-700'            },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="card p-5">
                      <div className={`w-8 h-8 rounded-lg border ${s.bg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-4 h-4 ${s.color}`} strokeWidth={2} />
                      </div>
                      <p className="text-xs text-dark-500 font-medium">{s.label}</p>
                      <p className="text-xl font-bold text-dark-100 mt-0.5">{s.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="card p-4">
                <p className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-3 px-1">Quick actions</p>
                <div className="space-y-0.5">
                  {[
                    { label: 'View all transactions',  fn: () => go('transactions'), icon: DollarSign  },
                    { label: 'Billings and earnings',  fn: () => go('earnings'),     icon: TrendingUp  },
                    { label: 'Withdraw earnings',      fn: () => go('withdraw'),     icon: Wallet,     show: isFreelancer  },
                    { label: 'Add funds to wallet',    fn: () => navigate('/payments'), icon: CreditCard, show: !isFreelancer },
                    { label: 'Tax documents',          fn: () => go('tax-forms'),    icon: Receipt     },
                  ].filter((a) => a.show !== false).map((a) => {
                    const Icon = a.icon;
                    return (
                      <button key={a.label} onClick={a.fn}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-300 hover:bg-dark-800/60 hover:text-dark-100 transition-all text-left group"
                      >
                        <Icon className="w-4 h-4 text-dark-600 group-hover:text-primary-400 transition-colors" strokeWidth={1.75} />
                        {a.label}
                        <ArrowRight className="w-3.5 h-3.5 ml-auto text-dark-700 group-hover:text-dark-400 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════ BILLINGS AND EARNINGS ════════ */}
          {active === 'earnings' && (
            <motion.div key="earnings"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="card p-5">
                  <p className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-1.5">All-time earnings</p>
                  <p className="text-2xl font-bold text-green-400">{fmt(earnings.reduce((s,t)=>s+Number(t.amount),0))}</p>
                </div>
                <div className="card p-5">
                  <p className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-1.5">Available balance</p>
                  <p className="text-2xl font-bold text-dark-100">{fmt(overview?.available)}</p>
                </div>
              </div>
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-dark-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-dark-100">Earnings history</span>
                  <span className="text-xs text-dark-500">{earnings.length} records</span>
                </div>
                {earnings.length === 0 ? (
                  <div className="py-16 text-center">
                    <TrendingUp className="w-8 h-8 text-dark-700 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-sm text-dark-500">No earnings yet</p>
                    <p className="text-xs text-dark-600 mt-1">Complete contracts to start earning</p>
                  </div>
                ) : (
                  <div className="p-2">{earnings.map((tx) => <TxRow key={tx.id} tx={tx} />)}</div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════ TRANSACTIONS ════════ */}
          {active === 'transactions' && (
            <motion.div key="transactions"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-dark-700/60 bg-dark-700/30">
                {[
                  { label: 'Total in',    value: fmt(earnings.reduce((s,t)=>s+Number(t.amount),0)),                                                        color:'text-green-400' },
                  { label: 'Total out',   value: fmt(txs.filter(t=>['withdrawal','debit','escrow'].includes(t.type)).reduce((s,t)=>s+Number(t.amount),0)), color:'text-red-400'   },
                  { label: 'Net balance', value: fmt(overview?.available),                                                                                 color:'text-dark-100'  },
                ].map((s) => (
                  <div key={s.label} className="bg-dark-900 p-5">
                    <p className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-1.5">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-dark-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-dark-100">All transactions</span>
                  <span className="text-xs text-dark-500">{txs.length} total</span>
                </div>
                {txs.length === 0 ? (
                  <div className="py-16 text-center">
                    <DollarSign className="w-8 h-8 text-dark-700 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-sm text-dark-500">No transactions yet</p>
                  </div>
                ) : (
                  <div className="p-2">{txs.map((tx) => <TxRow key={tx.id} tx={tx} />)}</div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════ CERTIFICATE ════════ */}
          {active === 'certificate' && (
            <motion.div key="certificate"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="card p-6 space-y-5">
                <div className="border border-dark-700 rounded-2xl p-8 bg-dark-950/50 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-7 h-7 text-primary-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs text-dark-500 uppercase tracking-widest mb-2">Certificate of Earnings</p>
                  <p className="text-2xl font-bold font-display text-dark-100">{user?.name}</p>
                  <p className="text-sm text-dark-400 mt-1">PANDA Freelance Platform</p>
                  <div className="mt-6 pt-6 border-t border-dark-800 grid grid-cols-2 gap-4 text-left max-w-xs mx-auto">
                    <div>
                      <p className="text-xs text-dark-500">Total Earned</p>
                      <p className="text-xl font-bold text-green-400">{fmt(overview?.total_earned)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Date Issued</p>
                      <p className="text-sm font-semibold text-dark-200">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Available Balance</p>
                      <p className="text-base font-bold text-dark-100">{fmt(overview?.available)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Transactions</p>
                      <p className="text-base font-bold text-dark-100">{txs.length}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => {
                    const lines = [
                      'CERTIFICATE OF EARNINGS', '═══════════════════════════════════════',
                      `Name:             ${user?.name}`, `Platform:         PANDA Freelance Marketplace`,
                      `Total Earned:     ${fmt(overview?.total_earned)}`, `Available:        ${fmt(overview?.available)}`,
                      `In Escrow:        ${fmt(overview?.in_escrow)}`, `Transactions:     ${txs.length}`,
                      `Date Issued:      ${new Date().toLocaleDateString()}`, '═══════════════════════════════════════',
                      'This document certifies the earnings record on PANDA.',
                    ].join('\n');
                    const blob = new Blob([lines], { type: 'text/plain' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob); a.download = `PANDA_Certificate_${user?.name?.replace(/\s/g,'_')}.txt`; a.click();
                    toast.success('Certificate downloaded');
                  }} className="btn btn-primary btn-sm gap-1.5">
                    <Download className="w-3.5 h-3.5" />Download Certificate
                  </button>
                  <button onClick={() => window.print()} className="btn btn-ghost btn-sm">Print</button>
                </div>
              </div>
              <div className="card p-4 flex items-start gap-3 text-sm text-dark-400">
                <AlertCircle className="w-4 h-4 text-dark-500 shrink-0 mt-0.5" />
                <p>For official tax documents, go to{' '}
                  <button onClick={() => go('tax-forms')} className="text-primary-400 hover:underline">Tax forms</button>.
                </p>
              </div>
            </motion.div>
          )}

          {/* ════════ WITHDRAW EARNINGS ════════ */}
          {active === 'withdraw' && (
            <motion.div key="withdraw"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'Available',  value: overview?.available  || 0, color: 'text-green-400'  },
                  { label: 'Pending',    value: overview?.pending    || 0, color: 'text-yellow-300' },
                  { label: 'In escrow',  value: overview?.in_escrow || 0, color: 'text-blue-300'   },
                ].map((s) => (
                  <div key={s.label} className="card p-5">
                    <p className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-1.5">{s.label}</p>
                    <p className={`text-2xl font-bold font-display ${s.color}`}>{fmt(s.value)}</p>
                  </div>
                ))}
              </div>

              <div className="card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-dark-100">Stripe Connect</h3>
                    {connect?.payouts_enabled && (
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold text-green-300 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-400 mb-3 leading-relaxed">
                    {connect?.payouts_enabled
                      ? 'Your Stripe account is connected. Instant payouts are available.'
                      : 'Connect your Stripe account to enable instant payouts.'}
                  </p>
                  {!connect?.payouts_enabled && (
                    <button onClick={handleConnect} disabled={connecting}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all disabled:opacity-60"
                    >
                      {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                      {connecting ? 'Redirecting…' : 'Connect Stripe account'}
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleWithdraw} className="card p-6 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="w-5 h-5 text-primary-400" />
                  <h2 className="text-sm font-bold text-dark-100">Request withdrawal</h2>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-300 mb-2">Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 text-sm">$</span>
                    <input type="number" step="0.01" min="20" value={wdAmount}
                      onChange={(e) => setWdAmount(e.target.value)} placeholder="20.00" className="input pl-8 w-full"
                    />
                  </div>
                  <p className="text-2xs text-dark-500 mt-1.5">Minimum $20.00 · $2.00 flat fee per withdrawal</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-300 mb-2">Payout method</label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {WITHDRAW_METHODS.map((m) => (
                      <button key={m.id} type="button" onClick={() => setWdMethod(m.id)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          wdMethod === m.id ? 'border-primary-500 bg-primary-500/10' : 'border-dark-700 bg-dark-800 hover:border-dark-600'
                        }`}
                      >
                        <div className="text-xs font-semibold text-dark-100">{m.label}</div>
                        <div className="text-2xs text-dark-500 mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {wdMethod === 'paypal' && (
                  <div>
                    <label className="block text-xs font-semibold text-dark-300 mb-2">PayPal email</label>
                    <input type="email" value={wdDetails.email}
                      onChange={(e) => setWdDetails({ ...wdDetails, email: e.target.value })}
                      placeholder="you@example.com" className="input w-full"
                    />
                  </div>
                )}
                {wdMethod === 'bank' && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 mb-2">Account number</label>
                      <input value={wdDetails.account_number}
                        onChange={(e) => setWdDetails({ ...wdDetails, account_number: e.target.value })} className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 mb-2">Routing / IBAN</label>
                      <input value={wdDetails.routing_number}
                        onChange={(e) => setWdDetails({ ...wdDetails, routing_number: e.target.value })} className="input w-full"
                      />
                    </div>
                  </div>
                )}
                {wdMethod === 'stripe' && !connect?.payouts_enabled && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    Complete Stripe Connect onboarding before using this method.
                  </div>
                )}
                <button type="submit" disabled={submitting || (wdMethod === 'stripe' && !connect?.payouts_enabled)}
                  className="btn btn-primary w-full gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {submitting ? 'Submitting…' : 'Request withdrawal'}
                </button>
              </form>

              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-dark-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-dark-100">Withdrawal history</span>
                  <span className="text-xs text-dark-500">{wdHistory.length} requests</span>
                </div>
                {wdHistory.length === 0 ? (
                  <p className="text-center text-xs text-dark-500 py-12">No withdrawals yet</p>
                ) : (
                  <div className="divide-y divide-dark-800">
                    {wdHistory.map((w) => (
                      <div key={w.id} className="px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center shrink-0">
                          <Wallet className="w-4 h-4 text-dark-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dark-100">{fmt(w.amount)}</p>
                          <p className="text-2xs text-dark-500 mt-0.5">
                            {w.method?.toUpperCase()} · Fee {fmt(w.fee)} · Net {fmt(w.net)} · {fmtDate(w.created_at)}
                          </p>
                          {w.rejection_reason && <p className="text-2xs text-red-300 mt-1">Reason: {w.rejection_reason}</p>}
                        </div>
                        <span className={`text-2xs font-semibold px-2 py-1 rounded-full border ${WITHDRAW_STATUS[w.status] || WITHDRAW_STATUS.pending}`}>
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════ TAX FORMS ════════ */}
          {active === 'tax-forms' && (
            <motion.div key="tax-forms"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <AnimatePresence>
                {showTaxForm && (
                  <motion.form onSubmit={handleTaxSubmit}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="card p-5 space-y-3 border border-primary-500/20"
                  >
                    <p className="text-sm font-bold text-dark-100 mb-1">New tax document</p>
                    <div className="grid grid-cols-2 gap-3">
                      <TaxField label="Form type" error={taxErrors.form_type?.[0]}>
                        <select value={taxField.form_type} onChange={(e) => setTaxField({ ...taxField, form_type: e.target.value })} className="input w-full">
                          {Object.entries(TAX_FORM_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                        </select>
                      </TaxField>
                      <TaxField label="Country (2-letter)" error={taxErrors.country?.[0]}>
                        <input maxLength={2} value={taxField.country} onChange={(e) => setTaxField({ ...taxField, country: e.target.value.toUpperCase() })} className="input w-full uppercase" />
                      </TaxField>
                    </div>
                    <TaxField label="Legal name" error={taxErrors.legal_name?.[0]}>
                      <input value={taxField.legal_name} onChange={(e) => setTaxField({ ...taxField, legal_name: e.target.value })} className="input w-full" />
                    </TaxField>
                    <TaxField label="Tax ID (SSN / EIN / TIN)" error={taxErrors.tax_id?.[0]}>
                      <input value={taxField.tax_id} onChange={(e) => setTaxField({ ...taxField, tax_id: e.target.value })} className="input w-full" />
                      <p className="text-2xs text-dark-500 mt-1">Only last 4 digits stored at rest.</p>
                    </TaxField>
                    <TaxField label="Address line 1" error={taxErrors.address_line1?.[0]}>
                      <input value={taxField.address_line1} onChange={(e) => setTaxField({ ...taxField, address_line1: e.target.value })} className="input w-full" />
                    </TaxField>
                    <TaxField label="Address line 2 (optional)">
                      <input value={taxField.address_line2} onChange={(e) => setTaxField({ ...taxField, address_line2: e.target.value })} className="input w-full" />
                    </TaxField>
                    <div className="grid grid-cols-3 gap-3">
                      <TaxField label="City" error={taxErrors.city?.[0]}>
                        <input value={taxField.city} onChange={(e) => setTaxField({ ...taxField, city: e.target.value })} className="input w-full" />
                      </TaxField>
                      <TaxField label="State / Region">
                        <input value={taxField.state_region} onChange={(e) => setTaxField({ ...taxField, state_region: e.target.value })} className="input w-full" />
                      </TaxField>
                      <TaxField label="Postal code" error={taxErrors.postal_code?.[0]}>
                        <input value={taxField.postal_code} onChange={(e) => setTaxField({ ...taxField, postal_code: e.target.value })} className="input w-full" />
                      </TaxField>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={taxBusy} className="btn btn-primary btn-sm gap-1.5">
                        {taxBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                        Submit
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {taxLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 text-primary-500 animate-spin" /></div>
              ) : taxDocs.length === 0 ? (
                <div className="card py-16 text-center">
                  <FileText className="w-8 h-8 text-dark-700 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-dark-500">No tax documents submitted yet</p>
                  <button onClick={() => setShowTaxForm(true)} className="mt-3 text-sm text-primary-400 hover:text-primary-300 transition-colors">
                    Submit your first form
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {taxDocs.map((doc) => (
                    <div key={doc.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-dark-100">{TAX_FORM_LABELS[doc.form_type] || doc.form_type}</p>
                          <p className="text-2xs text-dark-500 mt-0.5">{doc.country} · {doc.legal_name} · •••• {doc.tax_id_last4}</p>
                        </div>
                        <span className={`inline-flex items-center text-2xs font-semibold px-2 py-1 rounded-full border ${TAX_STATUS_COLOR[doc.status] || TAX_STATUS_COLOR.draft}`}>
                          {doc.status}
                        </span>
                      </div>
                      {doc.status === 'rejected' && doc.rejection_reason && (
                        <p className="mt-2 text-2xs text-red-300 border-l-2 border-red-500/30 pl-2 italic">{doc.rejection_reason}</p>
                      )}
                      {doc.status === 'approved' && (
                        <button onClick={() => openTaxPdf(doc.id)} className="mt-2 inline-flex items-center gap-1 text-xs text-primary-400 hover:underline">
                          <Download className="w-3 h-3" />Download PDF
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════ TAX INFORMATION ════════ */}
          {active === 'tax-info' && (
            <motion.div key="tax-info"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {[
                { title: 'Who needs to submit tax documents?', body: 'Freelancers who earn $600 or more in a calendar year (US) or who cross their local threshold must submit a tax form before withdrawing earnings above that amount.' },
                { title: 'Which form should I submit?', body: 'US persons and entities submit a W-9. Non-US individuals submit a W-8BEN. EU businesses registered for VAT submit a VAT form. When in doubt, check with your local tax authority.' },
                { title: 'How is my Tax ID stored?', body: 'Only the last 4 digits of your Tax ID are stored in our database after submission. The full number is used only during the review process and is never stored in plain text.' },
                { title: 'When will my form be reviewed?', body: 'Submitted forms are reviewed by our compliance team within 1-3 business days. You will receive a notification when your status changes.' },
                { title: 'Does PANDA withhold taxes?', body: 'PANDA does not withhold taxes from freelancer earnings. You are responsible for reporting and paying all applicable taxes in your jurisdiction. PANDA provides earnings records to support your filings.' },
              ].map((item) => (
                <div key={item.title} className="card p-5">
                  <h3 className="text-sm font-semibold text-dark-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-dark-400 leading-relaxed">{item.body}</p>
                </div>
              ))}
              <div className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-dark-100">Ready to submit your tax form?</p>
                  <p className="text-xs text-dark-500 mt-0.5">Takes about 2 minutes</p>
                </div>
                <button onClick={() => go('tax-forms')} className="btn btn-primary btn-sm gap-1.5 shrink-0">
                  <FileText className="w-3.5 h-3.5" />Go to Tax forms
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      )}
    </div>
  );
}
