import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ExternalLink,
  BookOpen,
  Award,
  Calendar,
  Maximize2,
  Minimize2,
  RefreshCw,
  School,
  CheckCircle2,
  Flame,
  Zap,
  Loader2,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Layers,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, SchoolEvent, HouseName } from '../../types/index.ts';
import { getHouseConfig } from '../../utils/houseThemes.ts';
import { playTimerBell, playSuccessChime, playUiClick } from '../../utils/soundEffects.ts';

interface SmartStudyBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: StudentProfile | null;
  events?: SchoolEvent[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface Flashcard {
  id: number;
  subject: string;
  question: string;
  answer: string;
  hint?: string;
}

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 1,
    subject: 'Active Recall',
    question: 'What is the optimal Pomodoro sprint interval for high school revision?',
    answer: '25 minutes of high-intensity focused work followed by a 5-minute active break (stretching, hydration, no screens).',
    hint: '25 / 5 Rule'
  },
  {
    id: 2,
    subject: 'Mathematics',
    question: 'What is the quadratic formula used to solve ax² + bx + c = 0?',
    answer: 'x = (-b ± √(b² - 4ac)) / (2a)',
    hint: 'Negative b plus or minus square root...'
  },
  {
    id: 3,
    subject: 'Biology & Science',
    question: 'Which organelle is known as the powerhouse of eukaryotic cells?',
    answer: 'The Mitochondria (generates ATP through aerobic cellular respiration).',
    hint: 'Produces ATP'
  },
  {
    id: 4,
    subject: 'Computer Science',
    question: 'What is the time complexity of binary search on a sorted array of n items?',
    answer: 'O(log n) logarithmic time complexity.',
    hint: 'Repeatedly divides the search range in half'
  },
  {
    id: 5,
    subject: 'School PE Houses',
    question: 'Which official house in KinetiQ Planner represents the color Deep Crimson Red?',
    answer: 'Crimson House (Motto: "Courage, Passion & Victory").',
    hint: 'One of the 5 official school PE houses'
  },
  {
    id: 6,
    subject: 'Study Strategy',
    question: 'How should you schedule revision on days when you participate in a school sports event?',
    answer: 'Complete heavy revision blocks the day before, take a 20-minute light flashcard review after the event, and get 8 hours of sleep for muscle and memory recovery.',
    hint: 'Pre-event buffer + post-event light recall'
  }
];

export const SmartStudyBotModal: React.FC<SmartStudyBotModalProps> = ({
  isOpen,
  onClose,
  student,
  events = []
}) => {
  const [activeView, setActiveView] = useState<'AI_CHAT' | 'POMODORO_TIMER' | 'FLASHCARDS' | 'CONNECTED_APP'>('AI_CHAT');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${student ? student.name : 'there'}! 👋 I am **EduBot**, your AI academic & school event coach.\n\nI am connected to your school profile (${student?.schoolName || "St. Jude's Academy"}) and the official study portal at **https://nifty-smart-study-bot.base44.app**.\n\nAsk me how to balance your revision timetable with upcoming school events, start a 25-minute Pomodoro focus sprint, or boost merit points for **${student?.house || 'Crimson'} House**!`,
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Pomodoro Timer State
  const [timerDuration, setTimerDuration] = useState(25 * 60); // 25 mins
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [studySubject, setStudySubject] = useState('Mathematics & Sciences');
  const [studyNotes, setStudyNotes] = useState('');

  // Flashcards State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const houseCfg = getHouseConfig(student?.house || 'Crimson');

  // Pomodoro interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timerRunning && timeLeft === 0) {
      setTimerRunning(false);
      playTimerBell();
      try {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      } catch {}

      if (timerMode === 'FOCUS') {
        alert('🎉 Focus sprint completed! Time for a 5-minute active break.');
        setTimerMode('BREAK');
        setTimeLeft(5 * 60);
        setTimerDuration(5 * 60);
      } else {
        alert('Break finished! Ready for your next study session.');
        setTimerMode('FOCUS');
        setTimeLeft(25 * 60);
        setTimerDuration(25 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeLeft, timerMode]);

  useEffect(() => {
    if (activeView === 'AI_CHAT') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeView]);

  if (!isOpen) return null;

  const quickPrompts = [
    `How do I balance my school events with revision for Year ${student?.yearGroup || 10}?`,
    `Build a 5-day active recall study plan with 25-minute Pomodoro sessions`,
    `How can ${student?.house || 'Crimson'} House win the Inter-House Championship?`,
    `Give me Cornell note-taking tips for upcoming science exams`
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    playUiClick();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const studentContext = student ? {
        name: student.name,
        schoolName: student.schoolName || "St. Jude's Academy",
        yearGroup: student.yearGroup,
        className: student.className || '10-A',
        house: student.house,
        points: student.points,
        events: events.filter(e => e.registeredStudentIds?.includes(student.id)).map(e => ({
          title: e.title,
          date: e.date,
          category: e.category
        }))
      } : undefined;

      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/ai/study-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          studentContext
        })
      });

      const data = await res.json();
      playSuccessChime();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Here is your study and event planning advice!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Here is a quick study recommendation: Use the **Pomodoro technique** (25 min study, 5 min break), review your registered events on your calendar, and check the standalone app at https://nifty-smart-study-bot.base44.app for flashcards!`,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    playUiClick();
    setTimerRunning(true);
  };

  const handlePauseTimer = () => {
    playUiClick();
    setTimerRunning(false);
  };

  const handleResetTimer = () => {
    playUiClick();
    setTimerRunning(false);
    const defaultTime = timerMode === 'FOCUS' ? 25 * 60 : 5 * 60;
    setTimeLeft(defaultTime);
    setTimerDuration(defaultTime);
  };

  const currentFlashcard = DEFAULT_FLASHCARDS[cardIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-label="Smart Study Bot"
    >
      <div
        className={`bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 transition-all ${
          isFullscreen
            ? 'w-full h-full max-w-none rounded-none'
            : 'max-w-4xl w-full h-[88vh]'
        }`}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base sm:text-lg text-white">
                  EduBot
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  AI Study Coach
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{student?.schoolName || "St. Jude's Academy"}</span>
                <span>•</span>
                <span style={{ color: houseCfg.hex }} className="font-bold">{houseCfg.name} House</span>
                <span>•</span>
                <span className="text-slate-500 hidden sm:inline">https://nifty-smart-study-bot.base44.app</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center p-0.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  playUiClick();
                  setActiveView('AI_CHAT');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'AI_CHAT'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Coach</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setActiveView('POMODORO_TIMER');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'POMODORO_TIMER'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Pomodoro Sprint</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setActiveView('FLASHCARDS');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'FLASHCARDS'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcards</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setActiveView('CONNECTED_APP');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'CONNECTED_APP'
                    ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Portal</span>
              </button>
            </div>

            <a
              href="https://nifty-smart-study-bot.base44.app"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Open full EduBot Study Portal in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => {
                playUiClick();
                setIsFullscreen(!isFullscreen);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                playUiClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="sm:hidden grid grid-cols-4 p-1.5 bg-slate-950 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveView('AI_CHAT')}
            className={`py-1.5 rounded-lg font-bold transition-all text-center text-[11px] ${
              activeView === 'AI_CHAT' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            AI Coach
          </button>
          <button
            onClick={() => setActiveView('POMODORO_TIMER')}
            className={`py-1.5 rounded-lg font-bold transition-all text-center text-[11px] ${
              activeView === 'POMODORO_TIMER' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => setActiveView('FLASHCARDS')}
            className={`py-1.5 rounded-lg font-bold transition-all text-center text-[11px] ${
              activeView === 'FLASHCARDS' ? 'bg-violet-600 text-white' : 'text-slate-400'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setActiveView('CONNECTED_APP')}
            className={`py-1.5 rounded-lg font-bold transition-all text-center text-[11px] ${
              activeView === 'CONNECTED_APP' ? 'bg-purple-600 text-white' : 'text-slate-400'
            }`}
          >
            Portal
          </button>
        </div>

        {/* Tab 1: AI Chat Assistant */}
        {activeView === 'AI_CHAT' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/60">
            {/* Context Capsule Bar */}
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] flex flex-wrap items-center justify-between gap-2 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <School className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{student?.schoolName || "St. Jude's Academy"}</span>
                </span>
                <span>•</span>
                <span>Year {student?.yearGroup || 10} ({student?.className || '10-A'})</span>
                <span>•</span>
                <span className="font-bold flex items-center gap-1" style={{ color: houseCfg.hex }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: houseCfg.hex }} />
                  <span>{houseCfg.name} House</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Model: Gemini 3.8 Flash • SMR TechNova
              </span>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                        isUser
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white'
                          : 'bg-indigo-950 border border-indigo-700 text-cyan-300'
                      }`}
                    >
                      {isUser ? (student?.name?.charAt(0) || 'U') : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md rounded-tr-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-xl rounded-tl-xs whitespace-pre-line'
                      }`}
                    >
                      <div className="font-sans whitespace-pre-wrap">{msg.text}</div>

                      {/* Interactive EduBot Main Website Card */}
                      {!isUser && msg.text.includes('https://nifty-smart-study-bot.base44.app') && (
                        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/40 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                            <span>Official EduBot Main Website Link</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            Click below to open the full interactive EduBot study suite with flashcards, quizzes, and focus tools:
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <a
                              href="https://nifty-smart-study-bot.base44.app"
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-950/50"
                            >
                              <span>🚀 Launch EduBot Main Website</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setActiveView('CONNECTED_APP')}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                            >
                              View in Embedded Tab
                            </button>
                          </div>
                        </div>
                      )}

                      <div
                        className={`text-[9px] mt-1.5 font-mono ${
                          isUser ? 'text-cyan-100 text-right' : 'text-slate-500'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-700 text-cyan-300 flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>EduBot is analyzing your question...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/60 overflow-x-auto no-scrollbar flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">
                Quick Prompts:
              </span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {p.length > 40 ? `${p.substring(0, 38)}...` : p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask EduBot about revision schedules, school events, or house merit tips..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Pomodoro Focus Timer */}
        {activeView === 'POMODORO_TIMER' && (
          <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto bg-slate-950/80 items-center justify-center space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Academic Sprint Engine
              </span>
              <h4 className="text-2xl font-black text-white font-heading">
                {timerMode === 'FOCUS' ? 'Focused Study Session' : 'Active Rest Break'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                25 minutes of deep undistracted study followed by a 5-minute break to maximize memory retention.
              </p>
            </div>

            {/* Big Circular Clock */}
            <div className="relative w-56 h-56 rounded-full bg-slate-900 border-4 border-indigo-600/50 flex flex-col items-center justify-center shadow-2xl shadow-indigo-950/80">
              <div className="text-5xl font-black font-mono tracking-tight text-white">
                {formatTimer(timeLeft)}
              </div>
              <span className="text-xs font-bold text-cyan-400 mt-2 uppercase tracking-widest">
                {timerMode}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3">
              {!timerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Focus Sprint</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause Timer</span>
                </button>
              )}

              <button
                onClick={handleResetTimer}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Target Subject & Session Notes */}
            <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Target Revision Subject</label>
                <input
                  type="text"
                  value={studySubject}
                  onChange={(e) => setStudySubject(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. Year 10 Physics or History Exam"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Session Goal / Key Takeaways</label>
                <input
                  type="text"
                  value={studyNotes}
                  onChange={(e) => setStudyNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. Master quadratic equations & review 10 flashcards"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Revision Flashcards */}
        {activeView === 'FLASHCARDS' && (
          <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto bg-slate-950/80 items-center justify-between space-y-6">
            <div className="w-full max-w-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-400">Card {cardIndex + 1} of {DEFAULT_FLASHCARDS.length}</span>
                <h4 className="text-lg font-black text-white font-heading">
                  Subject: {currentFlashcard.subject}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-800/60">
                {masteredCards.length} Mastered
              </span>
            </div>

            {/* 3D Flip Flashcard */}
            <div
              onClick={() => {
                playUiClick();
                setIsFlipped(!isFlipped);
              }}
              className="w-full max-w-xl h-64 sm:h-72 rounded-3xl p-8 bg-gradient-to-br from-slate-900 to-indigo-950/90 border-2 border-indigo-700/60 hover:border-cyan-400/80 transition-all shadow-2xl flex flex-col justify-between cursor-pointer relative group text-center select-none"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-[10px]">
                  {isFlipped ? 'ANSWER' : 'QUESTION'}
                </span>
                <span className="text-[11px] text-cyan-400 font-semibold group-hover:underline">
                  Click to {isFlipped ? 'Show Question' : 'Reveal Answer'} ↻
                </span>
              </div>

              <div className="my-auto space-y-3">
                <p className="text-base sm:text-xl font-bold text-white leading-relaxed">
                  {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
                </p>
                {!isFlipped && currentFlashcard.hint && (
                  <p className="text-xs text-slate-400 italic">Hint: {currentFlashcard.hint}</p>
                )}
              </div>

              <div className="text-[10px] text-slate-500">
                KinetiQ Revision Deck • Powered by EduBot
              </div>
            </div>

            {/* Flashcard Nav Controls */}
            <div className="w-full max-w-xl flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  playUiClick();
                  setIsFlipped(false);
                  setCardIndex(i => (i > 0 ? i - 1 : DEFAULT_FLASHCARDS.length - 1));
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => {
                  playSuccessChime();
                  if (!masteredCards.includes(currentFlashcard.id)) {
                    setMasteredCards(prev => [...prev, currentFlashcard.id]);
                  }
                  setIsFlipped(false);
                  setCardIndex(i => (i < DEFAULT_FLASHCARDS.length - 1 ? i + 1 : 0));
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Mastered & Next</span>
              </button>

              <button
                onClick={() => {
                  playUiClick();
                  setIsFlipped(false);
                  setCardIndex(i => (i < DEFAULT_FLASHCARDS.length - 1 ? i + 1 : 0));
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Connected Nifty Smart Study Bot Standalone Iframe Portal */}
        {activeView === 'CONNECTED_APP' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* Iframe Action Top Bar */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">Connected App:</span>
                <span className="text-cyan-300 font-mono text-[11px]">https://nifty-smart-study-bot.base44.app</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIframeKey(k => k + 1)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reload embedded app frame"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload Frame</span>
                </button>
                <a
                  href="https://nifty-smart-study-bot.base44.app"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Open Full Window</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Embedded Iframe Container */}
            <div className="flex-1 relative bg-slate-950">
              <iframe
                key={iframeKey}
                src="https://nifty-smart-study-bot.base44.app"
                title="EduBot Study Portal"
                className="w-full h-full border-0"
                allow="microphone; camera; clipboard-write;"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
