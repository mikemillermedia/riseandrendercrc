import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'react-router-dom';
import { User, Camera, Link as LinkIcon, Instagram, Heart, MessageCircle, X } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfileTab({ user }: { user: any }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [latestSetup, setLatestSetup] = useState<string | null>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]); 
  
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLatestSetup();
      fetchUserPosts();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setBio(data.bio || '');
      setInstagramUrl(data.instagram_url || '');
      setWebsiteUrl(data.website_url || '');
      setAvatarPreview(data.avatar_url || null);
    }

    const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id);
    const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id);
    
    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);

    setLoading(false);
  };

  const fetchLatestSetup = async () => {
    const { data } = await supabase.from('posts').select('media_url').eq('user_id', user.id).not('media_url', 'is', null).order('created_at', { ascending: false }).limit(1).single();
    if (data) setLatestSetup(data.media_url);
  };

  const fetchUserPosts = async () => {
    const { data } = await supabase.from('posts').select('*, post_likes(user_id), comments(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setMyPosts(data);
  };

  const handleSave = async () => {
    setSaving(true);
    let newAvatarUrl = profile?.avatar_url;

    if (avatarFile) {
      const fileName = `${user.id}/${Math.random()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        newAvatarUrl = publicUrl;
      }
    }

    const updates = {
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      bio,
      instagram_url: instagramUrl,
      website_url: websiteUrl,
      avatar_url: newAvatarUrl,
      updated_at: new Date()
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    
    if (!error) {
      await fetchProfile();
      setIsEditing(false);
    } else {
      alert("Failed to save profile. Please ensure you are logged in correctly.");
    }
    setSaving(false);
  };

  const openFollowModal = async (type: 'followers' | 'following') => {
    setModalType(type);
    setShowFollowModal(true);
    setModalLoading(true);
    setModalUsers([]);

    if (type === 'followers') {
      const { data } = await supabase
        .from('follows')
        .select('follower:follower_id(id, first_name, last_name, avatar_url, instagram_url)')
        .eq('following_id', user.id);
      if (data) setModalUsers(data.map((d: any) => d.follower).filter(Boolean));
    } else {
      const { data } = await supabase
        .from('follows')
        .select('following:following_id(id, first_name, last_name, avatar_url, instagram_url)')
        .eq('follower_id', user.id);
      if (data) setModalUsers(data.map((d: any) => d.following).filter(Boolean));
    }
    setModalLoading(false);
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in duration-500">
      
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
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-black overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                      {u?.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      {/* FIX: Add fallback if first/last name are completely blank */}
                      <p className="text-sm font-bold text-white truncate">
                        {u?.first_name || u?.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : 'CRC Member'}
                      </p>
                      {u?.instagram_url && <p className="text-xs text-[#ff4d00] truncate">@{u.instagram_url.split('.com/')[1]?.replace('/', '')}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!isEditing ? (
        <div className="flex flex-col mt-10">
          <div className="flex flex-col items-center mb-12">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#ff4d00]/80 p-1 overflow-hidden shadow-[0_0_30px_rgba(255,77,0,0.15)] mb-4 bg-[#131313]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
                  <User size={48} className="text-white/20" />
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">{profile?.first_name} {profile?.last_name}</h1>
            
            {profile?.instagram_url && (
              <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-white/50 hover:text-[#ff4d00] transition-colors mt-2 text-sm font-medium flex items-center gap-1.5">
                <Instagram size={16} /> @{profile.instagram_url.split('.com/')[1]?.replace('/', '') || 'instagram'}
              </a>
            )}

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

            <button onClick={() => setIsEditing(true)} className="mt-8 bg-[#1A1A1A] hover:bg-white/10 text-white px-8 py-2.5 rounded-full font-semibold transition-all text-sm border border-white/5 shadow-lg">
              Edit Profile
            </button>
          </div>

          <div className="w-full space-y-8">
            <div>
              <h3 className="text-white font-bold mb-2">Bio:</h3>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {profile?.bio || "No bio added yet. Click Edit Profile to add one!"}
              </p>
            </div>
            {(profile?.website_url || profile?.instagram_url) && (
              <div>
                <h3 className="text-white font-bold mb-2">Links:</h3>
                <div className="flex flex-col gap-3">
                  {profile?.website_url && (
                    <a href={profile.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm md:text-base font-medium">
                      <LinkIcon size={16} /> {profile.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            )}
            {latestSetup && (
              <div className="pt-8 border-t border-white/5">
                <h3 className="text-white font-bold mb-4">Your Showcase Setup</h3>
                <img src={latestSetup} alt="Setup Showcase" className="w-full max-w-sm rounded-xl object-cover border border-white/5" />
              </div>
            )}
            
            {myPosts.length > 0 && (
              <div className="pt-8 border-t border-white/5">
                <h3 className="text-white font-bold mb-4">Your Recent Activity</h3>
                <div className="space-y-4">
                  {myPosts.map(post => (
                    <div 
                      key={post.id} 
                      onClick={() => setSearchParams({ tab: 'chat', postId: post.id })}
                      className="bg-black/20 p-5 rounded-2xl border border-white/5 cursor-pointer hover:border-[#ff4d00]/50 transition-all group"
                    >
                      <p className="text-xs text-white/30 mb-2 font-medium uppercase tracking-wider group-hover:text-[#ff4d00]/70 transition-colors">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-white/90 text-sm md:text-base mb-4 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                      {post.media_url && (
                        <img src={post.media_url} className="w-full max-h-64 object-cover rounded-xl mb-4 border border-white/5" />
                      )}
                      <div className="flex gap-4 text-white/40">
                        <div className="flex items-center gap-1.5">
                          <Heart size={16} className={post.post_likes?.length > 0 ? "text-[#ff4d00]" : ""} /> 
                          <span className="text-xs font-bold">{post.post_likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={16} /> 
                          <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#131313] border border-white/5 rounded-[2rem] p-8 mt-10 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white">Edit Profile</h2>
            <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white">Cancel</button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-[#ff4d00] p-0.5 overflow-hidden bg-black">
                {avatarPreview ? <img src={avatarPreview} className="w-full h-full rounded-full object-cover" /> : <User size={32} className="m-auto mt-4 text-white/20" />}
              </div>
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 border border-white/10">
                <Camera size={16} /> Change Avatar
                <input type="file" className="hidden" accept="image/*" onChange={e => {
                  if (e.target.files?.[0]) {
                    setAvatarFile(e.target.files[0]);
                    setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}/>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" />
              </div>
              <div>
                <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" placeholder="Tell the community about yourself..." />
            </div>
            <div>
              <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Website URL (Optional)</label>
              <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Instagram URL</label>
              <input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" placeholder="https://instagram.com/..." />
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full bg-[#ff4d00] text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-orange-500 transition-colors mt-8">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
