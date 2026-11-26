import React, { useState } from 'react';
import {
  Sparkles, Smile, MessageSquareHeart, BookHeart,
  CalendarHeart, BellRing, X, ArrowRight, ArrowLeft, Check
} from 'lucide-react';

interface WelcomeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName?: string;
}

const TOUR_STEPS = [
  {
    badge: 'Welcome Home',
    title: 'Welcome to Millerites! 🏡',
    description:
      'This is our private family hub—no ads, no algorithms, just our crew staying connected. Take 20 seconds to see what you can do here.',
    tip: 'You can replay this quick guide anytime from the top of your feed.',
    icon: Sparkles,
    accent: 'from-amber-400 to-[#ff4d00]'
  },
  {
    badge: 'Step 1 of 5',
    title: 'Share Your Daily Vibe 👋🏾',
    description:
      'At the top of the feed is the Family Vibe Check. Tap your own photo to pick an emoji and drop a quick status like "Coffee run" or "At the kids\' game."',
    tip: 'Tap any family member’s photo to view their profile, bio, and favorite Bible verse.',
    icon: Smile,
    accent: 'from-orange-400 to-amber-500'
  },
  {
    badge: 'Step 2 of 5',
    title: 'Post, React & @Tag Family 💬',
    description:
      'Share life updates, photos, and videos on the timeline. React with multiple emojis (❤️ 😂 🙌🏾 🙏🏾 🔥), and tap the reaction summary to see who reacted.',
    tip: 'Type @ followed by someone’s first name in a post or reply to tag them directly!',
    icon: MessageSquareHeart,
    accent: 'from-rose-400 to-[#ff4d00]'
  },
  {
    badge: 'Step 3 of 5',
    title: 'Prayer Wall & Checklists 🙏🏾',
    description:
      'Drop a prayer request anytime—family members can tap "Pray" so you know who is lifting you up, and you can mark prayers as Answered. Use the Family Checklist to claim dishes for dinners or trips.',
    tip: 'Filter the Prayer Wall between Active and Answered prayers to celebrate testimonies.',
    icon: BookHeart,
    accent: 'from-amber-500 to-orange-600'
  },
  {
    badge: 'Step 4 of 5',
    title: 'Never Miss a Milestone 🎂',
    description:
      'Log birthdays, anniversaries, and family trips in Upcoming Milestones. Birthdays and anniversaries automatically count down every year.',
    tip: 'The dark navy Family Pulse card at the top always shows your next big date and how many new posts happened since your last visit.',
    icon: CalendarHeart,
    accent: 'from-indigo-500 to-slate-800'
  },
  {
    badge: 'Step 5 of 5',
    title: 'Get the App & Turn On Alerts 🔔',
    description:
      'Add Millerites to your phone’s Home Screen using the banner at the top so it works like a real app. Then tap "🔔 Enable Alerts" to get instant lock-screen notifications when family posts or @tags you.',
    tip: 'iPhone users: Add to Home Screen via Safari first, open the app icon, then tap Enable Alerts.',
    icon: BellRing,
    accent: 'from-[#1C1C2E] to-slate-700'
  }
];

export default function WelcomeTourModal({ isOpen, onClose, firstName }: WelcomeTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const IconComponent = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-white rounded-[32px] shadow-[0_20px_60px_rgba(28,28,46,0.25)] overflow-hidden relative">
        
        {/* Top Accent Banner */}
        <div className={`bg-gradient-to-br ${step.accent} p-6 pb-8 text-white relative overflow-hidden`}>
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-5 relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
              {step.badge}
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="text-white/70 hover:text-white bg-black/15 hover:bg-black/25 p-1.5 rounded-full transition-colors"
              title="Skip tour"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <IconComponent size={26} className="text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              {isFirst && firstName ? `Welcome, ${firstName}! 🏡` : step.title}
            </h2>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-7 space-y-5">
          <p className="text-slate-700 text-sm leading-relaxed font-medium">
            {step.description}
          </p>

          <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-3.5 text-xs text-amber-900 font-semibold leading-relaxed">
            💡 <span className="font-bold">Quick Tip:</span> {step.tip}
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-[#1C1C2E]' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {isFirst ? (
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 px-3 py-2 transition-colors"
              >
                Skip for now
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 rounded-full transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            {isLast ? (
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#ff4d00] hover:bg-orange-600 px-6 py-2.5 rounded-full shadow-md shadow-orange-500/20 transition-all"
              >
                Let's Go! <Check size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1C1C2E] hover:bg-slate-800 px-6 py-2.5 rounded-full shadow-md shadow-slate-900/15 transition-all"
              >
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
