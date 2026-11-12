import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight
} from 'lucide-react';
import { SchoolEvent, StudentProfile, ConsentSubmission } from '../../types/index.ts';

interface MyRegistrationsViewProps {
  events: SchoolEvent[];
  student: StudentProfile;
  consentSubmissions: ConsentSubmission[];
  onUnregister: (eventId: string) => void;
  onOpenConsentModal: (event: SchoolEvent) => void;
  onNavigateToCalendar: () => void;
}

export const MyRegistrationsView: React.FC<MyRegistrationsViewProps> = ({
  events,
  student,
  consentSubmissions,
  onUnregister,
  onOpenConsentModal,
  onNavigateToCalendar
}) => {
  const registeredEvents = events.filter(e => e.registeredStudentIds.includes(student.id));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-md">
            My Event Passes
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-2">
            My Active Registrations ({registeredEvents.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Review your confirmed activities, verify electronic parental consent status for off-campus trips, and manage your attendance.
          </p>
        </div>

        <button
          onClick={onNavigateToCalendar}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Open My Calendar</span>
        </button>
      </div>

      {registeredEvents.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Registrations</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't registered for any upcoming events yet. Browse the Upcoming Events catalog to reserve your place!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registeredEvents.map(event => {
            const isCompleted = event.status === 'COMPLETED';
            const isCancelled = event.status === 'CANCELLED';

            // Check consent status
            const submission = consentSubmissions.find(s => s.eventId === event.id && s.studentId === student.id);
            const needsConsent = !!event.requiresParentConsent;
            const consentApproved = submission?.status === 'APPROVED';

            return (
              <div
                key={event.id}
                className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                      {event.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      Yr {event.targetYearGroups?.join(', ') || 'All Years'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white">{event.title}</h3>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 p-3 rounded-2xl bg-slate-950/80 border border-slate-850">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Parental Consent Indicator */}
                  {needsConsent && (
                    <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
                      consentApproved
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                        : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        {consentApproved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <div>
                          <strong className="block leading-tight">
                            {consentApproved ? 'Parent Consent Verified' : 'Action Required: Parent Consent'}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {consentApproved
                              ? `E-signed by ${submission?.parentGuardianName}`
                              : 'Excursion requires electronic parental permission'}
                          </span>
                        </div>
                      </div>

                      {!consentApproved && (
                        <button
                          onClick={() => onOpenConsentModal(event)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] transition-colors shrink-0 cursor-pointer"
                        >
                          E-Sign Form
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Registration Confirmed
                  </span>
                  {!isCompleted && !isCancelled && (
                    <button
                      onClick={() => onUnregister(event.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer"
                    >
                      Cancel Registration
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
