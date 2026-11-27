import React, { useState } from 'react';
import { Delete, CornerDownLeft, RotateCw, Share2, Trophy } from 'lucide-react';

interface WordleGameProps {
  supabase: any;
  userId: string | null;
}

const WORDS = [
  'GRACE', 'FAITH', 'PEACE', 'LIGHT', 'TRUST', 'HEART', 'BLESS', 'UNITY',
  'SMILE', 'LAUGH', 'HOUSE', 'DREAM', 'SHINE', 'CROWN', 'GLORY', 'MERCY',
  'TRUTH', 'POWER', 'SPARK', 'BRAVE', 'HAPPY', 'SWEET', 'MUSIC', 'DANCE',
  'FEAST', 'BREAD', 'STONE', 'RIVER', 'OCEAN', 'PLANT', 'BLOOM', 'FLAME',
  'CHEER', 'PRIDE', 'SOLID', 'NOBLE', 'PRIME', 'GRAND', 'ROYAL', 'FRESH',
];

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

function getDailyWord() {
  const days = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return WORDS[days % WORDS.length];
}

export default function WordleGame({ supabase, userId }: WordleGameProps) {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const [target, setTarget] = useState<string>(getDailyWord);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const recordWin = async () => {
    if (!supabase || !userId) return;
    await supabase.rpc('increment_game_win', {
      p_user_id: userId,
      p_game_type: 'wordle',
    });
  };

  const getTileColor = (letter: string, idx: number) => {
    if (target[idx] === letter) return 'bg-emerald-500 border-emerald-500 text-white';
    if (target.includes(letter)) return 'bg-amber-500 border-amber-500 text-white';
    return 'bg-slate-700 border-slate-700 text-white';
  };

  const handleKey = (key: string) => {
    if (status !== 'playing') return;
    if (key === 'DEL') {
      setCurrent((c) => c.slice(0, -1));
      return;
    }
    if (key === 'ENTER') {
      if (current.length !== 5) return;
      const nextGuesses = [...guesses, current];
      setGuesses(nextGuesses);
      setCurrent('');
      if (current === target) {
        setStatus('won');
        recordWin();
      } else if (nextGuesses.length >= 6) {
        setStatus('lost');
      }
      return;
    }
    if (current.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrent((c) => c + key);
    }
  };

  const startPractice = () => {
    setMode('practice');
    setTarget(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses([]);
    setCurrent('');
    setStatus('playing');
  };

  const shareResult = async () => {
    const grid = guesses
      .map((g) =>
        g
          .split('')
          .map((ch, i) => (target[i] === ch ? '🟩' : target.includes(ch) ? '🟨' : '⬛'))
          .join('')
      )
      .join('\n');
    const text = `Millerites Wordle (${mode === 'daily' ? 'Daily' : 'Practice'}) ${
      status === 'won' ? `${guesses.length}/6` : 'X/6'
    }\n${grid}`;
    try {
      await navigator.clipboard.writeText(text);
      alert('Result copied! Paste it in the Family Feed or DMs.');
    } catch {
      alert(text);
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">🟩 Millerites Wordle</h2>
          <p className="text-xs text-slate-500">
            {mode === 'daily' ? 'Same 5-letter word for the whole family today!' : 'Practice Mode'}
          </p>
        </div>
        <button
          type="button"
          onClick={startPractice}
          className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full flex items-center gap-1"
        >
          <RotateCw size={12} /> New Word
        </button>
      </div>

      {/* 6x5 Board */}
      <div className="grid grid-rows-6 gap-1.5 max-w-[290px] mx-auto">
        {Array.from({ length: 6 }, (_, r) => {
          const word = r < guesses.length ? guesses[r] : r === guesses.length ? current : '';
          const isSubmitted = r < guesses.length;
          return (
            <div key={r} className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 5 }, (_, c) => {
                const ch = word[c] || '';
                const style = isSubmitted
                  ? getTileColor(ch, c)
                  : ch
                  ? 'bg-white border-slate-400 text-slate-900'
                  : 'bg-slate-100 border-slate-200 text-slate-900';
                return (
                  <div
                    key={c}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center text-lg font-black transition-all ${style}`}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Win / Loss Banner */}
      {status !== 'playing' && (
        <div className="p-4 rounded-2xl bg-[#1C1C2E] text-white text-center space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 font-black text-sm">
            <Trophy size={16} />
            {status === 'won' ? `You got it in ${guesses.length}/6!` : `The word was ${target}`}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={shareResult}
              className="bg-[#ff4d00] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1"
            >
              <Share2 size={13} /> Copy Result
            </button>
            <button
              type="button"
              onClick={startPractice}
              className="bg-white/15 text-white text-xs font-bold px-4 py-2 rounded-full"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* On-Screen Keyboard */}
      <div className="space-y-1.5 pt-1">
        {KEY_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKey(k)}
                className={`h-11 rounded-lg font-extrabold text-xs flex items-center justify-center transition-all active:scale-95 ${
                  k === 'ENTER' || k === 'DEL'
                    ? 'px-2.5 bg-[#1C1C2E] text-white'
                    : 'flex-1 max-w-[34px] bg-slate-200 hover:bg-slate-300 text-slate-900'
                }`}
              >
                {k === 'DEL' ? <Delete size={15} /> : k === 'ENTER' ? <CornerDownLeft size={15} /> : k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
