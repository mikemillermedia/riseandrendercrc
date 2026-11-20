import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, FolderDown, Lock, 
  User, Film, Camera, Save, Users, MessageSquare, Heart, Send, 
  BookHeart, MoreVertical, Edit2, Trash2, Repeat, Image as ImageIcon, Grid, X, BookOpen, Sparkles, CheckCircle2
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

  // TIMELINE & PRAYER STATE
  const [posts, setPosts] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [prayerFilter, setPrayerFilter] = useState<'active' | 'answered'>('active');
  const [newPost, setNewPost] = useState('');
  const [newPrayer, setNewPrayer] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isPraying, setIsPraying] = useState(false);
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // INTERACTION STATE
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // MEMBER PROFILE VIEW STATE
  const [viewingMember, setViewingMember] = useState<any | null>(null);
  const [memberPosts, setMemberPosts] = useState<any[]>([]);

  // APPLE LIGHT THEME TOGGLE FOR MILLERITES
  const isLightMode = activeTab === 'millerites' || activeTab === 'member_view';

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
            username: profileData.username || '', instagram_handle: profileData.instagram_handle || '',
            bio: profileData.bio || '', bible_verse: profileData.bible_verse || '',
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
      const { data: pData, error: pError } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
      const { data: prData, error: prError } = await supabase.from('prayer_requests').select('*').order('created_at', { ascending: false });
      const { data: likesData } = await supabase.from('post_likes').select('*');
      const { data: repliesData } = await supabase.from('post_replies').select('*');
      const { data: prayerIntercessionsData } = await supabase.from('prayer_intercessions').select('*');

      if (pError) console.error("Posts Error:", pError.message);
      if (prError) console.error("Prayers Error:", prError.message);
      
      const safePosts = pData || [];
      const safePrayers = prData || [];
      const safeLikes = likesData || [];
      const safeReplies = repliesData || [];
      const safeIntercessions = prayerIntercessionsData || [];

      const userIds = new Set<string>();
      safePosts.forEach((p: any) => userIds.add(p.user_id));
      safePrayers.forEach((p: any) => userIds.add(p.user_id));
      safeLikes.forEach((l: any) => userIds.add(l.user_id));
      safeReplies.forEach((r: any) => userIds.add(r.user_id));
      safeIntercessions.forEach((i: any) => userIds.add(i.user_id));

      const { data: profData } = await supabase.from('profiles').select('id, first_name, last_name, avatar_url, bio, bible_verse').in('id', Array.from(userIds));

      const profileMap = (profData || []).reduce((acc: any, curr: any) => {
        acc[curr.id] = curr;
        return acc;
      }, {});

      setPosts(safePosts.map((p: any) => ({
        ...p,
        profile: profileMap[p.user_id],
        likes: safeLikes.filter((l: any) => l.post_id === p.id),
        replies: safeReplies
          .filter((r: any) => r.post_id === p.id)
          .map((r: any) => ({ ...r, profiles: profileMap[r.user_id] }))
          .sort((a:any, b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      })));

      setPrayers(safePrayers.map((p: any) => ({ 
        ...p, 
        profile: profileMap[p.user_id],
        intercessions: safeIntercessions
          .filter((i: any) => i.prayer_id === p.id)
          .map((i: any) => ({ ...i, profile: profileMap[i.user_id] }))
      })));

    } catch (err) {
      console.error("Error fetching community data:", err);
    }
  };

  // HELPER TO DETERMINE IF MEDIA IS VIDEO
  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  // POSTING & MEDIA
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !supabase || !userId) return;
    setIsPosting(true);
    try {
      const file = e.target.files[0];
      const filePath = `post-media/${userId}-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('avatars').upload(filePath, file);
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
      const { error } = await supabase.from('community_posts').insert([{ user_id: userId, content: newPost.trim(), media_url: postMediaUrl }]);
      if (error) throw error;
      setNewPost(''); setPostMediaUrl('');
      await fetchCommunityData(); 
    } catch (err: any) { 
      alert("Error Posting: " + err.message); 
    } finally { 
      setIsPosting(false); 
    }
  };

  const handleCreatePrayer = async () => {
    if (!newPrayer.trim() || !supabase || !userId) return;
    setIsPraying(true);
    try {
      const { error } = await supabase.from('prayer_requests').insert([{ user_id: userId, content: newPrayer.trim(), is_answered: false }]);
      if (error) throw error;
      setNewPrayer('');
      setPrayerFilter('active');
      await fetchCommunityData(); 
    } catch (error: any) { 
      alert("Error submitting prayer: " + error.message); 
    } finally { 
      setIsPraying(false); 
    }
  };

  // PRAYER INTERACTION ACTIONS
  const togglePrayingForRequest = async (prayerId: string, hasPrayed: boolean) => {
    if (!userId || !supabase) return;
    try {
      if (hasPrayed) {
        await supabase.from('prayer_intercessions').delete().eq('prayer_id', prayerId).eq('user_id', userId);
      } else {
        await supabase.from('prayer_intercessions').insert([{ prayer_id: prayerId, user_id: userId }]);
      }
      await fetchCommunityData();
    } catch (err: any) {
      console.error("Error toggling prayer:", err);
    }
  };

  const togglePrayerAnswered = async (prayerId: string, currentStatus: boolean) => {
    if (!userId || !supabase) return;
    try {
      const { error } = await supabase.from('prayer_requests').update({ is_answered: !currentStatus }).eq('id', prayerId);
      if (error) throw error;
      await fetchCommunityData();
    } catch (err: any) {
      alert("Error updating prayer status: " + err.message);
    }
  };

  const handleDeletePrayer = async (id: string) => {
    if (!confirm("Delete this prayer request?")) return;
    const { error } = await supabase!.from('prayer_requests').delete().eq('id', id);
    if (error) alert("Error deleting prayer: " + error.message);
    fetchCommunityData();
  };

  // POST ACTIONS
  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase!.from('community_posts').delete().eq('id', id);
    if (error) alert("Error deleting: " + error.message);
    setMenuOpenId(null);
    fetchCommunityData();
  };

  const submitEdit = async (id: string) => {
    const { error } = await supabase!.from('community_posts').update({ content: editContent }).eq('id', id);
    if (error) alert("Error editing: " + error.message);
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
    const { error } = await supabase!.from('post_replies').insert([{ post_id: postId, user_id: userId, content: replyContent }]);
    if (error) alert("Error replying: " + error.message);
    setReplyContent(''); setReplyingToPostId(null);
    fetchCommunityData();
  };

  const handleRepost = async (post: any) => {
    if (!confirm("Repost this to your timeline?")) return;
    const { error } = await supabase!.from('community_posts').insert([{ user_id: userId, content: '', original_post_id: post.id }]);
    if (error) alert("Error reposting: " + error.message);
    fetchCommunityData();
  };

  // OPEN MEMBER PROFILE
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

  const toggleGearItem = async (index: number) => {
    if (!blueprint || !supabase) return;
    const updatedGear = [...blueprint.gear_list];
    updatedGear[index].checked = !updatedGear[index].checked;
    setBlueprint({ ...blueprint, gear_list: updatedGear });
    try { await supabase.from('blueprints').update({ gear_list: updatedGear }).eq('id', blueprint.id); } 
    catch (err) { console.error(err); }
  };

  const handleSignOut = async () => {
    try { if (supabase) await supabase.auth.signOut(); } 
    catch (error) { console.error(error); } 
    finally { navigate('/'); }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0 || !supabase || !userId) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);
    } catch (error: any) { alert(`Error uploading image: ${error.message}`); } 
    finally { setIsUploadingAvatar(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId) return;
    setIsSavingProfile(true);
    try {
      const displayName = `${profile.first_name} ${profile.last_name}`.trim() || profile.username || 'Creator';
      const { error } = await supabase.from('profiles').update({
        first_name: profile.first_name, last_name: profile.last_name, display_name: displayName,
        username: profile.username, instagram_handle: profile.instagram_handle, bio: profile.bio, bible_verse: profile.bible_verse
      }).eq('id', userId);
      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error: any) { alert(`Error saving profile: ${error.message}`); } 
    finally { setIsSavingProfile(false); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newPassword) return;
    if (newPassword.length < 6) { alert("Password must be at least 6 characters long."); return; }
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert("Password updated successfully!");
      setNewPassword('');
    } catch (error: any) { alert(`Error updating password: ${error.message}`); } 
    finally { setIsUpdatingPassword(false); }
  };

  const activePrayersCount = prayers.filter(p => !p.is_answered).length;
  const answeredPrayersCount = prayers.filter(p => p.is_answered).length;
  const filteredPrayers = prayers.filter(p => prayerFilter === 'answered' ? p.is_answered : !p.is_answered);

  return (
    <div className={`h-screen font-sans flex flex-col md:flex-row overflow-hidden transition-colors duration-500 selection:bg-[#ff4d00] selection:text-white ${isLightMode ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#050505] text-[#F5F5F0]'}`}>
      
      {/* DESKTOP SIDEBAR */}
      <aside className={`w-64 border-r hidden md:flex flex-col z-20 shrink-0 transition-colors duration-500 ${isLightMode ? 'bg-white/75 backdrop-blur-2xl border-slate-200/80' : 'bg-[#111] border-white/5'}`}>
        <div onClick={() => navigate('/')} className={`p-6 border-b cursor-pointer transition-colors ${isLightMode ? 'border-slate-200/70 hover:bg-slate-100/50' : 'border-white/5 hover:bg-white/5'}`}>
          <h2 className={`text-xl font-black uppercase tracking-widest ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Sanctuary</h2>
          <p className="text-xs text-[#ff4d00] font-bold uppercase tracking-widest mt-1">Control Room</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-2">
          {profile.is_client && (
            <button onClick={() => setActiveTab('vault')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <FolderDown size={18} /> Asset Vault
            </button>
          )}

          {profile.is_millerite && (
            <button onClick={() => { setActiveTab('millerites'); setViewingMember(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'millerites' || activeTab === 'member_view' ? (isLightMode ? 'bg-[#1C1C2E] text-white shadow-md shadow-slate-900/10' : 'bg-[#ff4d00]/10 text-[#ff4d00]') : (isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5')}`}>
              <Users size={18} /> Millerites
            </button>
          )}

          {profile.is_client && blueprint && (
            <button onClick={() => setActiveTab('blueprint')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'blueprint' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <LayoutDashboard size={18} /> My Blueprint
            </button>
          )}

          {profile.is_client && profile.has_retainer && (
            <button onClick={() => setActiveTab('retainer')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'retainer' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <Film size={18} /> Post-Production
            </button>
          )}

          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <User size={18} /> Settings
          </button>
        </nav>
        
        <div className={`p-4 border-t space-y-2 ${isLightMode ? 'border-slate-200/70' : 'border-white/5'}`}>
          <button onClick={() => navigate('/')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <Home size={18} /> Back to Main Site
          </button>
          <button onClick={handleSignOut} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isLightMode ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-white/40 hover:text-red-400 hover:bg-red-400/10'}`}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 md:p-10 md:pb-12 relative scroll-smooth">
        {/* Ambient background glows */}
        {isLightMode ? (
          <>
            <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-300/25 rounded-full blur-[130px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[15%] w-[450px] h-[450px] bg-blue-300/20 rounded-full blur-[130px] pointer-events-none" />
          </>
        ) : (
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/5 rounded-full blur-[120px] pointer-events-none" />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className={`${isLightMode ? 'text-slate-400' : 'text-white/50'} animate-pulse font-bold tracking-widest uppercase text-sm`}>Loading secure connection...</p>
          </div>
        ) : (
          <>
            {/* MILLERITES FAMILY TIMELINE - APPLE GLASS BENTO AESTHETIC */}
            {activeTab === 'millerites' && profile.is_millerite && (
              <div className="animate-in fade-in duration-500 max-w-6xl mx-auto relative z-10 space-y-6">
                
                {/* TOP BENTO HEADER ROW */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Welcome Bento Card */}
                  <div className="md:col-span-8 bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-amber-200/40 to-orange-300/20 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="inline-flex items-center gap-1.5 bg-slate-900/5 border border-slate-900/10 text-slate-700 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                        <Sparkles size={12} className="text-[#ff4d00]" /> Miller Family Hub
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Hi, {profile.first_name || 'Family'} 👋
                      </span>
                    </div>

                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">
                        Millerites
                      </h1>
                      <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
                        Private family updates, photos, videos, and prayer requests to keep our crew connected.
                      </p>
                    </div>
                  </div>

                  {/* Dark Navy Accent Bento Card */}
                  <div className="md:col-span-4 bg-[#1C1C2E] text-white shadow-[0_12px_35px_rgba(28,28,46,0.18)] rounded-[32px] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                        Family Pulse
                      </span>
                      <Users size={18} className="text-white/40" />
                    </div>

                    <div className="my-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">{posts.length}</span>
                        <span className="text-xs text-white/60 font-medium">Timeline Updates</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-[#ff4d00] h-full rounded-full w-3/4" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/60 pt-3 border-t border-white/10">
                      <span>Active / Answered Prayers</span>
                      <span className="font-bold text-amber-400">{activePrayersCount} / {answeredPrayersCount} ✨</span>
                    </div>
                  </div>
                </div>

                {/* MAIN BENTO WORKSPACE GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COLUMN: COMPOSER & FEED */}
                  <div className="lg:col-span-8 space-y-5">
                    
                    {/* Apple Glass Post Composer */}
                    <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-6 rounded-[28px] transition-all">
                      <div className="flex gap-4 items-start">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center text-sm font-bold text-slate-700 overflow-hidden shadow-sm">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            profile.first_name?.[0] || 'M'
                          )}
                        </div>
                        <div className="flex-1">
                          <textarea 
                            rows={2} 
                            placeholder="Share a family update, photo, or video..." 
                            value={newPost} 
                            onChange={(e) => setNewPost(e.target.value)}
                            className="w-full bg-transparent text-slate-800 text-sm font-medium focus:outline-none resize-none placeholder:text-slate-400 pt-1"
                          />
                          {postMediaUrl && (
                            <div className="relative mt-3 inline-block">
                              {isVideo(postMediaUrl) ? (
                                <video src={postMediaUrl} className="h-36 rounded-2xl object-cover border border-slate-200 shadow-sm" autoPlay muted loop playsInline />
                              ) : (
                                <img src={postMediaUrl} className="h-36 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                              )}
                              <button onClick={() => setPostMediaUrl('')} className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1.5 shadow-md hover:bg-red-500 transition-colors">
                                <X size={12}/>
                              </button>
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                            <button 
                              onClick={() => fileInputRef.current?.click()} 
                              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
                            >
                              <ImageIcon size={16} className="text-[#ff4d00]" />
                              <span>Photo / Video</span>
                              <input type="file" accept="image/*,video/*" hidden ref={fileInputRef} onChange={handleMediaUpload} />
                            </button>
                            <button 
                              onClick={handleCreatePost} 
                              disabled={isPosting || (!newPost.trim() && !postMediaUrl)} 
                              className="bg-[#1C1C2E] hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 shadow-md shadow-slate-900/10 transition-all disabled:opacity-40"
                            >
                              {isPosting ? 'Posting...' : 'Post'} <Send size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Feed Cards */}
                    <div className="space-y-4">
                      {posts.length === 0 ? (
                        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[28px] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                          <p className="text-slate-400 text-sm font-medium">No family updates yet. Be the first to share!</p>
                        </div>
                      ) : (
                        posts.map(post => {
                          const isOwnPost = post.user_id === userId;
                          const hasLiked = post.likes.some((l:any) => l.user_id === userId);
                          
                          return (
                            <div key={post.id} className="bg-white/85 backdrop-blur-2xl border border-white p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-4 relative">
                                <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => openMemberProfile(post.user_id)}>
                                  <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0 overflow-hidden shadow-sm">
                                    {post.profile?.avatar_url ? (
                                      <img src={post.profile.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                      post.profile?.first_name?.[0] || 'M'
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-slate-900 text-sm font-bold group-hover:text-[#ff4d00] transition-colors">
                                      {post.profile?.first_name ? `${post.profile.first_name} ${post.profile.last_name}` : 'Family Member'}
                                    </p>
                                    <p className="text-slate-400 text-[11px] font-medium">{formatTime(post.created_at)}</p>
                                  </div>
                                </div>
                                
                                {isOwnPost && (
                                  <div className="relative">
                                    <button onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                                      <MoreVertical size={16} />
                                    </button>
                                    {menuOpenId === post.id && (
                                      <div className="absolute right-0 mt-1 w-36 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl py-1.5 z-20">
                                        <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                                          <Edit2 size={13}/> Edit Post
                                        </button>
                                        <button onClick={() => handleDeletePost(post.id)} className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                          <Trash2 size={13}/> Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              {editingPostId === post.id ? (
                                <div className="mb-4">
                                  <textarea 
                                    value={editContent} 
                                    onChange={(e) => setEditContent(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-800 focus:outline-none focus:border-slate-400" 
                                  />
                                  <div className="flex gap-2 justify-end mt-2.5">
                                    <button onClick={() => setEditingPostId(null)} className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-xl hover:bg-slate-100">
                                      Cancel
                                    </button>
                                    <button onClick={() => submitEdit(post.id)} className="bg-[#1C1C2E] text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-sm">
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {post.content && (
                                    <p className="text-slate-700 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">
                                      {post.content}
                                    </p>
                                  )}
                                  {post.media_url && (
                                    <div className="rounded-2xl overflow-hidden mb-4 border border-slate-100 bg-slate-50">
                                      {isVideo(post.media_url) ? (
                                        <video src={post.media_url} controls playsInline className="w-full max-h-[480px] object-contain" />
                                      ) : (
                                        <img src={post.media_url} className="w-full max-h-[520px] object-cover" />
                                      )}
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                                <button 
                                  onClick={() => toggleLike(post.id, hasLiked)} 
                                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${hasLiked ? 'bg-red-50 text-red-500' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                                >
                                  <Heart size={15} className={hasLiked ? "fill-red-500 text-red-500" : ""} /> 
                                  <span>{post.likes.length > 0 ? post.likes.length : 'Like'}</span>
                                </button>

                                <button 
                                  onClick={() => setReplyingToPostId(replyingToPostId === post.id ? null : post.id)} 
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all text-xs font-bold"
                                >
                                  <MessageSquare size={15} /> 
                                  <span>{post.replies.length > 0 ? post.replies.length : 'Reply'}</span>
                                </button>

                                <button 
                                  onClick={() => handleRepost(post)} 
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all text-xs font-bold ml-auto"
                                  title="Repost"
                                >
                                  <Repeat size={15} />
                                </button>
                              </div>

                              {/* Replies Section */}
                              {(replyingToPostId === post.id || post.replies.length > 0) && (
                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                  {post.replies.map((reply:any) => (
                                    <div key={reply.id} className="flex gap-3 items-start">
                                      <div 
                                        className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200/70 shrink-0 overflow-hidden mt-0.5 cursor-pointer" 
                                        onClick={() => openMemberProfile(reply.user_id)}
                                      >
                                        {reply.profiles?.avatar_url ? (
                                          <img src={reply.profiles.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-bold">
                                            {reply.profiles?.first_name?.[0] || 'M'}
                                          </div>
                                        )}
                                      </div>
                                      <div className="bg-slate-100/80 border border-slate-200/50 rounded-2xl px-4 py-2.5 flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span 
                                            className="text-xs font-bold text-slate-900 hover:text-[#ff4d00] cursor-pointer" 
                                            onClick={() => openMemberProfile(reply.user_id)}
                                          >
                                            {reply.profiles?.first_name || 'Family'}
                                          </span>
                                          <span className="text-[10px] font-medium text-slate-400">{formatTime(reply.created_at)}</span>
                                        </div>
                                        <p className="text-xs text-slate-700 leading-relaxed">{reply.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {replyingToPostId === post.id && (
                                    <div className="flex gap-2 pt-1">
                                      <input 
                                        autoFocus 
                                        type="text" 
                                        placeholder="Write a reply..." 
                                        value={replyContent} 
                                        onChange={(e) => setReplyContent(e.target.value)} 
                                        className="flex-1 bg-slate-100/90 border border-slate-200/80 rounded-full px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all" 
                                      />
                                      <button 
                                        onClick={() => submitReply(post.id)} 
                                        className="bg-[#1C1C2E] hover:bg-slate-800 text-white p-2.5 rounded-full transition-colors shadow-sm"
                                      >
                                        <Send size={13}/>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: INTERACTIVE APPLE GLASS PRAYER BENTO BOX */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/85 backdrop-blur-2xl border border-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-900 font-black uppercase tracking-wider text-xs flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#ff4d00]">
                            <BookHeart size={15} />
                          </span>
                          Prayer Wall
                        </h3>

                        {/* Active vs Answered Filter Pills */}
                        <div className="flex bg-slate-100 p-0.5 rounded-full border border-slate-200/60">
                          <button 
                            onClick={() => setPrayerFilter('active')} 
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${prayerFilter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            Active ({activePrayersCount})
                          </button>
                          <button 
                            onClick={() => setPrayerFilter('answered')} 
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${prayerFilter === 'answered' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            Answered ({answeredPrayersCount})
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-5 relative">
                        <input 
                          type="text" 
                          placeholder="Share a prayer request..." 
                          value={newPrayer} 
                          onChange={(e) => setNewPrayer(e.target.value)} 
                          className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl pl-4 pr-11 py-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all" 
                        />
                        <button 
                          onClick={handleCreatePrayer} 
                          disabled={isPraying || !newPrayer.trim()} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1C1C2E] text-white p-2 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-40"
                        >
                          <Send size={12} />
                        </button>
                      </div>

                      <div className="space-y-3.5 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                        {filteredPrayers.length === 0 ? (
                          <div className="text-center py-8 px-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                            <p className="text-slate-400 text-xs font-medium">
                              {prayerFilter === 'answered' ? 'No answered prayers marked yet. Keep praying!' : 'No active prayer requests right now.'}
                            </p>
                          </div>
                        ) : (
                          filteredPrayers.map(prayer => {
                            const isOwnPrayer = prayer.user_id === userId;
                            const intercessions = prayer.intercessions || [];
                            const hasPrayed = intercessions.some((i: any) => i.user_id === userId);

                            return (
                              <div 
                                key={prayer.id} 
                                className={`p-4 rounded-2xl transition-all shadow-sm border ${
                                  prayer.is_answered 
                                    ? 'bg-gradient-to-br from-amber-50/90 to-orange-50/50 border-amber-200/80' 
                                    : 'bg-slate-50/90 hover:bg-white border-slate-200/60'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => openMemberProfile(prayer.user_id)}>
                                    <div className="w-6 h-6 rounded-lg bg-slate-200 border border-slate-300/60 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                      {prayer.profile?.avatar_url ? (
                                        <img src={prayer.profile.avatar_url} className="w-full h-full object-cover" />
                                      ) : (
                                        prayer.profile?.first_name?.[0] || 'M'
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-slate-900 text-xs font-bold group-hover:text-[#ff4d00] transition-colors leading-none">
                                        {prayer.profile?.first_name ? `${prayer.profile.first_name} ${prayer.profile.last_name}` : 'Family Member'}
                                      </p>
                                      <span className="text-[10px] font-medium text-slate-400">{formatTime(prayer.created_at)}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {prayer.is_answered && (
                                      <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-800 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        <CheckCircle2 size={10} className="text-amber-600" /> Answered
                                      </span>
                                    )}
                                    {isOwnPrayer && (
                                      <button 
                                        onClick={() => handleDeletePrayer(prayer.id)} 
                                        className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors"
                                        title="Delete prayer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <p className="text-slate-700 text-xs leading-relaxed mb-3.5 whitespace-pre-wrap">
                                  {prayer.content}
                                </p>

                                {/* Interactive Footer: Praying Button + Overlapping Avatars + Author Answered Toggle */}
                                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-200/50">
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => togglePrayingForRequest(prayer.id, hasPrayed)}
                                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                        hasPrayed 
                                          ? 'bg-[#1C1C2E] text-white shadow-sm' 
                                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                                      }`}
                                    >
                                      <span>🙏</span>
                                      <span>{hasPrayed ? 'Praying' : 'Pray'}</span>
                                      {intercessions.length > 0 && (
                                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${hasPrayed ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                          {intercessions.length}
                                        </span>
                                      )}
                                    </button>

                                    {/* Overlapping Avatars of Family Members Praying */}
                                    {intercessions.length > 0 && (
                                      <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                                        {intercessions.slice(0, 4).map((intercession: any) => (
                                          <div 
                                            key={intercession.id} 
                                            title={`${intercession.profile?.first_name || 'Family'} is praying`}
                                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden flex items-center justify-center text-[8px] font-bold text-slate-700"
                                          >
                                            {intercession.profile?.avatar_url ? (
                                              <img src={intercession.profile.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                              intercession.profile?.first_name?.[0] || 'M'
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {isOwnPrayer && (
                                    <button 
                                      onClick={() => togglePrayerAnswered(prayer.id, !!prayer.is_answered)}
                                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                                        prayer.is_answered 
                                          ? 'text-slate-500 hover:bg-slate-200/60' 
                                          : 'text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20'
                                      }`}
                                    >
                                      <CheckCircle2 size={11} />
                                      {prayer.is_answered ? 'Move to Active' : 'Mark Answered'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* INSTAGRAM-STYLE MEMBER PROFILE VIEW (APPLE GLASS LIGHT MODE) */}
            {activeTab === 'member_view' && viewingMember && (
              <div className="animate-in fade-in max-w-4xl mx-auto relative z-10">
                <button 
                  onClick={() => setActiveTab('millerites')} 
                  className="text-xs text-slate-500 hover:text-slate-900 uppercase font-bold tracking-widest mb-6 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-full shadow-sm"
                >
                  ← Back to Millerites
                </button>
                
                {/* Profile Bento Header */}
                <div className="bg-white/85 backdrop-blur-2xl border border-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl border border-slate-200 overflow-hidden shrink-0 shadow-md bg-slate-100">
                    {viewingMember.avatar_url ? (
                      <img src={viewingMember.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                        {viewingMember.first_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                      {viewingMember.first_name} {viewingMember.last_name}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-6 text-xs font-bold text-slate-500 mb-4">
                      <span className="bg-slate-100 px-3 py-1 rounded-full">
                        <strong className="text-slate-900">{memberPosts.length}</strong> updates shared
                      </span>
                    </div>
                    {viewingMember.bio && (
                      <p className="text-slate-600 text-sm whitespace-pre-wrap mb-4 max-w-lg leading-relaxed">
                        {viewingMember.bio}
                      </p>
                    )}
                    {viewingMember.bible_verse && (
                      <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl text-xs text-amber-800 font-bold">
                        <BookHeart size={14} className="text-[#ff4d00]" /> {viewingMember.bible_verse}
                      </div>
                    )}
                  </div>
                </div>

                {/* Instagram Style Grid */}
                <div>
                  <div className="flex justify-center mb-6">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-800 bg-white/80 backdrop-blur-md border border-slate-200/80 px-5 py-2 rounded-full shadow-sm">
                      <Grid size={14} className="text-[#ff4d00]" /> Family Updates
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    {memberPosts.map(post => (
                      <div key={post.id} className="aspect-square bg-white/85 backdrop-blur-xl border border-white shadow-[0_8px_25px_rgb(0,0,0,0.04)] relative group cursor-pointer overflow-hidden rounded-[24px]">
                        {post.media_url ? (
                          isVideo(post.media_url) ? (
                            <video src={post.media_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted playsInline />
                          ) : (
                            <img src={post.media_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          )
                        ) : (
                          <div className="w-full h-full p-5 flex flex-col justify-center items-center text-center bg-gradient-to-br from-white to-slate-50">
                            <p className="text-slate-700 text-xs md:text-sm line-clamp-4 leading-relaxed font-medium">
                              "{post.content}"
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5">
                          <span className="text-white text-sm font-bold flex items-center gap-1.5"><Heart size={17} className="fill-white"/> {post.likes.length}</span>
                          <span className="text-white text-sm font-bold flex items-center gap-1.5"><MessageSquare size={17} className="fill-white"/> {post.replies.length}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {memberPosts.length === 0 && (
                    <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[28px] p-12 text-center">
                      <p className="text-slate-400 text-sm font-medium">No posts yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ASSET VAULT TAB (DARK MODE) */}
            {activeTab === 'vault' && profile.is_client && (
              <div className="animate-in fade-in max-w-6xl mx-auto space-y-12">
                <div className="text-center">
                  <span className="bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-3 inline-block">
                    Digital Resources & Services
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
                    Asset <span className="text-[#ff4d00]">Vault</span>
                  </h1>
                </div>

                <div className="bg-[#131313] border border-[#ff4d00]/30 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-[0_0_40px_rgba(255,77,0,0.12)]">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/10 rounded-full blur-[110px] pointer-events-none" />
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                    <div className="md:col-span-5 flex justify-center items-center py-4">
                      <img src="https://pub-251ee1b2d0ef473aa21849e9f5d1bfae.r2.dev/Rise%20%26%20Render%20Content%20Kit%20Image.jpg" alt="Kit Cover" className="w-48 sm:w-56 rounded-r-md border border-white/20 shadow-2xl" />
                    </div>
                    <div className="md:col-span-7 space-y-4 text-left">
                      <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-tight">The Content Creator Studio Kit</h2>
                      <p className="text-white/70 text-sm leading-relaxed">A proven, no-guesswork at-home studio setup.</p>
                      <a href="https://pub-251ee1b2d0ef473aa21849e9f5d1bfae.r2.dev/The%20Content%20Creator%20Studio%20Kit%20(1).pdf" target="_blank" rel="noopener noreferrer" className="inline-flex bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl text-xs items-center gap-2">
                        <BookOpen size={16} /> Open Guide
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BLUEPRINT TAB */}
            {activeTab === 'blueprint' && profile.is_client && blueprint && (
              <div className="animate-in fade-in max-w-6xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">My Studio Blueprint</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-[#131313] border border-white/5 p-6 rounded-3xl shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">Action Items</h3>
                    {blueprint.gear_list?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 mb-3 cursor-pointer" onClick={() => toggleGearItem(index)}>
                        <input type="checkbox" checked={item.checked} readOnly className="w-5 h-5 accent-[#ff4d00]" />
                        <span className={`text-sm ${item.checked ? 'text-white/40 line-through' : 'text-white'}`}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 rounded-3xl flex flex-col justify-center items-center text-center shadow-xl min-h-[250px]">
                    <Video size={40} className="text-[#ff4d00] mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Consultation Recording</h3>
                    {blueprint.video_url ? (
                      <a href={blueprint.video_url} target="_blank" rel="noopener noreferrer" className="bg-[#ff4d00] hover:bg-orange-500 text-black text-sm font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-colors w-full">Watch Replay</a>
                    ) : (
                      <button disabled className="bg-white/5 text-white/30 text-sm font-bold py-3 px-6 rounded-xl border border-white/10 w-full">Processing...</button>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* RETAINER TAB */}
            {activeTab === 'retainer' && profile.is_client && profile.has_retainer && (
              <div className="animate-in fade-in">
                <RetainerDashboard userId={userId} supabase={supabase} />
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in max-w-3xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2 text-center">Settings</h1>
                <div className="bg-[#131313] border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl relative mt-8">
                  <form onSubmit={handleSaveProfile} className="space-y-6 relative z-10">
                    <div className="flex gap-6 pb-8 border-b border-white/5">
                      <div className="relative group shrink-0">
                        {profile.avatar_url ? <img src={profile.avatar_url} className="w-24 h-24 rounded-full object-cover" /> : <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-3xl font-black text-white/30">{profile.first_name?.[0] || 'C'}</div>}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer">
                          <Camera size={24} className="text-white" />
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </label>
                      </div>
                      <div className="pt-2">
                        <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">Profile Photo</h3>
                        {isUploadingAvatar && <span className="text-[#ff4d00] text-[10px] font-bold uppercase tracking-widest animate-pulse">Uploading...</span>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">First Name</label>
                        <input type="text" value={profile.first_name} onChange={(e) => setProfile({...profile, first_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Last Name</label>
                        <input type="text" value={profile.last_name} onChange={(e) => setProfile({...profile, last_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                      </div>
                      
                      {profile.is_client && (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Username</label>
                            <input type="text" value={profile.username} onChange={(e) => setProfile({...profile, username: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Instagram</label>
                            <input type="text" value={profile.instagram_handle} onChange={(e) => setProfile({...profile, instagram_handle: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                          </div>
                        </>
                      )}
                      
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-[#ff4d00] uppercase tracking-widest mb-2">Favorite Bible Verse</label>
                        <input type="text" value={profile.bible_verse} onChange={(e) => setProfile({...profile, bible_verse: e.target.value})} className="w-full bg-black border border-[#ff4d00]/20 rounded-xl px-4 py-3 text-sm text-white" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Short Bio</label>
                        <textarea rows={3} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none" />
                      </div>
                    </div>
                    
                    <button type="submit" disabled={isSavingProfile} className="bg-[#ff4d00] text-black font-black uppercase tracking-widest px-8 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2">
                      <Save size={16} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>

                  <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1 flex items-center gap-2">
                      <Lock size={16} className="text-[#ff4d00]" /> Account Security
                    </h3>
                    <p className="text-white/40 text-xs mb-6">Update your password to keep your Sanctuary assets secure.</p>
                    <form onSubmit={handleUpdatePassword} className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" placeholder="Enter new password" />
                      </div>
                      <button type="submit" disabled={isUpdatingPassword || !newPassword} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest px-8 py-3.5 rounded-xl text-xs flex items-center justify-center transition-all disabled:opacity-50 shrink-0">
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                  
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className={`md:hidden fixed bottom-0 left-0 w-full backdrop-blur-2xl border-t flex justify-around items-center p-3 z-30 pb-safe transition-colors duration-500 ${isLightMode ? 'bg-white/85 border-slate-200/80' : 'bg-[#111]/95 border-white/5'}`}>
        {profile.is_client && (
          <button onClick={() => setActiveTab('vault')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'vault' ? 'text-[#ff4d00]' : isLightMode ? 'text-slate-400' : 'text-white/40'}`}>
            <FolderDown size={20} /><span className="text-[9px] uppercase font-bold tracking-wider">Vault</span>
          </button>
        )}
        {profile.is_millerite && (
          <button onClick={() => { setActiveTab('millerites'); setViewingMember(null); }} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'millerites' || activeTab === 'member_view' ? (isLightMode ? 'text-[#1C1C2E]' : 'text-[#ff4d00]') : (isLightMode ? 'text-slate-400' : 'text-white/40')}`}>
            <Users size={20} /><span className="text-[9px] uppercase font-bold tracking-wider">Family</span>
          </button>
        )}
        {profile.is_client && blueprint && (
          <button onClick={() => setActiveTab('blueprint')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'blueprint' ? 'text-[#ff4d00]' : isLightMode ? 'text-slate-400' : 'text-white/40'}`}>
            <LayoutDashboard size={20} /><span className="text-[9px] uppercase font-bold tracking-wider">Blueprint</span>
          </button>
        )}
        {profile.is_client && profile.has_retainer && (
          <button onClick={() => setActiveTab('retainer')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'retainer' ? 'text-[#ff4d00]' : isLightMode ? 'text-slate-400' : 'text-white/40'}`}>
            <Film size={20} /><span className="text-[9px] uppercase font-bold tracking-wider">Retainer</span>
          </button>
        )}
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'profile' ? 'text-[#ff4d00]' : isLightMode ? 'text-slate-400' : 'text-white/40'}`}>
          <User size={20} /><span className="text-[9px] uppercase font-bold tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
}