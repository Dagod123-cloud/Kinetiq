import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Tag,
  Info,
  FileDown,
  ExternalLink,
  CalendarPlus,
  Trash2,
  User
} from 'lucide-react';
import { SchoolEvent, StudentProfile } from '../../types/index.ts';
import { isEventOnStudentCalendar } from '../../utils/calendarFilter.ts';
import { downloadIcsFile, getGoogleCalendarUrl } from '../../utils/calendarExport.ts';
import { playSuccessChime, playUiClick } from '../../utils/soundEffects.ts';
import { AddPersonalEventModal } from './AddPersonalEventModal.tsx';

interface PersonalCalendarProps {
  events: SchoolEvent[];
  activeStudent: StudentProfile;
  onSelectEvent?: (event: SchoolEvent) => void;
  onAddPersonalEvent?: (event: SchoolEvent) => void;
  onDeletePersonalEvent?: (eventId: string) => void;
}

export const PersonalCalendar: React.FC<PersonalCalendarProps> = ({
  events,
  activeStudent,
  onSelectEvent,
  onAddPersonalEvent,
  onDeletePersonalEvent
}) => {
  // Current calendar view month (November 2026 default based on metadata date)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 0-indexed: 10 is November
  const [selectedDateStr, setSelectedDateStr] = useState('2026-11-20');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter events according to personalized calendar logic
  const myRegisteredEventIds = events
    .filter(e => e.registeredStudentIds.includes(activeStudent.id))
    .map(e => e.id);

  const personalizedEvents = events.filter(event =>
    isEventOnStudentCalendar(event, activeStudent.yearGroup, myRegisteredEventIds)
  );

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calendar calculations
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday, 1 is Monday

  // Selected date events
  const selectedDayEvents = personalizedEvents.filter(e => e.date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Informative Persona Context Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 font-heading">
                {activeStudent.name}’s Personalised Schedule
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                Year {activeStudent.yearGroup}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Filtered specifically for your year group. Events requiring sign-ups only appear once you register.
              School-wide traditions and Year {activeStudent.yearGroup} compulsory workshops appear automatically.
            </p>
          </div>
        </div>

        {/* Legend & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 shrink-0">
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-slate-700 font-semibold">My Personal Events</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span className="text-slate-600 font-medium">My Registered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">School-Wide</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-slate-600 font-medium">Year {activeStudent.yearGroup} Compulsory</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 font-medium">Rescheduled</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playUiClick();
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-black transition-all shadow-md shadow-indigo-950/20 cursor-pointer"
              title="Add a personal study session, homework, revision, or training event to your calendar"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>+ Add to My Calendar</span>
            </button>

            <button
              onClick={() => {
                playSuccessChime();
                downloadIcsFile(personalizedEvents, `${activeStudent.name.replace(/\s+/g, '_')}_Schedule.ics`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Download iCalendar (.ics) file to sync with Apple Calendar or Google Calendar"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export (.ics)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          {/* Calendar Header with Controls */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                {monthName} {currentYear}
              </h3>
              <span className="text-xs text-slate-400">
                {personalizedEvents.length} personalized events scheduled this month
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentYear(2026);
                  setCurrentMonth(10);
                  setSelectedDateStr('2026-11-20');
                }}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-2xl bg-slate-50/50 border border-dashed border-slate-100" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = personalizedEvents.filter(e => e.date === dateString);
              const isSelected = selectedDateStr === dateString;

              return (
                <button
                  key={dateString}
                  onClick={() => setSelectedDateStr(dateString)}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-xs'
                      : dayEvents.length > 0
                      ? 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                      : 'border-slate-100 hover:border-slate-200 bg-white text-slate-400'
                  }`}
                  aria-label={`${dateString}: ${dayEvents.length} events`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : dayEvents.length > 0
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-indigo-600 hidden sm:inline">
                        {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  {/* Event indicators dots / chips */}
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => {
                      let dotColor = 'bg-indigo-500';
                      if (ev.isPersonal) dotColor = 'bg-blue-600';
                      else if (ev.status === 'POSTPONED' || ev.status === 'RESCHEDULED') dotColor = 'bg-amber-500';
                      else if (ev.audience === 'ALL_SCHOOL') dotColor = 'bg-emerald-500';
                      else if (ev.audience === 'YEAR_GROUP') dotColor = 'bg-purple-500';

                      return (
                        <div
                          key={ev.id}
                          className="flex items-center gap-1 text-[10px] truncate leading-tight font-medium text-slate-700"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                          <span className="truncate hidden sm:inline">{ev.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold pl-2">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Daily Agenda
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-heading mt-0.5">
                {new Date(selectedDateStr).toLocaleDateString('default', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
            </div>
            <button
              onClick={() => {
                playUiClick();
                setShowAddModal(true);
              }}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title={`Add an event for ${selectedDateStr}`}
            >
              <CalendarPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Event</span>
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No scheduled events for this date</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Add your own study session, homework, revision, or training event to your calendar.
              </p>
              <button
                onClick={() => {
                  playUiClick();
                  setShowAddModal(true);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-950/20 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>+ Add Event for This Date</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDayEvents.map((evt) => {
                const isRegistered = evt.registeredStudentIds.includes(activeStudent.id);

                return (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent?.(evt)}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {evt.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {evt.isPersonal ? (
                          <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <User className="w-3 h-3" /> Personal Event
                          </span>
                        ) : evt.status === 'POSTPONED' || evt.status === 'RESCHEDULED' ? (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Rescheduled
                          </span>
                        ) : evt.audience === 'ALL_SCHOOL' ? (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> School-Wide
                          </span>
                        ) : isRegistered ? (
                          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Registered
                          </span>
                        ) : null}

                        {evt.isPersonal && onDeletePersonalEvent && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playUiClick();
                              if (confirm(`Remove "${evt.title}" from your personal calendar?`)) {
                                onDeletePersonalEvent(evt.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete this personal event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {evt.title}
                    </h4>

                    {evt.changeReason && (
                      <div className="p-2 rounded-xl bg-amber-50 text-[11px] text-amber-900 border border-amber-200">
                        <span className="font-semibold">Notice:</span> {evt.changeReason}
                      </div>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">{evt.startTime} – {evt.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.location}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <a
                        href={getGoogleCalendarUrl(evt)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          playUiClick();
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                        title="Add this event directly to your personal Google Calendar"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Add to Google Calendar</span>
                      </a>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {evt.isPersonal ? 'Private Event' : 'KinetiQ Sync'}
                      </span>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => {
                  playUiClick();
                  setShowAddModal(true);
                }}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>+ Add Another Event to This Day</span>
              </button>
            </div>
          )}

          <div className="pt-2">
            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>
                <strong>Personal + School Calendar:</strong> Your private study sessions and activities sit alongside official school workshops and competitions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Personal Event Modal */}
      <AddPersonalEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        defaultDate={selectedDateStr}
        userId={activeStudent.id}
        userName={activeStudent.name}
        onAddEvent={(newEvent) => {
          if (onAddPersonalEvent) {
            onAddPersonalEvent(newEvent);
          }
        }}
      />
    </div>
  );
};
