import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Plus,
  Send,
  Download,
  Search,
  Filter,
  Eye,
  Edit2,
  Loader2,
  Phone,
  Mail
} from 'lucide-react';
import { SchoolEvent, ConsentFormTemplate, ConsentSubmission } from '../../types/index.ts';

interface ConsentManagerProps {
  events: SchoolEvent[];
  templates: ConsentFormTemplate[];
  submissions: ConsentSubmission[];
  onCreateTemplate: (template: ConsentFormTemplate) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<ConsentFormTemplate>) => void;
  onSendReminders: (eventId: string) => void;
}

export const ConsentManager: React.FC<ConsentManagerProps> = ({
  events,
  templates,
  submissions,
  onCreateTemplate,
  onUpdateTemplate,
  onSendReminders
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events.find(e => e.requiresParentConsent)?.id || events[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'DECLINED'>('ALL');

  // AI Generator state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTargetEventId, setAiTargetEventId] = useState(selectedEventId);
  const [aiSupervisors, setAiSupervisors] = useState('Dr. Angela Patel, Mr. David Harrison (Lead)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reminderSentEventId, setReminderSentEventId] = useState<string | null>(null);

  // Preview / Edit state
  const [previewTemplate, setPreviewTemplate] = useState<ConsentFormTemplate | null>(null);

  const consentEvents = events.filter(e => e.requiresParentConsent);
  const activeEvent = events.find(e => e.id === selectedEventId) || consentEvents[0] || events[0];
  const activeTemplate = templates.find(t => t.eventId === activeEvent?.id);

  // Filtered submissions for active event
  const eventSubmissions = submissions.filter(s => s.eventId === activeEvent?.id);
  const totalRegistered = activeEvent?.registeredStudentIds?.length || 0;
  const totalSubmitted = eventSubmissions.length;
  const totalApproved = eventSubmissions.filter(s => s.status === 'APPROVED').length;
  const totalPending = Math.max(0, totalRegistered - totalSubmitted);
  const totalDeclined = eventSubmissions.filter(s => s.status === 'DECLINED').length;

  const filteredSubmissions = eventSubmissions.filter(s => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentGuardianName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGenerateAiForm = async () => {
    setIsGenerating(true);
    try {
      const targetEvt = events.find(e => e.id === aiTargetEventId);
      const res = await fetch('/api/ai/generate-consent-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: targetEvt?.title || 'School Trip',
          date: targetEvt?.date || 'Upcoming',
          location: targetEvt?.location || 'Off-Campus',
          description: targetEvt?.description || 'School excursion',
          supervisingStaff: aiSupervisors
        })
      });

      const data = await res.json();
      const newTemplate: ConsentFormTemplate = {
        id: `cf-${Date.now()}`,
        eventId: aiTargetEventId,
        eventTitle: targetEvt?.title || 'Excursion',
        title: data.title || `Parental Consent: ${targetEvt?.title}`,
        activityOverview: data.activityOverview || targetEvt?.description || '',
        date: targetEvt?.date || '',
        location: targetEvt?.location || '',
        departureTime: data.departureTime || '08:30',
        returnTime: data.returnTime || '17:00',
        supervisingStaff: data.supervisingStaff || aiSupervisors,
        emergencyProcedures: data.emergencyProcedures || 'First Aid certified staff accompanied.',
        medicalConditionsRequired: true,
        submissionDeadline: data.submissionDeadline || targetEvt?.registrationDeadline || '',
        rulesAndExpectations: data.rulesAndExpectations || [
          'High-visibility school lanyards must be worn at all times.',
          'Students must remain in designated study pods.',
          'School disciplinary code applies throughout transit.'
        ]
      };

      onCreateTemplate(newTemplate);
      setShowAiModal(false);
      setPreviewTemplate(newTemplate);
    } catch (err) {
      console.error('Consent generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTriggerReminders = (eventId: string) => {
    onSendReminders(eventId);
    setReminderSentEventId(eventId);
    setTimeout(() => setReminderSentEventId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safety & Compliance</span>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Event-Specific Consent Tracking</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-2">
            Parental Consent Form Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitor electronic parental signatures for school trips, off-campus excursions, and activities requiring verified parental permissions. Use the AI Assistant to generate custom consent agreements.
          </p>
        </div>

        <button
          onClick={() => setShowAiModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>AI Generate Consent Form</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registered Students</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalRegistered}</div>
          <div className="text-[11px] text-slate-400">Total sign-ups for activity</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Consent</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalApproved}</div>
          <div className="text-[11px] text-emerald-400/80">Approved with parent e-signature</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Forms</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{totalPending}</div>
          <div className="text-[11px] text-amber-400/80">Awaiting parent completion</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Declined Forms</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{totalDeclined}</div>
          <div className="text-[11px] text-rose-400/80">Permission withheld</div>
        </div>
      </div>

      {/* Main Control Panel: Event Selector & Reminders Bar */}
      <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs font-bold text-slate-300 shrink-0">Filter Event:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full max-w-md px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {consentEvents.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.date})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTemplate && (
            <button
              onClick={() => setPreviewTemplate(activeTemplate)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preview Consent Form</span>
            </button>
          )}

          <button
            onClick={() => handleTriggerReminders(activeEvent?.id)}
            className="px-3.5 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700/60 text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {reminderSentEventId === activeEvent?.id ? 'Reminders Dispatched!' : 'Send Outstanding Reminders'}
            </span>
          </button>
        </div>
      </div>

      {/* Submissions Table & Student Roster */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white font-heading">
              Consent Records & Signatures ({filteredSubmissions.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Event: {activeEvent?.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student or parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Student Details</th>
                <th className="p-3.5">Class / Section</th>
                <th className="p-3.5">Parent / Guardian</th>
                <th className="p-3.5">Emergency Contact</th>
                <th className="p-3.5">Medical / Notes</th>
                <th className="p-3.5">Electronic Signature</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No matching consent submissions found for this activity.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{sub.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {sub.studentId}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-white font-semibold">Yr {sub.yearGroup} • {sub.className}</div>
                      <div className="text-[10px] text-cyan-400">Section {sub.sectionName}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-200">{sub.parentGuardianName}</div>
                      <div className="text-[10px] text-slate-400">{sub.parentEmail}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-200 font-mono">{sub.emergencyPhone}</div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      {sub.medicalNotes || sub.dietaryRestrictions ? (
                        <div className="text-[11px] text-slate-300">
                          {sub.medicalNotes && <span className="block text-amber-300">Med: {sub.medicalNotes}</span>}
                          {sub.dietaryRestrictions && <span className="block text-slate-400">Diet: {sub.dietaryRestrictions}</span>}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None reported</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-cyan-300 font-bold">{sub.electronicSignature}</div>
                      <div className="text-[9px] text-slate-500">{sub.signedAt}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'APPROVED'
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60'
                            : sub.status === 'DECLINED'
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-700/60'
                            : 'bg-amber-950/70 text-amber-300 border border-amber-700/60'
                        }`}
                      >
                        {sub.status === 'APPROVED' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Approved</span>
                          </>
                        ) : sub.status === 'DECLINED' ? (
                          <>
                            <XCircle className="w-3 h-3 text-rose-400" />
                            <span>Declined</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Pending</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Generate Consent Form Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-heading font-black text-base text-white">
                  AI Parental Consent Generator
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select an upcoming excursion or school event. Google Gemini AI will generate a legally sound, protective consent agreement with departure logistics and emergency protocols.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Target Event</label>
                <select
                  value={aiTargetEventId}
                  onChange={(e) => setAiTargetEventId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Supervising Educators</label>
                <input
                  type="text"
                  value={aiSupervisors}
                  onChange={(e) => setAiSupervisors(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiForm}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Legal Agreement...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate & Distribute Form</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Consent Form Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="font-heading font-black text-base text-white">
                  Consent Form Specification
                </h3>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Form Title:</span>
                <span className="text-white font-bold text-sm">{previewTemplate.title}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Activity Overview:</span>
                <p className="text-slate-300 leading-relaxed mt-0.5">{previewTemplate.activityOverview}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 font-mono text-[10px] block">DEPARTURE</span>
                  <span className="font-bold text-white">{previewTemplate.departureTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono text-[10px] block">RETURN</span>
                  <span className="font-bold text-white">{previewTemplate.returnTime}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800">
                  <span className="text-slate-500 font-mono text-[10px] block">SUPERVISION RATIO</span>
                  <span className="font-bold text-cyan-300">{previewTemplate.supervisingStaff}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Emergency Protocols:</span>
                <p className="text-slate-300 leading-relaxed mt-0.5">{previewTemplate.emergencyProcedures}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Rules & Student Code:</span>
                <ul className="list-disc pl-4 text-slate-300 space-y-1">
                  {previewTemplate.rulesAndExpectations?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
