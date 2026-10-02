import React, { useState, useEffect } from 'react';
// import { supabase } from './supabaseClient'; 
import RetainerDashboard from './RetainerDashboard';
// import ConsultationBlueprint from './ConsultationBlueprint';

const SanctuaryHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('blueprint');
  
  // This state will eventually be populated by your Supabase fetch
  const [userAccess, setUserAccess] = useState({
    loading: true,
    hasConsultation: true, // Assuming true for the example
    hasRetainer: true      // Assuming true for the example
  });

  /* 
  // FUTURE SUPABASE LOGIC:
  useEffect(() => {
    const fetchUserAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_consultation, has_retainer')
        .eq('id', user.id)
        .single();
        
      setUserAccess({
        loading: false,
        hasConsultation: profile.has_consultation,
        hasRetainer: profile.has_retainer
      });
    };
    fetchUserAccess();
  }, []);
  */

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      
      {/* HUB SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-white/10 p-6 hidden md:flex flex-col bg-[#0a0a0a] z-10 relative">
        <div className="mb-12">
          <h2 className="text-white font-black uppercase tracking-widest text-xl">Sanctuary<span className="text-[#ff4d00]">Hub</span></h2>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {/* CONSULTATION TAB (Always visible if they bought it) */}
          {userAccess.hasConsultation && (
            <button 
              onClick={() => setActiveTab('blueprint')}
              className={`text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'blueprint' ? 'bg-[#ff4d00] text-black' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
            >
              My Blueprint
            </button>
          )}

          {/* RETAINER TAB (Only visible if they pay $1,500/mo) */}
          {userAccess.hasRetainer && (
            <button 
              onClick={() => setActiveTab('retainer')}
              className={`text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'retainer' ? 'bg-[#ff4d00] text-black' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
            >
              Post-Production
            </button>
          )}
        </nav>

        {/* LOGOUT */}
        <button className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors mt-auto">
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow flex flex-col h-screen overflow-y-auto">
        {activeTab === 'blueprint' && (
          <div className="p-12 text-white">
            {/* <ConsultationBlueprint /> */}
            <h1 className="text-4xl font-black uppercase">Studio Blueprint Dashboard</h1>
            <p className="text-white/50 mt-4">Your gear list and acoustic layout go here.</p>
          </div>
        )}

        {activeTab === 'retainer' && (
          // We drop the Retainer component we built exactly as is, right here!
          <RetainerDashboard />
        )}
      </main>

    </div>
  );
};

export default SanctuaryHub;
