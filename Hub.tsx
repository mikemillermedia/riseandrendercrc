import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, MessageSquare, LogOut, Video, LayoutDashboard, Compass } from 'lucide-react';
// import { supabase } from './supabaseClient'; // Uncomment when you integrate Supabase here

export default function Hub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('blueprint');

  const handleSignOut = async () => {
    // await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F0] font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#111] border-r border-white/5 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-black uppercase tracking-widest text-white">Sanctuary</h2>
          <p className="text-xs text-[#ff4d00] font-bold uppercase tracking-widest mt-1">Control Room</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('blueprint')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'blueprint' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard size={18} /> My Blueprint
          </button>
          <button 
            onClick={() => setActiveTab('hotline')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'hotline' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Video size={18} /> Director's Hotline
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'community' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Compass size={18} /> Kingdom Network
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={18} /> Gear Settings
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/5 rounded-full blur-[120px] pointer-events-none" />

        {activeTab === 'blueprint' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">My Studio Blueprint</h1>
            <p className="text-white/50 mb-8">Your personalized gear list and setup instructions based on our consultation.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#131313] border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Action Items / Gear to Order</h3>
                {/* Example checklist - later this will be driven by your database */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                    <input type="checkbox" className="w-5 h-5 accent-[#ff4d00]" />
                    <span className="text-sm">Sony FX30 Cinema Camera (Sweetwater)</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                    <input type="checkbox" className="w-5 h-5 accent-[#ff4d00]" />
                    <span className="text-sm">Shure SM7B Microphone</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                    <input type="checkbox" className="w-5 h-5 accent-[#ff4d00]" />
                    <span className="text-sm">Amaran 100x Bi-Color Light (Key Light)</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                <Video size={40} className="text-[#ff4d00] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Consultation Recording</h3>
                <p className="text-xs text-white/50 mb-4">Watch our 1-hour session replay where we mapped out this room.</p>
                <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2 px-6 rounded-full transition-colors border border-white/10">
                  Watch Replay
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hotline' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Director's Hotline</h1>
            <p className="text-white/50 mb-8">Stuck on a tech issue? Drop a quick video or message here, and I'll get back to you with the fix.</p>
            
            <div className="bg-[#131313] border border-white/5 p-6 rounded-2xl min-h-[400px] flex flex-col">
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl mb-4 bg-white/5">
                <p className="text-white/40 text-sm">No recent messages.</p>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Type your issue or drop a video link..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00]" />
                <button className="bg-[#ff4d00] text-black font-bold px-6 py-3 rounded-xl hover:bg-orange-500 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add placeholders for Community and Settings tabs */}
        {(activeTab === 'community' || activeTab === 'settings') && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2 capitalize">{activeTab}</h1>
             <p className="text-white/50">This section is currently under construction.</p>
           </div>
        )}

      </main>
    </div>
  );
}
