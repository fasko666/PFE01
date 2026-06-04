import { useEffect, useState } from 'react';
import { CalendarPlus, Check, X, Loader2 } from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const fmtMoney = (n) => `$${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString() : '—';

export default function ExtensionsTab({ contract, onChanged }) {
  const { user } = useAuthStore();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState({ reason:'', new_deadline:'', additional_budget:'' });

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.contracts.extensions(contract.id); setList(data.data); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [contract.id]);

  const submit = async () => {
    try {
      await api.contracts.requestExtension(contract.id, {
        reason: draft.reason,
        new_deadline: draft.new_deadline || null,
        additional_budget: Number(draft.additional_budget) || 0,
      });
      setShow(false); setDraft({ reason:'', new_deadline:'', additional_budget:'' });
      await load(); onChanged?.();
      toast.success('Extension requested');
    } catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  const respond = async (ext, action) => {
    try { await api.contracts.respondExtension(ext.id, { action }); await load(); onChanged?.(); toast.success(`Extension ${action}ed`); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-3">
      {contract.hasParticipant?.(user.id) !== false && !contract.isTerminal && (
        <button onClick={() => setShow(!show)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold">
          <CalendarPlus className="w-3.5 h-3.5" /> Request extension
        </button>
      )}
      {show && (
        <div className="rounded-xl border border-dark-800 bg-dark-900/60 p-3 space-y-2">
          <textarea value={draft.reason} onChange={e=>setDraft({...draft,reason:e.target.value})} placeholder="Reason for the request (min 5 chars)" rows={2}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100 resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={draft.new_deadline} onChange={e=>setDraft({...draft,new_deadline:e.target.value})} className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100" />
            <input type="number" min="0" step="0.01" value={draft.additional_budget} onChange={e=>setDraft({...draft,additional_budget:e.target.value})} placeholder="Add to budget $" className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-dark-100" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={()=>setShow(false)} className="px-3 py-1.5 rounded-full text-xs text-dark-300 hover:text-white">Cancel</button>
            <button onClick={submit} disabled={draft.reason.length<5} className="px-4 py-1.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold disabled:opacity-40">Submit</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-primary-500 animate-spin" /></div>
      ) : list.length === 0 ? (
        <p className="text-xs text-dark-500 italic">No extension requests yet.</p>
      ) : (
        <ul className="space-y-2">
          {list.map(x => (
            <li key={x.id} className="rounded-xl border border-dark-800 bg-dark-900 p-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-dark-100">By {x.requester?.name}</div>
                  <p className="text-2xs text-dark-300 mt-1 whitespace-pre-wrap">{x.reason}</p>
                  <div className="text-2xs text-dark-500 mt-1">
                    {x.new_deadline && <>New deadline: {fmtDate(x.new_deadline)} · </>}
                    {Number(x.additional_budget) > 0 && <>Add budget: {fmtMoney(x.additional_budget)}</>}
                  </div>
                </div>
                <span className={`text-2xs font-semibold px-2 py-1 rounded-full border ${
                  x.status === 'pending' ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' :
                  x.status === 'accepted' ? 'bg-green-500/15 border-green-500/30 text-green-300' :
                                            'bg-red-500/15 border-red-500/30 text-red-300'
                }`}>{x.status}</span>
              </div>
              {x.status === 'pending' && Number(x.requested_by) !== Number(user.id) && (
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>respond(x, 'accept')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500 text-white text-2xs font-bold hover:bg-green-600">
                    <Check className="w-3 h-3" /> Accept
                  </button>
                  <button onClick={()=>respond(x, 'reject')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-2xs font-semibold hover:bg-red-500/25">
                    <X className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
