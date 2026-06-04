import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

export default function CreateMilestoneModal({ open, onClose, contractId, onCreated }) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [amount,      setAmount]      = useState('');
  const [dueDate,     setDueDate]     = useState('');
  const [errors,      setErrors]      = useState({});
  const [busy,        setBusy]        = useState(false);

  useEffect(() => {
    if (!open) { setTitle(''); setDescription(''); setAmount(''); setDueDate(''); setErrors({}); setBusy(false); }
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setErrors({}); setBusy(true);
    try {
      await api.milestones.create(contractId, {
        title:       title.trim(),
        description: description.trim(),
        amount:      Number(amount),
        due_date:    dueDate || null,
      });
      toast.success('Milestone created');
      onCreated?.();
    } catch (e) {
      setErrors(e?.response?.data?.errors || {});
      toast.error(e?.response?.data?.message || 'Could not create milestone');
    } finally {
      setBusy(false);
    }
  };

  const err = (k) => errors[k]?.[0];

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
            <div>
              <h3 className="text-sm font-bold text-dark-50">New milestone</h3>
              <p className="text-2xs text-dark-500 mt-0.5">Break the work into clear, payable steps.</p>
            </div>
            <button type="button" onClick={onClose} className="text-dark-500 hover:text-dark-200 p-1"><X className="w-4 h-4" /></button>
          </div>

          <Field label="Title" error={err('title')}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 outline-none focus:border-primary-500/50" />
          </Field>

          <Field label="Description" error={err('description')}>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={5000}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 resize-none outline-none focus:border-primary-500/50" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (USD)" error={err('amount')}>
              <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 outline-none focus:border-primary-500/50" />
            </Field>
            <Field label="Due date" error={err('due_date') || err('due_at')}>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 outline-none focus:border-primary-500/50" />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-300 hover:bg-dark-700">Cancel</button>
            <button type="submit" disabled={busy || !title || !description || !amount || !dueDate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold disabled:opacity-40 transition-colors">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Create milestone
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, children, error }) {
  return (
    <label className="block">
      <div className="text-2xs text-dark-500 font-semibold uppercase tracking-wider mb-1">{label}</div>
      {children}
      {error && <p className="text-2xs text-red-400 mt-1">{error}</p>}
    </label>
  );
}
