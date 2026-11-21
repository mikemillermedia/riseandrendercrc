import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Sparkles, ArrowRight, Lock, Mail, User, KeyRound } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Change this to whatever secret word you want to text your family
const FAMILY_PASSCODE = 'MILLER2026';

export default function FamilyAuth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // 1. Check simple family passcode
        if (passcode.trim().toUpperCase() !== FAMILY_PASSCODE.toUpperCase()) {
          throw new Error('Incorrect family passcode. Text Mike for the code!');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        // 2. Create auth account
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim()
            }
          }
        });
        if (error) throw error;

        // 3. Automatically configure their profile as a Millerite (Family-only)
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            display_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            is_millerite: true,
            is_client: false,
            status_emoji: '👋🏾',
            status_text: 'Just joined!'
          });
        }

        // 4. Route straight to Hub if auto-confirmed, otherwise prompt to check email
        if (data.session) {
          navigate('/hub');
        } else {
          setSuccessMsg('Account created! Check your email to confirm, then sign in.');
          setIsSignUp(false);
        }
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        navigate('/hub');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#ff4d00] selection:text-white">
      {/* Soft Apple-style ambient background glows */}
      <div className="fixed top-[-15%] right-[-10%] w-[500px] h-[500px] bg-amber-300/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-blue-300/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Frosted Glass Bento Card */}
        <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_12px_40px_rgb(0,0,0,0.06)] rounded-[36px] p-7 sm:p-9">
          
          {/* Header */}
          <div className="text-center mb-7">
            <span className="inline-flex items-center gap-1.5 bg-slate-900/5 border border-slate-900/10 text-slate-700 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-4">
              <Sparkles size={12} className="text-[#ff4d00]" /> Private Family Hub
            </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1.5">
              Millerites
            </h1>
            <p className="text-slate-500 text-xs font-medium">
              {isSignUp ? 'Create your family account in 30 seconds.' : 'Welcome back! Sign in to catch up with the crew.'}
            </p>
          </div>

          {/* Sign In / Join Toggle Pill */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/70 mb-6">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${isSignUp ? 'bg-[#1C1C2E] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Join Family
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">First Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="First"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl pl-9 pr-3 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl px-3.5 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl pl-9 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl pl-9 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[10px] font-extrabold text-[#ff4d00] uppercase tracking-wider mb-1.5 ml-1">Family Passcode</label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ff4d00]" />
                  <input
                    type="text"
                    required
                    placeholder="Enter family code"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-amber-50/70 border border-amber-200/80 rounded-2xl pl-9 pr-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-400 transition-all uppercase"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1C1C2E] hover:bg-slate-800 text-white font-bold text-xs tracking-wide py-3.5 rounded-2xl shadow-lg shadow-slate-900/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Family Account' : 'Enter Millerites'}
              <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
