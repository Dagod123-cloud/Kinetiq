import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Calendar,
  Crown,
  Bot,
  Activity,
  Award,
  Volume2,
  VolumeX,
  X,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime, playUiClick, isSoundMuted, toggleSoundMute } from '../utils/soundEffects.ts';

interface KinetiqCinematicIntroProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterApp?: () => void;
}

interface Chapter {
  id: number;
  timeRange: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    timeRange: '0:00 - 0:06',
    badge: 'Phase 01 • The Pulse',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    title: 'The Unified Campus Operating System',
    subtitle: 'KinetiQ Planner • Developed by SMR TechNova',
    description:
      'Engineered specifically for St. Jude’s Academy & SMG Education. Connecting students, ideas, and faculty into one synchronized real-time platform.',
    icon: <Zap className="w-8 h-8 text-cyan-400" />,
    highlights: ['Zero Mock Clutter', 'Real-time Sync', '10 Theme Engines']
  },
  {
    id: 2,
    timeRange: '0:06 - 0:12',
    badge: 'Phase 02 • Master Control',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    title: 'Authorized Administrative Power',
    subtitle: 'Lead Administrator Sarang & Faculty Command',
    description:
      'Only real events published by verified leadership. Sarang retains master system ownership, choosing who is an Admin or Student with 1-click access control.',
    icon: <Crown className="w-8 h-8 text-amber-400" />,
    highlights: ['Protected Master Account', 'Role Management', 'No Fake Events']
  },
  {
    id: 3,
    timeRange: '0:12 - 0:18',
    badge: 'Phase 03 • Student Voice',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    title: 'Your Schedule, Your Voice, Your House',
    subtitle: 'Personal Calendars & Digital Passports',
    description:
      'Every student can schedule their own revision blocks, suggest ideas to faculty, compete in the 5-House Spirit Arena, and carry official QR digital ID passes.',
    icon: <GraduationCap className="w-8 h-8 text-cyan-400" />,
    highlights: ['Personal Calendars', 'House Championship', 'Digital ID Passes']
  },
  {
    id: 4,
    timeRange: '0:18 - 0:24',
    badge: 'Phase 04 • Live Pulse',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    title: 'Transparent Campus Activity & EduBot',
    subtitle: 'See What Everyone Is Doing in Real-Time',
    description:
      'Follow admin event creations and student suggestions live. Click EduBot anytime to directly open your AI study companion at nifty-smart-study-bot.base44.app.',
    icon: <Activity className="w-8 h-8 text-purple-400" />,
    highlights: ['Live Campus Feed', 'Direct EduBot Access', 'Audit Transparency']
  },
  {
    id: 5,
    timeRange: '0:24 - 0:30',
    badge: 'Phase 05 • Ignition',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    title: 'Welcome to KinetiQ Planner',
    subtitle: 'Connecting Students, Ideas and Events',
    description:
      'Ready to experience your new campus hub? Jump right in to explore real upcoming events, schedule your goals, or manage student permissions.',
    icon: <Sparkles className="w-8 h-8 text-emerald-400" />,
    highlights: ['SMR TechNova Ready', 'Instant Access', 'Start Planning']
  }
];

export const KinetiqCinematicIntro: React.FC<KinetiqCinematicIntroProps> = ({
  isOpen,
  onClose,
  onEnterApp
}) => {
  const TOTAL_DURATION = 30; // 30 seconds
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [muted, setMuted] = useState(isSoundMuted());

  // Determine current chapter (6 seconds each for 5 chapters)
  const currentChapterIndex = Math.min(
    Math.floor(seconds / 6),
    CHAPTERS.length - 1
  );
  const activeChapter = CHAPTERS[currentChapterIndex];

  // 30s timer ticker
  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      setIsPlaying(true);
      return;
    }

    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && seconds < TOTAL_DURATION) {
      timer = setInterval(() => {
        setSeconds(prev => {
          const next = prev + 0.1;
          if (next >= TOTAL_DURATION) {
            setIsPlaying(false);
            try {
              confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } });
              playSuccessChime();
            } catch {}
            return TOTAL_DURATION;
          }
          return Number(next.toFixed(1));
        });
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, isPlaying, seconds]);

  if (!isOpen) return null;

  const progressPercent = Math.min((seconds / TOTAL_DURATION) * 100, 100);

  const handleFinish = () => {
    playSuccessChime();
    localStorage.setItem('kinetiq_intro_seen', 'true');
    onClose();
    onEnterApp?.();
  };

  const handleSeekChapter = (index: number) => {
    playUiClick();
    setSeconds(index * 6);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in select-none">
      <div className="w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_-10px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col relative">
        {/* Background Cyber Glow Rings */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Control Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-black text-white">
                  KinetiQ Experience
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  30s Briefing
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                SMR TechNova • St. Jude’s Academy
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextMuted = toggleSoundMute();
                setMuted(nextMuted);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleFinish}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close intro"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic 30-Second Progress Bar */}
        <div className="w-full bg-slate-900 h-2 relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400 transition-all duration-100 ease-linear shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Chapter markers */}
          {[0, 1, 2, 3, 4].map(idx => (
            <div
              key={idx}
              onClick={() => handleSeekChapter(idx)}
              className="absolute top-0 bottom-0 w-1 bg-white/20 hover:bg-white/60 cursor-pointer transition-colors"
              style={{ left: `${(idx / 5) * 100}%` }}
              title={`Jump to Phase 0${idx + 1}`}
            />
          ))}
        </div>

        {/* Main Cinematic Stage */}
        <div className="p-8 sm:p-12 flex-1 flex flex-col justify-between space-y-8 relative z-10 min-h-[380px]">
          {/* Chapter Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${activeChapter.badgeColor}`}
              >
                {activeChapter.badge}
              </span>
              <span className="font-mono text-xs font-bold text-slate-400 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800">
                00:{Math.floor(seconds).toString().padStart(2, '0')} / 00:30
              </span>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-3xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-xl group">
                {activeChapter.icon}
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-tight leading-tight">
                  {activeChapter.title}
                </h2>
                <p className="text-sm sm:text-base font-semibold text-cyan-400">
                  {activeChapter.subtitle}
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {activeChapter.description}
            </p>

            {/* Highlights pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {activeChapter.highlights.map(item => (
                <span
                  key={item}
                  className="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Chapter Selector Navigation Chips */}
          <div className="grid grid-cols-5 gap-2 pt-4 border-t border-slate-800/80">
            {CHAPTERS.map((ch, idx) => {
              const isActive = currentChapterIndex === idx;
              const isPast = seconds >= (idx + 1) * 6;

              return (
                <button
                  key={ch.id}
                  onClick={() => handleSeekChapter(idx)}
                  className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                      : isPast
                      ? 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500'
                      : 'bg-slate-950/50 border-slate-800/60 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase font-mono">
                    0{ch.id}
                  </span>
                  <span className="text-[11px] font-bold truncate hidden sm:block">
                    {ch.title.split(' ')[0]} {ch.title.split(' ')[1] || ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Playback & Enter CTA Controls */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playUiClick();
                setIsPlaying(!isPlaying);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={() => {
                playUiClick();
                setSeconds(0);
                setIsPlaying(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Restart 30s intro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replay</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {seconds < TOTAL_DURATION && (
              <button
                onClick={() => {
                  playUiClick();
                  const nextIndex = Math.min(currentChapterIndex + 1, CHAPTERS.length - 1);
                  setSeconds(nextIndex * 6);
                }}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Next Phase</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleFinish}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-600 to-violet-600 hover:from-cyan-300 hover:to-violet-500 text-white text-xs font-black transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Enter KinetiQ Portal</span>
              <Zap className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
