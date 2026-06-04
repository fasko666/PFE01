import { useEffect, useState } from 'react';
import { DollarSign, Clock, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '../../api';

const fmtMoney = (n) => `$${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;

export default function AnalyticsTab({ contract }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.contracts.analytics(contract.id).then(r => setData(r.data.data)); }, [contract.id]);
  if (!data) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-primary-500 animate-spin" /></div>;

  const Stat = ({ Icon, color, label, value }) => (
    <div className="rounded-xl border border-dark-800 bg-dark-900 p-4">
      <div className="flex items-center gap-1.5 text-2xs text-dark-500 uppercase tracking-wider mb-2">
        <Icon className={`w-3.5 h-3.5 ${color}`} /> {label}
      </div>
      <div className="text-xl font-bold font-display text-dark-100">{value}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat Icon={DollarSign}    color="text-green-400"   label="Released to freelancer"   value={fmtMoney(data.total_released_to_freelancer)} />
        <Stat Icon={TrendingUp}    color="text-primary-400" label="Platform commission"      value={fmtMoney(data.total_platform_commission)} />
        <Stat Icon={Clock}         color="text-blue-300"    label="Hours worked"             value={data.hours_worked} />
        <Stat Icon={CheckCircle2}  color="text-green-300"   label="Milestones paid"          value={`${data.milestones_paid} / ${data.milestones_total}`} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat Icon={DollarSign} color="text-yellow-300" label="In escrow"        value={fmtMoney(data.escrow_amount)} />
        <Stat Icon={DollarSign} color="text-dark-300"   label="Contract amount"  value={fmtMoney(data.contract_amount)} />
        <Stat Icon={Clock}      color="text-dark-300"   label="Days active"      value={data.days_active} />
        <Stat Icon={CheckCircle2} color="text-yellow-300" label="Submitted"      value={data.milestones_submitted} />
      </div>
    </div>
  );
}
