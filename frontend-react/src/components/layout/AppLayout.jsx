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
      <main className="overflow-y-auto p-6 max-w-7xl mx-auto scrollbar-none">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 theme-muted transition-colors text-sm group"
          >
            <span className="w-8 h-8 rounded-xl border border-dark-700 flex items-center justify-center group-hover:opacity-80 transition-opacity bg-dark-800">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </span>
            Back
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
}
