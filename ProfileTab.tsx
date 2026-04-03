import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Save, Upload } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfileTab({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    instagram_url: '',
    setup_image_url: ''
  });

  // Fetch the user's existing data when the tab loads
  useEffect(() => {
    async function getProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
      setLoading(false);
    }
    getProfile();
  }, [user.id]);

  // Save text changes to the database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...profile
    });
    
    if (error) setMessage('Error saving profile.');
    else setMessage('Profile saved successfully!');
    
    setSaving(false);
    setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
  };

  // Handle uploading an image to the Supabase bucket
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      setMessage('Uploading image...');
      
      const { error: uploadError } = await supabase.storage.from('setups').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('setups').getPublicUrl(fileName);

      setProfile({ ...profile, setup_image_url: publicUrl });
      setMessage('Image uploaded! Click Save Profile to keep it.');
    } catch (error: any) {
      setMessage(`Upload failed: ${error.message}`);
    }
  };

  if (loading) return <div className="text-[#F5F5F0]/60 animate-pulse">Loading profile data...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">My Profile</h1>
      <p className="text-[#F5F5F0]/60 mb-8">Manage your details and share your setup with the community.</p>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Photo Upload Area */}
        <div className="bg-[#131313] border border-[#F5F5F0]/10 p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold uppercase tracking-widest mb-4">Your Setup Photo</h3>
          
          {profile.setup_image_url ? (
            <div className="mb-4 relative rounded-xl overflow-hidden h-64 border border-[#F5F5F0]/10">
              <img src={profile.setup_image_url} alt="Setup" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="mb-4 h-48 bg-white/5 rounded-xl border border-dashed border-[#F5F5F0]/20 flex items-center justify-center text-[#F5F5F0]/40 text-sm">
              No setup photo uploaded yet.
            </div>
          )}
          
          <label className="bg-white/5 hover:bg-white/10 border border-[#F5F5F0]/10 text-white px-4 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 w-fit text-sm font-medium">
            <Upload size={18} />
            {profile.setup_image_url ? 'Change Photo' : 'Upload Photo'}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {/* Text Fields */}
        <div className="bg-[#131313] border border-[#F5F5F0]/10 p-6 rounded-2xl space-y-4 shadow-xl">
           <h3 className="font-bold uppercase tracking-widest mb-4">Personal Info</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-medium text-[#F5F5F0]/60 mb-1 uppercase tracking-wider">First Name</label>
               <input type="text" value={profile.first_name || ''} onChange={e => setProfile({...profile, first_name: e.target.value})} className="w-full bg-black border border-[#F5F5F0]/20 rounded-xl px-4 py-3 text-[#F5F5F0] focus:outline-none focus:border-[#ff4d00] transition-colors" />
             </div>
             <div>
               <label className="block text-xs font-medium text-[#F5F5F0]/60 mb-1 uppercase tracking-wider">Last Name</label>
               <input type="text" value={profile.last_name || ''} onChange={e => setProfile({...profile, last_name: e.target.value})} className="w-full bg-black border border-[#F5F5F0]/20 rounded-xl px-4 py-3 text-[#F5F5F0] focus:outline-none focus:border-[#ff4d00] transition-colors" />
             </div>
           </div>
           <div>
             <label className="block text-xs font-medium text-[#F5F5F0]/60 mb-1 uppercase tracking-wider">Instagram URL</label>
             <input type="url" placeholder="https://instagram.com/yourhandle" value={profile.instagram_url || ''} onChange={e => setProfile({...profile, instagram_url: e.target.value})} className="w-full bg-black border border-[#F5F5F0]/20 rounded-xl px-4 py-3 text-[#F5F5F0] focus:outline-none focus:border-[#ff4d00] transition-colors" />
           </div>
        </div>

        {message && (
          <div className="bg-[#ff4d00]/10 border border-[#ff4d00]/20 text-[#ff4d00] px-4 py-3 rounded-xl text-sm font-medium text-center">
            {message}
          </div>
        )}

        <button type="submit" disabled={saving} className="w-full md:w-auto bg-[#ff4d00] hover:bg-[#ff4d00]/80 text-white font-bold py-3.5 px-8 rounded-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20">
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
