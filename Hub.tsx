import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, FolderDown, Lock, 
  User, Film, Sparkles, BookOpen, Camera, Save, Wrench, Calendar, ArrowUpRight
} from 'lucide-react';

import RetainerDashboard from './RetainerDashboard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function Hub() {
  const navigate = useNavigate();
  
  // Default tab for everyone is 'vault'
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
    has_retainer: false
  });

  // Profile Saving State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
            avatar_url: profileData.avatar_url || ''
          });
        }

      } catch (err) {
        console.error("Initialization error:", err);
      } font-sans finally {
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

  // AVATAR UPLOAD HANDLER
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

  // PROFILE SAVE HANDLER
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
        bio: profile.bio
      }).eq('id', userId);

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(`Error saving profile: ${error.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

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
          
          {/* ALWAYS VISIBLE: Asset Vault */}
          <button onClick={() => setActiveTab('vault')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <FolderDown size={18} /> Asset Vault
          </button>

          {/* UNLOCKED ONLY IF BLUEPRINT EXISTS IN DB */}
          {blueprint && (
            <button onClick={() => setActiveTab('blueprint')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'blueprint' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <LayoutDashboard size={18} /> My Blueprint
            </button>
          )}

          {/* UNLOCKED ONLY IF RETAINER CLIENT */}
          {profile.has_retainer && (
            <button onClick={() => setActiveTab('retainer')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'retainer' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <Film size={18} /> Post-Production
            </button>
          )}

          {/* ALWAYS VISIBLE: Profile */}
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
            {/* ASSET VAULT & SERVICES TAB */}
            {activeTab === 'vault' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto space-y-12">
                
                {/* PAGE HEADER */}
                <div className="text-center">
                  <span className="bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-3 inline-block">
                    Digital Resources & Services
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
                    Asset <span className="text-[#ff4d00]">Vault</span>
                  </h1>
                  <p className="text-white/50 text-xs md:text-sm max-w-lg mx-auto">
                    Exclusive guides, 1-on-1 consultations, post-production retainers, and full studio buildouts engineered by Rise & Render.
                  </p>
                </div>

                {/* 1. FEATURED DIGITAL RESOURCE: CREATOR STUDIO KIT */}
                <div className="bg-[#131313] border border-[#ff4d00]/30 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-[0_0_40px_rgba(255,77,0,0.12)]">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/10 rounded-full blur-[110px] pointer-events-none" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                    
                    {/* 3D SOFTWARE BOX MOCKUP */}
                    <div className="md:col-span-5 flex justify-center items-center py-4">
                      <div className="relative group cursor-pointer" style={{ perspective: '1200px' }}>
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#ff4d00] to-orange-600 rounded-xl blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />

                        <div 
                          className="relative w-48 sm:w-56 h-72 sm:h-80 transition-transform duration-500 ease-out"
                          style={{ 
                            transformStyle: 'preserve-3d', 
                            transform: 'rotateY(-20deg) rotateX(10deg)' 
                          }}
                        >
                          <div 
                            className="absolute inset-0 bg-[#111] rounded-r-md overflow-hidden border border-white/20 shadow-2xl z-10"
                            style={{ transform: 'translateZ(12px)' }}
                          >
                            <img 
                              src="https://pub-251ee1b2d0ef473aa21849e9f5d1bfae.r2.dev/Rise%20%26%20Render%20Content%20Kit%20Image.jpg"
                              alt="The Content Creator Studio Kit Cover" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
                          </div>

                          <div 
                            className="absolute top-0 left-0 w-6 h-full bg-[#0a0a0a] border-l border-y border-white/20 flex flex-col justify-between py-6 px-1 text-center shadow-inner z-0"
                            style={{ 
                              transformOrigin: 'left', 
                              transform: 'rotateY(-90deg) translateX(-24px)' 
                            }}
                          >
                            <span className="text-[8px] font-black tracking-widest text-[#ff4d00] uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>RISE + RENDER</span>
                            <span className="text-[8px] font-bold tracking-wider text-white/80 uppercase truncate" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>STUDIO KIT</span>
                            <div className="w-2 h-2 rounded-full bg-[#ff4d00] mx-auto" />
                          </div>

                          <div 
                            className="absolute top-0 left-0 w-full h-6 bg-[#222] border-t border-x border-white/20 z-0"
                            style={{ 
                              transformOrigin: 'top', 
                              transform: 'rotateX(90deg) translateY(-24px)' 
                            }}
                          />

                          <div 
                            className="absolute -bottom-6 left-2 right-2 h-6 bg-black/80 blur-md rounded-full transition-all" 
                            style={{ transform: 'rotateX(60deg) scale(0.95)' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* DETAILS & ACTION BUTTON */}
                    <div className="md:col-span-7 space-y-4 text-left">
                      <div className="flex items-center gap-2 text-[#ff4d00] text-xs font-bold uppercase tracking-widest">
                        <Sparkles size={16} /> Official Digital Guide
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-tight leading-tight">
                        The Content Creator Studio Kit
                      </h2>
                      <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                        A proven, no-guesswork at-home studio setup for small business owners and entrepreneurs who want their podcast to look and sound professional without overcomplicating the process.
                      </p>

                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <a 
                          href="https://pub-251ee1b2d0ef473aa21849e9f5d1bfae.r2.dev/The%20Content%20Creator%20Studio%20Kit%20(1).pdf"
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,77,0,0.35)] transition-all"
                        >
                          <BookOpen size={16} /> Open Guide
                        </a>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. SERVICES & UPGRADES SHOWCASE GRID */}
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                      <Sparkles className="text-[#ff4d00]" size={22} /> Studio Services & Upgrades
                    </h2>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">White-Glove Production Services</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* SERVICE CARD 1: VIRTUAL STUDIO CONSULTATION */}
                    <div className="bg-[#131313] border border-white/10 rounded-3xl overflow-hidden hover:border-[#ff4d00]/40 transition-all group flex flex-col justify-between shadow-xl">
                      <div>
                        {/* Image Banner Container */}
                        <div className="h-52 overflow-hidden relative bg-black">
                          <img 
                            src="/virtual%20studio%20consultation%20mockup.jpg"
                            alt="Virtual Studio Consultation"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className="bg-black/80 backdrop-blur-md border border-white/10 text-[#ff4d00] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                              1-on-1 Strategy
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-3">
                          <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
                            <Video size={18} className="text-[#ff4d00]" /> Virtual Studio Consultation
                          </h3>
                          <p className="text-white/60 text-xs leading-relaxed">
                            Complete remote audit of your room layout, acoustic treatment, lighting setup, audio chain, and camera settings to build a broadcast-ready studio environment.
                          </p>
                        </div>
                      </div>

                      {/* Card Action */}
                      <div className="p-6 pt-0">
                        <a 
                          href="https://your-booking-link.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-white/5 hover:bg-[#ff4d00] text-white hover:text-black font-black uppercase tracking-widest py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-white/10 hover:border-[#ff4d00] transition-all"
                        >
                          <Calendar size={14} /> Book Session <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </div>

                    {/* SERVICE CARD 2: POST PRODUCTION RETAINER */}
                    <div className="bg-[#131313] border border-white/10 rounded-3xl overflow-hidden hover:border-[#ff4d00]/40 transition-all group flex flex-col justify-between shadow-xl">
                      <div>
                        {/* Image Banner Container */}
                        <div className="h-52 overflow-hidden relative bg-black">
                          <img 
                            src="/Post%20Production%20Retainer%20mockup.jpg"
                            alt="Post Production Retainer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className="bg-black/80 backdrop-blur-md border border-white/10 text-[#ff4d00] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                              Turnkey Editing
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-3">
                          <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
                            <Film size={18} className="text-[#ff4d00]" /> Post Production Retainer
                          </h3>
                          <p className="text-white/60 text-xs leading-relaxed">
                            Monthly editing subscription for podcasts and vertical content. Includes full interactive Review Room feedback, timestamped revision notes, and direct team chat.
                          </p>
                        </div>
                      </div>

                      {/* Card Action */}
                      <div className="p-6 pt-0">
                        <a 
                          href="https://your-retainer-link.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-white/5 hover:bg-[#ff4d00] text-white hover:text-black font-black uppercase tracking-widest py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-white/10 hover:border-[#ff4d00] transition-all"
                        >
                          <Film size={14} /> Apply for Retainer <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </div>

                    {/* SERVICE CARD 3: THE BUILD OUT */}
                    <div className="bg-[#131313] border border-white/10 rounded-3xl overflow-hidden hover:border-[#ff4d00]/40 transition-all group flex flex-col justify-between shadow-xl">
                      <div>
                        {/* Image Banner Container */}
                        <div className="h-52 overflow-hidden relative bg-black">
                          <img 
                            src="/the%20build-out%20mockup.jpg"
                            alt="The Build Out"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className="bg-black/80 backdrop-blur-md border border-white/10 text-[#ff4d00] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                              Full-Service On-Site
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-3">
                          <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
                            <Wrench size={18} className="text-[#ff4d00]" /> The Build Out
                          </h3>
                          <p className="text-white/60 text-xs leading-relaxed">
                            White-glove, in-person studio design and installation. From physical acoustic treatment and custom wiring to camera rigging, lighting grid installation, and staff training.
                          </p>
                        </div>
                      </div>

                      {/* Card Action */}
                      <div className="p-6 pt-0">
                        <a 
                          href="https://your-buildout-link.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-white/5 hover:bg-[#ff4d00] text-white hover:text-black font-black uppercase tracking-widest py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-white/10 hover:border-[#ff4d00] transition-all"
                        >
                          <Wrench size={14} /> Schedule Discovery Call <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* BLUEPRINT TAB (UNLOCKED ONLY WHEN DB RECORD EXISTS) */}
            {activeTab === 'blueprint' && blueprint && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative max-w-6xl mx-auto md:mx-0">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">My Studio Blueprint</h1>
                <p className="text-white/50 text-sm md:text-base mb-6 md:mb-8">Your personalized gear list, setup instructions, and direct support access.</p>
                
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
                </div>
              </div>
            )}

            {/* PROFILE TAB (ALWAYS ACCESSIBLE) */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
                <div className="text-center mb-8 md:mb-10">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">My Profile</h1>
                  <p className="text-white/50 text-xs md:text-sm">Manage your Sanctuary account details and identity.</p>
                </div>
                
                <div className="bg-[#131313] border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d00]/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <form onSubmit={handleSaveProfile} className="space-y-8 relative z-10">
                    
                    {/* AVATAR UPLOAD SECTION */}
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
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarUpload} 
                            className="hidden" 
                            disabled={isUploadingAvatar} 
                          />
                        </label>
                      </div>
                      <div className="text-center sm:text-left pt-2">
                        <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">Profile Photo</h3>
                        <p className="text-white/40 text-xs mb-3">Upload a square image. JPG, GIF, or PNG.</p>
                        {isUploadingAvatar && <span className="text-[#ff4d00] text-[10px] font-bold uppercase tracking-widest animate-pulse bg-[#ff4d00]/10 px-2.5 py-1 rounded">Uploading...</span>}
                      </div>
                    </div>

                    {/* TEXT FIELDS SECTION */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">First Name</label>
                        <input 
                          type="text" 
                          value={profile.first_name} 
                          onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" 
                          placeholder="Your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Last Name</label>
                        <input 
                          type="text" 
                          value={profile.last_name} 
                          onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" 
                          placeholder="Your last name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Username</label>
                        <input 
                          type="text" 
                          value={profile.username} 
                          onChange={(e) => setProfile({...profile, username: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" 
                          placeholder="@creator"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Instagram Handle</label>
                        <input 
                          type="text" 
                          value={profile.instagram_handle} 
                          onChange={(e) => setProfile({...profile, instagram_handle: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" 
                          placeholder="e.g. riseandrender"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Short Bio</label>
                        <textarea 
                          rows={3}
                          value={profile.bio} 
                          onChange={(e) => setProfile({...profile, bio: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors resize-none" 
                          placeholder="Tell us about your brand or podcast..."
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={isSavingProfile}
                        className="bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest px-8 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,77,0,0.2)] transition-all disabled:opacity-50 w-full sm:w-auto"
                      >
                        <Save size={16} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* RETAINER DASHBOARD TAB (UNLOCKED ONLY WHEN HAS_RETAINER IS TRUE) */}
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
        
        {/* ALWAYS VISIBLE: Asset Vault */}
        <button onClick={() => setActiveTab('vault')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'vault' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <FolderDown size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Vault</span>
        </button>

        {/* UNLOCKED ONLY IF BLUEPRINT EXISTS IN DB */}
        {blueprint && (
          <button onClick={() => setActiveTab('blueprint')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'blueprint' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
            <LayoutDashboard size={20} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Blueprint</span>
          </button>
        )}

        {/* UNLOCKED ONLY IF RETAINER CLIENT */}
        {profile.has_retainer && (
          <button onClick={() => setActiveTab('retainer')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'retainer' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
            <Film size={20} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Retainer</span>
          </button>
        )}

        {/* ALWAYS VISIBLE: Profile */}
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'profile' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <User size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Profile</span>
        </button>

      </nav>
    </div>
  );
}
