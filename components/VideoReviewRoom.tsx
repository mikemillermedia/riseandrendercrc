import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Clock } from 'lucide-react';

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

  // Fetch existing comments & subscribe to real-time new ones
  useEffect(() => {
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
    const { data, error } = await supabase
      .from('video_comments')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: true });
    
    if (data) setComments(data);
  };

  // Keep track of the video time
  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Jump video to a specific comment's timestamp
  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  // Submit a new time-coded comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !videoRef.current) return;
    
    // Auto-pause video when they leave a comment
    videoRef.current.pause();
    
    setIsSending(true);
    const timeToSave = videoRef.current.currentTime;

    try {
      await supabase.from('video_comments').insert([{
        project_id: projectId,
        user_id: userId,
        user_name: userName,
        is_admin: isAdmin,
        timestamp: timeToSave,
        text: newComment.trim()
      }]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row overflow-hidden font-sans text-white">
      
      {/* LEFT: VIDEO PLAYER AREA */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div>
            <span className="bg-[#ff4d00] text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mb-2 inline-block">Review Room</span>
            <h2 className="text-xl font-bold">{projectTitle}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-red-500 rounded-full transition-colors backdrop-blur-md">
            <X size={20} />
          </button>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center p-4 md:p-12">
          <video 
            ref={videoRef}
            src={videoUrl} 
            controls 
            onTimeUpdate={handleTimeUpdate}
            className="w-full max-h-full rounded-xl shadow-2xl ring-1 ring-white/10 bg-black"
          />
        </div>
      </div>

      {/* RIGHT: TIME-CODED COMMENTS PANEL */}
      <div className="w-full md:w-96 bg-[#111] border-l border-white/10 flex flex-col shrink-0 h-[50vh] md:h-full">
        <div className="p-5 border-b border-white/10 bg-[#131313]">
          <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
            <Clock size={16} className="text-[#ff4d00]" /> Revision Notes
          </h3>
        </div>

        {/* Comments Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {comments.length === 0 ? (
            <p className="text-white/30 text-xs italic text-center mt-10">No notes yet. Play the video and drop a comment to mark a timestamp!</p>
          ) : (
            comments.map(comment => (
              <div 
                key={comment.id} 
                onClick={() => jumpToTime(comment.timestamp)}
                className="bg-black border border-white/5 p-4 rounded-xl hover:border-[#ff4d00]/50 cursor-pointer transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-white/70">
                    {comment.is_admin ? <span className="text-[#ff4d00]">Rise & Render Team</span> : comment.user_name}
                  </span>
                  <span className="bg-[#ff4d00]/10 text-[#ff4d00] text-[10px] font-black px-2 py-0.5 rounded border border-[#ff4d00]/20 group-hover:bg-[#ff4d00] group-hover:text-black transition-colors">
                    {formatTime(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-white/90">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#131313] border-t border-white/10">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Mark Time:</span>
            <span className="text-xs font-bold text-[#ff4d00] bg-[#ff4d00]/10 px-2 rounded">{formatTime(currentTime)}</span>
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a note at this frame..."
              className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#ff4d00] text-white"
            />
            <button 
              type="submit" 
              disabled={!newComment.trim() || isSending}
              className="bg-[#ff4d00] disabled:bg-white/10 disabled:text-white/30 text-black px-4 rounded-xl font-bold flex items-center justify-center transition-colors"
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
