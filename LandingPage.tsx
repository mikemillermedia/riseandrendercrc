import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, X, Share2, Mic, Globe, ArrowRight 
} from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import CustomCursor from './components/CustomCursor';
import BrandLogo from './components/BrandLogo';
import mikeMillerImage from './mike-miller.png';
import headerImage from './studio set 1 still_1.1.1.png';
import dfwImage from './studio 2 set still_1.1.2.png';

const LandingPage: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'Rise & Render Community',
      text: 'Check out this private community for faith-driven creators!',
      url: window.location.origin, 
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Share canceled or failed', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#F5F5F0] overflow-hidden font-sans">
      <CustomCursor />
      <FluidBackground />

      {/* HEADER / NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-[#F5F5F0]/5 px-6 lg:px-12 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <BrandLogo className="h-14 md:h-16 w-auto" />
        </div>

       {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-base font-bold text-[#F5F5F0]/80">
          <button onClick={() => navigate('/pricing')} className="hover:text-[#ff4d00] transition-colors">Studio Packages</button>
          <button onClick={() => navigate('/login')} className="hover:text-[#ff4d00] transition-colors">The Community</button>
          
          <button onClick={handleShare} className="hover:text-[#ff4d00] transition-colors flex items-center gap-2">
            <Share2 size={18} /> Share
          </button>
          
          <button onClick={() => navigate('/login')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full transition-all tracking-wide">Hub Login</button>
        </nav>

        <button 
          className="md:hidden text-[#F5F5F0]/80 hover:text-[#ff4d00] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[88px] left-0 w-full bg-[#131313] border-b border-[#F5F5F0]/10 flex flex-col items-center py-8 gap-8 text-lg font-bold text-[#F5F5F0]/80 z-40 shadow-2xl">
          <button onClick={() => { navigate('/pricing'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">Studio Packages</button>
          <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">The Community</button>
          
          <button onClick={() => { handleShare(); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors flex items-center gap-2">
            <Share2 size={20} /> Share Site
          </button>
          
          <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-full transition-all">Hub Login</button>
        </div>
      )}

      {/* THE GATEWAY HERO (Cinematic entry to the magic) */}
      <section className="relative pt-40 pb-20 max-w-[1440px] mx-auto flex flex-col items-center text-center overflow-hidden min-h-[90vh] justify-center">
        
        {/* Immersive grey depth mesh background */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div className="absolute top-0 -left-1/4 w-3/4 h-3/4 bg-[#ff4d00]/15 rounded-full filter blur-[150px] mix-blend-screen opacity-60" />
        <div className="absolute bottom-0 -right-1/4 w-3/4 h-3/4 bg-[#ff4d00]/10 rounded-full filter blur-[150px] mix-blend-screen opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#131313] mix-blend-multiply opacity-90" />
        
        {/* Subtle glowing orb behind text for atmospheric depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff4d00] rounded-full mix-blend-screen filter blur-[250px] opacity-[0.05] pointer-events-none z-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 w-full max-w-5xl mx-auto px-6 md:px-0Hero title (SCALED FOR MOBILE)"
        >
          {/* text-4xl on tiny screens prevents edge-to-edge */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-black mb-8 leading-[0.92] text-[#F5F5F0] tracking-tighter uppercase">
            Premium Video <br/> Podcasting Studio
          </h1>
          {/* Subtitle (SCALED FOR MOBILE) */}
          <h2 className="text-xl md:text-4xl font-bold mb-8 leading-[0.92] tracking-tighter uppercaseSubheadline title orangeaccent">
            Rise In Your Purpose. Render Your Calling.
          </h2>

          <p className="text-xl md:text-3xl text-[#F5F5F0]/70 max-w-4xl mx-auto mb-20 font-medium leading-relaxedStreamlined description">
            We bridge the gap between your God-given message and the technical excellence required to share it. View our Studio or Community packages below to enter the magic.
          </p>
        </motion.div>

        {/* THE TWO PATHS (SPLIT CARDS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1200px] relative z-20 px-6 mt-16">
          
          {/* PATH 1: THE STUDIO */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative rounded-[3rem] overflow-hidden bg-[#131313] border border-white/5 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)]Signature cards glassmorphism"
            onClick={() => navigate('/pricing')}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
            <img 
              src={dfwImage} 
              alt="DFW Studio placeholder" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
            />
            <div className="relative z-20 p-12 md:p-16 h-full flex flex-col justify-end min-h-[500px] text-left">
              <div className="w-16 h-16 rounded-2xl bg-[#ff4d00] flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,77,0,0.5)]Most popular accent">
                <Mic className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4Signature titles text-white uppercase">The Studio</h3>
              <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-md">
                Local to DFW? Step into our high-end recording space. 4K video, engineered audio, and full-service post-production. You show up and speak; we handle the rest.
              </p>
              <div className="flex items-center gap-3 text-[#ff4d00] font-black uppercase tracking-widest text-lg group-hover:translate-x-2 transition-transform">
                View Studio Packages <ArrowRight size={24} />
              </div>
            </div>
          </motion.div>

          {/* PATH 2: THE COMMUNITY */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative rounded-[3rem] overflow-hidden bg-[#131313] border border-white/5 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            onClick={() => navigate('/login')}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
            {/* Using the standard grayscale studio placeholder image as a community placeholder */}
            <img 
              src={headerImage} 
              alt="Digital Community placeholder" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
            />
            <div className="relative z-20 p-12 md:p-16 h-full flex flex-col justify-end min-h-[500px] text-left">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 group-hover:bg-white/20 transition-colors">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">The Community</h3>
              <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-md">
                Master your gear, dial in your remote setup, and connect with a global network of faith-driven creators building their digital legacy.
              </p>
              <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-lg group-hover:translate-x-2 transition-transform">
                Enter The Hub <ArrowRight size={24} />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* FOUNDER STORY SECTION - establishing trust after CTAs */}
      <section className="py-32 bg-[#131313] text-[#F5F5F0] relative overflow-hidden mt-20Founder story parallax section">
        <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-[#ff4d00] rounded-full mix-blend-screen filter blur-[250px] opacity-[0.03] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-black mb-12 uppercase tracking-tighterHeading orange accent">The Vision <br/><span className="text-[#ff4d00]">Behind It</span></h2>
              <div className="space-y-6 text-xl text-[#F5F5F0]/70 leading-relaxedDesc offwhite tracking medium fontInter">
                <p>
                  For years, our founder Mike Miller has helped brands and small businesses with equipment, gear setups, and media production through <a href="https://mikemillermedia.com" target="_blank" rel="noopener noreferrer" className="text-[#ff4d00] hover:underline font-bold">Mike Miller Media</a>.
                </p>
                <p>
                  But after helping many build their platforms, Mike realized a deep need to build within the Kingdom of God. Through fasting and prayer, he was guided to shift the focus of Rise & Render. It is no longer just a studio—it is a dedicated ecosystem.
                </p>
                <p className="font-medium text-[#F5F5F0] border-l-[4px] border-[#ff4d00] pl-6 py-2 mt-8 bg-white/5 rounded-r-xlQuote fontMedium bordersolidpl6 py2mt8">
                  "This is a community built primarily for creatives representing Christ. We are here to help you master the tools of the trade so you can share your message with excellence."
                </p>
              </div>
            </div>
            <div className="relative mt-10 xl:mt-0">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-[#F5F5F0]/10 relative shadow-2xl max-w-lg mx-auto xl:ml-autoImg founder aspect45 rounded3rem bordersolidp10">
                <img 
                  src={mikeMillerImage} 
                  alt="Mike Miller - Founder of Rise & Render" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-covergrayscale opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#ff4d00]/20 rounded-full filter blur-[60px]" />
            </div>
          </div>
        </div>
      </section>

      {/* MINIMAL TESTIMONIALS */}
      <section className="py-32 bg-[#0a0a0a] text-[#F5F5F0] relative overflow-hiddenTestimonials section black">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase testimonialsheading">
              Client <span className="text-[#ff4d00] testimonialhighlight">Success</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6">
            <div className="bg-[#131313] p-10 rounded-[2rem] border border-[#F5F5F0]/5 relative flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <p className="text-lg text-[#F5F5F0]/70 italic leading-relaxed mb-10Testimonial text offwhite italic">
                "Mike provided me with guidance on how to setup my podcast and best practices to help my video podcast get started. I have since recorded many special episodes!"
              </p>
              <div>
                <p className="text-lg font-bold text-whiteTestimonial author bold white">— Damon F.</p>
                <p className="text-[#ff4d00]">Podcast Host</p>
              </div>
            </div>

            <div className="bg-[#131313] p-10 rounded-[2rem] border border-[#F5F5F0]/5 relative flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <p className="text-lg text-[#F5F5F0]/70 italic leading-relaxed mb-10">
                "Rise & Render completely transformed the way we approach content. The remote consulting helped us dial in our lighting and audio without having to buy a whole new studio."
              </p>
              <div>
                <p className="text-lg font-bold text-white">— Richard H.</p>
                <p className="text-[#ff4d00]">YouTube Creator</p>
              </div>
            </div>

            <div className="bg-[#131313] p-10 rounded-[2rem] border border-[#F5F5F0]/5 relative flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <p className="text-lg text-[#F5F5F0]/70 italic leading-relaxed mb-10">
                "Having access to the DFW studio was a game changer. All I had to do was show up and speak my message. The team handled the rest with absolute excellence."
              </p>
              <div>
                <p className="text-lg font-bold text-white">— Jasmine B.</p>
                <p className="text-[#ff4d00]">Author & Speaker</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 left-8 z-40 bg-white/10 hover:bg-[#ff4d00] text-white p-4 rounded-full transition-all shadow-2xl backdrop-blur-md border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      )}

      {/* MINIMAL FOOTER WITH NEW LINKS (Removed Terms/Privacy and added Instagram/Designed By) */}
      <footer className="w-full z-10 py-10 px-6 md:px-12 border-t border-[#F5F5F0]/5">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/40">
          <a href="https://instagram.com/riseandrenderdfw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">DFW Location</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
          <a href="https://mikemillermedia.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors ml-4 border-l pl-4 border-white/10">Designed by Mike Miller Media</a>
        </div>
        <p className="text-[10px] text-center mt-6 text-white/20 uppercase tracking-widest">
          ©2026 Rise + Render. All Rights Reserved.
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;
