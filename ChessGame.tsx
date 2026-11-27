import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Chess, Square } from 'chess.js';
import {
  Crown,
  Plus,
  RotateCw,
  Swords,
  ArrowLeft,
  Bot,
  MessageSquareShare,
  Users,
  Copy,
  Check,
} from 'lucide-react';

interface ChessGameProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
  initialGameId?: string | null;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

function buildPieceMesh(type: string, color: 'w' | 'b') {
  const group = new THREE.Group();
  const isWhite = color === 'w';
  const mat = new THREE.MeshStandardMaterial({
    color: isWhite ? 0xf5f0e6 : 0x222226,
    roughness: isWhite ? 0.35 : 0.25,
    metalness: isWhite ? 0.1 : 0.25,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.14, 24), mat);
  base.position.y = 0.07;
  base.castShadow = true;
  group.add(base);

  if (type === 'p') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.25, 0.42, 20), mat);
    body.position.y = 0.35;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 20), mat);
    head.position.y = 0.64;
    group.add(body, head);
  } else if (type === 'r') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.62, 20), mat);
    body.position.y = 0.45;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.2, 16), mat);
    top.position.y = 0.82;
    group.add(body, top);
  } else if (type === 'n') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.27, 0.5, 20), mat);
    body.position.y = 0.38;
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.32), mat);
    neck.position.set(0, 0.72, isWhite ? -0.04 : 0.04);
    neck.rotation.x = isWhite ? -0.25 : 0.25;
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.32), mat);
    snout.position.set(0, 0.84, isWhite ? -0.18 : 0.18);
    group.add(body, neck, snout);
  } else if (type === 'b') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 0.68, 20), mat);
    body.position.y = 0.48;
    const mitre = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), mat);
    mitre.scale.set(1, 1.35, 1);
    mitre.position.y = 0.9;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), mat);
    tip.position.y = 1.16;
    group.add(body, mitre, tip);
  } else if (type === 'q') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 0.85, 24), mat);
    body.position.y = 0.56;
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 12, 24), mat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 1.04;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 20), mat);
    orb.position.y = 1.16;
    group.add(body, crown, orb);
  } else if (type === 'k') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.95, 24), mat);
    body.position.y = 0.61;
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.12, 20), mat);
    collar.position.y = 1.1;
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), mat);
    crossV.position.y = 1.28;
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.08), mat);
    crossH.position.y = 1.32;
    group.add(body, collar, crossV, crossH);
  }

  return group;
}

export default function ChessGame({
  supabase,
  userId,
  familyMembers,
  initialGameId,
}: ChessGameProps) {
  const [games, setGames] = useState<any[]>([]);
  const [activeGame, setActiveGame] = useState<any | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [cameraAngle, setCameraAngle] = useState(0);
  const [inviteeId, setInviteeId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const piecesGroupRef = useRef<THREE.Group | null>(null);
  const highlightsGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const activeGameRef = useRef<any | null>(null);
  const selectedSquareRef = useRef<Square | null>(null);
  const validMovesRef = useRef<Square[]>([]);
  activeGameRef.current = activeGame;
  selectedSquareRef.current = selectedSquare;
  validMovesRef.current = validMoves;

  const otherMembers = familyMembers.filter((m) => m.id !== userId);

  const getMemberName = (id?: string | null) => {
    if (id === 'AI_BOT') return 'AI Bot 🤖';
    if (!id) return 'Open Invite';
    const m = familyMembers.find((f) => f.id === id);
    return m ? `${m.first_name || 'Family'} ${m.last_name || ''}`.trim() : 'Family Member';
  };

  const getInviteUrl = (gameId: string) =>
    `https://riseandrenderdfw.com/family?chess=${gameId}`;

  const sendSmsInvite = (gameId: string) => {
    const url = getInviteUrl(gameId);
    const body = `Come play 3D Chess with me on Millerites! Tap to join my live board: ${url}`;
    window.location.href = `sms:?&body=${encodeURIComponent(body)}`;
  };

  const copyInviteLink = async (gameId: string) => {
    try {
      await navigator.clipboard.writeText(getInviteUrl(gameId));
      setCopiedId(gameId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert(`Copy this link: ${getInviteUrl(gameId)}`);
    }
  };

  // Fetch lobby games & subscribe to live updates
  const fetchGames = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('chess_games')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(15);
    if (data) {
      setGames(data);
      if (activeGameRef.current && !activeGameRef.current.isBotGame) {
        const updated = data.find((g: any) => g.id === activeGameRef.current.id);
        if (updated) setActiveGame(updated);
      }
    }
  };

  // Auto-open game if user arrived via SMS invite link (?chess=GAME_ID)
  useEffect(() => {
    if (!initialGameId || !supabase || !userId) return;
    const loadInvitedGame = async () => {
      const { data } = await supabase
        .from('chess_games')
        .select('*')
        .eq('id', initialGameId)
        .single();
      if (data) handleJoinGame(data);
    };
    loadInvitedGame();
  }, [initialGameId, supabase, userId]);

  useEffect(() => {
    fetchGames();
    if (!supabase) return;

    const channel = supabase
      .channel('millerites-chess-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chess_games' },
        (payload: any) => {
          fetchGames();
          if (
            payload.new &&
            activeGameRef.current &&
            !activeGameRef.current.isBotGame &&
            activeGameRef.current.id === payload.new.id
          ) {
            setActiveGame(payload.new);
            setSelectedSquare(null);
            setValidMoves([]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 1. START LOCAL AI BOT MATCH
  const handleStartBotGame = () => {
    const fresh = new Chess();
    setActiveGame({
      id: `bot-${Date.now()}`,
      isBotGame: true,
      white_player_id: userId,
      black_player_id: 'AI_BOT',
      fen: fresh.fen(),
      turn: 'w',
      status: 'active',
      winner_id: null,
    });
    setSelectedSquare(null);
    setValidMoves([]);
  };

  // 2. CREATE LIVE MULTIPLAYER MATCH (Optional specific family member or SMS)
  const handleCreateLiveGame = async (openSms = false) => {
    if (!supabase || !userId) return;
    const payload: any = {
      white_player_id: userId,
      black_player_id: inviteeId || null,
      status: inviteeId ? 'active' : 'waiting',
    };
    const { data, error } = await supabase
      .from('chess_games')
      .insert([payload])
      .select()
      .single();
    if (error) {
      alert('Error creating game: ' + error.message);
      return;
    }
    setInviteeId('');
    setActiveGame(data);
    if (openSms) {
      sendSmsInvite(data.id);
    }
  };

  const handleJoinGame = async (game: any) => {
    if (!supabase || !userId) return;
    if (game.white_player_id === userId || game.black_player_id === userId) {
      setActiveGame(game);
      return;
    }
    if (!game.black_player_id) {
      const { data, error } = await supabase
        .from('chess_games')
        .update({
          black_player_id: userId,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', game.id)
        .select()
        .single();
      if (!error && data) {
        setActiveGame(data);
        return;
      }
    }
    setActiveGame(game);
  };

  // AI Bot Move Effect (plays Black after 600ms)
  useEffect(() => {
    if (!activeGame?.isBotGame || activeGame.status === 'finished' || activeGame.turn !== 'b') {
      return;
    }
    const timer = setTimeout(() => {
      const chess = new Chess(activeGame.fen);
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) return;

      // Smart-casual AI: prioritize highest-value captures, otherwise random legal move
      const captures = moves.filter((m: any) => m.captured);
      let chosen: any;
      if (captures.length > 0) {
        captures.sort(
          (a: any, b: any) => (PIECE_VALUES[b.captured] || 0) - (PIECE_VALUES[a.captured] || 0)
        );
        chosen = captures[0];
      } else {
        chosen = moves[Math.floor(Math.random() * moves.length)];
      }

      chess.move(chosen);
      const isOver = chess.isGameOver();
      setActiveGame((prev: any) => ({
        ...prev,
        fen: chess.fen(),
        turn: chess.turn(),
        status: isOver ? 'finished' : 'active',
        winner_id: chess.isCheckmate() ? 'AI_BOT' : null,
      }));
    }, 600);

    return () => clearTimeout(timer);
  }, [activeGame?.fen, activeGame?.isBotGame, activeGame?.turn, activeGame?.status]);

  // Handle Tapping a 3D Square or Piece
  const handleSquareClick = async (square: Square) => {
    const game = activeGameRef.current;
    if (!game || !userId || game.status === 'finished') return;

    const chess = new Chess(game.fen);
    const myColor =
      game.white_player_id === userId ? 'w' : game.black_player_id === userId ? 'b' : null;

    if (!myColor || chess.turn() !== myColor) return;

    if (selectedSquareRef.current && validMovesRef.current.includes(square)) {
      const move = chess.move({
        from: selectedSquareRef.current,
        to: square,
        promotion: 'q',
      });

      if (move) {
        const isOver = chess.isGameOver();
        const winnerId = chess.isCheckmate() ? userId : null;
        const nextStatus = isOver ? 'finished' : 'active';

        setActiveGame({
          ...game,
          fen: chess.fen(),
          turn: chess.turn(),
          status: nextStatus,
          winner_id: winnerId,
          last_move: `${move.from}${move.to}`,
        });
        setSelectedSquare(null);
        setValidMoves([]);

        if (!game.isBotGame && supabase) {
          await supabase
            .from('chess_games')
            .update({
              fen: chess.fen(),
              turn: chess.turn(),
              status: nextStatus,
              winner_id: winnerId,
              last_move: `${move.from}${move.to}`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', game.id);
        }
      }
      return;
    }

    const piece = chess.get(square);
    if (piece && piece.color === myColor) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true }).map((m: any) => m.to as Square);
      setValidMoves(moves);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Initialize Three.js 3D Scene
  useEffect(() => {
    if (!activeGame || !mountRef.current) return;
    const container = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dirLight = new THREE.DirectionalLight(0xfff5e4, 1.1);
    dirLight.position.set(6, 12, 6);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xff8c42, 0.35);
    rimLight.position.set(-6, 5, -6);
    scene.add(rimLight);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(8.7, 0.45, 8.7),
      new THREE.MeshStandardMaterial({ color: 0x1c1c2e, roughness: 0.4, metalness: 0.2 })
    );
    frame.position.y = -0.25;
    frame.receiveShadow = true;
    scene.add(frame);

    const squareMeshes: THREE.Mesh[] = [];
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xe8dec8, roughness: 0.55 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x6b4c3b, roughness: 0.55 });

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const isLight = (rank + file) % 2 === 1;
        const sqMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 0.08, 1),
          isLight ? lightMat : darkMat
        );
        sqMesh.position.set(file - 3.5, -0.02, 3.5 - rank);
        sqMesh.receiveShadow = true;
        sqMesh.userData.square = `${FILES[file]}${rank + 1}` as Square;
        scene.add(sqMesh);
        squareMeshes.push(sqMesh);
      }
    }

    const piecesGroup = new THREE.Group();
    const highlightsGroup = new THREE.Group();
    scene.add(piecesGroup, highlightsGroup);
    piecesGroupRef.current = piecesGroup;
    highlightsGroupRef.current = highlightsGroup;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...squareMeshes, ...piecesGroup.children], true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData.square) obj = obj.parent;
        if (obj?.userData.square) handleSquareClick(obj.userData.square as Square);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [activeGame?.id]);

  // Camera Angle
  useEffect(() => {
    if (!cameraRef.current || !activeGame) return;
    const isBlack = activeGame.black_player_id === userId;
    const angle = (isBlack ? Math.PI : 0) + cameraAngle;
    const radius = 9.5;
    cameraRef.current.position.set(Math.sin(angle) * radius, 8.2, Math.cos(angle) * radius);
    cameraRef.current.lookAt(0, 0, 0);
  }, [activeGame?.id, activeGame?.black_player_id, userId, cameraAngle]);

  // Sync 3D Pieces & Highlights
  useEffect(() => {
    if (!activeGame || !piecesGroupRef.current || !highlightsGroupRef.current) return;
    const piecesGroup = piecesGroupRef.current;
    const highlightsGroup = highlightsGroupRef.current;
    piecesGroup.clear();
    highlightsGroup.clear();

    const chess = new Chess(activeGame.fen);
    chess.board().forEach((row, rIdx) => {
      row.forEach((cell, fIdx) => {
        if (!cell) return;
        const rank = 8 - rIdx;
        const mesh = buildPieceMesh(cell.type, cell.color);
        mesh.position.set(fIdx - 3.5, 0.02, 3.5 - (rank - 1));
        mesh.userData.square = cell.square;
        piecesGroup.add(mesh);
      });
    });

    if (selectedSquare) {
      const f = FILES.indexOf(selectedSquare[0]);
      const r = Number(selectedSquare[1]) - 1;
      const selTile = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 0.95),
        new THREE.MeshBasicMaterial({ color: 0xff4d00, transparent: true, opacity: 0.45 })
      );
      selTile.rotation.x = -Math.PI / 2;
      selTile.position.set(f - 3.5, 0.03, 3.5 - r);
      highlightsGroup.add(selTile);
    }

    validMoves.forEach((sq) => {
      const f = FILES.indexOf(sq[0]);
      const r = Number(sq[1]) - 1;
      const dot = new THREE.Mesh(
        new THREE.RingGeometry(0.18, 0.34, 24),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
      );
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(f - 3.5, 0.04, 3.5 - r);
      highlightsGroup.add(dot);
    });
  }, [activeGame?.fen, selectedSquare, validMoves]);

  // LOBBY & MODE SELECTOR VIEW
  if (!activeGame) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Crown size={20} className="text-[#ff4d00]" /> 3D Chess
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Play solo vs. AI, challenge a family member, or text an invite link.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Play vs AI Bot */}
          <button
            type="button"
            onClick={handleStartBotGame}
            className="p-4 rounded-2xl bg-[#1C1C2E] hover:bg-slate-800 text-white text-left flex items-center gap-3.5 transition-all shadow-md"
          >
            <span className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
              <Bot size={20} />
            </span>
            <div>
              <p className="text-sm font-black">Play vs. AI Bot</p>
              <p className="text-[11px] text-white/65">Instant solo 3D match</p>
            </div>
          </button>

          {/* Text Invite Link */}
          <button
            type="button"
            onClick={() => handleCreateLiveGame(true)}
            className="p-4 rounded-2xl bg-[#ff4d00] hover:bg-orange-600 text-white text-left flex items-center gap-3.5 transition-all shadow-md shadow-orange-500/20"
          >
            <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <MessageSquareShare size={20} />
            </span>
            <div>
              <p className="text-sm font-black">Text an Invite Link</p>
              <p className="text-[11px] text-white/85">Creates a live board & opens SMS</p>
            </div>
          </button>
        </div>

        {/* Challenge a Specific Family Member */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users size={12} className="text-[#ff4d00]" /> Challenge a Family Member
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={inviteeId}
              onChange={(e) => setInviteeId(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400"
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
              onClick={() => handleCreateLiveGame(false)}
              className="bg-[#1C1C2E] hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-all"
            >
              <Plus size={14} /> Start Live Match
            </button>
          </div>
        </div>

        {/* Live Matches List */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
            Live & Recent Family Matches
          </p>
          {games.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200/70">
              <p className="text-xs text-slate-400 font-medium">No live matches yet.</p>
            </div>
          ) : (
            games.map((g) => {
              const isParticipant = g.white_player_id === userId || g.black_player_id === userId;
              return (
                <div
                  key={g.id}
                  className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      ⚪ {getMemberName(g.white_player_id)} vs ⚫ {getMemberName(g.black_player_id)}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                      {g.status === 'waiting'
                        ? 'Waiting for opponent'
                        : g.status === 'finished'
                        ? `Finished • Winner: ${getMemberName(g.winner_id)}`
                        : `${g.turn === 'w' ? 'White' : 'Black'}'s turn`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {g.status === 'waiting' && (
                      <button
                        type="button"
                        onClick={() => sendSmsInvite(g.id)}
                        className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                        title="Text invite link"
                      >
                        <MessageSquareShare size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleJoinGame(g)}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                        g.status === 'waiting' && !isParticipant
                          ? 'bg-[#ff4d00] text-white'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {isParticipant ? 'Resume' : g.status === 'waiting' ? 'Join' : 'Watch'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ACTIVE 3D BOARD VIEW
  const chessInstance = new Chess(activeGame.fen);
  const myColor =
    activeGame.white_player_id === userId ? 'w' : activeGame.black_player_id === userId ? 'b' : null;
  const isMyTurn = myColor && chessInstance.turn() === myColor && activeGame.status !== 'finished';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveGame(null);
            setSelectedSquare(null);
            setValidMoves([]);
          }}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1"
        >
          <ArrowLeft size={13} /> Chess Lobby
        </button>

        <div className="flex items-center gap-1.5">
          {!activeGame.isBotGame && (
            <>
              <button
                type="button"
                onClick={() => sendSmsInvite(activeGame.id)}
                className="text-[11px] font-bold text-[#ff4d00] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-full flex items-center gap-1"
              >
                <MessageSquareShare size={12} /> Text Invite
              </button>
              <button
                type="button"
                onClick={() => copyInviteLink(activeGame.id)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                title="Copy invite link"
              >
                {copiedId === activeGame.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </>
          )}

          <span
            className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
              activeGame.status === 'finished'
                ? 'bg-amber-500 text-white'
                : isMyTurn
                ? 'bg-[#ff4d00] text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {activeGame.status === 'finished'
              ? `🏆 ${activeGame.winner_id ? `${getMemberName(activeGame.winner_id)} Wins!` : 'Draw'}`
              : isMyTurn
              ? 'Your Turn'
              : activeGame.isBotGame
              ? 'AI Thinking...'
              : `${chessInstance.turn() === 'w' ? 'White' : 'Black'}'s Turn`}
          </span>

          <button
            type="button"
            onClick={() => setCameraAngle((a) => a + Math.PI / 2)}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Rotate 3D Board"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[400px] sm:h-[480px] rounded-[28px] overflow-hidden bg-gradient-to-b from-slate-900 to-black border border-slate-200/30 shadow-xl touch-none"
      />

      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
        <span>⚪ {getMemberName(activeGame.white_player_id)}</span>
        <span className="flex items-center gap-1 text-[#ff4d00]">
          <Swords size={12} /> {chessInstance.inCheck() ? 'CHECK!' : 'Tap piece → Tap green ring'}
        </span>
        <span>⚫ {getMemberName(activeGame.black_player_id)}</span>
      </div>
    </div>
  );
}
