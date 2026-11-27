import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  ArrowLeft,
  Trash2,
  Send,
  Eraser,
  RefreshCw,
  Palette,
  Users,
  Trophy,
} from 'lucide-react';

interface DrawGuessGameProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
}

const PROMPTS = [
  'NOAH ARK', 'RAINBOW', 'CROWN', 'GUITAR', 'PIZZA', 'AIRPLANE', 'SUNFLOWER',
  'LION', 'BIBLE', 'CHURCH', 'BASKETBALL', 'BIRTHDAY CAKE', 'MOUNTAIN', 'FISH',
  'LIGHTHOUSE', 'CAMPFIRE', 'DIAMOND', 'BUTTERFLY', 'ROCKET', 'COFFEE',
  'TREASURE', 'ANCHOR', 'CASTLE', 'VOLCANO', 'UMBRELLA', 'SNOWMAN', 'TROPHY',
];

const COLORS = ['#111827', '#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ffffff'];

type Stroke = { color: string; width: number; points: [number, number][] };

function pickWord(exclude?: string) {
  const pool = PROMPTS.filter((w) => w !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function DrawGuessGame({
  supabase,
  userId,
  familyMembers,
}: DrawGuessGameProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  const [color, setColor] = useState('#111827');
  const [guess, setGuess] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const activeRoomRef = useRef<any | null>(null);
  activeRoomRef.current = activeRoom;

  const getName = (id?: string | null) => {
    const m = familyMembers.find((f) => f.id === id);
    return m ? `${m.first_name || 'Family'}` : 'Family';
  };

  const recordWin = async (winnerId: string | null) => {
    if (!supabase || !winnerId) return;
    await supabase.rpc('increment_game_win', { p_user_id: winnerId, p_game_type: 'draw' });
  };

  const fetchRooms = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('arcade_games')
      .select('*')
      .eq('game_type', 'draw')
      .order('updated_at', { ascending: false })
      .limit(10);
    if (data) {
      setRooms(data);
      if (activeRoomRef.current) {
        const updated = data.find((r: any) => r.id === activeRoomRef.current.id);
        if (updated) setActiveRoom(updated);
      }
    }
  };

  useEffect(() => {
    fetchRooms();
    if (!supabase) return;
    const ch = supabase
      .channel('arcade-draw-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_games', filter: 'game_type=eq.draw' },
        (payload: any) => {
          fetchRooms();
          if (payload.new && activeRoomRef.current?.id === payload.new.id) {
            setActiveRoom(payload.new);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase]);

  const createRoom = async () => {
    if (!supabase || !userId) return;
    const { data, error } = await supabase
      .from('arcade_games')
      .insert([
        {
          game_type: 'draw',
          host_id: userId,
          players: [userId],
          status: 'active',
          state: {
            drawerId: userId,
            word: pickWord(),
            strokes: [],
            guesses: [],
            scores: { [userId]: 0 },
            lastWinner: null,
          },
        },
      ])
      .select()
      .single();
    if (error) {
      alert('Error creating Draw & Guess room: ' + error.message);
      return;
    }
    setActiveRoom(data);
  };

  const joinRoom = async (room: any) => {
    if (!supabase || !userId) return;
    const players: string[] = room.players || [];
    if (!players.includes(userId)) {
      const nextPlayers = [...players, userId];
      const { data } = await supabase
        .from('arcade_games')
        .update({ players: nextPlayers, updated_at: new Date().toISOString() })
        .eq('id', room.id)
        .select()
        .single();
      if (data) {
        setActiveRoom(data);
        return;
      }
    }
    setActiveRoom(room);
  };

  const deleteRoom = async (id: string) => {
    if (!supabase || !confirm('Close this Draw & Guess room?')) return;
    await supabase.from('arcade_games').delete().eq('id', id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    if (activeRoom?.id === id) setActiveRoom(null);
  };

  const syncState = async (nextState: any) => {
    if (!supabase || !activeRoomRef.current) return;
    setActiveRoom((prev: any) => (prev ? { ...prev, state: nextState } : prev));
    await supabase
      .from('arcade_games')
      .update({ state: nextState, updated_at: new Date().toISOString() })
      .eq('id', activeRoomRef.current.id);
  };

  // Render all synced strokes onto canvas
  useEffect(() => {
    if (!activeRoom || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const strokes: Stroke[] = activeRoom.state?.strokes || [];
    strokes.forEach((s) => {
      if (s.points.length < 2) return;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(s.points[0][0] * canvas.width, s.points[0][1] * canvas.height);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i][0] * canvas.width, s.points[i][1] * canvas.height);
      }
      ctx.stroke();
    });
  }, [activeRoom?.state?.strokes, activeRoom?.id]);

  const getNormPoint = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [
      (e.clientX - rect.left) / rect.width,
      (e.clientY - rect.top) / rect.height,
    ];
  };

  const isDrawer = activeRoom?.state?.drawerId === userId;

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const pt = getNormPoint(e);
    currentStrokeRef.current = {
      color,
      width: color === '#ffffff' ? 16 : 4,
      points: [pt],
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer || !currentStrokeRef.current || !canvasRef.current) return;
    const pt = getNormPoint(e);
    const stroke = currentStrokeRef.current;
    const prevPt = stroke.points[stroke.points.length - 1];
    stroke.points.push(pt);

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(prevPt[0] * canvasRef.current.width, prevPt[1] * canvasRef.current.height);
      ctx.lineTo(pt[0] * canvasRef.current.width, pt[1] * canvasRef.current.height);
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentStrokeRef.current || !activeRoom) return;
    setIsDrawing(false);
    const finished = currentStrokeRef.current;
    currentStrokeRef.current = null;
    if (finished.points.length < 2) return;

    const nextStrokes = [...(activeRoom.state.strokes || []), finished].slice(-80);
    syncState({ ...activeRoom.state, strokes: nextStrokes });
  };

  const handleClearCanvas = () => {
    if (!isDrawer || !activeRoom) return;
    syncState({ ...activeRoom.state, strokes: [] });
  };

  const handleSkipWord = () => {
    if (!isDrawer || !activeRoom) return;
    syncState({
      ...activeRoom.state,
      word: pickWord(activeRoom.state.word),
      strokes: [],
    });
  };

  const handleSubmitGuess = () => {
    if (!guess.trim() || !activeRoom || !userId || isDrawer) return;
    const clean = guess.trim();
    setGuess('');
    const target = (activeRoom.state.word || '').toUpperCase();
    const isCorrect = clean.toUpperCase() === target;

    const nextGuesses = [
      ...(activeRoom.state.guesses || []),
      { userId, text: isCorrect ? `🎉 Guessed "${target}"!` : clean, correct: isCorrect },
    ].slice(-20);

    if (isCorrect) {
      recordWin(userId);
      const nextScores = { ...(activeRoom.state.scores || {}) };
      nextScores[userId] = (nextScores[userId] || 0) + 1;
      syncState({
        ...activeRoom.state,
        drawerId: userId, // Winner becomes the next drawer!
        word: pickWord(target),
        strokes: [],
        guesses: nextGuesses,
        scores: nextScores,
        lastWinner: `${getName(userId)} guessed "${target}"!`,
      });
    } else {
      syncState({ ...activeRoom.state, guesses: nextGuesses });
    }
  };

  // LOBBY
  if (!activeRoom) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900">🎨 Draw & Guess</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sketch a secret word live while the family races to guess it.
            </p>
          </div>
          <button
            type="button"
            onClick={createRoom}
            className="bg-[#ff4d00] hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} /> New Room
          </button>
        </div>

        <div className="space-y-2">
          {rooms.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200/70">
              <p className="text-xs text-slate-400 font-medium">
                No active drawing rooms. Tap "New Room" to start!
              </p>
            </div>
          ) : (
            rooms.map((r) => (
              <div
                key={r.id}
                className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    🎨 {getName(r.state?.drawerId)} is drawing
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                    <Users size={10} /> {(r.players || []).length} in room
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => joinRoom(r)}
                    className="text-xs font-bold px-4 py-1.5 rounded-full bg-[#1C1C2E] text-white"
                  >
                    Join
                  </button>
                  {r.host_id === userId && (
                    <button
                      type="button"
                      onClick={() => deleteRoom(r.id)}
                      className="p-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const word: string = activeRoom.state?.word || '';
  const maskedWord = word.replace(/[A-Z]/g, '_ ');

  return (
    <div className="space-y-3 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setActiveRoom(null)}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1"
        >
          <ArrowLeft size={13} /> Rooms
        </button>

        <div className="bg-[#1C1C2E] text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest">
          {isDrawer ? `DRAW: ${word}` : maskedWord}
        </div>
      </div>

      {activeRoom.state?.lastWinner && (
        <div className="text-center text-[11px] font-bold text-amber-700 bg-amber-500/15 border border-amber-500/25 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5">
          <Trophy size={12} /> {activeRoom.state.lastWinner}
        </div>
      )}

      {/* Live Drawing Canvas */}
      <div className="rounded-[24px] overflow-hidden border-2 border-slate-200 bg-white shadow-lg">
        <canvas
          ref={canvasRef}
          width={520}
          height={340}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-full h-[260px] sm:h-[310px] block touch-none ${
            isDrawer ? 'cursor-crosshair' : 'cursor-default'
          }`}
        />
      </div>

      {/* Drawer Tools OR Guesser Input */}
      {isDrawer ? (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1.5">
            <Palette size={14} className="text-slate-400 mr-0.5" />
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? 'scale-115 border-[#ff4d00]' : 'border-slate-300'
                }`}
                style={{ backgroundColor: c }}
                title={c === '#ffffff' ? 'Eraser' : c}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearCanvas}
              className="text-[11px] font-bold bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-slate-700"
            >
              <Eraser size={12} /> Clear
            </button>
            <button
              type="button"
              onClick={handleSkipWord}
              className="text-[11px] font-bold bg-[#1C1C2E] text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1"
            >
              <RefreshCw size={12} /> New Word
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Guess what ${getName(activeRoom.state?.drawerId)} is drawing...`}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitGuess()}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
          />
          <button
            type="button"
            onClick={handleSubmitGuess}
            disabled={!guess.trim()}
            className="bg-[#ff4d00] hover:bg-orange-600 text-white p-2.5 rounded-full disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      )}

      {/* Live Guesses Feed */}
      <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 max-h-32 overflow-y-auto space-y-1">
        {(activeRoom.state?.guesses || []).length === 0 ? (
          <p className="text-[11px] text-slate-400 text-center">Guesses will appear here live.</p>
        ) : (
          [...(activeRoom.state?.guesses || [])].reverse().map((g: any, idx: number) => (
            <p
              key={idx}
              className={`text-xs ${g.correct ? 'font-black text-emerald-600' : 'text-slate-700'}`}
            >
              <strong>{getName(g.userId)}:</strong> {g.text}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
