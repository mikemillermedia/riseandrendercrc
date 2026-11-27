import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Bot, Plus, ArrowLeft, Trophy, Trash2, Users, RotateCw } from 'lucide-react';

interface CheckersGameProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
}

// 0=empty, 1=Red(P1), 2=Black(P2/Bot), 3=Red King, 4=Black King
type Piece = 0 | 1 | 2 | 3 | 4;
type Move = { fr: number; fc: number; tr: number; tc: number; capR?: number; capC?: number };

const RED_MAT = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.2 });
const BLK_MAT = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.3 });
const GOLD_MAT = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 });
const SEL_MAT = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.55 });
const DOT_MAT = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide });

function createInitialBoard(): Piece[][] {
  const b: Piece[][] = Array.from({ length: 8 }, () => Array(8).fill(0));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = 2;
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = 1;
  }
  return b;
}

function ownerOf(p: Piece): 0 | 1 | 2 {
  if (p === 1 || p === 3) return 1;
  if (p === 2 || p === 4) return 2;
  return 0;
}

function getValidMoves(board: Piece[][], player: 1 | 2): Move[] {
  const jumps: Move[] = [];
  const steps: Move[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (ownerOf(p) !== player) continue;
      const isKing = p === 3 || p === 4;
      const dirs = isKing
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : player === 1
        ? [[-1, -1], [-1, 1]]
        : [[1, -1], [1, 1]];

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (board[nr][nc] === 0) {
            steps.push({ fr: r, fc: c, tr: nr, tc: nc });
          } else if (ownerOf(board[nr][nc]) === (player === 1 ? 2 : 1)) {
            const jr = nr + dr;
            const jc = nc + dc;
            if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && board[jr][jc] === 0) {
              jumps.push({ fr: r, fc: c, tr: jr, tc: jc, capR: nr, capC: nc });
            }
          }
        }
      }
    }
  }
  return jumps.length > 0 ? jumps : steps;
}

function applyMove(board: Piece[][], move: Move): Piece[][] {
  const next = board.map((row) => [...row]);
  let piece = next[move.fr][move.fc];
  next[move.fr][move.fc] = 0;
  if (move.capR !== undefined && move.capC !== undefined) {
    next[move.capR][move.capC] = 0;
  }
  if (piece === 1 && move.tr === 0) piece = 3;
  if (piece === 2 && move.tr === 7) piece = 4;
  next[move.tr][move.tc] = piece;
  return next;
}

function disposeGroup(group: THREE.Group) {
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).geometry.dispose();
  });
  group.clear();
}

export default function CheckersGame({ supabase, userId, familyMembers }: CheckersGameProps) {
  const [games, setGames] = useState<any[]>([]);
  const [activeGame, setActiveGame] = useState<any | null>(null);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [inviteeId, setInviteeId] = useState('');

  const mountRef = useRef<HTMLDivElement | null>(null);
  const piecesGroupRef = useRef<THREE.Group | null>(null);
  const highlightsGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const activeGameRef = useRef<any | null>(null);
  const selectedRef = useRef<{ r: number; c: number } | null>(null);
  activeGameRef.current = activeGame;
  selectedRef.current = selected;

  const otherMembers = familyMembers.filter((m) => m.id !== userId);

  const getName = (id?: string | null) => {
    if (id === 'AI_BOT') return 'AI Bot';
    if (!id) return 'Open Seat';
    const m = familyMembers.find((f) => f.id === id);
    return m ? `${m.first_name || 'Family'} ${m.last_name || ''}`.trim() : 'Family';
  };

  const recordWin = async (winnerId: string | null) => {
    if (!supabase || !winnerId || winnerId === 'AI_BOT') return;
    await supabase.rpc('increment_game_win', { p_user_id: winnerId, p_game_type: 'checkers' });
  };

  const fetchGames = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('arcade_games')
      .select('*')
      .eq('game_type', 'checkers')
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
      .channel('arcade-checkers-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_games', filter: 'game_type=eq.checkers' },
        (payload: any) => {
          fetchGames();
          if (payload.new && activeGameRef.current?.id === payload.new.id) {
            setActiveGame(payload.new);
            setSelected(null);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase]);

  const startBotGame = () => {
    setSelected(null);
    setActiveGame({
      id: `chk-bot-${Date.now()}`,
      isBotGame: true,
      host_id: userId,
      players: [userId, 'AI_BOT'],
      status: 'active',
      winner_id: null,
      state: { board: createInitialBoard(), turn: 1 },
    });
  };

  const createLiveGame = async () => {
    if (!supabase || !userId) return;
    const players = inviteeId ? [userId, inviteeId] : [userId];
    const { data, error } = await supabase
      .from('arcade_games')
      .insert([
        {
          game_type: 'checkers',
          host_id: userId,
          players,
          status: inviteeId ? 'active' : 'waiting',
          state: { board: createInitialBoard(), turn: 1 },
        },
      ])
      .select()
      .single();
    if (error) {
      alert('Error creating Checkers match: ' + error.message);
      return;
    }
    setInviteeId('');
    setSelected(null);
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

  const handleSquareTap = async (r: number, c: number) => {
    const game = activeGameRef.current;
    if (!game || game.status === 'finished' || !userId) return;
    const players: string[] = game.players || [];
    const myNum: 0 | 1 | 2 = players[0] === userId ? 1 : players[1] === userId ? 2 : 0;
    if (!myNum || game.state.turn !== myNum) return;

    const legalMoves = getValidMoves(game.state.board, myNum);

    if (selectedRef.current) {
      const chosen = legalMoves.find(
        (m) => m.fr === selectedRef.current!.r && m.fc === selectedRef.current!.c && m.tr === r && m.tc === c
      );
      if (chosen) {
        const nextBoard = applyMove(game.state.board, chosen);
        const nextTurn: 1 | 2 = myNum === 1 ? 2 : 1;
        const oppMoves = getValidMoves(nextBoard, nextTurn);
        const isFinished = oppMoves.length === 0;
        const winnerId = isFinished ? userId : null;
        if (winnerId) recordWin(winnerId);

        const nextState = { board: nextBoard, turn: nextTurn };
        const nextGame = { ...game, status: isFinished ? 'finished' : 'active', winner_id: winnerId, state: nextState };
        setActiveGame(nextGame);
        setSelected(null);

        if (!game.isBotGame && supabase) {
          await supabase
            .from('arcade_games')
            .update({ status: nextGame.status, winner_id: winnerId, state: nextState, updated_at: new Date().toISOString() })
            .eq('id', game.id);
        }
        return;
      }
    }

    if (ownerOf(game.state.board[r][c]) === myNum) {
      setSelected({ r, c });
    } else {
      setSelected(null);
    }
  };

  // AI Bot turn
  useEffect(() => {
    if (!activeGame?.isBotGame || activeGame.status === 'finished' || activeGame.state.turn !== 2) return;
    const t = setTimeout(() => {
      const moves = getValidMoves(activeGame.state.board, 2);
      if (moves.length === 0) {
        setActiveGame((prev: any) => ({ ...prev, status: 'finished', winner_id: userId }));
        recordWin(userId);
        return;
      }
      const chosen = moves[Math.floor(Math.random() * moves.length)];
      const nextBoard = applyMove(activeGame.state.board, chosen);
      const playerMoves = getValidMoves(nextBoard, 1);
      const isFinished = playerMoves.length === 0;
      setActiveGame((prev: any) => ({
        ...prev,
        status: isFinished ? 'finished' : 'active',
        winner_id: isFinished ? 'AI_BOT' : null,
        state: { board: nextBoard, turn: 1 },
      }));
    }, 550);
    return () => clearTimeout(t);
  }, [activeGame?.state?.turn, activeGame?.status, activeGame?.isBotGame]);

  // 3D Board Setup
  useEffect(() => {
    if (!activeGame || !mountRef.current) return;
    const container = mountRef.current;
    const w = Math.max(container.clientWidth, 300);
    const h = Math.max(container.clientHeight, 380);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x16120f);

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    const isP2 = activeGame.players?.[1] === userId;
    const dist = h > w ? 13 : 9.8;
    camera.position.set(0, h > w ? 10 : 8, isP2 ? -dist : dist);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.15;
    controls.minDistance = 6.5;
    controls.maxDistance = 18;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xfff1dc, 0.9));
    const light = new THREE.DirectionalLight(0xffe8c2, 1.2);
    light.position.set(6, 14, 6);
    scene.add(light);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.4, 8.6),
      new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 0.4 })
    );
    frame.position.y = -0.22;
    scene.add(frame);

    const squares: THREE.Mesh[] = [];
    const lMat = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.4 });
    const dMat = new THREE.MeshStandardMaterial({ color: 0x1e1e26, roughness: 0.4 });

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 1), (r + c) % 2 === 0 ? lMat : dMat);
        sq.position.set(c - 3.5, 0, r - 3.5);
        sq.userData = { r, c };
        scene.add(sq);
        squares.push(sq);
      }
    }

    const piecesGroup = new THREE.Group();
    const highlightsGroup = new THREE.Group();
    scene.add(piecesGroup, highlightsGroup);
    piecesGroupRef.current = piecesGroup;
    highlightsGroupRef.current = highlightsGroup;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let dx = 0, dy = 0;
    const onDown = (e: PointerEvent) => { dx = e.clientX; dy = e.clientY; };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - dx, e.clientY - dy) > 8) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...squares, ...piecesGroup.children], true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && obj.userData.r === undefined) obj = obj.parent;
        if (obj?.userData.r !== undefined) handleSquareTap(obj.userData.r, obj.userData.c);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);

    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth, nh = container.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    ro.observe(container);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      controls.dispose();
      disposeGroup(piecesGroup);
      disposeGroup(highlightsGroup);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.dispose();
    };
  }, [activeGame?.id]);

  // Sync 3D Checkers Pieces
  useEffect(() => {
    if (!activeGame || !piecesGroupRef.current) return;
    const grp = piecesGroupRef.current;
    disposeGroup(grp);
    const board: Piece[][] = activeGame.state.board;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const unit = new THREE.Group();
        const isKing = p === 3 || p === 4;
        const mat = ownerOf(p) === 1 ? RED_MAT : BLK_MAT;
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, 0.16, 20), mat);
        disc.position.y = 0.12;
        unit.add(disc);
        if (isKing) {
          const disc2 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.14, 20), mat);
          disc2.position.y = 0.27;
          const crown = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 16), GOLD_MAT);
          crown.rotation.x = Math.PI / 2;
          crown.position.y = 0.36;
          unit.add(disc2, crown);
        }
        unit.position.set(c - 3.5, 0, r - 3.5);
        unit.userData = { r, c };
        grp.add(unit);
      }
    }
  }, [activeGame?.state?.board, activeGame?.id]);

  // Sync Selection & Legal Move Highlights
  useEffect(() => {
    if (!activeGame || !highlightsGroupRef.current) return;
    const grp = highlightsGroupRef.current;
    disposeGroup(grp);
    if (!selected) return;

    const sel = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), SEL_MAT);
    sel.rotation.x = -Math.PI / 2;
    sel.position.set(selected.c - 3.5, 0.05, selected.r - 3.5);
    grp.add(sel);

    const myNum: 1 | 2 = activeGame.players?.[0] === userId ? 1 : 2;
    const moves = getValidMoves(activeGame.state.board, myNum).filter(
      (m) => m.fr === selected.r && m.fc === selected.c
    );
    moves.forEach((m) => {
      const dot = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.35, 20), DOT_MAT);
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(m.tc - 3.5, 0.06, m.tr - 3.5);
      grp.add(dot);
    });
  }, [selected, activeGame?.state?.board, activeGame?.id]);

  if (!activeGame) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">🔴 3D Checkers</h2>
          <p className="text-xs text-slate-500 mt-0.5">Jump opponent pieces and crown your Kings.</p>
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
                    🔴 {getName(p[0])} vs ⚫ {getName(p[1])}
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
  const myNum = players[0] === userId ? 1 : players[1] === userId ? 2 : 0;
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
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-extrabold px-3.5 py-1.5 rounded-full ${activeGame.status === 'finished' ? 'bg-amber-500 text-black' : isMyTurn ? 'bg-[#ff4d00] text-white' : 'bg-slate-100 text-slate-600'}`}>
            {activeGame.status === 'finished'
              ? `🏆 ${getName(activeGame.winner_id)} Wins!`
              : isMyTurn
              ? '● Your Turn'
              : activeGame.isBotGame
              ? 'AI Thinking...'
              : `${getName(players[activeGame.state.turn - 1])}'s Turn`}
          </span>
          <button
            type="button"
            onClick={() => {
              if (cameraRef.current && controlsRef.current) {
                cameraRef.current.position.set(0, 9.5, players[1] === userId ? -11 : 11);
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
              }
            }}
            className="p-1.5 rounded-full bg-slate-100 text-slate-700"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      <div className="relative w-full h-[400px] sm:h-[460px] rounded-[28px] overflow-hidden bg-[#16120f] shadow-xl">
        <div ref={mountRef} className="w-full h-full touch-none" />
        {activeGame.status === 'finished' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
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

      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
        <span>🔴 {getName(players[0])}</span>
        <span>Swipe to orbit • Tap piece → Tap green ring</span>
        <span>⚫ {getName(players[1])}</span>
      </div>
    </div>
  );
}
