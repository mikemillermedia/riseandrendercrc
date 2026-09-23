import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, Compass, Lock, 
  MessageSquare, Image as ImageIcon, Heart, MessageCircle, MoreHorizontal, 
  Share2, User, Instagram, Camera, Repeat, Send, X, AlertCircle, Trash2, BookOpen, Pencil
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function Hub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetPostId = searchParams.get('postId');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('community'); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- USER & BLUEPRINT STATE ---
  const [userId, setUserId] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    id: '',
    display_name: 'Creator',
    username: 'creator' + Math.floor(Math.random() * 1000),
    instagram_handle: '',
    avatar_letter: 'C',
    avatar_url: '',
    first_name: '',
    last_name: '',
    bio: ''
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- FEED STATE (Merged from CommunityChat) ---
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting] = useState(false);
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  const [commentText, setCommentText] = useState('');
  const [openCommentId, setOpenCommentId] = useState<string | null>(targetPostId);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [repostTarget, setRepostTarget] = useState<any>(null);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<'post' | 'comment' | null>(null);

  const [fetchingVerse, setFetchingVerse] = useState(false);
  const verseMatch = newPostText.match(/\/verse\s+([1-3]?\s*[a-zA-Z]+\s+\d+:\d+(?:-\d+)?)/i);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initApp = async () => {
      try {
        if (!supabase) { setIsLoading(false); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate('/login'); return; }
        
        setUserId(session.user.id);

        // Fetch Blueprint
        const { data: bpData } = await supabase.from('blueprints').select('*').eq('user_id', session.user.id).single(); 
        if (bpData) setBlueprint(bpData);

        // Fetch Profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profileData) {
          setProfile(profileData);
        }

        // Fetch Posts and Members
        await fetchPosts();
        await fetchAllMembers();

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, [navigate]);

  // Scroll to targeted post if URL has ?postId=...
  useEffect(() => {
    if (!isLoading && targetPostId) {
      setTimeout(() => {
        const element = document.getElementById(`post-${targetPostId}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [isLoading, targetPostId]);

  // --- DATA FETCHING METHODS ---
  const fetchAllMembers = async () => {
    if(!supabase) return;
    const { data } = await supabase.from('profiles').select('id, first_name, last_name, avatar_url, username');
    if (data) setAllMembers(data);
  };

  const fetchPosts = async () => {
    if(!supabase) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`
          *, 
          profiles:user_id (first_name, last_name, username, avatar_url, instagram_handle), 
          post_likes (user_id), 
          comments (*, profiles:user_id (first_name, last_name, username, avatar_url)),
          original_post:original_post_id (
            id, content, media_url, created_at,
            profiles:user_id (first_name, last_name, username, avatar_url, instagram_handle)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
    }
  };

  // --- PROFILE ACTIONS ---
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !supabase || !userId) return;
      setIsUploadingAvatar(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
      await fetchPosts(); // Refresh feed to show new avatar
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar. Did you create the "avatars" public bucket?');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId) return;
    setIsSavingProfile(true);
    try {
      await supabase.from('profiles').update({
        display_name: profile.display_name,
        username: profile.username.replace('@', ''),
        instagram_handle: profile.instagram_handle.replace('@', ''),
      }).eq('id', userId);
      alert("Profile saved successfully!");
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- FEED ACTIONS ---
  const handleFetchVerse = async () => {
    if (!verseMatch) return;
    setFetchingVerse(true);
    try {
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(verseMatch[1])}`);
      const data = await response.json();
      
      if (data.text) {
         const cleanText = data.text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
         const replacement = `"${cleanText}" - ${data.reference}`;
         setNewPostText(newPostText.replace(verseMatch[0], replacement));
      } else {
         setError("Could not find that verse. Please check the spelling!");
      }
    } catch (e) {
      setError("Bible API is currently unavailable.");
    }
    setFetchingVerse(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId) return;
    if (!newPostText.trim() && !mediaFile && !repostTarget) return; 
    
    setPosting(true);
    setError(null);
    let media_url = null;

    try {
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${userId}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('setups').upload(fileName, mediaFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('setups').getPublicUrl(fileName);
        media_url = publicUrl;
      }

      const { data: newPostData, error: postError } = await supabase.from('posts').insert([{ 
        user_id: userId, 
        content: newPostText.trim(), 
        media_url,
        original_post_id: repostTarget?.id || null 
      }]).select().single();
      
      if (postError) throw postError;

      // Notifications
      if (repostTarget && repostTarget.user_id !== userId) {
        await supabase.from('notifications').insert([{
          user_id: repostTarget.user_id,
          actor_id: userId,
          type: 'repost',
          post_id: newPostData.id
        }]);
      }

      setNewPostText('');
      setMediaFile(null);
      setMediaPreview(null);
      setRepostTarget(null);
      await fetchPosts();
    } catch (err: any) {
      setError(err.message);
    }
    setPosting(false);
  };

  const saveEdit = async (postId: string) => {
    if (!editContent.trim() || !supabase) return;
    try {
      await supabase.from('posts').update({ content: editContent.trim(), is_edited: true }).eq('id', postId);
      setEditingPostId(null);
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const toggleLike = async (postId: string, currentLikes: any[] = []) => {
    if (!userId || !supabase) return;
    const isLiked = currentLikes.some(like => like.user_id === userId);
    try {
      if (isLiked) {
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId });
      } else {
        await supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
        
        const post = posts.find(p => p.id === postId);
        if (post && post.user_id !== userId) {
          await supabase.from('notifications').insert([{
            user_id: post.user_id, actor_id: userId, type: 'post_like', post_id: postId
          }]);
        }
      }
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const submitComment = async (postId: string) => {
    if (!commentText.trim() || !userId || !supabase) return;
    try {
      await supabase.from('comments').insert([{ post_id: postId, user_id: userId, content: commentText.trim() }]);
      
      const post = posts.find(p => p.id === postId);
      if (post && post.user_id !== userId) {
        await supabase.from('notifications').insert([{
          user_id: post.user_id, actor_id: userId, type: 'new_comment', post_id: postId
        }]);
      }

      setCommentText('');
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/hub?tab=community&postId=${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000); 
    } catch (err) { console.error('Failed to copy link', err); }
  };

  const initiateRepost = (post: any) => {
    setRepostTarget(post.original_post || post);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const deletePost = async (postId: string) => {
    if (!supabase || !window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await supabase.from('posts').delete().eq('id', postId);
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  // --- MENTIONS LOGIC ---
  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, target: 'post' | 'comment') => {
    const val = e.target.value;
    if (target === 'post') setNewPostText(val);
    if (target === 'comment') setCommentText(val);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);

    if (match) {
      setMentionQuery(match[1].toLowerCase());
      setMentionTarget(target);
    } else {
      setMentionQuery(null);
      setMentionTarget(null);
    }
  };

  const insertMention = (member: any) => {
    const mentionName = `@${member.username || member.first_name || 'user'}`.replace(/\s+/g, '');
    
    if (mentionTarget === 'post') {
      const newText = newPostText.replace(/(^|\s)@([a-zA-Z0-9_]*)$/, `$1${mentionName} `);
      setNewPostText(newText);
    } else if (mentionTarget === 'comment') {
      const newText = commentText.replace(/(^|\s)@([a-zA-Z0-9_]*)$/, `$1${mentionName} `);
      setCommentText(newText);
    }
    
    setMentionQuery(null);
    setMentionTarget(null);
  };

  const renderContentWithMentions = (text: string) => {
    if (!text) return null;
    return text.split(/(@\w+)/g).map((part, index) => {
      if (part.startsWith('@')) {
        return <span key={index} className="text-[#ff4d00] font-medium cursor-pointer hover:underline">{part}</span>;
      }
      return part;
    });
  };

  const filteredMentions = mentionQuery !== null
    ? allMembers.filter(m => {
        const fullName = `${m.first_name || ''} ${m.last_name || ''} ${m.username || ''}`.toLowerCase();
        return fullName.includes(mentionQuery);
      }).slice(0, 5) 
    : [];

  const MentionDropdown = () => {
    if (mentionQuery === null || filteredMentions.length === 0) return null;
    return (
      <div className="absolute bottom-[calc(100%+8px)] left-0 w-64 bg-[#131313] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
        <div className="p-2 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 bg-white/5">Mentions</div>
        {filteredMentions.map(m => (
          <div key={m.id} onClick={() => insertMention(m)} className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-6 h-6 rounded-full bg-black overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
              {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : <User size={12} className="text-white/20" />}
            </div>
            <span className="text-sm font-medium text-white truncate">{m.first_name} @{m.username}</span>
          </div>
        ))}
      </div>
    );
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

  const UserAvatar = ({ url, letter, size = "w-10 h-10", textClass = "text-sm" }: { url?: string | null, letter: string, size?: string, textClass?: string }) => (
    <div className={`${size} rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative`}>
      {url ? <img src={url} alt="Avatar" className="w-full h-full object-cover" /> : <span className={`text-white/70 font-bold uppercase ${textClass}`}>{letter}</span>}
    </div>
  );

  return (
    <div className="h-screen bg-[#050505] text-[#F5F5F0] font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* MOBILE TOP HEADER */}
      <div className="md:hidden flex items-center justify-between p-5 border-b border-white/5 bg-[#111] z-30 shrink-0">
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <h2 className="text-lg font-black uppercase tracking-widest text-white leading-none">Sanctuary</h2>
          <p className="text-[10px] text-[#ff4d00] font-bold uppercase tracking-widest mt-1 leading-none">Control Room</p>
        </div>
        <button onClick={handleSignOut} className="text-white/40 hover:text-red-400 p-2"><LogOut size={20} /></button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="w-64 bg-[#111] border-r border-white/5 hidden md:flex flex-col z-20 shrink-0">
        <div onClick={() => navigate('/')} className="p-6 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
          <h2 className="text-xl font-black uppercase tracking-widest text-white">Sanctuary</h2>
          <p className="text-xs text-[#ff4d00] font-bold uppercase tracking-widest mt-1">Control Room</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-2">
          <button onClick={() => setActiveTab('blueprint')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'blueprint' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={18} /> My Blueprint
          </button>
          <button onClick={() => setActiveTab('community')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'community' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <Compass size={18} /> Kingdom Network
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <User size={18} /> My Profile
          </button>
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Home size={18} /> Back to Main Site
          </button>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut size={18} /> Sign Out
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
            {/* ==================== BLUEPRINT TAB ==================== */}
            {activeTab === 'blueprint' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative max-w-6xl mx-auto md:mx-0">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">My Studio Blueprint</h1>
                <p className="text-white/50 text-sm md:text-base mb-6 md:mb-8">Your personalized gear list, setup instructions, and direct support access.</p>
                
                {blueprint ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-[#131313] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6">Action Items / Gear to Order</h3>
                        {blueprint.gear_list && blueprint.gear_list.length > 0 ? (
                          <div className="space-y-3">
                            {blueprint.gear_list.map((item: any, index: number) => (
                              <div key={index} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer" onClick={() => toggleGearItem(index)}>
                                <input type="checkbox" checked={item.checked} readOnly className="w-5 h-5 accent-[#ff4d00] pointer-events-none shrink-0" />
                                <span className={`text-sm ${item.checked ? 'text-white/40 line-through' : 'text-white'}`}>{item.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white/40 text-sm italic p-4 bg-white/5 rounded-xl border border-white/5">Mike is currently building your gear list...</p>
                        )}
                      </div>
                      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col justify-center items-center text-center shadow-xl h-full min-h-[250px]">
                        <Video size={40} className="text-[#ff4d00] mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Consultation Recording</h3>
                        <p className="text-xs text-white/50 mb-6">Watch our 1-hour session replay where we mapped out this room.</p>
                        {blueprint.video_url ? (
                          <a href={blueprint.video_url} target="_blank" rel="noopener noreferrer" className="bg-[#ff4d00] hover:bg-orange-500 text-black text-sm font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-colors w-full">Watch Replay</a>
                        ) : (
                          <button disabled className="bg-white/5 text-white/30 text-sm font-bold py-3 px-6 rounded-xl cursor-not-allowed border border-white/10 w-full">Video Processing...</button>
                        )}
                      </div>
                    </div>
                    <div className="bg-[#131313] border border-[#ff4d00]/20 p-6 md:p-8 rounded-3xl shadow-[0_0_30px_rgba(255,77,0,0.05)] flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d00]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                      <div className="flex items-center gap-3 mb-2 relative z-10 flex-wrap">
                        <MessageSquare className="text-[#ff4d00]" size={24} />
                        <h3 className="text-xl font-black uppercase tracking-tight text-white">Director's Hotline</h3>
                        <span className="bg-[#ff4d00]/20 text-[#ff4d00] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-[#ff4d00]/30">Premium</span>
                      </div>
                      <p className="text-white/50 text-sm mb-6 relative z-10 max-w-2xl">Stuck on a tech issue? Drop a quick video or message here.</p>
                      <div className="flex flex-col sm:flex-row gap-2 relative z-10">
                        <input type="text" placeholder="Type your issue or drop a video link..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ff4d00] text-white transition-colors" />
                        <button className="bg-[#ff4d00] text-black font-black uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-orange-500 transition-colors shadow-lg w-full sm:w-auto">Send</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden border border-white/5 mt-4">
                    <div className="space-y-6 p-4 md:p-8 blur-md opacity-30 select-none pointer-events-none bg-[#0a0a0a]">
                      <div className="h-48 bg-[#131313] rounded-3xl border border-white/10"></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/70 backdrop-blur-sm p-6 text-center">
                      <Lock size={32} className="text-[#ff4d00] mb-4" />
                      <h2 className="text-xl md:text-3xl font-black uppercase text-white tracking-widest mb-3">Sanctuary Locked</h2>
                      <p className="text-white/70 mb-6 text-sm">Book a session to unlock your custom gear list.</p>
                      <button onClick={() => navigate('/#pricing-section')} className="bg-[#ff4d00] text-black px-6 py-4 rounded-xl font-black uppercase tracking-widest shadow-lg text-xs md:text-sm">Book Consultation</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== KINGDOM NETWORK TAB ==================== */}
            {activeTab === 'community' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                <div className="text-center mb-8 md:mb-10">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">Kingdom Network</h1>
                  <p className="text-white/50 text-xs md:text-sm">Connect, collaborate, and share your space.</p>
                </div>

                {error && (
                  <div className="mb-4 bg-red-500/10 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto"><X size={14}/></button>
                  </div>
                )}

                {/* POST COMPOSER */}
                <div className="bg-[#131313] p-4 md:p-5 rounded-3xl border border-white/10 mb-8 shadow-lg focus-within:border-[#ff4d00]/50 transition-colors relative">
                  {mentionTarget === 'post' && <MentionDropdown />}
                  <form onSubmit={handlePost} className="flex gap-3 md:gap-4">
                    <UserAvatar url={profile.avatar_url} letter={profile.avatar_letter} />
                    <div className="flex-1 pt-2">
                      <textarea 
                        value={newPostText} 
                        onChange={e => handleTextInput(e, 'post')} 
                        placeholder={repostTarget ? "Add a quote to this repost..." : "Share your setup, ask for feedback... (Use @ to tag)"} 
                        className="w-full bg-transparent border-none text-[#F5F5F0] focus:ring-0 text-sm placeholder:text-white/30 resize-none p-0" 
                        rows={newPostText.split('\n').length > 1 ? newPostText.split('\n').length : 2}
                      />
                      
                      {mediaPreview && (
                        <div className="mt-3 relative inline-block">
                          {mediaFile?.type.startsWith('video/') ? (
                            <video src={mediaPreview} controls loop playsInline className="rounded-xl max-h-64 border border-white/10" />
                          ) : (
                            <img src={mediaPreview} className="rounded-xl max-h-64 border border-white/10" />
                          )}
                          <button type="button" onClick={() => {setMediaFile(null); setMediaPreview(null);}} className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 text-white rounded-full hover:bg-black transition-colors"><X size={14}/></button>
                        </div>
                      )}

                      {repostTarget && (
                        <div className="mt-3 p-3 border border-white/10 rounded-xl relative bg-black/20">
                          <button type="button" onClick={() => setRepostTarget(null)} className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors"><X size={14}/></button>
                          <div className="flex items-center gap-2 mb-1 text-white/40">
                            <Repeat size={12} />
                            <p className="text-[10px] font-bold uppercase tracking-wider">Quote Repost</p>
                          </div>
                          <p className="text-sm text-white/80 line-clamp-2">{repostTarget.content}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                         <div className="flex items-center gap-4 text-white/40">
                           <label className="cursor-pointer hover:text-[#ff4d00] transition-colors p-2 rounded-full hover:bg-white/5">
                             <ImageIcon size={18} />
                             <input type="file" className="hidden" accept="image/*,video/*" onChange={e => {
                               if (e.target.files?.[0]) { setMediaFile(e.target.files[0]); setMediaPreview(URL.createObjectURL(e.target.files[0])); }
                             }} />
                           </label>
                           
                           {verseMatch && (
                             <button type="button" onClick={handleFetchVerse} disabled={fetchingVerse} className="flex items-center gap-1.5 text-xs text-[#ff4d00] hover:text-orange-400 transition-colors bg-[#ff4d00]/10 px-3 py-1.5 rounded-full">
                               <BookOpen size={14} /> {fetchingVerse ? 'Fetching...' : `Fetch ${verseMatch[1]}`}
                             </button>
                           )}
                         </div>

                         <button type="submit" disabled={posting || (!newPostText.trim() && !mediaFile && !repostTarget)} className="bg-[#ff4d00] disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed text-black px-6 py-2 rounded-full font-bold text-sm transition-colors shadow-lg">
                           {posting ? 'Posting...' : 'Post'}
                         </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* FEED LIST */}
                <div className="flex flex-col space-y-6">
                  {posts.length === 0 && <p className="text-center text-white/40 italic">No posts yet. Be the first to share!</p>}
                  
                  {posts.map((post) => {
                    const postLikes = post.post_likes || [];
                    const postComments = post.comments || [];
                    const isLiked = postLikes.some((l: any) => l.user_id === userId);
                    const isTargeted = targetPostId === post.id;
                    const isMyPost = userId === post.user_id;
                    const isVideoMedia = post.media_url?.match(/\.(mp4|webm|ogg|mov)$/i);

                    return (
                      <div key={post.id} id={`post-${post.id}`} className={`bg-transparent group ${isTargeted ? 'bg-white/5 p-4 -mx-4 rounded-3xl' : ''}`}>
                        
                        {post.original_post && (
                          <div className="flex items-center gap-2 text-white/40 text-[11px] font-bold mb-3 ml-12 md:ml-14">
                            <Repeat size={12} /> Reposted
                          </div>
                        )}

                        <div className="flex gap-3 md:gap-4">
                          {/* Thread Column */}
                          <div className="flex flex-col items-center">
                            <UserAvatar url={post.profiles?.avatar_url} letter={post.profiles?.first_name?.charAt(0) || 'U'} />
                            {(openCommentId === post.id || postComments.length > 0) && (
                               <div className="w-[1.5px] h-full bg-white/5 mt-3 rounded-full group-last:hidden"></div>
                            )}
                          </div>

                          {/* Content Column */}
                          <div className="flex-grow min-w-0 pb-2">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white text-sm hover:underline cursor-pointer truncate">
                                  {post.profiles?.first_name || 'Member'} {post.profiles?.last_name || ''}
                                </span>
                                <span className="text-white/30 text-xs truncate hidden sm:inline">@{post.profiles?.username}</span>
                                {post.profiles?.instagram_handle && (
                                  <a href={`https://instagram.com/${post.profiles.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-[#E1306C] transition-colors">
                                    <Instagram size={14} />
                                  </a>
                                )}
                                <span className="text-white/30 text-xs shrink-0 ml-1">· {new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                {post.is_edited && <span className="text-[10px] text-white/20 italic ml-1">(edited)</span>}
                              </div>
                              
                              {isMyPost && (
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); }} className="text-white/20 hover:text-blue-400 transition-colors"><Pencil size={14} /></button>
                                  <button onClick={() => deletePost(post.id)} className="text-white/20 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                </div>
                              )}
                            </div>
                            
                            {/* Editable Content */}
                            {editingPostId === post.id ? (
                              <div className="mb-3 mt-2 bg-black/40 p-3 rounded-xl border border-[#ff4d00]/30">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full bg-transparent border-none text-[#F5F5F0] focus:ring-0 text-sm resize-none p-0"
                                  rows={editContent.split('\n').length > 1 ? editContent.split('\n').length : 2}
                                />
                                <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-white/10">
                                  <button onClick={() => setEditingPostId(null)} className="text-xs text-white/40 hover:text-white">Cancel</button>
                                  <button onClick={() => saveEdit(post.id)} className="bg-[#ff4d00] text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">Save</button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-white/80 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
                                {renderContentWithMentions(post.content)}
                              </p>
                            )}

                            {/* Media Attachment */}
                            {post.media_url && (
                              <div className="rounded-2xl overflow-hidden mb-4 border border-white/5 bg-black/20">
                                {isVideoMedia ? (
                                  <video src={post.media_url} controls playsInline className="w-full max-h-96 object-contain" />
                                ) : (
                                  <img src={post.media_url} className="w-full max-h-96 object-cover" />
                                )}
                              </div>
                            )}

                            {/* Repost Render */}
                            {post.original_post && (
                              <div className="mt-2 mb-4 p-4 border border-white/10 rounded-2xl bg-[#131313]/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <UserAvatar url={post.original_post.profiles?.avatar_url} letter={post.original_post.profiles?.first_name?.charAt(0) || 'U'} size="w-5 h-5" textClass="text-[10px]" />
                                  <span className="font-bold text-white text-xs">{post.original_post.profiles?.first_name} {post.original_post.profiles?.last_name}</span>
                                </div>
                                <p className="text-white/70 text-sm line-clamp-3">{post.original_post.content}</p>
                                {post.original_post.media_url && (
                                  <div className="mt-2 rounded-xl overflow-hidden max-h-32 border border-white/5">
                                    <img src={post.original_post.media_url} className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ACTION BAR */}
                            <div className="flex items-center gap-6 mt-1">
                              <button onClick={() => toggleLike(post.id, postLikes)} className={`flex items-center gap-1.5 transition-colors group/btn ${isLiked ? 'text-red-500' : 'text-white/40 hover:text-red-400'}`}>
                                <div className={`p-1.5 rounded-full ${isLiked ? 'bg-red-500/10' : 'group-hover/btn:bg-red-400/10'}`}>
                                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                                </div>
                                <span className="text-xs font-medium">{postLikes.length > 0 ? postLikes.length : ''}</span>
                              </button>
                              
                              <button onClick={() => setOpenCommentId(openCommentId === post.id ? null : post.id)} className="flex items-center gap-1.5 text-white/40 hover:text-blue-400 transition-colors group/btn">
                                <div className={`p-1.5 rounded-full ${openCommentId === post.id ? 'bg-blue-400/10 text-blue-400' : 'group-hover/btn:bg-blue-400/10'}`}>
                                  <MessageCircle size={16} className={openCommentId === post.id ? 'fill-current' : ''} />
                                </div>
                                <span className="text-xs font-medium">{postComments.length > 0 ? postComments.length : ''}</span>
                              </button>

                              <button onClick={() => initiateRepost(post)} className="flex items-center gap-1.5 text-white/40 hover:text-green-400 transition-colors group/btn">
                                <div className="p-1.5 rounded-full group-hover/btn:bg-green-400/10"><Repeat size={16} /></div>
                              </button>

                              <button onClick={() => handleShare(post.id)} className="flex items-center gap-1.5 text-white/40 hover:text-purple-400 transition-colors group/btn">
                                <div className="p-1.5 rounded-full group-hover/btn:bg-purple-400/10"><Share2 size={16} /></div>
                                {copiedId === post.id && <span className="text-[10px] text-purple-400">Copied!</span>}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* COMMENTS DROPDOWN */}
                        {(openCommentId === post.id || postComments.length > 0) && (
                          <div className="mt-2 pl-12 md:pl-14 space-y-4">
                            
                            {/* Render Comments */}
                            {postComments.map((comment: any) => (
                              <div key={comment.id} className="flex gap-3 relative">
                                <UserAvatar url={comment.profiles?.avatar_url} letter={comment.profiles?.first_name?.charAt(0) || 'U'} size="w-6 h-6" textClass="text-[10px]" />
                                <div className="flex-1 bg-black/40 rounded-2xl p-3 border border-white/5">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-white text-xs">{comment.profiles?.first_name} {comment.profiles?.last_name}</span>
                                    <span className="text-white/30 text-[10px]">@{comment.profiles?.username} · {new Date(comment.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-white/70 text-xs whitespace-pre-wrap break-words">{renderContentWithMentions(comment.content)}</p>
                                </div>
                              </div>
                            ))}

                            {/* Reply Input */}
                            {openCommentId === post.id && (
                              <div className="flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-top-2 relative">
                                {mentionTarget === 'comment' && <MentionDropdown />}
                                <UserAvatar url={profile.avatar_url} letter={profile.avatar_letter} size="w-8 h-8" textClass="text-xs" />
                                <div className="flex-1 bg-black border border-[#ff4d00]/30 rounded-2xl flex items-center pr-2 focus-within:border-[#ff4d00] transition-colors">
                                  <input 
                                    type="text" 
                                    autoFocus
                                    value={commentText}
                                    onChange={(e) => handleTextInput(e, 'comment')}
                                    placeholder={`Reply to @${post.profiles?.username || 'member'}...`}
                                    className="flex-1 bg-transparent border-none text-white text-xs md:text-sm px-4 py-3 focus:outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                                  />
                                  <button onClick={() => submitComment(post.id)} disabled={!commentText.trim()} className="p-2 text-[#ff4d00] disabled:text-white/20 hover:bg-[#ff4d00]/10 rounded-xl transition-colors">
                                    <Send size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==================== MY PROFILE TAB ==================== */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                <div className="text-center mb-8 md:mb-10">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">My Profile</h1>
                  <p className="text-white/50 text-xs md:text-sm">Manage how you appear in the Kingdom Network.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="bg-[#131313] border border-white/10 rounded-3xl p-5 md:p-8 shadow-xl">
                  
                  {/* AVATAR UPLOAD */}
                  <div className="flex items-center gap-4 md:gap-6 mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1a1a1a] border-2 border-white/10 flex items-center justify-center text-3xl font-black text-white/50 overflow-hidden group-hover:border-[#ff4d00] transition-colors">
                        {isUploadingAvatar ? (
                           <div className="w-5 h-5 border-2 border-[#ff4d00] border-t-transparent rounded-full animate-spin" />
                        ) : profile.avatar_url ? (
                           <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                           profile.avatar_letter
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera size={24} className="text-white" />
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white">Profile Picture</h3>
                      <p className="text-xs text-white/40 mt-1">Tap the image to upload a new avatar.</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={profile.display_name} 
                        onChange={(e) => setProfile({...profile, display_name: e.target.value, avatar_letter: profile.avatar_url ? profile.avatar_letter : e.target.value.charAt(0).toUpperCase()})}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Username (For @Mentions)</label>
                      <div className="flex relative">
                        <span className="absolute left-4 top-3 text-white/30 font-bold">@</span>
                        <input 
                          type="text" 
                          value={profile.username} 
                          onChange={(e) => setProfile({...profile, username: e.target.value.replace('@', '')})}
                          className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Instagram Handle</label>
                      <div className="flex relative">
                        <span className="absolute left-4 top-3 text-white/30"><Instagram size={16} /></span>
                        <input 
                          type="text" 
                          value={profile.instagram_handle} 
                          placeholder="e.g. mike.creates"
                          onChange={(e) => setProfile({...profile, instagram_handle: e.target.value.replace('@', '')})}
                          className="w-full bg-black border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white transition-colors"
                        />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/5 mt-6">
                      <button type="submit" disabled={isSavingProfile} className="bg-[#ff4d00] text-black font-black uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-orange-500 transition-colors shadow-lg disabled:opacity-50 w-full md:w-auto">
                        {isSavingProfile ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#111]/95 backdrop-blur-md border-t border-white/5 flex justify-around items-center p-3 z-30 pb-safe">
        <button onClick={() => setActiveTab('blueprint')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'blueprint' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Blueprint</span>
        </button>
        <button onClick={() => setActiveTab('community')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'community' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <Compass size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Network</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'profile' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <User size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
}
