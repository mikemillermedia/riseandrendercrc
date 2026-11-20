import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, FolderDown, Lock, 
  User, Film, Sparkles, BookOpen, Camera, Save, Users, MessageSquare, Heart, Send, BookHeart
} from 'lucide-react';

import RetainerDashboard from './RetainerDashboard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// MOCK DATA FOR TIMELINE & PRAYERS (Replace with Supabase fetches later)
const MOCK_POSTS = [
  { id: 1, author: 'Mike Miller', avatar: '', time: '2 hours ago', content: 'Just dropped the new lighting blueprint in the Asset Vault! Let me know what you guys think of the new Amaran setups.', likes: 12 },
  { id: 2, author: 'Sarah L.', avatar: 'S', time: '5 hours ago', content: 'Finally got my cables routed and the studio looks so clean. Hitting record on episode 1 tonight!', likes: 8 },
];

const MOCK_PRAYERS = [
  { id: 1, author: 'Jasmine M.', time: '1 day ago', content: 'Praying for clarity as I rebrand the podcast this week. Feeling a bit overwhelmed with the direction.', praying: 5 },
  { id: 2, author: 'Barron D.', time: '2 days ago', content: 'Praise report! We just hit 10k downloads on the latest series.', praying: 15 },
];

export default function Hub() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('vault'); 
  const [isLoading, setIsLoading] = useState(true);

  // USER & BLUEPRINT STATE
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
    bible_verse: '', // NEW BIBLE VERSE FIELD
    has_retainer: false,
    is_community_member: true // Determines if they can see the timeline
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // TIMELINE STATE
  const [newPost, setNewPost] = useState('');
  const [newPrayer, setNewPrayer] = useState('');

  // INITIALIZATION
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
          setProfile({
            ...profileData,
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            username: profileData.username || '',
            instagram_handle: profileData.instagram_handle || '',
            bio: profileData.bio || '',
            bible_verse: profileData.bible_verse || '',
            avatar_url: profileData.avatar_url || '',
            is_community_member: profileData.is_community_member ?? true // Defaulting to true for demo
          });
        }

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, [navigate]);

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

    } catch (error: any) {
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId) return;
    
    setIsSavingProfile(true);
    try {
      const displayName = `${profile.first_name} ${profile.last_name}`.trim() || profile.username || 'Creator';
      
      const { error } = await supabase.from('profiles').update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        display_name: displayName,
        username: profile.username,
        instagram_handle: profile.instagram_handle,
        bio: profile.bio,
        bible_verse: profile.bible_verse
      }).eq('id', userId);

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(`Error saving profile: ${error.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newPassword) return;
    
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      alert("Password updated successfully!");
      setNewPassword('');
    } catch (error: any) {
      alert(`Error updating password: ${error.message}`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-[#F5F5F0] font-sans flex flex-col md:flex-row overflow-hidden selection:bg-[#ff4d00] selection:text-black">
      
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
          
          <button onClick={() => setActiveTab('vault')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <FolderDown size={18} /> Asset Vault
          </button>

          {/* NEW COMMUNITY TAB */}
          {profile.is_community_member && (
            <button onClick={() => setActiveTab('community')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'community' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <Users size={18} /> Inner Circle
            </button>
          )}

          {blueprint && (
            <button onClick={() => setActiveTab('blueprint')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'blueprint' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <LayoutDashboard size={18} /> My Blueprint
            </button>
          )}

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
            {/* ASSET VAULT TAB */}
            {activeTab === 'vault' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto space-y-12">
                <div className="text-center">
                  <span className="bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-3 inline-block">
                    Digital Resources & Services
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
                    Asset <span className="text-[#ff4d00]">Vault</span>
                  </h1>
                  <p className="text-white/50 text-xs md:text-sm max-w-lg mx-auto">
                    Exclusive guides, tools, and blueprints engineered by Rise & Render.
                  </p>
                </div>

                <div className="bg-[#131313] border border-[#ff4d00]/30 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-[0_0_40px_rgba(255,77,0,0.12)]">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/10 rounded-full blur-[110px] pointer-events-none" />
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                    <div className="md:col-span-5 flex justify-center items-center py-4">
                      <div className="relative group cursor-pointer" style={{ perspective: '1200px' }}>
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#ff4d00] to-orange-600 rounded-xl blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                        <div className="relative w-48 sm:w-56 h-72 sm:h-80 transition-transform duration-500 ease-out" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-20deg) rotateX(10deg)' }}>
                          <div className="absolute inset-0 bg-[#111] rounded-r-md overflow-hidden border border-white/20 shadow-2xl z-10" style={{ transform: 'translateZ(12px)' }}>
                            <img src="https://pub-251ee1b2d0ef473aa21849e9f5d1bfae.r2.dev/Rise%20%26%20Render%20Content%20Kit%20Image.jpg" alt="Kit Cover" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-4 text-left">
                      <div className="flex items-center gap-2 text-[#ff4d00] text-xs font-bold uppercase tracking-widest">
                        <Sparkles size={16} /> Official Digital Guide
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-tight leading-tight">
                        The Content Creator Studio Kit
                      </h2>
                      <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                        A proven, no-guesswork at-home studio setup for small business owners and entrepreneurs who want their podcast to look and sound professional.
                      </p>
                      <div className="pt-2">
                        <a href="https://pub-251ee1b2d0ef473aa21849e9f5d1bfae.r2.dev/The%20Content%20Creator%20Studio%20Kit%20(1).pdf" target="_blank" rel="noopener noreferrer" className="inline-flex bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl text-xs items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,77,0,0.35)] transition-all">
                          <BookOpen size={16} /> Open Guide
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative w-full pb-8">
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#ff4d00]/40 text-[#ff4d00] font-black uppercase tracking-widest px-6 md:px-10 py-5 rounded-2xl shadow-[0_0_50px_rgba(255,77,0,0.3)] flex items-center gap-3 text-sm md:text-base">
                      <Lock size={20} className="text-[#ff4d00]" /> MORE FREEBIES COMING SOON
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30 filter blur-[6px] select-none pointer-events-none">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-[#131313] border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[380px]">
                        <div className="h-48 bg-[#1a1a1a]"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NEW: INNER CIRCLE COMMUNITY TAB */}
            {activeTab === 'community' && profile.is_community_member && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-white/10 pb-6">
                  <div>
                    <span className="bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-3 inline-flex items-center gap-1.5">
                      <Lock size={12} /> Invite-Only Group
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2">The Inner Circle</h1>
                    <p className="text-white/50 text-xs md:text-sm">Connect with other purpose-driven creators. Share setups, updates, and prayer requests.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* MAIN TIMELINE FEED */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Create Post Input */}
                    <div className="bg-[#131313] border border-white/10 p-5 rounded-3xl shadow-xl flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-[#222] border border-white/10 shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                        {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : profile.first_name?.[0] || 'C'}
                      </div>
                      <div className="flex-1">
                        <textarea 
                          rows={2} 
                          placeholder="Share a studio update, win, or question..." 
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="w-full bg-transparent text-white text-sm focus:outline-none resize-none placeholder:text-white/30"
                        />
                        <div className="flex justify-end mt-2 pt-3 border-t border-white/5">
                          <button className="bg-white/10 hover:bg-[#ff4d00] text-white hover:text-black transition-colors px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            Post <Send size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Feed Posts */}
                    <div className="space-y-4">
                      {MOCK_POSTS.map(post => (
                        <div key={post.id} className="bg-[#131313] border border-white/10 p-6 rounded-3xl shadow-xl">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-sm font-bold text-white/50 shrink-0">
                              {post.avatar || post.author[0]}
                            </div>
                            <div>
                              <p className="text-white text-sm font-bold">{post.author}</p>
                              <p className="text-white/40 text-[10px] uppercase tracking-wider">{post.time}</p>
                            </div>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed mb-4">{post.content}</p>
                          <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                            <button className="flex items-center gap-1.5 text-white/40 hover:text-[#ff4d00] transition-colors text-xs font-bold">
                              <Heart size={16} /> {post.likes}
                            </button>
                            <button className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs font-bold">
                              <MessageSquare size={16} /> Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: PRAYER WALL */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#131313] border border-[#ff4d00]/20 p-6 rounded-3xl shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4d00]/10 rounded-full blur-[50px] pointer-events-none" />
                      
                      <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                        <BookHeart size={16} className="text-[#ff4d00]" /> Prayer Wall
                      </h3>
                      
                      <div className="mb-6 relative">
                        <input 
                          type="text" 
                          placeholder="Submit a prayer request..." 
                          value={newPrayer}
                          onChange={(e) => setNewPrayer(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ff4d00] transition-colors"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ff4d00] p-1 hover:scale-110 transition-transform">
                          <Send size={14} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {MOCK_PRAYERS.map(prayer => (
                          <div key={prayer.id} className="bg-black/50 border border-white/5 p-4 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-white text-xs font-bold">{prayer.author}</p>
                              <p className="text-white/30 text-[9px] uppercase tracking-wider">{prayer.time}</p>
                            </div>
                            <p className="text-white/70 text-xs leading-relaxed mb-3">{prayer.content}</p>
                            <button className="w-full bg-white/5 hover:bg-[#ff4d00]/10 border border-white/5 hover:border-[#ff4d00]/30 text-white/50 hover:text-[#ff4d00] transition-all py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                              <Heart size={12} /> {prayer.praying} Praying
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* BLUEPRINT TAB */}
            {activeTab === 'blueprint' && blueprint && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">My Studio Blueprint</h1>
                <p className="text-white/50 text-sm mb-8">Your personalized gear list and instructions.</p>
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

            {/* PROFILE TAB (UPDATED WITH BIBLE VERSE) */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
                <div className="text-center mb-8 md:mb-10">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">My Profile</h1>
                  <p className="text-white/50 text-xs md:text-sm">Manage your Sanctuary account and Inner Circle identity.</p>
                </div>
                
                <div className="bg-[#131313] border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d00]/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <form onSubmit={handleSaveProfile} className="space-y-8 relative z-10">
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-white/5">
                      <div className="relative group shrink-0">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-white/10 group-hover:border-[#ff4d00]/50 transition-colors" />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-black border-2 border-white/10 flex items-center justify-center text-3xl font-black text-white/30 group-hover:border-[#ff4d00]/50 transition-colors uppercase">
                            {profile.first_name ? profile.first_name[0] : 'C'}
                          </div>
                        )}
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                          <Camera size={24} className="text-white" />
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploadingAvatar} />
                        </label>
                      </div>
                      <div className="text-center sm:text-left pt-2">
                        <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">Profile Photo</h3>
                        <p className="text-white/40 text-xs mb-3">Upload a square image. JPG, GIF, or PNG.</p>
                        {isUploadingAvatar && <span className="text-[#ff4d00] text-[10px] font-bold uppercase tracking-widest animate-pulse bg-[#ff4d00]/10 px-2.5 py-1 rounded">Uploading...</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">First Name</label>
                        <input type="text" value={profile.first_name} onChange={(e) => setProfile({...profile, first_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" placeholder="Your first name" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Last Name</label>
                        <input type="text" value={profile.last_name} onChange={(e) => setProfile({...profile, last_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" placeholder="Your last name" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Username</label>
                        <input type="text" value={profile.username} onChange={(e) => setProfile({...profile, username: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" placeholder="@creator" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Instagram Handle</label>
                        <input type="text" value={profile.instagram_handle} onChange={(e) => setProfile({...profile, instagram_handle: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" placeholder="e.g. riseandrender" />
                      </div>
                      
                      {/* NEW BIBLE VERSE FIELD */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-[#ff4d00] uppercase tracking-widest mb-2 flex items-center gap-2">
                          <BookHeart size={14} /> Favorite Bible Verse <span className="text-white/30 text-[9px]">(Optional)</span>
                        </label>
                        <input 
                          type="text" 
                          value={profile.bible_verse} 
                          onChange={(e) => setProfile({...profile, bible_verse: e.target.value})} 
                          className="w-full bg-black border border-[#ff4d00]/20 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" 
                          placeholder="e.g. Proverbs 16:3" 
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Short Bio</label>
                        <textarea rows={3} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors resize-none" placeholder="Tell the community about your mission..." />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <button type="submit" disabled={isSavingProfile} className="bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest px-8 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,77,0,0.2)] transition-all disabled:opacity-50 w-full sm:w-auto">
                        <Save size={16} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>

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

            {/* RETAINER DASHBOARD TAB */}
            {activeTab === 'retainer' && profile.has_retainer && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <RetainerDashboard userId={userId} supabase={supabase} />
              </div>
            )}
          </>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#111]/95 backdrop-blur-md border-t border-white/5 flex justify-around items-center p-3 z-30 pb-safe">
        
        <button onClick={() => setActiveTab('vault')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'vault' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <FolderDown size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Vault</span>
        </button>

        {profile.is_community_member && (
          <button onClick={() => setActiveTab('community')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'community' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
            <Users size={20} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Community</span>
          </button>
        )}

        {blueprint && (
          <button onClick={() => setActiveTab('blueprint')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'blueprint' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
            <LayoutDashboard size={20} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Blueprint</span>
          </button>
        )}

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