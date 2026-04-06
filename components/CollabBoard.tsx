import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, Send, User, Trash2, Mail } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CollabBoard({ user }: { user: any }) {
  const [, setSearchParams] = useSearchParams();
  const [collabs, setCollabs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchCollabs();
  }, []);

  const fetchCollabs = async () => {
    const { data } = await supabase
      .from('collabs')
      .select('*, profiles:user_id(first_name, last_name, avatar_url, instagram_url)')
      .order('created_at', { ascending: false });
    
    if (data) setCollabs(data);
    setLoading(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    setPosting(true);
    await supabase.from('collabs').insert([{ 
      user_id: user.id, 
      title: title.trim(),
      description: description.trim() 
    }]);
      
    setTitle('');
    setDescription('');
    fetchCollabs();
    setPosting(false);
  };

  const deleteCollab = async (collabId: string) => {
    if (!window.confirm("Delete this collab request?")) return;
    await supabase.from('collabs').delete().eq('id', collabId);
    fetchCollabs();
  };

  if (loading) return <div className="text-white/40">Loading Collab Board...</div>;

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl shadow-xl">
        <h2 className="text-[#ff4d00] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Briefcase size={18} /> Post a Collab
        </h2>
        <form onSubmit={handlePost} className="space-y-4">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you looking for? (e.g. Need a Podcast Editor)" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4d00]"
          />
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about the project, your budget, or skills needed..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff4d00] h-24 resize-none"
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={posting || !title.trim() || !description.trim()}
              className="bg-[#ff4d00] hover:bg-orange-500 text-white font-bold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} /> {posting ? 'Posting...' : 'Post Gig'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {collabs.map((collab) => {
          const isMyPost = user?.id === collab.user_id;

          return (
            <div key={collab.id} className="bg-[#1A1A1A] border border-white/5 p-6 rounded-2xl shadow-xl hover:border-[#ff4d00]/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setSearchParams({ tab: 'activity', viewUser: collab.user_id })}>
                  <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-black flex items-center justify-center flex-shrink-0">
                    {collab.profiles?.avatar_url ? <img src={collab.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-[#ff4d00] transition-colors">
                      {collab.profiles?.first_name} {collab.profiles?.last_name}
                    </h3>
                    <p className="text-xs text-white/40">{new Date(collab.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {isMyPost && (
                  <button onClick={() => deleteCollab(collab.id)} className="text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <h4 className="text-lg font-bold text-white mb-2">{collab.title}</h4>
              <p className="text-[#F5F5F0]/80 leading-relaxed whitespace-pre-wrap text-sm mb-6">
                {collab.description}
              </p>
              
              {!isMyPost && (
                <div className="border-t border-white/5 pt-4">
                  <button 
                    onClick={() => setSearchParams({ tab: 'messages', userId: collab.user_id })}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Mail size={16} /> Message {collab.profiles?.first_name}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
