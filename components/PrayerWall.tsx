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
    /* w-screen + relative + left-1/2 -translate-x-1/2 forces it to break out of any parent container to be full screen width */
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#F3F3F1] py-24 md:py-40 px-4 md:px-10">
      
      {/* HEADER SECTION: Extreme Bold Typography */}
      <div className="w-full text-center mb-20">
        <h2 className="text-[12vw] md:text-[9vw] font-[1000] uppercase tracking-[-0.05em] leading-[0.8] text-[#111111] mb-12">
          COMMUNITY<br />PRAYER WALL
        </h2>
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#333333] text-xl md:text-3xl font-medium leading-tight tracking-tight">
            We Want to pray for you. <br className="hidden md:block" />
            <span className="opacity-60 text-lg md:text-xl font-normal italic">This will be posted anonymously.</span>
          </p>
        </div>
      </div>

      {/* TOGGLE: The Black Action Button */}
      <div className="flex justify-center mb-24">
        <button 
          onClick={() => setIsWallOpen(!isWallOpen)}
          className="group flex items-center justify-center gap-6 bg-[#111111] hover:bg-black text-white px-16 py-7 rounded-2xl text-xs md:text-sm font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95"
        >
          {isWallOpen ? 'CLOSE WALL' : 'VIEW COMMUNITY PRAYERS'}
          {isWallOpen ? <X className="w-5 h-5 text-[#FF5106]" /> : <Plus className="w-5 h-5 text-[#FF5106]" />}
        </button>
      </div>

      {/* ACCORDION CONTENT */}
      <div className={`w-full overflow-hidden transition-all duration-1000 ease-in-out ${isWallOpen ? 'max-h-[20000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        
        {/* SUBMISSION FORM: Clean & Minimal */}
        <div className="max-w-3xl mx-auto px-6 mb-32">
          <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="YOUR NAME (OPTIONAL)"
                className="w-full bg-[#F3F3F1] border-none rounded-2xl py-6 px-8 focus:ring-2 focus:ring-[#FF5106] outline-none font-black tracking-[0.2em] text-[10px] placeholder:text-zinc-400 text-[#111111]"
                value={formData.author_name}
                onChange={(e) => setFormData({...formData, author_name: e.target.value})}
              />
              <textarea
                required
                rows="4"
                placeholder="HOW CAN THE COMMUNITY PRAY FOR YOU?"
                className="w-full bg-[#F3F3F1] border-none rounded-2xl py-6 px-8 focus:ring-2 focus:ring-[#FF5106] outline-none font-bold text-lg placeholder:text-zinc-400 text-[#111111] resize-none"
                value={formData.request_text}
                onChange={(e) => setFormData({...formData, request_text: e.target.value})}
              />
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF5106] text-white px-16 py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                >
                  {isSubmitting ? 'POSTING...' : 'POST PRAYER'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* FEED: High-Density Authentic Masonry */}
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-40">
          {loading ? (
            <div className="col-span-full text-center py-20 text-zinc-400 font-black uppercase tracking-[0.4em] text-[10px]">Updating Feed...</div>
          ) : requests.length > 0 ? (
            requests.map((prayer) => (
              <div key={prayer.id} className="bg-white border border-zinc-200/30 p-10 rounded-[2.5rem] hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[#FF5106] text-[10px] font-black uppercase tracking-[0.2em]">
                      {prayer.author_name || "Anonymous"}
                    </span>
                    <span className="text-zinc-300 text-[10px] font-bold uppercase">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Subtle, authentic font size for the message */}
                  <p className="text-[#444444] text-sm md:text-[15px] font-medium leading-relaxed tracking-tight mb-8">
                    "{prayer.request_text}"
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-8 border-t border-zinc-50">
                  <button className="flex items-center gap-3 text-zinc-300 hover:text-[#FF5106] transition-colors duration-300 text-[10px] font-black uppercase tracking-widest">
                    <Heart className="w-4 h-4 hover:fill-[#FF5106] transition-all stroke-[2.5px]" />
                    Agreement
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 border border-dashed border-zinc-200 rounded-[3rem]">
              <p className="text-zinc-300 font-black uppercase tracking-[0.3em] text-[10px] italic">Wall is silent</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
