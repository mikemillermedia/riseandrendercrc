
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Volume2, Loader2, Sparkles, Zap, Clock, Calendar } from 'lucide-react';
import { generatePackageVoiceover } from '../services/geminiService';

const MONTHLY_PACKAGES = [
  {
    name: "The Ascent",
    price: "1.5K",
    desc: "3 Hours Filming Time, 2 Long Form Videos, 4 Clips, 2 Audio Episodes, Monthly Strategy Call.",
    features: [
      { text: "3 Hours Filming Time", included: true },
      { text: "2 Videos (Long Form)", included: true },
      { text: "4 Clips (Short Form)", included: true },
      { text: "2 Episodes (Audio)", included: true },
      { text: "Channel Management", included: false },
      { text: "Custom Thumbnails", included: false },
      { text: "Social Media Posting", included: false },
      { text: "Monthly Strategy Call", included: true },
    ]
  },
  {
    name: "The Horizon",
    price: "5K",
    popular: true,
    desc: "The Full Optimization Suite. 5 Hours Filming, 4 Long Form Videos, 20 Clips, 4 Audio Episodes, Channel Management, Custom Thumbnails, Social Media Posting, and Quarterly Deep Dives.",
    features: [
      { text: "5 Hours Filming Time", included: true },
      { text: "4 Videos (Long Form)", included: true },
      { text: "20 Clips (Short Form)", included: true },
      { text: "4 Episodes (Audio)", included: true },
      { text: "Channel Management", included: true },
      { text: "Custom Thumbnails", included: true },
      { text: "Social Media Posting", included: true },
      { text: "+ Quarterly Deep Dive", included: true },
    ]
  },
  {
    name: "The Summit",
    price: "3K",
    desc: "5 Hours Filming Time, 4 Long Form Videos, 12 Clips, 4 Audio Episodes, Channel Management, and Monthly Strategy Calls.",
    features: [
      { text: "5 Hours Filming Time", included: true },
      { text: "4 Videos (Long Form)", included: true },
      { text: "12 Clips (Short Form)", included: true },
      { text: "4 Episodes (Audio)", included: true },
      { text: "Channel Management", included: true },
      { text: "Custom Thumbnails", included: false },
      { text: "Social Media Posting", included: false },
      { text: "Monthly Strategy Call", included: true },
    ]
  }
];

const HOURLY_PACKAGES = [
  {
    name: "Power Hour",
    tier: "Entry Level",
    price: "250",
    desc: "Up to 90 minutes studio time (60 min record + 30 min buffer). Raw 4K Video + Multitrack Audio. Maximum of 2 people.",
    features: [
      { text: "90 Mins Total Time", included: true },
      { text: "60 Mins Recording", included: true },
      { text: "30 Mins Buffer", included: true },
      { text: "Raw 4K Video Data", included: true },
      { text: "Multitrack Audio", included: true },
      { text: "Max 2 People", included: true },
    ]
  },
  {
    name: "Batch Day",
    tier: "Pro Level",
    price: "800",
    popular: true,
    desc: "4 Hours of record time which is effectively $200 per hour. Raw 4K Video + Multitrack Audio. Maximum of 2 people.",
    features: [
      { text: "4 Hours Record Time", included: true },
      { text: "Effective $200/hr", included: true },
      { text: "Raw 4K Video Data", included: true },
      { text: "Multitrack Audio", included: true },
      { text: "Max 2 People", included: true },
      { text: "Ideal for Content Blitz", included: true },
    ]
  }
];

const PricingSection: React.FC = () => {
  const [playingPackage, setPlayingPackage] = useState<string | null>(null);
  const [view, setView] = useState<'monthly' | 'hourly'>('monthly');

  const handleVoiceover = async (pkgName: string, pkgDesc: string) => {
    if (playingPackage) return;
    setPlayingPackage(pkgName);
    await generatePackageVoiceover(pkgName, pkgDesc);
    setTimeout(() => setPlayingPackage(null), 9000);
  };

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4d00]/10 border border-[#ff4d00]/20 text-[#ff4d00] text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-3 h-3" /> Select Your Track
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Signature <span className="text-[#ff4d00]">Pricing</span></h2>
          
          {/* Switcher */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <button 
                onClick={() => setView('monthly')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${view === 'monthly' ? 'bg-[#ff4d00] text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                <Calendar className="w-4 h-4" /> Monthly Retainers
              </button>
              <button 
                onClick={() => setView('hourly')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${view === 'hourly' ? 'bg-[#ff4d00] text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                <Clock className="w-4 h-4" /> Hourly Sessions
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'monthly' ? (
            <motion.div 
              key="monthly"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
            >
              {MONTHLY_PACKAGES.map((pkg) => (
                <motion.div
                  key={pkg.name}
                  whileHover={{ y: -5 }}
                  className={`relative p-8 rounded-[2rem] flex flex-col transition-all duration-300 ${
                    pkg.popular 
                    ? 'bg-[#1a1f26] border-2 border-[#ff4d00] shadow-[0_20px_50px_rgba(255,77,0,0.1)] z-20 md:scale-105' 
                    : 'bg-[#0d0d0d] border border-white/5 z-10'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff4d00] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-white" /> Recommended
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <span className="text-2xl font-bold text-[#ff4d00]">$</span>
                      <span className="text-5xl font-black">{pkg.price}</span>
                    </div>
                    <div className="text-slate-500 font-medium text-sm mb-6">/month</div>
                    
                    <div className="bg-[#ff4d00] text-white inline-block px-4 py-1.5 rounded-md font-bold text-sm tracking-wide mb-6">
                      {pkg.name}
                    </div>

                    <button 
                      onClick={() => handleVoiceover(pkg.name, pkg.desc)}
                      disabled={!!playingPackage}
                      className={`flex items-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest transition-all ${
                        playingPackage === pkg.name ? 'text-[#ff4d00]' : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {playingPackage === pkg.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      {playingPackage === pkg.name ? 'Generating Audio...' : 'Listen to AI Breakdown'}
                    </button>
                  </div>

                  <div className="space-y-4 flex-1">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className={`flex items-center gap-3 text-sm ${feature.included ? 'text-slate-200' : 'text-slate-600'}`}>
                        {feature.included ? (
                          <Check className="w-4 h-4 text-orange-500" />
                        ) : (
                          <X className="w-4 h-4 opacity-50" />
                        )}
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <a 
                    href="https://tally.so/r/dWxaOy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-10 w-full py-4 rounded-xl font-bold transition-all text-center block ${
                    pkg.popular 
                    ? 'bg-[#ff4d00] hover:bg-orange-500 text-white shadow-lg shadow-[#ff4d00]/20' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}>
                    Select {pkg.name}
                  </a>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="hourly"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            >
              {HOURLY_PACKAGES.map((pkg) => (
                <motion.div
                  key={pkg.name}
                  whileHover={{ y: -5 }}
                  className={`relative p-10 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 flex flex-col items-center text-center transition-all ${
                    pkg.popular ? 'border-[#ff4d00]/40 bg-gradient-to-b from-[#1a1f26] to-[#0d0d0d]' : ''
                  }`}
                >
                  <div className="font-script text-[#ff4d00] text-5xl md:text-6xl mb-2 drop-shadow-[0_0_15px_rgba(255,77,0,0.3)]">
                    {pkg.name}
                  </div>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                    ({pkg.tier})
                  </div>
                  
                  <div className="mb-8">
                    <span className="text-[#f5f5f0] text-7xl md:text-8xl font-black">
                      <span className="text-[#ff4d00] text-4xl align-top mr-1">$</span>
                      {pkg.price}
                    </span>
                  </div>

                  <div className="text-slate-300 text-sm leading-relaxed mb-10 max-w-xs">
                    {pkg.desc}
                  </div>

                  <div className="space-y-4 mb-12 w-full text-left max-w-[240px] mx-auto">
                    {pkg.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                        <Check className="w-4 h-4 text-[#ff4d00]" />
                        <span>{f.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto space-y-4 w-full">
                    <a 
                      href="https://tally.so/r/dWxaOy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-[#ff4d00] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/20 block"
                    >
                      Book Now
                    </a>
                    
                    <button 
                      onClick={() => handleVoiceover(pkg.name, pkg.desc)}
                      disabled={!!playingPackage}
                      className="flex items-center gap-2 mx-auto text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                    >
                      {playingPackage === pkg.name ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                      {playingPackage === pkg.name ? 'Briefing...' : 'Listen to Session Overview'}
                    </button>
                  </div>

                  {/* Icon at bottom like in user images */}
                  <div className="mt-10 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-white/40 font-black text-xs">R</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-24 text-center">
          <p className="text-slate-600 font-bold tracking-[0.3em] uppercase text-sm mb-2">Build Your Presence</p>
          <p className="text-[#ff4d00] font-black text-lg md:text-2xl tracking-widest uppercase">www.riseandrenderdfw.com</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
