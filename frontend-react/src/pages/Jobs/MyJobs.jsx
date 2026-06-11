import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Play, Square, Briefcase, Search, SlidersHorizontal, X,
  Eye, Trash2, FileText, FolderOpen, ChevronRight, Calendar,
  DollarSign,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import UserAvatar from '../../components/ui/UserAvatar';
import toast from 'react-hot-toast';

/* ── Status config (client view) ── */
const STATUS_BADGE = {
  open:        { label: 'Open',        cls: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  in_progress: { label: 'In Progress', cls: 'bg-primary-500/10 text-primary-400 border border-primary-500/20' },
  completed:   { label: 'Completed',   cls: 'bg-dark-700/50 text-dark-400 border border-dark-600' },
  cancelled:   { label: 'Cancelled',   cls: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  paused:      { label: 'Paused',      cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
};
const STATUS_FILTERS = ['open', 'in_progress', 'completed', 'paused'];

const fmtMoney  = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtSecs   = (s) => {
  s = Number(s || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')} hrs`;
};
const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

/* ── Empty state illustration (contract + pen) ── */
function ContractIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-5 opacity-70">
      {/* Paper */}
      <rect x="18" y="10" width="64" height="82" rx="6" fill="rgb(var(--c-dark-800))" stroke="rgb(var(--c-dark-700))" strokeWidth="1.5"/>
      {/* Lines */}
      <rect x="30" y="26" width="40" height="4" rx="2" fill="rgb(var(--c-dark-700))"/>
      <rect x="30" y="36" width="32" height="3.5" rx="1.75" fill="rgb(var(--c-dark-700))"/>
      <rect x="30" y="46" width="36" height="3.5" rx="1.75" fill="rgb(var(--c-dark-700))" opacity=".7"/>
      <rect x="30" y="56" width="24" height="3.5" rx="1.75" fill="rgb(var(--c-dark-700))" opacity=".5"/>
      <rect x="30" y="66" width="28" height="3.5" rx="1.75" fill="rgb(var(--c-dark-700))" opacity=".4"/>
      {/* Signature line */}
      <rect x="30" y="78" width="44" height="1.5" rx=".75" fill="rgb(var(--c-dark-700))" opacity=".4"/>
      {/* Pen */}
      <g transform="rotate(-35 85 72)">
        <rect x="78" y="48" width="8" height="40" rx="2" fill="rgb(var(--c-primary-500))"/>
        <polygon points="78,88 86,88 82,100" fill="rgb(var(--c-primary-400))"/>
        <rect x="78" y="48" width="8" height="7" rx="2" fill="rgb(var(--c-dark-600))"/>
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   FREELANCER — Work Diary
══════════════════════════════════════════════════════ */
function WorkDiary() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [timers, setTimers]       = useState({}); // contractId → running log
  const [ticks, setTicks]         = useState(0);

  useEffect(() => {
    api.contracts.myActive({ per_page: 50 })
      .then((r) => {
        const list = r.data?.data?.data || [];
        setContracts(list);
        // check which contracts have a running timer
        const checks = list.map((c) =>
          api.contracts.timeLogs(c.id)
            .then((res) => {
              const logs = res.data?.data?.data || res.data?.data || [];
              const running = logs.find((l) => !l.ended_at);
              if (running) setTimers((t) => ({ ...t, [c.id]: running }));
            })
            .catch(() => {})
        );
        return Promise.all(checks);
      })
      .catch(() => toast.error('Failed to load contracts'))
      .finally(() => setLoading(false));
  }, []);

  // tick every second for live timer display
  useEffect(() => {
    const t = setInterval(() => setTicks((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const startTimer = async (contractId) => {
    try {
      await api.contracts.timeStart(contractId, {});
      const res = await api.contracts.timeLogs(contractId);
      const logs = res.data?.data?.data || res.data?.data || [];
      const running = logs.find((l) => !l.ended_at);
      setTimers((t) => ({ ...t, [contractId]: running }));
      toast.success('Timer started');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to start timer');
    }
  };

  const stopTimer = async (contractId) => {
    try {
      await api.contracts.timeStop(contractId, {});
      setTimers((t) => { const next = { ...t }; delete next[contractId]; return next; });
      toast.success('Timer stopped');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to stop timer');
    }
  };

  const liveSeconds = (contractId) => {
    const log = timers[contractId];
    if (!log) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(log.started_at).getTime()) / 1000));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 rounded w-1/2" />
                <div className="skeleton h-3 rounded w-1/3" />
              </div>
              <div className="skeleton h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-16 text-center"
      >
        <ContractIllustration />
        <h3 className="text-base font-semibold text-dark-100 mb-2">
          You haven't started any contracts yet
        </h3>
        <p className="text-sm text-dark-500 mb-6">
          Find a job and submit a proposal to get started.
        </p>
        <Link
          to="/search?type=jobs"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-full transition-all"
        >
          <Briefcase className="w-4 h-4" />
          Find work
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {contracts.map((contract, i) => {
        const isRunning = !!timers[contract.id];
        const live      = liveSeconds(contract.id);
        const client    = contract.client;

        return (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5 hover:border-dark-600 transition-colors group"
          >
            <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
              {/* Client avatar */}
              {client && <UserAvatar user={client} size={40} ring={false} />}

              {/* Contract info */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                  className="font-semibold text-dark-100 group-hover:text-primary-300 transition-colors text-sm text-left truncate block"
                >
                  {contract.title}
                </button>
                <div className="flex items-center gap-3 mt-1 text-xs text-dark-500 flex-wrap">
                  {client && <span>{client.name}</span>}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Started {fmtDate(contract.started_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-green-500" />
                    <span className="text-green-400 font-medium">{fmtMoney(contract.amount)}</span>
                  </span>
                </div>

                {/* Live timer display */}
                {isRunning && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-green-400">
                      {fmtSecs(live + ticks * 0)}
                    </span>
                    <span className="text-2xs text-green-500">live</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Timer toggle */}
                {isRunning ? (
                  <button
                    onClick={() => stopTimer(contract.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/25 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Stop timer
                  </button>
                ) : (
                  <button
                    onClick={() => startTimer(contract.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/25 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start timer
                  </button>
                )}

                {/* Go to contract */}
                <button
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full text-dark-500 hover:text-dark-200 hover:bg-dark-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CLIENT — Job Posts Management
══════════════════════════════════════════════════════ */
function ClientJobPosts() {
  const navigate = useNavigate();
  const [jobs, setJobs]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [filtersOpen, setFiltersOpen]     = useState(false);

  useEffect(() => {
    api.jobs.myJobs()
      .then((r) => setJobs(r.data.data?.data || []))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const toggleFilter = (s) => setActiveFilters((f) => f.includes(s) ? f.filter((x) => x !== s) : [...f, s]);
  const removeFilter = (s) => setActiveFilters((f) => f.filter((x) => x !== s));
  const clearFilters = () => { setActiveFilters([]); setSearch(''); };

  const filtered = jobs.filter((j) => {
    const matchSearch = !search.trim() || j.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = activeFilters.length === 0 || activeFilters.includes(j.status);
    return matchSearch && matchStatus;
  });

  const hasFilters = activeFilters.length > 0 || search.trim();

  return (
    <div className="space-y-5">
      {/* Title + Post button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-100 tracking-tight">All job posts</h1>
        <Link
          to="/jobs/post"
          className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-full transition-all active:scale-[0.98]"
        >
          Post a new job
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" strokeWidth={2} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search job postings"
            className="input pl-11 rounded-full"
          />
        </div>
        <div className="relative shrink-0">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              filtersOpen || activeFilters.length > 0
                ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                : 'border-dark-700 bg-dark-900 text-dark-300 hover:border-dark-600 hover:text-dark-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.75} />
            Filters
            {activeFilters.length > 0 && (
              <span className="w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ml-0.5">
                {activeFilters.length}
              </span>
            )}
          </button>
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.13 }}
                className="absolute right-0 top-full mt-2 w-52 card shadow-float overflow-hidden z-20"
              >
                <div className="p-3">
                  <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider px-1 mb-2">Status</p>
                  {STATUS_FILTERS.map((s) => {
                    const active = activeFilters.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleFilter(s)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                          active ? 'bg-primary-500/10 text-dark-100' : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'
                        }`}
                      >
                        <span className="capitalize">{STATUS_BADGE[s]?.label}</span>
                        {active && (
                          <span className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                            <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 flex-wrap"
          >
            {search.trim() && (
              <span className="flex items-center gap-1.5 px-3.5 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
                "{search}"
                <button onClick={() => setSearch('')} className="hover:opacity-70 transition-opacity ml-0.5">
                  <X className="w-3 h-3" strokeWidth={3} />
                </button>
              </span>
            )}
            {activeFilters.map((s) => (
              <span key={s} className="flex items-center gap-1.5 px-3.5 py-1 bg-primary-500 text-white text-sm font-medium rounded-full capitalize">
                {STATUS_BADGE[s]?.label}
                <button onClick={() => removeFilter(s)} className="hover:opacity-70 transition-opacity ml-0.5">
                  <X className="w-3 h-3" strokeWidth={3} />
                </button>
              </span>
            ))}
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors">
              <X className="w-3.5 h-3.5" strokeWidth={2} /> Clear all filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2.5">
                  <div className="skeleton h-4 rounded-lg w-2/3" />
                  <div className="skeleton h-3 rounded-lg w-1/3" />
                </div>
                <div className="skeleton w-24 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-16 text-center">
          <ContractIllustration />
          <p className="text-base font-medium text-dark-300 mb-2">
            {hasFilters ? 'No results match your search.' : "You haven't posted any jobs yet."}
          </p>
          <p className="text-sm text-dark-500 mb-6">
            {hasFilters ? 'Try adjusting your filters.' : 'Post your first job to start receiving proposals.'}
          </p>
          {!hasFilters && (
            <Link to="/jobs/post" className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-full transition-all inline-block">
              Post a new job
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="border border-dark-700 rounded-2xl overflow-hidden">
          {filtered.map((job, i) => {
            const cfg = STATUS_BADGE[job.status] || STATUS_BADGE.open;
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-4 px-5 py-4 bg-dark-900 hover:bg-dark-800/50 transition-colors ${
                  i < filtered.length - 1 ? 'border-b border-dark-700' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <button
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="font-semibold text-dark-100 hover:text-primary-400 transition-colors text-sm"
                    >
                      {job.title}
                    </button>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-dark-500 flex-wrap">
                    <span>Posted {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{job.proposals_count ?? 0} proposals</span>
                    <span className="capitalize">{job.experience_level}</span>
                    {job.budget_min && <span>${job.budget_min}–${job.budget_max}</span>}
                    {job.category && <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" />{job.category.name}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/jobs/${job.id}/proposals`)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 border border-dark-700 text-dark-300 hover:border-dark-500 hover:text-dark-100 rounded-full text-xs font-medium transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> View proposals
                  </button>
                  <button
                    onClick={() => {
                      if (!window.confirm('Delete this job?')) return;
                      api.jobs.delete(job.id)
                        .then(() => { setJobs((p) => p.filter((x) => x.id !== job.id)); toast.success('Job deleted'); })
                        .catch(() => toast.error('Failed to delete'));
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-dark-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT — role-aware entry point
══════════════════════════════════════════════════════ */
export default function MyJobs() {
  const { user } = useAuthStore();
  const isFreelancer = user?.role === 'freelancer';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight flex items-center gap-2">
          {isFreelancer
            ? <><Clock className="w-5 h-5 text-primary-400" /> Work diary</>
            : <><Briefcase className="w-5 h-5 text-primary-400" /> My jobs</>
          }
        </h1>
        <p className="text-sm text-dark-500 mt-1">
          {isFreelancer
            ? 'Track your hours and manage active contracts'
            : 'Manage your job postings and proposals'}
        </p>
      </motion.div>

      {isFreelancer ? <WorkDiary /> : <ClientJobPosts />}
    </div>
  );
}
