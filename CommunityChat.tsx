import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, MessageCircle, Send, MoreHorizontal, User, ImageIcon, X } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CommunityChat({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchCurrentUserAvatar();
  }, []);

  const fetchCurrentUserAvatar = async () => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
    if (data) setCurrentUserAvatar(data.avatar_url);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (first_name, last_name, instagram_url, avatar_url),
        post_likes (user_id),
        comments (*, profiles (first_name, last_name, avatar_url))
      `)
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    setLoading(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && !mediaFile) return; 
    setPosting(true);
    let media_url = null;

    if (mediaFile) {
      const fileName = `chat_${user.id}_${Math.random()}`;
      const { error: uploadError } = await supabase.storage.from('setups').upload(fileName, mediaFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('setups').getPublicUrl(fileName);
        media_url = publicUrl;
      }
    }

    await supabase.from('posts').insert([{ user_id: user.id, content: newPost.trim(), media_url }]);
    setNewPost('');
    setMediaFile(null);
    setMediaPreview(null);
    fetchPosts();
    setPosting(false);
  };

  const toggleLike = async (postId: string, currentLikes: any[]) => {
    const isLiked = currentLikes.some(like => like.user_id === user.id);
    if (isLiked) {
      await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }]);
    }
    fetchPosts();
  };

  const submitComment = async (postId: string) => {
    if (!commentText.trim()) return;
    await supabase.from('comments').insert([{ post_id: postId, user_id: user.id, content: commentText.trim() }]);
    setCommentText('');
    fetchPosts();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-20">
      {/* Input Box Code (Existing) */}
      <div className="bg-[#131313] border border-[#F5F5F0]/10 p-6 rounded-2xl shadow-xl mb-8">
        <form onSubmit={handlePost} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden">
            {currentUserAvatar ? <img src={currentUserAvatar} className="w-full h-full object-cover" /> : <User className="p-2 text-white/20" />}
          </div>
          <div className="flex-grow">
            <input 
              value={newPost} 
              onChange={e => setNewPost(e.target.value)} 
              placeholder="Start a thread..." 
              className="w-full bg-transparent border-none text-[#F5F5F0] focus:ring-0 text-lg"
            />
            {mediaPreview && <img src={mediaPreview} className="mt-4 rounded-xl max-h-64" />}
            <div className="flex justify-between mt-4">
               <label className="cursor-pointer text-white/40 hover:text-[#ff4d00] transition-colors">
                 <ImageIcon size={20} /><input type="file" className="hidden" onChange={e => {
                   if (e.target.files?.[0]) {
                     setMediaFile(e.target.files[0]);
                     setMediaPreview(URL.createObjectURL(e.target.files[0]));
                   }
                 }} />
               </label>
               <button type="submit" className="bg-[#F5F5F0] text-black px-6 py-1.5 rounded-full font-bold text-sm">Post</button>
            </div>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-0">
        {posts.map((post) => {
          const isLiked = post.post_likes?.some((l: any) => l.user_id === user.id);
          return (
            <div key={post.id} className="py-6 border-b border-white/5">
              <div className="flex gap-4 px-2">
                <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
                  <img src={post.profiles?.avatar_url} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm">{post.profiles?.first_name} {post.profiles?.last_name}</h3>
                    <span className="text-xs text-white/30">Just now</span>
                  </div>
                  <p className="text-[#F5F5F0]/90 mt-1">{post.content}</p>
                  {post.media_url && <img src={post.media_url} className="mt-3 rounded-xl border border-white/5 max-h-96" />}
                  
                  {/* Action Bar */}
                  <div className="flex gap-6 mt-4 text-white/40">
                    <button onClick={() => toggleLike(post.id, post.post_likes)} className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}>
                      <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                      <span className="text-xs">{post.post_likes?.length || 0}</span>
                    </button>
                    <button onClick={() => setOpenCommentId(openCommentId === post.id ? null : post.id)} className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <MessageCircle size={20} />
                      <span className="text-xs">{post.comments?.length || 0}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {openCommentId === post.id && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                      {post.comments?.map((c: any) => (
                        <div key={c.id} className="flex gap-3 items-start">
                          <img src={c.profiles?.avatar_url} className="w-6 h-6 rounded-full object-cover" />
                          <div className="bg-white/5 p-3 rounded-2xl flex-grow">
                            <p className="text-xs font-bold">{c.profiles?.first_name}</p>
                            <p className="text-sm text-white/80">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input 
                          value={commentText} 
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="Reply..." 
                          className="flex-grow bg-white/5 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-[#ff4d00]"
                        />
                        <button onClick={() => submitComment(post.id)} className="text-[#ff4d00] font-bold text-sm px-2">Send</button>
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
