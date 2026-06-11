import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ChevronDown, Briefcase, User, BadgeCheck, Loader2 } from 'lucide-react';
import { jobs as jobsApi, freelancers as freelancersApi } from '../../api';

const SEARCH_TYPES = [
  { id: 'talent', label: 'Talent' },
  { id: 'jobs',   label: 'Jobs' },
];

/* ─── Reusable nav search bar ──────────────────────────────────
   variant = 'public'  → pill style, wider, used in the unauthenticated navbar
   variant = 'compact' → rectangle style, used in the authenticated navbar
   ────────────────────────────────────────────────────────────── */
export default function NavSearch({ variant = 'public' }) {
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  const [query,      setQuery]      = useState('');
  const [type,       setType]       = useState('talent');
  const [typeOpen,   setTypeOpen]   = useState(false);
  const [resultsOpen,setResultsOpen]= useState(false);
  const [loading,    setLoading]    = useState(false);
  const [results,    setResults]    = useState({ talent: [], jobs: [] });

  const selectedType = SEARCH_TYPES.find((t) => t.id === type);

  /* ─── Click-outside to close everything ─── */
  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setTypeOpen(false);
        setResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ─── Debounced live search ─── */
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults({ talent: [], jobs: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const wantsTalent = type === 'talent';
        const wantsJobs   = type === 'jobs';
        const reqs = [];
        reqs.push(wantsTalent
          ? freelancersApi.list({ search: q, per_page: 5 }).catch(() => ({ data: { data: [] } }))
          : Promise.resolve({ data: { data: [] } }));
        reqs.push(wantsJobs
          ? jobsApi.list({ search: q, per_page: 5 }).catch(() => ({ data: { data: [] } }))
          : Promise.resolve({ data: { data: [] } }));

        const [talentRes, jobsRes] = await Promise.all(reqs);
        const talent = (talentRes.data?.data?.data ?? talentRes.data?.data ?? []).slice(0, 5);
        const jobs   = (jobsRes.data?.data?.data   ?? jobsRes.data?.data   ?? []).slice(0, 5);
        setResults({ talent, jobs });
      } catch {
        setResults({ talent: [], jobs: [] });
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [query, type]);

  const submit = useCallback((e) => {
    e?.preventDefault?.();
    const q = query.trim();
    if (!q) return;
    setResultsOpen(false);
    setQuery('');
    if (type === 'jobs') {
      navigate(`/search?type=jobs&q=${encodeURIComponent(q)}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(q)}&type=${type}`);
    }
  }, [query, type, navigate]);

  const goTo = (path) => {
    setResultsOpen(false);
    setQuery('');
    navigate(path);
  };

  const hasResults = results.talent.length + results.jobs.length > 0;
  const showDropdown = resultsOpen && query.trim().length >= 2;

  /* ─── Styling ─── */
  const isPublic = variant === 'public';
  const shellCls = isPublic
    ? 'flex items-center bg-dark-900 border border-dark-700 rounded-full overflow-hidden transition-all focus-within:border-primary-500/60 focus-within:ring-2 focus-within:ring-primary-500/15 hover:border-dark-600'
    : 'flex items-center bg-dark-800/80 border border-dark-700/80 rounded-lg overflow-hidden transition-all focus-within:border-primary-500/60 focus-within:bg-dark-800';
  const shellHeight = isPublic ? 42 : 36;
  const inputWidth  = isPublic ? 'w-56 lg:w-72' : 'w-44';
  const inputPad    = isPublic ? 'pl-2 pr-3 text-[14px]' : 'pl-2 pr-2 text-[13px]';
  const iconCls     = isPublic ? 'w-4 h-4 ml-4' : 'w-3.5 h-3.5 ml-3';
  const typeBtnCls  = isPublic
    ? 'flex items-center gap-1.5 px-4 h-full text-[13px] font-semibold text-dark-200 hover:bg-dark-800/60 transition-colors'
    : 'flex items-center gap-1 px-2.5 h-full text-[12px] font-medium text-dark-300 hover:bg-dark-700/60 transition-colors';

  return (
    <div ref={wrapRef} className="relative">
      <form onSubmit={submit}>
        <div className={shellCls} style={{ height: shellHeight }}>
          {/* Search icon doubles as the submit button */}
          <button
            type="submit"
            aria-label="Search"
            className={`${iconCls} flex items-center justify-center text-dark-500 hover:text-dark-100 transition-colors shrink-0`}
          >
            <SearchIcon className={isPublic ? 'w-4 h-4' : 'w-3.5 h-3.5'} strokeWidth={2} />
          </button>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setResultsOpen(true); }}
            onFocus={() => setResultsOpen(true)}
            type="text"
            placeholder={`Search ${selectedType.label.toLowerCase()}…`}
            className={`bg-transparent ${inputPad} text-dark-100 placeholder:text-dark-500 outline-none ${inputWidth}`}
          />
          {loading && <Loader2 className="w-3.5 h-3.5 text-dark-500 animate-spin mr-2 shrink-0" />}

          {/* Type selector */}
          <div className="relative border-l border-dark-700/80 h-full flex items-center">
            <button
              type="button"
              onClick={() => setTypeOpen((v) => !v)}
              className={typeBtnCls}
            >
              {selectedType.label}
              <ChevronDown
                className={`w-3 h-3 text-dark-500 transition-transform ${typeOpen ? 'rotate-180' : ''}`}
                strokeWidth={2.5}
              />
            </button>

            {typeOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-28 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden z-50">
                {SEARCH_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setType(t.id); setTypeOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                      type === t.id
                        ? 'font-bold text-dark-100 bg-dark-800'
                        : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* ─── Live results dropdown ─── */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden z-40 max-h-[480px] overflow-y-auto">
          {!hasResults && !loading && (
            <div className="px-4 py-6 text-center">
              <div className="text-xs text-dark-400 mb-3">No matches for "{query.trim()}"</div>
              <button
                type="button"
                onClick={submit}
                className="text-[13px] font-semibold text-primary-400 hover:text-primary-300"
              >
                Search all results →
              </button>
            </div>
          )}

          {results.talent.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-2xs font-bold uppercase tracking-widest text-dark-500">
                Talent
              </div>
              {results.talent.map((t) => {
                const name   = t.name || t.user?.name || 'Freelancer';
                const title  = t.title || t.headline || t.user?.title || '';
                const slug   = t.username || t.user?.username || t.id;
                const avatar = t.avatar_url || t.user?.avatar_url
                  || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4361ff&color=fff&size=64`;
                return (
                  <button
                    key={`t-${t.id || slug}`}
                    type="button"
                    onClick={() => goTo(`/freelancers/${slug}`)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-800 transition-colors text-left"
                  >
                    <img src={avatar} alt={name} className="w-9 h-9 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="text-[13px] font-semibold text-dark-100 truncate">{name}</div>
                        <BadgeCheck className="w-3 h-3 text-primary-400 shrink-0" />
                      </div>
                      {title && <div className="text-2xs text-dark-500 truncate">{title}</div>}
                    </div>
                    <User className="w-3.5 h-3.5 text-dark-600 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {results.jobs.length > 0 && (
            <div className="py-2 border-t border-dark-800">
              <div className="px-4 py-1.5 text-2xs font-bold uppercase tracking-widest text-dark-500">
                Jobs
              </div>
              {results.jobs.map((j) => (
                <button
                  key={`j-${j.id}`}
                  type="button"
                  onClick={() => goTo(`/jobs/${j.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-800 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-primary-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-dark-100 truncate">{j.title}</div>
                    <div className="text-2xs text-dark-500 truncate">
                      {j.type || 'Fixed'}
                      {j.budget_min ? ` · $${j.budget_min}${j.budget_max ? `–$${j.budget_max}` : '+'}` : ''}
                      {j.experience_level ? ` · ${j.experience_level}` : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Footer: see-all link */}
          <button
            type="button"
            onClick={submit}
            className="w-full px-4 py-3 text-center text-[13px] font-semibold text-primary-400 hover:text-primary-300 border-t border-dark-800 bg-dark-950/40"
          >
            See all results for "{query.trim()}" →
          </button>
        </div>
      )}
    </div>
  );
}
