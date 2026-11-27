import React, { useState, useEffect } from 'react';
import { Gamepad2, Crown, Sparkles, Lock, ArrowLeft, Trophy } from 'lucide-react';
import ChessGame from './ChessGame';

interface GamesHubProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
  initialChessGameId?: string | null;
  onClearInitialGame?: () => void;
}

const GAME_LABELS: Record<string, string> = {
  all: 'All Games',
  chess: '3D Chess',
};

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
  const [scores, setScores] = useState<any[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<string>('chess');

  useEffect(() => {
    if (initialChessGameId) {
      setSelectedGame('chess');
    }
  }, [initialChessGameId]);

  const fetchScores = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('game_scores')
      .select('*')
      .order('wins', { ascending: false });
    if (data) setScores(data);
  };

  // Refresh leaderboard whenever opening the Games Hub or returning from a match
  useEffect(() => {
    if (!selectedGame) {
      fetchScores();
    }
  }, [selectedGame, supabase]);

  const getMember = (id: string) => familyMembers.find((m) => m.id === id);

  const getMyWins = (gameType: string) =>
    scores.find((s) => s.user_id === userId && s.game_type === gameType)?.wins || 0;

  // Dynamically include any future game types stored in game_scores
  const availableTypes = Array.from(
    new Set(['all', 'chess', ...scores.map((s) => s.game_type)])
  );

  // Build ranked leaderboard for the selected filter
  const leaderboard = (() => {
    if (leaderboardFilter === 'all') {
      const totals: Record<string, number> = {};
      scores.forEach((s) => {
        totals[s.user_id] = (totals[s.user_id] || 0) + (s.wins || 0);
      });
      return Object.entries(totals)
        .map(([uid, wins]) => ({ user_id: uid, wins }))
        .sort((a, b) => b.wins - a.wins);
    }
    return scores
      .filter((s) => s.game_type === leaderboardFilter && s.wins > 0)
      .sort((a, b) => b.wins - a.wins);
  })();

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
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full">
                🏆 {getMyWins('chess')} {getMyWins('chess') === 1 ? 'Win' : 'Wins'}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Live 3D
              </span>
            </div>
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

      {/* FAMILY LEADERBOARD */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-slate-900 font-black uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
            <Trophy size={16} className="text-[#ff4d00]" /> Family Leaderboard
          </h2>

          {/* Per-Game Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {availableTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLeaderboardFilter(type)}
                className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  leaderboardFilter === type
                    ? 'bg-[#1C1C2E] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                {GAME_LABELS[type] || type}
              </button>
            ))}
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200/70">
            <p className="text-xs text-slate-400 font-medium">
              No wins recorded for {GAME_LABELS[leaderboardFilter] || leaderboardFilter} yet. Win a match to claim #1!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/75">
            {leaderboard.map((entry, idx) => {
              const member = getMember(entry.user_id);
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
              return (
                <div
                  key={entry.user_id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 text-center text-sm font-black text-slate-500 shrink-0">
                      {medal}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-xs font-black text-slate-700 ring-2 ring-slate-200/80">
                      {member?.avatar_url ? (
                        <img src={member.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        member?.first_name?.[0] || 'M'
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {member ? `${member.first_name || 'Family'} ${member.last_name || ''}`.trim() : 'Family Member'}
                      {entry.user_id === userId && (
                        <span className="ml-1.5 text-[10px] font-extrabold text-[#ff4d00]">(You)</span>
                      )}
                    </p>
                  </div>

                  <span className="text-xs font-black text-slate-900 bg-amber-500/15 border border-amber-500/25 px-3 py-1 rounded-full shrink-0">
                    {entry.wins} {entry.wins === 1 ? 'Win' : 'Wins'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
