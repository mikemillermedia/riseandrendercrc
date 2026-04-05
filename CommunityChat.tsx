import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'react-router-dom';
import { Heart, MessageCircle, Send, User, ImageIcon, X, AlertCircle } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CommunityChat({ user }: { user: any }) {
  const [searchParams] = useSearchParams();
  const targetPostId = searchParams.get('postId');
  
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Automatically open the comment section of the targeted post
  const [openCommentId, setOpenCommentId] = useState<string | null>(targetPostId);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchCurrentUserAvatar();
    }
  }, [user]);

  // Scroll to the post smoothly once loaded
  useEffect(() => {
    if (!loading && targetPostId) {
      setTimeout(() => {
        const element = document.getElementById(`post-${targetPostId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [loading, targetPostId]);

  const fetchCurrentUserAvatar = async () => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
    if (data) setCurrentUserAvatar(data.avatar_url);
  };

  const fetchPosts = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`*, profiles:user_id (first_name, last_name, avatar_url, instagram_url), post_likes (user_id), comments (*, profiles:user_id (first_name, last_name, avatar_url))`)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && !mediaFile) return; 
    setPosting(true);
    setError(null);
    let media_url = null;

    try {
      if (mediaFile) {
        const fileName = `${user.id}/${Math.random()}`;
        const { error: uploadError } = await supabase.storage.from('setups').upload(fileName, mediaFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('setups').getPublicUrl(fileName);
        media_url = publicUrl;
      }

      const { error: postError } = await supabase.from('posts').insert([{ user_id: user.id, content: newPost.trim(), media_url }]);
      if (postError) throw postError;

      setNewPost('');
      setMediaFile(null);
      setMediaPreview(null);
      await fetchPosts();
    } catch (err: any) {
      setError(err.message);
    }
    setPosting(false);
  };

  const toggleLike = async (postId: string, currentLikes: any[] = []) => {
    if (!user) return;
    const isLiked = currentLikes.some(like => like.user_id === user.id);
    try {
      if (isLiked) {
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }]);
      }
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const submitComment = async (postId: string) => {
    if (!commentText.trim() || !user) return;
    try {
      await supabase.from('comments').insert([{ post_id: postId, user_id: user.id, content: commentText.trim() }]);
      setCommentText('');
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading threads...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-20">
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3"><AlertCircle size={20} /><p className="text-sm">{error}</p></div>
      )}

      <div className="bg-[#131313] border border-[#F5F5F0]/10 p-6 rounded-2xl shadow-xl mb-8">
        <form onSubmit={handlePost} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
            {currentUserAvatar ? <img src={currentUserAvatar} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
          </div>
          <div className="flex-grow">
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Start a thread..." className="w-full bg-transparent border-none text-[#F5F5F0] focus:ring-0 text-lg placeholder:text-white/20 resize-none h-12" />
            {mediaPreview && <div className="mt-4 relative"><img src={mediaPreview} className="rounded-xl max-h-64 border border-white/10" /><button type="button" onClick={() => {setMediaFile(null); setMediaPreview(null);}} className="absolute top-2 right-2 bg-black/50 p-1 text-white rounded-full"><X size={14}/></button></div>}
            <div className="flex justify-between items-center mt-4">
               <label className="cursor-pointer text-white/40 hover:text-[#ff4d00] transition-colors p-2 -ml-2">
                 <ImageIcon size={20} /><input type="file" className="hidden" accept="image/*,video/*" onChange={e => {
                   if (e.target.files?.[0]) { setMediaFile(e.target.files[0]); setMediaPreview(URL.createObjectURL(e.target.files[0])); }
                 }} />
               </label>
               <button type="submit" disabled={posting} className="bg-[#F5F5F0] text-black px-6 py-1.5 rounded-full font-bold text-sm hover:bg-white transition-colors disabled:opacity-50">{posting ? 'Posting...' : 'Post'}</button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-0">
        {posts.map((post) => {
          const postLikes = post.post_likes || [];
          const postComments = post.comments || [];
          const isLiked = postLikes.some((l: any) => l.user_id === user?.id);
          const isTargeted = targetPostId === post.id;

          return (
            <div 
              key={post.id} 
              id={`post-${post.id}`} 
              className={`py-6 border-b border-white/5 transition-all duration-700 ${isTargeted ? 'bg-white/5 -mx-4 px-4 rounded-2xl border-transparent' : ''}`}
            >
              <div className="flex gap-4 px-2">
                <a href={post.profiles?.instagram_url || '#'} target={post.profiles?.instagram_url ? "_blank" : "_self"} className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 border-2 border-[#ff4d00]/50 hover:border-[#ff4d00] transition-colors flex items-center justify-center cursor-pointer">
                  {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                </a>

                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center">
                    <a href={post.profiles?.instagram_url || '#'} target={post.profiles?.instagram_url ? "_blank" : "_self"} className="group flex items-center gap-2 cursor-pointer">
                      <h3 className="font-bold text-sm text-white group-hover:text-[#ff4d00] transition-colors">{post.profiles?.first_name || 'Member'} {post.profiles?.last_name || ''}</h3>
                      {post.profiles?.instagram_url && <span className="text-xs text-white/30 group-hover:text-[#ff4d00]/70 transition-colors">@{post.profiles.instagram_url.split('.com/')[1]?.replace('/', '')}</span>}
                    </a>
                    <span className="text-xs text-white/30">{new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                  
                  <p className="text-[#F5F5F0]/90 mt-1 whitespace-pre-wrap">{post.content}</p>
                  {post.media_url && <img src={post.media_url} className="mt-3 rounded-xl border border-white/5 max-h-96 w-full object-contain bg-black/20" />}
                  
                  <div className="flex gap-6 mt-4 text-white/40">
                    <button onClick={() => toggleLike(post.id, postLikes)} className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}>
                      <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                      <span className="text-xs font-medium">{postLikes.length}</span>
                    </button>
                    <button onClick={() => setOpenCommentId(openCommentId === post.id ? null : post.id)} className={`flex items-center gap-1.5 hover:text-white transition-colors ${openCommentId === post.id ? 'text-white' : ''}`}>
                      <MessageCircle size={20} />
                      <span className="text-xs font-medium">{postComments.length}</span>
                    </button>
                  </div>

                  {openCommentId === post.id && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                      {postComments.map((c: any) => (
                        <div key={c.id} className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full bg-white/5 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                            {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={12} className="text-white/20" />}
                          </div>
                          <div className="bg-white/5 px-4 py-2 rounded-2xl flex-grow">
                            <p className="text-[10px] font-bold text-[#ff4d00] uppercase">{c.profiles?.first_name || 'Member'}</p>
                            <p className="text-sm text-white/80">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-2 pt-2">
                        <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment(post.id)} placeholder="Reply..." className="flex-grow bg-white/5 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-[#ff4d00] text-white" />
                        <button onClick={() => submitComment(post.id)} className="text-[#ff4d00] font-bold text-sm px-4 hover:text-white transition-colors">Reply</button>
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
