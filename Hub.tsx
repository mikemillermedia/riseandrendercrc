import ProfileTab from './ProfileTab';
import freeKitImage from './The Content Creator Studio Kit.jpg';
import { LogOut, HeartHandshake, MessageSquare, Monitor, User, Menu, X, Download, Camera, Folder } from 'lucide-react';
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
      <button onClick={() => { setActiveTab('vault'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
     <Folder size={20} /> The Vault
   </button>
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
      {activeTab === 'vault' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">The Vault</h1>
            <p className="text-[#F5F5F0]/60 mb-8">Download your exclusive assets and templates.</p>
            
            {/* Free Kit Card */}
            <div className="bg-[#131313] border border-[#F5F5F0]/10 p-6 rounded-2xl max-w-sm hover:border-[#ff4d00]/50 transition-colors shadow-xl">
              <div className="bg-black h-40 rounded-xl mb-6 overflow-hidden flex items-center justify-center border border-[#F5F5F0]/5">
                <img 
                  src={freeKitImage} 
                  alt="Content Creator Kit" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white uppercase tracking-wider">Content Creator Kit</h3>
              <p className="text-sm text-[#F5F5F0]/60 mb-6">The ultimate starter kit for your church's media ministry. Includes templates, assets, and guides.</p>
              
              {/* Replace the # with your actual Google Drive / Dropbox link! */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="bg-[#ff4d00] hover:bg-[#ff4d00]/80 text-white font-bold py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center gap-2">
                <Download size={18} /> Download Kit
              </a>
            </div>
          </div>
        )}
        {activeTab === 'prayer' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">Prayer Wall</h1>
            <p className="text-[#F5F5F0]/60 mb-8">Bear one another's burdens.</p>
            <PrayerWall />
          </div>
        )}
        
        {activeTab === 'chat' && <div><h1 className="text-3xl font-black uppercase tracking-widest mb-4">Community Chat</h1><p className="text-[#F5F5F0]/60">Live chat coming soon...</p></div>}
        {activeTab === 'setups' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">Setup Showcase</h1>
                <p className="text-[#F5F5F0]/60">Get inspiration from other Christian creatives' workspaces.</p>
              </div>
              <button onClick={() => setActiveTab('profile')} className="bg-[#ff4d00] hover:bg-[#ff4d00]/80 text-white font-bold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-orange-900/20">
                <Camera size={18} /> Share Your Setup
              </button>
            </div>

            {/* The Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Example Card 1 */}
              <div className="bg-[#131313] border border-[#F5F5F0]/10 rounded-2xl overflow-hidden hover:border-[#ff4d00]/30 transition-all hover:-translate-y-1 shadow-xl group cursor-pointer">
                <div className="h-48 bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center">
                  <Camera size={32} className="text-[#F5F5F0]/10 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent opacity-60"></div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Sunday Broadcast</h3>
                  <p className="text-xs text-[#ff4d00] font-medium mb-3">@mikemiller</p>
                  <div className="flex gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded text-[#F5F5F0]/60">Blackmagic</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded text-[#F5F5F0]/60">Live Stream</span>
                  </div>
                </div>
              </div>

              {/* Example Card 2 */}
              <div className="bg-[#131313] border border-[#F5F5F0]/10 rounded-2xl overflow-hidden hover:border-[#ff4d00]/30 transition-all hover:-translate-y-1 shadow-xl group cursor-pointer">
                <div className="h-48 bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center">
                  <Camera size={32} className="text-[#F5F5F0]/10 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent opacity-60"></div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Edit Bay</h3>
                  <p className="text-xs text-[#ff4d00] font-medium mb-3">@crc_member</p>
                  <div className="flex gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded text-[#F5F5F0]/60">Mac Studio</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded text-[#F5F5F0]/60">Premiere</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
        {activeTab === 'profile' && <ProfileTab user={user} />}
      </div>

    </div>
  );
}
