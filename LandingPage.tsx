import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Star, CheckCircle2, Video, Settings, PenTool, Lightbulb, 
  ArrowRight, Download, Camera, Crown, MapPin, Monitor, Compass
} from 'lucide-react';

// --- DATA ---
const BRANDS = [
  "She Bears Fruit Podcast", 
  "15:5 Collective", 
  "The Breakdown", 
  "Giving While Black",
  "Words Taylor",
  "We Going Up"
];

const PROCESS_STEPS = [
  {
    icon: Compass,
    title: "1. Space Strategy",
    description: "We analyze your specific room, lighting constraints, and acoustic challenges to design a layout that maximizes aesthetic and sound quality."
  },
  {
    icon: Settings,
    title: "2. Gear Curation",
    description: "No more guessing. We build a custom Sweetwater/Amazon gear list perfectly tailored to your budget and technical comfort level."
  },
  {
    icon: PenTool,
    title: "3. Setup & Install",
    description: "For local DFW clients, we come on-site to route cables, mount lighting, treat audio, and eliminate the technical friction."
  },
  {
    icon: Video,
    title: "4. Post-Production",
    description: "Hit record, then send us the files. Our retainer services handle editing, thumbnails, and social clips so you can focus purely on the message."
  }
];

const SERVICE_TIERS = [
  {
    id: "level-1",
    name: "At-Home Creator Kit",
    price: "$47",
    subtitle: "Digital Assets",
    description: "The DIY blueprint for your personal sanctuary.",
    features: [
      "Downloadable Setup Guides (PDF)",
      "Budget-Tiered Gear Lists",
      "Acoustic Treatment Templates",
      "Software Presets (OBS, Audio)"
    ],
    buttonText: "Get The Kit",
    highlight: false
  },
  {
    id: "level-2",
    name: "Virtual Space Strategy",
    price: "$197",
    subtitle: "1-Hour Zoom Session",
    description: "Custom mapping and gear strategy tailored to your exact room.",
    features: [
      "Review of your room photos & intake",
      "1-on-1 Zoom Consultation",
      "Custom Gear Wishlist provided",
      "Session Video Recording"
    ],
    buttonText: "Book Consultation",
    highlight: false
  },
  {
    id: "level-3",
    name: "On-Site Setup",
    price: "$897",
    subtitle: "DFW Local Service",
    description: "You buy the gear, we come and install it for you.",
    features: [
      "Everything in Virtual Strategy",
      "Physical Cable Routing & Management",
      "Camera & Lighting Mounting",
      "Acoustic Panel Installation",
      "System Testing & Calibration"
    ],
    buttonText: "Request Install",
    highlight: true,
    tag: "Most Popular"
  },
  {
    id: "level-4",
    name: "White-Glove Service",
    price: "$3,500+",
    subtitle: "Turn-Key Solution",
    description: "The ultimate 'done-for-you' broadcast studio experience.",
    features: [
      "Deep Content Strategy Session",
      "Full Set & Backdrop Design",
      "We Procure & Order All Gear",
      "Complete On-Site Installation",
      "1-on-1 Operational Training"
    ],
    buttonText: "Apply For White-Glove",
    highlight: false
  }
];

// --- MOCK COMPONENTS ---
const BrandLogo = ({ className }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#ff4d00] rounded-lg flex items-center justify-center transform rotate-3">
      <span className="text-black font-black text-xl leading-none">R</span>
    </div>
    <span className="font-black text-xl md:text-2xl tracking-tighter uppercase text-white">
      Rise<span className="text-[#ff4d00]">&</span>Render
    </span>
  </div>
);

const FluidBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen">
    <motion.div
      animate={{ x: [0, 100, 0, -100, 0], y: [0, -100, 0, 100, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#ff4d00]/10 rounded-full blur-[120px]"
    />
    <motion.div
      animate={{ x: [0, -120, 0, 120, 0], y: [0, 120, 0, -120, 0], scale: [1, 1.5, 1] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#F5F5F0]/5 rounded-full blur-[150px]"
    />
  </div>
);

const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div 
      className="fixed top-0 left-0 w-6 h-6 rounded-full border-2 border-[#ff4d00]/50 pointer-events-none z-[100] mix-blend-screen hidden lg:block"
      animate={{ x: mousePos.x - 12, y: mousePos.y - 12 }}
      transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
    />
  );
};

const LandingPage = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    document.title = "Rise & Render DFW | Content Creation Consultancy";
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-[#F5F5F0] font-sans flex flex-col overflow-x-hidden selection:bg-[#ff4d00] selection:text-black">
      <CustomCursor />
      
      {/* Background elements */}
      <div className="fixed inset-0 z-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ff4d00]/10 via-[#0a0a0a] to-[#0a0a0a] opacity-80" />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
        className="fixed top-0 left-0 w-full z-50 p-6 md:px-12 md:py-8 flex justify-between items-center bg-gradient-to-b from-[#0a0a0a] to-transparent backdrop-blur-sm"
      >
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo(0,0); }} className="cursor-pointer">
          <BrandLogo />
        </a>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#system" onClick={(e) => { e.preventDefault(); scrollToSection('system'); }} className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Our Process</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }} className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Services</a>
          <button onClick={() => scrollToSection('pricing')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full transition-all border border-white/10 backdrop-blur-md text-sm font-bold uppercase tracking-widest">
            Book Now
          </button>
        </nav>
      </motion.nav>

      {/* HERO SECTION */}
      <main ref={heroRef} id="top" className="relative z-20 flex flex-col items-center justify-center px-6 text-center min-h-[90vh] pt-32 pb-16">
        <FluidBackground />
        
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl w-full flex flex-col items-center relative z-10">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs md:text-sm font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
            <Camera size={14} className="text-[#ff4d00]" /> DFW's Premier Studio Consultants
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-black mb-6 leading-[0.95] tracking-tighter uppercase max-w-5xl">
            Build Your Personal <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Content Sanctuary</span>
          </motion.h1>
          
          <motion.h2 variants={itemVariants} className="text-lg sm:text-xl md:text-3xl font-medium mb-12 max-w-3xl text-white/80 leading-relaxed">
            Rise in your purpose. Render your calling. <br/> 
            <span className="font-bold text-[#ff4d00]">We handle the tech. You focus on the message.</span>
          </motion.h2>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-xl mx-auto">
            <button onClick={() => scrollToSection('pricing')} className="w-full sm:w-1/2 bg-[#ff4d00] hover:bg-[#ff4d00]/90 text-black py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(255,77,0,0.3)] flex items-center justify-center gap-2">
              Book Consultation <ArrowRight size={16} />
            </button>
            <button onClick={() => scrollToSection('pricing')} className="w-full sm:w-1/2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
              Get Free Creator Kit <Download size={16} />
            </button>
          </motion.div>
        </motion.div>
      </main>

      {/* BRAND TICKER */}
      <section className="relative z-20 w-full py-12 border-y border-white/5 bg-[#0a0a0a]/50 backdrop-blur-lg">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-6 text-center">
            Trusted by creators from
          </p>
          <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <motion.div
              className="flex whitespace-nowrap items-center gap-12 sm:gap-24"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
            >
              {[...BRANDS, ...BRANDS].map((brand, index) => (
                <span key={index} className="text-white/40 font-black uppercase tracking-widest text-sm md:text-base">
                  {brand}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* SPOTLIGHT REVIEW */}
      <section className="relative z-20 py-24 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="w-full max-w-4xl mx-auto relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d00]/10 via-transparent to-transparent rounded-[2rem] blur-2xl opacity-60" />
          
          <div className="relative bg-[#131313]/80 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2rem] text-left shadow-2xl overflow-hidden cursor-default transition-all duration-500 hover:border-white/20">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ff4d00]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-[#ff4d00] fill-[#ff4d00]" />)}
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug md:leading-tight">
                "10/10 recommended! Not only did they transform my spare room into a <span className="text-[#ff4d00]">stunning broadcast space</span>, but the tech is incredibly easy to use. I just show up in my own home and <span className="text-[#ff4d00]">hit record</span>. The video quality is top tier."
              </h3>
              
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden">
                    <span className="text-white/50 font-bold text-lg">C</span>
                  </div>
                  <div>
                    <p className="text-white font-black uppercase tracking-widest text-sm">Candace J</p>
                    <p className="text-white/50 text-[11px] font-medium tracking-wide">Verified Client Setup</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-white/30 text-xs font-bold uppercase tracking-widest">
                  <MapPin size={14} /> DFW Area
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* THE RISE SYSTEM (PROCESS) */}
      <section id="system" className="py-24 relative z-10 w-full bg-gradient-to-b from-[#0a0a0a] to-[#111]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">The Rise System™</h2>
            <p className="text-[#F5F5F0]/60 max-w-2xl mx-auto text-lg">Our proven 4-step framework to transform your space into a frictionless content creation machine.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all duration-300 group flex flex-col"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#ff4d00]/10 transition-colors">
                  <step.icon className="w-6 h-6 text-[#ff4d00]" />
                </div>
                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wide">{step.title}</h3>
                <p className="text-sm text-[#F5F5F0]/60 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES / PRICING TIERS */}
      <section id="pricing" className="py-24 relative z-10 w-full bg-[#111]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">Setup & <span className="text-[#ff4d00]">Consultation</span></h2>
            <p className="text-xl text-[#F5F5F0]/80 max-w-2xl mx-auto leading-relaxed">
              From DIY guides to full-service installations. Choose how you want to build your sanctuary.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {SERVICE_TIERS.map((tier, idx) => (
              <motion.div 
                key={tier.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`p-8 rounded-3xl border flex flex-col transition-all duration-300 relative ${
                  tier.highlight 
                  ? 'bg-[#1a1311] border-[#ff4d00]/50 shadow-[0_0_40px_rgba(255,77,0,0.15)] lg:-translate-y-4' 
                  : 'bg-[#0a0a0a]/50 border-white/10 hover:border-white/20 hover:-translate-y-2'
                }`}
              >
                {tier.tag && (
                  <div className="absolute top-0 right-0 bg-[#ff4d00] text-black text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-xl rounded-tr-3xl">
                    {tier.tag}
                  </div>
                )}
                
                <p className="text-[#ff4d00] text-xs font-bold uppercase tracking-widest mb-2">{tier.subtitle}</p>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{tier.name}</h3>
                <p className="text-4xl font-black text-white mb-4">{tier.price}</p>
                <p className="text-sm text-white/60 mb-8 min-h-[40px]">{tier.description}</p>
                
                <ul className="space-y-4 text-sm text-[#F5F5F0]/80 mb-10 flex-grow">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button 
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  className={`w-full block text-center font-bold uppercase tracking-widest py-4 rounded-xl transition-colors border ${
                    tier.highlight 
                    ? 'bg-[#ff4d00] text-black border-[#ff4d00] hover:bg-orange-500' 
                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                  }`}
                >
                  {tier.buttonText}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POST-PRODUCTION BANNER */}
      <section className="py-20 relative z-10 w-full border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Crown size={32} className="text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white mb-4">Don't want to edit?</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Once your space is built, we offer exclusive retainer packages for video editing, thumbnail design, and social media clip distribution. Hit record, and we handle the rest.
          </p>
          <a href="mailto:booking@riseandrenderdfw.com" className="inline-flex items-center gap-2 text-[#ff4d00] font-bold uppercase tracking-widest text-sm hover:text-white transition-colors">
            Inquire about retainers <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-50 w-full p-8 md:p-12 pb-8 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <BrandLogo className="scale-75 origin-left" />
          
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">YouTube Tutorials</a>
            <a href="mailto:booking@riseandrenderdfw.com" className="hover:text-white transition-colors">Contact</a>
            <div className="hidden md:block w-px h-4 bg-white/20"></div>
            <a href="#" className="hover:text-white transition-colors">Designed by Mike Miller Media</a>
          </div>
        </div>
        
        <p className="text-[10px] text-center md:text-left mt-8 text-white/30 uppercase tracking-widest max-w-7xl mx-auto">
          © {new Date().getFullYear()} Rise + Render DFW. All Rights Reserved.
        </p>
      </footer>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 bg-[#131313] hover:bg-[#ff4d00] text-white p-3 rounded-full transition-colors shadow-xl border border-white/10 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-1 transition-transform"><path d="m18 15-6-6-6 6"/></svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
