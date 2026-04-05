import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, Send, User, AlertCircle, MessageCircle, Trash2 } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PRAYER_REACTIONS = ['🙏', '❤️', '🙌', '🫂'];

export default function PrayerWall({ user }: { user: any }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // NEW: Reply States
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    // Added prayer_comments to the fetch query
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*, profiles(first_name, last_name, avatar_url), prayer_likes(id, user_id, emoji), prayer_comments(*, profiles(first_name, last_name, avatar_url))')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Supabase Error:", error);
      setErrorMsg(error.message);
    } else if (data) {
      setRequests(data);
      setErrorMsg(null);
    }
    setLoading(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.trim()) return;
    
    setPosting(true);
    const { error } = await supabase
      .from('prayer_requests')
      .insert([{ user_id: user.id, content: newRequest.trim() }]);
      
    if (!error) {
      setNewRequest('');
      fetchRequests();
    } else {
      setErrorMsg(error.message);
    }
    setPosting(false);
  };

  const toggleReaction = async (requestId: string, emoji: string, currentLikes: any[]) => {
    if (!user) return;
    const existingLike = currentLikes.find(like => like.user_id === user.id && like.emoji === emoji);
    if (existingLike) {
      await supabase.from('prayer_likes').delete().match({ id: existingLike.id });
    } else {
      await supabase.from('prayer_likes').insert([{ request_id: requestId, user_id: user.id, emoji: emoji }]);
    }
    fetchRequests();
  };

  // NEW: Submit Comment
  const submitComment = async (requestId: string) => {
    if (!commentText.trim() || !user) return;
    try {
      await supabase.from('prayer_comments').insert([{ request_id: requestId, user_id: user.id, content: commentText.trim() }]);
      setCommentText('');
      fetchRequests();
    } catch (e) { console.error(e); }
  };

  // NEW: Delete Request
  const deleteRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to delete this prayer request?")) return;
    try {
      await supabase.from('prayer_requests').delete().eq('id', requestId);
      fetchRequests();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="text-white/40">Loading prayer requests...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm">Error: {errorMsg}</p>
        </div>
      )}

      {/* Input Box */}
      <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl shadow-xl">
        <form onSubmit={handlePost}>
          <textarea 
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            placeholder="Share a prayer request..." 
            className="w-full bg-transparent border-none text-[#F5F5F0] focus:ring-0 text-base placeholder:text-white/20 resize-none h-20"
          />
          <div className="flex justify-end mt-4 border-t border-white/5 pt-4">
            <button 
              type="submit" 
              disabled={posting || !newRequest.trim()}
              className="bg-[#ff4d00] hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} /> {posting ? 'Posting...' : 'Post Request'}
            </button>
          </div>
        </form>
      </div>

      {/* Requests Feed */}
      <div className="space-y-4">
        {requests.map((request) => {
          const likes = request.prayer_likes || [];
          const comments = request.prayer_comments || [];
          const firstName = request.profiles?.first_name || 'CRC';
          const lastName = request.profiles?.last_name || 'Member';
          const avatarUrl = request.profiles?.avatar_url;
          const isMyPost = user?.id === request.user_id; // Check if the logged in user owns this

          return (
            <div key={request.id} className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl shadow-xl transition-all duration-500">
              <div className="flex justify-between items-start mb-4">
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={`${firstName}'s avatar`} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-white/20" />
                    )}
                  </div>
                  <h3 className="font-bold text-white uppercase tracking-widest text-sm">
                    {firstName} {lastName}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/30 whitespace-nowrap pt-1">
                    {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(request.created_at).toLocaleDateString()}
                  </span>
                  {/* NEW: Trash Button */}
                  {isMyPost && (
                    <button onClick={() => deleteRequest(request.id)} className="text-white/20 hover:text-red-500 transition-colors pt-1">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-[#F5F5F0]/90 leading-relaxed whitespace-pre-wrap mb-6">
                {request.content}
              </p>
              
              <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 flex-wrap flex-grow">
                  {PRAYER_REACTIONS.map((emoji) => {
                    const reactionCount = likes.filter((l: any) => l.emoji === emoji).length;
                    const hasReacted = likes.some((l: any) => l.user_id === user?.id && l.emoji === emoji);

                    return (
                      <button 
                        key={emoji}
                        onClick={() => toggleReaction(request.id, emoji, likes)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                          hasReacted ? 'bg-[#ff4d00]/10 border-[#ff4d00]/30 text-[#ff4d00]' : 'bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg leading-none">{emoji}</span>
                        {reactionCount > 0 && <span>{reactionCount}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* NEW: Comment Toggle Button */}
                <button 
                  onClick={() => setOpenCommentId(openCommentId === request.id ? null : request.id)} 
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${openCommentId === request.id ? 'text-white' : 'text-white/40 hover:text-white'}`}
                >
                  <MessageCircle size={18} />
                  <span>{comments.length} Replies</span>
                </button>
              </div>

              {/* NEW: Reply Thread */}
              {openCommentId === request.id && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                  {comments.map((c: any) => (
                    <div key={c.id} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-white/5 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                        {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={12} className="text-white/20" />}
                      </div>
                      <div className="bg-white/5 px-4 py-2 rounded-2xl flex-grow">
                        <p className="text-[10px] font-bold text-[#ff4d00] uppercase">{c.profiles?.first_name || 'Member'}</p>
                        <p className="text-sm text-white/80">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 pt-2">
                    <input 
                      value={commentText} 
                      onChange={e => setCommentText(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && submitComment(request.id)} 
                      placeholder="Add a reply or encouragement..." 
                      className="flex-grow bg-white/5 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-[#ff4d00] text-white" 
                    />
                    <button onClick={() => submitComment(request.id)} className="text-[#ff4d00] font-bold text-sm px-4 hover:text-white transition-colors">Reply</button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
