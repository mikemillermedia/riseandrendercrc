import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Send, Heart, Quote, } from 'lucide-react';

// Replace these with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PrayerWall() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ author_name: '', request_text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Requests
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

  // 2. Handle Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.author_name || !formData.request_text) return;

    setIsSubmitting(true);
    try {
      // Inserting data MUST match your table columns:
const { error } = await supabase
  .from('prayer_requests')
  .insert([{ author_name: myNameVariable, request_text: myRequestVariable }]);

      if (error) throw error;
      
      setFormData({ author_name: '', request_text: '' });
      fetchRequests(); // Refresh list
    } catch (error) {
      alert('Error sharing prayer request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-medium text-slate-800 mb-2">Prayer Wall</h1>
          <p className="text-slate-500 italic">"Bear one another's burdens, and so fulfill the law of Christ."</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-16 transition-all hover:shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Your Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="John D."
                value={formData.author_name}
                onChange={(e) => setFormData({...formData, author_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">How can we pray for you?</label>
              <textarea
                required
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Share your heart..."
                value={formData.request_text}
                onChange={(e) => setFormData({...formData, request_text: e.target.value})}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sharing...' : (
                <>
                  Share Request <Send className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prayers Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-slate-400 py-10 text-lg">Loading prayers...</div>
          ) : requests.length > 0 ? (
            requests.map((prayer) => (
              <div 
                key={prayer.id} 
                className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
              >
                {/* Decorative Quote Icon */}
                <Quote className="absolute -top-2 -right-2 w-12 h-12 text-slate-50 group-hover:text-indigo-50 transition-colors" />
                
                <div className="relative">
                  <p className="text-slate-700 leading-relaxed mb-6 font-light text-lg italic">
                    "{prayer.request_text}"
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                    <div>
                      <p className="font-semibold text-slate-800">{prayer.author_name}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">
                        {new Date(prayer.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <button className="flex items-center space-x-1 text-slate-300 hover:text-rose-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">Praying</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400">No prayer requests shared yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
