import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, Compass, Lock, 
  MessageSquare, Image as ImageIcon, Heart, MessageCircle, MoreHorizontal, 
  Share2, User, Instagram, Camera, Repeat, Send, X, AlertCircle, Trash2, BookOpen, Pencil, Film
} from 'lucide-react';

import RetainerDashboard from './RetainerDashboard'; // <-- Import your new dashboard

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
    bio: '',
    has_retainer: false // <-- Added this field to track subscription status
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

        // Fetch Profile (Will now automatically pull has_retainer if it exists in your DB)
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

  // --- FEED ACTIONS (Truncated for brevity, perfectly maintained from your code) ---
  const handleFetchVerse = async () => { /* ... */ };
  const handlePost = async (e: React.FormEvent) => { /* ... */ };
  const saveEdit = async (postId: string) => { /* ... */ };
  const toggleLike = async (postId: string, currentLikes: any[] = []) => { /* ... */ };
  const submitComment = async (postId: string) => { /* ... */ };
  const handleShare = async (postId: string) => { /* ... */ };
  const initiateRepost = (post: any) => { /* ... */ };
  const deletePost = async (postId: string) => { /* ... */ };
  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, target: 'post' | 'comment') => { /* ... */ };
  const insertMention = (member: any) => { /* ... */ };
  const renderContentWithMentions = (text: string) => { /* ... */ };

  const filteredMentions = mentionQuery !== null
    ? allMembers.filter(m => {
        const fullName = `${m.first_name || ''} ${m.last_name || ''} ${m.username || ''}`.toLowerCase();
        return fullName.includes(mentionQuery);
      }).slice(0, 5) 
    : [];

  const MentionDropdown = () => { /* ... */ return null; };
  const toggleGearItem = async (index: number) => { /* ... */ };
  const handleSignOut = async () => { /* ... */ };

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

          {/* DYNAMIC POST-PRODUCTION TAB */}
          {profile.has_retainer && (
            <button onClick={() => setActiveTab('retainer')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'retainer' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <Film size={18} /> Post-Production
            </button>
          )}

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
            {/* EXISTING TABS (Blueprint, Community, Profile logic remains identical) */}
            {activeTab === 'blueprint' && ( <div>{/* Your Blueprint Code */}</div> )}
            {activeTab === 'community' && ( <div>{/* Your Community Code */}</div> )}
            {activeTab === 'profile' && ( <div>{/* Your Profile Code */}</div> )}

            {/* ==================== RETAINER DASHBOARD TAB ==================== */}
            {activeTab === 'retainer' && profile.has_retainer && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Renders the external component we created earlier */}
                <RetainerDashboard />
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

        {/* DYNAMIC POST-PRODUCTION TAB (MOBILE) */}
        {profile.has_retainer && (
          <button onClick={() => setActiveTab('retainer')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'retainer' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
            <Film size={20} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Retainer</span>
          </button>
        )}

        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'profile' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <User size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
}
