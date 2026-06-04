import { FilePlus, Upload, CheckCircle2, XCircle, DollarSign } from 'lucide-react';

const fmt = (iso) => iso ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—';

/**
 * Pure presentation — derives a chronological event list from the milestone's
 * audit fields. No data fetching.
 */
export default function MilestoneTimeline({ milestone, activities = [] }) {
  if (!milestone) return null;

  const events = [
    milestone.created_at && {
      Icon: FilePlus, color: 'text-primary-400',
      title: 'Milestone created', at: milestone.created_at,
    },
    milestone.submitted_at && {
      Icon: Upload, color: 'text-yellow-300',
      title: 'Work submitted', at: milestone.submitted_at,
      detail: milestone.submission_notes,
    },
    milestone.rejection_reason && milestone.status === 'rejected' && {
      Icon: XCircle, color: 'text-red-300',
      title: 'Work rejected', at: milestone.updated_at,
      detail: milestone.rejection_reason,
    },
    milestone.approved_at && {
      Icon: CheckCircle2, color: 'text-green-400',
      title: 'Approved & released', at: milestone.approved_at,
    },
    milestone.status === 'paid' && {
      Icon: DollarSign, color: 'text-green-400',
      title: 'Payment delivered', at: milestone.approved_at,
    },
  ].filter(Boolean).sort((a, b) => new Date(a.at) - new Date(b.at));

  // Optional: merge in granular activity rows the controller returned
  const mergedActivities = activities
    .filter(a => a.type?.startsWith('milestone.'))
    .map(a => ({
      Icon: FilePlus, color: 'text-dark-500',
      title: a.actor?.name ? `${a.actor.name} · ${a.type.replace('milestone.', '')}` : a.type,
      at: a.created_at,
      detail: a.data?.reason || null,
    }));

  const all = [...events, ...mergedActivities].sort((a, b) => new Date(a.at) - new Date(b.at));

  if (all.length === 0) {
    return <p className="text-xs text-dark-500 italic">No events yet.</p>;
  }

  return (
    <ol className="relative border-l border-dark-700 ml-2 space-y-4 pl-5">
      {all.map((e, i) => {
        const Icon = e.Icon;
        return (
          <li key={i}>
            <span className="absolute -left-[9px] w-4 h-4 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center">
              <Icon className={`w-2.5 h-2.5 ${e.color}`} strokeWidth={2.5} />
            </span>
            <div className="text-xs font-semibold text-dark-100">{e.title}</div>
            <div className="text-2xs text-dark-500 mt-0.5">{fmt(e.at)}</div>
            {e.detail && (
              <p className="text-2xs text-dark-400 mt-1 italic border-l-2 border-dark-700 pl-2 whitespace-pre-wrap">{e.detail}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
