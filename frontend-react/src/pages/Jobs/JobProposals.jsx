import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, DollarSign, Clock, CheckCircle2,
  XCircle, ChevronLeft, ChevronRight, Loader2, MessageSquare,
  Sparkles, FileText,
} from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: [0.4, 0, 0.2, 1] },
});

const STATUS_STYLES = {
  pending:     'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  shortlisted: 'bg-blue-500/10  text-blue-400   border-blue-500/20',
  accepted:    'bg-green-500/10 text-green-400  border-green-500/20',
  rejected:    'bg-red-500/10   text-red-400    border-red-500/20',
  withdrawn:   'bg-dark-700     text-dark-500   border-dark-600',
};

export default function JobProposals() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [job, setJob]             = useState(null);
  const [proposals, setProposals] = useState([]);
  const [meta, setMeta]           = useState({});
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [acting, setActing]       = useState(null); // proposal id being actioned

  useEffect(() => {
    api.jobs.get(id)
      .then((r) => setJob(r.data.data))
      .catch(() => { toast.error('Job not found'); navigate('/my-jobs'); });
  }, [id]);

  useEffect(() => {
    setLoading(true);
    api.proposals.list(id)
      .then((r) => {
        const paginator = r.data.data;
        setProposals(paginator.data || []);
        setMeta({
          total:     paginator.total,
          last_page: paginator.last_page,
          per_page:  paginator.per_page,
        });
      })
      .catch(() => toast.error('Failed to load proposals'))
      .finally(() => setLoading(false));
  }, [id, page]);

  const handleAccept = async (proposal) => {
    if (!window.confirm(`Accept proposal from ${proposal.freelancer?.name}? This will create a contract.`)) return;
    setActing(proposal.id);
    try {
      const res = await api.proposals.accept(proposal.id);
      toast.success('Proposal accepted — contract created!');
      setProposals((prev) =>
        prev.map((p) => p.id === proposal.id ? { ...p, status: 'accepted' } : p)
      );
      if (res.data?.contract_id) navigate(`/contracts/${res.data.contract_id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept proposal');
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (proposal) => {
    if (!window.confirm(`Reject proposal from ${proposal.freelancer?.name}?`)) return;
    setActing(proposal.id);
    try {
      await api.proposals.reject(proposal.id);
      toast.success('Proposal rejected');
      setProposals((prev) =>
        prev.map((p) => p.id === proposal.id ? { ...p, status: 'rejected' } : p)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setActing(null);
    }
  };

  const timeAgo = (date) => {
    const h = Math.floor((Date.now() - new Date(date)) / 3600000);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Back button */}
      <motion.button
        {...fadeUp(0)}
        onClick={() => navigate('/my-jobs')}
        className="flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors text-sm group"
      >
        <span className="w-8 h-8 rounded-xl border border-dark-700 flex items-center justify-center group-hover:border-dark-500 group-hover:bg-dark-800 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
        </span>
        Back to My Jobs
      </motion.button>

      {/* Header */}
      <motion.div {...fadeUp(0.04)}>
        <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">
          Proposals
        </h1>
        {job && (
          <p className="text-sm text-dark-500 mt-1">
            {job.title} · {meta.total ?? 0} proposal{meta.total !== 1 ? 's' : ''}
          </p>
        )}
      </motion.div>

      {/* Proposals list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="skeleton w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-4 rounded w-40" />
                  <div className="skeleton h-3 rounded w-24" />
                </div>
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
              <div className="skeleton h-16 rounded-xl" />
              <div className="flex gap-2">
                <div className="skeleton h-8 w-24 rounded-lg" />
                <div className="skeleton h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <motion.div {...fadeUp(0.06)} className="card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-dark-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">No proposals yet</h3>
          <p className="text-sm text-dark-500">Freelancers haven't applied to this job yet.</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {proposals.map((proposal, i) => {
              const freelancer = proposal.freelancer;
              const profile    = freelancer?.freelancer_profile;
              const isActing   = acting === proposal.id;
              const canDecide  = ['pending', 'shortlisted'].includes(proposal.status);

              return (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-5 space-y-4"
                >
                  {/* Top row: freelancer info + status + bid */}
                  <div className="flex items-start gap-3">
                    <img
                      src={freelancer?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer?.name || 'F')}&background=4361ff&color=fff&size=64`}
                      alt={freelancer?.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-dark-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-dark-100">{freelancer?.name}</span>
                        {proposal.is_ai_generated && (
                          <span className="flex items-center gap-1 text-2xs text-primary-400 bg-primary-500/10 border border-primary-500/20 px-1.5 py-0.5 rounded-full">
                            <Sparkles className="w-2.5 h-2.5" strokeWidth={2} />
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-dark-500 mt-0.5">
                        {profile?.title || 'Freelancer'} · {timeAgo(proposal.created_at)}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span className={`badge text-2xs capitalize shrink-0 ${STATUS_STYLES[proposal.status] ?? STATUS_STYLES.pending}`}>
                      {proposal.status}
                    </span>
                  </div>

                  {/* Bid + duration */}
                  <div className="flex gap-4 text-xs text-dark-400">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-green-500" strokeWidth={2} />
                      <span className="font-semibold text-green-400 text-sm">${proposal.bid_amount}</span>
                      <span className="text-dark-500">{proposal.bid_type === 'hourly' ? '/hr' : 'fixed'}</span>
                    </span>
                    {proposal.estimated_duration && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                        {proposal.estimated_duration} {proposal.duration_unit || 'days'}
                      </span>
                    )}
                  </div>

                  {/* Cover letter */}
                  <div className="p-3.5 rounded-xl bg-dark-800/50 border border-dark-700">
                    <p className="text-xs font-semibold text-dark-500 uppercase tracking-widest mb-2">Cover Letter</p>
                    <p className="text-sm text-dark-300 leading-relaxed whitespace-pre-wrap line-clamp-5">
                      {proposal.cover_letter}
                    </p>
                  </div>

                  {/* Freelancer skills */}
                  {freelancer?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {freelancer.skills.slice(0, 6).map((s) => (
                        <span key={s.id ?? s} className="badge badge-primary text-2xs">
                          {s.name ?? s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-dark-800" />

                  {/* Action row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {canDecide && (
                      <>
                        <button
                          onClick={() => handleAccept(proposal)}
                          disabled={isActing}
                          className="btn btn-primary btn-sm gap-1.5 disabled:opacity-50"
                        >
                          {isActing
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                            : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                          }
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(proposal)}
                          disabled={isActing}
                          className="btn btn-ghost btn-sm gap-1.5 hover:text-red-400 hover:bg-red-500/8 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await api.chat.start({ user_id: proposal.freelancer_id });
                          navigate('/messages');
                        } catch { toast.error('Failed to start conversation'); }
                      }}
                      className="btn btn-ghost btn-sm gap-1.5 ml-auto"
                    >
                      <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
                      Message
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-ghost btn-sm gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Prev
          </button>
          <span className="text-sm text-dark-400 px-2">Page {page} of {meta.last_page}</span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
            className="btn btn-ghost btn-sm gap-1 disabled:opacity-40"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
