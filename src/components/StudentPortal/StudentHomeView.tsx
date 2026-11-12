import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  QrCode,
  Award,
  Zap,
  TrendingUp,
  Bot,
  ExternalLink,
  Flame,
  BookOpen,
  Volume2,
  Trophy,
  Target,
  Check,
  Star,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SchoolEvent, StudentProfile, ConsentSubmission, NotificationItem } from '../../types/index.ts';
import { getHouseConfig, PE_HOUSES, HOUSE_NAMES } from '../../utils/houseThemes.ts';
import { playHouseCheer, playSuccessChime, playUiClick } from '../../utils/soundEffects.ts';
import { CampusActivityFeed } from '../CampusActivityFeed.tsx';

interface StudentHomeViewProps {
  student: StudentProfile;
  events: SchoolEvent[];
  consentSubmissions: ConsentSubmission[];
  notifications: NotificationItem[];
  onChangeTab: (tab: string) => void;
  onOpenDigitalId: () => void;
  onOpenConsentModal: (event: SchoolEvent) => void;
  onOpenStudyBot?: () => void;
}

export const StudentHomeView: React.FC<StudentHomeViewProps> = ({
  student,
  events,
  consentSubmissions,
  notifications,
  onChangeTab,
  onOpenDigitalId,
  onOpenConsentModal,
  onOpenStudyBot
}) => {
  const registeredEvents = events.filter(e => e.registeredStudentIds.includes(student.id));
  const upcomingEvents = events.filter(e => e.status === 'UPCOMING');
  const unreadNotifs = notifications.filter(n => !n.read);
  const houseConfig = getHouseConfig(student.house);

  // House Spirit Cheer State
  const [cheerCount, setCheerCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`kinetiq_cheers_${student.house}`);
      return saved ? parseInt(saved, 10) : 142;
    } catch {
      return 142;
    }
  });
  const [hasCheeredToday, setHasCheeredToday] = useState(false);

  // Gamified Quests State
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`kinetiq_claimed_quests_${student.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bonusPoints, setBonusPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`kinetiq_bonus_points_${student.id}`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Handle House Cheer
  const handleCheerForHouse = () => {
    playHouseCheer();
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.65 },
        colors: [houseConfig.hex, '#ffffff', '#fbbf24']
      });
    } catch {
      // Fallback
    }

    setCheerCount(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem(`kinetiq_cheers_${student.house}`, String(next));
      } catch {}
      return next;
    });
    setHasCheeredToday(true);
  };

  // Claim Quest Reward
  const handleClaimQuest = (questId: string, rewardPts: number) => {
    playSuccessChime();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}

    const updated = { ...claimedQuests, [questId]: true };
    setClaimedQuests(updated);
    const newBonus = bonusPoints + rewardPts;
    setBonusPoints(newBonus);

    try {
      localStorage.setItem(`kinetiq_claimed_quests_${student.id}`, JSON.stringify(updated));
      localStorage.setItem(`kinetiq_bonus_points_${student.id}`, String(newBonus));
    } catch {}
  };

  // Check if any registered event has pending consent
  const pendingConsentEvents = registeredEvents.filter(e => {
    if (!e.requiresParentConsent) return false;
    const sub = consentSubmissions.find(s => s.eventId === e.id && s.studentId === student.id);
    return !sub || sub.status !== 'APPROVED';
  });

  // Calculate sorted house standings
  const sortedHouses = [...HOUSE_NAMES].map(h => PE_HOUSES[h]).sort((a, b) => b.points - a.points);

  const displayPoints = student.points + bonusPoints;

  // Quests list
  const quests = [
    {
      id: 'cheer_rally',
      title: 'School Spirit Rally',
      desc: `Tap to cheer for ${student.house} House today`,
      points: 15,
      completed: hasCheeredToday || cheerCount > 142
    },
    {
      id: 'event_rsvp',
      title: 'Event Pioneer',
      desc: 'Maintain at least 1 confirmed event pass',
      points: 25,
      completed: registeredEvents.length > 0
    },
    {
      id: 'study_sync',
      title: 'Academic Focus Sprint',
      desc: 'Launch EduBot for an active recall study session',
      points: 30,
      completed: !!claimedQuests['study_sync']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {student.schoolName || "St. Jude's Academy"}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5"
              style={{
                backgroundColor: `${houseConfig.hex}25`,
                color: houseConfig.hex,
                border: `1px solid ${houseConfig.hex}50`
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: houseConfig.hex }} />
              <span>{houseConfig.label} ({houseConfig.colorName})</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight leading-tight">
            Welcome back, {student.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Year {student.yearGroup} • Class {student.className || '10-A'} (Section {student.sectionName || 'Alpha'}). You have {registeredEvents.length} active event passes and {displayPoints} house merit points.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <a
            href="https://nifty-smart-study-bot.base44.app"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playUiClick()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-white" />
            <span>EduBot AI Coach ↗</span>
          </a>
          <button
            onClick={() => {
              playUiClick();
              onOpenDigitalId();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all border border-slate-700 hover:border-cyan-400/50 flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>Digital Student Pass</span>
          </button>
        </div>
      </div>

      {/* Outstanding Consent Alert Banner (If Any) */}
      {pendingConsentEvents.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-900/60 text-amber-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-white text-xs font-bold">
                Parental Consent Pending ({pendingConsentEvents.length} Event{pendingConsentEvents.length > 1 ? 's' : ''})
              </strong>
              <span className="text-[11px] text-amber-300/90">
                "{pendingConsentEvents[0].title}" requires electronic parent or guardian permission before attendance is confirmed.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              playUiClick();
              onOpenConsentModal(pendingConsentEvents[0]);
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Complete E-Consent Form
          </button>
        </div>
      )}

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => {
            playUiClick();
            onChangeTab('my-registrations');
          }}
          className="bg-slate-900/90 hover:bg-slate-850 p-4 sm:p-5 rounded-3xl border border-slate-800 transition-all cursor-pointer space-y-1.5 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>My Registrations</span>
            <Calendar className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white">{registeredEvents.length}</div>
          <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
            <span>Confirmed spots</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div
          onClick={() => {
            playUiClick();
            onChangeTab('calendar');
          }}
          className="bg-slate-900/90 hover:bg-slate-850 p-4 sm:p-5 rounded-3xl border border-slate-800 transition-all cursor-pointer space-y-1.5 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Personal Calendar</span>
            <Clock className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white">{upcomingEvents.length}</div>
          <div className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
            <span>Active schedule</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div
          onClick={() => {
            playUiClick();
            onOpenDigitalId();
          }}
          className="bg-slate-900/90 hover:bg-slate-850 p-4 sm:p-5 rounded-3xl border border-slate-800 transition-all cursor-pointer space-y-1.5 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>House Merit Points</span>
            <Award className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: houseConfig.hex }} />
          </div>
          <div className="text-3xl font-black" style={{ color: houseConfig.hex }}>{displayPoints}</div>
          <div className="text-[11px] font-bold" style={{ color: houseConfig.hex }}>
            <span>{houseConfig.name} House</span>
          </div>
        </div>

        <div
          onClick={() => {
            playUiClick();
            onChangeTab('feedback');
          }}
          className="bg-slate-900/90 hover:bg-slate-850 p-4 sm:p-5 rounded-3xl border border-slate-800 transition-all cursor-pointer space-y-1.5 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Anonymous Voice</span>
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white">Active</div>
          <div className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
            <span>Share feedback</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* PE Houses Standings & Interactive House Spirit Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PE House Leaderboard with Cheer Arena (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h3 className="text-base font-black text-white font-heading">
                  School PE House Championship Standings
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official ranking across athletics, debates, and academic tournaments
              </p>
            </div>

            {/* Interactive Cheer Button */}
            <button
              onClick={handleCheerForHouse}
              className="px-3.5 py-1.5 rounded-xl text-white font-black text-xs transition-all flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer self-start sm:self-auto"
              style={{
                backgroundColor: houseConfig.hex,
                boxShadow: `0 4px 14px ${houseConfig.hex}40`
              }}
              title={`Cheer for ${houseConfig.name} House to boost school spirit!`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Cheer for {houseConfig.name}! ({cheerCount})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {sortedHouses.map((h, idx) => {
              const isMyHouse = h.name === student.house;
              return (
                <div
                  key={h.name}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                    isMyHouse ? 'ring-2 ring-white/60 shadow-lg' : ''
                  }`}
                  style={{
                    backgroundColor: `${h.hex}15`,
                    borderColor: isMyHouse ? h.hex : `${h.hex}40`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400">#{idx + 1}</span>
                    <div className="w-3 h-3 rounded-full shadow-xs" style={{ backgroundColor: h.hex }} />
                  </div>
                  <div>
                    <span className="text-xs font-black block text-white truncate">
                      {h.name}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate">
                      {h.colorName}
                    </span>
                    <div className="text-sm font-extrabold mt-1 font-heading" style={{ color: h.hex }}>
                      {h.points + (isMyHouse ? cheerCount : 0)} pts
                    </div>
                  </div>
                  {isMyHouse ? (
                    <span className="text-[8px] font-black uppercase tracking-wider text-center py-0.5 rounded bg-white/20 text-white">
                      My House
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-500 font-medium text-center">
                      Official Team
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">★ House Motto:</span>
              <span className="italic text-slate-300 font-medium">"{houseConfig.tagline}"</span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Official KinetiQ League</span>
          </div>
        </div>

        {/* EduBot AI Integration Tile (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-3xl border border-indigo-700/60 p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                <span>EduBot AI</span>
              </span>
              <a
                href="https://nifty-smart-study-bot.base44.app"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                title="Launch standalone EduBot study portal"
              >
                <span>Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h3 className="text-base font-black text-white font-heading">
              EduBot
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pomodoro study sprints, flashcard testing, and smart exam schedules synced with your school event calendar.
            </p>
          </div>

          <div className="relative z-10 pt-2 border-t border-indigo-800/60 flex items-center gap-2">
            <a
              href="https://nifty-smart-study-bot.base44.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playUiClick()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Launch EduBot Website ↗</span>
            </a>
          </div>

          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Gamified Daily School Quests Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-black text-white font-heading">
                Campus Missions & House Merit Bounties
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete school engagement activities to earn bonus points for your personal record and {student.house} House
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-800/60">
            +{bonusPoints} Pts Earned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quests.map(q => {
            const isClaimed = !!claimedQuests[q.id];
            return (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{q.title}</span>
                    <span className="text-[10px] font-black text-amber-300 font-mono">+{q.points} pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{q.desc}</p>
                </div>

                <div>
                  {isClaimed ? (
                    <div className="py-1.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Reward Claimed</span>
                    </div>
                  ) : q.completed ? (
                    <button
                      onClick={() => handleClaimQuest(q.id, q.points)}
                      className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-950/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer animate-pulse"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-300" />
                      <span>Claim +{q.points} Points!</span>
                    </button>
                  ) : (
                    <div className="py-1.5 px-3 rounded-xl bg-slate-850 text-slate-500 text-xs font-medium text-center">
                      In Progress
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Upcoming Events Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white font-heading">
              Featured School Activities
            </h3>
            <p className="text-xs text-slate-400">
              Discover highlights across athletics, sciences, arts, and leadership
            </p>
          </div>
          <button
            onClick={() => {
              playUiClick();
              onChangeTab('events');
            }}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All ({events.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No School Activities Published Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your school faculty and organizers will publish upcoming activities and house tournaments here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.slice(0, 3).map(event => {
              const isRegistered = event.registeredStudentIds.includes(student.id);

              return (
                <div
                  key={event.id}
                  className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cyan-400 font-bold">{event.category}</span>
                      <span className="text-slate-400 text-[11px]">{event.date}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {event.location.split('(')[0]}
                    </span>
                    {isRegistered ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          playUiClick();
                          onChangeTab('events');
                        }}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        View Details →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real-time Campus Action Stream (See what admins & students are doing) */}
      <CampusActivityFeed
        currentUser={student}
        onNavigateToTab={onChangeTab}
      />
    </div>
  );
};
