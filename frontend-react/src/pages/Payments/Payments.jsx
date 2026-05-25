import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Clock, RotateCcw, ArrowUpRight, ArrowDownLeft,
  Lock, BadgeDollarSign, ChevronDown, Download, Plus, X, TrendingUp,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const TX_CONFIG = {
  credit:     { Icon: ArrowUpRight,    color: 'text-green-400',    bg: 'bg-green-500/10 border-green-500/20',    label: 'Credit' },
  debit:      { Icon: ArrowDownLeft,   color: 'text-red-400',      bg: 'bg-red-500/10 border-red-500/20',        label: 'Debit' },
  escrow:     { Icon: Lock,            color: 'text-yellow-400',   bg: 'bg-yellow-500/10 border-yellow-500/20',  label: 'Escrow' },
  release:    { Icon: ArrowUpRight,    color: 'text-green-400',    bg: 'bg-green-500/10 border-green-500/20',    label: 'Release' },
  refund:     { Icon: RotateCcw,       color: 'text-primary-400',  bg: 'bg-primary-500/10 border-primary-500/20', label: 'Refund' },
  withdrawal: { Icon: ArrowDownLeft,   color: 'text-dark-300',     bg: 'bg-dark-800 border-dark-700',            label: 'Withdrawal' },
  fee:        { Icon: BadgeDollarSign, color: 'text-dark-500',     bg: 'bg-dark-800 border-dark-700',            label: 'Fee' },
};

const QUICK_FILTERS = ['All', 'Earnings', 'Withdrawals', 'Escrow'];
const DATE_RANGES   = ['All time', 'This week', 'This month', 'Last month', 'This year'];

export default function Payments() {
  const { user } = useAuthStore();
  const [wallet, setWallet]         = useState(null);
  const [overview, setOverview]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [addModal, setAddModal]     = useState(false);
  const [amount, setAmount]         = useState('');
  const [adding, setAdding]         = useState(false);
  const [filter, setFilter]         = useState('All');
  const [dateRange, setDateRange]   = useState('All time');
  const [showDate, setShowDate]     = useState(false);

  const load = async () => {
    try {
      const [w, o] = await Promise.all([api.payments.wallet(), api.payments.overview()]);
      setWallet(w.data.data);
      setOverview(o.data.data);
    } catch {
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 10) return toast.error('Minimum deposit is $10');
    setAdding(true);
    try {
      await api.payments.fundEscrow({ amount: Number(amount), description: 'Wallet top-up' });
      toast.success(`$${amount} added to wallet!`);
      setAddModal(false);
      setAmount('');
      load();
    } catch {
      toast.error('Payment failed. (Demo mode — no real charges)');
    } finally {
      setAdding(false);
    }
  };

  const isFreelancer = user?.role === 'freelancer';

  const filteredTxs = (wallet?.transactions || []).filter((tx) => {
    if (filter === 'Earnings')    return ['credit', 'release'].includes(tx.type);
    if (filter === 'Withdrawals') return tx.type === 'withdrawal';
    if (filter === 'Escrow')      return tx.type === 'escrow';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">Transactions</h1>
          <p className="text-sm text-dark-500 mt-1">
            {isFreelancer ? 'Track your earnings, escrow, and withdrawals' : 'Manage payments and project expenses'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm gap-1.5">
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Export CSV
          </button>
          {!isFreelancer && (
            <button onClick={() => setAddModal(true)} className="btn btn-primary btn-sm gap-1.5">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Add Funds
            </button>
          )}
        </div>
      </div>

      {/* 3-column summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-dark-700/60 bg-dark-700/30">
        {/* Pending / In Escrow */}
        <div className="bg-dark-900 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-yellow-400" strokeWidth={2} />
            </div>
            <span className="text-xs text-dark-500 font-medium">
              {isFreelancer ? 'Pending Earnings' : 'In Escrow'}
            </span>
          </div>
          {loading
            ? <div className="skeleton h-7 w-24 rounded mb-2" />
            : <p className="text-2xl font-bold text-white mb-1">${Number(overview?.in_escrow || 0).toFixed(2)}</p>
          }
          <p className="text-xs text-dark-600">Awaiting contract completion</p>
        </div>

        {/* Withdrawal Schedule */}
        <div className="bg-dark-900 p-5 border-l border-dark-700/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-dark-800 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5 text-dark-500" strokeWidth={2} />
            </div>
            <span className="text-xs text-dark-500 font-medium">Withdrawal Schedule</span>
          </div>
          <p className="text-base font-medium text-dark-400 mb-1">No schedule set</p>
          <p className="text-xs text-dark-600">
            {isFreelancer ? 'Set up automatic withdrawals' : 'Not applicable for clients'}
          </p>
        </div>

        {/* Available Balance */}
        <div className="bg-dark-900 p-5 border-l border-dark-700/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-green-400" strokeWidth={2} />
            </div>
            <span className="text-xs text-dark-500 font-medium">Available Balance</span>
          </div>
          {loading
            ? <div className="skeleton h-7 w-24 rounded mb-2" />
            : <p className="text-2xl font-bold text-white mb-1">${Number(wallet?.balance || 0).toFixed(2)}</p>
          }
          <div className="flex items-center gap-2 mt-2">
            {isFreelancer ? (
              <button className="px-3 py-1 bg-primary-500/10 text-primary-400 text-xs font-medium rounded-lg hover:bg-primary-500/20 transition-colors">
                Withdraw funds
              </button>
            ) : (
              <button onClick={() => setAddModal(true)} className="px-3 py-1 bg-primary-500/10 text-primary-400 text-xs font-medium rounded-lg hover:bg-primary-500/20 transition-colors">
                Add funds
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Also show total earned/spent */}
      {!loading && overview && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl card"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-primary-400" strokeWidth={2} />
          </div>
          <div>
            <span className="text-sm font-medium text-white">
              {isFreelancer ? 'Total Earned' : 'Total Spent'}:{' '}
              <span className="text-green-400">
                ${Number(isFreelancer ? overview.total_earned : overview.total_spent || 0).toFixed(2)}
              </span>
            </span>
            <p className="text-xs text-dark-500 mt-0.5">All time, after platform fees</p>
          </div>
        </motion.div>
      )}

      {/* Filter + Transaction list */}
      <div className="card overflow-hidden">
        {/* Filter bar */}
        <div className="px-5 py-4 border-b border-dark-800 flex flex-wrap items-center gap-3">
          {/* Date range */}
          <div className="relative">
            <button
              onClick={() => setShowDate(!showDate)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-xs text-dark-300 hover:bg-dark-700 transition-colors"
            >
              {dateRange}
              <ChevronDown className={`w-3 h-3 transition-transform ${showDate ? 'rotate-180' : ''}`} />
            </button>
            {showDate && (
              <div className="absolute top-full mt-1 left-0 w-36 card shadow-float z-10 overflow-hidden animate-scale-in">
                {DATE_RANGES.map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDateRange(d); setShowDate(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${dateRange === d ? 'text-primary-400 bg-primary-500/10' : 'text-dark-300 hover:bg-dark-800'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-dark-700 text-xs hidden sm:block">Quick filters:</span>

          {/* Type chips */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  filter === f
                    ? 'bg-dark-700 text-dark-100 border-dark-600'
                    : 'bg-transparent text-dark-500 border-dark-800 hover:border-dark-700 hover:text-dark-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        <div className="p-3">
          {loading ? (
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 rounded w-2/5" />
                    <div className="skeleton h-3 rounded w-1/4" />
                  </div>
                  <div className="skeleton h-4 rounded w-14" />
                </div>
              ))}
            </div>
          ) : filteredTxs.length > 0 ? (
            <div className="space-y-0.5">
              {filteredTxs.map((tx) => {
                const cfg = TX_CONFIG[tx.type] || TX_CONFIG.credit;
                const TxIcon = cfg.Icon;
                const isPositive = ['credit', 'release', 'refund'].includes(tx.type);
                return (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800/40 transition-colors">
                    <div className={`w-9 h-9 rounded-xl border ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <TxIcon className={`w-4 h-4 ${cfg.color}`} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-100 truncate">{tx.description || cfg.label}</p>
                      <p className="text-xs text-dark-600">
                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}<span className="capitalize">{cfg.label}</span>
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : '−'}${Number(tx.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700/50 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-dark-600" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-dark-400">No transactions found</p>
              <p className="text-xs text-dark-600 mt-1.5">
                {filter !== 'All'
                  ? `No ${filter.toLowerCase()} transactions match the current filters`
                  : 'Transactions will appear here once you start working'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {addModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              className="card w-full max-w-sm p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Add Funds to Wallet</h3>
                <button onClick={() => setAddModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-500 hover:text-white hover:bg-dark-800 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 250, 500, 1000, 2000].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                      amount == a
                        ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                        : 'border-dark-700 text-dark-400 hover:border-dark-600 hover:text-dark-200'
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddFunds} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 text-sm">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input pl-8"
                    placeholder="Custom amount"
                    min="10"
                  />
                </div>
                <p className="text-2xs text-dark-600">Platform fee: 3% · Min $10 · Demo mode — no real charges</p>
                <button type="submit" disabled={adding} className="btn btn-primary w-full">
                  {adding ? 'Processing…' : `Add $${amount || '0'} to Wallet`}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
