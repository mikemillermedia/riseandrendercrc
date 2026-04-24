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
        <div className="absolute inset-0 bg-black/50 z-10" /> {/* Dark overlay for readability */}
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
      <nav className="absolute top-0 left-0 w-full z-50 p-8 md:p-12">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo className="h-12 md:h-16 w-auto" />
        </div>
      </nav>

      {/* 3. CENTERED CONTENT PORTAL */}
      <main className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl"
        >
          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black mb-6 leading-[0.9] tracking-tighter uppercase">
            Premium Video <br /> Podcasting Studio
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold mb-16 tracking-tight">
            <span className="text-[#ff4d00]">Rise In Your Purpose. Render Your Calling.</span>
          </h2>

          {/* SIMPLIFIED BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-105"
            >
              Studio Bookings
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-105"
            >
              Community Hub
            </button>
          </div>
        </motion.div>
      </main>

      {/* 4. MINIMALIST FOOTER */}
      <footer className="absolute bottom-0 left-0 w-full z-50 p-8 md:p-12">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/40">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">DFW Location</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p className="text-[10px] text-center mt-6 text-white/20 uppercase tracking-widest">
          ©2026 Rise + Render. All Rights Reserved.
        </p>
      </footer>

      {/* BOTTOM LOGO ACCENT */}
      <div className="absolute bottom-8 right-8 z-50 hidden md:block">
        <div className="w-12 h-12 bg-[#ff4d00] rounded-xl flex items-center justify-center font-black text-black text-2xl shadow-lg">
          R
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
