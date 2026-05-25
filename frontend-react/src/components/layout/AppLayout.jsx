import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NO_BACK = [
  '/freelancer/dashboard',
  '/client/dashboard',
  '/admin/dashboard',
  '/dashboard',
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = !NO_BACK.includes(location.pathname);

  return (
    <div className="theme-bg" style={{ minHeight: 'calc(100vh - 60px)', marginTop: 60 }}>
      <main
        className="overflow-y-auto scrollbar-none"
        style={{ minHeight: 'calc(100vh - 60px)' }}
      >
        <div className="p-6 max-w-7xl mx-auto">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="mb-5 flex items-center gap-2 text-dark-500 hover:text-dark-200 transition-colors text-sm group"
            >
              <span className="w-8 h-8 rounded-xl border border-dark-700 flex items-center justify-center group-hover:border-dark-600 group-hover:bg-dark-800 transition-all bg-dark-900">
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
              </span>
              Back
            </button>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
