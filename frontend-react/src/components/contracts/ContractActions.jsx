import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Loader2, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import DisputeModal from './DisputeModal';

export default function ContractActions({ contract, onChanged }) {
  const { user } = useAuthStore();
  const [busy, setBusy] = useState(null);
  const [showDispute, setShowDispute] = useState(false);
  const [showCancel,  setShowCancel]  = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [showFund,    setShowFund]    = useState(false);

  const allowed  = contract.allowed_actions || {};
  const isClient = Number(user?.id) === Number(contract.client_id);
  const canFundEscrow = isClient && contract.status === 'active';

  const run = async (key, promise, successMsg) => {
    setBusy(key);
    try {
      await promise;
      toast.success(successMsg);
      onChanged?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  const onComplete = () => {
    if (!confirm('Complete this contract? Any remaining escrow will be refunded to you.')) return;
    run('complete', api.contracts.complete(contract.id), 'Contract completed');
  };

  const onCancel  = (reason) => run('cancel',  api.contracts.cancel(contract.id, reason),  'Contract cancelled').then(() => setShowCancel(false));
  const onDispute = (reason) => run('dispute', api.contracts.dispute(contract.id, reason), 'Dispute opened').then(() => setShowDispute(false));

  const nothingAvailable = !allowed.complete && !allowed.cancel && !allowed.dispute && !allowed.resolve_dispute && !canFundEscrow;

  if (nothingAvailable) {
    return (
      <p className="text-2xs text-dark-500 italic">
        No actions available on this contract.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {canFundEscrow && (
          <button
            onClick={() => setShowFund(true)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold hover:bg-blue-500/25 disabled:opacity-40 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            Fund escrow
          </button>
        )}
        </div>
      <div className="flex flex-wrap gap-2">
        {allowed.complete && (
          <button
            onClick={onComplete}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-semibold disabled:opacity-40 transition-colors"
          >
            {busy === 'complete'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <CheckCircle2 className="w-3.5 h-3.5" />}
            Complete contract
          </button>
        )}

        {allowed.cancel && (
          <button
            onClick={() => setShowCancel(true)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/25 disabled:opacity-40 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel contract
          </button>
        )}

        {allowed.dispute && (
          <button
            onClick={() => setShowDispute(true)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 disabled:opacity-40 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Open dispute
          </button>
        )}

        {allowed.resolve_dispute && (
          <button
            onClick={() => setShowResolve(!showResolve)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-semibold hover:bg-primary-500/25 disabled:opacity-40 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {showResolve ? 'Close resolve panel' : 'Resolve dispute'}
          </button>
        )}
      </div>

      {/* Admin resolve-dispute inline panel */}
      <AnimatePresence>
        {showResolve && allowed.resolve_dispute && (
          <ResolvePanel
            contract={contract}
            busy={busy === 'resolve'}
            onSubmit={async (payload) => {
              await run('resolve', api.contracts.resolveDispute(contract.id, payload), 'Dispute resolved');
              setShowResolve(false);
            }}
          />
        )}
      </AnimatePresence>

      <DisputeModal open={showDispute} mode="dispute" onClose={() => setShowDispute(false)} onSubmit={onDispute} />
      <DisputeModal open={showCancel}  mode="cancel"  onClose={() => setShowCancel(false)}  onSubmit={onCancel}  />
      <FundEscrowModal
        open={showFund}
        contract={contract}
        onClose={() => setShowFund(false)}
        onFunded={() => { setShowFund(false); onChanged?.(); }}
      />
    </div>
  );
}

function FundEscrowModal({ open, contract, onClose, onFunded }) {
  const [amount, setAmount] = useState('');
  const [busy,   setBusy]   = useState(false);

  const escrow = Number(contract.escrow_amount || 0);

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) return toast.error('Enter a valid amount');
    setBusy(true);
    try {
      await api.payments.fundEscrow(contract.id, { amount: n });
      toast.success(`$${n.toFixed(2)} moved to escrow`);
      setAmount('');
      onFunded();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to fund escrow');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 8 }}
          className="rounded-2xl border border-dark-700 bg-dark-900 w-full max-w-sm p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" /> Fund Escrow
              </h3>
              <p className="text-2xs text-dark-500 mt-0.5">Currently locked: ${escrow.toFixed(2)}</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-500 hover:text-white hover:bg-dark-800 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-dark-400 leading-relaxed">
            Move funds from your wallet balance into this contract's escrow. The freelancer gets paid when you approve a milestone.
          </p>

          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 text-sm">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to lock in escrow"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-dark-700 bg-dark-800 text-sm text-dark-100 outline-none focus:border-blue-500/50"
              />
            </div>
            <p className="text-2xs text-dark-600">Funds are deducted from your wallet balance and held securely.</p>
            <button
              type="submit"
              disabled={busy || !amount}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold disabled:opacity-40 transition-colors"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              {busy ? 'Processing…' : 'Lock in escrow'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Admin-only inline form for resolving a dispute. */
function ResolvePanel({ contract, onSubmit, busy }) {
  const [outcome, setOutcome] = useState('refund_to_client');
  const [splitFreelancer, setSplitFreelancer] = useState('');
  const [notes, setNotes] = useState('');

  const escrow = Number(contract.escrow_amount) || 0;
  const splitAmount = Number(splitFreelancer);
  const splitInvalid = outcome === 'split' && (isNaN(splitAmount) || splitAmount < 0 || splitAmount > escrow);

  const submit = () => onSubmit({
    outcome,
    notes: notes.trim() || undefined,
    ...(outcome === 'split' ? { split_freelancer_amount: splitAmount } : {}),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      className="rounded-2xl border border-dark-800 bg-dark-900/60 p-4 space-y-3"
    >
      <div className="text-xs font-bold text-dark-100">Resolve dispute — choose an outcome</div>

      <div className="space-y-2">
        {[
          ['refund_to_client',      'Refund all escrow to client', `Refunds $${escrow.toFixed(2)} back to client; contract → cancelled`],
          ['release_to_freelancer', 'Release all escrow to freelancer', `Sends $${escrow.toFixed(2)} to freelancer; contract → active`],
          ['split',                 'Split escrow', `Choose how to split $${escrow.toFixed(2)}; contract → active`],
        ].map(([value, label, sub]) => (
          <label key={value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            outcome === value ? 'bg-primary-500/10 border-primary-500/40' : 'border-dark-800 hover:border-dark-700'
          }`}>
            <input
              type="radio"
              name="outcome"
              value={value}
              checked={outcome === value}
              onChange={(e) => setOutcome(e.target.value)}
              className="mt-0.5 accent-primary-500"
            />
            <div className="flex-1">
              <div className="text-xs font-semibold text-dark-100">{label}</div>
              <div className="text-2xs text-dark-500 mt-0.5">{sub}</div>
            </div>
          </label>
        ))}
      </div>

      {outcome === 'split' && (
        <div className="space-y-1">
          <label className="text-2xs text-dark-500 font-semibold uppercase tracking-wider">Amount to freelancer (USD)</label>
          <input
            type="number" min="0" max={escrow} step="0.01"
            value={splitFreelancer}
            onChange={(e) => setSplitFreelancer(e.target.value)}
            className="w-full rounded-lg border border-dark-700 bg-dark-800 px-3 py-2 text-sm text-dark-100 outline-none focus:border-primary-500/50"
          />
          {splitInvalid && <p className="text-2xs text-red-400">Must be between 0 and ${escrow.toFixed(2)}.</p>}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-2xs text-dark-500 font-semibold uppercase tracking-wider">Notes (optional, internal)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-dark-700 bg-dark-800 px-3 py-2 text-xs text-dark-100 outline-none focus:border-primary-500/50 resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={busy || splitInvalid}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold disabled:opacity-40 transition-colors"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          Apply resolution
        </button>
      </div>
    </motion.div>
  );
}
