import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, Plus, X } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PrayerWall() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWallOpen, setIsWallOpen] = useState(false);
  const [formData, setFormData] = useState({ author_name: '', request_text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.request_text) return;
    setIsSubmitting(true);
    
    // Defaulting to Anonymous if name is left blank
    const submission = {
      author_name: formData.author_name || "Anonymous",
      request_text: formData.request_text
    };

    const { error } = await supabase.from('prayer_requests').insert([submission]);
    if (!error) {
      setFormData({ author_name: '', request_text: '' });
      fetchRequests();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full bg-[#FF9466] font-sans antialiased py-24 px-4 min-h-screen flex flex-col items-center">
      
      {/* HEADER SECTION */}
      <div className="text-center max-w-4xl mx-auto mb-12">
        <h1 className="text-6xl md:text-8xl font-[900] uppercase tracking-tighter leading-[0.85] mb-8 text-[#111111]">
          Community<br />Prayer Wall
        </h1>
        <div className="space-y-2">
            <p className="text-[#111111] text-xl md:text-3xl font-black uppercase tracking-tight italic">
                We Want to pray for you.
            </p>
            <p className="text-[#111111] text-lg md:text-xl font-medium opacity-70 tracking-tight">
                This will be posted anonymously.
            </p>
        </div>
      </div>

      {/* TOGGLE BUTTON */}
      <div className="flex justify-center mb-16">
        <button 
          onClick={() => setIsWallOpen(!isWallOpen)}
          className="bg-[#111111] hover:bg-black text-white px-12 py-6 rounded-[2rem] text-sm md:text-base font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center gap-4 border border-white/10"
        >
          {isWallOpen ? 'CLOSE WALL' : 'VIEW COMMUNITY PRAYERS'}
          {isWallOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* ACCORDION CONTENT (GLASS EFFECT) */}
      <div className={`w-full max-w-5xl overflow-hidden transition-all duration-700 ease-in-out ${isWallOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        
        {/* THE FORM (GLASSMOPHISM) */}
        <div className="bg-white/20 backdrop-blur-3xl rounded-[3rem] p-8 md:p-16 border border-white/30 shadow-2xl mb-12">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="YOUR NAME (OPTIONAL)"
              className="w-full bg-white/40 border-none rounded-2xl py-5 px-8 focus:ring-2 focus:ring-[#111111] outline-none font-black tracking-widest text-xs placeholder:text-black/30 text-[#111111]"
              value={formData.author_name}
              onChange={(e) => setFormData({...formData, author_name: e.target.value})}
            />
            
            <textarea
              required
              rows="4"
              placeholder="HOW CAN WE PRAY FOR YOU?"
              className="w-full bg-white/40 border-none rounded-2xl py-5 px-8 focus:ring-2 focus:ring-[#111111] outline-none font-bold text-xl placeholder:text-black/30 text-[#111111] resize-none"
              value={formData.request_text}
              onChange={(e) => setFormData({...formData, request_text: e.target.value})}
            />
            
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#111111] text-white px-14 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-lg active:scale-95"
              >
                {isSubmitting ? 'SENDING...' : 'POST ANONYMOUSLY'}
              </button>
            </div>
          </form>
        </div>

        {/* THE PRAYER FEED */}
        <div className="grid grid-cols-1 gap-6 pb-20">
          {loading ? (
            <div className="text-center py-10 font-black uppercase text-black/20 tracking-widest">Updating Feed...</div>
          ) : requests.length > 0 ? (
            requests.map((prayer) => (
              <div key={prayer.id} className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 hover:bg-white/50 transition-all group">
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-[#111111] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {prayer.author_name || "Anonymous Member"}
                  </span>
                  <span className="text-black/20 text-[10px] font-bold uppercase">
                    {new Date(prayer.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[#111111] text-2xl md:text-5xl font-[900] italic leading-[1] tracking-tighter">
                  "{prayer.request_text}"
                </p>
                <div className="mt-8 pt-6 border-t border-black/5 flex justify-end">
                  <button className="flex items-center gap-3 text-black/30 hover:text-[#111111] transition-colors font-black uppercase tracking-widest text-[10px]">
                    <Heart className="w-4 h-4 fill-[#FF5106] stroke-none" />
                    PRAYING IN AGREEMENT
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-black/40 font-bold uppercase tracking-widest">The wall is waiting for its first request.</div>
          )}
        </div>
      </div>
    </div>
  );
}
