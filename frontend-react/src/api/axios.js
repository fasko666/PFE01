import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('panda_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Public routes — paths the user can visit without authentication.
 * On these routes a 401 silently clears the stale token and lets the page
 * continue rendering; we never force-redirect to /login (would interrupt
 * legitimate guest browsing).
 */
const PUBLIC_ROUTES = [
  /^\/$/,
  /^\/login/,
  /^\/register/,
  /^\/auth\//,
  /^\/freelancers\/?$/,   // /freelancers (list) only — :username is protected
  /^\/jobs\/?$/,          // /jobs (list) only — :id is protected
  /^\/pricing/,
  /^\/search/,
  /^\/find-talent/,
  /^\/agencies/,
  /^\/get-outcomes/,
  /^\/success-stories/,
  /^\/how-it-works/,
  /^\/reviews/,
  /^\/updates/,
  /^\/blog/,
  /^\/research/,
];

const isPublicPath = (path) => PUBLIC_ROUTES.some((re) => re.test(path));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Always clear the stale token
      localStorage.removeItem('panda_token');
      localStorage.removeItem('panda-auth');

      // Only redirect if we're on a protected page (dashboards, /messages, etc.).
      // On public pages, swallow the 401 silently so guest browsing continues.
      if (!isPublicPath(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
