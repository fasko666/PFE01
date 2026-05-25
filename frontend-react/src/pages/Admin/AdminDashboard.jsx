import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, Handshake, DollarSign, User, Building2,
  FileText, Star, Search, BarChart3, CheckCircle2, XCircle,
  TrendingUp, Activity,
} from 'lucide-react';
import { api } from '../../api';
import toast from 'react-hot-toast';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] },
});

const TABS = ['overview', 'users', 'analytics'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userFilter, setUserFilter] = useState({ search: '', role: '', page: 1 });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.admin.dashboard()
      .then((r) => setStats(r.data.data))
      .catch(() => toast.error('Failed to load admin stats'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab !== 'users') return;
    setUsersLoading(true);
    const clean = Object.fromEntries(Object.entries(userFilter).filter(([, v]) => v !== ''));
    api.admin.users(clean)
      .then((r) => setUsers(r.data.data?.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setUsersLoading(false));
  }, [activeTab, userFilter.page, userFilter.role]);

  const handleSearch = (e) => {
    e.preventDefault();
    setUsersLoading(true);
    const clean = Object.fromEntries(Object.entries(userFilter).filter(([, v]) => v !== ''));
    api.admin.users(clean)
      .then((r) => setUsers(r.data.data?.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setUsersLoading(false));
  };

  const banUser = async (userId, userName) => {
    if (!window.confirm(`Ban user ${userName}?`)) return;
    try {
      await api.admin.banUser(userId);
      setUsers((u) => u.map((x) => x.id === userId ? { ...x, is_active: false } : x));
      toast.success('User banned');
    } catch { toast.error('Failed to ban user'); }
  };

  const verifyUser = async (userId) => {
    try {
      await api.admin.verifyUser(userId);
      setUsers((u) => u.map((x) => x.id === userId ? { ...x, is_verified: true } : x));
      toast.success('User verified');
    } catch { toast.error('Failed to verify user'); }
  };

  const primaryStats = stats ? [
    { icon: Users,     label: 'Total Users',   value: stats.total_users,   sub: `+${stats.new_users_this_month || 0} this month`, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { icon: Briefcase, label: 'Total Jobs',    value: stats.total_jobs,    sub: `${stats.active_jobs || 0} active`,              color: 'text-accent-400',  bg: 'bg-accent-500/10' },
    { icon: Handshake, label: 'Contracts',     value: stats.total_contracts, sub: `${stats.active_contracts || 0} active`,      color: 'text-green-400',   bg: 'bg-green-500/10' },
    { icon: DollarSign,label: 'Total Revenue', value: `$${Number(stats.total_revenue || 0).toFixed(0)}`, sub: 'Platform fees',  color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
  ] : [];

  const secondaryStats = stats ? [
    { icon: User,     label: 'Freelancers', value: stats.total_freelancers, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { icon: Building2,label: 'Clients',     value: stats.total_clients,     color: 'text-accent-400',  bg: 'bg-accent-500/10' },
    { icon: FileText, label: 'Proposals',   value: stats.total_proposals,   color: 'text-green-400',   bg: 'bg-green-500/10' },
    { icon: Star,     label: 'Reviews',     value: stats.total_reviews,     color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold font-display text-dark-100 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-dark-500 mt-1">Platform management and analytics</p>
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeUp(0.05)} className="flex gap-1 p-1 card rounded-xl w-fit shadow-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === t ? 'bg-dark-700 text-dark-100 shadow-sm' : 'text-dark-400 hover:text-dark-100'
            }`}
          >
            {t}
          </button>
        ))}
      </motion.div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <>
          {/* Primary stats */}
          <motion.div {...fadeUp(0.08)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? [1, 2, 3, 4].map((i) => <div key={i} className="card p-5 h-28 skeleton animate-pulse" />)
              : primaryStats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card p-5 card-hover">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${s.color}`} strokeWidth={2} />
                        </div>
                        <TrendingUp className="w-3.5 h-3.5 text-dark-700" strokeWidth={1.5} />
                      </div>
                      <p className="text-xs text-dark-500 font-medium">{s.label}</p>
                      <p className="text-2xl font-bold text-white mt-0.5">{s.value ?? '—'}</p>
                      {s.sub && <p className="text-xs text-dark-600 mt-0.5">{s.sub}</p>}
                    </motion.div>
                  );
                })
            }
          </motion.div>

          {/* Secondary stats */}
          <motion.div {...fadeUp(0.14)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {!loading && secondaryStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 4) * 0.06 }} className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${s.color}`} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">{s.label}</p>
                      <p className="text-lg font-bold text-white">{s.value ?? '—'}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Recent activity panels */}
          <motion.div {...fadeUp(0.18)} className="grid lg:grid-cols-2 gap-5">
            {/* Recent users */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
                <h3 className="text-sm font-semibold text-white">Recent Users</h3>
                <Activity className="w-4 h-4 text-dark-600" strokeWidth={1.75} />
              </div>
              <div className="p-3 space-y-1">
                {loading ? (
                  [1, 2, 3].map((i) => <div key={i} className="skeleton h-10 rounded-xl" />)
                ) : stats?.recent_users?.length > 0 ? (
                  stats.recent_users.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-dark-800/50 transition-colors">
                      <img
                        src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4361ff&color=fff`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{u.name}</p>
                        <p className="text-xs text-dark-500 capitalize">{u.role}</p>
                      </div>
                      <span className="text-xs text-dark-600 shrink-0">{new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-dark-500 px-3 py-4">No recent users</p>
                )}
              </div>
            </div>

            {/* Recent jobs */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
                <h3 className="text-sm font-semibold text-white">Recent Jobs</h3>
                <Briefcase className="w-4 h-4 text-dark-600" strokeWidth={1.75} />
              </div>
              <div className="p-3 space-y-1">
                {loading ? (
                  [1, 2, 3].map((i) => <div key={i} className="skeleton h-10 rounded-xl" />)
                ) : stats?.recent_jobs?.length > 0 ? (
                  stats.recent_jobs.map((j) => (
                    <div key={j.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-dark-800/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center shrink-0">
                        <Briefcase className="w-3.5 h-3.5 text-dark-500" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{j.title}</p>
                        <p className="text-xs text-dark-500">${j.budget_min}–${j.budget_max}</p>
                      </div>
                      <span className={`badge text-2xs shrink-0 ${j.status === 'open' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'badge-primary'}`}>
                        {j.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-dark-500 px-3 py-4">No recent jobs</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* ── Users Management ── */}
      {activeTab === 'users' && (
        <motion.div {...fadeUp(0.05)} className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
            <h3 className="text-sm font-semibold text-white">User Management</h3>
            <Users className="w-4 h-4 text-dark-600" strokeWidth={1.75} />
          </div>
          <div className="p-5 space-y-4">
            <div className="flex gap-3 flex-wrap">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500" strokeWidth={2} />
                  <input
                    value={userFilter.search}
                    onChange={(e) => setUserFilter((f) => ({ ...f, search: e.target.value }))}
                    className="input pl-9"
                    placeholder="Search by name or email…"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm px-4 gap-1.5">
                  <Search className="w-3.5 h-3.5" strokeWidth={2} />
                  Search
                </button>
              </form>
              <select
                value={userFilter.role}
                onChange={(e) => setUserFilter((f) => ({ ...f, role: e.target.value, page: 1 }))}
                className="input w-auto text-sm"
              >
                <option value="">All Roles</option>
                <option value="freelancer">Freelancers</option>
                <option value="client">Clients</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {usersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-dark-500 border-b border-dark-800">
                      <th className="pb-3 pr-4 font-medium">User</th>
                      <th className="pb-3 pr-4 font-medium">Role</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Joined</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-dark-800/20 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4361ff&color=fff`}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-white truncate">{u.name}</p>
                              <p className="text-xs text-dark-500 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={`badge text-2xs capitalize ${u.role === 'admin' ? 'bg-accent-500/10 text-accent-400 border-accent-500/20' : 'badge-primary'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-1.5">
                            {u.is_active ? (
                              <span className="badge text-2xs bg-green-500/10 text-green-400 border-green-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={2} />
                                Active
                              </span>
                            ) : (
                              <span className="badge text-2xs bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1">
                                <XCircle className="w-2.5 h-2.5" strokeWidth={2} />
                                Banned
                              </span>
                            )}
                            {u.is_verified && (
                              <span className="w-4 h-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-2.5 h-2.5 text-primary-400" strokeWidth={2.5} />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-dark-500 text-xs">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5">
                          <div className="flex gap-3">
                            {!u.is_verified && (
                              <button onClick={() => verifyUser(u.id)} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">Verify</button>
                            )}
                            {u.is_active && u.role !== 'admin' && (
                              <button onClick={() => banUser(u.id, u.name)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Ban</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-8 h-8 text-dark-600 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-sm text-dark-500">No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Analytics ── */}
      {activeTab === 'analytics' && (
        <motion.div {...fadeUp(0.05)} className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700/50 flex items-center justify-center mx-auto mb-5">
            <BarChart3 className="w-7 h-7 text-dark-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Analytics Coming Soon</h3>
          <p className="text-sm text-dark-500 max-w-xs mx-auto leading-relaxed">
            Advanced charts, revenue trends, and platform insights will be available here.
          </p>
        </motion.div>
      )}
    </div>
  );
}
