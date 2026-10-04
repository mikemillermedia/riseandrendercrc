import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, FolderDown, Lock, 
  User, Film, Download, FileText, Sparkles, BookOpen, ExternalLink, AlertCircle, X
} from 'lucide-react';

import RetainerDashboard from './RetainerDashboard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function Hub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('vault'); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // DIGITAL PRODUCTS / ASSETS STATE
  const [vaultAssets, setVaultAssets] = useState<any[]>([]);

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

        await fetchVaultAssets();

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, [navigate]);

  const fetchVaultAssets = async () => {
    if (!supabase) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('digital_assets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setVaultAssets(data || []);
    } catch (err: any) {
      console.error('Fetch vault assets error:', err);
    }
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

            {/* ASSET VAULT TAB (NEW DIGITAL PRODUCTS & CREATOR KIT) */}
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

                {/* FEATURED: CREATOR KIT GUIDE */}
                <div className="bg-[#131313] border border-[#ff4d00]/30 rounded-3xl p-6 md:p-8 mb-10 relative overflow-hidden shadow-[0_0_30px_rgba(255,77,0,0.1)]">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff4d00]/10 rounded-full blur-[90px] pointer-events-none" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-center gap-2 text-[#ff4d00] text-xs font-bold uppercase tracking-widest">
                        <Sparkles size={16} /> Official Guide
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                        Creator Kit Guide
                      </h2>
                      <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                        The definitive blueprint for camera settings, lighting blueprints, audio chains, and post-production workflows used at Rise & Render.
                      </p>
                    </div>
                    <div className="flex justify-start md:justify-end">
                      <a 
                        href="https://drive.google.com" // Swap with your actual guide PDF / Notion link
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest px-6 py-4 rounded-xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(255,77,0,0.3)] transition-all w-full md:w-auto justify-center"
                      >
                        <BookOpen size={16} /> Open Guide
                      </a>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC DIGITAL ASSETS GRID */}
                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                  <FolderDown size={16} className="text-[#ff4d00]" /> Digital Products
                </h3>

                {vaultAssets.length === 0 ? (
                  <div className="bg-[#131313] border border-white/5 rounded-3xl p-8 text-center">
                    <FileText size={32} className="text-white/20 mx-auto mb-3" />
                    <p className="text-white/50 text-sm font-bold uppercase tracking-widest">More Tools Coming Soon</p>
                    <p className="text-white/30 text-xs mt-1">New LUTs, overlays, and templates are added regularly.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vaultAssets.map(asset => (
                      <div key={asset.id} className="bg-[#131313] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all flex flex-col justify-between group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/50 group-hover:text-[#ff4d00] transition-colors">
                            <FileText size={18} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 bg-white/5 px-2.5 py-1 rounded-md">
                            {asset.category || 'Digital Download'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm mb-1">{asset.title}</h4>
                          <p className="text-white/50 text-xs line-clamp-2 mb-4">{asset.description}</p>
                          <a 
                            href={asset.download_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white/5 hover:bg-[#ff4d00] text-white hover:text-black font-bold uppercase tracking-widest text-[10px] py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors w-full"
                          >
                            <Download size={14} /> Download File
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
