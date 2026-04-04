import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, MessageCircle, Heart, UserPlus, ArrowRight } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [latestPost, setLatestPost] = useState<any>(null);
  const [newestMember, setNewestMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    // 1. Fetch all members with bios
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesData) {
      setMembers(profilesData);
      setNewestMember(profilesData[0]); // The most recently joined member
    }

    // 2. Fetch the latest Community Chat post
    const { data: postData } = await supabase
      .from('posts')
      .select('*, profiles:user_id(first_name, last_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (postData) setLatestPost(postData);

    setLoading(false);
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading community...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">The Hub</h1>
        <p className="text-white/50 mt-1">Updates and member directory.</p>
      </div>

      {/* BENTO BOX GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min">
        
        {/* 1. LATEST CHAT POST (HUGE BENTO BLOCK - Spans 2 cols, 2 rows) */}
        <div className="md:col-span-2 md:row-span-2 bg-[#1A1A1A] rounded-3xl p-8 border border-white/5 shadow-lg flex flex-col justify-between group hover:border-[#ff4d00]/30 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d00] rounded-full mix-blend-screen filter blur-[100px] opacity-[0.05] group-hover:opacity-10 transition-opacity" />
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#ff4d00]/10 p-3 rounded-2xl text-[#ff4d00]">
                <MessageCircle size={24} />
              </div>
              <h2 className="text-xl font-black text-white">Latest in Chat</h2>
            </div>
            
            {latestPost ? (
              <>
                <p className="text-white/90 text-lg md:text-2xl leading-relaxed font-medium mb-6 line-clamp-3">
                  "{latestPost.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
                    {latestPost.profiles?.avatar_url ? (
                      <img src={latestPost.profiles.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <User className="m-auto mt-2 text-white/40" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{latestPost.profiles?.first_name} {latestPost.profiles?.last_name}</p>
                    <p className="text-xs text-white/40">Posted recently</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-white/40">No posts yet. Go start a thread!</p>
            )}
          </div>
        </div>

        {/* 2. PRAYER WALL UPDATE (MEDIUM BENTO BLOCK) */}
        <div className="md:col-span-1 md:row-span-1 bg-[#1A1A1A] rounded-3xl p-6 border border-white/5 shadow-lg flex flex-col justify-between hover:border-white/10 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/5 p-2.5 rounded-xl text-white">
              <Heart size={20} />
            </div>
            <h3 className="font-bold text-white">Prayer Wall</h3>
          </div>
          <div>
            <p className="text-white/80 text-sm line-clamp-2 mb-3">
              "Check the prayer wall to support and uplift fellow creatives in the CRC community this week."
            </p>
            <button className="text-[#ff4d00] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View Requests <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 3. NEWEST MEMBER (MEDIUM BENTO BLOCK) */}
        <div className="md:col-span-1 md:row-span-1 bg-[#1A1A1A] rounded-3xl p-6 border border-white/5 shadow-lg flex flex-col justify-between hover:border-white/10 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/5 p-2.5 rounded-xl text-white">
              <UserPlus size={20} />
            </div>
            <h3 className="font-bold text-white">Newest Member</h3>
          </div>
          {newestMember && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#ff4d00]/30 overflow-hidden bg-white/5 flex-shrink-0">
                {newestMember.avatar_url ? (
                  <img src={newestMember.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <User className="m-auto mt-3 text-white/40" size={20} />
                )}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{newestMember.first_name} {newestMember.last_name}</p>
                <p className="text-xs text-white/40">Welcome to the Hub!</p>
              </div>
            </div>
          )}
        </div>

        {/* 4. MEMBER DIRECTORY (MAPPED BENTO BLOCKS) */}
        {members.map((member) => (
          <div key={member.id} className="md:col-span-1 bg-[#1A1A1A] rounded-3xl p-6 border border-white/5 shadow-lg hover:border-white/10 transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-14 h-14 rounded-full border border-white/10 overflow-hidden bg-black flex-shrink-0">
                 {member.avatar_url ? (
                   <img src={member.avatar_url} className="w-full h-full object-cover" />
                 ) : (
                   <User className="m-auto mt-3.5 text-white/40" size={24} />
                 )}
               </div>
               <div>
                 <h3 className="font-bold text-white truncate">{member.first_name} {member.last_name}</h3>
                 {member.instagram_url && (
                    <a href={member.instagram_url} target="_blank" rel="noreferrer" className="text-xs text-[#ff4d00] hover:text-white transition-colors">
                      @instagram
                    </a>
                 )}
               </div>
            </div>
            
            <p className="text-sm text-white/60 line-clamp-3 leading-relaxed flex-grow">
              {member.bio || "Creative Representing Christ."}
            </p>

            {member.website_url && (
              <a href={member.website_url} target="_blank" rel="noreferrer" className="mt-4 text-xs font-bold text-white/30 hover:text-white transition-colors block truncate">
                {member.website_url.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}
