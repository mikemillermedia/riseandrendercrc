import React, { useState } from 'react';
import { Heart, Send } from 'lucide-react';

export default function PrayerWall() {
  const [request, setRequest] = useState('');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Dark Charcoal Input Box */}
      <div className="bg-[#1a1a1a] border border-[#F5F5F0]/10 p-6 rounded-2xl shadow-xl">
        <form className="flex flex-col gap-4">
          <textarea
            placeholder="Share a prayer request..."
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            className="w-full bg-[#131313] border border-[#F5F5F0]/10 rounded-xl px-4 py-3 text-[#F5F5F0] placeholder:text-[#F5F5F0]/40 focus:outline-none focus:border-[#ff4d00] transition-colors resize-none h-24"
          />
          <div className="flex justify-end">
            <button 
              type="button" 
              className="bg-[#ff4d00] hover:bg-[#ff4d00]/80 text-white font-bold py-2.5 px-6 rounded-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-orange-900/20"
            >
              <Send size={16} /> Post Request
            </button>
          </div>
        </form>
      </div>

      {/* Dark Charcoal Prayer Cards */}
      <div className="space-y-4">
        
        <div className="bg-[#1a1a1a] border border-[#F5F5F0]/10 p-6 rounded-2xl shadow-md">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">CRC Member</h3>
            <span className="text-xs text-[#F5F5F0]/40">2 hours ago</span>
          </div>
          <p className="text-[#F5F5F0]/80 mb-4 leading-relaxed">
            Praying for clarity on a new media role at my church. The transition has been tough, but trusting God's timing!
          </p>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 text-sm text-[#F5F5F0]/40 hover:text-[#ff4d00] transition-colors bg-white/5 hover:bg-[#ff4d00]/10 px-3 py-1.5 rounded-lg">
              <Heart size={16} /> Praying (12)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
