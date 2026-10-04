import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, FolderOpen, Send, CheckCircle2, AlertTriangle, 
  Film, Smartphone, Link as LinkIcon, Download, PlayCircle, MessageSquare, X, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Initializes Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const AdminDashboard: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Form State: Review / In Production
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewType, setReviewType] = useState('Horizontal Podcast');
  const [reviewLink, setReviewLink] = useState('');
  const [isSendingReview, setIsSendingReview] = useState(false);

  // Form State: Final Delivery
  const [deliverLink, setDeliverLink] = useState('');
  const [deliverTitle, setDeliverTitle] = useState('');
  const [deliverType, setDeliverType] = useState('Horizontal Podcast');
  const [isDelivering, setIsDelivering] = useState(false);

  // Client Snippet State
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [clientAssets, setClientAssets] = useState<any[]>([]);
  const [isLoadingClientData, setIsLoadingClientData] = useState(false);

  // Admin Direct Line State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (supabase) {
      fetchClients();
    } else {
      setDbError("Supabase keys are missing from environment variables.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClient && supabase) {
      fetchClientData(selectedClient.id);
      setIsChatOpen(false); // Close chat when switching clients
    }
  }, [selectedClient]);

  // Chat Subscriptions
  useEffect(() => {
    if (!isChatOpen || !selectedClient || !supabase) return;
    
    const fetchMessages = async () => {
      const { data } = await supabase.from('retainer_messages').select('*').eq('user_id', selectedClient.id).order('created_at', { ascending: true });
      if (data) { setMessages(data); scrollToBottom(); }
    };
    
    fetchMessages();

    const channel = supabase.channel(`admin_chat_${selectedClient.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'retainer_messages', filter: `user_id=eq.${selectedClient.id}` }, (payload: any) => {
        setMessages((prev) => [...prev, payload.new]);
        scrollToBottom();
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [isChatOpen, selectedClient]);

  const scrollToBottom = () => setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const fetchClients = async () => {
    try {
      setDbError(null);
      const { data, error } = await supabase!
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      if (data) {
        setClients(data);
        if (data.length > 0) setSelectedClient(data[0]);
      }
    } catch (error: any) {
      console.error("Error fetching clients:", error);
      setDbError(error.message || JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientData = async (clientId: string) => {
    setIsLoadingClientData(true);
    try {
      const [projRes, assetRes] = await Promise.all([
        supabase!.from('retainer_projects').select('*').eq('user_id', clientId).order('created_at', { ascending: false }),
        supabase!.from('retainer_assets').select('*').eq('user_id', clientId).order('created_at', { ascending: false })
      ]);
      
      setClientProjects(projRes.data || []);
      setClientAssets(assetRes.data || []);
    } catch (err) {
      console.error("Error fetching client data:", err);
    } finally {
      setIsLoadingClientData(false);
    }
  };

  // ACTION: Send Chat Message (Admin Side)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase || !selectedClient) return;
    setIsSendingMessage(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    try { 
      await supabase.from('retainer_messages').insert([{ user_id: selectedClient.id, sender_type: 'admin', message: messageText }]); 
    } finally { 
      setIsSendingMessage(false); 
    }
  };

  // ACTION: Send to "In Production" (Review Room)
  const handleSendForReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !reviewLink.trim() || !reviewTitle.trim() || !supabase) return;
    
    setIsSendingReview(true);
    try {
      const { error } = await supabase.from('retainer_projects').insert([{
        user_id: selectedClient.id,
        title: reviewTitle,
        type: reviewType,
        review_link: reviewLink,
        status: "Review"
      }]);
      if (error) throw error;
      setReviewTitle('');
      setReviewLink('');
      fetchClientData(selectedClient.id);
      alert("Sent to In Production for Client Review!");
    } catch (error: any) {
      alert(`Failed to send for review: ${error.message}`);
    } finally { setIsSendingReview(false); }
  };

  // ACTION: Send to "Final Videos" (Delivered)
  const handleDeliverAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !deliverLink.trim() || !deliverTitle.trim() || !supabase) return;
    
    setIsDelivering(true);
    try {
      const { error } = await supabase.from('retainer_assets').insert([{
        user_id: selectedClient.id,
        title: deliverTitle,
        asset_type: deliverType,
        download_url: deliverLink,
        file_size: "Link"
      }]);
      if (error) throw error;
      setDeliverTitle('');
      setDeliverLink('');
      fetchClientData(selectedClient.id);
      alert("Asset Delivered Successfully to Final Videos!");
    } catch (error: any) {
      alert(`Delivery Failed: ${error.message}`);
    } finally { setIsDelivering(false); }
  };

  const deliveryProjects = clientProjects.filter(p => p.type === 'Raw Folder');
  const productionProjects = clientProjects.filter(p => p.type !== 'Raw Folder');
  const horizontalDelivered = clientAssets.filter(a => ['Horizontal Podcast', 'Long Form', 'Full Length', 'Video'].includes(a.asset_type)).length;
  const verticalDelivered = clientAssets.filter(a => ['Vertical Reel', 'Social', 'Reel', 'Short', 'Vertical Clip'].includes(a.asset_type)).length;

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F0] font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        
        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-3">
              Command <span className="text-[#ff4d00]">Center</span>
            </h1>
            <p className="text-white/50 text-xs md:text-sm tracking-widest uppercase font-bold">Admin Dashboard • Rise & Render</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT SIDEBAR: CLIENT LIST */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-12 w-full">
            
            {dbError && (
              <div className="bg-red-500/10 border border-red-500/50 p-5 rounded-3xl shadow-xl">
                <h4 className="text-red-500 font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} /> Database Error
                </h4>
                <p className="text-red-400 text-xs leading-relaxed">{dbError}</p>
              </div>
            )}

            <div className="bg-[#131313] border border-white/5 rounded-3xl p-6 shadow-xl">
              <h3 className="font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                <Users size={18} className="text-[#ff4d00]" /> Active Clients
              </h3>
              {isLoading ? (
                <p className="text-white/40 text-sm animate-pulse">Loading clients...</p>
              ) : clients.length === 0 ? (
                <p className="text-white/40 text-sm">No clients found.</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {clients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
                        selectedClient?.id === client.id 
                          ? 'bg-[#ff4d00]/10 border-[#ff4d00]/50 text-[#ff4d00]' 
                          : 'bg-black border-white/5 text-white hover:border-white/20'
                      }`}
                    >
                      <span className="font-bold text-sm truncate">{client.first_name || "Unknown"} {client.last_name || client.username || ""}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CONTENT: CLIENT MANAGEMENT & PREVIEW */}
          <div className="lg:col-span-2 w-full space-y-8">
            {selectedClient ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FORM 1: SEND TO "IN PRODUCTION" (REVIEW ROOM) */}
                  <div className="bg-[#131313] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between focus-within:border-[#ff4d00]/50 transition-colors">
                    <div>
                      <h2 className="text-white text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <PlayCircle size={18} className="text-[#ff4d00]" /> Send for Review
                      </h2>
                      <p className="text-white/50 text-[10px] mb-6 leading-relaxed">
                        Push a Cloudflare .mp4 link to the client's <strong className="text-white">In Production</strong> stage.
                      </p>

                      <form onSubmit={handleSendForReview} className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Video Title</label>
                          <input 
                            type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} 
                            placeholder="e.g. EP 30 V1" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ff4d00]" required 
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Format Type</label>
                          <select 
                            value={reviewType} onChange={(e) => setReviewType(e.target.value)} 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white appearance-none focus:outline-none focus:border-[#ff4d00]"
                          >
                            <option value="Horizontal Podcast">Horizontal Podcast</option>
                            <option value="Vertical Reel">Vertical Reel / Short</option>
                            <option value="Other">Other Media</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Cloudflare MP4 Link</label>
                          <input 
                            type="url" value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} 
                            placeholder="https://..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ff4d00]" required 
                          />
                        </div>
                        <button type="submit" disabled={isSendingReview} className="w-full bg-[#ff4d00] text-black font-black uppercase tracking-widest px-4 py-3.5 rounded-xl hover:bg-orange-500 transition-all text-[10px] flex items-center justify-center gap-2 mt-2">
                          <PlayCircle size={14} /> {isSendingReview ? 'Sending...' : 'Push to Review Room'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* FORM 2: DELIVER FINAL ASSET */}
                  <div className="bg-[#131313] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between focus-within:border-green-500/50 transition-colors">
                    <div>
                      <h2 className="text-white text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-500" /> Deliver Final Asset
                      </h2>
                      <p className="text-white/50 text-[10px] mb-6 leading-relaxed">
                        Push a final link to the client's <strong className="text-white">Final Videos</strong> section to update quotas.
                      </p>

                      <form onSubmit={handleDeliverAsset} className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Asset Title</label>
                          <input 
                            type="text" value={deliverTitle} onChange={(e) => setDeliverTitle(e.target.value)} 
                            placeholder="e.g. EP 30 Final" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-green-500" required 
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Format Type</label>
                          <select 
                            value={deliverType} onChange={(e) => setDeliverType(e.target.value)} 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white appearance-none focus:outline-none focus:border-green-500"
                          >
                            <option value="Horizontal Podcast">Horizontal Podcast</option>
                            <option value="Vertical Reel">Vertical Reel / Short</option>
                            <option value="Other">Other Media</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Folder / Download Link</label>
                          <input 
                            type="url" value={deliverLink} onChange={(e) => setDeliverLink(e.target.value)} 
                            placeholder="https://..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-green-500" required 
                          />
                        </div>
                        <button type="submit" disabled={isDelivering} className="w-full bg-green-500 text-black font-black uppercase tracking-widest px-4 py-3.5 rounded-xl hover:bg-green-400 transition-all text-[10px] flex items-center justify-center gap-2 mt-2">
                          <Send size={14} /> {isDelivering ? 'Delivering...' : 'Push to Final Videos'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* LIVE CLIENT DASHBOARD PREVIEW & DIRECT LINE */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mt-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d00]/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-white/10 pb-4 gap-4">
                    <h2 className="text-white text-lg font-black uppercase tracking-widest">
                      Client View: <span className="text-[#ff4d00]">{selectedClient.first_name}</span>
                    </h2>
                    
                    {/* ADMIN CHAT BUTTON */}
                    <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-lg">
                      <MessageSquare size={16} className="text-[#ff4d00]" /> Open Direct Line
                    </button>
                  </div>

                  {isLoadingClientData ? (
                    <p className="text-white/40 text-sm animate-pulse">Syncing client feed...</p>
                  ) : (
                    <div className="space-y-8 relative z-10">
                      
                      {/* Tracker Snippet */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#131313] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Podcasts</span>
                          <span className="text-lg font-black text-[#ff4d00]">{horizontalDelivered}</span>
                        </div>
                        <div className="bg-[#131313] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Reels / Shorts</span>
                          <span className="text-lg font-black text-[#ff4d00]">{verticalDelivered}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Stage 1 Snippet */}
                        <div className="bg-[#131313] border border-white/5 rounded-2xl p-5">
                          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Stage 1: Delivery</h3>
                          {deliveryProjects.length === 0 ? <p className="text-white/30 text-xs italic">No raw folders.</p> : (
                            <div className="space-y-2">
                              {deliveryProjects.map(project => (
                                <div key={project.id} className="bg-black/50 border border-white/5 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FolderOpen size={12} className="text-white/40" />
                                    <p className="text-[10px] font-bold text-white truncate">{project.title}</p>
                                  </div>
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/50 bg-white/5 px-2 py-1 rounded inline-block">{project.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Stage 2 Snippet */}
                        <div className="bg-[#131313] border border-white/5 rounded-2xl p-5">
                          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Stage 2: In Prod</h3>
                          {productionProjects.length === 0 ? <p className="text-white/30 text-xs italic">No videos in review.</p> : (
                            <div className="space-y-2">
                              {productionProjects.map(project => (
                                <div key={project.id} className="bg-black/50 border border-white/5 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <PlayCircle size={12} className="text-[#ff4d00]" />
                                    <p className="text-[10px] font-bold text-white truncate">{project.title}</p>
                                  </div>
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#ff4d00] bg-[#ff4d00]/10 border border-[#ff4d00]/20 px-2 py-1 rounded inline-block">{project.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Stage 3 Snippet */}
                        <div className="bg-[#131313] border border-white/5 rounded-2xl p-5">
                          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Stage 3: Final</h3>
                          {clientAssets.length === 0 ? <p className="text-white/30 text-xs italic">No delivered assets.</p> : (
                            <div className="space-y-2">
                              {clientAssets.map(asset => (
                                <div key={asset.id} className="bg-black/50 border border-white/5 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 size={12} className="text-green-500" />
                                    <p className="text-[10px] font-bold text-white truncate">{asset.title}</p>
                                  </div>
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">{asset.asset_type}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-[#131313] border border-white/5 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
                <FolderOpen size={48} className="text-white/10 mb-4" />
                <h3 className="text-white/50 font-bold uppercase tracking-widest text-sm">No Client Selected</h3>
                <p className="text-white/30 text-xs mt-2">Select a client from the sidebar to manage their workspace.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN DIRECT LINE CHAT DRAWER */}
      <AnimatePresence>
        {isChatOpen && selectedClient && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0d0d0d] border-l border-white/10 z-50 flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#131313]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ff4d00]/10 border border-[#ff4d00]/30 flex items-center justify-center text-[#ff4d00]"><ShieldCheck size={20} /></div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-wider text-sm">Direct Line</h3>
                    <p className="text-[10px] text-[#ff4d00] font-bold uppercase tracking-widest">Chatting with {selectedClient.first_name}</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <MessageSquare size={36} className="text-white/20 mb-3" />
                    <p className="text-white/60 text-sm font-bold mb-1">Direct Line Active</p>
                    <p className="text-white/40 text-xs">Send a message to {selectedClient.first_name}.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    // Admin messages go to the right, Client messages to the left
                    <div key={msg.id} className={`flex flex-col ${msg.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${msg.sender_type === 'admin' ? 'bg-[#ff4d00] text-black font-medium rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/10'}`}>
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

    </div>
  );
};

export default AdminDashboard;
