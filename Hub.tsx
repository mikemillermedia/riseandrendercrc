import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { LogOut, HeartHandshake, MessageSquare, Monitor, User, Menu, X } from 'lucide-react';
import PrayerWall from './components/PrayerWall';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Hub() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('prayer');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Security Check: Make sure they are logged in!
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login'); // Kick them back to login if they aren't signed in
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return <div className="min-h-screen bg-[#131313] text-[#F5F5F0] flex items-center justify-center">Loading Hub...</div>;

  const NavLinks = () => (
    <>
      <button onClick={() => { setActiveTab('prayer'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'prayer' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <HeartHandshake size={20} /> Prayer Wall
      </button>
      <button onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'chat' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <MessageSquare size={20} /> Community Chat
      </button>
      <button onClick={() => { setActiveTab('setups'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'setups' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <Monitor size={20} /> Setup Showcase
      </button>
      <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <User size={20} /> My Profile
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#131313] text-[#F5F5F0] flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#F5F5F0]/10 bg-[#131313] sticky top-0 z-50">
        <h2 className="font-black uppercase tracking-widest text-lg">CRC <span className="text-[#ff4d00]">Hub</span></h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#F5F5F0]/80">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[65px] left-0 w-full bg-[#131313] border-b border-[#F5F5F0]/10 p-4 flex flex-col gap-2 z-40">
          <NavLinks />
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors mt-4">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-[#F5F5F0]/10 p-6 sticky top-0 h-screen">
        <h2 className="font-black uppercase tracking-widest text-2xl mb-12 cursor-pointer" onClick={() => navigate('/')}>
          CRC <span className="text-[#ff4d00]">Hub</span>
        </h2>
        <div className="flex flex-col gap-2 flex-grow">
          <NavLinks />
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors">
          <LogOut size={20} /> Sign Out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-6 md:p-12 max-w-5xl mx-auto w-full">
        {activeTab === 'prayer' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">Prayer Wall</h1>
            <p className="text-[#F5F5F0]/60 mb-8">Bear one another's burdens.</p>
            <PrayerWall />
          </div>
        )}
        
        {activeTab === 'chat' && <div><h1 className="text-3xl font-black uppercase tracking-widest mb-4">Community Chat</h1><p className="text-[#F5F5F0]/60">Live chat coming soon...</p></div>}
        {activeTab === 'setups' && <div><h1 className="text-3xl font-black uppercase tracking-widest mb-4">Setup Showcase</h1><p className="text-[#F5F5F0]/60">Workspace inspiration coming soon...</p></div>}
        {activeTab === 'profile' && <div><h1 className="text-3xl font-black uppercase tracking-widest mb-4">My Profile</h1><p className="text-[#F5F5F0]/60">Profile editor coming soon...</p></div>}
      </div>

    </div>
  );
}
