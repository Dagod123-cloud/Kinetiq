import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  XCircle,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SchoolEvent, StudentProfile, EventCategory } from '../../types/index.ts';
import { getHouseConfig } from '../../utils/houseThemes.ts';

interface EventsListProps {
  events: SchoolEvent[];
  activeStudent: StudentProfile;
  onRegister: (eventId: string) => void;
  onUnregister: (eventId: string) => void;
  onOpenFeedbackModal: (eventId: string) => void;
}

const CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Sports',
  'Arts & Drama',
  'STEM & Robotics',
  'Social & Fun',
  'Academic & Careers',
  'Community & Charity',
  'Leadership & Council'
];

export const EventsList: React.FC<EventsListProps> = ({
  events,
  activeStudent,
  onRegister,
  onUnregister,
  onOpenFeedbackModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');
  const [filterType, setFilterType] = useState<'all' | 'personalised' | 'my-events' | 'open-registration'>('all');
  const [selectedEventModal, setSelectedEventModal] = useState<SchoolEvent | null>(null);

  const studentHouseConfig = getHouseConfig(activeStudent.house);

  const upcomingEvents = events.filter(e => e.status !== 'COMPLETED');
  const pastEvents = events.filter(e => e.status === 'COMPLETED');

  const filteredUpcoming = upcomingEvents.filter(event => {
    // Search query
    const matchSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizerName.toLowerCase().includes(searchQuery.toLowerCase());

    // Category
    const matchCategory = selectedCategory === 'All' || event.category === selectedCategory;

    // Filter type
    let matchFilter = true;
    const isRegistered = event.registeredStudentIds.includes(activeStudent.id);
    if (filterType === 'my-events') {
      matchFilter = isRegistered;
    } else if (filterType === 'open-registration') {
      matchFilter = event.requiresRegistration && !isRegistered && event.status !== 'CANCELLED';
    } else if (filterType === 'personalised') {
      const matchYear = !event.targetYearGroups || event.targetYearGroups.includes(activeStudent.yearGroup);
      const matchClass = !event.targetClasses || event.targetClasses.includes(activeStudent.className);
      matchFilter = matchYear || matchClass;
    }

    return matchSearch && matchCategory && matchFilter;
  });

  const handleRegisterClick = (eventId: string) => {
    onRegister(eventId);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // Fallback
    }
  };

  const getStatusBadge = (event: SchoolEvent) => {
    switch (event.status) {
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'POSTPONED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Postponed
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3.5 h-3.5" /> Rescheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner with Aurora Glow and House Emblem */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-2xl shadow-indigo-950/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 border border-indigo-400/30 text-xs font-bold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              {activeStudent.schoolName || "St. Jude's Academy"} • Events Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 font-heading">
              Welcome back, {activeStudent.name}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Discover school events, register instantly, and manage your verified schedule.
              Registered activities automatically appear on your calendar.
            </p>
          </div>

          {/* Student Pass Badge Widget */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-xl flex items-center gap-4 shrink-0">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md"
              style={{ backgroundColor: studentHouseConfig.hex }}
            >
              {activeStudent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{activeStudent.name}</span>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${studentHouseConfig.hex}25`,
                    color: studentHouseConfig.hex,
                    borderColor: `${studentHouseConfig.hex}50`
                  }}
                >
                  {studentHouseConfig.label}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Year {activeStudent.yearGroup} • {activeStudent.className || '10-A'} • <strong style={{ color: studentHouseConfig.hex }}>{activeStudent.points} pts</strong>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {activeStudent.studentIdNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Neon Blobs */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, venues, organizers..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Quick Filter Segment */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Events ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setFilterType('personalised')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'personalised'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 text-cyan-700 hover:bg-cyan-50'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>For My Year & Class</span>
            </button>
            <button
              onClick={() => setFilterType('my-events')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'my-events'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              My Registered ({upcomingEvents.filter(e => e.registeredStudentIds.includes(activeStudent.id)).length})
            </button>
            <button
              onClick={() => setFilterType('open-registration')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'open-registration'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Open Spots
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Upcoming Events ({filteredUpcoming.length})
          </h2>
          <span className="text-xs text-slate-500">
            Sorted chronologically
          </span>
        </div>

        {filteredUpcoming.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">
              {events.length === 0 ? 'No School Events Published Yet' : 'No events matched your filter'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {events.length === 0
                ? `School faculty and organizers have not scheduled any events for Grade ${activeStudent.yearGroup} yet. Check back soon as new school activities are published!`
                : 'Try adjusting your search terms, grade cohort, or category filter to discover more school events.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUpcoming.map((event) => {
              const isRegistered = event.registeredStudentIds.includes(activeStudent.id);
              const isFull = event.registeredStudentIds.length >= event.capacity;
              const isCancelled = event.status === 'CANCELLED';

              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isRegistered
                      ? 'border-indigo-300 ring-1 ring-indigo-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-5">
                    {/* Header Row: Category, Compulsory Badge & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {event.category}
                        </span>
                        {event.compulsory && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                            Compulsory
                          </span>
                        )}
                        {event.houseAffiliation && (
                          <span
                            className="text-[10px] font-black px-2 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: `${studentHouseConfig.hex}15`,
                              color: studentHouseConfig.hex,
                              borderColor: `${studentHouseConfig.hex}40`
                            }}
                          >
                            🏆 Inter-House Points
                          </span>
                        )}
                      </div>
                      {getStatusBadge(event)}
                    </div>

                    {/* Event Title */}
                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug hover:text-indigo-600 transition-colors cursor-pointer"
                      onClick={() => setSelectedEventModal(event)}
                    >
                      {event.title}
                    </h3>

                    {/* Change Reason Banner if Postponed/Rescheduled/Cancelled */}
                    {event.changeReason && (
                      <div className="mb-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                        <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-800">
                          Notice from Organiser:
                        </span>
                        {event.changeReason}
                        {event.previousDate && (
                          <div className="text-[11px] text-amber-700 mt-1">
                            Previously scheduled: <span className="line-through">{event.previousDate}</span> → New Date: {event.date}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description preview */}
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Key Details Pills */}
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="font-medium text-slate-800">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{event.startTime} – {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          {event.audience === 'ALL_SCHOOL'
                            ? 'Whole School'
                            : `Year ${event.targetYearGroups?.join(', ')}`}
                        </span>
                      </div>
                    </div>

                    {/* Registration Capacity Bar (if requires registration) */}
                    {event.requiresRegistration && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-500 font-medium">Registration</span>
                          <span className="font-semibold text-slate-700">
                            {event.registeredStudentIds.length} / {event.capacity} spots
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFull ? 'bg-rose-500' : 'bg-indigo-600'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((event.registeredStudentIds.length / event.capacity) * 100)
                              )}%`
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Deadline: {event.registrationDeadline}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedEventModal(event)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
                    >
                      Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Action depending on registration state */}
                    {isCancelled ? (
                      <span className="text-xs text-rose-600 font-semibold">Cancelled</span>
                    ) : !event.requiresRegistration ? (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Open to All
                      </span>
                    ) : isRegistered ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Registered
                        </span>
                        <button
                          onClick={() => onUnregister(event.id)}
                          className="text-[11px] text-slate-500 hover:text-rose-600 underline font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : isFull ? (
                      <span className="text-xs text-slate-400 font-medium">Waitlist Full</span>
                    ) : (
                      <button
                        onClick={() => handleRegisterClick(event.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md"
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Events Section (For feedback) */}
      {pastEvents.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Recently Completed Events
              </h2>
              <p className="text-xs text-slate-500">
                Share your anonymous thoughts to help organisers improve future activities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pastEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {evt.category} • Held on {evt.date}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{evt.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{evt.description}</p>
                </div>
                <button
                  onClick={() => onOpenFeedbackModal(evt.id)}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Leave Feedback
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                  {selectedEventModal.category}
                </span>
                {getStatusBadge(selectedEventModal)}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">
                {selectedEventModal.title}
              </h3>

              {selectedEventModal.changeReason && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">Status Update:</span> {selectedEventModal.changeReason}
                </div>
              )}

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {selectedEventModal.description}
              </p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl mb-6 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-semibold">{selectedEventModal.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Time</span>
                  <span className="font-semibold">{selectedEventModal.startTime} – {selectedEventModal.endTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Location</span>
                  <span className="font-semibold">{selectedEventModal.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Organised By</span>
                  <span className="font-semibold">{selectedEventModal.organizerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Audience</span>
                  <span className="font-semibold">
                    {selectedEventModal.audience === 'ALL_SCHOOL'
                      ? 'Whole School'
                      : `Year ${selectedEventModal.targetYearGroups?.join(', ')}`}
                  </span>
                </div>
                {selectedEventModal.requiresRegistration && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Registration Status</span>
                    <span className="font-semibold text-indigo-700">
                      {selectedEventModal.registeredStudentIds.length} / {selectedEventModal.capacity} enrolled
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                {selectedEventModal.requiresRegistration && selectedEventModal.status !== 'CANCELLED' && (
                  selectedEventModal.registeredStudentIds.includes(activeStudent.id) ? (
                    <button
                      onClick={() => {
                        onUnregister(selectedEventModal.id);
                        setSelectedEventModal(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      Cancel My Registration
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleRegisterClick(selectedEventModal.id);
                        setSelectedEventModal(null);
                      }}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      Confirm Registration
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
