import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, X, MapPin, Wrench, HeartHandshake, Share2 
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

      {/* HEADER / NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#131313]/90 backdrop-blur-md border-b border-[#F5F5F0]/5 px-6 lg:px-12 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <BrandLogo className="h-14 md:h-16 w-auto" />
        </div>

       {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-base font-bold text-[#F5F5F0]/80">
          <button onClick={() => scrollToSection('about')} className="hover:text-[#ff4d00] transition-colors">About</button>
          
          <button onClick={() => navigate('/pricing')} className="hover:text-[#ff4d00] transition-colors">Pricing & Packages</button>
          
          <button onClick={() => navigate('/login')} className="hover:text-[#ff4d00] transition-colors">Resources</button>
          
          <button onClick={handleShare} className="hover:text-[#ff4d00] transition-colors flex items-center gap-2">
            <Share2 size={18} /> Share
          </button>
          
          <button onClick={() => navigate('/login')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full transition-all tracking-wide">Join/Login</button>
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
          <button onClick={() => { scrollToSection('about'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">About</button>
          
          <button onClick={() => { navigate('/pricing'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">Pricing & Packages</button>
          
          <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">Resources</button>
          
          <button onClick={() => { handleShare(); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors flex items-center gap-2">
            <Share2 size={20} /> Share Site
          </button>
          
          <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-full transition-all">Join/Login</button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-56 pb-40 px-6 md:px-12 max-w-[1440px] mx-auto flex flex-col items-center text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-[1200px] aspect-[21/9] mb-20 rounded-[3rem] overflow-hidden border border-[#F5F5F0]/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] group"
        >
          <motion.img 
            src={headerImage} 
            alt="Professional Podcast Studio Setup"
            className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000"
            whileHover={{ scale: 1.05, rotate: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/50 to-transparent" />
        </motion.div>

        <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-black max-w-[1200px] mb-10 leading-[0.92] text-[#F5F5F0] tracking-tighter">
          RISE IN YOUR PURPOSE. <br/>
          <span className="text-[#ff4d00]">RENDER YOUR CALLING.</span>
        </h1>

        <p className="text-xl md:text-3xl text-[#F5F5F0]/80 max-w-5xl mb-16 font-medium leading-relaxed">
          The definitive home for faith-driven creators. From our high-end recording studio to our community, we provide the tools and network to bring your God-given vision to life.
        </p>

       <div className="flex flex-col sm:flex-row items-center gap-6">
          <button 
            onClick={() => navigate('/pricing')} 
            className="bg-[#ff4d00] hover:bg-orange-500 text-[#131313] font-black uppercase tracking-widest py-5 px-12 rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,77,0,0.4)] text-xl w-full sm:w-auto"
          >
            View Pricing & Packages
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-[#ff4d00]/50 font-black uppercase tracking-widest py-5 px-12 rounded-full transition-all hover:scale-105 shadow-lg text-xl w-full sm:w-auto text-center backdrop-blur-sm"
          >
            Join the Community
          </button>
        </div>
      </section>

      {/* WHY WE EXIST SECTION */}
      <section id="about" className="py-40 bg-[#F5F5F0] text-[#131313] relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-5xl mx-auto mb-28">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-10 uppercase tracking-tighter">Why We Exist</h2>
            <p className="text-2xl md:text-3xl lg:text-4xl leading-relaxed font-medium text-[#131313]/80">
              You were created to create, but navigating the technical side of content creation can be overwhelming. 
              We exist to bridge the gap between your God-given message and the technical excellence required to share it effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <motion.div whileHover={{ y: -8 }} className="p-12 rounded-[2.5rem] bg-white border border-black/5 shadow-2xl shadow-black/5">
              <div className="w-20 h-20 rounded-3xl bg-[#ff4d00]/10 flex items-center justify-center mb-10">
                <Wrench className="w-10 h-10 text-[#ff4d00]" />
              </div>
              <h3 className="text-3xl font-black mb-6 uppercase tracking-tight">Tech & Gear Mastery</h3>
              <p className="text-xl text-[#131313]/70 leading-relaxed">
                Master the tools of the trade, from software setups and editing workflows to camera and audio recommendations.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} className="p-12 rounded-[2.5rem] bg-white border border-black/5 shadow-2xl shadow-black/5">
              <div className="w-20 h-20 rounded-3xl bg-[#ff4d00]/10 flex items-center justify-center mb-10">
                <MapPin className="w-10 h-10 text-[#ff4d00]" />
              </div>
              <h3 className="text-3xl font-black mb-6 uppercase tracking-tight">DFW Podcast Studio</h3>
              <p className="text-xl text-[#131313]/70 leading-relaxed">
                Local to Dallas-Fort Worth? Get access to our fully equipped, professional recording space designed for high-end production.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} className="p-12 rounded-[2.5rem] bg-white border border-black/5 shadow-2xl shadow-black/5">
              <div className="w-20 h-20 rounded-3xl bg-[#ff4d00]/10 flex items-center justify-center mb-10">
                <HeartHandshake className="w-10 h-10 text-[#ff4d00]" />
              </div>
              <h3 className="text-3xl font-black mb-6 uppercase tracking-tight">Faith & Community</h3>
              <p className="text-xl text-[#131313]/70 leading-relaxed">
                Connect, share, and pray with like-minded believers in the digital space. Grow your craft alongside your faith.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY SECTION */}
      <section className="py-40 bg-[#131313] text-[#F5F5F0] border-t border-[#F5F5F0]/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-[#ff4d00] rounded-full mix-blend-screen filter blur-[250px] opacity-[0.03] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-12 uppercase tracking-tighter">The Vision <br/><span className="text-[#ff4d00]">Behind It</span></h2>
              <div className="space-y-8 text-xl md:text-2xl text-[#F5F5F0]/80 leading-relaxed">
                <p>
                  For years, our founder Mike Miller has helped brands and small businesses with equipment, gear setups, recommendations, and full-cycle media production as a creative director through his business, <a href="https://mikemillermedia.com" target="_blank" rel="noopener noreferrer" className="text-[#ff4d00] hover:underline font-bold">Mike Miller Media</a>.
                </p>
                <p>
                  But after helping many people build their platforms, Mike realized a deep need to build within the Kingdom of God. His personal growth as a father, husband, and friend inspired him to translate that transformation into his professional life.
                </p>
                <p>
                  Through fasting and prayer, Mike was guided to shift the focus of Rise & Render. It is no longer just a recording studio—it is a dedicated community where he can share his knowledge and God-given giftings.
                </p>
                <p className="font-medium text-[#F5F5F0] border-l-[6px] border-[#ff4d00] pl-8 py-4 mt-12 bg-white/5 rounded-r-2xl">
                  "This is a community built primarily for creatives representing Christ. We are here to help you master the tools of the trade so you can share your message with excellence."
                </p>
              </div>
            </div>
            <div className="relative mt-10 xl:mt-0">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-[#F5F5F0]/10 relative shadow-2xl">
                <img 
                  src={mikeMillerImage} 
                  alt="Mike Miller - Founder of Rise & Render" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#ff4d00]/20 rounded-full filter blur-[60px]" />
            </div>
          </div>
        </div>
      </section>

      {/* DFW STUDIO MARKETING SECTION */}
      <section id="dfw-studio" className="py-40 bg-[#F5F5F0] text-[#131313] border-t border-[#131313]/5 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto mb-20"
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-10 uppercase tracking-tighter">
              Serving <span className="text-[#ff4d00]">DFW & Beyond</span>
            </h2>
            <p className="text-2xl md:text-3xl text-[#131313]/80 leading-relaxed mb-12">
              Whether you're local to our Duncanville studio, need us to come to you, or want to build your authority remotely, we have a setup option tailored for your specific goals. 
              We provide the professional cameras, studio lighting, and engineered audio so all you have to do is show up and speak.
            </p>
            <button 
              onClick={() => navigate('/pricing')}
              className="bg-[#131313] hover:bg-black text-[#F5F5F0] font-black uppercase tracking-widest py-5 px-16 rounded-full transition-all hover:scale-105 shadow-2xl text-xl"
            >
              Build Your Package
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-[3rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.3)] border border-[#131313]/10"
          >
            <img 
              src={dfwImage} 
              alt="Duncanville Studio Setup" 
              className="w-full h-auto object-cover aspect-video"
            />
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-40 bg-[#0a0a0a] text-[#F5F5F0] border-t border-[#F5F5F0]/5 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-24">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter">
              Client <span className="text-[#ff4d00]">Success</span>
            </h2>
            <p className="text-2xl md:text-3xl text-[#F5F5F0]/60 leading-relaxed">
              Hear from the experts who moved from hidden to highly visible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Testimonial 1 */}
            <motion.div whileHover={{ y: -8 }} className="bg-[#131313] p-12 rounded-[2.5rem] border border-[#F5F5F0]/5 relative overflow-hidden flex flex-col justify-between h-full shadow-2xl">
              <div 
                className="absolute -bottom-16 -right-4 text-[20rem] font-serif leading-none select-none"
                style={{ color: 'transparent', WebkitTextStroke: '4px rgba(255, 77, 0, 0.10)' }}
              >
                "
              </div>
              <p className="text-xl md:text-2xl text-[#F5F5F0]/80 italic leading-relaxed mb-16 relative z-10">
                "Mike came over to my home and provided me with guidance on how to setup my podcast and best practices to help my video podcast get started. I have since recorded many special episodes!"
              </p>
              <div className="relative z-10">
                <p className="text-xl font-bold text-white">— Damon F.</p>
                <p className="text-lg text-[#ff4d00]">Podcast Host</p>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div whileHover={{ y: -8 }} className="bg-[#131313] p-12 rounded-[2.5rem] border border-[#F5F5F0]/5 relative overflow-hidden flex flex-col justify-between h-full shadow-2xl">
              <div 
                className="absolute -bottom-16 -right-4 text-[20rem] font-serif leading-none select-none"
                style={{ color: 'transparent', WebkitTextStroke: '4px rgba(255, 77, 0, 0.10)' }}
              >
                "
              </div>
              <p className="text-xl md:text-2xl text-[#F5F5F0]/80 italic leading-relaxed mb-16 relative z-10">
                "Rise & Render completely transformed the way we approach content. The remote consulting helped us dial in our lighting and audio without having to buy a whole new studio."
              </p>
              <div className="relative z-10">
                <p className="text-xl font-bold text-white">— Richard H.</p>
                <p className="text-lg text-[#ff4d00]">YouTube Creator</p>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div whileHover={{ y: -8 }} className="bg-[#131313] p-12 rounded-[2.5rem] border border-[#F5F5F0]/5 relative overflow-hidden flex flex-col justify-between h-full shadow-2xl">
              <div 
                className="absolute -bottom-16 -right-4 text-[20rem] font-serif leading-none select-none"
                style={{ color: 'transparent', WebkitTextStroke: '4px rgba(255, 77, 0, 0.10)' }}
              >
                "
              </div>
              <p className="text-xl md:text-2xl text-[#F5F5F0]/80 italic leading-relaxed mb-16 relative z-10">
                "Having access to the DFW studio was a game changer. All I had to do was show up and speak my message. The team handled the rest with absolute excellence."
              </p>
              <div className="relative z-10">
                <p className="text-xl font-bold text-white">— Jasmine B.</p>
                <p className="text-lg text-[#ff4d00]">Author & Speaker</p>
              </div>
            </motion.div>

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

    </div>
  );
};

export default LandingPage;
