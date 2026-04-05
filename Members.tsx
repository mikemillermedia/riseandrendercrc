import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'react-router-dom';
import { User, MessageCircle, Heart, UserPlus, UserCheck, ArrowRight, ArrowLeft, Instagram, Link as LinkIcon, X } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Members({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [members, setMembers] = useState<any[]>([]);
  const [latestPost, setLatestPost] = useState<any>(null);
  const [newestMember, setNewestMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for viewing a specific member's public profile
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberSetup, setMemberSetup] = useState<string | null>(null);
  const [memberPosts, setMemberPosts] = useState<any[]>([]); 
  const [isFollowing, setIsFollowing] = useState(false); 
  const [followLoading, setFollowLoading] = useState(false);

  // Stats
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // NEW: Modal States
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setCurrentUser(session.user);
    };
    getUser();
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (profilesData) {
      setMembers(profilesData);
      setNewestMember(profilesData[0]); 
    }
    const { data: postData } = await supabase.from('posts').select('*, profiles:user_id(first_name, last_name, avatar_url)').order('created_at', { ascending: false }).limit(1).single();
    if (postData) setLatestPost(postData);
    setLoading(false);
  };

  const handleMemberClick = async (member: any) => {
    setSelectedMember(member);
    setMemberSetup(null); 
    setMemberPosts([]); 
    setIsFollowing(false);

    const { data: setupData } = await supabase.from('posts').select('media_url').eq('user_id', member.id).not('media_url', 'is', null).order('created_at', { ascending: false }).limit(1).single();
    if (setupData) setMemberSetup(setupData.media_url);

    const { data: postsData } = await supabase.from('posts').select('*, post_likes(user_id), comments(*)').eq('user_id', member.id).order('created_at', { ascending: false });
    if (postsData) setMemberPosts(postsData);

    const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', member.id);
    const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', member.id);
    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);

    if (currentUser) {
      const { data: followData } = await supabase.from('follows')
        .select('*')
        .eq('follower_id', currentUser.id)
        .eq('following_id', member.id)
        .single();
      
      if (followData) setIsFollowing(true);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser || !selectedMember) return;
    setFollowLoading(true);

    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', selectedMember.id);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1)); 
      } else {
        await supabase.from('follows').insert([{ follower_id: currentUser.id, following_id: selectedMember.id }]);
        await supabase.from('notifications').insert([{ user_id: selectedMember.id, actor_id: currentUser.id, type: 'new_follower' }]);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1); 
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
    setFollowLoading(false);
  };

  // NEW: Fetch users for the glass modal
  const openFollowModal = async (type: 'followers' | 'following') => {
    if (!selectedMember) return;
    setModalType(type);
    setShowFollowModal(true);
    setModalLoading(true);
    setModalUsers([]);

    if (type === 'followers') {
      const { data } = await supabase
        .from('follows')
        .select('follower:follower_id(id, first_name, last_name, avatar_url, instagram_url)')
        .eq('following_id', selectedMember.id);
      if (data) setModalUsers(data.map((d: any) => d.follower).filter(Boolean));
    } else {
      const { data } = await supabase
        .from('follows')
        .select('following:following_id(id, first_name, last_name, avatar_url, instagram_url)')
        .eq('follower_id', selectedMember.id);
      if (data) setModalUsers(data.map((d: any) => d.following).filter(Boolean));
    }
    setModalLoading(false);
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading community...</div>;

  if (selectedMember) {
    return (
      <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-right-4 duration-300 relative">
        
        {/* GLASS MODAL POP-OUT */}
        {showFollowModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#131313]/80 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
                <h3 className="text-white font-black uppercase tracking-widest text-sm">
                  {modalType === 'followers' ? 'Followers' : 'Following'}
                </h3>
                <button onClick={() => setShowFollowModal(false)} className="text-white/40 hover:text-[#ff4d00] transition-colors p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto p-2 space-y-1">
                {modalLoading ? (
                  <div className="text-center text-white/40 text-sm py-8">Loading...</div>
                ) : modalUsers.length === 0 ? (
                  <div className="text-center text-white/40 text-sm py-8">No users found.</div>
                ) : (
                  modalUsers.map((u, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer" onClick={() => { setShowFollowModal(false); handleMemberClick(u); }}>
                      <div className="w-12 h-12 rounded-full bg-black overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                        {u?.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-bold text-white truncate">{u?.first_name} {u?.last_name}</p>
                        {u?.instagram_url && <p className="text-xs text-[#ff4d00] truncate">@{u.instagram_url.split('.com/')[1]?.replace('/', '')}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <button onClick={() => setSelectedMember(null)} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft size={20} /> Back to Directory
        </button>
        <div className="flex flex-col mt-4">
          <div className="flex flex-col items-center mb-12">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#ff4d00]/80 p-1 overflow-hidden shadow-[0_0_30px_rgba(255,77,0,0.15)] mb-4 bg-[#131313]">
              {selectedMember.avatar_url ? <img src={selectedMember.avatar_url} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center"><User size={48} className="text-white/20" /></div>}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white">{selectedMember.first_name ? `${selectedMember.first_name} ${selectedMember.last_name}` : 'CRC Member'}</h1>
            
            {selectedMember.instagram_url && (
              <a href={selectedMember.instagram_url} target="_blank" rel="noreferrer" className="text-[#ff4d00] hover:text-orange-400 transition-colors mt-2 text-sm font-medium flex items-center gap-1.5">
                <Instagram size={16} /> @{selectedMember.instagram_url.split('.com/')[1]?.replace('/', '') || 'instagram'}
              </a>
            )}

            {/* UPDATED: Clickable Follower Stats */}
            <div className="flex items-center gap-6 mt-4 text-sm text-white/60">
              <button onClick={() => openFollowModal('following')} className="hover:text-[#ff4d00] transition-colors flex flex-col items-center group">
                <span className="font-black text-white text-lg group-hover:text-[#ff4d00] transition-colors">{followingCount}</span> 
                <span className="text-xs uppercase tracking-widest">Following</span>
              </button>
              <div className="w-px h-8 bg-white/10"></div>
              <button onClick={() => openFollowModal('followers')} className="hover:text-[#ff4d00] transition-colors flex flex-col items-center group">
                <span className="font-black text-white text-lg group-hover:text-[#ff4d00] transition-colors">{followersCount}</span> 
                <span className="text-xs uppercase tracking-widest">Followers</span>
              </button>
            </div>

            {currentUser && currentUser.id !== selectedMember.id && (
              <button 
                onClick={toggleFollow}
                disabled={followLoading}
                className={`mt-6 flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg ${
                  isFollowing 
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/5' 
                    : 'bg-[#ff4d00] text-black hover:bg-orange-500 shadow-orange-900/20'
                }`}
              >
                {isFollowing ? (
                  <><UserCheck size={18} /> Following</>
                ) : (
                  <><UserPlus size={18} /> Follow</>
                )}
              </button>
            )}

          </div>
          
          <div className="w-full space-y-8 bg-[#1A1A1A] border border-white/5 p-8 rounded-[2rem] shadow-xl">
            <div><h3 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-3">Bio</h3><p className="text-white/90 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{selectedMember.bio || "Creative Representing Christ."}</p></div>
            {selectedMember.website_url && (<div className="pt-6 border-t border-white/5"><h3 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-3">Links</h3><a href={selectedMember.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm md:text-base"><LinkIcon size={16} /> {selectedMember.website_url.replace(/^https?:\/\//, '')}</a></div>)}
            {memberSetup && (<div className="pt-6 border-t border-white/5"><h3 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-3">Showcase Setup</h3><img src={memberSetup} alt="Setup Showcase" className="w-full rounded-xl object-cover border border-white/5" /></div>)}
            
            {memberPosts.length > 0 && (
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {memberPosts.map(post => (
                    <div key={post.id} onClick={() => setSearchParams({ tab: 'chat', postId: post.id })} className="bg-black/20 p-5 rounded-2xl border border-white/5 cursor-pointer hover:border-[#ff4d00]/50 transition-all group">
                      <p className="text-xs text-white/30 mb-2 font-medium uppercase tracking-wider group-hover:text-[#ff4d00]/70 transition-colors">{new Date(post.created_at).toLocaleDateString()}</p>
                      <p className="text-white/90 text-sm md:text-base mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                      {post.media_url && <img src={post.media_url} className="w-full max-h-64 object-cover rounded-xl mb-4 border border-white/5" />}
                      <div className="flex gap-4 text-white/40">
                        <div className="flex items-center gap-1.5"><Heart size={16} className={post.post_likes?.length > 0 ? "text-[#ff4d00]" : ""} /> <span className="text-xs font-bold">{post.post_likes?.length || 0}</span></div>
                        <div className="flex items-center gap-1.5"><MessageCircle size={16} /> <span className="text-xs font-bold">{post.comments?.length || 0}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end"><div><h1 className="text-3xl font-black text-white">The Hub</h1><p className="text-white/50 mt-1">Updates and member directory.</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min mb-12">
        <div onClick={() => setActiveTab('chat')} className="cursor-pointer md:col-span-2 md:row-span-2 bg-[#1A1A1A] rounded-3xl p-8 border border-white/5 shadow-lg flex flex-col justify-between group hover:border-[#ff4d00]/50 hover:shadow-[0_0_30px_rgba(255,77,0,0.1)] transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d00] rounded-full mix-blend-screen filter blur-[100px] opacity-[0.05] group-hover:opacity-10 transition-opacity" />
          <div>
            <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><div className="bg-[#ff4d00]/10 p-3 rounded-2xl text-[#ff4d00]"><MessageCircle size={24} /></div><h2 className="text-xl font-black text-white">Latest in Chat</h2></div><ArrowRight className="text-white/20 group-hover:text-[#ff4d00] transition-colors" /></div>
            {latestPost ? (
              <><p className="text-white/90 text-lg md:text-2xl leading-relaxed font-medium mb-6 line-clamp-3">"{latestPost.content}"</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5">{latestPost.profiles?.avatar_url ? <img src={latestPost.profiles.avatar_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-2 text-white/40" size={20} />}</div><div><p className="text-sm font-bold text-white">{latestPost.profiles?.first_name} {latestPost.profiles?.last_name}</p><p className="text-xs text-white/40">Join the conversation</p></div></div></>
            ) : <p className="text-white/40">No posts yet. Go start a thread!</p>}
          </div>
        </div>
        <div onClick={() => setActiveTab('prayer')} className="cursor-pointer md:col-span-1 md:row-span-1 bg-[#1A1A1A] rounded-3xl p-6 border border-white/5 shadow-lg flex flex-col justify-between group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="bg-white/5 p-2.5 rounded-xl text-white"><Heart size={20} /></div><h3 className="font-bold text-white">Prayer Wall</h3></div><ArrowRight size={18} className="text-white/20 group-hover:text-white transition-colors" /></div>
          <div><p className="text-white/80 text-sm line-clamp-2 mb-3">Check the prayer wall to support and uplift fellow creatives in the CRC community this week.</p><span className="text-[#ff4d00] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">View Requests</span></div>
        </div>
        {newestMember && (
          <div onClick={() => handleMemberClick(newestMember)} className="cursor-pointer md:col-span-1 md:row-span-1 bg-[#1A1A1A] rounded-3xl p-6 border border-white/5 shadow-lg flex flex-col justify-between group hover:border-[#ff4d00]/30 transition-all">
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="bg-[#ff4d00]/10 p-2.5 rounded-xl text-[#ff4d00]"><UserPlus size={20} /></div><h3 className="font-bold text-white">Newest Member</h3></div><ArrowRight size={18} className="text-white/20 group-hover:text-[#ff4d00] transition-colors" /></div>
            <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full border-2 border-[#ff4d00]/30 overflow-hidden bg-white/5 flex-shrink-0">{newestMember.avatar_url ? <img src={newestMember.avatar_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-3 text-white/40" size={20} />}</div><div><p className="font-bold text-white text-sm group-hover:text-[#ff4d00] transition-colors">{newestMember.first_name ? `${newestMember.first_name} ${newestMember.last_name}` : 'New Member'}</p><p className="text-xs text-white/40">View profile</p></div></div>
          </div>
        )}
      </div>
      <div className="pt-8 border-t border-white/10"><h2 className="text-2xl font-black text-white mb-6">Member Directory</h2>
        {members.length === 0 ? <div className="text-white/40 italic">No members found yet.</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((member) => (
              <div key={member.id} onClick={() => handleMemberClick(member)} className="cursor-pointer bg-[#1A1A1A] rounded-3xl p-6 border border-white/5 shadow-lg hover:border-white/20 transition-all flex flex-col group hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4"><div className="w-14 h-14 rounded-full border border-white/10 overflow-hidden bg-black flex-shrink-0">{member.avatar_url ? <img src={member.avatar_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-3.5 text-white/40" size={24} />}</div><div className="overflow-hidden"><h3 className="font-bold text-white truncate group-hover:text-[#ff4d00] transition-colors">{member.first_name ? `${member.first_name} ${member.last_name}` : 'CRC Member'}</h3>{member.instagram_url && (<span className="text-xs text-white/40 truncate block">@{member.instagram_url.split('.com/')[1]?.replace('/', '') || 'instagram'}</span>)}</div></div>
                <p className="text-sm text-white/60 line-clamp-3 leading-relaxed flex-grow">{member.bio || "Creative Representing Christ."}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
