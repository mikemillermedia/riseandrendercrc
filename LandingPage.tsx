/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, MapPin, Wrench, HeartHandshake, Video, Globe, ArrowUp
} from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import CustomCursor from './components/CustomCursor';
import AIChat from './components/AIChat';
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
          <button onClick={() => scrollToSection('about')} className="hover:text-[#ff4d00] transition-colors">About</button>
          <button onClick={() => scrollToSection('resources')} className="hover:text-[#ff4d00] transition-colors">Resources</button>
          <button onClick={() => scrollToSection('dfw-studio')} className="hover:text-[#ff4d00] transition-colors">DFW Studio</button>
          <button onClick={() => navigate('/login')} className="hover:text-[#ff4d00] transition-colors font-bold text-white">Join/Login</button>
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden text-[#F5F5F0]/80 hover:text-[#ff4d00] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[72px] left-0 w-full bg-[#131313] border-b border-[#F5F5F0]/10 flex flex-col items-center py-6 gap-6 text-sm font-medium text-[#F5F5F0]/80 z-40">
          <button onClick={() => { scrollToSection('about'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">About</button>
          <button onClick={() => { scrollToSection('resources'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">Resources</button>
          <button onClick={() => { scrollToSection('dfw-studio'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors">DFW Studio</button>
          <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="hover:text-[#ff4d00] transition-colors font-bold text-white">Join/Login</button>
        </div>
      )}
      
      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-5xl aspect
