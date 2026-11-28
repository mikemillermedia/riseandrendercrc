import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  ArrowLeft,
  Trophy,
  Swords,
  Eye,
  Users,
} from 'lucide-react';
import ChessGame from './ChessGame';
import Connect4Game from './Connect4Game';
import WordleGame from './WordleGame';
import CheckersGame from './CheckersGame';
import BattleshipGame from './BattleshipGame';
import DrawGuessGame from './DrawGuessGame';
import TriviaGame from './TriviaGame';
import DominoesGame from './DominoesGame';
import SpadesGame from './SpadesGame';
import BlackCardRevoked from './BlackCardRevoked';

interface GamesHubProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
  initialChessGameId?: string | null;
  onClearInitialGame?: () => void;
}

type GameKey =
  | 'chess'
  | 'connect4'
  | 'checkers'
  | 'battleship'
  | 'draw'
  | 'trivia'
  | 'wordle'
  | 'dominoes'
  | 'spades'
  | 'black_card';

const GAME_LABELS: Record<string, string> = {
  all: 'All Games',
  chess: '3D Chess',
  connect4: '3D Connect 4',
  checkers: '3D Checkers',
  battleship: 'Battleship',
  draw: 'Draw & Guess',
  trivia: 'Trivia',
  wordle: 'Wordle',
  dominoes: 'Dominoes',
  spades: 'Spades',
  black_card: 'Black Card Revoked',
};

const ARCADE_CATALOG: {
  key: GameKey;
  title: string;
  emoji: string;
  tag: string;
  desc: string;
  dark?: boolean;
}[] = [
  { key: 'chess', title: '3D Chess', emoji: '👑', tag: 'Live 3D', desc: 'Grand Hall 3D chess vs. AI, family, or SMS invite.', dark: true },
  { key: 'black_card', title: 'Black Card Revoked', emoji: '🃏', tag: 'Party', desc: 'Correct Answer & Majority Rules culture cards. Hit 0 and get REVOKED.', dark: true },
  { key: 'connect4', title: '3D Connect 4', emoji: '🔴', tag: 'Live 3D', desc: 'Drop discs in 3D to connect 4 in a row.' },
  { key: 'checkers', title: '3D Checkers', emoji: '⚫', tag: 'Live 3D', desc: 'Jump opponent pieces and crown your Kings.' },
  { key: 'dominoes', title: 'Dominoes', emoji: '🁣', tag: 'Live 1v1', desc: 'Classic Double-Six dominoes vs. AI or family.' },
  { key: 'spades', title: 'Spades', emoji: '♠️', tag: '4-Player', desc: 'Bid, cut with Spades, and win tricks with your partner.' },
  { key: 'draw', title: 'Draw & Guess', emoji: '🎨', tag: 'Party', desc: 'Sketch prompts live while the family races to guess.' },
  { key: 'trivia', title: 'Family & Bible Trivia', emoji: '🧠', tag: 'Group', desc: 'Solo challenge or live family quiz rooms.' },
  { key: 'battleship', title: 'Battleship', emoji: '🚢', tag: 'Live 1v1', desc: 'Hunt and sink the enemy fleet on an 8x8 ocean grid.' },
  { key: 'wordle', title: 'Millerites Wordle', emoji: '🟩', tag: 'Daily', desc: 'Guess the family 5-letter word of the day.' },
];

export default function GamesHub({
  supabase,
  userId,
  familyMembers,
  initialChessGameId,
  onClearInitialGame,
}: GamesHubProps) {
  const [selectedGame, setSelectedGame] = useState<GameKey | null>(
    initialChessGameId ? 'chess' : null
  );
  const [launchGameId, setLaunchGameId] = useState<string | null>(
    initialChessGameId || null
  );
  const [scores, setScores] = useState<any[]>([]);
  const [activeMatches, setActiveMatches] = useState<any[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<string>('all');
  const [isLaunching, setIsLaunching] = useState<string | null>(null);

  useEffect(() => {
    if (initialChessGameId) {
      setLaunchGameId(initialChessGameId);
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

  const fetchActiveMatches = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('chess_games')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });
    if (data) setActiveMatches(data);
  };

  useEffect(() => {
    if (!selectedGame) {
      fetchScores();
      fetchActiveMatches();
    }
  }, [selectedGame, supabase]);

  useEffect(() => {
    if (!supabase || !userId) return;

    const gamesChannel = supabase
      .channel('arcade-live-matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chess_games' },
        () => fetchActiveMatches()
      )
      .subscribe();

    const presenceChannel = supabase.channel('millerites-arcade-presence', {
      config: { presence: { key: userId } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        setOnlineUserIds(Object.keys(presenceChannel.presenceState()));
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(gamesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [supabase, userId]);

  const getMember = (id?: string | null) => familyMembers.find((m) => m.id === id);

  const getMyWins = (gameType: string) =>
    scores.find((s) => s.user_id === userId && s.game_type === gameType)?.wins || 0;

  const getMemberActiveMatch = (memberId: string) =>
    activeMatches.find(
      (g) => g.white_player_id === memberId || g.black_player_id === memberId
    );

  const handleChallengeMember = async (opponentId: string) => {
    if (!supabase || !userId) return;
    setIsLaunching(opponentId);
    try {
      const existing = activeMatches.find(
        (g) =>
          (g.white_player_id === userId && g.black_player_id === opponentId) ||
          (g.white_player_id === opponentId && g.black_player_id === userId)
      );
      if (existing) {
        setLaunchGameId(existing.id);
        setSelectedGame('chess');
        return;
      }
      const { data, error } = await supabase
        .from('chess_games')
        .insert([{ white_player_id: userId, black_player_id: opponentId, status: 'active' }])
        .select()
        .single();
      if (error) throw error;
      setLaunchGameId(data.id);
      setSelectedGame('chess');
    } catch (err: any) {
      alert('Could not start match: ' + err.message);
    } finally {
      setIsLaunching(null);
    }
  };

  const availableTypes = Array.from(
    new Set(['all', 'chess', ...scores.map((s) => s.game_type)])
  );

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

  const topWinnerId = leaderboard.length > 0 ? leaderboard[0].user_id : null;

  const sortedMembers = [...familyMembers].sort((a, b) => {
    const aLive = getMemberActiveMatch(a.id) ? 2 : onlineUserIds.includes(a.id) ? 1 : 0;
    const bLive = getMemberActiveMatch(b.id) ? 2 : onlineUserIds.includes(b.id) ? 1 : 0;
    return bLive - aLive;
  });

  // Black Card Revoked manages its own full-bleed layout & Back button
  if (selectedGame === 'black_card') {
    return (
      <BlackCardRevoked
        supabase={supabase}
        userId={userId}
        familyMembers={familyMembers}
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  if (selectedGame) {
    return (
      <div className="animate-in fade-in duration-300 max-w-4xl mx-auto relative z-10 space-y-4">
        <button
          type="button"
          onClick={() => {
            setSelectedGame(null);
            setLaunchGameId(null);
            onClearInitialGame?.();
          }}
          className="text-xs text-slate-500 hover:text-slate-900 uppercase font-bold tracking-widest flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft size={13} /> All Games
        </button>

        <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-5 sm:p-7">
          {selectedGame === 'chess' && (
            <ChessGame supabase={supabase} userId={userId} familyMembers={familyMembers} initialGameId={launchGameId} />
          )}
          {selectedGame === 'connect4' && (
            <Connect4Game supabase={supabase} userId={userId} familyMembers={familyMembers} />
          )}
          {selectedGame === 'checkers' && (
            <CheckersGame supabase={supabase} userId={userId} familyMembers={familyMembers} />
          )}
          {selectedGame === 'battleship' && (
            <BattleshipGame supabase={supabase} userId={userId} familyMembers={familyMembers} />
          )}
          {selectedGame === 'draw' && (
            <DrawGuessGame supabase={supabase} userId={userId} familyMembers={familyMembers} />
          )}
          {selectedGame === 'trivia' && (
            <TriviaGame supabase={supabase} userId={userId} familyMembers={familyMembers} />
          )}
          {selectedGame === 'wordle' && (
            <WordleGame supabase={supabase} userId={userId} />
          )}
          {selectedGame === 'dominoes' && (
            <DominoesGame supabase={supabase} userId={userId} familyMembers={familyMembers} />
          )}
          {selectedGame === 'spades' && (
            <SpadesGame supabase={supabase} userId={userId} />
          )}
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
          10 live games — challenge a family avatar below or pick a game from the arcade.
        </p>
      </div>

      {/* LIVE ARCADE AVATAR LOUNGE */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-slate-900 font-black uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
            <Users size={15} className="text-[#ff4d00]" /> Arcade Lounge
          </h2>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {activeMatches.length} Live {activeMatches.length === 1 ? 'Match' : 'Matches'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sortedMembers.map((member) => {
            const isMe = member.id === userId;
            const activeMatch = getMemberActiveMatch(member.id);
            const isOnline = onlineUserIds.includes(member.id);
            const isChamp = topWinnerId === member.id;

            const opponentId = activeMatch
              ? activeMatch.white_player_id === member.id
                ? activeMatch.black_player_id
                : activeMatch.white_player_id
              : null;
            const opponent = getMember(opponentId);
            const isPlayingWithMe =
              activeMatch &&
              (activeMatch.white_player_id === userId || activeMatch.black_player_id === userId);

            return (
              <div
                key={member.id}
                className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all relative ${
                  activeMatch
                    ? 'bg-gradient-to-b from-amber-50/80 to-white border-amber-400/50 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200/70'
                }`}
              >
                {isChamp && <span className="absolute top-2 right-2 text-xs" title="Arcade Leader">👑</span>}

                <div className="relative mb-2">
                  <div
                    className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-lg font-black shadow-md ${
                      activeMatch
                        ? 'ring-2 ring-[#ff4d00] ring-offset-2 ring-offset-white'
                        : isOnline
                        ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white'
                        : 'ring-2 ring-slate-200'
                    } bg-slate-200 text-slate-700`}
                  >
                    {member.avatar_url ? (
                      <img src={member.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      member.first_name?.[0] || 'M'
                    )}
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xs">
                    {activeMatch ? '⚔️' : member.status_emoji || '🎮'}
                  </span>
                  {(activeMatch || isOnline) && (
                    <span
                      className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ring-2 ring-white ${
                        activeMatch ? 'bg-[#ff4d00] animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </div>

                <p className="text-xs font-black text-slate-900 truncate w-full">
                  {isMe ? 'You' : member.first_name || 'Family'}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 truncate w-full mt-0.5 mb-2.5">
                  {activeMatch
                    ? `Live vs ${opponent?.first_name || 'Opponent'}`
                    : isOnline
                    ? 'Online in Arcade'
                    : 'Ready to play'}
                </p>

                {activeMatch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLaunchGameId(activeMatch.id);
                      setSelectedGame('chess');
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                      isPlayingWithMe
                        ? 'bg-[#ff4d00] hover:bg-orange-600 text-white shadow-sm'
                        : 'bg-[#1C1C2E] hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isPlayingWithMe ? <><Swords size={11} /> Resume</> : <><Eye size={11} /> Watch Live</>}
                  </button>
                ) : isMe ? (
                  <span className="w-full py-1.5 px-2.5 rounded-xl text-[10px] font-bold bg-slate-200/70 text-slate-500">
                    Your Avatar
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isLaunching === member.id}
                    onClick={() => handleChallengeMember(member.id)}
                    className="w-full py-1.5 px-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider bg-[#1C1C2E] hover:bg-[#ff4d00] text-white flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                  >
                    <Swords size={11} />
                    {isLaunching === member.id ? 'Starting...' : 'Invite'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ALL 10 ARCADE GAMES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ARCADE_CATALOG.map((g) => {
          const wins = getMyWins(g.key);
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => {
                setLaunchGameId(null);
                setSelectedGame(g.key);
              }}
              className={`text-left group rounded-[28px] p-5 relative overflow-hidden hover:scale-[1.01] transition-all flex flex-col justify-between ${
                g.dark
                  ? 'bg-gradient-to-br from-[#1C1C2E] to-slate-900 text-white shadow-[0_12px_35px_rgba(28,28,46,0.18)]'
                  : 'bg-white/85 backdrop-blur-2xl border border-white text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                      g.dark
                        ? 'bg-[#ff4d00]/20 border border-[#ff4d00]/30'
                        : 'bg-slate-100 border border-slate-200/70'
                    }`}
                  >
                    {g.emoji}
                  </span>
                  <div className="flex items-center gap-1">
                    {wins > 0 && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-600 px-2 py-0.5 rounded-full">
                        🏆 {wins}
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        g.dark
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {g.tag}
                    </span>
                  </div>
                </div>
                <h2 className="text-lg font-black tracking-tight mb-1">{g.title}</h2>
                <p className={`text-xs leading-relaxed mb-4 ${g.dark ? 'text-white/65' : 'text-slate-500'}`}>
                  {g.desc}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-bold group-hover:translate-x-1 transition-transform ${g.dark ? 'text-amber-400' : 'text-[#ff4d00]'}`}>
                Play Now →
              </span>
            </button>
          );
        })}
      </div>

      {/* FAMILY LEADERBOARD */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-slate-900 font-black uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
            <Trophy size={16} className="text-[#ff4d00]" /> Family Leaderboard
          </h2>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
                <div key={entry.user_id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 text-center text-sm font-black text-slate-500 shrink-0">{medal}</span>
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
