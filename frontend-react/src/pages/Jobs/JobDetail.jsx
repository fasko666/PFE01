import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, BarChart3, Clock, FileText, FolderOpen, MapPin,
  Globe, X, Sparkles, Loader2, ChevronRight, MessageSquare, Send,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [proposal, setProposal] = useState({ cover_letter: '', bid_amount: '', estimated_days: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.jobs.get(id)
      .then((r) => setJob(r.data.data))
      .catch(() => { toast.error('Job not found'); navigate('/jobs'); })
      .finally(() => setLoading(false));
  }, [id]);

  const generateAiProposal = async () => {
    if (!job) return;
    setAiLoading(true);
    try {
      const res = await api.aiApi.generateProposal({ job_id: job.id });
      setProposal((p) => ({ ...p, cover_letter: res.data.data?.proposal || res.data.proposal || '' }));
      toast.success('AI proposal generated!');
    } catch {
      toast.error('AI unavailable — try writing manually');
    } finally {
      setAiLoading(false);
    }
  };

  const submitProposal = async (e) => {
    e.preventDefault();
    if (!proposal.cover_letter.trim()) return toast.error('Cover letter is required');
    if (!proposal.bid_amount) return toast.error('Bid amount is required');
    setSubmitting(true);
    try {
      await api.proposals.create({ job_id: job.id, ...proposal });
      toast.success('Proposal submitted!');
      setShowModal(false);
      navigate('/my-proposals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5 animate-pulse">
        <div className="skeleton h-4 rounded-lg w-48" />
        <div className="card p-6 space-y-4">
          <div className="skeleton h-7 rounded-lg w-3/4" />
          <div className="skeleton h-4 rounded-lg w-1/2" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
          <div className="skeleton h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) return null;

  const isFreelancer = user?.role === 'freelancer';
  const isOwner = user?.id === job.client_id;
  const budgetLabel = job.job_type === 'hourly'
    ? `$${job.budget_min}–$${job.budget_max}/hr`
    : `$${job.budget_min}–$${job.budget_max}`;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <motion.div {...fadeUp(0)} className="flex items-center gap-1.5 text-sm text-dark-500">
        <Link to="/jobs" className="hover:text-white transition-colors">Find Work</Link>
        <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
        <span className="text-dark-300 truncate">{job.title}</span>
      </motion.div>

      {/* Main card */}
      <motion.div {...fadeUp(0.05)} className="card p-6 space-y-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {job.is_featured && (
                <span className="badge text-2xs bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Featured</span>
              )}
              <span className={`badge text-2xs ${job.status === 'open' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'badge-primary'}`}>
                {job.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-dark-100 leading-tight">{job.title}</h1>
            <p className="text-xs text-dark-500 mt-1.5">
              Posted by <span className="text-dark-300">{job.client?.name}</span> · {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {isFreelancer && job.status === 'open' && (
              <button onClick={() => setShowModal(true)} className="btn btn-primary gap-1.5">
                <Send className="w-3.5 h-3.5" strokeWidth={2} />
                Submit Proposal
              </button>
            )}
            {isOwner && (
              <Link to={`/jobs/${job.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
            )}
          </div>
        </div>

        {/* Key stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: DollarSign, label: 'Budget',     value: budgetLabel,                           color: 'text-green-400',   bg: 'bg-green-500/10' },
            { icon: BarChart3,  label: 'Experience', value: job.experience_level,                  color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { icon: Clock,      label: 'Duration',   value: job.project_duration?.replace(/_/g, ' ') || 'TBD', color: 'text-accent-400',  bg: 'bg-accent-500/10' },
            { icon: FileText,   label: 'Proposals',  value: `${job.proposals_count} submitted`,    color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 text-center">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`w-4 h-4 ${s.color}`} strokeWidth={2} />
                </div>
                <div className="text-xs text-dark-500">{s.label}</div>
                <div className="text-sm font-semibold text-dark-100 mt-0.5 capitalize">{s.value}</div>
              </div>
            );
          })}
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-dark-100 mb-2.5">Job Description</h3>
          <div className="text-sm text-dark-300 leading-relaxed whitespace-pre-wrap">{job.description}</div>
        </div>

        {/* Skills */}
        {job.skills_required?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-dark-100 mb-2.5">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills_required.map((s) => (
                <span key={s} className="badge badge-primary">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-dark-500 pt-4 border-t border-dark-800">
          {job.category && (
            <span className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" strokeWidth={2} />
              {job.category.name}
            </span>
          )}
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
              {job.location}
            </span>
          )}
          {job.is_remote && (
            <span className="flex items-center gap-1.5 text-green-400">
              <Globe className="w-3.5 h-3.5" strokeWidth={2} />
              Remote OK
            </span>
          )}
        </div>
      </motion.div>

      {/* Client info */}
      <motion.div {...fadeUp(0.1)} className="card p-5">
        <h3 className="text-sm font-semibold text-dark-100 mb-3">About the Client</h3>
        <div className="flex items-center gap-3">
          <img
            src={job.client?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.client?.name || 'C')}&background=4361ff&color=fff`}
            alt={job.client?.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-dark-700"
          />
          <div>
            <p className="text-sm font-semibold text-dark-100">{job.client?.name}</p>
            <p className="text-xs text-dark-500">Client</p>
          </div>
          {isFreelancer && (
            <button
              onClick={async () => {
                try {
                  await api.chat.start({ user_id: job.client_id });
                  navigate('/messages');
                } catch { toast.error('Failed to start conversation'); }
              }}
              className="ml-auto btn btn-ghost btn-sm gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
              Contact Client
            </button>
          )}
        </div>
      </motion.div>

      {/* Proposal modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="card w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto scrollbar-none"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-dark-100">Submit Proposal</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-all"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-800/50 border border-dark-700">
                <p className="text-sm font-medium text-dark-100 truncate">{job.title}</p>
                <p className="text-xs text-dark-500 mt-0.5">Budget: {budgetLabel}</p>
              </div>

              <form onSubmit={submitProposal} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="input-label mb-0">Cover Letter</label>
                    <button
                      type="button"
                      onClick={generateAiProposal}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50"
                    >
                      {aiLoading
                        ? <><Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} /> Generating…</>
                        : <><Sparkles className="w-3 h-3" strokeWidth={2} /> AI Generate</>
                      }
                    </button>
                  </div>
                  <textarea
                    value={proposal.cover_letter}
                    onChange={(e) => setProposal({ ...proposal, cover_letter: e.target.value })}
                    className="input h-36 resize-none"
                    placeholder="Explain why you're the best fit for this job…"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Your Bid (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">$</span>
                      <input
                        type="number"
                        value={proposal.bid_amount}
                        onChange={(e) => setProposal({ ...proposal, bid_amount: e.target.value })}
                        className="input pl-7"
                        placeholder={job.budget_min}
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Duration (days)</label>
                    <input
                      type="number"
                      value={proposal.estimated_days}
                      onChange={(e) => setProposal({ ...proposal, estimated_days: e.target.value })}
                      className="input"
                      placeholder="e.g. 7"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary flex-1 gap-1.5"
                  >
                    {submitting
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> Submitting…</>
                      : <><Send className="w-3.5 h-3.5" strokeWidth={2} /> Submit Proposal</>
                    }
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
