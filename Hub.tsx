import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, FolderDown, Lock, 
  User, Film, Sparkles, BookOpen
} from 'lucide-react';

import RetainerDashboard from './RetainerDashboard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

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
    has_retainer: false
  });

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
        if (profileData) setProfile(profileData);

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
          
          <button onClick={() => setActiveTab('vault')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <FolderDown size={18} /> Asset Vault
          </button>

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
            {/* BLUEPRINT TAB */}
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

            {/* ASSET VAULT TAB */}
            {activeTab === 'vault' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                  <span className="bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-3 inline-block">
                    Digital Resources
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
                    Asset <span className="text-[#ff4d00]">Vault</span>
                  </h1>
                  <p className="text-white/50 text-xs md:text-sm max-w-lg mx-auto">
                    Exclusive guides, templates, and creator tools engineered for high-end content production.
                  </p>
                </div>

                {/* FEATURED: CREATOR KIT GUIDE WITH 3D BOX MOCKUP */}
                <div className="bg-[#131313] border border-[#ff4d00]/30 rounded-3xl p-6 md:p-10 mb-10 relative overflow-hidden shadow-[0_0_40px_rgba(255,77,0,0.12)]">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/10 rounded-full blur-[110px] pointer-events-none" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                    
                    {/* 3D SOFTWARE BOX MOCKUP */}
                    <div className="md:col-span-5 flex justify-center items-center py-4">
                      <div className="relative group perspective-[1000px] cursor-pointer">
                        
                        {/* Ambient Back Glow */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#ff4d00] to-orange-600 rounded-xl blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />

                        {/* 3D Box Container */}
                        <div className="relative w-48 sm:w-56 h-72 sm:h-80 transition-transform duration-500 ease-out transform transform-3d rotate-y-[-18deg] rotate-x-[8deg] group-hover:rotate-y-[-8deg] group-hover:rotate-x-[4deg]">
                          
                          {/* Box Front Face */}
                          <div className="absolute inset-0 bg-[#111] rounded-r-md overflow-hidden border border-white/20 shadow-2xl z-10">
                            <img 
                              src="/creator-kit-cover.jpg" 
                              alt="The Content Creator Studio Kit Cover" 
                              className="w-full h-full object-cover"
                            />
                            {/* Metallic Sheen Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none" />
                          </div>

                          {/* Box Spine (Left Edge Side) */}
                          <div className="absolute top-0 left-0 w-6 h-full bg-[#0a0a0a] border-l border-y border-white/20 origin-left transform -rotate-y-90 translate-x-[-24px] flex flex-col justify-between py-6 px-1 text-center shadow-inner z-0">
                            <span className="text-[8px] font-black tracking-widest text-[#ff4d00] uppercase rotate-180 write-vertical">RISE + RENDER</span>
                            <span className="text-[9px] font-bold tracking-wider text-white/80 uppercase rotate-180 write-vertical truncate">CREATOR STUDIO KIT</span>
                            <div className="w-2 h-2 rounded-full bg-[#ff4d00] mx-auto" />
                          </div>

                          {/* Box Top Edge */}
                          <div className="absolute top-0 left-0 w-full h-6 bg-[#222] border-t border-x border-white/20 origin-top transform rotate-x-90 translate-y-[-24px] z-0" />

                          {/* Box Drop Shadow */}
                          <div className="absolute -bottom-6 left-2 right-2 h-6 bg-black/80 blur-md rounded-full transform rotate-x-60 scale-95 group-hover:scale-105 group-hover:blur-lg transition-all" />
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
                          href="https://your-custom-link.com" // <-- Replace with your actual guide URL
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
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                <div className="text-center mb-8 md:mb-10">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">My Profile</h1>
                  <p className="text-white/50 text-xs md:text-sm">Manage your Sanctuary account details.</p>
                </div>
                <div className="bg-[#131313] border border-white/10 rounded-3xl p-5 md:p-8 shadow-xl space-y-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Display Name</label>
                    <input type="text" readOnly value={profile.display_name} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70" />
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
        <button onClick={() => setActiveTab('blueprint')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'blueprint' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Blueprint</span>
        </button>
        <button onClick={() => setActiveTab('vault')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'vault' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <FolderDown size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Vault</span>
        </button>
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
