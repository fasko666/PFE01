import { create } from 'zustand';
import http from '../api/axios';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount:   0,
  loading:       false,
  lastFetchedAt: null,

  fetch: async () => {
    try {
      set({ loading: true });
      const { data } = await http.get('/notifications');
      set({
        notifications: data.notifications || [],
        unreadCount:   data.unread_count  || 0,
        loading:       false,
        lastFetchedAt: Date.now(),
      });
    } catch {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    // Optimistic update
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
    try { await http.post(`/notifications/${id}/read`); } catch {}
  },

  markAllRead: async () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({
        ...n,
        read_at: n.read_at || new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
    try { await http.post('/notifications/read-all'); } catch {}
  },

  clear: () => set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationStore;
