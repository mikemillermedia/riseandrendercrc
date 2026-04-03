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
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Processing...');
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else navigate('/hub'); // This will redirect to the Hub we build next!
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Success! You can now sign in.');
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#F5F5F0] flex flex-col items-center justify-center p-6 relative">
      <button onClick={() => navigate('/')} className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-[#F5F5F0]/60 hover:text-[#ff4d00] transition-colors">
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="w-full max-w-md bg-white/5 p-8 rounded-2xl border border-[#F5F5F0]/10">
        <h2 className="text-3xl font-black text-center uppercase tracking-widest mb-2">
          {isLogin ? 'Welcome Back' : 'Join the Hub'}
        </h2>
        <p className="text-center text-[#F5F5F0]/60 mb-8">
          {isLogin ? 'Sign in to access your assets.' : 'Create a free account to get started.'}
        </p>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#131313] border border-[#F5F5F0]/20 rounded-xl px-4 py-3 text-[#F5F5F0] focus:outline-none focus:border-[#ff4d00]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#131313] border border-[#F5F5F0]/20 rounded-xl px-4 py-3 text-[#F5F5F0] focus:outline-none focus:border-[#ff4d00]"
            required
          />
          <button type="submit" className="w-full bg-[#ff4d00] hover:bg-[#ff4d00]/80 text-white font-bold py-3 rounded-xl transition-colors mt-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-[#ff4d00]">{message}</p>}

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center mt-6 text-sm text-[#F5F5F0]/60 hover:text-white transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
