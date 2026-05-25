import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Download, ChevronDown, TrendingUp, DollarSign,
  Clock, FileText, Calendar, Info,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const REPORT_TYPES = [
  { value: 'weekly_summary',   label: 'Weekly summary' },
  { value: 'weekly_by_client', label: 'Weekly summary by client' },
  { value: 'monthly_earnings', label: 'Monthly earnings' },
  { value: 'contract_details', label: 'Contract details' },
];

const DATE_RANGES = [
  { value: 'current_week',   label: 'Current week' },
  { value: 'last_week',      label: 'Last week' },
  { value: 'current_month',  label: 'Current month' },
  { value: 'last_month',     label: 'Last month' },
  { value: 'last_3_months',  label: 'Last 3 months' },
  { value: 'current_year',   label: 'This year' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] },
});

function Select({ options, value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-dark-400">{label}</label>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="input w-full flex items-center justify-between gap-2"
        >
          {selected?.label}
          <ChevronDown className={`w-3.5 h-3.5 text-dark-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full mt-1 left-0 right-0 card shadow-float z-10 overflow-hidden animate-scale-in">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${value === o.value ? 'text-primary-400 bg-primary-500/10' : 'text-dark-300 hover:bg-dark-800'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Reports() {
  const { user } = useAuthStore();
  const [reportType, setReportType] = useState('weekly_summary');
  const [dateRange,  setDateRange]  = useState('current_week');
  const isFreelancer = user?.role === 'freelancer';

  const summaryStats = isFreelancer
    ? [
        { icon: DollarSign, label: 'Earnings',       value: '$0.00',   color: 'text-green-400', bg: 'bg-green-500/10' },
        { icon: Clock,      label: 'Hours Worked',   value: '0 hrs',   color: 'text-primary-400', bg: 'bg-primary-500/10' },
        { icon: FileText,   label: 'Contracts',      value: '0',       color: 'text-accent-400', bg: 'bg-accent-500/10' },
        { icon: TrendingUp, label: 'Avg Hourly Rate', value: '—',      color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      ]
    : [
        { icon: DollarSign, label: 'Total Spent',    value: '$0.00',   color: 'text-green-400', bg: 'bg-green-500/10' },
        { icon: FileText,   label: 'Jobs Posted',    value: '0',       color: 'text-primary-400', bg: 'bg-primary-500/10' },
        { icon: TrendingUp, label: 'Active Contracts', value: '0',     color: 'text-accent-400', bg: 'bg-accent-500/10' },
        { icon: Clock,      label: 'Avg Response Time', value: '—',   color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      ];

  const dateLabel = DATE_RANGES.find((d) => d.value === dateRange)?.label || '';
  const reportLabel = REPORT_TYPES.find((r) => r.value === reportType)?.label || '';

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">My Reports</h1>
          <p className="text-sm text-dark-500 mt-1">Track your performance and financial activity</p>
        </div>
        <button className="btn btn-ghost btn-sm gap-1.5">
          <Download className="w-3.5 h-3.5" strokeWidth={2} />
          Export CSV
        </button>
      </motion.div>

      {/* Controls */}
      <motion.div {...fadeUp(0.05)} className="card p-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <Select
            label="Report type"
            options={REPORT_TYPES}
            value={reportType}
            onChange={setReportType}
          />
          <Select
            label="Date range"
            options={DATE_RANGES}
            value={dateRange}
            onChange={setDateRange}
          />
          <div className="flex items-end">
            <button className="btn btn-primary btn-sm w-full gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" strokeWidth={2} />
              Generate Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary stats */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} {...fadeUp(0.1 + i * 0.05)} className="card p-5 card-hover">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${s.color}`} strokeWidth={2} />
              </div>
              <p className="text-xs text-dark-500 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-white mt-1">{s.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Report table area */}
      <motion.div {...fadeUp(0.2)} className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
          <div>
            <h2 className="text-sm font-semibold text-white">{reportLabel}</h2>
            <p className="text-xs text-dark-500 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" strokeWidth={2} />
              {dateLabel}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm gap-1.5 text-xs">
            <Download className="w-3 h-3" strokeWidth={2} />
            Export
          </button>
        </div>

        {/* Empty state — no real data yet */}
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700/50 flex items-center justify-center mx-auto mb-5">
            <BarChart3 className="w-7 h-7 text-dark-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-dark-400 mb-1.5">No data for this period</p>
          <p className="text-xs text-dark-600 max-w-xs mx-auto leading-relaxed">
            {isFreelancer
              ? 'Complete contracts and earn payments to see your report data here.'
              : 'Post jobs and hire freelancers to see your spending reports here.'}
          </p>
          <div className="flex items-center gap-1.5 justify-center mt-4 text-xs text-dark-600">
            <Info className="w-3 h-3" strokeWidth={2} />
            Reports update daily
          </div>
        </div>
      </motion.div>

      {/* Available reports list */}
      <motion.div {...fadeUp(0.25)} className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Available Reports</h2>
        <div className="space-y-1">
          {REPORT_TYPES.map((r) => (
            <button
              key={r.value}
              onClick={() => setReportType(r.value)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group ${reportType === r.value ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-dark-800/50'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${reportType === r.value ? 'bg-primary-500/20' : 'bg-dark-800 group-hover:bg-dark-700'}`}>
                <FileText className={`w-4 h-4 ${reportType === r.value ? 'text-primary-400' : 'text-dark-500'}`} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${reportType === r.value ? 'text-primary-300' : 'text-dark-200'}`}>{r.label}</p>
                <p className="text-xs text-dark-600 mt-0.5">
                  {r.value === 'weekly_summary'   && 'Summary of activity and earnings for the selected week'}
                  {r.value === 'weekly_by_client' && 'Weekly breakdown organized by client'}
                  {r.value === 'monthly_earnings' && 'Monthly earnings with trend comparison'}
                  {r.value === 'contract_details' && 'Detailed view of all contract activity'}
                </p>
              </div>
              {reportType === r.value && (
                <span className="badge badge-primary text-2xs shrink-0">Active</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
