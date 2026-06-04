import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ListPlus, Loader2, Trash2, Edit2, Users } from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

export default function TalentLists() {
  const [rows, setRows] = useState([]);
  const [loading, setL] = useState(true);
  const [showCreate, setShow] = useState(false);
  const [draft, setDraft] = useState({ name: '', description: '' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setL(true);
    try { const { data } = await api.talentLists.list(); setRows(data.data); }
    catch { toast.error('Failed to load lists'); }
    finally { setL(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setBusy(true);
    try {
      await api.talentLists.create(draft);
      setShow(false); setDraft({ name: '', description: '' });
      toast.success('List created'); load();
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this list?')) return;
    try { await api.talentLists.delete(id); load(); toast.success('Deleted'); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-dark-50 flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-primary-400" /> Talent lists
          </h1>
          <p className="text-sm text-dark-400">Organize candidates into named, shareable lists.</p>
        </div>
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> New list
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-dark-800 bg-dark-900/60 p-3 space-y-2 max-w-md">
          <input autoFocus value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} placeholder="List name" className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100" />
          <textarea value={draft.description} onChange={e => setDraft({...draft, description: e.target.value})} placeholder="Description (optional)" rows={2} className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100 resize-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShow(false)} className="px-3 py-1.5 rounded-full text-xs text-dark-300 hover:text-white">Cancel</button>
            <button onClick={create} disabled={!draft.name || busy} className="px-4 py-1.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold disabled:opacity-40">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-dark-800 bg-dark-900/40 p-12 text-center">
          <Users className="w-8 h-8 text-dark-600 mx-auto mb-2" />
          <p className="text-xs text-dark-500">No lists yet. Create one to organize candidates by role, project, or pipeline stage.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map(l => (
            <div key={l.id} className="rounded-2xl border border-dark-800 bg-dark-900 p-4">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/talent-lists/${l.id}`} className="min-w-0 flex-1 group">
                  <h3 className="text-sm font-bold text-dark-100 truncate group-hover:text-white">{l.name}</h3>
                  {l.description && <p className="text-2xs text-dark-400 mt-1 line-clamp-2">{l.description}</p>}
                </Link>
                <button onClick={() => remove(l.id)} className="text-dark-500 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="mt-3 text-2xs text-dark-500">{l.freelancers_count ?? 0} members</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
