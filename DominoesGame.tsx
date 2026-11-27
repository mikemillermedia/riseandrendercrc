import React, { useEffect, useRef, useState } from 'react';
import { Bot, Plus, ArrowLeft, Trophy, Trash2, Users } from 'lucide-react';

interface DominoesGameProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
}

type Tile = [number, number];

function createDeck(): Tile[] {
  const deck: Tile[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) deck.push([i, j]);
  }
  return deck.sort(() => Math.random() - 0.5);
}

function pipTotal(hand: Tile[]) {
  return hand.reduce((sum, [a, b]) => sum + a + b, 0);
}

function canPlay(tile: Tile, chain: Tile[]): boolean {
  if (chain.length === 0) return true;
  const left = chain[0][0];
  const right = chain[chain.length - 1][1];
  return tile[0] === left || tile[1] === left || tile[0] === right || tile[1] === right;
}

function placeTile(tile: Tile, chain: Tile[], side?: 'left' | 'right'): Tile[] | null {
  if (chain.length === 0) return [tile];
  const left = chain[0][0];
  const right = chain[chain.length - 1][1];

  const tryLeft = () => {
    if (tile[1] === left) return [tile, ...chain];
    if (tile[0] === left) return [[tile[1], tile[0]] as Tile, ...chain];
    return null;
  };
  const tryRight = () => {
    if (tile[0] === right) return [...chain, tile];
    if (tile[1] === right) return [...chain, [tile[1], tile[0]] as Tile];
    return null;
  };

  if (side === 'left') return tryLeft();
  if (side === 'right') return tryRight();
  return tryRight() || tryLeft();
}

export default function DominoesGame({ supabase, userId, familyMembers }: DominoesGameProps) {
  const [games, setGames] = useState<any[]>([]);
  const [activeGame, setActiveGame] = useState<any | null>(null);
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
    await supabase.rpc('increment_game_win', { p_user_id: winnerId, p_game_type: 'dominoes' });
  };

  const fetchGames = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('arcade_games')
      .select('*')
      .eq('game_type', 'dominoes')
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
      .channel('arcade-dominoes-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_games', filter: 'game_type=eq.dominoes' },
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

  const makeInitialState = () => {
    const deck = createDeck();
    return {
      p1Hand: deck.slice(0, 7),
      p2Hand: deck.slice(7, 14),
      boneyard: deck.slice(14),
      chain: [] as Tile[],
      turn: 1,
      passes: 0,
    };
  };

  const startBotGame = () => {
    setActiveGame({
      id: `dom-bot-${Date.now()}`,
      isBotGame: true,
      host_id: userId,
      players: [userId, 'AI_BOT'],
      status: 'active',
      winner_id: null,
      state: makeInitialState(),
    });
  };

  const createLiveGame = async () => {
    if (!supabase || !userId) return;
    const players = inviteeId ? [userId, inviteeId] : [userId];
    const { data, error } = await supabase
      .from('arcade_games')
      .insert([
        {
          game_type: 'dominoes',
          host_id: userId,
          players,
          status: inviteeId ? 'active' : 'waiting',
          state: makeInitialState(),
        },
      ])
      .select()
      .single();
    if (error) {
      alert('Error creating Dominoes match: ' + error.message);
      return;
    }
    setInviteeId('');
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

  const saveMove = async (game: any, nextState: any, status: string, winnerId: string | null) => {
    if (winnerId) recordWin(winnerId);
    const nextGame = { ...game, state: nextState, status, winner_id: winnerId };
    setActiveGame(nextGame);
    if (!game.isBotGame && supabase) {
      await supabase
        .from('arcade_games')
        .update({ state: nextState, status, winner_id: winnerId, updated_at: new Date().toISOString() })
        .eq('id', game.id);
    }
  };

  const handlePlayTile = (idx: number) => {
    const game = activeGameRef.current;
    if (!game || game.status === 'finished' || !userId) return;
    const players: string[] = game.players || [];
    const myNum = players[0] === userId ? 1 : players[1] === userId ? 2 : 0;
    if (!myNum || game.state.turn !== myNum) return;

    const handKey = myNum === 1 ? 'p1Hand' : 'p2Hand';
    const hand: Tile[] = [...game.state[handKey]];
    const tile = hand[idx];
    const nextChain = placeTile(tile, game.state.chain);
    if (!nextChain) return;

    hand.splice(idx, 1);
    const isWin = hand.length === 0;
    const nextState = {
      ...game.state,
      [handKey]: hand,
      chain: nextChain,
      turn: myNum === 1 ? 2 : 1,
      passes: 0,
    };
    saveMove(game, nextState, isWin ? 'finished' : 'active', isWin ? userId : null);
  };

  const handleDrawOrPass = () => {
    const game = activeGameRef.current;
    if (!game || game.status === 'finished' || !userId) return;
    const players: string[] = game.players || [];
    const myNum = players[0] === userId ? 1 : players[1] === userId ? 2 : 0;
    if (!myNum || game.state.turn !== myNum) return;

    const handKey = myNum === 1 ? 'p1Hand' : 'p2Hand';
    const boneyard: Tile[] = [...game.state.boneyard];

    if (boneyard.length > 0) {
      const drawn = boneyard.pop()!;
      const nextState = {
        ...game.state,
        [handKey]: [...game.state[handKey], drawn],
        boneyard,
      };
      saveMove(game, nextState, 'active', null);
    } else {
      const nextPasses = (game.state.passes || 0) + 1;
      if (nextPasses >= 2) {
        const p1Pts = pipTotal(game.state.p1Hand);
        const p2Pts = pipTotal(game.state.p2Hand);
        const winnerId = p1Pts < p2Pts ? players[0] : p2Pts < p1Pts ? players[1] : null;
        saveMove(game, { ...game.state, passes: nextPasses }, 'finished', winnerId);
      } else {
        saveMove(game, { ...game.state, turn: myNum === 1 ? 2 : 1, passes: nextPasses }, 'active', null);
      }
    }
  };

  // AI Bot turn
  useEffect(() => {
    if (!activeGame?.isBotGame || activeGame.status === 'finished' || activeGame.state.turn !== 2) return;
    const t = setTimeout(() => {
      const st = activeGame.state;
      const hand: Tile[] = [...st.p2Hand];
      const boneyard: Tile[] = [...st.boneyard];
      let playableIdx = hand.findIndex((tile) => canPlay(tile, st.chain));

      while (playableIdx === -1 && boneyard.length > 0) {
        hand.push(boneyard.pop()!);
        playableIdx = hand.findIndex((tile) => canPlay(tile, st.chain));
      }

      if (playableIdx !== -1) {
        const tile = hand.splice(playableIdx, 1)[0];
        const nextChain = placeTile(tile, st.chain)!;
        const botWon = hand.length === 0;
        setActiveGame((prev: any) => ({
          ...prev,
          status: botWon ? 'finished' : 'active',
          winner_id: botWon ? 'AI_BOT' : null,
          state: { ...st, p2Hand: hand, boneyard, chain: nextChain, turn: 1, passes: 0 },
        }));
      } else {
        const nextPasses = (st.passes || 0) + 1;
        if (nextPasses >= 2) {
          const p1Pts = pipTotal(st.p1Hand);
          const p2Pts = pipTotal(hand);
          const winnerId = p1Pts < p2Pts ? userId : p2Pts < p1Pts ? 'AI_BOT' : null;
          if (winnerId === userId) recordWin(userId);
          setActiveGame((prev: any) => ({
            ...prev,
            status: 'finished',
            winner_id: winnerId,
            state: { ...st, p2Hand: hand, boneyard, passes: nextPasses },
          }));
        } else {
          setActiveGame((prev: any) => ({
            ...prev,
            state: { ...st, p2Hand: hand, boneyard, turn: 1, passes: nextPasses },
          }));
        }
      }
    }, 650);
    return () => clearTimeout(t);
  }, [activeGame?.state?.turn, activeGame?.status, activeGame?.isBotGame]);

  if (!activeGame) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">🁣 Dominoes</h2>
          <p className="text-xs text-slate-500 mt-0.5">Match ends and empty your hand first to win.</p>
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
            <p className="text-[11px] text-white/65">Classic Double-Six solo match</p>
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
                    🁣 {getName(p[0])} vs {getName(p[1])}
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
  const myHand: Tile[] = myNum === 1 ? activeGame.state.p1Hand : activeGame.state.p2Hand;
  const oppCount: number = (myNum === 1 ? activeGame.state.p2Hand : activeGame.state.p1Hand).length;
  const chain: Tile[] = activeGame.state.chain || [];
  const hasPlayable = myHand.some((t) => canPlay(t, chain));

  return (
    <div className="space-y-4">
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
            ? activeGame.winner_id ? `🏆 ${getName(activeGame.winner_id)} Wins!` : 'Tie Game!'
            : isMyTurn ? '● Your Turn' : `${getName(players[activeGame.state.turn - 1])}'s Turn`}
        </span>
      </div>

      {/* Table Area */}
      <div className="relative bg-emerald-950 border-2 border-emerald-800 rounded-[28px] p-5 min-h-[210px] flex flex-col justify-between shadow-xl">
        <div className="flex justify-between text-[11px] font-bold text-emerald-200/80 mb-3">
          <span>Opponent: {oppCount} tiles</span>
          <span>Boneyard: {activeGame.state.boneyard.length}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 my-auto py-3">
          {chain.length === 0 ? (
            <p className="text-xs text-emerald-200/50 font-semibold">Tap any domino below to start the chain</p>
          ) : (
            chain.map(([a, b], i) => (
              <div
                key={i}
                className="flex items-center bg-[#f8f4ea] text-slate-900 rounded-lg border-2 border-slate-300 shadow-md px-2 py-1 text-xs font-black"
              >
                <span>{a}</span>
                <span className="mx-1.5 text-slate-300">|</span>
                <span>{b}</span>
              </div>
            ))
          )}
        </div>

        {activeGame.status === 'finished' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-[26px] flex flex-col items-center justify-center p-6 text-center">
            <Trophy size={36} className="text-amber-400 mb-2" />
            <h3 className="text-2xl font-black text-white mb-4">
              {activeGame.winner_id ? `${getName(activeGame.winner_id)} Wins!` : 'Draw!'}
            </h3>
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

      {/* Player Hand */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Your Hand ({myHand.length})
          </span>
          {isMyTurn && !hasPlayable && (
            <button
              type="button"
              onClick={handleDrawOrPass}
              className="bg-[#ff4d00] text-white text-xs font-bold px-4 py-1.5 rounded-full"
            >
              {activeGame.state.boneyard.length > 0 ? 'Draw Tile' : 'Pass Turn'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {myHand.map((tile, i) => {
            const playable = isMyTurn && canPlay(tile, chain);
            return (
              <button
                key={i}
                type="button"
                disabled={!playable}
                onClick={() => handlePlayTile(i)}
                className={`flex flex-col items-center justify-center w-12 h-20 rounded-xl border-2 font-black text-sm transition-all ${
                  playable
                    ? 'bg-white border-[#ff4d00] text-slate-900 shadow-md -translate-y-1 hover:scale-105'
                    : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <span>{tile[0]}</span>
                <span className="w-7 h-0.5 bg-slate-300 my-1" />
                <span>{tile[1]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
