import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, DollarSign, Lock, FileSignature, Loader2, MessageSquare,
  Star, AlertTriangle, ArrowRight, Briefcase, User as UserIcon, ExternalLink,
  FileText, Activity, Clock, Paperclip, CalendarPlus, BarChart3, Archive, Printer,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import UserAvatar from '../../components/ui/UserAvatar';
import ContractStatusBadge from '../../components/contracts/ContractStatusBadge';
import ContractTimeline   from '../../components/contracts/ContractTimeline';
import ContractActions    from '../../components/contracts/ContractActions';
import MilestonesTab      from '../../components/contracts/MilestonesTab';
import FilesTab           from '../../components/contracts/FilesTab';
import TimeTrackingTab    from '../../components/contracts/TimeTrackingTab';
import ActivityTab        from '../../components/contracts/ActivityTab';
import AnalyticsTab       from '../../components/contracts/AnalyticsTab';
import ExtensionsTab      from '../../components/contracts/ExtensionsTab';
import ChatTab            from '../../components/contracts/ChatTab';
import RatingModal        from '../../components/contracts/RatingModal';
import toast from 'react-hot-toast';

const fmtMoney = (n) => `$${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtDate  = (iso) => iso ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const TABS = [
  { id: 'overview',   label: 'Overview',   Icon: FileText },
  { id: 'milestones', label: 'Milestones', Icon: Briefcase },
  { id: 'chat',       label: 'Chat',       Icon: MessageSquare },
  { id: 'files',      label: 'Files',      Icon: Paperclip },
  { id: 'time',       label: 'Time',       Icon: Clock },
  { id: 'extensions', label: 'Extensions', Icon: CalendarPlus },
  { id: 'activity',   label: 'Activity',   Icon: Activity },
  { id: 'analytics',  label: 'Analytics',  Icon: BarChart3 },
];

export default function ContractDetails() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const [contract, setContract] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [tab, setTab]           = useState('overview');
  const [showRating, setShowRating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.contracts.get(id);
      setContract(data.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load contract');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const archive = async () => {
    if (!confirm('Archive this contract?')) return;
    try { await api.contracts.archive(id); toast.success('Archived'); load(); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
  };
  const unarchive = async () => {
    try { await api.contracts.unarchive(id); toast.success('Unarchived'); load(); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>;
  if (error || !contract) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center max-w-md mx-auto mt-12">
        <p className="text-sm text-red-300 mb-3">{error || 'Contract not found'}</p>
        <button onClick={load} className="text-xs font-semibold text-red-200 underline">Try again</button>
      </div>
    );
  }

  const isClient     = Number(user?.id) === Number(contract.client_id);
  const counterparty = isClient ? contract.freelancer : contract.client;
  const counterRole  = isClient ? 'Freelancer' : 'Client';
  const isArchived   = !!contract.archived_at;
  const isTerminal   = ['completed', 'cancelled'].includes(contract.status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-2xs text-dark-500 mb-1">
              <FileSignature className="w-3.5 h-3.5" /> Contract #{contract.id}
              {contract.job?.title && (<><span>·</span>
                <Link to={`/jobs/${contract.job_id}`} className="text-primary-400 hover:underline truncate">{contract.job.title}</Link></>)}
            </div>
            <h1 className="text-2xl font-bold font-display text-dark-50 mb-3 line-clamp-2">{contract.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <ContractStatusBadge status={contract.status} size="lg" />
              {isArchived && <span className="text-2xs px-2 py-1 rounded-full bg-dark-800 border border-dark-700 text-dark-300">Archived</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={api.contracts.pdfUrl(contract.id)} target="_blank" rel="noreferrer"
              onClick={async (e) => {
                e.preventDefault();
                // Fetch with bearer token, then open the HTML as blob
                try {
                  const res = await fetch(api.contracts.pdfUrl(contract.id), { headers: { Authorization: `Bearer ${localStorage.getItem('panda_token')||''}` } });
                  const html = await res.text();
                  const w = window.open(); w.document.open(); w.document.write(html); w.document.close();
                } catch { toast.error('Could not open PDF'); }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-200 hover:bg-dark-700 transition-colors">
              <Printer className="w-3.5 h-3.5" /> PDF
            </a>
            {isTerminal && (
              isArchived ? (
                <button onClick={unarchive} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-200 hover:bg-dark-700">
                  <Archive className="w-3.5 h-3.5" /> Unarchive
                </button>
              ) : (
                <button onClick={archive} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-dark-800 border border-dark-700 text-xs text-dark-200 hover:bg-dark-700">
                  <Archive className="w-3.5 h-3.5" /> Archive
                </button>
              )
            )}
          </div>
        </div>

        {contract.status === 'disputed' && contract.dispute_reason && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
            <div className="text-2xs">
              <div className="font-semibold text-amber-200">Dispute opened by {contract.disputeOpener?.name || 'a party'}</div>
              <div className="text-amber-100/80 mt-0.5">{contract.dispute_reason}</div>
              <a href={api.contracts.disputePdfUrl(contract.id)}
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch(api.contracts.disputePdfUrl(contract.id), { headers: { Authorization: `Bearer ${localStorage.getItem('panda_token')||''}` } });
                    const html = await res.text();
                    const w = window.open(); w.document.open(); w.document.write(html); w.document.close();
                  } catch { toast.error('Could not open dispute report'); }
                }}
                className="inline-block mt-2 text-amber-200 underline">Open dispute report PDF</a>
            </div>
          </div>
        )}
        {contract.status === 'cancelled' && contract.cancellation_reason && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-2xs text-red-200">
            Cancelled: {contract.cancellation_reason}
          </div>
        )}
      </div>

      {/* Tab strip */}
      <div className="overflow-x-auto scrollbar-none -mx-2 px-2">
        <div className="inline-flex gap-1 rounded-2xl bg-dark-900 border border-dark-800 p-1 min-w-max">
          {TABS.map(t => {
            const Icon = t.Icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  tab === t.id ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white hover:bg-dark-800'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {tab === 'overview' && (
            <OverviewTab contract={contract} isClient={isClient} counterparty={counterparty} counterRole={counterRole} setShowRating={setShowRating} />
          )}
          {tab === 'milestones' && <MilestonesTab contract={contract} onChanged={load} />}
          {tab === 'chat'       && <ChatTab       contract={contract} />}
          {tab === 'files'      && <FilesTab      contract={contract} />}
          {tab === 'time'       && <TimeTrackingTab contract={contract} />}
          {tab === 'extensions' && <ExtensionsTab contract={contract} onChanged={load} />}
          {tab === 'activity'   && <ActivityTab   contract={contract} />}
          {tab === 'analytics'  && <AnalyticsTab  contract={contract} />}
        </div>

        {/* Right rail (always visible) */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
            <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-3">Actions</h2>
            <ContractActions contract={contract} onChanged={load} />
            {isTerminal && counterparty?.id && (
              <button onClick={() => setShowRating(true)} className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-xs font-semibold hover:bg-yellow-500/25 transition-colors">
                <Star className="w-3.5 h-3.5" /> Rate {counterRole.toLowerCase()}
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
            <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-4">Timeline</h2>
            <ContractTimeline contract={contract} />
          </div>
        </div>
      </div>

      <RatingModal
        open={showRating} onClose={() => setShowRating(false)}
        revieweeId={counterparty?.id} revieweeName={counterparty?.name}
        onSubmitted={load}
      />
    </div>
  );
}

/* Overview content (was inlined before — extracted as the default tab) */
function OverviewTab({ contract, isClient, counterparty, counterRole, setShowRating }) {
  return (
    <>
      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
        <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-3">Parties</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <PartyCard label="Client"     user={contract.client}     mine={isClient} />
          <PartyCard label="Freelancer" user={contract.freelancer} mine={!isClient} />
        </div>
      </div>

      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
        <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-3">Financial</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat Icon={DollarSign} color="text-green-400"   label="Amount"     value={fmtMoney(contract.amount)} />
          <Stat Icon={Lock}       color="text-blue-300"    label="In escrow"  value={fmtMoney(contract.escrow_amount)} />
          <Stat Icon={Calendar}   color="text-primary-400" label="Started"    value={fmtDate(contract.started_at)} small />
          <Stat Icon={Calendar}   color="text-dark-400"    label={contract.deadline_at ? 'Deadline' : 'Ended'}
                value={fmtDate(contract.deadline_at || contract.ended_at)} small />
        </div>
      </div>

      {(contract.description || contract.terms) && (
        <div className="rounded-2xl border border-dark-800 bg-dark-900 p-5">
          {contract.description && (<div className="mb-4">
            <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-2">Scope</h2>
            <p className="text-sm text-dark-300 whitespace-pre-wrap leading-relaxed">{contract.description}</p>
          </div>)}
          {contract.terms && (<div>
            <h2 className="text-xs font-bold text-dark-100 uppercase tracking-wider mb-2">Terms</h2>
            <p className="text-sm text-dark-300 whitespace-pre-wrap leading-relaxed">{contract.terms}</p>
          </div>)}
        </div>
      )}

      <div className="rounded-2xl border border-dark-800 bg-dark-900 p-3 space-y-1">
        {contract.conversation_id && (
          <Link to={`/messages/${contract.conversation_id}`}
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-dark-800/70 transition-colors text-sm">
            <span className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-400" />
            </span>
            <span className="text-dark-200 flex-1">Open chat with {counterparty?.name || counterRole.toLowerCase()}</span>
            <ArrowRight className="w-3.5 h-3.5 text-dark-500" />
          </Link>
        )}
        {counterparty?.username && (
          <Link to={`/freelancers/${counterparty.username}`}
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-dark-800/70 transition-colors text-sm">
            <span className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-dark-300" />
            </span>
            <span className="text-dark-200 flex-1">View {counterRole.toLowerCase()} profile</span>
            <ArrowRight className="w-3.5 h-3.5 text-dark-500" />
          </Link>
        )}
        {contract.job_id && (
          <Link to={`/jobs/${contract.job_id}`}
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-dark-800/70 transition-colors text-sm">
            <span className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-dark-300" />
            </span>
            <span className="text-dark-200 flex-1">View original job</span>
            <ExternalLink className="w-3.5 h-3.5 text-dark-500" />
          </Link>
        )}
      </div>
    </>
  );
}

function PartyCard({ label, user, mine }) {
  if (!user) return null;
  return (
    <div className={`rounded-xl border p-3 flex items-center gap-3 ${mine ? 'border-primary-500/30 bg-primary-500/5' : 'border-dark-800 bg-dark-900/50'}`}>
      <UserAvatar user={user} size={36} ring={false} />
      <div className="min-w-0 flex-1">
        <div className="text-2xs text-dark-500 uppercase tracking-wider">{label}{mine && ' (you)'}</div>
        <div className="text-sm font-semibold text-dark-100 truncate">{user.name}</div>
        {user.country && <div className="text-2xs text-dark-500">{user.country}</div>}
      </div>
    </div>
  );
}

function Stat({ Icon, color, label, value, small }) {
  return (
    <div className="rounded-xl border border-dark-800 bg-dark-900/40 p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <div className="text-2xs text-dark-500 uppercase tracking-wider">{label}</div>
      </div>
      <div className={`${small ? 'text-xs' : 'text-base'} font-bold text-dark-100`}>{value}</div>
    </div>
  );
}
