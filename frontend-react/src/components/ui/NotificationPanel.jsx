import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, CheckCheck, FileText, MessageSquare,
  CreditCard, Star, Shield, AlertCircle, Loader2,
} from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

const TYPE_META = {
  proposal: { icon: FileText,       bg: 'bg-blue-500/10',    color: 'text-blue-400'    },
  message:  { icon: MessageSquare,  bg: 'bg-indigo-500/10',  color: 'text-indigo-400'  },
  payment:  { icon: CreditCard,     bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
  review:   { icon: Star,           bg: 'bg-amber-500/10',   color: 'text-amber-400'   },
  shield:   { icon: Shield,         bg: 'bg-red-500/10',     color: 'text-red-400'     },
  system:   { icon: Bell,           bg: 'bg-dark-800',       color: 'text-dark-400'    },
  default:  { icon: AlertCircle,    bg: 'bg-dark-800',       color: 'text-dark-400'    },
};

function timeAgo(ts) {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  } catch {
    return '';
  }
}

export default function NotificationPanel({ onClose }) {
  const panelRef  = useRef(null);
  const navigate  = useNavigate();
  const { notifications, unreadCount, loading, markRead, markAllRead, fetch } = useNotificationStore();

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const handleClick = (n) => {
    if (!n.read_at) markRead(n.id);
    if (n.action_url) { navigate(n.action_url); onClose(); }
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{   opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-[380px] card shadow-float z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-dark-700">
        <div className="flex items-center gap-2.5">
          <Bell className="w-4 h-4 text-dark-400" strokeWidth={1.75} />
          <span className="text-sm font-bold text-dark-100">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-primary-500 text-white text-2xs font-bold rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-medium text-dark-500 hover:text-dark-100 px-2 py-1 rounded-lg hover:bg-dark-800 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-y-auto scrollbar-none">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-dark-400 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 bg-dark-800 rounded-2xl flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-dark-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-dark-200">All caught up!</p>
            <p className="text-xs text-dark-400 mt-1">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            <AnimatePresence initial={false}>
              {notifications.map((n) => {
                const meta  = TYPE_META[n.type] || TYPE_META.default;
                const Icon  = meta.icon;
                const unread = !n.read_at;

                return (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${
                      unread ? 'bg-primary-500/5 hover:bg-primary-500/10' : 'hover:bg-dark-800'
                    }`}
                  >
                    {/* Icon bubble */}
                    <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} strokeWidth={1.75} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-snug ${unread ? 'text-dark-100' : 'text-dark-300'}`}>
                          {n.title}
                        </p>
                        {unread && <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-dark-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                      <p className="text-2xs text-dark-400 mt-1.5">{timeAgo(n.created_at)}</p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-dark-700 bg-dark-800/50">
        <button
          onClick={() => { fetch(); }}
          className="w-full text-xs text-dark-500 hover:text-dark-100 transition-colors py-1"
        >
          Refresh notifications
        </button>
      </div>
    </motion.div>
  );
}
