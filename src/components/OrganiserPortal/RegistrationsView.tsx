import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Download,
  Calendar,
  ShieldCheck,
  Award,
  Lock,
  Edit2,
  School,
  X
} from 'lucide-react';
import { SchoolEvent, StudentProfile, ConsentSubmission, HouseName } from '../../types/index.ts';
import { getHouseConfig, PE_HOUSES, HOUSE_NAMES } from '../../utils/houseThemes.ts';

interface RegistrationsViewProps {
  events: SchoolEvent[];
  students: StudentProfile[];
  consentSubmissions: ConsentSubmission[];
  onUpdateStudentHouse?: (studentId: string, house: HouseName) => void;
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  events,
  students,
  consentSubmissions,
  onUpdateStudentHouse
}) => {
  const [viewMode, setViewMode] = useState<'EVENT_ROSTER' | 'ALL_STUDENTS'>('EVENT_ROSTER');
  const [selectedEventId, setSelectedEventId] = useState<string>(events[1]?.id || events[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [houseFilter, setHouseFilter] = useState<string>('ALL');
  const [checkIns, setCheckIns] = useState<Record<string, boolean>>({});

  // House assignment modal state
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [selectedHouseToAssign, setSelectedHouseToAssign] = useState<HouseName>('Crimson');
  const [isSavingHouse, setIsSavingHouse] = useState(false);
  const [houseSaveSuccess, setHouseSaveSuccess] = useState<string | null>(null);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  // Unique list of schools, classes, and sections
  const uniqueSchools = Array.from(new Set(students.map(s => s.schoolName || "St. Jude's Academy")));
  const uniqueClasses = Array.from(new Set(students.map(s => s.className || '10-A'))).sort();
  const uniqueSections = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega'];

  // Base list depending on view mode
  const baseStudents = viewMode === 'EVENT_ROSTER'
    ? students.filter(s => activeEvent?.registeredStudentIds?.includes(s.id))
    : students;

  // Apply multi-field filtering
  const filteredStudents = baseStudents.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.className && s.className.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSchool = schoolFilter === 'ALL' || (s.schoolName || "St. Jude's Academy") === schoolFilter;
    const matchesYear = yearFilter === 'ALL' || s.yearGroup === Number(yearFilter);
    const matchesClass = classFilter === 'ALL' || s.className === classFilter;
    const matchesSection = sectionFilter === 'ALL' || s.sectionName === sectionFilter;
    const matchesHouse = houseFilter === 'ALL' || s.house === houseFilter;

    return matchesSearch && matchesSchool && matchesYear && matchesClass && matchesSection && matchesHouse;
  });

  const toggleCheckIn = (studentId: string) => {
    if (!activeEvent) return;
    setCheckIns(prev => ({
      ...prev,
      [`${activeEvent.id}-${studentId}`]: !prev[`${activeEvent.id}-${studentId}`]
    }));
  };

  const getConsentStatus = (studentId: string) => {
    if (!activeEvent || !activeEvent.requiresParentConsent) {
      return { status: 'NOT_REQUIRED', label: 'Not Required', color: 'bg-slate-800 text-slate-400' };
    }
    const sub = consentSubmissions.find(c => c.eventId === activeEvent.id && c.studentId === studentId);
    if (!sub) {
      return { status: 'PENDING', label: 'Pending Consent', color: 'bg-amber-950/70 text-amber-300 border border-amber-700/60' };
    }
    if (sub.status === 'APPROVED') {
      return { status: 'APPROVED', label: 'Approved & Signed', color: 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60' };
    }
    return { status: 'DECLINED', label: 'Declined', color: 'bg-rose-950/70 text-rose-300 border border-rose-700/60' };
  };

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Full Name', 'School Name', 'Email', 'Year Group', 'Class', 'Section', 'PE House', 'House Verified', 'Consent Status', 'Attendance Checked In'];
    const rows = filteredStudents.map(s => {
      const consent = getConsentStatus(s.id);
      const isCheckedIn = activeEvent ? !!checkIns[`${activeEvent.id}-${s.id}`] : false;
      return [
        `"${s.studentIdNumber}"`,
        `"${s.name}"`,
        `"${s.schoolName || "St. Jude's Academy"}"`,
        `"${s.email}"`,
        `"Year ${s.yearGroup}"`,
        `"${s.className || '10-A'}"`,
        `"${s.sectionName || 'Alpha'}"`,
        `"${s.house}"`,
        `"${s.houseVerified ? 'YES' : 'PENDING'}"`,
        `"${consent.label}"`,
        `"${isCheckedIn ? 'YES' : 'NO'}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = viewMode === 'EVENT_ROSTER' && activeEvent
      ? `${activeEvent.title.replace(/\s+/g, '_')}_Registrations.csv`
      : 'KinetiQ_School_Student_Roster.csv';
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open modal to verify / reassign house
  const handleOpenHouseModal = (student: StudentProfile) => {
    setEditingStudent(student);
    setSelectedHouseToAssign(student.house);
    setHouseSaveSuccess(null);
  };

  // Save verified house membership
  const handleSaveHouseMembership = async () => {
    if (!editingStudent) return;
    setIsSavingHouse(true);

    try {
      const token = localStorage.getItem('kinetiq_session_token');
      const res = await fetch(`/api/students/${editingStudent.id}/verify-house`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ house: selectedHouseToAssign })
      });

      if (res.ok) {
        setHouseSaveSuccess(`Official record updated: ${editingStudent.name} confirmed in ${selectedHouseToAssign} House.`);
        if (onUpdateStudentHouse) {
          onUpdateStudentHouse(editingStudent.id, selectedHouseToAssign);
        }
        setTimeout(() => {
          setEditingStudent(null);
        }, 1200);
      }
    } catch {
      // Local fallback
      if (onUpdateStudentHouse) {
        onUpdateStudentHouse(editingStudent.id, selectedHouseToAssign);
      }
      setEditingStudent(null);
    } finally {
      setIsSavingHouse(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Event Admissions & Student Rosters</span>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Official Cohorts & House Verification</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-2">
            Student Information & House Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Filter student records by school, year group, class, section, and PE house. Verify house memberships according to official school records and track gate attendance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {/* View Mode Toggle: Event Sign-ups vs Full Student Directory */}
      <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 max-w-md">
        <button
          onClick={() => setViewMode('EVENT_ROSTER')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            viewMode === 'EVENT_ROSTER'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>By Event Sign-Ups</span>
        </button>
        <button
          onClick={() => setViewMode('ALL_STUDENTS')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            viewMode === 'ALL_STUDENTS'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Enrolled Students ({students.length})</span>
        </button>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 space-y-3">
        {viewMode === 'EVENT_ROSTER' && (
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <label className="text-xs font-bold text-slate-300 shrink-0">Select Event:</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full max-w-md px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.registeredStudentIds.length} / {ev.capacity} registered)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* School Filter */}
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Schools</option>
            {uniqueSchools.map(sch => (
              <option key={sch} value={sch}>{sch}</option>
            ))}
          </select>

          {/* Year Group Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Years</option>
            <option value="7">Year 7</option>
            <option value="8">Year 8</option>
            <option value="9">Year 9</option>
            <option value="10">Year 10</option>
            <option value="11">Year 11</option>
            <option value="12">Year 12</option>
            <option value="13">Year 13</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Classes</option>
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Sections</option>
            {uniqueSections.map(sec => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>

          {/* PE House Filter */}
          <select
            value={houseFilter}
            onChange={(e) => setHouseFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer font-bold"
          >
            <option value="ALL">All PE Houses</option>
            {HOUSE_NAMES.map(h => (
              <option key={h} value={h}>
                {h} House ({PE_HOUSES[h].colorName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white font-heading">
              {viewMode === 'EVENT_ROSTER' && activeEvent
                ? `Registered Attendees (${filteredStudents.length} of ${activeEvent.capacity} spots)`
                : `Enrolled Students Directory (${filteredStudents.length} matches)`}
            </h3>
            {viewMode === 'EVENT_ROSTER' && activeEvent?.requiresParentConsent && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                Parental Consent Enforced
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {viewMode === 'EVENT_ROSTER' && activeEvent ? `Deadline: ${activeEvent.registrationDeadline}` : 'Faculty Verified System'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">School Name</th>
                <th className="p-3.5">Cohort & Class</th>
                <th className="p-3.5">PE House</th>
                <th className="p-3.5">Student ID</th>
                {viewMode === 'EVENT_ROSTER' ? (
                  <>
                    <th className="p-3.5">Parental Consent</th>
                    <th className="p-3.5">Gate Check-In</th>
                  </>
                ) : (
                  <>
                    <th className="p-3.5">House Record</th>
                    <th className="p-3.5">Organiser Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No student records matched the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const consent = getConsentStatus(stu.id);
                  const isCheckedIn = activeEvent ? !!checkIns[`${activeEvent.id}-${stu.id}`] : false;
                  const houseCfg = getHouseConfig(stu.house);

                  return (
                    <tr key={stu.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-xs"
                            style={{ backgroundColor: houseCfg.hex }}
                          >
                            {stu.name.charAt(0)}
                          </div>
                          <span>{stu.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{stu.email}</div>
                      </td>

                      <td className="p-3.5 text-slate-300 font-medium">
                        <div className="flex items-center gap-1">
                          <School className="w-3 h-3 text-cyan-400" />
                          <span>{stu.schoolName || "St. Jude's Academy"}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-white font-semibold">Yr {stu.yearGroup} • {stu.className || '10-A'}</div>
                        <div className="text-[10px] text-cyan-400">Section {stu.sectionName || 'Alpha'}</div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border"
                          style={{
                            backgroundColor: `${houseCfg.hex}15`,
                            color: houseCfg.hex,
                            borderColor: `${houseCfg.hex}50`
                          }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: houseCfg.hex }} />
                          <span>{houseCfg.name}</span>
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-400 text-xs">
                        {stu.studentIdNumber}
                      </td>

                      {viewMode === 'EVENT_ROSTER' ? (
                        <>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${consent.color}`}>
                              {consent.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                              {consent.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-400" />}
                              <span>{consent.label}</span>
                            </span>
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => toggleCheckIn(stu.id)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isCheckedIn
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{isCheckedIn ? 'Checked In' : 'Mark Present'}</span>
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3.5">
                            {stu.houseVerified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/70 border border-amber-800 px-2 py-0.5 rounded-md">
                                <Clock className="w-3 h-3" /> Pending Audit
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => handleOpenHouseModal(stu)}
                              className="px-2.5 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3 text-purple-400" />
                              <span>Assign / Verify House</span>
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* House Verification & Reassignment Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-heading font-extrabold text-base">
                  Verify Official PE House Membership
                </h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-white">{editingStudent.name}</div>
              <div className="text-slate-400">
                School: <strong className="text-slate-200">{editingStudent.schoolName || "St. Jude's Academy"}</strong> • Year {editingStudent.yearGroup} ({editingStudent.className || '10-A'})
              </div>
              <div className="text-slate-400 font-mono text-[10px]">
                ID: {editingStudent.studentIdNumber}
              </div>
            </div>

            {houseSaveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{houseSaveSuccess}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Official School House Assignment (Select from the 5 PE Houses):
              </label>
              <div className="grid grid-cols-1 gap-2">
                {HOUSE_NAMES.map(house => {
                  const cfg = PE_HOUSES[house];
                  const isSelected = selectedHouseToAssign === house;

                  return (
                    <button
                      key={house}
                      type="button"
                      onClick={() => setSelectedHouseToAssign(house)}
                      className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-white/60 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 opacity-80 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${cfg.hex}25` : undefined,
                        borderColor: isSelected ? cfg.hex : undefined
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: cfg.hex }} />
                        <div>
                          <span className="text-xs font-extrabold text-white block">{cfg.label}</span>
                          <span className="text-[10px] text-slate-400">{cfg.colorName} • {cfg.tagline}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHouseMembership}
                disabled={isSavingHouse}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isSavingHouse ? 'Confirming...' : 'Verify & Save Official Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
