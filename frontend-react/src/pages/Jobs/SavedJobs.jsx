import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, BookmarkCheck, DollarSign, BarChart3,
  FileText, MapPin, ChevronLeft, ChevronRight, Trash2,
} from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function SavedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs]     = useState([]);
  const [meta, setMeta]     = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);
  const [removing, setRemoving] = useState(new Set());

  const fetchSaved = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.jobs.getSaved({ page: p, per_page: 12 });
      setJobs(res.data.data?.data || []);
      setMeta(res.data.data?.meta || {});
    } catch {
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSaved(page); }, [page]);

  const unsave = async (jobId, e) => {
    e.stopPropagation();
    setRemoving((prev) => new Set(prev).add(jobId));
    try {
      await api.jobs.save(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setMeta((m) => ({ ...m, total: Math.max(0, (m.total || 1) - 1) }));
      toast.success('Job removed from saved');
    } catch {
      toast.error('Failed to remove job');
    } finally {
      setRemoving((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
    }
  };

  const budgetLabel = (job) => {
    if (job.job_type === 'hourly') return `$${job.budget_min}–$${job.budget_max}/hr`;
    return `$${job.budget_min}–$${job.budget_max}`;
  };

  const timeAgo = (date) => {
    const h = Math.floor((Date.now() - new Date(date)) / 3600000);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-primary-400" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">Saved Jobs</h1>
            <p className="text-sm text-dark-500 mt-0.5">
              {loading ? 'Loading…' : `${meta.total ?? 0} saved job${meta.total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-5 rounded-lg w-2/3" />
                <div className="skeleton h-5 w-16 rounded-lg" />
              </div>
              <div className="skeleton h-4 rounded-lg w-full" />
              <div className="skeleton h-4 rounded-lg w-3/4" />
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => <div key={j} className="skeleton h-5 w-16 rounded-full" />)}
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <motion.div {...fadeUp(0.05)} className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700/50 flex items-center justify-center mx-auto mb-5">
            <Bookmark className="w-7 h-7 text-dark-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">No saved jobs yet</h3>
          <p className="text-sm text-dark-500 mb-5">Browse the marketplace and bookmark jobs you like</p>
          <button onClick={() => navigate('/search?type=jobs')} className="btn btn-primary gap-2 mx-auto">
            Browse Jobs
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="card p-5 cursor-pointer card-hover group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                        {job.title}
                      </h3>
                      {job.is_featured && (
                        <span className="badge text-2xs bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Featured</span>
                      )}
                    </div>
                    <p className="text-xs text-dark-500 mb-2">
                      {job.client?.name} · Posted {timeAgo(job.created_at)}
                    </p>
                    <p className="text-sm text-dark-300 line-clamp-2 mb-3">{job.description}</p>

                    {job.skills_required?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills_required.slice(0, 5).map((s) => (
                          <span key={s} className="badge badge-primary text-2xs">{s}</span>
                        ))}
                        {job.skills_required.length > 5 && (
                          <span className="text-xs text-dark-600">+{job.skills_required.length - 5}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-dark-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-500" strokeWidth={2} />
                        <span className="font-medium text-green-400">{budgetLabel(job)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" strokeWidth={2} />
                        {job.experience_level}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" strokeWidth={2} />
                        {job.proposals_count} proposals
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" strokeWidth={2} />
                          {job.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unsave button */}
                  <button
                    onClick={(e) => unsave(job.id, e)}
                    disabled={removing.has(job.id)}
                    title="Remove from saved"
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors text-primary-400 hover:text-red-400 disabled:opacity-50"
                  >
                    {removing.has(job.id)
                      ? <BookmarkCheck className="w-4 h-4 animate-pulse" strokeWidth={2} />
                      : <BookmarkCheck className="w-4 h-4" strokeWidth={2} />
                    }
                  </button>
                </div>
              </motion.div>
            ))}
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
