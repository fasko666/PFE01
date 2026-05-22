import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, Award, ChevronLeft, ChevronRight,
  SlidersHorizontal, Users, DollarSign,
} from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] },
});

function StarRating({ rating, count }) {
  const r = Math.round(parseFloat(rating) || 0);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-3 h-3 ${n <= r ? 'text-yellow-400 fill-yellow-400' : 'text-dark-700'}`}
            strokeWidth={n <= r ? 0 : 1.5}
          />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-dark-500">({count})</span>}
    </div>
  );
}

export default function FreelancerMarketplace() {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});

  const [filters, setFilters] = useState({
    search: '',
    skill: '',
    min_rate: '',
    max_rate: '',
    experience_level: '',
    country: '',
    top_rated: false,
    sort: 'rating',
    page: 1,
  });

  const fetchFreelancers = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(
        Object.entries(f).filter(([, v]) => v !== '' && v !== false && v !== null)
      );
      const res = await api.freelancers.list(clean);
      setFreelancers(res.data.data?.data || []);
      setMeta(res.data.data?.meta || {});
    } catch {
      toast.error('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFreelancers(filters); }, [filters.page, filters.top_rated, filters.sort, filters.experience_level]);

  const update = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFreelancers({ ...filters, page: 1 });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">Find Talent</h1>
        <p className="text-sm text-dark-500 mt-1">Discover {meta.total || 0}+ skilled freelancers</p>
      </motion.div>

      {/* Search bar */}
      <motion.form {...fadeUp(0.05)} onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" strokeWidth={2} />
          <input
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="input pl-10"
            placeholder="Search by name, skill, or title…"
          />
        </div>
        <div className="relative w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-600" strokeWidth={2} />
          <input
            value={filters.skill}
            onChange={(e) => update('skill', e.target.value)}
            className="input pl-9"
            placeholder="Skill"
          />
        </div>
        <button type="submit" className="btn btn-primary px-6 gap-2">
          <Search className="w-3.5 h-3.5" strokeWidth={2} />
          Search
        </button>
      </motion.form>

      {/* Filter chips row */}
      <motion.div {...fadeUp(0.08)} className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="w-3.5 h-3.5 text-dark-500 shrink-0" strokeWidth={2} />
        <select
          value={filters.experience_level}
          onChange={(e) => update('experience_level', e.target.value)}
          className="input input-sm w-auto text-sm"
        >
          <option value="">All Levels</option>
          <option value="entry">Entry</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-500 text-xs">$</span>
          <input
            type="number"
            value={filters.min_rate}
            onChange={(e) => update('min_rate', e.target.value)}
            className="input input-sm w-24 text-sm pl-6"
            placeholder="Min/hr"
          />
        </div>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-500 text-xs">$</span>
          <input
            type="number"
            value={filters.max_rate}
            onChange={(e) => update('max_rate', e.target.value)}
            className="input input-sm w-24 text-sm pl-6"
            placeholder="Max/hr"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-500" strokeWidth={2} />
          <input
            value={filters.country}
            onChange={(e) => update('country', e.target.value)}
            className="input input-sm w-32 text-sm pl-7"
            placeholder="Country"
          />
        </div>
        <button
          onClick={() => update('top_rated', !filters.top_rated)}
          className={`btn btn-sm flex items-center gap-1.5 transition-all ${filters.top_rated ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Award className="w-3.5 h-3.5" strokeWidth={2} />
          Top Rated
        </button>
        <select
          value={filters.sort}
          onChange={(e) => update('sort', e.target.value)}
          className="input input-sm w-auto text-sm ml-auto"
        >
          <option value="rating">Highest Rated</option>
          <option value="rate_asc">Lowest Rate</option>
          <option value="rate_desc">Highest Rate</option>
        </select>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="flex gap-3">
                <div className="skeleton w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 rounded-lg w-3/4" />
                  <div className="skeleton h-3 rounded-lg w-1/2" />
                </div>
              </div>
              <div className="skeleton h-10 rounded-lg" />
              <div className="flex gap-2">
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700/50 flex items-center justify-center mx-auto mb-5">
            <Users className="w-7 h-7 text-dark-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">No freelancers found</h3>
          <p className="text-sm text-dark-500">Try adjusting your search filters</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {freelancers.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/freelancers/${f.username || f.id}`)}
                className="card p-5 cursor-pointer card-hover group"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative shrink-0">
                    <img
                      src={f.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=4361ff&color=fff`}
                      alt={f.name}
                      className="w-12 h-12 rounded-full ring-2 ring-dark-700 object-cover"
                    />
                    {f.is_online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-950" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-white text-sm truncate group-hover:text-primary-300 transition-colors">{f.name}</h3>
                      {f.is_verified && (
                        <span className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark-400 truncate">{f.freelancer_profile?.title || 'Freelancer'}</p>
                    {f.country && (
                      <p className="text-xs text-dark-600 flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" strokeWidth={2} />
                        {f.country}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating & rate */}
                <div className="flex items-center justify-between mb-3">
                  <StarRating rating={f.avg_rating} count={f.reviews_count || 0} />
                  <span className="text-sm font-semibold text-green-400 flex items-center gap-0.5">
                    <DollarSign className="w-3 h-3" strokeWidth={2} />
                    {f.freelancer_profile?.hourly_rate || '—'}/hr
                  </span>
                </div>

                {/* Bio */}
                {f.freelancer_profile?.bio && (
                  <p className="text-xs text-dark-400 line-clamp-2 mb-3 leading-relaxed">{f.freelancer_profile.bio}</p>
                )}

                {/* Skills */}
                {f.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {f.skills.slice(0, 4).map((s) => (
                      <span key={s.id || s.name} className="badge badge-primary text-2xs">{s.name}</span>
                    ))}
                    {f.skills.length > 4 && (
                      <span className="text-2xs text-dark-600">+{f.skills.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Badges */}
                {(f.is_top_rated || f.subscription?.plan !== 'free') && (
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-dark-800">
                    {f.is_top_rated && (
                      <span className="badge text-2xs bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" strokeWidth={2} />
                        Top Rated
                      </span>
                    )}
                    {f.subscription?.plan === 'freelancer_plus' && (
                      <span className="badge text-2xs bg-accent-500/10 text-accent-400 border-accent-500/20">Plus</span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
            disabled={filters.page === 1}
            className="btn btn-ghost btn-sm gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Prev
          </button>
          <span className="text-sm text-dark-400 px-2">Page {filters.page} of {meta.last_page}</span>
          <button
            onClick={() => setFilters((f) => ({ ...f, page: Math.min(meta.last_page, f.page + 1) }))}
            disabled={filters.page === meta.last_page}
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
