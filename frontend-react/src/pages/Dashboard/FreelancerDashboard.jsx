import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Handshake, DollarSign, Star, Zap, ArrowRight,
  TrendingUp, Clock, CheckCircle2, Circle, ChevronRight,
  Briefcase, MessageSquare, CreditCard, Sparkles,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { api } from '../../api';
import toast from 'react-hot-toast';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

const STATUS_STYLES = {
  pending:  'bg-warning-500/10 text-warning-500 border-warning-500/20',
  accepted: 'bg-success-500/10 text-success-500 border-success-500/20',
  rejected: 'bg-danger-500/10 text-danger-400 border-danger-500/20',
};

export default function FreelancerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, jobsRes] = await Promise.all([
          api.freelancers.dashboard(),
          api.jobs.list({ per_page: 4 }),
        ]);
        setStats(dashRes.data.data);
        setRecentJobs(jobsRes.data.data?.data || []);
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
      icon: FileText,
      label: 'Proposals Sent',
      value: stats?.proposals_count ?? null,
      sub: 'All time',
      color: 'text-primary-400',
      bg: 'bg-primary-500/8',
    },
    {
      icon: Handshake,
      label: 'Active Contracts',
      value: stats?.active_contracts ?? null,
      sub: 'In progress',
      color: 'text-accent-400',
      bg: 'bg-accent-500/8',
    },
    {
      icon: DollarSign,
      label: 'Total Earned',
      value: stats?.total_earned != null ? `$${Number(stats.total_earned).toLocaleString()}` : null,
      sub: 'After platform fees',
      color: 'text-green-400',
      bg: 'bg-green-500/8',
    },
    {
      icon: Star,
      label: 'Avg. Rating',
      value: stats?.avg_rating ? Number(stats.avg_rating).toFixed(1) : '—',
      sub: `${stats?.reviews_count || 0} reviews`,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/8',
    },
  ];

  const profileChecks = [
    { done: !!user?.name,                                 label: 'Name added' },
    { done: !!user?.freelancer_profile?.title,            label: 'Professional title' },
    { done: !!user?.freelancer_profile?.bio,              label: 'Bio written' },
    { done: (user?.skills?.length || 0) > 0,             label: 'Skills listed' },
    { done: !!user?.freelancer_profile?.hourly_rate,      label: 'Hourly rate set' },
  ];
  const profilePct = Math.round((profileChecks.filter(c => c.done).length / profileChecks.length) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Good to see you, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-dark-500 mt-1">Here's your freelance overview</p>
        </div>
        <div className="flex gap-2">
          <Link to="/jobs" className="btn btn-ghost btn-sm gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            Browse Jobs
          </Link>
          <Link to="/freelancer/profile" className="btn btn-primary btn-sm gap-1.5">
            Edit Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* Connects banner */}
      {stats?.connects_remaining != null && (
        <motion.div {...fadeUp(0.05)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-900 border border-dark-800">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-primary-400" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-white">{stats.connects_remaining} Connects remaining</span>
            <p className="text-xs text-dark-500 mt-0.5">Each proposal costs 2 connects</p>
          </div>
          <button className="btn btn-ghost btn-sm text-xs">Get more</button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} {...fadeUp(0.1 + i * 0.05)} className="card p-5 card-hover">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-dark-500 font-medium truncate">{s.label}</p>
                  <p className="text-2xl font-bold text-white mt-1.5 leading-none">
                    {loading ? <span className="skeleton w-14 h-6 inline-block rounded" /> : (s.value ?? '—')}
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

      {/* Main 2-col layout */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Left: Proposals + Job recs */}
        <div className="lg:col-span-2 space-y-5">

          {/* Recent Proposals */}
          <motion.div {...fadeUp(0.25)} className="card">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-dark-800/60">
              <h2 className="text-sm font-semibold text-white">Recent Proposals</h2>
              <Link to="/my-proposals" className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-medium">
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
                  </div>
                ))
              ) : stats?.recent_proposals?.length > 0 ? (
                stats.recent_proposals.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-800/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/jobs/${p.job_id}`)}>
                    <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-dark-500" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-100 truncate">{p.job?.title || 'Job'}</p>
                      <p className="text-xs text-dark-500 mt-0.5">
                        ${p.bid_amount}/hr · {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </p>
                    </div>
                    <span className={`badge text-2xs border ${STATUS_STYLES[p.status] || 'badge-ghost'}`}>
                      {p.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-dark-600" />
                  </div>
                  <p className="text-sm text-dark-400 font-medium">No proposals yet</p>
                  <p className="text-xs text-dark-600 mt-1">Start applying to jobs that match your skills</p>
                  <Link to="/jobs" className="btn btn-primary btn-sm mt-4 inline-flex">Find Jobs</Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recommended Jobs */}
          <motion.div {...fadeUp(0.3)} className="card">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-dark-800/60">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-400" />
                <h2 className="text-sm font-semibold text-white">Recommended Jobs</h2>
              </div>
              <Link to="/jobs" className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-medium">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-3 space-y-1">
              {loading ? (
                [1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)
              ) : recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="p-3 rounded-xl hover:bg-dark-800/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-dark-100 group-hover:text-white transition-colors line-clamp-1">{job.title}</p>
                          <span className="badge badge-ghost text-2xs shrink-0">{job.job_type?.replace('_', ' ')}</span>
                        </div>
                        <p className="text-xs text-dark-500 line-clamp-1 mt-0.5">{job.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-green-400 font-medium">${job.budget_min}–${job.budget_max}</span>
                          <span className="text-xs text-dark-600">{job.proposals_count ?? 0} proposals</span>
                          <span className="flex items-center gap-1 text-xs text-dark-600">
                            <Clock className="w-3 h-3" />
                            {job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-dark-500 py-8">No jobs available right now</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Profile strength */}
          <motion.div {...fadeUp(0.2)} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Profile Strength</h3>
              <span className={`text-sm font-bold ${profilePct < 40 ? 'text-red-400' : profilePct < 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                {profilePct}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profilePct}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                className={`h-full rounded-full ${profilePct < 40 ? 'bg-red-500' : profilePct < 80 ? 'bg-yellow-400' : 'bg-green-400'}`}
              />
            </div>
            <div className="space-y-2">
              {profileChecks.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  {c.done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" strokeWidth={2} />
                    : <Circle className="w-3.5 h-3.5 text-dark-700 shrink-0" strokeWidth={2} />
                  }
                  <span className={`text-xs ${c.done ? 'text-dark-400' : 'text-dark-600'}`}>{c.label}</span>
                </div>
              ))}
            </div>
            {profilePct < 100 && (
              <Link to="/freelancer/profile" className="btn btn-ghost btn-sm w-full mt-4 text-xs gap-1">
                Complete profile <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </motion.div>

          {/* Quick actions */}
          <motion.div {...fadeUp(0.25)} className="card p-4">
            <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-3 px-1">Quick Actions</h3>
            <div className="space-y-0.5">
              {[
                { icon: Briefcase,      label: 'Browse jobs',    to: '/jobs' },
                { icon: MessageSquare,  label: 'Messages',       to: '/messages' },
                { icon: CreditCard,     label: 'Payments',       to: '/payments' },
                { icon: Sparkles,       label: 'AI Assistant',   to: '/ai-assistant' },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-800/60 text-dark-400 hover:text-white transition-all text-sm group"
                  >
                    <Icon className="w-4 h-4 text-dark-600 group-hover:text-primary-400 transition-colors" strokeWidth={1.75} />
                    {a.label}
                    <ChevronRight className="w-3.5 h-3.5 text-dark-700 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
