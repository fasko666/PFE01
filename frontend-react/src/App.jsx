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
const Landing         = lazy(() => import('./pages/Landing/Landing'));
const Pricing         = lazy(() => import('./pages/Pricing/Pricing'));
const SuccessStories  = lazy(() => import('./pages/Resources/SuccessStories'));
const HowItWorks      = lazy(() => import('./pages/Resources/HowItWorks'));
const Reviews         = lazy(() => import('./pages/Resources/Reviews'));
const Updates         = lazy(() => import('./pages/Resources/Updates'));
const Blog            = lazy(() => import('./pages/Resources/Blog'));
const Research        = lazy(() => import('./pages/Resources/Research'));
const GetOutcomes     = lazy(() => import('./pages/GetOutcomes/GetOutcomes'));
const BuildWebsite    = lazy(() => import('./pages/GetOutcomes/BuildWebsite'));
const ScalePaidAds    = lazy(() => import('./pages/GetOutcomes/ScalePaidAds'));
const HandleSupport   = lazy(() => import('./pages/GetOutcomes/HandleSupport'));
const Agencies        = lazy(() => import('./pages/Agencies/Agencies'));
const Enterprise      = lazy(() => import('./pages/Enterprise/Enterprise'));
const Search          = lazy(() => import('./pages/Search/Search'));
const FindTalent      = lazy(() => import('./pages/FindTalent/FindTalent'));
const Login           = lazy(() => import('./pages/Auth/Login'));
const Register        = lazy(() => import('./pages/Auth/Register'));
const Onboarding      = lazy(() => import('./pages/Auth/Onboarding'));
const GoogleCallback  = lazy(() => import('./pages/Auth/GoogleCallback'));
const ForgotPassword  = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword   = lazy(() => import('./pages/Auth/ResetPassword'));
const IdentityVerification = lazy(() => import('./pages/Settings/IdentityVerification'));
const TwoFactorSettings    = lazy(() => import('./pages/Settings/TwoFactorSettings'));

const FreelancerDashboard = lazy(() => import('./pages/Dashboard/FreelancerDashboard'));
const ClientDashboard     = lazy(() => import('./pages/Dashboard/ClientDashboard'));
const AdminDashboard      = lazy(() => import('./pages/Admin/AdminDashboard'));

const JobsMarketplace = lazy(() => import('./pages/Jobs/JobsMarketplace'));
const JobDetail       = lazy(() => import('./pages/Jobs/JobDetail'));
const PostJob         = lazy(() => import('./pages/Jobs/PostJob'));
const CategoryJobs    = lazy(() => import('./pages/Jobs/CategoryJobs'));
const MyJobs          = lazy(() => import('./pages/Jobs/MyJobs'));
const MyProposals     = lazy(() => import('./pages/Jobs/MyProposals'));

const FreelancerProfile    = lazy(() => import('./pages/Freelancer/FreelancerProfile'));
const FreelancerSettings   = lazy(() => import('./pages/Freelancer/FreelancerSettings'));
const FreelancerMarketplace= lazy(() => import('./pages/Freelancer/FreelancerMarketplace'));

const ContractsList    = lazy(() => import('./pages/Contracts/ContractsList'));
const ContractDetails  = lazy(() => import('./pages/Contracts/ContractDetails'));
const MilestoneDetails = lazy(() => import('./pages/Milestones/MilestoneDetails'));
const SavedFreelancers = lazy(() => import('./pages/Talent/SavedFreelancers'));
const TalentLists      = lazy(() => import('./pages/Talent/TalentLists'));
const TalentListDetails= lazy(() => import('./pages/Talent/TalentListDetails'));
const TaxCenter        = lazy(() => import('./pages/Settings/TaxCenter'));
const GlobalSearch     = lazy(() => import('./pages/Search/GlobalSearch'));
const Billing          = lazy(() => import('./pages/Billing/Billing'));
const Reports     = lazy(() => import('./pages/Reports/Reports'));
const Messages    = lazy(() => import('./pages/Chat/Messages'));
const Payments    = lazy(() => import('./pages/Payments/Payments'));
const Withdraw           = lazy(() => import('./pages/Payments/Withdraw'));
const PaymentSuccess     = lazy(() => import('./pages/Payments/PaymentSuccess'));
const PaymentCancel      = lazy(() => import('./pages/Payments/PaymentCancel'));
const StripeConnectReturn= lazy(() => import('./pages/Payments/StripeConnectReturn'));
const AdminFinance       = lazy(() => import('./pages/Admin/AdminFinance'));
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
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/how-it-works"    element={<HowItWorks />} />
          <Route path="/reviews"         element={<Reviews />} />
          <Route path="/updates"         element={<Updates />} />
          <Route path="/blog"            element={<Blog />} />
          <Route path="/research"        element={<Research />} />
          <Route path="/get-outcomes"               element={<GetOutcomes />} />
          <Route path="/get-outcomes/build-website" element={<BuildWebsite />} />
          <Route path="/get-outcomes/scale-paid-ads"   element={<ScalePaidAds />} />
          <Route path="/get-outcomes/handle-support"   element={<HandleSupport />} />
          <Route path="/agencies"                      element={<Agencies />} />
          <Route path="/enterprise"                    element={<Enterprise />} />
          <Route path="/search"                        element={<Search />} />
          <Route path="/find-talent"                   element={<FindTalent />} />
          <Route path="/find-talent/:skill"            element={<FindTalent />} />
          <Route path="/jobs/category/:slug"           element={<CategoryJobs />} />

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login"            element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register"         element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password"  element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password"   element={<GuestRoute><ResetPassword /></GuestRoute>} />
          </Route>
          <Route path="/onboarding"    element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/auth/callback" element={<GoogleCallback />} />

          {/* ── Public marketplace listings (browse without login) ── */}
          <Route path="/freelancers"           element={<FreelancerMarketplace />} />
          <Route path="/jobs"                  element={<JobsMarketplace />} />

          {/* ── Profile / job detail require login ── */}
          <Route path="/freelancers/:username" element={<ProtectedRoute><FreelancerProfile /></ProtectedRoute>} />
          <Route path="/jobs/:id"              element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />

          {/* App (requires login) */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            {/* Freelancer */}
            <Route path="/freelancer/dashboard" element={<ProtectedRoute roles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>} />
            <Route path="/freelancer/profile"   element={<ProtectedRoute roles={['freelancer']}><FreelancerProfile /></ProtectedRoute>} />
            <Route path="/freelancer/settings"  element={<ProtectedRoute roles={['freelancer']}><FreelancerSettings /></ProtectedRoute>} />

            {/* Client */}
            <Route path="/client/dashboard" element={<ProtectedRoute roles={['client']}><ClientDashboard /></ProtectedRoute>} />

            {/* Jobs (post + manage require login) */}
            <Route path="/jobs/post"    element={<ProtectedRoute roles={['freelancer', 'client']}><PostJob /></ProtectedRoute>} />
            <Route path="/my-jobs"      element={<ProtectedRoute roles={['freelancer', 'client']}><MyJobs /></ProtectedRoute>} />
            <Route path="/my-proposals" element={<ProtectedRoute roles={['freelancer']}><MyProposals /></ProtectedRoute>} />

            {/* Contracts */}
            <Route path="/contracts"      element={<ContractsList />} />
            <Route path="/contracts/:id"  element={<ContractDetails />} />

            {/* Milestones */}
            <Route path="/milestones/:id" element={<MilestoneDetails />} />

            {/* Other */}
            <Route path="/messages"      element={<Messages />} />
            <Route path="/messages/:id"  element={<Messages />} />
            <Route path="/payments"            element={<Payments />} />
            <Route path="/payments/withdraw"   element={<Withdraw />} />
            <Route path="/payments/success"    element={<PaymentSuccess />} />
            <Route path="/payments/cancel"     element={<PaymentCancel />} />
            <Route path="/payments/connect/return"  element={<StripeConnectReturn />} />
            <Route path="/payments/connect/refresh" element={<StripeConnectReturn />} />
            <Route path="/admin/finance"       element={<ProtectedRoute roles={['admin']}><AdminFinance /></ProtectedRoute>} />

            {/* Account security & verification */}
            <Route path="/settings/2fa"           element={<TwoFactorSettings />} />
            <Route path="/settings/identity"      element={<IdentityVerification />} />
            <Route path="/settings/tax"           element={<TaxCenter />} />

            {/* Talent management */}
            <Route path="/saved-talent"           element={<SavedFreelancers />} />
            <Route path="/talent-lists"           element={<TalentLists />} />
            <Route path="/talent-lists/:id"       element={<TalentListDetails />} />

            {/* Global search */}
            <Route path="/global-search"          element={<GlobalSearch />} />

            {/* Billing */}
            <Route path="/billing"                element={<Billing />} />

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
