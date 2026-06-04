import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Loader2, FileSignature, Filter } from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import MilestoneCard from './MilestoneCard';
import CreateMilestoneModal from './CreateMilestoneModal';
import SubmitWorkModal     from './SubmitWorkModal';
import RejectWorkModal     from './RejectWorkModal';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['all', 'pending', 'in_progress', 'submitted', 'approved', 'rejected', 'paid'];

/**
 * Full milestone list for a contract — drives create/submit/approve/reject
 * modals. Owns local search + filter + pagination. Refetches after every
 * mutation. Server-driven permissions: action handlers are only wired in for
 * the user roles that are allowed to perform them.
 */
export default function MilestoneList({ contract, onChanged }) {
  const { user } = useAuthStore();
  const isClient     = Number(user.id) === Number(contract.client_id);
  const isFreelancer = Number(user.id) === Number(contract.freelancer_id);
  const isContractTerminal = ['completed', 'cancelled'].includes(contract.status);

  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [busy, setBusy]       = useState(false);

  const [q, setQ]               = useState('');
  const [statusFilter, setSF]   = useState('all');
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({ last_page: 1, current_page: 1, total: 0 });

  const [showCreate, setShowCreate] = useState(false);
  const [submitTarget, setSubmit]   = useState(null);
  const [rejectTarget, setReject]   = useState(null);

  const load = async (pageOverride = page) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.milestones.list(contract.id, { page: pageOverride });
      const p = data.data;
      setList(p?.data || []);
      setMeta({
        last_page: p?.last_page || 1,
        current_page: p?.current_page || 1,
        total: p?.total || 0,
      });
    } catch (e) { setError(e?.response?.data?.message || 'Failed to load milestones'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [contract.id]);

  const filtered = useMemo(() => {
    return list.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (q && !(m.title || '').toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [list, q, statusFilter]);

  const wrap = async (promise, successMsg) => {
    setBusy(true);
    try { await promise; toast.success(successMsg); await load(meta.current_page); onChanged?.(); }
    catch (e) { toast.error(e?.response?.data?.message || 'Action failed'); }
    finally { setBusy(false); }
  };

  const approve = (m) => {
    if (!confirm(`Approve and release $${Number(m.amount).toFixed(2)} to the freelancer?`)) return;
    return wrap(api.milestones.approve(m.id), 'Milestone approved & funds released');
  };
  const remove  = (m) => {
    if (!confirm('Delete this milestone? This cannot be undone.')) return;
    return wrap(api.milestones.delete(m.id), 'Milestone deleted');
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search milestones…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-600 outline-none focus:border-primary-500/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setSF(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2 rounded-xl border border-dark-700 bg-dark-900 text-sm text-dark-100 outline-none focus:border-primary-500/50"
          >
            {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
          </select>
        </div>
        {isClient && !isContractTerminal && (
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" /> New milestone
          </button>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 text-primary-500 animate-spin" /></div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-xs text-red-300 mb-3">{error}</p>
          <button onClick={() => load(1)} className="text-xs font-semibold text-red-200 underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState isClient={isClient} canCreate={!isContractTerminal} onCreate={() => setShowCreate(true)} />
      ) : (
        <>
          <ul className="space-y-2">
            {filtered.map((m) => (
              <li key={m.id}>
                <MilestoneCard
                  milestone={m}
                  busy={busy}
                  onSubmit={isFreelancer ? (mm) => setSubmit(mm) : undefined}
                  onApprove={isClient    ? approve : undefined}
                  onReject={isClient     ? (mm) => setReject(mm) : undefined}
                  onDelete={isClient     ? remove : undefined}
                />
              </li>
            ))}
          </ul>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-2xs text-dark-500">Page {meta.current_page} of {meta.last_page} · {meta.total} milestones</p>
              <div className="flex gap-1">
                <button disabled={meta.current_page <= 1} onClick={() => { const p = meta.current_page - 1; setPage(p); load(p); }}
                  className="px-3 h-7 rounded-lg bg-dark-900 border border-dark-700 text-2xs text-dark-300 hover:text-white disabled:opacity-40">Prev</button>
                <button disabled={meta.current_page >= meta.last_page} onClick={() => { const p = meta.current_page + 1; setPage(p); load(p); }}
                  className="px-3 h-7 rounded-lg bg-dark-900 border border-dark-700 text-2xs text-dark-300 hover:text-white disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      <CreateMilestoneModal
        open={showCreate} onClose={() => setShowCreate(false)}
        contractId={contract.id}
        onCreated={() => { setShowCreate(false); load(1); onChanged?.(); }}
      />
      <SubmitWorkModal
        open={!!submitTarget} milestone={submitTarget} onClose={() => setSubmit(null)}
        onSubmitted={() => { setSubmit(null); load(meta.current_page); onChanged?.(); }}
      />
      <RejectWorkModal
        open={!!rejectTarget} milestone={rejectTarget} onClose={() => setReject(null)}
        onRejected={() => { setReject(null); load(meta.current_page); onChanged?.(); }}
      />
    </div>
  );
}

function EmptyState({ isClient, canCreate, onCreate }) {
  return (
    <div className="rounded-2xl border border-dashed border-dark-800 bg-dark-900/40 p-12 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-dark-800 flex items-center justify-center mb-3">
        <FileSignature className="w-5 h-5 text-dark-600" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-bold text-dark-100 mb-1">No milestones yet</h3>
      <p className="text-xs text-dark-500">
        {isClient ? 'Break the work into milestones so the freelancer gets paid in stages.' : 'The client will add milestones soon.'}
      </p>
      {isClient && canCreate && (
        <button onClick={onCreate}
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" /> Create first milestone
        </button>
      )}
    </div>
  );
}
