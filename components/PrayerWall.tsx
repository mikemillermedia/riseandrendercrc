import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Send, Heart, ChevronDown, ChevronUp } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PrayerWall() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // Controls the dropdown
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
      setIsOpen(true); // Open the list automatically after posting
    } catch (error) {
      alert('Error sharing prayer request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans antialiased text-white pb-20">
      
      {/* --- FORM SECTION (Dark Hero Card) --- */}
      <section className="px-4 pt-12 pb-6">
        <div className="max-w-4xl mx-auto bg-[#141414] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 shadow-2xl border-none">
          <div className="text-center mb-10">
            <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none italic">
              PRAYER <span className="text-[#FF5106] not-italic">WALL</span>
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed font-medium">
              Join the Creatives Representing Christ (CRC) community in lifting each other up.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <input
              type="text"
              required
              placeholder="YOUR NAME"
              className="w-full bg-[#0D0D0D] text-white border-none rounded-2xl py-5 px-6 focus:ring-2 focus:ring-[#FF5106] outline-none uppercase font-black tracking-widest text-xs placeholder:text-zinc-700 transition-all"
              value={formData.author_name}
              onChange={(e) => setFormData({...formData, author_name: e.target.value})}
            />
            <textarea
              required
              rows="4"
              placeholder="HOW CAN WE PRAY FOR YOU?"
              className="w-full bg-[#0D0D0D] text-white border-none rounded-2xl py-5 px-6 focus:ring-2 focus:ring-[#FF5106] outline-none font-medium text-lg placeholder:text-zinc-700 transition-all"
              value={formData.request_text}
              onChange={(e) => setFormData({...formData, request_text: e.target.value})}
            />
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FF5106] hover:bg-[#FF6A2B] text-white font-black uppercase tracking-[0.2em] text-xs px-12 py-6 rounded-2xl transition-all active:scale-95 shadow-xl shadow-[#FF5106]/10 disabled:opacity-50"
              >
                {isSubmitting ? 'SENDING...' : 'REQUEST PRAYER'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* --- DROPDOWN TOGGLE BUTTON --- */}
      <div className="max-w-4xl mx-auto px-4 mt-8 text-center">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center justify-center gap-4 w-full md:w-auto mx-auto bg-[#141414] hover:bg-[#1A1A1A] text-white font-black uppercase tracking-[0.2em] text-[10px] px-10 py-6 rounded-full transition-all border border-zinc-800/50"
        >
          {isOpen ? 'CLOSE PRAYER WALL' : 'VIEW COMMUNITY PRAYERS'}
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#FF5106]" /> : <ChevronDown className="w-4 h-4 text-[#FF5106]" />}
        </button>
      </div>

      {/* --- COMMUNITY FEED (Dropdown Content) --- */}
      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <section className="px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-4">
            {loading ? (
              <p className="text-center py-10 font-black uppercase tracking-widest text-zinc-600 text-xs italic">Loading...</p>
            ) : requests.length > 0 ? (
              requests.map((prayer) => (
                <div 
                  key={prayer.id} 
                  className="bg-[#141414] rounded-[2rem] p-8 border border-zinc-900/50 hover:border-[#FF5106]/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[#FF5106] text-[10px] font-black uppercase tracking-[0.3em]">
                      {prayer.author_name}
                    </span>
                    <span className="text-zinc-600 text-[10px] font-bold uppercase">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-zinc-200 text-xl md:text-2xl font-bold leading-tight tracking-tight italic mb-8">
                    "{prayer.request_text}"
                  </p>
                  
                  <div className="flex justify-start">
                    <button className="flex items-center gap-2 text-zinc-500 hover:text-[#FF5106] transition-colors font-black uppercase tracking-widest text-[9px]">
                      <Heart className="w-4 h-4 fill-current" />
                      STAYING IN PRAYER
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-[#141414] rounded-[2rem] border border-dashed border-zinc-800">
                <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No community requests yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
