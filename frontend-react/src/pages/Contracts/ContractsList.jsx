import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, FileSignature, ChevronLeft, ChevronRight, Loader2, Briefcase, Filter,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import UserAvatar from '../../components/ui/UserAvatar';
import ContractStatusBadge from '../../components/contracts/ContractStatusBadge';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'active',    label: 'Active',    fetcher: (p) => api.contracts.myActive(p)    },
  { id: 'completed', label: 'Completed', fetcher: (p) => api.contracts.myCompleted(p) },
  { id: 'disputed',  label: 'Disputed',  fetcher: (p) => api.contracts.myDisputed(p)  },
];

const STATUSES = ['', 'pending', 'active', 'paused', 'completed', 'cancelled', 'disputed'];

const fmtMoney = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate  = (iso) => iso ? new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function ContractsList() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [tab, setTab]               = useState('active');
  const [statusFilter, setStatus]   = useState('');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [rows, setRows]             = useState([]);
  const [meta, setMeta]             = useState({ last_page: 1, total: 0, current_page: 1 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Admins use the global /contracts endpoint with filters; everyone else uses /my/*
      const params = { page, per_page: 12 };
      let res;
      if (isAdmin) {
        if (statusFilter) params.status = statusFilter;
        if (search)       params.q      = search;
        res = await api.contracts.list(params);
      } else {
        // Tabs map to status sets — additional status filter is intersected client-side
        const tabFetcher = TABS.find((t) => t.id === tab).fetcher;
        res = await tabFetcher(params);
        if (statusFilter || search) {
          let data = res.data?.data?.data || [];
          if (statusFilter) data = data.filter((c) => c.status === statusFilter);
          if (search) {
            const q = search.toLowerCase();
            data = data.filter((c) => (c.title || '').toLowerCase().includes(q));
          }
          res = { data: { data: { ...res.data.data, data } } };
        }
      }
      const paginator = res.data?.data;
      setRows(paginator?.data || []);
      setMeta({
        last_page:    paginator?.last_page    || 1,
        total:        paginator?.total        || 0,
        current_page: paginator?.current_page || 1,
      });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter, search, page, isAdmin]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-dark-50 flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-primary-400" /> Contracts
          </h1>
          <p className="text-sm text-dark-400">Track your active engagements, completed work, and open disputes.</p>
        </div>

        {/* Tabs (hidden for admin — admin uses the status filter instead) */}
        {!isAdmin && (
          <div className="inline-flex rounded-full border border-dark-700 p-1 bg-dark-900">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  tab === t.id ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-100'
                }`}
              >{t.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-dark-700 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-600 outline-none focus:border-primary-500/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="appearance-none pl-9 pr-8 py-2 rounded-xl border border-dark-700 bg-dark-900 text-sm text-dark-100 outline-none focus:border-primary-500/50"
          >
            <option value="">All statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map((c) => <ContractCard key={c.id} contract={c} myId={user?.id} />)}
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-2xs text-dark-500">
                Page {meta.current_page} of {meta.last_page} · {meta.total} contracts
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.current_page <= 1}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-dark-900 border border-dark-700 text-dark-300 hover:text-white hover:border-dark-600 disabled:opacity-40 transition-colors"
                ><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={meta.current_page >= meta.last_page}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-dark-900 border border-dark-700 text-dark-300 hover:text-white hover:border-dark-600 disabled:opacity-40 transition-colors"
                ><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ContractCard({ contract, myId }) {
  const otherUser = (Number(contract.client_id) === Number(myId)) ? contract.freelancer : contract.client;
  const role      = (Number(contract.client_id) === Number(myId)) ? 'Freelancer' : 'Client';

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
      <Link
        to={`/contracts/${contract.id}`}
        className="block rounded-2xl border border-dark-800 bg-dark-900 p-4 hover:border-dark-700 transition-colors group"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-bold text-dark-100 line-clamp-2 group-hover:text-white transition-colors">
            {contract.title}
          </h3>
          <ContractStatusBadge status={contract.status} />
        </div>

        {/* Other party */}
        {otherUser && (
          <div className="flex items-center gap-2 mb-3">
            <UserAvatar user={otherUser} size={28} ring={false} />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-dark-200 truncate">{otherUser.name}</div>
              <div className="text-2xs text-dark-500">{role}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-2xs">
          <div>
            <div className="text-dark-500 uppercase tracking-wider">Amount</div>
            <div className="text-dark-100 font-semibold mt-0.5">{fmtMoney(contract.amount)}</div>
          </div>
          <div>
            <div className="text-dark-500 uppercase tracking-wider">Started</div>
            <div className="text-dark-100 font-semibold mt-0.5">{fmtDate(contract.started_at)}</div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState({ tab }) {
  const copy = {
    active:    { title: 'No active contracts yet', body: 'Once a proposal is accepted, the contract will appear here.', cta: { to: '/jobs', label: 'Browse jobs', Icon: Briefcase } },
    completed: { title: 'No completed contracts',  body: 'Finished engagements will show up here.' },
    disputed:  { title: 'No disputes — all clear', body: 'Disputes appear here if either party flags an issue.' },
  }[tab] || { title: 'No contracts', body: '' };

  return (
    <div className="rounded-2xl border border-dashed border-dark-800 bg-dark-900/40 p-12 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-dark-800 flex items-center justify-center mb-3">
        <FileSignature className="w-5 h-5 text-dark-600" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-bold text-dark-100 mb-1">{copy.title}</h3>
      <p className="text-xs text-dark-500">{copy.body}</p>
      {copy.cta && (
        <Link
          to={copy.cta.to}
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors"
        >
          <copy.cta.Icon className="w-3.5 h-3.5" /> {copy.cta.label}
        </Link>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <p className="text-xs text-red-300 mb-3">{message}</p>
      <button onClick={onRetry} className="text-xs font-semibold text-red-200 underline">Try again</button>
    </div>
  );
}
