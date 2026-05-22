import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bookmark, BookmarkCheck, DollarSign, BarChart3,
  FileText, MapPin, Clock, ChevronDown, SlidersHorizontal,
  Briefcase, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest first' },
  { value: 'budget_max', label: 'Highest budget' },
  { value: 'proposals_count', label: 'Fewest proposals' },
];

const EXP_LEVELS = [
  { v: '', l: 'All Levels' },
  { v: 'entry', l: 'Entry Level' },
  { v: 'intermediate', l: 'Intermediate' },
  { v: 'expert', l: 'Expert' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function JobsMarketplace() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuthStore();

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [sortOpen, setSortOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category_id: params.get('category_id') || '',
    job_type: '',
    experience_level: '',
    budget_min: '',
    budget_max: '',
    sort: 'created_at',
    page: 1,
  });

  const fetchJobs = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '' && v !== null));
      const res = await api.jobs.list(clean);
      setJobs(res.data.data?.data || []);
      setMeta(res.data.data?.meta || {});
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.jobs.categories().then((r) => setCategories(r.data.data || []));
  }, []);

  useEffect(() => {
    fetchJobs(filters);
  }, [filters.page, filters.sort, filters.category_id, filters.job_type, filters.experience_level]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs({ ...filters, page: 1 });
  };

  const updateFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  const toggleSave = async (jobId, e) => {
    e.stopPropagation();
    try {
      await api.jobs.save(jobId);
      setSavedJobs((prev) => {
        const next = new Set(prev);
        next.has(jobId) ? next.delete(jobId) : next.add(jobId);
        return next;
      });
    } catch {
      toast.error('Login to save jobs');
    }
  };

  const budgetLabel = (job) => {
    if (job.job_type === 'hourly') return `$${job.budget_min}–$${job.budget_max}/hr`;
    return `$${job.budget_min}–$${job.budget_max}`;
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const h = Math.floor(diff / 3600000);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const selectedSort = SORT_OPTIONS.find((o) => o.value === filters.sort);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">Find Work</h1>
        <p className="text-sm text-dark-500 mt-1">Browse {meta.total || 0} available opportunities</p>
      </motion.div>

      {/* Search bar */}
      <motion.form {...fadeUp(0.05)} onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" strokeWidth={2} />
          <input
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="input pl-10"
            placeholder="Search by title, skill, or keyword…"
          />
        </div>
        <button type="submit" className="btn btn-primary px-6 gap-2">
          <Search className="w-3.5 h-3.5" strokeWidth={2} />
          Search
        </button>
      </motion.form>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <motion.aside {...fadeUp(0.08)} className="w-56 shrink-0 space-y-5 hidden lg:block">
          {/* Category */}
          <div className="card p-4 space-y-1">
            <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2 px-1">Category</p>
            <button
              onClick={() => updateFilter('category_id', '')}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!filters.category_id ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-800'}`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => updateFilter('category_id', c.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${filters.category_id == c.id ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-800'}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Job type */}
          <div className="card p-4 space-y-1">
            <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2 px-1">Job Type</p>
            {[{ v: '', l: 'All Types' }, { v: 'hourly', l: 'Hourly Rate' }, { v: 'fixed', l: 'Fixed Price' }].map((o) => (
              <button
                key={o.v}
                onClick={() => updateFilter('job_type', o.v)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${filters.job_type === o.v ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-800'}`}
              >
                {o.l}
              </button>
            ))}
          </div>

          {/* Experience */}
          <div className="card p-4 space-y-1">
            <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest mb-2 px-1">Experience</p>
            {EXP_LEVELS.map((o) => (
              <button
                key={o.v}
                onClick={() => updateFilter('experience_level', o.v)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${filters.experience_level === o.v ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-800'}`}
              >
                {o.l}
              </button>
            ))}
          </div>

          {/* Budget */}
          <div className="card p-4 space-y-3">
            <p className="text-2xs font-semibold text-dark-500 uppercase tracking-widest px-1">Budget (USD)</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.budget_min}
                onChange={(e) => updateFilter('budget_min', e.target.value)}
                placeholder="Min"
                className="input input-sm flex-1 text-xs"
              />
              <input
                type="number"
                value={filters.budget_max}
                onChange={(e) => updateFilter('budget_max', e.target.value)}
                placeholder="Max"
                className="input input-sm flex-1 text-xs"
              />
            </div>
            <button onClick={() => fetchJobs({ ...filters, page: 1 })} className="btn btn-ghost btn-sm w-full text-xs">
              Apply Range
            </button>
          </div>
        </motion.aside>

        {/* Jobs list */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Sort bar */}
          <motion.div {...fadeUp(0.1)} className="flex items-center justify-between">
            <span className="text-sm text-dark-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
              {loading ? 'Loading…' : `${meta.total || 0} jobs found`}
            </span>
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-xl text-sm text-dark-300 hover:border-dark-600 transition-colors"
              >
                {selectedSort?.label}
                <ChevronDown className={`w-3 h-3 text-dark-500 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 w-44 bg-dark-900 border border-dark-800 rounded-xl shadow-float z-10 overflow-hidden"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => { updateFilter('sort', o.value); setSortOpen(false); }}
                        className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${filters.sort === o.value ? 'text-primary-400 bg-primary-500/10' : 'text-dark-300 hover:bg-dark-800'}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
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
            <motion.div {...fadeUp(0.1)} className="card p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700/50 flex items-center justify-center mx-auto mb-5">
                <Search className="w-7 h-7 text-dark-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">No jobs found</h3>
              <p className="text-sm text-dark-500">Try adjusting your filters or search terms</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {jobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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

                      <button
                        onClick={(e) => toggleSave(job.id, e)}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-800 transition-colors text-dark-500 hover:text-primary-400"
                      >
                        {savedJobs.has(job.id)
                          ? <BookmarkCheck className="w-4 h-4 text-primary-400" strokeWidth={2} />
                          : <Bookmark className="w-4 h-4" strokeWidth={1.75} />
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
                onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="btn btn-ghost btn-sm gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
                Prev
              </button>
              <span className="text-sm text-dark-400 px-2">Page {filters.page} of {meta.last_page}</span>
              <button
                onClick={() => updateFilter('page', Math.min(meta.last_page, filters.page + 1))}
                disabled={filters.page === meta.last_page}
                className="btn btn-ghost btn-sm gap-1 disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
