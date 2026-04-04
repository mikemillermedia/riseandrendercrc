import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, MessageCircle, Heart, UserPlus, ArrowRight, ArrowLeft, Instagram, Link as LinkIcon } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Members({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [latestPost, setLatestPost] = useState<any>(null);
  const [newestMember, setNewestMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for viewing a specific member's public profile
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberSetup, setMemberSetup] = useState<string | null>(null);
  const [memberPosts, setMemberPosts] = useState<any[]>([]); 

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesData) {
      setMembers(profilesData);
      setNewestMember(profilesData[0]); 
    }

    const { data: postData } = await supabase
      .from('posts')
      .select('*, profiles:user_id(first_name, last_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (postData) setLatestPost(postData);
    setLoading(false);
  };

  const handleMemberClick = async (member: any) => {
    setSelectedMember(member);
    setMemberSetup(null); 
    setMemberPosts([]); 

    const { data: setupData } = await supabase
      .from('posts')
      .select('media_url')
      .eq('user_id', member.id)
      .not('media_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (setupData) setMemberSetup(setupData.media_url);

    const { data: postsData } = await supabase
      .from('posts')
      .select('*, post_likes(user_id), comments(*)')
      .eq('user_id', member.id)
      .order('created_at', { ascending: false });
      
    if (postsData) setMemberPosts(postsData);
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading community...</div>;

  // ==========================================
  // --- PUBLIC PROFILE VIEW (When Clicked) ---
  // ==========================================
  if (selectedMember) {
    return (
      <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedMember(null)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} /> Back to Directory
        </button>

        <div className="flex flex-col mt-4">
          <div className="flex flex-col items-center mb-12">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#ff4d00]/80 p-1 overflow-hidden shadow-[0_0_30px_rgba(255,77,0,0.15)] mb-4 bg-[#131313]">
              {selectedMember.avatar_url ? (
                <img src={selectedMember.avatar_url} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
                  <User size={48} className="text-white/20" />
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white">
              {selectedMember.first_name ? `${selectedMember.first_name} ${selectedMember.last_name}` : 'CRC Member'}
            </h1>
            
            {selectedMember.instagram_url && (
              <a href={selectedMember.instagram_url} target="_blank" rel="noreferrer" className="text-[#ff4d00] hover:text-orange-400 transition-colors mt-2 text-sm font-medium flex items-center gap-1.5">
                <Instagram size={16} /> @{selectedMember.instagram_url.split('.com/')[1]?.replace('/', '') || 'instagram'}
              </a>
            )}
          </div>

          <div className="w-full space-y-8 bg-[#1A1A1A] border border-white/5 p-8 rounded-[2rem] shadow-xl">
            <div>
              <h3 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-3">Bio</h3>
              <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {selectedMember.bio || "Creative Representing Christ."}
              </p>
            </div>

            {selectedMember.website_url && (
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-3">Links</h3>
                <a href={selectedMember.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm md:text-base">
                  <LinkIcon size={16} /> {selectedMember.website_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {memberSetup && (
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-3">Showcase Setup</h3>
                <img src={memberSetup} alt="Setup Showcase" className="w-full rounded-xl object-cover border border-white/5" />
              </div>
            )}

            {memberPosts.length > 0 && (
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {memberPosts.map(post => (
                    <div key={post.id} className="bg-black/20 p-5 rounded-2xl border border-white/5">
                      <p className="text-xs text-white/30 mb-2 font-medium uppercase tracking-wider">
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
      </div>
    );
  }

  // ==========================================
  // --- BENTO BOX DIRECTORY VIEW (Default) ---
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white">The Hub</h1>
          <p className="text-white/50 mt-1">Updates and member directory.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min mb-12">
        
        <div 
          onClick={() => setActiveTab('chat')}
          className="cursor-pointer md:col-span-2 md:row-span-2 bg-[#1A1A1A] rounded-3xl p-8 border border-white/5 shadow-lg flex flex-col justify-between group hover:border-[#ff4d00]/50 hover:shadow-[0_0_30px_rgba(255,77,0,0.1)] transition-all relative overflow-hidden"
        >
