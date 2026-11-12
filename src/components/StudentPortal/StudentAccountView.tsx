import React from 'react';
import {
  User,
  GraduationCap,
  Award,
  QrCode,
  ShieldCheck,
  Mail,
  Building,
  KeyRound,
  CheckCircle2,
  Lock,
  School,
  Palette,
  Bot,
  ExternalLink,
  Moon,
  Sun,
  Cpu,
  Sparkles
} from 'lucide-react';
import { StudentProfile } from '../../types/index.ts';
import { getHouseConfig } from '../../utils/houseThemes.ts';
import { AppTheme, APP_THEMES } from '../../utils/themeManager.ts';
import { playSuccessChime } from '../../utils/soundEffects.ts';

interface StudentAccountViewProps {
  student: StudentProfile;
  registeredCount: number;
  currentTheme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  onOpenDigitalId: () => void;
  onOpenStudyBot?: () => void;
  onElevateToAdmin?: () => void;
  onLogout: () => void;
}

export const StudentAccountView: React.FC<StudentAccountViewProps> = ({
  student,
  registeredCount,
  currentTheme = 'dark',
  onSelectTheme,
  onOpenDigitalId,
  onOpenStudyBot,
  onElevateToAdmin,
  onLogout
}) => {
  const houseConfig = getHouseConfig(student.house);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-md">
            Student Profile & Identification
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-2">
            My KinetiQ Student Account
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Verified student record for {student.schoolName || "St. Jude's Academy"} with house standing and class allocations.
          </p>
        </div>

        <button
          onClick={onOpenDigitalId}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>Open Digital Pass</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800">
          <div
            className="w-16 h-16 rounded-3xl text-white flex items-center justify-center font-black text-2xl shadow-xl"
            style={{
              backgroundColor: houseConfig.hex,
              boxShadow: `0 10px 25px -5px ${houseConfig.hex}50`
            }}
          >
            {student.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white font-heading">{student.name}</h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Verified Student
              </span>
            </div>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
              <span>{student.email}</span>
              <span>•</span>
              <span className="font-mono text-cyan-400">{student.studentIdNumber}</span>
              <span>•</span>
              <span className="text-slate-300 font-semibold">{student.schoolName || "St. Jude's Academy"}</span>
            </div>
          </div>
        </div>

        {/* Academic Allocation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Year Group
            </span>
            <div className="text-base font-black text-white">Year {student.yearGroup}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Class & Section
            </span>
            <div className="text-base font-black text-white">
              {student.className || '10-A'} ({student.sectionName || 'Alpha'})
            </div>
          </div>

          <div
            className="p-4 rounded-2xl border space-y-1"
            style={{
              backgroundColor: `${houseConfig.hex}15`,
              borderColor: `${houseConfig.hex}40`
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>PE House Team</span>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: houseConfig.hex }} />
            </span>
            <div className="text-base font-black" style={{ color: houseConfig.hex }}>
              {houseConfig.name} ({houseConfig.colorName})
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Merit Standing
            </span>
            <div className="text-base font-black text-cyan-400">{student.points} Points</div>
          </div>
        </div>

        {/* Visual Theme Customizer (Dark, Light, Robotic, Cool) */}
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Theme & Appearance Customisation
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              Current: {APP_THEMES[currentTheme]?.name || 'Midnight Dark'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Personalise how KinetiQ Planner looks during your study sessions and event tracking:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {(['dark', 'light', 'robotic', 'cool'] as AppTheme[]).map((themeKey) => {
              const cfg = APP_THEMES[themeKey];
              const isCurrent = currentTheme === themeKey;
              return (
                <button
                  key={themeKey}
                  onClick={() => {
                    playSuccessChime();
                    if (onSelectTheme) onSelectTheme(themeKey);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isCurrent
                      ? 'bg-indigo-950/70 border-cyan-400 ring-2 ring-cyan-400/30 text-white'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {themeKey === 'dark' && <Moon className="w-4 h-4 text-cyan-400" />}
                    {themeKey === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
                    {themeKey === 'robotic' && <Cpu className="w-4 h-4 text-emerald-400" />}
                    {themeKey === 'cool' && <Sparkles className="w-4 h-4 text-purple-400" />}
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{cfg.name}</div>
                    <div className="text-[10px] text-slate-400 leading-tight truncate">{cfg.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Connected EduBot AI Assistant Integration */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-purple-950/40 border border-cyan-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                EduBot AI Study Coach Connected
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
              Live & Synced
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            EduBot is personalized with your <strong>Year {student.yearGroup}</strong> classes, <strong>{student.className || '10-A'}</strong> timetable, and <strong>{student.house} House</strong> challenges. For deep interactive study sessions and flashcards:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {onOpenStudyBot && (
              <button
                onClick={onOpenStudyBot}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Chat with EduBot</span>
              </button>
            )}
            <a
              href="https://nifty-smart-study-bot.base44.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Visit EduBot Main Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Official Records & House Protection Notice */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Official School Records & House Assignment:</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Verified by School Admin
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Your school affiliation ({student.schoolName || "St. Jude's Academy"}) and PE House membership ({houseConfig.label}) are securely locked to protect official academic and athletic records. To request a cohort transfer or house reassignment, please contact your Head of Year or Activities Lead.
          </p>
        </div>

        {/* Security & Access Notice */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Strict Role-Based Security:</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Your account is authenticated as a Student. You have direct access to your events catalog, personalized calendar, anonymous feedback, and digital QR passes. Access to faculty administrative panels is strictly prevented.
          </p>
        </div>



        {/* Account Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Powered by: SMR TechNova • KinetiQ Planner
          </span>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Sign Out of KinetiQ Planner
          </button>
        </div>
      </div>
    </div>
  );
};
