import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, PlayCircle, CheckCircle2, MessageSquare, 
  Film, Smartphone, Clock, Link as LinkIcon, Download, Send, Image as ImageIcon, X, ShieldCheck
} from 'lucide-react';
import VideoReviewRoom from './VideoReviewRoom';

interface RetainerDashboardProps {
  userId: string | null;
  supabase: any;
}

const DEMO_PROJECTS = [
  { 
    id: '82d05483-0a15-4439-a028-fb8d3b7a3ef6', 
    title: "EP 30 - Collecting Data Reel Review", 
    status: "Review", 
    type: "Full Length", 
    review_link: "YOUR_CLOUDFLARE_MP4_LINK_HERE" 
  }
];

const DEMO_ASSETS = [
  { id: 'demo-101', title: "Ep 29: Mindset (4K Master)", asset_type: "Video", created_at: new Date().toISOString(), file_size: "4.2 GB", download_url: "#" }
];

const RetainerDashboard: React.FC<RetainerDashboardProps> = ({ userId, supabase }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'asset_vault' | 'strategy'>('pipeline');
  const [projects, setProjects] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [driveLink, setDriveLink] = useState('');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Review Room State
  const [activeReviewProject, setActiveReviewProject] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [userId, supabase]);

  useEffect(() => {
    if (!isChatOpen || !supabase || !userId) return;
    fetchMessages();
    const channel = supabase.channel(`chat_${userId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'retainer_messages', filter: `user_id=eq.${userId}` }, (payload: any) => {
        setMessages((prev) => [...prev, payload.new]);
        scrollToBottom();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isChatOpen, userId, supabase]);

  const scrollToBottom = () => setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const fetchData = async () => {
    if (!supabase || !userId) {
      setProjects(DEMO_PROJECTS);
      setAssets(DEMO_ASSETS);
      setIsLoading(false);
      return;
    }
    try {
      const [projRes, assetRes] = await Promise.all([
        supabase.from('retainer_projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('retainer_assets').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);
      
      const realProjects = projRes.data || [];
      setProjects(realProjects.length > 0 ? realProjects : DEMO_PROJECTS);
      setAssets(assetRes.data && assetRes.data.length > 0 ? assetRes.data : DEMO_ASSETS);
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
      await supabase.from('retainer_projects').insert([{ user_id: userId, title: "Raw Footage Processing", status: "Review", type: "Raw Folder", review_link: driveLink }]);
      setDriveLink('');
      await fetchData();
    } finally { setIsSubmittingLink(false); }
  };

  return (
    <div className="text-[#F5F5F0] font-sans relative pb-28 md:pb-12 px-4 md:px-0">
      <div className="max-w-6xl mx-auto mb-8 pt-4 md:pt-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
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

      <div className="max-w-6xl mx-auto flex gap-6 md:gap-8 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        {[ { id: 'pipeline', label: 'Pipeline' }, { id: 'asset_vault', label: 'Asset Vault' }, { id: 'strategy', label: 'Strategy' } ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`text-xs md:text-sm font-bold uppercase tracking-widest transition-colors shrink-0 ${activeTab === tab.id ? 'text-[#ff4d00]' : 'text-white/40 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* SIDEBAR: STACKED NORMALLY ON MOBILE, STICKY ONLY ON DESKTOP */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 w-full">
          <div className="bg-[#131313] border border-dashed border-white/20 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center focus-within:border-[#ff4d00]/50">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#ff4d00]/10 rounded-full flex items-center justify-center mb-4"><LinkIcon size={28} className="text-[#ff4d00]" /></div>
            <h3 className="font-black uppercase tracking-widest text-white mb-2 text-sm md:text-base">Link Raw Footage</h3>
            <p className="text-xs text-white/50 mb-6">Paste your Google Drive or Dropbox folder link below to sync.</p>
            <form onSubmit={handleLinkSubmit} className="w-full flex flex-col gap-3">
              <input type="url" required value={driveLink} onChange={(e) => setDriveLink(e.target.value)} placeholder="https://drive.google.com/..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#ff4d00] text-white placeholder:text-white/30" />
              <button type="submit" disabled={isSubmittingLink || !driveLink.trim()} className="w-full bg-white text-black font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-50 text-xs">{isSubmittingLink ? 'Syncing...' : 'Submit Link'}</button>
            </form>
          </div>

          <div className="bg-[#131313] border border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="font-black uppercase tracking-widest text-white mb-6 text-sm flex items-center gap-2"><Clock size={16} className="text-[#ff4d00]" /> Monthly Quota</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-2 font-bold uppercase tracking-wider"><span>Full 4K Edits</span><span className="text-white">1 / 4</span></div>
                <div className="w-full bg-black rounded-full h-1.5 overflow-hidden"><div className="bg-[#ff4d00] h-1.5 w-1/4 rounded-full"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-2 font-bold uppercase tracking-wider"><span>Vertical Clips</span><span className="text-white">0 / 12</span></div>
                <div className="w-full bg-black rounded-full h-1.5 overflow-hidden"><div className="bg-[#ff4d00] h-1.5 w-[5%] rounded-full opacity-50"></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-2 w-full">
          <AnimatePresence mode="wait">
            {/* PIPELINE TAB */}
            {activeTab === 'pipeline' && (
              <motion.div key="pipeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#131313] border border-white/5 rounded-3xl p-5 md:p-8 shadow-xl">
                <h2 className="font-black uppercase tracking-widest text-white mb-6 text-lg md:text-xl">Active Production</h2>
                {isLoading ? <p className="text-white/40 text-sm animate-pulse">Loading...</p> : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                            {project.type === "Raw Folder" ? <UploadCloud size={18} className="text-white/50" /> : <Film size={18} className="text-white/50" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-xs md:text-sm">{project.title}</h4>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">{project.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto pt-2 md:pt-0 border-t border-white/5 md:border-none">
                          <div className="flex items-center gap-2">
                            {project.status === "Completed" && <CheckCircle2 size={16} className="text-green-500" />}
                            {project.status === "Review" && <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse"></span>}
                            <span className="text-xs font-bold uppercase tracking-widest text-white/50">{project.status}</span>
                          </div>
                          
                          {project.status === "Review" && (
                            <button 
                              onClick={() => {
                                if (!project.review_link) {
                                  alert("No video URL linked to this project! Paste your Cloudflare .mp4 link in Supabase under review_link.");
                                  return;
                                }
                                setActiveReviewProject(project);
                              }}
                              className="text-xs bg-[#ff4d00] text-black font-black uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-orange-500 transition-all shrink-0 cursor-pointer shadow-lg shadow-[#ff4d00]/20"
                            >
                              <PlayCircle size={14} /> Open Review Room
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ASSET VAULT TAB */}
            {activeTab === 'asset_vault' && (
              <motion.div key="asset_vault" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#131313] border border-white/5 rounded-3xl p-5 md:p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-black uppercase tracking-widest text-white text-lg md:text-xl">Asset Vault</h2>
                </div>
                {isLoading ? <p className="text-white/40 text-sm animate-pulse">Loading vault...</p> : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assets.map(asset => (
                      <div key={asset.id} className="bg-black/50 border border-white/5 rounded-2xl p-5 hover:border-[#ff4d00]/30 transition-colors group flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-white/50 group-hover:text-[#ff4d00] transition-colors">
                            {asset.asset_type === 'Video' ? <Film size={18} /> : asset.asset_type === 'Social' ? <Smartphone size={18} /> : <ImageIcon size={18} />}
                          </div>
                          <a href={asset.download_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors border border-white/5" title="Download Asset"><Download size={16} /></a>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm mb-2 line-clamp-1">{asset.title}</h4>
                          <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest font-bold">
                            <span>{new Date(asset.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>{asset.file_size}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STRATEGY TAB */}
            {activeTab === 'strategy' && (
              <motion.div key="strategy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#131313] border border-white/5 rounded-3xl p-5 md:p-8 shadow-xl">
                <h2 className="font-black uppercase tracking-widest text-white mb-2 text-lg md:text-xl">Monthly Strategy</h2>
                <p className="text-white/50 text-xs md:text-sm mb-8">Drop your ideas, call-to-actions, or vibe checks for this month's edits.</p>
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Strategy notes sent!"); }}>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Campaign Goal</label>
                    <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white appearance-none"><option>General Audience Growth</option><option>Lead Generation</option><option>Product Launch</option></select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Editor Notes</label>
                    <textarea rows={4} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white resize-none"></textarea>
                  </div>
                  <button type="submit" className="flex items-center justify-center gap-2 w-full bg-white text-black font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-gray-200 transition-colors"><Send size={16} /> Submit Brief</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* DIRECT LINE CHAT DRAWER */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0d0d0d] border-l border-white/10 z-50 flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#131313]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ff4d00]/10 border border-[#ff4d00]/30 flex items-center justify-center text-[#ff4d00]"><ShieldCheck size={20} /></div>
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
                    <div key={msg.id} className={`flex flex-col ${msg.sender_type === 'admin' ? 'items-start' : 'items-end'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${msg.sender_type === 'admin' ? 'bg-white/10 text-white rounded-tl-none border border-white/10' : 'bg-[#ff4d00] text-black font-medium rounded-tr-none'}`}>
                        {msg.message}
                      </div>
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

      {/* VIDEO REVIEW ROOM OVERLAY */}
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
