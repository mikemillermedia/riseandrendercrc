import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import BrandLogo from './components/BrandLogo';

// 1. UPDATE YOUR BRANDS HERE:
const BRANDS = [
  "The Breakdown With Jasmine Martines", 
  "She Bears Fruit Podcast", 
  "15:5 Collective", 
  "Giving While Black Podcast",
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    // min-h-screen flex flex-col is correct and we keep it to allow the page to naturally flow.
    <div className="relative min-h-screen w-full bg-black text-[#F5F5F0] font-sans flex flex-col">
      <CustomCursor />

      {/* 1. CINEMATIC VIDEO BACKGROUND */}
      <div className="fixed inset-0 z-0">
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
      </div>

      {/* 2. TOP NAVBAR */}
      <nav className="absolute top-0 left-0 w-full z-50 p-6 md:p-12">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo className="h-10 md:h-16 w-auto" />
        </div>
      </nav>

      {/* 3. LOWERED CONTENT PORTAL */}
      {/* ---> HERE IS THE REVISED FIX <--- */}
      {/* Removed all pt-40, pt-64, pb-10, pb-16 padding. We are now using a clean, responsive spacer. Removed my-auto from motion.div for direct control. */}
      <main className="relative z-20 flex-grow flex flex-col items-center justify-start px-6 text-center">
        
        {/* NEW SPACER DIV: This is what is pushing the content down. h-32 for mobile, h-64 for desktop.
           Adjust these values for more or less space from the top. */}
        <div className="h-32 md:h-64 flex-shrink-0" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl w-full flex flex-col items-center"
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black mb-4 md:mb-6 leading-[0.9] tracking-tighter uppercase">
            Premium Video <br /> Podcasting Studio
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-4xl font-bold mb-12 md:mb-16 tracking-tight">
            <span className="text-[#ff4d00]">Rise In Your Purpose. Render Your Calling.</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full mb-16">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105"
            >
              Studio Bookings
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105"
            >
              Community Hub
            </button>
          </div>

          {/* INFINITE BRAND TICKER (Removed mb-24 and mb-32 for tighter footer) */}
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center opacity-80">
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
                  duration: 25,
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
          </div>

        </motion.div>
      </main>

      {/* 4. MINIMALIST FOOTER */}
      {/* Changed to relative z-50 and mt-auto to push it to the absolute bottom. Tighter spacing now without the main container padding. */}
      <footer className="relative z-50 w-full p-6 md:p-12 pb-8 mt-auto">
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

export default LandingPage;
