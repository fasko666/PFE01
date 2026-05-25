import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Menu, Settings, User, LogOut, ChevronDown,
  TrendingUp, ShieldCheck, BadgeCheck, Zap, BarChart3, HelpCircle,
  MessageSquare,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import useNotificationStore from '../../store/notificationStore';
import toast from 'react-hot-toast';

export default function TopBar() {
  const { user, logout }           = useAuthStore();
  const { toggleSidebar }          = useUIStore();
  const { unreadCount }            = useNotificationStore();
  const navigate                   = useNavigate();
  const [searchQuery, setSearchQuery]   = useState('');
  const [profileOpen, setProfileOpen]   = useState(false);
  const [onlineForMsg, setOnlineForMsg] = useState(true);
  const profileRef = useRef(null);
  const isFreelancer = user?.role === 'freelancer';

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const go = (path) => { setProfileOpen(false); navigate(path); };

  return (
    <header className="h-16 bg-dark-950/95 backdrop-blur-xl border-b border-dark-800/60 flex items-center px-4 gap-3 shrink-0 sticky top-0 z-40">

      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-500 hover:text-dark-200 hover:bg-dark-800/70 transition-all shrink-0"
      >
        <Menu className="w-4 h-4" strokeWidth={2} />
      </button>

      {/* Search bar — Upwork-style, prominent */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" strokeWidth={2} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search jobs, freelancers, skills…"
            className="input pl-10 text-sm"
          />
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">

        {/* Messages */}
        <button
          onClick={() => navigate('/messages')}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-all"
          title="Messages"
        >
          <MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>

        {/* Help */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-all"
          title="Help"
        >
          <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-all"
          title="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-primary-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-dark-800 mx-1" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-dark-800 transition-all"
          >
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4361ff&color=fff&size=64`}
              alt={user?.name}
              className="w-8 h-8 rounded-full ring-1 ring-dark-700 object-cover shrink-0"
            />
            <div className="hidden sm:block text-left min-w-0">
              <div className="text-xs font-semibold text-dark-100 leading-tight truncate max-w-[80px]">{user?.name?.split(' ')[0]}</div>
              <div className="text-[10px] text-dark-500 capitalize leading-tight">{user?.role}</div>
            </div>
            <ChevronDown className={`hidden sm:block w-3 h-3 text-dark-600 shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatedDropdown open={profileOpen}>
            {/* User info */}
            <div className="px-4 py-3.5 border-b border-dark-800">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4361ff&color=fff&size=64`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-dark-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-dark-100 truncate">{user?.name}</div>
                  <div className="text-xs text-dark-500 capitalize">{user?.role}</div>
                </div>
              </div>
            </div>

            {/* Online for messages toggle */}
            <div className="px-4 py-2.5 border-b border-dark-800">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-dark-300">Online for messages</span>
                <button
                  onClick={() => setOnlineForMsg((v) => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${onlineForMsg ? 'bg-green-500' : 'bg-dark-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${onlineForMsg ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Navigation items */}
            <div className="py-1.5">
              <DropItem icon={User}       label="My Profile"       onClick={() => go(isFreelancer ? '/freelancer/profile' : '/settings')} />
              <DropItem icon={BarChart3}  label="Reports"          onClick={() => go('/reports')} />
              <DropItem icon={ShieldCheck}label="Account Health"   onClick={() => go('/settings')} />
              <DropItem icon={BadgeCheck} label="Membership Plan"  onClick={() => go('/settings')} />
              {isFreelancer && (
                <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-800/70 transition-colors" onClick={() => go('/settings')}>
                  <Zap className="w-3.5 h-3.5 text-dark-500 shrink-0" strokeWidth={1.75} />
                  <span>Connects</span>
                  <span className="ml-auto text-xs text-dark-500 font-medium">
                    {user?.subscription?.connects_balance ?? 0} left
                  </span>
                </button>
              )}
            </div>

            <div className="py-1.5 border-t border-dark-800">
              <DropItem icon={Settings}   label="Account Settings" onClick={() => go('/settings')} />
              <DropItem icon={HelpCircle} label="Help Center"       onClick={() => {}} />
            </div>

            <div className="py-1.5 border-t border-dark-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                Log out
              </button>
            </div>
          </AnimatedDropdown>
        </div>
      </div>
    </header>
  );
}

function DropItem({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-800/70 transition-colors"
    >
      <Icon className="w-3.5 h-3.5 text-dark-500 shrink-0" strokeWidth={1.75} />
      {label}
    </button>
  );
}

function AnimatedDropdown({ open, children }) {
  if (!open) return null;
  return (
    <div className="absolute right-0 top-full mt-1.5 w-64 card shadow-float z-50 animate-scale-in">
      {children}
    </div>
  );
}
