import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Clock, AlertCircle } from 'lucide-react';

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
  projectId, projectTitle, videoUrl, userId, userName, isAdmin, supabase, onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isDemo = projectId.includes('demo');

  useEffect(() => {
    if (isDemo) return;

    fetchComments();

    const channel = supabase
      .channel(`video_review_${projectId}`)
      .on('postgres_changes', { 
        event: 'INSERT', schema: 'public', table: 'video_comments', filter: `project_id=eq.${projectId}` 
      }, (payload: any) => {
        setComments(prev => [...prev, payload.new].sort((a, b) => a.timestamp - b.timestamp));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('video_comments')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: true });
    if (data) setComments(data);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !videoRef.current) return;

    if (isDemo) {
      setErrorMsg("Cannot save comments to a demo project.");
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    
    videoRef.current.pause();
    setIsSending(true);
    const timeToSave = videoRef.current.currentTime;

    try {
      const { error } = await supabase.from('video_comments').insert([{
        project_id: projectId,
        user_id: userId,
        user_name: userName,
        is_admin: isAdmin,
        timestamp: timeToSave,
        text: newComment.trim()
      }]);
      
      if (error) throw error;
      setNewComment('');
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setErrorMsg("Failed to save comment.");
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsSending(false);
    }
  };

  // Seamless UX: Click video to play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col md:flex-row overflow-hidden font-sans text-white">
      
      {/* VIDEO PLAYER AREA */}
      <div className="w-full md:flex-1 h-[55vh] md:h-full flex flex-col relative bg-black/50 shrink-0">
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <span className="bg-[#ff4d00] text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-2 inline-block shadow-[0_0_15px_rgba(255,77,0,0.4)]">
              Review Room
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight drop-shadow-md line-clamp-1">{projectTitle}</h2>
          </div>
          <button onClick={onClose} className="pointer-events-auto p-2 md:p-2.5 bg-white/10 hover:bg-[#ff4d00] hover:text-black rounded-full transition-all backdrop-blur-md shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Seamless container: ensures aspect ratio won't collapse on bad loads */}
        <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-4 md:p-8 md:pt-24 md:pb-12 w-full h-full relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#ff4d00]/10 blur-[100px] pointer-events-none" />
          
          <div 
            onClick={togglePlay}
            className="relative w-full max-w-4xl h-full flex items-center justify-center rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#0a0a0a] cursor-pointer min-h-[250px]"
          >
            <video 
              ref={videoRef}
              src={videoUrl} 
              controls
              playsInline
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              className="w-auto h-auto max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* COMMENTS PANEL */}
      <div className="w-full md:w-[400px] bg-[#0d0d0d] border-t md:border-t-0 md:border-l border-white/5 flex flex-col shrink-0 h-[45vh] md:h-full z-20 shadow-2xl">
        <div className="p-4 md:p-6 border-b border-white/5 bg-[#111]">
          <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
            <Clock size={16} className="text-[#ff4d00]" /> Revision Notes
          </h3>
        </div>

        {errorMsg && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-500 text-xs">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {isDemo ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
              <AlertCircle size={24} className="text-[#ff4d00] mx-auto mb-2" />
              <p className="text-white/70 text-xs font-medium">You are viewing a Demo Project.</p>
              <p className="text-white/40 text-[10px] mt-2">Comments cannot be saved. To test commenting, link a real project.</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-30 mt-6 md:mt-10">
              <Clock size={32} className="mb-3" />
              <p className="text-sm font-bold uppercase tracking-widest">No notes yet</p>
              <p className="text-[10px] mt-2 max-w-[200px]">Play the video and drop a comment to mark a timestamp.</p>
            </div>
          ) : (
            comments.map(comment => (
              <div 
                key={comment.id} 
                onClick={() => jumpToTime(comment.timestamp)}
                className="bg-black border border-white/5 p-4 rounded-xl hover:border-[#ff4d00]/40 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(255,77,0,0.1)] group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ff4d00] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-2 pl-2">
                  <span className="text-xs font-bold text-white">
                    {comment.is_admin ? <span className="text-[#ff4d00]">Rise & Render Team</span> : comment.user_name}
                  </span>
                  <span className="bg-white/5 text-white/50 text-[10px] font-black px-2 py-1 rounded group-hover:bg-[#ff4d00] group-hover:text-black transition-colors">
                    {formatTime(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-white/70 pl-2 leading-relaxed">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 md:p-5 bg-[#111] border-t border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-2 md:mb-3 px-1">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Marking Time:</span>
            <span className="text-xs font-black text-[#ff4d00] bg-[#ff4d00]/10 px-2 py-0.5 rounded border border-[#ff4d00]/20">{formatTime(currentTime)}</span>
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a note at this frame..."
              className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 md:py-3.5 text-xs focus:outline-none focus:border-[#ff4d00] text-white transition-colors placeholder:text-white/20"
            />
            <button 
              type="submit" 
              disabled={!newComment.trim() || isSending}
              className="bg-[#ff4d00] disabled:bg-white/5 disabled:text-white/20 text-black px-4 md:px-5 rounded-xl font-bold flex items-center justify-center transition-all hover:bg-orange-500 shadow-lg shadow-[#ff4d00]/20 disabled:shadow-none"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoReviewRoom;
