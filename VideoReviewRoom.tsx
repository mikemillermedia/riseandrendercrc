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
  
  // Current logged-in user profile
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSessionAndComments = async () => {
      if (!supabase) return;      
      
      // Get current logged-in user profile
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) setCurrentUserProfile(profile);
      }
      
      fetchComments();
    };

    fetchSessionAndComments();

    if (!supabase) return;
    const channel = supabase.channel(`review_${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'video_comments', filter: `project_id=eq.${projectId}` }, () => {
        fetchComments();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, supabase]);

  const fetchComments = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('video_comments')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: true });
    
    if (error) console.error("Error fetching comments:", error);
    if (data) {
      setComments(data);
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === null) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (time: number) => {
    if (videoRef.current && time !== null) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !supabase) return;

    setIsSubmitting(true);
    const time = videoRef.current ? videoRef.current.currentTime : 0;
    
    // Resolve Author Name & Avatar
    let finalName = currentUserProfile?.display_name 
      || `${currentUserProfile?.first_name || ''} ${currentUserProfile?.last_name || ''}`.trim()
      || currentUserProfile?.username 
      || (isAdmin ? 'Rise & Render Team' : 'Client');

    let finalAvatar = currentUserProfile?.avatar_url || '';

    try {
      const { error } = await supabase.from('video_comments').insert([{
        project_id: projectId,
        text: newComment.trim(),
        timestamp: time,
        author: finalName,
        author_avatar: finalAvatar,
        is_admin: isAdmin,
        is_resolved: false
      }]);
      
      if (error) {
        alert(`Database Error: ${error.message}`);
        throw error;
      }
      
      setNewComment('');
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleResolve = async (commentId: string, currentStatus: boolean) => {
    if (!isAdmin || !supabase) return;
    const { error } = await supabase.from('video_comments').update({ is_resolved: !currentStatus }).eq('id', commentId);
    if (error) alert(`Error resolving comment: ${error.message}`);
  };

  const getInitial = (name?: string) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-black/95 backdrop-blur-sm font-sans overflow-hidden">
      
      {/* TOP / LEFT: VIDEO PLAYER CONTAINER */}
      <div className="w-full md:flex-1 h-[42vh] md:h-full flex flex-col relative bg-[#050505] shrink-0 border-b md:border-b-0 border-white/10">
        
        {/* Header Bar */}
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
          <div className="flex items-center gap-3 truncate pr-2">
            <span className="bg-[#ff4d00] text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-lg shrink-0">
              Review Room
            </span>
            <h2 className="text-white font-black text-sm md:text-xl tracking-wide truncate">{projectTitle}</h2>
          </div>

          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Video Player */}
        <div className="flex-1 flex items-center justify-center p-2 md:p-6 pt-14 md:pt-20 pb-4 md:pb-10">
          <video 
            ref={videoRef}
            src={videoUrl}
            controls
            className="max-h-full max-w-full rounded-xl md:rounded-2xl shadow-2xl border border-white/10 object-contain"
            controlsList="nodownload"
          />
        </div>
      </div>

      {/* BOTTOM / RIGHT: REVISION NOTES SIDEBAR */}
      <motion.div 
        initial={{ y: '100%', opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: '100%', opacity: 0 }} 
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full md:w-[420px] flex-1 md:h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col shrink-0 shadow-2xl z-20 relative overflow-hidden"
      >
        {/* Sidebar Header */}
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-[#111] shrink-0">
          <h3 className="font-black text-white uppercase tracking-widest text-xs md:text-sm flex items-center gap-2">
            <Clock size={16} className="text-[#ff4d00]" /> Revision Notes ({comments.length})
          </h3>
          <button onClick={onClose} className="hidden md:flex bg-white/5 hover:bg-white/10 text-white/50 hover:text-white p-2 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d0d0d]">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-6">
              <MessageSquare size={32} className="mb-3 text-[#ff4d00]" />
              <p className="text-xs font-bold uppercase tracking-widest text-white">No Notes Yet</p>
              <p className="text-[11px] text-white/70 mt-1">Play the video and drop a comment below to leave a timestamped revision note.</p>
            </div>
          ) : (
            comments.map(comment => (
              <div 
                key={comment.id} 
                className={`p-3.5 md:p-4 rounded-xl border transition-all ${
                  comment.is_resolved 
                    ? 'opacity-40 grayscale border-white/5 bg-black/40' 
                    : comment.is_admin 
                      ? 'border-[#ff4d00]/30 bg-[#ff4d00]/10' 
                      : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  
                  {/* Author Avatar & Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    {comment.author_avatar ? (
                      <img src={comment.author_avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
                        {getInitial(comment.author)}
                      </div>
                    )}
                    <span className={`text-[11px] font-black uppercase tracking-wider truncate ${
                      comment.is_admin ? 'text-[#ff4d00]' : 'text-white'
                    }`}>
                      {comment.author || 'User'}
                    </span>
                  </div>

                  {/* Timestamp Button & Admin Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => handleSeek(comment.timestamp || 0)} 
                      className={`px-2 py-1 rounded text-[10px] font-black shadow transition-all hover:scale-105 flex items-center gap-1 ${
                        comment.is_admin ? 'bg-[#ff4d00] text-black' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <PlayCircle size={10} /> {formatTime(comment.timestamp || 0)}
                    </button>

                    {isAdmin && (
                      <button 
                        onClick={() => toggleResolve(comment.id, comment.is_resolved)} 
                        className={`p-1.5 rounded transition-colors ${
                          comment.is_resolved 
                            ? 'bg-white/10 text-white/50 hover:bg-white/20' 
                            : 'bg-green-500 text-black hover:bg-green-400 shadow'
                        }`}
                        title={comment.is_resolved ? "Mark Unresolved" : "Mark Resolved"}
                      >
                        <CheckCircle2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                
                <p className={`text-xs pl-8 leading-relaxed break-words ${comment.is_resolved ? 'line-through text-white/30' : 'text-white/80'}`}>
                  {comment.text}
                </p>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="p-3 md:p-4 border-t border-white/10 bg-[#111] shrink-0">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder="Drop a revision note..." 
              className="w-full bg-black border border-white/10 rounded-xl pl-4 pr-12 py-3 text-xs text-white focus:outline-none focus:border-[#ff4d00] transition-colors shadow-inner" 
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()} 
              className="absolute right-2 p-2 bg-[#ff4d00] text-black rounded-lg disabled:opacity-40 hover:bg-orange-500 transition-colors"
            >
              <Send size={13} />
            </button>
          </div>
          <p className="text-[9px] text-white/30 uppercase tracking-widest text-center mt-2 font-bold">
            Note timestamps to {formatTime(videoRef.current?.currentTime || 0)}
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default VideoReviewRoom;
