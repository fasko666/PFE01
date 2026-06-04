import {
  Loader2, CheckCircle2, PauseCircle, XCircle, AlertTriangle, Clock,
} from 'lucide-react';

/**
 * Color + icon mapping for the six contract statuses. Stateless, themable
 * via the existing `bg-*-/15 border-*-/30 text-*-300` Tailwind palette so
 * it inherits dark/light variants automatically.
 */
const CONFIG = {
  pending:   { label: 'Pending',   Icon: Clock,          cls: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300'  },
  active:    { label: 'Active',    Icon: Loader2,        cls: 'bg-blue-500/15   border-blue-500/30   text-blue-300'    },
  paused:    { label: 'Paused',    Icon: PauseCircle,    cls: 'bg-dark-700/40   border-dark-600       text-dark-200'    },
  completed: { label: 'Completed', Icon: CheckCircle2,   cls: 'bg-green-500/15  border-green-500/30  text-green-300'   },
  cancelled: { label: 'Cancelled', Icon: XCircle,        cls: 'bg-red-500/15    border-red-500/30    text-red-300'     },
  disputed:  { label: 'Disputed',  Icon: AlertTriangle,  cls: 'bg-amber-500/15  border-amber-500/30  text-amber-300'   },
};

export default function ContractStatusBadge({ status, size = 'sm' }) {
  const cfg  = CONFIG[status] || CONFIG.pending;
  const Icon = cfg.Icon;
  const padding = size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-2xs';
  const iconSz  = size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${cfg.cls} ${padding}`}>
      <Icon className={`${iconSz} ${status === 'active' ? 'animate-spin' : ''}`} strokeWidth={2.2} />
      {cfg.label}
    </span>
  );
}
