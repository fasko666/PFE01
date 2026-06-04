import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Generic textarea-reason modal used for:
 *   - opening a dispute (mode: 'dispute', min 10 chars)
 *   - cancelling a contract (mode: 'cancel', min 5 chars)
 *
 * Calls `onSubmit(reason)` and waits for the returned promise. Closes on
 * success. The parent owns the success toast.
 */
export default function DisputeModal({ open, mode = 'dispute', onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) { setReason(''); setBusy(false); }
  }, [open]);

  if (!open) return null;

  const config = mode === 'cancel'
    ? { title: 'Cancel contract', cta: 'Cancel contract', placeholder: 'Why are you cancelling?', min: 5, danger: true }
    : { title: 'Open dispute',    cta: 'Open dispute',    placeholder: 'Explain what happened…',    min: 10, danger: false };

  const tooShort = reason.trim().length < config.min;

  const submit = async (e) => {
    e.preventDefault();
    if (tooShort) return;
    setBusy(true);
    try { await onSubmit(reason.trim()); }
    finally { setBusy(false); }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.form
          initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl bg-dark-900 border border-dark-800 p-5 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                config.danger ? 'bg-red-500/15 border-red-500/30' : 'bg-amber-500/15 border-amber-500/30'
              }`}>
                <AlertTriangle className={`w-4 h-4 ${config.danger ? 'text-red-300' : 'text-amber-300'}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-50">{config.title}</h3>
                <p className="text-2xs text-dark-500 mt-0.5">A clear reason helps resolution.</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-dark-500 hover:text-dark-200 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder={config.placeholder}
            className="w-full rounded-xl border border-dark-700 bg-dark-800 text-sm text-dark-100 p-3 outline-none focus:border-primary-500/50 resize-none"
          />
          <div className="text-2xs text-dark-500 text-right">
            {reason.trim().length} / {config.min} characters minimum
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs font-semibold text-dark-300 hover:bg-dark-700"
            >Cancel</button>
            <button
              type="submit" disabled={tooShort || busy}
              className={`px-4 py-2 rounded-full text-xs font-bold text-white disabled:opacity-40 transition-colors ${
                config.danger ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >{busy ? 'Submitting…' : config.cta}</button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
