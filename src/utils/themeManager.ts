// Theme Manager supporting 10 distinct aesthetic modes:
// 1. Dark (Midnight Academy - sleek slate/navy)
// 2. Light (Clean Campus - crisp bright modern white)
// 3. Robotic (Cyber TechNova - futuristic neon green & cyan matrix)
// 4. Cool (Electric Aurora - neon violet & cosmic glow)
// 5. Cyberpunk (Night City - neon amber, hot pink & electric cyan)
// 6. Emerald (Obsidian Matrix - deep forest obsidian & laser emerald)
// 7. Synthwave (80s Sunset - vibrant magenta, orange glow & violet dusk)
// 8. Royal (SMR Sovereign - deep navy executive with imperial gold)
// 9. Crimson (Crimson House - bold scarlet red & ruby titanium)
// 10. Sapphire (Sapphire House - majestic royal blue & ice cyan)

export type AppTheme =
  | 'dark'
  | 'light'
  | 'robotic'
  | 'cool'
  | 'cyberpunk'
  | 'emerald'
  | 'synthwave'
  | 'royal'
  | 'crimson'
  | 'sapphire';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  tagline: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  previewBg: string;
  bodyClass: string;
  containerClass: string;
  navClass: string;
  cardClass: string;
  textPrimary: string;
  textSecondary: string;
  borderGlow?: string;
}

export const APP_THEMES: Record<AppTheme, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'Midnight Dark',
    tagline: 'Deep slate academy with subtle cyan luminescence',
    badge: 'Classic Dark',
    primaryColor: '#06b6d4',
    accentColor: '#6366f1',
    previewBg: 'bg-slate-950',
    bodyClass: 'theme-dark bg-[#070b14] text-slate-100',
    containerClass: 'bg-[#070b14]',
    navClass: 'bg-slate-950/90 border-slate-800 text-slate-200',
    cardClass: 'bg-slate-900/90 border-slate-800 text-slate-100',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400'
  },
  light: {
    id: 'light',
    name: 'Clean Campus',
    tagline: 'Bright, crisp, and high-contrast daytime study aesthetic',
    badge: 'Light Mode',
    primaryColor: '#2563eb',
    accentColor: '#4f46e5',
    previewBg: 'bg-slate-100',
    bodyClass: 'theme-light bg-slate-50 text-slate-900',
    containerClass: 'bg-slate-50 text-slate-900',
    navClass: 'bg-white/95 border-slate-200 text-slate-800 shadow-sm',
    cardClass: 'bg-white border-slate-200 text-slate-900 shadow-sm',
    textPrimary: 'text-slate-950',
    textSecondary: 'text-slate-600'
  },
  robotic: {
    id: 'robotic',
    name: 'Cyber Robotic',
    tagline: 'TechNova robotics lab with neon green grid and telemetry metrics',
    badge: 'TechNova AI',
    primaryColor: '#10b981',
    accentColor: '#06b6d4',
    previewBg: 'bg-zinc-950',
    bodyClass: 'theme-robotic bg-[#020617] text-emerald-100',
    containerClass: 'bg-[#020617]',
    navClass: 'bg-slate-950/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/40',
    cardClass: 'bg-slate-950 border-emerald-500/30 text-emerald-100 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]',
    textPrimary: 'text-emerald-300 font-mono',
    textSecondary: 'text-emerald-500/80 font-mono text-xs'
  },
  cool: {
    id: 'cool',
    name: 'Electric Aurora',
    tagline: 'Vibrant neon purple, radiant cyan, and smooth cosmic glass',
    badge: 'Ultra Cool',
    primaryColor: '#a855f7',
    accentColor: '#ec4899',
    previewBg: 'bg-purple-950',
    bodyClass: 'theme-cool bg-[#090514] text-purple-100',
    containerClass: 'bg-[#090514]',
    navClass: 'bg-purple-950/90 border-purple-800/60 text-purple-200 shadow-purple-950/40',
    cardClass: 'bg-purple-950/50 border-purple-700/50 text-purple-100 shadow-[0_0_20px_-3px_rgba(168,85,247,0.2)] backdrop-blur-md',
    textPrimary: 'text-white',
    textSecondary: 'text-purple-300'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    tagline: 'High-octane neon amber, hot electric pink & laser blue night city',
    badge: 'Neon Glow',
    primaryColor: '#f59e0b',
    accentColor: '#ec4899',
    previewBg: 'bg-[#08020d]',
    bodyClass: 'theme-cyberpunk bg-[#08020d] text-amber-100',
    containerClass: 'bg-[#08020d]',
    navClass: 'bg-[#0e0417]/95 border-amber-500/40 text-amber-200 shadow-[0_0_20px_-4px_rgba(245,158,11,0.25)]',
    cardClass: 'bg-[#120521]/90 border-amber-500/30 text-amber-50 shadow-[0_0_18px_-4px_rgba(236,72,153,0.2)]',
    textPrimary: 'text-amber-300 font-extrabold',
    textSecondary: 'text-pink-300/80 text-xs'
  },
  emerald: {
    id: 'emerald',
    name: 'Obsidian Emerald',
    tagline: 'Deep forest obsidian matrix with tactical radiant emerald accents',
    badge: 'Stealth Matrix',
    primaryColor: '#10b981',
    accentColor: '#059669',
    previewBg: 'bg-[#020b06]',
    bodyClass: 'theme-emerald bg-[#020b06] text-emerald-100',
    containerClass: 'bg-[#020b06]',
    navClass: 'bg-[#03150b]/95 border-emerald-500/30 text-emerald-200 shadow-emerald-950/50',
    cardClass: 'bg-[#041d0f]/80 border-emerald-600/30 text-emerald-100 shadow-[0_0_15px_-4px_rgba(16,185,129,0.2)]',
    textPrimary: 'text-emerald-300',
    textSecondary: 'text-emerald-500/80 text-xs'
  },
  synthwave: {
    id: 'synthwave',
    name: 'Synthwave 80s',
    tagline: 'Retro sunset gradient, saturated neon magenta, and violet horizons',
    badge: 'Retro Wave',
    primaryColor: '#f43f5e',
    accentColor: '#8b5cf6',
    previewBg: 'bg-[#0b0314]',
    bodyClass: 'theme-synthwave bg-[#0b0314] text-rose-100',
    containerClass: 'bg-[#0b0314]',
    navClass: 'bg-[#140624]/95 border-rose-500/40 text-rose-200 shadow-rose-950/50',
    cardClass: 'bg-[#18082c]/85 border-rose-500/30 text-rose-100 shadow-[0_0_20px_-4px_rgba(244,63,94,0.25)]',
    textPrimary: 'text-rose-200 font-black',
    textSecondary: 'text-violet-300/80 text-xs'
  },
  royal: {
    id: 'royal',
    name: 'SMR Sovereign Gold',
    tagline: 'Executive midnight navy with imperial sovereign gold crests',
    badge: 'Executive',
    primaryColor: '#eab308',
    accentColor: '#3b82f6',
    previewBg: 'bg-[#030712]',
    bodyClass: 'theme-royal bg-[#030712] text-amber-100',
    containerClass: 'bg-[#030712]',
    navClass: 'bg-[#060e20]/95 border-amber-500/50 text-amber-200 shadow-amber-950/40',
    cardClass: 'bg-[#0a1630]/90 border-amber-500/40 text-amber-50 shadow-[0_0_20px_-4px_rgba(234,179,8,0.25)]',
    textPrimary: 'text-amber-300 font-bold',
    textSecondary: 'text-amber-200/70 text-xs'
  },
  crimson: {
    id: 'crimson',
    name: 'House Crimson',
    tagline: 'Courage, passion, and victory in deep scarlet red and titanium',
    badge: 'House Spirit',
    primaryColor: '#e11d48',
    accentColor: '#f43f5e',
    previewBg: 'bg-[#0d0205]',
    bodyClass: 'theme-crimson bg-[#0d0205] text-red-100',
    containerClass: 'bg-[#0d0205]',
    navClass: 'bg-[#17040a]/95 border-rose-600/40 text-rose-200 shadow-rose-950/40',
    cardClass: 'bg-[#1f060e]/85 border-rose-600/30 text-rose-100 shadow-[0_0_18px_-4px_rgba(225,29,72,0.25)]',
    textPrimary: 'text-rose-300 font-bold',
    textSecondary: 'text-rose-400/80 text-xs'
  },
  sapphire: {
    id: 'sapphire',
    name: 'House Sapphire',
    tagline: 'Wisdom, intellect, and oceanic celestial blue aura',
    badge: 'House Spirit',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    previewBg: 'bg-[#020814]',
    bodyClass: 'theme-sapphire bg-[#020814] text-cyan-100',
    containerClass: 'bg-[#020814]',
    navClass: 'bg-[#041026]/95 border-cyan-500/40 text-cyan-200 shadow-cyan-950/40',
    cardClass: 'bg-[#061738]/85 border-cyan-500/30 text-cyan-100 shadow-[0_0_18px_-4px_rgba(2,132,199,0.25)]',
    textPrimary: 'text-cyan-300 font-bold',
    textSecondary: 'text-cyan-400/80 text-xs'
  }
};

export function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('kinetiq_theme') as AppTheme;
  if (saved && APP_THEMES[saved]) return saved;
  return 'dark';
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const themeClasses = [
    'theme-dark',
    'theme-light',
    'theme-robotic',
    'theme-cool',
    'theme-cyberpunk',
    'theme-emerald',
    'theme-synthwave',
    'theme-royal',
    'theme-crimson',
    'theme-sapphire'
  ];
  root.classList.remove(...themeClasses);
  root.classList.add(`theme-${theme}`);
  root.setAttribute('data-theme', theme);
  localStorage.setItem('kinetiq_theme', theme);
}
