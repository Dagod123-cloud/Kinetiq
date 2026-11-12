import React, { useState } from 'react';
import {
  CalendarPlus,
  X,
  Clock,
  MapPin,
  Tag,
  Check,
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { SchoolEvent, EventCategory } from '../../types/index.ts';
import { playSuccessChime, playUiClick } from '../../utils/soundEffects.ts';

interface AddPersonalEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  onAddEvent: (event: SchoolEvent) => void;
}

const COLOR_OPTIONS = [
  { id: 'sapphire', label: 'Sapphire Blue', hex: '#2563eb', bgClass: 'bg-blue-600', ringClass: 'ring-blue-400' },
  { id: 'emerald', label: 'Lime / Emerald', hex: '#16a34a', bgClass: 'bg-emerald-600', ringClass: 'ring-emerald-400' },
  { id: 'amber', label: 'Tiger / Amber', hex: '#d97706', bgClass: 'bg-amber-600', ringClass: 'ring-amber-400' },
  { id: 'crimson', label: 'Crimson Red', hex: '#dc2626', bgClass: 'bg-red-600', ringClass: 'ring-red-400' },
  { id: 'purple', label: 'Amethyst Purple', hex: '#9333ea', bgClass: 'bg-purple-600', ringClass: 'ring-purple-400' },
  { id: 'rose', label: 'Rose Pink', hex: '#e11d48', bgClass: 'bg-rose-600', ringClass: 'ring-rose-400' },
  { id: 'slate', label: 'Dark Charcoal', hex: '#475569', bgClass: 'bg-slate-600', ringClass: 'ring-slate-400' }
];

const PRESETS = [
  { title: 'Biology Exam Revision', category: 'Academic & Careers' as EventCategory, time: '16:00', endTime: '17:30', location: 'School Library' },
  { title: 'Football Training / PE', category: 'Sports' as EventCategory, time: '15:30', endTime: '17:00', location: 'Main Sports Pitch' },
  { title: 'Physics Lab Report Prep', category: 'STEM & Robotics' as EventCategory, time: '14:30', endTime: '16:00', location: 'Science Lab 3' },
  { title: 'Maths Homework Club', category: 'Academic & Careers' as EventCategory, time: '15:15', endTime: '16:15', location: 'Room 204' },
  { title: 'Music & Band Rehearsal', category: 'Arts & Drama' as EventCategory, time: '16:30', endTime: '17:45', location: 'Music Auditorium' },
  { title: 'Robotics Project Sprint', category: 'STEM & Robotics' as EventCategory, time: '15:45', endTime: '17:15', location: 'Tech Workshop' }
];

export const AddPersonalEventModal: React.FC<AddPersonalEventModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  userId,
  userName = 'Student',
  userEmail,
  onAddEvent
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || todayStr);
  const [startTime, setStartTime] = useState('15:30');
  const [endTime, setEndTime] = useState('16:30');
  const [location, setLocation] = useState('School Library / Study Hall');
  const [category, setCategory] = useState<EventCategory>('Academic & Careers');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].hex);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    playUiClick();
    setTitle(preset.title);
    setCategory(preset.category);
    setStartTime(preset.time);
    setEndTime(preset.endTime);
    setLocation(preset.location);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please provide an event or study session title.');
      return;
    }

    setErrorMessage(null);
    playSuccessChime();

    const newPersonalEvent: SchoolEvent = {
      id: `personal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: notes.trim() || `${title.trim()} on your personal schedule.`,
      notes: notes.trim(),
      category,
      date: date || todayStr,
      startTime: startTime || '15:30',
      endTime: endTime || '16:30',
      location: location.trim() || 'School Library',
      audience: 'REGISTERED_ONLY',
      requiresRegistration: false,
      capacity: 1,
      registeredStudentIds: userId ? [userId] : ['active-user'],
      registrationDeadline: `${date} ${startTime}`,
      status: 'UPCOMING',
      organizerName: userName || 'Personal Event',
      isPersonal: true,
      userId: userId || 'active-user',
      userEmail: userEmail || '',
      personalColor: selectedColor
    };

    onAddEvent(newPersonalEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-700 my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-heading">
                Add to My Calendar
              </h3>
              <p className="text-xs text-slate-400">
                Personal study session, practice, or activity reminder
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playUiClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Preset Badges */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-indigo-300 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Event Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Chemistry Revision, Basketball Practice, Math Club..."
              required
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="Academic & Careers">Academic & Study</option>
                <option value="Sports">Sports & PE Training</option>
                <option value="STEM & Robotics">STEM & Robotics</option>
                <option value="Arts & Drama">Arts & Music</option>
                <option value="Leadership & Council">Club & Leadership</option>
                <option value="Social & Fun">Personal & Leisure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Location / Venue</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="E.g., Library 2nd Floor, Room 102..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Highlight Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((col) => {
                const isSelected = selectedColor === col.hex;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      playUiClick();
                      setSelectedColor(col.hex);
                    }}
                    title={col.label}
                    className={`w-7 h-7 rounded-xl ${col.bgClass} flex items-center justify-center transition-transform cursor-pointer ${
                      isSelected ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Notes or Study Goals (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Chapter 4 biology flashcards, bring past papers, water bottle..."
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                playUiClick();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 flex items-center gap-2 cursor-pointer transition-all"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Add to My Calendar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
