import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Camera, Link as LinkIcon, Instagram } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Profile({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [latestSetup, setLatestSetup] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
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
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setBio(data.bio || '');
      setInstagramUrl(data.instagram_url || '');
      setWebsiteUrl(data.website_url || '');
      setAvatarPreview(data.avatar_url || null);
    }
    setLoading(false);
  };

  const fetchLatestSetup = async () => {
    // Grabs the user's most recent post that includes an image
    const { data } = await supabase
      .from('posts')
      .select('media_url')
      .eq('user_id', user.id)
      .not('media_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (data) setLatestSetup(data.media_url);
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
      console.error("Failed to save:", error);
      alert("Failed to save profile. Please ensure you are logged in correctly.");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* --- VIEW MODE --- */}
      {!isEditing ? (
        <div className="flex flex-col mt-10">
          
          {/* Centered Top Section */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#C5A880] p-1 overflow-hidden shadow-[0_0_30px_rgba(197,168,128,0.15)] mb-4 bg-[#131313]">
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
              <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white transition-colors mt-1 text-sm underline underline-offset-4">
                @{profile.instagram_url.split('.com/')[1]?.replace('/', '') || 'instagram'}
              </a>
            )}

            <button onClick={() => setIsEditing(true)} className="mt-6 bg-[#2A2A2A] hover:bg-[#333] text-white px-6 py-2 rounded-full font-semibold transition-all text-sm border border-white/5">
              Edit Profile
            </button>
          </div>

          {/* Left Aligned Bottom Section */}
          <div className="w-full space-y-8">
            
            {/* Bio */}
            <div>
              <h3 className="text-white font-bold mb-2">Bio:</h3>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {profile?.bio || "No bio added yet. Click Edit Profile to add one!"}
              </p>
            </div>

            {/* Links */}
            {(profile?.website_url || profile?.instagram_url) && (
              <div>
                <h3 className="text-white font-bold mb-2">Links:</h3>
                <div className="flex flex-col gap-2">
                  {profile?.website_url && (
                    <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors text-sm md:text-base underline underline-offset-4">
                      {profile.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {profile?.instagram_url && (
                    <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors text-sm md:text-base underline underline-offset-4">
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Setup Showcase */}
            {latestSetup && (
              <div className="pt-8">
                <img src={latestSetup} alt="Setup Showcase" className="w-full max-w-sm rounded-xl object-cover border border-white/5" />
                <p className="text-white/80 mt-3 text-sm md:text-base">Your Showcase Setup (CRC)</p>
              </div>
            )}

          </div>
        </div>
      ) : (

      /* --- EDIT MODE --- */
        <div className="bg-[#131313] border border-white/5 rounded-[2rem] p-8 mt-10 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white">Edit Profile</h2>
            <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white">Cancel</button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-[#C5A880] p-0.5 overflow-hidden bg-black">
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
