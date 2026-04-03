import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Send, Heart, Quote } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PrayerWall() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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
    <div className="min-h-screen bg-white font-sans antialiased text-[#0D0D0D]">
      
      {/* --- SECTION 1: DARK FORM CARD --- */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto bg-[#0D0D0D] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
              PRAYER <span className="text-[#FF5106]">WALL</span>
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
              Need us to come to you? Share your heart and join our community of prayer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <input
              type="text"
              required
              placeholder="YOUR NAME"
              className="w-full bg-[#1A1A1A] text-white border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#FF5106] outline-none uppercase font-bold tracking-widest text-sm placeholder:text-zinc-600"
              value={formData.author_name}
              onChange={(e) => setFormData({...formData, author_name: e.target.value})}
            />
            <textarea
              required
              rows="4"
              placeholder="HOW CAN WE PRAY FOR YOU?"
              className="w-full bg-[#1A1A1A] text-white border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#FF5106] outline-none font-medium text-lg placeholder:text-zinc-600"
              value={formData.request_text}
              onChange={(e) => setFormData({...formData, request_text: e.target.value})}
            />
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FF5106] hover:bg-[#e64a05] text-white font-black uppercase tracking-widest px-10 py-5 rounded-2xl transition-all active:scale-95 shadow-lg shadow-[#FF5106]/20 disabled:opacity-50"
              >
                {isSubmitting ? 'SENDING...' : 'REQUEST PRAYER'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* --- SECTION 2: LIGHT PRAYER FEED --- */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto bg-[#F3F4F6] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 border border-zinc-100">
          <div className="text-center mb-12">
            <h2 className="text-[#0D0D0D] text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              COMMUNITY <span className="text-[#FF5106]">FEED</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <p className="text-center py-10 font-bold uppercase tracking-widest text-zinc-400">Loading Prayers...</p>
            ) : requests.length > 0 ? (
              requests.map((prayer) => (
                <div 
                  key={prayer.id} 
                  className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-200/50 hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Subtle Accent Line */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#FF5106] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className="bg-[#0D0D0D] text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                      {prayer.author_name}
                    </div>
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-zinc-800 text-xl md:text-2xl font-bold leading-tight tracking-tight mb-8 italic">
                    "{prayer.request_text}"
                  </p>
                  
                  <div className="pt-6 border-t border-zinc-50 flex justify-end">
                    <button className="flex items-center gap-2 text-zinc-300 hover:text-[#FF5106] transition-colors font-black uppercase tracking-tighter text-xs">
                      <Heart className="w-5 h-5 fill-current" />
                      I'M PRAYING
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/50 rounded-[2rem] border border-dashed border-zinc-300">
                <p className="text-zinc-400 font-bold uppercase tracking-widest">No requests yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
