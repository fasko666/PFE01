import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader2, Briefcase, Users, FileSignature, MessageSquare } from 'lucide-react';
import { api } from '../../api';
import UserAvatar from '../../components/ui/UserAvatar';

const TABS = [
  { id: 'all',         label: 'All',         Icon: SearchIcon },
  { id: 'jobs',        label: 'Jobs',        Icon: Briefcase },
  { id: 'freelancers', label: 'Talent',      Icon: Users },
  { id: 'contracts',   label: 'Contracts',   Icon: FileSignature },
  { id: 'messages',    label: 'Messages',    Icon: MessageSquare },
];

export default function GlobalSearch() {
  const [params, setParams] = useSearchParams();
  const initQ = params.get('q') || '';
  const initType = params.get('type') || 'all';

  const [q, setQ]         = useState(initQ);
  const [type, setType]   = useState(initType);
  const [data, setData]   = useState({});
  const [loading, setL]   = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const run = useCallback(async () => {
    if (!q || q.length < 2) { setData({}); return; }
    setL(true);
    try { setData((await api.search.query(q, { type })).data.data); }
    finally { setL(false); }
  }, [q, type]);

  useEffect(() => { run(); }, [run]);

  // Suggestions (debounced)
  useEffect(() => {
    if (!q || q.length < 1) { setSuggestions(null); return; }
    const t = setTimeout(async () => {
      try { setSuggestions((await api.search.suggest(q)).data.data); } catch { /* noop */ }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const onSubmit = (e) => {
    e.preventDefault();
    setParams({ q, type });
    run();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
        <form onSubmit={onSubmit} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search jobs, talent, contracts, messages…"
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-dark-700 bg-dark-800 text-base text-dark-100 placeholder:text-dark-600 outline-none focus:border-primary-500/50" />

          {/* Tab strip */}
          <div className="mt-3 inline-flex gap-1 rounded-2xl bg-dark-800 border border-dark-700 p-1">
            {TABS.map(t => {
              const Icon = t.Icon;
              return (
                <button key={t.id} type="button" onClick={() => setType(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    type === t.id ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white hover:bg-dark-700'
                  }`}>
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>
        </form>
      </div>

      {/* Suggestions */}
      {q && suggestions && q.length < 3 && (
        <div className="rounded-2xl border border-dark-800 bg-dark-900 p-3">
          <div className="text-2xs text-dark-500 uppercase tracking-wider font-semibold mb-2">Suggestions</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {(suggestions.jobs || []).map(j => (
              <Link key={j.id} to={`/jobs/${j.id}`} className="text-xs text-dark-200 hover:text-white truncate flex items-center gap-2">
                <Briefcase className="w-3 h-3 text-dark-500" /> {j.title}
              </Link>
            ))}
            {(suggestions.freelancers || []).map(f => (
              <Link key={f.id} to={`/freelancers/${f.username}`} className="text-xs text-dark-200 hover:text-white truncate flex items-center gap-2">
                <Users className="w-3 h-3 text-dark-500" /> {f.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : !q ? (
        <p className="text-center text-xs text-dark-500 py-12">Start typing to search.</p>
      ) : Object.keys(data).length === 0 ? (
        <p className="text-center text-xs text-dark-500 py-12">No results.</p>
      ) : (
        <div className="space-y-6">
          {data.jobs?.length > 0 && (
            <Section icon={Briefcase} title="Jobs" count={data.jobs.length}>
              {data.jobs.map(j => (
                <Link key={j.id} to={`/jobs/${j.id}`} className="block rounded-xl border border-dark-800 bg-dark-900 p-4 hover:border-dark-700">
                  <div className="text-sm font-bold text-dark-100">{j.title}</div>
                  <div className="text-2xs text-dark-500 mt-1 line-clamp-2">{j.description}</div>
                </Link>
              ))}
            </Section>
          )}
          {data.freelancers?.length > 0 && (
            <Section icon={Users} title="Talent" count={data.freelancers.length}>
              {data.freelancers.map(f => (
                <Link key={f.id} to={`/freelancers/${f.username}`} className="flex items-center gap-3 rounded-xl border border-dark-800 bg-dark-900 p-3 hover:border-dark-700">
                  <UserAvatar user={f} size={36} ring={false} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-dark-100 truncate">{f.name}</div>
                    <div className="text-2xs text-dark-500 truncate">{f.freelancer_profile?.title || f.country || ''}</div>
                  </div>
                </Link>
              ))}
            </Section>
          )}
          {data.contracts?.length > 0 && (
            <Section icon={FileSignature} title="Contracts" count={data.contracts.length}>
              {data.contracts.map(c => (
                <Link key={c.id} to={`/contracts/${c.id}`} className="block rounded-xl border border-dark-800 bg-dark-900 p-3 hover:border-dark-700">
                  <div className="text-sm font-bold text-dark-100 truncate">{c.title}</div>
                  <div className="text-2xs text-dark-500">{c.status} · ${Number(c.amount).toFixed(2)}</div>
                </Link>
              ))}
            </Section>
          )}
          {data.messages?.length > 0 && (
            <Section icon={MessageSquare} title="Messages" count={data.messages.length}>
              {data.messages.map(m => (
                <Link key={m.id} to={`/messages/${m.conversation_id}`} className="block rounded-xl border border-dark-800 bg-dark-900 p-3 hover:border-dark-700">
                  <div className="text-2xs text-dark-400 line-clamp-2">{m.body}</div>
                </Link>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, count, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-dark-100 uppercase tracking-wider flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-primary-400" /> {title} <span className="text-dark-500 font-normal">({count})</span>
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
