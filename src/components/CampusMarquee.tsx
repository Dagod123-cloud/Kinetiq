import React, { useState } from 'react';
import { Sparkles, Trophy, Bot, Calendar, ArrowRight, X, Flame } from 'lucide-react';
import { PE_HOUSES } from '../utils/houseThemes.ts';
import { playUiClick } from '../utils/soundEffects.ts';

interface CampusMarqueeProps {
  onOpenStudyBot: () => void;
  onOpenCommandPalette: () => void;
  onNavigateTab: (tabId: string) => void;
  isStudent: boolean;
}

export const CampusMarquee: React.FC<CampusMarqueeProps> = ({
  onOpenStudyBot,
  onOpenCommandPalette,
  onNavigateTab,
  isStudent
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-800/40 py-2 px-4 sm:px-6 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Live indicator tag */}
          <span className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-black tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Campus
          </span>

          {/* Marquee text message */}
          <div className="flex items-center gap-4 text-xs truncate">
            <div className="flex items-center gap-1.5 text-slate-200 font-medium shrink-0">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Inter-House Cup: <strong className="text-blue-400">Sapphire</strong> leads with 1,620 pts!</span>
            </div>

            <span className="hidden md:inline text-slate-600">•</span>

            <a
              href="https://nifty-smart-study-bot.base44.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playUiClick()}
              className="hidden sm:flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 transition-colors shrink-0 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>EduBot AI Focus Suite ↗</span>
              <ArrowRight className="w-3 h-3" />
            </a>

            <span className="hidden lg:inline text-slate-600">•</span>

            <span className="hidden lg:inline text-slate-400">
              Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-cyan-300">Ctrl+K</kbd> to search events & commands
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              playUiClick();
              onOpenCommandPalette();
            }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Search (⌘K)</span>
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss notification banner"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
