import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, XCircle, Loader2 } from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

export default function RejectWorkModal({ open, onClose, milestone, onRejected }) {
  const [reason, setReason] = useState('');
  const [busy,   setBusy]   = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { if (!open) { setReason(''); setBusy(false); setErrors({}); } }, [open]);
  if (!open || !milestone) return null;

  const submit = async (e) => {
    e.preventDefault();
    setErrors({}); setBusy(true);
    try {
      await api.milestones.reject(milestone.id, reason.trim());
      toast.success('Milestone rejected');
      onRejected?.();
    } catch (e) {
      setErrors(e?.response?.data?.errors || {});
      toast.error(e?.response?.data?.message || 'Could not reject');
    } finally { setBusy(false); }
  };

  const tooShort = reason.trim().length < 5;

  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.form
          initial={{y:16, opacity:0}} animate={{y:0, opacity:1}} exit={{y:16, opacity:0}}
          onClick={(e) => e.stopPropagation()}
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl bg-dark-900 border border-dark-800 p-5 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-50">Reject — {milestone.title}</h3>
                <p className="text-2xs text-dark-500 mt-0.5">Tell the freelancer what to fix.</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-dark-500 hover:text-dark-200 p-1"><X className="w-4 h-4" /></button>
          </div>

          <textarea
            autoFocus rows={5} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="What needs to change? Be specific — the freelancer can re-submit."
            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 resize-none outline-none focus:border-red-500/50"
          />
          {errors.rejection_reason && <p className="text-2xs text-red-400">{errors.rejection_reason[0]}</p>}
          <div className="text-2xs text-dark-500 text-right">{reason.trim().length} / 5 chars minimum</div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-300 hover:bg-dark-700">Cancel</button>
            <button type="submit" disabled={tooShort || busy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold disabled:opacity-40 transition-colors">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />} Reject
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
