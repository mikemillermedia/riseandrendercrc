import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LogOut, HeartHandshake, MessageSquare, User, Menu, X, 
  Download, Folder, Activity, Bell, HelpCircle, Mail, 
  Briefcase, Share2, Camera, UploadCloud, Sparkles, Loader2,
  Mic, Video, Lightbulb
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import PrayerWall from './components/PrayerWall';
import ProfileTab from './ProfileTab';
import CommunityChat from './CommunityChat';
import Members from './Members';
import DirectMessages from './components/DirectMessages'; 
import CollabBoard from './components/CollabBoard'; 
import freeKitImage from './The Content Creator Studio Kit.jpg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Hub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'guide';
  
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0); 
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  
  // AI STUDIO AUDIT STATES
  const [auditStep, setAuditStep] = useState<'upload' | 'questions' | 'analyzing' | 'results'>('upload');
  const [auditImage, setAuditImage] = useState<string | null>(null);
  const [auditFile, setAuditFile] = useState<File | null>(null); // NEW: Holds the actual file for upload
  const [auditForm, setAuditForm] = useState({
    format: 'solo',
    goal: '',
    budget: '2000',
    sendEmail: false
  });
  const [dynamicResult, setDynamicResult] = useState<any>(null);

  const desktopNotifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pageTitle = activeTab === 'audit' ? 'Studio Audit' : 'Community Hub';
    document.title = `${pageTitle} | Rise & Render`;
  }, [activeTab]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login');
      else setUser(session.user);
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
        if (data) setCurrentUserProfile(data);
      };
      fetchProfile();
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAuditFile(file); // Save the file for Supabase Storage
      const imageUrl = URL.createObjectURL(file);
      setAuditImage(imageUrl); // Save local URL for instant preview
      setAuditStep('questions');
    }
  };

  // --- THE REAL BACKEND CONNECTION ---
  const handleAnalyzeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditFile || !user) return;

    setAuditStep('analyzing');

    try {
      // 1. Upload to Supabase Storage bucket 'studio-audits'
      const fileExt = auditFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('studio-audits')
        .upload(fileName, auditFile, { upsert: true });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        throw new Error("Failed to upload image. Make sure your 'studio-audits' bucket exists and is public.");
      }

      // 2. Get Public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('studio-audits')
        .getPublicUrl(fileName);

      // 3. Call the Edge Function to run OpenAI analysis
      const { data: aiResult, error: fnError } = await supabase.functions.invoke('analyze-studio', {
        body: {
          imageUrl: publicUrl,
          format: auditForm.format,
          budget: auditForm.budget,
          goal: auditForm.goal
        }
      });

      if (fnError) {
        console.error("Function Error:", fnError);
        throw new Error("AI analysis failed. Check your Edge Function logs.");
      }

      // 4. Map the OpenAI JSON response to our UI state
      setDynamicResult({
        analysis: aiResult.analysis,
        gearList: aiResult.gearList
      });

      setAuditStep('results');
    } catch (err: any) {
      console.error('Audit failed:', err);
      alert('Analysis failed: ' + err.message);
      setAuditStep('questions');
    }
  };

  const resetAudit = () => {
    setAuditImage(null);
    setAuditFile(null);
    setAuditStep('upload');
    setAuditForm({ format: 'solo', goal: '', budget: '2000', sendEmail: false });
    setDynamicResult(null);
  };

  if (!user) return <div className="min-h-screen bg-[#131313] text-[#F5F5F0] flex items-center justify-center">Loading Hub...</div>;

  const NavLinks = () => (
    <>
      <button onClick={() => { setActiveTab('activity'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'activity' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}><Activity size={20} /> Latest Activity</button>
      <button onClick={() => { setActiveTab('collabs'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'collabs' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}><Briefcase size={20} /> Kingdom Collabs</button>
      <button onClick={() => { setActiveTab('prayer'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'prayer' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}><HeartHandshake size={20} /> Prayer Wall</button>
      <button onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'chat' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}><MessageSquare size={20} /> Community Chat</button>
      <button onClick={() => { setActiveTab('audit'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'audit' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}><Camera size={20} /> Studio Audit</button>
      <button onClick={() => { setActiveTab('vault'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}><Folder size={20} /> The Vault</button>
      <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Support & Share</div>
      <button onClick={() => { setActiveTab('guide'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-colors text-sm ${activeTab === 'guide' ? 'bg-white/10 text-white' : 'text-[#F5F5F0]/40 hover:text-white hover:bg-white/5'}`}><HelpCircle size={18} /> App Guide & FAQ</button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#131313] text-[#F5F5F0] flex flex-col md:flex-row relative">
      
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col w-64 border-r border-[#F5F5F0]/10 p-6 sticky top-0 h-screen overflow-y-auto z-40">
        <h2 className="font-black uppercase tracking-widest text-2xl mb-12 cursor-pointer" onClick={() => navigate('/')}>Rise & Render <span className="text-[#ff4d00]">Community</span></h2>
        <div className="flex flex-col gap-2 flex-grow"><NavLinks /></div>
      </div>

      <div className="flex-grow relative">
        <div className="p-6 md:p-12 max-w-5xl mx-auto w-full pt-10 md:pt-16 pb-28 md:pb-12">
          
          {/* AI AUDIT TAB CONTENT */}
          {activeTab === 'audit' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">AI Studio Analyzer</h1>
              <p className="text-[#F5F5F0]/60 mb-8">Upload a photo of your space for instant, AI-generated lighting and framing advice based on your budget.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* THE AI AUDIT FUNNEL */}
                <div className="bg-[#1A1A1A] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#ff4d00]/20 text-[#ff4d00] rounded-lg"><Sparkles size={24} /></div>
                    <h3 className="text-xl font-black text-white">Free AI Audit</h3>
                  </div>

                  {/* STEP 1: UPLOAD */}
                  {auditStep === 'upload' && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex-grow flex flex-col">
                      <p className="text-white/60 text-sm mb-6">Drop a photo of your current home or office setup. Our AI will analyze your lighting, background depth, and camera angle instantly.</p>
                      <div className="relative border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-center hover:border-[#ff4d00]/50 transition-colors cursor-pointer flex-grow bg-black/20 min-h-[200px]">
                        <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" title="Upload a photo of your studio" />
                        <div className="p-8 flex flex-col items-center">
                          <UploadCloud size={40} className="text-white/40 mb-3 group-hover:text-[#ff4d00] transition-colors" />
                          <p className="font-bold text-white mb-1">Click or tap to upload photo</p>
                          <p className="text-xs text-white/40">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: QUESTIONS */}
                  {auditStep === 'questions' && auditImage && (
                    <motion.form initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} onSubmit={handleAnalyzeSubmit} className="flex-grow flex flex-col space-y-4">
                      <div className="h-32 w-full rounded-xl overflow-hidden mb-2 relative">
                         <img src={auditImage} alt="Uploaded space" className="w-full h-full object-cover opacity-50" />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
                         <button type="button" onClick={resetAudit} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-lg text-white/60 hover:text-white"><X size={16}/></button>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Setup Type</label>
                        <select value={auditForm.format} onChange={(e) => setAuditForm({...auditForm, format: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff4d00]">
                          <option value="solo">Solo Recording (1 Person)</option>
                          <option value="duo">Interview / Podcast (2 People)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Target Budget</label>
                        <select value={auditForm.budget} onChange={(e) => setAuditForm({...auditForm, budget: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff4d00]">
                          <option value="1000">Under $1,000 (Scrappy / Smartphone)</option>
                          <option value="2000">$1,800 - $3,000 (The Rise & Render Kit)</option>
                          <option value="5000">$3,000+ (Premium Multi-Cam Studio)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Primary Goal</label>
                        <input type="text" placeholder="e.g. Launch a YouTube channel, Record client videos..." value={auditForm.goal} onChange={(e) => setAuditForm({...auditForm, goal: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff4d00]" required />
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="emailOption" checked={auditForm.sendEmail} onChange={(e) => setAuditForm({...auditForm, sendEmail: e.target.checked})} className="rounded bg-black/40 border-white/10 text-[#ff4d00] focus:ring-[#ff4d00]" />
                        <label htmlFor="emailOption" className="text-xs text-white/60 cursor-pointer">Email me the results if this takes a while.</label>
                      </div>

                      <button type="submit" className="w-full py-3.5 mt-2 bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest rounded-xl transition-colors">
                        Generate Blueprint
                      </button>
                    </motion.form>
                  )}

                  {/* STEP 3: ANALYZING */}
                  {auditStep === 'analyzing' && auditImage && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex-grow flex flex-col items-center justify-center py-12">
                      <div className="relative w-32 h-32 mb-6">
                        <img src={auditImage} className="w-full h-full rounded-full object-cover opacity-30 animate-pulse" />
                        <Loader2 size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#ff4d00] animate-spin" />
                      </div>
                      <p className="font-bold text-white mb-2 text-lg">AI is analyzing your pixels...</p>
                      <p className="text-sm text-white/50 text-center max-w-xs">Cross-referencing dimensions, lighting constraints, and optimal gear placement.</p>
                      {auditForm.sendEmail && <p className="text-xs text-[#ff4d00] mt-6">We will email you the full report shortly.</p>}
                    </motion.div>
                  )}

                  {/* STEP 4: RESULTS */}
                  {auditStep === 'results' && auditImage && dynamicResult && (
                    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="flex-grow flex flex-col h-full relative">
                      
                      {/* The Overlaid Image Component */}
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 group border border-white/10">
                        <img src={auditImage} className="w-full h-full object-cover opacity-40 blur-[2px]" />
                        
                        {/* Simulated Gear Placements */}
                        <div className="absolute top-1/3 left-1/4 bg-[#ff4d00] p-1.5 rounded-full shadow-[0_0_15px_rgba(255,77,0,0.8)]"><Video size={14} className="text-black"/></div>
                        <div className="absolute top-1/4 right-1/4 bg-blue-500 p-1.5 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"><Lightbulb size={14} className="text-black"/></div>
                        <div className="absolute bottom-1/3 left-1/3 bg-purple-500 p-1.5 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]"><Mic size={14} className="text-black"/></div>

                        {/* Text Overlay Box */}
                        <div className="absolute inset-x-4 bottom-4 bg-[#1a1a1a]/95 p-4 rounded-xl border border-[#ff4d00]/30 shadow-2xl backdrop-blur-md">
                          <p className="text-xs text-white/90 leading-relaxed font-medium">
                            <span className="font-bold text-[#ff4d00]">AI Analysis Complete:</span> {dynamicResult.analysis}
                          </p>
                        </div>
                      </div>

                      {/* Dynamic Gear List */}
                      <div className="bg-black/30 rounded-xl p-5 border border-white/5 mb-6 flex-grow">
                        <h4 className="text-[#ff4d00] font-black uppercase tracking-widest text-xs mb-4">Recommended Gear Matrix</h4>
                        <ul className="space-y-4 text-sm text-white/80">
                          {dynamicResult.gearList.map((item: any, i: number) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="text-white/40 mt-0.5 shrink-0">
                                {item.icon === 'video' ? <Video size={16}/> : item.icon === 'mic' ? <Mic size={16}/> : <Lightbulb size={16}/>}
                              </div> 
                              <span className="leading-snug">{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-3 mt-auto">
                        <button onClick={resetAudit} className="px-4 py-3 text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Start Over</button>
                        <a href="/The Content Creator Studio Kit.pdf" download className="flex-grow flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
                          <Download size={14}/> Download Gear Links
                        </a>
                      </div>

                    </motion.div>
                  )}
                </div>

                {/* THE PAID CONSULTATION UPSELL */}
                <div className="bg-gradient-to-br from-[#ff4d00]/10 to-transparent border border-[#ff4d00]/30 p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4d00]/10 rounded-full blur-3xl" />
                  
                  <div>
                    <div className="inline-block px-3 py-1 bg-[#ff4d00] text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                      Expert Review
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">1-on-1 Strategy Session</h3>
                    <p className="text-white/80 text-sm mb-6 leading-relaxed">
                      AI gives general advice; I give you a blueprint. Get a 60-minute personal consultation where we dissect your space, pick the exact gear for your budget, and architect a studio that amplifies your ministry.
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-[#ff4d00] font-bold">✓</span> Pre-call space and gear review
                      </li>
                      <li className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-[#ff4d00] font-bold">✓</span> 60-minute video consultation
                      </li>
                      <li className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-[#ff4d00] font-bold">✓</span> Custom gear shopping list
                      </li>
                      <li className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-[#ff4d00] font-bold">✓</span> Full video recording of our session
                      </li>
                    </ul>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-3xl font-black text-white">$197</span>
                      <span className="text-xs text-white/40 mb-1">or 4 interest-free payments with Klarna</span>
                    </div>
                    <button 
                      onClick={() => alert("Stripe checkout integration coming soon!")}
                      className="w-full py-4 bg-[#ff4d00] hover:bg-[#e64500] text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-[0_0_20px_rgba(255,77,0,0.3)]"
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ... Vault & Guide Content remains ... */}

        </div>
      </div>
    </div>
  );
}
