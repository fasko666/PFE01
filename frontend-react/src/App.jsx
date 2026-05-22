import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useThemeStore, { applyTheme } from './store/themeStore';

// Layouts
import AppLayout    from './components/layout/AppLayout';
import AuthLayout   from './components/layout/AuthLayout';
import GlobalNavbar from './components/layout/GlobalNavbar';

// Lazy pages
const Landing       = lazy(() => import('./pages/Landing/Landing'));
const Login           = lazy(() => import('./pages/Auth/Login'));
const Register        = lazy(() => import('./pages/Auth/Register'));
const Onboarding      = lazy(() => import('./pages/Auth/Onboarding'));
const GoogleCallback  = lazy(() => import('./pages/Auth/GoogleCallback'));

const FreelancerDashboard = lazy(() => import('./pages/Dashboard/FreelancerDashboard'));
const ClientDashboard     = lazy(() => import('./pages/Dashboard/ClientDashboard'));
const AdminDashboard      = lazy(() => import('./pages/Admin/AdminDashboard'));

const JobsMarketplace = lazy(() => import('./pages/Jobs/JobsMarketplace'));
const JobDetail       = lazy(() => import('./pages/Jobs/JobDetail'));
const PostJob         = lazy(() => import('./pages/Jobs/PostJob'));
const MyJobs          = lazy(() => import('./pages/Jobs/MyJobs'));
const MyProposals     = lazy(() => import('./pages/Jobs/MyProposals'));

const FreelancerProfile    = lazy(() => import('./pages/Freelancer/FreelancerProfile'));
const FreelancerSettings   = lazy(() => import('./pages/Freelancer/FreelancerSettings'));
const FreelancerMarketplace= lazy(() => import('./pages/Freelancer/FreelancerMarketplace'));

const Reports     = lazy(() => import('./pages/Reports/Reports'));
const Messages    = lazy(() => import('./pages/Chat/Messages'));
const Payments    = lazy(() => import('./pages/Payments/Payments'));
const AIAssistant = lazy(() => import('./pages/AI/AIAssistant'));

const PageLoader = () => (
  <div className="min-h-screen theme-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <span className="theme-muted text-xs tracking-widest uppercase">Loading PANDA...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRedirect = () => {
  const user = useAuthStore((s) => s.user);
  if (user?.role === 'admin')  return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'client') return <Navigate to="/client/dashboard" replace />;
  return <Navigate to="/freelancer/dashboard" replace />;
};

/* Inner component — needs to be inside BrowserRouter for hooks */
function AppRoot() {
  const { token, fetchMe } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { if (token) fetchMe(); }, [token]);

  return (
    <>
      <GlobalNavbar />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          </Route>
          <Route path="/onboarding"    element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/auth/callback" element={<GoogleCallback />} />

          {/* App */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            {/* Freelancer */}
            <Route path="/freelancer/dashboard" element={<ProtectedRoute roles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>} />
            <Route path="/freelancer/profile"   element={<ProtectedRoute roles={['freelancer']}><FreelancerProfile /></ProtectedRoute>} />
            <Route path="/freelancer/settings"  element={<ProtectedRoute roles={['freelancer']}><FreelancerSettings /></ProtectedRoute>} />
            <Route path="/freelancers/:username" element={<FreelancerProfile />} />
            <Route path="/freelancers"           element={<FreelancerMarketplace />} />

            {/* Client */}
            <Route path="/client/dashboard" element={<ProtectedRoute roles={['client']}><ClientDashboard /></ProtectedRoute>} />

            {/* Jobs */}
            <Route path="/jobs"      element={<JobsMarketplace />} />
            <Route path="/jobs/post" element={<ProtectedRoute roles={['freelancer', 'client']}><PostJob /></ProtectedRoute>} />
            <Route path="/jobs/:id"  element={<JobDetail />} />
            <Route path="/my-jobs"   element={<ProtectedRoute roles={['freelancer', 'client']}><MyJobs /></ProtectedRoute>} />
            <Route path="/my-proposals" element={<ProtectedRoute roles={['freelancer']}><MyProposals /></ProtectedRoute>} />

            {/* Other */}
            <Route path="/messages"      element={<Messages />} />
            <Route path="/messages/:id"  element={<Messages />} />
            <Route path="/payments"      element={<Payments />} />
            <Route path="/ai-assistant"  element={<AIAssistant />} />
            <Route path="/settings"      element={<ProtectedRoute roles={['freelancer', 'client']}><FreelancerSettings /></ProtectedRoute>} />
            <Route path="/reports"       element={<ProtectedRoute roles={['freelancer', 'client']}><Reports /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'rgb(var(--c-dark-900))', color: 'rgb(var(--c-dark-100))', border: '1px solid rgb(var(--c-dark-700))', borderRadius: '12px' },
          duration: 4000,
        }}
      />
      <AppRoot />
    </BrowserRouter>
  );
}
