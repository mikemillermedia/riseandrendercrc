import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, Send, User, AlertCircle } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PrayerWall({ user }: { user: any }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // NEW: Error state

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    // We simplified the join syntax here to be more reliable
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*, profiles(first_name, last_name, avatar_url), prayer_likes(user_id)')
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

  const togglePraying = async (requestId: string, currentLikes: any[]) => {
    if (!user) return;
    const isPraying = currentLikes.some(like => like.user_id === user.id);
    
    if (isPraying) {
      await supabase.from('prayer_likes').delete().match({ request_id: requestId, user_id: user.id });
    } else {
      await supabase.from('prayer_likes').insert([{ request_id: requestId, user_id: user.id }]);
    }
    fetchRequests();
  };

  if (loading) return <div className="text-white/40">Loading prayer requests...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* Error Banner */}
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
          const isPraying = likes.some((like: any) => like.user_id === user?.id);
          const firstName = request.profiles?.first_name || 'CRC';
          const lastName = request.profiles?.last_name || 'Member';
          const avatarUrl = request.profiles?.avatar_url;

          return (
            <div key={request.id} className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl shadow-xl">
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

                <span className="text-xs text-white/30 whitespace-nowrap pt-1">
                  {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-[#F5F5F0]/90 leading-relaxed whitespace-pre-wrap mb-6">
                {request.content}
              </p>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => togglePraying(request.id, likes)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                    isPraying 
                      ? 'bg-[#ff4d00]/10 border-[#ff4d00]/30 text-[#ff4d00]' 
                      : 'bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Heart size={16} fill={isPraying ? "currentColor" : "none"} /> 
                  Praying ({likes.length})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
