import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, MessageCircle, Send, MoreHorizontal, User } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CommunityChat({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // Fetch posts when the tab opens
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    // This magic syntax pulls the post AND the author's profile info at the same time!
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (first_name, last_name, instagram_url, setup_image_url)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    setLoading(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);

    const { error } = await supabase.from('posts').insert([
      { user_id: user.id, content: newPost.trim() }
    ]);

    if (!error) {
      setNewPost('');
      fetchPosts(); // Refresh the feed instantly
    }
    setPosting(false);
  };

  // Helper to format the date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">Community Chat</h1>
      <p className="text-[#F5F5F0]/60 mb-8">Connect, collaborate, and share with the CRC family.</p>

      {/* Threads-style Input Box */}
      <div className="bg-[#131313] border border-[#F5F5F0]/10 p-4 md:p-6 rounded-2xl shadow-xl mb-8">
        <form onSubmit={handlePost} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0 border border-[#F5F5F0]/10 flex items-center justify-center overflow-hidden">
            <User size={20} className="text-[#F5F5F0]/40" />
          </div>
          <div className="flex-grow flex flex-col">
            <input 
              type="text"
              placeholder="Start a thread..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full bg-transparent border-none text-[#F5F5F0] placeholder:text-[#F5F5F0]/40 focus:outline-none focus:ring-0 text-base md:text-lg pt-1.5"
            />
            <div className="flex justify-end mt-4">
              <button 
                type="submit" 
                disabled={posting || !newPost.trim()}
                className="bg-[#F5F5F0] text-[#131313] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white font-bold py-1.5 px-5 rounded-full text-sm transition-colors"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* The Feed */}
      <div className="space-y-0">
        {loading ? (
           <div className="text-[#F5F5F0]/60 animate-pulse text-center py-12">Loading threads...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="flex gap-3 md:gap-4 py-5 border-b border-[#F5F5F0]/10 hover:bg-white/[0.02] px-2 transition-colors -mx-2 rounded-xl">
              
              {/* Avatar Column */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0 border border-[#F5F5F0]/10 flex items-center justify-center overflow-hidden">
                  {post.profiles?.setup_image_url ? (
                     <img src={post.profiles.setup_image_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-[#F5F5F0]/40" />
                  )}
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-grow min-w-0">
                <div className="flex items-baseline justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm md:text-base leading-none">
                      {post.profiles?.first_name || 'CRC'} {post.profiles?.last_name || 'Member'}
                    </h3>
                    {post.profiles?.instagram_url && (
                       <span className="text-xs text-[#F5F5F0]/40 hidden md:inline">
                         @{post.profiles.instagram_url.split('/').filter(Boolean).pop()}
                       </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[#F5F5F0]/40 text-xs">
                    <span>{formatDate(post.created_at)}</span>
                    <button className="hover:text-white transition-colors"><MoreHorizontal size={16} /></button>
                  </div>
                </div>

                <p className="text-[#F5F5F0]/90 text-sm md:text-base mt-1 whitespace-pre-wrap break-words leading-relaxed">
                  {post.content}
                </p>

                {/* Threads Action Icons */}
                <div className="flex gap-5 mt-3 text-[#F5F5F0]/40">
                  <button className="hover:text-[#ff4d00] hover:bg-[#ff4d00]/10 p-1.5 rounded-full transition-all"><Heart size={18} /></button>
                  <button className="hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"><MessageCircle size={18} /></button>
                  <button className="hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"><Send size={18} /></button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="text-[#F5F5F0]/60 border border-dashed border-[#F5F5F0]/20 p-12 rounded-2xl text-center">
            No threads yet. Be the first to start a conversation!
          </div>
        )}
      </div>
    </div>
  );
}
