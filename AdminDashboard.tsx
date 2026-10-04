import React, { useState, useEffect } from 'react';
import { Users, FolderOpen, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initializes Supabase exactly how your Hub.tsx does it
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const AdminDashboard: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Delivery Form State
  const [deliverLink, setDeliverLink] = useState('');
  const [deliverTitle, setDeliverTitle] = useState('');
  const [deliverType, setDeliverType] = useState('Horizontal Podcast');
  const [isDelivering, setIsDelivering] = useState(false);

  useEffect(() => {
    if (supabase) {
      fetchClients();
    } else {
      setDbError("Supabase keys are missing from environment variables.");
      setIsLoading(false);
    }
  }, []);

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
      alert("Asset Delivered Successfully to Client Vault!");
    } catch (error: any) {
      console.error("Error delivering asset:", error);
      alert(`Delivery Failed: ${error.message}`);
    } finally {
      setIsDelivering(false);
    }
  };

  return (
    <div className="text-[#F5F5F0] font-sans relative pb-28 md:pb-12 px-4 md:px-0 max-w-6xl mx-auto min-h-screen bg-[#050505]">
      
      <div className="mb-8 pt-8 md:pt-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-3">
            Command <span className="text-[#ff4d00]">Center</span>
          </h1>
          <p className="text-white/50 text-xs md:text-sm tracking-widest uppercase font-bold">Admin Dashboard • Rise & Render</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT SIDEBAR: CLIENT LIST */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6 w-full">
          
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
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
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

        {/* RIGHT CONTENT: CLIENT MANAGEMENT */}
        <div className="lg:col-span-2 w-full space-y-6">
          {selectedClient ? (
            <>
              {/* DELIVER ASSET FORM */}
              <div className="bg-[#131313] border border-white/5 rounded-3xl p-6 shadow-xl">
                <h2 className="text-white text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-[#ff4d00]" /> Deliver Final Asset
                </h2>
                
                <p className="text-white/50 text-xs mb-6">
                  Uploading an asset here instantly pushes it to <span className="text-white font-bold">{selectedClient.first_name || 'the client'}'s</span> Asset Vault and updates their Delivered Tracker.
                </p>

                <form onSubmit={handleDeliverAsset} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Asset Title</label>
                      <input 
                        type="text" 
                        value={deliverTitle} 
                        onChange={(e) => setDeliverTitle(e.target.value)} 
                        placeholder="e.g. EP 30 Final Version" 
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Asset Type</label>
                      <select 
                        value={deliverType} 
                        onChange={(e) => setDeliverType(e.target.value)} 
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white appearance-none focus:outline-none focus:border-[#ff4d00] transition-colors"
                      >
                        <option value="Horizontal Podcast">Horizontal Podcast</option>
                        <option value="Vertical Reel">Vertical Reel / Short</option>
                        <option value="Other">Other Media</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Cloudflare / Drive Download Link</label>
                    <input 
                      type="url" 
                      value={deliverLink} 
                      onChange={(e) => setDeliverLink(e.target.value)} 
                      placeholder="https://..." 
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ff4d00] transition-colors" 
                      required 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isDelivering} 
                    className="bg-[#ff4d00] text-black font-black uppercase tracking-widest px-6 py-4 rounded-xl hover:bg-orange-500 transition-all text-sm w-full md:w-auto flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,77,0,0.3)]"
                  >
                    <Send size={16} />
                    {isDelivering ? 'Pushing to Client Vault...' : 'Deliver to Asset Vault'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-[#131313] border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
              <FolderOpen size={48} className="text-white/10 mb-4" />
              <h3 className="text-white/50 font-bold uppercase tracking-widest text-sm">No Client Selected</h3>
              <p className="text-white/30 text-xs mt-2">Select a client from the sidebar to deliver assets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
