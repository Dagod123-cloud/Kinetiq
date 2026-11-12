import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Palette,
  Layers,
  Share2,
  ShieldAlert,
  Loader2,
  X
} from 'lucide-react';
import { SchoolEvent, EventCategory } from '../../types/index.ts';

interface PosterStudioProps {
  events: SchoolEvent[];
  initialSelectedEventId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isStandaloneTab?: boolean;
}

interface PosterDesign {
  headline: string;
  tagline: string;
  description: string;
  bulletHighlights: string[];
  callToAction: string;
  badgeText: string;
  colorPalette: {
    gradient: string;
    accentColor: string;
    textColor: string;
  };
}

const THEME_STYLES = [
  { id: 'Modern Electric', label: 'Electric Aurora', desc: 'Neon cyan, violet and electric indigo gradients' },
  { id: 'Cyberpunk Neon', label: 'Cyber Pulse', desc: 'High-contrast fuchsia, amber and dark glass' },
  { id: 'Athletic Energy', label: 'Athletic Gold', desc: 'Bold championship gold, crimson & energy flares' },
  { id: 'Academic Prestigious', label: 'Academic Crest', desc: 'Deep sapphire, gold foil accents and timeless serif styling' },
  { id: 'Warm Arts & Creative', label: 'Creative Studio', desc: 'Coral, emerald & playful contemporary typography' }
];

export const PosterStudioModal: React.FC<PosterStudioProps> = ({
  events,
  initialSelectedEventId,
  isOpen = true,
  onClose,
  isStandaloneTab = false
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialSelectedEventId || (events.length > 0 ? events[0].id : '')
  );

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  const [customTitle, setCustomTitle] = useState(selectedEvent?.title || 'Annual Science Fair & Tech Expo');
  const [customCategory, setCustomCategory] = useState<EventCategory>(selectedEvent?.category || 'STEM & Robotics');
  const [customDate, setCustomDate] = useState(selectedEvent?.date || '2026-11-20');
  const [customTime, setCustomTime] = useState(selectedEvent?.startTime || '14:00');
  const [customLocation, setCustomLocation] = useState(selectedEvent?.location || 'Main STEM Laboratories');
  const [selectedTheme, setSelectedTheme] = useState('Modern Electric');

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Default initial poster preview
  const [poster, setPoster] = useState<PosterDesign>({
    headline: selectedEvent ? selectedEvent.title.toUpperCase() : 'SCIENCE & TECH EXPO 2026',
    tagline: 'Ignite Your Curiosity & Build the Future!',
    description: selectedEvent?.description || 'Explore groundbreaking student robotics prototypes, chemistry spectacles, and hands-on lab experiments.',
    bulletHighlights: [
      'Interactive VR & Autonomous Robotics Arena',
      'Spectacular Live Liquid Nitrogen Demos',
      'Earn House Points & Win STEM Certificates'
    ],
    callToAction: 'Scan Student Pass to Register • Free Admission',
    badgeText: 'OFFICIAL KINETIQ SHOWCASE',
    colorPalette: {
      gradient: 'from-cyan-500 via-indigo-600 to-violet-900',
      accentColor: '#38bdf8',
      textColor: '#ffffff'
    }
  });

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    const ev = events.find(e => e.id === eventId);
    if (ev) {
      setCustomTitle(ev.title);
      setCustomCategory(ev.category);
      setCustomDate(ev.date);
      setCustomTime(`${ev.startTime} - ${ev.endTime}`);
      setCustomLocation(ev.location);
    }
  };

  const handleGeneratePoster = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: customTitle,
          category: customCategory,
          date: customDate,
          time: customTime,
          location: customLocation,
          themeStyle: selectedTheme
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      const data: PosterDesign = await response.json();
      setPoster(data);
    } catch (err) {
      console.error('Failed to generate poster:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    } catch {}
  };

  const handleCopyNotice = () => {
    const text = `📢 **${poster.headline}**\n${poster.tagline}\n\n📅 Date: ${customDate} | ⏰ Time: ${customTime}\n📍 Venue: ${customLocation}\n\n${poster.description}\n\nHighlights:\n${poster.bulletHighlights?.map(h => `• ${h}`).join('\n')}\n\n👉 ${poster.callToAction}`;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    } catch {
      fallbackCopy(text);
    }
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen && !isStandaloneTab) return null;

  const content = (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Creative Engine</span>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Marketing & Digital Signage</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-2">
            AI Poster & Promotional Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Generate high-impact, professional school event posters and promotional bulletins in seconds using Google Gemini AI. Select any upcoming school event or customize your own copy.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-start sm:self-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Studio Workspace: Controls (Left) & Poster Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white font-heading flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Event Source & Details</span>
            </h3>

            {/* Event Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Choose Upcoming Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => handleSelectEvent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date})
                  </option>
                ))}
              </select>
            </div>

            {/* Editable Event Meta */}
            <div className="space-y-3 pt-1 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Event Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Date</label>
                  <input
                    type="text"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Time</label>
                  <input
                    type="text"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Location</label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Visual Art Direction */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>Theme Style & Aesthetic</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {THEME_STYLES.map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedTheme(style.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                      selectedTheme === style.id
                        ? 'bg-purple-950/70 border-purple-500 text-white font-bold shadow-md shadow-purple-500/20'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold">{style.label}</span>
                      {selectedTheme === style.id && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 shadow-sm" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGeneratePoster}
              disabled={isGenerating || !customTitle}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>AI Synthesizing Graphics & Copy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Promotional Poster</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Bulletin Export Tools */}
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={handleCopyNotice}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedText ? 'Notice Copied!' : 'Copy Daily Bulletin'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              title="Print poster for campus notice boards"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Poster Canvas Column (7 cols) */}
        <div className="lg:col-span-7 flex justify-center items-start">
          <div
            id="kinetiq-printable-poster"
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-700 relative bg-slate-950 text-white transition-all transform hover:scale-[1.01]"
          >
            {/* Poster Header Gradient Visual Area */}
            <div className={`p-8 bg-gradient-to-br ${poster.colorPalette?.gradient || 'from-cyan-500 via-indigo-600 to-violet-900'} relative overflow-hidden text-center`}>
              {/* Dynamic Abstract Aurora Circles */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-300/30 rounded-full blur-2xl pointer-events-none" />

              {/* Top Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-[10px] font-black tracking-widest uppercase mb-4 text-white">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{poster.badgeText || 'OFFICIAL KINETIQ EVENT'}</span>
              </div>

              {/* School Identification */}
              <div className="text-[11px] font-bold tracking-widest uppercase text-white/80 mb-2">
                St. Jude's Academy • Student Activities
              </div>

              {/* Poster Main Headline */}
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white leading-tight drop-shadow-md">
                {poster.headline}
              </h1>

              {/* Tagline */}
              <p className="text-sm font-semibold text-cyan-100 mt-2 tracking-wide max-w-sm mx-auto drop-shadow-sm">
                "{poster.tagline}"
              </p>
            </div>

            {/* Poster Body */}
            <div className="p-6 bg-slate-900/95 space-y-6">
              {/* Event Time & Venue Capsule Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="text-left leading-tight">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                    <span className="text-xs font-black text-white">{customDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="text-left leading-tight">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Time</span>
                    <span className="text-xs font-black text-white">{customTime}</span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-2 pt-2 border-t border-slate-800/80 mt-1">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="text-left leading-tight">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                    <span className="text-xs font-bold text-slate-200">{customLocation}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-cyan-400 pl-3">
                {poster.description}
              </p>

              {/* Bullet Highlights */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Event Highlights & Student Perks:
                </span>
                <div className="space-y-1.5">
                  {poster.bulletHighlights?.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Call to Action Banner & Mock QR */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    Registration Portal
                  </span>
                  <div className="text-xs font-bold text-white">
                    {poster.callToAction}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Powered by KinetiQ Events OS
                  </p>
                </div>

                {/* Digital QR Badge simulation */}
                <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                  <div className="w-full h-full border border-slate-900 flex flex-col items-center justify-center p-0.5 text-[8px] font-mono text-slate-950 font-bold text-center leading-none">
                    <div className="w-full flex justify-between">
                      <div className="w-3 h-3 bg-black" />
                      <div className="w-3 h-3 bg-black" />
                    </div>
                    <span className="my-0.5 tracking-tighter">SCAN PASS</span>
                    <div className="w-full flex justify-between">
                      <div className="w-3 h-3 bg-black" />
                      <div className="w-1.5 h-1.5 bg-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isStandaloneTab) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-4xl w-full my-auto">
        {content}
      </div>
    </div>
  );
};
