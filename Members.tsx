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
  const [memberPosts, setMemberPosts] = useState<any[]>([]); // New state for their posts

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    // Fetch all members (even if they haven't filled out their profile yet)
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

    // 1. Fetch their latest setup photo
    const { data: setupData } = await supabase
      .from('posts')
      .select('media_url')
      .eq('user_id', member.id)
      .not('media_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (setupData) setMemberSetup(setupData.media_url);

    // 2. Fetch all of their Community Chat posts
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
              {selectedMember.first_name ? `${selectedMember.first_name} ${selectedMember.last_name}
