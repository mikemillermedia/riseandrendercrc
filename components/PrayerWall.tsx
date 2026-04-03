import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, Plus, X, MessageSquare } from 'lucide-react';

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
    <div className="w-full bg-white font-sans antialiased py-20 md:py-32 border-t border-zinc-100">
      
      {/* HEADER: Minimalist & Clean */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 mb-6">
          Community <span className="font-serif italic text-zinc-400">Prayer Wall</span>
        </h2>
        <div className="space-y-3">
            <p className="text-zinc-600 text-lg md:text-xl font-medium tracking-tight">
                We want to pray for you.
            </p>
            <p className="text-zinc-400 text-sm md:text-base font-normal italic">
                This will be posted anonymously.
            </p>
        </div>
      </div>

      {/* ACTION: Understated Toggle */}
      <div className="flex justify-center mb-20">
        <button 
          onClick={() => setIsWallOpen(!isWallOpen)}
          className="group flex items-center justify-center gap-3 bg-zinc-900 hover:bg-black text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shadow-sm"
        >
          {isWallOpen ? 'Close Wall' : 'View Community Prayers'}
          {isWallOpen ? <X className="w-3 h-3 text-zinc-400" /> : <Plus className="w-3 h-3 text-zinc-400" />}
        </button>
      </div>

      {/* THE WALL: Wide & Responsive Grid */}
      <div className={`w-full overflow-hidden transition-all duration-1000 ease-in-out ${isWallOpen ? 'max-h-[15000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        
        {/* SUBMISSION: Clean Glass-like over White */}
        <div className="max-w-3xl mx-auto px-6 mb-24">
          <div className="bg-zinc-50/50 rounded-[2.5rem] p-8 md:p-12 border border-zinc-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="YOUR NAME (OPTIONAL)"
                className="w-full bg-white border border-zinc-200 rounded-xl py-4 px-6 focus:ring-1 focus:ring-zinc-400 outline-none font-medium tracking-widest text-[10px] placeholder:text-zinc-300 text-zinc-700 transition-all"
                value={formData.author_name}
                onChange={(e) => setFormData({...formData, author_name: e.target.value})}
              />
              
              <textarea
                required
                rows="4"
                placeholder="HOW CAN THE COMMUNITY PRAY FOR YOU?"
                className="w-full bg-white border border-zinc-200 rounded-xl py-4 px-6 focus:ring-1 focus:ring-zinc-400 outline-none font-normal text-base placeholder:text-zinc-300 text-zinc-600 resize-none leading-relaxed"
                value={formData.request_text}
                onChange={(e) => setFormData({...formData, request_text: e.target.value})}
              />
              
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-zinc-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-all disabled:opacity-30"
                >
                  {isSubmitting ? 'SENDING...' : 'POST PRAYER'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* FEED: Multi-column Masonry style for an 'Authentic' look */}
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
          {loading ? (
            <div className="col-span-full text-center py-20 text-zinc-300 font-medium tracking-widest text-xs">REFRESHING FEED...</div>
          ) : requests.length > 0 ? (
            requests.map((prayer) => (
              <div key={prayer.id} className="bg-white border border-zinc-100 p-8 rounded-3xl hover:border-zinc-200 hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest">
                      {prayer.author_name || "Anonymous"}
                    </span>
                    <span className="text-zinc-300 text-[9px] font-medium tracking-tighter">
                      {new Date(prayer.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-zinc-600 text-base md:text-lg font-normal leading-relaxed mb-8 serif">
                    "{prayer.request_text}"
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                  <button className="group flex items-center gap-2 text-zinc-300 hover:text-rose-400 transition-colors duration-300 text-[9px] font-bold uppercase tracking-widest">
                    <Heart className="w-3.5 h-3.5 group-hover:fill-rose-400 transition-all stroke-[2.5px]" />
                    Praying
                  </button>
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-100" />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 border border-dashed border-zinc-100 rounded-3xl">
              <p className="text-zinc-300 font-medium uppercase tracking-widest text-xs italic">The wall is quiet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
