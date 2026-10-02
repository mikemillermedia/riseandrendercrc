import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, PlayCircle, CheckCircle2, MessageSquare, 
  Film, Smartphone, Clock, Link as LinkIcon, Download,
  ExternalLink, Send, Image as ImageIcon
} from 'lucide-react';

// Define the props passed from Hub.tsx
interface RetainerDashboardProps {
  userId: string | null;
  supabase: any;
}

const COMPLETED_ASSETS = [
  { id: 101, title: "Ep 41: Mindset (4K Master)", type: "Video", date: "Oct 24, 2026", size: "4.2 GB" },
  { id: 102, title: "Ep 41: 3x Vertical Hooks", type: "Social", date: "Oct 24, 2026", size: "185 MB" }
];

const RetainerDashboard: React.FC<RetainerDashboardProps> = ({ userId, supabase }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'asset_vault' | 'strategy'>('pipeline');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  // Link Submission State
  const [driveLink, setDriveLink] = useState('');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // Fetch projects from Supabase on load
  useEffect(() => {
    fetchProjects();
  }, [userId, supabase]);

  const fetchProjects = async () => {
    if (!supabase || !userId) return;
    try {
      const { data, error } = await supabase
        .from('retainer_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleDirectLine = () => {
    window.location.href = "mailto:support@riseandrenderdfw.com?subject=Retainer Support Request";
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLink.trim() || !supabase || !userId) return;
    
    setIsSubmittingLink(true);
    
    try {
      // Save the submitted link directly to Supabase
      const { error } = await supabase.from('retainer_projects').insert([{
        user_id: userId,
        title: "Raw Footage Processing",
        status: "Review", // You can update this status later in your database to "Editing" or "Completed"
        type: "Raw Folder",
        review_link: driveLink
      }]);

      if (error) throw error;

      // Clear form and refresh the UI so the client sees it instantly
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
    <div className="text-[#F5F5F0] font-sans">
      
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
          onClick={handleDirectLine}
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
                ) : projects.length === 0 ? (
                  <p className="text-white/40 text-sm italic">No active projects. Link your raw footage to get started!</p>
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
    </div>
  );
};

export default RetainerDashboard;
