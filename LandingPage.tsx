import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import BrandLogo from './components/BrandLogo';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative h-screen w-full bg-black text-[#F5F5F0] overflow-hidden font-sans">
      <CustomCursor />

      {/* 1. CINEMATIC VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark overlay for readability */}
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

      {/* 2. TOP NAVBAR (LOGO ONLY) */}
      <nav className="absolute top-0 left-0 w-full z-50 p-6 md:p-12">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo className="h-10 md:h-16 w-auto" />
        </div>
      </nav>

      {/* 3. CENTERED CONTENT PORTAL */}
      <main className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl w-full"
        >
          {/* Scaled down for mobile edge-to-edge issue */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black mb-4 md:mb-6 leading-[0.9] tracking-tighter uppercase">
            Premium Video <br /> Podcasting Studio
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-4xl font-bold mb-12 md:mb-16 tracking-tight">
            <span className="text-[#ff4d00]">Rise In Your Purpose. Render Your Calling.</span>
          </h2>

          {/* SIMPLIFIED BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
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
        </motion.div>
      </main>

      {/* 4. MINIMALIST FOOTER (Updated Links) */}
     <footer className="absolute bottom-0 left-0 w-full z-50 p-6 md:p-12 pb-8">
  <div className="flex flex-wrap justify-center items-center gap-4 md:gap-10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/50">
    <a href="https://instagram.com/riseandrenderdfw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
    
    {/* Added target="_blank" so the map opens in a new tab */}
    <a href="https://share.google/IgqCwzByhKTVbgUZL" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">DFW Location</a>
    
    {/* Fixed the .com.com typo */}
    <a href="mailto:booking@riseandrenderdfw.com" className="hover:text-white transition-colors">Contact</a>
          
          {/* Designed by Mike Miller Media - Separated with a border line on desktop */}
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
