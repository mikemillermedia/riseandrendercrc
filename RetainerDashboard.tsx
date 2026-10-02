import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UploadCloud, PlayCircle, CheckCircle2, MessageSquare, 
  Film, Smartphone, Clock, Link as LinkIcon
} from 'lucide-react';

const MOCK_PROJECTS = [
  { id: 1, title: "Podcast Ep. 42: The Creator Economy", status: "Review", type: "Full Length" },
  { id: 2, title: "Podcast Ep. 43: Building Systems", status: "Editing", type: "Full Length" },
  { id: 3, title: "Batch 1: 12 Vertical Shorts", status: "Uploading", type: "Social Clips" },
  { id: 4, title: "Podcast Ep. 41: Mindset", status: "Completed", type: "Full Length" },
];

const RetainerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pipeline');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F5F5F0] p-6 md:p-12 font-sans">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
            The Content <span className="text-[#ff4d00]">Engine</span>
          </h1>
          <p className="text-white/50 text-sm tracking-widest uppercase font-bold">
            Post-Production Retainer • Active
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#ff4d00] hover:bg-orange-500 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,77,0,0.3)]">
          <MessageSquare size={18} /> Direct Line
        </button>
      </div>

      {/* TABS */}
      <div className="max-w-6xl mx-auto flex gap-6 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        {['pipeline', 'asset_vault', 'strategy'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs md:text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              activeTab === tab ? 'text-[#ff4d00]' : 'text-white/40 hover:text-white'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: UPLOAD & ACTIONS */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-[#131313] border border-dashed border-white/20 hover:border-[#ff4d00]/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group">
            <div className="w-16 h-16 bg-[#ff4d00]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} className="text-[#ff4d00]" />
            </div>
            <h3 className="font-black uppercase tracking-widest text-white mb-2">Drop Raw Footage</h3>
            <p className="text-xs text-white/50 mb-6">Drag & drop files or click to sync with Google Drive.</p>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
              Select Files
            </button>
          </div>

          <div className="bg-[#131313] border border-white/5 rounded-3xl p-6">
            <h3 className="font-black uppercase tracking-widest text-white mb-4 text-sm flex items-center gap-2">
              <Clock size={16} className="text-[#ff4d00]" /> Monthly Quota
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-2 font-bold uppercase">
                  <span>Full 4K Edits</span>
                  <span>1 / 4</span>
                </div>
                <div className="w-full bg-black rounded-full h-1.5"><div className="bg-[#ff4d00] h-1.5 rounded-full w-1/4"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/60 mb-2 font-bold uppercase">
                  <span>Vertical Clips</span>
                  <span>0 / 12</span>
                </div>
                <div className="w-full bg-black rounded-full h-1.5"><div className="bg-[#ff4d00] h-1.5 rounded-full w-[5%]"></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE PIPELINE */}
        <div className="lg:col-span-2">
          {activeTab === 'pipeline' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#131313] border border-white/5 rounded-3xl p-6 md:p-8">
              <h2 className="font-black uppercase tracking-widest text-white mb-8 text-xl">Active Production</h2>
              
              <div className="space-y-4">
                {MOCK_PROJECTS.map((project) => (
                  <div key={project.id} className="bg-black/50 border border-white/5 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        {project.type === "Social Clips" ? <Smartphone size={20} className="text-white/50" /> : <Film size={20} className="text-white/50" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm md:text-base">{project.title}</h4>
                        <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">{project.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8 justify-between md:justify-end">
                      <div className="flex items-center gap-2">
                        {project.status === "Completed" && <CheckCircle2 size={16} className="text-green-500" />}
                        {project.status === "Review" && <PlayCircle size={16} className="text-[#ff4d00]" />}
                        {project.status === "Editing" && <Clock size={16} className="text-blue-400" />}
                        {project.status === "Uploading" && <UploadCloud size={16} className="text-white/40" />}
                        <span className="text-xs font-bold uppercase tracking-widest text-white/70">{project.status}</span>
                      </div>
                      
                      {project.status === "Review" && (
                        <button className="text-xs bg-white text-black font-black uppercase tracking-widest px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
                          <LinkIcon size={14} /> Review Link
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab !== 'pipeline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Content for {activeTab.replace('_', ' ')} will load here.</p>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RetainerDashboard;
