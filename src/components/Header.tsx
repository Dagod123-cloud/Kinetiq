import React, { useState } from 'react';
import {
  Calendar,
  Bell,
  Users,
  GraduationCap,
  Sparkles,
  ChevronDown,
  LogIn,
  QrCode,
  ShieldCheck,
  Crown,
  Award,
  Zap,
  LogOut,
  Palette,
  FileText,
  Home,
  CheckCircle2,
  Settings,
  HelpCircle,
  Clock,
  Search,
  Volume2,
  VolumeX,
  Bot,
  Radio,
  Film
} from 'lucide-react';
import { StudentProfile, OrganiserProfile, NotificationItem, HouseName, UserAccount } from '../types/index.ts';
import { NotificationPopover } from './NotificationPopover.tsx';
import { isSoundMuted, toggleSoundMute, playUiClick, playSuccessChime } from '../utils/soundEffects.ts';

interface HeaderProps {
  currentUser: UserAccount;
  onLogout: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onOpenDigitalId?: () => void;
  onOpenLoginModal?: () => void;
  onOpenStudyBot?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenThemeModal?: () => void;
  onOpenIntro?: () => void;
  onElevateToAdmin?: () => void;
  students?: StudentProfile[];
  onChangeStudent?: (student: StudentProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  notifications,
  onMarkAllAsRead,
  activeTab,
  onChangeTab,
  onOpenDigitalId,
  onOpenLoginModal,
  onOpenStudyBot,
  onOpenCommandPalette,
  onOpenThemeModal,
  onOpenIntro,
  onElevateToAdmin,
  students = [],
  onChangeStudent
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [muted, setMuted] = useState(isSoundMuted());

  const isStudent = currentUser.role === 'STUDENT';
  const student = isStudent ? (currentUser as StudentProfile) : null;
  const organiser = !isStudent ? (currentUser as OrganiserProfile) : null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getHouseBadgeStyle = (house?: HouseName) => {
    switch (house) {
      case 'Crimson':
        return 'bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-rose-600/30';
      case 'Tiger':
        return 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-500/30';
      case 'Amber':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-amber-500/30';
      case 'Lime':
        return 'bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 font-black shadow-lime-500/30';
      case 'Sapphire':
        return 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-600/30';
      default:
        return 'bg-indigo-600 text-white';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-xl shadow-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-black tracking-tight text-white">
                  KinetiQ Planner
                </span>
                <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hidden sm:inline">
                  SMR TechNova
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Connecting Students, Ideas and Events.
              </p>
            </div>
          </div>

          {/* Center: Active Role Badge (Strictly Authenticated) */}
          <div className="hidden sm:flex items-center gap-2">
            {isStudent ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 text-xs font-bold shadow-xs">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Student Dashboard</span>
                <span className="text-[10px] font-mono bg-indigo-900/80 px-1.5 py-0.5 rounded text-cyan-200">
                  Yr {student?.yearGroup} • {student?.className || '10-A'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-700/50 text-purple-300 text-xs font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Organiser Command Centre</span>
                <span className="text-[10px] font-mono bg-purple-900/80 px-1.5 py-0.5 rounded text-amber-200">
                  Faculty Admin
                </span>
              </div>
            )}
          </div>

          {/* Right Action Elements: Digital Pass, User Profile & Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 30-Second Cinematic Intro Quick Launcher */}
            {onOpenIntro && (
              <button
                onClick={() => {
                  playUiClick();
                  onOpenIntro();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-600/20 hover:from-amber-500/30 hover:to-purple-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer group"
                title="Watch the cool 30-second KinetiQ interactive briefing"
              >
                <Film className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">30s Intro</span>
              </button>
            )}

            {/* Global Command Palette Quick Launcher */}
            {onOpenCommandPalette && (
              <button
                onClick={() => {
                  playUiClick();
                  onOpenCommandPalette();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-xs cursor-pointer group"
                title="Search events, commands and pages (Cmd+K)"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">Search</span>
                <kbd className="hidden lg:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400">⌘K</kbd>
              </button>
            )}

            {/* Smart Study Bot Quick Launcher (Takes directly to website instead of pop up) */}
            <a
              href="https://nifty-smart-study-bot.base44.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playUiClick()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/20 via-indigo-600/20 to-purple-600/20 hover:from-cyan-600/30 hover:to-purple-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-sm shadow-cyan-950/40 cursor-pointer"
              title="Launch EduBot website directly (nifty-smart-study-bot.base44.app)"
            >
              <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">EduBot</span>
              <span className="text-[10px] text-cyan-400 opacity-80 font-mono">↗</span>
            </a>



            {/* Sound Effects Audio Toggle */}
            <button
              onClick={() => {
                const nextMuted = toggleSoundMute();
                setMuted(nextMuted);
                if (!nextMuted) playSuccessChime();
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-xs cursor-pointer"
              title={muted ? 'Unmute UI Sound Effects' : 'Mute UI Sound Effects'}
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            >
              {muted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            {/* Theme Selector Button */}
            {onOpenThemeModal && (
              <button
                onClick={() => {
                  playUiClick();
                  onOpenThemeModal();
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-purple-400 hover:text-purple-300 transition-all shadow-xs cursor-pointer"
                title="Change theme: Light, Dark, Robotic, or Cool"
                aria-label="Theme selector"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Student ID Card Quick Button (Only for students) */}
            {isStudent && onOpenDigitalId && (
              <button
                onClick={onOpenDigitalId}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 text-xs font-bold transition-all hover:border-cyan-400/40 shadow-xs cursor-pointer"
                title="View your official school digital pass with QR scanner"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Digital Pass</span>
              </button>
            )}

            {/* Authenticated User Capsule with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400/50 hover:bg-slate-800 transition-all text-left shadow-xs cursor-pointer"
                aria-label="User profile and account options"
                aria-expanded={showUserMenu}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                    isStudent ? getHouseBadgeStyle(student?.house) : 'bg-purple-600 text-white'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden md:block leading-tight">
                  <div className="text-xs font-extrabold text-white flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    {isStudent && student && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-amber-300 font-mono">
                        {student.points}pts
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isStudent && student ? (
                      `Yr ${student.yearGroup} • ${student.house}`
                    ) : organiser ? (
                      organiser.title || 'Event Organiser'
                    ) : (
                      'Staff Lead'
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-2 z-50 animate-in fade-in text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <div className="text-xs font-bold text-white">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                        {isStudent ? 'Verified Student' : 'Staff Organiser'}
                      </span>
                      {isStudent && student && (
                        <span className="text-[9px] font-semibold text-slate-400">
                          {student.house} House
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Student profile options */}
                  {isStudent && onOpenDigitalId && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenDigitalId();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-cyan-400 hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Official Digital ID Pass</span>
                    </button>
                  )}

                  {/* Account shortcut */}
                  {isStudent && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onChangeTab('my-account');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>My Account & Cohort</span>
                    </button>
                  )}

                  {/* Theme Selector */}
                  {onOpenThemeModal && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenThemeModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-purple-400" />
                      <span>Change Theme (Light / Dark / Robotic / Cool)</span>
                    </button>
                  )}

                  {/* Elevate to Admin Option */}
                  {isStudent && onElevateToAdmin && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onElevateToAdmin();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Elevate Account to Admin (Organiser)</span>
                    </button>
                  )}

                  {/* Organiser Access & Roles Manager Shortcut */}
                  {!isStudent && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onChangeTab('org-roles');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Manage Admin & Student Roles</span>
                    </button>
                  )}

                  {/* Sign Out Option */}
                  <div className="pt-1 mt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-2xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
                )}
              </button>

              <NotificationPopover
                notifications={notifications}
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                onMarkAllAsRead={onMarkAllAsRead}
              />
            </div>

            {/* Logout Action */}
            <button
              onClick={onLogout}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800/80 text-slate-300 hover:text-rose-300 text-xs font-bold transition-all cursor-pointer"
              title="Sign out of your KinetiQ session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Master Navigation Bar (Organized, spacious & uncluttered) */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5 border-t border-slate-800/80 py-2.5 overflow-x-auto no-scrollbar text-xs font-bold">
          {isStudent ? (
            <>
              {/* Core Hub */}
              <button
                onClick={() => onChangeTab('home')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'home'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home Hub</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

              {/* Events & Calendar Group */}
              <button
                onClick={() => onChangeTab('events')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'events'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Discover Events</span>
              </button>

              <button
                onClick={() => onChangeTab('calendar')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                My Calendar
              </button>

              <button
                onClick={() => onChangeTab('my-registrations')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'my-registrations'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                My Passes
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

              {/* Student Voice Group */}
              <button
                onClick={() => onChangeTab('suggestions')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'suggestions'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Propose Event</span>
              </button>

              <button
                onClick={() => onChangeTab('feedback')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'feedback'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Feedback
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

              {/* Real-time Campus Stream */}
              <button
                onClick={() => onChangeTab('activity')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'activity'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-emerald-400 hover:text-white hover:bg-slate-900 border border-emerald-500/20'
                }`}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>Live Campus Stream</span>
              </button>

              {/* Account */}
              <button
                onClick={() => onChangeTab('my-account')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'my-account'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                My Account
              </button>
            </>
          ) : (
            <>
              {/* Command Centre */}
              <button
                onClick={() => onChangeTab('org-overview')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'org-overview'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Command Overview</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

              {/* Event Operations */}
              <button
                onClick={() => onChangeTab('org-events')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'org-events'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Manage Events</span>
              </button>

              <button
                onClick={() => onChangeTab('org-calendar')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'org-calendar'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Master Calendar
              </button>

              <button
                onClick={() => onChangeTab('org-registrations')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'org-registrations'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rosters & Houses</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

              {/* User Roles & Access Control (Prominent Sarang / Admin Control) */}
              <button
                onClick={() => onChangeTab('org-roles')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'org-roles'
                    ? 'bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 text-white shadow-md ring-1 ring-amber-400/50'
                    : 'text-amber-400 hover:text-white hover:bg-slate-900 border border-amber-500/30'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>User Roles & Permissions</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

              {/* Student Voice & Safety */}
              <button
                onClick={() => onChangeTab('org-suggestions')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'org-suggestions'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Suggestions</span>
              </button>

              <button
                onClick={() => onChangeTab('org-consent')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'org-consent'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consent Forms</span>
              </button>

              <button
                onClick={() => onChangeTab('org-ai')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'org-ai'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>AI & Feedback</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

              {/* Real-time Campus Stream */}
              <button
                onClick={() => onChangeTab('activity')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'activity'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-emerald-400 hover:text-white hover:bg-slate-900 border border-emerald-500/20'
                }`}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>Live Action Stream</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => onChangeTab('org-settings')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'org-settings'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
