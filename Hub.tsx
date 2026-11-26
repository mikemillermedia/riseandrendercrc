import React, { useState, useEffect, useRef } from 'react';
import InstallAppBanner from './InstallAppBanner';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, LogOut, Video, LayoutDashboard, FolderDown, Lock, 
  User, Film, Camera, Save, Users, MessageSquare, Heart, Send, 
  BookHeart, MoreVertical, Edit2, Trash2, Repeat, Image as ImageIcon, Grid, X, BookOpen, Sparkles, CheckCircle2, ListTodo, Plus, CheckSquare, Square, Smile, CalendarHeart, AtSign
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

const POST_REACTIONS = ['❤️', '😂', '🙌🏾', '🙏🏾', '🔥'];

const MILESTONE_TYPES = [
  { label: 'Birthday', emoji: '🎂', annual: true },
  { label: 'Anniversary', emoji: '💍', annual: true },
  { label: 'Trip / Holiday', emoji: '✈️', annual: false },
  { label: 'Family Dinner', emoji: '🍽️', annual: false }
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

  // FAMILY MILESTONES & COUNTDOWN STATE
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isAddingMilestoneFormOpen, setIsAddingMilestoneFormOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneCategory, setMilestoneCategory] = useState('Birthday');
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);

  // TIMELINE, PRAYER & TASKS STATE
  const [posts, setPosts] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [familyTasks, setFamilyTasks] = useState<any[]>([]);
  const [prayerFilter, setPrayerFilter] = useState<'active' | 'answered'>('active');
  const [newPost, setNewPost] = useState('');
  const [newPrayer, setNewPrayer] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Gatherings & Potluck');
  const [isPosting, setIsPosting] = useState(false);
  const [isPraying, setIsPraying] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // INTERACTION & @MENTION STATE
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [expandedReactionsPostId, setExpandedReactionsPostId] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<'post' | 'reply' | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');

  // MEMBER PROFILE VIEW STATE
  const [viewingMember, setViewingMember] = useState<any | null>(null);
  const [memberPosts, setMemberPosts] = useState<any[]>([]);

  // APPLE LIGHT THEME TOGGLE FOR MILLERITES & PROFILE
  const isLightMode = activeTab === 'millerites' || activeTab === 'member_view' || activeTab === 'profile';

  // Helper to convert legacy yellow default wave to medium-brown wave
  const normalizeEmoji = (emoji?: string) => {
    if (!emoji || emoji === '👋') return '👋🏾';
    if (emoji === '🙏') return '🙏🏾';
    return emoji;
  };

  // ONESIGNAL PUSH NOTIFICATIONS HANDLER
  const handleEnableNotifications = () => {
    const OneSignalDeferred = (window as any).OneSignalDeferred || [];
    OneSignalDeferred.push(async function (OneSignal: any) {
      await OneSignal.Notifications.requestPermission();
      if (userId) {
        await OneSignal.login(userId);
      }
      alert("Notifications enabled! You'll now get alerts for new family updates.");
    });
  };

  // @MENTION HANDLERS
  const handlePostTextChange = (val
