/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, X, MapPin, Wrench, HeartHandshake, Video, Globe, Share2, Target, Music, TrendingUp, CheckCircle, Users, Sparkles, Briefcase 
} from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import CustomCursor from './components/CustomCursor';
import AIChat from './components/AIChat';
import BrandLogo from './components/BrandLogo';
import mikeMillerImage from './mike-miller.png';
import headerImage from './studio set 1 still_1.1.1.png';
import dfwImage from './studio 2 set still_1.1.2.png';
import Footer from './components/Footer';

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

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
    <div className="relative min-h-screen bg-[#131313] text-[#F5F5F0]">
      <CustomCursor />
      <FluidBackground />
      <AIChat />

      {/* HEADER / NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#131313]/90 backdrop-blur-md border-b border-[#F5F5F0]/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-14 md:h-16 w-auto" />
        </div>

       {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#F5F5F0]/80">
          <button onClick={() => scrollToSection('about')} className="hover:text-[#ff4d00] transition-colors">About</button>
          <button onClick={() => scrollToSection('resources')} className="hover:text-[#ff4d00] transition-colors">Resources</button>
          <button onClick={() => scrollToSection('dfw-studio')} className="hover:text-[#ff4d00] transition-colors">DFW Studio</button>
          
          <button onClick={handleShare} className="hover:text-[#ff4d00] transition-colors flex items-center gap-2">
            <Share2 size={16} /> Share
          </button>
          
          <button onClick={() => navigate('/login')} className="hover:text-[#ff4d00] transition-colors font-bold text-white">Join/Login</button>
        </nav>

        <button 
          className="md:hidden text-[#F5F5F0]/80 hover:text-[#ff4d00] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[72px] left-0 w-full bg-[#131313] border-b border-[#F5F5F0]/10 flex flex-col items-center py-6 gap-6 text-sm font-medium text-[#F5F5F0]/80 z-40 shadow-2xl">
          <button onClick={() => { scrollToSection('about'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">About</button>
          <button onClick={() => { scrollToSection('resources'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">Resources</button>
          <button onClick={() => { scrollToSection('dfw-studio'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">DFW Studio</button>
          
          <button onClick={() => { handleShare(); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors flex items-center gap-2">
            <Share2 size={18} /> Share Site
          </button>
          
          <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors font-bold text-white">Join/Login</button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-5xl aspect-[21/9] mb-16 rounded-[2.5rem] overflow-hidden border border-[#F5F5F0]/10 shadow-2xl group"
        >
          <motion.img 
            src={headerImage} 
            alt="Professional Podcast Studio Setup"
            className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000"
            whileHover={{ scale: 1.1, rotate: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/50 to-transparent" />
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-black max-w-5xl mb-8 leading-[0.95] text-[#F5F5F0] tracking-tighter">
          RISE IN YOUR PURPOSE. <br/>
          <span className="text-[#ff4d00]">RENDER YOUR CALLING.</span>
        </h1>

        <p className="text-lg md:text-2xl text-[#F5F5F0]/80 max-w-3xl mb-12 font-medium leading-relaxed">
          A community for Creatives Representing Christ focusing on tech, gear, and elevating your content.
        </p>

       <div className="flex flex-col sm:flex-row items-center gap-4">
          <button onClick={() => navigate('/login')} className="bg-[#ff4d00] hover:bg-[#ff4d00]/90 text-[#131313] font-black uppercase tracking-widest py-3.5 px-10 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,77,0,0.4)] text-lg md:text-xl w-full sm:w-auto">
            Join the Community
          </button>
          
          <a 
            href="https://tally.so/r/dWxaOy"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-[#ff4d00]/50 font-black uppercase tracking-widest py-3.5 px-10 rounded-full transition-all hover:scale-105 shadow-lg text-lg md:text-xl w-full sm:w-auto text-center backdrop-blur-sm"
          >
            Book Studio
          </a>
        </div>
      </section>

      {/* WHY WE EXIST SECTION */}
      <section id="about" className="py-32 bg-[#F5F5F0] text-[#131313] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">Why We Exist</h2>
            <p className="text-xl md:text-2xl leading-relaxed font-medium text-[#131313]/80">
              You were created to create, but navigating the technical side of content creation can be overwhelming. 
              We exist to bridge the gap between your God-given message and the technical excellence required to share it effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} className="p-10 rounded-[2rem] bg-white border border-black/5 shadow-xl shadow-black/5">
              <div className="w-16 h-16 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center mb-8">
                <Wrench className="w-8 h-8 text-[#ff4d00]" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Tech & Gear Mastery</h3>
              <p className="text-[#131313]/70 leading-relaxed">
                Master the tools of the trade, from software setups and editing workflows to camera and audio recommendations.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="p-10 rounded-[2rem] bg-white border border-black/5 shadow-xl shadow-black/5">
              <div className="w-16 h-16 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center mb-8">
                <MapPin className="w-8 h-8 text-[#ff4d00]" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">DFW Podcast Studio</h3>
              <p className="text-[#131313]/70 leading-relaxed">
                Local to Dallas-Fort Worth? Get access to our fully equipped, professional recording space designed for high-end production.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="p-10 rounded-[2rem] bg-white border border-black/5 shadow-xl shadow-black/5">
              <div className="w-16 h-16 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center mb-8">
                <HeartHandshake className="w-8 h-8 text-[#ff4d00]" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Faith & Community</h3>
              <p className="text-[#131313]/70 leading-relaxed">
                Connect, share, and pray with like-minded believers in the digital space. Grow your craft alongside your faith.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY SECTION */}
      <section className="py-32 bg-[#131313] text-[#F5F5F0] border-t border-[#F5F5F0]/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#ff4d00] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">The Vision <span className="text-[#ff4d00]">Behind It</span></h2>
              <div className="space-y-6 text-lg md:text-xl text-[#F5F5F0]/80 leading-relaxed">
                <p>
                  For years, our founder Mike Miller has helped brands and small businesses with equipment, gear setups, recommendations, and full-cycle media production as a creative director through his business, <a href="https://mikemillermedia.com" target="_blank" rel="noopener noreferrer" className="text-[#ff4d00] hover:underline font-bold">Mike Miller Media</a>.
                </p>
                <p>
                  But after helping many people build their platforms, Mike realized a deep need to build within the Kingdom of God. His personal growth as a father, husband, and friend inspired him to translate that transformation into his professional life.
                </p>
                <p>
                  Through fasting and prayer, Mike was guided to shift the focus of Rise & Render. It is no longer just a recording studio—it is a dedicated community where he can share his knowledge and God-given giftings.
                </p>
                <p className="font-medium text-[#F5F5F0] border-l-4 border-[#ff4d00] pl-6 py-2 mt-8">
                  "This is a community built primarily for creatives representing Christ. We are here to help you master the tools of the trade so you can share your message with excellence."
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden border border-[#F5F5F0]/10 relative">
                <img 
                  src={mikeMillerImage} 
                  alt="Mike Miller - Founder of Rise & Render" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[#ff4d00]/20 rounded-full filter blur-[40px]" />
              <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 flex flex-col gap-4 hidden md:flex">
                <div className="w-24 h-[1px] bg-[#F5F5F0]/20" />
                <div className="w-16 h-[1px] bg-[#F5F5F0]/20" />
                <div className="w-32 h-[1px] bg-[#F5F5F0]/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE CRC HUB (FREE COMMUNITY) SECTION */}
      <section id="resources" className="py-32 bg-[#1A1A1A] border-t border-[#F5F5F0]/5 relative overflow-hidden">
        {/* Subtle orange glow in the background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff4d00] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.05] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: The Pitch */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff4d00]/10 border border-[#ff4d00]/20 text-[#ff4d00] text-sm font-bold uppercase tracking-widest mb-6">
                <Sparkles size={16} /> 100% Free to Join
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter text-white">
                Don't Build Your <br/><span className="text-[#ff4d00]">Brand In Isolation.</span>
              </h2>
              <p className="text-lg md:text-xl text-[#F5F5F0]/70 mb-10 leading-relaxed">
                The Rise & Render Community is a private, digital ecosystem designed specifically for faith-driven creators. Whether you're looking for gear advice, a video editor, or just a group of believers who understand the grind of content creation—this is your new digital home.
              </p>
              <button 
                onClick={() => navigate('/login')} 
                className="bg-[#ff4d00] hover:bg-orange-500 text-[#131313] font-black uppercase tracking-widest py-4 px-10 rounded-xl transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)] hover:shadow-[0_0_30px_rgba(255,77,0,0.5)] hover:-translate-y-1 text-lg flex items-center gap-3 w-full md:w-auto justify-center"
              >
                <Users size={20} /> Create Free Profile
              </button>
            </motion.div>

            {/* Right Column: The Features Grid */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Feature 1 */}
              <div className="bg-[#131313] p-6 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#ff4d00]/10 transition-colors">
                  <Briefcase className="w-6 h-6 text-white group-hover:text-[#ff4d00] transition-colors" />
                </div>
                <h3 className="text-white font-bold mb-2">Kingdom Collabs</h3>
                <p className="text-white/50 text-sm leading-relaxed">Post gigs or find talent. Connect with Christian video editors, graphic designers, and co-hosts.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#131313] p-6 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#ff4d00]/10 transition-colors">
                  <Wrench className="w-6 h-6 text-white group-hover:text-[#ff4d00] transition-colors" />
                </div>
                <h3 className="text-white font-bold mb-2">The Vault</h3>
                <p className="text-white/50 text-sm leading-relaxed">Instantly unlock our proprietary "Content Creator Studio Kit" and gear blueprints for free.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#131313] p-6 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#ff4d00]/10 transition-colors">
                  <HeartHandshake className="w-6 h-6 text-white group-hover:text-[#ff4d00] transition-colors" />
                </div>
                <h3 className="text-white font-bold mb-2">The Prayer Wall</h3>
                <p className="text-white/50 text-sm leading-relaxed">A dedicated, private space to bear one another's burdens and celebrate wins together.</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-[#131313] p-6 rounded-3xl border border-white/5 hover:border-[#ff4d00]/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#ff4d00]/10 transition-colors">
                  <Users className="w-6 h-6 text-white group-hover:text-[#ff4d00] transition-colors" />
                </div>
                <h3 className="text-white font-bold mb-2">Member Directory</h3>
                <p className="text-white/50 text-sm leading-relaxed">Browse profiles, see what gear other creators are using, and send direct messages.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* DFW STUDIO & SETUP OPTIONS SECTION */}
      <section id="dfw-studio" className="py-32 bg-[#F5F5F0] text-[#131313] border-t border-[#131313]/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">
              Serving <span className="text-[#ff4d00]">DFW & Beyond</span>
            </h2>
            <p className="text-xl text-[#131313]/80 leading-relaxed">
              Whether you're local to our Duncanville studio, need us to come to you, or want to build your authority remotely, we have a setup option for you.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20 rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#131313]/10"
          >
            <img 
              src={dfwImage} 
              alt="Duncanville Studio Setup" 
              className="w-full h-auto object-cover aspect-video"
            />
          </motion.div>

          {/* THE RISE FRAMEWORK & STRATEGY SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="mt-24 rounded-[2.5rem] bg-[#131313] text-[#F5F5F0] shadow-2xl relative overflow-hidden border border-[#F5F5F0]/10"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#ff4d00]/10 to-transparent pointer-events-none" />
            
            <div className="p-8 md:p-16">
              <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
                <h3 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tighter">
                  Rise in Your Purpose. <br />
                  <span className="text-[#ff4d00]">Render Your Calling.</span>
                </h3>
                <p className="text-lg md:text-xl text-[#F5F5F0]/80 leading-relaxed border-l-4 border-[#ff4d00] pl-6 text-left italic">
                  "This is a community built primarily for creatives representing Christ. We are here to help you master the tools of the trade so you can share your message with excellence."
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12 relative z-10">
                <div>
                  <h4 className="text-2xl font-black mb-6 text-white uppercase tracking-wider">The 30-Minute Strategy Session</h4>
                  <p className="text-[#F5F5F0]/70 mb-8 leading-relaxed">
                    In this complimentary session, we aren't just going to talk about cameras and microphones. We are going to audit your current brand visibility and identify exactly how a video podcast can become a lead-generating engine for your business. On this call, we will:
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#ff4d00]/10 flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-[#ff4d00]" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-lg">Clarify Your Content Goals</h5>
                        <p className="text-[#F5F5F0]/60 text-sm mt-1 leading-relaxed">Are we building widespread fame, deep audience trust, or a direct sales pipeline? We build the strategy to match the goal.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#ff4d00]/10 flex items-center justify-center flex-shrink-0">
                        <Music className="w-6 h-6 text-[#ff4d00]" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-lg">Establish Your Sonic Brand</h5>
                        <p className="text-[#F5F5F0]/60 text-sm mt-1 leading-relaxed">Explore incorporating custom music produced by Mike Miller to give your show a 100% unique, premium audio identity that cuts through the noise.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#ff4d00]/10 flex items-center justify-center flex-shrink-0">
                        <Video className="w-6 h-6 text-[#ff4d00]" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-lg">Visualize Your Set</h5>
                        <p className="text-[#F5F5F0]/60 text-sm mt-1 leading-relaxed">Determine which of our premium studio aesthetics perfectly matches your brand's vibe and authority.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A1A1A] p-8 rounded-3xl border border-white/5">
                  <h4 className="text-2xl font-black mb-2 text-[#ff4d00] uppercase tracking-wider flex items-center gap-3">
                    <TrendingUp size={24} /> The "Rise" Framework
                  </h4>
                  <p className="text-[#F5F5F0]/60 text-sm mb-8 leading-relaxed">
                    Pricing starts at <strong>$3,000/month</strong> rather than a rigid set price. We audit your unique needs to design the exact blueprint required to scale your business. We will explore one of our core tiers:
                  </p>

                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ff4d00]/50 transition-colors">
                      <h5 className="font-black text-white text-lg tracking-wide mb-2">I. The Ascent</h5>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-[#F5F5F0]/70"><CheckCircle size={16} className="text-[#ff4d00] mt-0.5 flex-shrink-0" /> Up to 3 hours of studio time</li>
                        <li className="flex items-start gap-2 text-sm text-[#F5F5F0]/70"><CheckCircle size={16} className="text-[#ff4d00] mt-0.5 flex-shrink-0" /> 2 Long-form 4K videos + 4 Social Clips</li>
                        <li className="flex items-start gap-2 text-sm text-[#F5F5F0]/70"><CheckCircle size={16} className="text-[#ff4d00] mt-0.5 flex-shrink-0" /> Standard thumbnails & dedicated YouTube management</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ff4d00]/50 transition-colors">
                      <h5 className="font-black text-white text-lg tracking-wide mb-2">II. The Summit</h5>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-[#F5F5F0]/70"><CheckCircle size={16} className="text-[#ff4d00] mt-0.5 flex-shrink-0" /> Up to 5 hours of studio time</li>
                        <li className="flex items-start gap-2 text-sm text-[#F5F5F0]/70"><CheckCircle size={16} className="text-[#ff4d00] mt-0.5 flex-shrink-0" /> 4 Long-form 4K videos + 4 Mastered Audio Episodes</li>
                        <li className="flex items-start gap-2 text-sm text-[#F5F5F0]/70"><CheckCircle size={16} className="text-[#ff4d00] mt-0.5 flex-shrink-0" /> 12 Social Clips + YouTube & Podcast management</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#ff4d00]/20 to-white/5 border border-[#ff4d00]/30 shadow-[0_0_30px_rgba(255,77,0,0.1)]">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-black text-white text-lg tracking-wide">III. The Horizon</h5>
                        <span className="bg-[#ff4d00] text-black text-[10px] font-black uppercase px-2 py-1 rounded-md">Premier</span>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-[#F5F5F0]/80"><CheckCircle size={16} className="text-[#ff4d00] mt-0.5 flex-shrink-0" /> 5 hours studio + 4 Videos + 4 Audio Podcasts</li>
                        <li className="flex items-start gap-2 text-sm text-[#F5F5F0]/80"><CheckCircle size={16} className="text-[#ff4d00] mt-0.5 flex-shrink-0" /> 20 Social Clips + Premium Custom Thumbnails</li>
                        <li className="flex items-start gap-2 text-sm text-[#F5F5F0]/80"><CheckCircle size={16} className="text-[#ff4d00] mt-0.5 flex-shrink-0" /> Full management across 3 platforms + Strategy Review</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: HOURLY & BATCH RECORDING SECTION */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-20 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h4 className="text-2xl font-black mb-3 text-white uppercase tracking-wider">A La Carte Studio Sessions</h4>
                  <p className="text-[#F5F5F0]/70 text-sm leading-relaxed mb-4">
                    All of our filming and recording services take place in our amazing, fully-equipped studio in Duncanville, TX. Just need a space to shoot your content without the full management package? We have you covered.
                  </p>
                  <p className="text-[#F5F5F0]/40 text-xs italic">
                    * Editing and other post-production services are available upon request. However, we highly recommend our signature "Rise Framework" services above for end-to-end strategy and management.
                  </p>
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 text-center flex-1 md:min-w-[140px]">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Hourly Rate</p>
                    <p className="text-3xl font-black text-white">$250<span className="text-sm text-white/40 font-medium">/hr</span></p>
                  </div>
                  <div className="bg-gradient-to-br from-[#ff4d00]/20 to-white/5 border border-[#ff4d00]/40 rounded-2xl p-6 text-center flex-1 shadow-[0_0_20px_rgba(255,77,0,0.1)] relative overflow-hidden md:min-w-[160px]">
                    <div className="absolute top-0 right-0 bg-[#ff4d00] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-bl-lg">Save $200</div>
                    <p className="text-[#ff4d00] text-xs font-bold uppercase tracking-widest mb-2">Batch Record</p>
                    <p className="text-3xl font-black text-white">$800<span className="text-sm text-[#ff4d00]/60 font-medium">/4 hrs</span></p>
                  </div>
                </div>
              </div>

              <div className="text-center relative z-10 pt-10 border-t border-white/10">
                <h4 className="text-2xl font-bold text-white mb-8">Ready to turn your expertise into a video brand that honors your mission?</h4>
                <a 
                  href="https://tally.so/r/dWxaOy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#ff4d00] text-[#131313] px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-orange-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,77,0,0.3)] text-lg"
                >
                  Book Your Free Strategy Session
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-32 bg-[#0a0a0a] text-[#F5F5F0] border-t border-[#F5F5F0]/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
              Client <span className="text-[#ff4d00]">Success</span>
            </h2>
            <p className="text-xl text-[#F5F5F0]/60 leading-relaxed">
              Hear from the experts who moved from hidden to highly visible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-10 rounded-[2rem] border border-[#F5F5F0]/5 relative overflow-hidden flex flex-col justify-between h-full">
              <div 
                className="absolute -bottom-16 -right-4 text-[16rem] font-serif leading-none select-none"
                style={{ color: 'transparent', WebkitTextStroke: '4px rgba(255, 77, 0, 0.15)' }}
              >
                "
              </div>
              <p className="text-lg text-[#F5F5F0]/80 italic leading-relaxed mb-12 relative z-10">
                "Mike came over to my home and provided me with guidance on how to setup my podcast and best practices to help my video podcast get started. I have since recorded many special episodes!"
              </p>
              <div className="relative z-10">
                <p className="font-bold text-white">— Damon F.</p>
                <p className="text-sm text-[#ff4d00]">Podcast Host</p>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-10 rounded-[2rem] border border-[#F5F5F0]/5 relative overflow-hidden flex flex-col justify-between h-full">
              <div 
                className="absolute -bottom-16 -right-4 text-[16rem] font-serif leading-none select-none"
                style={{ color: 'transparent', WebkitTextStroke: '4px rgba(255, 77, 0, 0.15)' }}
              >
                "
              </div>
              <p className="text-lg text-[#F5F5F0]/80 italic leading-relaxed mb-12 relative z-10">
                "Rise & Render completely transformed the way we approach content. The remote consulting helped us dial in our lighting and audio without having to buy a whole new studio."
              </p>
              <div className="relative z-10">
                <p className="font-bold text-white">— Richard H.</p>
                <p className="text-sm text-[#ff4d00]">YouTube Creator</p>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div whileHover={{ y: -5 }} className="bg-[#131313] p-10 rounded-[2rem] border border-[#F5F5F0]/5 relative overflow-hidden flex flex-col justify-between h-full">
              <div 
                className="absolute -bottom-16 -right-4 text-[16rem] font-serif leading-none select-none"
                style={{ color: 'transparent', WebkitTextStroke: '4px rgba(255, 77, 0, 0.15)' }}
              >
                "
              </div>
              <p className="text-lg text-[#F5F5F0]/80 italic leading-relaxed mb-12 relative z-10">
                "Having access to the DFW studio was a game changer. All I had to do was show up and speak my message. The team handled the rest with absolute excellence."
              </p>
              <div className="relative z-10">
                <p className="font-bold text-white">— Jasmine B.</p>
                <p className="text-sm text-[#ff4d00]">Author & Speaker</p>
              </div>
           </motion.div>

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

export default LandingPage;
