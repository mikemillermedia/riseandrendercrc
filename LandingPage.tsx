import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Star, CheckCircle2, Palette, FileVideo, Home
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

// SAFE ANIMATION VARIANTS (No blur filters)
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

      {/* HERO SECTION WITH STAGGERED MOTION */}
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
            <button onClick={scrollToPricing} className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105 shadow-xl">
              View Services
            </button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-64 bg-[#ff4d00]/10 hover:bg-[#ff4d00]/20 backdrop-blur-md border border-[#ff4d00]/50 text-[#ff4d00] py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105 shadow-xl">
              Sanctuary Hub
            </button>
          </motion.div>

          {/* BRANDS STATIC LIST */}
          <motion.div variants={fadeUp} className="w-full max-w-4xl mx-auto flex flex-col items-center opacity-80 mb-20 md:mb-32">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-6 drop-shadow-md">Trusted by creators from</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {BRANDS.map((brand, index) => (
                <span key={index} className="text-white/60 font-black uppercase tracking-widest text-xs md:text-sm drop-shadow-sm text-center">{brand}</span>
              ))}
            </div>
          </motion.div>

          {/* SPOTLIGHT REVIEW */}
          <motion.div variants={fadeUp} className="w-full max-w-3xl mx-auto relative group mb-20">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d00]/20 via-transparent to-transparent rounded-[2rem] blur-2xl opacity-40" />
            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-[2rem] text-left shadow-2xl overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#ff4d00]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-[#ff4d00] fill-[#ff4d00]" />)}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white leading-snug md:leading-tight mb-3">
                    "10/10 recommended! Mike transformed my spare room into a <span className="text-[#ff4d00]">high-end studio</span>. I don't have to worry about tech anymore, I just <span className="text-[#ff4d00]">show up and record</span>."
                  </h3>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden">
                      <span className="text-white/50 font-bold text-sm">C</span>
                    </div>
                    <div>
                      <p className="text-white font-black uppercase tracking-widest text-xs">Candace J</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-3 h-3" />
                        <p className="text-white/50 text-[10px] font-medium">Verified Client Review</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* GRADIENT TRANSITION */}
      <div className="relative z-40 w-full h-32 bg-gradient-to-b from-transparent to-[#0a0a0a] pointer-events-none -mb-1" />

      {/* PRICING & SYSTEM SECTION */}
      <div id="pricing-section" className="relative z-40 bg-[#0a0a0a] w-full pt-10">
        
        {/* RETAINERS */}
        <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto relative z-10 w-full">
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

        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10"></div>
        </div>

        {/* CALCULATOR */}
        <section id="calculator" className="py-12 px-6 md:px-12 max-w-6xl mx-auto relative z-10 mb-16 w-full">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 text-white">Build Your <span className="text-[#ff4d00]">Strategy</span></h2>
            <p className="text-xl text-[#F5F5F0]/70 max-w-2xl mx-auto leading-relaxed">
              Don't need a massive build out? Book a virtual consultation or an a la carte local setup below.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 space-y-12 w-full">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                <h3 className="text-2xl font-black uppercase text-white mb-8 flex items-center gap-3">
                  <span className="bg-white/5 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-white/10">1</span> 
                  Select Base Service
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                  {(Object.keys(basePackages) as Array<keyof typeof basePackages>).map((key) => {
                    const pkg = basePackages[key as keyof typeof basePackages];
                    const isSelected = selectedBase === key;
                    return (
                      <div key={key} onClick={() => setSelectedBase(key as any)} className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 flex flex-col ${isSelected ? 'bg-[#ff4d00]/10 border-[#ff4d00]/50 shadow-[0_0_20px_rgba(255,77,0,0.1)]' : 'bg-[#131313] border-white/10 hover:border-white/30'}`}>
                        <h4 className="text-xl font-black uppercase text-white mb-2">{pkg.name}</h4>
                        <p className={`text-3xl font-black ${isSelected ? 'text-[#ff4d00]' : 'text-white'} mb-4`}>${pkg.price}</p>
                        <ul className="space-y-2 text-sm text-[#F5F5F0]/70 flex-grow">
                          {pkg.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={16} className={`${isSelected ? 'text-[#ff4d00]' : 'text-white/60'} mt-0.5 shrink-0`} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                <h3 className="text-2xl font-black uppercase text-white mb-8 flex items-center gap-3">
                  <span className="bg-white/5 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-white/10">2</span> 
                  Add-Ons <span className="text-xs text-white/40 normal-case font-normal">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                  {addonOptions.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                      <div key={addon.id} onClick={() => toggleAddon(addon.id)} className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 flex items-start gap-4 ${isSelected ? 'bg-[#ff4d00]/10 border-[#ff4d00]/50 shadow-[0_0_20px_rgba(255,77,0,0.1)]' : 'bg-[#131313]/80 border-white/10 hover:border-white/30'}`}>
                        <div className={`p-2.5 rounded-xl mt-1 shrink-0 ${isSelected ? 'bg-[#ff4d00] text-black' : 'bg-white/5 text-white/80'}`}>{addon.icon}</div>
                        <div>
                          <h4 className="font-bold text-white mb-1">{addon.name}</h4>
                          <p className="text-xs text-white/60 mb-2">{addon.desc}</p>
                          <p className={`text-sm font-black ${isSelected ? 'text-[#ff4d00]' : 'text-white/80'}`}>+${addon.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* ESTIMATE CARD */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="lg:w-[420px] lg:sticky lg:top-32 w-full bg-[#131313]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-9 shadow-2xl">
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

              {/* PROMO INPUT */}
              <div className="border-t border-white/10 pt-5 mt-5">
                <div className="flex items-center gap-2.5">
                  <input type="text" placeholder="Promo Code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm w-full text-white focus:outline-none focus:border-[#ff4d00]" />
                  <button onClick={handleApplyPromo} className="bg-white hover:bg-white/90 text-black px-6 py-3 rounded-xl text-sm font-bold">Apply</button>
                </div>
                {promoMessage && <p className={`text-xs mt-3.5 font-medium px-1 ${promoMessage.includes('Success') ? 'text-green-400' : 'text-[#ff4d00]'}`}>{promoMessage}</p>}
              </div>

              <div className="border-t border-white/10 pt-7 mt-5 mb-10 flex justify-between items-end">
                <span className="text-white/60 uppercase text-xs font-bold">Estimated Total</span>
                <span className="text-5xl font-black text-[#ff4d00]">${calculateTotal()}</span>
              </div>
              <button className="w-full bg-[#ff4d00] text-black px-6 py-4 rounded-2xl font-black uppercase hover:bg-orange-500 transition-all tracking-widest shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                Book Session
              </button>
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
    </div>
  );
};

export default LandingPage;
