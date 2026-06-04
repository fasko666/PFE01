import { CheckCircle2, AlertTriangle, ShieldCheck, XCircle, PlayCircle, FilePlus } from 'lucide-react';

const fmt = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

/**
 * Derives a chronological event list from the contract's audit fields and
 * renders it as a vertical timeline. Pure presentation — no data fetching.
 */
export default function ContractTimeline({ contract }) {
  if (!contract) return null;

  const events = [
    contract.created_at && {
      Icon: FilePlus, color: 'text-primary-400',
      title: 'Contract created', at: contract.created_at,
    },
    contract.started_at && contract.started_at !== contract.created_at && {
      Icon: PlayCircle, color: 'text-blue-300',
      title: 'Work started', at: contract.started_at,
    },
    contract.disputed_at && {
      Icon: AlertTriangle, color: 'text-amber-300',
      title: 'Dispute opened',
      at: contract.disputed_at,
      detail: contract.dispute_reason,
    },
    contract.resolved_at && {
      Icon: ShieldCheck, color: 'text-green-300',
      title: `Dispute resolved (${contract.resolution_outcome?.replace(/_/g, ' ') ?? ''})`,
      at: contract.resolved_at,
    },
    contract.status === 'completed' && contract.ended_at && {
      Icon: CheckCircle2, color: 'text-green-400',
      title: 'Contract completed', at: contract.ended_at,
    },
    contract.status === 'cancelled' && contract.ended_at && {
      Icon: XCircle, color: 'text-red-300',
      title: 'Contract cancelled',
      at: contract.ended_at,
      detail: contract.cancellation_reason,
    },
  ].filter(Boolean).sort((a, b) => new Date(a.at) - new Date(b.at));

  if (events.length === 0) {
    return <p className="text-xs text-dark-500">No timeline events yet.</p>;
  }

  return (
    <ol className="relative border-l border-dark-700 ml-2 space-y-4 pl-5">
      {events.map((e, i) => {
        const Icon = e.Icon;
        return (
          <li key={i}>
            <span className={`absolute -left-[9px] w-4 h-4 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center`}>
              <Icon className={`w-2.5 h-2.5 ${e.color}`} strokeWidth={2.5} />
            </span>
            <div className="text-xs font-semibold text-dark-100">{e.title}</div>
            <div className="text-2xs text-dark-500 mt-0.5">{fmt(e.at)}</div>
            {e.detail && (
              <p className="text-2xs text-dark-400 mt-1 italic border-l-2 border-dark-700 pl-2">{e.detail}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
