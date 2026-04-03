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
    // Background matches the light-grey/off-white of your reference image
    <div className="w-full bg-[#F3F3F1] font-sans antialiased py-24 md:py-32">
      
      {/* HEADER SECTION: Exact Font Match Style */}
      <div className="w-full px-6 text-center mb-16">
        <h2 className="text-5xl md:text-8xl font-[900] uppercase tracking-tighter leading-[0.8] text-[#111111] mb-10">
          Community<br />Prayer Wall
        </h2>
        <div className="max-w-4xl mx-auto">
          <p className="text-[#333333] text-xl md:text-2xl font-medium leading-relaxed tracking-tight">
            We want to pray for you. Fill out the form below and we will post it anonymously for the community to lift you up in agreement.
          </p>
        </div>
      </div>

      {/* ACTION: Minimalist Toggle */}
      <div className="flex justify-center mb-20">
        <button 
          onClick={() => setIsWallOpen(!isWallOpen)}
          className="group flex items-center justify-center gap-4 bg-[#111111] hover:bg-black text-white px-12 py-6 rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95"
        >
          {isWallOpen ? 'CLOSE WALL' : 'VIEW COMMUNITY PRAYERS'}
          {isWallOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* THE WALL: Full Width Masonry */}
      <div className={`w-full overflow-hidden transition-all duration-1000 ease-in-out ${isWallOpen ? 'max-h-[20000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        
        {/* SUBMISSION AREA */}
        <div className="max-w-3xl mx-auto px-6 mb-24">
          <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-zinc-200/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="YOUR NAME (OPTIONAL)"
                className="w-full bg-[#F3F3F1] border-none rounded-xl py-5 px-8 focus:ring-2 focus:ring-[#FF5106] outline-none font-black tracking-[0.2em] text-[10px] placeholder:text-zinc-400 text-[#111111]"
                value={formData.author_name}
                onChange={(e) => setFormData({...formData, author_name: e.target.value})}
              />
              <textarea
                required
                rows="4"
                placeholder="HOW CAN WE PRAY FOR YOU?"
                className="w-full bg-[#F3F3F1] border-none rounded-xl py-5 px-8 focus:ring-2 focus:ring-[#FF5106] outline-none font-bold text-lg placeholder:text-zinc-400 text-[#111111] resize-none"
                value={formData.request_text}
                onChange={(e) => setFormData({...formData, request_text: e.target.value})}
              />
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF5106] text-white px-14 py-5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-lg"
                >
                  {isSubmitting ? 'POSTING...' : 'POST PRAYER'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* FEED: 3-Column Masonry (Authentic & Smaller) */}
        <div className="w-full px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-40">
          {loading ? (
            <div className="col-span-full text-center py-20 text-zinc-400 font-black uppercase tracking-widest text-xs">Loading Feed...</div>
          ) : requests.length > 0 ? (
            requests.map((prayer) => (
              <div key={prayer.id} className="bg-white border border-zinc-200/40 p-8 rounded-[2rem] hover:shadow-xl hover:shadow-black/5 transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-zinc-400 text-[9px] font-black uppercase tracking-[0.2em]">
                      {prayer.author_name || "Anonymous"}
                    </span>
                    <span className="text-zinc-300 text-[9px] font-bold">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Smaller, more genuine font size */}
                  <p className="text-[#444444] text-sm md:text-base font-medium leading-relaxed mb-8">
                    "{prayer.request_text}"
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                  <button className="group flex items-center gap-2 text-zinc-300 hover:text-[#FF5106] transition-colors duration-300 text-[10px] font-black uppercase tracking-widest">
                    <Heart className="w-4 h-4 group-hover:fill-[#FF5106] transition-all stroke-[2.5px]" />
                    Staying in Prayer
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-zinc-300 font-black uppercase tracking-widest text-xs italic opacity-50">The wall is currently waiting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
