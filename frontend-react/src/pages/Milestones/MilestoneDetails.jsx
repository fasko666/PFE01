import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2, Calendar, DollarSign, FileSignature, ArrowRight, MessageSquare,
  Upload, CheckCircle2, XCircle, Edit2, Trash2, Paperclip, User as UserIcon,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import UserAvatar from '../../components/ui/UserAvatar';
import MilestoneStatusBadge from '../../components/milestones/MilestoneStatusBadge';
import MilestoneTimeline    from '../../components/milestones/MilestoneTimeline';
import SubmitWorkModal      from '../../components/milestones/SubmitWorkModal';
import RejectWorkModal      from '../../components/milestones/RejectWorkModal';
import toast from 'react-hot-toast';

const fmtMoney = (n) => `$${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtDate  = (iso) => iso ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function MilestoneDetails() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const [milestone, setMilestone] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [busy,      setBusy]      = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const { data } = await api.milestones.get(id); setMilestone(data.data); }
    catch (e) { setError(e?.response?.data?.message || 'Failed to load milestone'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>;
  if (error || !milestone) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center max-w-md mx-auto mt-12">
        <p className="text-sm text-red-300 mb-3">{error || 'Milestone not found'}</p>
        <button onClick={load} className="text-xs font-semibold text-red-200 underline">Try again</button>
      </div>
    );
  }

  const m        = milestone;
  const allowed  = m.allowed_actions || {};
  const contract = m.contract || {};
  const isClient     = Number(user?.id) === Number(contract.client_id);
  const isFreelancer = Number(user?.id) === Number(contract.freelancer_id);

  const approve = async () => {
    if (!confirm(`Approve and release ${fmtMoney(m.amount)} to the freelancer?`)) return;
    setBusy(true);
    try { await api.milestones.approve(m.id); toast.success('Milestone approved & funds released'); await load(); }
    catch (e) { toast.error(e?.response?.data?.message || 'Approve failed'); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm('Delete this milestone? This cannot be undone.')) return;
    setBusy(true);
    try { await api.milestones.delete(m.id); toast.success('Deleted'); }
    catch (e) { toast.error(e?.response?.data?.message || 'Delete failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-2xs text-dark-500 mb-1">
              <FileSignature className="w-3.5 h-3.5" /> Milestone #{m.id}
              {contract.id && (<><span>·</span>
                <Link to={`/contracts/${contract.id}`} className="text-primary-400 hover:underline truncate">{contract.title}</Link>
              </>)}
            </div>
            <h1 className="text-2xl font-bold font-display text-dark-50 mb-3 line-clamp-2">{m.title}</h1>
            <MilestoneStatusBadge status={m.status} size="lg" />
          </div>
        </div>

        {m.rejection_reason && m.status === 'rejected' && (
          <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-2xs text-red-200">
            <div className="font-semibold text-red-100">Client rejected this submission</div>
            <div className="mt-1 whitespace-pre-wrap">{m.rejection_reason}</div>
          </motion.div>
        )}
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Money + dates */}
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
            <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-3">Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat Icon={DollarSign} color="text-green-400"   label="Amount"     value={fmtMoney(m.amount)} />
              <Stat Icon={Calendar}   color="text-primary-400" label="Due"        value={fmtDate(m.due_at)} small />
              <Stat Icon={Calendar}   color="text-yellow-300"  label="Submitted"  value={fmtDate(m.submitted_at)} small />
              <Stat Icon={Calendar}   color="text-green-300"   label="Approved"   value={fmtDate(m.approved_at)} small />
            </div>
          </div>

          {/* Description */}
          {m.description && (
            <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
              <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-2">Description</h2>
              <p className="text-sm text-dark-300 whitespace-pre-wrap leading-relaxed">{m.description}</p>
            </div>
          )}

          {/* Submission */}
          {m.submission_notes && (
            <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
              <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-2">Submission</h2>
              <p className="text-sm text-dark-300 whitespace-pre-wrap leading-relaxed">{m.submission_notes}</p>
              {m.submitter && (
                <div className="mt-3 flex items-center gap-2 text-2xs text-dark-500">
                  <UserAvatar user={m.submitter} size={20} ring={false} />
                  Submitted by {m.submitter.name} · {fmtDate(m.submitted_at)}
                </div>
              )}
              {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {m.attachments.map((a, i) => (
                    <li key={i}>
                      <a href={a.url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:underline">
                        <Paperclip className="w-3 h-3" /> {a.name || a.url}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Payments */}
          {(m.payments?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden">
              <div className="px-5 py-3 border-b border-dark-800">
                <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider">Payment history</h2>
              </div>
              <ul className="divide-y divide-dark-800">
                {m.payments.map((p) => (
                  <li key={p.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-dark-100 truncate">{p.description || p.type}</div>
                      <div className="text-2xs text-dark-500 mt-0.5">{fmtDate(p.created_at)} · {p.reference}</div>
                    </div>
                    <div className={`text-xs font-bold ${p.direction === 'in' ? 'text-green-400' : 'text-red-300'}`}>
                      {p.direction === 'in' ? '+' : '−'}{fmtMoney(p.amount)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Actions panel — server-driven */}
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
            <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-3">Actions</h2>
            {!(allowed.submit || allowed.approve || allowed.reject || allowed.delete) ? (
              <p className="text-2xs text-dark-500 italic">No actions available right now.</p>
            ) : (
              <div className="space-y-2">
                {allowed.submit && (
                  <button onClick={() => setShowSubmit(true)} disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold hover:bg-blue-500/25 disabled:opacity-40">
                    <Upload className="w-3.5 h-3.5" /> Submit work
                  </button>
                )}
                {allowed.approve && (
                  <button onClick={approve} disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold disabled:opacity-40">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & release
                  </button>
                )}
                {allowed.reject && (
                  <button onClick={() => setShowReject(true)} disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/25 disabled:opacity-40">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                {allowed.delete && (
                  <button onClick={remove} disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs text-dark-300 hover:text-red-400 disabled:opacity-40">
                    <Trash2 className="w-3.5 h-3.5" /> Delete milestone
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Activity timeline */}
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
            <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-4">Activity</h2>
            <MilestoneTimeline milestone={m} activities={m.activities || []} />
          </div>

          {/* Shortcuts */}
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-3 space-y-1">
            {contract.id && (
              <Link to={`/contracts/${contract.id}`}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-dark-800/70 transition-colors text-sm">
                <span className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center">
                  <FileSignature className="w-4 h-4 text-dark-300" />
                </span>
                <span className="text-dark-200 flex-1">Back to contract</span>
                <ArrowRight className="w-3.5 h-3.5 text-dark-500" />
              </Link>
            )}
            {contract.client?.username && (
              <Link to={`/freelancers/${contract.client.username}`}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-dark-800/70 transition-colors text-sm">
                <span className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-dark-300" />
                </span>
                <span className="text-dark-200 flex-1">View client profile</span>
                <ArrowRight className="w-3.5 h-3.5 text-dark-500" />
              </Link>
            )}
            {contract.freelancer?.username && (
              <Link to={`/freelancers/${contract.freelancer.username}`}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-dark-800/70 transition-colors text-sm">
                <span className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-dark-300" />
                </span>
                <span className="text-dark-200 flex-1">View freelancer profile</span>
                <ArrowRight className="w-3.5 h-3.5 text-dark-500" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <SubmitWorkModal open={showSubmit} milestone={m} onClose={() => setShowSubmit(false)} onSubmitted={() => { setShowSubmit(false); load(); }} />
      <RejectWorkModal open={showReject} milestone={m} onClose={() => setShowReject(false)} onRejected={() => { setShowReject(false); load(); }} />
    </div>
  );
}

function Stat({ Icon, color, label, value, small }) {
  return (
    <div className="rounded-xl border border-dark-800 bg-dark-900/40 p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <div className="text-2xs text-dark-500 uppercase tracking-wider">{label}</div>
      </div>
      <div className={`${small ? 'text-xs' : 'text-base'} font-bold text-dark-100`}>{value}</div>
    </div>
  );
}
