import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, ListPlus, Trash2, Star } from 'lucide-react';
import { api } from '../../api';
import UserAvatar from '../../components/ui/UserAvatar';
import toast from 'react-hot-toast';

export default function TalentListDetails() {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [loading, setL] = useState(true);

  const load = useCallback(async () => {
    setL(true);
    try { const { data } = await api.talentLists.get(id); setList(data.data); }
    catch { toast.error('Failed to load list'); }
    finally { setL(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const remove = async (fid) => {
    if (!confirm('Remove freelancer from this list?')) return;
    try { await api.talentLists.removeMember(id, fid); load(); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>;
  if (!list) return null;

  return (
    <div className="space-y-5">
      <div>
        <Link to="/talent-lists" className="text-2xs text-dark-500 hover:text-white">← All lists</Link>
        <h1 className="text-2xl font-bold font-display text-dark-50 mt-1 flex items-center gap-2">
          <ListPlus className="w-5 h-5 text-primary-400" /> {list.name}
        </h1>
        {list.description && <p className="text-sm text-dark-400 mt-1">{list.description}</p>}
      </div>

      {(list.freelancers || []).length === 0 ? (
        <p className="text-xs text-dark-500 italic">No freelancers in this list yet. Open any freelancer profile and use "Add to list".</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.freelancers.map(f => {
            const fp = f.freelancer_profile || {};
            return (
              <div key={f.id} className="rounded-2xl border border-dark-800 bg-dark-900 p-4">
                <div className="flex items-start gap-3">
                  <UserAvatar user={f} size={44} ring={false} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/freelancers/${f.username}`} className="text-sm font-bold text-dark-100 truncate hover:text-white block">{f.name}</Link>
                    <div className="text-2xs text-dark-500 truncate">{fp.title || ''}</div>
                    <div className="mt-1 text-2xs text-dark-400 flex items-center gap-3">
                      {fp.hourly_rate && <span>${Number(fp.hourly_rate).toFixed(0)}/hr</span>}
                      {fp.avg_rating > 0 && <span className="inline-flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {Number(fp.avg_rating).toFixed(1)}</span>}
                    </div>
                  </div>
                  <button onClick={() => remove(f.id)} className="text-dark-500 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {f.pivot?.note && <p className="mt-2 text-2xs text-dark-400 italic border-l-2 border-dark-700 pl-2">{f.pivot.note}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
