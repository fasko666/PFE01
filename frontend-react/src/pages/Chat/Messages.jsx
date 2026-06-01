import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreHorizontal, MessageSquare, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import UserAvatar from '../../components/ui/UserAvatar';
import toast from 'react-hot-toast';

const TABS = ['All', 'Unread', 'Starred'];

export default function Messages() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [active, setActive]               = useState(null);
  const [messages, setMessages]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [msgLoading, setMsgLoading]       = useState(false);
  const [input, setInput]                 = useState('');
  const [sending, setSending]             = useState(false);
  const [tab, setTab]                     = useState('All');
  const [searchQ, setSearchQ]             = useState('');
  const [showSearch, setShowSearch]       = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    api.chat.conversations()
      .then((r) => {
        const convs = r.data.data || [];
        setConversations(convs);
        if (convs.length > 0) setActive(convs[0]);
      })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return;
    setMsgLoading(true);
    api.chat.messages(active.id)
      .then((r) => {
        setMessages(r.data.data?.data || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setMsgLoading(false));
  }, [active?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !active) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const optimistic = { id: `temp-${Date.now()}`, content: text, sender_id: user.id, created_at: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    try {
      const res = await api.chat.send({ conversation_id: active.id, content: text });
      setMessages((m) => m.map((msg) => msg.id === optimistic.id ? res.data.data : msg));
      setConversations((c) => c.map((cv) => cv.id === active.id ? { ...cv, last_message: res.data.data } : cv));
    } catch {
      setMessages((m) => m.filter((msg) => msg.id !== optimistic.id));
      toast.error('Failed to send message');
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7)   return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const otherUser = (conv) => conv.other_user || {};

  const filteredConvs = conversations.filter((conv) => {
    const other = otherUser(conv);
    if (searchQ && !other.name?.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (tab === 'Unread') return (conv.unread_count || 0) > 0;
    return true;
  });

  return (
    <div className="h-[calc(100vh-7.5rem)] flex rounded-2xl overflow-hidden border border-dark-800 bg-dark-950">

      {/* ── Left panel (list) — full width on mobile, hidden when a chat is open ── */}
      <div className={`${active ? 'hidden md:flex' : 'flex'} w-full md:w-72 md:shrink-0 border-r border-dark-800 flex-col bg-dark-900`}>

        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-dark-800 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Messages</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-500 hover:text-dark-200 hover:bg-dark-800 transition-all"
              >
                <Search className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-500 hover:text-dark-200 hover:bg-dark-800 transition-all">
                <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Search box */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <input
                  autoFocus
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search conversations…"
                  className="input input-sm w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex gap-0.5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === t ? 'bg-dark-800 text-dark-100' : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {loading ? (
            <div className="space-y-0 p-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 p-3 animate-pulse">
                  <div className="skeleton w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5 py-0.5">
                    <div className="skeleton h-3 rounded w-3/4" />
                    <div className="skeleton h-2.5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-xs text-dark-600">Conversations will appear here</p>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {filteredConvs.map((conv) => {
                const other = otherUser(conv);
                const isActive = active?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActive(conv)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      isActive ? 'bg-dark-800' : 'hover:bg-dark-800/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <UserAvatar user={other} size={36} ring={false} />
                      {other.is_online && (
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
                      <p className="text-2xs text-dark-500 truncate mt-0.5">
                        {conv.last_message?.content || 'No messages yet'}
                      </p>
                    </div>
                    {(conv.unread_count || 0) > 0 && (
                      <span className="w-4.5 h-4.5 min-w-[1.125rem] bg-primary-500 text-white text-2xs rounded-full flex items-center justify-center font-bold shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel (chat) — hidden on mobile until a conversation is selected ── */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="h-14 px-3 sm:px-5 flex items-center gap-3 border-b border-dark-800 shrink-0 bg-dark-950">
            <button
              onClick={() => setActive(null)}
              aria-label="Back to conversations"
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="relative">
              <UserAvatar user={otherUser(active)} size={32} ring={false} />
              {otherUser(active).is_online && (
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-dark-950" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">{otherUser(active).name || 'User'}</p>
              <p className="text-2xs text-dark-500">{otherUser(active).is_online ? 'Online now' : 'Offline'}</p>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 scrollbar-none">
            {msgLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
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
                  const isMine = msg.sender_id === user.id;
                  const showAvatar = !isMine && (i === 0 || messages[i - 1]?.sender_id !== msg.sender_id);
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <div className="w-6 h-6 shrink-0 mb-0.5">
                          {showAvatar && (
                            <UserAvatar user={otherUser(active)} size={24} ring={false} />
                          )}
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 max-w-xs lg:max-w-md">
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? 'bg-primary-500 text-white rounded-br-sm'
                            : 'bg-dark-800 text-dark-100 rounded-bl-sm border border-dark-700/50'
                        }`}>
                          {msg.content}
                        </div>
                        <span className={`text-2xs text-dark-600 px-1 ${isMine ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="px-4 py-3 border-t border-dark-800 flex gap-2.5 bg-dark-950 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input flex-1 text-sm py-2.5"
              placeholder="Type a message…"
              disabled={sending}
            />
            <motion.button
              whileTap={{ scale: 0.93 }}
              type="submit"
              disabled={sending || !input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-primary-500 hover:bg-primary-600 rounded-xl text-white transition-colors disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" strokeWidth={2} />
            </motion.button>
          </form>
        </div>
      ) : (
        /* Welcome to Messages empty state — desktop only, on mobile the list takes the screen */
        <div className="hidden md:flex flex-1 items-center justify-center bg-dark-950">
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 rounded-2xl bg-dark-800/80 border border-dark-700/50 flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="w-7 h-7 text-dark-500" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Welcome to Messages</h3>
            <p className="text-xs text-dark-500 leading-relaxed mb-6">
              Once you connect with a client, you'll be able to send and receive messages here.
            </p>
            <Link to="/jobs" className="btn btn-primary btn-sm inline-flex gap-1.5">
              Search for jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
