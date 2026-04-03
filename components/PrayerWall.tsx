import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, Plus, Minus } from 'lucide-react';

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
    // Outer container with orange background to match your screenshot
    <div className="w-full bg-[#FF5106] font-sans antialiased pb-20">
      
      {/* 1. TOP SPACING - Creates huge gap from the previous section */}
      <div className="h-32 md:h-48"></div>

      {/* 2. HEADER LABEL (The "Fill out the quick form" box) */}
      <div className="flex justify-center -mb-8 relative z-20 px-4">
        <div className="bg-[#0D0D0D] text-white px-8 py-5 rounded-t-[2rem] rounded-b-none text-xs md:text-sm font-black uppercase tracking-[0.3em]">
          FILL OUT THE QUICK FORM
        </div>
      </div>

      {/* 3. MAIN GLASS ACCORDION */}
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <button 
          onClick={() => setIsWallOpen(!isWallOpen)}
          className="group flex items-center justify-between w-full bg-black/40 backdrop-blur-xl hover:bg-black/50 text-white p-10 md:p-14 rounded-[3rem] md:rounded-[5rem] transition-all border-none active:scale-[0.99] shadow-2xl"
        >
          <div className="text-left">
            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none italic flex flex-wrap items-center">
              COMMUNITY<span className="text-[#FF5106] not-italic ml-1 md:ml-3">PRAYER WALL</span>
            </h2>
            <p className="text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mt-4 opacity-70">
              SHARE A REQUEST & VIEW OTHERS
            </p>
          </div>
          
          <div className="flex-shrink-0 ml-4 border-2 border-white/20 rounded-full p-3 md:p-5 group-hover:border-[#FF5106] transition-colors">
            {isWallOpen ? 
              <Minus className="w-6 h-6 md:w-8 md:h-8 text-[#FF5106]" /> : 
              <Plus className="w-6 h-6 md:w-8 md:h-8 text-[#FF5106]" />
            }
          </div>
        </button>
      </div>

      {/* 4. ACCORDION CONTENT */}
      <div className={`max-w-5xl mx-auto overflow-hidden transition-all duration-700 ease-in-out ${isWallOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        
        {/* FORM SECTION */}
        <div className="px-4 pt-12 pb-10">
          <div className="bg-black/20 backdrop-blur-md rounded-[3rem] p-8 md:p-16">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              <input
                type="text"
                required
                placeholder="YOUR NAME"
                className="w-full bg-black/40 text-white border-none rounded-2xl py-5 px-8 focus:ring-2 focus:ring-white outline-none uppercase font-black tracking-widest text-xs placeholder:text-zinc-500 transition-all"
                value={formData.author_name}
                onChange={(e) => setFormData({...formData, author_name: e.target.value})}
              />
              <textarea
                required
                rows="3"
                placeholder="HOW CAN WE PRAY FOR YOU?"
                className="w-full bg-black/40 text-white border-none rounded-2xl py-5 px-8 focus:ring-2 focus:ring-white outline-none font-bold text-lg placeholder:text-zinc-500 transition-all resize-none"
                value={formData.request_text}
                onChange={(e) => setFormData({...formData, request_text: e.target.value})}
              />
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] px-14 py-6 rounded-full hover:bg-[#FF5106] hover:text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'SENDING...' : 'SUBMIT REQUEST'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* FEED SECTION */}
        <div className="px-4 py-10 space-y-6">
          {requests.map((prayer) => (
            <div key={prayer.id} className="bg-black/30 backdrop-blur-sm rounded-[3rem] p-10 md:p-14 transition-all hover:bg-black/40 group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[#FF5106] text-[10px] font-black uppercase tracking-[0.3em]">
                  {prayer.author_name}
                </span>
                <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest">
                  {new Date(prayer.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-white text-xl md:text-3xl font-black italic leading-tight tracking-tighter mb-10">
                "{prayer.request_text}"
              </p>
              <button className="flex items-center gap-3 text-white/40 hover:text-white transition-colors font-black uppercase tracking-widest text-[9px]">
                <Heart className="w-5 h-5 fill-current text-[#FF5106]" />
                I'M PRAYING WITH YOU
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
