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
    <div className="w-full bg-[#FF5106] font-sans antialiased py-24 px-4">
      
      {/* MAIN GLASS CONTAINER */}
      <div className="max-w-5xl mx-auto bg-white/40 backdrop-blur-2xl rounded-[3rem] md:rounded-[5xl] p-8 md:p-20 shadow-2xl border border-white/20">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-6xl font-[900] uppercase tracking-tighter leading-none mb-8 text-[#111111]">
            COMMUNITY <span className="text-[#FF5106]">&</span> <span className="text-[#FF5106]">PRAYER WALL</span>
          </h2>
          <p className="text-zinc-800 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed opacity-80">
            Need us to come to you or want to build your authority remotely? Share a request today. 
            Special pricing is available for members in the Creatives Representing Christ (CRC) community.
          </p>
        </div>

        {/* TOGGLE BUTTON - Styled exactly like the "BOOK FREE CONSULTATION" button */}
        <div className="flex justify-center mb-12">
          <button 
            onClick={() => setIsWallOpen(!isWallOpen)}
            className="bg-[#111111] hover:bg-black text-white px-10 py-5 rounded-2xl text-xs md:text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-3"
          >
            {isWallOpen ? 'CLOSE PRAYER WALL' : 'VIEW COMMUNITY PRAYERS'}
            {isWallOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* ACCORDION CONTENT */}
        <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isWallOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          
          {/* SUBMISSION FORM */}
          <div className="bg-white/30 rounded-[2.5rem] p-8 md:p-12 mb-10">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto text-center">
              <input
                type="text"
                required
                placeholder="YOUR NAME"
                className="w-full bg-white/60 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-[#FF5106] outline-none font-bold uppercase tracking-widest text-xs"
                value={formData.author_name}
                onChange={(e) => setFormData({...formData, author_name: e.target.value})}
              />
              <textarea
                required
                rows="3"
                placeholder="HOW CAN WE PRAY FOR YOU?"
                className="w-full bg-white/60 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-[#FF5106] outline-none font-bold text-lg placeholder:opacity-50"
                value={formData.request_text}
                onChange={(e) => setFormData({...formData, request_text: e.target.value})}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FF5106] text-white px-12 py-5 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
              >
                {isSubmitting ? 'SENDING...' : 'SUBMIT REQUEST'}
              </button>
            </form>
          </div>

          {/* LIST OF PRAYERS */}
          <div className="space-y-4">
            {requests.map((prayer) => (
              <div key={prayer.id} className="bg-white/60 rounded-[2rem] p-8 transition-all hover:bg-white/80 group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#FF5106] text-[10px] font-black uppercase tracking-widest">
                    {prayer.author_name}
                  </span>
                  <span className="text-zinc-500 text-[10px] font-bold">
                    {new Date(prayer.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[#111111] text-xl md:text-2xl font-bold leading-tight tracking-tight">
                  "{prayer.request_text}"
                </p>
                <div className="mt-6 pt-4 border-t border-black/5 flex justify-end">
                  <button className="flex items-center gap-2 text-zinc-400 hover:text-[#FF5106] transition-colors font-black uppercase tracking-widest text-[10px]">
                    <Heart className="w-4 h-4 fill-current" />
                    I'M PRAYING
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
