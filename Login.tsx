import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Folder, Video, MessageSquare, Shield, Cross } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Rise & Render | Sanctuary Login";
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/hub');
    };
    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Success! Check your email to confirm your account.');
        setIsSignUp(false); 
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/hub');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#131313] border border-white/10 p-8 md:p-10 rounded-3xl w-full max-w-5xl flex flex-col md:flex-row shadow-2xl relative overflow-hidden gap-10">
        
        {/* LEFT SIDE: Features of the Control Room */}
        <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white uppercase tracking-widest">Sanctuary <br/><span className="text-[#ff4d00]">Control Room</span></h1>
            <p className="text-white/60 mt-4 text-sm leading-relaxed">
              Log in to your personalized digital twin studio space. Manage your gear, get instant tech support, and connect with other Christian creators.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <Folder className="text-[#ff4d00]" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">The Studio Blueprint</p>
                <p className="text-xs text-white/50">Your custom gear lists, camera settings, and audio presets saved forever.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <Video className="text-[#ff4d00]" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Director's Hotline</p>
                <p className="text-xs text-white/50">Drop video/audio questions directly to Mike when your tech acts up.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <Shield className="text-[#ff4d00]" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">The Kingdom Network</p>
                <p className="text-xs text-white/50">Connect with other Christian creators, share prayer requests, and collab.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Form */}
        <div className="w-full md:w-1/2 bg-black/40 border border-white/5 p-8 rounded-2xl relative z-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isSignUp ? "Create Your Account" : "Access Your Studio"}
          </h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A1A1A] text-white border border-white/10 px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-[#ff4d00] transition-colors"
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A1A1A] text-white border border-white/10 px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:border-[#ff4d00] transition-colors"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase py-3.5 px-4 rounded-xl transition-colors mt-2 disabled:opacity-50 tracking-widest"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <button onClick={() => setIsSignUp(!isSignUp)} className="mt-6 text-white/40 hover:text-white transition-colors text-xs font-medium uppercase tracking-wider text-center w-full">
            {isSignUp ? "Already a member? Sign in" : "Need access? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
}
