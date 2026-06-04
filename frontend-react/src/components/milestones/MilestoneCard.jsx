import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Upload, CheckCircle2, XCircle, Edit2, Trash2 } from 'lucide-react';
import MilestoneStatusBadge from './MilestoneStatusBadge';

const fmtMoney = (n) => `$${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtDate  = (iso) => iso ? new Date(iso).toLocaleDateString() : '—';

/**
 * One milestone summary. The action callbacks are optional — pass only the ones
 * the current user is allowed to perform. The card renders the actions that
 * have a handler AND are status-appropriate.
 */
export default function MilestoneCard({
  milestone, onSubmit, onApprove, onReject, onEdit, onDelete, busy,
}) {
  const m = milestone;
  const canSubmit  = onSubmit  && ['pending', 'in_progress', 'rejected'].includes(m.status);
  const canApprove = onApprove && m.status === 'submitted';
  const canReject  = onReject  && m.status === 'submitted';
  const canEdit    = onEdit    && !['paid', 'approved'].includes(m.status);
  const canDelete  = onDelete  && !['paid', 'approved', 'submitted'].includes(m.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
      className="rounded-2xl border border-dark-800 bg-dark-900 p-4 hover:border-dark-700 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link to={`/milestones/${m.id}`} className="min-w-0 flex-1 group">
          <h3 className="text-sm font-bold text-dark-100 truncate group-hover:text-white">{m.title}</h3>
          {m.description && <p className="text-2xs text-dark-400 mt-1 line-clamp-2">{m.description}</p>}
          {m.rejection_reason && (
            <p className="mt-2 text-2xs text-red-300 border-l-2 border-red-500/30 pl-2 italic">Rejected: {m.rejection_reason}</p>
          )}
        </Link>
        <MilestoneStatusBadge status={m.status} />
      </div>

      <div className="flex items-center gap-4 text-2xs text-dark-400">
        <span className="font-bold text-dark-100">{fmtMoney(m.amount)}</span>
        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(m.due_at)}</span>
        <Link to={`/milestones/${m.id}`} className="ml-auto inline-flex items-center gap-1 text-primary-400 hover:underline">
          Details <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {(canSubmit || canApprove || canReject || canEdit || canDelete) && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-dark-800/60">
          {canSubmit && (
            <button onClick={() => onSubmit(m)} disabled={busy}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-2xs font-semibold hover:bg-blue-500/25 disabled:opacity-40 transition-colors">
              <Upload className="w-3 h-3" /> Submit work
            </button>
          )}
          {canApprove && (
            <button onClick={() => onApprove(m)} disabled={busy}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-2xs font-bold disabled:opacity-40 transition-colors">
              <CheckCircle2 className="w-3 h-3" /> Approve & release
            </button>
          )}
          {canReject && (
            <button onClick={() => onReject(m)} disabled={busy}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-2xs font-semibold hover:bg-red-500/25 disabled:opacity-40 transition-colors">
              <XCircle className="w-3 h-3" /> Reject
            </button>
          )}
          {canEdit && (
            <button onClick={() => onEdit(m)} disabled={busy}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-2xs text-dark-300 hover:text-white disabled:opacity-40">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(m)} disabled={busy}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-2xs text-dark-300 hover:text-red-400 disabled:opacity-40">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
