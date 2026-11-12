import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Calendar,
  Sparkles,
  Bot,
  QrCode,
  Shield,
  FileDown,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  GraduationCap,
  Palette
} from 'lucide-react';
import { SchoolEvent, UserAccount, StudentProfile } from '../types/index.ts';
import { playUiClick, playSuccessChime, toggleSoundMute, isSoundMuted } from '../utils/soundEffects.ts';
import { downloadIcsFile } from '../utils/calendarExport.ts';
import { AppTheme, APP_THEMES } from '../utils/themeManager.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  student?: StudentProfile;
  events: SchoolEvent[];
  onNavigateTab: (tabId: string) => void;
  onOpenStudyBot: () => void;
  onOpenDigitalId?: () => void;
  onOpenCreateEvent?: () => void;
  onRegisterEvent?: (eventId: string) => void;
  onSelectTheme?: (theme: AppTheme) => void;
  onOpenThemeModal?: () => void;
  onElevateToAdmin?: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  subtitle?: string;
  category: 'NAVIGATION' | 'ACTIONS' | 'EVENTS' | 'EDUBOT';
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  onSelect: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  currentUser,
  student,
  events,
  onNavigateTab,
  onOpenStudyBot,
  onOpenDigitalId,
  onOpenCreateEvent,
  onRegisterEvent,
  onSelectTheme,
  onOpenThemeModal,
  onElevateToAdmin
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl/Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Parent triggers open
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isStudent = currentUser.role === 'STUDENT';

  // Build list of actions
  const actions: PaletteAction[] = [];

  // EduBot Quick Actions
  actions.push({
    id: 'edubot-open',
    title: 'Launch EduBot AI Study Companion',
    subtitle: 'Takes you directly to https://nifty-smart-study-bot.base44.app',
    category: 'EDUBOT',
    icon: <Bot className="w-4 h-4 text-cyan-400" />,
    badge: 'Direct Link',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    onSelect: () => {
      window.location.href = 'https://nifty-smart-study-bot.base44.app';
      onClose();
    }
  });

  // Calendar Export
  actions.push({
    id: 'export-calendar-ics',
    title: 'Export School Calendar (.ics)',
    subtitle: 'Download standard iCalendar file for Apple Calendar, Google Calendar & Outlook',
    category: 'ACTIONS',
    icon: <FileDown className="w-4 h-4 text-emerald-400" />,
    badge: 'iCal Sync',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    onSelect: () => {
      playSuccessChime();
      downloadIcsFile(events, `${currentUser.name.replace(/\s+/g, '_')}_KinetiQ_Schedule.ics`);
      onClose();
    }
  });

  // Sound Toggle
  actions.push({
    id: 'toggle-sound',
    title: isSoundMuted() ? 'Unmute Sound Effects' : 'Mute Sound Effects',
    subtitle: 'Toggle Web Audio UI clicks, fanfare chimes, and timer bells',
    category: 'ACTIONS',
    icon: isSoundMuted() ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />,
    onSelect: () => {
      const muted = toggleSoundMute();
      if (!muted) playSuccessChime();
      onClose();
    }
  });

  // Theme Switcher Modal Action
  if (onOpenThemeModal) {
    actions.push({
      id: 'open-theme-modal',
      title: 'Change Website Theme & Aesthetics',
      subtitle: 'Open the theme picker: Midnight Dark, Clean Campus (Light), Cyber Robotic, or Electric Aurora',
      category: 'ACTIONS',
      icon: <Palette className="w-4 h-4 text-purple-400" />,
      badge: 'Theme Mode',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
      onSelect: () => {
        onOpenThemeModal();
        onClose();
      }
    });
  }

  // Quick Direct Theme Switchers
  if (onSelectTheme) {
    const themeKeys: AppTheme[] = ['dark', 'light', 'robotic', 'cool'];
    themeKeys.forEach((t) => {
      const cfg = APP_THEMES[t];
      actions.push({
        id: `switch-theme-${t}`,
        title: `Switch Theme: ${cfg.name}`,
        subtitle: cfg.tagline,
        category: 'ACTIONS',
        icon: <Palette className="w-4 h-4" style={{ color: cfg.primaryColor }} />,
        badge: cfg.badge,
        badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
        onSelect: () => {
          playSuccessChime();
          onSelectTheme(t);
          onClose();
        }
      });
    });
  }

  if (isStudent) {
    if (onElevateToAdmin) {
      actions.push({
        id: 'elevate-account-admin',
        title: 'Elevate This Account to Admin (Organiser)',
        subtitle: 'Switch to Faculty Organiser mode: manage real events, student rosters & school classes',
        category: 'ACTIONS',
        icon: <Shield className="w-4 h-4 text-amber-400" />,
        badge: 'Admin Access',
        badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
        onSelect: () => {
          onElevateToAdmin();
          onClose();
        }
      });
    }

    if (onOpenDigitalId) {
      actions.push({
        id: 'view-digital-pass',
        title: 'View Official Digital School Pass',
        subtitle: `Display official student ID, QR scanner & ${student?.house || 'Crimson'} house badge`,
        category: 'ACTIONS',
        icon: <QrCode className="w-4 h-4 text-cyan-400" />,
        badge: 'ID Pass',
        badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
        onSelect: () => {
          onOpenDigitalId();
          onClose();
        }
      });
    }

    actions.push({
      id: 'nav-home',
      title: 'Student Hub (Home & House Spirit Arena)',
      subtitle: 'Overview, merit bounties, daily quests, and inter-house standings',
      category: 'NAVIGATION',
      icon: <GraduationCap className="w-4 h-4 text-indigo-400" />,
      onSelect: () => {
        onNavigateTab('home');
        onClose();
      }
    });

    actions.push({
      id: 'nav-events',
      title: 'Events Hub (Discover & Register)',
      subtitle: 'Browse upcoming school activities, filter by category & house challenge',
      category: 'NAVIGATION',
      icon: <Calendar className="w-4 h-4 text-cyan-400" />,
      onSelect: () => {
        onNavigateTab('events');
        onClose();
      }
    });

    actions.push({
      id: 'nav-calendar',
      title: 'My Personalised Calendar',
      subtitle: 'Schedule timeline, compulsory activities & day/week/month view',
      category: 'NAVIGATION',
      icon: <Calendar className="w-4 h-4 text-purple-400" />,
      onSelect: () => {
        onNavigateTab('calendar');
        onClose();
      }
    });

    actions.push({
      id: 'nav-registrations',
      title: 'My Registrations & Event Passes',
      subtitle: 'View your booked events, QR check-in codes, and parent consent forms',
      category: 'NAVIGATION',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      onSelect: () => {
        onNavigateTab('my-registrations');
        onClose();
      }
    });

    actions.push({
      id: 'add-personal-event',
      title: '+ Add Event to My Calendar',
      subtitle: 'Add a personal study session, exam revision, or practice block to your calendar',
      category: 'ACTIONS',
      icon: <Calendar className="w-4 h-4 text-cyan-400" />,
      badge: 'My Schedule',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      onSelect: () => {
        onNavigateTab('calendar');
        onClose();
      }
    });

    actions.push({
      id: 'nav-suggestions',
      title: 'Suggest an Activity (Student Sandbox)',
      subtitle: 'Propose events you want the school to organise & vote on ideas',
      category: 'NAVIGATION',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      onSelect: () => {
        onNavigateTab('suggestions');
        onClose();
      }
    });
  } else {
    // Organiser commands
    if (onOpenCreateEvent) {
      actions.push({
        id: 'org-create-event',
        title: '+ Publish New School Event',
        subtitle: 'Configure school cohort targeting, PE house, and parent consent',
        category: 'ACTIONS',
        icon: <PlusCircle className="w-4 h-4 text-emerald-400" />,
        badge: 'Admin',
        badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
        onSelect: () => {
          onOpenCreateEvent();
          onClose();
        }
      });
    }

    actions.push({
      id: 'org-nav-overview',
      title: 'Organiser Overview Command Centre',
      subtitle: 'Campus analytics, registration KPI cards, and house points chart',
      category: 'NAVIGATION',
      icon: <Shield className="w-4 h-4 text-purple-400" />,
      onSelect: () => {
        onNavigateTab('org-overview');
        onClose();
      }
    });

    actions.push({
      id: 'org-nav-events',
      title: 'Manage Events & Schedule Hub',
      subtitle: 'Publish events, edit schedules, manage capacities, or remove events',
      category: 'NAVIGATION',
      icon: <Calendar className="w-4 h-4 text-cyan-400" />,
      onSelect: () => {
        onNavigateTab('org-events');
        onClose();
      }
    });

    actions.push({
      id: 'org-nav-registrations',
      title: 'Student Registrations & Attendance Roster',
      subtitle: 'Filter by Year/Class/House and export official attendance CSV',
      category: 'NAVIGATION',
      icon: <CheckCircle2 className="w-4 h-4 text-blue-400" />,
      onSelect: () => {
        onNavigateTab('org-registrations');
        onClose();
      }
    });

    actions.push({
      id: 'org-nav-calendar',
      title: 'School Master Calendar',
      subtitle: 'Comprehensive overview of all school departments, active events & room conflicts',
      category: 'NAVIGATION',
      icon: <Calendar className="w-4 h-4 text-indigo-400" />,
      onSelect: () => {
        onNavigateTab('org-calendar');
        onClose();
      }
    });

    actions.push({
      id: 'org-nav-ai',
      title: 'AI Intelligence & Feedback Analysis Hub',
      subtitle: 'Run Gemini sentiment analysis, moderation summaries & action plans',
      category: 'NAVIGATION',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      onSelect: () => {
        onNavigateTab('org-ai');
        onClose();
      }
    });

    actions.push({
      id: 'org-nav-roles',
      title: 'User Roles & Access Control Manager',
      subtitle: 'Manage administrative privileges, assign admin status or change users to students',
      category: 'ACTIONS',
      icon: <Shield className="w-4 h-4 text-amber-400" />,
      badge: 'Access Control',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      onSelect: () => {
        onNavigateTab('org-roles');
        onClose();
      }
    });

    actions.push({
      id: 'nav-activity',
      title: 'Live Campus Activity Stream',
      subtitle: 'Real-time transparency: see what admins and students are creating live',
      category: 'NAVIGATION',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      onSelect: () => {
        onNavigateTab('activity');
        onClose();
      }
    });
  }

  // Add individual matching events
  events.slice(0, 15).forEach((event) => {
    actions.push({
      id: `event-${event.id}`,
      title: event.title,
      subtitle: `${event.date} • ${event.location || 'School Campus'} • ${event.category}`,
      category: 'EVENTS',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      badge: event.compulsory ? 'Compulsory' : event.category,
      badgeColor: event.compulsory ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-800 text-slate-300 border-slate-700',
      onSelect: () => {
        if (isStudent) {
          if (onRegisterEvent && !event.registeredStudentIds.includes(currentUser.id)) {
            onRegisterEvent(event.id);
          } else {
            onNavigateTab('events');
          }
        } else {
          onNavigateTab('events');
        }
        onClose();
      }
    });
  });

  // Filter actions based on search query
  const filteredActions = actions.filter((act) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      act.title.toLowerCase().includes(q) ||
      (act.subtitle && act.subtitle.toLowerCase().includes(q)) ||
      act.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        playUiClick();
        filteredActions[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, event, or jump to page (e.g. EduBot, Calendar, Sports Day)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No matching events or commands found for "{query}".
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    playUiClick();
                    action.onSelect();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-950/60 border border-indigo-700/60 text-white' : 'hover:bg-slate-800/50 text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-indigo-600/30' : 'bg-slate-800'}`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{action.title}</span>
                      {action.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${action.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {action.badge}
                        </span>
                      )}
                    </div>
                    {action.subtitle && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{action.subtitle}</p>
                    )}
                  </div>
                  {isSelected && (
                    <span className="text-[11px] font-mono text-cyan-400 shrink-0">↵ Select</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-semibold text-slate-400">KinetiQ Planner • SMR TechNova</span>
        </div>
      </div>
    </div>
  );
};
