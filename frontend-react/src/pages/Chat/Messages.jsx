/* Production-grade chat — Reverb-backed real-time messaging.
 *
 * What this component subscribes to:
 *   private-conversation.{id}  → message.sent, .edited, .deleted, .read,
 *                                .delivered, .reaction, user.typing
 *   private-user.{me.id}       → conversation.updated, notification.created
 *   presence-online            → roster of online users (green dot)
 *
 * Invariants preserved (DO NOT regress):
 *   - REST endpoints unchanged
 *   - Optimistic send (temp-id replaced by server id)
 *   - Mobile list↔chat toggle pattern
 *
 * Memory discipline:
 *   - Every Echo subscription is torn down in the effect cleanup
 *   - Every setTimeout/setInterval cleared on cleanup
 *   - Connection-state subscription returned-fn called on unmount
 *   - We never hold refs to dead React state inside Echo callbacks
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MoreHorizontal, MessageSquare, Send, ArrowRight, ArrowLeft,
  Edit2, Trash2, Smile, CornerUpLeft, Check, CheckCheck, Clock, X,
  Wifi, WifiOff, Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import UserAvatar from '../../components/ui/UserAvatar';
import toast from 'react-hot-toast';
import {
  getEcho, onConnectionState, refreshEcho,
} from '../../lib/echo';
import { playPing } from '../../lib/sound';
import {
  notify as browserNotify, flashTitle, bumpFavicon, requestNotificationPermission,
} from '../../lib/browserNotify';

const TABS  = ['All', 'Unread', 'Starred'];
const EMOJI = ['👍', '❤️', '😂', '🎉', '😮', '😢'];

// ── helpers ───────────────────────────────────────────────────────────────────
const sortByTime = (a, b) => new Date(a.created_at) - new Date(b.created_at);
const dedupeById = (list) => {
  const seen = new Map();
  for (const m of list) seen.set(m.id, m); // later writes win → server overrides temp
  return [...seen.values()].sort(sortByTime);
};

export default function Messages() {
  const { user } = useAuthStore();
  const myId    = user?.id;

  // server data
  const [conversations, setConversations] = useState([]);
  const [active, setActive]               = useState(null);
  const [messages, setMessages]           = useState([]);
  const [page, setPage]                   = useState(1);
  const [hasMore, setHasMore]             = useState(false);

  // ui state
  const [loading, setLoading]       = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput]           = useState('');
  const [sending, setSending]       = useState(false);
  const [tab, setTab]               = useState('All');
  const [searchQ, setSearchQ]       = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // realtime state
  const [typingUserId, setTypingUserId] = useState(null);
  const [editingId, setEditingId]       = useState(null);
  const [editText, setEditText]         = useState('');
  const [replyTo, setReplyTo]           = useState(null);
  const [openReactions, setOpenReactions] = useState(null); // message id

  // chat store (presence + unread + connection)
  const {
    isOnline, setOnlineMembers, userJoined, userLeft,
    setUnread, bumpUnread, clearUnread,
    connectionState, setConnectionState, reset: resetChatStore,
  } = useChatStore();

  // refs that must survive re-renders without retriggering effects
  const messagesEndRef = useRef(null);
  const messagesScrollRef = useRef(null);
  const inputRef       = useRef(null);
  const typingTimerRef = useRef(null);
  const activeIdRef    = useRef(null);
  const messagesRef    = useRef([]);
  const conversationsRef = useRef([]);

  // keep refs in sync (so Echo callbacks always see fresh values)
  useEffect(() => { activeIdRef.current = active?.id ?? null; }, [active?.id]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // ── INITIAL LOAD ───────────────────────────────────────────────────────────
  useEffect(() => {
    requestNotificationPermission(); // ask once on mount
    api.chat.conversations()
      .then((r) => {
        const convs = r.data.data || [];
        setConversations(convs);
        // seed unread badges from server
        convs.forEach((c) => setUnread(c.id, c.unread_count || 0));
        if (convs.length > 0) setActive(convs[0]);
      })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── ECHO: connection-state + user channel + presence (mounted once per session) ──
  useEffect(() => {
    if (!myId) return;
    refreshEcho();              // ensure latest Bearer is wired
    const echo = getEcho();

    const offState = onConnectionState((state) => setConnectionState(state));

    // Per-user channel (conversation list + notifications)
    const userCh = echo.private(`user.${myId}`)
      .listen('.conversation.updated', (e) => {
        // Update the matching conv in our list (creates the entry if new)
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === e.conversation_id);
          if (idx === -1) return prev; // unknown conv — leave it; conversations() refresh will pick it up
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            last_message: e.last_message,
            unread_count: e.unread_count,
            updated_at:   e.last_message?.created_at || next[idx].updated_at,
          };
          return next.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        });
        setUnread(e.conversation_id, e.unread_count);
      })
      .listen('.notification.created', (e) => {
        playPing();
        flashTitle(e.notification?.title || 'New notification');
        bumpFavicon(e.unread_count);
        browserNotify(e.notification?.title || 'PANDA', e.notification?.body || '');
      });

    // Presence channel — fills `onlineUserIds` in the store
    const presenceCh = echo.join('presence.online')
      .here((members) => setOnlineMembers(members.map((m) => m.id)))
      .joining((member) => userJoined(member.id))
      .leaving((member) => userLeft(member.id));

    return () => {
      offState();
      try { echo.leave(`user.${myId}`); } catch { /* noop */ }
      try { echo.leave('presence.online'); } catch { /* noop */ }
      // silence linter
      void userCh; void presenceCh;
    };
  }, [myId, setConnectionState, setOnlineMembers, setUnread, userJoined, userLeft]);

  // ── LOAD MESSAGES FOR ACTIVE CONVERSATION ─────────────────────────────────
  const loadMessages = useCallback(async (convId, pageNum = 1) => {
    const isFirst = pageNum === 1;
    if (isFirst) setMsgLoading(true); else setLoadingMore(true);
    try {
      const { data } = await api.chat.messages(convId, { page: pageNum });
      const paginator = data.data;
      const incoming = (paginator?.data || []).slice().reverse(); // server gives newest-first; reverse for chronological
      setMessages((prev) => isFirst ? dedupeById(incoming) : dedupeById([...incoming, ...prev]));
      setPage(pageNum);
      setHasMore(paginator ? pageNum < paginator.last_page : false);

      if (isFirst) {
        clearUnread(convId);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      }

      // POST /chat/conversations/{id}/read happens automatically inside GET messages,
      // but call it explicitly anyway in case server-side behavior changes.
      api.chat.markRead(convId).catch(() => { /* fire-and-forget */ });
    } catch {
      toast.error('Failed to load messages');
    } finally {
      if (isFirst) setMsgLoading(false); else setLoadingMore(false);
    }
  }, [clearUnread]);

  useEffect(() => {
    if (!active?.id) return;
    loadMessages(active.id, 1);
  }, [active?.id, loadMessages]);

  // Auto-scroll bottom when NEW (not loaded-more) messages land
  useEffect(() => {
    if (loadingMore) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loadingMore]);

  // ── ECHO: per-conversation subscription (resubscribes when active changes) ──
  useEffect(() => {
    if (!active?.id || !myId) return;
    const echo = getEcho();
    const channelName = `conversation.${active.id}`;
    const ch = echo.private(channelName);

    ch.listen('.message.sent', (e) => {
      // ignore my own broadcast — optimistic UI already inserted it
      if (Number(e.sender_id) === Number(myId)) return;

      // If the user is looking at this conversation, append + auto-mark read
      if (activeIdRef.current === e.conversation_id) {
        setMessages((prev) => dedupeById([...prev, { ...e, content: e.body }]));
        api.chat.markDelivered(e.id).catch(() => { /* noop */ });
        api.chat.markRead(e.conversation_id).catch(() => { /* noop */ });
      } else {
        bumpUnread(e.conversation_id);
      }

      // Always: ping + browser/title nudge when not focused
      playPing();
      const conv = conversationsRef.current.find((c) => c.id === e.conversation_id);
      const senderName = conv?.other_user?.name || 'New message';
      flashTitle(`${senderName}: ${e.body?.slice(0, 30) || ''}`);
      browserNotify(senderName, e.body || '', () => setActive(conv || null));
    });

    ch.listen('.user.typing', (e) => {
      if (Number(e.user_id) === Number(myId)) return;
      setTypingUserId(e.is_typing ? e.user_id : null);
      // safety fallback: auto-clear after 4s if no follow-up event comes
      if (e.is_typing) {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setTypingUserId(null), 4000);
      }
    });

    ch.listen('.message.read', (e) => {
      if (Number(e.reader_id) === Number(myId)) return;
      setMessages((prev) => prev.map((m) => (
        m.sender_id === myId && !m.is_read
          ? { ...m, is_read: true, read_at: e.read_at }
          : m
      )));
    });

    ch.listen('.message.delivered', (e) => {
      if (Number(e.recipient_id) === Number(myId)) return;
      setMessages((prev) => prev.map((m) => (
        m.id === e.message_id ? { ...m, delivered_at: e.delivered_at } : m
      )));
    });

    ch.listen('.message.edited', (e) => {
      setMessages((prev) => prev.map((m) => (
        m.id === e.id ? { ...m, body: e.body, content: e.body, edited_at: e.edited_at } : m
      )));
    });

    ch.listen('.message.deleted', (e) => {
      setMessages((prev) => prev.filter((m) => m.id !== e.message_id));
    });

    ch.listen('.message.reaction', (e) => {
      setMessages((prev) => prev.map((m) => {
        if (m.id !== e.message_id) return m;
        const reactions = m.reactions || [];
        if (e.action === 'added') {
          return { ...m, reactions: [...reactions, { user_id: e.user_id, emoji: e.emoji }] };
        }
        return { ...m, reactions: reactions.filter((r) => !(r.user_id === e.user_id && r.emoji === e.emoji)) };
      }));
    });

    return () => {
      if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null; }
      try { echo.leave(channelName); } catch { /* noop */ }
      setTypingUserId(null);
    };
  }, [active?.id, myId, bumpUnread]);

  // ── INFINITE SCROLL UP ─────────────────────────────────────────────────────
  const handleScroll = (e) => {
    if (e.target.scrollTop < 80 && hasMore && !loadingMore && active?.id) {
      const el = e.target;
      const prevHeight = el.scrollHeight;
      loadMessages(active.id, page + 1).then(() => {
        // restore scroll position after older messages prepend
        requestAnimationFrame(() => {
          if (messagesScrollRef.current) {
            messagesScrollRef.current.scrollTop =
              messagesScrollRef.current.scrollHeight - prevHeight;
          }
        });
      });
    }
  };

  // ── SEND ───────────────────────────────────────────────────────────────────
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !active) return;
    const text = input.trim();
    const replyId = replyTo?.id ?? null;
    setInput('');
    setReplyTo(null);
    setSending(true);

    const optimistic = {
      id: `temp-${Date.now()}`,
      content: text,
      body:    text,
      sender_id: myId,
      created_at: new Date().toISOString(),
      reply_to_id: replyId,
      _optimistic: true,
    };
    setMessages((m) => [...m, optimistic]);

    try {
      const res = await api.chat.send({
        conversation_id: active.id,
        content: text,
        reply_to_id: replyId,
      });
      const real = { ...res.data.data, content: res.data.data.body };
      setMessages((m) => dedupeById(m.map((msg) => (msg.id === optimistic.id ? real : msg))));
    } catch {
      setMessages((m) => m.filter((msg) => msg.id !== optimistic.id));
      toast.error('Failed to send');
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Throttled typing pulse — fire once per 2s while typing
  const lastTypingPing = useRef(0);
  const onInputChange = (e) => {
    setInput(e.target.value);
    const now = Date.now();
    if (active?.id && now - lastTypingPing.current > 2000) {
      lastTypingPing.current = now;
      api.chat.typing(active.id, true).catch(() => { /* noop */ });
    }
  };

  // ── EDIT / DELETE / REACT ──────────────────────────────────────────────────
  const startEdit = (m) => { setEditingId(m.id); setEditText(m.body || m.content || ''); };
  const cancelEdit = () => { setEditingId(null); setEditText(''); };

  const saveEdit = async () => {
    if (!editingId) return;
    const text = editText.trim();
    if (!text) return cancelEdit();
    const id = editingId;
    cancelEdit();
    // optimistic
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, body: text, content: text, edited_at: new Date().toISOString() } : m)));
    try {
      await api.chat.edit(id, text);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Edit failed');
    }
  };

  const deleteMsg = async (m) => {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    try { await api.chat.delete(m.id); }
    catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
      // reload to recover
      if (active?.id) loadMessages(active.id, 1);
    }
  };

  const toggleReaction = async (m, emoji) => {
    setOpenReactions(null);
    // optimistic toggle
    setMessages((prev) => prev.map((x) => {
      if (x.id !== m.id) return x;
      const reactions = x.reactions || [];
      const i = reactions.findIndex((r) => r.user_id === myId && r.emoji === emoji);
      return i === -1
        ? { ...x, reactions: [...reactions, { user_id: myId, emoji }] }
        : { ...x, reactions: reactions.filter((_, idx) => idx !== i) };
    }));
    try { await api.chat.react(m.id, emoji); }
    catch { toast.error('Reaction failed'); }
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7)   return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const otherUser = (conv) => conv?.other_user || {};

  const filteredConvs = conversations.filter((conv) => {
    const other = otherUser(conv);
    if (searchQ && !other.name?.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (tab === 'Unread') return (conv.unread_count || 0) > 0;
    return true;
  });

  // Receipt state for OUR sent messages: clock → ✓ (sent) → ✓ (delivered) → ✓✓ (read)
  const renderReceipt = (m) => {
    if (Number(m.sender_id) !== Number(myId)) return null;
    if (m._optimistic) return <Clock className="w-3 h-3 text-dark-500" />;
    if (m.is_read)     return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
    if (m.delivered_at) return <CheckCheck className="w-3.5 h-3.5 text-dark-500" />;
    return <Check className="w-3.5 h-3.5 text-dark-500" />;
  };

  const aggregateReactions = (reactions = []) => {
    const map = new Map();
    for (const r of reactions) {
      const cur = map.get(r.emoji) || { count: 0, mine: false };
      cur.count += 1;
      if (Number(r.user_id) === Number(myId)) cur.mine = true;
      map.set(r.emoji, cur);
    }
    return [...map.entries()].map(([emoji, v]) => ({ emoji, ...v }));
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-7.5rem)] flex rounded-2xl overflow-hidden border border-dark-800 bg-dark-950">

      {/* ── LEFT (conversation list) ── */}
      <div className={`${active ? 'hidden md:flex' : 'flex'} w-full md:w-72 md:shrink-0 border-r border-dark-800 flex-col bg-dark-900`}>
        <div className="px-4 pt-4 pb-3 border-b border-dark-800 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Messages</h2>
              <ConnectionDot state={connectionState} />
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowSearch(!showSearch)} className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-500 hover:text-dark-200 hover:bg-dark-800 transition-all">
                <Search className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-500 hover:text-dark-200 hover:bg-dark-800 transition-all">
                <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showSearch && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-3 overflow-hidden">
                <input autoFocus value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search conversations…" className="input input-sm w-full" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-0.5">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-dark-800 text-dark-100' : 'text-dark-500 hover:text-dark-300'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none">
          {loading ? (
            <div className="space-y-0 p-2">{[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-3 animate-pulse">
                <div className="skeleton w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5 py-0.5">
                  <div className="skeleton h-3 rounded w-3/4" />
                  <div className="skeleton h-2.5 rounded w-1/2" />
                </div>
              </div>
            ))}</div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-xs text-dark-600">Conversations will appear here</p>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {filteredConvs.map((conv) => {
                const other     = otherUser(conv);
                const isActive  = active?.id === conv.id;
                const liveOnline = isOnline(other.id) || other.is_online;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActive(conv)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${isActive ? 'bg-dark-800' : 'hover:bg-dark-800/50'}`}
                  >
                    <div className="relative shrink-0">
                      <UserAvatar user={other} size={36} ring={false} />
                      {liveOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-dark-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-dark-200'}`}>{other.name || 'User'}</span>
                        {conv.last_message && (
                          <span className="text-2xs text-dark-600 shrink-0">{formatTime(conv.last_message.created_at)}</span>
                        )}
                      </div>
                      <p className="text-2xs text-dark-500 truncate mt-0.5">{conv.last_message?.content || 'No messages yet'}</p>
                    </div>
                    {(conv.unread_count || 0) > 0 && (
                      <span className="w-4.5 h-4.5 min-w-[1.125rem] bg-primary-500 text-white text-2xs rounded-full flex items-center justify-center font-bold shrink-0">{conv.unread_count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT (active chat) ── */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* header */}
          <div className="h-14 px-3 sm:px-5 flex items-center gap-3 border-b border-dark-800 shrink-0 bg-dark-950">
            <button onClick={() => setActive(null)} aria-label="Back" className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="relative">
              <UserAvatar user={otherUser(active)} size={32} ring={false} />
              {(isOnline(otherUser(active).id) || otherUser(active).is_online) && (
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-dark-950" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white leading-tight truncate">{otherUser(active).name || 'User'}</p>
              <p className="text-2xs text-dark-500">
                {typingUserId === otherUser(active).id
                  ? <span className="text-primary-400">typing…</span>
                  : (isOnline(otherUser(active).id) || otherUser(active).is_online) ? 'Online now' : 'Offline'}
              </p>
            </div>
          </div>

          {/* messages */}
          <div ref={messagesScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-5 py-4 space-y-2 scrollbar-none">
            {loadingMore && (
              <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 text-dark-500 animate-spin" /></div>
            )}
            {msgLoading ? (
              <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-5 h-5 text-dark-600" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-dark-400 font-medium">Say hello!</p>
                <p className="text-xs text-dark-600 mt-1">Start the conversation below.</p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isMine = Number(msg.sender_id) === Number(myId);
                  const showAvatar = !isMine && (i === 0 || messages[i - 1]?.sender_id !== msg.sender_id);
                  const reactions = aggregateReactions(msg.reactions);
                  const replyParent = msg.reply_to_id
                    ? messages.find((x) => x.id === msg.reply_to_id) : null;
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex items-end gap-2 group ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && (
                        <div className="w-6 h-6 shrink-0 mb-0.5">
                          {showAvatar && <UserAvatar user={otherUser(active)} size={24} ring={false} />}
                        </div>
                      )}

                      <div className="flex flex-col gap-0.5 max-w-xs lg:max-w-md relative">
                        {/* hover actions */}
                        <div className={`absolute -top-3 ${isMine ? 'right-2' : 'left-2'} hidden group-hover:flex gap-0.5 bg-dark-900 border border-dark-700 rounded-full px-1 py-0.5 z-10`}>
                          <button title="React" onClick={() => setOpenReactions(openReactions === msg.id ? null : msg.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700"><Smile className="w-3 h-3" /></button>
                          <button title="Reply" onClick={() => setReplyTo(msg)} className="w-6 h-6 rounded-full flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700"><CornerUpLeft className="w-3 h-3" /></button>
                          {isMine && (
                            <>
                              <button title="Edit" onClick={() => startEdit(msg)} className="w-6 h-6 rounded-full flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700"><Edit2 className="w-3 h-3" /></button>
                              <button title="Delete" onClick={() => deleteMsg(msg)} className="w-6 h-6 rounded-full flex items-center justify-center text-dark-400 hover:text-red-400 hover:bg-dark-700"><Trash2 className="w-3 h-3" /></button>
                            </>
                          )}
                        </div>

                        {openReactions === msg.id && (
                          <div className={`absolute -top-10 ${isMine ? 'right-0' : 'left-0'} flex gap-1 bg-dark-900 border border-dark-700 rounded-full px-2 py-1 z-20`}>
                            {EMOJI.map((emo) => (
                              <button key={emo} onClick={() => toggleReaction(msg, emo)} className="text-base hover:scale-125 transition-transform">{emo}</button>
                            ))}
                          </div>
                        )}

                        {/* reply preview */}
                        {replyParent && (
                          <div className={`text-2xs px-2 py-1 rounded-lg border-l-2 ${isMine ? 'border-primary-300 bg-primary-500/10' : 'border-dark-600 bg-dark-800/60'} text-dark-400 line-clamp-2`}>
                            <span className="font-semibold">{Number(replyParent.sender_id) === Number(myId) ? 'You' : otherUser(active).name}: </span>
                            {replyParent.body || replyParent.content}
                          </div>
                        )}

                        {/* bubble (edit mode swaps in an input) */}
                        {editingId === msg.id ? (
                          <div className="flex items-center gap-1">
                            <input value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }} className="input input-sm flex-1" autoFocus />
                            <button onClick={saveEdit}    className="text-green-400 hover:text-green-300 p-1"><Check className="w-4 h-4" /></button>
                            <button onClick={cancelEdit}  className="text-dark-500 hover:text-white p-1"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${isMine ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-dark-800 text-dark-100 rounded-bl-sm border border-dark-700/50'}`}>
                            {msg.content || msg.body}
                            {msg.edited_at && <span className="ml-2 text-2xs opacity-60 italic">(edited)</span>}
                          </div>
                        )}

                        {/* reactions row */}
                        {reactions.length > 0 && (
                          <div className={`flex gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            {reactions.map((r) => (
                              <button key={r.emoji} onClick={() => toggleReaction(msg, r.emoji)} className={`text-2xs px-1.5 py-0.5 rounded-full border ${r.mine ? 'border-primary-500/50 bg-primary-500/15 text-primary-200' : 'border-dark-700 bg-dark-800 text-dark-300'}`}>
                                {r.emoji} <span className="ml-0.5 opacity-70">{r.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <span className={`text-2xs text-dark-600 px-1 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          {formatTime(msg.created_at)}
                          {renderReceipt(msg)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* reply banner */}
          {replyTo && (
            <div className="px-4 py-2 border-t border-dark-800 bg-dark-900/60 flex items-center gap-2 text-2xs">
              <CornerUpLeft className="w-3 h-3 text-primary-400" />
              <span className="text-dark-400 truncate flex-1">
                Replying to <span className="text-dark-200 font-semibold">{Number(replyTo.sender_id) === Number(myId) ? 'yourself' : otherUser(active).name}</span>: {replyTo.body || replyTo.content}
              </span>
              <button onClick={() => setReplyTo(null)} className="text-dark-500 hover:text-white"><X className="w-3 h-3" /></button>
            </div>
          )}

          {/* input */}
          <form onSubmit={sendMessage} className="px-4 py-3 border-t border-dark-800 flex gap-2.5 bg-dark-950 shrink-0">
            <input ref={inputRef} value={input} onChange={onInputChange} className="input flex-1 text-sm py-2.5" placeholder="Type a message…" disabled={sending} />
            <motion.button whileTap={{ scale: 0.93 }} type="submit" disabled={sending || !input.trim()} className="w-10 h-10 flex items-center justify-center bg-primary-500 hover:bg-primary-600 rounded-xl text-white transition-colors disabled:opacity-40 shrink-0">
              <Send className="w-4 h-4" strokeWidth={2} />
            </motion.button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-dark-950">
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 rounded-2xl bg-dark-800/80 border border-dark-700/50 flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="w-7 h-7 text-dark-500" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Welcome to Messages</h3>
            <p className="text-xs text-dark-500 leading-relaxed mb-6">Once you connect with a client, you'll be able to send and receive messages here.</p>
            <Link to="/search?type=jobs" className="btn btn-primary btn-sm inline-flex gap-1.5">
              Search for jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/** Tiny color dot + label for socket state — green/yellow/red */
function ConnectionDot({ state }) {
  const map = {
    connected:    { c: 'bg-green-400', t: 'Live',         Icon: Wifi },
    connecting:   { c: 'bg-yellow-400 animate-pulse', t: 'Connecting…', Icon: Loader2 },
    unavailable:  { c: 'bg-red-400',  t: 'Reconnecting…', Icon: WifiOff },
    disconnected: { c: 'bg-dark-600', t: 'Offline',       Icon: WifiOff },
  };
  const { c, t, Icon } = map[state] || map.disconnected;
  return (
    <span title={t} className="inline-flex items-center gap-1 text-2xs text-dark-500">
      <span className={`w-1.5 h-1.5 rounded-full ${c}`} />
      <Icon className="w-2.5 h-2.5" strokeWidth={2} />
    </span>
  );
}
