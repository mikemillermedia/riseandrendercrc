import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Star, CheckCircle2, TrendingUp, FileText, Wrench, Compass 
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

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    document.title = "Rise & Render | Premium Content Creation Consultancy";
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-[#F5F5F0] font-sans flex flex-col overflow-x-hidden">
      
      {/* BACKGROUND WITH FADE-IN */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="fixed inset-0 z-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60">
          <source src="/studio-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* NAVBAR */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="fixed top-0 left-0 w-full z-50 p-6 md:p-12 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo className="h-10 md:h-16 w-auto drop-shadow-lg" />
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <button onClick={() => navigate('/login')} className="bg-[#ff4d00] hover:bg-orange-500 text-black px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,77,0,0.4)]">
            Client Login
          </button>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <main className="relative z-40 flex-grow flex flex-col items-center justify-start px-6 text-center pt-48 pb-20">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-6xl w-full flex flex-col items-center">
          
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black mb-4 md:mb-6 leading-[0.9] tracking-tighter uppercase text-white drop-shadow-2xl">
            Build Your Personal <br /> Content Sanctuary
          </motion.h1>
          
          <motion.h2 variants={fadeUp} className="text-lg sm:text-xl md:text-3xl font-bold mb-12 md:mb-16 tracking-tight max-w-3xl text-white drop-shadow-lg">
            We transform your room or office into a frictionless broadcast studio. <br className="hidden md:block"/>
            <span className="text-[#ff4d00] mt-2 block drop-shadow-md">Rise In Your Purpose. Render Your Calling.</span>
          </motion.h2>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full mb-16">
            <button className="w-full sm:w-72 bg-[#ff4d00] hover:bg-orange-500 text-black py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,77,0,0.3)]">
              Book Virtual Consultation
            </button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105 shadow-xl">
              Sanctuary Hub
            </button>
          </motion.div>

          {/* BRANDS STATIC LIST */}
          <motion.div variants={fadeUp} className="w-full max-w-4xl mx-auto flex flex-col items-center opacity-80 mb-20 md:mb-24">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-6 drop-shadow-md">Trusted by creators from</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {BRANDS.map((brand, index) => (
                <span key={index} className="text-white/60 font-black uppercase tracking-widest text-xs md:text-sm drop-shadow-sm text-center">{brand}</span>
              ))}
            </div>
          </motion.div>

          {/* 3 GRID TESTIMONIALS */}
          <motion.div variants={fadeUp} className="w-full max-w-6xl mx-auto mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              
              {/* Testimonial 1 */}
              <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] text-left shadow-2xl relative overflow-hidden group hover:border-white/20 transition-colors flex flex-col h-full">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff4d00]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-[#ff4d00] fill-[#ff4d00]" />)}
                </div>
                <h3 className="text-sm md:text-base font-bold text-white leading-relaxed mb-6 flex-grow">
                  "10/10 recommended! Mike transformed my spare room into a <span className="text-[#ff4d00]">high-end studio</span>. I don't have to worry about tech anymore, I just <span className="text-[#ff4d00]">show up and record</span>."
                </h3>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    <span className="text-white/50 font-bold text-sm">C</span>
                  </div>
                  <div>
                    <p className="text-white font-black uppercase tracking-widest text-[10px]">Candace J.</p>
                    <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">White-Glove Client</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] text-left shadow-2xl relative overflow-hidden group hover:border-white/20 transition-colors flex flex-col h-full">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff4d00]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-[#ff4d00] fill-[#ff4d00]" />)}
                </div>
                <h3 className="text-sm md:text-base font-bold text-white leading-relaxed mb-6 flex-grow">
                  "The Virtual Consultation blew my mind. Mike gave me a custom blueprint for my exact office layout. I finally know <span className="text-[#ff4d00]">what gear to buy</span> and <span className="text-[#ff4d00]">where to put it</span>."
                </h3>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    <span className="text-white/50 font-bold text-sm">M</span>
                  </div>
                  <div>
                    <p className="text-white font-black uppercase tracking-widest text-[10px]">Marcus T.</p>
                    <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">Consultation Client</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] text-left shadow-2xl relative overflow-hidden group hover:border-white/20 transition-colors flex flex-col h-full">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff4d00]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-[#ff4d00] fill-[#ff4d00]" />)}
                </div>
                <h3 className="text-sm md:text-base font-bold text-white leading-relaxed mb-6 flex-grow">
                  "The White-Glove service is a lifesaver. They came in, <span className="text-[#ff4d00]">routed all the messy cables</span>, and trained me on the system. Now my podcast looks incredibly professional."
                </h3>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    <span className="text-white/50 font-bold text-sm">S</span>
                  </div>
                  <div>
                    <p className="text-white font-black uppercase tracking-widest text-[10px]">Sarah L.</p>
                    <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">White-Glove Client</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* GRADIENT TRANSITION */}
      <div className="relative z-40 w-full h-32 bg-gradient-to-b from-transparent to-[#0a0a0a] pointer-events-none -mb-1" />

      {/* PROCESS & PRICING SECTION */}
      <div id="pricing-section" className="relative z-40 bg-[#0a0a0a] w-full pt-10">
        
        {/* THE 4-STEP SANCTUARY PROCESS */}
        <section className="py-12 relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">The Sanctuary Process</h2>
              <p className="text-[#F5F5F0]/60 max-w-xl mx-auto">Our 4-step framework to transform your space into a frictionless production powerhouse.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Compass, title: "1. Strategy", lines: ["Space Assessment", "Content Goals", "Budget Mapping", "Tech Audit"] },
                { icon: FileText, title: "2. The Blueprint", lines: ["Custom Gear List", "Acoustic Treatment", "Lighting Layout", "Camera Settings"] },
                { icon: Wrench, title: "3. Installation", lines: ["Wire Hiding", "Equipment Mounting", "Audio Tuning", "1-on-1 Training"] },
                { icon: TrendingUp, title: "4. Execution", lines: ["Hit Record", "Frictionless Workflow", "Post-Production", "Audience Growth"] }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
                  className="bg-[#0a0a0a]/80 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:bg-[#131313]/90 transition-all duration-300 hover:-translate-y-2 hover:border-[#ff4d00]/30 shadow-lg"
                >
                  <item.icon className="w-10 h-10 text-[#ff4d00] mb-6" />
                  <h3 className="text-xl font-bold text-white mb-3 uppercase">{item.title}</h3>
                  <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
                    {item.lines.map((line, lidx) => <li key={lidx}>• {line}</li>)}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* RETAINERS */}
        <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto relative z-10 w-full mb-16">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 text-white">White-Glove <span className="text-[#ff4d00]">Setups</span></h2>
            <p className="text-xl text-[#F5F5F0]/80 max-w-2xl mx-auto leading-relaxed">
              For creators who want us to handle everything from gear procurement to physical installation in the DFW area.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="bg-[#131313]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col shadow-xl">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">The Build-Out</h3>
              <p className="text-4xl font-black text-[#ff4d00] mb-6">$2,500+<span className="text-sm text-white/40 font-medium"> / one-time</span></p>
              <ul className="space-y-4 text-sm text-[#F5F5F0]/80 mb-10 flex-grow">
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Deep Space Strategy & Acoustic Plan</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Full Gear Procurement (Cameras, Mics, Lights)</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Local DFW On-Site Installation & Wire Hiding</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 1-on-1 Operational Training</li>
              </ul>
              <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-colors border border-white/10">Apply For Build-Out</button>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="bg-[#0a0a0a]/90 backdrop-blur-xl p-8 rounded-3xl border border-[#ff4d00]/50 flex flex-col shadow-[0_0_40px_rgba(255,77,0,0.2)] transform lg:-translate-y-4 relative">
              <div className="absolute top-0 right-0 bg-[#ff4d00] text-black text-xs font-black uppercase px-4 py-1.5 rounded-bl-xl">Popular Add-On</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Post-Production Retainer</h3>
              <p className="text-4xl font-black text-[#ff4d00] mb-6">$1,500<span className="text-sm text-white/40 font-medium"> / mo</span></p>
              <ul className="space-y-4 text-sm text-[#F5F5F0]/80 mb-10 flex-grow">
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Hit record in your new space, we handle the rest.</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 4 Full-Length 4K Video Edits per month</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 12 Social Media Vertical Clips</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Custom YouTube Thumbnails</li>
              </ul>
              <button className="w-full bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-colors">Apply For Retainer</button>
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative z-50 w-full p-6 md:p-12 pb-8 border-t border-white/5 bg-[#0a0a0a]">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            <a href="https://instagram.com/riseandrenderdfw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
            <a href="mailto:booking@riseandrenderdfw.com" className="hover:text-white transition-colors">Contact</a>
            <div className="hidden md:block w-px h-4 bg-white/20"></div>
            <a href="https://mikemillermedia.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Designed by Mike Miller Media</a>
          </div>
          <p className="text-[9px] md:text-[10px] text-center mt-6 text-white/30 uppercase tracking-widest">
            ©2026 Rise + Render. All Rights Reserved.
          </p>
        </footer>
      </div>

      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 left-6 z-50 bg-white/10 hover:bg-[#ff4d00] text-white p-3 rounded-full transition-all shadow-xl backdrop-blur-md border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      )}
    </div>
  );
};

export default LandingPage;
