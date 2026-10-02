import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, PlayCircle, CheckCircle2, MessageSquare, 
  Film, Smartphone, Clock, Link as LinkIcon, Download,
  ExternalLink, Send, Image as ImageIcon, X, User, ShieldCheck
} from 'lucide-react';

interface RetainerDashboardProps {
  userId: string | null;
  supabase: any;
}

const DEMO_PROJECTS = [
  { id: 'demo-1', title: "Podcast Ep. 42: The Creator Economy", status: "Review", type: "Full Length", review_link: "https://frame.io" },
  { id: 'demo-2', title: "Podcast Ep. 43: Building Systems", status: "Editing", type: "Full Length" },
  { id: 'demo-3', title: "Batch 1: 12 Vertical Shorts", status: "Uploading", type: "Social Clips" },
  { id: 'demo-4', title: "Podcast Ep. 41: Mindset", status: "Completed", type: "Full Length" },
];

const COMPLETED_ASSETS = [
  { id: 101, title: "Ep 41: Mindset (4K Master)", type: "Video", date: "Oct 24, 2026", size: "4.2 GB" },
  { id: 102, title: "Ep 41: 3x Vertical Hooks", type: "Social", date: "Oct 24, 2026", size: "185 MB" },
  { id: 103, title: "Ep 41: Thumbnail A/B", type: "Image", date: "Oct 23, 2026", size: "12 MB" }
];

const RetainerDashboard: React.FC<RetainerDashboardProps> = ({ userId, supabase }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'asset_vault' | 'strategy'>('pipeline');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  // Link Submission State
  const [driveLink, setDriveLink] = useState('');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, [userId, supabase]);

  // Fetch messages and subscribe to real-time updates when chat opens
  useEffect(() => {
    if (!isChatOpen || !supabase || !userId) return;

    fetchMessages();

    // Subscribe to realtime changes in retainer_messages table
    const channel = supabase
      .channel(`chat_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'retainer_messages',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isChatOpen, userId, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProjects = async () => {
    if (!supabase || !userId) {
      setProjects(DEMO_PROJECTS);
      setIsLoadingProjects(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('retainer_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProjects([...(data || []), ...DEMO_PROJECTS]);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects(DEMO_PROJECTS);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchMessages = async () => {
    if (!supabase || !userId) return;
    try {
      const { data, error } = await supabase
        .from('retainer_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase || !userId) return;

    setIsSendingMessage(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase.from('retainer_messages').insert([
        {
          user_id: userId,
          sender_type: 'client',
          message: messageText
        }
      ]);

      if (error) throw error;
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Message failed to send. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLink.trim() || !supabase || !userId) return;
    
    setIsSubmittingLink(true);
    try {
      const { error } = await supabase.from('retainer_projects').insert([{
        user_id: userId,
        title: "Raw Footage Processing",
        status: "Review",
        type: "Raw Folder",
        review_link: driveLink
      }]);

      if (error) throw error;

      setDriveLink('');
      await fetchProjects();
    } catch (error) {
      console.error("Error submitting link:", error);
      alert("There was an error saving your link. Please try again.");
    } finally {
      setIsSubmittingLink(false);
    }
  };

  return (
    <div className="text-[#F5F5F0] font-sans relative">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-3">
            The Content <span className="text-[#ff4d00]">Engine</span>
          </h1>
          <p className="text-white/50 text-sm tracking-widest uppercase font-bold">
            Post-Production Retainer • Active
          </p>
        </div>
        <button 
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 bg-[#ff4d00] hover:bg-orange-500 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,77,0,0.2)] hover:shadow-[0_0_30px_rgba(255,77,0,0.4)]"
        >
          <MessageSquare size={18} /> Direct Line
        </button>
      </div>

      {/* TABS */}
      <div className="max-w-6xl mx-auto flex gap-8 mb-8 border-b border-white/10 pb-4">
        {[
          { id: 'pipeline', label: 'Pipeline' },
          { id: 'asset_vault', label: 'Asset Vault' },
          { id: 'strategy', label: 'Strategy' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              activeTab === tab.id ? 'text-[#ff4d00]' : 'text-white/40 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: UPLOAD & QUOTAS */}
        <div className="lg:col-span-1 space-y-6 sticky top-6">
          
          {/* UPLOAD ZONE */}
          <div className="bg-[#131313] border border-dashed border-white/20 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all focus-within:border-[#ff4d00]/50">
            <div className="w-16 h-16 bg-[#ff4d00]/10 rounded-full flex items-center justify-center mb-4">
              <LinkIcon size={32} className="text-[#ff4d00]" />
            </div>
            <h3 className="font-black uppercase tracking-widest text-white mb-2">Link Raw Footage</h3>
            <p className="text-xs text-white/50 mb-6">Paste your Google Drive or Dropbox folder link below to sync.</p>
            
            <form onSubmit={handleLinkSubmit} className="w-full flex flex-col gap-3">
              <input 
                type="url" 
                required
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/..." 
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#ff4d00] text-white transition-colors placeholder:text-white/30"
              />
              <button 
                type="submit" 
                disabled={isSubmittingLink || !driveLink.trim()}
                className="w-full bg-white hover:bg-gray-200 disabled:bg-white/5 disabled:text-white/30 text-black font-black uppercase tracking-widest py-3 rounded-xl transition-colors text-xs"
              >
                {isSubmittingLink ? 'Syncing...' : 'Submit Link'}
              </button>
            </form>
          </div>

          {/* MONTHLY QUOTA */}
          <div className="bg-[#131313] border border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="font-black uppercase tracking-widest text-white mb-6 text-sm flex items-center gap-2">
              <Clock size={16} className="text-[#ff4d00]" /> Monthly Quota
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-2 font-bold uppercase tracking-wider">
                  <span>Full 4K Edits</span>
                  <span className="text-white">1 / 4</span>
                </div>
                <div className="w-full bg-black rounded-full h-1.5 overflow-hidden"><div className="bg-[#ff4d00] h-1.5 w-1/4 rounded-full"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-2 font-bold uppercase tracking-wider">
                  <span>Vertical Clips</span>
                  <span className="text-white">0 / 12</span>
                </div>
                <div className="w-full bg-black rounded-full h-1.5 overflow-hidden"><div className="bg-[#ff4d00] h-1.5 w-[5%] rounded-full opacity-50"></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC TABS */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            
            {/* --- PIPELINE TAB --- */}
            {activeTab === 'pipeline' && (
              <motion.div key="pipeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#131313] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="font-black uppercase tracking-widest text-white mb-6 text-xl">Active Production</h2>
                
                {isLoadingProjects ? (
                  <p className="text-white/40 text-sm animate-pulse">Loading pipeline...</p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-black/50 border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                            {project.type === "Raw Folder" ? <UploadCloud size={20} className="text-white/50" /> : <Film size={20} className="text-white/50" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{project.title}</h4>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">{project.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6 justify-between md:justify-end">
                          <div className="flex items-center gap-2">
                            {project.status === "Completed" && <CheckCircle2 size={16} className="text-green-500" />}
                            {project.status === "Review" && <PlayCircle size={16} className="text-[#ff4d00]" />}
                            {project.status === "Editing" && <Clock size={16} className="text-blue-400" />}
                            <span className="text-xs font-bold uppercase tracking-widest text-white/70">{project.status}</span>
                          </div>
                          
                          {project.review_link && (
                            <a href={project.review_link} target="_blank" rel="noopener noreferrer" className="text-xs bg-white text-black font-black uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors shrink-0">
                              <LinkIcon size={14} /> View Link
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* --- ASSET VAULT TAB --- */}
            {activeTab === 'asset_vault' && (
              <motion.div key="asset_vault" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#131313] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-black uppercase tracking-widest text-white text-xl">Asset Vault</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {COMPLETED_ASSETS.map(asset => (
                    <div key={asset.id} className="bg-black/50 border border-white/5 rounded-2xl p-5 hover:border-[#ff4d00]/30 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-white/50 group-hover:text-[#ff4d00] transition-colors">
                          {asset.type === 'Video' ? <Film size={18} /> : asset.type === 'Social' ? <Smartphone size={18} /> : <ImageIcon size={18} />}
                        </div>
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                      <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{asset.title}</h4>
                      <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        <span>{asset.date}</span>
                        <span>{asset.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- STRATEGY TAB --- */}
            {activeTab === 'strategy' && (
              <motion.div key="strategy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#131313] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="font-black uppercase tracking-widest text-white mb-2 text-xl">Monthly Strategy</h2>
                <p className="text-white/50 text-sm mb-8">Drop your ideas, call-to-actions, or vibe checks for this month's edits.</p>
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Strategy notes sent!"); }}>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Campaign Goal</label>
                    <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white appearance-none">
                      <option>General Audience Growth</option>
                      <option>Lead Generation</option>
                      <option>Product Launch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Editor Notes</label>
                    <textarea rows={4} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff4d00] text-white resize-none"></textarea>
                  </div>
                  <button type="submit" className="flex items-center justify-center gap-2 w-full bg-white text-black font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-gray-200 transition-colors">
                    <Send size={16} /> Submit Brief
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ==================== DIRECT LINE CHAT DRAWER ==================== */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Slide-over Drawer */}
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0d0d0d] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#131313]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ff4d00]/10 border border-[#ff4d00]/30 flex items-center justify-center text-[#ff4d00]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-wider text-sm">Direct Line Support</h3>
                    <p className="text-[10px] text-[#ff4d00] font-bold uppercase tracking-widest">Rise & Render Bay</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <MessageSquare size={36} className="text-white/20 mb-3" />
                    <p className="text-white/60 text-sm font-bold mb-1">Direct Line Active</p>
                    <p className="text-white/30 text-xs">Ask a question about your edits, request revision tweaks, or chat with Mike.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.sender_type === 'admin';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                            {isAdmin ? 'Rise & Render Team' : 'You'}
                          </span>
                        </div>
                        <div 
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isAdmin 
                              ? 'bg-white/10 text-white rounded-tl-none border border-white/10' 
                              : 'bg-[#ff4d00] text-black font-medium rounded-tr-none shadow-lg'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className="text-[8px] text-white/20 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#131313] flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#ff4d00] text-white"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || isSendingMessage}
                  className="bg-[#ff4d00] disabled:bg-white/5 disabled:text-white/20 text-black p-3 rounded-xl hover:bg-orange-500 transition-colors font-bold"
                >
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default RetainerDashboard;
