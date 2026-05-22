import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Search, Users, FileText, MessageSquare,
  CreditCard, User, Sparkles, Settings, PenSquare, Briefcase,
  BarChart3, LogOut, ChevronRight, TrendingUp,
} from 'lucide-react';
import PandaLogo from '../ui/PandaLogo';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import toast from 'react-hot-toast';

const freelancerNav = [
  { to: '/freelancer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs',                 icon: Search,          label: 'Find Work' },
  { to: '/jobs/post',            icon: PenSquare,       label: 'Post a Job' },
  { to: '/my-jobs',              icon: Briefcase,       label: 'My Jobs' },
  { to: '/freelancers',          icon: Users,           label: 'Talent Market' },
  { to: '/my-proposals',         icon: FileText,        label: 'My Proposals' },
  { to: '/messages',             icon: MessageSquare,   label: 'Messages' },
  { to: '/payments',             icon: CreditCard,      label: 'Payments' },
  { to: '/freelancer/profile',   icon: User,            label: 'My Profile' },
  { to: '/reports',              icon: TrendingUp,      label: 'Reports' },
  { to: '/ai-assistant',         icon: Sparkles,        label: 'AI Assistant' },
  { to: '/settings',             icon: Settings,        label: 'Settings' },
];

const clientNav = [
  { to: '/client/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/freelancers',          icon: Search,          label: 'Find Talent' },
  { to: '/jobs/post',            icon: PenSquare,       label: 'Post a Job' },
  { to: '/my-jobs',              icon: Briefcase,       label: 'My Jobs' },
  { to: '/messages',             icon: MessageSquare,   label: 'Messages' },
  { to: '/payments',             icon: CreditCard,      label: 'Payments' },
  { to: '/reports',              icon: TrendingUp,      label: 'Reports' },
  { to: '/ai-assistant',         icon: Sparkles,        label: 'AI Assistant' },
  { to: '/settings',             icon: Settings,        label: 'Settings' },
];

const adminNav = [
  { to: '/admin/dashboard',      icon: BarChart3,       label: 'Admin Dashboard' },
  { to: '/freelancers',          icon: Users,           label: 'Users' },
  { to: '/jobs',                 icon: Briefcase,       label: 'Jobs' },
  { to: '/payments',             icon: CreditCard,      label: 'Payments' },
  { to: '/messages',             icon: MessageSquare,   label: 'Messages' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const navigate = useNavigate();

  const navItems =
    user?.role === 'admin' ? adminNav :
    user?.role === 'client' ? clientNav :
    freelancerNav;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 60 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-[60px] flex flex-col z-40 overflow-hidden theme-surface"
      style={{ height: 'calc(100vh - 60px)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3.5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <NavLink to="/" className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center shrink-0 ring-1 ring-white/10">
            <PandaLogo className="w-5 h-5" invert />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-black font-display text-sm tracking-widest uppercase whitespace-nowrap theme-text"
              >
                PANDA
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={!sidebarOpen ? item.label : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'hover:bg-black/5 dark:hover:bg-dark-800/70'
                }`
              }
              style={({ isActive }) => isActive ? {} : { color: 'var(--text-400)' }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-primary-400' : 'group-hover:opacity-80'}`}
                    style={isActive ? {} : { color: 'var(--text-500)' }}
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.12 }}
                        className="whitespace-nowrap leading-none"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-2 shrink-0 space-y-0.5" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Avatar row */}
        <div className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-dark-800/70 transition-colors cursor-pointer"
          onClick={() => navigate(user?.role === 'freelancer' ? '/freelancer/profile' : '/settings')}>
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4361ff&color=fff&size=64`}
            alt={user?.name}
            className="w-7 h-7 rounded-full ring-1 ring-dark-700 shrink-0 object-cover"
          />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.12 }}
                className="flex-1 min-w-0"
              >
                <div className="text-xs font-semibold truncate leading-tight theme-text">{user?.name}</div>
                <div className="text-2xs capitalize mt-0.5 theme-muted">{user?.role}</div>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarOpen && <ChevronRight className="w-3.5 h-3.5 text-dark-600 shrink-0" />}
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          title={!sidebarOpen ? 'Sign out' : undefined}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:text-red-400 hover:bg-red-500/8 transition-all text-sm"
          style={{ color: 'var(--text-500)' }}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.12 }}
                className="text-xs font-medium whitespace-nowrap"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
