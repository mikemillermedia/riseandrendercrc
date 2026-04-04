import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, HeartHandshake, MessageSquare, User, Menu, X, Download, Folder, Activity } from 'lucide-react';

import PrayerWall from './components/PrayerWall';
import ProfileTab from './ProfileTab';
import CommunityChat from './CommunityChat';
import Members from './Members';
import freeKitImage from './The Content Creator Studio Kit.jpg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Hub() {
  const navigate = useNavigate();
  
  // --- URL-based Tab Tracking ---
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'activity';
  
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };
  // -----------------------------------

  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <button onClick={() => { setActiveTab('vault'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <Folder size={20} /> The Vault
      </button>
      <button onClick={() => { setActiveTab('prayer'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'prayer' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <HeartHandshake size={20} /> Prayer Wall
      </button>
      <button onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'chat' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <MessageSquare size={20} /> Community Chat
      </button>
      <button onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-[#ff4d00]/10 text-[#ff4d
