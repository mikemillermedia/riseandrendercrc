import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, User, Trash2, Mail, MessageCircle, Share2 } from 'lucide-react';

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
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  // New Reply & Share States
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCollabs();
      fetchCurrentUserAvatar();
    }
  }, [user]);

  const fetchCurrentUserAvatar = async () => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
    if (data) setCurrentUserAvatar(data.avatar_url);
  };

  const fetchCollabs = async () => {
    // Fetch collabs AND their associated comments
    const { data } = await supabase
      .from('collabs')
      .select('*, profiles:user_id(first_name, last_name, avatar_url, instagram_url), collab_comments(*, profiles:user_id(first_name, last_name, avatar_url))')
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

  const submitComment = async (collabId: string) => {
    if (!commentText.trim() || !user) return;
    try {
      await supabase.from('collab_comments').insert([{ collab_id: collabId, user_id: user.id, content: commentText.trim() }]);
      setCommentText('');
      fetchCollabs();
    } catch (e) { console.error(e); }
  };

  const handleShare = async (collabId: string) => {
    const url = `${window.location.origin}/hub?tab=collabs&collabId=${collabId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(collabId);
      setTimeout(() => setCopiedId(null), 2000); 
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading Collab Board...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-32 animate-in fade-in duration-500">
      
      {/* FLATTENED COMPOSER BOX */}
      <div className="border-b border-white/10 pb-6 mb-2 relative">
        <div className="flex items-center gap-2 mb-4 text-[#ff4d00] font-bold uppercase tracking-widest text-xs">
          <Briefcase size={14} /> Post a Collab
        </div>
        
        <form onSubmit={handlePost} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center mt-1 border border-white/5">
            {currentUserAvatar ? <img src={currentUserAvatar} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
          </div>
          
          <div className="flex-grow pt-1">
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you looking for? (e.g. Need a Video Editor)" 
              className="w-full bg-transparent border-none font-bold text-[#F5F5F0] focus:ring-0 text-base placeholder:text-white/40 p-0 mb-1"
            />
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about the project, your budget, or skills needed..." 
              className="w-full bg-transparent border-none text-[#F5F5F0]/80 focus:ring-0 text-[15px] placeholder:text-white/30 resize-none min-h-[40px] p-0"
              rows={description.split('\n').length > 2 ? description.split('\n').length : 2}
            />
            
            <div className="flex justify-end items-center mt-3 pt-2">
              <button 
                type="submit" 
                disabled={posting || !title.trim() || !description.trim()}
                className="bg-white text-black px-5 py-1.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-30"
              >
                {posting ? 'Posting' : 'Post Gig'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* FLATTENED COLLABS FEED */}
      <div className="flex flex-col">
        {collabs.map((collab) => {
          const isMyPost = user?.id === collab.user_id;
          const comments = collab.collab_comments || [];

          return (
            <div key={collab.id} className="py-4 border-b border-white/10 transition-colors">
              <div className="flex gap-4">
                
                {/* The "Thread Line" Column */}
                <div className="flex flex-col items-center">
                  <div 
                    onClick={() => setSearchParams({ tab: 'activity', viewUser: collab.user_id })}
                    className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer relative z-10 hover:border hover:border-white/20 transition-all"
                  >
                    {collab.profiles?.avatar_url ? <img src={collab.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                  </div>
                  {/* Vertical line connecting avatar to comments below */}
                  {openCommentId === collab.id && (
                     <div className="w-[1px] flex-grow bg-white/10 my-2" />
                  )}
                </div>

                <div className="flex-grow min-w-0 pb-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <div 
                      className="group flex items-center gap-1.5 cursor-pointer"
                      onClick={() => setSearchParams({ tab: 'activity', viewUser: collab.user_id })}
                    >
                      <h3 className="font-bold text-sm text-white hover:underline">
                        {collab.profiles?.first_name} {collab.profiles?.last_name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-white/40">{new Date(collab.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      {isMyPost && (
                        <button onClick={() => deleteCollab(collab.id)} className="text-white/20 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="text-[15px] font-bold text-[#ff4d00] mb-1">{collab.title}</h4>
                  <p className="text-[#F5F5F0]/90 text-[15px] mb-3 whitespace-pre-wrap leading-relaxed">
                    {collab.description}
                  </p>
                  
                  {/* THREADS STYLE INTERACTION ROW */}
                  <div className="flex items-center gap-6 mt-1 text-white/40">
                    <button 
                      onClick={() => setOpenCommentId(openCommentId === collab.id ? null : collab.id)} 
                      className={`flex items-center gap-1.5 hover:text-white transition-colors group ${openCommentId === collab.id ? 'text-white' : ''}`}
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-white/10 transition-colors -ml-1.5">
                        <MessageCircle size={16} />
                      </div>
                      {comments.length > 0 && <span className="text-[13px]">{comments.length}</span>}
                    </button>

                    {!isMyPost && (
                      <button 
                        onClick={() => setSearchParams({ tab: 'messages', userId: collab.user_id })}
                        className="flex items-center gap-1.5 hover:text-[#ff4d00] transition-colors group"
                        title="Direct Message"
                      >
                        <div className="p-1.5 rounded-full group-hover:bg-[#ff4d00]/10 transition-colors -ml-1.5">
                          <Mail size={16} />
                        </div>
                      </button>
                    )}

                    <button onClick={() => handleShare(collab.id)} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group relative" title="Share Collab">
                      <div className="p-1.5 rounded-full group-hover:bg-blue-400/10 transition-colors -ml-1.5">
                        <Share2 size={16} />
                      </div>
                      {copiedId === collab.id && (
                        <span className="absolute -top-6 -left-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded">Copied!</span>
                      )}
                    </button>
                  </div>

                  {/* FLATTENED COMMENTS SECTION */}
                  {openCommentId === collab.id && (
                    <div className="mt-3 space-y-4 relative animate-in fade-in slide-in-from-top-2">
                      {comments.map((c: any) => (
                        <div key={c.id} className="flex gap-3 items-start pt-2">
                          <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="text-white/20" />}
                          </div>
                          <div className="flex-grow pt-1">
                            <p className="text-[13px] font-bold text-white mb-0.5">{c.profiles?.first_name || 'Member'}</p>
                            <p className="text-[14px] text-white/80 leading-snug">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-3 items-center pt-3 mt-2 border-t border-white/5">
                        <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {currentUserAvatar ? <img src={currentUserAvatar} className="w-full h-full object-cover" /> : <User size={14} className="text-white/20" />}
                        </div>
                        <input 
                          value={commentText} 
                          onChange={(e) => setCommentText(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && submitComment(collab.id)} 
                          placeholder={`Reply to ${collab.profiles?.first_name || 'Member'}...`} 
                          className="flex-grow bg-transparent border-none text-[14px] text-white focus:ring-0 p-0 placeholder:text-white/30" 
                        />
                        <button 
                          onClick={() => submitComment(collab.id)} 
                          disabled={!commentText.trim()} 
                          className="text-[#ff4d00] font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
