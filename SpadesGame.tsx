import React, { useEffect, useState } from 'react';
import { Trophy, RotateCw } from 'lucide-react';

interface SpadesGameProps {
  supabase: any;
  userId: string | null;
}

type Suit = '♠' | '♥' | '♦' | '♣';
type Card = { suit: Suit; rank: number }; // 2..14 (14=A)

const SUITS: Suit[] = ['♣', '♦', '♥', '♠'];
const SEATS = ['You', 'West', 'Partner', 'East'];

function rankLabel(r: number) {
  if (r === 11) return 'J';
  if (r === 12) return 'Q';
  if (r === 13) return 'K';
  if (r === 14) return 'A';
  return String(r);
}

function dealHands(): Card[][] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 2; rank <= 14; rank++) deck.push({ suit, rank });
  }
  deck.sort(() => Math.random() - 0.5);
  return [0, 1, 2, 3].map((i) =>
    deck
      .slice(i * 13, (i + 1) * 13)
      .sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) || a.rank - b.rank)
  );
}

function getPlayableCards(hand: Card[], trick: { seat: number; card: Card }[], spadesBroken: boolean): Card[] {
  if (trick.length > 0) {
    const leadSuit = trick[0].card.suit;
    const sameSuit = hand.filter((c) => c.suit === leadSuit);
    if (sameSuit.length > 0) return sameSuit;
    return hand;
  }
  if (!spadesBroken) {
    const nonSpades = hand.filter((c) => c.suit !== '♠');
    if (nonSpades.length > 0) return nonSpades;
  }
  return hand;
}

function resolveTrickWinner(trick: { seat: number; card: Card }[]): number {
  const leadSuit = trick[0].card.suit;
  let best = trick[0];
  for (let i = 1; i < trick.length; i++) {
    const cur = trick[i];
    const bestIsSpade = best.card.suit === '♠';
    const curIsSpade = cur.card.suit === '♠';
    if (curIsSpade && !bestIsSpade) best = cur;
    else if (curIsSpade && bestIsSpade && cur.card.rank > best.card.rank) best = cur;
    else if (!bestIsSpade && cur.card.suit === leadSuit && cur.card.rank > best.card.rank) best = cur;
  }
  return best.seat;
}

export default function SpadesGame({ supabase, userId }: SpadesGameProps) {
  const [hands, setHands] = useState<Card[][]>(dealHands);
  const [phase, setPhase] = useState<'bid' | 'play' | 'done'>('bid');
  const [myBid, setMyBid] = useState<number>(3);
  const [teamBid, setTeamBid] = useState<number>(6);
  const [oppBid, setOppBid] = useState<number>(6);
  const [turn, setTurn] = useState<number>(0);
  const [trick, setTrick] = useState<{ seat: number; card: Card }[]>([]);
  const [spadesBroken, setSpadesBroken] = useState(false);
  const [tricksWon, setTricksWon] = useState<[number, number]>([0, 0]); // [us, them]
  const [winnerText, setWinnerText] = useState('');

  const recordWin = async () => {
    if (!supabase || !userId) return;
    await supabase.rpc('increment_game_win', { p_user_id: userId, p_game_type: 'spades' });
  };

  const resetHand = () => {
    setHands(dealHands());
    setPhase('bid');
    setTurn(0);
    setTrick([]);
    setSpadesBroken(false);
    setTricksWon([0, 0]);
    setWinnerText('');
  };

  const confirmBid = (bid: number) => {
    const partnerBid = Math.max(2, Math.min(5, hands[2].filter((c) => c.rank >= 12 || c.suit === '♠').length - 1));
    const opp = Math.max(4, Math.min(8, 13 - (bid + partnerBid)));
    setMyBid(bid);
    setTeamBid(bid + partnerBid);
    setOppBid(opp);
    setPhase('play');
    setTurn(0);
  };

  const playCard = (seat: number, card: Card) => {
    const nextHands = hands.map((h, i) =>
      i === seat ? h.filter((c) => !(c.suit === card.suit && c.rank === card.rank)) : h
    );
    const nextTrick = [...trick, { seat, card }];
    if (card.suit === '♠') setSpadesBroken(true);
    setHands(nextHands);
    setTrick(nextTrick);

    if (nextTrick.length === 4) {
      const winnerSeat = resolveTrickWinner(nextTrick);
      const isOurTrick = winnerSeat === 0 || winnerSeat === 2;
      setTimeout(() => {
        const nextTricks: [number, number] = [
          tricksWon[0] + (isOurTrick ? 1 : 0),
          tricksWon[1] + (isOurTrick ? 0 : 1),
        ];
        setTricksWon(nextTricks);
        setTrick([]);
        if (nextTricks[0] + nextTricks[1] >= 13) {
          const ourScore = nextTricks[0] >= teamBid ? teamBid * 10 + (nextTricks[0] - teamBid) : -teamBid * 10;
          const oppScore = nextTricks[1] >= oppBid ? oppBid * 10 + (nextTricks[1] - oppBid) : -oppBid * 10;
          const weWon = ourScore >= oppScore;
          if (weWon) recordWin();
          setWinnerText(
            weWon
              ? `You & Partner Win! (${ourScore} to ${oppScore})`
              : `Opponents Win (${oppScore} to ${ourScore})`
          );
          setPhase('done');
        } else {
          setTurn(winnerSeat);
        }
      }, 850);
    } else {
      setTurn((seat + 1) % 4);
    }
  };

  // AI Seats (1, 2, 3) play automatically
  useEffect(() => {
    if (phase !== 'play' || turn === 0 || trick.length >= 4) return;
    const t = setTimeout(() => {
      const legal = getPlayableCards(hands[turn], trick, spadesBroken);
      if (legal.length === 0) return;
      const chosen = legal[Math.floor(Math.random() * legal.length)];
      playCard(turn, chosen);
    }, 550);
    return () => clearTimeout(t);
  }, [phase, turn, trick.length]);

  const playableSet = phase === 'play' && turn === 0 ? getPlayableCards(hands[0], trick, spadesBroken) : [];

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">♠️ Spades</h2>
          <p className="text-xs text-slate-500">You & Partner vs. West & East</p>
        </div>
        <button
          type="button"
          onClick={resetHand}
          className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full flex items-center gap-1"
        >
          <RotateCw size={12} /> New Hand
        </button>
      </div>

      {/* Score Strip */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-[#1C1C2E] text-white rounded-2xl p-2.5">
          <p className="text-[10px] uppercase font-bold text-amber-400">Your Team</p>
          <p className="text-sm font-black">
            {tricksWon[0]} / {phase === 'bid' ? '?' : teamBid} Tricks
          </p>
        </div>
        <div className="bg-slate-100 text-slate-800 rounded-2xl p-2.5">
          <p className="text-[10px] uppercase font-bold text-slate-400">Opponents</p>
          <p className="text-sm font-black">
            {tricksWon[1]} / {phase === 'bid' ? '?' : oppBid} Tricks
          </p>
        </div>
      </div>

      {/* Felt Card Table */}
      <div className="relative bg-emerald-950 border-2 border-emerald-800 rounded-[28px] p-5 min-h-[210px] flex flex-col items-center justify-center shadow-xl">
        {phase === 'bid' ? (
          <div className="text-center space-y-3">
            <p className="text-white font-black text-sm">Place Your Bid (Tricks you'll win)</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => confirmBid(b)}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-[#ff4d00] hover:text-white text-slate-900 font-black text-sm transition-all"
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 w-full max-w-[260px]">
            {trick.length === 0 ? (
              <p className="col-span-2 text-center text-xs text-emerald-200/60 font-semibold">
                {turn === 0 ? 'Your lead — tap a card below' : `${SEATS[turn]} is leading...`}
              </p>
            ) : (
              trick.map(({ seat, card }) => {
                const isRed = card.suit === '♥' || card.suit === '♦';
                return (
                  <div key={seat} className="bg-white rounded-xl p-2.5 flex items-center justify-between shadow-md">
                    <span className="text-[10px] font-bold text-slate-400">{SEATS[seat]}</span>
                    <span className={`text-base font-black ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                      {rankLabel(card.rank)}{card.suit}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {phase === 'done' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-[26px] flex flex-col items-center justify-center p-6 text-center">
            <Trophy size={36} className="text-amber-400 mb-2" />
            <h3 className="text-xl font-black text-white mb-4">{winnerText}</h3>
            <button
              type="button"
              onClick={resetHand}
              className="bg-[#ff4d00] text-white text-xs font-black uppercase px-6 py-2.5 rounded-full"
            >
              Deal Next Hand
            </button>
          </div>
        )}
      </div>

      {/* Your 13-Card Hand */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {hands[0].map((card) => {
          const isRed = card.suit === '♥' || card.suit === '♦';
          const canTap =
            phase === 'play' &&
            turn === 0 &&
            trick.length < 4 &&
            playableSet.some((c) => c.suit === card.suit && c.rank === card.rank);
          return (
            <button
              key={`${card.suit}-${card.rank}`}
              type="button"
              disabled={!canTap}
              onClick={() => playCard(0, card)}
              className={`w-11 h-16 rounded-xl border-2 font-black text-xs flex flex-col items-center justify-center transition-all ${
                canTap
                  ? 'bg-white border-[#ff4d00] shadow-md -translate-y-1 hover:scale-105'
                  : 'bg-slate-100 border-slate-200 opacity-55'
              } ${isRed ? 'text-red-600' : 'text-slate-900'}`}
            >
              <span>{rankLabel(card.rank)}</span>
              <span className="text-sm leading-none">{card.suit}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
