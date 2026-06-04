import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Loader2, CheckCircle2, AlertTriangle, ExternalLink, Calendar, ArrowUpRight, Pause,
  Sparkles, RefreshCw, FileText, X,
} from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString() : '—';
const fmtMoney = (n, cur='USD') => `$${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;

const STATUS_COLOR = {
  active:    'bg-green-500/15 border-green-500/30 text-green-300',
  trialing:  'bg-blue-500/15 border-blue-500/30 text-blue-300',
  past_due:  'bg-red-500/15 border-red-500/30 text-red-300',
  canceled:  'bg-dark-700/40 border-dark-600 text-dark-300',
  incomplete:'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
};

export default function Billing() {
  const [current, setCurrent]   = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [c, i] = await Promise.all([api.billing.current(), api.billing.invoices()]);
      setCurrent(c.data.data);
      setInvoices(i.data.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load billing');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const cancel = async () => {
    if (!confirm('Cancel at the end of the current period? You keep access until then.')) return;
    setBusy(true);
    try { await api.billing.cancel(); toast.success('Subscription will end at period close.'); load(); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
    finally { setBusy(false); }
  };

  const resume = async () => {
    setBusy(true);
    try { await api.billing.resume(); toast.success('Subscription resumed'); load(); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
    finally { setBusy(false); }
  };

  const openPortal = async () => {
    setBusy(true);
    try { const { data } = await api.billing.portal(); window.open(data.data.url, '_blank'); }
    catch (e) { toast.error(e?.response?.data?.message || 'Portal unavailable'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>;

  const sub      = current?.subscription;
  const planSlug = current?.plan_slug || 'free';
  const plan     = current?.plan;
  const onGrace  = !!current?.on_grace;
  const status   = sub?.stripe_status || 'no_subscription';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
        <div className="flex items-center gap-3 mb-1">
          <CreditCard className="w-5 h-5 text-primary-400" />
          <h1 className="text-xl font-bold font-display text-dark-50">Billing & subscription</h1>
        </div>
        <p className="text-sm text-dark-400">Manage your plan, payment method, and invoices.</p>
      </div>

      {/* Current plan card */}
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xs text-dark-500 uppercase tracking-wider font-semibold">Current plan</div>
            <div className="text-2xl font-bold font-display text-dark-50 mt-1">{plan?.name || 'Free'}</div>
            {plan?.tagline && <p className="text-xs text-dark-400 mt-1">{plan.tagline}</p>}
          </div>
          {sub && (
            <span className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-1 rounded-full border ${STATUS_COLOR[status] || STATUS_COLOR.canceled}`}>
              {status === 'active' && <CheckCircle2 className="w-3 h-3" />}
              {status === 'past_due' && <AlertTriangle className="w-3 h-3" />}
              {status === 'canceled' && <X className="w-3 h-3" />}
              {status}
            </span>
          )}
        </div>

        {onGrace && (
          <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
            className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-2xs text-yellow-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-300 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-yellow-100">Scheduled to cancel on {fmtDate(sub.ends_at)}</div>
              <p className="mt-1">You still have full access until then. Resume any time to keep your subscription.</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Connects balance" value={current?.connects_balance ?? 0} />
          <Stat label="Monthly Connects"  value={plan?.features?.connects_monthly ?? 0} />
          <Stat label="Started"           value={sub?.created_at ? fmtDate(sub.created_at) : '—'} small />
          <Stat label={onGrace ? 'Ends' : 'Renews'} value={sub?.ends_at ? fmtDate(sub.ends_at) : (status === 'active' ? 'Auto' : '—')} small />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Link to="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" /> {sub ? 'Change plan' : 'Upgrade'}
          </Link>
          {sub && (
            <button onClick={openPortal} disabled={busy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-200 hover:bg-dark-700 disabled:opacity-40">
              <ExternalLink className="w-3.5 h-3.5" /> Manage payment method
            </button>
          )}
          {sub && !onGrace && status === 'active' && (
            <button onClick={cancel} disabled={busy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/25 disabled:opacity-40">
              <Pause className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
          {sub && onGrace && (
            <button onClick={resume} disabled={busy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/25 disabled:opacity-40">
              <RefreshCw className="w-3.5 h-3.5" /> Resume
            </button>
          )}
        </div>
      </div>

      {/* Plan features */}
      {plan?.features && (
        <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
          <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" /> Included features
          </h2>
          <ul className="grid sm:grid-cols-2 gap-1.5">
            {Object.entries(plan.features).filter(([_, v]) => v).map(([key, v]) => (
              <li key={key} className="text-2xs text-dark-300 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                {typeof v === 'number' && v > 0 && <span className="text-dark-500 ml-auto">{v}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Invoices */}
      <div className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-dark-400" />
          <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider">Invoices</h2>
        </div>
        {invoices.length === 0 ? (
          <p className="text-xs text-dark-500 italic px-5 py-6 text-center">No invoices yet.</p>
        ) : (
          <ul className="divide-y divide-dark-800">
            {invoices.map(inv => (
              <li key={inv.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-dark-100 truncate">{inv.description || `Invoice ${inv.number || inv.id}`}</div>
                  <div className="text-2xs text-dark-500 mt-0.5 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {fmtDate(inv.created)} · {inv.status}
                  </div>
                </div>
                <div className="text-sm font-bold text-dark-100">{fmtMoney(inv.amount_paid || inv.amount_due, inv.currency)}</div>
                {inv.hosted_url && (
                  <a href={inv.hosted_url} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline text-2xs inline-flex items-center gap-1">
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, small }) {
  return (
    <div className="rounded-xl border border-dark-800 bg-dark-900/40 p-3">
      <div className="text-2xs text-dark-500 uppercase tracking-wider mb-1.5">{label}</div>
      <div className={`${small ? 'text-xs' : 'text-base'} font-bold text-dark-100`}>{value}</div>
    </div>
  );
}
