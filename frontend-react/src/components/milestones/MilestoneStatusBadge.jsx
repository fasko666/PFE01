import { Clock, Loader2, Upload, CheckCircle2, XCircle, DollarSign } from 'lucide-react';

const CONFIG = {
  pending:     { label: 'Pending',     Icon: Clock,         cls: 'bg-dark-700/40 border-dark-600 text-dark-300' },
  in_progress: { label: 'In progress', Icon: Loader2,       cls: 'bg-blue-500/15 border-blue-500/30 text-blue-300', spin: true },
  submitted:   { label: 'Submitted',   Icon: Upload,        cls: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' },
  approved:    { label: 'Approved',    Icon: CheckCircle2,  cls: 'bg-green-500/15 border-green-500/30 text-green-300' },
  rejected:    { label: 'Rejected',    Icon: XCircle,       cls: 'bg-red-500/15 border-red-500/30 text-red-300' },
  paid:        { label: 'Paid',        Icon: DollarSign,    cls: 'bg-green-500/15 border-green-500/30 text-green-300' },
};

export default function MilestoneStatusBadge({ status, size = 'sm' }) {
  const cfg  = CONFIG[status] || CONFIG.pending;
  const Icon = cfg.Icon;
  const padding = size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-2xs';
  const iconSz  = size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${cfg.cls} ${padding}`}>
      <Icon className={`${iconSz} ${cfg.spin ? 'animate-spin' : ''}`} strokeWidth={2.2} />
      {cfg.label}
    </span>
  );
}
