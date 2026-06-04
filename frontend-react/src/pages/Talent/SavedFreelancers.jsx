import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, Star, Trash2, ListPlus, Users } from 'lucide-react';
import { api } from '../../api';
import UserAvatar from '../../components/ui/UserAvatar';
import toast from 'react-hot-toast';

const fmtMoney = (n) => `$${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:2})}`;

export default function SavedFreelancers() {
  const [rows, setRows]     = useState([]);
  const [meta, setMeta]     = useState({ last_page: 1, current_page: 1, total: 0 });
  const [page, setPage]     = useState(1);
  const [loading, setL]     = useState(true);
  const [error, setErr]     = useState(null);

  const load = useCallback(async () => {
    setL(true); setErr(null);
    try {
      const { data } = await api.savedFreelancers.list({ page });
      const p = data.data;
      setRows(p?.data || []);
      setMeta({ last_page: p?.last_page||1, current_page: p?.current_page||1, total: p?.total||0 });
    } catch (e) { setErr(e?.response?.data?.message || 'Failed to load'); }
    finally { setL(false); }
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const unsave = async (id) => {
    if (!confirm('Remove from saved?')) return;
    try { await api.savedFreelancers.unsave(id); load(); toast.success('Removed'); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-dark-50 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" /> Saved talent
          </h1>
          <p className="text-sm text-dark-400">Quick-bookmark freelancers you may want to hire later.</p>
        </div>
        <Link to="/talent-lists" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-200 hover:bg-dark-700">
          <ListPlus className="w-3.5 h-3.5" /> Talent lists
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : error ? (
        <Err msg={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <Empty />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map((s) => {
              const f = s.freelancer || {};
              const fp = f.freelancer_profile || {};
              return (
                <div key={s.id} className="rounded-2xl border border-dark-800 bg-dark-900 p-4">
                  <div className="flex items-start gap-3">
                    <UserAvatar user={f} size={48} ring={false} />
                    <div className="min-w-0 flex-1">
                      <Link to={f.username ? `/freelancers/${f.username}` : '#'} className="text-sm font-bold text-dark-100 truncate hover:text-white block">{f.name}</Link>
                      <div className="text-2xs text-dark-500 truncate">{fp.title || ''}</div>
                      <div className="mt-1 text-2xs text-dark-400 flex items-center gap-3">
                        {fp.hourly_rate && <span>{fmtMoney(fp.hourly_rate)}/hr</span>}
                        {fp.avg_rating > 0 && <span className="inline-flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {Number(fp.avg_rating).toFixed(1)}</span>}
                        {f.country && <span>{f.country}</span>}
                      </div>
                    </div>
                    <button onClick={() => unsave(f.id)} title="Remove" className="text-dark-500 hover:text-red-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-2xs text-dark-500">Page {meta.current_page} of {meta.last_page} · {meta.total} saved</p>
              <div className="flex gap-1">
                <button disabled={meta.current_page <= 1} onClick={() => setPage(p => p-1)} className="px-3 h-7 rounded-lg bg-dark-900 border border-dark-700 text-2xs text-dark-300 hover:text-white disabled:opacity-40">Prev</button>
                <button disabled={meta.current_page >= meta.last_page} onClick={() => setPage(p => p+1)} className="px-3 h-7 rounded-lg bg-dark-900 border border-dark-700 text-2xs text-dark-300 hover:text-white disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-dark-800 bg-dark-900/40 p-12 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-dark-800 flex items-center justify-center mb-3"><Users className="w-5 h-5 text-dark-600" /></div>
      <h3 className="text-sm font-bold text-dark-100 mb-1">No saved freelancers yet</h3>
      <p className="text-xs text-dark-500">Click the heart on any freelancer profile to bookmark them.</p>
      <Link to="/find-talent" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold">Browse talent</Link>
    </div>
  );
}
function Err({ msg, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <p className="text-xs text-red-300 mb-3">{msg}</p>
      <button onClick={onRetry} className="text-xs font-semibold text-red-200 underline">Retry</button>
    </div>
  );
}
