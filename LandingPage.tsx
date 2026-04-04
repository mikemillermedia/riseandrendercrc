/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useNavigate } from 'react-router-dom';
import { Send, Heart, Quote, Menu, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, MapPin, Wrench, HeartHandshake, Video, Globe, ArrowUp
} from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import CustomCursor from './components/CustomCursor';
import AIChat from './components/AIChat';
import BrandLogo from './components/BrandLogo';
import mikeMillerImage from './mike-miller.png';
import headerImage from './studio set 1 still_1.1.1.png';
import dfwImage from './studio 2 set still_1.1.2.png';

// Easter Eggs

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

  return (
    <div className="relative min-h-screen bg-[#131313] text-[#F5F5F0]">
      <CustomCursor />
      <FluidBackground />
      <AIChat />

{/* HEADER / NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#131313]/90 backdrop-blur-md border-b border-[#F5F5F0]/5 px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <BrandLogo className="h-14 md:h-16 w-auto" />
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#F5F5F0]/80">
          <button onClick={() => navigate('/login')} className="bg-[#ff4d00] hover:bg-[#ff4d00]/90 text-[#131313] font-black uppercase tracking-widest py-2 px-6 rounded-full transition-all hover:scale-105 shadow-[0_0_15px_rgba(255,77,0,0.3)]">
  Login/Join
</button>
        </nav>

        {/* Right Side: Join Button & Mobile Toggle */}
        <div className="flex items-center gap-4">
         <button onClick={() => scrollToSection('about')} className="hover:text-[#ff4d00] transition-colors">About</button>
          <button onClick={() => scrollToSection('resources')} className="hover:text-[#ff4d00] transition-colors">Resources</button>
          <button onClick={() => scrollToSection('dfw-studio')} className="hover:text-[#ff4d00] transition-colors">DFW Studio</button>

          <button 
            className="md:hidden text-[#F5F5F0]/80 hover:text-[#ff4d00] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[72px] left-0 w-full bg-[#131313] border-b border-[#F5F5F0]/10 flex flex-col items-center py-6 gap-6 text-sm font-medium text-[#F5F5F0]/80 z-40">
          <button onClick={() => { scrollToSection('about'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">About</button>
          <button onClick={() => { scrollToSection('resources'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">Resources</button>
          <button onClick={() => { scrollToSection('dfw-studio'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">DFW Studio</button>
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

        <h1 className="text-5xl md:text-8xl font-black max-w-5xl mb-8 leading-[0.95] text-[#F5F5F0] tracking-tighter">
          CREATE WITH PURPOSE. <br/>
          <span className="text-[#ff4d00]">MASTER YOUR CRAFT.</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-[#F5F5F0]/80 max-w-3xl mb-12 font-medium leading-relaxed">
          A community for Creatives Representing Christ focusing on tech, gear, and elevating your content.
        </p>

        <button onClick={() => navigate('/login')} className="bg-[#ff4d00] hover:bg-[#ff4d00]/90 text-[#131313] font-black uppercase tracking-widest py-3.5 px-10 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,77,0,0.4)] text-lg md:text-xl">
  Join Now
</button>
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
            {/* Pillar 1 */}
            <motion.div whileHover={{ y: -5 }} className="p-10 rounded-[2rem] bg-white border border-black/5 shadow-xl shadow-black/5">
              <div className="w-16 h-16 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center mb-8">
                <Wrench className="w-8 h-8 text-[#ff4d00]" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Tech & Gear Mastery</h3>
              <p className="text-[#131313]/70 leading-relaxed">
                Master the tools of the trade, from software setups and editing workflows to camera and audio recommendations.
              </p>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div whileHover={{ y: -5 }} className="p-10 rounded-[2rem] bg-white border border-black/5 shadow-xl shadow-black/5">
              <div className="w-16 h-16 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center mb-8">
                <MapPin className="w-8 h-8 text-[#ff4d00]" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">DFW Podcast Studio</h3>
              <p className="text-[#131313]/70 leading-relaxed">
                Local to Dallas-Fort Worth? Get access to our fully equipped, professional recording space designed for high-end production.
              </p>
            </motion.div>

            {/* Pillar 3 */}
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
              
              {/* Decorative elements */}
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

      {/* RESOURCES SECTION */}
      <section id="resources" className="py-32 bg-[#131313] border-t border-[#F5F5F0]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#ff4d00] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.03] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-black mb-8 uppercase tracking-tighter text-[#ff4d00]">
            Elevate Your Content for Free.
          </h2>
          <p className="text-xl md:text-2xl text-[#F5F5F0]/80 mb-12 leading-relaxed">
            Get access to our library of free technical and creative resources. 
            <br/><span className="text-sm text-[#F5F5F0]/50 mt-4 block">(Note: Premium services and advanced masterclasses coming soon).</span>
          </p>

          <div className="flex justify-center">
            <button onClick={() => navigate('/login')} className="...">
  Join Now
</button>
          </div>
        </div>
      </section>

      {/* DFW STUDIO & SETUP OPTIONS SECTION */}
      <section id="dfw-studio" className="py-32 bg-[#F5F5F0] text-[#131313] border-t border-[#131313]/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">
              Serving <span className="text-[#ff4d00]">DFW & Beyond</span>
            </h2>
            <p className="text-xl text-[#131313]/80 leading-relaxed">
              Whether you're local to our Duncanville studio, need us to come to you, or want to build your authority remotely, we have a setup option for you.
            </p>
          </div>

          {/* DFW Studio Image */}
          <div className="mb-20 rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#131313]/10">
            <img 
              src={dfwImage} 
              alt="Duncanville Studio Setup" 
              className="w-full h-auto object-cover aspect-video"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Option 1 */}
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2rem] border border-[#131313]/5 shadow-xl shadow-black/5">
              <div className="w-14 h-14 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-[#ff4d00]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">In-Studio (Duncanville)</h3>
              <p className="text-[#131313]/70 leading-relaxed">
                Our Duncanville studio is ready. Your message is ready. The only thing missing is to hit record and speak. We handle the lighting, cameras, and audio.
              </p>
            </motion.div>

            {/* Option 2 */}
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2rem] border border-[#131313]/5 shadow-xl shadow-black/5">
              <div className="w-14 h-14 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center mb-6">
                <Video className="w-7 h-7 text-[#ff4d00]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Mobile Studio</h3>
              <p className="text-[#131313]/70 leading-relaxed">
                Don't want to travel? No problem. We bring the entire studio (cameras, lighting, and audio) directly to your home or office for a high-stakes, efficient environment.
              </p>
            </motion.div>

            {/* Option 3 */}
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2rem] border border-[#131313]/5 shadow-xl shadow-black/5">
              <div className="w-14 h-14 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-[#ff4d00]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Remote Consulting</h3>
              <p className="text-[#131313]/70 leading-relaxed">
                You don't need to step into our physical studio to leverage the Rise & Render system. We offer strategic remote consulting to architect your perfect content engine, wherever you are.
              </p>
            </motion.div>
          </div>

          {/* Studio Request CTA */}
          <div className="mt-20 p-12 rounded-[2.5rem] bg-[#131313] text-[#F5F5F0] text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[#ff4d00] opacity-[0.03] pointer-events-none" />
            <h3 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tighter">
              Book Your <span className="text-[#ff4d00]">Studio Session</span>
            </h3>
            <p className="text-xl text-[#F5F5F0]/70 max-w-3xl mx-auto mb-10 leading-relaxed">
              This is where you can book a studio request at our private studio. Exclusive pricing is available for members. If you haven't yet, fill out the form and join our waitlist to take advantage of special pricing.
            </p>
            <a 
              href="https://tally.so/r/dWxaOy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#ff4d00] text-[#131313] px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/30"
            >
              Request Studio Time
            </a>
          </div>

          {/* Mobile & Remote Consulting CTA */}
          <div className="mt-8 p-12 rounded-[2.5rem] bg-white text-[#131313] text-center shadow-2xl border border-[#131313]/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[#ff4d00] opacity-[0.02] pointer-events-none" />
            <h3 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tighter">
              Mobile Studio & <span className="text-[#ff4d00]">Remote Consulting</span>
            </h3>
            <p className="text-xl text-[#131313]/70 max-w-3xl mx-auto mb-10 leading-relaxed">
              Need us to come to you or want to build your authority remotely? Book a free consultation today. Special pricing is available for members in the Creatives Representing Christ (CRC) community.
            </p>
            <a 
              href="https://calendar.app.google/yHaHjKPJyDSnfNw97"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#131313] text-[#F5F5F0] px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/20"
            >
              Book Free Consultation
            </a>
          </div>
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
                "Mike came over to my home and provided me with guidance on how to setup my podcast and best practices to help my video podcast get started. I have since recorded many special guests and have a radio spot at a local station."
              </p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#ff4d00] flex items-center justify-center font-bold text-white text-xl">
                  B
                </div>
                <span className="font-bold text-lg">Barron D.</span>
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
                "Mike came to our consult prepared with ideas that helped give birth my logo and podcast. I wasn't sure what to expect, as it wasn't a process I had gone through before. However, thanks to his curiosity and suggestions, I trusted that I had chosen the right person."
              </p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#ff4d00] flex items-center justify-center font-bold text-white text-xl">
                  J
                </div>
                <span className="font-bold text-lg">Jasmine M.</span>
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
                "Absolutely these video edits. Thanks sooo much!! So glad I got my branding together now...thanks to you. Appreciate your help!"
              </p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#ff4d00] flex items-center justify-center font-bold text-white text-xl">
                  I
                </div>
                <span className="font-bold text-lg">Iyahna B.</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER / CTA */}
      <section className="py-32 bg-[#ff4d00] text-[#131313]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-8xl font-black mb-8 leading-none tracking-tighter uppercase">
            We're in the <br/>Building Phase.
          </h2>
          <p className="text-xl md:text-2xl font-medium mb-12 max-w-2xl mx-auto opacity-90">
            Have a say in how this community takes shape. Be the first to know when doors open.
          </p>
          
          <button onClick={() => navigate('/login')} className="...">
  Join Now
</button>

  </div>
</section>

      {/* FOOTER / CTA */}
      <footer className="py-12 bg-[#131313] border-t border-[#F5F5F0]/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
            <BrandLogo className="h-16 w-auto" />
          </div>
          <div className="text-center md:text-right">
             <p className="text-[#F5F5F0]/40 text-sm mb-2">© 2026 Rise and Render. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 z-40 bg-[#ff4d00]/10 hover:bg-[#ff4d00]/20 text-[#ff4d00] border border-[#ff4d00]/20 p-3 rounded-full backdrop-blur-md transition-colors shadow-lg"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
