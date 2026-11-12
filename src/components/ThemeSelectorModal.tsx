import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Cpu,
  Sparkles,
  Zap,
  Radio,
  Crown,
  Flame,
  Shield,
  Layers,
  Check,
  X
} from 'lucide-react';
import { AppTheme, APP_THEMES } from '../utils/themeManager.ts';
import { playUiClick, playSuccessChime } from '../utils/soundEffects.ts';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'CORE' | 'CYBER' | 'HOUSE'>('ALL');

  if (!isOpen) return null;

  const themesList: { id: AppTheme; icon: React.ReactNode; category: 'CORE' | 'CYBER' | 'HOUSE' }[] = [
    { id: 'dark', icon: <Moon className="w-4 h-4 text-cyan-400" />, category: 'CORE' },
    { id: 'light', icon: <Sun className="w-4 h-4 text-amber-500" />, category: 'CORE' },
    { id: 'robotic', icon: <Cpu className="w-4 h-4 text-emerald-400" />, category: 'CYBER' },
    { id: 'cool', icon: <Sparkles className="w-4 h-4 text-purple-400" />, category: 'CYBER' },
    { id: 'cyberpunk', icon: <Zap className="w-4 h-4 text-amber-400" />, category: 'CYBER' },
    { id: 'emerald', icon: <Radio className="w-4 h-4 text-emerald-400" />, category: 'CYBER' },
    { id: 'synthwave', icon: <Layers className="w-4 h-4 text-rose-400" />, category: 'CYBER' },
    { id: 'royal', icon: <Crown className="w-4 h-4 text-amber-400" />, category: 'CORE' },
    { id: 'crimson', icon: <Flame className="w-4 h-4 text-rose-500" />, category: 'HOUSE' },
    { id: 'sapphire', icon: <Shield className="w-4 h-4 text-blue-400" />, category: 'HOUSE' }
  ];

  const visibleThemes = themesList.filter(
    t => filterCategory === 'ALL' || t.category === filterCategory
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Personalise Appearance • 10 Themes Available
            </span>
            <h3 className="text-xl font-black text-white font-heading mt-1">
              Select Website Theme
            </h3>
            <p className="text-xs text-slate-400">
              Personalise KinetiQ for late night study, bright campus classes, or cyber robotics
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start shrink-0">
          {(['ALL', 'CORE', 'CYBER', 'HOUSE'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                playUiClick();
                setFilterCategory(cat);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All (10)' : cat === 'CORE' ? 'Core Classics' : cat === 'CYBER' ? 'Cyber & Retro' : 'House Spirit'}
            </button>
          ))}
        </div>

        {/* Scrollable Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1">
          {visibleThemes.map(({ id, icon }) => {
            const config = APP_THEMES[id];
            const isSelected = currentTheme === id;

            return (
              <button
                key={id}
                onClick={() => {
                  playSuccessChime();
                  onSelectTheme(id);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 relative group ${
                  isSelected
                    ? 'bg-indigo-950/80 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-400/40'
                    : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 group-hover:scale-105 transition-transform">
                    {icon}
                  </div>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-mono">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {config.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{config.name}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                    {config.tagline}
                  </p>
                </div>

                {/* Color swatches preview */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="w-3 h-3 rounded-full shadow-xs ring-1 ring-white/10" style={{ backgroundColor: config.primaryColor }} />
                  <div className="w-3 h-3 rounded-full shadow-xs ring-1 ring-white/10" style={{ backgroundColor: config.accentColor }} />
                  <div className="w-3 h-3 rounded-full border border-slate-700" style={{ backgroundColor: id === 'light' ? '#f8fafc' : '#070b14' }} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>Theme saves automatically to your device</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
