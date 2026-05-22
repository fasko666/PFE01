import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (v) => set({ sidebarOpen: v }),

  notifications: [],
  addNotification: (n) => set((s) => ({ notifications: [{ id: Date.now(), ...n }, ...s.notifications] })),
  markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
  clearNotifications: () => set({ notifications: [] }),

  modal: null,
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
}));

export default useUIStore;
