import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Paperclip, Trash2 } from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

export default function SubmitWorkModal({ open, onClose, milestone, onSubmitted }) {
  const [message,     setMessage]     = useState('');
  const [attachments, setAttachments] = useState([]);
  const [busy,        setBusy]        = useState(false);
  const [errors,      setErrors]      = useState({});

  useEffect(() => {
    if (!open) { setMessage(''); setAttachments([]); setBusy(false); setErrors({}); }
  }, [open]);

  if (!open || !milestone) return null;

  const addAttachment = () => {
    const url = prompt('Attachment URL (you can paste a Google Drive / public link)');
    if (!url) return;
    const name = prompt('Name for this attachment', url.split('/').pop() || 'file') || url;
    setAttachments((a) => [...a, { url: url.trim(), name: name.trim() }]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({}); setBusy(true);
    try {
      await api.milestones.submit(milestone.id, {
        submission_message: message.trim(),
        attachments: attachments.length ? attachments : null,
      });
      toast.success('Submitted for review');
      onSubmitted?.();
    } catch (e) {
      setErrors(e?.response?.data?.errors || {});
      toast.error(e?.response?.data?.message || 'Submission failed');
    } finally {
      setBusy(false);
    }
  };

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
              <h3 className="text-sm font-bold text-dark-50">Submit work — {milestone.title}</h3>
              <p className="text-2xs text-dark-500 mt-0.5">The client will review and approve to release ${Number(milestone.amount).toFixed(2)}.</p>
            </div>
            <button type="button" onClick={onClose} className="text-dark-500 hover:text-dark-200 p-1"><X className="w-4 h-4" /></button>
          </div>

          <div>
            <div className="text-2xs text-dark-500 font-semibold uppercase tracking-wider mb-1">Submission message</div>
            <textarea autoFocus rows={5} maxLength={5000}
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="What did you deliver? Link to the PR / live preview / repository."
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 resize-none outline-none focus:border-primary-500/50"
            />
            {errors.submission_message && <p className="text-2xs text-red-400 mt-1">{errors.submission_message[0]}</p>}
            <div className="text-2xs text-dark-500 text-right mt-1">{message.trim().length} chars</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-2xs text-dark-500 font-semibold uppercase tracking-wider">Attachments ({attachments.length})</div>
              <button type="button" onClick={addAttachment}
                className="inline-flex items-center gap-1 text-2xs text-primary-400 hover:underline">
                <Paperclip className="w-3 h-3" /> Add link
              </button>
            </div>
            {attachments.length > 0 && (
              <ul className="space-y-1">
                {attachments.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-lg bg-dark-800 border border-dark-700 px-3 py-1.5">
                    <Paperclip className="w-3 h-3 text-dark-500" />
                    <a href={a.url} target="_blank" rel="noreferrer" className="flex-1 text-2xs text-dark-200 truncate hover:text-white">{a.name}</a>
                    <button type="button" onClick={() => setAttachments((arr) => arr.filter((_, idx) => idx !== i))} className="text-dark-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-300 hover:bg-dark-700">Cancel</button>
            <button type="submit" disabled={busy || message.trim().length < 3}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold disabled:opacity-40 transition-colors">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Submit for review
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
