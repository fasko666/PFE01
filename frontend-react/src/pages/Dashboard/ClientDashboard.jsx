import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Handshake, CheckCircle2, Wallet, PenSquare,
  Search, MessageSquare, Sparkles, ChevronRight,
  TrendingUp, Users, CircleDot,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { api } from '../../api';
import toast from 'react-hot-toast';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

const JOB_STATUS = {
  open:        { label: 'Open',        cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  in_progress: { label: 'In Progress', cls: 'bg-primary-500/10 text-primary-400 border-primary-500/20' },
  completed:   { label: 'Completed',   cls: 'bg-dark-700 text-dark-400 border-dark-600' },
  cancelled:   { label: 'Cancelled',   cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  paused:      { label: 'Paused',      cls: 'bg-warning-500/10 text-warning-500 border-warning-500/20' },
};

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [myJobs, setMyJobs]   = useState([]);
  const [wallet, setWallet]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, walletRes] = await Promise.all([
          api.jobs.myJobs({ per_page: 8 }),
          api.payments.wallet(),
        ]);
        setMyJobs(jobsRes.data.data?.data || []);
        setWallet(walletRes.data.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      icon: CircleDot,
      label: 'Open Jobs',
      value: myJobs.filter(j => j.status === 'open').length,
      sub: 'Accepting proposals',
      color: 'text-green-400',
      bg: 'bg-green-500/8',
    },
    {
      icon: Handshake,
      label: 'In Progress',
      value: myJobs.filter(j => j.status === 'in_progress').length,
      sub: 'Active contracts',
      color: 'text-primary-400',
      bg: 'bg-primary-500/8',
    },
    {
      icon: CheckCircle2,
      label: 'Completed',
      value: myJobs.filter(j => j.status === 'completed').length,
      sub: 'All time',
      color: 'text-dark-400',
      bg: 'bg-dark-700',
    },
    {
      icon: Wallet,
      label: 'Wallet Balance',
      value: wallet?.balance != null
        ? `$${Number(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
        : '—',
      sub: 'Available to spend',
      color: 'text-accent-400',
      bg: 'bg-accent-500/8',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-dark-500 mt-1">Manage your projects and hire top talent</p>
        </div>
        <div className="flex gap-2">
          <Link to="/freelancers" className="btn btn-ghost btn-sm gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Find Talent
          </Link>
          <Link to="/jobs/post" className="btn btn-primary btn-sm gap-1.5">
            <PenSquare className="w-3.5 h-3.5" />
            Post a Job
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} {...fadeUp(0.1 + i * 0.05)} className="card p-5 card-hover">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-dark-500 font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-dark-100 mt-1.5 leading-none">
                    {loading ? <span className="skeleton w-12 h-6 inline-block rounded" /> : s.value}
                  </p>
                  <p className="text-xs text-dark-600 mt-1">{s.sub}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${s.color}`} strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* My Jobs */}
        <motion.div {...fadeUp(0.25)} className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-dark-700/60">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-dark-100">My Jobs</h2>
            </div>
            <Link to="/my-jobs" className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-medium">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-3 space-y-1">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center p-2 animate-pulse">
                  <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 rounded w-2/3" />
                    <div className="skeleton h-3 rounded w-1/3" />
                  </div>
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
              ))
            ) : myJobs.length > 0 ? (
              myJobs.slice(0, 5).map((job) => {
                const statusInfo = JOB_STATUS[job.status] || JOB_STATUS.open;
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-800/40 cursor-pointer transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-100 group-hover:text-dark-50 transition-colors truncate">{job.title}</p>
                      <p className="text-xs text-dark-500 mt-0.5">
                        {job.proposals_count ?? 0} proposals · ${job.budget_min}–${job.budget_max}
                      </p>
                    </div>
                    <span className={`badge text-2xs border shrink-0 ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-5 h-5 text-dark-600" />
                </div>
                <p className="text-sm text-dark-400 font-medium">No jobs posted yet</p>
                <p className="text-xs text-dark-600 mt-1">Post your first job and start receiving proposals</p>
                <Link to="/jobs/post" className="btn btn-primary btn-sm mt-4 inline-flex gap-1.5">
                  <PenSquare className="w-3.5 h-3.5" />
                  Post First Job
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Wallet */}
          <motion.div {...fadeUp(0.2)} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-dark-100">Wallet</h3>
              <Link to="/payments" className="text-xs text-primary-400 hover:text-primary-300">Manage →</Link>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-transparent border border-primary-500/15">
              <p className="text-xs text-dark-500">Available balance</p>
              <p className="text-2xl font-bold text-dark-100 mt-1">
                {loading ? <span className="skeleton w-20 h-7 inline-block rounded" /> : `$${Number(wallet?.balance || 0).toFixed(2)}`}
              </p>
              <p className="text-xs text-dark-600 mt-1">Ready to fund your next project</p>
            </div>
            <button onClick={() => navigate('/payments')} className="btn btn-ghost btn-sm w-full mt-3 gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              Add funds
            </button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeUp(0.25)} className="card p-4">
            <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-3 px-1">Quick Actions</h3>
            <div className="space-y-0.5">
              {[
                { icon: PenSquare,     label: 'Post a Job',       to: '/jobs/post' },
                { icon: Search,        label: 'Find Freelancers', to: '/freelancers' },
                { icon: MessageSquare, label: 'Messages',         to: '/messages' },
                { icon: Sparkles,      label: 'AI Assistant',     to: '/ai-assistant' },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-800/60 text-dark-400 hover:text-dark-100 transition-all text-sm group"
                  >
                    <Icon className="w-4 h-4 text-dark-600 group-hover:text-primary-400 transition-colors" strokeWidth={1.75} />
                    {a.label}
                    <ChevronRight className="w-3.5 h-3.5 text-dark-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div {...fadeUp(0.3)} className="card p-4">
            <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-3 px-1">Tips for Success</h3>
            <div className="space-y-3">
              {[
                { icon: PenSquare,    tip: 'Write a detailed job description to attract quality proposals' },
                { icon: TrendingUp,   tip: 'Set a competitive budget to get responses faster' },
                { icon: CheckCircle2, tip: 'Leave reviews after projects to build your reputation' },
              ].map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-lg bg-dark-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3 h-3 text-dark-500" strokeWidth={2} />
                    </div>
                    <p className="text-xs text-dark-500 leading-relaxed">{t.tip}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
