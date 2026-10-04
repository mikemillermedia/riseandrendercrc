import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  FolderDown, LayoutDashboard, Film, Sparkles, ArrowRight, 
  Lock, Mail, Key, CheckCircle2, ShieldCheck
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!supabase) {
      setErrorMessage("Supabase is not configured properly. Check your environment variables.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              first_name: fullName.split(' ')[0] || '',
              last_name: fullName.split(' ').slice(1).join(' ') || '',
              display_name: fullName.trim() || 'Creator'
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Create initial profile record
          await supabase.from('profiles').upsert({
            id: data.user.id,
            first_name: fullName.split(' ')[0] || '',
            last_name: fullName.split(' ').slice(1).join(' ') || '',
            display_name: fullName.trim() || 'Creator',
            has_retainer: false
          });

          setSuccessMessage("Account created successfully! Logging you into the Sanctuary...");
          setTimeout(() => navigate('/hub'), 1500);
        }
      } else {
        // Sign In Flow
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });

        if (error) throw error;
        navigate('/hub');
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F0] font-sans flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ff4d00]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff4d00]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* TOP HEADER */}
      <header className="p-6 md:p-10 flex justify-between items-center relative z-10 max-w-7xl mx-auto w-full">
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white leading-none">
            Sanctuary
          </h2>
          <p className="text-[10px] md:text-xs text-[#ff4d00] font-bold uppercase tracking-widest mt-1">
            Control Room • Rise & Render
          </p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
        >
          Main Site
        </button>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="flex-1 flex items-center justify-center p-5 md:p-10 relative z-10 my-auto">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center">
          
          {/* LEFT COLUMN: WHAT'S POSSIBLE SHOWCASE */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-4 inline-block">
                Creator Operating System
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-[1.1]">
                Your All-In-One <br />
                <span className="text-[#ff4d00]">Production Command Center</span>
              </h1>
              <p className="text-white/60 text-xs sm:text-sm mt-4 leading-relaxed max-w-xl">
                Unlock immediate access to exclusive digital resources, or partner with us to engineer custom studio setups and turnkey video post-production pipelines.
              </p>
            </div>

            {/* ECOSYSTEM FEATURES */}
            <div className="space-y-4 pt-2">
              
              {/* Feature 1: Asset Vault (Included for Everyone) */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-start gap-4 hover:border-[#ff4d00]/30 transition-colors">
                <div className="p-3 rounded-xl bg-[#ff4d00]/10 border border-[#ff4d00]/20 text-[#ff4d00] shrink-0">
                  <FolderDown size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Asset Vault</h3>
                    <span className="bg-green-500/10 text-green-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-green-500/20">
                      Free Instant Access
                    </span>
                  </div>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">
                    Download official studio equipment kits, camera settings guides, LUTs, and high-end content creation blueprints.
                  </p>
                </div>
              </div>

              {/* Feature 2: Custom Blueprint */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 shrink-0">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Studio Blueprints</h3>
                    <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <Lock size={10} /> Consult Clients
                    </span>
                  </div>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">
                    Custom gear checklists, acoustics & camera setup instructions, and 1-on-1 studio consultation video replays.
                  </p>
                </div>
              </div>

              {/* Feature 3: Post-Production Retainer */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 shrink-0">
                  <Film size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Post-Production Retainer</h3>
                    <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <Lock size={10} /> Retainer Clients
                    </span>
                  </div>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">
                    Raw footage delivery feeds, interactive Review Room timestamped editing notes, and 1-on-1 team direct chat.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: AUTHENTICATION FORM */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-[#131313] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              
              {/* Form Tab Toggles */}
              <div className="flex rounded-xl bg-black p-1 border border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                    !isSignUp ? 'bg-[#ff4d00] text-black shadow-lg' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                    isSignUp ? 'bg-[#ff4d00] text-black shadow-lg' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Header inside Form */}
              <div className="mb-6">
                <h2 className="text-xl font-black uppercase text-white tracking-tight">
                  {isSignUp ? "Create Your Sanctuary Account" : "Access Control Room"}
                </h2>
                <p className="text-white/50 text-xs mt-1">
                  {isSignUp 
                    ? "Get instant access to the Asset Vault & Digital Resources." 
                    : "Sign in with your registered account email."}
                </p>
              </div>

              {/* Alerts */}
              {errorMessage && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} /> {successMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Mike Miller" 
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#ff4d00] transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" 
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#ff4d00] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#ff4d00] transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest py-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,77,0,0.25)] transition-all disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Authenticating...' : isSignUp ? 'Create Free Account' : 'Sign In To Control Room'}
                  {!isLoading && <ArrowRight size={16} />}
                </button>

              </form>

              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#ff4d00]" /> Encrypted Sanctuary Connection
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-6 text-center text-[10px] text-white/30 uppercase tracking-widest font-bold relative z-10">
        © {new Date().getFullYear()} Rise & Render. All Rights Reserved.
      </footer>

    </div>
  );
}
