import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, FolderDown, Lock, 
  User, Film, Camera, Save, Users, MessageSquare, Heart, Send, 
  BookHeart, MoreVertical, Edit2, Trash2, Repeat, Image as ImageIcon, Grid, X
} from 'lucide-react';

import RetainerDashboard from './RetainerDashboard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function Hub() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('vault'); 
  const [isLoading, setIsLoading] = useState(true);

  // USER & PROFILE STATE
  const [userId, setUserId] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    id: '', display_name: '', username: '', instagram_handle: '',
    avatar_url: '', first_name: '', last_name: '', bio: '',
    bible_verse: '', has_retainer: false, is_millerite: false, is_client: true 
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // TIMELINE STATE
  const [posts, setPosts] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [newPrayer, setNewPrayer] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // INTERACTION STATE
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // MEMBER PROFILE VIEW STATE
  const [viewingMember, setViewingMember] = useState<any | null>(null);
  const [memberPosts, setMemberPosts] = useState<any[]>([]);

  useEffect(() => {
    const initApp = async () => {
      try {
        if (!supabase) { setIsLoading(false); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate('/login'); return; }
        setUserId(session.user.id);

        const { data: bpData } = await supabase.from('blueprints').select('*').eq('user_id', session.user.id).single(); 
        if (bpData) setBlueprint(bpData);

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profileData) {
          const isFamilyOnly = profileData.is_millerite && profileData.is_client === false;
          setProfile({
            ...profileData,
            first_name: profileData.first_name || '', last_name: profileData.last_name || '',
            username: profileData.username || '', bio: profileData.bio || '', bible_verse: profileData.bible_verse || '',
            avatar_url: profileData.avatar_url || '', is_millerite: profileData.is_millerite ?? false,
            is_client: profileData.is_client ?? true 
          });
          if (isFamilyOnly) setActiveTab('millerites');
        }
        await fetchCommunityData();
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, [navigate]);

  const fetchCommunityData = async () => {
    if (!supabase) return;
    try {
      const { data: pData } = await supabase.from('community_posts').select(`*, post_likes(user_id), post_replies(*, profiles:user_id(first_name, last_name, avatar_url))`).order('created_at', { ascending: false });
      const { data: prData } = await supabase.from('prayer_requests').select('*').order('created_at', { ascending: false });
      
      if (pData || prData) {
        const userIds = new Set([...(pData || []).map((p: any) => p.user_id), ...(prData || []).map((p: any) => p.user_id)]);
        const { data: profData } = await supabase.from('profiles').select('id, first_name, last_name, avatar_url, bio, bible_verse').in('id', Array.from(userIds));
        const profileMap = (profData || []).reduce((acc: any, curr: any) => { acc[curr.id] = curr; return acc; }, {});

        if (pData) {
          setPosts(pData.map((p: any) => ({
            ...p,
            profile: profileMap[p.user_id],
            likes: p.post_likes || [],
            replies: (p.post_replies || []).sort((a:any, b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          })));
        }
        if (prData) setPrayers(prData.map((p: any) => ({ ...p, profile: profileMap[p.user_id] })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // POSTING & MEDIA
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !supabase || !userId) return;
    setIsPosting(true);
    try {
      const file = e.target.files[0];
      const filePath = `post-media/${userId}-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('avatars').upload(filePath, file); // Using avatars bucket for simplicity unless you create a new one
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setPostMediaUrl(data.publicUrl);
    } catch (err: any) {
      alert("Error uploading media: " + err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCreatePost = async () => {
    if ((!newPost.trim() && !postMediaUrl) || !supabase || !userId) return;
    setIsPosting(true);
    try {
      await supabase.from('community_posts').insert([{ user_id: userId, content: newPost.trim(), media_url: postMediaUrl }]);
      setNewPost(''); setPostMediaUrl('');
      await fetchCommunityData(); 
    } catch (err: any) { alert("Error: " + err.message); } 
    finally { setIsPosting(false); }
  };

  // POST ACTIONS (Edit, Delete, Like, Repost, Reply)
  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase!.from('community_posts').delete().eq('id', id);
    setMenuOpenId(null);
    fetchCommunityData();
  };

  const submitEdit = async (id: string) => {
    await supabase!.from('community_posts').update({ content: editContent }).eq('id', id);
    setEditingPostId(null); setMenuOpenId(null);
    fetchCommunityData();
  };

  const toggleLike = async (postId: string, hasLiked: boolean) => {
    if (!userId || !supabase) return;
    if (hasLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
    }
    fetchCommunityData();
  };

  const submitReply = async (postId: string) => {
    if (!replyContent.trim() || !userId) return;
    await supabase!.from('post_replies').insert([{ post_id: postId, user_id: userId, content: replyContent }]);
    setReplyContent(''); setReplyingToPostId(null);
    setExpandedReplies(prev => ({...prev, [postId]: true}));
    fetchCommunityData();
  };

  const handleRepost = async (post: any) => {
    if (!confirm("Repost this to your timeline?")) return;
    await supabase!.from('community_posts').insert([{ 
      user_id: userId, 
      content: '', 
      original_post_id: post.id 
    }]);
    fetchCommunityData();
  };

  // OPEN MEMBER PROFILE (INSTAGRAM FEED STYLE)
  const openMemberProfile = (memberId: string) => {
    const member = posts.find(p => p.user_id === memberId)?.profile || prayers.find(p => p.user_id === memberId)?.profile;
    if (!member) return;
    setViewingMember(member);
    setMemberPosts(posts.filter(p => p.user_id === memberId));
    setActiveTab('member_view');
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen bg-[#050505] text-[#F5F5F0] font-sans flex flex-col md:flex-row overflow-hidden selection:bg-[#ff4d00] selection:text-black">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="w-64 bg-[#111] border-r border-white/5 hidden md:flex flex-col z-20 shrink-0">
        <div onClick={() => navigate('/')} className="p-6 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
          <h2 className="text-xl font-black uppercase tracking-widest text-white">Sanctuary</h2>
          <p className="text-xs text-[#ff4d00] font-bold uppercase tracking-widest mt-1">Control Room</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-2">
          {profile.is_client && (
            <button onClick={() => setActiveTab('vault')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <FolderDown size={18} /> Asset Vault
            </button>
          )}

          {profile.is_millerite && (
            <button onClick={() => { setActiveTab('millerites'); setViewingMember(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'millerites' || activeTab === 'member_view' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <Users size={18} /> Millerites
            </button>
          )}

          {profile.is_client && blueprint && (
            <button onClick={() => setActiveTab('blueprint')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'blueprint' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <LayoutDashboard size={18} /> My Blueprint
            </button>
          )}

          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <User size={18} /> Settings
          </button>
        </nav>
        
        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Home size={18} /> Back to Main Site
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-5 pb-24 md:p-12 md:pb-12 relative scroll-smooth">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/5 rounded-full blur-[120px] pointer-events-none" />

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/50 animate-pulse font-bold tracking-widest uppercase text-sm">Loading secure connection...</p>
          </div>
        ) : (
          <>
            {/* MILLERITES FAMILY TIMELINE */}
            {activeTab === 'millerites' && profile.is_millerite && (
              <div className="animate-in fade-in max-w-5xl mx-auto">
                <div className="mb-10 border-b border-white/10 pb-6">
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2">Millerites</h1>
                  <p className="text-white/50 text-sm">Family updates, prayer requests, and keeping up with the Miller crew.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6">
                    {/* Create Post Input */}
                    <div className="bg-[#131313] border border-white/10 p-5 rounded-3xl shadow-xl flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-[#222] border border-white/10 shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                        {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : profile.first_name?.[0] || 'M'}
                      </div>
                      <div className="flex-1">
                        <textarea 
                          rows={2} placeholder="Share a family update, photos, or just checking in..." 
                          value={newPost} onChange={(e) => setNewPost(e.target.value)}
                          className="w-full bg-transparent text-white text-sm focus:outline-none resize-none placeholder:text-white/30"
                        />
                        {postMediaUrl && (
                          <div className="relative mt-2 inline-block">
                            <img src={postMediaUrl} className="h-32 rounded-xl object-cover border border-white/10" />
                            <button onClick={() => setPostMediaUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/5">
                          <button onClick={() => fileInputRef.current?.click()} className="text-white/40 hover:text-[#ff4d00] transition-colors p-2 rounded-full hover:bg-white/5">
                            <ImageIcon size={18} />
                            <input type="file" accept="image/*,video/*" hidden ref={fileInputRef} onChange={handleMediaUpload} />
                          </button>
                          <button onClick={handleCreatePost} disabled={isPosting || (!newPost.trim() && !postMediaUrl)} className="bg-[#ff4d00] text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50">
                            {isPosting ? 'Posting...' : 'Post'} <Send size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Feed */}
                    <div className="space-y-6">
                      {posts.map(post => {
                        const isOwnPost = post.user_id === userId;
                        const hasLiked = post.likes.some((l:any) => l.user_id === userId);
                        
                        return (
                          <div key={post.id} className="bg-[#131313] border border-white/10 p-5 rounded-3xl shadow-xl">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4 relative">
                              <div className="flex items-center gap-3 cursor-pointer" onClick={() => openMemberProfile(post.user_id)}>
                                <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
                                  {post.profile?.avatar_url ? <img src={post.profile.avatar_url} className="w-full h-full object-cover" /> : (post.profile?.first_name?.[0] || 'M')}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-bold hover:underline">{post.profile?.first_name} {post.profile?.last_name}</p>
                                  <p className="text-white/40 text-[10px] uppercase tracking-wider">{formatTime(post.created_at)}</p>
                                </div>
                              </div>
                              
                              {isOwnPost && (
                                <div className="relative">
                                  <button onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)} className="text-white/30 hover:text-white p-1">
                                    <MoreVertical size={16} />
                                  </button>
                                  {menuOpenId === post.id && (
                                    <div className="absolute right-0 mt-1 w-32 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1 z-10">
                                      <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-2"><Edit2 size={12}/> Edit</button>
                                      <button onClick={() => handleDeletePost(post.id)} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-400/10 flex items-center gap-2"><Trash2 size={12}/> Delete</button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            {editingPostId === post.id ? (
                              <div className="mb-4">
                                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-sm text-white focus:outline-none" />
                                <div className="flex gap-2 justify-end mt-2">
                                  <button onClick={() => setEditingPostId(null)} className="text-xs text-white/50 px-3 py-1">Cancel</button>
                                  <button onClick={() => submitEdit(post.id)} className="bg-[#ff4d00] text-black text-xs font-bold px-4 py-1.5 rounded-lg">Save</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {post.content && <p className="text-white/80 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>}
                                {post.media_url && <img src={post.media_url} className="w-full rounded-xl mb-4 border border-white/10" />}
                              </>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-6 border-t border-white/5 pt-3">
                              <button onClick={() => toggleLike(post.id, hasLiked)} className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${hasLiked ? 'text-[#ff4d00]' : 'text-white/40 hover:text-white'}`}>
                                <Heart size={16} className={hasLiked ? "fill-[#ff4d00]" : ""} /> {post.likes.length > 0 && post.likes.length}
                              </button>
                              <button onClick={() => setReplyingToPostId(replyingToPostId === post.id ? null : post.id)} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs font-bold">
                                <MessageSquare size={16} /> {post.replies.length > 0 && post.replies.length}
                              </button>
                              <button onClick={() => handleRepost(post)} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs font-bold ml-auto">
                                <Repeat size={16} />
                              </button>
                            </div>

                            {/* Replies Section */}
                            {(replyingToPostId === post.id || post.replies.length > 0) && (
                              <div className="mt-4 pt-4 border-t border-white/5 pl-4 space-y-3">
                                {post.replies.map((reply:any) => (
                                  <div key={reply.id} className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#222] shrink-0 overflow-hidden mt-1 cursor-pointer" onClick={() => openMemberProfile(reply.user_id)}>
                                      {reply.profiles?.avatar_url ? <img src={reply.profiles.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-white font-bold">{reply.profiles?.first_name?.[0] || 'M'}</div>}
                                    </div>
                                    <div className="bg-black/40 rounded-xl px-3 py-2 flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-white hover:underline cursor-pointer" onClick={() => openMemberProfile(reply.user_id)}>{reply.profiles?.first_name}</span>
                                        <span className="text-[9px] text-white/30">{formatTime(reply.created_at)}</span>
                                      </div>
                                      <p className="text-xs text-white/70">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                                {replyingToPostId === post.id && (
                                  <div className="flex gap-2 mt-2">
                                    <input autoFocus type="text" placeholder="Write a reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="flex-1 bg-black border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-[#ff4d00]" />
                                    <button onClick={() => submitReply(post.id)} className="bg-white/10 hover:bg-[#ff4d00] text-white hover:text-black p-2 rounded-full transition-colors"><Send size={14}/></button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: PRAYER WALL */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#131313] border border-[#ff4d00]/20 p-6 rounded-3xl shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4d00]/10 rounded-full blur-[50px] pointer-events-none" />
                      <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2"><BookHeart size={16} className="text-[#ff4d00]" /> Prayer Wall</h3>
                      <div className="mb-6 relative">
                        <input type="text" placeholder="Submit a prayer request..." value={newPrayer} onChange={(e) => setNewPrayer(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-[#ff4d00] transition-colors" />
                        <button onClick={handleCreatePrayer} disabled={isPraying || !newPrayer.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ff4d00] p-1 hover:scale-110 transition-transform disabled:opacity-50"><Send size={14} /></button>
                      </div>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {prayers.map(prayer => (
                          <div key={prayer.id} className="bg-black/50 border border-white/5 p-4 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-white text-xs font-bold cursor-pointer hover:underline" onClick={() => openMemberProfile(prayer.user_id)}>
                                {prayer.profile?.first_name} {prayer.profile?.last_name}
                              </p>
                            </div>
                            <p className="text-white/70 text-xs leading-relaxed mb-3">{prayer.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INSTAGRAM-STYLE MEMBER PROFILE VIEW */}
            {activeTab === 'member_view' && viewingMember && (
              <div className="animate-in fade-in max-w-4xl mx-auto">
                <button onClick={() => setActiveTab('millerites')} className="text-xs text-white/50 hover:text-white uppercase font-bold tracking-widest mb-8 flex items-center gap-2">
                  ← Back to Feed
                </button>
                
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/10 overflow-hidden shrink-0">
                    {viewingMember.avatar_url ? <img src={viewingMember.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#111] flex items-center justify-center text-4xl font-bold text-white/50">{viewingMember.first_name?.[0]}</div>}
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-black uppercase text-white mb-2">{viewingMember.first_name} {viewingMember.last_name}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-6 text-sm font-bold text-white/70 mb-4">
                      <span><strong className="text-white">{memberPosts.length}</strong> posts</span>
                    </div>
                    {viewingMember.bio && <p className="text-white/80 text-sm whitespace-pre-wrap mb-4 max-w-lg">{viewingMember.bio}</p>}
                    {viewingMember.bible_verse && (
                      <div className="inline-flex items-center gap-2 bg-[#ff4d00]/10 border border-[#ff4d00]/20 px-3 py-1.5 rounded-lg text-xs text-[#ff4d00] font-bold">
                        <BookHeart size={14} /> {viewingMember.bible_verse}
                      </div>
                    )}
                  </div>
                </div>

                {/* Instagram Style Grid */}
                <div className="border-t border-white/10 pt-8">
                  <div className="flex justify-center mb-6">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white border-t-2 border-white pt-2 -mt-[33px]">
                      <Grid size={14} /> Posts
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {memberPosts.map(post => (
                      <div key={post.id} className="aspect-square bg-[#111] border border-white/5 relative group cursor-pointer overflow-hidden rounded-md">
                        {post.media_url ? (
                          <img src={post.media_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full p-4 flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                            <p className="text-white/70 text-xs md:text-sm line-clamp-4 leading-relaxed font-medium">"{post.content}"</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <span className="text-white font-bold flex items-center gap-1.5"><Heart size={18} className="fill-white"/> {post.likes.length}</span>
                          <span className="text-white font-bold flex items-center gap-1.5"><MessageSquare size={18} className="fill-white"/> {post.replies.length}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {memberPosts.length === 0 && <p className="text-center text-white/30 text-sm py-12">No posts yet.</p>}
                </div>
              </div>
            )}
            
            {/* OTHER TABS (Settings, Vault) omitted for brevity as they remain unchanged */}
          </>
        )}
      </main>
    </div>
  );
}