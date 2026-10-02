import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  MessageSquare, User, Send, ShieldCheck, Home, Clock, Search, LogOut
} from 'lucide-react';

// Initialize Supabase (Matches your Hub.tsx setup)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Check Auth & Fetch Retainer Clients
  useEffect(() => {
    const initAdmin = async () => {
      if (!supabase) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Fetch all users who have the retainer unlocked
      const { data: clientsData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('has_retainer', true)
        .order('first_name', { ascending: true });

      if (!error && clientsData) {
        setClients(clientsData);
      }
    };

    initAdmin();
  }, [navigate]);

  // 2. Fetch Messages & Subscribe to Realtime when a client is selected
  useEffect(() => {
    if (!supabase || !selectedClient) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('retainer_messages')
        .select('*')
        .eq('user_id', selectedClient.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        scrollToBottom();
      }
    };

    fetchMessages();

    // Realtime subscription for the selected client's chat
    const channel = supabase
      .channel(`admin_chat_${selectedClient.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'retainer_messages',
          filter: `user_id=eq.${selectedClient.id}`
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
  }, [selectedClient]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 3. Send Message as Admin
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase || !selectedClient) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input optimistically

    try {
      const { error } = await supabase.from('retainer_messages').insert([
        {
          user_id: selectedClient.id,
          sender_type: 'admin',
          message: messageText,
          is_read: true // Since we sent it, it's read by us
        }
      ]);

      if (error) throw error;
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredClients = clients.filter(c => 
    `${c.first_name} ${c.last_name} ${c.username}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-[#050505] text-[#F5F5F0] font-sans flex overflow-hidden">
      
      {/* LEFT SIDEBAR: CLIENT LIST */}
      <aside className="w-80 bg-[#111] border-r border-white/5 flex flex-col z-20 shrink-0">
        <div className="p-6 border-b border-white/5 bg-[#131313]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#ff4d00]/10 border border-[#ff4d00]/30 flex items-center justify-center text-[#ff4d00]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white leading-none">Command</h2>
              <p className="text-[10px] text-[#ff4d00] font-bold uppercase tracking-widest mt-1">Admin Bay</p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-white/30" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#ff4d00] text-white transition-colors"
            />
          </div>
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3 px-2">Retainer Clients</p>
          
          {filteredClients.length === 0 ? (
            <p className="text-xs text-white/40 px-2 italic">No clients found.</p>
          ) : (
            filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  selectedClient?.id === client.id 
                    ? 'bg-[#ff4d00] text-black shadow-lg shadow-[#ff4d00]/20' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border ${selectedClient?.id === client.id ? 'border-black/20 bg-black/10' : 'border-white/10 bg-black'}`}>
                  {client.avatar_url ? (
                    <img src={client.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs uppercase">{client.first_name?.charAt(0) || 'C'}</span>
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate ${selectedClient?.id === client.id ? 'text-black' : 'text-white'}`}>
                    {client.first_name} {client.last_name}
                  </h4>
                  <p className={`text-[10px] truncate uppercase tracking-widest font-bold ${selectedClient?.id === client.id ? 'text-black/60' : 'text-white/30'}`}>
                    @{client.username}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 space-y-2 bg-[#131313]">
          <button onClick={() => navigate('/hub')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Home size={18} /> Back to Hub
          </button>
          <button onClick={async () => { if(supabase) await supabase.auth.signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA: CHAT */}
      <main className="flex-1 flex flex-col relative bg-[#0a0a0a]">
        
        {/* Decorative Blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff4d00]/5 rounded-full blur-[120px] pointer-events-none" />

        {selectedClient ? (
          <>
            {/* Chat Header */}
            <header className="px-8 py-6 border-b border-white/5 bg-[#111]/80 backdrop-blur-md flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                  {selectedClient.avatar_url ? (
                    <img src={selectedClient.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-white uppercase">{selectedClient.first_name?.charAt(0) || 'C'}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-white leading-none">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </h2>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Retainer Active
                  </p>
                </div>
              </div>
              <a href={`mailto:${selectedClient.email}`} className="bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors border border-white/5">
                Email Client
              </a>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 z-10 relative">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <MessageSquare size={48} className="mb-4 text-white/50" />
                  <h3 className="text-lg font-black uppercase tracking-widest text-white">No Communications Yet</h3>
                  <p className="text-sm mt-2 max-w-md">Send a welcome message to open the Direct Line with {selectedClient.first_name}.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender_type === 'admin';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                          {isAdmin ? 'You (Admin)' : selectedClient.first_name}
                        </span>
                        <span className="text-[9px] text-white/20 flex items-center gap-1">
                          <Clock size={10} /> {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className={`max-w-[70%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-lg ${
                        isAdmin 
                          ? 'bg-[#ff4d00] text-black font-medium rounded-tr-none' 
                          : 'bg-[#1a1a1a] text-white rounded-tl-none border border-white/5'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input Footer */}
            <div className="p-6 bg-[#111] border-t border-white/5 z-10">
              <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex gap-3 relative">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedClient.first_name}...`}
                  className="flex-1 bg-black border border-white/10 rounded-xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-[#ff4d00] text-white transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || isSending}
                  className="absolute right-2 top-2 bottom-2 bg-[#ff4d00] disabled:bg-white/5 disabled:text-white/20 text-black px-4 rounded-lg hover:bg-orange-500 transition-colors font-bold flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center z-10 opacity-30">
            <ShieldCheck size={64} className="mb-6 text-white/50" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Admin Command Center</h2>
            <p className="text-sm mt-3">Select a retainer client from the sidebar to open their Direct Line.</p>
          </div>
        )}

      </main>
    </div>
  );
}
