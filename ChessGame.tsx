import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
  Trophy,
  Sparkles,
  Hand,
} from 'lucide-react';

interface ChessGameProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
  initialGameId?: string | null;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

// Procedural stone floor texture for the Grand Hall
function createStoneFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#3b2e25';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const cols = 4;
  const tileW = 512 / cols;
  const tileH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (tileW / 2);
    for (let c = -1; c <= cols; c++) {
      const shade = 48 + Math.floor(Math.random() * 24);
      ctx.fillStyle = `rgb(${shade + 16}, ${shade + 5}, ${shade - 4})`;
      ctx.fillRect(c * tileW + offset + 3, r * tileH + 3, tileW - 6, tileH - 6);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

// Procedural gold-rune obsidian border texture for the table
function createRuneBorderTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0d0d11';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle marble veins
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.14)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 24; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, Math.random() * 512);
    ctx.lineTo(Math.random() * 512, Math.random() * 512);
    ctx.stroke();
  }

  // Outer & inner gold trim lines
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 5;
  ctx.strokeRect(18, 18, 476, 476);
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 448, 448);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Ornate gold-trimmed 3D chess pieces
function buildPieceMesh(type: string, color: 'w' | 'b') {
  const group = new THREE.Group();
  const isWhite = color === 'w';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: isWhite ? 0xf5efe2 : 0x1a1a22,
    roughness: isWhite ? 0.28 : 0.22,
    metalness: isWhite ? 0.12 : 0.35,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 0.85,
  });

  // Pedestal + gold trim ring
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.37, 0.14, 20), bodyMat);
  base.position.y = 0.07;
  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 10, 20), goldMat);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.14;
  group.add(base, baseRing);

  if (type === 'p') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.25, 0.44, 16), bodyMat);
    body.position.y = 0.36;
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 8, 16), goldMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.56;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), bodyMat);
    head.position.y = 0.68;
    group.add(body, collar, head);
  } else if (type === 'r') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.27, 0.64, 16), bodyMat);
    body.position.y = 0.46;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.2, 14), bodyMat);
    top.position.y = 0.84;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.028, 8, 16), goldMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.94;
    group.add(body, top, rim);
  } else if (type === 'n') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.27, 0.52, 16), bodyMat);
    body.position.y = 0.4;
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.44, 0.32), bodyMat);
    neck.position.set(0, 0.74, isWhite ? -0.04 : 0.04);
    neck.rotation.x = isWhite ? -0.25 : 0.25;
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.34), bodyMat);
    snout.position.set(0, 0.86, isWhite ? -0.18 : 0.18);
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.1), goldMat);
    crest.position.set(0, 0.84, isWhite ? 0.11 : -0.11);
    group.add(body, neck, snout, crest);
  } else if (type === 'b') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 0.7, 16), bodyMat);
    body.position.y = 0.49;
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 16), goldMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.82;
    const mitre = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), bodyMat);
    mitre.scale.set(1, 1.38, 1);
    mitre.position.y = 0.94;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), goldMat);
    tip.position.y = 1.22;
    group.add(body, band, mitre, tip);
  } else if (type === 'q') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.29, 0.88, 18), bodyMat);
    body.position.y = 0.58;
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.05, 10, 18), goldMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 1.06;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), goldMat);
    orb.position.y = 1.2;
    group.add(body, crown, orb);
  } else if (type === 'k') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.31, 0.98, 18), bodyMat);
    body.position.y = 0.63;
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.19, 0.12, 16), goldMat);
    collar.position.y = 1.13;
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), goldMat);
    crossV.position.y = 1.32;
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.08), goldMat);
    crossH.position.y = 1.36;
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
  const [inviteeId, setInviteeId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  // Intro & Outro Overlay State
  const [showIntro, setShowIntro] = useState(false);
  const [showControlsHint, setShowControlsHint] = useState(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const piecesGroupRef = useRef<THREE.Group | null>(null);
  const highlightsGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const activeGameRef = useRef<any | null>(null);
  const selectedSquareRef = useRef<Square | null>(null);
  const validMovesRef = useRef<Square[]>([]);
  activeGameRef.current = activeGame;
  selectedSquareRef.current = selectedSquare;
  validMovesRef.current = validMoves;

  const otherMembers = familyMembers.filter((m) => m.id !== userId);

  const getMemberName = (id?: string | null) => {
    if (id === 'AI_BOT') return 'AI Bot';
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

  const resetCameraView = () => {
    if (!cameraRef.current || !controlsRef.current || !mountRef.current) return;
    const isBlack = activeGameRef.current?.black_player_id === userId;
    const isPortrait = mountRef.current.clientHeight > mountRef.current.clientWidth;
    const radius = isPortrait ? 13.8 : 10.2;
    const height = isPortrait ? 10.5 : 8.2;
    cameraRef.current.position.set(0, height, isBlack ? -radius : radius);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

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

  const enterGame = (gameObj: any) => {
    setWebglError(null);
    setActiveGame(gameObj);
    setSelectedSquare(null);
    setValidMoves([]);
    setShowIntro(gameObj.status !== 'finished');
  };

  const handleStartBotGame = () => {
    const fresh = new Chess();
    enterGame({
      id: `bot-${Date.now()}`,
      isBotGame: true,
      white_player_id: userId,
      black_player_id: 'AI_BOT',
      fen: fresh.fen(),
      turn: 'w',
      status: 'active',
      winner_id: null,
    });
  };

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
    enterGame(data);
    if (openSms) {
      sendSmsInvite(data.id);
    }
  };

  const handleJoinGame = async (game: any) => {
    if (!supabase || !userId) return;
    if (game.white_player_id === userId || game.black_player_id === userId) {
      enterGame(game);
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
        enterGame(data);
        return;
      }
    }
    enterGame(game);
  };

  // AI Bot Move Effect
  useEffect(() => {
    if (
      !activeGame?.isBotGame ||
      activeGame.status === 'finished' ||
      activeGame.turn !== 'b' ||
      showIntro
    ) {
      return;
    }
    const timer = setTimeout(() => {
      const chess = new Chess(activeGame.fen);
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) return;

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
    }, 650);

    return () => clearTimeout(timer);
  }, [activeGame?.fen, activeGame?.isBotGame, activeGame?.turn, activeGame?.status, showIntro]);

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

  // Initialize Grand Hall 3D Scene + OrbitControls (Swipe/Tilt/Pan/Zoom)
  useEffect(() => {
    if (!activeGame || !mountRef.current) return;
    const container = mountRef.current;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default' });
    } catch {
      setWebglError('3D graphics could not start on this browser.');
      return;
    }

    const initWidth = Math.max(container.clientWidth, 300);
    const initHeight = Math.max(container.clientHeight, 420);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x16120f);
    scene.fog = new THREE.FogExp2(0x16120f, 0.022);

    const camera = new THREE.PerspectiveCamera(42, initWidth / initHeight, 0.1, 100);
    cameraRef.current = camera;

    const isBlack = activeGame.black_player_id === userId;
    const isPortrait = initHeight > initWidth;
    const radius = isPortrait ? 13.8 : 10.2;
    const camHeight = isPortrait ? 10.5 : 8.2;
    camera.position.set(0, camHeight, isBlack ? -radius : radius);

    renderer.setSize(initWidth, initHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls: Swipe to orbit/tilt, 2-finger drag / right-click to pan, pinch/scroll to zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.screenSpacePanning = false;
    controls.minDistance = 6.5;
    controls.maxDistance = 22;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2 - 0.12;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // Warm Grand Hall Lighting
    scene.add(new THREE.AmbientLight(0xfff1dc, 0.85));
    const mainLight = new THREE.DirectionalLight(0xffe8c2, 1.25);
    mainLight.position.set(7, 15, 7);
    scene.add(mainLight);

    const torchLeft = new THREE.PointLight(0xff8c32, 1.4, 28);
    torchLeft.position.set(-9, 6, -8);
    scene.add(torchLeft);

    const torchRight = new THREE.PointLight(0xffaa44, 1.2, 28);
    torchRight.position.set(9, 6, 8);
    scene.add(torchRight);

    // Stone Tile Hall Floor
    const floorTex = createStoneFloorTexture();
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 46),
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.2;
    scene.add(floor);

    // Grand Hall Stone Pillars in background
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x5c4d3e, roughness: 0.8 });
    const pillarPositions = [
      [-11, -11],
      [11, -11],
      [-11, 11],
      [11, 11],
      [-14, 0],
      [14, 0],
    ];
    pillarPositions.forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 14, 16), pillarMat);
      pillar.position.set(px, 4.8, pz);
      const pBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 2.2), pillarMat);
      pBase.position.set(px, -1.75, pz);
      scene.add(pillar, pBase);
    });

    // Ornate Obsidian & Gold-Rune Pedestal Table
    const runeTex = createRuneBorderTexture();
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(10.6, 0.55, 10.6),
      new THREE.MeshStandardMaterial({ map: runeTex, roughness: 0.3, metalness: 0.35 })
    );
    tableTop.position.y = -0.32;
    scene.add(tableTop);

    const goldFrame = new THREE.Mesh(
      new THREE.BoxGeometry(8.35, 0.16, 8.35),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 })
    );
    goldFrame.position.y = -0.05;
    scene.add(goldFrame);

    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 1.6, 6.8),
      new THREE.MeshStandardMaterial({ color: 0x0f0f14, roughness: 0.4, metalness: 0.3 })
    );
    pedestal.position.y = -1.4;
    scene.add(pedestal);

    // 64 Marble & Obsidian Squares
    const squareMeshes: THREE.Mesh[] = [];
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.35, metalness: 0.05 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x16181f, roughness: 0.3, metalness: 0.2 });

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const isLight = (rank + file) % 2 === 1;
        const sqMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 0.1, 1),
          isLight ? lightMat : darkMat
        );
        sqMesh.position.set(file - 3.5, 0, 3.5 - rank);
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

    // Populate initial pieces immediately
    const initialChess = new Chess(activeGame.fen);
    initialChess.board().forEach((row, rIdx) => {
      row.forEach((cell, fIdx) => {
        if (!cell) return;
        const rank = 8 - rIdx;
        const mesh = buildPieceMesh(cell.type, cell.color);
        mesh.position.set(fIdx - 3.5, 0.05, 3.5 - (rank - 1));
        mesh.userData.square = cell.square;
        piecesGroup.add(mesh);
      });
    });

    // Distinguish TAP (select/move piece) vs SWIPE (orbit/pan camera)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 8) return; // User was swiping/orbiting, not tapping a piece

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
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      floorTex.dispose();
      runeTex.dispose();
      renderer.dispose();
    };
  }, [activeGame?.id]);

  // Sync 3D Pieces & Glowing Highlights on every move or selection
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
        mesh.position.set(fIdx - 3.5, 0.05, 3.5 - (rank - 1));
        mesh.userData.square = cell.square;
        piecesGroup.add(mesh);
      });
    });

    if (selectedSquare) {
      const f = FILES.indexOf(selectedSquare[0]);
      const r = Number(selectedSquare[1]) - 1;
      const selTile = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 0.95),
        new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.55 })
      );
      selTile.rotation.x = -Math.PI / 2;
      selTile.position.set(f - 3.5, 0.06, 3.5 - r);
      highlightsGroup.add(selTile);
    }

    validMoves.forEach((sq) => {
      const f = FILES.indexOf(sq[0]);
      const r = Number(sq[1]) - 1;
      const dot = new THREE.Mesh(
        new THREE.RingGeometry(0.18, 0.35, 24),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
      );
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(f - 3.5, 0.07, 3.5 - r);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

  const chessInstance = new Chess(activeGame.fen);
  const myColor =
    activeGame.white_player_id === userId ? 'w' : activeGame.black_player_id === userId ? 'b' : null;
  const isMyTurn = myColor && chessInstance.turn() === myColor && activeGame.status !== 'finished';
  const isFinished = activeGame.status === 'finished';

  return (
    <div className="space-y-3">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveGame(null);
            setSelectedSquare(null);
            setValidMoves([]);
            setShowIntro(false);
          }}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1"
        >
          <ArrowLeft size={13} /> Lobby
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

          <button
            type="button"
            onClick={() => setShowControlsHint((s) => !s)}
            className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1"
          >
            <Hand size={12} /> Controls
          </button>

          <button
            type="button"
            onClick={resetCameraView}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Reset 3D Camera View"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* 3D Grand Hall Arena Container */}
      <div className="relative w-full h-[460px] sm:h-[540px] rounded-[28px] overflow-hidden bg-[#16120f] border border-amber-500/25 shadow-2xl">
        {/* Floating Wizard-Style HUD Pills */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
          <span className="bg-black/65 backdrop-blur-md border border-amber-400/35 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
            Millerites Chess
          </span>

          <span
            className={`backdrop-blur-md border text-[11px] font-extrabold px-3.5 py-1.5 rounded-full ${
              isFinished
                ? 'bg-amber-500/90 border-amber-300 text-black'
                : isMyTurn
                ? 'bg-[#ff4d00]/90 border-orange-300 text-white'
                : 'bg-black/65 border-white/15 text-white'
            }`}
          >
            {isFinished
              ? 'Match Complete'
              : isMyTurn
              ? '● Your Turn'
              : activeGame.isBotGame
              ? 'AI Thinking...'
              : `${chessInstance.turn() === 'w' ? '⚪ White' : '⚫ Black'} to Move`}
          </span>
        </div>

        {/* Controls Hint Popover */}
        {showControlsHint && (
          <div className="absolute top-14 right-3 z-20 bg-black/85 backdrop-blur-md border border-amber-400/30 text-white rounded-2xl p-3.5 text-[11px] space-y-1.5 max-w-[210px] shadow-xl">
            <p className="font-black text-amber-300 uppercase tracking-wider text-[10px]">3D Camera Controls</p>
            <p>• <strong>1-Finger Swipe:</strong> Orbit & Tilt</p>
            <p>• <strong>2-Finger Drag:</strong> Pan Board</p>
            <p>• <strong>Pinch / Scroll:</strong> Zoom In & Out</p>
            <p>• <strong>Tap Piece:</strong> Select & Move</p>
          </div>
        )}

        {/* 3D WebGL Mount */}
        {webglError ? (
          <div className="w-full h-full flex items-center justify-center p-6 text-center text-white/70 text-xs font-semibold">
            {webglError}
          </div>
        ) : (
          <div ref={mountRef} className="w-full h-full touch-none" />
        )}

        {/* CINEMATIC MATCH INTRO OVERLAY */}
        {showIntro && !isFinished && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full mb-3">
              <Sparkles size={12} /> Grand Hall Arena
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4">
              {getMemberName(activeGame.white_player_id)}{' '}
              <span className="text-amber-400">vs</span>{' '}
              {getMemberName(activeGame.black_player_id)}
            </h3>
            <p className="text-xs text-white/70 max-w-xs mb-6 leading-relaxed">
              Swipe to orbit & tilt the 3D board, use two fingers to pan, and tap any piece to make your move.
            </p>
            <button
              type="button"
              onClick={() => setShowIntro(false)}
              className="bg-gradient-to-r from-amber-400 to-[#ff4d00] hover:brightness-110 text-black font-black uppercase tracking-widest text-xs px-8 py-3.5 rounded-full shadow-lg shadow-orange-500/30 transition-all active:scale-95"
            >
              Begin Match
            </button>
          </div>
        )}

        {/* VICTORY / OUTRO OVERLAY */}
        {isFinished && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-4 shadow-lg shadow-amber-500/20">
              <Trophy size={30} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">
              {activeGame.winner_id ? 'Checkmate!' : 'Stalemate / Draw'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {activeGame.winner_id
                ? `${getMemberName(activeGame.winner_id)} Wins!`
                : 'Match Ended in a Draw'}
            </h3>
            <p className="text-xs text-white/65 mb-6">
              ⚪ {getMemberName(activeGame.white_player_id)} vs ⚫ {getMemberName(activeGame.black_player_id)}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => (activeGame.isBotGame ? handleStartBotGame() : handleCreateLiveGame(false))}
                className="bg-[#ff4d00] hover:bg-orange-600 text-white font-black uppercase tracking-wider text-xs px-6 py-3 rounded-full shadow-lg transition-all"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveGame(null);
                  setSelectedSquare(null);
                  setValidMoves([]);
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-full transition-all"
              >
                Lobby
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Match Status Bar */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
        <span>⚪ {getMemberName(activeGame.white_player_id)}</span>
        <span className="flex items-center gap-1 text-[#ff4d00] font-bold">
          <Swords size={12} /> {chessInstance.inCheck() ? 'CHECK!' : 'Swipe to orbit • Tap to move'}
        </span>
        <span>⚫ {getMemberName(activeGame.black_player_id)}</span>
      </div>
    </div>
  );
}
