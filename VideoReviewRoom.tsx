import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Clock, Send, MessageSquare, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoReviewRoomProps {
  projectId: string;
  projectTitle: string;
  videoUrl: string;
  userId: string; 
  userName: string;
  isAdmin: boolean;
  supabase: any;
  onClose: () => void;
}

const VideoReviewRoom: React.FC<VideoReviewRoomProps> = ({
  projectId, projectTitle, videoUrl, isAdmin, supabase, onClose
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stores the current logged-in user's avatar & name
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Fetch the logged-in user's profile & the video comments
  useEffect(() => {
    const fetchSessionAndComments = async () => {
      // 1. Get current logged-in user profile for their avatar
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) setCurrentUserProfile(profile);
      }
      
      // 2. Fetch comments for this video
      fetchComments();
    };

    fetchSessionAndComments();

    // Subscribe to new comments in real-time
    const channel = supabase.channel(`review_${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'video_comments', filter: `project_id=eq.${projectId}` }, () => {
        fetchComments();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, supabase]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('video_comments')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: true });
    
    if (data) {
      setComments(data);
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !supabase) return;

    setIsSubmitting(true);
    const time = videoRef.current ? videoRef.current.currentTime : 0;
    
    // Determine the name and avatar to use
    let finalName = isAdmin ? 'Rise & Render Team' : 'Client';
    let finalAvatar = '';

    if (currentUserProfile) {
      finalName = currentUserProfile.display_name || currentUserProfile.first_name || finalName;
      finalAvatar = currentUserProfile.avatar_url || '';
    }

    try {
      await supabase.from('video_comments').insert([{
        project_id: projectId,
        text: newComment.trim(),
        timestamp: time,
        author: finalName,
        author_avatar: finalAvatar,
        is_admin: isAdmin,
        is_resolved: false
      }]);
      
      setNewComment('');
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleResolve = async (commentId: string, currentStatus: boolean) => {
    if (!isAdmin) return; // Only admin can check off tasks
    await supabase.from('video_comments').update({ is_resolved: !currentStatus }).eq('id', commentId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-black/95 backdrop-blur-sm font-sans">
      
      {/* LEFT SIDE: VIDEO PLAYER */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Header Bar */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <span className="bg-[#ff4d00] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-lg">Review Room</span>
            <h2 className="text-white font-black text-lg md:text-xl tracking-wide">{projectTitle}</h2>
          </div>
          {/* Close Button Mobile (Hidden on Desktop) */}
          <button onClick={onClose} className="md:hidden bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Video Container */}
        <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-10 bg-[#050505]">
          <video 
            ref={videoRef}
            src={videoUrl}
            controls
            className="max-h-full max-w-full rounded-2xl shadow-2xl border border-white/5"
            controlsList="nodownload"
          />
        </div>
      </div>

      {/* RIGHT SIDE: REVISION NOTES SIDEBAR */}
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full md:w-[400px] h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col shrink-0 shadow-2xl z-20 absolute md:relative right-0"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#111]">
          <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
            <Clock size={16} className="text-[#ff4d00]" /> Revision Notes
          </h3>
          <button onClick={onClose} className="hidden md:flex bg-white/5 hover:bg-white/10 text-white/50 hover:text-white p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Comments Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d0d0d]">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <MessageSquare size={32} className="mb-3" />
              <p className="text-sm font-bold uppercase tracking-widest">No Notes Yet</p>
              <p className="text-xs mt-1">Play the video and drop a comment to leave a timestamped note.</p>
            </div>
          ) : (
            comments.map(comment => (
              <div 
                key={comment.id} 
                className={`p-4 rounded-xl border transition-all ${comment.is_resolved ? 'opacity-50 grayscale border-white/5 bg-black/50' : comment.is_admin ? 'border-[#ff4d00]/20 bg-[#ff4d00]/5' : 'border-green-500/20 bg-green-500/5'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-2.5">
                    {comment.author_avatar ? (
                      <img src={comment.author_avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {comment.author.charAt(0)}
                      </div>
                    )}
                    <span className={`text-[11px] font-black uppercase tracking-wider ${comment.is_admin ? 'text-[#ff4d00]' : 'text-green-500'}`}>
                      {comment.author}
                    </span>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => handleSeek(comment.timestamp)} 
                      className={`px-2 py-1 rounded text-[10px] font-black shadow transition-opacity hover:opacity-80 flex items-center gap-1 ${comment.is_admin ? 'bg-[#ff4d00]/20 text-[#ff4d00]' : 'bg-green-500/20 text-green-500'}`}
                    >
                      <PlayCircle size={10} /> {formatTime(comment.timestamp)}
                    </button>
                    
                    <button className="p-1 rounded bg-white/5 text-white/40 hover:text-white transition-colors" title="Reply">
                      <MessageSquare size={12} />
                    </button>

                    {isAdmin && (
                      <button 
                        onClick={() => toggleResolve(comment.id, comment.is_resolved)} 
                        className={`p-1 rounded transition-colors ${comment.is_resolved ? 'bg-white/10 text-white/50 hover:bg-white/20' : 'bg-green-500 text-black hover:bg-green-400'}`}
                        title="Mark Resolved"
                      >
                        <CheckCircle2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                
                <p className={`text-xs pl-8 leading-relaxed ${comment.is_resolved ? 'line-through text-white/30' : 'text-white/80'}`}>
                  {comment.text}
                </p>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment Input Form */}
        <form onSubmit={handleAddComment} className="p-4 border-t border-white/10 bg-[#111]">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder="Drop a note here..." 
              className="w-full bg-black border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-xs text-white focus:outline-none focus:border-[#ff4d00] transition-colors shadow-inner" 
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()} 
              className="absolute right-2 p-2 bg-[#ff4d00] text-black rounded-lg disabled:opacity-50 hover:bg-orange-500 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-[9px] text-white/30 uppercase tracking-widest text-center mt-3 font-bold">
            Note will automatically timestamp to {formatTime(videoRef.current?.currentTime || 0)}
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default VideoReviewRoom;
