import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Bot, Plus, ArrowLeft, Trophy, Trash2, Users } from 'lucide-react';

interface Connect4GameProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
}

const ROWS = 6;
const COLS = 7;

type Cell = 0 | 1 | 2; // 0 empty, 1 Red (P1), 2 Yellow (P2/Bot)

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function checkWinner(board: Cell[][]): Cell {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (!p) continue;
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === p) {
            count++;
          } else break;
        }
        if (count === 4) return p;
      }
    }
  }
  return 0;
}

function isBoardFull(board: Cell[][]): boolean {
  return board[0].every((c) => c !== 0);
}

function dropInCol(board: Cell[][], col: number, player: Cell): Cell[][] | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      const next = board.map((row) => [...row]);
      next[r][col] = player;
      return next;
    }
  }
  return null;
}

function pickBotCol(board: Cell[][]): number {
  const validCols = Array.from({ length: COLS }, (_, i) => i).filter((c) => board[0][c] === 0);
  if (validCols.length === 0) return -1;
  // 1. Win if possible
  for (const c of validCols) {
    const sim = dropInCol(board, c, 2);
    if (sim && checkWinner(sim) === 2) return c;
  }
  // 2. Block player win
  for (const c of validCols) {
    const sim = dropInCol(board, c, 1);
    if (sim && checkWinner(sim) === 1) return c;
  }
  // 3. Prefer center
  if (validCols.includes(3) && Math.random() > 0.3) return 3;
  return validCols[Math.floor(Math.random() * validCols.length)];
}

export default function Connect4Game({ supabase, userId, familyMembers }: Connect4GameProps) {
  const [games, setGames] = useState<any[]>([]);
  const [activeGame, setActiveGame] = useState<any | null>(null);
  const [inviteeId, setInviteeId] = useState('');
  const mountRef = useRef<HTMLDivElement | null>(null);
  const discsGroupRef = useRef<THREE.Group | null>(null);
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
    await supabase.rpc('increment_game_win', {
      p_user_id: winnerId,
      p_game_type: 'connect4',
    });
  };

  const fetchGames = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('arcade_games')
      .select('*')
      .eq('game_type', 'connect4')
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
      .channel('arcade-connect4-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_games', filter: 'game_type=eq.connect4' },
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

  const startBotGame = () => {
    setActiveGame({
      id: `c4-bot-${Date.now()}`,
      isBotGame: true,
      host_id: userId,
      players: [userId, 'AI_BOT'],
      status: 'active',
      winner_id: null,
      state: { board: createEmptyBoard(), turn: 1 },
    });
  };

  const createLiveGame = async () => {
    if (!supabase || !userId) return;
    const players = inviteeId ? [userId, inviteeId] : [userId];
    const { data, error } = await supabase
      .from('arcade_games')
      .insert([
        {
          game_type: 'connect4',
          host_id: userId,
          players,
          status: inviteeId ? 'active' : 'waiting',
          state: { board: createEmptyBoard(), turn: 1 },
        },
      ])
      .select()
      .single();
    if (error) {
      alert('Error creating Connect 4 match: ' + error.message);
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
    const nextPlayers = [...players, userId];
    const { data } = await supabase
      .from('arcade_games')
      .update({ players: nextPlayers, status: 'active', updated_at: new Date().toISOString() })
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

  const handleDrop = async (col: number) => {
    const game = activeGameRef.current;
    if (!game || game.status === 'finished' || !userId) return;
    const players: string[] = game.players || [];
    const myNum: Cell = players[0] === userId ? 1 : players[1] === userId ? 2 : 0;
    if (!myNum || game.state.turn !== myNum) return;

    const nextBoard = dropInCol(game.state.board, col, myNum);
    if (!nextBoard) return;

    const winNum = checkWinner(nextBoard);
    const full = isBoardFull(nextBoard);
    const isFinished = winNum !== 0 || full;
    const winnerId = winNum ? players[winNum - 1] : null;
    if (winnerId) recordWin(winnerId);

    const nextState = { board: nextBoard, turn: myNum === 1 ? 2 : 1 };
    const nextGame = {
      ...game,
      status: isFinished ? 'finished' : 'active',
      winner_id: winnerId,
      state: nextState,
    };
    setActiveGame(nextGame);

    if (!game.isBotGame && supabase) {
      await supabase
        .from('arcade_games')
        .update({
          status: nextGame.status,
          winner_id: winnerId,
          state: nextState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', game.id);
    }
  };

  // Bot turn
  useEffect(() => {
    if (!activeGame?.isBotGame || activeGame.status === 'finished' || activeGame.state.turn !== 2) return;
    const t = setTimeout(() => {
      const col = pickBotCol(activeGame.state.board);
      if (col < 0) return;
      const nextBoard = dropInCol(activeGame.state.board, col, 2);
      if (!nextBoard) return;
      const winNum = checkWinner(nextBoard);
      const full = isBoardFull(nextBoard);
      setActiveGame((prev: any) => ({
        ...prev,
        status: winNum || full ? 'finished' : 'active',
        winner_id: winNum === 2 ? 'AI_BOT' : null,
        state: { board: nextBoard, turn: 1 },
      }));
    }, 500);
    return () => clearTimeout(t);
  }, [activeGame?.state?.turn, activeGame?.status, activeGame?.isBotGame]);

  // 3D Three.js Standing Connect 4 Board
  useEffect(() => {
    if (!activeGame || !mountRef.current) return;
    const container = mountRef.current;
    const w = Math.max(container.clientWidth, 300);
    const h = Math.max(container.clientHeight, 340);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1220);

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0.5, w < 420 ? 13.5 : 10.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(5, 10, 10);
    scene.add(dir);

    // Blue 3D Board Frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.35, metalness: 0.25 });
    const backBoard = new THREE.Mesh(new THREE.BoxGeometry(7.6, 6.6, 0.3), frameMat);
    backBoard.position.z = -0.25;
    scene.add(backBoard);

    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(8.4, 0.45, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x172554, roughness: 0.4 })
    );
    stand.position.set(0, -3.45, 0);
    scene.add(stand);

    // Subtle dark slot circles
    const slotMat = new THREE.MeshBasicMaterial({ color: 0x0b0e1a });
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const slot = new THREE.Mesh(new THREE.CircleGeometry(0.4, 20), slotMat);
        slot.position.set(c - 3, 2.5 - r, -0.09);
        scene.add(slot);
      }
    }

    const discsGroup = new THREE.Group();
    scene.add(discsGroup);
    discsGroupRef.current = discsGroup;

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh;
      camera.position.z = nw < 420 ? 13.5 : 10.5;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    ro.observe(container);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      renderer.dispose();
    };
  }, [activeGame?.id]);

  // Sync 3D Discs
  useEffect(() => {
    if (!activeGame || !discsGroupRef.current) return;
    const grp = discsGroupRef.current;
    grp.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).geometry.dispose();
    });
    grp.clear();

    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25, metalness: 0.2 });
    const yelMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.2 });

    const board: Cell[][] = activeGame.state.board;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c]) continue;
        const disc = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.42, 0.24, 24),
          board[r][c] === 1 ? redMat : yelMat
        );
        disc.rotation.x = Math.PI / 2;
        disc.position.set(c - 3, 2.5 - r, 0.05);
        grp.add(disc);
      }
    }
  }, [activeGame?.state?.board, activeGame?.id]);

  // LOBBY
  if (!activeGame) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">🔴 3D Connect 4</h2>
          <p className="text-xs text-slate-500 mt-0.5">Drop discs to connect 4 in a row.</p>
        </div>

        <button
          type="button"
          onClick={startBotGame}
          className="w-full p-4 rounded-2xl bg-[#1C1C2E] hover:bg-slate-800 text-white text-left flex items-center gap-3.5 transition-all shadow-md"
        >
          <span className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
            <Bot size={20} />
          </span>
          <div>
            <p className="text-sm font-black">Play vs. AI Bot</p>
            <p className="text-[11px] text-white/65">Instant 3D solo match</p>
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
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name}
                </option>
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
            const isHost = g.host_id === userId;
            return (
              <div key={g.id} className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    🔴 {getName(p[0])} vs 🟡 {getName(p[1])}
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
                  {isHost && (
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
  const myNum: Cell = players[0] === userId ? 1 : players[1] === userId ? 2 : 0;
  const isMyTurn = myNum !== 0 && activeGame.state.turn === myNum && activeGame.status !== 'finished';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setActiveGame(null)}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1"
        >
          <ArrowLeft size={13} /> Lobby
        </button>
        <span
          className={`text-[11px] font-extrabold px-3.5 py-1.5 rounded-full ${
            activeGame.status === 'finished'
              ? 'bg-amber-500 text-black'
              : isMyTurn
              ? 'bg-[#ff4d00] text-white'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {activeGame.status === 'finished'
            ? activeGame.winner_id
              ? `🏆 ${getName(activeGame.winner_id)} Wins!`
              : 'Draw!'
            : isMyTurn
            ? '● Your Turn — Tap a Column'
            : activeGame.isBotGame
            ? 'AI Thinking...'
            : `${getName(players[activeGame.state.turn - 1])}'s Turn`}
        </span>
      </div>

      {/* Tap-to-Drop Column Buttons */}
      <div className="grid grid-cols-7 gap-1.5 px-2">
        {Array.from({ length: COLS }, (_, c) => (
          <button
            key={c}
            type="button"
            disabled={!isMyTurn || activeGame.state.board[0][c] !== 0}
            onClick={() => handleDrop(c)}
            className="py-2 rounded-xl bg-slate-100 hover:bg-[#ff4d00] hover:text-white text-slate-700 font-black text-xs transition-all disabled:opacity-30"
          >
            ↓
          </button>
        ))}
      </div>

      {/* 3D Board */}
      <div className="relative w-full h-[340px] sm:h-[400px] rounded-[28px] overflow-hidden bg-[#0f1220] shadow-xl">
        <div ref={mountRef} className="w-full h-full" />

        {activeGame.status === 'finished' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Trophy size={36} className="text-amber-400 mb-2" />
            <h3 className="text-2xl font-black text-white mb-4">
              {activeGame.winner_id ? `${getName(activeGame.winner_id)} Wins!` : 'Draw Game!'}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => (activeGame.isBotGame ? startBotGame() : setActiveGame(null))}
                className="bg-[#ff4d00] text-white text-xs font-black uppercase px-6 py-2.5 rounded-full"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={() => setActiveGame(null)}
                className="bg-white/15 text-white text-xs font-bold uppercase px-5 py-2.5 rounded-full"
              >
                Lobby
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
        <span>🔴 {getName(players[0])}</span>
        <span>🟡 {getName(players[1])}</span>
      </div>
    </div>
  );
}
