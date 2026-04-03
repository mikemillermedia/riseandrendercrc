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
    if (!formData.author_name || !formData.request_text) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('prayer_requests').insert([formData]);
    if (!error) {
      setFormData({ author_name: '', request_text: '' });
      fetchRequests();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full bg-[#FF9466] font-sans antialiased py-24 px-4 min-h-screen flex flex-col items-center">
      
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-6xl md:text-8xl font-[900] uppercase tracking-tighter leading-[0.85] mb-8 text-[#111111]">
          COMMUNITY<br />PRAYER WALL
        </h1>
        <p className="text-[#111111] text-lg md:text-2xl font-medium leading-relaxed opacity-80 px-4">
          We want to pray for you. Fill out the form and we will anonymously post it on our wall for the rest of our community to prayer in agreement for you.
        </p>
      </div>

      {/* TOGGLE BUTTON - Exact match to your image */}
      <div className="flex justify-center mb-16">
        <button 
          onClick={() => setIsWallOpen(!isWallOpen)}
          className="bg-[#111111] hover:bg-black text-white px-12 py-6 rounded-[2rem] text-sm md:text-base font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center gap-4"
        >
          {isWallOpen ? 'CLOSE WALL' : 'VIEW COMMUNITY PRAYERS'}
          {isWallOpen ? <X className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* ACCORDION CONTENT (GLASS EFFECT) */}
      <div className={`w-full max-w-5xl overflow-hidden transition-all duration-700 ease-in-out ${isWallOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        
        {/* THE FORM (GLASSMOPHISM) */}
        <div className="bg-white/20 backdrop-blur-3xl rounded-[3rem] p-8 md:p-16 border border-white/30 shadow-2xl mb-12">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-widest text-[#111111]">Share Your Request</h2>
            </div>
            
            <input
              type="text"
              required
              placeholder="YOUR NAME (OR ANONYMOUS)"
              className="w-full bg-white/40 border-none rounded-2xl py-5 px-8 focus:ring-2 focus:ring-[#111111] outline-none font-bold uppercase tracking-widest text-xs placeholder:text-black/40 text-[#111111]"
              value={formData.author_name}
              onChange={(e) => setFormData({...formData, author_name: e.target.value})}
            />
            
            <textarea
              required
              rows="4"
              placeholder="HOW CAN THE COMMUNITY PRAY FOR YOU?"
              className="w-full bg-white/40 border-none rounded-2xl py-5 px-8 focus:ring-2 focus:ring-[#111111] outline-none font-bold text-xl placeholder:text-black/40 text-[#111111] resize-none"
              value={formData.request_text}
              onChange={(e) => setFormData({...formData, request_text: e.target.value})}
            />
            
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#111111] text-white px-14 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-lg"
              >
                {isSubmitting ? 'SENDING...' : 'POST TO WALL'}
              </button>
            </div>
          </form>
        </div>

        {/* THE PRAYER FEED */}
        <div className="grid grid-cols-1 gap-6 pb-20">
          {loading ? (
            <div className="text-center py-10 font-black uppercase text-black/40 tracking-widest">Loading...</div>
          ) : requests.map((prayer) => (
            <div key={prayer.id} className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/20 hover:bg-white/50 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-[#111111] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {prayer.author_name}
                </span>
                <span className="text-black/30 text-[10px] font-bold uppercase tracking-widest">
                  {new Date(prayer.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[#111111] text-2xl md:text-4xl font-[900] italic leading-[1.1] tracking-tighter">
                "{prayer.request_text}"
              </p>
              <div className="mt-8 pt-6 border-t border-black/5 flex justify-end">
                <button className="flex items-center gap-3 text-black/40 hover:text-black transition-colors font-black uppercase tracking-widest text-xs">
                  <Heart className="w-5 h-5 fill-[#FF5106] stroke-none" />
                  I AM PRAYING
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
