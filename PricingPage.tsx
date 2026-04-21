/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, TrendingUp, Video, Scissors, Share2, Palette, Clock, Calculator, ArrowRight, PlayCircle, Image as ImageIcon, Plus, Minus, FileText, Headphones, Monitor, Radio, Camera 
} from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import CustomCursor from './components/CustomCursor';
import AIChat from './components/AIChat';
import BrandLogo from './components/BrandLogo';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // CALCULATOR STATE
  const [selectedBase, setSelectedBase] = useState<'power_hour' | 'batch_day'>('power_hour');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [clipQuantity, setClipQuantity] = useState<number>(1);

  // PROMO CODE STATE
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
    // Reset clip quantity if they deselect it
    if (id === 'social_clip' && selectedAddons.includes('social_clip')) {
      setClipQuantity(1);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toLowerCase() === 'fruit15') {
      setPromoApplied(true);
      if (selectedBase !== 'power_hour') {
        setPromoMessage('Code "fruit15" is active, but only applies to The Power Hour.');
      } else {
        setPromoMessage('Success! Buy 1 Get 1 Free Hour applied.');
      }
    } else {
      setPromoApplied(false);
      setPromoMessage('Invalid discount code.');
    }
  };

  // Keep promo message accurate if they switch packages after applying
  useEffect(() => {
    if (promoApplied) {
      if (selectedBase !== 'power_hour') {
        setPromoMessage('Code "fruit15" is active, but only applies to The Power Hour.');
      } else {
        setPromoMessage('Success! Buy 1 Get 1 Free Hour applied.');
      }
    }
  }, [selectedBase, promoApplied]);

  // PRICING DATA
  const basePackages = {
    power_hour: {
      id: 'power_hour',
      name: 'The Power Hour',
      price: 250,
      time: '1 Hour',
      description: 'Perfect for a single high-impact episode.',
      features: [
        '1 Hour Recording Time',
        '30-min Arrival/Departure Buffer',
        '4K Video & Pro Lighting',
        'Engineered Audio (2 Mics)'
      ]
    },
    batch_day: {
      id: 'batch_day',
      name: 'The Batch Day',
      price: 800,
      time: '4 Hours',
      description: 'Record a month of content in one sitting.',
      features: [
        '4 Hours Recording Time',
        '30-min Arrival/Departure Buffer',
        'Multiple Wardrobe Changes',
        'High-Volume Efficiency'
      ]
    }
  };

  const addonOptions = [
    { id: 'basic_edit', name: 'Basic Editing', desc: 'Simple multi-cam cuts and color grade.', price: 150, type: 'per_episode', icon: <Scissors size={20} /> },
    { id: 'advanced_edit', name: 'Advanced Editing', desc: 'Engaging hooks & flow optimized for retention.', price: 250, type: 'per_episode', icon: <PlayCircle size={20} /> },
    { id: 'thumbnail', name: 'Custom YouTube Thumbnail', desc: 'High-CTR custom graphic design.', price: 75, type: 'per_episode', icon: <ImageIcon size={20} /> },
    { id: 'social_clip', name: 'Social Media Clip', desc: 'Vertical reels optimized for IG/TikTok.', price: 100, type: 'per_clip', icon: <Share2 size={20} /> },
    { id: 'seo_notes', name: 'SEO Show Notes', desc: 'YouTube description, summary & timestamps.', price: 50, type: 'per_episode', icon: <FileText size={20} /> },
    { id: 'audio_dist', name: 'Audio Distribution', desc: 'Master & upload to Spotify/Apple Podcasts.', price: 50, type: 'per_episode', icon: <Headphones size={20} /> },
    { id: 'teleprompter', name: 'Teleprompter Setup', desc: 'Send script in advance, we run the prompter.', price: 50, type: 'per_session', icon: <Monitor size={20} /> },
    { id: 'live_stream', name: 'Live Simulcast', desc: 'Broadcast live to YouTube/Facebook.', price: 150, type: 'per_session', icon: <Radio size={20} /> },
    { id: 'bts_broll', name: 'Behind-The-Scenes B-Roll', desc: 'Raw, cinematic vertical footage for organic social.', price: 75, type: 'per_session', icon: <Camera size={20} /> },
  ];

  // SMART LOGIC: 1 episode for normal Power Hour, 2 for BOGO Power Hour, 4 for Batch Day
  const isPromoValid = promoApplied && selectedBase === 'power_hour';
  const episodeMultiplier = selectedBase === 'batch_day' ? 4 : (isPromoValid ? 2 : 1);

  // REAL-TIME TOTAL CALCULATION
  const calculateTotal = () => {
    let total = basePackages[selectedBase].price;
    selectedAddons.forEach(id => {
      const addon = addonOptions.find(a => a.id === id);
      if (addon) {
        if (addon.type === 'per_clip') {
          total += (addon.price * clipQuantity * episodeMultiplier);
        } else if (addon.type === 'per_episode') {
          total += (addon.price * episodeMultiplier);
        } else if (addon.type === 'per_session') {
          total += addon.price; // Flat fee for the whole session
        }
      }
    });
    return total;
  };

  // GENERATE JOTFORM URL WITH DATA
  const generateJotformUrl = () => {
    const baseUrl = "https://form.jotform.com/261096943415057";
    
    // Pass promo info dynamically so you see it in JotForm
    let pkgName = basePackages[selectedBase].name;
    if (isPromoValid) {
      pkgName += ' (BOGO PROMO CLAIMED - 2 Hours Total)';
    }
    const finalPkgName = encodeURIComponent(pkgName);
    
    // Format the addons nicely for your records
    const addonsList = encodeURIComponent(selectedAddons.map(id => {
      if (id === 'social_clip') return `Social Clips (x${clipQuantity} per ep)`;
      return addonOptions.find(a => a.id === id)?.name || id;
    }).join(', ') || 'None');
    
    const total = calculateTotal();
    
    return `${baseUrl}?package=${finalPkgName}&addons=${addonsList}&total=${total}`;
  };

  return (
    <div className="relative min-h-screen bg-[#131313] text-[#F5F5F0] overflow-x-hidden">
      <CustomCursor />
      <FluidBackground />
      <AIChat />

      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#131313]/90 backdrop-blur-md border-b border-[#F5F5F0]/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo className="h-14 md:h-16 w-auto" />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#F5F5F0]/80">
          <button onClick={() => navigate('/')} className="hover:text-[#ff4d00] transition-colors">Back to Home</button>
          <button onClick={() => navigate('/login')} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full transition-all">Hub Login</button>
        </nav>
      </div>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6 md:px-12 max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.95] tracking-tighter uppercase">
            Turn Your Podcast Into A <br />
            <span className="text-[#ff4d00]">Growth Engine.</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#F5F5F0]/80 mb-10 font-medium">
            Strategy. Production. Distribution. All in one place.
          </p>
          <p className="text-lg text-[#F5F5F0]/60 max-w-2xl mx-auto leading-relaxed">
            We don’t just record podcasts. We help you clarify your message, create high-impact content, turn episodes into consistent platform-ready assets, and build real visibility and authority.
          </p>
        </motion.div>
      </section>

      {/* THE RISE PODCAST SYSTEM */}
      <section className="py-20 bg-[#0a0a0a] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4">The Rise Podcast System™</h2>
            <p className="text-[#F5F5F0]/60">Our 5-pillar framework for total content dominance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all">
              <TrendingUp className="w-10 h-10 text-[#ff4d00] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3 uppercase">1. Strategy</h3>
              <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
                <li>• Podcast positioning & audience clarity</li>
                <li>• Episode format + structure</li>
                <li>• Content calendar (4–8 weeks)</li>
                <li>• Platform strategy & growth roadmap</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all">
              <Video className="w-10 h-10 text-[#ff4d00] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3 uppercase">2. Production</h3>
              <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
                <li>• 4K multi-camera recording</li>
                <li>• Professional lighting & set design</li>
                <li>• Studio-grade audio engineering</li>
                <li>• On-site production support</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all">
              <Scissors className="w-10 h-10 text-[#ff4d00] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3 uppercase">3. Post-Production</h3>
              <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
                <li>• Full episode edit (tight pacing)</li>
                <li>• Hook optimization (first 5-15s)</li>
                <li>• Audio mastering</li>
                <li>• Branded intro/outro & visual captions</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all lg:col-span-1 md:col-span-2">
              <Share2 className="w-10 h-10 text-[#ff4d00] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3 uppercase">4. Distribution Engine</h3>
              <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
                <li>• 5–20 vertical clips per episode</li>
                <li>• Platform-optimized (TikTok, Reels, Shorts)</li>
                <li>• Hook-driven editing with visual styling</li>
                <li>• High-conversion YouTube thumbnails</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all lg:col-span-2 md:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div>
                <Palette className="w-10 h-10 text-[#ff4d00] mb-6" />
                <h3 className="text-xl font-bold text-white mb-3 uppercase">5. Branding & Growth</h3>
                <ul className="space-y-2 text-sm text-[#F5F5F0]/70 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <li>• Podcast cover art</li>
                  <li>• YouTube channel setup</li>
                  <li>• Thumbnail design system</li>
                  <li>• Social media templates</li>
                  <li>• Custom podcast landing pages</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PRICING CALCULATOR */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff4d00]/10 border border-[#ff4d00]/20 text-[#ff4d00] text-sm font-bold uppercase tracking-widest mb-6">
            <Calculator size={16} /> Interactive Estimate
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">Build Your <span className="text-[#ff4d00]">Package</span></h2>
          <p className="text-xl text-[#F5F5F0]/60 max-w-2xl mx-auto leading-relaxed">
            Select your studio time and creative add-ons below to generate a real-time estimate.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT COLUMN: SELECTIONS */}
          <div className="flex-1 space-y-12">
            
            {/* Step 1: Base Time */}
            <div>
              <h3 className="text-2xl font-black uppercase tracking-wide text-white mb-6 flex items-center gap-3">
                <span className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> 
                Select Studio Time
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(basePackages) as Array<keyof typeof basePackages>).map((key) => {
                  const pkg = basePackages[key as keyof typeof basePackages];
                  const isSelected = selectedBase === key;
                  return (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBase(key as 'power_hour' | 'batch_day')}
                      className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                        isSelected 
                        ? 'bg-gradient-to-br from-[#ff4d00]/20 to-[#1A1A1A] border-[#ff4d00] shadow-[0_0_30px_rgba(255,77,0,0.15)]' 
                        : 'bg-[#1A1A1A] border-white/5 hover:border-white/20'
                      }`}
                    >
                      {key === 'batch_day' && (
                        <div className="absolute top-0 right-0 bg-[#ff4d00] text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">Save $200</div>
                      )}
                      {key === 'power_hour' && isPromoValid && (
                        <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">+1 FREE HOUR</div>
                      )}
                      
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-black text-white uppercase tracking-tight">{pkg.name}</h4>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#ff4d00] bg-[#ff4d00]' : 'border-white/20'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-[#131313] rounded-full" />}
                        </div>
                      </div>
                      <p className="text-3xl font-black text-[#ff4d00] mb-4">${pkg.price}</p>
                      <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
                        {pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            {idx === 1 ? <Clock size={16} className="text-[#ff4d00] shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="text-[#ff4d00] shrink-0 mt-0.5" />}
                            <span>
                              {key === 'power_hour' && isPromoValid && idx === 0 ? '2 Hours Recording Time (BOGO)' : feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Add-Ons */}
            <div>
              <h3 className="text-2xl font-black uppercase tracking-wide text-white mb-6 flex items-center gap-3">
                <span className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 
                Creative Add-Ons <span className="text-xs text-white/40 font-normal tracking-normal capitalize ml-2">(Optional)</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addonOptions.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <motion.div
                      key={addon.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={addon.id !== 'social_clip' || !isSelected ? { scale: 0.98 } : {}}
                      onClick={() => toggleAddon(addon.id)}
                      className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                        isSelected 
                        ? 'bg-[#ff4d00]/10 border-[#ff4d00]/50 shadow-[0_0_20px_rgba(255,77,0,0.1)]' 
                        : 'bg-[#1A1A1A] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 w-full">
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg shrink-0 mt-1 ${isSelected ? 'bg-[#ff4d00] text-black' : 'bg-white/5 text-white/60'}`}>
                            {addon.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-white leading-tight mb-1">{addon.name}</h4>
                            <p className="text-xs text-white/50 leading-relaxed pr-2">{addon.desc}</p>
                            <p className={`text-sm font-black mt-2 ${isSelected ? 'text-[#ff4d00]' : 'text-white/60'}`}>
                              +${addon.price} 
                              <span className="text-xs font-normal">
                                {addon.type === 'per_clip' ? ' / clip' : addon.type === 'per_episode' ? ' / episode' : ' / session'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center mt-1 ${isSelected ? 'border-[#ff4d00] bg-[#ff4d00]' : 'border-white/20'}`}>
                          {isSelected && <CheckCircle2 size={14} className="text-[#131313]" />}
                        </div>
                      </div>

                      {/* QUANTITY SELECTOR FOR SOCIAL CLIPS */}
                      {addon.id === 'social_clip' && isSelected && (
                        <div 
                          className="mt-4 pt-4 border-t border-[#ff4d00]/20 flex items-center justify-between"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <span className="text-xs font-bold text-[#ff4d00] uppercase tracking-wider">Clips per episode:</span>
                          <div className="flex items-center gap-3 bg-[#131313] rounded-full p-1 border border-[#ff4d00]/30">
                            <button 
                              onClick={() => setClipQuantity(Math.max(1, clipQuantity - 1))}
                              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                              <Minus size={14} className="text-white" />
                            </button>
                            <span className="font-black text-white w-4 text-center">{clipQuantity}</span>
                            <button 
                              onClick={() => setClipQuantity(clipQuantity + 1)}
                              className="w-7 h-7 rounded-full bg-[#ff4d00]/20 hover:bg-[#ff4d00]/40 flex items-center justify-center transition-colors"
                            >
                              <Plus size={14} className="text-[#ff4d00]" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: THE RECEIPT / ESTIMATE */}
          <div className="lg:w-[400px]">
            <div className="sticky top-32 bg-[#131313] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#ff4d00]/5 to-transparent pointer-events-none" />
              
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-6 border-b border-white/10 pb-4">Estimated Investment</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start text-white/80">
                  <div className="flex flex-col">
                    <span className="font-medium">{basePackages[selectedBase].name}</span>
                    {isPromoValid && <span className="text-green-400 text-[11px] font-bold mt-1 uppercase tracking-wider">+ 1 FREE Hour Applied</span>}
                  </div>
                  <span className="font-bold mt-0.5">${basePackages[selectedBase].price}</span>
                </div>
                
                <AnimatePresence>
                  {selectedAddons.map(id => {
                    const addon = addonOptions.find(a => a.id === id);
                    if (!addon) return null;
                    
                    let itemTotal = addon.price;
                    if (addon.type === 'per_clip') {
                      itemTotal = addon.price * episodeMultiplier * clipQuantity;
                    } else if (addon.type === 'per_episode') {
                      itemTotal = addon.price * episodeMultiplier;
                    }

                    return (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        key={id} 
                        className="flex justify-between items-center text-white/60 text-sm overflow-hidden"
                      >
                        <span className="py-1 flex items-center gap-1.5 flex-wrap">
                          + {addon.name} 
                          {addon.id === 'social_clip' && clipQuantity > 1 && (
                             <span className="text-white/40 text-[10px] uppercase tracking-wider">(x{clipQuantity})</span>
                          )}
                          {addon.type !== 'per_session' && episodeMultiplier > 1 && (
                            <span className="text-[#ff4d00] text-[10px] font-black bg-[#ff4d00]/10 px-1.5 py-0.5 rounded-md shrink-0">x{episodeMultiplier} eps</span>
                          )}
                        </span>
                        <span className="py-1 shrink-0 ml-2">${itemTotal}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* PROMO CODE SECTION */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm w-full text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff4d00] transition-colors"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className={`text-xs mt-3 font-medium ${promoApplied && selectedBase === 'power_hour' ? 'text-green-400' : 'text-[#ff4d00]'}`}
                  >
                    {promoMessage}
                  </motion.p>
                )}
              </div>

              <div className="border-t border-white/10 pt-6 mt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-white/60 uppercase tracking-widest text-xs font-bold">Estimated Total</span>
                  <span className="text-5xl font-black text-[#ff4d00]">${calculateTotal()}</span>
                </div>
                <p className="text-[#F5F5F0]/40 text-xs italic mt-4 text-center leading-relaxed">
                  *This calculator provides a preview estimate. Exact pricing and packaging will be solidified during consultation. No payment required today.
                </p>
              </div>

              {/* DYNAMIC JOTFORM LINK */}
              <a 
                href={generateJotformUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-[#ff4d00] text-[#131313] px-6 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-orange-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)] text-sm relative z-10"
              >
                Submit Application <ArrowRight size={18} />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* RETAINER BANNER */}
      <section className="py-12 px-6 md:px-12 max-w-6xl mx-auto relative z-10 mb-20">
        <div className="bg-[#1A1A1A] border border-[#ff4d00]/20 rounded-3xl p-8 md:p-12 relative z-10 shadow-xl flex flex-col md:flex-row items-center gap-8 text-center md:text-left overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#ff4d00]/5 via-transparent to-transparent pointer-events-none" />
           <div className="w-16 h-16 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
             <TrendingUp className="w-8 h-8 text-[#ff4d00]" />
           </div>
           <div className="flex-1 relative z-10">
             <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Want us to handle everything?</h4>
             <p className="text-[#F5F5F0]/70 text-sm md:text-base leading-relaxed max-w-2xl mx-auto md:mx-0">
               We offer custom <strong>Rise Framework Retainers</strong> for clients who want to scale. We take over strategy, recording, end-to-end editing, and platform distribution so you can just show up and speak.
             </p>
           </div>
           <div className="flex-shrink-0 w-full md:w-auto relative z-10">
             <a 
                href="https://form.jotform.com/261096943415057"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-[#ff4d00]/50 font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all text-sm text-center"
             >
                Inquire About Retainers
             </a>
           </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-40 bg-white/10 hover:bg-[#ff4d00] text-white p-3 rounded-full transition-all shadow-xl backdrop-blur-md border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      )}

    </div>
  );
};

export default PricingPage;
