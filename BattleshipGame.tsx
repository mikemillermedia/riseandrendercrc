import React, { useEffect, useRef, useState } from 'react';
import { Bot, Plus, ArrowLeft, Trophy, Trash2, Users, Crosshair, Shield } from 'lucide-react';

interface BattleshipGameProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
}

const SIZE = 8;
const SHIP_SIZES = [4, 3, 3, 2]; // 12 total ship cells

function generateFleet(): number[][] {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (const len of SHIP_SIZES) {
    let placed = false;
    while (!placed) {
      const horiz = Math.random() > 0.5;
      const r = Math.floor(Math.random() * (horiz ? SIZE : SIZE - len + 1));
      const c = Math.floor(Math.random() * (horiz ? SIZE - len + 1 : SIZE));
      let ok = true;
      for (let i = 0; i < len; i++) {
        if (grid[horiz ? r : r + i][horiz ? c + i : c] !== 0) {
          ok = false;
          break;
        }
      }
      if (ok) {
        for (let i = 0; i < len; i++) grid[horiz ? r : r + i][horiz ? c + i : c] = 1;
        placed = true;
      }
    }
  }
  return grid;
}

function createShots(): number[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); // 0=unshot, 1=miss, 2=hit
}

function countHits(shots: number[][]): number {
  return shots.flat().filter((v) => v === 2).length;
}

function pickBotShot(shots: number[][]): [number, number] {
  // Target cells adjacent to existing hits first
  const targets: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (shots[r][c] === 2) {
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && shots[nr][nc] === 0) {
            targets.push([nr, nc]);
          }
        }
      }
    }
  }
  if (targets.length > 0) return targets[Math.floor(Math.random() * targets.length)];
  const open: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) if (shots[r][c] === 0) open.push([r, c]);
  }
  return open[Math.floor(Math.random() * open.length)];
}

export default function BattleshipGame({ supabase, userId, familyMembers }: BattleshipGameProps) {
  const [games, setGames] = useState<any[]>([]);
  const [activeGame, setActiveGame] = useState<any | null>(null);
  const [viewBoard, setViewBoard] = useState<'enemy' | 'mine'>('enemy');
  const [inviteeId, setInviteeId] = useState('');
  const activeGameRef = useRef<any | null>(null);
  activeGameRef.current = activeGame;

  const otherMembers = familyMembers.filter((m) => m.id !== userId);

  const getName = (id?: string | null) => {
    if (id === 'AI_BOT') return 'AI Bot';
    if (!id) return 'Open Seat';
    const m = familyMembers.find((f) => f.id === id);
    return m ? `${m.first_name || 'Family'} ${m.last_name || ''}`.trim() : 'Family';
  };

  const recordWin = async (winnerId: string | null) => {
    if (!supabase || !winnerId || winnerId === 'AI_BOT') return;
    await supabase.rpc('increment_game_win', { p_user_id: winnerId, p_game_type: 'battleship' });
  };

  const fetchGames = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('arcade_games')
      .select('*')
      .eq('game_type', 'battleship')
      .order('updated_at', { ascending: false })
      .limit(12);
    if (data) {
      setGames(data);
      if (activeGameRef.current && !activeGameRef.current.isBotGame) {
        const updated = data.find((g: any) => g.id === activeGameRef.current.id);
        if (updated) setActiveGame(updated);
      }
    }
  };

  useEffect(() => {
    fetchGames();
    if (!supabase) return;
    const ch = supabase
      .channel('arcade-battleship-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_games', filter: 'game_type=eq.battleship' },
        (payload: any) => {
          fetchGames();
          if (payload.new && activeGameRef.current?.id === payload.new.id) {
            setActiveGame(payload.new);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase]);

  const initialState = () => ({
    turn: 1,
    p1Ships: generateFleet(),
    p2Ships: generateFleet(),
    p1Shots: createShots(),
    p2Shots: createShots(),
  });

  const startBotGame = () => {
    setViewBoard('enemy');
    setActiveGame({
      id: `bs-bot-${Date.now()}`,
      isBotGame: true,
      host_id: userId,
      players: [userId, 'AI_BOT'],
      status: 'active',
      winner_id: null,
      state: initialState(),
    });
  };

  const createLiveGame = async () => {
    if (!supabase || !userId) return;
    const players = inviteeId ? [userId, inviteeId] : [userId];
    const { data, error } = await supabase
      .from('arcade_games')
      .insert([
        {
          game_type: 'battleship',
          host_id: userId,
          players,
          status: inviteeId ? 'active' : 'waiting',
          state: initialState(),
        },
      ])
      .select()
      .single();
    if (error) {
      alert('Error creating Battleship match: ' + error.message);
      return;
    }
    setInviteeId('');
    setViewBoard('enemy');
    setActiveGame(data);
  };

  const joinGame = async (game: any) => {
    if (!supabase || !userId) return;
    const players: string[] = game.players || [];
    if (players.includes(userId) || players.length >= 2) {
      setActiveGame(game);
      return;
    }
    const { data } = await supabase
      .from('arcade_games')
      .update({ players: [...players, userId], status: 'active', updated_at: new Date().toISOString() })
      .eq('id', game.id)
      .select()
      .single();
    if (data) setActiveGame(data);
  };

  const deleteGame = async (id: string) => {
    if (!supabase || !confirm('Remove this match?')) return;
    await supabase.from('arcade_games').delete().eq('id', id);
    setGames((prev) => prev.filter((g) => g.id !== id));
    if (activeGame?.id === id) setActiveGame(null);
  };

  const handleFire = async (r: number, c: number) => {
    const game = activeGameRef.current;
    if (!game || game.status === 'finished' || !userId) return;
    const players: string[] = game.players || [];
    const myNum = players[0] === userId ? 1 : players[1] === userId ? 2 : 0;
    if (!myNum || game.state.turn !== myNum) return;

    const myShotsKey = myNum === 1 ? 'p1Shots' : 'p2Shots';
    const oppShipsKey = myNum === 1 ? 'p2Ships' : 'p1Ships';
    const shots: number[][] = game.state[myShotsKey].map((row: number[]) => [...row]);
    if (shots[r][c] !== 0) return;

    const isHit = game.state[oppShipsKey][r][c] === 1;
    shots[r][c] = isHit ? 2 : 1;

    const won = countHits(shots) >= 12;
    const winnerId = won ? userId : null;
    if (winnerId) recordWin(winnerId);

    const nextState = {
      ...game.state,
      [myShotsKey]: shots,
      turn: myNum === 1 ? 2 : 1,
    };
    const nextGame = { ...game, status: won ? 'finished' : 'active', winner_id: winnerId, state: nextState };
    setActiveGame(nextGame);

    if (!game.isBotGame && supabase) {
      await supabase
        .from('arcade_games')
        .update({ status: nextGame.status, winner_id: winnerId, state: nextState, updated_at: new Date().toISOString() })
        .eq('id', game.id);
    }
  };

  // Bot fires back
  useEffect(() => {
    if (!activeGame?.isBotGame || activeGame.status === 'finished' || activeGame.state.turn !== 2) return;
    const t = setTimeout(() => {
      const shots: number[][] = activeGame.state.p2Shots.map((row: number[]) => [...row]);
      const [r, c] = pickBotShot(shots);
      shots[r][c] = activeGame.state.p1Ships[r][c] === 1 ? 2 : 1;
      const botWon = countHits(shots) >= 12;
      setActiveGame((prev: any) => ({
        ...prev,
        status: botWon ? 'finished' : 'active',
        winner_id: botWon ? 'AI_BOT' : null,
        state: { ...prev.state, p2Shots: shots, turn: 1 },
      }));
    }, 550);
    return () => clearTimeout(t);
  }, [activeGame?.state?.turn, activeGame?.status, activeGame?.isBotGame]);

  if (!activeGame) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">🚢 Battleship</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sink all 4 enemy ships (12 hits) to win.</p>
        </div>

        <button
          type="button"
          onClick={startBotGame}
          className="w-full p-4 rounded-2xl bg-[#1C1C2E] hover:bg-slate-800 text-white text-left flex items-center gap-3.5 shadow-md"
        >
          <span className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
            <Bot size={20} />
          </span>
          <div>
            <p className="text-sm font-black">Play vs. AI Bot</p>
            <p className="text-[11px] text-white/65">Instant naval battle</p>
          </div>
        </button>

        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users size={12} className="text-[#ff4d00]" /> Live 1v1 Family Match
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={inviteeId}
              onChange={(e) => setInviteeId(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800"
            >
              <option value="">Open Lobby (Anyone can join)</option>
              {otherMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={createLiveGame}
              className="bg-[#ff4d00] hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus size={14} /> Start Match
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {games.map((g) => {
            const p: string[] = g.players || [];
            return (
              <div key={g.id} className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    🚢 {getName(p[0])} vs {getName(p[1])}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">
                    {g.status === 'finished' ? `Winner: ${getName(g.winner_id)}` : g.status}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => joinGame(g)}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800"
                  >
                    {p.includes(userId || '') ? 'Resume' : p.length < 2 ? 'Join' : 'Watch'}
                  </button>
                  {g.host_id === userId && (
                    <button
                      type="button"
                      onClick={() => deleteGame(g.id)}
                      className="p-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const players: string[] = activeGame.players || [];
  const myNum = players[0] === userId ? 1 : players[1] === userId ? 2 : 1;
  const isMyTurn = players[myNum - 1] === userId && activeGame.state.turn === myNum && activeGame.status !== 'finished';

  const myShots: number[][] = myNum === 1 ? activeGame.state.p1Shots : activeGame.state.p2Shots;
  const oppShots: number[][] = myNum === 1 ? activeGame.state.p2Shots : activeGame.state.p1Shots;
  const myShips: number[][] = myNum === 1 ? activeGame.state.p1Ships : activeGame.state.p2Ships;

  return (
    <div className="space-y-3 max-w-md mx-auto">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setActiveGame(null)}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1"
        >
          <ArrowLeft size={13} /> Lobby
        </button>
        <span className={`text-[11px] font-extrabold px-3.5 py-1.5 rounded-full ${activeGame.status === 'finished' ? 'bg-amber-500 text-black' : isMyTurn ? 'bg-[#ff4d00] text-white' : 'bg-slate-100 text-slate-600'}`}>
          {activeGame.status === 'finished'
            ? `🏆 ${getName(activeGame.winner_id)} Wins!`
            : isMyTurn
            ? '● Your Turn — Tap to Fire'
            : activeGame.isBotGame
            ? 'Enemy Firing...'
            : `${getName(players[activeGame.state.turn - 1])}'s Turn`}
        </span>
      </div>

      {/* Toggle Enemy Waters vs My Fleet */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setViewBoard('enemy')}
          className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${viewBoard === 'enemy' ? 'bg-[#1C1C2E] text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          <Crosshair size={14} /> Enemy Waters ({countHits(myShots)}/12)
        </button>
        <button
          type="button"
          onClick={() => setViewBoard('mine')}
          className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${viewBoard === 'mine' ? 'bg-[#1C1C2E] text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          <Shield size={14} /> My Fleet ({12 - countHits(oppShots)}/12 left)
        </button>
      </div>

      {/* 8x8 Ocean Grid */}
      <div className="relative bg-gradient-to-b from-sky-950 to-slate-950 p-3 rounded-[24px] border border-sky-400/20 shadow-xl">
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: SIZE }, (_, r) =>
            Array.from({ length: SIZE }, (_, c) => {
              if (viewBoard === 'enemy') {
                const val = myShots[r][c];
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!isMyTurn || val !== 0}
                    onClick={() => handleFire(r, c)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-black transition-all ${
                      val === 2
                        ? 'bg-red-500 text-white shadow-inner'
                        : val === 1
                        ? 'bg-sky-800/60 text-sky-300'
                        : 'bg-sky-900/50 hover:bg-sky-700/70 border border-sky-400/15'
                    }`}
                  >
                    {val === 2 ? '🔥' : val === 1 ? '•' : ''}
                  </button>
                );
              } else {
                const hasShip = myShips[r][c] === 1;
                const shot = oppShots[r][c];
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-black ${
                      shot === 2
                        ? 'bg-red-600 text-white'
                        : hasShip
                        ? 'bg-slate-400 border border-slate-200'
                        : shot === 1
                        ? 'bg-sky-800/60 text-sky-300'
                        : 'bg-sky-900/40 border border-sky-400/10'
                    }`}
                  >
                    {shot === 2 ? '💥' : shot === 1 ? '•' : hasShip ? '🚢' : ''}
                  </div>
                );
              }
            })
          )}
        </div>

        {activeGame.status === 'finished' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-[24px] flex flex-col items-center justify-center p-6 text-center">
            <Trophy size={36} className="text-amber-400 mb-2" />
            <h3 className="text-2xl font-black text-white mb-4">{getName(activeGame.winner_id)} Wins!</h3>
            <button
              type="button"
              onClick={() => (activeGame.isBotGame ? startBotGame() : setActiveGame(null))}
              className="bg-[#ff4d00] text-white text-xs font-black uppercase px-6 py-2.5 rounded-full"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
