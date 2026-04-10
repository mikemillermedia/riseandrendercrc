import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, HeartHandshake, MessageSquare, User, Menu, X, Download, Folder, Activity, Bell, HelpCircle, Mail, Briefcase, Share2 } from 'lucide-react'; // Added Briefcase

import PrayerWall from './components/PrayerWall';
import ProfileTab from './ProfileTab';
import CommunityChat from './CommunityChat';
import Members from './Members';
import DirectMessages from './components/DirectMessages'; 
import CollabBoard from './components/CollabBoard'; // NEW COLLAB IMPORT
import AIChat from './components/AIChat'; 
import freeKitImage from './The Content Creator Studio Kit.jpg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Hub() {
  const navigate = useNavigate();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'guide';
  
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
const handleShare = async () => {
    const shareData = {
      title: 'Rise & Render Community',
      text: 'Check out this private community for faith-driven creators!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Share canceled or failed', err);
    }
  };
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        setUnreadCount(count || 0);
      };
      fetchUnread();
    }
  }, [user, activeTab]); 

  useEffect(() => {
    if (activeTab === 'notifications' && user) {
      const fetchAndMarkRead = async () => {
        setLoadingNotifs(true);
        const { data } = await supabase
          .from('notifications')
          .select('*, actor:actor_id(first_name, last_name, avatar_url)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (data) setNotifications(data);
        setLoadingNotifs(false);

        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
          
        setUnreadCount(0); 
      };
      fetchAndMarkRead();
    }
  }, [activeTab, user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return <div className="min-h-screen bg-[#131313] text-[#F5F5F0] flex items-center justify-center">Loading Hub...</div>;

 const NavLinks = () => (
    <>
      <button onClick={() => { setActiveTab('activity'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'activity' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <Activity size={20} /> Latest Activity
      </button>
      
      <button onClick={() => { setActiveTab('notifications'); setIsMobileMenuOpen(false); }} className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'notifications' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <div className="flex items-center gap-3">
          <Bell size={20} /> Notifications
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20">
            {unreadCount}
          </span>
        )}
      </button>

      <button onClick={() => { setActiveTab('messages'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'messages' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <Mail size={20} /> Inbox
      </button>

      <button onClick={() => { setActiveTab('collabs'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'collabs' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <Briefcase size={20} /> Kingdom Collabs
      </button>

      <button onClick={() => { setActiveTab('prayer'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'prayer' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <HeartHandshake size={20} /> Prayer Wall
      </button>
      <button onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'chat' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <MessageSquare size={20} /> Community Chat
      </button>
      <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <User size={20} /> My Profile
      </button>
      <button onClick={() => { setActiveTab('vault'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <Folder size={20} /> The Vault
      </button>

      <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Support & Share</div>
      <button onClick={() => { setActiveTab('guide'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-colors text-sm ${activeTab === 'guide' ? 'bg-white/10 text-white' : 'text-[#F5F5F0]/40 hover:text-white hover:bg-white/5'}`}>
        <HelpCircle size={18} /> App Guide & FAQ
      </button>
      
      {/* NEW: Hub Share Button */}
      <button onClick={() => { handleShare(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-colors text-sm text-[#F5F5F0]/40 hover:text-white hover:bg-white/5">
        <Share2 size={18} /> Share The Hub
      </button>
    </>
  );
  return (
    <div className="min-h-screen bg-[#131313] text-[#F5F5F0] flex flex-col md:flex-row relative">
      
      <div className="z-50"><AIChat /></div>

      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#F5F5F0]/10 bg-[#131313] sticky top-0 z-50">
        <h2 className="font-black uppercase tracking-widest text-lg">CRC <span className="text-[#ff4d00]">Hub</span></h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#F5F5F0]/80">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[65px] left-0 w-full bg-[#131313] border-b border-[#F5F5F0]/10 p-4 flex flex-col gap-2 z-40">
          <NavLinks />
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors mt-4">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      )}

      <div className="hidden md:flex flex-col w-64 border-r border-[#F5F5F0]/10 p-6 sticky top-0 h-screen overflow-y-auto">
        <h2 className="font-black uppercase tracking-widest text-2xl mb-12 cursor-pointer" onClick={() => navigate('/')}>
          CRC <span className="text-[#ff4d00]">Hub</span>
        </h2>
        <div className="flex flex-col gap-2 flex-grow">
          <NavLinks />
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors mt-8">
          <LogOut size={20} /> Sign Out
        </button>
      </div>

      <div className="flex-grow p-6 md:p-12 max-w-5xl mx-auto w-full">
        
        {activeTab === 'activity' && <Members setActiveTab={setActiveTab} />}
        {activeTab === 'messages' && <DirectMessages user={user} />}
        
        {/* NEW: COLLAB BOARD SCREEN */}
        {activeTab === 'collabs' && <CollabBoard user={user} />}

        {activeTab === 'notifications' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">Notifications</h1>
            <p className="text-[#F5F5F0]/60 mb-8">Stay updated on your community connections.</p>
            
            {loadingNotifs ? (
               <div className="text-white/40">Loading notifications...</div>
            ) : notifications.length === 0 ? (
               <div className="bg-[#1A1A1A] border border-white/5 p-8 rounded-2xl shadow-xl text-center text-white/40">
                 You're all caught up! No new notifications right now.
               </div>
            ) : (
               <div className="space-y-4">
                 {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        if (notif.post_id) {
                          setSearchParams({ tab: 'chat', postId: notif.post_id });
                        } else if (notif.type === 'new_follower') {
                           setSearchParams({ tab: 'activity', viewUser: notif.actor_id });
                        } else if (notif.type === 'new_dm') { 
                           setSearchParams({ tab: 'messages', userId: notif.actor_id });
                        }
                      }}
                      className={`bg-[#1A1A1A] border ${notif.is_read ? 'border-white/5' : 'border-[#ff4d00]/30'} p-5 rounded-2xl shadow-xl flex items-center gap-4 transition-colors cursor-pointer hover:border-[#ff4d00]/50`}
                    >
                       <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                         {notif.actor?.avatar_url ? (
                           <img src={notif.actor.avatar_url} className="w-full h-full object-cover" />
                         ) : (
                           <User size={20} className="text-white/40" />
                         )}
                       </div>
                       <div>
                         <p className="text-white text-sm md:text-base">
                           <span className="font-bold">{notif.actor?.first_name || 'Someone'} {notif.actor?.last_name || ''}</span> 
                           {notif.type === 'new_follower' && ' started following you!'}
                           {notif.type === 'new_post' && ' published a new post.'}
                           {notif.type === 'new_dm' && ' sent you a direct message.'}
                         </p>
                         <p className="text-xs text-white/40 mt-1">
                           {new Date(notif.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                         </p>
                       </div>
                    </div>
                 ))}
               </div>
            )}
          </div>
        )}

        {/* UPDATED: GUIDE & FAQ SCREEN */}
        {activeTab === 'guide' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">App Guide & FAQ</h1>
            <p className="text-[#F5F5F0]/60 mb-8">Everything you need to know to navigate the CRC Hub.</p>
            
            <div className="space-y-6">
              <div className="bg-[#1A1A1A] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-black text-[#ff4d00] mb-4">Welcome to the Community</h3>
                <p className="text-white/80 leading-relaxed text-sm md:text-base">
                  Creatives Representing Christ (CRC) is a dedicated space to help you master your craft and connect with like-minded believers. Update your profile with your setup, bio, and favorite Bible reading so others can get to know you!
                </p>
              </div>

              <div className="bg-[#1A1A1A] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-black text-white mb-4">Navigating the Hub</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-[#ff4d00] mb-1">Direct Messages (Inbox)</h4>
                    <p className="text-white/70 text-sm leading-relaxed">Chat privately 1-on-1 with other members. You can start a conversation by visiting someone's profile and clicking the "Message" button.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#ff4d00] mb-1">Kingdom Collabs</h4>
                    <p className="text-white/70 text-sm leading-relaxed">Looking for a video editor, graphic designer, or podcast co-host? Post a collab request to hire or partner with other believers!</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#ff4d00] mb-1">Community Chat & The /verse Command</h4>
                    <p className="text-white/70 text-sm leading-relaxed">The main feed for tech advice and networking. Type <strong>@</strong> followed by a name to mention someone. <strong>Bonus:</strong> If you type <strong>/verse John 3:16</strong>, a button will appear that automatically fetches and formats that scripture directly into your post!</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#ff4d00] mb-1">Prayer Wall</h4>
                    <p className="text-white/70 text-sm leading-relaxed">A safe, private space to bear one another's burdens. Click 'Praying' to show support, or leave a threaded reply to offer encouragement.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#ff4d00]/10 to-transparent border border-[#ff4d00]/20 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-black text-white mb-4">Special Member Pricing</h3>
                <p className="text-white/80 leading-relaxed text-sm md:text-base mb-4">
                  As an official member of the CRC Hub, you receive exclusive, discounted pricing on all services through <strong>Rise & Render</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-white/70">
                  <li><strong>DFW In-Studio:</strong> Book high-end podcast and video sessions in our Duncanville studio.</li>
                  <li><strong>Mobile Studio:</strong> We dispatch our cameras, lighting, and audio gear directly to your home/office.</li>
                  <li><strong>Remote Consulting:</strong> Strategic 1-on-1 guidance to architect your perfect content engine, anywhere in the world.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">The Vault</h1>
            <p className="text-[#F5F5F0]/60 mb-8">Download your exclusive assets and templates.</p>
            <div className="bg-[#131313] border border-[#F5F5F0]/10 p-6 rounded-2xl max-w-sm hover:border-[#ff4d00]/50 transition-colors shadow-xl">
              <div className="bg-black w-full aspect-square rounded-xl mb-6 overflow-hidden flex items-center justify-center border border-[#F5F5F0]/5">
                <img src={freeKitImage} alt="Content Creator Kit" className="w-full h-full object-cover rounded-xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">Content Creator Kit</h3>
              <div className="text-sm text-[#F5F5F0]/70 mb-8 space-y-3 leading-relaxed">
                <p>Too many options. Too much gear. No clear system.</p>
                <p>This kit removes the guesswork. Every item is here because it:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Works reliably in small home spaces</li>
                  <li>Is forgiving for non-technical users</li>
                  <li>Delivers professional results without overbuilding</li>
                </ul>
                <p>This is the setup I recommend to the majority of serious business owners.</p>
              </div>
              <a href="https://checkout.mailerlite.com/checkout/13297" target="_blank" rel="noopener noreferrer" className="bg-[#ff4d00] hover:bg-[#ff4d00]/80 text-white font-bold py-3 px-4 rounded-xl transition-colors w-full flex items-center justify-center gap-2">
                <Download size={18} /> Download Kit
              </a>
            </div>
          </div>
        )}

        {activeTab === 'prayer' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">Prayer Wall</h1>
            <p className="text-[#F5F5F0]/60 mb-8">Bear one another's burdens.</p>
            <PrayerWall user={user} />
          </div>
        )}
        
        {activeTab === 'chat' && <CommunityChat user={user} />}

        {activeTab === 'profile' && <ProfileTab user={user} />}

      </div>
    </div>
  );
}
