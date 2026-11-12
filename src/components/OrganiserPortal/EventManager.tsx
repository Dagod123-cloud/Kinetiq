import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  AlertTriangle,
  Edit2,
  CalendarDays,
  XCircle,
  Tag,
  CheckCircle2,
  Sparkles,
  Trash2,
  School,
  Flame,
  Award,
  ShieldAlert,
  RotateCcw,
  FileDown,
  GraduationCap,
  Check
} from 'lucide-react';
import { SchoolEvent, EventCategory, EventAudience, HouseName } from '../../types/index.ts';
import { detectSchedulingConflicts } from '../../utils/calendarFilter.ts';
import { playUiClick, playSuccessChime } from '../../utils/soundEffects.ts';
import { downloadIcsFile } from '../../utils/calendarExport.ts';

interface EventManagerProps {
  events: SchoolEvent[];
  onCreateEvent: (event: Omit<SchoolEvent, 'id' | 'registeredStudentIds'>) => void;
  onUpdateEvent: (eventId: string, updates: Partial<SchoolEvent>) => void;
  onDeleteEvent?: (eventId: string) => void;
  onClearAllEvents?: () => void;
  onResetDefaultEvents?: () => void;
  onNotifyEventChange: (event: SchoolEvent, changeType: 'CANCELLED' | 'POSTPONED' | 'RESCHEDULED', reason: string) => void;
  onOpenPosterStudio?: (eventId?: string) => void;
}

const CATEGORIES: EventCategory[] = [
  'Sports',
  'Arts & Drama',
  'STEM & Robotics',
  'Social & Fun',
  'Academic & Careers',
  'Community & Charity',
  'Leadership & Council'
];

const AVAILABLE_YEAR_GROUPS = [7, 8, 9, 10, 11, 12, 13];

const SAMPLE_CLASSES_BY_YEAR: Record<number, string[]> = {
  7: ['7-A', '7-B', '7-C', '7-Alpha'],
  8: ['8-A', '8-B', '8-C', '8-Honours'],
  9: ['9-A', '9-B', '9-C', '9-STEM', '9-Arts'],
  10: ['10-A', '10-B', '10-C', '10-Science', '10-Business'],
  11: ['11-A', '11-B', '11-C', '11-Accelerated'],
  12: ['12-A', '12-B', '12-STEM', '12-Humanities'],
  13: ['13-A', '13-B', '13-Senior']
};

export const EventManager: React.FC<EventManagerProps> = ({
  events,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onClearAllEvents,
  onResetDefaultEvents,
  onNotifyEventChange,
  onOpenPosterStudio
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTargetEvent, setDeleteTargetEvent] = useState<SchoolEvent | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [changeActionModal, setChangeActionModal] = useState<{
    event: SchoolEvent;
    action: 'POSTPONE' | 'RESCHEDULE' | 'CANCEL';
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields for Create / Publish Event
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('Sports');
  const [formDate, setFormDate] = useState('2026-11-25');
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formEndTime, setFormEndTime] = useState('16:00');
  const [formLocation, setFormLocation] = useState('School Main Sports Field');
  const [formSchoolName, setFormSchoolName] = useState("St. Jude's Academy");
  const [formAudience, setFormAudience] = useState<EventAudience>('ALL_SCHOOL');
  const [selectedGrades, setSelectedGrades] = useState<number[]>([10]);
  const [selectedClassesList, setSelectedClassesList] = useState<string[]>(['10-A', '10-B']);
  const [customClassInput, setCustomClassInput] = useState<string>('');
  const [formHouseAffiliation, setFormHouseAffiliation] = useState<HouseName | 'ALL_HOUSES'>('ALL_HOUSES');
  const [formCompulsory, setFormCompulsory] = useState(false);
  const [formRequiresRegistration, setFormRequiresRegistration] = useState(true);
  const [formRequiresParentConsent, setFormRequiresParentConsent] = useState(false);
  const [formCapacity, setFormCapacity] = useState(60);
  const [formDeadline, setFormDeadline] = useState('2026-11-24 18:00');
  const [formDescription, setFormDescription] = useState('');
  const [formOrganizer, setFormOrganizer] = useState('Student Council & Activities');

  // Change modal fields
  const [changeReason, setChangeReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // Year Group Filter for viewing all years' events
  const [selectedYearFilter, setSelectedYearFilter] = useState<'ALL' | number>('ALL');

  // Detect scheduling conflicts in real-time
  const conflicts = detectSchedulingConflicts(events);

  const filteredEvents = events.filter((e) => {
    if (selectedYearFilter === 'ALL') return true;
    if (e.audience === 'ALL_SCHOOL') return true;
    if (e.targetYearGroups && e.targetYearGroups.includes(selectedYearFilter)) return true;
    return false;
  });

  const resetForm = () => {
    setFormError(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Sports');
    setFormDate('2026-11-25');
    setFormStartTime('14:00');
    setFormEndTime('16:00');
    setFormLocation('School Main Sports Field');
    setFormSchoolName("St. Jude's Academy");
    setFormAudience('ALL_SCHOOL');
    setSelectedGrades([10]);
    setSelectedClassesList(['10-A', '10-B']);
    setCustomClassInput('');
    setFormHouseAffiliation('ALL_HOUSES');
    setFormCompulsory(false);
    setFormRequiresRegistration(true);
    setFormRequiresParentConsent(false);
    setFormCapacity(60);
    setFormDeadline('2026-11-24 18:00');
    setFormOrganizer('Faculty Activities Lead');
  };

  const handleOpenCreate = () => {
    playUiClick();
    resetForm();
    setShowCreateModal(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter an event title before publishing.');
      return;
    }
    setFormError(null);
    playSuccessChime();

    const parsedYears = formAudience === 'YEAR_GROUP'
      ? (selectedGrades.length > 0 ? selectedGrades : undefined)
      : undefined;

    const parsedClasses = formAudience === 'YEAR_GROUP' && selectedClassesList.length > 0
      ? selectedClassesList
      : undefined;

    onCreateEvent({
      title: formTitle.trim(),
      description: formDescription.trim() || `${formTitle.trim()} - Official school event.`,
      category: formCategory,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      location: formLocation.trim(),
      schoolName: formSchoolName.trim(),
      audience: formAudience,
      targetYearGroups: parsedYears,
      targetClasses: parsedClasses,
      houseAffiliation: formHouseAffiliation,
      compulsory: formCompulsory,
      requiresRegistration: formRequiresRegistration,
      requiresParentConsent: formRequiresParentConsent,
      capacity: Number(formCapacity) || 50,
      registrationDeadline: formDeadline,
      status: 'UPCOMING',
      organizerName: formOrganizer.trim()
    });

    setShowCreateModal(false);
  };

  const handleOpenChangeAction = (event: SchoolEvent, action: 'POSTPONE' | 'RESCHEDULE' | 'CANCEL') => {
    playUiClick();
    setChangeActionModal({ event, action });
    setChangeReason('');
    setNewDate(event.date);
    setNewStartTime(event.startTime);
    setNewEndTime(event.endTime);
    setNewLocation(event.location);
  };

  const handleConfirmChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeActionModal) return;

    playUiClick();
    const { event, action } = changeActionModal;
    const reasonText = changeReason.trim() || 'Schedule updated by event organizers.';

    if (action === 'CANCEL') {
      onUpdateEvent(event.id, {
        status: 'CANCELLED',
        changeReason: reasonText,
        requiresRegistration: false
      });
      onNotifyEventChange(event, 'CANCELLED', reasonText);
    } else if (action === 'POSTPONE') {
      onUpdateEvent(event.id, {
        status: 'POSTPONED',
        previousDate: event.date,
        previousTime: `${event.startTime} - ${event.endTime}`,
        date: newDate || event.date,
        startTime: newStartTime || event.startTime,
        endTime: newEndTime || event.endTime,
        location: newLocation || event.location,
        changeReason: reasonText
      });
      onNotifyEventChange(event, 'POSTPONED', reasonText);
    } else if (action === 'RESCHEDULE') {
      onUpdateEvent(event.id, {
        status: 'RESCHEDULED',
        previousDate: event.date,
        previousTime: `${event.startTime} - ${event.endTime}`,
        previousLocation: event.location,
        date: newDate || event.date,
        startTime: newStartTime || event.startTime,
        endTime: newEndTime || event.endTime,
        location: newLocation || event.location,
        changeReason: reasonText
      });
      onNotifyEventChange(event, 'RESCHEDULED', reasonText);
    }

    setChangeActionModal(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2.5 py-0.5 rounded-md">
            Organiser Control Panel
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-2">
            School Event Management & Live Scheduling
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Publish real school events, configure house tournaments, set cohort restrictions, or remove outdated activities.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onClearAllEvents && events.length > 0 && (
            <button
              onClick={() => {
                playUiClick();
                setShowClearConfirm(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800/80 text-slate-300 hover:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Remove all demo events so you can add only your real school events"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Demo Events</span>
            </button>
          )}

          {onResetDefaultEvents && (
            <button
              onClick={() => {
                playUiClick();
                onResetDefaultEvents();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Restore initial starter events"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Template</span>
            </button>
          )}

          {events.length > 0 && (
            <button
              onClick={() => {
                playSuccessChime();
                downloadIcsFile(events, 'Master_School_Events.ics');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download Master Calendar (.ics) file"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export (.ics)</span>
            </button>
          )}

          {onOpenPosterStudio && (
            <button
              onClick={() => {
                playUiClick();
                onOpenPosterStudio();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Poster Studio</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-black transition-all shadow-lg shadow-indigo-950/50 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Event</span>
          </button>
        </div>
      </div>

      {/* Scheduling Conflicts Warning Card */}
      {conflicts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-sm font-black text-amber-300 font-heading">
              Scheduling Conflict Detected ({conflicts.length})
            </h3>
          </div>
          <p className="text-xs text-amber-200/90">
            The following events overlap at the same date, time range, and location. Please reschedule or reassign the room to avoid venue collisions:
          </p>
          <div className="space-y-2">
            {conflicts.map((c, i) => (
              <div key={i} className="p-3 bg-slate-950/80 rounded-xl border border-amber-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <strong className="text-white">"{c.event1Title}"</strong> vs <strong className="text-white">"{c.event2Title}"</strong>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    📍 {c.location} • 📅 {c.date} • ⏱️ Overlap: {c.overlapPeriod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Events List */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-white font-heading">
              All Scheduled Events ({filteredEvents.length} of {events.length})
            </h3>
            <p className="text-xs text-slate-400">
              Live school events across all cohorts (Year 7–13) with registration controls
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Cohort:</span>
            <button
              type="button"
              onClick={() => setSelectedYearFilter('ALL')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedYearFilter === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Years ({events.length})
            </button>
            {[7, 8, 9, 10, 11, 12, 13].map((yr) => {
              const count = events.filter(e => e.audience === 'ALL_SCHOOL' || (e.targetYearGroups && e.targetYearGroups.includes(yr))).length;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYearFilter(yr)}
                  className={`px-2 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedYearFilter === yr
                      ? 'bg-indigo-600 text-white font-black shadow-sm shadow-indigo-600/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={`Filter Year ${yr} events (${count} events)`}
                >
                  Y{yr}
                </button>
              );
            })}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 text-cyan-400 flex items-center justify-center mx-auto border border-indigo-700/60 shadow-lg shadow-indigo-950/50">
              <Calendar className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-black text-white font-heading">
              {selectedYearFilter === 'ALL' ? 'No School Events Scheduled Yet' : `No Events Targeted for Year ${selectedYearFilter}`}
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              {selectedYearFilter === 'ALL'
                ? 'As faculty and school administrators, you can publish real events tailored by grade cohort (Year 7–13), specific class, or school-wide.'
                : `No events are currently scheduled specifically for Year ${selectedYearFilter}. Publish a new event or reset defaults.`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950/50 inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Real School Event</span>
              </button>
              {selectedYearFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedYearFilter('ALL')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Show All Years
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredEvents.map((event) => {
              const isCancelled = event.status === 'CANCELLED';
              const isRescheduled = event.status === 'RESCHEDULED';
              const isPostponed = event.status === 'POSTPONED';

              return (
                <div
                  key={event.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isCancelled ? 'bg-rose-950/20' : 'hover:bg-slate-850/50'
                  }`}
                >
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-cyan-400">{event.category}</span>

                      {event.schoolName && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          • {event.schoolName}
                        </span>
                      )}

                      {event.houseAffiliation && event.houseAffiliation !== 'ALL_HOUSES' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                          {event.houseAffiliation} House
                        </span>
                      )}

                      {event.compulsory && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Compulsory
                        </span>
                      )}

                      {isCancelled && (
                        <span className="px-2 py-0.5 rounded-full font-bold bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px]">
                          CANCELLED
                        </span>
                      )}
                      {isPostponed && (
                        <span className="px-2 py-0.5 rounded-full font-bold bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px]">
                          POSTPONED
                        </span>
                      )}
                      {isRescheduled && (
                        <span className="px-2 py-0.5 rounded-full font-bold bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px]">
                          RESCHEDULED
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-white font-heading">
                      {event.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl leading-relaxed">
                      {event.description}
                    </p>

                    {event.changeReason && (
                      <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/50 p-2 rounded-xl mt-1">
                        <strong>Change Note:</strong> {event.changeReason}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {event.startTime} – {event.endTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {event.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {event.audience === 'ALL_SCHOOL'
                          ? 'All School'
                          : `Year ${event.targetYearGroups?.join(', ')}`}
                      </span>
                    </div>
                  </div>

                  {/* Right Metrics & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                    {event.requiresRegistration && (
                      <div className="text-right sm:pr-4 sm:border-r sm:border-slate-800">
                        <div className="text-xs font-bold text-white">
                          {event.registeredStudentIds.length} / {event.capacity} Registered
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Deadline: {event.registrationDeadline}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {onOpenPosterStudio && (
                        <button
                          onClick={() => {
                            playUiClick();
                            onOpenPosterStudio(event.id);
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/80 hover:bg-purple-900 border border-purple-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Generate promotional poster for this event"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>AI Poster</span>
                        </button>
                      )}

                      {!isCancelled && event.status !== 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => handleOpenChangeAction(event, 'RESCHEDULE')}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-blue-300 bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CalendarDays className="w-3 h-3" />
                            <span>Reschedule</span>
                          </button>
                          <button
                            onClick={() => handleOpenChangeAction(event, 'POSTPONE')}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Postpone</span>
                          </button>
                          <button
                            onClick={() => handleOpenChangeAction(event, 'CANCEL')}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}

                      {/* Remove / Delete Event Button */}
                      {onDeleteEvent && (
                        <button
                          onClick={() => {
                            playUiClick();
                            setDeleteTargetEvent(event);
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-950 border border-rose-800/60 hover:border-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Permanently remove this event from the school calendar"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Single Event Confirmation Modal */}
      {deleteTargetEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-base font-black text-white font-heading">
                Permanently Remove Event
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">"{deleteTargetEvent.title}"</strong>?
              This action will permanently delete the event from student calendars, the master schedule, and cancel active passes.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>📅 <strong>Date:</strong> {deleteTargetEvent.date} ({deleteTargetEvent.startTime} - {deleteTargetEvent.endTime})</div>
              <div>📍 <strong>Venue:</strong> {deleteTargetEvent.location}</div>
              <div>👥 <strong>Registered Students:</strong> {deleteTargetEvent.registeredStudentIds?.length || 0} students</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteEvent) {
                    onDeleteEvent(deleteTargetEvent.id);
                  }
                  setDeleteTargetEvent(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Events Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-black text-white font-heading">
                Clear All Demo / Starter Events
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will remove all template events so that you and your school administrators can build your real school event schedule from scratch.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearAllEvents) {
                    onClearAllEvents();
                  }
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Postpone / Reschedule / Cancel Modal */}
      {changeActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-700">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-1">
                {changeActionModal.action === 'CANCEL' && <XCircle className="w-5 h-5 text-rose-400" />}
                {changeActionModal.action === 'POSTPONE' && <Clock className="w-5 h-5 text-amber-400" />}
                {changeActionModal.action === 'RESCHEDULE' && <CalendarDays className="w-5 h-5 text-blue-400" />}
                <h3 className="text-lg font-black text-white font-heading">
                  {changeActionModal.action === 'CANCEL' && 'Cancel School Event'}
                  {changeActionModal.action === 'POSTPONE' && 'Postpone School Event'}
                  {changeActionModal.action === 'RESCHEDULE' && 'Reschedule School Event'}
                </h3>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Affects: <strong className="text-white font-semibold">"{changeActionModal.event.title}"</strong>
              </p>

              <form onSubmit={handleConfirmChange} className="space-y-4">
                {changeActionModal.action !== 'CANCEL' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">New Date</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">New Start Time</label>
                      <input
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">New End Time</label>
                      <input
                        type="time"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">New Location / Venue</label>
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="E.g., Sports Hall B, School Theatre..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Reason for Change (Sent to Students)
                  </label>
                  <textarea
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    required
                    rows={3}
                    placeholder="E.g., Weather forecast, double-booked hall, guest speaker schedule..."
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setChangeActionModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                      changeActionModal.action === 'CANCEL'
                        ? 'bg-rose-600 hover:bg-rose-500'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    Confirm & Send Student Alerts
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Real Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-700 my-8">
            <div className="p-6">
              <h3 className="text-xl font-black text-white font-heading mb-1">
                Publish School Event
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                New events appear immediately on the student portal, personal calendars, and school rosters.
              </p>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Event Title</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                      placeholder="E.g., Autumn Athletics Meet, Science & Robotics Fair..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">School / Campus</label>
                    <input
                      type="text"
                      value={formSchoolName}
                      onChange={(e) => setFormSchoolName(e.target.value)}
                      placeholder="e.g. St. Jude's Academy"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Location / Venue</label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      required
                      placeholder="E.g., Main Gym, Lecture Hall B..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">End Time</label>
                      <input
                        type="time"
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      required
                      rows={2}
                      placeholder="What will happen, what students should bring, learning outcomes..."
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Audience Scope</label>
                    <select
                      value={formAudience}
                      onChange={(e) => setFormAudience(e.target.value as EventAudience)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="ALL_SCHOOL">Whole School Event (All Years)</option>
                      <option value="YEAR_GROUP">Specific Year Group(s)</option>
                      <option value="REGISTERED_ONLY">Voluntary / Sign-Up Required Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">PE House Team</label>
                    <select
                      value={formHouseAffiliation}
                      onChange={(e) => setFormHouseAffiliation(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="ALL_HOUSES">All 5 Houses (Open League)</option>
                      <option value="Crimson">Crimson House Only</option>
                      <option value="Tiger">Tiger House Only</option>
                      <option value="Amber">Amber House Only</option>
                      <option value="Lime">Lime House Only</option>
                      <option value="Sapphire">Sapphire House Only</option>
                    </select>
                  </div>

                  {formAudience === 'YEAR_GROUP' && (
                    <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Target Grades / Year Groups (Click to toggle)</span>
                          </label>
                          <div className="flex items-center gap-2 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setSelectedGrades(AVAILABLE_YEAR_GROUPS)}
                              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                            >
                              All Grades (7-13)
                            </button>
                            <span className="text-slate-600">•</span>
                            <button
                              type="button"
                              onClick={() => setSelectedGrades([])}
                              className="text-slate-400 hover:text-white cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {AVAILABLE_YEAR_GROUPS.map((yr) => {
                            const isSelected = selectedGrades.includes(yr);
                            return (
                              <button
                                key={yr}
                                type="button"
                                onClick={() => {
                                  playUiClick();
                                  if (isSelected) {
                                    setSelectedGrades(selectedGrades.filter(g => g !== yr));
                                  } else {
                                    setSelectedGrades([...selectedGrades, yr].sort((a, b) => a - b));
                                  }
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  isSelected
                                    ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-slate-950" />}
                                <span>Grade / Year {yr}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Class Cohorts */}
                      {selectedGrades.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Target Classes for Selected Grades (Leave empty for all classes)
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {selectedGrades.flatMap(yr => SAMPLE_CLASSES_BY_YEAR[yr] || []).map((cls) => {
                              const isClassSelected = selectedClassesList.includes(cls);
                              return (
                                <button
                                  key={cls}
                                  type="button"
                                  onClick={() => {
                                    playUiClick();
                                    if (isClassSelected) {
                                      setSelectedClassesList(selectedClassesList.filter(c => c !== cls));
                                    } else {
                                      setSelectedClassesList([...selectedClassesList, cls]);
                                    }
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                    isClassSelected
                                      ? 'bg-indigo-600 text-white border border-indigo-500'
                                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                                  }`}
                                >
                                  {cls}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={customClassInput}
                              onChange={(e) => setCustomClassInput(e.target.value)}
                              placeholder="Or type custom class (e.g. 10-Honours) and press Add"
                              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customClassInput.trim() && !selectedClassesList.includes(customClassInput.trim())) {
                                  setSelectedClassesList([...selectedClassesList, customClassInput.trim()]);
                                  setCustomClassInput('');
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Add Class
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Compulsory Toggle */}
                  <div className="flex items-center gap-2 sm:col-span-2 pt-1">
                    <input
                      type="checkbox"
                      id="compulsoryEvent"
                      checked={formCompulsory}
                      onChange={(e) => setFormCompulsory(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="compulsoryEvent" className="text-xs font-medium text-slate-300 cursor-pointer">
                      Mark as <strong className="text-amber-300">Compulsory School Attendance</strong> (shows compulsory badge)
                    </label>
                  </div>

                  {/* Requires Registration Toggle */}
                  <div className="flex items-center gap-2 sm:col-span-2 pt-1">
                    <input
                      type="checkbox"
                      id="reqReg"
                      checked={formRequiresRegistration}
                      onChange={(e) => setFormRequiresRegistration(e.target.checked)}
                      className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="reqReg" className="text-xs font-medium text-slate-300 cursor-pointer">
                      Requires student registration before attending
                    </label>
                  </div>

                  {formRequiresRegistration && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Capacity Limit</label>
                        <input
                          type="number"
                          value={formCapacity}
                          onChange={(e) => setFormCapacity(Number(e.target.value))}
                          min={5}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Registration Deadline</label>
                        <input
                          type="text"
                          value={formDeadline}
                          onChange={(e) => setFormDeadline(e.target.value)}
                          placeholder="YYYY-MM-DD HH:MM"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Does this event require parental permission / consent form?
                    </label>
                    <div className="flex items-center gap-4 text-xs text-slate-300">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="reqConsent"
                          checked={!formRequiresParentConsent}
                          onChange={() => setFormRequiresParentConsent(false)}
                          className="text-cyan-500"
                        />
                        <span>No (On-Campus Standard Activity)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="reqConsent"
                          checked={formRequiresParentConsent}
                          onChange={() => setFormRequiresParentConsent(true)}
                          className="text-cyan-500"
                        />
                        <span>Yes (Excursion / Off-Site / High-Impact)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md cursor-pointer"
                  >
                    Publish School Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
