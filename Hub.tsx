import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, Compass, Lock, 
  MessageSquare, Image as ImageIcon, Heart, MessageCircle, MoreHorizontal, Share2, User, Instagram 
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Mock posts to populate the feed initially
const INITIAL_POSTS = [
  {
    id: '1',
    author: "David R.",
    username: "davidr",
    avatar: "D",
    instagram: "davidr_creates",
    time: "2 hours ago",
    content: "Just finished mounting the Amaran 100x and the difference is night and day! Thanks @mike for the recommendation on the softbox size. No more harsh shadows on my face.",
    image: null,
    likes: 12,
    replies: 4
  },
  {
    id: '2',
    author: "Sarah L.",
    username: "sarahl_studios",
    avatar: "S",
    instagram: "sarahl",
    time: "5 hours ago",
    content: "Finally got my space treated! Here's a look at the new setup. Hit record for the first time today and the audio is completely dead—no echo at all! 🙏",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop",
    likes: 34,
    replies: 8
  }
];

export default function Hub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('blueprint');
  
  const [userId, setUserId] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile State
  const [profile, setProfile] = useState({
    display_name: 'Creator',
    username: 'creator' + Math.floor(Math.random() * 1000),
    instagram_handle: '',
    avatar_letter: 'C',
    bio: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Feed State
  const [posts, setPosts] = useState<any[]>(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState('');

  useEffect(() => {
    const initApp = async () => {
      try {
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        setUserId(session.user.id);

        // Fetch Blueprint
        const { data: bpData } = await supabase
          .from('blueprints')
          .select('*')
          .eq('user_id', session.user.id)
          .single(); 
        if (bpData) setBlueprint(bpData);

        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        } else {
          const defaultProfile = {
            id: session.user.id,
            display_name: session.user.email?.split('@')[0] || 'Creator',
            username: 'user_' + Math.floor(Math.random() * 10000),
            avatar_letter: session.user.email ? session.user.email[0].toUpperCase() : 'C',
          };
          await supabase.from('profiles').insert([defaultProfile]);
          setProfile({...profile, ...defaultProfile});
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId) return;
    setIsSavingProfile(true);
    try {
      await supabase.from('profiles').update({
        display_name: profile.display_name,
        username: profile.username.replace('@', ''),
        instagram_handle: profile.instagram_handle.replace('@', ''),
        bio: profile.bio
      }).eq('id', userId);
      alert("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;
    
    const newPost = {
      id: Date.now().toString(),
      author: profile.display_name,
      username: profile.username,
      avatar: profile.avatar_letter || profile.display_name.charAt(0),
      instagram: profile.instagram_handle,
      time: "Just now",
      content: newPostText,
      image: null,
      likes: 0,
      replies: 0
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');

    if (supabase && userId) {
      try {
        await supabase.from('posts').insert([{
          author_id: userId,
          content: newPostText,
        }]);
      } catch (err) {
        console.error("Failed to save post to DB", err);
      }
    }
  };

  const toggleGearItem = async (index: number) => {
    if (!blueprint || !supabase) return;
    const updatedGear = [...blueprint.gear_list];
    updatedGear[index].checked = !updatedGear[index].checked;
    setBlueprint({ ...blueprint, gear_list: updatedGear });
    
    try {
      await supabase.from('blueprints').update({ gear_list: updatedGear }).eq('id', blueprint.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    try {
      if (supabase) await supabase.auth.signOut();
    } catch (error) {
      console.error(error);
    } finally {
      navigate('/');
    }
  };

  const renderContentWithMentions = (text: string) => {
    return text.split(/(@\w+)/g).map((part, index) => {
      if (part.startsWith('@')) {
        return <span key={index} className="text-[#ff4d00] font-medium cursor-pointer hover:underline">{part}</span>;
      }
      return part;
    });
  };

  return (
    // Changed to h-screen and flex-col for proper mobile sizing
    <div className="h-screen bg-[#050505] text-[#F5F5F0] font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* MOBILE TOP HEADER */}
      <div className="md:hidden flex items-center justify-between p-5 border-b border-white/5 bg-[#111] z-30 shrink-0">
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <h2 className="text-lg font-black uppercase tracking-widest text-white leading-none">Sanctuary</h2>
          <p className="text-[10px] text-[#ff4d00] font-bold uppercase tracking-widest mt-1 leading-none">Control Room</p>
        </div>
        <button onClick={handleSignOut} className="text-white/40 hover:text-red-400 p-2">
          <LogOut size={20} />
        </button>
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
          
          <button onClick={() => setActiveTab('community')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'community' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <Compass size={18} /> Kingdom Network
          </button>

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
      {/* Added pb-24 on mobile to prevent content from hiding behind the bottom nav bar */}
      <main className="flex-1 overflow-y-auto p-5 pb-24 md:p-12 md:pb-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/5 rounded-full blur-[120px] pointer-events-none" />

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/50 animate-pulse font-bold tracking-widest uppercase text-sm">Loading secure connection...</p>
          </div>
        ) : (
          <>
            {/* ========================================= */}
            {/* BLUEPRINT TAB (With Paywall & Hotline)    */}
            {/* ========================================= */}
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
                                <input 
                                  type="checkbox" 
                                  checked={item.checked} 
                                  readOnly
                                  className="w-5 h-5 accent-[#ff4d00] pointer-events-none shrink-0" 
                                />
                                <span className={`text-sm ${item.checked ? 'text-white/40 line-through' : 'text-white'}`}>
                                  {item.name}
                                </span>
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
                          <a href={blueprint.video_url} target="_blank" rel="noopener noreferrer" className="bg-[#ff4d00] hover:bg-orange-500 text-black text-sm font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-colors shadow-[0_0_20px_rgba(255,77,0,0.2)] w-full">
                            Watch Replay
                          </a>
                        ) : (
                          <button disabled className="bg-white/5 text-white/30 text-sm font-bold py-3 px-6 rounded-xl cursor-not-allowed border border-white/10 w-full">
                            Video Processing...
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#131313] border border-[#ff4d00]/20 p-6 md:p-8 rounded-3xl shadow-[0_0_30px_rgba(255,77,0,0.05)] flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d00]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                      <div className="flex items-center gap-3 mb-2 relative z-10 flex-wrap">
                        <MessageSquare className="text-[#ff4d00]" size={24} />
                        <h3 className="text-xl font-black uppercase tracking-tight text-white">Director's Hotline</h3>
                        <span className="bg-[#ff4d00]/20 text-[#ff4d00] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-[#ff4d00]/30">Premium</span>
                      </div>
                      <p className="text-white/50 text-sm mb-6 relative z-10 max-w-2xl">Stuck on a tech issue? Drop a quick video or message here, and Mike will get back to you with the fix directly.</p>
                      
                      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl mb-4 bg-black/20 min-h-[120px] relative z-10">
                        <p className="text-white/30 text-sm font-medium">No recent messages.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 relative z-10">
                        <input type="text" placeholder="Type your issue or drop a video link..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ff4d00] text-white transition-colors" />
                        <button className="bg-[#ff4d00] text-black font-black uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-orange-500 transition-colors shadow-lg w-full sm:w-auto">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden border border-white/5 mt-4">
                    <div className="space-y-6 p-4 md:p-8 blur-md opacity-30 select-none pointer-events-none bg-[#0a0a0a]">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-[#131313] rounded-3xl p-6 border border-white/10">
                          <h3 className="text-lg font-bold text-white mb-6">Action Items</h3>
                          <div className="space-y-4">
                            <div className="h-14 bg-white/10 rounded-xl w-full"></div>
                            <div className="h-14 bg-white/10 rounded-xl w-full"></div>
                          </div>
                        </div>
                        <div className="bg-[#131313] rounded-3xl p-6 border border-white/10 flex flex-col justify-center items-center h-[200px]">
                          <Video size={40} className="text-white mb-4" />
                          <div className="h-12 bg-white/10 rounded-xl w-3/4 mt-4"></div>
                        </div>
                      </div>
                    </div>
                    {/* Fixed Mobile Overlay Padding */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/70 backdrop-blur-sm p-6 text-center">
                      <div className="bg-[#ff4d00]/10 p-4 rounded-full mb-4 border border-[#ff4d00]/30">
                        <Lock size={32} className="text-[#ff4d00] drop-shadow-[0_0_15px_rgba(255,77,0,0.5)]" />
                      </div>
                      <h2 className="text-xl md:text-3xl font-black uppercase text-white tracking-widest mb-3">Sanctuary Locked</h2>
                      <p className="text-white/70 max-w-lg mb-6 text-sm md:text-base leading-relaxed">
                        You haven't booked a virtual consultation yet. Book a session with Mike to unlock your custom gear list, acoustic layout, session replay, and exclusive access to the Director's Hotline.
                      </p>
                      <button onClick={() => navigate('/#pricing-section')} className="bg-[#ff4d00] hover:bg-orange-500 text-black px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,77,0,0.4)] text-xs md:text-sm w-full md:w-auto">
                        Book Consultation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================= */}
            {/* KINGDOM NETWORK TAB (Threads Style Feed)  */}
            {/* ========================================= */}
            {activeTab === 'community' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                <div className="text-center mb-8 md:mb-10">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">Kingdom Network</h1>
                  <p className="text-white/50 text-xs md:text-sm">Connect, collaborate, and share your space with other faith-driven creators.</p>
                </div>

                <div className="bg-[#131313] p-4 md:p-5 rounded-3xl border border-white/10 mb-8 shadow-lg focus-within:border-[#ff4d00]/50 transition-colors">
                  <div className="flex gap-3 md:gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      <span className="text-white/70 font-bold text-sm uppercase">{profile.avatar_letter}</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <textarea 
                        placeholder="Share your setup, ask for feedback... (Use @ to tag)"
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        className="w-full bg-transparent border-none text-white focus:outline-none resize-none text-sm placeholder:text-white/30"
                        rows={3}
                      />
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                        <button className="text-white/40 hover:text-[#ff4d00] transition-colors p-2 rounded-full hover:bg-white/5">
                          <ImageIcon size={18} />
                        </button>
                        <button 
                          disabled={!newPostText.trim()}
                          onClick={handleCreatePost}
                          className="bg-[#ff4d00] disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed text-black px-6 py-2 rounded-full font-bold text-sm transition-colors shadow-lg"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-transparent group">
                      <div className="flex gap-3 md:gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center shrink-0">
                            <span className="text-white/70 font-bold text-sm uppercase">{post.avatar}</span>
                          </div>
                          <div className="w-[1.5px] h-full bg-white/5 mt-2 group-last:hidden"></div>
                        </div>

                        <div className="flex-1 pb-6 overflow-hidden">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm hover:underline cursor-pointer">{post.author}</span>
                              <span className="text-white/30 text-xs truncate max-w-[100px] sm:max-w-none">@{post.username}</span>
                              {post.instagram && (
                                <a href={`https://instagram.com/${post.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-[#E1306C] transition-colors">
                                  <Instagram size={14} />
                                </a>
                              )}
                              <span className="text-white/30 text-xs ml-1 sm:ml-2">· {post.time}</span>
                            </div>
                            <button className="text-white/20 hover:text-white/50 shrink-0 ml-2">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                          
                          <p className="text-white/80 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
                            {renderContentWithMentions(post.content)}
                          </p>

                          {post.image && (
                            <div className="rounded-2xl overflow-hidden mb-4 border border-white/5">
                              <img src={post.image} alt="Setup" className="w-full h-auto object-cover" />
                            </div>
                          )}

                          <div className="flex items-center gap-6 mt-3">
                            <button className="flex items-center gap-1.5 text-white/40 hover:text-red-400 transition-colors group/btn">
                              <div className="p-1.5 rounded-full group-hover/btn:bg-red-400/10"><Heart size={16} /></div>
                              <span className="text-xs font-medium">{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 text-white/40 hover:text-blue-400 transition-colors group/btn">
                              <div className="p-1.5 rounded-full group-hover/btn:bg-blue-400/10"><MessageCircle size={16} /></div>
                              <span className="text-xs font-medium">{post.replies}</span>
                            </button>
                            <button className="flex items-center gap-1.5 text-white/40 hover:text-green-400 transition-colors group/btn">
                              <div className="p-1.5 rounded-full group-hover/btn:bg-green-400/10"><Share2 size={16} /></div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* MY PROFILE TAB                            */}
            {/* ========================================= */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                <div className="text-center mb-8 md:mb-10">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">My Profile</h1>
                  <p className="text-white/50 text-xs md:text-sm">Manage how you appear in the Kingdom Network.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="bg-[#131313] border border-white/10 rounded-3xl p-5 md:p-8 shadow-xl">
                  
                  <div className="flex items-center gap-4 md:gap-6 mb-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-2xl md:text-3xl font-black text-white/50 shrink-0">
                      {profile.avatar_letter}
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white">Profile Avatar</h3>
                      <p className="text-xs text-white/40 mt-1">Automatically generated from your name.</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={profile.display_name} 
                        onChange={(e) => setProfile({...profile, display_name: e.target.value, avatar_letter: e.target.value.charAt(0).toUpperCase()})}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Username (For @Mentions)</label>
                      <div className="flex relative">
                        <span className="absolute left-4 top-3 text-white/30 font-bold">@</span>
                        <input 
                          type="text" 
                          value={profile.username} 
                          onChange={(e) => setProfile({...profile, username: e.target.value.replace('@', '')})}
                          className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Instagram Handle</label>
                      <div className="flex relative">
                        <span className="absolute left-4 top-3 text-white/30"><Instagram size={16} /></span>
                        <input 
                          type="text" 
                          value={profile.instagram_handle} 
                          placeholder="e.g. mike.creates"
                          onChange={(e) => setProfile({...profile, instagram_handle: e.target.value.replace('@', '')})}
                          className="w-full bg-black border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white transition-colors"
                        />
                      </div>
                      <p className="text-[#ff4d00] text-[10px] uppercase font-bold tracking-wider mt-2">Links directly from your posts in the feed.</p>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-6">
                      <button 
                        type="submit" 
                        disabled={isSavingProfile}
                        className="bg-[#ff4d00] text-black font-black uppercase tracking-wider px-8 py-3.5 rounded-xl hover:bg-orange-500 transition-colors shadow-lg disabled:opacity-50 w-full md:w-auto"
                      >
                        {isSavingProfile ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </div>
                </form>
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
        <button onClick={() => setActiveTab('community')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'community' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <Compass size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Network</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'profile' ? 'text-[#ff4d00]' : 'text-white/40'}`}>
          <User size={20} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
}
