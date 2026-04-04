import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Camera, Link as LinkIcon, Instagram } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Profile({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null);
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
    if (user) fetchProfile();
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

  const handleSave = async () => {
    setSaving(true);
    let newAvatarUrl = profile?.avatar_url;

    // Upload new avatar if selected
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

    await supabase.from('profiles').upsert(updates);
    await fetchProfile();
    setIsEditing(false);
    setSaving(false);
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* --- VIEW MODE --- */}
      {!isEditing ? (
        <div className="flex flex-col items-center mt-10">
          {/* Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#ff4d00] p-1 overflow-hidden shadow-[0_0_30px_rgba(255,77,0,0.2)] mb-6">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
                <User size={48} className="text-white/20" />
              </div>
            )}
          </div>

          {/* Name & Handle */}
          <h1 className="text-3xl md:text-4xl font-black text-white">{profile?.first_name} {profile?.last_name}</h1>
          {profile?.instagram_url && (
            <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-[#ff4d00] hover:text-white transition-colors mt-2 flex items-center gap-1.5 font-medium">
              <Instagram size={16} />
              @{profile.instagram_url.split('.com/')[1]?.replace('/', '') || 'instagram'}
            </a>
          )}

          {/* Edit Button */}
          <button onClick={() => setIsEditing(true)} className="mt-6 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full font-bold transition-all border border-white/5">
            Edit Profile
          </button>

          {/* Bio & Links */}
          <div className="w-full max-w-lg mt-12 bg-[#131313] border border-white/5 rounded-[2rem] p-8 shadow-xl">
            <h3 className="text-white/40 text-sm font-bold uppercase tracking-widest mb-4">Bio</h3>
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{profile?.bio || "No bio added yet."}</p>
            
            {profile?.website_url && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <h3 className="text-white/40 text-sm font-bold uppercase tracking-widest mb-4">Links</h3>
                <a href={profile.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium">
                  <LinkIcon size={16} /> {profile.website_url.replace(/^https?:\/\//, '')}
                </a>
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
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-[#ff4d00] p-0.5 overflow-hidden">
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
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" placeholder="Tell the community about yourself..." />
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
