import { HouseName } from '../types/index.ts';

export interface HouseConfig {
  name: HouseName;
  label: string;
  tagline: string;
  colorName: string;
  hex: string;
  badgeClass: string;
  badgeSolid: string;
  borderClass: string;
  borderSubtle: string;
  bgClass: string;
  textClass: string;
  gradientClass: string;
  glowClass: string;
  ringClass: string;
  lightBg: string;
  darkBg: string;
  cardBg: string;
  mascot: string;
  points: number;
}

export const PE_HOUSES: Record<HouseName, HouseConfig> = {
  Crimson: {
    name: 'Crimson',
    label: 'Crimson House',
    tagline: 'Courage, Honor & Passion',
    colorName: 'Deep Crimson Red',
    hex: '#be123c', // deep crimson
    badgeClass: 'bg-rose-950/80 text-rose-300 border border-rose-500/50',
    badgeSolid: 'bg-rose-700 text-white',
    borderClass: 'border-rose-500',
    borderSubtle: 'border-rose-500/30',
    bgClass: 'bg-rose-950/40',
    textClass: 'text-rose-400',
    gradientClass: 'from-rose-950 via-rose-700 to-red-600',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(225,29,72,0.45)]',
    ringClass: 'ring-rose-500',
    lightBg: 'bg-rose-50',
    darkBg: 'bg-rose-950',
    cardBg: 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950',
    mascot: 'Crimson Falcon',
    points: 1480
  },
  Tiger: {
    name: 'Tiger',
    label: 'Tiger House',
    tagline: 'Strength, Speed & Tenacity',
    colorName: 'Tiger Orange',
    hex: '#ea580c', // tiger orange
    badgeClass: 'bg-orange-950/80 text-orange-300 border border-orange-500/50',
    badgeSolid: 'bg-orange-600 text-white',
    borderClass: 'border-orange-500',
    borderSubtle: 'border-orange-500/30',
    bgClass: 'bg-orange-950/40',
    textClass: 'text-orange-400',
    gradientClass: 'from-orange-950 via-orange-600 to-amber-500',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(234,88,12,0.45)]',
    ringClass: 'ring-orange-500',
    lightBg: 'bg-orange-50',
    darkBg: 'bg-orange-950',
    cardBg: 'bg-gradient-to-br from-orange-950/80 via-slate-900 to-slate-950',
    mascot: 'Bengal Tiger',
    points: 1530
  },
  Amber: {
    name: 'Amber',
    label: 'Amber House',
    tagline: 'Wisdom, Energy & Resilience',
    colorName: 'Golden Amber',
    hex: '#d97706', // golden amber
    badgeClass: 'bg-amber-950/80 text-amber-300 border border-amber-500/50',
    badgeSolid: 'bg-amber-600 text-slate-950 font-black',
    borderClass: 'border-amber-500',
    borderSubtle: 'border-amber-500/30',
    bgClass: 'bg-amber-950/40',
    textClass: 'text-amber-400',
    gradientClass: 'from-amber-950 via-amber-600 to-yellow-500',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(217,119,6,0.45)]',
    ringClass: 'ring-amber-500',
    lightBg: 'bg-amber-50',
    darkBg: 'bg-amber-950',
    cardBg: 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950',
    mascot: 'Golden Phoenix',
    points: 1420
  },
  Lime: {
    name: 'Lime',
    label: 'Lime House',
    tagline: 'Vitality, Growth & Precision',
    colorName: 'Bright Lime Green',
    hex: '#65a30d', // bright lime
    badgeClass: 'bg-lime-950/80 text-lime-300 border border-lime-500/50',
    badgeSolid: 'bg-lime-600 text-slate-950 font-black',
    borderClass: 'border-lime-500',
    borderSubtle: 'border-lime-500/30',
    bgClass: 'bg-lime-950/40',
    textClass: 'text-lime-400',
    gradientClass: 'from-emerald-950 via-lime-600 to-emerald-500',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(101,163,13,0.45)]',
    ringClass: 'ring-lime-500',
    lightBg: 'bg-lime-50',
    darkBg: 'bg-lime-950',
    cardBg: 'bg-gradient-to-br from-lime-950/80 via-slate-900 to-slate-950',
    mascot: 'Emerald Viper',
    points: 1390
  },
  Sapphire: {
    name: 'Sapphire',
    label: 'Sapphire House',
    tagline: 'Loyalty, Intellect & Endurance',
    colorName: 'Sapphire Blue',
    hex: '#2563eb', // sapphire blue
    badgeClass: 'bg-blue-950/80 text-blue-300 border border-blue-500/50',
    badgeSolid: 'bg-blue-600 text-white',
    borderClass: 'border-blue-500',
    borderSubtle: 'border-blue-500/30',
    bgClass: 'bg-blue-950/40',
    textClass: 'text-blue-400',
    gradientClass: 'from-blue-950 via-blue-700 to-indigo-600',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(37,99,235,0.45)]',
    ringClass: 'ring-blue-500',
    lightBg: 'bg-blue-50',
    darkBg: 'bg-blue-950',
    cardBg: 'bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950',
    mascot: 'Sapphire Eagle',
    points: 1610
  }
};

export const HOUSE_NAMES: HouseName[] = ['Crimson', 'Tiger', 'Amber', 'Lime', 'Sapphire'];

export function getHouseConfig(house?: string): HouseConfig {
  if (house && house in PE_HOUSES) {
    return PE_HOUSES[house as HouseName];
  }
  return PE_HOUSES.Crimson;
}
