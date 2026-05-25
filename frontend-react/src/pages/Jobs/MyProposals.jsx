import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Clock, DollarSign, CheckCircle2, XCircle,
  MessageSquare, Search, FileText,
} from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  cls: 'bg-primary-500/10 text-primary-400 border-primary-500/20',   icon: Clock },
  accepted: { label: 'Accepted', cls: 'bg-green-500/10 text-green-400 border-green-500/20',          icon: CheckCircle2 },
  rejected: { label: 'Rejected', cls: 'bg-red-500/10 text-red-400 border-red-500/20',               icon: XCircle },
};

const TABS = ['all', 'pending', 'accepted', 'rejected'];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function MyProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.proposals.myProposals()
      .then((r) => setProposals(r.data.data?.data || []))
      .catch(() => toast.error('Failed to load proposals'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? proposals : proposals.filter((p) => p.status === filter);

  const counts = {};
  TABS.forEach((t) => {
    counts[t] = t === 'all' ? proposals.length : proposals.filter((p) => p.status === t).length;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">My Proposals</h1>
          <p className="text-sm text-dark-500 mt-1">{proposals.length} proposals submitted</p>
        </div>
        <Link to="/jobs" className="btn btn-primary btn-sm gap-1.5">
          <Search className="w-3.5 h-3.5" strokeWidth={2} />
          Find More Jobs
        </Link>
      </motion.div>

      {/* Filter tabs */}
      <motion.div {...fadeUp(0.05)} className="flex gap-1 p-1 card rounded-xl w-fit shadow-sm">
        {TABS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-dark-700 text-dark-100 shadow-sm' : 'text-dark-400 hover:text-dark-100'
            }`}
          >
            {f}
            <span className={`ml-1.5 text-xs ${filter === f ? 'text-primary-400' : 'text-dark-600'}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 rounded-lg w-2/3" />
                  <div className="skeleton h-3 rounded-lg w-1/3" />
                  <div className="skeleton h-12 rounded-lg w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700/50 flex items-center justify-center mx-auto mb-5">
            <FileText className="w-7 h-7 text-dark-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-dark-400 mb-1.5">
            {filter !== 'all' ? `No ${filter} proposals` : 'No proposals yet'}
          </p>
          <p className="text-xs text-dark-600 mb-5">Start applying to jobs to see your proposals here</p>
          <Link to="/jobs" className="btn btn-primary btn-sm inline-flex gap-1.5">
            <Search className="w-3.5 h-3.5" strokeWidth={2} />
            Browse Jobs
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 card-hover cursor-pointer group"
                onClick={() => navigate(`/jobs/${p.job_id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4.5 h-4.5 text-primary-400" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                        {p.job?.title || 'Job'}
                      </h3>
                      <span className={`badge text-2xs flex items-center gap-1 ${cfg.cls}`}>
                        <StatusIcon className="w-2.5 h-2.5" strokeWidth={2} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-dark-500 mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      Submitted {new Date(p.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-dark-300 line-clamp-2 mb-3">{p.cover_letter}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-green-400 font-medium">
                        <DollarSign className="w-3 h-3" strokeWidth={2} />
                        Your bid: ${p.bid_amount}
                      </span>
                      {p.estimated_days && (
                        <span className="flex items-center gap-1 text-dark-500">
                          <Clock className="w-3 h-3" strokeWidth={2} />
                          {p.estimated_days} days
                        </span>
                      )}
                    </div>
                  </div>
                  {p.status === 'accepted' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/messages'); }}
                      className="btn btn-primary btn-sm shrink-0 gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
                      Message
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
