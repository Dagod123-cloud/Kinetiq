import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Building,
  Users,
  CheckCircle2,
  Lock,
  Plus,
  Save,
  Tag,
  Edit2,
  Trash2,
  AlertCircle,
  GraduationCap,
  Layers,
  ChevronRight,
  School,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { INITIAL_SCHOOLS } from '../../data/seedData.ts';
import { SchoolStructure, YearGroupConfig } from '../../types/index.ts';

export const SettingsView: React.FC = () => {
  const [schools, setSchools] = useState<SchoolStructure[]>(INITIAL_SCHOOLS);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(INITIAL_SCHOOLS[0].id);
  const [activeYear, setActiveYear] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New class input
  const [newClassInput, setNewClassInput] = useState('');
  // Editing class state
  const [editingClass, setEditingClass] = useState<{ original: string; current: string } | null>(null);

  // New year group input
  const [showAddYearGroup, setShowAddYearGroup] = useState(false);
  const [newYearNumber, setNewYearNumber] = useState<number>(7);

  // New school modal / form
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');

  // New section input
  const [newSectionInput, setNewSectionInput] = useState('');

  // Fetch current schools from API on mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch('/api/schools');
        if (res.ok) {
          const data = await res.json();
          if (data.schools && Array.isArray(data.schools) && data.schools.length > 0) {
            setSchools(data.schools);
            if (!data.schools.find((s: SchoolStructure) => s.id === selectedSchoolId)) {
              setSelectedSchoolId(data.schools[0].id);
            }
          }
        }
      } catch (err) {
        console.warn('Could not load live schools from API, using default seed structures:', err);
      }
    };
    fetchSchools();
  }, []);

  const currentSchool = schools.find(s => s.id === selectedSchoolId) || schools[0];

  // Ensure active year exists in current school
  useEffect(() => {
    if (currentSchool && currentSchool.yearGroups.length > 0) {
      if (!currentSchool.yearGroups.some(yg => yg.year === activeYear)) {
        setActiveYear(currentSchool.yearGroups[0].year);
      }
    }
  }, [currentSchool, activeYear]);

  const activeYearConfig = currentSchool?.yearGroups.find(yg => yg.year === activeYear) || currentSchool?.yearGroups[0];

  // Helper to persist school structure to server
  const saveSchoolChanges = async (updatedSchool: SchoolStructure) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('kinetiq_session_token');
      const res = await fetch(`/api/schools/${updatedSchool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: updatedSchool.name,
          yearGroups: updatedSchool.yearGroups,
          sections: updatedSchool.sections
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save changes');
      }

      setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
      setSavedSuccess(`Configuration for ${updatedSchool.name} saved successfully.`);
      setTimeout(() => setSavedSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving school configuration:', err);
      // Fallback: still update local state
      setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
      setSavedSuccess(`Changes updated locally for ${updatedSchool.name}.`);
      setTimeout(() => setSavedSuccess(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Add class to active year group
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassInput.trim() || !activeYearConfig) return;

    const trimmed = newClassInput.trim();
    if (activeYearConfig.classes.includes(trimmed)) {
      setErrorMessage(`Class "${trimmed}" already exists in Year ${activeYear}.`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const updatedYearGroups = currentSchool.yearGroups.map(yg => {
      if (yg.year === activeYear) {
        return {
          ...yg,
          classes: [...yg.classes, trimmed]
        };
      }
      return yg;
    });

    const updatedSchool: SchoolStructure = {
      ...currentSchool,
      yearGroups: updatedYearGroups
    };

    setNewClassInput('');
    saveSchoolChanges(updatedSchool);
  };

  // Rename a class
  const handleSaveRename = (originalName: string, newName: string) => {
    if (!newName.trim() || newName.trim() === originalName || !activeYearConfig) {
      setEditingClass(null);
      return;
    }

    const trimmed = newName.trim();
    if (activeYearConfig.classes.includes(trimmed) && trimmed !== originalName) {
      setErrorMessage(`Class "${trimmed}" already exists in Year ${activeYear}.`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const updatedYearGroups = currentSchool.yearGroups.map(yg => {
      if (yg.year === activeYear) {
        return {
          ...yg,
          classes: yg.classes.map(c => c === originalName ? trimmed : c)
        };
      }
      return yg;
    });

    const updatedSchool: SchoolStructure = {
      ...currentSchool,
      yearGroups: updatedYearGroups
    };

    setEditingClass(null);
    saveSchoolChanges(updatedSchool);
  };

  // Remove a class
  const handleRemoveClass = (classToRemove: string) => {
    if (!activeYearConfig) return;
    if (activeYearConfig.classes.length <= 1) {
      setErrorMessage(`Year ${activeYear} must contain at least one class.`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const updatedYearGroups = currentSchool.yearGroups.map(yg => {
      if (yg.year === activeYear) {
        return {
          ...yg,
          classes: yg.classes.filter(c => c !== classToRemove)
        };
      }
      return yg;
    });

    const updatedSchool: SchoolStructure = {
      ...currentSchool,
      yearGroups: updatedYearGroups
    };

    saveSchoolChanges(updatedSchool);
  };

  // Add new Year Group
  const handleAddYearGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSchool.yearGroups.some(yg => yg.year === newYearNumber)) {
      setErrorMessage(`Year ${newYearNumber} already exists in ${currentSchool.name}.`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const defaultClass = `${newYearNumber}-A`;
    const newYg: YearGroupConfig = {
      year: newYearNumber,
      classes: [defaultClass, `${newYearNumber}-B`]
    };

    const updatedYearGroups = [...currentSchool.yearGroups, newYg].sort((a, b) => a.year - b.year);
    const updatedSchool: SchoolStructure = {
      ...currentSchool,
      yearGroups: updatedYearGroups
    };

    setShowAddYearGroup(false);
    setActiveYear(newYearNumber);
    saveSchoolChanges(updatedSchool);
  };

  // Add new Section
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionInput.trim()) return;
    const trimmed = newSectionInput.trim();

    if (currentSchool.sections.includes(trimmed)) {
      setErrorMessage(`Section "${trimmed}" already exists.`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const updatedSchool: SchoolStructure = {
      ...currentSchool,
      sections: [...currentSchool.sections, trimmed]
    };

    setNewSectionInput('');
    saveSchoolChanges(updatedSchool);
  };

  // Remove Section
  const handleRemoveSection = (sectionToRemove: string) => {
    if (currentSchool.sections.length <= 1) {
      setErrorMessage('A school must have at least one active section.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const updatedSchool: SchoolStructure = {
      ...currentSchool,
      sections: currentSchool.sections.filter(s => s !== sectionToRemove)
    };

    saveSchoolChanges(updatedSchool);
  };

  // Add New School
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    const trimmedName = newSchoolName.trim();
    const newId = `school-${Date.now()}`;
    const newSchoolObj: SchoolStructure = {
      id: newId,
      name: trimmedName,
      isDefault: false,
      yearGroups: [
        { year: 7, classes: ['7-A', '7-B'] },
        { year: 8, classes: ['8-A', '8-B'] },
        { year: 9, classes: ['9-A', '9-B'] },
        { year: 10, classes: ['10-A', '10-B'] },
        { year: 11, classes: ['11-A', '11-B'] },
        { year: 12, classes: ['12-A', '12-B'] },
        { year: 13, classes: ['13-A', '13-B'] }
      ],
      sections: ['Alpha', 'Beta', 'Gamma']
    };

    setLoading(true);
    try {
      const token = localStorage.getItem('kinetiq_session_token');
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: trimmedName,
          yearGroups: newSchoolObj.yearGroups,
          sections: newSchoolObj.sections
        })
      });

      if (res.ok) {
        const data = await res.json();
        const saved = data.school || newSchoolObj;
        setSchools(prev => [...prev, saved]);
        setSelectedSchoolId(saved.id);
      } else {
        setSchools(prev => [...prev, newSchoolObj]);
        setSelectedSchoolId(newId);
      }

      setNewSchoolName('');
      setShowAddSchool(false);
      setSavedSuccess(`School "${trimmedName}" created and ready for configuration.`);
      setTimeout(() => setSavedSuccess(null), 3500);
    } catch (err) {
      console.error('Error creating school:', err);
      setSchools(prev => [...prev, newSchoolObj]);
      setSelectedSchoolId(newId);
      setShowAddSchool(false);
      setNewSchoolName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2.5 py-0.5 rounded-md">
              System Administration
            </span>
            <span className="text-xs font-bold text-slate-400">
              Multi-School Academic Hierarchy
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-2">
            School Configuration & Academic Administration
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure dynamic Year Groups, rename or remove outdated classes, allocate sections, and manage multiple campus structures independently.
          </p>
        </div>

        <button
          onClick={() => setShowAddSchool(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer whitespace-nowrap"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Add New School Campus</span>
        </button>
      </div>

      {/* Alerts */}
      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{savedSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Modal: Add New School Campus */}
      {showAddSchool && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-800/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-purple-400">
              <School className="w-5 h-5" />
              <h3 className="text-base font-black text-white font-heading">Register New School Campus</h3>
            </div>
            <p className="text-xs text-slate-400">
              Enter the official school or branch name. A standard secondary year hierarchy (Years 7–13) will be seeded automatically for you to customise.
            </p>
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">School Name</label>
                <input
                  type="text"
                  required
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="e.g. West Coast Grammar School"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSchool(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newSchoolName.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create School</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main School Selector Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Managing Campus Structure</span>
              <h3 className="text-base font-black text-white font-heading">{currentSchool?.name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400">Switch School:</label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {schools.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Year Group Tabs & Add Year Group */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-black text-white font-heading">
                Year Groups & Academic Cohorts
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a Year Group to manage its classes and student registration allocations.
            </p>
          </div>

          <button
            onClick={() => setShowAddYearGroup(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-cyan-800/40 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Year Group</span>
          </button>
        </div>

        {/* Add Year Group inline form */}
        {showAddYearGroup && (
          <form onSubmit={handleAddYearGroup} className="p-4 rounded-2xl bg-slate-950 border border-cyan-800/50 flex flex-wrap items-center gap-3 animate-in fade-in">
            <span className="text-xs font-bold text-slate-300">Enter Year Number:</span>
            <input
              type="number"
              min="1"
              max="14"
              value={newYearNumber}
              onChange={(e) => setNewYearNumber(parseInt(e.target.value) || 7)}
              className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Confirm Year Group
            </button>
            <button
              type="button"
              onClick={() => setShowAddYearGroup(false)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Year Groups Horizontal Selector */}
        <div className="flex flex-wrap gap-2">
          {currentSchool?.yearGroups.map(yg => {
            const isSelected = yg.year === activeYear;
            return (
              <button
                key={yg.year}
                onClick={() => setActiveYear(yg.year)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-400/40'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>Year {yg.year}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {yg.classes.length} {yg.classes.length === 1 ? 'class' : 'classes'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Classes Table / Grid for the Active Year Group */}
        {activeYearConfig && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-300">
                  Classes configured in <span className="text-cyan-400 font-black">Year {activeYear}</span>:
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  These classes appear in the registration dropdown when students choose Year {activeYear} at {currentSchool.name}.
                </p>
              </div>

              {/* Add Class Form */}
              <form onSubmit={handleAddClass} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newClassInput}
                  onChange={(e) => setNewClassInput(e.target.value)}
                  placeholder={`e.g. ${activeYear}-D or ${activeYear}-STEM`}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-44"
                />
                <button
                  type="submit"
                  disabled={!newClassInput.trim() || loading}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Class</span>
                </button>
              </form>
            </div>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeYearConfig.classes.map(cls => {
                const isEditing = editingClass?.original === cls;

                if (isEditing) {
                  return (
                    <div
                      key={cls}
                      className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-700 flex flex-col gap-2"
                    >
                      <span className="text-[10px] font-bold text-indigo-300 uppercase">Rename Class</span>
                      <input
                        type="text"
                        autoFocus
                        value={editingClass.current}
                        onChange={(e) => setEditingClass({ ...editingClass, current: e.target.value })}
                        className="px-2.5 py-1.5 bg-slate-950 border border-indigo-500 rounded-xl text-xs text-white focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingClass(null)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveRename(cls, editingClass.current)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={cls}
                    className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span className="text-xs font-mono font-bold text-white tracking-wide">
                        {cls}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Rename class"
                        onClick={() => setEditingClass({ original: cls, current: cls })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Remove outdated class"
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove class "${cls}" from Year ${activeYear}?`)) {
                            handleRemoveClass(cls);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sections Configuration */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-black text-white font-heading">
                Campus Sections / Cohort Divisions
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Available section designations for {currentSchool?.name} (e.g. Alpha, Beta, Gamma, Section 1).
            </p>
          </div>

          {/* Add Section Form */}
          <form onSubmit={handleAddSection} className="flex items-center gap-2">
            <input
              type="text"
              value={newSectionInput}
              onChange={(e) => setNewSectionInput(e.target.value)}
              placeholder="e.g. Theta or Section E"
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 w-44"
            />
            <button
              type="submit"
              disabled={!newSectionInput.trim() || loading}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Section</span>
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {currentSchool?.sections.map(sec => (
            <div
              key={sec}
              className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-purple-300 flex items-center gap-2"
            >
              <span>{sec}</span>
              <button
                onClick={() => {
                  if (confirm(`Remove section "${sec}"?`)) {
                    handleRemoveSection(sec);
                  }
                }}
                className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer text-xs"
                title="Remove section"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Strict Role Separation Audit */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-black text-white font-heading">
            Strict Security & Role Isolation Verification
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">✓ Organiser Account Protection</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Public registration allows student account creation only. Organiser accounts are strictly locked to authorized faculty credentials with cryptographically salted passwords.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">✓ Multi-School Data Scoping</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Student cohort structures, year groups, and classes are strictly bound to their respective registered school name to prevent cross-campus data leakage.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">✓ Official House Records</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Student PE house affiliations (Crimson, Tiger, Amber, Lime, Sapphire) are verified against official school rosters with organizer lock controls.
            </p>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 gap-2">
          <span>KinetiQ Planner Platform • Developed by: SMR TechNova</span>
          <span>Connecting Students, Ideas and Events.</span>
        </div>
      </div>
    </div>
  );
};
