import React, { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Crown,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  UserCheck,
  Send,
  Radio
} from 'lucide-react';
import { UserAccount, HouseName } from '../types/index.ts';
import { playUiClick, playSuccessChime } from '../utils/soundEffects.ts';

export interface CampusActivityItem {
  id: string;
  type:
    | 'ADMIN_EVENT_CREATE'
    | 'ADMIN_EVENT_UPDATE'
    | 'ADMIN_EVENT_DELETE'
    | 'STUDENT_SUGGESTION'
    | 'ADMIN_ROLE_CHANGE'
    | 'STUDENT_REGISTRATION'
    | 'STUDENT_FEEDBACK'
    | 'PARENT_CONSENT';
  actorName: string;
  actorRole: 'ORGANISER' | 'STUDENT';
  actorEmail: string;
  actorHouse?: HouseName;
  summary: string;
  details?: string;
  targetTitle?: string;
  targetId?: string;
  timestamp: string;
}

const INITIAL_ACTIVITIES: CampusActivityItem[] = [
  {
    id: 'act-1',
    type: 'ADMIN_ROLE_CHANGE',
    actorName: 'Sarang',
    actorRole: 'ORGANISER',
    actorEmail: '1300-sarang-smr@smgeducation.org',
    summary: 'Lead Administrator Sarang initialized full administrative access control & verified user directory.',
    details: 'Master owner authority active. All other seeded accounts assigned student status.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'act-2',
    type: 'ADMIN_EVENT_CREATE',
    actorName: 'Sarang',
    actorRole: 'ORGANISER',
    actorEmail: '1300-sarang-smr@smgeducation.org',
    targetTitle: 'KinetiQ STEM & Robotics Championship 2026',
    summary: 'Published new verified school event "KinetiQ STEM & Robotics Championship 2026"',
    details: 'Targeted at Year 9, 10 & 11 • Tech Innovation Lab • PE House Points active',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'act-3',
    type: 'STUDENT_SUGGESTION',
    actorName: 'Maya Chen',
    actorRole: 'STUDENT',
    actorEmail: 'maya.chen@stjudes.edu',
    actorHouse: 'Crimson',
    targetTitle: 'Inter-House Speed Chess & Blitz Arena',
    summary: 'Student Maya Chen submitted proposal: "Inter-House Speed Chess & Blitz Arena"',
    details: 'Category: Social & Fun • Scaled for Whole School • Upvoted by Crimson House',
    timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString()
  },
  {
    id: 'act-4',
    type: 'STUDENT_REGISTRATION',
    actorName: 'Liam Smith',
    actorRole: 'STUDENT',
    actorEmail: 'liam.smith@stjudes.edu',
    actorHouse: 'Sapphire',
    targetTitle: 'KinetiQ STEM & Robotics Championship 2026',
    summary: 'Liam Smith registered attendance for "KinetiQ STEM & Robotics Championship 2026"',
    details: 'Digital QR boarding pass issued • House points eligible',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString()
  },
  {
    id: 'act-5',
    type: 'STUDENT_SUGGESTION',
    actorName: 'David Harrison',
    actorRole: 'STUDENT',
    actorEmail: 'david.harrison@stjudes.edu',
    actorHouse: 'Amber',
    targetTitle: 'Outdoor Eco-Science & Sustainability Field Study',
    summary: 'Student David Harrison proposed: "Outdoor Eco-Science & Sustainability Field Study"',
    details: 'Category: Academic & Careers • Requires parent consent',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString()
  }
];

interface CampusActivityFeedProps {
  currentUser?: UserAccount;
  onNavigateToTab?: (tab: string) => void;
  compact?: boolean;
}

export const CampusActivityFeed: React.FC<CampusActivityFeedProps> = ({
  currentUser,
  onNavigateToTab,
  compact = false
}) => {
  const [activities, setActivities] = useState<CampusActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem('kinetiq_campus_activity');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ACTIVITIES;
  });

  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch from server API with local fallback
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activity');
      if (res.ok) {
        const data = await res.json();
        if (data.activities && Array.isArray(data.activities) && data.activities.length > 0) {
          setActivities(data.activities);
          localStorage.setItem('kinetiq_campus_activity', JSON.stringify(data.activities));
        }
      }
    } catch (err) {
      console.warn('API activity stream unavailable, using local synchronized log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // 30s auto-sync
    return () => clearInterval(interval);
  }, []);

  // Format timestamp nicely
  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const filteredActivities = activities.filter(act => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      act.actorName.toLowerCase().includes(q) ||
      act.summary.toLowerCase().includes(q) ||
      (act.targetTitle && act.targetTitle.toLowerCase().includes(q)) ||
      (act.details && act.details.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterType === 'ALL') return true;
    if (filterType === 'ADMIN_EVENTS') {
      return act.type === 'ADMIN_EVENT_CREATE' || act.type === 'ADMIN_EVENT_UPDATE' || act.type === 'ADMIN_EVENT_DELETE';
    }
    if (filterType === 'STUDENT_SUGGESTIONS') {
      return act.type === 'STUDENT_SUGGESTION';
    }
    if (filterType === 'ROLES') {
      return act.type === 'ADMIN_ROLE_CHANGE';
    }
    if (filterType === 'REGISTRATIONS') {
      return act.type === 'STUDENT_REGISTRATION' || act.type === 'PARENT_CONSENT';
    }
    return true;
  });

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur-md ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-heading font-black text-white">
                Live Campus Action Stream
              </h2>
              <span className="flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transparent school feed: see what admins & students are creating in real time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playUiClick();
              fetchActivities();
            }}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (expanded mode) */}
      {!compact && (
        <div className="pt-4 pb-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search activity by person, event, or proposal..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Feed' },
              { id: 'ADMIN_EVENTS', label: 'Admin Events' },
              { id: 'STUDENT_SUGGESTIONS', label: 'Student Ideas' },
              { id: 'ROLES', label: 'Permissions' },
              { id: 'REGISTRATIONS', label: 'Bookings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  playUiClick();
                  setFilterType(tab.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Items List */}
      <div className="mt-3 divide-y divide-slate-800/60 max-h-96 overflow-y-auto pr-1">
        {filteredActivities.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Activity className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-bold text-slate-300">No recent activity matches your filter</p>
          </div>
        ) : (
          filteredActivities.map(act => {
            const isAdmin = act.actorRole === 'ORGANISER';
            const isMaster =
              act.actorEmail.toLowerCase() === '1300-sarang-smr@smgeducation.org' ||
              act.actorName.toLowerCase().includes('sarang');

            return (
              <div
                key={act.id}
                className="py-3 px-2 rounded-2xl hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Avatar Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      isMaster
                        ? 'bg-gradient-to-tr from-amber-400 to-yellow-600 text-slate-950 font-black'
                        : isAdmin
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                        : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isMaster ? (
                      <Crown className="w-4 h-4" />
                    ) : isAdmin ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <GraduationCap className="w-4 h-4" />
                    )}
                  </div>

                  {/* Summary & Metadata */}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {act.actorName}
                      </span>

                      {isMaster ? (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          Lead Admin
                        </span>
                      ) : isAdmin ? (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Faculty
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Student
                        </span>
                      )}

                      {act.actorHouse && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300">
                          {act.actorHouse}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-500 ml-auto sm:ml-0 font-mono">
                        {formatTimeAgo(act.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium leading-snug">
                      {act.summary}
                    </p>

                    {act.details && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {act.details}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Link/Jump button if applicable */}
                {onNavigateToTab && act.type.includes('EVENT') && (
                  <button
                    onClick={() => {
                      playUiClick();
                      onNavigateToTab(isAdmin ? 'org-events' : 'events');
                    }}
                    className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="View events hub"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {onNavigateToTab && act.type.includes('SUGGESTION') && (
                  <button
                    onClick={() => {
                      playUiClick();
                      onNavigateToTab(isAdmin ? 'org-suggestions' : 'suggestions');
                    }}
                    className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="View suggestions board"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
