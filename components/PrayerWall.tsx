import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Send, Heart, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PrayerWall() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWallOpen, setIsWallOpen] = useState(false); // Controls the entire section
  const [formData, setFormData] = useState({ author_name: '', request_text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRequests(data);
    } catch (error) {
      console.error('Error fetching prayers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.author_name || !formData.request_text) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .insert([{ 
            author_name: formData.author_name, 
            request_text: formData.request_text 
        }]);

      if (error) throw error;
      setFormData({ author_name: '', request_text: '' });
      fetchRequests();
    } catch (error) {
      alert('Error sharing prayer request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#0D0D0D] font-sans antialiased text-white pb-10">
      
      {/* --- MAIN ACCORDION TRIGGER --- */}
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => setIsWallOpen(!isWallOpen)}
          className="group flex items-center justify-between w-full bg-[#141414] hover:bg-[#1A1A1A] text-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] transition-all border border-transparent active:scale-[0.99] shadow-2xl"
        >
          <div className="text-left">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none italic">
              COMMUNITY <span className="text-[#FF5106] not-italic">PRAYER WALL</span>
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mt-2">
              {isWallOpen ? 'CLOSE SECTION' : 'SHARE A REQUEST & VIEW OTHERS'}
            </p>
          </div>
          <div className="bg-[#0D0D0D] p-4 rounded-full border border-zinc-800 group-hover:border-[#FF5106] transition-colors">
            {isWallOpen ? <ChevronUp className="w-6 h-6 text-[#FF5106]" /> : <PlusCircle className="w-6 h-6 text-[#FF5106]" />}
          </div>
        </button>
      </div>

      {/* --- ACCORDION CONTENT (FORM + FEED) --- */}
      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isWallOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        
        {/* --- FORM SECTION --- */}
        <section className="max-w-4xl mx-auto px-4 pt-12 pb-6">
          <div className="bg-[#141414] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 border border-transparent">
            <div className="text-center mb-10">
              <h3 className="text-white text-xl md:text-3xl font-black uppercase tracking-tighter mb-4">
                HOW CAN WE <span className="text-[#FF5106]">PRAY FOR YOU?</span>
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
              <input
                type="text"
                required
                placeholder="YOUR NAME"
                className="w-full bg-[#0D0D0D] text-white border border-transparent rounded-2xl py-5 px-6 focus:ring-1 focus:ring-[#FF5106] outline-none uppercase font-black tracking-widest text-[10px] placeholder:text-zinc-700 transition-all"
                value={formData.author_name}
                onChange={(e) => setFormData({...formData, author_name: e.target.value})}
              />
              <textarea
                required
                rows="3"
                placeholder="SHARE YOUR HEART..."
                className="w-full bg-[#0D0D0D] text-white border border-transparent rounded-2xl py-5 px-6 focus:ring-1 focus:ring-[#FF5106] outline-none font-medium text-lg placeholder:text-zinc-700 transition-all resize-none"
                value={formData.request_text}
                onChange={(e) => setFormData({...formData, request_text: e.target.value})}
              />
              <div className="text-center pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF5106] hover:bg-[#FF6A2B] text-white font-black uppercase tracking-[0.2em] text-[10px] px-12 py-5 rounded-full transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'SENDING...' : 'SUBMIT TO WALL'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* --- COMMUNITY FEED SECTION --- */}
        <section className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 px-8 mb-6">
              <div className="h-[1px] flex-grow bg-zinc-900"></div>
              <span className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Recent Prayers</span>
              <div className="h-[1px] flex-grow bg-zinc-900"></div>
            </div>

            {loading ? (
              <p className="text-center py-10 font-black text-zinc-800 text-xs tracking-widest uppercase">Fetching...</p>
            ) : requests.length > 0 ? (
              requests.map((prayer) => (
                <div 
                  key={prayer.id} 
                  className="bg-[#141414] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border border-transparent hover:bg-[#181818] transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#FF5106] text-[10px] font-black uppercase tracking-[0.3em]">
                      {prayer.author_name}
                    </span>
                    <span className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-zinc-300 text-lg md:text-2xl font-bold leading-tight tracking-tight italic">
                    "{prayer.request_text}"
                  </p>
                  
                  <div className="mt-8 flex justify-end">
                    <button className="flex items-center gap-2 text-zinc-600 hover:text-[#FF5106] transition-colors font-black uppercase tracking-widest text-[9px]">
                      <Heart className="w-4 h-4 fill-current" />
                      PRAYING
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-zinc-800 font-black uppercase tracking-widest text-xs italic">The wall is currently quiet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
