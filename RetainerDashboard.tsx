import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, PlayCircle, CheckCircle2, MessageSquare, 
  Film, Smartphone, Link as LinkIcon, Download, Send, X, ShieldCheck, FolderOpen, User
} from 'lucide-react';
import VideoReviewRoom from './VideoReviewRoom';

interface RetainerDashboardProps {
  userId: string | null;
  supabase: any;
}

const RetainerDashboard: React.FC<RetainerDashboardProps> = ({ userId, supabase }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [projectComments, setProjectComments] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Link Submission State
  const [driveLink, setDriveLink] = useState('');
  const [driveTitle, setDriveTitle] = useState('');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // Client Direct Line State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [activeReviewProject, setActiveReviewProject] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [userId, supabase]);

  // Real-time Chat & Comment Subscriptions
  useEffect(() => {
    if (!supabase || !userId) return;

    const commentChannel = supabase.channel(`client_comments_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'video_comments' }, () => {
        fetchData();
      }).subscribe();

    if (isChatOpen) {
      fetchMessages();
      const chatChannel = supabase.channel(`chat_${userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'retainer_messages', filter: `user_id=eq.${userId}` }, (payload: any) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }).subscribe();
      return () => { 
        supabase.removeChannel(chatChannel); 
        supabase.removeChannel(commentChannel);
      };
    }

    return () => { supabase.removeChannel(commentChannel); };
  }, [isChatOpen, userId, supabase]);

  const scrollToBottom = () => setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const fetchData = async () => {
    if (!supabase || !userId) return;
    try {
      const [projRes, assetRes, profileRes] = await Promise.all([
        supabase.from('retainer_projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('retainer_assets').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', userId).single()
      ]);
      
      const projects = projRes.data || [];
      setProjects(projects);
      setAssets(assetRes.data || []);
      if (profileRes.data) setUserProfile(profileRes.data);

      if (projects.length > 0) {
        const projectIds = projects.map((p: any) => p.id);
        const { data: comments } = await supabase.from('video_comments').select('id, project_id, is_resolved').in('project_id', projectIds);
        setProjectComments(comments || []);
      } else {
        setProjectComments([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!supabase || !userId) return;
    const { data } = await supabase.from('retainer_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    if (data) { setMessages(data); scrollToBottom(); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase || !userId) return;
    setIsSendingMessage(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    try { await supabase.from('retainer_messages').insert([{ user_id: userId, sender_type: 'client', message: messageText }]); } 
    finally { setIsSendingMessage(false); }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLink.trim() || !supabase || !userId) return;
    setIsSubmittingLink(true);
    try {
      const { error } = await supabase.from('retainer_projects').insert([{ 
        user_id: userId, 
        title: driveTitle.trim() || "Raw Footage Folder", 
        status: "Processing", 
        type: "Raw Folder", 
        review_link: driveLink 
      }]);
      
      if (error) throw error;
      
      setDriveLink('');
      setDriveTitle('');
      await fetchData(); 
    } catch (error: any) {
      console.error("Failed to submit raw footage link:", error);
      alert(`Upload Failed: ${error.message}`);
    } finally { 
      setIsSubmittingLink(false); 
    }
  };

  const deliveryProjects = projects.filter(p => p.type === 'Raw Folder');
  const productionProjects = projects.filter(p => p.type !== 'Raw Folder');

  const horizontalDelivered = assets.filter(a => ['Horizontal Podcast', 'Long Form', 'Full Length', 'Video'].includes(a.asset_type)).length;
  const verticalDelivered = assets.filter(a => ['Vertical Reel', 'Social', 'Reel', 'Short', 'Vertical Clip'].includes(a.asset_type)).length;

  return (
    <div className="text-[#F5F5F0] font-sans relative pb-28 md:pb-12 px-4 md:px-0">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 pt-4 md:pt-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-3">
            The Content <span className="text-[#ff4d00]">Engine</span>
          </h1>
          <p className="text-white/50 text-xs md:text-sm tracking-widest uppercase font-bold">Post-Production Retainer • Active</p>
        </div>
        <button onClick={() => setIsChatOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#ff4d00] hover:bg-orange-500 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,77,0,0.2)]">
          <MessageSquare size={18} /> Direct Line
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 w-full">
          <div className="bg-[#131313] border border-dashed border-white/20 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center focus-within:border-[#ff4d00]/50 transition-colors">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#ff4d00]/10 rounded-full flex items-center justify-center mb-4"><LinkIcon size={28} className="text-[#ff4d00]" /></div>
            <h3 className="font-black uppercase tracking-widest text-white mb-2 text-sm md:text-base">Link Raw Footage</h3>
            <p className="text-xs text-white/50 mb-6">Paste your Google Drive or Dropbox folder link below to sync.</p>
            <form onSubmit={handleLinkSubmit} className="w-full flex flex-col gap-3">
              <input 
                type="text" 
                value={driveTitle} 
                onChange={(e) => setDriveTitle(e.target.value)} 
                placeholder="Folder Title (e.g. EP 30 Raw)" 
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#ff4d00] text-white placeholder:text-white/30" 
              />
              <input 
                type="url" 
                required 
                value={driveLink} 
                onChange={(e) => setDriveLink(e.target.value)} 
                placeholder="https://drive.google.com/..." 
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#ff4d00] text-white placeholder:text-white/30" 
              />
              <button type="submit" disabled={isSubmittingLink || !driveLink.trim()} className="w-full bg-white text-black font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-50 text-xs mt-1">
                {isSubmittingLink ? 'Syncing...' : 'Submit Link'}
              </button>
            </form>
          </div>

          <div className="bg-[#131313] border border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="font-black uppercase tracking-widest text-white mb-6 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" /> Delivered Assets
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/50 p-4 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Horizontal Podcasts</span>
                <span className="text-lg font-black text-green-500">{horizontalDelivered}</span>
              </div>
              <div className="flex justify-between items-center bg-black/50 p-4 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Vertical Reels / Shorts</span>
                <span className="text-lg font-black text-green-500">{verticalDelivered}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="lg:col-span-2 w-full space-y-8">
          
          {/* STAGE 1: DELIVERY */}
          <div className="bg-[#131313] border border-white/5 rounded-3xl p-5 md:p-8 shadow-xl">
            <h2 className="font-black uppercase tracking-widest text-white mb-6 text-lg md:text-xl flex items-center gap-2">
              <UploadCloud size={20} className="text-white/40" /> Stage 1: Delivery
            </h2>
            {isLoading ? <p className="text-white/40 text-sm animate-pulse">Loading...</p> : deliveryProjects.length === 0 ? (
               <p className="text-white/40 text-sm">No raw footage folders active.</p>
            ) : (
              <div className="space-y-4">
                {deliveryProjects.map((project) => (
                  <div key={project.id} className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <FolderOpen size={18} className="text-white/50" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-xs md:text-sm line-clamp-1">{project.title}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Raw Footage</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto pt-2 md:pt-0 border-t border-white/5 md:border-none">
                      <div className="flex items-center gap-2">
                        {project.status === "Processing" && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>}
                        <span className="text-xs font-bold uppercase tracking-widest text-white/50">{project.status}</span>
                      </div>
                      <a 
                        href={project.review_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-white text-black font-black uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-all shrink-0 cursor-pointer shadow-lg"
                      >
                        <LinkIcon size={14} /> Open Folder
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STAGE 2: IN PRODUCTION */}
          <div className="bg-[#131313] border border-white/5 rounded-3xl p-5 md:p-8 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d00]/5 rounded-full blur-[100px] pointer-events-none" />
            <h2 className="font-black uppercase tracking-widest text-white mb-6 text-lg md:text-xl flex items-center gap-2 relative z-10">
              <PlayCircle size={20} className="text-[#ff4d00]" /> Stage 2: In Production
            </h2>
            {isLoading ? <p className="text-white/40 text-sm animate-pulse relative z-10">Loading...</p> : productionProjects.length === 0 ? (
               <p className="text-white/40 text-sm relative z-10">No videos currently in production or under review.</p>
            ) : (
              <div className="space-y-4 relative z-10">
                {productionProjects.map((project) => {
                  const unresolvedCount = projectComments.filter(c => c.project_id === project.id && !c.is_resolved).length;
                  return (
                    <div key={project.id} className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#ff4d00]/30 transition-colors">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                          {['Vertical Clip', 'Reel', 'Short', 'Social'].includes(project.type) ? (
                            <Smartphone size={18} className="text-[#ff4d00]" />
                          ) : (
                            <Film size={18} className="text-[#ff4d00]" />
                          )}
                          {unresolvedCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg ring-2 ring-[#131313]">
                              {unresolvedCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-xs md:text-sm line-clamp-1">{project.title}</h4>
                          <p className="text-[10px] text-[#ff4d00] uppercase tracking-widest font-bold mt-1">{project.type}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto pt-2 md:pt-0 border-t border-white/5 md:border-none">
                        <div className="flex items-center gap-2">
                          {project.status === "Review" && <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse"></span>}
                          <span className="text-xs font-bold uppercase tracking-widest text-white/50">{project.status}</span>
                        </div>
                        <button 
                          onClick={() => {
                            if (!project.review_link) {
                              alert("No video URL linked to this project!");
                              return;
                            }
                            setActiveReviewProject(project);
                          }}
                          className="text-xs bg-[#ff4d00] text-black font-black uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-orange-500 transition-all shrink-0 cursor-pointer shadow-lg shadow-[#ff4d00]/20"
                        >
                          <PlayCircle size={14} /> Review Room
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* STAGE 3: FINAL VIDEOS */}
          <div className="bg-[#131313] border border-white/5 rounded-3xl p-5 md:p-8 shadow-xl">
            <h2 className="font-black uppercase tracking-widest text-white mb-6 text-lg md:text-xl flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-500" /> Stage 3: Final Videos
            </h2>
            {isLoading ? <p className="text-white/40 text-sm animate-pulse">Loading vault...</p> : assets.length === 0 ? (
               <p className="text-white/40 text-sm">No completed assets yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assets.map(asset => (
                  <div key={asset.id} className="bg-black/50 border border-white/5 rounded-2xl p-5 hover:border-green-500/30 transition-colors group flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-white/50 group-hover:text-green-500 transition-colors">
                        {['Vertical Reel', 'Social', 'Reel', 'Short'].includes(asset.asset_type) ? <Smartphone size={18} /> : <Film size={18} />}
                      </div>
                      <a href={asset.download_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors border border-white/5" title="Download Asset"><Download size={16} /></a>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-2 line-clamp-1">{asset.title}</h4>
                      <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        <span className="flex items-center gap-1 text-green-500"><CheckCircle2 size={12} /> Delivered</span>
                        <span>{asset.asset_type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CLIENT DIRECT LINE CHAT DRAWER */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0d0d0d] border-l border-white/10 z-50 flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#131313]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ff4d00]/10 border border-[#ff4d00]/30 flex items-center justify-center text-[#ff4d00] shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-wider text-sm">Direct Line Support</h3>
                    <p className="text-[10px] text-[#ff4d00] font-bold uppercase tracking-widest">Rise & Render Bay</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <MessageSquare size={36} className="text-white/20 mb-3" />
                    <p className="text-white/60 text-sm font-bold mb-1">Direct Line Active</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2.5 ${msg.sender_type === 'admin' ? 'justify-start' : 'justify-end'}`}>
                      {/* ADMIN AVATAR */}
                      {msg.sender_type === 'admin' && (
                        <div className="w-7 h-7 rounded-full bg-[#ff4d00]/20 border border-[#ff4d00]/50 flex items-center justify-center text-[#ff4d00] shrink-0 text-[10px] font-black uppercase">
                          R
                        </div>
                      )}

                      {/* MESSAGE BUBBLE */}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${msg.sender_type === 'admin' ? 'bg-white/10 text-white rounded-bl-none border border-white/10' : 'bg-[#ff4d00] text-black font-medium rounded-br-none'}`}>
                        {msg.message}
                      </div>

                      {/* CLIENT AVATAR FROM PROFILE */}
                      {msg.sender_type !== 'admin' && (
                        userProfile?.avatar_url ? (
                          <img src={userProfile.avatar_url} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-white/20 shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 text-[10px] font-bold uppercase">
                            {userProfile?.first_name ? userProfile.first_name[0] : <User size={12} />}
                          </div>
                        )
                      )}
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#131313] flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#ff4d00] text-white" />
                <button type="submit" disabled={!newMessage.trim() || isSendingMessage} className="bg-[#ff4d00] text-black p-3 rounded-xl disabled:opacity-50 font-bold"><Send size={16} /></button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeReviewProject && (
          <VideoReviewRoom 
            projectId={activeReviewProject.id}
            projectTitle={activeReviewProject.title}
            videoUrl={activeReviewProject.review_link}
            userId={userId || 'client-id'}
            userName="Client" 
            isAdmin={false}
            supabase={supabase}
            onClose={() => setActiveReviewProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RetainerDashboard;
