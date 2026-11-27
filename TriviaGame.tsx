import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Plus, ArrowLeft, Trophy, Trash2, Users, CheckCircle2 } from 'lucide-react';

interface TriviaGameProps {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
}

const QUESTIONS = [
  { q: 'Who built the ark to survive the great flood?', options: ['Moses', 'Noah', 'Abraham', 'David'], a: 1, cat: 'Bible' },
  { q: 'How many books are in the New Testament?', options: ['24', '27', '39', '66'], a: 1, cat: 'Bible' },
  { q: 'Which giant did David defeat with a sling and a stone?', options: ['Samson', 'Goliath', 'Saul', 'Pharaoh'], a: 1, cat: 'Bible' },
  { q: 'Where was Jesus born?', options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Galilee'], a: 2, cat: 'Bible' },
  { q: 'Who was swallowed by a great fish?', options: ['Jonah', 'Peter', 'Elijah', 'Daniel'], a: 0, cat: 'Bible' },
  { q: 'What is the longest river in the world?', options: ['Amazon', 'Mississippi', 'Nile', 'Yangtze'], a: 2, cat: 'World' },
  { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], a: 1, cat: 'Science' },
  { q: 'How many players are on a basketball court per team?', options: ['5', '6', '7', '11'], a: 0, cat: 'Sports' },
  { q: 'What is the capital of Texas?', options: ['Dallas', 'Houston', 'Austin', 'San Antonio'], a: 2, cat: 'USA' },
  { q: 'Which fruit is known as the "King of Fruits"?', options: ['Mango', 'Apple', 'Pineapple', 'Banana'], a: 0, cat: 'Fun' },
  { q: 'Who was thrown into the lions’ den?', options: ['Joseph', 'Daniel', 'Paul', 'Joshua'], a: 1, cat: 'Bible' },
  { q: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Quartz'], a: 2, cat: 'Science' },
];

function pickQuizIndices() {
  return [...QUESTIONS.keys()].sort(() => Math.random() - 0.5).slice(0, 8);
}

export default function TriviaGame({ supabase, userId, familyMembers }: TriviaGameProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const activeRoomRef = useRef<any | null>(null);
  activeRoomRef.current = activeRoom;

  const getName = (id?: string | null) => {
    const m = familyMembers.find((f) => f.id === id);
    return m ? `${m.first_name || 'Family'}` : 'Family';
  };

  const recordWin = async (winnerId: string | null) => {
    if (!supabase || !winnerId) return;
    await supabase.rpc('increment_game_win', { p_user_id: winnerId, p_game_type: 'trivia' });
  };

  const fetchRooms = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('arcade_games')
      .select('*')
      .eq('game_type', 'trivia')
      .order('updated_at', { ascending: false })
      .limit(10);
    if (data) {
      setRooms(data);
      if (activeRoomRef.current && !activeRoomRef.current.isSolo) {
        const updated = data.find((r: any) => r.id === activeRoomRef.current.id);
        if (updated) setActiveRoom(updated);
      }
    }
  };

  useEffect(() => {
    fetchRooms();
    if (!supabase) return;
    const ch = supabase
      .channel('arcade-trivia-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_games', filter: 'game_type=eq.trivia' },
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

  const startSolo = () => {
    setPickedOption(null);
    setActiveRoom({
      id: `trivia-solo-${Date.now()}`,
      isSolo: true,
      host_id: userId,
      players: [userId],
      status: 'active',
      state: { qIndices: pickQuizIndices(), step: 0, scores: { [userId || 'me']: 0 }, answered: {} },
    });
  };

  const createLiveRoom = async () => {
    if (!supabase || !userId) return;
    const { data, error } = await supabase
      .from('arcade_games')
      .insert([
        {
          game_type: 'trivia',
          host_id: userId,
          players: [userId],
          status: 'active',
          state: { qIndices: pickQuizIndices(), step: 0, scores: { [userId]: 0 }, answered: {} },
        },
      ])
      .select()
      .single();
    if (error) {
      alert('Error creating Trivia room: ' + error.message);
      return;
    }
    setPickedOption(null);
    setActiveRoom(data);
  };

  const joinRoom = async (room: any) => {
    if (!supabase || !userId) return;
    setPickedOption(null);
    const players: string[] = room.players || [];
    if (!players.includes(userId)) {
      const nextScores = { ...(room.state?.scores || {}), [userId]: 0 };
      const { data } = await supabase
        .from('arcade_games')
        .update({
          players: [...players, userId],
          state: { ...room.state, scores: nextScores },
          updated_at: new Date().toISOString(),
        })
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
    if (!supabase || !confirm('Remove this Trivia room?')) return;
    await supabase.from('arcade_games').delete().eq('id', id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    if (activeRoom?.id === id) setActiveRoom(null);
  };

  const handleAnswer = async (optIdx: number) => {
    if (!activeRoom || !userId || pickedOption !== null) return;
    const step = activeRoom.state.step;
    const q = QUESTIONS[activeRoom.state.qIndices[step]];
    const isCorrect = optIdx === q.a;
    setPickedOption(optIdx);

    const nextScores = { ...(activeRoom.state.scores || {}) };
    if (isCorrect) nextScores[userId] = (nextScores[userId] || 0) + 1;

    const nextAnswered = { ...(activeRoom.state.answered || {}), [`${step}-${userId}`]: optIdx };
    const nextState = { ...activeRoom.state, scores: nextScores, answered: nextAnswered };

    if (activeRoom.isSolo) {
      setTimeout(() => {
        const nextStep = step + 1;
        const done = nextStep >= activeRoom.state.qIndices.length;
        if (done && nextScores[userId] >= 6) recordWin(userId);
        setPickedOption(null);
        setActiveRoom((prev: any) => ({
          ...prev,
          status: done ? 'finished' : 'active',
          state: { ...nextState, step: done ? step : nextStep },
        }));
      }, 850);
    } else if (supabase) {
      setActiveRoom((prev: any) => ({ ...prev, state: nextState }));
      await supabase
        .from('arcade_games')
        .update({ state: nextState, updated_at: new Date().toISOString() })
        .eq('id', activeRoom.id);
    }
  };

  const handleNextQuestion = async () => {
    if (!activeRoom || !supabase) return;
    const nextStep = activeRoom.state.step + 1;
    const done = nextStep >= activeRoom.state.qIndices.length;
    let winnerId: string | null = null;
    if (done) {
      const entries = Object.entries(activeRoom.state.scores || {}) as [string, number][];
      entries.sort((a, b) => b[1] - a[1]);
      winnerId = entries[0]?.[0] || null;
      if (winnerId) recordWin(winnerId);
    }
    setPickedOption(null);
    const nextState = { ...activeRoom.state, step: done ? activeRoom.state.step : nextStep };
    await supabase
      .from('arcade_games')
      .update({
        status: done ? 'finished' : 'active',
        winner_id: winnerId,
        state: nextState,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activeRoom.id);
  };

  // LOBBY
  if (!activeRoom) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">🧠 Family & Bible Trivia</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Play an 8-question solo challenge or host a live family quiz room.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startSolo}
            className="p-4 rounded-2xl bg-[#1C1C2E] hover:bg-slate-800 text-white text-left flex items-center gap-3.5 shadow-md"
          >
            <span className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="text-sm font-black">Solo Challenge</p>
              <p className="text-[11px] text-white/65">Score 6/8+ to earn a Win</p>
            </div>
          </button>

          <button
            type="button"
            onClick={createLiveRoom}
            className="p-4 rounded-2xl bg-[#ff4d00] hover:bg-orange-600 text-white text-left flex items-center gap-3.5 shadow-md"
          >
            <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <Plus size={20} />
            </span>
            <div>
              <p className="text-sm font-black">Host Live Room</p>
              <p className="text-[11px] text-white/85">Play together with the family</p>
            </div>
          </button>
        </div>

        <div className="space-y-2">
          {rooms.map((r) => (
            <div key={r.id} className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  🧠 {getName(r.host_id)}'s Trivia Room
                </p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                  <Users size={10} /> {(r.players || []).length} players • Q{(r.state?.step || 0) + 1}/8
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => joinRoom(r)}
                  className="text-xs font-bold px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800"
                >
                  {r.status === 'finished' ? 'Results' : 'Join'}
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
          ))}
        </div>
      </div>
    );
  }

  const step = activeRoom.state.step;
  const q = QUESTIONS[activeRoom.state.qIndices[step]];
  const alreadyAnswered = activeRoom.state.answered?.[`${step}-${userId}`] !== undefined;
  const myChoice = pickedOption ?? activeRoom.state.answered?.[`${step}-${userId}`] ?? null;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveRoom(null)}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1"
        >
          <ArrowLeft size={13} /> Lobby
        </button>
        <span className="text-[11px] font-extrabold bg-amber-500/15 text-amber-800 px-3 py-1 rounded-full">
          Question {step + 1} / {activeRoom.state.qIndices.length} • {q.cat}
        </span>
      </div>

      {activeRoom.status === 'finished' ? (
        <div className="p-6 rounded-[28px] bg-[#1C1C2E] text-white text-center space-y-4">
          <Trophy size={36} className="text-amber-400 mx-auto" />
          <h3 className="text-2xl font-black">Trivia Complete!</h3>
          <div className="space-y-2 max-w-xs mx-auto">
            {(Object.entries(activeRoom.state.scores || {}) as [string, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([uid, pts], i) => (
                <div key={uid} className="flex justify-between items-center bg-white/10 px-4 py-2 rounded-xl text-xs font-bold">
                  <span>{i === 0 ? '🥇' : '•'} {getName(uid)}</span>
                  <span className="text-amber-400">{pts} / 8</span>
                </div>
              ))}
          </div>
          <button
            type="button"
            onClick={() => (activeRoom.isSolo ? startSolo() : setActiveRoom(null))}
            className="bg-[#ff4d00] text-white text-xs font-black uppercase px-6 py-2.5 rounded-full"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-5 rounded-[24px] bg-[#1C1C2E] text-white">
            <p className="text-base sm:text-lg font-black leading-snug">{q.q}</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {q.options.map((opt, idx) => {
              const showReveal = myChoice !== null;
              const isCorrect = idx === q.a;
              const isPicked = idx === myChoice;
              const style = showReveal
                ? isCorrect
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : isPicked
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200';
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={alreadyAnswered || pickedOption !== null}
                  onClick={() => handleAnswer(idx)}
                  className={`p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${style}`}
                >
                  <span>{opt}</span>
                  {showReveal && isCorrect && <CheckCircle2 size={16} />}
                </button>
              );
            })}
          </div>

          {!activeRoom.isSolo && activeRoom.host_id === userId && (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full py-2.5 rounded-xl bg-[#ff4d00] text-white text-xs font-black uppercase tracking-wider"
            >
              {step + 1 >= activeRoom.state.qIndices.length ? 'Finish & Show Winner' : 'Next Question →'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
