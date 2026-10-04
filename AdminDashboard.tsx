import React, { useState, useEffect } from 'react';
import { 
  Users, FolderOpen, Send, CheckCircle2, AlertTriangle, 
  Film, Smartphone, Link as LinkIcon, Download 
} from 'lucide-react';
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

  // Delivery Form State
  const [deliverLink, setDeliverLink] = useState('');
  const [deliverTitle, setDeliverTitle] = useState('');
  const [deliverType, setDeliverType] = useState('Horizontal Podcast');
  const [isDelivering, setIsDelivering] = useState(false);

  // Client Snippet State
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [clientAssets, setClientAssets] = useState<any[]>([]);
  const [isLoadingClientData, setIsLoadingClientData] = useState(false);

  useEffect(() => {
    if (supabase) {
      fetchClients();
    } else {
      setDbError("Supabase keys are missing from environment variables.");
      setIsLoading(false);
    }
  }, []);

  // Fetch client snippet data whenever a new client is selected
  useEffect(() => {
    if (selectedClient && supabase) {
      fetchClientData(selectedClient.id);
    }
  }, [selectedClient]);

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
      
      // Refresh the client preview automatically
      fetchClientData(selectedClient.id);
      alert("Asset Delivered Successfully to Client Vault!");
    } catch (error: any) {
      console.error("Error delivering asset:", error);
      alert(`Delivery Failed: ${error.message}`);
    } finally {
      setIsDelivering(false);
    }
  };

  // Client Snippet Trackers
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
                {/* DELIVER ASSET FORM */}
                <div className="bg-[#131313] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                  <h2 className="text-white text-lg font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-[#ff4d00]" /> Deliver Final Asset
                  </h2>
                  <p className="text-white/50 text-xs mb-8">
                    Uploading an asset here instantly pushes it to <span className="text-white font-bold">{selectedClient.first_name || 'the client'}'s</span> Asset Vault.
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

                {/* LIVE CLIENT DASHBOARD PREVIEW */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d00]/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <h2 className="text-white text-lg font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                    Client View: <span className="text-[#ff4d00]">{selectedClient.first_name}</span>
                  </h2>

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

                      {/* Pipeline Snippet */}
                      <div>
                        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Active Production</h3>
                        {clientProjects.length === 0 ? (
                          <p className="text-white/30 text-xs italic">No active projects.</p>
                        ) : (
                          <div className="space-y-2">
                            {clientProjects.map(project => (
                              <div key={project.id} className="bg-[#131313] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  {project.type === 'Raw Folder' ? <FolderOpen size={14} className="text-white/40" /> : <Film size={14} className="text-[#ff4d00]" />}
                                  <div>
                                    <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[300px]">{project.title}</p>
                                    <p className="text-[9px] text-white/40 uppercase tracking-widest">{project.type}</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 bg-white/5 px-2 py-1 rounded">{project.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Vault Snippet */}
                      <div>
                        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Asset Vault</h3>
                        {clientAssets.length === 0 ? (
                          <p className="text-white/30 text-xs italic">No delivered assets.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {clientAssets.map(asset => (
                              <div key={asset.id} className="bg-[#131313] border border-white/5 rounded-xl p-3 flex justify-between items-start">
                                <div>
                                  <p className="text-xs font-bold text-white truncate max-w-[150px]">{asset.title}</p>
                                  <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">{asset.asset_type}</p>
                                </div>
                                <a href={asset.download_url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 hover:bg-[#ff4d00] hover:text-black rounded text-white/50 transition-colors">
                                  <Download size={12} />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
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
    </div>
  );
};

export default AdminDashboard;
