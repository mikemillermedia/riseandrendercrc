import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Crown, Flame, Users, Play, Plus, Sparkles, Share2,
  Trophy, Clock, CheckCircle2, XCircle, Zap, Copy, Check, Trash2, Gavel
} from 'lucide-react';

interface BCRCard {
  id: string;
  category: string;
  card_type: 'correct' | 'majority';
  question: string;
  options: [string, string, string, string];
  correct_index?: number | null;
  is_custom?: boolean;
  user_id?: string;
}

interface BCRPlayer {
  id: string;
  name: string;
  avatar_url?: string;
  points: number;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  label: string;
  sender: string;
  left: number;
}

const BUILTIN_DECK: BCRCard[] = [
  // CORRECT ANSWER CARDS
  {
    id: 'c1',
    category: '90s/2000s TV & Movies',
    card_type: 'correct',
    question: 'In "Friday," what did Smokey say Craig got fired on his day off for stealing?',
    options: ['Boxes', 'Bicycles', 'CDs', 'Paper towels'],
    correct_index: 0,
  },
  {
    id: 'c2',
    category: 'Music',
    card_type: 'correct',
    question: 'Complete the Kirk Franklin classic: "If you want to be happy for the rest of your life..." — wait, which group sang "Stomp" with Kirk Franklin?',
    options: ['God\'s Property', 'The Family', '1 Nation Crew', 'Commissioned'],
    correct_index: 0,
  },
  {
    id: 'c3',
    category: '90s/2000s TV & Movies',
    card_type: 'correct',
    question: 'On "Martin," what was Tommy\'s job?',
    options: ['He worked at the Boys & Girls Club', 'Nobody really knew', 'Auto mechanic', 'Radio producer'],
    correct_index: 1,
  },
  {
    id: 'c4',
    category: 'Music',
    card_type: 'correct',
    question: 'Which legendary song plays the second everybody lines up at the family reunion?',
    options: ['Before I Let Go', 'Electric Slide', 'Swag Surfin', 'Wobble'],
    correct_index: 0,
  },
  {
    id: 'c5',
    category: '90s/2000s TV & Movies',
    card_type: 'correct',
    question: 'In "The Fresh Prince of Bel-Air," what is Uncle Phil\'s actual first name?',
    options: ['Philip', 'Philemon', 'Phineas', 'Phyllis'],
    correct_index: 0,
  },
  {
    id: 'c6',
    category: 'Church & Sunday Dinner',
    card_type: 'correct',
    question: 'In the Bible, how many smooth stones did David pick up from the stream before facing Goliath?',
    options: ['One', 'Three', 'Five', 'Seven'],
    correct_index: 2,
  },
  {
    id: 'c7',
    category: 'Growing Up',
    card_type: 'correct',
    question: 'If you opened a blue Royal Dansk butter cookie tin at Grandma\'s house, what was actually inside?',
    options: ['Butter cookies', 'Sewing kit', 'Spare batteries', 'Church fans'],
    correct_index: 1,
  },
  {
    id: 'c8',
    category: '90s/2000s TV & Movies',
    card_type: 'correct',
    question: 'In "Coming to America," what is the name of the fast food restaurant where Akeem works?',
    options: ['McDowell\'s', 'McDaniel\'s', 'Zamunda Burger', 'King\'s Grill'],
    correct_index: 0,
  },
  {
    id: 'c9',
    category: 'Music',
    card_type: 'correct',
    question: 'Who sang the iconic 1995 R&B hit "Candy Rain"?',
    options: ['Soul for Real', 'Jodeci', 'Boyz II Men', '112'],
    correct_index: 0,
  },
  {
    id: 'c10',
    category: 'Church & Sunday Dinner',
    card_type: 'correct',
    question: 'Which gospel artist famously shouted "I almost let go!"?',
    options: ['Kurt Carr', 'Fred Hammond', 'Donnie McClurkin', 'Hezekiah Walker'],
    correct_index: 0,
  },

  // MAJORITY RULES CARDS
  {
    id: 'm1',
    category: 'Food & Cookout',
    card_type: 'majority',
    question: 'What is the #1 dish that instantly determines if the cookout was a success?',
    options: ['Baked Mac & Cheese', 'Ribs / Brisket', 'Potato Salad', 'Banana Pudding'],
  },
  {
    id: 'm2',
    category: 'Growing Up',
    card_type: 'majority',
    question: 'What was the scariest sentence to hear from your parents growing up?',
    options: [
      '"We got food at the house"',
      '"Don\'t touch nothing in this store"',
      '"I\'m not one of your little friends"',
      '"Wait till we get in the car"',
    ],
  },
  {
    id: 'm3',
    category: 'Church & Sunday Dinner',
    card_type: 'majority',
    question: 'When the pastor says "I\'m about to close," how much time is actually left?',
    options: ['5 minutes', '15 minutes', '30+ minutes', 'He\'s just getting warmed up'],
  },
  {
    id: 'm4',
    category: 'Food & Cookout',
    card_type: 'majority',
    question: 'Sugar on grits: acceptable or instant card revocation?',
    options: ['Sugar & butter only', 'Cheese & salt only', 'Both are valid', 'No grits at all'],
  },
  {
    id: 'm5',
    category: 'Growing Up',
    card_type: 'majority',
    question: 'Which Saturday morning chore meant you weren\'t going outside anytime soon?',
    options: [
      'Waking up to gospel music blasting',
      'Smelling Pine-Sol & bleach at 7 AM',
      '"Take that chicken out the freezer"',
      'Ironing church clothes',
    ],
  },
  {
    id: 'm6',
    category: 'Food & Cookout',
    card_type: 'majority',
    question: 'Which side dish MUST NOT touch the other food on your plate?',
    options: ['Yams', 'Greens juice', 'Potato salad', 'Mac & cheese'],
  },
  {
    id: 'm7',
    category: '90s/2000s TV & Movies',
    card_type: 'majority',
    question: 'Greatest Black sitcom of all time?',
    options: ['Martin', 'The Fresh Prince of Bel-Air', 'Living Single', 'The Cosby Show'],
  },
  {
    id: 'm8',
    category: 'Church & Sunday Dinner',
    card_type: 'majority',
    question: 'Which candy was guaranteed to be in Grandma\'s church purse?',
    options: ['Peppermints', 'Butterscotch', 'Strawberry bon bons', 'Life Savers'],
  },
  {
    id: 'm9',
    category: 'Growing Up',
    card_type: 'majority',
    question: 'How long does it actually take to leave a family gathering after saying "Alright, we\'re heading out"?',
    options: ['10 minutes', '30 minutes', '1 full hour', 'You end up eating a second plate'],
  },
  {
    id: 'm10',
    category: 'Music',
    card_type: 'majority',
    question: 'Best cookout / road trip sing-along anthem?',
    options: [
      'Before I Let Go — Maze',
      'Outstanding — The Gap Band',
      'Return of the Mack — Mark Morrison',
      'Never Too Much — Luther Vandross',
    ],
  },
];

const DEBATE_REACTIONS = [
  { emoji: '🧢', label: 'Cap!' },
  { emoji: '😂', label: 'LOL' },
  { emoji: '👀', label: 'Sus' },
  { emoji: '🔥', label: 'Facts' },
  { emoji: '🙏🏾', label: 'Pray' },
];

const LETTERS = ['A', 'B', 'C', 'D'];
const ROUND_SECONDS = 12;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

interface Props {
  supabase: any;
  userId: string | null;
  familyMembers: any[];
  onBack: () => void;
}

export default function BlackCardRevoked({ supabase, userId, familyMembers, onBack }: Props) {
  const [view, setView] = useState<'menu' | 'multiplayer' | 'solo' | 'custom_deck'>('menu');

  // Custom Cards & Open Rooms & Solo Leaderboard
  const [customCards, setCustomCards] = useState<BCRCard[]>([]);
  const [openRooms, setOpenRooms] = useState<any[]>([]);
  const [soloLeaderboard, setSoloLeaderboard] = useState<any[]>([]);

  // Multiplayer Room State
  const [room, setRoom] = useState<any | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [deckFilter, setDeckFilter] = useState<'all' | 'classic' | 'family'>('all');
  const [startingPoints, setStartingPoints] = useState<number>(10);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_SECONDS);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [isSharingFeed, setIsSharingFeed] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);
  const channelRef = useRef<any>(null);

  // Solo Mode State
  const [soloDeck, setSoloDeck] = useState<BCRCard[]>([]);
  const [soloIndex, setSoloIndex] = useState(0);
  const [soloPoints, setSoloPoints] = useState(5);
  const [soloCorrectCount, setSoloCorrectCount] = useState(0);
  const [soloPicked, setSoloPicked] = useState<number | null>(null);
  const [soloFinished, setSoloFinished] = useState(false);

  // Custom Card Form State
  const [newCardType, setNewCardType] = useState<'majority' | 'correct'>('majority');
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [newCorrectIdx, setNewCorrectIdx] = useState<number>(0);
  const [isSavingCard, setIsSavingCard] = useState(false);

  const currentUser = familyMembers.find(m => m.id === userId) || {
    id: userId || 'guest',
    first_name: 'Millerite',
    last_name: '',
    avatar_url: '',
  };

  const myDisplayName = `${currentUser.first_name || 'Millerite'}`.trim();

  // Fetch custom cards, active lobby rooms, and solo leaderboard
  const loadHubData = async () => {
    if (!supabase) return;
    const [cardsRes, roomsRes, scoresRes] = await Promise.all([
      supabase.from('bcr_custom_cards').select('*').order('created_at', { ascending: false }),
      supabase
        .from('bcr_rooms')
        .select('*')
        .in('status', ['lobby', 'playing'])
        .order('created_at', { ascending: false })
        .limit(8),
      supabase.from('bcr_solo_scores').select('*').order('best_score', { ascending: false }).limit(10),
    ]);

    if (cardsRes.data) {
      setCustomCards(
        cardsRes.data.map((c: any) => ({
          id: c.id,
          category: c.category || 'Miller Family',
          card_type: c.card_type,
          question: c.question,
          options: c.options,
          correct_index: c.correct_index,
          is_custom: true,
          user_id: c.user_id,
        }))
      );
    }
    if (roomsRes.data) setOpenRooms(roomsRes.data);
    if (scoresRes.data) setSoloLeaderboard(scoresRes.data);
  };

  useEffect(() => {
    loadHubData();
  }, [supabase]);

  // Subscribe to Realtime updates & Broadcast reactions for active room
  useEffect(() => {
    if (!supabase || !room?.id) return;

    const channel = supabase
      .channel(`bcr-room-${room.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bcr_rooms', filter: `id=eq.${room.id}` },
        (payload: any) => {
          if (payload.new) {
            setRoom(payload.new);
          }
        }
      )
      .on('broadcast', { event: 'reaction' }, ({ payload }: any) => {
        const id = `${Date.now()}-${Math.random()}`;
        setFloatingReactions(prev => [
          ...prev,
          {
            id,
            emoji: payload.emoji,
            label: payload.label,
            sender: payload.sender,
            left: 12 + Math.random() * 72,
          },
        ]);
        setTimeout(() => {
          setFloatingReactions(prev => prev.filter(r => r.id !== id));
        }, 2400);
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [supabase, room?.id]);

  // Countdown timer during 'playing' phase
  useEffect(() => {
    if (!room || room.status !== 'playing' || !room.round_started_at) {
      setTimeLeft(ROUND_SECONDS);
      return;
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - new Date(room.round_started_at).getTime()) / 1000);
      const remaining = Math.max(0, ROUND_SECONDS - elapsed);
      setTimeLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 300);
    return () => clearInterval(interval);
  }, [room?.status, room?.round_started_at, room?.current_round]);

  // Auto-resolve round on host's device when timer hits 0 or everyone answered
  useEffect(() => {
    if (!room || room.status !== 'playing' || room.host_id !== userId) return;
    const players: BCRPlayer[] = room.players || [];
    const answers: Record<string, number> = room.answers || {};
    const allAnswered = players.length > 0 && players.every(p => answers[p.id] !== undefined);

    if (allAnswered || timeLeft === 0) {
      resolveRound(room);
    }
  }, [timeLeft, room?.answers, room?.status]);

  // --- MULTIPLAYER ACTIONS ---
  const buildDeck = (): BCRCard[] => {
    let pool: BCRCard[] = [];
    if (deckFilter === 'classic') pool = [...BUILTIN_DECK];
    else if (deckFilter === 'family') pool = customCards.length > 0 ? [...customCards] : [...BUILTIN_DECK];
    else pool = [...customCards, ...BUILTIN_DECK];
    return shuffle(pool);
  };

  const handleCreateRoom = async () => {
    if (!supabase || !userId) return;
    const code = generateRoomCode();
    const initialPlayers: BCRPlayer[] = [
      {
        id: userId,
        name: myDisplayName,
        avatar_url: currentUser.avatar_url || '',
        points: startingPoints,
      },
    ];
    const deck = buildDeck();

    const { data, error } = await supabase
      .from('bcr_rooms')
      .insert([
        {
          code,
          host_id: userId,
          status: 'lobby',
          deck_filter: deckFilter,
          starting_points: startingPoints,
          current_round: 0,
          deck,
          players: initialPlayers,
          answers: {},
        },
      ])
      .select()
      .single();

    if (error) {
      alert('Could not create room: ' + error.message);
      return;
    }
    setSharedSuccess(false);
    setRoom(data);
    setView('multiplayer');
  };

  const handleJoinRoom = async (codeOverride?: string) => {
    const code = (codeOverride || joinCode).trim().toUpperCase();
    if (!code || !supabase || !userId) return;

    const { data: existing, error } = await supabase
      .from('bcr_rooms')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !existing) {
      alert('Room not found. Double-check the 4-letter code.');
      return;
    }

    const players: BCRPlayer[] = existing.players || [];
    const alreadyIn = players.some(p => p.id === userId);
    let updatedPlayers = players;

    if (!alreadyIn) {
      updatedPlayers = [
        ...players,
        {
          id: userId,
          name: myDisplayName,
          avatar_url: currentUser.avatar_url || '',
          points: existing.starting_points || 10,
        },
      ];
      await supabase.from('bcr_rooms').update({ players: updatedPlayers }).eq('id', existing.id);
    }

    setSharedSuccess(false);
    setRoom({ ...existing, players: updatedPlayers });
    setView('multiplayer');
  };

  const handleStartGame = async () => {
    if (!room || !supabase) return;
    await supabase
      .from('bcr_rooms')
      .update({
        status: 'playing',
        current_round: 0,
        answers: {},
        last_round_result: null,
        round_started_at: new Date().toISOString(),
      })
      .eq('id', room.id);
  };

  const handleSubmitAnswer = async (optionIdx: number) => {
    if (!room || !supabase || !userId || room.status !== 'playing') return;
    if (room.answers?.[userId] !== undefined) return;

    // Fetch latest answers first to avoid overwriting another player's simultaneous tap
    const { data: fresh } = await supabase
      .from('bcr_rooms')
      .select('answers')
      .eq('id', room.id)
      .single();

    const mergedAnswers = { ...(fresh?.answers || {}), [userId]: optionIdx };
    await supabase.from('bcr_rooms').update({ answers: mergedAnswers }).eq('id', room.id);
  };

  const resolveRound = async (currentRoom: any, tieBreakWinner?: number) => {
    if (!supabase) return;
    const card: BCRCard = currentRoom.deck[currentRoom.current_round];
    const players: BCRPlayer[] = currentRoom.players || [];
    const answers: Record<string, number> = currentRoom.answers || {};

    let winningIndex: number | null = null;
    const counts = [0, 0, 0, 0];
    Object.values(answers).forEach((idx: any) => {
      if (typeof idx === 'number' && idx >= 0 && idx < 4) counts[idx]++;
    });

    if (card.card_type === 'correct') {
      winningIndex = card.correct_index ?? 0;
    } else if (tieBreakWinner !== undefined) {
      winningIndex = tieBreakWinner;
    } else {
      const maxVotes = Math.max(...counts);
      if (maxVotes === 0) {
        winningIndex = -1; // Nobody answered
      } else {
        const leaders = counts
          .map((c, idx) => (c === maxVotes ? idx : -1))
          .filter(idx => idx !== -1);

        if (leaders.length > 1) {
          // Tie! Trigger Host Tie-Breaker modal
          await supabase
            .from('bcr_rooms')
            .update({
              status: 'tiebreaker',
              last_round_result: { tiedOptions: leaders, counts },
            })
            .eq('id', currentRoom.id);
          return;
        }
        winningIndex = leaders[0];
      }
    }

    const losers: string[] = [];
    const updatedPlayers = players.map(p => {
      const pick = answers[p.id];
      const isCorrect = winningIndex !== -1 && pick === winningIndex;
      if (!isCorrect) {
        losers.push(p.id);
        return { ...p, points: Math.max(0, p.points - 1) };
      }
      return p;
    });

    const someoneRevoked = updatedPlayers.some(p => p.points <= 0);
    const outOfCards = currentRoom.current_round + 1 >= currentRoom.deck.length;

    await supabase
      .from('bcr_rooms')
      .update({
        players: updatedPlayers,
        status: someoneRevoked || outOfCards ? 'finished' : 'reveal',
        last_round_result: {
          winningIndex,
          counts,
          losers,
          wasTieBreak: tieBreakWinner !== undefined,
        },
      })
      .eq('id', currentRoom.id);
  };

  const handleNextRound = async () => {
    if (!room || !supabase) return;
    await supabase
      .from('bcr_rooms')
      .update({
        status: 'playing',
        current_round: room.current_round + 1,
        answers: {},
        last_round_result: null,
        round_started_at: new Date().toISOString(),
      })
      .eq('id', room.id);
  };

  const handlePlayAgain = async () => {
    if (!room || !supabase) return;
    const resetPlayers = (room.players || []).map((p: BCRPlayer) => ({
      ...p,
      points: room.starting_points || 10,
    }));
    await supabase
      .from('bcr_rooms')
      .update({
        status: 'playing',
        current_round: 0,
        deck: buildDeck(),
        players: resetPlayers,
        answers: {},
        last_round_result: null,
        round_started_at: new Date().toISOString(),
      })
      .eq('id', room.id);
    setSharedSuccess(false);
  };

  const sendDebateReaction = (emoji: string, label: string) => {
    if (!channelRef.current) return;
    const payload = { emoji, label, sender: myDisplayName };
    channelRef.current.send({ type: 'broadcast', event: 'reaction', payload });
    // Also show locally immediately
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingReactions(prev => [
      ...prev,
      { id, emoji, label, sender: myDisplayName, left: 12 + Math.random() * 72 },
    ]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2400);
  };

  const handleShareToFeed = async () => {
    if (!supabase || !userId || !room) return;
    setIsSharingFeed(true);
    try {
      const sorted = [...(room.players || [])].sort((a: BCRPlayer, b: BCRPlayer) => b.points - a.points);
      const revoked = sorted.filter((p: BCRPlayer) => p.points <= 0);
      const winner = sorted[0];

      const lines = [
        `🃏 Black Card Revoked — Millerites Game Night!`,
        revoked.length > 0
          ? `🚫 REVOKED: ${revoked.map((p: BCRPlayer) => p.name).join(', ')}`
          : `🏆 Winner: ${winner?.name} (${winner?.points} pts)`,
        '',
        'Final Standings:',
        ...sorted.map((p: BCRPlayer, i: number) =>
          `${i === 0 ? '👑' : p.points <= 0 ? '🚫' : '•'} ${p.name}: ${p.points} pts`
        ),
      ];

      const { error } = await supabase
        .from('community_posts')
        .insert([{ user_id: userId, content: lines.join('\n'), media_url: '' }]);
      if (error) throw error;
      setSharedSuccess(true);
    } catch (err: any) {
      alert('Could not post to feed: ' + err.message);
    } finally {
      setIsSharingFeed(false);
    }
  };

  // --- SOLO MODE ACTIONS ---
  const startSoloGame = () => {
    const triviaPool = shuffle([
      ...customCards.filter(c => c.card_type === 'correct'),
      ...BUILTIN_DECK.filter(c => c.card_type === 'correct'),
    ]).slice(0, 5);
    setSoloDeck(triviaPool);
    setSoloIndex(0);
    setSoloPoints(5);
    setSoloCorrectCount(0);
    setSoloPicked(null);
    setSoloFinished(false);
    setView('solo');
  };

  const handleSoloPick = async (idx: number) => {
    if (soloPicked !== null) return;
    setSoloPicked(idx);
    const card = soloDeck[soloIndex];
    const isRight = idx === card.correct_index;
    const nextPoints = isRight ? soloPoints : Math.max(0, soloPoints - 1);
    const nextCorrect = isRight ? soloCorrectCount + 1 : soloCorrectCount;

    setSoloPoints(nextPoints);
    setSoloCorrectCount(nextCorrect);

    setTimeout(async () => {
      if (soloIndex + 1 >= soloDeck.length || nextPoints <= 0) {
        setSoloFinished(true);
        if (supabase && userId) {
          const existing = soloLeaderboard.find(s => s.user_id === userId);
          const survived = nextPoints > 0;
          await supabase.from('bcr_solo_scores').upsert(
            {
              user_id: userId,
              best_score: Math.max(existing?.best_score || 0, nextCorrect),
              current_streak: survived ? (existing?.current_streak || 0) + 1 : 0,
              games_played: (existing?.games_played || 0) + 1,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
          loadHubData();
        }
      } else {
        setSoloIndex(prev => prev + 1);
        setSoloPicked(null);
      }
    }, 1100);
  };

  // --- CUSTOM DECK ACTIONS ---
  const handleSaveCustomCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId || !newQuestion.trim() || newOptions.some(o => !o.trim())) return;
    setIsSavingCard(true);
    try {
      const { error } = await supabase.from('bcr_custom_cards').insert([
        {
          user_id: userId,
          category: 'Miller Family',
          card_type: newCardType,
          question: newQuestion.trim(),
          options: newOptions.map(o => o.trim()),
          correct_index: newCardType === 'correct' ? newCorrectIdx : null,
        },
      ]);
      if (error) throw error;
      setNewQuestion('');
      setNewOptions(['', '', '', '']);
      await loadHubData();
    } catch (err: any) {
      alert('Error saving card: ' + err.message);
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleDeleteCustomCard = async (id: string) => {
    if (!confirm('Delete this Miller Family card?')) return;
    await supabase.from('bcr_custom_cards').delete().eq('id', id);
    loadHubData();
  };

  // Reusable VIP Black Card Visual
  const renderVipCard = (player: BCRPlayer, maxPts: number, isHost = false) => {
    const isRevoked = player.points <= 0;
    return (
      <div
        key={player.id}
        className={`relative overflow-hidden rounded-2xl p-3.5 border transition-all ${
          isRevoked
            ? 'bg-zinc-950 border-red-500/60 opacity-85'
            : 'bg-gradient-to-br from-[#16161d] via-[#1f1f2b] to-[#0f0f14] border-amber-400/35 shadow-lg'
        }`}
      >
        <div className="absolute -right-6 -top-6 w-20 h-20 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 overflow-hidden flex items-center justify-center text-[10px] font-black text-amber-300 shrink-0">
              {player.avatar_url ? (
                <img src={player.avatar_url} className="w-full h-full object-cover" />
              ) : (
                player.name?.[0] || 'M'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white truncate flex items-center gap-1">
                {player.name}
                {isHost && <Crown size={11} className="text-amber-400 shrink-0" />}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400/80">
                VIP Card
              </p>
            </div>
          </div>
          <span className={`text-sm font-black ${isRevoked ? 'text-red-500' : 'text-amber-300'}`}>
            {player.points}
          </span>
        </div>

        {/* Golden Point Notches */}
        <div className="flex gap-1">
          {Array.from({ length: maxPts }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx < player.points ? 'bg-gradient-to-r from-amber-300 to-amber-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Giant Tilted REVOKED Stamp */}
        {isRevoked && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
            <span className="border-2 border-red-500 text-red-500 font-black uppercase tracking-widest text-xs px-3 py-1 rounded-md -rotate-12 bg-black/80 shadow-lg">
              REVOKED
            </span>
          </div>
        )}
      </div>
    );
  };

  // ==================== VIEW 1: MAIN MENU ====================
  if (view === 'menu') {
    return (
      <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300 relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-white/80 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft size={14} /> Back to Games
        </button>

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-[#14141c] via-[#1e1e2d] to-[#0d0d12] text-white rounded-[32px] p-6 sm:p-8 border border-amber-400/25 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <span className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            <Sparkles size={11} /> Millerites Game Night
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Black Card <span className="text-amber-400">Revoked</span>
          </h1>
          <p className="text-white/70 text-xs sm:text-sm max-w-xl leading-relaxed">
            Start with 10 points. Answer Correct Answer & Majority Rules culture cards before the clock runs out. Hit 0 and your card gets stamped <strong className="text-red-400">REVOKED</strong>.
          </p>
        </div>

        {/* Mode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Live Multiplayer Card */}
          <div className="bg-white/85 backdrop-blur-2xl border border-white rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[#1C1C2E] text-amber-400 flex items-center justify-center">
                <Users size={18} />
              </span>
              <div>
                <h2 className="text-base font-black text-slate-900">Live Family Room</h2>
                <p className="text-xs text-slate-500">Play together in real time on your phones</p>
              </div>
            </div>

            {/* Host Options */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Deck</label>
                <select
                  value={deckFilter}
                  onChange={(e) => setDeckFilter(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="all">All Cards ({BUILTIN_DECK.length + customCards.length})</option>
                  <option value="classic">Classic Only ({BUILTIN_DECK.length})</option>
                  <option value="family">Miller Family ({customCards.length})</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Card Points</label>
                <select
                  value={startingPoints}
                  onChange={(e) => setStartingPoints(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value={10}>10 pts (Classic)</option>
                  <option value={5}>5 pts (Quick)</option>
                  <option value={3}>3 pts (Sudden Death)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateRoom}
              className="w-full bg-[#1C1C2E] hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Play size={14} /> Host New Room
            </button>

            <div className="flex gap-2 pt-2 border-t border-slate-200/70">
              <input
                type="text"
                maxLength={4}
                placeholder="Enter 4-letter code..."
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-widest text-slate-900 placeholder:tracking-normal placeholder:font-medium"
              />
              <button
                type="button"
                onClick={() => handleJoinRoom()}
                disabled={joinCode.trim().length < 4}
                className="bg-[#ff4d00] hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-xs disabled:opacity-40 transition-colors"
              >
                Join
              </button>
            </div>

            {openRooms.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Active Family Rooms
                </p>
                {openRooms.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleJoinRoom(r.code)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200/70 text-left transition-colors"
                  >
                    <span className="text-xs font-black text-slate-900 tracking-wider">
                      Room {r.code}{' '}
                      <span className="text-[10px] font-semibold text-slate-500 tracking-normal">
                        • {(r.players || []).length} players
                      </span>
                    </span>
                    <span className="text-[10px] font-extrabold text-[#ff4d00] uppercase">Join →</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Solo Mode + Custom Deck Column */}
          <div className="space-y-5">
            <div className="bg-white/85 backdrop-blur-2xl border border-white rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-500/15 text-[#ff4d00] flex items-center justify-center">
                  <Zap size={18} />
                </span>
                <div>
                  <h2 className="text-base font-black text-slate-900">Solo Quick Challenge</h2>
                  <p className="text-xs text-slate-500">5 rapid-fire trivia cards & streak leaderboard</p>
                </div>
              </div>
              <button
                type="button"
                onClick={startSoloGame}
                className="w-full bg-[#ff4d00] hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Flame size={14} /> Play Solo (5 Cards)
              </button>

              {soloLeaderboard.length > 0 && (
                <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Trophy size={11} className="text-amber-500" /> Family Streak Leaders
                  </p>
                  {soloLeaderboard.slice(0, 4).map((row, idx) => {
                    const member = familyMembers.find(m => m.id === row.user_id);
                    return (
                      <div key={row.id} className="flex items-center justify-between text-xs py-1">
                        <span className="font-bold text-slate-800">
                          {idx + 1}. {member?.first_name || 'Millerite'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          Best {row.best_score}/5 • 🔥 {row.current_streak}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Miller Family Deck Card */}
            <div className="bg-white/85 backdrop-blur-2xl border border-white rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">Miller Family Custom Deck</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {customCards.length} inside-joke cards added by the family
                </p>
              </div>
              <button
                type="button"
                onClick={() => setView('custom_deck')}
                className="bg-[#1C1C2E] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0"
              >
                <Plus size={14} /> Add Cards
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== VIEW 2: CUSTOM MILLER FAMILY DECK ====================
  if (view === 'custom_deck') {
    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300 relative z-10">
        <button
          type="button"
          onClick={() => setView('menu')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-white/80 border border-slate-200/80 px-4 py-2 rounded-full"
        >
          <ArrowLeft size={14} /> Back to Black Card Revoked
        </button>

        <form
          onSubmit={handleSaveCustomCard}
          className="bg-white/85 backdrop-blur-2xl border border-white rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4"
        >
          <h2 className="text-lg font-black text-slate-900">Add a Miller Family Card</h2>

          <div className="flex gap-2">
            {(['majority', 'correct'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setNewCardType(type)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  newCardType === type
                    ? 'bg-[#1C1C2E] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'majority' ? 'Majority Rules (Opinion)' : 'Correct Answer (Trivia)'}
              </button>
            ))}
          </div>

          <textarea
            rows={2}
            required
            placeholder="e.g. Who is most likely to show up late to Thanksgiving dinner?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:bg-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {LETTERS.map((letter, idx) => (
              <div key={letter} className="flex items-center gap-2">
                {newCardType === 'correct' && (
                  <input
                    type="radio"
                    name="correctOption"
                    checked={newCorrectIdx === idx}
                    onChange={() => setNewCorrectIdx(idx)}
                    className="accent-[#ff4d00]"
                    title="Mark as correct answer"
                  />
                )}
                <input
                  type="text"
                  required
                  placeholder={`Option ${letter}`}
                  value={newOptions[idx]}
                  onChange={(e) => {
                    const copy = [...newOptions] as [string, string, string, string];
                    copy[idx] = e.target.value;
                    setNewOptions(copy);
                  }}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSavingCard}
            className="w-full bg-[#ff4d00] hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider disabled:opacity-40"
          >
            {isSavingCard ? 'Saving Card...' : 'Save to Miller Family Deck'}
          </button>
        </form>

        <div className="space-y-2.5">
          {customCards.map(card => (
            <div
              key={card.id}
              className="bg-white/85 border border-white rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff4d00]">
                  {card.card_type === 'majority' ? 'Majority Rules' : 'Correct Answer'}
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{card.question}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {card.options.map((o, i) => `${LETTERS[i]}: ${o}`).join('  •  ')}
                </p>
              </div>
              {card.user_id === userId && (
                <button
                  type="button"
                  onClick={() => handleDeleteCustomCard(card.id)}
                  className="text-slate-300 hover:text-red-500 p-1"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== VIEW 3: SOLO MODE ====================
  if (view === 'solo') {
    const card = soloDeck[soloIndex];
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-300 relative z-10">
        <button
          type="button"
          onClick={() => setView('menu')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-white/80 border border-slate-200/80 px-4 py-2 rounded-full"
        >
          <ArrowLeft size={14} /> Exit Solo
        </button>

        {renderVipCard(
          { id: userId || 'me', name: myDisplayName, avatar_url: currentUser.avatar_url, points: soloPoints },
          5
        )}

        {soloFinished ? (
          <div className="bg-white/90 border border-white rounded-[32px] p-8 text-center shadow-lg space-y-4">
            <h2 className="text-2xl font-black text-slate-900">
              {soloPoints > 0 ? 'Card Still Intact! 👑' : 'Black Card REVOKED! 🚫'}
            </h2>
            <p className="text-sm text-slate-600 font-semibold">
              You got <strong>{soloCorrectCount} / {soloDeck.length}</strong> right and finished with{' '}
              <strong>{soloPoints} points</strong>.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={startSoloGame}
                className="bg-[#1C1C2E] text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={() => setView('menu')}
                className="bg-slate-100 text-slate-700 font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider"
              >
                Menu
              </button>
            </div>
          </div>
        ) : card ? (
          <div className="bg-gradient-to-br from-[#16161f] to-[#0f0f15] text-white rounded-[32px] p-6 sm:p-8 border border-amber-400/25 shadow-xl space-y-5">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest">
              <span className="text-amber-400">{card.category}</span>
              <span className="text-white/50">Card {soloIndex + 1} of {soloDeck.length}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black leading-snug">{card.question}</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {card.options.map((opt, idx) => {
                const isSelected = soloPicked === idx;
                const isRight = idx === card.correct_index;
                let style = 'bg-white/10 hover:bg-white/15 border-white/15 text-white';
                if (soloPicked !== null) {
                  if (isRight) style = 'bg-emerald-500/25 border-emerald-400 text-emerald-200';
                  else if (isSelected) style = 'bg-red-500/25 border-red-400 text-red-200';
                  else style = 'bg-white/5 border-white/10 text-white/40';
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={soloPicked !== null}
                    onClick={() => handleSoloPick(idx)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border font-bold text-sm flex items-center gap-3 transition-all ${style}`}
                  >
                    <span className="w-7 h-7 rounded-xl bg-black/40 flex items-center justify-center text-xs font-black text-amber-400 shrink-0">
                      {LETTERS[idx]}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // ==================== VIEW 4: LIVE MULTIPLAYER ROOM ====================
  if (!room) return null;
  const isHost = room.host_id === userId;
  const players: BCRPlayer[] = room.players || [];
  const currentCard: BCRCard | undefined = room.deck?.[room.current_round];
  const myAnswer = userId ? room.answers?.[userId] : undefined;
  const result = room.last_round_result;

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300 relative z-10">
      {/* Floating Live Debate Reactions Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingReactions.map(r => (
          <div
            key={r.id}
            style={{ left: `${r.left}%` }}
            className="absolute bottom-24 animate-bounce bg-black/80 backdrop-blur-md border border-amber-400/40 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5"
          >
            <span className="text-base">{r.emoji}</span>
            <span>{r.sender}: {r.label}</span>
          </div>
        ))}
      </div>

      {/* Top Room Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => { setRoom(null); setView('menu'); loadHubData(); }}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-white/80 border border-slate-200/80 px-4 py-2 rounded-full"
        >
          <ArrowLeft size={14} /> Leave Room
        </button>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(room.code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 1800);
          }}
          className="inline-flex items-center gap-2 bg-[#1C1C2E] text-amber-300 px-4 py-2 rounded-full text-xs font-black tracking-widest shadow-md"
        >
          CODE: {room.code}
          {copiedCode ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>

      {/* Players VIP Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {players.map(p => renderVipCard(p, room.starting_points || 10, p.id === room.host_id))}
      </div>

      {/* PHASE: LOBBY */}
      {room.status === 'lobby' && (
        <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[32px] p-8 text-center shadow-lg space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Waiting for the Family...</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Share code <strong className="text-slate-900 tracking-widest">{room.code}</strong> or tell everyone to tap{' '}
            <strong>Games → Black Card Revoked</strong> to join directly.
          </p>
          {isHost ? (
            <button
              type="button"
              onClick={handleStartGame}
              className="bg-[#ff4d00] hover:bg-orange-600 text-white font-black uppercase tracking-wider px-8 py-3.5 rounded-2xl text-xs shadow-lg shadow-orange-500/25"
            >
              Start Game ({players.length} {players.length === 1 ? 'Player' : 'Players'})
            </button>
          ) : (
            <p className="text-xs font-bold text-[#ff4d00] animate-pulse">
              Waiting for the Host to start...
            </p>
          )}
        </div>
      )}

      {/* PHASE: PLAYING / TIEBREAKER / REVEAL */}
      {(room.status === 'playing' || room.status === 'tiebreaker' || room.status === 'reveal') && currentCard && (
        <div className="bg-gradient-to-br from-[#16161f] to-[#0c0c12] text-white rounded-[32px] p-6 sm:p-8 border border-amber-400/25 shadow-2xl space-y-5">
          {/* Card Header + Timer */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  currentCard.card_type === 'majority'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                {currentCard.card_type === 'majority' ? 'Majority Rules' : 'Correct Answer'}
              </span>
              <span className="text-[11px] font-bold text-white/50">{currentCard.category}</span>
            </div>

            {room.status === 'playing' && (
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full ${
                  timeLeft <= 4 ? 'bg-red-500/25 text-red-300 animate-pulse' : 'bg-white/10 text-amber-300'
                }`}
              >
                <Clock size={13} /> {timeLeft}s
              </span>
            )}
          </div>

          {/* Countdown Progress Bar */}
          {room.status === 'playing' && (
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  timeLeft <= 4 ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-[#ff4d00]'
                }`}
                style={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }}
              />
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-black leading-snug">{currentCard.question}</h2>

          {/* Host Tie-Breaker Banner */}
          {room.status === 'tiebreaker' && (
            <div className="bg-amber-400/15 border border-amber-400/40 rounded-2xl p-4 flex items-center gap-3">
              <Gavel size={20} className="text-amber-300 shrink-0" />
              <div className="text-xs">
                <p className="font-black text-amber-300 uppercase tracking-wider">Majority Rules Tie!</p>
                <p className="text-white/80 mt-0.5">
                  {isHost
                    ? 'Tap one of the highlighted tied answers below to make the final call.'
                    : 'Waiting on the Host to break the tie...'}
                </p>
              </div>
            </div>
          )}

          {/* Answer Options A-D */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentCard.options.map((opt, idx) => {
              const isMyPick = myAnswer === idx;
              const isWinner = room.status === 'reveal' && result?.winningIndex === idx;
              const isTiedChoice = room.status === 'tiebreaker' && result?.tiedOptions?.includes(idx);
              const voteCount = result?.counts?.[idx] || 0;
              const voters = players.filter(p => room.answers?.[p.id] === idx);

              let btnStyle = 'bg-white/10 hover:bg-white/15 border-white/15 text-white';
              if (room.status === 'playing' && isMyPick) {
                btnStyle = 'bg-amber-400/25 border-amber-400 text-amber-200 ring-2 ring-amber-400/40';
              } else if (room.status === 'tiebreaker') {
                btnStyle = isTiedChoice
                  ? 'bg-amber-400/20 border-amber-400 text-white hover:bg-amber-400/30'
                  : 'bg-white/5 border-white/10 text-white/35';
              } else if (room.status === 'reveal') {
                btnStyle = isWinner
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100'
                  : isMyPick
                  ? 'bg-red-500/25 border-red-400 text-red-200'
                  : 'bg-white/5 border-white/10 text-white/50';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={
                    (room.status === 'playing' && myAnswer !== undefined) ||
                    (room.status === 'tiebreaker' && (!isHost || !isTiedChoice)) ||
                    room.status === 'reveal'
                  }
                  onClick={() => {
                    if (room.status === 'playing') handleSubmitAnswer(idx);
                    else if (room.status === 'tiebreaker' && isHost && isTiedChoice) {
                      resolveRound(room, idx);
                    }
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-black/40 flex items-center justify-center text-xs font-black text-amber-400 shrink-0">
                      {LETTERS[idx]}
                    </span>
                    <span className="font-bold text-sm flex-1">{opt}</span>
                    {room.status === 'reveal' && isWinner && (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    )}
                    {room.status === 'reveal' && !isWinner && isMyPick && (
                      <XCircle size={18} className="text-red-400 shrink-0" />
                    )}
                  </div>

                  {room.status === 'reveal' && voters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pl-10">
                      {voters.map(v => (
                        <span
                          key={v.id}
                          className="text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded-full text-white/80"
                        >
                          {v.name}
                        </span>
                      ))}
                      <span className="text-[10px] text-white/50 ml-auto">{voteCount} vote{voteCount === 1 ? '' : 's'}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Waiting Status / Next Round + Live Debate Reactions */}
          {room.status === 'playing' && (
            <p className="text-center text-xs text-white/50 font-semibold">
              {Object.keys(room.answers || {}).length} of {players.length} locked in
              {myAnswer !== undefined ? ' • Answer locked! Waiting for flip...' : ''}
            </p>
          )}

          {room.status === 'reveal' && (
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Live Debate Reactions */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {DEBATE_REACTIONS.map(r => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => sendDebateReaction(r.emoji, r.label)}
                    className="bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <span>{r.emoji}</span>
                    <span className="text-[11px]">{r.label}</span>
                  </button>
                ))}
              </div>

              {isHost ? (
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="bg-[#ff4d00] hover:bg-orange-600 text-white font-black uppercase tracking-wider px-6 py-2.5 rounded-full text-xs shrink-0"
                >
                  Next Card →
                </button>
              ) : (
                <span className="text-xs text-white/50 font-semibold">Waiting for Host...</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* PHASE: FINISHED */}
      {room.status === 'finished' && (
        <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[32px] p-8 text-center shadow-xl space-y-5">
          <div className="inline-block border-4 border-red-500 text-red-600 font-black uppercase tracking-widest text-lg px-5 py-1.5 rounded-xl -rotate-6">
            GAME OVER
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {players.some(p => p.points <= 0)
              ? `${players.filter(p => p.points <= 0).map(p => p.name).join(' & ')} Got Revoked!`
              : 'Deck Complete!'}
          </h2>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleShareToFeed}
              disabled={isSharingFeed || sharedSuccess}
              className="bg-[#ff4d00] hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-60"
            >
              <Share2 size={14} />
              {sharedSuccess ? 'Posted to Millerites!' : isSharingFeed ? 'Posting...' : 'Share to Millerites Feed'}
            </button>

            {isHost && (
              <button
                type="button"
                onClick={handlePlayAgain}
                className="bg-[#1C1C2E] hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider"
              >
                Play Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
