import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, FileSignature, ChevronLeft, ChevronRight, Loader2, Briefcase,
  Filter, Calendar, DollarSign, ArrowUpRight, Clock, CheckCircle2,
  AlertTriangle, TrendingUp,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import UserAvatar from '../../components/ui/UserAvatar';
import ContractStatusBadge from '../../components/contracts/ContractStatusBadge';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'active',    label: 'Active',    icon: Clock,         fetcher: (p) => api.contracts.myActive(p)    },
  { id: 'completed', label: 'Completed', icon: CheckCircle2,  fetcher: (p) => api.contracts.myCompleted(p) },
  { id: 'disputed',  label: 'Disputed',  icon: AlertTriangle, fetcher: (p) => api.contracts.myDisputed(p)  },
];

const STATUSES = ['', 'pending', 'active', 'paused', 'completed', 'cancelled', 'disputed'];

const fmtMoney = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate  = (iso) => iso ? new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const STATUS_ACCENT = {
  active:    'from-emerald-500/20 to-transparent border-emerald-500/40',
  pending:   'from-amber-500/20 to-transparent border-amber-500/40',
  paused:    'from-blue-500/20 to-transparent border-blue-500/40',
  completed: 'from-dark-700/60 to-transparent border-dark-700',
  cancelled: 'from-red-500/20 to-transparent border-red-500/30',
  disputed:  'from-orange-500/20 to-transparent border-orange-500/40',
};

const STATUS_DOT = {
  active:    'bg-emerald-400',
  pending:   'bg-amber-400',
  paused:    'bg-blue-400',
  completed: 'bg-dark-500',
  cancelled: 'bg-red-400',
  disputed:  'bg-orange-400',
};

export default function ContractsList() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [searchParams] = useSearchParams();

  const validTabs = TABS.map((t) => t.id);
  const initialTab = validTabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'active';

  const [tab, setTab]             = useState(initialTab);
  const [statusFilter, setStatus] = useState('');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [rows, setRows]           = useState([]);
  const [meta, setMeta]           = useState({ last_page: 1, total: 0, current_page: 1 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page, per_page: 12 };
      let res;
      if (isAdmin) {
        if (statusFilter) params.status = statusFilter;
        if (search)       params.q      = search;
        res = await api.contracts.list(params);
      } else {
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

  const totalValue = rows.reduce((s, c) => s + Number(c.amount || 0), 0);

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary-500/15 flex items-center justify-center">
              <FileSignature className="w-4 h-4 text-primary-400" />
            </div>
            <h1 className="text-xl font-bold text-dark-50">Contracts</h1>
          </div>
          <p className="text-sm text-dark-400 ml-10.5">
            Manage your engagements, milestones, and disputes.
          </p>
        </div>

        {/* Summary pill */}
        {!loading && rows.length > 0 && (
          <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-dark-900 border border-dark-800">
            <div className="text-center">
              <div className="text-xs text-dark-500 font-medium">Showing</div>
              <div className="text-sm font-bold text-dark-100">{meta.total} contracts</div>
            </div>
            <div className="w-px h-8 bg-dark-800" />
            <div className="text-center">
              <div className="text-xs text-dark-500 font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Total value</div>
              <div className="text-sm font-bold text-emerald-400">{fmtMoney(totalValue)}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs + filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {!isAdmin && (
          <div className="flex rounded-xl border border-dark-800 bg-dark-900 p-1 gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setPage(1); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === id
                    ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                    : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 flex-1 sm:ml-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search contracts…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-dark-800 bg-dark-900 text-sm text-dark-100 placeholder:text-dark-600 outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="appearance-none pl-9 pr-8 py-2 rounded-xl border border-dark-800 bg-dark-900 text-sm text-dark-100 outline-none focus:border-primary-500/50 transition-colors"
            >
              <option value="">All statuses</option>
              {STATUSES.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          <p className="text-sm text-dark-500">Loading contracts…</p>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rows.map((c, i) => (
              <ContractCard key={c.id} contract={c} myId={user?.id} index={i} />
            ))}
          </div>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-dark-800/50">
              <p className="text-xs text-dark-500">
                Page <span className="text-dark-300 font-medium">{meta.current_page}</span> of{' '}
                <span className="text-dark-300 font-medium">{meta.last_page}</span>
                <span className="mx-1.5 text-dark-700">·</span>
                <span className="text-dark-400">{meta.total} total</span>
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.current_page <= 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-900 border border-dark-800 text-xs text-dark-300 hover:text-white hover:border-dark-700 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={meta.current_page >= meta.last_page}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-900 border border-dark-800 text-xs text-dark-300 hover:text-white hover:border-dark-700 disabled:opacity-40 transition-all"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ContractCard({ contract, myId, index }) {
  const otherUser = (Number(contract.client_id) === Number(myId)) ? contract.freelancer : contract.client;
  const role      = (Number(contract.client_id) === Number(myId)) ? 'Freelancer' : 'Client';
  const accent    = STATUS_ACCENT[contract.status] || STATUS_ACCENT.completed;
  const dot       = STATUS_DOT[contract.status]    || 'bg-dark-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <Link
        to={`/contracts/${contract.id}`}
        className={`group block rounded-2xl border bg-gradient-to-b ${accent} p-5 hover:scale-[1.01] transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-black/20`}
      >
        {/* Top row: status dot + badge */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${dot}`} />
            <h3 className="text-sm font-semibold text-dark-100 line-clamp-2 group-hover:text-white transition-colors leading-snug">
              {contract.title || 'Untitled Contract'}
            </h3>
          </div>
          <ContractStatusBadge status={contract.status} />
        </div>

        {/* Other party */}
        {otherUser && (
          <div className="flex items-center gap-2.5 mb-4 p-2.5 rounded-xl bg-dark-950/40 border border-dark-800/40">
            <UserAvatar user={otherUser} size={30} ring={false} />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-dark-100 truncate">{otherUser.name}</div>
              <div className="text-2xs text-dark-500 mt-0.5">{role}</div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-dark-600 group-hover:text-primary-400 transition-colors shrink-0" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-dark-950/30">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <DollarSign className="w-3 h-3 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xs text-dark-500 font-medium">Amount</div>
              <div className="text-xs text-dark-100 font-bold">{fmtMoney(contract.amount)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-dark-950/30">
            <div className="w-6 h-6 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
              <Calendar className="w-3 h-3 text-blue-400" />
            </div>
            <div>
              <div className="text-2xs text-dark-500 font-medium">Started</div>
              <div className="text-xs text-dark-100 font-bold">{fmtDate(contract.started_at)}</div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState({ tab }) {
  const copy = {
    active:    { title: 'No active contracts', body: 'Once a proposal is accepted, your contract will appear here.', cta: { to: '/jobs', label: 'Browse jobs', Icon: Briefcase } },
    completed: { title: 'No completed contracts', body: 'Finished engagements will show up here once both parties close out.' },
    disputed:  { title: 'No disputes — you\'re all clear', body: 'Disputes appear here if either party flags an issue with a contract.' },
  }[tab] || { title: 'No contracts found', body: '' };

  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-dark-800 bg-dark-900/30">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-dark-800/80 border border-dark-700/50 flex items-center justify-center mb-4">
        <FileSignature className="w-6 h-6 text-dark-600" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-dark-100 mb-1.5">{copy.title}</h3>
      <p className="text-xs text-dark-500 text-center max-w-xs leading-relaxed">{copy.body}</p>
      {copy.cta && (
        <Link
          to={copy.cta.to}
          className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors shadow-sm shadow-primary-500/30"
        >
          <copy.cta.Icon className="w-3.5 h-3.5" /> {copy.cta.label}
        </Link>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-red-500/20 bg-red-500/5">
      <AlertTriangle className="w-8 h-8 text-red-400 mb-3" strokeWidth={1.5} />
      <p className="text-sm text-red-300 mb-3 font-medium">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-1.5 rounded-full border border-red-500/30 text-xs font-semibold text-red-300 hover:bg-red-500/10 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
