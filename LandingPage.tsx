import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Replace these with your actual Jotform Publish URLs
  const JOTFORM_LINKS = {
    consultation: "https://pci.jotform.com/form/262714847150054",
    buildOut: "https://form.jotform.com/your-buildout-id",
    retainer: "https://form.jotform.com/262728038546060"
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F5F5F0] font-sans">
      
      {/* NAVIGATION BAR */}
      <nav className="flex justify-between items-center p-6 md:px-12 max-w-7xl mx-auto border-b border-white/10">
        <div className="text-2xl font-black tracking-widest uppercase">
          Rise<span className="text-[#ff4d00]">&</span>Render
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-xs font-bold uppercase tracking-widest text-white hover:text-[#ff4d00] transition-colors border border-white/20 hover:border-[#ff4d00] px-6 py-2 rounded-full"
        >
          Client Login
        </button>
      </nav>

      {/* SERVICES SECTION */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            Choose Your <span className="text-[#ff4d00]">Blueprint</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            From virtual strategy to a fully managed done-for-you DFW studio build.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* TIER 1: VIRTUAL CONSULTATION */}
          <div className="bg-[#131313] border border-white/10 p-8 rounded-3xl flex flex-col hover:border-white/30 transition-colors">
            <h3 className="font-black text-xl uppercase tracking-widest text-white mb-2">Virtual Consultation</h3>
            <p className="text-white/50 text-sm mb-8 flex-grow">
              Stop guessing. We design a frictionless broadcast studio tailored to your exact room and budget.
            </p>
            <div className="text-3xl font-black text-white mb-8">$197 <span className="text-sm text-white/50 font-normal">/ one-time</span></div>
            <a 
              href={JOTFORM_LINKS.consultation}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-colors"
            >
              Book Strategy Session
            </a>
          </div>

          {/* TIER 2: THE BUILD-OUT */}
          <div className="bg-[#131313] border-2 border-[#ff4d00] p-8 rounded-3xl flex flex-col relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(255,77,0,0.15)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff4d00] text-black text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full">
              DFW Local Only
            </div>
            <h3 className="font-black text-xl uppercase tracking-widest text-white mb-2">The Build-Out</h3>
            <p className="text-white/50 text-sm mb-8 flex-grow">
              Fully managed on-site physical studio installation, gear procurement, and wire hiding.
            </p>
            <div className="text-3xl font-black text-white mb-2">$500 <span className="text-sm text-white/50 font-normal">/ deposit</span></div>
            <p className="text-[#ff4d00] text-xs font-bold uppercase mb-6">Projects start at $2,500+</p>
            <a 
              href={JOTFORM_LINKS.buildOut}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:scale-105"
            >
              Apply For Build-Out
            </a>
          </div>

          {/* TIER 3: POST-PRODUCTION RETAINER */}
          <div className="bg-[#131313] border border-white/10 p-8 rounded-3xl flex flex-col hover:border-white/30 transition-colors">
            <h3 className="font-black text-xl uppercase tracking-widest text-white mb-2">Post-Production</h3>
            <p className="text-white/50 text-sm mb-8 flex-grow">
              Your dedicated remote editing department. We turn raw footage into a high-converting content engine.
            </p>
            <div className="text-3xl font-black text-white mb-8">$1,500 <span className="text-sm text-white/50 font-normal">/ month</span></div>
            <a 
              href={JOTFORM_LINKS.retainer}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-colors"
            >
              Apply For Retainer
            </a>
          </div>

        </div>
      </section>
    </div>
  );
};

export default LandingPage;
