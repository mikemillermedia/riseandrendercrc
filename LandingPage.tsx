import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Star, CheckCircle2, TrendingUp, Video, Scissors, Share2, Palette, 
  Calculator, ArrowRight, PlayCircle, Image as ImageIcon, Plus, Minus, FileText, 
  Headphones, Monitor, Radio, Camera, Crown, Wrench, FileVideo, Home
} from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import BrandLogo from './components/BrandLogo';
import FluidBackground from './components/FluidBackground';

const BRANDS = [
  "She Bears Fruit Podcast", 
  "15:5 Collective", 
  "The Breakdown With Jasmine Martines", 
  "Giving While Black Podcast",
  "Words Taylor",
  "We Going Up"
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.4 } } };
const itemVariants = { hidden: { opacity: 0, y: 40, filter: "blur(12px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } } };

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const heroRef = useRef(null);

  const [selectedBase, setSelectedBase] = useState<'consultation' | 'onsite'>('consultation');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    document.title = "Rise & Render | Premium Content Creation Consultancy";
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToPricing = () => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toLowerCase() === 'kingdom') {
      setPromoMessage('Success! 10% Off applied.');
    } else {
      setPromoMessage('Invalid discount code.');
    }
  };

  const basePackages = {
    consultation: {
      id: 'consultation',
      name: 'Virtual Studio Consultation',
      price: 197,
      description: 'A 1-hour deep dive into your space.',
      features: ['1-Hour Zoom Strategy Call', 'Custom Gear List & Links', 'Room Layout & Acoustic Plan', 'Session Video Recording']
    },
    onsite: {
      id: 'onsite',
      name: 'DFW On-Site Setup',
      price: 797,
      description: 'We come to you and wire everything.',
      features: ['Physical Cable Routing', 'Lighting Placement & Tuning', 'Audio Treatment Installation', 'System Testing & Training']
    }
  };

  const addonOptions = [
    { id: 'digital_kit', name: 'At-Home Creator Kit', desc: 'PDF guides, templates, & OBS presets.', price: 47, icon: <FileVideo size={20} /> },
    { id: 'gear_procurement', name: 'Gear Procurement', desc: 'We order and track all gear for you.', price: 150, icon: <Home size={20} /> },
    { id: 'set_design', name: 'Custom Set Design', desc: 'Background styling and prop curation.', price: 250, icon: <Palette size={20} /> },
  ];

  const calculateTotal = () => {
    let total = basePackages[selectedBase].price;
    selectedAddons.forEach(id => {
      const addon = addonOptions.find(a => a.id === id);
      if (addon) total += addon.price;
    });
    if (promoMessage.includes('Success')) total = Math.floor(total * 0.9);
    return total;
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-[#F5F5F0] font-sans flex flex-col overflow-x-hidden">
      {/* BACKGROUND */}
      <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, ease: "easeOut" }} className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/studio-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* TOP NAVBAR - WITH HUB LOGIN BUTTON */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.5 }} className="fixed top-0 left-0 w-full z-50 p-6 md:p-12 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo className="h-10 md:h-16 w-auto" />
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <button onClick={() => navigate('/login')} className="bg-[#ff4d00] hover:bg-orange-500 text-black px-6 py-2.5 rounded-full font-bold transition-all shadow-lg">
            Hub Login
          </button>
        </nav>
      </motion.nav>

      {/* HERO SECTION */}
      <main className="relative z-20 flex-grow flex flex-col items-center justify-start px-6 text-center pt-32 pb-0">
        <div className="h-16 md:h-32 flex-shrink-0" />
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl w-full flex flex-col items-center">
          
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-black mb-4 md:mb-6 leading-[0.9] tracking-tighter uppercase">
            Build Your Personal <br /> Content Sanctuary
          </motion.h1>
          
          <motion.h2 variants={itemVariants} className="text-lg sm:text-xl md:text-2xl font-bold mb-12 md:mb-16 tracking-tight max-w-2xl text-white/80">
            We transform your room or office into a frictionless broadcast studio. <br />
            <span className="text-[#ff4d00]">Rise In Your Purpose. Render Your Calling.</span>
          </motion.h2>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full mb-16">
            <button onClick={scrollToPricing} className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105">
              View Services
            </button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-64 bg-[#ff4d00]/20 hover:bg-[#ff4d00]/40 backdrop-blur-md border border-[#ff4d00]/50 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105">
              Creator Hub
            </button>
          </motion.div>
        </motion.div>
      </main>

      <div className="relative z-20 w-full h-48 md:h-64 bg-gradient-to-b from-transparent to-[#0a0a0a] pointer-events-none -mb-1" />

      {/* PRICING & SERVICES SECTION */}
      <div id="pricing-section" className="relative z-30 bg-[#0a0a0a] w-full pt-10">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <FluidBackground />
        </div>

        {/* DONE FOR YOU RETAINERS */}
        <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">White-Glove <span className="text-[#ff4d00]">Setups</span></h2>
            <p className="text-xl text-[#F5F5F0]/80 max-w-2xl mx-auto leading-relaxed">
              For creators who want us to handle everything from gear procurement to physical installation in the DFW area.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* The Setup */}
            <div className="bg-[#131313]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col hover:border-[#ff4d00]/30 transition-all shadow-xl">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">The Build-Out</h3>
              <p className="text-4xl font-black text-[#ff4d00] mb-6">$2,500+</p>
              <ul className="space-y-4 text-sm text-[#F5F5F0]/80 mb-10 flex-grow">
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Deep Space Strategy & Acoustic Plan</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Full Gear Procurement (Cameras, Mics, Lights)</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Local DFW On-Site Installation</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 1-on-1 Operational Training</li>
              </ul>
              <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-colors border border-white/10">Apply Now</button>
            </div>

            {/* Post Production */}
            <div className="bg-[#0a0a0a]/90 backdrop-blur-xl p-8 rounded-3xl border border-[#ff4d00]/50 flex flex-col shadow-[0_0_40px_rgba(255,77,0,0.2)]">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Post-Production Retainer</h3>
              <p className="text-4xl font-black text-[#ff4d00] mb-6">$1,500<span className="text-sm text-white/40 font-medium">/mo</span></p>
              <ul className="space-y-4 text-sm text-[#F5F5F0]/80 mb-10 flex-grow">
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Hit record in your new space, we handle the rest.</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 4 Full-Length 4K Video Edits</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 12 Social Media Vertical Clips</li>
                <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Custom YouTube Thumbnails</li>
              </ul>
              <button className="w-full bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-colors">Apply Now</button>
            </div>
          </div>
        </section>

        {/* CALCULATOR */}
        <section id="calculator" className="py-12 px-6 md:px-12 max-w-6xl mx-auto relative z-10 mb-16 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">Build Your <span className="text-[#ff4d00]">Strategy</span></h2>
            <p className="text-xl text-[#F5F5F0]/70 max-w-2xl mx-auto leading-relaxed">
              Need advice on gear? Select a virtual consultation or an a la carte local setup.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* LEFT COLUMN: SELECTIONS */}
            <div className="flex-1 space-y-12 w-full">
              <div>
                <h3 className="text-2xl font-black uppercase text-white mb-8">1. Select Base Service</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                  {(Object.keys(basePackages) as Array<keyof typeof basePackages>).map((key) => {
                    const pkg = basePackages[key];
                    const isSelected = selectedBase === key;
                    return (
                      <div key={key} onClick={() => setSelectedBase(key)} className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 flex flex-col ${isSelected ? 'bg-[#ff4d00]/10 border-[#ff4d00]/50' : 'bg-[#131313] border-white/10'}`}>
                        <h4 className="text-xl font-black uppercase text-white mb-2">{pkg.name}</h4>
                        <p className={`text-3xl font-black ${isSelected ? 'text-[#ff4d00]' : 'text-white'} mb-4`}>${pkg.price}</p>
                        <ul className="space-y-2 text-sm text-[#F5F5F0]/70 flex-grow">
                          {pkg.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={16} className={`${isSelected ? 'text-[#ff4d00]' : 'text-white/60'} mt-0.5`} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase text-white mb-8">2. Add-Ons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                  {addonOptions.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                      <div key={addon.id} onClick={() => toggleAddon(addon.id)} className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 flex items-start gap-4 ${isSelected ? 'bg-[#ff4d00]/10 border-[#ff4d00]/50' : 'bg-[#131313]/80 border-white/10'}`}>
                        <div className={`p-2.5 rounded-xl mt-1 ${isSelected ? 'bg-[#ff4d00] text-black' : 'bg-white/5 text-white/80'}`}>{addon.icon}</div>
                        <div>
                          <h4 className="font-bold text-white mb-1">{addon.name}</h4>
                          <p className="text-xs text-white/60 mb-2">{addon.desc}</p>
                          <p className={`text-sm font-black ${isSelected ? 'text-[#ff4d00]' : 'text-white/80'}`}>+${addon.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ESTIMATE */}
            <div className="lg:w-[420px] lg:sticky lg:top-32 w-full bg-[#131313]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-9">
              <h3 className="text-xl font-black uppercase text-white mb-7 border-b border-white/10 pb-5">Estimated Investment</h3>
              <div className="space-y-4 mb-7 min-h-[100px]">
                <div className="flex justify-between font-bold text-white/90">
                  <span>{basePackages[selectedBase].name}</span>
                  <span>${basePackages[selectedBase].price}</span>
                </div>
                {selectedAddons.map(id => {
                  const addon = addonOptions.find(a => a.id === id);
                  if (!addon) return null;
                  return (
                    <div key={id} className="flex justify-between text-sm text-white/70">
                      <span>+ {addon.name}</span>
                      <span>${addon.price}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-7 mt-5 mb-10 flex justify-between items-end">
                <span className="text-white/60 uppercase text-xs font-bold">Estimated Total</span>
                <span className="text-5xl font-black text-[#ff4d00]">${calculateTotal()}</span>
              </div>
              <button className="w-full bg-[#ff4d00] text-black px-6 py-4 rounded-2xl font-black uppercase hover:bg-orange-500 transition-all">
                Book Consultation
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
