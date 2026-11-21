import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, FolderDown, Lock, 
  User, Film, Camera, Save, Users, MessageSquare, Heart, Send, 
  BookHeart, MoreVertical, Edit2, Trash2, Repeat, Image as ImageIcon, Grid, X, BookOpen, Sparkles, CheckCircle2, ListTodo, Plus, CheckSquare, Square, Smile, CalendarHeart
} from 'lucide-react';

import RetainerDashboard from './RetainerDashboard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const VIBE_EMOJIS = [
  '👋🏾', '🙏🏾', '🙌🏾', '💪🏾', '🫶🏾', '✌🏾', '🤞🏾', '👊🏾', '🤙🏾', '👏🏾', '🫱🏾‍🫲🏽', '🤳🏾',
  '🏃🏾‍♂️', '🏋🏾‍♂️', '🧘🏾‍♀️', '🕺🏾', '💃🏾', '👨🏾‍💻', '👩🏾‍💻', '👨🏾‍🍳', '🤱🏾', '🛌🏾', '🚶🏾‍♂️', '🚴🏾‍♂️',
  '☕', '🍽️', '🍔', '🌮', '🍕', '🥗', '🍿', '🎂', '✈️', '🚗', '🏡', '🏖️',
  '🏈', '🏀', '⚽', '⚾', '🎮', '🎬', '🎧', '📚', '⛪', '✝️', '🎉', '😴', '❤️', '🔥', '✨', '💯'
];

const MILESTONE_CATEGORIES = [
  { label: 'Birthday', emoji: '🎂', annual: true },
  { label: 'Anniversary', emoji: '💍', annual: true },
  { label: 'Trip / Vacation', emoji: '✈️', annual: false },
  { label: 'Family Gathering', emoji: '🏡', annual: false }
];

export default function Hub() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('vault'); 
  const [isLoading, setIsLoading] = useState(true);

  // USER & PROFILE STATE
  const [userId, setUserId] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    id: '', display_name: '', username: '', instagram_handle: '',
    avatar_url: '', first_name: '', last_name: '', bio: '',
    bible_verse: '', has_retainer: false, is_millerite: false, is_client: true,
    status_emoji: '👋🏾', status_text: ''
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // FAMILY VIBE CHECK / STATUS STATE
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusEmojiInput, setStatusEmojiInput] = useState('👋🏾');
  const [statusTextInput, setStatusTextInput] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // TIMELINE, PRAYER, TASKS & MILESTONES STATE
  const [posts, setPosts] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [familyTasks, setFamilyTasks] = useState<any[]>([]);
  const [familyMilestones, setFamilyMilestones] = useState<any[]>([]);
  const [prayerFilter, setPrayerFilter] = useState<'active' | 'answered'>('active');
  const [newPost, setNewPost] = useState('');
  const [newPrayer, setNewPrayer] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Gatherings & Potluck');
  
  // MILESTONE FORM STATE
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneCategory, setNewMilestoneCategory] = useState('Birthday');
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);

  const [isPosting, setIsPosting] = useState(false);
  const [isPraying, setIsPraying] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // INTERACTION STATE
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // MEMBER PROFILE VIEW STATE
  const [viewingMember, setViewingMember] = useState<any | null>(null);
  const [memberPosts, setMemberPosts] = useState<any[]>([]);

  // APPLE LIGHT THEME TOGGLE FOR MILLERITES
  const isLightMode = activeTab === 'millerites' || activeTab === 'member_view';

  const normalizeEmoji = (emoji?: string) => {
    if (!emoji || emoji === '👋') return '👋🏾';
    if (emoji === '🙏') return '🙏🏾';
    return emoji;
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        if (!supabase) { setIsLoading(false); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate('/login'); return; }
        setUserId(session.user.id);

        const { data: bpData } = await supabase.from('blueprints').select('*').eq('user_id', session.user.id).single(); 
        if (bpData) setBlueprint(bpData);

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profileData) {
          const isFamilyOnly = profileData.is_millerite && profileData.is_client === false;
          const cleanEmoji = normalizeEmoji(profileData.status_emoji);
          setProfile({
            ...profileData,
            first_name: profileData.first_name || '', last_name: profileData.last_name || '',
            username: profileData.username || '', instagram_handle: profileData.instagram_handle || '',
            bio: profileData.bio || '', bible_verse: profileData.bible_verse || '',
            avatar_url: profileData.avatar_url || '', is_millerite: profileData.is_millerite ?? false,
            is_client: profileData.is_client ?? true,
            status_emoji: cleanEmoji,
            status_text: profileData.status_text || ''
          });
          setStatusEmojiInput(cleanEmoji);
          setStatusTextInput(profileData.status_text || '');
          if (isFamilyOnly) setActiveTab('millerites');
        }
        await fetchCommunityData();
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, [navigate]);

  const fetchCommunityData = async () => {
    if (!supabase) return;
    try {
      const { data: pData, error: pError } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
      const { data: prData, error: prError } = await supabase.from('prayer_requests').select('*').order('created_at', { ascending: false });
      const { data: likesData } = await supabase.from('post_likes').select('*');
      const { data: repliesData } = await supabase.from('post_replies').select('*');
      const { data: prayerIntercessionsData } = await supabase.from('prayer_intercessions').select('*');
      const { data: tasksData } = await supabase.from('family_tasks').select('*').order('created_at', { ascending: false });
      const { data: milestonesData } = await supabase.from('family_milestones').select('*');
      const { data: milleritesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, bio, bible_verse, is_millerite, status_emoji, status_text, status_updated_at')
        .eq('is_millerite', true);

      if (pError) console.error("Posts Error:", pError.message);
      if (prError) console.error("Prayers Error:", prError.message);
      
      const safePosts = pData || [];
      const safePrayers = prData || [];
      const safeLikes = likesData || [];
      const safeReplies = repliesData || [];
      const safeIntercessions = prayerIntercessionsData || [];
      const safeTasks = tasksData || [];
      const safeMilestones = milestonesData || [];
      const safeMillerites = (milleritesData || []).map((m: any) => ({
        ...m,
        status_emoji: normalizeEmoji(m.status_emoji)
      }));

      setFamilyMembers(safeMillerites);
      setFamilyMilestones(safeMilestones);

      const userIds = new Set<string>();
      safePosts.forEach((p: any) => userIds.add(p.user_id));
      safePrayers.forEach((p: any) => userIds.add(p.user_id));
      safeLikes.forEach((l: any) => userIds.add(l.user_id));
      safeReplies.forEach((r: any) => userIds.add(r.user_id));
      safeIntercessions.forEach((i: any) => userIds.add(i.user_id));
      safeTasks.forEach((t: any) => {
        if (t.user_id) userIds.add(t.user_id);
        if (t.completed_by) userIds.add(t.completed_by);
      });
      safeMillerites.forEach((m: any) => userIds.add(m.id));

      const { data: profData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, bio, bible_verse, status_emoji, status_text')
        .in('id', Array.from(userIds));

      const profileMap = (profData || []).reduce((acc: any, curr: any) => {
        acc[curr.id] = {
          ...curr,
          status_emoji: normalizeEmoji(curr.status_emoji)
        };
        return acc;
      }, {});

      setPosts(safePosts.map((p: any) => ({
        ...p,
        profile: profileMap[p.user_id],
        likes: safeLikes.filter((l: any) => l.post_id === p.id),
        replies: safeReplies
          .filter((r: any) => r.post_id === p.id)
          .map((r: any) => ({ ...r, profiles: profileMap[r.user_id] }))
          .sort((a:any, b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      })));

      setPrayers(safePrayers.map((p: any) => ({ 
        ...p, 
        profile: profileMap[p.user_id],
        intercessions: safeIntercessions
          .filter((i: any) => i.prayer_id === p.id)
          .map((i: any) => ({ ...i, profile: profileMap[i.user_id] }))
      })));

      setFamilyTasks(safeTasks.map((t: any) => ({
        ...t,
        creatorProfile: profileMap[t.user_id],
        completedByProfile: t.completed_by ? profileMap[t.completed_by] : null
      })));

    } catch (err) {
      console.error("Error fetching community data:", err);
    }
  };

  // MILESTONE COUNTDOWN CALCULATOR
  const getMilestoneDetails = (milestone: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = (milestone.event_date || '').split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    let targetDate = new Date(year, month, day);
    targetDate.setHours(0, 0, 0, 0);

    if (milestone.is_annual) {
      targetDate = new Date(today.getFullYear(), month, day);
      targetDate.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        targetDate = new Date(today.getFullYear() + 1, month, day);
        targetDate.setHours(0, 0, 0, 0);
      }
    }

    const diffTime = targetDate.getTime() - today.getTime();
    const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const formattedDate = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const catObj = MILESTONE_CATEGORIES.find(c => c.label === milestone.category) || MILESTONE_CATEGORIES[0];

    return {
      ...milestone,
      daysLeft,
      formattedDate,
      emoji: catObj.emoji
    };
  };

  const handleCreateMilestone = async () => {
    if (!newMilestoneTitle.trim() || !newMilestoneDate || !supabase || !userId) return;
    setIsSavingMilestone(true);
    try {
      const catObj = MILESTONE_CATEGORIES.find(c => c.label === newMilestoneCategory);
      const isAnnual = catObj ? catObj.annual : true;
      const { error } = await supabase.from('family_milestones').insert([{
        user_id: userId,
        title: newMilestoneTitle.trim(),
        event_date: newMilestoneDate,
        category: newMilestoneCategory,
        is_annual: isAnnual
      }]);
      if (error) throw error;
      setNewMilestoneTitle('');
      setNewMilestoneDate('');
      setIsAddingMilestone(false);
      await fetchCommunityData();
    } catch (err: any) {
      alert("Error adding milestone: " + err.message);
    } finally {
      setIsSavingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm("Remove this milestone countdown?")) return;
    const { error } = await supabase!.from('family_milestones').delete().eq('id', id);
    if (error) alert("Error deleting milestone: " + error.message);
    fetchCommunityData();
  };

  // SAVE FAMILY VIBE / STATUS
  const handleSaveStatus = async () => {
    if (!supabase || !userId) return;
    setIsSavingStatus(true);
    try {
      const updatedAt = new Date().toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({
          status_emoji: statusEmojiInput,
          status_text: statusTextInput.trim(),
          status_updated_at: updatedAt
        })
        .eq('id', userId);
      if (error) throw error;
      setProfile(prev => ({ ...prev, status_emoji: statusEmojiInput, status_text: statusTextInput.trim() }));
      setIsEditingStatus(false);
      await fetchCommunityData();
    } catch (err: any) {
      alert("Error updating vibe: " + err.message);
    } finally {
      setIsSavingStatus(false);
    }
  };

  // HELPER TO DETERMINE IF MEDIA IS VIDEO
  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  // POSTING & MEDIA
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !supabase || !userId) return;
    setIsPosting(true);
    try {
      const file = e.target.files[0];
      const filePath = `post-media/${userId}-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('avatars').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setPostMediaUrl(data.publicUrl);
    } catch (err: any) {
      alert("Error uploading media: " + err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCreatePost = async () => {
    if ((!newPost.trim() && !postMediaUrl) || !supabase || !userId) return;
    setIsPosting(true);
    try {
      const { error } = await supabase.from('community_posts').insert([{ user_id: userId, content: newPost.trim(), media_url: postMediaUrl }]);
      if (error) throw error;
      setNewPost(''); setPostMediaUrl('');
      await fetchCommunityData(); 
    } catch (err: any) { 
      alert("Error Posting: " + err.message); 
    } finally { 
      setIsPosting(false); 
    }
  };

  const handleCreatePrayer = async () => {
    if (!newPrayer.trim() || !supabase || !userId) return;
    setIsPraying(true);
    try {
      const { error } = await supabase.from('prayer_requests').insert([{ user_id: userId, content: newPrayer.trim(), is_answered: false }]);
      if (error) throw error;
      setNewPrayer('');
      setPrayerFilter('active');
      await fetchCommunityData(); 
    } catch (error: any) { 
      alert("Error submitting prayer: " + error.message); 
    } finally { 
      setIsPraying(false); 
    }
  };

  // FAMILY CHECKLIST / TASK ACTIONS
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !supabase || !userId) return;
    setIsAddingTask(true);
    try {
      const { error } = await supabase.from('family_tasks').insert([{
        user_id: userId,
        title: newTaskTitle.trim(),
        category: newTaskCategory,
        is_completed: false
      }]);
      if (error) throw error;
      setNewTaskTitle('');
      await fetchCommunityData();
    } catch (err: any) {
      alert("Error adding task: " + err.message);
    } finally {
      setIsAddingTask(false);
    }
  };

  const toggleFamilyTask = async (task: any) => {
    if (!userId || !supabase) return;
    try {
      const nextStatus = !task.is_completed;
      const { error } = await supabase
        .from('family_tasks')
        .update({ 
          is_completed: nextStatus, 
          completed_by: nextStatus ? userId : null 
        })
        .eq('id', task.id);
      if (error) throw error;
      await fetchCommunityData();
    } catch (err: any) {
      console.error("Error toggling task:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Remove this item from the family checklist?")) return;
    const { error } = await supabase!.from('family_tasks').delete().eq('id', id);
    if (error) alert("Error deleting item: " + error.message);
    fetchCommunityData();
  };

  // PRAYER INTERACTION ACTIONS
  const togglePrayingForRequest = async (prayerId: string, hasPrayed: boolean) => {
    if (!userId || !supabase) return;
    try {
      if (hasPrayed) {
        await supabase.from('prayer_intercessions').delete().eq('prayer_id', prayerId).eq('user_id', userId);
      } else {
        await supabase.from('prayer_intercessions').insert([{ prayer_id: prayerId, user_id: userId }]);
      }
      await fetchCommunityData();
    } catch (err: any) {
      console.error("Error toggling prayer:", err);
    }
  };

  const togglePrayerAnswered = async (prayerId: string, currentStatus: boolean) => {
    if (!userId || !supabase) return;
    try {
      const { error } = await supabase.from('prayer_requests').update({ is_answered: !currentStatus }).eq('id', prayerId);
      if (error) throw error;
      await fetchCommunityData();
    } catch (err: any) {
      alert("Error updating prayer status: " + err.message);
    }
  };

  const handleDeletePrayer = async (id: string) => {
    if (!confirm("Delete this prayer request?")) return;
    const { error } = await supabase!.from('prayer_requests').delete().eq('id', id);
    if (error) alert("Error deleting prayer: " + error.message);
    fetchCommunityData();
  };

  // POST ACTIONS
  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase!.from('community_posts').delete().eq('id', id);
    if (error) alert("Error deleting: " + error.message);
    setMenuOpenId(null);
    fetchCommunityData();
  };

  const submitEdit = async (id: string) => {
    const { error } = await supabase!.from('community_posts').update({ content: editContent }).eq('id', id);
    if (error) alert("Error editing: " + error.message);
    setEditingPostId(null); setMenuOpenId(null);
    fetchCommunityData();
  };

  const toggleLike = async (postId: string, hasLiked: boolean) => {
    if (!userId || !supabase) return;
    if (hasLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
    }
    fetchCommunityData();
  };

  const submitReply = async (postId: string) => {
    if (!replyContent.trim() || !userId) return;
    const { error } = await supabase!.from('post_replies').insert([{ post_id: postId, user_id: userId, content: replyContent }]);
    if (error) alert("Error replying: " + error.message);
    setReplyContent(''); setReplyingToPostId(null);
    fetchCommunityData();
  };

  const handleRepost = async (post: any) => {
    if (!confirm("Repost this to your timeline?")) return;
    const { error } = await supabase!.from('community_posts').insert([{ user_id: userId, content: '', original_post_id: post.id }]);
    if (error) alert("Error reposting: " + error.message);
    fetchCommunityData();
  };

  // OPEN MEMBER PROFILE
  const openMemberProfile = (memberId: string) => {
    const member =
      familyMembers.find(m => m.id === memberId) ||
      posts.find(p => p.user_id === memberId)?.profile ||
      prayers.find(p => p.user_id === memberId)?.profile;
    if (!member) return;
    setViewingMember(member);
    setMemberPosts(posts.filter(p => p.user_id === memberId));
    setActiveTab('member_view');
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleGearItem = async (index: number) => {
    if (!blueprint || !supabase) return;
    const updatedGear = [...blueprint.gear_list];
    updatedGear[index].checked = !updatedGear[index].checked;
    setBlueprint({ ...blueprint, gear_list: updatedGear });
    try { await supabase.from('blueprints').update({ gear_list: updatedGear }).eq('id', blueprint.id); } 
    catch (err) { console.error(err); }
  };

  const handleSignOut = async () => {
    try { if (supabase) await supabase.auth.signOut(); } 
    catch (error) { console.error(error); } 
    finally { navigate('/'); }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0 || !supabase || !userId) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);
    } catch (error: any) { alert(`Error uploading image: ${error.message}`); } 
    finally { setIsUploadingAvatar(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId) return;
    setIsSavingProfile(true);
    try {
      const displayName = `${profile.first_name} ${profile.last_name}`.trim() || profile.username || 'Creator';
      const { error } = await supabase.from('profiles').update({
        first_name: profile.first_name, last_name: profile.last_name, display_name: displayName,
        username: profile.username, instagram_handle: profile.instagram_handle, bio: profile.bio, bible_verse: profile.bible_verse
      }).eq('id', userId);
      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error: any) { alert(`Error saving profile: ${error.message}`); } 
    finally { setIsSavingProfile(false); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newPassword) return;
    if (newPassword.length < 6) { alert("Password must be at least 6 characters long."); return; }
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert("Password updated successfully!");
      setNewPassword('');
    } catch (error: any) { alert(`Error updating password: ${error.message}`); } 
    finally { setIsUpdatingPassword(false); }
  };

  const activePrayersCount = prayers.filter(p => !p.is_answered).length;
  const answeredPrayersCount = prayers.filter(p => p.is_answered).length;
  const filteredPrayers = prayers.filter(p => prayerFilter === 'answered' ? p.is_answered : !p.is_answered);
  const completedTasksCount = familyTasks.filter(t => t.is_completed).length;
  const otherFamilyMembers = familyMembers.filter(m => m.id !== userId);
  
  const upcomingMilestones = familyMilestones
    .map(getMilestoneDetails)
    .filter(m => m.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className={`h-screen font-sans flex flex-col md:flex-row overflow-hidden transition-colors duration-500 selection:bg-[#ff4d00] selection:text-white ${isLightMode ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#050505] text-[#F5F5F0]'}`}>
      
      {/* DESKTOP SIDEBAR */}
      <aside className={`w-64 border-r hidden md:flex flex-col z-20 shrink-0 transition-colors duration-500 ${isLightMode ? 'bg-white/75 backdrop-blur-2xl border-slate-200/80' : 'bg-[#111] border-white/5'}`}>
        <div onClick={() => navigate('/')} className={`p-6 border-b cursor-pointer transition-colors ${isLightMode ? 'border-slate-200/70 hover:bg-slate-100/50' : 'border-white/5 hover:bg-white/5'}`}>
          <h2 className={`text-xl font-black uppercase tracking-widest ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Sanctuary</h2>
          <p className="text-xs text-[#ff4d00] font-bold uppercase tracking-widest mt-1">Control Room</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-2">
          {profile.is_client && (
            <button onClick={() => setActiveTab('vault')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <FolderDown size={18} /> Asset Vault
            </button>
          )}

          {profile.is_millerite && (
            <button onClick={() => { setActiveTab('millerites'); setViewingMember(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'millerites' || activeTab === 'member_view' ? (isLightMode ? 'bg-[#1C1C2E] text-white shadow-md shadow-slate-900/10' : 'bg-[#ff4d00]/10 text-[#ff4d00]') : (isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5')}`}>
              <Users size={18} /> Millerites
            </button>
          )}

          {profile.is_client && blueprint && (
            <button onClick={() => setActiveTab('blueprint')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'blueprint' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <LayoutDashboard size={18} /> My Blueprint
            </button>
          )}

          {profile.is_client && profile.has_retainer && (
            <button onClick={() => setActiveTab('retainer')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'retainer' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <Film size={18} /> Post-Production
            </button>
          )}

          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <User size={18} /> Settings
          </button>
        </nav>
        
        <div className={`p-4 border-t space-y-2 ${isLightMode ? 'border-slate-200/70' : 'border-white/5'}`}>
          <button onClick={() => navigate('/')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <Home size={18} /> Back to Main Site
          </button>
          <button onClick={handleSignOut} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isLightMode ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-white/40 hover:text-red-400 hover:bg-red-400/10'}`}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 md:p-10 md:pb-12 relative scroll-smooth">
        {/* Ambient background glows */}
        {isLightMode ? (
          <>
            <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-300/25 rounded-full blur-[130px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[15%] w-[450px] h-[450px] bg-blue-300/20 rounded-full blur-[130px] pointer-events-none" />
          </>
        ) : (
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/5 rounded-full blur-[120px] pointer-events-none" />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className={`${isLightMode ? 'text-slate-400' : 'text-white/50'} animate-pulse font-bold tracking-widest uppercase text-sm`}>Loading secure connection...</p>
          </div>
        ) : (
          <>
            {/* MILLERITES FAMILY TIMELINE - APPLE GLASS BENTO AESTHETIC */}
            {activeTab === 'millerites' && profile.is_millerite && (
              <div className="animate-in fade-in duration-500 max-w-6xl mx-auto relative z-10 space-y-6">
                
                {/* TOP BENTO HEADER ROW */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Welcome Bento Card */}
                  <div className="md:col-span-8 bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-amber-200/40 to-orange-300/20 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="inline-flex items-center gap-1.5 bg-slate-900/5 border border-slate-900/10 text-slate-700 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                        <Sparkles size={12} className="text-[#ff4d00]" /> Miller Family Hub
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Hi, {profile.first_name || 'Family'} 👋🏾
                      </span>
                    </div>

                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">
                        Millerites
                      </h1>
                      <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
                        Private family updates, photos, videos, event checklists, milestones, and prayer requests to keep our crew connected.
                      </p>
                    </div>
                  </div>

                  {/* Dark Navy Accent Bento Card */}
                  <div className="md:col-span-4 bg-[#1C1C2E] text-white shadow-[0_12px_35px_rgba(28,28,46,0.18)] rounded-[32px] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                        Family Pulse
                      </span>
                      <Users size={18} className="text-white/40" />
                    </div>

                    <div className="my-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">{posts.length}</span>
                        <span className="text-xs text-white/60 font-medium">Timeline Updates</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-[#ff4d00] h-full rounded-full w-3/4" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/60 pt-3 border-t border-white/10">
                      <span>Prayers Answered</span>
                      <span className="font-bold text-amber-400">{answeredPrayersCount} ✨</span>
                    </div>
                  </div>
                </div>

                {/* FEATURE #3: FAMILY "VIBE CHECK" & STATUS BAR BENTO */}
                <div className="bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#ff4d00]">
                        <Smile size={15} />
                      </span>
                      <div>
                        <h3 className="text-slate-900 font-black uppercase tracking-wider text-xs leading-none">
                          Family Vibe Check
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Tap your photo to share what you're up to today
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingStatus(!isEditingStatus)}
                      className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                    >
                      <span>{profile.status_emoji || '👋🏾'}</span>
                      <span>{isEditingStatus ? 'Close' : 'Update My Vibe'}</span>
                    </button>
                  </div>

                  {/* Collapsible Status Editor with Expanded Brown-Complexion Emoji Grid */}
                  {isEditingStatus && (
                    <div className="mb-5 p-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Choose Your Vibe Emoji ({VIBE_EMOJIS.length} Options)
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          Selected: <span className="text-base">{statusEmojiInput}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-8 sm:grid-cols-13 gap-1.5 max-h-36 overflow-y-auto p-1 bg-white/70 rounded-xl border border-slate-200/60 custom-scrollbar">
                        {VIBE_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setStatusEmojiInput(emoji)}
                            className={`h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                              statusEmojiInput === emoji
                                ? 'bg-[#1C1C2E] text-white shadow-md scale-105'
                                : 'bg-white border border-slate-200/70 hover:bg-slate-100'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={40}
                          placeholder="What are you up to? (e.g. At the kids' game, Coffee run...)"
                          value={statusTextInput}
                          onChange={(e) => setStatusTextInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveStatus()}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                        />
                        <button
                          type="button"
                          onClick={handleSaveStatus}
                          disabled={isSavingStatus}
                          className="bg-[#1C1C2E] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 shrink-0"
                        >
                          {isSavingStatus ? 'Saving...' : 'Save Vibe'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Horizontal Scrollable Family Avatar Row */}
                  <div className="flex items-end gap-5 overflow-x-auto pt-4 pb-2 px-1 custom-scrollbar">
                    
                    {/* Current User Avatar Card */}
                    <div 
                      onClick={() => setIsEditingStatus(!isEditingStatus)}
                      className="flex flex-col items-center shrink-0 cursor-pointer group relative w-24"
                    >
                      <div className="mb-2 px-2.5 py-1 rounded-2xl bg-[#1C1C2E] text-white text-[10px] font-bold shadow-md max-w-[100px] truncate text-center">
                        <span>{profile.status_emoji || '👋🏾'}</span>{' '}
                        <span>{profile.status_text || 'Set status'}</span>
                      </div>
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 p-0.5 ring-2 ring-[#ff4d00] overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} className="w-full h-full object-cover rounded-[14px]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-black text-slate-700">
                              {profile.first_name?.[0] || 'M'}
                            </div>
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#ff4d00] text-white flex items-center justify-center text-xs shadow">
                          +
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 mt-2 truncate w-full text-center">
                        You
                      </span>
                    </div>

                    {/* Other Millerites Family Members */}
                    {otherFamilyMembers.map(member => (
                      <div
                        key={member.id}
                        onClick={() => openMemberProfile(member.id)}
                        className="flex flex-col items-center shrink-0 cursor-pointer group relative w-24"
                      >
                        <div className="mb-2 px-2.5 py-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700 text-[10px] font-bold shadow-sm max-w-[105px] truncate text-center group-hover:bg-white transition-colors">
                          <span>{member.status_emoji || '👋🏾'}</span>{' '}
                          <span>{member.status_text || 'Checking in'}</span>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 p-0.5 ring-2 ring-slate-200/80 group-hover:ring-amber-400 overflow-hidden shadow-sm group-hover:scale-105 transition-all">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} className="w-full h-full object-cover rounded-[14px]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-black text-slate-600">
                              {member.first_name?.[0] || 'M'}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 mt-2 truncate w-full text-center">
                          {member.first_name || 'Family'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MAIN BENTO WORKSPACE GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COLUMN: COMPOSER & FEED */}
                  <div className="lg:col-span-8 space-y-5">
                    
                    {/* Apple Glass Post Composer */}
                    <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-6 rounded-[28px] transition-all">
                      <div className="flex gap-4 items-start">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center text-sm font-bold text-slate-700 overflow-hidden shadow-sm">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            profile.first_name?.[0] || 'M'
                          )}
                        </div>
                        <div className="flex-1">
                          <textarea 
                            rows={2} 
                            placeholder="Share a family update, photo, or video..." 
                            value={newPost} 
                            onChange={(e) => setNewPost(e.target.value)}
                            className="w-full bg-transparent text-slate-800 text-sm font-medium focus:outline-none resize-none placeholder:text-slate-400 pt-1"
                          />
                          {postMediaUrl && (
                            <div className="relative mt-3 inline-block">
                              {isVideo(postMediaUrl) ? (
                                <video src={postMediaUrl} className="h-36 rounded-2xl object-cover border border-slate-200 shadow-sm" autoPlay muted loop playsInline />
                              ) : (
                                <img src={postMediaUrl} className="h-36 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                              )}
                              <button onClick={() => setPostMediaUrl('')} className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1.5 shadow-md hover:bg-red-500 transition-colors">
                                <X size={12}/>
                              </button>
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                            <button 
                              onClick={() => fileInputRef.current?.click()} 
                              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
                            >
                              <ImageIcon size={16} className="text-[#ff4d00]" />
                              <span>Photo / Video</span>
                              <input type="file" accept="image/*,video/*" hidden ref={fileInputRef} onChange={handleMediaUpload} />
                            </button>
                            <button 
                              onClick={handleCreatePost} 
                              disabled={isPosting || (!newPost.trim() && !postMediaUrl)} 
                              className="bg-[#1C1C2E] hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 shadow-md shadow-slate-900/10 transition-all disabled:opacity-40"
                            >
                              {isPosting ? 'Posting...' : 'Post'} <Send size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Feed Cards */}
                    <div className="space-y-4">
                      {posts.length === 0 ? (
                        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[28px] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                          <p className="text-slate-400 text-sm font-medium">No family updates yet. Be the first to share!</p>
                        </div>
                      ) : (
                        posts.map(post => {
                          const isOwnPost = post.user_id === userId;
                          const hasLiked = post.likes.some((l:any) => l.user_id === userId);
                          
                          return (
                            <div key={post.id} className="bg-white/85 backdrop-blur-2xl border border-white p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-4 relative">
                                <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => openMemberProfile(post.user_id)}>
                                  <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0 overflow-hidden shadow-sm">
                                    {post.profile?.avatar_url ? (
                                      <img src={post.profile.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                      post.profile?.first_name?.[0] || 'M'
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-slate-900 text-sm font-bold group-hover:text-[#ff4d00] transition-colors">
                                      {post.profile?.first_name ? `${post.profile.first_name} ${post.profile.last_name}` : 'Family Member'}
                                    </p>
                                    <p className="text-slate-400 text-[11px] font-medium">{formatTime(post.created_at)}</p>
                                  </div>
                                </div>
                                
                                {isOwnPost && (
                                  <div className="relative">
                                    <button onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                                      <MoreVertical size={16} />
                                    </button>
                                    {menuOpenId === post.id && (
                                      <div className="absolute right-0 mt-1 w-36 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl py-1.5 z-20">
                                        <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                                          <Edit2 size={13}/> Edit Post
                                        </button>
                                        <button onClick={() => handleDeletePost(post.id)} className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                          <Trash2 size={13}/> Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              {editingPostId === post.id ? (
                                <div className="mb-4">
                                  <textarea 
                                    value={editContent} 
                                    onChange={(e) => setEditContent(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-800 focus:outline-none focus:border-slate-400" 
                                  />
                                  <div className="flex gap-2 justify-end mt-2.5">
                                    <button onClick={() => setEditingPostId(null)} className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-xl hover:bg-slate-100">
                                      Cancel
                                    </button>
                                    <button onClick={() => submitEdit(post.id)} className="bg-[#1C1C2E] text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-sm">
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {post.content && (
                                    <p className="text-slate-700 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">
                                      {post.content}
                                    </p>
                                  )}
                                  {post.media_url && (
                                    <div className="rounded-2xl overflow-hidden mb-4 border border-slate-100 bg-slate-50">
                                      {isVideo(post.media_url) ? (
                                        <video src={post.media_url} controls playsInline className="w-full max-h-[480px] object-contain" />
                                      ) : (
                                        <img src={post.media_url} className="w-full max-h-[520px] object-cover" />
                                      )}
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                                <button 
                                  onClick={() => toggleLike(post.id, hasLiked)} 
                                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${hasLiked ? 'bg-red-50 text-red-500' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                                >
                                  <Heart size={15} className={hasLiked ? "fill-red-500 text-red-500" : ""} /> 
                                  <span>{post.likes.length > 0 ? post.likes.length : 'Like'}</span>
                                </button>

                                <button 
                                  onClick={() => setReplyingToPostId(replyingToPostId === post.id ? null : post.id)} 
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all text-xs font-bold"
                                >
                                  <MessageSquare size={15} /> 
                                  <span>{post.replies.length > 0 ? post.replies.length : 'Reply'}</span>
                                </button>

                                <button 
                                  onClick={() => handleRepost(post)} 
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all text-xs font-bold ml-auto"
                                  title="Repost"
                                >
                                  <Repeat size={15} />
                                </button>
                              </div>

                              {/* Replies Section */}
                              {(replyingToPostId === post.id || post.replies.length > 0) && (
                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                  {post.replies.map((reply:any) => (
                                    <div key={
