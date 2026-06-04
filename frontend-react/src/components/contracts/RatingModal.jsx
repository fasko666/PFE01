import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Loader2 } from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

export default function RatingModal({ open, onClose, revieweeId, revieweeName, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover]   = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) return null;
  const submit = async () => {
    setBusy(true);
    try {
      await api.reviews.create({ reviewee_id: revieweeId, rating, comment: comment.trim() || undefined });
      toast.success('Review submitted'); onSubmitted?.(); onClose();
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed to submit review'); }
    finally { setBusy(false); }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{y:16, opacity:0}} animate={{y:0,opacity:1}} exit={{y:16,opacity:0}}
          className="w-full max-w-md rounded-2xl bg-dark-900 border border-dark-800 p-5 space-y-4" onClick={e=>e.stopPropagation()}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-dark-50">Rate {revieweeName}</h3>
              <p className="text-2xs text-dark-500 mt-0.5">Honest feedback helps the marketplace.</p>
            </div>
            <button onClick={onClose} className="text-dark-500 hover:text-dark-200 p-1"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(n)}>
                <Star className={`w-8 h-8 ${(hover||rating) >= n ? 'fill-yellow-400 text-yellow-400' : 'text-dark-700'}`} />
              </button>
            ))}
          </div>

          <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={4} placeholder="Write a comment (optional)"
            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-100 resize-none" />

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-300 hover:bg-dark-700">Cancel</button>
            <button onClick={submit} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold disabled:opacity-40">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />} Submit
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
