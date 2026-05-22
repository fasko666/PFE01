import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import { auth as authApi } from '../../api';
import toast from 'react-hot-toast';

export default function GoogleCallback() {
  const navigate      = useNavigate();
  const { loginWithToken } = useAuthStore();
  const { fetch: fetchNotifs } = useNotificationStore();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const error  = params.get('error');

    if (error || !token) {
      setStatus('error');
      setTimeout(() => navigate('/login?error=google_auth_failed', { replace: true }), 2000);
      return;
    }

    (async () => {
      try {
        // Store token first so the /me call is authenticated
        loginWithToken(token, null);

        // Fetch full fresh user (includes updated Google avatar)
        const { data } = await authApi.me();
        const user = data.user;
        loginWithToken(token, user);

        await fetchNotifs();
        toast.success(`Welcome, ${user.name?.split(' ')[0]}!`);
        if (user.role === 'admin')        navigate('/admin/dashboard', { replace: true });
        else if (user.role === 'client')  navigate('/client/dashboard', { replace: true });
        else                              navigate('/freelancer/dashboard', { replace: true });
      } catch {
        setStatus('error');
        setTimeout(() => navigate('/login?error=google_auth_failed', { replace: true }), 2000);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        {status === 'error' ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" stroke="currentColor" />
              </svg>
            </div>
            <p className="text-dark-200 font-semibold text-sm">Google sign-in failed</p>
            <p className="text-dark-400 text-xs">Redirecting back to login…</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mx-auto">
              <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-dark-200 font-semibold text-sm">Signing you in with Google…</p>
            <p className="text-dark-400 text-xs">Just a moment</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
