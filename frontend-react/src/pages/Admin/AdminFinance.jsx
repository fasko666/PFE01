import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Lock, Banknote, AlertTriangle,
  CheckCircle2, XCircle, Loader2, Settings as SettingsIcon, Save,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { api } from '../../api';
import toast from 'react-hot-toast';

const STAT_CONFIG = [
  { key: 'platform_balance',            label: 'Platform balance',  Icon: DollarSign, color: 'text-green-400'  },
  { key: 'total_commission',            label: 'Total commission',  Icon: TrendingUp, color: 'text-primary-400'},
  { key: 'total_escrow',                label: 'In escrow',         Icon: Lock,       color: 'text-blue-300'   },
  { key: 'pending_withdrawals_amount',  label: 'Pending payouts',   Icon: Banknote,   color: 'text-yellow-300' },
];

const WD_STATUS = {
  pending:    'text-yellow-300 bg-yellow-500/10 border-yellow-500/30',
  approved:   'text-blue-300   bg-blue-500/10   border-blue-500/30',
  processing: 'text-blue-300   bg-blue-500/10   border-blue-500/30',
  rejected:   'text-red-300    bg-red-500/10    border-red-500/30',
  failed:     'text-red-300    bg-red-500/10    border-red-500/30',
  completed:  'text-green-300  bg-green-500/10  border-green-500/30',
};

export default function AdminFinance() {
  const [dashboard,    setDashboard]    = useState(null);
  const [withdrawals,  setWithdrawals]  = useState([]);
  const [settings,     setSettings]     = useState([]);
  const [settingsEdit, setSettingsEdit] = useState({});
  const [loading,      setLoading]      = useState(true);
  const [tab, setTab] = useState('overview');

  const load = async () => {
    setLoading(true);
    try {
      const [d, w, s] = await Promise.all([
        api.adminFinance.dashboard(),
        api.adminFinance.withdrawals({ status: 'pending' }),
        api.adminFinance.settings(),
      ]);
      setDashboard(d.data?.data);
      setWithdrawals(w.data?.data?.data || []);
      setSettings(s.data?.data || []);
    } catch {
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.adminFinance.approveWithdrawal(id, {});
      toast.success('Withdrawal approved');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Approve failed');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection?');
    if (!reason) return;
    try {
      await api.adminFinance.rejectWithdrawal(id, { reason });
      toast.success('Withdrawal rejected');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Reject failed');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.adminFinance.updateSettings({ settings: settingsEdit });
      toast.success('Settings saved');
      setSettingsEdit({});
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Save failed');
    }
  };

  const fmt = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-dark-50">Finance</h1>
          <p className="text-sm text-dark-400">Platform revenue, withdrawals, and fee settings.</p>
        </div>
        <div className="inline-flex rounded-full border border-dark-700 p-1 bg-dark-900">
          {[
            ['overview',    'Overview'],
            ['withdrawals', `Pending payouts ${withdrawals.length ? `(${withdrawals.length})` : ''}`],
            ['settings',    'Fee settings'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                tab === id ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STAT_CONFIG.map((s) => {
              const Icon = s.Icon;
              return (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-dark-800 bg-dark-900 p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 ${s.color}`} />
                    <div className="text-2xs text-dark-500 font-medium uppercase tracking-wider">{s.label}</div>
                  </div>
                  <div className={`text-xl sm:text-2xl font-bold font-display ${s.color}`}>
                    {fmt(dashboard?.[s.key])}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Counts row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
              <div className="text-2xs text-dark-500 uppercase tracking-wider mb-1.5">Pending payouts</div>
              <div className="text-2xl font-bold font-display text-yellow-300">{dashboard?.pending_withdrawals || 0}</div>
            </div>
            <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
              <div className="text-2xs text-dark-500 uppercase tracking-wider mb-1.5">Failed transactions</div>
              <div className="text-2xl font-bold font-display text-red-300">{dashboard?.failed_transactions || 0}</div>
            </div>
            <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5 col-span-2 sm:col-span-1">
              <div className="text-2xs text-dark-500 uppercase tracking-wider mb-1.5">30-day revenue points</div>
              <div className="text-2xl font-bold font-display text-primary-400">{dashboard?.revenue_30d?.length || 0}</div>
            </div>
          </div>

          {/* Revenue chart */}
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
            <h2 className="text-sm font-bold text-dark-100 mb-4">Platform revenue (last 30 days)</h2>
            {dashboard?.revenue_30d?.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={dashboard.revenue_30d}>
                  <CartesianGrid stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => fmt(v)}
                  />
                  <Line type="monotone" dataKey="total" stroke="#4361ff" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-dark-500 py-12">No revenue data yet</div>
            )}
          </div>
        </>
      )}

      {/* WITHDRAWALS */}
      {tab === 'withdrawals' && (
        <div className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-800">
            <h2 className="text-sm font-bold text-dark-100">Pending payouts ({withdrawals.length})</h2>
          </div>
          {withdrawals.length === 0 ? (
            <div className="text-center text-xs text-dark-500 py-16">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              All clear — no pending payouts.
            </div>
          ) : (
            <div className="divide-y divide-dark-800">
              {withdrawals.map((w) => (
                <div key={w.id} className="px-5 py-4 grid sm:grid-cols-[1fr_auto_auto] items-center gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-dark-100">
                      {w.user?.name || `User #${w.user_id}`} <span className="text-2xs text-dark-500 ml-1">({w.user?.email})</span>
                    </div>
                    <div className="text-2xs text-dark-500 mt-0.5">
                      {fmt(w.amount)} via {w.method} · Fee {fmt(w.fee)} · Net {fmt(w.net)} · {new Date(w.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span className={`text-2xs font-semibold px-2 py-1 rounded-full border ${WD_STATUS[w.status]}`}>
                    {w.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleApprove(w.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/15 text-green-300 text-xs font-semibold border border-green-500/30 hover:bg-green-500/25 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => handleReject(w.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/15 text-red-300 text-xs font-semibold border border-red-500/30 hover:bg-red-500/25 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && (
        <div className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-primary-400" />
              <h2 className="text-sm font-bold text-dark-100">Platform fee settings</h2>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={Object.keys(settingsEdit).length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" /> Save changes
            </button>
          </div>
          <div className="divide-y divide-dark-800">
            {settings.map((s) => (
              <div key={s.key} className="px-5 py-4 grid sm:grid-cols-[1fr_140px] items-center gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-mono text-primary-300">{s.key}</div>
                  <div className="text-2xs text-dark-500 mt-0.5">{s.description || '—'}</div>
                </div>
                <input
                  defaultValue={s.value}
                  onChange={(e) => setSettingsEdit((p) => ({ ...p, [s.key]: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-100 text-xs font-mono outline-none focus:border-primary-500/50"
                />
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-dark-950/40 border-t border-dark-800 text-2xs text-dark-500">
            Settings are cached for 60 seconds. Changes take effect immediately for new transactions.
          </div>
        </div>
      )}
    </div>
  );
}
