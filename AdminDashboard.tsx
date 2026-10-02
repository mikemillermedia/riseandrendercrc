import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { MessageSquare, User, Send, ShieldCheck, Home, Clock, Search, LogOut, UploadCloud, Folder } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin Tabs
  const [adminTab, setAdminTab] = useState<'chat' | 'deliverables'>('chat');

  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Deliverables State
  const [assetTitle, setAssetTitle] = useState('');
  const [assetType, setAssetType] = useState('Video');
  const [assetSize, setAssetSize] = useState('');
  const [assetLink, setAssetLink] = useState('');
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);

  useEffect(() => {
    const initAdmin = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      const { data } = await supabase.from('profiles').select('*').eq('has_retainer', true).order('first_name', { ascending: true });
      if (data) setClients(data);
    };
    initAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!supabase || !selectedClient) return;
    const fetchMessages = async () => {
      const { data } = await supabase.from('retainer_messages').select('*').eq('user_id', selectedClient.id).order('created_at', { ascending: true });
      if (data) { setMessages(data); scrollToBottom(); }
    };
    fetchMessages();

    const channel = supabase.channel(`admin_chat_${selectedClient.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'retainer_messages', filter: `user_id=eq.${selectedClient.id}` }, (payload: any) => {
        setMessages((prev) => [...prev, payload.new]);
        scrollToBottom();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedClient]);

  const scrollToBottom = () => setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase || !selectedClient) return;
    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    try { await supabase.from('retainer_messages').insert([{ user_id: selectedClient.id, sender_type: 'admin', message: messageText, is_read: true }]); } 
    finally { setIsSending(false); }
  };

  const handleDeliverAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !selectedClient || !assetTitle || !assetLink) return;
    setIsUploadingAsset(true);
    
    try {
      const { error } = await supabase.from('retainer_assets').insert([{
        user_id: selectedClient.id,
        title: assetTitle,
        asset_type: assetType,
        file_size: assetSize,
        download_url: assetLink
      }]);

      if (error) throw error;
      
      alert("Asset delivered successfully!");
      setAssetTitle(''); setAssetSize(''); setAssetLink('');
      setAdminTab('chat');
      
      // Auto-send a chat message letting them know
      await supabase.from('retainer_messages').insert([{ 
        user_id: selectedClient.id, 
        sender_type: 'admin', 
        message: `I just dropped a new file in your Asset Vault: ${assetTitle}. Let me know if you need any revisions!`, 
        is_read: true 
      }]);

    } catch (err: any) {
      alert("Error delivering asset: " + err.message);
    } finally {
      setIsUploadingAsset(false);
    }
  };

  const filteredClients = clients.filter(c => `${c.first_name} ${c.last_name} ${c.username}`.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-screen bg-[#050505] text-[#F5F5F0] font-sans flex overflow-hidden">
      <aside className="w-80 bg-[#111] border-r border-white/5 flex flex-col z-20 shrink-0">
        <div className="p-6 border-b border-white/5 bg-[#131313]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#ff4d00]/10 border border-[#ff4d00]/30 flex items-center justify-center text-[#ff4d00]"><ShieldCheck size={24} /></div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white leading-none">Command</h2>
              <p className="text-[10px] text-[#ff4d00] font-bold uppercase tracking-widest mt-1">Admin Bay</p>
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-white/30" />
            <input type="text" placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#ff4d00] text-white" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3 px-2">Retainer Clients</p>
          {filteredClients.map((client) => (
            <button key={client.id} onClick={() => setSelectedClient(client)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedClient?.id === client.id ? 'bg-[#ff4d00] text-black shadow-lg shadow-[#ff4d00]/20' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-black/20 ${selectedClient?.id === client.id ? 'bg-black/10' : 'bg-black'}`}>
                {client.avatar_url ? <img src={client.avatar_url} className="w-full h-full object-cover" /> : <span className="font-bold text-xs uppercase">{client.first_name?.charAt(0) || 'C'}</span>}
              </div>
              <div className="text-left flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate">{client.first_name} {client.last_name}</h4>
                <p className="text-[10px] truncate uppercase tracking-widest font-bold opacity-60">@{client.username}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#0a0a0a]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff4d00]/5 rounded-full blur-[120px] pointer-events-none" />

        {selectedClient ? (
          <>
            <header className="px-8 py-6 border-b border-white/5 bg-[#111]/80 backdrop-blur-md flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                  {selectedClient.avatar_url ? <img src={selectedClient.avatar_url} className="w-full h-full object-cover" /> : <span className="font-bold text-white uppercase">{selectedClient.first_name?.charAt(0) || 'C'}</span>}
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-white leading-none">{selectedClient.first_name} {selectedClient.last_name}</h2>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Retainer Active</p>
                </div>
              </div>
              
              {/* ADMIN TAB TOGGLES */}
              <div className="flex bg-black border border-white/10 rounded-xl p-1">
                <button onClick={() => setAdminTab('chat')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${adminTab === 'chat' ? 'bg-[#ff4d00] text-black' : 'text-white/40 hover:text-white'}`}>Chat</button>
                <button onClick={() => setAdminTab('deliverables')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${adminTab === 'deliverables' ? 'bg-[#ff4d00] text-black' : 'text-white/40 hover:text-white'}`}>Deliverables</button>
              </div>
            </header>

            {/* CHAT TAB */}
            {adminTab === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto p-8 space-y-6 z-10 relative">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <MessageSquare size={48} className="mb-4 text-white/50" />
                      <h3 className="text-lg font-black uppercase tracking-widest text-white">No Communications Yet</h3>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{msg.sender_type === 'admin' ? 'You' : selectedClient.first_name}</span>
                        </div>
                        <div className={`max-w-[70%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-lg ${msg.sender_type === 'admin' ? 'bg-[#ff4d00] text-black font-medium rounded-tr-none' : 'bg-[#1a1a1a] text-white rounded-tl-none border border-white/5'}`}>
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-6 bg-[#111] border-t border-white/5 z-10">
                  <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex gap-3 relative">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={`Message ${selectedClient.first_name}...`} className="flex-1 bg-black border border-white/10 rounded-xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-[#ff4d00] text-white" />
                    <button type="submit" disabled={!newMessage.trim() || isSending} className="absolute right-2 top-2 bottom-2 bg-[#ff4d00] disabled:bg-white/5 disabled:text-white/20 text-black px-4 rounded-lg font-bold flex items-center justify-center"><Send size={18} /></button>
                  </form>
                </div>
              </>
            )}

            {/* DELIVERABLES TAB */}
            {adminTab === 'deliverables' && (
              <div className="flex-1 overflow-y-auto p-8 z-10 relative flex items-center justify-center">
                <div className="bg-[#131313] border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#ff4d00]/10 rounded-full flex items-center justify-center text-[#ff4d00]"><Folder size={24} /></div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-white">Deliver Asset</h2>
                      <p className="text-xs text-white/50">Push files to {selectedClient.first_name}'s vault.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleDeliverAsset} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Asset Name</label>
                      <input type="text" required placeholder="e.g. Ep 42: The Creator Economy (4K)" value={assetTitle} onChange={e => setAssetTitle(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ff4d00] focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Type</label>
                        <select value={assetType} onChange={e => setAssetType(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ff4d00] focus:outline-none appearance-none">
                          <option>Video</option>
                          <option>Social</option>
                          <option>Image</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">File Size (Optional)</label>
                        <input type="text" placeholder="e.g. 4.2 GB" value={assetSize} onChange={e => setAssetSize(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ff4d00] focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Google Drive / Dropbox Link</label>
                      <input type="url" required placeholder="https://..." value={assetLink} onChange={e => setAssetLink(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ff4d00] focus:outline-none" />
                    </div>
                    
                    <button type="submit" disabled={isUploadingAsset} className="w-full bg-[#ff4d00] disabled:bg-white/10 text-black py-4 rounded-xl font-black uppercase tracking-widest mt-4 hover:bg-orange-500 transition-colors">
                      {isUploadingAsset ? 'Pushing to Vault...' : 'Deliver to Client'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center z-10 opacity-30">
            <ShieldCheck size={64} className="mb-6 text-white/50" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Admin Command Center</h2>
          </div>
        )}
      </main>
    </div>
  );
}
