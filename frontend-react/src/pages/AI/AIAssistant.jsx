import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Plus, MessageSquare, Trash2, ChevronRight } from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import UserAvatar from '../../components/ui/UserAvatar';

const SUGGESTIONS = [
  { label: 'Write a proposal',        prompt: 'Write a winning proposal for a React development job' },
  { label: 'Improve my profile',      prompt: 'How can I improve my freelancer profile to attract more clients?' },
  { label: 'What rate should I set?', prompt: 'What hourly rate should I charge for senior web development?' },
  { label: 'Write a job description', prompt: 'Help me write a compelling job description for a UI/UX designer' },
  { label: 'Handle difficult clients',prompt: 'How do I professionally handle difficult or unresponsive clients?' },
  { label: 'Win more proposals',      prompt: 'Give me actionable tips for winning more freelance proposals' },
];

const mkId = () => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function AIAssistant() {
  const { user } = useAuthStore();

  const initMsg = (id) => ({
    id: 'init',
    role: 'assistant',
    content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your PANDA AI â€” powered by Mistral. I can help you write proposals, optimize your profile, find talent, or answer any freelancing question. What can I help you with today?`,
  });

  const [chats, setChats] = useState(() => {
    const id = mkId();
    return [{ id, title: 'New conversation', messages: [initMsg(id)], ts: Date.now() }];
  });
  const [activeChatId, setActiveChatId] = useState(() => chats[0].id);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const endRef    = useRef(null);
  const inputRef  = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messages   = activeChat?.messages || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const newChat = () => {
    const id = mkId();
    const chat = { id, title: 'New conversation', messages: [initMsg(id)], ts: Date.now() };
    setChats((c) => [chat, ...c]);
    setActiveChatId(id);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const deleteChat = (id) => {
    setChats((c) => {
      const next = c.filter((ch) => ch.id !== id);
      if (next.length === 0) {
        const newId = mkId();
        const fresh = { id: newId, title: 'New conversation', messages: [initMsg(newId)], ts: Date.now() };
        setActiveChatId(newId);
        return [fresh];
      }
      if (activeChatId === id) setActiveChatId(next[0].id);
      return next;
    });
  };

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    setLoading(true);

    const userMsg = { id: Date.now(), role: 'user', content };

    setChats((prev) => prev.map((c) => {
      if (c.id !== activeChatId) return c;
      const isFirst = c.messages.filter((m) => m.role === 'user').length === 0;
      return {
        ...c,
        title: isFirst ? content.slice(0, 40) + (content.length > 40 ? 'â€¦' : '') : c.title,
        messages: [...c.messages, userMsg],
        ts: Date.now(),
      };
    }));

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.aiApi.chat({ message: content, history });
      const reply = res.data.data?.message || res.data.message || 'I apologize, I could not process that request.';
      const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: reply };
      setChats((prev) => prev.map((c) =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, assistantMsg] } : c
      ));
    } catch {
      const errMsg = { id: Date.now() + 1, role: 'assistant', content: "I'm currently offline. Please check that the Ollama server is running and try again." };
      setChats((prev) => prev.map((c) =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, errMsg] } : c
      ));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex rounded-2xl overflow-hidden border border-dark-700/60 bg-dark-950">

      {/* â”€â”€ Left sidebar â”€â”€ */}
      <div className="w-60 shrink-0 border-r border-dark-700/50 flex flex-col bg-dark-800/40">
        {/* Header */}
        <div className="px-3 pt-4 pb-3 border-b border-dark-700/50 shrink-0">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-xs font-semibold text-dark-100">AI Assistant</span>
          </div>
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            New chat
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto scrollbar-none p-1.5 space-y-0.5">
          {chats.length === 0 ? (
            <p className="text-2xs text-dark-600 text-center py-6">No conversations yet</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                  chat.id === activeChatId ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-dark-800/50 border border-transparent'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-dark-600 shrink-0" strokeWidth={1.75} />
                <span className={`flex-1 text-xs truncate ${chat.id === activeChatId ? 'text-primary-400' : 'text-dark-400'}`}>
                  {chat.title}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-dark-600 hover:text-red-400 transition-all shrink-0"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Model info */}
        <div className="px-3 py-3 border-t border-dark-700/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shrink-0" />
            <span className="text-2xs text-dark-600">Mistral via Ollama</span>
          </div>
        </div>
      </div>

      {/* â”€â”€ Chat area â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="h-14 px-5 flex items-center gap-3 border-b border-dark-700/50 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-dark-100 leading-tight">PANDA AI</p>
            <p className="text-2xs text-dark-500">Your freelancing intelligence layer</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-none">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                  </div>
                )}
                <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-sm'
                    : 'bg-dark-800 text-dark-100 rounded-bl-sm border border-dark-700/50'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <UserAvatar user={user} size={28} ring={false} className="shrink-0 mt-0.5" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
              <div className="bg-dark-800 border border-dark-700/50 rounded-2xl rounded-bl-sm px-4 py-3.5">
                <div className="flex gap-1 items-center">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestion chips â€” show on new chats */}
        {messages.filter((m) => m.role === 'user').length === 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => send(s.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-dark-800 border border-dark-700 text-dark-300 hover:border-primary-500/40 hover:text-dark-100 hover:bg-dark-700 transition-all"
              >
                {s.label}
                <ChevronRight className="w-3 h-3 text-dark-600" />
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="px-4 py-3 border-t border-dark-700/50 flex gap-2.5 shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input flex-1 text-sm py-2.5"
            placeholder="Ask anything about freelancingâ€¦"
            disabled={loading}
          />
          <motion.button
            whileTap={{ scale: 0.93 }}
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 flex items-center justify-center bg-primary-500 hover:bg-primary-600 rounded-xl text-white transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" strokeWidth={2} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}

