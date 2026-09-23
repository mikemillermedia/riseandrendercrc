import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Home, Settings, LogOut, Video, LayoutDashboard, Compass, Lock } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Hub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('blueprint');
  
  // States for user data and security
  const [userId, setUserId] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      // 1. Check Session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUserId(session.user.id);

      // 2. Fetch their specific Blueprint from Supabase
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', session.user.id)
        .single(); // Tries to grab exactly one row

      if (data) {
        setBlueprint(data);
      } else {
        // If no data, they haven't paid/been assigned a blueprint yet.
        setBlueprint(null); 
      }
      setIsLoading(false);
    };

    checkSessionAndFetchData();
  }, [navigate]);

  // Handle checking off gear items
  const toggleGearItem = async (index: number) => {
    if (!blueprint) return;
    
    // Copy the current gear list and toggle the specific item
    const updatedGear = [...blueprint.gear_list];
    updatedGear[index].checked = !updatedGear[index].checked;

    // Update local state for instant UI response
    setBlueprint({ ...blueprint, gear_list: updatedGear });

    // Save back to Supabase
    await supabase
      .from('blueprints')
      .update({ gear_list: updatedGear })
      .eq('id', blueprint.id);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F0] font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#111] border-r border-white/5 hidden md:flex flex-col">
        <div onClick={() => navigate('/')} className="p-6 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
          <h2 className="text-xl font-black uppercase tracking-widest text-white">Sanctuary</h2>
          <p className="text-xs text-[#ff4d00] font-bold uppercase tracking-widest mt-1">Control Room</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-2">
          <button onClick={() => setActiveTab('blueprint')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'blueprint' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={18} /> My Blueprint
          </button>
          <button onClick={() => setActiveTab('hotline')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'hotline' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <Video size={18} /> Director's Hotline
          </button>
          <button onClick={() => setActiveTab('community')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'community' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <Compass size={18} /> Kingdom Network
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <Settings size={18} /> Gear Settings
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
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/5 rounded-full blur-[120px] pointer-events-none" />

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/50 animate-pulse">Loading secure connection...</p>
          </div>
        ) : (
          <>
            {/* BLUEPRINT TAB */}
            {activeTab === 'blueprint' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">My Studio Blueprint</h1>
                <p className="text-white/50 mb-8">Your personalized gear list and setup instructions based on our consultation.</p>
                
                {blueprint ? (
                  /* ============================================================== */
                  /* UNLOCKED STATE (They paid and have a blueprint row in Supabase)*/
                  /* ============================================================== */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#131313] border border-white/5 p-6 rounded-2xl shadow-xl">
                      <h3 className="text-lg font-bold text-white mb-4">Action Items / Gear to Order</h3>
                      
                      {blueprint.gear_list && blueprint.gear_list.length > 0 ? (
                        <div className="space-y-3">
                          {blueprint.gear_list.map((item: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors cursor-pointer" onClick={() => toggleGearItem(index)}>
                              <input 
                                type="checkbox" 
                                checked={item.checked} 
                                readOnly
                                className="w-5 h-5 accent-[#ff4d00] pointer-events-none" 
                              />
                              <span className={`text-sm ${item.checked ? 'text-white/40 line-through' : 'text-white'}`}>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/40 text-sm italic">Mike is currently building your gear list...</p>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-xl h-fit">
                      <Video size={40} className="text-[#ff4d00] mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">Consultation Recording</h3>
                      <p className="text-xs text-white/50 mb-4">Watch our 1-hour session replay where we mapped out this room.</p>
                      {blueprint.video_url ? (
                        <a href={blueprint.video_url} target="_blank" rel="noopener noreferrer" className="bg-[#ff4d00] hover:bg-orange-500 text-black text-sm font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-colors shadow-[0_0_20px_rgba(255,77,0,0.2)]">
                          Watch Replay
                        </a>
                      ) : (
                        <button disabled className="bg-white/5 text-white/30 text-sm font-bold py-3 px-6 rounded-xl cursor-not-allowed border border-white/10">
                          Video Processing...
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ============================================================== */
                  /* BLURRED PAYWALL STATE (No blueprint found in Supabase)         */
                  /* ============================================================== */
                  <div className="relative rounded-2xl overflow-hidden border border-white/5">
                    {/* Fake blurred background content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 blur-md opacity-30 select-none pointer-events-none bg-[#131313]">
                      <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold text-white mb-4">Action Items / Gear to Order</h3>
                        <div className="space-y-3">
                          <div className="h-12 bg-white/10 rounded-lg w-full"></div>
                          <div className="h-12 bg-white/10 rounded-lg w-full"></div>
                          <div className="h-12 bg-white/10 rounded-lg w-full"></div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center items-center text-center h-full">
                        <Video size={40} className="text-white mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Consultation Recording</h3>
                        <div className="h-10 bg-white/10 rounded-full w-32 mt-4"></div>
                      </div>
                    </div>

                    {/* Paywall CTA Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm p-6 text-center">
                      <Lock size={48} className="text-[#ff4d00] mb-6 drop-shadow-[0_0_15px_rgba(255,77,0,0.5)]" />
                      <h2 className="text-2xl font-black uppercase text-white tracking-widest mb-2">Blueprint Locked</h2>
                      <p className="text-white/70 max-w-md mb-8">
                        You haven't booked a virtual consultation yet. Book a session with Mike to unlock your custom gear list, acoustic layout, and recording replay.
                      </p>
                      <button 
                        onClick={() => navigate('/#pricing-section')} 
                        className="bg-[#ff4d00] hover:bg-orange-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,77,0,0.4)] hover:scale-105"
                      >
                        Book Consultation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OTHER TABS */}
            {activeTab === 'hotline' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
                <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Director's Hotline</h1>
                <p className="text-white/50 mb-8">Stuck on a tech issue? Drop a quick video or message here, and I'll get back to you with the fix.</p>
                <div className="bg-[#131313] border border-white/5 p-6 rounded-2xl min-h-[400px] flex flex-col shadow-xl">
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl mb-4 bg-white/5">
                    <p className="text-white/40 text-sm">No recent messages.</p>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Type your issue or drop a video link..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white" />
                    <button className="bg-[#ff4d00] text-black font-bold px-6 py-3 rounded-xl hover:bg-orange-500 transition-colors shadow-lg">Send</button>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'community' || activeTab === 'settings') && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2 capitalize">{activeTab}</h1>
                 <p className="text-white/50">This section is currently under construction.</p>
               </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
