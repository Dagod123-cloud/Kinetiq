import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  QrCode,
  Flame,
  Award,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  User,
  Building,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, OrganiserProfile, HouseName } from '../../types/index.ts';
import { INITIAL_STUDENTS, INITIAL_ORGANISERS } from '../../data/seedData.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginStudent: (student: StudentProfile) => void;
  onLoginOrganiser: (organiser: OrganiserProfile) => void;
  currentStudent: StudentProfile;
  currentRole: 'STUDENT' | 'ORGANISER';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginStudent,
  onLoginOrganiser,
  currentStudent,
  currentRole
}) => {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'ORGANISER'>('STUDENT');

  // Custom Student Form
  const [customName, setCustomName] = useState('');
  const [customYear, setCustomYear] = useState<number>(10);
  const [customHouse, setCustomHouse] = useState<HouseName>('Crimson');
  const [customStudentId, setCustomStudentId] = useState('SJ-2024-9912');
  const [customPin, setCustomPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Selected quick profile for preview
  const [previewStudent, setPreviewStudent] = useState<StudentProfile>(currentStudent);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback
    }
  };

  const handleSelectStudent = async (student: StudentProfile) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: student.email || student.username || student.id,
          password: 'StudentPass2026!'
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token && data.user) {
        localStorage.setItem('kinetiq_session_token', data.token);
        onLoginStudent(data.user);
        triggerConfetti();
        onClose();
        return;
      }
    } catch (err) {
      console.warn('Student login API error, falling back to local state:', err);
    }
    onLoginStudent(student);
    triggerConfetti();
    onClose();
  };

  const handleSelectOrganiser = async (org: OrganiserProfile) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: org.email || org.name,
          password: 'OrganiserPass2026!'
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token && data.user) {
        localStorage.setItem('kinetiq_session_token', data.token);
        onLoginOrganiser(data.user);
        triggerConfetti();
        onClose();
        return;
      }
    } catch (err) {
      console.warn('Organiser login API error, falling back to local state:', err);
    }
    onLoginOrganiser(org);
    triggerConfetti();
    onClose();
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setLoginError('Please enter your full name');
      return;
    }

    const newStudent: StudentProfile = {
      id: `stu-${Date.now()}`,
      name: customName.trim(),
      email: `${customName.toLowerCase().replace(/\s+/g, '.')}@stmarys.edu`,
      schoolName: "St' Mary's Private High School",
      yearGroup: Number(customYear),
      avatarSeed: customName,
      studentIdNumber: customStudentId.trim() || `SM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      house: customHouse,
      houseVerified: true,
      className: `${customYear}-A`,
      sectionName: 'Alpha',
      role: 'STUDENT',
      points: 150
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: newStudent.email,
          username: newStudent.name.toLowerCase().replace(/\s+/g, '.'),
          password: customPin || 'StudentPass2026!'
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token && data.user) {
        localStorage.setItem('kinetiq_session_token', data.token);
        onLoginStudent(data.user);
        triggerConfetti();
        onClose();
        return;
      }
    } catch (err) {
      console.warn('Custom student login API error:', err);
    }

    onLoginStudent(newStudent);
    triggerConfetti();
    onClose();
  };

  const getHouseGradient = (house: HouseName) => {
    switch (house) {
      case 'Crimson':
        return 'from-rose-600 to-red-700';
      case 'Tiger':
        return 'from-orange-500 to-amber-600';
      case 'Amber':
        return 'from-amber-500 to-yellow-600';
      case 'Lime':
        return 'from-lime-500 to-emerald-600';
      case 'Sapphire':
        return 'from-blue-600 to-cyan-500';
      default:
        return 'from-indigo-600 to-violet-600';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      role="dialog"
      aria-label="School portal authentication"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl text-slate-100 my-8">
        {/* Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-lg text-white">
                  St' Mary's Private High School Portal
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Secure Access
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sign in to customize your personal calendar & submit ideas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close login dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Toggle Bar */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('STUDENT')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'STUDENT'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Pass Sign-In</span>
            </button>
            <button
              onClick={() => setActiveTab('ORGANISER')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'ORGANISER'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Faculty & Organiser Portal</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'STUDENT' ? (
            <div className="space-y-4">
              {/* Quick 1-Tap Demo Student Account */}
              {INITIAL_STUDENTS.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      {INITIAL_STUDENTS[0].name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{INITIAL_STUDENTS[0].name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30 font-medium">Demo Student</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Year {INITIAL_STUDENTS[0].yearGroup} • {INITIAL_STUDENTS[0].house} House
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectStudent(INITIAL_STUDENTS[0])}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    1-Click Sign In →
                  </button>
                </div>
              )}

              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
                <span className="font-bold text-white block mb-0.5">
                  Or Sign In / Launch New Student Pass:
                </span>
                Enter your name and details below to access your personal timetable and PE House dashboard.
              </div>

              {/* Student Entry Form */}
              <div className="pt-2">
                <form onSubmit={handleCustomSubmit} className="space-y-3 p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
                  {loginError && (
                    <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 p-2 rounded-xl">
                      {loginError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="E.g., Samantha Reed"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Year Group
                      </label>
                      <select
                        value={customYear}
                        onChange={(e) => setCustomYear(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        {[7, 8, 9, 10, 11, 12, 13].map((y) => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        House Affiliation
                      </label>
                      <select
                        value={customHouse}
                        onChange={(e) => setCustomHouse(e.target.value as HouseName)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Crimson">Crimson (Deep Crimson Red)</option>
                        <option value="Tiger">Tiger (Tiger Orange)</option>
                        <option value="Amber">Amber (Golden Amber)</option>
                        <option value="Lime">Lime (Bright Lime Green)</option>
                        <option value="Sapphire">Sapphire (Sapphire Blue)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Student Password / PIN
                      </label>
                      <input
                        type="password"
                        value={customPin}
                        onChange={(e) => setCustomPin(e.target.value)}
                        placeholder="e.g. StudentPass2026!"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Launch Student Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* ORGANISER TAB */
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/40 rounded-2xl border border-purple-800/40 text-xs text-purple-200 leading-relaxed">
                <span className="font-bold text-white block mb-1">
                  Faculty & Leadership Access
                </span>
                Staff credentials grant access to event publishing, schedule conflict resolvers, room reassignments, and the AI Feedback Analysis Assistant.
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Select Organiser / Faculty Identity:
                </label>
                {INITIAL_ORGANISERS.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => handleSelectOrganiser(org)}
                    className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {org.name.charAt(0) || 'O'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          {org.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {org.title}
                        </div>
                        <div className="text-[10px] text-purple-400">
                          {org.department}
                        </div>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-purple-900/50 border border-purple-500/30 text-[11px] font-bold text-purple-200 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      Access Command Hub →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

