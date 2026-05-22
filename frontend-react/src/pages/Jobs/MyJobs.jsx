import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, Eye, Trash2,
  FileText, FolderOpen,
} from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

/* ── Status config ── */
const STATUS_BADGE = {
  open:        { label: 'Open',        cls: 'bg-green-100 text-green-700 border-green-200' },
  in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed:   { label: 'Completed',   cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  cancelled:   { label: 'Cancelled',   cls: 'bg-red-100 text-red-600 border-red-200' },
  paused:      { label: 'Paused',      cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};

const STATUS_FILTERS = ['open', 'in_progress', 'completed', 'paused'];

/* ── Empty state illustration ── */
function EmptyIllustration() {
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" fill="none" className="mx-auto mb-6 opacity-80">
      {/* Document */}
      <rect x="18" y="8" width="68" height="88" rx="7" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1.5"/>
      <rect x="30" y="24" width="44" height="5" rx="2.5" fill="#2e2e2e"/>
      <rect x="30" y="36" width="36" height="4" rx="2" fill="#2e2e2e"/>
      <rect x="30" y="47" width="40" height="4" rx="2" fill="#2e2e2e"/>
      <rect x="30" y="58" width="28" height="4" rx="2" fill="#2e2e2e" opacity="0.6"/>
      <rect x="30" y="69" width="32" height="4" rx="2" fill="#2e2e2e" opacity="0.4"/>
      {/* Magnifying glass circle */}
      <circle cx="89" cy="86" r="26" fill="#141414" stroke="#2e2e2e" strokeWidth="1.5"/>
      <circle cx="89" cy="86" r="17" fill="#1c1c1c" stroke="#3a3a3a" strokeWidth="1.5"/>
      {/* Lens reflection */}
      <circle cx="84" cy="81" r="4" fill="#3a3a3a" opacity="0.5"/>
      {/* Handle */}
      <line x1="101" y1="98" x2="114" y2="111" stroke="#505050" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}

export default function MyJobs() {
  const navigate = useNavigate();
  const [jobs,          setJobs]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [tab,           setTab]           = useState('jobs');
  const [search,        setSearch]        = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [filtersOpen,   setFiltersOpen]   = useState(false);

  useEffect(() => {
    api.jobs.myJobs()
      .then((r) => setJobs(r.data.data?.data || []))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const toggleFilter = (s) =>
    setActiveFilters((f) => f.includes(s) ? f.filter((x) => x !== s) : [...f, s]);
  const removeFilter = (s) => setActiveFilters((f) => f.filter((x) => x !== s));
  const clearFilters = () => { setActiveFilters([]); setSearch(''); };

  const filtered = jobs.filter((j) => {
    const matchSearch = !search.trim() || j.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = activeFilters.length === 0 || activeFilters.includes(j.status);
    return matchSearch && matchStatus;
  });

  const hasFilters = activeFilters.length > 0 || search.trim();

  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Tabs ── */}
      <div className="flex border-b border-dark-700 mb-0">
        {[['jobs', 'All job posts'], ['contracts', 'All contracts']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              tab === key
                ? 'border-white text-white'
                : 'border-transparent text-dark-500 hover:text-dark-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'jobs' ? (
        <div className="pt-7 space-y-5">

          {/* ── Title + Post button ── */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-dark-100 tracking-tight">All job posts</h1>
            <Link
              to="/jobs/post"
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-full transition-all active:scale-[0.98]"
            >
              Post a new job
            </Link>
          </div>

          {/* ── Search + Filters ── */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" strokeWidth={2} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search job postings"
                className="w-full pl-11 pr-4 py-2.5 bg-dark-950 border border-dark-700 rounded-full text-sm text-dark-200 placeholder:text-dark-500 focus:outline-none focus:border-dark-500 focus:ring-2 focus:ring-primary-500/15 transition-all"
              />
            </div>

            {/* Filters — Upwork-style text trigger */}
            <div className="relative shrink-0">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  filtersOpen || activeFilters.length > 0
                    ? 'border-primary-500/50 bg-primary-500/8 text-primary-400'
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
                    className="absolute right-0 top-full mt-2 w-52 bg-dark-900 border border-dark-700 rounded-2xl shadow-float overflow-hidden z-20"
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
                              active
                                ? 'bg-primary-500/10 text-dark-100'
                                : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'
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

          {/* ── Active filter chips ── */}
          <AnimatePresence>
            {(activeFilters.length > 0 || search.trim()) && (
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
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Content ── */}
          {loading ? (
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-900 border border-dark-700 rounded-2xl p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2.5">
                      <div className="h-4 bg-dark-800 rounded-lg w-2/3" />
                      <div className="h-3 bg-dark-800 rounded-lg w-1/3" />
                      <div className="h-3 bg-dark-800 rounded-lg w-1/2" />
                    </div>
                    <div className="w-24 h-8 bg-dark-800 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <EmptyIllustration />
              <p className="text-base font-medium text-dark-300 mb-2">
                {hasFilters
                  ? 'There are no results that match your search.'
                  : "You haven't posted any jobs yet."}
              </p>
              <p className="text-sm text-dark-500 mb-6">
                {hasFilters
                  ? 'Please try adjusting your search keywords or filters.'
                  : 'Post your first job to start receiving proposals from talented freelancers.'}
              </p>
              {!hasFilters && (
                <Link
                  to="/jobs/post"
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-full transition-all inline-block"
                >
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
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="font-semibold text-dark-100 hover:text-primary-400 transition-colors text-sm"
                        >
                          {job.title}
                        </button>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-dark-500 flex-wrap">
                        <span>
                          Posted {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {job.proposals_count ?? 0} proposals
                        </span>
                        <span className="capitalize">{job.experience_level}</span>
                        {job.budget_min && (
                          <span>${job.budget_min}–${job.budget_max}</span>
                        )}
                        {job.category && (
                          <span className="flex items-center gap-1">
                            <FolderOpen className="w-3 h-3" />
                            {job.category.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 border border-dark-700 text-dark-300 hover:border-dark-500 hover:text-dark-100 rounded-full text-xs font-medium transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                        View proposals
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
      ) : (
        /* ── Contracts tab ── */
        <div className="text-center py-20 pt-14">
          <EmptyIllustration />
          <p className="text-base font-medium text-dark-300 mb-2">No contracts yet</p>
          <p className="text-sm text-dark-500">Contracts will appear here once a proposal is accepted.</p>
        </div>
      )}
    </div>
  );
}
