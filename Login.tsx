import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false); // Defaulting to Sign Up mode since it's a new community
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Processing...');
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else navigate('/hub'); 
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Success! You can now sign in with those credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#F5F5F0] flex flex-col items-center justify-center p-6 relative">
      <button onClick={() => navigate('/')} className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-[#F5F5F0]/60 hover:text-[#ff4d00] transition-colors">
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="w-full max-w-lg bg-white/5 p-8 md:p-10 rounded-2xl border border-[#F5F5F0]/10 mt-16 md:mt-0 shadow-2xl">
        
        {/* Branding Headers */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
            CRC Hub
          </h1>
          <p className="text-[#ff4d00] font-bold tracking-widest text-xs md:text-sm uppercase mb-4">
            Creatives Representing Christ
          </p>
          <p className="text-[#F5F5F0]/70 text-sm md:text-base">
            {isLogin 
              ? 'Welcome back to the community. Sign in to access your assets.' 
              : 'Create a free account to join our private community of Christian creatives.'}
          </p>
        </div>

        {/* The Value Proposition (What's Inside) */}
        {!isLogin && (
          <div className="mb-8 bg-[#131313]/60 p-6 rounded-xl border border-[#F5F5F0]/5">
            <h3 className="font-bold text-sm mb-4 text-white uppercase tracking-widest text-center opacity-80">What's Inside?</h3>
            <ul className="text-sm text-[#F5F5F0]/80 space-y-4">
              <li className="flex gap-3 items-start">
                <span className="text-lg leading-none">✨</span>
                <span><strong>The Vault:</strong> Instant access to free media kits, graphic templates, and project files.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-lg leading-none">🤝</span>
                <span><strong>Community Chat:</strong> Connect, collaborate, and share advice with other creatives.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-lg leading-none">📸</span>
                <span><strong>Setup Showcase:</strong> Post your workspace and gear, and get inspiration from others.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-lg leading-none">🙏</span>
                <span><strong>Prayer Wall:</strong> A dedicated, private space to bear one another's burdens.</span>
              </li>
            </ul>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#131313] border border-[#F5F5F0]/20 rounded-xl px-4 py-3 text-[#F5F5F0] focus:outline-none focus:border-[#ff4d00] transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#131313] border border-[#F5F5F0]/20 rounded-xl px-4 py-3 text-[#F5F5F0] focus:outline-none focus:border-[#ff4d00] transition-colors"
            required
          />
          <button type="submit" className="w-full bg-[#ff4d00] hover:bg-[#ff4d00]/80 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 shadow-lg shadow-orange-900/20">
            {isLogin ? 'Sign In to Hub' : 'Create Free Account'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm font-medium text-[#ff4d00] bg-[#ff4d00]/10 py-2 rounded-lg">{message}</p>}

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center mt-6 text-sm text-[#F5F5F0]/60 hover:text-white transition-colors"
        >
          {isLogin ? "Don't have an account? Join the Hub" : "Already have an account? Sign in here"}
        </button>
      </div>
    </div>
  );
}
