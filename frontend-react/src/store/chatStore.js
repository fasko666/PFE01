/* Lightweight global chat state. Each Messages page subscribes via Echo and
 * updates this store; the navbar badge reads from it without prop-drilling.
 */
import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  onlineUserIds: new Set(),          // populated by the presence channel
  unreadByConversation: {},          // { [conversationId]: number }
  connectionState: 'disconnected',   // 'connected' | 'connecting' | 'unavailable' | 'disconnected'

  setConnectionState: (state) => set({ connectionState: state }),

  // Presence
  setOnlineMembers: (ids) => set({ onlineUserIds: new Set(ids.map(Number)) }),
  userJoined: (id) => set((s) => {
    const next = new Set(s.onlineUserIds); next.add(Number(id));
    return { onlineUserIds: next };
  }),
  userLeft: (id) => set((s) => {
    const next = new Set(s.onlineUserIds); next.delete(Number(id));
    return { onlineUserIds: next };
  }),
  isOnline: (id) => get().onlineUserIds.has(Number(id)),

  // Unread (per-conversation)
  setUnread: (conversationId, count) => set((s) => ({
    unreadByConversation: { ...s.unreadByConversation, [conversationId]: count },
  })),
  bumpUnread: (conversationId) => set((s) => ({
    unreadByConversation: {
      ...s.unreadByConversation,
      [conversationId]: (s.unreadByConversation[conversationId] || 0) + 1,
    },
  })),
  clearUnread: (conversationId) => set((s) => ({
    unreadByConversation: { ...s.unreadByConversation, [conversationId]: 0 },
  })),
  totalUnread: () => Object.values(get().unreadByConversation).reduce((a, b) => a + (b || 0), 0),

  // Cleanup on logout
  reset: () => set({
    onlineUserIds: new Set(),
    unreadByConversation: {},
    connectionState: 'disconnected',
  }),
}));

export default useChatStore;
