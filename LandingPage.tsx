import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Star, FolderDown, Sparkles
} from 'lucide-react';
import BrandLogo from './components/BrandLogo';

const BRANDS = [
  "She Bears Fruit Podcast", 
  "15:5 Collective", 
  "The Breakdown With Jasmine Martines", 
  "Giving While Black Podcast",
  "Words Taylor",
  "We Going Up"
];

// SAFE ANIMATION VARIANTS
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // PROMO CODE STATE
  const [promoCode, setPromoCode] = useState('');
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    document.title = "Rise & Render | Premium Content Creation Consultancy";
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // DYNAMIC JOTFORM CHECKOUT LINK FOR TIER 1
  const handleBookConsultation = () => {
    let url = "https://pci.jotform.com/form/262714847150054";
    if (promoCode.trim()) {
       url += `?coupon=${encodeURIComponent(promoCode.trim())}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#0a0a0a] text-[#F5F5F0] font-sans flex flex-col overflow-x-hidden selection:bg-[#ff4d00] selection:text-black">
      
      {/* BACKGROUND WITH FADE-IN */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="fixed inset-0 z-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-black/75 z-10" />
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40">
          <source src="/studio-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* NAVBAR */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-sm">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo className="h-8 md:h-12 w-auto drop-shadow-lg" />
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <button onClick={() => navigate('/login')} className="bg-[#ff4d00] hover:bg-orange-500 text-black px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)] text-xs uppercase tracking-wider">
            Client Login
          </button>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <main className="relative z-40 flex-grow flex flex-col items-center justify-start px-6 text-center pt-32 md:pt-44 pb-16">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-5xl w-full flex flex-col items-center">
          
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00] text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={14} /> End the struggle. Just press record.
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.95] tracking-tighter uppercase text-white drop-shadow-2xl">
            Broadcast-Ready <br /> Setups.
          </motion.h1>
          
          <motion.h2 variants={fadeUp} className="text-base sm:text-lg md:text-xl font-medium mb-10 tracking-tight max-w-2xl text-white/70 mx-auto leading-relaxed">
            Frictionless, professional studio engineering tailored to your exact space, equipment, and budget.
          </motion.h2>

          {/* VSL VIDEO CONTAINER (YOUTUBE PLAYER) */}
          <motion.div variants={fadeUp} className="w-full max-w-4xl mx-auto mb-12 relative group z-50">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff4d00]/30 to-orange-600/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-80 transition duration-1000 pointer-events-none"></div>
            <div className="relative aspect-video bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl z-10">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/TQ9gDU9QtZg?modestbranding=1&rel=0&iv_load_policy=3" 
                title="Rise & Render VSL" 
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>

          {/* CTA BUTTONS & PROMO */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 w-full max-w-md mb-20 relative z-50">
            <button 
              onClick={handleBookConsultation}
              className="flex items-center justify-center w-full bg-[#ff4d00] hover:bg-orange-500 text-black py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-[1.02] shadow-[0_0_35px_rgba(255,77,0,0.35)]"
            >
              Book Virtual Consultation — $197
            </button>
            
            <div className="flex items-center justify-between w-full px-2">
              <button onClick={() => navigate('/login')} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-1.5">
                <FolderDown size={14} /> Freebie Asset Vault
              </button>
              
              {showPromo ? (
                <div className="flex items-center bg-[#131313] border border-white/10 rounded-lg overflow-hidden">
                  <input 
                    type="text" 
                    placeholder="CODE" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="bg-transparent text-white text-[10px] px-3 py-1.5 w-24 focus:outline-none uppercase font-bold tracking-widest"
                  />
                </div>
              ) : (
                <button onClick={() => setShowPromo(true)} className="text-[10px] text-[#ff4d00] font-bold uppercase tracking-widest hover:underline">
                  Have a promo code?
                </button>
              )}
            </div>
          </motion.div>

          {/* BRANDS TICKER */}
          <motion.div variants={fadeUp} className="w-full max-w-4xl mx-auto flex flex-col items-center opacity-70 mb-28">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-6">Trusted by creators from</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {BRANDS.map((brand, index) => (
                <span key={index} className="text-white/60 font-black uppercase tracking-widest text-xs md:text-sm">{brand}</span>
              ))}
            </div>
          </motion.div>

          {/* STREAMLINED FEATURE CARDS */}
          <motion.div variants={fadeUp} className="w-full max-w-6xl mx-auto mb-28 text-left">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">Engineered For Creators</h2>
              <p className="text-white/50 max-w-xl mx-auto text-sm md:text-base">Everything you need from your first remote consultation to fully managed post-production.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-[#ff4d00]/30 transition-all">
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-3">Virtual Consultation</h3>
                  <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-6">
                    1-hour Zoom deep-dive into your room layout, acoustics, and gear list to eliminate guesswork.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                  <span>$197 One-Time</span>
                  <span className="text-[#ff4d00]">Most Popular</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-[#ff4d00]/30 transition-all">
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-3">Post-Production Retainer</h3>
                  <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-6">
                    Hit record in your space, and we handle 4K edits, vertical social clips, and custom thumbnails.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                  <span>$1,500 / mo</span>
                  <span className="text-white">Turnkey</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-[#ff4d00]/30 transition-all">
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-3">The Build-Out</h3>
                  <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-6">
                    White-glove on-site DFW studio design, acoustic treatment, mounting, cable management, and training.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                  <span>$2,500+</span>
                  <span className="text-white">On-Site</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* STREAMLINED TESTIMONIALS */}
          <motion.div variants={fadeUp} className="w-full max-w-5xl mx-auto mb-20 text-left">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2">Trusted By Creators</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111] border border-white/10 p-8 rounded-3xl flex flex-col justify-between">
                <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 font-medium">
                  "Mike transformed my office into a high-end studio. I don't have to worry about tech anymore, I just show up and record."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs font-bold text-white/60">B</div>
                  <div>
                    <p className="text-white font-bold text-xs uppercase tracking-wider">Barron D.</p>
                    <p className="text-white/40 text-[10px] uppercase">White-Glove Client</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-white/10 p-8 rounded-3xl flex flex-col justify-between">
                <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 font-medium">
                  "The Build-Out service is a lifesaver. He routed all the messy cables and trained me on the system. Incredible work."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs font-bold text-white/60">S</div>
                  <div>
                    <p className="text-white font-bold text-xs uppercase tracking-wider">Sarah L.</p>
                    <p className="text-white/40 text-[10px] uppercase">Build-Out Client</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-50 w-full p-8 md:p-12 border-t border-white/5 bg-[#080808] text-center">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-6">
          <a href="https://instagram.com/riseandrenderdfw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="mailto:booking@riseandrenderdfw.com" className="hover:text-white transition-colors">Contact</a>
          <a href="https://mikemillermedia.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Designed by Mike Miller Media</a>
        </div>
        <p className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-widest">
          ©2026 Rise + Render. All Rights Reserved.
        </p>
      </footer>

      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 left-6 z-50 bg-white/10 hover:bg-[#ff4d00] text-white p-3 rounded-full transition-all shadow-xl backdrop-blur-md border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      )}
    </div>
  );
};

export default LandingPage;
