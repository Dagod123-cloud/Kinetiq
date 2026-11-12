import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  User,
  Phone,
  Mail,
  HeartPulse,
  Send,
  Lock
} from 'lucide-react';
import { SchoolEvent, ConsentFormTemplate, ConsentSubmission, StudentProfile } from '../../types/index.ts';

interface ParentConsentModalProps {
  event: SchoolEvent;
  consentTemplate?: ConsentFormTemplate;
  student: StudentProfile;
  existingSubmission?: ConsentSubmission;
  isOpen: boolean;
  onClose: () => void;
  onSubmitConsent: (submission: Omit<ConsentSubmission, 'id' | 'signedAt'>) => void;
}

export const ParentConsentModal: React.FC<ParentConsentModalProps> = ({
  event,
  consentTemplate,
  student,
  existingSubmission,
  isOpen,
  onClose,
  onSubmitConsent
}) => {
  const [parentName, setParentName] = useState(existingSubmission?.parentGuardianName || '');
  const [parentEmail, setParentEmail] = useState(existingSubmission?.parentEmail || student.parentEmail || '');
  const [emergencyPhone, setEmergencyPhone] = useState(existingSubmission?.emergencyPhone || '+44 7700 900142');
  const [medicalNotes, setMedicalNotes] = useState(existingSubmission?.medicalNotes || '');
  const [dietaryRestrictions, setDietaryRestrictions] = useState(existingSubmission?.dietaryRestrictions || '');
  const [confirmedRules, setConfirmedRules] = useState(!!existingSubmission);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [signatureTyped, setSignatureTyped] = useState(existingSubmission?.electronicSignature || '');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !emergencyPhone.trim() || !signatureTyped.trim() || !confirmedRules) return;

    onSubmitConsent({
      eventId: event.id,
      studentId: student.id,
      studentName: student.name,
      yearGroup: student.yearGroup,
      className: student.className || '10-A',
      sectionName: student.sectionName || 'Alpha',
      parentGuardianName: parentName.trim(),
      parentEmail: parentEmail.trim(),
      emergencyPhone: emergencyPhone.trim(),
      medicalNotes: medicalNotes.trim(),
      dietaryRestrictions: dietaryRestrictions.trim(),
      permissionGranted,
      electronicSignature: signatureTyped.trim(),
      status: permissionGranted ? 'APPROVED' : 'DECLINED'
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                Official School Compliance
              </span>
              <h2 className="text-lg font-bold text-white font-heading mt-0.5">
                Parent / Guardian Consent Form
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {submittedSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-1 ring-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Parental Consent Recorded</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Electronic signature confirmed for {student.name}. Your event registration status is now fully verified.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event & Student Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Target Activity
                    </span>
                    <h3 className="text-sm font-black text-white">{event.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-900/60 text-cyan-300 border border-indigo-700/50">
                    Parental Consent Required
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-850 text-[11px] text-slate-300">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Date</span>
                    <span className="font-semibold text-white">{event.date}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Time</span>
                    <span className="font-semibold text-white">{event.startTime} - {event.endTime}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Student</span>
                    <span className="font-semibold text-white">{student.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Class & Sec</span>
                    <span className="font-semibold text-white">{student.className || '10-A'} ({student.sectionName || 'Alpha'})</span>
                  </div>
                </div>

                {consentTemplate && (
                  <p className="text-slate-400 text-[11px] leading-relaxed pt-1 border-t border-slate-850">
                    {consentTemplate.activityOverview}
                  </p>
                )}
              </div>

              {/* Safety & Supervision Terms */}
              {consentTemplate && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 space-y-2 text-[11px]">
                  <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Supervision & Emergency Protocols</span>
                  </div>
                  <div className="text-slate-300 space-y-1">
                    <div><strong>Supervising Staff:</strong> {consentTemplate.supervisingStaff}</div>
                    <div><strong>Emergency Protocol:</strong> {consentTemplate.emergencyProcedures}</div>
                  </div>
                  <ul className="list-disc pl-4 text-slate-400 space-y-0.5 pt-1">
                    {consentTemplate.rulesAndExpectations?.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parent/Guardian Declaration Inputs */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                  Parent / Legal Guardian Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Parent / Guardian Full Name *</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      required
                      placeholder="e.g. Eleanor Chen"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Emergency Contact Phone Number *</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      required
                      placeholder="+44 7700 900142"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Parent Email Address *</label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      required
                      placeholder="parent.chen@example.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-bold">Dietary Restrictions (If any)</label>
                    <input
                      type="text"
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                      placeholder="e.g. Vegetarian, Nut Allergy"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    Medical Notes, Allergies or Required Medications
                  </label>
                  <textarea
                    rows={2}
                    value={medicalNotes}
                    onChange={(e) => setMedicalNotes(e.target.value)}
                    placeholder="Provide details on asthma inhalers, epipens, or medical conditions..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Consent Decision Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-200 block">Parental Permission Decision:</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="radio"
                        name="consentDecision"
                        checked={permissionGranted}
                        onChange={() => setPermissionGranted(true)}
                        className="text-cyan-500 focus:ring-cyan-400"
                      />
                      <span>I grant full permission for my child to participate</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-rose-300">
                      <input
                        type="radio"
                        name="consentDecision"
                        checked={!permissionGranted}
                        onChange={() => setPermissionGranted(false)}
                        className="text-rose-500 focus:ring-rose-400"
                      />
                      <span>I decline permission</span>
                    </label>
                  </div>
                </div>

                {/* Electronic Signature */}
                <div className="space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={confirmedRules}
                      onChange={(e) => setConfirmedRules(e.target.checked)}
                      required
                      className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                    />
                    <span>
                      I confirm that I am the parent or legal guardian of {student.name}, and that all details provided are accurate.
                    </span>
                  </label>

                  <div className="space-y-1 pt-1">
                    <label className="block text-slate-300 font-bold">
                      Electronic Signature (Type full legal name to e-sign) *
                    </label>
                    <input
                      type="text"
                      value={signatureTyped}
                      onChange={(e) => setSignatureTyped(e.target.value)}
                      required
                      placeholder="e.g. Eleanor Chen"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!parentName || !emergencyPhone || !signatureTyped || !confirmedRules}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Electronic Consent Form</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
