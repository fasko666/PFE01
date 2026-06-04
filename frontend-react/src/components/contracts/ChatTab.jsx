import { ArrowRight, MessageSquare, Paperclip, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * The contract's dedicated chat tab. We don't re-implement Messages here — we
 * link to /messages/:id with the conversation already in context. The tab
 * shows shortcuts for the two upload paths that are now available.
 */
export default function ChatTab({ contract }) {
  const id = contract.conversation_id;
  if (!id) {
    return (
      <div className="text-center py-12 text-dark-500">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">Chat will open after the first interaction.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Link to={`/messages/${id}`}
        className="flex items-center gap-3 rounded-2xl border border-dark-800 bg-dark-900 p-4 hover:border-dark-700 transition-colors group">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-dark-100">Open contract chat</div>
          <div className="text-2xs text-dark-500">Full-featured chat with attachments, voice notes, reactions, and read receipts.</div>
        </div>
        <ArrowRight className="w-4 h-4 text-dark-500 group-hover:text-white transition-colors" />
      </Link>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-dark-800 bg-dark-900/40 p-3 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-dark-400" />
          <div className="text-2xs text-dark-300">File attachments — up to 25 MB</div>
        </div>
        <div className="rounded-xl border border-dark-800 bg-dark-900/40 p-3 flex items-center gap-2">
          <Mic className="w-4 h-4 text-dark-400" />
          <div className="text-2xs text-dark-300">Voice notes — record in-app</div>
        </div>
      </div>
    </div>
  );
}
