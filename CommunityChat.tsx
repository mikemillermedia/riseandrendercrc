import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'react-router-dom';
import { Heart, MessageCircle, Send, User, ImageIcon, X, AlertCircle, Share2, Repeat } from 'lucide-react';

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
  const [openCommentId, setOpenCommentId] = useState<string | null>(targetPostId);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [repostTarget, setRepostTarget] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchCurrentUserAvatar();
    }
  }, [user]);

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
        .select(`
          *, 
          profiles:user_id (first_name, last_name, avatar_url, instagram_url), 
          post_likes (user_id), 
          comments (*, profiles:user_id (first_name, last_name, avatar_url)),
          original_post:original_post_id (
            id, content, media_url, created_at,
            profiles:user_id (first_name, last_name, avatar_url, instagram_url)
          )
        `)
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
    if (!newPost.trim() && !mediaFile && !repostTarget) return; 
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

      // 1. Insert the post and return the new ID
      const { data: newPostData, error: postError } = await supabase.from('posts').insert([{ 
        user_id: user.id, 
        content: newPost.trim(), 
        media_url,
        original_post_id: repostTarget?.id || null 
      }]).select().single();
      
      if (postError) throw postError;

      // 2. NEW: Find everyone following the user and send them a notification!
      const { data: followers } = await supabase.from('follows').select('follower_id').eq('following_id', user.id);
      
      if (followers && followers.length > 0) {
        const notifications = followers.map(f => ({
          user_id: f.follower_id, 
          actor_id: user.id,      
          type: 'new_post',
          post_id: newPostData.id // Attach the post ID so they can click it!
        }));
        await supabase.from('notifications').insert(notifications);
      }

      setNewPost('');
      setMediaFile(null);
      setMediaPreview(null);
      setRepostTarget(null);
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

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/hub?tab=chat&postId=${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000); 
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const initiateRepost = (post: any) => {
    setRepostTarget(post.original_post || post);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading threads...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-20">
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3"><AlertCircle size={20} /><p className="text-sm">{error}</p></div>
      )}

      {/* COMPOSER BOX */}
      <div className="bg-[#131313] border border-[#F5F5F0]/10 p-6 rounded-2xl shadow-xl mb-8">
        <form onSubmit={handlePost} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center mt-1">
            {currentUserAvatar ? <img src={currentUserAvatar} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
          </div>
          <div className="flex-grow">
            <textarea 
              value={newPost} 
              onChange={e => setNewPost(e.target.value)} 
              placeholder={repostTarget ? "Add your thoughts to this repost..." : "Start a thread..."} 
              className="w-full bg-transparent border-none text-[#F5F5F0] focus:ring-0 text-lg placeholder:text-white/20 resize-none h-12" 
            />
            
            {mediaPreview && (
              <div className="mt-4 relative">
                <img src={mediaPreview} className="rounded-xl max-h-64 border border-white/10" />
                <button type="button" onClick={() => {setMediaFile(null); setMediaPreview(null);}} className="absolute top-2 right-2 bg-black/50 p-1 text-white rounded-full hover:bg-black transition-colors"><X size={14}/></button>
              </div>
            )}

            {repostTarget && (
              <div className="mt-4 p-4 border border-[#ff4d00]/30 bg-[#ff4d00]/5 rounded-xl relative">
                <button type="button" onClick={() => setRepostTarget(null)} className="absolute top-2 right-2 text-[#ff4d00]/60 hover:text-[#ff4d00] transition-colors"><X size={16}/></button>
                <div className="flex items-center gap-2 mb-2">
                  <Repeat size={14} className="text-[#ff4d00]" />
                  <p className="text-xs text-[#ff4d00] font-bold">Reposting {repostTarget.profiles?.first_name}</p>
                </div>
                <p className="text-sm text-white/80 line-clamp-2">{repostTarget.content}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
               <label className="cursor-pointer text-white/40 hover:text-[#ff4d00] transition-colors p-2 -ml-2">
                 <ImageIcon size={20} /><input type="file" className="hidden" accept="image/*,video/*" onChange={e => {
                   if (e.target.files?.[0]) { setMediaFile(e.target.files[0]); setMediaPreview(URL.createObjectURL(e.target.files[0])); }
                 }} />
               </label>
               <button type="submit" disabled={posting} className="bg-[#F5F5F0] text-black px-6 py-1.5 rounded-full font-bold text-sm hover:bg-white transition-colors disabled:opacity-50">
                 {posting ? 'Posting...' : (repostTarget ? 'Repost' : 'Post')}
               </button>
            </div>
          </div>
        </form>
      </div>

      {/* POSTS FEED */}
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
              
              {post.original_post && (
                <div className="flex items-center gap-2 text-white/30 text-xs font-bold uppercase tracking-wider mb-3 ml-12">
                  <Repeat size={12} /> {post.profiles?.first_name} Reposted
                </div>
              )}

              <div className="flex gap-4 px-2">
                <a href={post.profiles?.instagram_url || '#'} target={post.profiles?.instagram_url ? "_blank" : "_self"} className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 border-2 border-[#ff4d00]/50 hover:border-[#ff4d00] transition-colors flex items-center justify-center cursor-pointer mt-1">
                  {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                </a>

                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <a href={post.profiles?.instagram_url || '#'} target={post.profiles?.instagram_url ? "_blank" : "_self"} className="group flex items-center gap-2 cursor-pointer">
                      <h3 className="font-bold text-sm text-white group-hover:text-[#ff4d00] transition-colors">{post.profiles?.first_name || 'Member'} {post.profiles?.last_name || ''}</h3>
                      {post.profiles?.instagram_url && <span className="text-xs text-white/30 group-hover:text-[#ff4d00]/70 transition-colors">@{post.profiles.instagram_url.split('.com/')[1]?.replace('/', '')}</span>}
                    </a>
                    <span className="text-xs text-white/30">{new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                  
                  {post.content && <p className="text-[#F5F5F0]/90 mb-3 whitespace-pre-wrap">{post.content}</p>}
                  {post.media_url && <img src={post.media_url} className="mb-3 rounded-xl border border-white/5 max-h-96 w-full object-contain bg-black/20" />}
                  
                  {post.original_post && (
                    <div className="mt-2 mb-4 p-4 border border-white/10 bg-white/5 rounded-xl hover:border-white/20 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-black overflow-hidden flex items-center justify-center border border-white/10">
                          {post.original_post.profiles?.avatar_url ? <img src={post.original_post.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={10} className="text-white/20" />}
                        </div>
                        <span className="text-xs font-bold text-white">{post.original_post.profiles?.first_name} {post.original_post.profiles?.last_name}</span>
                        <span className="text-[10px] text-white/30">{new Date(post.original_post.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-white/80 whitespace-pre-wrap">{post.original_post.content}</p>
                      {post.original_post.media_url && <img src={post.original_post.media_url} className="mt-3 rounded-lg border border-white/5 max-h-64 w-full object-cover" />}
                    </div>
                  )}

                  {/* INTERACTION ROW */}
                  <div className="flex gap-6 mt-2 text-white/40">
                    <button onClick={() => toggleLike(post.id, postLikes)} className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}>
                      <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                      <span className="text-xs font-medium">{postLikes.length}</span>
                    </button>
                    <button onClick={() => setOpenCommentId(openCommentId === post.id ? null : post.id)} className={`flex items-center gap-1.5 hover:text-white transition-colors ${openCommentId === post.id ? 'text-white' : ''}`}>
                      <MessageCircle size={18} />
                      <span className="text-xs font-medium">{postComments.length}</span>
                    </button>
                    <button onClick={() => initiateRepost(post)} className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                      <Repeat size={18} />
                    </button>
                    <button onClick={() => handleShare(post.id)} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors relative">
                      <Share2 size={18} />
                      {copiedId === post.id && (
                        <span className="absolute -top-8 -left-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">Copied!</span>
                      )}
                    </button>
                  </div>

                  {/* COMMENTS SECTION */}
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
