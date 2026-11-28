import React, { useState, useEffect, useRef } from 'react';
import InstallAppBanner from './InstallAppBanner';
import WelcomeTourModal from './WelcomeTourModal';
import DirectMessageModal from './DirectMessageModal';
import GamesHub from './GamesHub';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, FolderDown, Lock, 
  User, Film, Camera, Save, Users, MessageSquare, Heart, Send, 
  BookHeart, MoreVertical, Edit2, Trash2, Repeat, Image as ImageIcon, Grid, X, BookOpen, Sparkles, CheckCircle2, Plus, Smile, CalendarHeart, AtSign, ChevronDown, MessageCircle, Award, Sun, Moon, Gamepad2
} from 'lucide-react';

import RetainerDashboard from './RetainerDashboard';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  : null;

const VIBE_EMOJIS = [
  '👋🏾', '🙏🏾', '🙌🏾', '💪🏾', '🫶🏾', '✌🏾', '🤞🏾', '👊🏾', '🤙🏾', '👏🏾', '🫱🏾‍🫲🏽', '🤳🏾',
  '🏃🏾‍♂️', '🏋🏾‍♂️', '🧘🏾‍♀️', '🕺🏾', '💃🏾', '👨🏾‍💻', '👩🏾‍💻', '👨🏾‍🍳', '🤱🏾', '🛌🏾', '🚶🏾‍♂️', '🚴🏾‍♂️',
  '☕', '🍽️', '🍔', '🌮', '🍕', '🥗', '🍿', '🎂', '✈️', '🚗', '🏡', '🏖️',
  '🏈', '🏀', '⚽', '⚾', '🎮', '🎬', '🎧', '📚', '⛪', '✝️', '🎉', '😴', '❤️', '🔥', '✨', '💯'
];

const POST_REACTIONS = ['❤️', '😂', '🙌🏾', '🙏🏾', '🔥'];

const MILESTONE_TYPES = [
  { label: 'Birthday', emoji: '🎂', annual: true },
  { label: 'Anniversary', emoji: '💍', annual: true },
  { label: 'Trip / Holiday', emoji: '✈️', annual: false },
  { label: 'Family Dinner', emoji: '🍽️', annual: false }
];

const SPOTLIGHT_CATEGORIES = [
  { label: 'Accomplishment', emoji: '🏆' },
  { label: 'Generosity', emoji: '💛' },
  { label: 'Milestone', emoji: '🎉' },
  { label: 'Accolade', emoji: '⭐' }
];

export default function Hub() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('vault'); 
  const [isLoading, setIsLoading] = useState(true);

  // GAMES DEEP-LINK STATE (?chess=<game_id> from SMS invite links)
  const [initialChessGameId, setInitialChessGameId] = useState<string | null>(() => {
    return new URLSearchParams(window.location.search).get('chess');
  });

  // USER & PROFILE STATE
  const [userId, setUserId] = useState<string | null>(null);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);

  // THEME TOGGLE STATE (Saved per member device)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('millerites_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('millerites_theme', next);
  };

  // FAMILY PULSE CAROUSEL STATE
  const [pulseIndex, setPulseIndex] = useState(0);

  // AUTO-HIDE BOTTOM NAV ON SCROLL
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMainScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 280);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // COLLAPSIBLE MODULES STATE (All closed by default; Timeline is always open)
  const [openModules, setOpenModules] = useState({
    vibe: false,
    spotlight: false,
    milestones: false,
    prayers: false,
  });

  const toggleModule = (key: keyof typeof openModules) => {
    setOpenModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // DIRECT MESSAGES STATE
  const [dmRecipient, setDmRecipient] = useState<any | null>(null);
  const [unreadDmSenders, setUnreadDmSenders] = useState<Record<string, number>>({});
  
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

  // FAMILY SPOTLIGHT STATE
  const [spotlights, setSpotlights] = useState<any[]>([]);
  const [isAddingSpotlightOpen, setIsAddingSpotlightOpen] = useState(false);
  const [spotlightHonoreeId, setSpotlightHonoreeId] = useState('');
  const [spotlightCategory, setSpotlightCategory] = useState('Accomplishment');
  const [spotlightTitle, setSpotlightTitle] = useState('');
  const [spotlightReason, setSpotlightReason] = useState('');
  const [isSavingSpotlight, setIsSavingSpotlight] = useState(false);

  // FAMILY MILESTONES & COUNTDOWN STATE
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isAddingMilestoneFormOpen, setIsAddingMilestoneFormOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneCategory, setMilestoneCategory] = useState('Birthday');
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);

  // TIMELINE & PRAYER STATE
  const [posts, setPosts] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [prayerFilter, setPrayerFilter] = useState<'active' | 'answered'>('active');
  const [newPost, setNewPost] = useState('');
  const [newPrayer, setNewPrayer] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isPraying, setIsPraying] = useState(false);
  const [postMediaUrls, setPostMediaUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // INTERACTION & @MENTION STATE
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<'post' | 'reply' | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');

  // MEMBER PROFILE VIEW, POST MODAL, LIGHTBOX & ACTIVITY MODAL STATE
  const [viewingMember, setViewingMember] = useState<any | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activityModal, setActivityModal] = useState<{
    postId: string;
    tab: 'likes' | 'reposts';
  } | null>(null);

  // APPLE LIGHT / DARK THEME TOGGLE FOR MILLERITES, DMS, GAMES & PROFILE
  const isHubThemeable =
    activeTab === 'millerites' ||
    activeTab === 'member_view' ||
    activeTab === 'profile' ||
    activeTab === 'dms' ||
    activeTab === 'games';
  const isLightMode = isHubThemeable && theme === 'light';
  const isDarkHub = isHubThemeable && theme === 'dark';

  const totalUnreadDms = Object.values(unreadDmSenders).reduce((sum, count) => sum + count, 0);

  const normalizeEmoji = (emoji?: string) => {
    if (!emoji || emoji === '👋') return '👋🏾';
    if (emoji === '🙏') return '🙏🏾';
    return emoji;
  };

  // ONESIGNAL PUSH NOTIFICATIONS PERMISSION HANDLER
  const handleEnableNotifications = () => {
    const win = window as any;
    if (!win.OneSignalDeferred) {
      alert("Notifications are still loading. Refresh the page and try again.");
      return;
    }

    win.OneSignalDeferred.push(async function (OneSignal: any) {
      try {
        await OneSignal.Notifications.requestPermission();
        await OneSignal.User.PushSubscription.optIn();
        if (userId) {
          await OneSignal.login(userId);
        }
        if (profile.is_millerite) {
          OneSignal.User.addTag("group", "millerites");
        }

        if (OneSignal.Notifications.permission) {
          alert("Alerts enabled! You'll now get notified for new Millerites updates and DMs.");
        } else {
          alert("Permission wasn't granted. Make sure you're opening Millerites from your Home Screen app icon and allow notifications in phone settings.");
        }
      } catch (err: any) {
        alert("Notification setup error: " + (err?.message || err));
      }
    });
  };

  // FETCH UNREAD DM COUNTS
  const fetchUnreadDms = async (uid: string) => {
    if (!supabase || !uid) return;
    const { data } = await supabase
      .from('direct_messages')
      .select('sender_id')
      .eq('receiver_id', uid)
      .eq('is_read', false);

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((row: any) => {
        counts[row.sender_id] = (counts[row.sender_id] || 0) + 1;
      });
      setUnreadDmSenders(counts);
    }
  };

  // @MENTION HANDLERS
  const handlePostTextChange = (val: string) => {
    setNewPost(val);
    const match = val.match(/(?:^|\s)@(\w*)$/);
    if (match) {
      setMentionTarget('post');
      setMentionQuery(match[1]);
    } else if (mentionTarget === 'post') {
      setMentionTarget(null);
      setMentionQuery('');
    }
  };

  const handleReplyTextChange = (val: string) => {
    setReplyContent(val);
    const match = val.match(/(?:^|\s)@(\w*)$/);
    if (match) {
      setMentionTarget('reply');
      setMentionQuery(match[1]);
    } else if (mentionTarget === 'reply') {
      setMentionTarget(null);
      setMentionQuery('');
    }
  };

  const insertMention = (member: any) => {
    const tag = `@${member.first_name || 'Family'} `;
    if (mentionTarget === 'post') {
      setNewPost(prev => prev.replace(/(?:^|\s)@\w*$/, (m) => (m.startsWith(' ') ? ' ' : '') + tag));
    } else if (mentionTarget === 'reply') {
      setReplyContent(prev => prev.replace(/(?:^|\s)@\w*$/, (m) => (m.startsWith(' ') ? ' ' : '') + tag));
    }
    setMentionTarget(null);
    setMentionQuery('');
  };

  const filteredMentionMembers = familyMembers.filter(m =>
    (m.first_name || '').toLowerCase().includes(mentionQuery.toLowerCase()) ||
    (m.last_name || '').toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const renderTextWithMentions = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@') && part.length > 1) {
        const handle = part.slice(1).toLowerCase();
        const matchedMember = familyMembers.find(
          m => (m.first_name || '').toLowerCase() === handle
        );
        if (matchedMember) {
          return (
            <span
              key={idx}
              onClick={(e) => { e.stopPropagation(); setSelectedPostId(null); openMemberProfile(matchedMember.id); }}
              className="text-[#ff4d00] font-bold bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded-md cursor-pointer transition-colors"
            >
              {part}
            </span>
          );
        }
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const getMilestoneCountdown = (dateString: string, isAnnual: boolean) => {
    if (!dateString) return { daysUntil: 999, label: '', formattedDate: '' };
    const [year, month, day] = dateString.split('-').map(Number);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    if (isAnnual) {
      targetDate = new Date(today.getFullYear(), month - 1, day);
      targetDate.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        targetDate = new Date(today.getFullYear() + 1, month - 1, day);
      }
    }

    const diffTime = targetDate.getTime() - today.getTime();
    const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let label = '';
    if (daysUntil === 0) label = '🎉 Today!';
    else if (daysUntil === 1) label = 'Tomorrow!';
    else if (daysUntil > 1) label = `In ${daysUntil} days`;
    else label = `${Math.abs(daysUntil)}d ago`;

    const formattedDate = targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(isAnnual ? {} : { year: 'numeric' })
    });

    return { daysUntil, label, formattedDate };
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        if (!supabase) { setIsLoading(false); return; }
        const { data: { session } } = await supabase.auth.getSession();

        // Enforce temporary session if user unchecked "Stay logged in"
        if (
          session &&
          localStorage.getItem('millerites_temp_session') === 'true' &&
          !sessionStorage.getItem('millerites_active_tab')
        ) {
          localStorage.removeItem('millerites_temp_session');
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }

        if (!session) { navigate('/login'); return; }
        setUserId(session.user.id);

        const { data: bpData } = await supabase.from('blueprints').select('*').eq('user_id', session.user.id).single(); 
        if (bpData) setBlueprint(bpData);

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profileData) {
          if (profileData.is_millerite && !localStorage.getItem(`millerites_tour_seen_${session.user.id}`)) {
            setShowWelcomeTour(true);
          }

          setLastSeenAt(profileData.last_seen_at || null);
          supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', session.user.id).then();

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

          if (new URLSearchParams(window.location.search).get('chess') && profileData.is_millerite) {
            setActiveTab('games');
          } else if (isFamilyOnly) {
            setActiveTab('millerites');
          }
        }
        await fetchCommunityData();
        await fetchUnreadDms(session.user.id);
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
      const { data: spotlightsData } = await supabase.from('family_spotlights').select('*').order('created_at', { ascending: false });
      const { data: milestonesData } = await supabase.from('family_milestones').select('*');
      const { data: milleritesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, bio, bible_verse, is_millerite, status_emoji, status_text, status_updated_at, created_at')
        .eq('is_millerite', true);

      if (pError) console.error("Posts Error:", pError.message);
      if (prError) console.error("Prayers Error:", prError.message);
      
      const safePosts = pData || [];
      const safePrayers = prData || [];
      const safeLikes = likesData || [];
      const safeReplies = repliesData || [];
      const safeIntercessions = prayerIntercessionsData || [];
      const safeSpotlights = spotlightsData || [];
      const safeMilestones = milestonesData || [];
      const safeMillerites = (milleritesData || []).map((m: any) => ({
        ...m,
        status_emoji: normalizeEmoji(m.status_emoji)
      }));

      setFamilyMembers(safeMillerites);

      const userIds = new Set<string>();
      safePosts.forEach((p: any) => userIds.add(p.user_id));
      safePrayers.forEach((p: any) => userIds.add(p.user_id));
      safeLikes.forEach((l: any) => userIds.add(l.user_id));
      safeReplies.forEach((r: any) => userIds.add(r.user_id));
      safeIntercessions.forEach((i: any) => userIds.add(i.user_id));
      safeSpotlights.forEach((s: any) => {
        if (s.user_id) userIds.add(s.user_id);
        if (s.honoree_id) userIds.add(s.honoree_id);
      });
      safeMilestones.forEach((ms: any) => {
        if (ms.user_id) userIds.add(ms.user_id);
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
        likes: safeLikes
          .filter((l: any) => l.post_id === p.id)
          .map((l: any) => ({ ...l, emoji: l.emoji || '❤️', profile: profileMap[l.user_id] })),
        reposts: safePosts
          .filter((rp: any) => rp.original_post_id === p.id)
          .map((rp: any) => ({ ...rp, profile: profileMap[rp.user_id] })),
        replies: safeReplies
          .filter((r: any) => r.post_id === p.id)
          .map((r: any) => ({ ...r, profiles: profileMap[r.user_id] }))
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      })));

      setPrayers(safePrayers.map((p: any) => ({ 
        ...p, 
        profile: profileMap[p.user_id],
        intercessions: safeIntercessions
          .filter((i: any) => i.prayer_id === p.id)
          .map((i: any) => ({ ...i, profile: profileMap[i.user_id] }))
      })));

      setSpotlights(safeSpotlights.map((s: any) => ({
        ...s,
        nominatorProfile: profileMap[s.user_id],
        honoreeProfile: profileMap[s.honoree_id]
      })));

      const enrichedMilestones = safeMilestones
        .map((ms: any) => {
          const countdown = getMilestoneCountdown(ms.event_date, ms.is_annual ?? true);
          return {
            ...ms,
            creatorProfile: profileMap[ms.user_id],
            ...countdown
          };
        })
        .filter((ms: any) => ms.daysUntil >= 0)
        .sort((a: any, b: any) => a.daysUntil - b.daysUntil);

      setMilestones(enrichedMilestones);

    } catch (err) {
      console.error("Error fetching community data:", err);
    }
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

  // FAMILY SPOTLIGHT ACTIONS
  const handleCreateSpotlight = async () => {
    if (!spotlightHonoreeId || !spotlightTitle.trim() || !spotlightReason.trim() || !supabase || !userId) return;
    setIsSavingSpotlight(true);
    try {
      const { error } = await supabase.from('family_spotlights').insert([{
        user_id: userId,
        honoree_id: spotlightHonoreeId,
        category: spotlightCategory,
        title: spotlightTitle.trim(),
        reason: spotlightReason.trim()
      }]);
      if (error) throw error;
      setSpotlightHonoreeId('');
      setSpotlightTitle('');
      setSpotlightReason('');
      setIsAddingSpotlightOpen(false);
      await fetchCommunityData();
    } catch (err: any) {
      alert("Error saving spotlight: " + err.message);
    } finally {
      setIsSavingSpotlight(false);
    }
  };

  const handleDeleteSpotlight = async (id: string) => {
    if (!confirm("Remove this family spotlight?")) return;
    const { error } = await supabase!.from('family_spotlights').delete().eq('id', id);
    if (error) alert("Error deleting spotlight: " + error.message);
    fetchCommunityData();
  };

  // MILESTONE ACTIONS
  const handleCreateMilestone = async () => {
    if (!milestoneTitle.trim() || !milestoneDate || !supabase || !userId) return;
    setIsSavingMilestone(true);
    try {
      const selectedType = MILESTONE_TYPES.find(t => t.label === milestoneCategory) || MILESTONE_TYPES[0];
      const { error } = await supabase.from('family_milestones').insert([{
        user_id: userId,
        title: milestoneTitle.trim(),
        event_date: milestoneDate,
        category: selectedType.label,
        emoji: selectedType.emoji,
        is_annual: selectedType.annual
      }]);
      if (error) throw error;
      setMilestoneTitle('');
      setMilestoneDate('');
      setIsAddingMilestoneFormOpen(false);
      await fetchCommunityData();
    } catch (err: any) {
      alert("Error adding milestone: " + err.message);
    } finally {
      setIsSavingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm("Remove this family milestone?")) return;
    const { error } = await supabase!.from('family_milestones').delete().eq('id', id);
    if (error) alert("Error deleting milestone: " + error.message);
    fetchCommunityData();
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  // MULTI-MEDIA PARSER (Supports both legacy single URLs and JSON arrays)
  const getPostMedia = (mediaUrl?: string | null): string[] => {
    if (!mediaUrl) return [];
    if (mediaUrl.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(mediaUrl);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [mediaUrl];
      } catch {
        return [mediaUrl];
      }
    }
    return [mediaUrl];
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !supabase || !userId) return;
    setIsPosting(true);
    try {
      const files = Array.from(e.target.files);
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `post-media/${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;
        const { error } = await supabase.storage.from('avatars').upload(filePath, file);
        if (error) throw error;
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }

      setPostMediaUrls(prev => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      alert("Error uploading media: " + err.message);
    } finally {
      setIsPosting(false);
      e.target.value = '';
    }
  };

  const handleCreatePost = async () => {
    if ((!newPost.trim() && postMediaUrls.length === 0) || !supabase || !userId) return;
    setIsPosting(true);
    try {
      const mediaPayload =
        postMediaUrls.length === 0
          ? ''
          : postMediaUrls.length === 1
          ? postMediaUrls[0]
          : JSON.stringify(postMediaUrls);

      const { error } = await supabase
        .from('community_posts')
        .insert([{ user_id: userId, content: newPost.trim(), media_url: mediaPayload }]);
      if (error) throw error;
      setNewPost('');
      setPostMediaUrls([]);
      setMentionTarget(null);
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

  const toggleReaction = async (post: any, emoji: string) => {
    if (!userId || !supabase) return;
    try {
      const existingReaction = post.likes.find((l: any) => l.user_id === userId);
      if (existingReaction) {
        if ((existingReaction.emoji || '❤️') === emoji) {
          await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId);
        } else {
          await supabase.from('post_likes').update({ emoji }).eq('post_id', post.id).eq('user_id', userId);
        }
      } else {
        await supabase.from('post_likes').insert([{ post_id: post.id, user_id: userId, emoji }]);
      }
      await fetchCommunityData();
    } catch (err: any) {
      console.error("Error toggling reaction:", err);
    }
  };

  const submitReply = async (postId: string) => {
    if (!replyContent.trim() || !userId) return;
    const { error } = await supabase!.from('post_replies').insert([{ post_id: postId, user_id: userId, content: replyContent }]);
    if (error) alert("Error replying: " + error.message);
    setReplyContent(''); setReplyingToPostId(null); setMentionTarget(null);
    fetchCommunityData();
  };

  const handleRepost = async (post: any) => {
    if (!confirm("Repost this to your timeline?")) return;
    const { error } = await supabase!.from('community_posts').insert([{ user_id: userId, content: '', original_post_id: post.id }]);
    if (error) alert("Error reposting: " + error.message);
    fetchCommunityData();
  };

  const openMemberProfile = (memberId: string) => {
    const member =
      familyMembers.find(m => m.id === memberId) ||
      posts.find(p => p.user_id === memberId)?.profile ||
      prayers.find(p => p.user_id === memberId)?.profile;
    if (!member) return;
    setViewingMember(member);
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
    try {
      localStorage.removeItem('millerites_temp_session');
      if (supabase) await supabase.auth.signOut();
    } 
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
  const otherFamilyMembers = familyMembers.filter(m => m.id !== userId);
  const nextMilestone = milestones.length > 0 ? milestones[0] : null;
  const currentSpotlight = spotlights.length > 0 ? spotlights[0] : null;
  const newPostsCount = lastSeenAt
    ? posts.filter(p => p.user_id !== userId && new Date(p.created_at) > new Date(lastSeenAt)).length
    : posts.filter(p => p.user_id !== userId).length;

  // UPDATE HOME SCREEN APP ICON BADGE (iOS / Supported PWAs)
  useEffect(() => {
    const nav = navigator as any;
    if (!nav.setAppBadge) return;

    const badgeTotal = totalUnreadDms + newPostsCount;
    if (badgeTotal > 0) {
      nav.setAppBadge(badgeTotal).catch(() => {});
    } else if (nav.clearAppBadge) {
      nav.clearAppBadge().catch(() => {});
    }
  }, [totalUnreadDms, newPostsCount]);

  // Live Member Profile Posts & Interactive Modal Post
  const currentMemberPosts = viewingMember
    ? posts.filter(p => p.user_id === viewingMember.id)
    : [];
  const activeModalPost = selectedPostId
    ? posts.find(p => p.id === selectedPostId) || null
    : null;

  // Find the newest family member who joined
  const newestMember = [...familyMembers]
    .filter(m => m.created_at)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;

  // Build the rotating Family Pulse slides
  const pulseSlides = [
    {
      id: 'updates',
      badge: 'Family Pulse',
      headline: `${newPostsCount}`,
      subHeadline: newPostsCount === 1 ? 'New Update' : 'New Updates',
      detail: lastSeenAt ? 'Since you last logged in' : 'New since you joined',
      progress: newPostsCount > 0 ? Math.min(100, newPostsCount * 20) : 0,
      footerLeft: nextMilestone ? `${nextMilestone.emoji} ${nextMilestone.title}` : 'Prayers Answered',
      footerRight: nextMilestone ? nextMilestone.label : `${answeredPrayersCount} ✨`,
      onClick: undefined,
    },
    ...(newestMember
      ? [
          {
            id: 'welcome',
            badge: 'New Member 🎉',
            headline: `Welcome, ${newestMember.first_name || 'Family'}!`,
            subHeadline: '',
            detail: 'Tap to view their profile & say hello',
            progress: 100,
            footerLeft: 'Newest Millerite',
            footerRight: formatTime(newestMember.created_at),
            onClick: () => openMemberProfile(newestMember.id),
          },
        ]
      : []),
    ...(nextMilestone
      ? [
          {
            id: 'milestone',
            badge: 'Next Milestone',
            headline: `${nextMilestone.emoji} ${nextMilestone.label}`,
            subHeadline: '',
            detail: `${nextMilestone.title} • ${nextMilestone.formattedDate}`,
            progress: Math.max(15, 100 - Math.min(100, nextMilestone.daysUntil * 2)),
            footerLeft: nextMilestone.category,
            footerRight: 'Tap to view',
            onClick: () => setOpenModules(prev => ({ ...prev, milestones: true })),
          },
        ]
      : []),
    {
      id: 'prayers',
      badge: 'Prayer Wall 🙏🏾',
      headline: `${activePrayersCount}`,
      subHeadline: activePrayersCount === 1 ? 'Active Prayer' : 'Active Prayers',
      detail: `${answeredPrayersCount} prayers answered so far ✨`,
      progress:
        activePrayersCount + answeredPrayersCount > 0
          ? Math.round((answeredPrayersCount / (activePrayersCount + answeredPrayersCount)) * 100)
          : 0,
      footerLeft: 'Lift the family up',
      footerRight: 'Tap to open',
      onClick: () => setOpenModules(prev => ({ ...prev, prayers: true })),
    },
    ...(currentSpotlight
      ? [
          {
            id: 'spotlight',
            badge: 'Weekly Spotlight 🏆',
            headline: currentSpotlight.honoreeProfile?.first_name || 'Family',
            subHeadline: '',
            detail: currentSpotlight.title,
            progress: 100,
            footerLeft: currentSpotlight.category,
            footerRight: 'Tap to read',
            onClick: () => setOpenModules(prev => ({ ...prev, spotlight: true })),
          },
        ]
      : []),
  ];

  // Auto-cycle Family Pulse every 4.5 seconds
  useEffect(() => {
    if (pulseSlides.length <= 1) return;
    const timer = setInterval(() => {
      setPulseIndex(prev => (prev + 1) % pulseSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [pulseSlides.length]);

  const activePulse = pulseSlides[pulseIndex % pulseSlides.length] || pulseSlides[0];

  // Reusable Swipeable Media Gallery for Single or Multi-Media Posts (Tap photo to enlarge)
  const renderPostMedia = (mediaUrl?: string | null, isModal = false) => {
    const mediaList = getPostMedia(mediaUrl);
    if (mediaList.length === 0) return null;

    if (mediaList.length === 1) {
      const url = mediaList[0];
      return (
        <div className="rounded-2xl overflow-hidden mb-3 bg-slate-200/40">
          {isVideo(url) ? (
            <video src={url} controls playsInline className={`w-full ${isModal ? 'max-h-[380px]' : 'max-h-[480px]'} object-contain`} />
          ) : (
            <img
              src={url}
              onClick={() => setLightboxImage(url)}
              className={`w-full ${isModal ? 'max-h-[420px]' : 'max-h-[520px]'} object-cover cursor-zoom-in`}
            />
          )}
        </div>
      );
    }

    return (
      <div className="relative mb-3">
        <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 custom-scrollbar">
          {mediaList.map((url, idx) => (
            <div
              key={idx}
              className="relative shrink-0 w-[85%] sm:w-[75%] snap-center rounded-2xl overflow-hidden bg-slate-200/40"
            >
              {isVideo(url) ? (
                <video
                  src={url}
                  controls
                  playsInline
                  className={`w-full ${isModal ? 'h-64' : 'h-72 sm:h-80'} object-contain bg-black`}
                />
              ) : (
                <img
                  src={url}
                  onClick={() => setLightboxImage(url)}
                  className={`w-full ${isModal ? 'h-64' : 'h-72 sm:h-80'} object-cover cursor-zoom-in`}
                />
              )}
              <span className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full pointer-events-none">
                {idx + 1} / {mediaList.length}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Reusable Horizontal Member Circle Bar
  const renderMemberCircleBar = () => {
    if (familyMembers.length === 0) return null;
    return (
      <div className="bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[28px] px-4 py-3 flex items-center gap-3.5 overflow-x-auto custom-scrollbar">
        {familyMembers.map(member => {
          const isSelected = viewingMember?.id === member.id && activeTab === 'member_view';
          const unreadCount = unreadDmSenders[member.id] || 0;
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => openMemberProfile(member.id)}
              title={`${member.first_name || 'Family'} ${member.last_name || ''}`.trim()}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none w-14"
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-xs font-black transition-all shadow-sm ${
                    isSelected
                      ? 'ring-2 ring-[#ff4d00] scale-105'
                      : 'ring-2 ring-slate-200/80 group-hover:ring-amber-400 group-hover:scale-105'
                  } bg-slate-100 text-slate-700`}
                >
                  {member.avatar_url ? (
                    <img src={member.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    member.first_name?.[0] || 'M'
                  )}
                </div>

                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff4d00] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold truncate w-full text-center transition-colors ${isSelected ? 'text-[#ff4d00]' : 'text-slate-600 group-hover:text-slate-900'}`}>
                {member.id === userId ? 'You' : (member.first_name || 'Family')}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

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

          {profile.is_millerite && (
            <button onClick={() => setActiveTab('dms')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'dms' ? (isLightMode ? 'bg-[#1C1C2E] text-white shadow-md shadow-slate-900/10' : 'bg-[#ff4d00]/10 text-[#ff4d00]') : (isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5')}`}>
              <span className="flex items-center gap-3"><MessageCircle size={18} /> Messages</span>
              {totalUnreadDms > 0 && (
                <span className="bg-[#ff4d00] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {totalUnreadDms}
                </span>
              )}
            </button>
          )}

          {profile.is_millerite && (
            <button onClick={() => setActiveTab('games')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'games' ? (isLightMode ? 'bg-[#1C1C2E] text-white shadow-md shadow-slate-900/10' : 'bg-[#ff4d00]/10 text-[#ff4d00]') : (isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5')}`}>
              <Gamepad2 size={18} /> Games
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

          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'profile' ? (isLightMode ? 'bg-[#1C1C2E] text-white shadow-md shadow-slate-900/10' : 'bg-[#ff4d00]/10 text-[#ff4d00]') : (isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-white/60 hover:text-white hover:bg-white/5')}`}>
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
      <main
        onScroll={handleMainScroll}
        className={`flex-1 overflow-y-auto p-4 sm:p-6 pb-32 md:p-10 md:pb-12 relative scroll-smooth ${isDarkHub ? 'millerites-dark' : ''}`}
      >
        {isLightMode ? (
          <>
            <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-300/25 rounded-full blur-[130px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[15%] w-[450px] h-[450px] bg-blue-300/20 rounded-full blur-[130px] pointer-events-none" />
          </>
        ) : (
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/5 rounded-full blur-[120px] pointer-events-none" />
        )}

        {/* DIRECT MESSAGE MODAL */}
        <DirectMessageModal
          isOpen={!!dmRecipient}
          onClose={() => setDmRecipient(null)}
          supabase={supabase}
          currentUserId={userId}
          recipient={dmRecipient}
          onMessagesRead={() => userId && fetchUnreadDms(userId)}
        />

        {/* INTERACTIVE PROFILE POST MODAL */}
        {activeModalPost && (
          <div
            onClick={() => setSelectedPostId(null)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-lg max-h-[88vh] bg-white border border-slate-200/80 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-slate-700">
                    {activeModalPost.profile?.avatar_url ? (
                      <img src={activeModalPost.profile.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      activeModalPost.profile?.first_name?.[0] || 'M'
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {activeModalPost.profile?.first_name} {activeModalPost.profile?.last_name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {formatTime(activeModalPost.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeModalPost.user_id === userId && (
                    <button
                      type="button"
                      onClick={async () => {
                        await handleDeletePost(activeModalPost.id);
                        setSelectedPostId(null);
                      }}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-full transition-colors"
                      title="Delete post"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedPostId(null)}
                    className="text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable Post Content + Replies */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {activeModalPost.content && (
                  <p className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {renderTextWithMentions(activeModalPost.content)}
                  </p>
                )}

                {renderPostMedia(activeModalPost.media_url, true)}

                {/* Emoji Reactions + Repost */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200/80">
                  <div className="flex items-center gap-1 flex-wrap">
                    {POST_REACTIONS.map(emoji => {
                      const count = activeModalPost.likes.filter((l: any) => (l.emoji || '❤️') === emoji).length;
                      const isSelected = activeModalPost.likes.find((l: any) => l.user_id === userId)?.emoji === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => toggleReaction(activeModalPost, emoji)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-[#1C1C2E] text-white'
                              : count > 0
                              ? 'bg-slate-200/70 text-slate-800'
                              : 'text-slate-500 hover:bg-slate-200/50'
                          }`}
                        >
                          <span className="text-sm leading-none">{emoji}</span>
                          {count > 0 && <span className="text-[11px]">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRepost(activeModalPost)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors"
                  >
                    <Repeat size={14} /> Repost ({activeModalPost.reposts?.length || 0})
                  </button>
                </div>

                {/* Clickable Likes / Reposts Summary in Modal */}
                {(activeModalPost.likes.length > 0 || (activeModalPost.reposts?.length || 0) > 0) && (
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                    {activeModalPost.likes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActivityModal({ postId: activeModalPost.id, tab: 'likes' })}
                        className="hover:text-slate-900 transition-colors"
                      >
                        <strong className="text-slate-900">{activeModalPost.likes.length}</strong>{' '}
                        {activeModalPost.likes.length === 1 ? 'Like' : 'Likes'}
                      </button>
                    )}
                    {(activeModalPost.reposts?.length || 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => setActivityModal({ postId: activeModalPost.id, tab: 'reposts' })}
                        className="hover:text-slate-900 transition-colors"
                      >
                        <strong className="text-slate-900">{activeModalPost.reposts.length}</strong>{' '}
                        {activeModalPost.reposts.length === 1 ? 'Repost' : 'Reposts'}
                      </button>
                    )}
                  </div>
                )}

                {/* Replies List */}
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Replies ({activeModalPost.replies.length})
                  </p>
                  {activeModalPost.replies.length === 0 ? (
                    <p className="text-xs text-slate-400">No replies yet. Be the first to comment!</p>
                  ) : (
                    activeModalPost.replies.map((reply: any) => (
                      <div key={reply.id} className="flex gap-2.5 items-start">
                        <div
                          onClick={() => { setSelectedPostId(null); openMemberProfile(reply.user_id); }}
                          className="w-7 h-7 rounded-full bg-slate-200/80 shrink-0 overflow-hidden mt-0.5 cursor-pointer flex items-center justify-center text-[10px] font-bold text-slate-600"
                        >
                          {reply.profiles?.avatar_url ? (
                            <img src={reply.profiles.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            reply.profiles?.first_name?.[0] || 'M'
                          )}
                        </div>
                        <div className="flex-1 min-w-0 bg-slate-100 rounded-2xl px-3.5 py-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {reply.profiles?.first_name || 'Family'}
                            </span>
                            <span className="text-[10px] text-slate-400">{formatTime(reply.created_at)}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                            {renderTextWithMentions(reply.content)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reply Input Bar */}
              <div className="p-3.5 border-t border-slate-200/80 shrink-0 space-y-2">
                {mentionTarget === 'reply' && filteredMentionMembers.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-md p-1 max-h-32 overflow-y-auto">
                    {filteredMentionMembers.map(member => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => insertMention(member)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-left"
                      >
                        <span className="text-xs font-bold text-slate-800">{member.first_name} {member.last_name}</span>
                        <span className="text-[10px] text-[#ff4d00] font-semibold ml-auto">@{member.first_name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Write a reply or type @ to tag..."
                    value={replyContent}
                    onChange={(e) => handleReplyTextChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !mentionTarget && submitReply(activeModalPost.id)}
                    className="flex-1 bg-slate-100 border border-slate-200/80 rounded-full px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => submitReply(activeModalPost.id)}
                    disabled={!replyContent.trim()}
                    className="bg-[#ff4d00] hover:bg-orange-600 text-white p-2.5 rounded-full transition-colors disabled:opacity-40 shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FULL-SCREEN PHOTO LIGHTBOX */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              aria-label="Close enlarged photo"
              className="absolute top-5 right-5 bg-white/15 hover:bg-white/25 text-white p-2.5 rounded-full backdrop-blur-md transition-colors"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxImage}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}

        {/* WHO LIKED / REPOSTED MODAL */}
        {activityModal && (() => {
          const targetPost = posts.find(p => p.id === activityModal.postId);
          if (!targetPost) return null;
          const likesList = targetPost.likes || [];
          const repostsList = targetPost.reposts || [];
          const activeList = activityModal.tab === 'likes' ? likesList : repostsList;

          return (
            <div
              onClick={() => setActivityModal(null)}
              className="fixed inset-0 z-[55] bg-black/65 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-sm max-h-[70vh] bg-white border border-slate-200/80 rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full">
                    <button
                      type="button"
                      onClick={() => setActivityModal({ ...activityModal, tab: 'likes' })}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        activityModal.tab === 'likes'
                          ? 'bg-[#1C1C2E] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Likes ({likesList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityModal({ ...activityModal, tab: 'reposts' })}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        activityModal.tab === 'reposts'
                          ? 'bg-[#1C1C2E] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Reposts ({repostsList.length})
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivityModal(null)}
                    className="text-slate-400 hover:text-slate-900 bg-slate-100 p-1.5 rounded-full"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                  {activeList.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No {activityModal.tab} yet.
                    </p>
                  ) : (
                    activeList.map((item: any) => (
                      <div
                        key={item.id || item.user_id}
                        onClick={() => {
                          setActivityModal(null);
                          setSelectedPostId(null);
                          openMemberProfile(item.user_id);
                        }}
                        className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-slate-700">
                            {item.profile?.avatar_url ? (
                              <img src={item.profile.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              item.profile?.first_name?.[0] || 'M'
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {item.profile?.first_name
                              ? `${item.profile.first_name} ${item.profile.last_name || ''}`.trim()
                              : 'Family Member'}
                          </p>
                        </div>
                        <span className="text-base shrink-0">
                          {activityModal.tab === 'likes' ? item.emoji || '❤️' : '🔁'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* SUBTLE TOP-RIGHT DARK / LIGHT MODE TOGGLE */}
        {isHubThemeable && (
          <div className="max-w-5xl mx-auto flex justify-end mb-3 relative z-20">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark or light mode"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all backdrop-blur-xl ${
                isLightMode
                  ? 'bg-white/75 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm'
                  : 'bg-white/10 border-white/15 text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              {isLightMode ? (
                <>
                  <Moon size={13} className="text-slate-600" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun size={13} className="text-amber-400" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className={`${isLightMode ? 'text-slate-400' : 'text-white/50'} animate-pulse font-bold tracking-widest uppercase text-sm`}>Loading secure connection...</p>
          </div>
        ) : (
          <>
            {/* MILLERITES FAMILY HUB */}
            {activeTab === 'millerites' && profile.is_millerite && (
              <div className="animate-in fade-in duration-500 max-w-5xl mx-auto relative z-10 space-y-5">
                
                <WelcomeTourModal
                  isOpen={showWelcomeTour}
                  firstName={profile.first_name}
                  onClose={() => {
                    setShowWelcomeTour(false);
                    if (userId) localStorage.setItem(`millerites_tour_seen_${userId}`, 'true');
                  }}
                />

                <InstallAppBanner />

                {/* TOP BENTO HEADER ROW */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-8 bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-amber-200/40 to-orange-300/20 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 bg-slate-900/5 border border-slate-900/10 text-slate-700 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                        <Sparkles size={12} className="text-[#ff4d00]" /> Miller Family Hub
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowWelcomeTour(true)}
                          className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200/80 px-3 py-1 rounded-full transition-colors"
                        >
                          ? Tour
                        </button>
                        <button
                          type="button"
                          onClick={handleEnableNotifications}
                          className="text-[11px] font-bold text-[#ff4d00] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1 rounded-full transition-colors"
                        >
                          🔔 Enable Alerts
                        </button>
                        <span className="text-xs font-semibold text-slate-400">
                          Hi, {profile.first_name || 'Family'} 👋🏾
                        </span>
                      </div>
                    </div>

                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">
                        Millerites
                      </h1>
                      <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
                        Private family updates, weekly spotlights, milestones, and prayer requests to keep our crew connected.
                      </p>
                    </div>
                  </div>

                  {/* Family Pulse Card (Auto-Cycling) */}
                  <div
                    onClick={activePulse.onClick}
                    className={`md:col-span-4 bg-[#1C1C2E] text-white shadow-[0_12px_35px_rgba(28,28,46,0.18)] rounded-[32px] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all ${
                      activePulse.onClick ? 'cursor-pointer hover:bg-[#232338]' : ''
                    }`}
                  >
                    <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full truncate">
                        {activePulse.badge}
                      </span>
                      {/* Interactive Slide Dots */}
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {pulseSlides.map((slide, idx) => (
                          <button
                            key={slide.id}
                            type="button"
                            onClick={() => setPulseIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                              idx === pulseIndex % pulseSlides.length
                                ? 'w-4 bg-amber-400'
                                : 'w-1.5 bg-white/25 hover:bg-white/50'
                            }`}
                            aria-label={`Show ${slide.badge}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div key={activePulse.id} className="my-4 animate-in fade-in duration-300">
                      <div className="flex items-baseline gap-2.5 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                          {activePulse.headline}
                        </span>
                        {activePulse.subHeadline && (
                          <span className="text-xs text-white/60 font-medium">
                            {activePulse.subHeadline}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/55 font-medium mt-1.5 truncate">
                        {activePulse.detail}
                      </p>
                      <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-[#ff4d00] h-full rounded-full transition-all duration-500"
                          style={{ width: `${activePulse.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/60 pt-3 border-t border-white/10">
                      <span className="truncate max-w-[170px]">{activePulse.footerLeft}</span>
                      <span className="font-bold text-amber-400 shrink-0">{activePulse.footerRight}</span>
                    </div>
                  </div>
                </div>

                {/* HORIZONTAL FAMILY MEMBER CIRCLE BAR (Directly below Welcome & Pulse) */}
                {renderMemberCircleBar()}

                {/* 2x2 SIDE-BY-SIDE COLLAPSIBLE MODULES ABOVE THE TIMELINE */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 items-start">

                  {/* 1. FAMILY VIBE CHECK (Collapsible, expands full-width when open) */}
                  <div className={`bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] sm:rounded-[28px] overflow-hidden transition-all ${openModules.vibe ? 'col-span-2' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleModule('vibe')}
                      className="w-full p-3.5 sm:p-5 flex items-center justify-between gap-2 hover:bg-white/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#ff4d00] shrink-0">
                          <Smile size={16} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-slate-900 font-black uppercase tracking-wider text-[10px] sm:text-xs leading-tight truncate">
                            Vibe Check
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                            {profile.status_emoji || '👋🏾'} {profile.status_text || 'Set vibe'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform duration-300 ${openModules.vibe ? 'rotate-180 text-slate-900' : ''}`} />
                    </button>

                    {openModules.vibe && (
                      <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                        <div className="flex justify-end mb-3">
                          <button
                            type="button"
                            onClick={() => setIsEditingStatus(!isEditingStatus)}
                            className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                          >
                            <span>{profile.status_emoji || '👋🏾'}</span>
                            <span>{isEditingStatus ? 'Close Editor' : 'Update My Vibe'}</span>
                          </button>
                        </div>

                        {isEditingStatus && (
                          <div className="mb-4 p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-3 animate-in fade-in">
                            <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-1 bg-white/70 rounded-xl border border-slate-200/60 custom-scrollbar">
                              {VIBE_EMOJIS.map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setStatusEmojiInput(emoji)}
                                  className={`h-8 rounded-xl text-base flex items-center justify-center transition-all ${
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
                                placeholder="What are you up to today?"
                                value={statusTextInput}
                                onChange={(e) => setStatusTextInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveStatus()}
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                              />
                              <button
                                type="button"
                                onClick={handleSaveStatus}
                                disabled={isSavingStatus}
                                className="bg-[#1C1C2E] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 shrink-0"
                              >
                                {isSavingStatus ? '...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-end gap-4 overflow-x-auto pt-2 pb-1 px-1 custom-scrollbar">
                          <div 
                            onClick={() => setIsEditingStatus(!isEditingStatus)}
                            className="flex flex-col items-center shrink-0 cursor-pointer group relative w-20"
                          >
                            <div className="mb-1.5 px-2 py-1 rounded-2xl bg-[#1C1C2E] text-white text-[10px] font-bold shadow-md max-w-[90px] truncate text-center">
                              <span>{profile.status_emoji || '👋🏾'}</span>{' '}
                              <span>{profile.status_text || 'Set status'}</span>
                            </div>
                            <div className="relative">
                              <div className="w-14 h-14 rounded-2xl bg-slate-100 p-0.5 ring-2 ring-[#ff4d00] overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                                {profile.avatar_url ? (
                                  <img src={profile.avatar_url} className="w-full h-full object-cover rounded-[14px]" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-base font-black text-slate-700">
                                    {profile.first_name?.[0] || 'M'}
                                  </div>
                                )}
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#ff4d00] text-white flex items-center justify-center text-[10px] shadow">
                                +
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-900 mt-1.5 truncate w-full text-center">
                              You
                            </span>
                          </div>

                          {otherFamilyMembers.map(member => (
                            <div
                              key={member.id}
                              onClick={() => openMemberProfile(member.id)}
                              className="flex flex-col items-center shrink-0 cursor-pointer group relative w-20"
                            >
                              <div className="mb-1.5 px-2 py-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700 text-[10px] font-bold shadow-sm max-w-[95px] truncate text-center group-hover:bg-white transition-colors">
                                <span>{member.status_emoji || '👋🏾'}</span>{' '}
                                <span>{member.status_text || 'Checking in'}</span>
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-slate-100 p-0.5 ring-2 ring-slate-200/80 group-hover:ring-amber-400 overflow-hidden shadow-sm group-hover:scale-105 transition-all">
                                {member.avatar_url ? (
                                  <img src={member.avatar_url} className="w-full h-full object-cover rounded-[14px]" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-base font-black text-slate-600">
                                    {member.first_name?.[0] || 'M'}
                                  </div>
                                )}
                              </div>
                              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-slate-900 mt-1.5 truncate w-full text-center">
                                {member.first_name || 'Family'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. WEEKLY FAMILY SPOTLIGHT (Collapsible, expands full-width when open) */}
                  <div className={`bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] sm:rounded-[28px] overflow-hidden transition-all ${openModules.spotlight ? 'col-span-2' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleModule('spotlight')}
                      className="w-full p-3.5 sm:p-5 flex items-center justify-between gap-2 hover:bg-white/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#1C1C2E] flex items-center justify-center text-amber-400 shrink-0">
                          <Award size={16} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-slate-900 font-black uppercase tracking-wider text-[10px] sm:text-xs leading-tight truncate">
                            Spotlight
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                            {currentSpotlight
                              ? `🌟 ${currentSpotlight.honoreeProfile?.first_name || 'Family'}`
                              : 'Weekly shoutout'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform duration-300 ${openModules.spotlight ? 'rotate-180 text-slate-900' : ''}`} />
                    </button>

                    {openModules.spotlight && (
                      <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 animate-in fade-in duration-200 space-y-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsAddingSpotlightOpen(!isAddingSpotlightOpen)}
                            className="text-[10px] font-extrabold text-white bg-[#1C1C2E] hover:bg-slate-800 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                          >
                            <Plus size={11} /> {isAddingSpotlightOpen ? 'Close' : 'Highlight a Member'}
                          </button>
                        </div>

                        {isAddingSpotlightOpen && (
                          <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-2.5 animate-in fade-in">
                            <select
                              value={spotlightHonoreeId}
                              onChange={(e) => setSpotlightHonoreeId(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400"
                            >
                              <option value="">Select family member to spotlight...</option>
                              {familyMembers.map(m => (
                                <option key={m.id} value={m.id}>
                                  {m.first_name} {m.last_name}
                                </option>
                              ))}
                            </select>

                            <div className="flex gap-1.5 overflow-x-auto pb-1">
                              {SPOTLIGHT_CATEGORIES.map(cat => (
                                <button
                                  key={cat.label}
                                  type="button"
                                  onClick={() => setSpotlightCategory(cat.label)}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all ${
                                    spotlightCategory === cat.label
                                      ? 'bg-[#1C1C2E] text-white shadow-sm'
                                      : 'bg-white border border-slate-200/70 text-slate-600'
                                  }`}
                                >
                                  <span>{cat.emoji}</span>
                                  <span>{cat.label}</span>
                                </button>
                              ))}
                            </div>

                            <input
                              type="text"
                              placeholder="Headline (e.g. Made the Honor Roll, Hosted Dinner!)"
                              value={spotlightTitle}
                              onChange={(e) => setSpotlightTitle(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                            />
                            <textarea
                              rows={2}
                              placeholder="Share why we're celebrating them this week..."
                              value={spotlightReason}
                              onChange={(e) => setSpotlightReason(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none"
                            />
                            <button
                              type="button"
                              onClick={handleCreateSpotlight}
                              disabled={isSavingSpotlight || !spotlightHonoreeId || !spotlightTitle.trim() || !spotlightReason.trim()}
                              className="w-full bg-[#ff4d00] hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-40"
                            >
                              {isSavingSpotlight ? 'Publishing...' : 'Publish Weekly Spotlight'}
                            </button>
                          </div>
                        )}

                        {!currentSpotlight ? (
                          <div className="text-center py-6 px-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                            <p className="text-slate-400 text-xs font-medium">
                              No weekly spotlight yet. Tap "Highlight a Member" to celebrate someone's win or kindness!
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-gradient-to-br from-[#1C1C2E] to-slate-800 text-white p-5 rounded-2xl relative overflow-hidden shadow-md">
                              <div className="absolute -right-6 -top-6 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/15 border border-amber-400/30 text-amber-300 px-2.5 py-1 rounded-full">
                                  ✨ Weekly Spotlight • {currentSpotlight.category}
                                </span>
                                {currentSpotlight.user_id === userId && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSpotlight(currentSpotlight.id)}
                                    className="text-white/40 hover:text-red-400 p-1 rounded-lg transition-colors"
                                    title="Delete spotlight"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>

                              <div
                                onClick={() => openMemberProfile(currentSpotlight.honoree_id)}
                                className="flex items-center gap-3.5 cursor-pointer group mb-3"
                              >
                                <div className="w-14 h-14 rounded-full ring-2 ring-amber-400 bg-white/10 overflow-hidden shrink-0 flex items-center justify-center text-lg font-black">
                                  {currentSpotlight.honoreeProfile?.avatar_url ? (
                                    <img src={currentSpotlight.honoreeProfile.avatar_url} className="w-full h-full object-cover" />
                                  ) : (
                                    currentSpotlight.honoreeProfile?.first_name?.[0] || 'M'
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-base font-black text-white group-hover:text-amber-300 transition-colors truncate">
                                    {currentSpotlight.honoreeProfile?.first_name} {currentSpotlight.honoreeProfile?.last_name}
                                  </p>
                                  <p className="text-xs font-bold text-amber-400 truncate">
                                    {currentSpotlight.title}
                                  </p>
                                </div>
                              </div>

                              <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                                {currentSpotlight.reason}
                              </p>
                              <p className="text-[10px] text-white/40 font-medium mt-3">
                                Highlighted by {currentSpotlight.nominatorProfile?.first_name || 'Family'} • {formatTime(currentSpotlight.created_at)}
                              </p>
                            </div>

                            {spotlights.length > 1 && (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                                  Previous Spotlights
                                </p>
                                {spotlights.slice(1).map(sp => (
                                  <div key={sp.id} className="p-3 bg-slate-50/90 border border-slate-200/60 rounded-2xl flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-900 truncate">
                                        {sp.honoreeProfile?.first_name} — {sp.title}
                                      </p>
                                      <p className="text-[10px] text-slate-500 truncate">
                                        {sp.category} • {formatTime(sp.created_at)}
                                      </p>
                                    </div>
                                    {sp.user_id === userId && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSpotlight(sp.id)}
                                        className="text-slate-300 hover:text-red-500 p-1 shrink-0"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. UPCOMING MILESTONES (Collapsible, expands full-width when open) */}
                  <div className={`bg-white/85 backdrop-blur-2xl border border-white rounded-[24px] sm:rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all ${openModules.milestones ? 'col-span-2' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleModule('milestones')}
                      className="w-full p-3.5 sm:p-5 flex items-center justify-between gap-2 hover:bg-white/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#ff4d00] shrink-0">
                          <CalendarHeart size={16} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-slate-900 font-black uppercase tracking-wider text-[10px] sm:text-xs leading-tight truncate">
                            Milestones
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                            {nextMilestone ? `${nextMilestone.emoji} ${nextMilestone.label}` : `${milestones.length} saved`}
                          </p>
                        </div>
                      </div>
                      <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform duration-300 ${openModules.milestones ? 'rotate-180 text-slate-900' : ''}`} />
                    </button>

                    {openModules.milestones && (
                      <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                        <div className="flex justify-end mb-3">
                          <button
                            type="button"
                            onClick={() => setIsAddingMilestoneFormOpen(!isAddingMilestoneFormOpen)}
                            className="text-[10px] font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                          >
                            <Plus size={11} /> {isAddingMilestoneFormOpen ? 'Close' : 'Add Milestone'}
                          </button>
                        </div>

                        {isAddingMilestoneFormOpen && (
                          <div className="mb-4 p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-2.5 animate-in fade-in">
                            <div className="flex gap-1.5 overflow-x-auto pb-1">
                              {MILESTONE_TYPES.map(type => (
                                <button
                                  key={type.label}
                                  type="button"
                                  onClick={() => setMilestoneCategory(type.label)}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all ${
                                    milestoneCategory === type.label
                                      ? 'bg-[#1C1C2E] text-white shadow-sm'
                                      : 'bg-white border border-slate-200/70 text-slate-600'
                                  }`}
                                >
                                  <span>{type.emoji}</span>
                                  <span>{type.label}</span>
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              placeholder="Event title (e.g. Sarah's Birthday, Lake Trip)"
                              value={milestoneTitle}
                              onChange={(e) => setMilestoneTitle(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                            />
                            <div className="flex gap-2">
                              <input
                                type="date"
                                value={milestoneDate}
                                onChange={(e) => setMilestoneDate(e.target.value)}
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400"
                              />
                              <button
                                type="button"
                                onClick={handleCreateMilestone}
                                disabled={isSavingMilestone || !milestoneTitle.trim() || !milestoneDate}
                                className="bg-[#1C1C2E] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-40 shrink-0"
                              >
                                {isSavingMilestone ? '...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                          {milestones.length === 0 ? (
                            <div className="text-center py-6 px-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                              <p className="text-slate-400 text-xs font-medium">
                                No birthdays, anniversaries, or trips logged yet.
                              </p>
                            </div>
                          ) : (
                            milestones.map((ms, idx) => (
                              <div
                                key={ms.id}
                                className={`group p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                  ms.daysUntil === 0
                                    ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-400/50 shadow-sm'
                                    : idx === 0
                                    ? 'bg-white border-slate-200/80 shadow-sm'
                                    : 'bg-slate-50/90 hover:bg-white border-slate-200/60'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-lg shrink-0">
                                    {ms.emoji || '🎂'}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">
                                      {ms.title}
                                    </p>
                                    <p className="text-[10px] font-semibold text-slate-400">
                                      {ms.formattedDate} • {ms.category}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span
                                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                                      ms.daysUntil === 0
                                        ? 'bg-[#ff4d00] text-white shadow-sm'
                                        : ms.daysUntil <= 7
                                        ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {ms.label}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMilestone(ms.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1 rounded-lg transition-all"
                                    title="Delete milestone"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 4. PRAYERS (Collapsible, expands full-width when open) */}
                  <div className={`bg-white/85 backdrop-blur-2xl border border-white rounded-[24px] sm:rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all ${openModules.prayers ? 'col-span-2' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleModule('prayers')}
                      className="w-full p-3.5 sm:p-5 flex items-center justify-between gap-2 hover:bg-white/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#ff4d00] shrink-0">
                          <BookHeart size={16} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-slate-900 font-black uppercase tracking-wider text-[10px] sm:text-xs leading-tight truncate">
                            Prayers
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                            {activePrayersCount} Active • {answeredPrayersCount} Ans
                          </p>
                        </div>
                      </div>
                      <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform duration-300 ${openModules.prayers ? 'rotate-180 text-slate-900' : ''}`} />
                    </button>

                    {openModules.prayers && (
                      <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                        <div className="flex justify-end mb-4">
                          <div className="flex bg-slate-100 p-0.5 rounded-full border border-slate-200/60">
                            <button 
                              onClick={() => setPrayerFilter('active')} 
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${prayerFilter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                              Active ({activePrayersCount})
                            </button>
                            <button 
                              onClick={() => setPrayerFilter('answered')} 
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${prayerFilter === 'answered' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                              Answered ({answeredPrayersCount})
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-4 relative">
                          <input 
                            type="text" 
                            placeholder="Share a prayer request..." 
                            value={newPrayer} 
                            onChange={(e) => setNewPrayer(e.target.value)} 
                            className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl pl-4 pr-11 py-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all" 
                          />
                          <button 
                            onClick={handleCreatePrayer} 
                            disabled={isPraying || !newPrayer.trim()} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1C1C2E] text-white p-2 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-40"
                          >
                            <Send size={12} />
                          </button>
                        </div>

                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                          {filteredPrayers.length === 0 ? (
                            <div className="text-center py-8 px-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                              <p className="text-slate-400 text-xs font-medium">
                                {prayerFilter === 'answered' ? 'No answered prayers marked yet. Keep praying!' : 'No active prayer requests right now.'}
                              </p>
                            </div>
                          ) : (
                            filteredPrayers.map(prayer => {
                              const isOwnPrayer = prayer.user_id === userId;
                              const intercessions = prayer.intercessions || [];
                              const hasPrayed = intercessions.some((i: any) => i.user_id === userId);

                              return (
                                <div 
                                  key={prayer.id} 
                                  className={`p-4 rounded-2xl transition-all shadow-sm border ${
                                    prayer.is_answered 
                                      ? 'bg-gradient-to-br from-amber-50/90 to-orange-50/50 border-amber-200/80' 
                                      : 'bg-slate-50/90 hover:bg-white border-slate-200/60'
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-2 mb-2">
                                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => openMemberProfile(prayer.user_id)}>
                                      <div className="w-6 h-6 rounded-lg bg-slate-200 border border-slate-300/60 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                        {prayer.profile?.avatar_url ? (
                                          <img src={prayer.profile.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                          prayer.profile?.first_name?.[0] || 'M'
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-slate-900 text-xs font-bold group-hover:text-[#ff4d00] transition-colors leading-none">
                                          {prayer.profile?.first_name ? `${prayer.profile.first_name} ${prayer.profile.last_name}` : 'Family Member'}
                                        </p>
                                        <span className="text-[10px] font-medium text-slate-400">{formatTime(prayer.created_at)}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      {prayer.is_answered && (
                                        <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-800 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                          <CheckCircle2 size={10} className="text-amber-600" /> Answered
                                        </span>
                                      )}
                                      {isOwnPrayer && (
                                        <button 
                                          onClick={() => handleDeletePrayer(prayer.id)} 
                                          className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors"
                                          title="Delete prayer"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <p className="text-slate-700 text-xs leading-relaxed mb-3.5 whitespace-pre-wrap">
                                    {renderTextWithMentions(prayer.content)}
                                  </p>

                                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-200/50">
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => togglePrayingForRequest(prayer.id, hasPrayed)}
                                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                          hasPrayed 
                                            ? 'bg-[#1C1C2E] text-white shadow-sm' 
                                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                                        }`}
                                      >
                                        <span>🙏🏾</span>
                                        <span>{hasPrayed ? 'Praying' : 'Pray'}</span>
                                        {intercessions.length > 0 && (
                                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${hasPrayed ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                            {intercessions.length}
                                          </span>
                                        )}
                                      </button>

                                      {intercessions.length > 0 && (
                                        <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                                          {intercessions.slice(0, 4).map((intercession: any) => (
                                            <div 
                                              key={intercession.id} 
                                              title={`${intercession.profile?.first_name || 'Family'} is praying`}
                                              className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden flex items-center justify-center text-[8px] font-bold text-slate-700"
                                            >
                                              {intercession.profile?.avatar_url ? (
                                                <img src={intercession.profile.avatar_url} className="w-full h-full object-cover" />
                                              ) : (
                                                intercession.profile?.first_name?.[0] || 'M'
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {isOwnPrayer && (
                                      <button 
                                        onClick={() => togglePrayerAnswered(prayer.id, !!prayer.is_answered)}
                                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                                          prayer.is_answered 
                                            ? 'text-slate-500 hover:bg-slate-200/60' 
                                            : 'text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20'
                                        }`}
                                      >
                                        <CheckCircle2 size={11} />
                                        {prayer.is_answered ? 'Move to Active' : 'Mark Answered'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ALWAYS-OPEN FAMILY POSTS / TIMELINE SECTION (Clean & Integrated) */}
                <div className="pt-4">
                  {/* Minimal Section Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 px-1">
                    <h2 className="text-slate-900 font-black uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                      <MessageSquare size={15} className="text-[#ff4d00]" />
                      Family Posts
                    </h2>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {posts.length} {posts.length === 1 ? 'update' : 'updates'}
                    </span>
                  </div>

                  {/* Flat Integrated Post Composer */}
                  <div className="py-4 px-1 border-b border-slate-200/80 relative">
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-full bg-slate-200/80 shrink-0 flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          profile.first_name?.[0] || 'M'
                        )}
                      </div>
                      <div className="flex-1 min-w-0 relative">
                        <textarea 
                          rows={2} 
                          placeholder="Share a family update, photos/videos, or type @ to tag..." 
                          value={newPost} 
                          onChange={(e) => handlePostTextChange(e.target.value)}
                          className="w-full bg-transparent text-slate-800 text-sm font-medium focus:outline-none resize-none placeholder:text-slate-400 pt-1"
                        />

                        {mentionTarget === 'post' && filteredMentionMembers.length > 0 && (
                          <div className="mt-1 mb-2 bg-white border border-slate-200 rounded-2xl shadow-lg p-1.5 max-h-48 overflow-y-auto z-30">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                              Tag a Family Member
                            </p>
                            {filteredMentionMembers.map(member => (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => insertMention(member)}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-100 transition-colors text-left"
                              >
                                <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
                                  {member.avatar_url ? (
                                    <img src={member.avatar_url} className="w-full h-full object-cover" />
                                  ) : (
                                    member.first_name?.[0] || 'M'
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 leading-none">
                                    {member.first_name} {member.last_name}
                                  </p>
                                  <p className="text-[10px] text-[#ff4d00] font-semibold mt-0.5">
                                    @{member.first_name}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {postMediaUrls.length > 0 && (
                          <div className="flex gap-2.5 overflow-x-auto mt-2.5 pb-1 custom-scrollbar">
                            {postMediaUrls.map((url, idx) => (
                              <div key={idx} className="relative shrink-0">
                                {isVideo(url) ? (
                                  <video src={url} className="h-28 w-28 rounded-xl object-cover bg-black" muted playsInline />
                                ) : (
                                  <img src={url} className="h-28 w-28 rounded-xl object-cover" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => setPostMediaUrls(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full p-1 shadow hover:bg-red-500 transition-colors"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-1 -ml-2">
                            <button 
                              onClick={() => fileInputRef.current?.click()} 
                              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold px-2.5 py-1.5 rounded-full hover:bg-slate-200/50 transition-colors"
                            >
                              <ImageIcon size={15} className="text-[#ff4d00]" />
                              <span>Media</span>
                              <input type="file" accept="image/*,video/*" multiple hidden ref={fileInputRef} onChange={handleMediaUpload} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePostTextChange(newPost + (newPost && !newPost.endsWith(' ') ? ' @' : '@'))}
                              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-semibold px-2.5 py-1.5 rounded-full hover:bg-slate-200/50 transition-colors"
                              title="Tag a family member"
                            >
                              <AtSign size={14} className="text-[#ff4d00]" />
                              <span>Tag</span>
                            </button>
                          </div>
                          <button 
                            onClick={handleCreatePost} 
                            disabled={isPosting || (!newPost.trim() && postMediaUrls.length === 0)} 
                            className="bg-[#1C1C2E] hover:bg-slate-800 text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all disabled:opacity-35"
                          >
                            {isPosting ? 'Posting...' : 'Post'} <Send size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clean Hairline-Separated Feed */}
                  <div className="divide-y divide-slate-200/75">
                    {posts.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-slate-400 text-sm font-medium">No family updates yet. Be the first to share!</p>
                      </div>
                    ) : (
                      posts.map(post => {
                        const isOwnPost = post.user_id === userId;
                        const myReaction = post.likes.find((l: any) => l.user_id === userId)?.emoji;
                        
                        return (
                          <article key={post.id} className="py-5 px-1">
                            {/* Post Header */}
                            <div className="flex items-center justify-between mb-2.5 relative">
                              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => openMemberProfile(post.user_id)}>
                                <div className="w-9 h-9 rounded-full bg-slate-200/80 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 overflow-hidden">
                                  {post.profile?.avatar_url ? (
                                    <img src={post.profile.avatar_url} className="w-full h-full object-cover" />
                                  ) : (
                                    post.profile?.first_name?.[0] || 'M'
                                  )}
                                </div>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-slate-900 text-sm font-bold group-hover:text-[#ff4d00] transition-colors">
                                    {post.profile?.first_name ? `${post.profile.first_name} ${post.profile.last_name}` : 'Family Member'}
                                  </p>
                                  <span className="text-slate-400 text-[11px] font-medium">{formatTime(post.created_at)}</span>
                                </div>
                              </div>
                              
                              {isOwnPost && (
                                <div className="relative">
                                  <button onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/50 transition-colors">
                                    <MoreVertical size={15} />
                                  </button>
                                  {menuOpenId === post.id && (
                                    <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                                      <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); setMenuOpenId(null); }} className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                        <Edit2 size={12}/> Edit
                                      </button>
                                      <button onClick={() => handleDeletePost(post.id)} className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                        <Trash2 size={12}/> Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Post Body */}
                            <div className="sm:pl-12">
                              {editingPostId === post.id ? (
                                <div className="mb-3">
                                  <textarea 
                                    value={editContent} 
                                    onChange={(e) => setEditContent(e.target.value)} 
                                    className="w-full bg-white/80 border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-slate-500" 
                                  />
                                  <div className="flex gap-2 justify-end mt-2">
                                    <button onClick={() => setEditingPostId(null)} className="text-xs font-semibold text-slate-500 px-3 py-1 rounded-full hover:bg-slate-200/60">
                                      Cancel
                                    </button>
                                    <button onClick={() => submitEdit(post.id)} className="bg-[#1C1C2E] text-white text-xs font-bold px-4 py-1 rounded-full">
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {post.content && (
                                    <p className="text-slate-800 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">
                                      {renderTextWithMentions(post.content)}
                                    </p>
                                  )}
                                  {renderPostMedia(post.media_url)}
                                </>
                              )}

                              {/* Minimal Action & Reaction Row */}
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {POST_REACTIONS.map(emoji => {
                                      const count = post.likes.filter((l: any) => (l.emoji || '❤️') === emoji).length;
                                      const isSelected = myReaction === emoji;
                                      return (
                                        <button
                                          key={emoji}
                                          type="button"
                                          onClick={() => toggleReaction(post, emoji)}
                                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                                            isSelected
                                              ? 'bg-[#1C1C2E] text-white'
                                              : count > 0
                                              ? 'bg-slate-200/70 text-slate-800 hover:bg-slate-200'
                                              : 'text-slate-500 hover:bg-slate-200/50'
                                          }`}
                                        >
                                          <span className="text-sm leading-none">{emoji}</span>
                                          {count > 0 && <span className="text-[11px]">{count}</span>}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => setReplyingToPostId(replyingToPostId === post.id ? null : post.id)} 
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 transition-all text-xs font-semibold"
                                    >
                                      <MessageSquare size={14} /> 
                                      <span>{post.replies.length}</span>
                                    </button>

                                    <button 
                                      onClick={() => handleRepost(post)} 
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 transition-all text-xs font-semibold"
                                      title="Repost"
                                    >
                                      <Repeat size={14} />
                                      <span>{post.reposts?.length || 0}</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Clickable Likes, Replies & Reposts Stats Bar */}
                                {(post.likes.length > 0 || (post.reposts?.length || 0) > 0 || post.replies.length > 0) && (
                                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-slate-500">
                                    {post.likes.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setActivityModal({ postId: post.id, tab: 'likes' })}
                                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                                      >
                                        <div className="flex -space-x-1.5">
                                          {post.likes.slice(0, 3).map((like: any) => (
                                            <div
                                              key={like.id || like.user_id}
                                              className="w-4 h-4 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden flex items-center justify-center text-[7px] font-bold text-slate-700"
                                            >
                                              {like.profile?.avatar_url ? (
                                                <img src={like.profile.avatar_url} className="w-full h-full object-cover" />
                                              ) : (
                                                like.profile?.first_name?.[0] || 'M'
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                        <span>
                                          <strong className="text-slate-800">{post.likes.length}</strong>{' '}
                                          {post.likes.length === 1 ? 'Like' : 'Likes'}
                                        </span>
                                      </button>
                                    )}

                                    {post.replies.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setReplyingToPostId(replyingToPostId === post.id ? null : post.id)}
                                        className="hover:text-slate-900 transition-colors"
                                      >
                                        <strong className="text-slate-800">{post.replies.length}</strong>{' '}
                                        {post.replies.length === 1 ? 'Reply' : 'Replies'}
                                      </button>
                                    )}

                                    {(post.reposts?.length || 0) > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setActivityModal({ postId: post.id, tab: 'reposts' })}
                                        className="hover:text-slate-900 transition-colors"
                                      >
                                        <strong className="text-slate-800">{post.reposts.length}</strong>{' '}
                                        {post.reposts.length === 1 ? 'Repost' : 'Reposts'}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Clean Threaded Replies */}
                              {(replyingToPostId === post.id || post.replies.length > 0) && (
                                <div className="mt-3 pt-2 pl-3 border-l-2 border-slate-200/80 space-y-2.5">
                                  {post.replies.map((reply: any) => (
                                    <div key={reply.id} className="flex gap-2.5 items-start">
                                      <div 
                                        className="w-6 h-6 rounded-full bg-slate-200/80 shrink-0 overflow-hidden mt-0.5 cursor-pointer" 
                                        onClick={() => openMemberProfile(reply.user_id)}
                                      >
                                        {reply.profiles?.avatar_url ? (
                                          <img src={reply.profiles.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600 font-bold">
                                            {reply.profiles?.first_name?.[0] || 'M'}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                          <span 
                                            className="text-xs font-bold text-slate-900 hover:text-[#ff4d00] cursor-pointer" 
                                            onClick={() => openMemberProfile(reply.user_id)}
                                          >
                                            {reply.profiles?.first_name || 'Family'}
                                          </span>
                                          <span className="text-[10px] font-medium text-slate-400">{formatTime(reply.created_at)}</span>
                                        </div>
                                        <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                                          {renderTextWithMentions(reply.content)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                  {replyingToPostId === post.id && (
                                    <div className="pt-1 space-y-2">
                                      {mentionTarget === 'reply' && filteredMentionMembers.length > 0 && (
                                        <div className="bg-white border border-slate-200 rounded-xl shadow-md p-1 max-h-40 overflow-y-auto">
                                          {filteredMentionMembers.map(member => (
                                            <button
                                              key={member.id}
                                              type="button"
                                              onClick={() => insertMention(member)}
                                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                                            >
                                              <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-[8px] font-bold text-slate-700">
                                                {member.avatar_url ? (
                                                  <img src={member.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                  member.first_name?.[0] || 'M'
                                                )}
                                              </div>
                                              <span className="text-xs font-bold text-slate-800">{member.first_name} {member.last_name}</span>
                                              <span className="text-[10px] text-[#ff4d00] font-semibold ml-auto">@{member.first_name}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                      <div className="flex gap-2">
                                        <input 
                                          autoFocus 
                                          type="text" 
                                          placeholder="Write a reply or type @ to tag..." 
                                          value={replyContent} 
                                          onChange={(e) => handleReplyTextChange(e.target.value)}
                                          onKeyDown={(e) => e.key === 'Enter' && !mentionTarget && submitReply(post.id)}
                                          className="flex-1 bg-transparent border-b border-slate-300 px-1 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-600 transition-all" 
                                        />
                                        <button 
                                          onClick={() => submitReply(post.id)} 
                                          className="bg-[#1C1C2E] hover:bg-slate-800 text-white p-2 rounded-full transition-colors"
                                        >
                                          <Send size={12}/>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MEMBER PROFILE VIEW WITH SEND DM & INTERACTIVE POSTS */}
            {activeTab === 'member_view' && viewingMember && (
              <div className="animate-in fade-in max-w-4xl mx-auto relative z-10 space-y-5">
                {renderMemberCircleBar()}

                <button 
                  onClick={() => setActiveTab('millerites')} 
                  className="text-xs text-slate-500 hover:text-slate-900 uppercase font-bold tracking-widest flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-full shadow-sm"
                >
                  ← Back to Millerites
                </button>
                
                <div className="bg-white/85 backdrop-blur-2xl border border-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-amber-400/50 overflow-hidden shrink-0 shadow-md bg-slate-100">
                    {viewingMember.avatar_url ? (
                      <img src={viewingMember.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                        {viewingMember.first_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                        {viewingMember.first_name} {viewingMember.last_name}
                      </h1>
                      {(viewingMember.status_text || viewingMember.status_emoji) && (
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-full text-xs font-bold text-slate-700 self-center sm:self-auto">
                          <span>{viewingMember.status_emoji || '👋🏾'}</span>
                          <span>{viewingMember.status_text || 'Checking in'}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-bold text-slate-500 mb-4">
                      <span className="bg-slate-100 px-3 py-1.5 rounded-full">
                        <strong className="text-slate-900">{currentMemberPosts.length}</strong> updates shared
                      </span>
                      {viewingMember.id !== userId && (
                        <button
                          type="button"
                          onClick={() => setDmRecipient(viewingMember)}
                          className="inline-flex items-center gap-1.5 bg-[#ff4d00] hover:bg-orange-600 text-white px-4 py-1.5 rounded-full shadow-md shadow-orange-500/20 transition-all"
                        >
                          <MessageCircle size={14} /> Send DM
                          {unreadDmSenders[viewingMember.id] ? (
                            <span className="bg-white text-[#ff4d00] text-[10px] font-black px-1.5 rounded-full">
                              {unreadDmSenders[viewingMember.id]}
                            </span>
                          ) : null}
                        </button>
                      )}
                    </div>

                    {viewingMember.bio && (
                      <p className="text-slate-600 text-sm whitespace-pre-wrap mb-4 max-w-lg leading-relaxed">
                        {viewingMember.bio}
                      </p>
                    )}
                    {viewingMember.bible_verse && (
                      <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl text-xs text-amber-800 font-bold">
                        <BookHeart size={14} className="text-[#ff4d00]" /> {viewingMember.bible_verse}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-center mb-6">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-800 bg-white/80 backdrop-blur-md border border-slate-200/80 px-5 py-2 rounded-full shadow-sm">
                      <Grid size={14} className="text-[#ff4d00]" /> Family Updates
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    {currentMemberPosts.map(post => {
                      const mediaList = getPostMedia(post.media_url);
                      const coverMedia = mediaList[0];
                      return (
                        <div
                          key={post.id}
                          onClick={() => setSelectedPostId(post.id)}
                          className="aspect-square bg-white/85 backdrop-blur-xl border border-white shadow-[0_8px_25px_rgb(0,0,0,0.04)] relative group cursor-pointer overflow-hidden rounded-[24px] active:scale-[0.98] transition-transform"
                        >
                          {coverMedia ? (
                            isVideo(coverMedia) ? (
                              <video src={coverMedia} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted playsInline />
                            ) : (
                              <img src={coverMedia} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            )
                          ) : (
                            <div className="w-full h-full p-5 flex flex-col justify-center items-center text-center bg-slate-50/70">
                              <p className="text-slate-800 text-xs md:text-sm line-clamp-4 leading-relaxed font-semibold">
                                "{post.content}"
                              </p>
                            </div>
                          )}
                          {mediaList.length > 1 && (
                            <span className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              +{mediaList.length - 1}
                            </span>
                          )}
                          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5">
                            <span className="text-white text-sm font-bold flex items-center gap-1.5"><Heart size={17} className="fill-white"/> {post.likes.length}</span>
                            <span className="text-white text-sm font-bold flex items-center gap-1.5"><MessageSquare size={17} className="fill-white"/> {post.replies.length}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {currentMemberPosts.length === 0 && (
                    <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[28px] p-12 text-center">
                      <p className="text-slate-400 text-sm font-medium">No posts yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DIRECT MESSAGES INBOX TAB */}
            {activeTab === 'dms' && profile.is_millerite && (
              <div className="animate-in fade-in duration-500 max-w-3xl mx-auto relative z-10 space-y-5">
                <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-8">
                  <span className="inline-flex items-center gap-1.5 bg-slate-900/5 border border-slate-900/10 text-slate-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                    <MessageCircle size={11} className="text-[#ff4d00]" /> Private Family Chat
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Direct Messages
                  </h1>
                  <p className="text-slate-500 text-xs font-medium mt-1">
                    Tap any family member below to open your private chat.
                  </p>
                </div>

                <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] overflow-hidden divide-y divide-slate-200/75">
                  {otherFamilyMembers.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="text-slate-400 text-sm font-medium">No other family members yet.</p>
                    </div>
                  ) : (
                    [...otherFamilyMembers]
                      .sort((a, b) => (unreadDmSenders[b.id] || 0) - (unreadDmSenders[a.id] || 0))
                      .map(member => {
                        const unreadCount = unreadDmSenders[member.id] || 0;
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => setDmRecipient(member)}
                            className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 ring-2 ring-slate-200/80 overflow-hidden flex items-center justify-center text-sm font-black text-slate-700">
                                  {member.avatar_url ? (
                                    <img src={member.avatar_url} className="w-full h-full object-cover" />
                                  ) : (
                                    member.first_name?.[0] || 'M'
                                  )}
                                </div>
                                {unreadCount > 0 && (
                                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff4d00] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow">
                                    {unreadCount}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                  {member.first_name} {member.last_name}
                                </p>
                                <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                                  {unreadCount > 0
                                    ? `${unreadCount} new ${unreadCount === 1 ? 'message' : 'messages'}`
                                    : `${member.status_emoji || '👋🏾'} ${member.status_text || 'Tap to message'}`}
                                </p>
                              </div>
                            </div>

                            <span className="text-[11px] font-bold text-[#ff4d00] bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full shrink-0">
                              Chat
                            </span>
                          </button>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {/* GAMES ARCADE TAB */}
            {activeTab === 'games' && profile.is_millerite && (
              <GamesHub
                supabase={supabase}
                userId={userId}
                familyMembers={familyMembers}
                initialChessGameId={initialChessGameId}
                onClearInitialGame={() => {
                  setInitialChessGameId(null);
                  window.history.replaceState({}, '', window.location.pathname);
                }}
              />
            )}

            {/* ASSET VAULT TAB (DARK MODE) */}
            {activeTab === 'vault' && profile.is_client && (
              <div className="animate-in fade-in max-w-6xl mx-auto space-y-12">
                <div className="text-center">
                  <span className="bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-3 inline-block">
                    Digital Resources & Services
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
                    Asset <span className="text-[#ff4d00]">Vault</span>
                  </h1>
                </div>

                <div className="bg-[#131313] border border-[#ff4d00]/30 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-[0_0_40px_rgba(255,77,0,0.12)]">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d00]/10 rounded-full blur-[110px] pointer-events-none" />
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                    <div className="md:col-span-5 flex justify-center items-center py-4">
                      <img src="https://pub-251ee1b2d0ef473aa21849e9f5d1bfae.r2.dev/Rise%20%26%20Render%20Content%20Kit%20Image.jpg" alt="Kit Cover" className="w-48 sm:w-56 rounded-r-md border border-white/20 shadow-2xl" />
                    </div>
                    <div className="md:col-span-7 space-y-4 text-left">
                      <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-tight">The Content Creator Studio Kit</h2>
                      <p className="text-white/70 text-sm leading-relaxed">A proven, no-guesswork at-home studio setup.</p>
                      <a href="https://pub-251ee1b2d0ef473aa21849e9f5d1bfae.r2.dev/The%20Content%20Creator%20Studio%20Kit%20(1).pdf" target="_blank" rel="noopener noreferrer" className="inline-flex bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl text-xs items-center gap-2">
                        <BookOpen size={16} /> Open Guide
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BLUEPRINT TAB */}
            {activeTab === 'blueprint' && profile.is_client && blueprint && (
              <div className="animate-in fade-in max-w-6xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">My Studio Blueprint</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-[#131313] border border-white/5 p-6 rounded-3xl shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">Action Items</h3>
                    {blueprint.gear_list?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 mb-3 cursor-pointer" onClick={() => toggleGearItem(index)}>
                        <input type="checkbox" checked={item.checked} readOnly className="w-5 h-5 accent-[#ff4d00]" />
                        <span className={`text-sm ${item.checked ? 'text-white/40 line-through' : 'text-white'}`}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 rounded-3xl flex flex-col justify-center items-center text-center shadow-xl min-h-[250px]">
                    <Video size={40} className="text-[#ff4d00] mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Consultation Recording</h3>
                    {blueprint.video_url ? (
                      <a href={blueprint.video_url} target="_blank" rel="noopener noreferrer" className="bg-[#ff4d00] hover:bg-orange-500 text-black text-sm font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-colors w-full">Watch Replay</a>
                    ) : (
                      <button disabled className="bg-white/5 text-white/30 text-sm font-bold py-3 px-6 rounded-xl border border-white/10 w-full">Processing...</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* RETAINER TAB */}
            {activeTab === 'retainer' && profile.is_client && profile.has_retainer && (
              <div className="animate-in fade-in">
                <RetainerDashboard userId={userId} supabase={supabase} />
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in duration-500 max-w-4xl mx-auto relative z-10 space-y-6">
                <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} className="w-24 h-24 rounded-3xl object-cover border border-slate-200 shadow-md" />
                    ) : (
                      <div className="w-24 h-24 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl font-black text-slate-400">
                        {profile.first_name?.[0] || 'M'}
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] rounded-3xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera size={22} className="text-white" />
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="inline-flex items-center gap-1.5 bg-slate-900/5 border border-slate-900/10 text-slate-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                      <Sparkles size={11} className="text-[#ff4d00]" /> Account Settings
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                      {profile.first_name || 'Your'} {profile.last_name || 'Profile'}
                    </h1>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                      Tap your photo to update your profile picture.
                    </p>
                    {isUploadingAvatar && (
                      <span className="text-[#ff4d00] text-[10px] font-extrabold uppercase tracking-widest animate-pulse block mt-1">
                        Uploading photo...
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white/85 backdrop-blur-2xl border border-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                        <input
                          type="text"
                          value={profile.first_name}
                          onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                          className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                        <input
                          type="text"
                          value={profile.last_name}
                          onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                          className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                        />
                      </div>

                      {profile.is_client && (
                        <>
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                            <input
                              type="text"
                              value={profile.username}
                              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                              className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Instagram</label>
                            <input
                              type="text"
                              value={profile.instagram_handle}
                              onChange={(e) => setProfile({ ...profile, instagram_handle: e.target.value })}
                              className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                            />
                          </div>
                        </>
                      )}

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-extrabold text-[#ff4d00] uppercase tracking-widest mb-1.5 ml-1">Favorite Bible Verse</label>
                        <input
                          type="text"
                          value={profile.bible_verse}
                          onChange={(e) => setProfile({ ...profile, bible_verse: e.target.value })}
                          placeholder="e.g. Joshua 24:15"
                          className="w-full bg-amber-50/60 border border-amber-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-400 transition-all"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Short Bio</label>
                        <textarea
                          rows={3}
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          placeholder="Tell the family a little about yourself..."
                          className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="bg-[#1C1C2E] hover:bg-slate-800 text-white font-bold px-7 py-3.5 rounded-2xl text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition-all disabled:opacity-50"
                    >
                      <Save size={15} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>
                </div>

                <div className="bg-white/85 backdrop-blur-2xl border border-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h3 className="text-slate-900 font-black uppercase tracking-wider text-xs mb-1 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#ff4d00]">
                      <Lock size={14} />
                    </span>
                    Account Security
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mb-5 ml-9">
                    Update your password anytime to keep your account secure.
                  </p>
                  <form onSubmit={handleUpdatePassword} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 bg-slate-100/90 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingPassword || !newPassword}
                      className="bg-[#1C1C2E] hover:bg-slate-800 text-white font-bold px-7 py-3 rounded-2xl text-xs tracking-wide flex items-center justify-center transition-all disabled:opacity-40 shrink-0 shadow-sm"
                    >
                      {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* FLOATING GLASS MOBILE BOTTOM NAVIGATION (Shrunken Centered Pill, Auto-Hides on Scroll) */}
      <nav
        className={`md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-fit max-w-[calc(100%-2rem)] z-30 rounded-full backdrop-blur-2xl border flex items-center gap-1 px-2 py-1.5 transition-all duration-500 ease-out ${
          isScrolling
            ? 'opacity-0 translate-y-6 pointer-events-none'
            : 'opacity-100 translate-y-0'
        } ${
          isLightMode
            ? 'bg-white/80 border-white/95 shadow-[0_12px_35px_rgba(28,28,46,0.14)]'
            : 'bg-[#141414]/85 border-white/15 shadow-[0_12px_35px_rgba(0,0,0,0.6)]'
        }`}
      >
        {profile.is_client && (
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'vault'
                ? 'text-[#ff4d00] bg-[#ff4d00]/10'
                : isLightMode
                ? 'text-slate-400 hover:text-slate-700'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <FolderDown size={18} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Vault</span>
          </button>
        )}
        {profile.is_millerite && (
          <button
            onClick={() => { setActiveTab('millerites'); setViewingMember(null); }}
            className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'millerites' || activeTab === 'member_view'
                ? isLightMode
                  ? 'text-white bg-[#1C1C2E] shadow-sm'
                  : 'text-[#ff4d00] bg-[#ff4d00]/10'
                : isLightMode
                ? 'text-slate-400 hover:text-slate-700'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Users size={18} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Family</span>
          </button>
        )}
        {profile.is_millerite && (
          <button
            onClick={() => setActiveTab('dms')}
            className={`relative flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'dms'
                ? isLightMode
                  ? 'text-white bg-[#1C1C2E] shadow-sm'
                  : 'text-[#ff4d00] bg-[#ff4d00]/10'
                : isLightMode
                ? 'text-slate-400 hover:text-slate-700'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <MessageCircle size={18} />
            <span className="text-[9px] uppercase font-bold tracking-wider">DMs</span>
            {totalUnreadDms > 0 && (
              <span className="absolute top-0.5 right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-[#ff4d00] text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                {totalUnreadDms}
              </span>
            )}
          </button>
        )}
        {profile.is_millerite && (
          <button
            onClick={() => setActiveTab('games')}
            className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'games'
                ? isLightMode
                  ? 'text-white bg-[#1C1C2E] shadow-sm'
                  : 'text-[#ff4d00] bg-[#ff4d00]/10'
                : isLightMode
                ? 'text-slate-400 hover:text-slate-700'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Gamepad2 size={18} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Games</span>
          </button>
        )}
        {profile.is_client && blueprint && (
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'blueprint'
                ? 'text-[#ff4d00] bg-[#ff4d00]/10'
                : isLightMode
                ? 'text-slate-400 hover:text-slate-700'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Blueprint</span>
          </button>
        )}
        {profile.is_client && profile.has_retainer && (
          <button
            onClick={() => setActiveTab('retainer')}
            className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'retainer'
                ? 'text-[#ff4d00] bg-[#ff4d00]/10'
                : isLightMode
                ? 'text-slate-400 hover:text-slate-700'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Film size={18} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Retainer</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all ${
            activeTab === 'profile'
              ? isLightMode
                ? 'text-white bg-[#1C1C2E] shadow-sm'
                : 'text-[#ff4d00] bg-[#ff4d00]/10'
              : isLightMode
              ? 'text-slate-400 hover:text-slate-700'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <User size={18} />
          <span className="text-[9px] uppercase font-bold tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
}
