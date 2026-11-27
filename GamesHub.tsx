import React, { useState, useEffect } from 'react';
import { Gamepad2, Crown, Sparkles, Lock, ArrowLeft } from 'lucide-react';
import ChessGame from './ChessGame';

interface GamesHubProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
  initialChessGameId?: string | null;
  onClearInitialGame?: () => void;
}

export default function GamesHub({
  supabase,
  userId,
  familyMembers,
  initialChessGameId,
  onClearInitialGame,
}: GamesHubProps) {
  const [selectedGame, setSelectedGame] = useState<'chess' | null>(
    initialChessGameId ? 'chess' : null
  );

  useEffect(() => {
    if (initialChessGameId) {
      setSelectedGame('chess');
    }
  }, [initialChessGameId]);

  if (selectedGame === 'chess') {
    return (
      <div className="animate-in fade-in duration-300 max-w-4xl mx-auto relative z-10 space-y-4">
        <button
          type="button"
          onClick={() => {
            setSelectedGame(null);
            onClearInitialGame?.();
          }}
          className="text-xs text-slate-500 hover:text-slate-900 uppercase font-bold tracking-widest flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft size={13} /> All Games
        </button>

        <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-5 sm:p-7">
          <ChessGame
            supabase={supabase}
            userId={userId}
            familyMembers={familyMembers}
            initialGameId={initialChessGameId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto relative z-10 space-y-5">
      {/* Header Card */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-8">
        <span className="inline-flex items-center gap-1.5 bg-slate-900/5 border border-slate-900/10 text-slate-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
          <Gamepad2 size={11} className="text-[#ff4d00]" /> Millerites Arcade
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Family Games
        </h1>
        <p className="text-slate-500 text-xs font-medium mt-1">
          Play solo against an AI bot, challenge a family member live, or text an invite link.
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. 3D CHESS (LIVE) */}
        <button
          type="button"
          onClick={() => setSelectedGame('chess')}
          className="text-left group bg-gradient-to-br from-[#1C1C2E] to-slate-900 text-white rounded-[32px] p-6 shadow-[0_12px_35px_rgba(28,28,46,0.18)] relative overflow-hidden hover:scale-[1.01] transition-all"
        >
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#ff4d00]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="w-11 h-11 rounded-2xl bg-[#ff4d00]/20 border border-[#ff4d00]/30 flex items-center justify-center text-amber-400">
              <Crown size={22} />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              Live 3D
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight mb-1">3D Chess</h2>
          <p className="text-xs text-white/65 leading-relaxed mb-4">
            Play against the AI Bot, challenge a Millerite live, or text an invite link.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            Play Now →
          </span>
        </button>

        {/* 2. COMING SOON PLACEHOLDER */}
        <div className="bg-white/75 backdrop-blur-2xl border border-white/90 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between opacity-75">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400">
                <Sparkles size={20} />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock size={10} /> Coming Soon
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">
              More Games Soon
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Checkers, Family Trivia, and Word Games are on the way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
