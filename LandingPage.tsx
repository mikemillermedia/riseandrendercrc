/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Star, CheckCircle2, Scissors, Share2, PlayCircle, 
  Image as ImageIcon, FileText, Headphones, Monitor, Radio, Camera 
} from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import BrandLogo from './components/BrandLogo';
import FluidBackground from './components/FluidBackground'; // Assuming you still want to use this for the pricing section

// --- BRANDS ---
const BRANDS = [
  "She Bears Fruit Podcast", 
  "15:5 Collective", 
  "The Breakdown With Jasmine Martines", 
  "Giving While Black Podcast", 
];

// --- LUXURY ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1 
    } 
  }
};

// --- PRICING DATA ---
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

const CombinedPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Refs for scrolling
  const pricingRef = useRef<HTMLDivElement>(null);

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

    // --- NATIVE SEO LOGIC ---
    document.title = "Rise & Render | Premium Video Podcasting Studio DFW";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    const descriptionText = "Dallas/Fort Worth's premier video podcasting studio. Rise in your purpose. Render your calling. Build your custom podcast studio package today.";
    
    if (metaDescription) {
      metaDescription.setAttribute("content", descriptionText);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute("content", descriptionText);
      document.head.appendChild(metaDescription);
    }
  }, []);

  // --- SCROLL HANDLER ---
  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- PRICING LOGIC ---
  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
    if (id === 'social_clip' && !selectedAddons.includes('social_clip')) {
      setClipQuantity(1);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toLowerCase() === 'fruit15') {
      setPromoApplied(true);
      if (selectedBase === 'power_hour') {
        setPromoMessage('Success! Buy 1 Get 1 Free Hour applied.');
      } else {
        setPromoMessage('Success! $200 Off applied.');
      }
    } else {
      setPromoApplied(false);
      setPromoMessage('Invalid discount code.');
    }
  };

  useEffect(() => {
    if (promoApplied) {
      if (selectedBase === 'power_hour') {
        setPromoMessage('Success! Buy 1 Get 1 Free Hour applied.');
      } else {
        setPromoMessage('Success! $200 Off applied.');
      }
    }
  }, [selectedBase, promoApplied]);

  const isPowerHourPromo = promoApplied && selectedBase === 'power_hour';
  const isBatchDayPromo = promoApplied && selectedBase === 'batch_day';
  const episodeMultiplier = selectedBase === 'batch_day' ? 4 : (isPowerHourPromo ? 2 : 1);

  const calculateTotal = () => {
    let total = basePackages[selectedBase].price;
    if (isBatchDayPromo) total -= 200;
    selectedAddons.forEach(id => {
      const addon = addonOptions.find(a => a.id === id);
      if (addon) {
        if (addon.type === 'per_clip') {
          total += (addon.price * clipQuantity * episodeMultiplier);
        } else if (addon.type === 'per_episode') {
          total += (addon.price * episodeMultiplier);
        } else if (addon.type === 'per_session') {
          total += addon.price; 
        }
      }
    });
    return total;
  };

  const generateCalculatorUrl = () => {
    const baseUrl = "https://form.jotform.com/261096943415057";
    let pkgName = basePackages[selectedBase].name;
    if (isPowerHourPromo) pkgName += ' (BOGO PROMO CLAIMED)';
    else if (isBatchDayPromo) pkgName += ' (PROMO CLAIMED - $200 Off)';
    const finalPkgName = encodeURIComponent(pkgName);
    const addonsList = encodeURIComponent(selectedAddons.map(id => {
      if (id === 'social_clip') return `Social Clips (x${clipQuantity} per ep)`;
      return addonOptions.find(a => a.id === id)?.name || id;
    }).join(', ') || 'None');
    const total = calculateTotal();
    return `${baseUrl}?package=${finalPkgName}&addons=${addonsList}&total=${total}`;
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-[#F5F5F0] font-sans flex flex-col">
      <CustomCursor />

      {/* 1. CINEMATIC VIDEO BACKGROUND */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="fixed inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/studio-bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>

      {/* 2. TOP NAVBAR */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        className="absolute top-0 left-0 w-full z-50 p-6 md:p-12"
      >
        <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <BrandLogo className="h-10 md:h-16 w-auto" />
        </div>
      </motion.nav>

      {/* 3. HERO SECTION */}
      <main className="relative z-20 flex flex-col items-center justify-start px-6 text-center min-h-screen">
        
        <div className="h-32 md:h-64 flex-shrink-0" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-6xl w-full flex flex-col items-center"
        >
          {/* TITLE */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black mb-4 md:mb-6 leading-[0.9] tracking-tighter uppercase"
          >
            Premium Video <br /> Podcasting Studio
          </motion.h1>
          
          {/* SUBTITLE */}
          <motion.h2 
            variants={itemVariants}
            className="text-lg sm:text-2xl md:text-4xl font-bold mb-12 md:mb-16 tracking-tight"
          >
            <span className="text-[#ff4d00]">Rise In Your Purpose. Render Your Calling.</span>
          </motion.h2>

          {/* BUTTONS */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full mb-16"
          >
            <button
              onClick={scrollToPricing} // UPDATED TO SCROLL
              className="w-full sm:w-64 bg-[#ff4d00] hover:bg-[#e64500] text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,77,0,0.4)]"
            >
              Studio Pricing
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105"
            >
              Community Hub
            </button>
          </motion.div>

          {/* INFINITE BRAND TICKER */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-2xl mx-auto flex flex-col items-center opacity-80 mb-20 md:mb-32"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-6">
              Trusted by creators from
            </p>
            <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <motion.div
                className="flex whitespace-nowrap items-center gap-12 sm:gap-20"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: 12, 
                }}
              >
                {[...BRANDS, ...BRANDS].map((brand, index) => (
                  <span 
                    key={index} 
                    className="text-white/50 font-black uppercase tracking-widest text-sm md:text-base"
                  >
                    {brand}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* SPOTLIGHT GOOGLE REVIEW */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-4xl mx-auto mb-32 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d00]/20 via-transparent to-transparent rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" />
            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 md:p-14 rounded-[2.5rem] text-left shadow-2xl overflow-hidden transition-all duration-500 hover:border-white/20">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={22} className="text-[#ff4d00] fill-[#ff4d00]" />
                    ))}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug md:leading-tight mb-4">
                    "10/10 recommended! I loved working with this studio. Not only was it <span className="text-[#ff4d00]">easy to just show up and record</span> for the day, but the space was very clean, tidy and stunning in person. The <span className="text-[#ff4d00]">video quality is top tier</span>, and you can tell everything is being done professionally."
                  </h3>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8">
                    "I loved that they have a bathroom in the space so you don't have to go far if you need it, and there's a place to hang and steam your clothes if you're doing outfit changes. I definitely recommend working with this company!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden">
                      <span className="text-white/50 font-bold">C</span>
                    </div>
                    <div>
                      <p className="text-white font-black uppercase tracking-widest text-sm">Candace J</p>
                      <div className="flex items-center gap-2 mt-1">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-3.5 h-3.5" />
                        <p className="text-white/50 text-xs font-medium">Verified Google Review</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* 4. PRICING SECTION (Target of Scroll) */}
      <section 
        ref={pricingRef} 
        className="relative z-20 w-full bg-[#0a0a0a] border-t border-white/10 pt-32 pb-24 px-6"
      >
        <FluidBackground /> {/* Optional fluid ambient effect behind pricing */}
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Build Your Package</h2>
            <p className="text-white/60 text-lg">Select your base session and add the post-production services you need.</p>
          </motion.div>

          {/* BASE PACKAGE TOGGLE */}
          <div className="flex flex-col md:flex-row justify-center gap-6 mb-16">
            {(Object.keys(basePackages) as Array<keyof typeof basePackages>).map((key) => {
              const pkg = basePackages[key];
              const isSelected = selectedBase === key;
              return (
                <div 
                  key={key}
                  onClick={() => setSelectedBase(key)}
                  className={`flex-1 cursor-pointer p-8 rounded-3xl border transition-all duration-300 ${
                    isSelected 
                      ? 'bg-[#1a1a1a] border-[#ff4d00] shadow-[0_0_30px_rgba(255,77,0,0.15)] scale-105' 
                      : 'bg-[#0f0f0f] border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">{pkg.name}</h3>
                    {isSelected && <CheckCircle2 className="text-[#ff4d00]" size={28} />}
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-black">${pkg.price}</span>
                    <span className="text-white/50 text-sm ml-2">/ {pkg.time}</span>
                  </div>
                  <p className="text-white/70 text-sm mb-6">{pkg.description}</p>
                  <ul className="space-y-3">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-center text-sm text-white/80">
                        <CheckCircle2 size={16} className="text-[#ff4d00] mr-3 shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* ADD-ONS GRID */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-center">Optional Add-Ons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addonOptions.map(addon => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <div 
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
                      isSelected 
                        ? 'bg-[#ff4d00]/10 border-[#ff4d00]' 
                        : 'bg-[#151515] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={isSelected ? 'text-[#ff4d00]' : 'text-white/50'}>
                          {addon.icon}
                        </div>
                        <span className="font-bold text-sm">{addon.name}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={18} className="text-[#ff4d00]" />}
                    </div>
                    <p className="text-white/50 text-xs mb-3">{addon.desc}</p>
                    <div className="font-mono text-sm font-bold text-[#ff4d00]">
                      +${addon.price} <span className="text-white/30 text-xs">{addon.type.replace('_', ' ')}</span>
                    </div>

                    {/* Clip Quantity Input if Social Clip is selected */}
                    {addon.id === 'social_clip' && isSelected && (
                      <div className="mt-4 flex items-center justify-between bg-black/50 p-2 rounded-lg" onClick={e => e.stopPropagation()}>
                        <span className="text-xs text-white/70">Quantity per episode:</span>
                        <input 
                          type="number" 
                          min="1" 
                          max="10"
                          value={clipQuantity}
                          onChange={(e) => setClipQuantity(parseInt(e.target.value) || 1)}
                          className="w-16 bg-transparent text-right outline-none text-white font-bold"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* SUMMARY & PROMO */}
          <div className="bg-[#151515] border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 pb-8 border-b border-white/10">
              <div className="w-full sm:w-auto flex-1">
                <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2 block">Promo Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code..."
                    className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none text-white w-full focus:border-[#ff4d00] transition-colors"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold uppercase text-xs transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-xs mt-2 ${promoApplied ? 'text-green-400' : 'text-red-400'}`}>
                    {promoMessage}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Estimated Total</p>
                <div className="text-5xl font-black text-[#ff4d00]">${calculateTotal()}</div>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = generateCalculatorUrl()}
              className="w-full bg-[#ff4d00] hover:bg-[#e64500] text-white py-5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(255,77,0,0.3)]"
            >
              Book This Package
            </button>
          </div>
        </div>
      </section>

      {/* 5. MINIMALIST FOOTER */}
      <footer className="relative z-50 w-full bg-[#0a0a0a] p-6 md:p-12 pb-8 mt-auto border-t border-white/5">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/50">
          <a href="https://instagram.com/riseandrenderdfw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="https://share.google/IgqCwzByhKTVbgUZL" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">DFW Location</a>
          <a href="mailto:booking@riseandrenderdfw.com" className="hover:text-white transition-colors">Contact</a>
          
          <div className="hidden md:block w-px h-4 bg-white/20"></div>
          
          <a href="https://mikemillermedia.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Designed by Mike Miller Media</a>
        </div>
        <p className="text-[9px] md:text-[10px] text-center mt-6 text-white/30 uppercase tracking-widest">
          ©2026 Rise + Render. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default CombinedPage;