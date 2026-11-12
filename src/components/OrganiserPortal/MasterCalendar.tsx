import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Info,
  CheckCircle2,
  Tag,
  Plus
} from 'lucide-react';
import { SchoolEvent } from '../../types/index.ts';
import { detectSchedulingConflicts } from '../../utils/calendarFilter.ts';
import { playUiClick } from '../../utils/soundEffects.ts';

interface MasterCalendarProps {
  events: SchoolEvent[];
  onSelectEvent?: (event: SchoolEvent) => void;
  onOpenCreateEvent?: (date?: string) => void;
}

export const MasterCalendar: React.FC<MasterCalendarProps> = ({
  events,
  onSelectEvent,
  onOpenCreateEvent
}) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // November 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-11-20');

  const conflicts = detectSchedulingConflicts(events);

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

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const selectedDayEvents = events.filter(e => e.date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              School Master Schedule & Venue Grid
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive overview of all school events across all departments and year groups, registration capacity statuses, and room overlap checks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="font-semibold text-slate-700">
              {events.filter(e => e.status !== 'CANCELLED').length} Active Events
            </span>
            <span className="text-slate-300">•</span>
            <span className={`font-semibold ${conflicts.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {conflicts.length === 0 ? '✓ No room conflicts' : `⚠️ ${conflicts.length} room conflict`}
            </span>
          </div>

          {onOpenCreateEvent && (
            <button
              onClick={() => {
                playUiClick();
                onOpenCreateEvent(selectedDateStr);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-purple-950/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Publish School Event</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Master Month View (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                {monthName} {currentYear}
              </h3>
              <span className="text-xs text-slate-400">
                Organiser Master View
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

          {/* DOW Headers */}
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
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-2xl bg-slate-50/50 border border-dashed border-slate-100" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === dateString);
              const isSelected = selectedDateStr === dateString;
              const hasConflict = conflicts.some(c => c.date === dateString);

              return (
                <button
                  key={dateString}
                  onClick={() => setSelectedDateStr(dateString)}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-xs'
                      : hasConflict
                      ? 'border-amber-400 bg-amber-50/30'
                      : dayEvents.length > 0
                      ? 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      : 'border-slate-100 bg-white text-slate-400'
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
                    {hasConflict && (
                      <span className="text-[10px] font-bold text-amber-600" title="Scheduling conflict on this day">
                        ⚠️
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[10px] truncate leading-tight font-medium px-1 py-0.5 rounded ${
                          ev.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 line-through'
                            : ev.status === 'POSTPONED'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-indigo-50 text-indigo-900'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold pl-1">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Master Day Schedule
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

          {selectedDayEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No events on this date</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Schedule a workshop, athletics meet, or competition on this day.
              </p>
              {onOpenCreateEvent && (
                <button
                  onClick={() => {
                    playUiClick();
                    onOpenCreateEvent(selectedDateStr);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Publish Event for This Date</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent?.(evt)}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                      {evt.category}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {evt.startTime} – {evt.endTime}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {evt.title}
                  </h4>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-800">{evt.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.organizerName}</span>
                    </div>
                  </div>

                  {evt.requiresRegistration && (
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Sign-ups:</span>
                      <span className="font-bold text-indigo-700">
                        {evt.registeredStudentIds.length} / {evt.capacity} students
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {onOpenCreateEvent && (
                <button
                  onClick={() => {
                    playUiClick();
                    onOpenCreateEvent(selectedDateStr);
                  }}
                  className="w-full py-2.5 rounded-2xl border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50 text-purple-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Publish Another Event for This Date</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
