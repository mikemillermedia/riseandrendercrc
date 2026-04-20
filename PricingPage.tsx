/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Zap, TrendingUp, Award, ArrowRight, Mic, Video, Scissors, Share2, Palette, Plus, LayoutGrid 
} from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import CustomCursor from './components/CustomCursor';
import AIChat from './components/AIChat';
import BrandLogo from './components/BrandLogo';
import Footer from './components/Footer';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTier, setActiveTier] = useState<'launch' | 'growth' | 'authority'>('growth');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const tiers = {
    launch: {
      id: 'launch',
      name: 'Launch',
      badge: 'For Beginners',
      price: '$1,200 - $1,800',
      period: '/mo',
      description: 'Get off the ground with a professional, streamlined setup.',
      features: [
        '1 recording session/month',
        '1–2 cameras setup',
        'Basic full episode edit (1 episode)',
        '3 vertical social clips'
      ],
      color: 'from-white/5 to-white/10',
      accent: 'text-white'
    },
    growth: {
      id: 'growth',
      name: 'Growth',
      badge: 'Most Popular',
      price: '$2,500 - $3,500',
      period: '/mo',
      description: 'Our core engine to build consistent visibility and authority.',
      features: [
        '2 recording sessions/month',
        'Multi-cam 4K production',
        '2 full episode edits + mastering',
        '8–12 optimized social clips',
        'Ongoing Strategy Session included'
      ],
      color: 'from-[#ff4d00]/20 to-[#1A1A1A]',
      accent: 'text-[#ff4d00]',
      glow: 'shadow-[0_0_40px_rgba(255,77,0,0.2)]'
    },
    authority: {
      id: 'authority',
      name: 'Authority',
      badge: 'Premium Partners',
      price: '$4,500 - $6,500+',
      period: '/mo',
      description: 'Total takeover. We run your entire content pipeline.',
      features: [
        'Weekly recording (4+ episodes/month)',
        'Full production & set support',
        '20+ social clips with hook optimization',
        'Priority editing & routing',
        'Strategy + monthly optimization call',
        'Thumbnail & branding support'
      ],
      color: 'from-white/10 to-white/5',
      accent: 'text-white'
    }
  };

  const addons = [
    { id: 'strategy', name: 'Deep-Dive Strategy Session', price: '$250-$500', icon: <TrendingUp size={20} /> },
    { id: 'launch_pkg', name: 'Podcast Launch Package', price: 'Custom', icon: <Zap size={20} /> },
    { id: 'yt_opt', name: 'YouTube Optimization', price: 'Add-on', icon: <Video size={20} /> },
    { id: 'landing_page', name: 'Landing Page Design', price: 'Custom', icon: <LayoutGrid size={20} /> },
    { id: 'email_funnel', name: 'Email Funnel Setup', price: 'Add-on', icon: <Share2 size={20} /> },
    { id: 'motion_gfx', name: 'Advanced Motion Graphics', price: 'Custom', icon: <Palette size={20} /> }
  ];

  return (
    <div className="relative min-h-screen bg-[#131313] text-[#F5F5F0] overflow-x-hidden">
      <CustomCursor />
      <FluidBackground />
      <AIChat />

      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#131313]/90 backdrop-blur-md border-b border-[#F5F5F0]/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo className="h-14 md:h-16 w-auto" />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#F5F5F0]/80">
          <button onClick={() => navigate('/')} className="hover:text-[#ff4d00] transition-colors">Back to Home</button>
          <button onClick={() => navigate('/login')} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full transition-all">Hub Login</button>
        </nav>
      </div>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6 md:px-12 max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.95] tracking-tighter uppercase">
            Turn Your Podcast Into A <br />
            <span className="text-[#ff4d00]">Growth Engine.</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#F5F5F0]/80 mb-10 font-medium">
            Strategy. Production. Distribution. All in one place.
          </p>
          <p className="text-lg text-[#F5F5F0]/60 max-w-2xl mx-auto leading-relaxed">
            We don’t just record podcasts. We help you clarify your message, create high-impact content, turn episodes into consistent platform-ready assets, and build real visibility and authority.
          </p>
        </motion.div>
      </section>

      {/* THE RISE PODCAST SYSTEM */}
      <section className="py-20 bg-[#0a0a0a] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4">The Rise Podcast System™</h2>
            <p className="text-[#F5F5F0]/60">Our 5-pillar framework for total content dominance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all">
              <TrendingUp className="w-10 h-10 text-[#ff4d00] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3 uppercase">1. Strategy</h3>
              <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
                <li>• Podcast positioning & audience clarity</li>
                <li>• Episode format + structure</li>
                <li>• Content calendar (4–8 weeks)</li>
                <li>• Platform strategy & growth roadmap</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all">
              <Video className="w-10 h-10 text-[#ff4d00] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3 uppercase">2. Production</h3>
              <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
                <li>• 4K multi-camera recording</li>
                <li>• Professional lighting & set design</li>
                <li>• Studio-grade audio engineering</li>
                <li>• On-site production support</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all">
              <Scissors className="w-10 h-10 text-[#ff4d00] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3 uppercase">3. Post-Production</h3>
              <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
                <li>• Full episode edit (tight pacing)</li>
                <li>• Hook optimization (first 5-15s)</li>
                <li>• Audio mastering</li>
                <li>• Branded intro/outro & visual captions</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all lg:col-span-1 md:col-span-2">
              <Share2 className="w-10 h-10 text-[#ff4d00] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3 uppercase">4. Distribution Engine</h3>
              <ul className="space-y-2 text-sm text-[#F5F5F0]/70">
                <li>• 5–20 vertical clips per episode</li>
                <li>• Platform-optimized (TikTok, Reels, Shorts)</li>
                <li>• Hook-driven editing with visual styling</li>
                <li>• High-conversion YouTube thumbnails</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-8 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-all lg:col-span-2 md:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div>
                <Palette className="w-10 h-10 text-[#ff4d00] mb-6" />
                <h3 className="text-xl font-bold text-white mb-3 uppercase">5. Branding & Growth</h3>
                <ul className="space-y-2 text-sm text-[#F5F5F0]/70 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <li>• Podcast cover art</li>
                  <li>• YouTube channel setup</li>
                  <li>• Thumbnail design system</li>
                  <li>• Social media templates</li>
                  <li>• Custom podcast landing pages</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PRICING BUILDER */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">Select Your <span className="text-[#ff4d00]">Engine</span></h2>
          <p className="text-xl text-[#F5F5F0]/60">Select a tier to see what is included in your monthly retainer.</p>
        </div>

        {/* Custom Tab Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {(Object.keys(tiers) as Array<keyof typeof tiers>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTier(key)}
              className={`relative px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm transition-all duration-300 ${
                activeTier === key ? 'text-[#131313]' : 'text-white bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              {activeTier === key && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute inset-0 bg-[#ff4d00] rounded-full -z-10 shadow-[0_0_20px_rgba(255,77,0,0.4)]" 
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tiers[key].name}
            </button>
          ))}
        </div>

        {/* Dynamic Pricing Card Display */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTier}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`bg-gradient-to-br ${tiers[activeTier].color} border ${activeTier === 'growth' ? 'border-[#ff4d00]/50' : 'border-white/10'} rounded-[2.5rem] p-8 md:p-16 max-w-4xl mx-auto ${tiers[activeTier].glow || ''}`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b border-white/10 pb-12">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full border ${activeTier === 'growth' ? 'border-[#ff4d00] text-[#ff4d00]' : 'border-white/20 text-white'} text-xs font-bold uppercase tracking-widest mb-4`}>
                    {tiers[activeTier].badge}
                  </span>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tight mb-2">{tiers[activeTier].name}</h3>
                  <p className="text-[#F5F5F0]/60">{tiers[activeTier].description}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className={`text-4xl md:text-5xl font-black ${tiers[activeTier].accent}`}>{tiers[activeTier].price}</p>
                  <p className="text-[#F5F5F0]/40 font-bold uppercase tracking-widest text-sm mt-1">Per Month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {tiers[activeTier].features.map((feature, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className={`w-6 h-6 shrink-0 mt-0.5 ${tiers[activeTier].accent}`} />
                    <span className="text-lg font-medium text-[#F5F5F0]/90">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* A LA CARTE / ADD-ONS BUILDER */}
      <section className="py-20 bg-[#1A1A1A] border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Strategic Add-Ons</h2>
            <p className="text-[#F5F5F0]/60">Tap any item below to add it to your custom application profile.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {addons.map((addon) => (
              <motion.div
                key={addon.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleAddon(addon.id)}
                className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col items-start gap-4 ${
                  selectedAddons.includes(addon.id) 
                  ? 'bg-[#ff4d00]/10 border-[#ff4d00] shadow-[0_0_20px_rgba(255,77,0,0.15)]' 
                  : 'bg-[#131313] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between w-full items-center">
                  <div className={`p-3 rounded-xl ${selectedAddons.includes(addon.id) ? 'bg-[#ff4d00] text-black' : 'bg-white/5 text-white'}`}>
                    {addon.icon}
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAddons.includes(addon.id) ? 'border-[#ff4d00] bg-[#ff4d00]' : 'border-white/20'}`}>
                    {selectedAddons.includes(addon.id) && <CheckCircle2 className="w-4 h-4 text-[#131313]" />}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">{addon.name}</h4>
                  <p className={`text-sm font-bold ${selectedAddons.includes(addon.id) ? 'text-[#ff4d00]' : 'text-white/40'}`}>{addon.price}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FINAL CTA PANEL */}
          <div className="bg-[#131313] rounded-[2.5rem] p-10 md:p-16 border border-[#ff4d00]/30 shadow-[0_0_50px_rgba(255,77,0,0.1)] text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-[#ff4d00] mix-blend-screen filter blur-[150px] opacity-[0.07] pointer-events-none" />
            
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6 relative z-10">
              Ready to Establish <br className="hidden md:block"/> <span className="text-[#ff4d00]">Your Authority?</span>
            </h2>
            <p className="text-[#F5F5F0]/70 max-w-xl mx-auto mb-10 text-lg relative z-10">
              {selectedAddons.length > 0 
                ? `You've selected the ${tiers[activeTier].name} tier plus ${selectedAddons.length} add-on${selectedAddons.length > 1 ? 's' : ''}. Fill out our brief intake form so we can finalize your custom strategy.`
                : `Apply for the ${tiers[activeTier].name} package. We rigorously review all applications to ensure we are the right strategic fit for your growth.`}
            </p>
            
            <a 
              href="https://form.jotform.com/261096943415057"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#ff4d00] text-[#131313] px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-orange-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,77,0,0.3)] text-lg relative z-10"
            >
              Submit Application <ArrowRight size={20} />
            </a>
            <p className="text-white/30 text-xs font-bold tracking-widest uppercase mt-6 relative z-10">Spots for custom retainers are strictly limited.</p>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-40 bg-white/10 hover:bg-[#ff4d00] text-white p-3 rounded-full transition-all shadow-xl backdrop-blur-md border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      )}

      <Footer />
    </div>
  );
};

export default PricingPage;
