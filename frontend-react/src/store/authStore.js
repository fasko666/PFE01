import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth as authApi } from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,
      loading: false,
      error:   null,

      setUser:  (user)  => set({ user }),
      setToken: (token) => {
        localStorage.setItem('panda_token', token);
        set({ token });
      },

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const { data } = await authApi.login(credentials);
          localStorage.setItem('panda_token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ error: msg, loading: false });
          throw err;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await authApi.register(userData);
          localStorage.setItem('panda_token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return data;
        } catch (err) {
          const errors = err.response?.data?.errors || {};
          const msg = err.response?.data?.message || 'Registration failed';
          set({ error: msg, loading: false });
          throw { errors, message: msg };
        }
      },

      logout: async () => {
        try { await authApi.logout(); } catch {}
        localStorage.removeItem('panda_token');
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          set({ user: data.user });
        } catch {
          localStorage.removeItem('panda_token');
          set({ user: null, token: null });
        }
      },

      loginWithToken: (token, user) => {
        localStorage.setItem('panda_token', token);
        set({ token, user: user || null });
      },

      updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),

      isAuthenticated: () => !!get().token,
      isFreelancer:    () => get().user?.role === 'freelancer',
      isClient:        () => get().user?.role === 'client',
      isAdmin:         () => get().user?.role === 'admin',
    }),
    {
      name:    'panda-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);

export default useAuthStore;
