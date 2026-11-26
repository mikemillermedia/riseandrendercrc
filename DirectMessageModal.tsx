import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabase: any;
  currentUserId: string | null;
  recipient: any | null;
  onMessagesRead?: () => void;
}

export default function DirectMessageModal({
  isOpen,
  onClose,
  supabase,
  currentUserId,
  recipient,
  onMessagesRead,
}: DirectMessageModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversation = async () => {
    if (!supabase || !currentUserId || !recipient?.id) return;
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},receiver_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      // Mark incoming unread messages as read
      const hasUnread = data.some(
        (m: any) => m.receiver_id === currentUserId && !m.is_read
      );
      if (hasUnread) {
        await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .eq('sender_id', recipient.id)
          .eq('receiver_id', currentUserId)
          .eq('is_read', false);
        if (onMessagesRead) onMessagesRead();
      }
    }
  };

  useEffect(() => {
    if (!isOpen || !recipient?.id || !currentUserId) return;
    setIsLoading(true);
    fetchConversation().finally(() => setIsLoading(false));

    // Poll every 4 seconds while chat is open so replies appear live
    const interval = setInterval(fetchConversation, 4000);
    return () => clearInterval(interval);
  }, [isOpen, recipient?.id, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !supabase || !currentUserId || !recipient?.id) return;
    setIsSending(true);
    try {
      const { error } = await supabase.from('direct_messages').insert([
        {
          sender_id: currentUserId,
          receiver_id: recipient.id,
          content: newMessage.trim(),
        },
      ]);
      if (error) throw error;
      setNewMessage('');
      await fetchConversation();
    } catch (err: any) {
      alert('Error sending message: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !recipient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md h-[82vh] sm:h-[600px] bg-white/95 backdrop-blur-2xl border border-white rounded-t-[32px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(28,28,46,0.28)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1C1C2E] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white/15 ring-2 ring-amber-400/50 overflow-hidden shrink-0 flex items-center justify-center font-black text-sm">
              {recipient.avatar_url ? (
                <img src={recipient.avatar_url} className="w-full h-full object-cover" />
              ) : (
                recipient.first_name?.[0] || 'M'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black truncate">
                {recipient.first_name} {recipient.last_name}
              </p>
              <p className="text-[11px] text-white/60 font-medium truncate">
                Private Family DM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F5F7]/70 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-wider">
                Loading messages...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#ff4d00] mb-3">
                <MessageCircle size={22} />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Say hi to {recipient.first_name}!
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Messages here are private between the two of you and send an instant push alert.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              const time = new Date(msg.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      isMe
                        ? 'bg-[#1C1C2E] text-white rounded-br-md'
                        : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-1 px-1">
                    {time}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3.5 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder={`Message ${recipient.first_name || 'Family'}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-slate-100 border border-slate-200/80 rounded-full px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="bg-[#ff4d00] hover:bg-orange-600 text-white p-2.5 rounded-full shadow-md transition-all disabled:opacity-40 shrink-0"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
