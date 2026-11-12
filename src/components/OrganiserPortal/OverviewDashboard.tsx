import React from 'react';
import {
  Calendar,
  Users,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Building
} from 'lucide-react';
import { SchoolEvent, Feedback, EventSuggestion, ConsentSubmission } from '../../types/index.ts';
import { CampusActivityFeed } from '../CampusActivityFeed.tsx';

interface OverviewDashboardProps {
  events: SchoolEvent[];
  feedbacks: Feedback[];
  suggestions: EventSuggestion[];
  consentSubmissions: ConsentSubmission[];
  onChangeTab: (tab: string) => void;
  onOpenCreateEvent: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  events,
  feedbacks,
  suggestions,
  consentSubmissions,
  onChangeTab,
  onOpenCreateEvent
}) => {
  const upcomingEvents = events.filter(e => e.status === 'UPCOMING' || e.status === 'POSTPONED');
  const totalRegistrations = events.reduce((sum, e) => sum + e.registeredStudentIds.length, 0);
  const totalPositiveFeedbacks = feedbacks.filter(f => f.recommend).length;
  const satisfactionRate = feedbacks.length > 0
    ? Math.round((totalPositiveFeedbacks / feedbacks.length) * 100)
    : 92;

  const pendingSuggestions = suggestions.filter(s => s.status === 'Under Consideration');

  return (
    <div className="space-y-6">
      {/* Welcome & Command Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 p-6 sm:p-8 rounded-3xl border border-purple-800/50 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              KinetiQ Planner
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-purple-300 font-semibold">SMR TechNova</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight leading-tight">
            Organiser Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Connecting students, ideas and events. Manage upcoming school activities, track parental consent, review anonymous feedback, and deploy AI assistants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={onOpenCreateEvent}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Event</span>
          </button>
          <button
            onClick={() => onChangeTab('org-ai')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Launch AI Assistant</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onChangeTab('org-events')}
          className="bg-slate-900/90 hover:bg-slate-850 p-5 rounded-3xl border border-slate-800 transition-all cursor-pointer space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Scheduled Activities</span>
            <Calendar className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white">{events.length}</div>
          <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
            <span>{upcomingEvents.length} Active upcoming</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div
          onClick={() => onChangeTab('org-registrations')}
          className="bg-slate-900/90 hover:bg-slate-850 p-5 rounded-3xl border border-slate-800 transition-all cursor-pointer space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Student Registrations</span>
            <Users className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white">{totalRegistrations}</div>
          <div className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
            <span>Across all year cohorts</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div
          onClick={() => onChangeTab('org-consent')}
          className="bg-slate-900/90 hover:bg-slate-850 p-5 rounded-3xl border border-slate-800 transition-all cursor-pointer space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Parent Consent Forms</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{consentSubmissions.length}</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <span>Verified digital e-signatures</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div
          onClick={() => onChangeTab('org-feedback')}
          className="bg-slate-900/90 hover:bg-slate-850 p-5 rounded-3xl border border-slate-800 transition-all cursor-pointer space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Student Satisfaction</span>
            <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-amber-400">{satisfactionRate}%</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Based on {feedbacks.length} anonymous reviews</span>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Grid: Quick Actions & Recent Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Navigation Hub (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white font-heading flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Direct Operational Management</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onChangeTab('org-events')}
                className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition-all space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Manage Events & Schedules</span>
                  <Calendar className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Create, postpone, reschedule, or cancel events with automatic calendar updates.
                </p>
              </button>

              <button
                onClick={() => onChangeTab('org-consent')}
                className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-left transition-all space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Parental Consent Tracker</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Monitor signed permission slips and send bulk reminders for pending excursions.
                </p>
              </button>

              <button
                onClick={() => onChangeTab('org-feedback')}
                className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition-all space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Feedback Analytics & AI</span>
                  <MessageSquare className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Automated comment moderation records, pie charts, and recurring student themes.
                </p>
              </button>

              <button
                onClick={() => onChangeTab('org-ai')}
                className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-left transition-all space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">AI Assistant Suite</span>
                  <Sparkles className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Synthesize review summaries, operational fixes, posters, and consent forms.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Student Suggestions Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Student Event Pitches ({pendingSuggestions.length})</span>
              </h3>
              <button
                onClick={() => onChangeTab('org-suggestions')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
              >
                View All →
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Students have submitted {suggestions.length} ideas. Review and approve popular activities:
            </p>

            <div className="space-y-2.5">
              {suggestions.slice(0, 3).map(sug => (
                <div
                  key={sug.id}
                  className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-cyan-400">{sug.category}</span>
                    <span className="text-amber-300 font-bold">▲ {sug.upvotes} student votes</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{sug.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{sug.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Campus Action Stream (Audit of what admins and students do) */}
      <CampusActivityFeed
        onNavigateToTab={onChangeTab}
      />
    </div>
  );
};
