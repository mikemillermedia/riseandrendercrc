import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, Send } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PrayerWall() {
  const [requests, setRequests] = useState<any[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get the logged-in user so we know who is posting/clicking
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setCurrentUser(session.user);
    };
    getUser();
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('prayer_requests')
      .select(`*, profiles (first_name, last_name)`)
      .order('created_at', { ascending: false });
    
    if (data) setRequests(data);
    setLoading(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.trim() || !currentUser) return;
    setPosting(true);

    const { error } = await supabase.from('prayer_requests').insert([
      { user_id: currentUser.id, content: newRequest.trim() }
    ]);

    if (!error) {
      setNewRequest('');
      fetchRequests();
    }
    setPosting(false);
  };

  const togglePraying = async (requestId: string, currentPrayedBy: string[]) => {
    if (!currentUser) return;
    
    // Check if the user already clicked "Praying"
    const hasPrayed = currentPrayedBy.includes(currentUser.id);
    
    // Add or remove them from the list
    const newPrayedBy = hasPrayed 
      ? currentPrayedBy.filter(id => id !== currentUser.id)
      : [...currentPrayedBy, currentUser.id];

    // Optimistically update the UI instantly so it feels fast
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, prayed_by: newPrayedBy } : req
    ));

    // Update the database in the background
    await supabase
      .from('prayer_requests')
      .update({ prayed_by: newPrayedBy })
      .eq('id', requestId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + date.toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Input Box */}
      <div className="bg-[#1a1a1a] border border-[#F5F5F0]/10 p-6 rounded-2xl shadow-xl">
        <form onSubmit={handlePost} className="flex flex-col gap-4">
          <textarea
            placeholder="Share a prayer request..."
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            className="w-full bg-[#131313] border border-[#F5F5F0]/10 rounded-xl px-4 py-3 text-[#F5F5F0] placeholder:text-[#F5F5F0]/40 focus:outline-none focus:border-[#ff4d00] transition-colors resize-none h-24"
            required
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={posting || !newRequest.trim()}
              className="bg-[#ff4d00] disabled:opacity-50 hover:bg-[#ff4d00]/80 text-white font-bold py-2.5 px-6 rounded-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-orange-900/20"
            >
              <Send size={16} /> {posting ? 'Posting...' : 'Post Request'}
            </button>
          </div>
        </form>
      </div>

      {/* Real-time Prayer Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-[#F5F5F0]/60 animate-pulse text-center py-8">Loading requests...</div>
        ) : requests.length > 0 ? (
          requests.map((request) => {
            const hasPrayed = request.prayed_by?.includes(currentUser?.id);
            const prayCount = request.prayed_by?.length || 0;

            return (
              <div key={request.id} className="bg-[#1a1a1a] border border-[#F5F5F0]/10 p-6 rounded-2xl shadow-md transition-all hover:border-[#F5F5F0]/20">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                    {request.profiles?.first_name || 'CRC'} {request.profiles?.last_name || 'Member'}
                  </h3>
                  <span className="text-xs text-[#F5F5F0]/40">{formatDate(request.created_at)}</span>
                </div>
                
                <p className="text-[#F5F5F0]/80 mb-4 leading-relaxed whitespace-pre-wrap">
                  {request.content}
                </p>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => togglePraying(request.id, request.prayed_by || [])}
                    className={`flex items-center gap-2 text-sm transition-colors px-3 py-1.5 rounded-lg border ${
                      hasPrayed 
                        ? 'text-[#ff4d00] bg-[#ff4d00]/10 border-[#ff4d00]/20' 
                        : 'text-[#F5F5F0]/40 bg-white/5 border-transparent hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart size={16} className={hasPrayed ? "fill-current" : ""} /> 
                    Praying {prayCount > 0 && `(${prayCount})`}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-[#F5F5F0]/60 border border-dashed border-[#F5F5F0]/20 p-12 rounded-2xl text-center">
            No prayer requests yet. Be the first to share one.
          </div>
        )}
      </div>
    </div>
  );
}
