import React, { useState } from 'react';
import {
  Lightbulb,
  ThumbsUp,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  Tag,
  Clock,
  ArrowRight
} from 'lucide-react';
import { EventSuggestion, SchoolEvent } from '../../types/index.ts';

interface SuggestionsBoardProps {
  suggestions: EventSuggestion[];
  onUpdateStatus: (suggestionId: string, status: EventSuggestion['status'], note?: string) => void;
  onConvertToEvent: (suggestion: EventSuggestion) => void;
}

export const SuggestionsBoard: React.FC<SuggestionsBoardProps> = ({
  suggestions,
  onUpdateStatus,
  onConvertToEvent
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedSugForNote, setSelectedSugForNote] = useState<EventSuggestion | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  const filtered = suggestions.filter(s => {
    if (filterStatus === 'ALL') return true;
    return s.status === filterStatus;
  });

  const sorted = [...filtered].sort((a, b) => b.upvotes - a.upvotes);

  const handleSaveNote = () => {
    if (!selectedSugForNote) return;
    onUpdateStatus(selectedSugForNote.id, selectedSugForNote.status, feedbackNote);
    setSelectedSugForNote(null);
    setFeedbackNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md mb-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Co-Creating School Life
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Student Suggestions & Idea Backlog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Review proposed student activities ranked by peer popularity. Change review statuses, provide public updates to students, or convert popular ideas straight into upcoming calendar events.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
          {(['ALL', 'Under Consideration', 'Feasibility Review', 'Approved & Scheduled'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === st
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Ideas' : st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((sug) => (
          <div
            key={sug.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-slate-300 shadow-xs flex flex-col justify-between space-y-4 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {sug.category} • {sug.estimatedScale}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{sug.upvotes} student votes</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {sug.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {sug.description}
              </p>

              {sug.organizerNotes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950">
                  <span className="font-bold block text-[11px] text-amber-800 uppercase tracking-wider mb-0.5">
                    Organiser Note Published to Students:
                  </span>
                  {sug.organizerNotes}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Status Switcher Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Status:</span>
                  <select
                    value={sug.status}
                    onChange={(e) => onUpdateStatus(sug.id, e.target.value as any, sug.organizerNotes)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Under Consideration">Under Consideration</option>
                    <option value="Feasibility Review">Feasibility Review</option>
                    <option value="Approved & Scheduled">Approved & Scheduled</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSugForNote(sug);
                      setFeedbackNote(sug.organizerNotes || '');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{sug.organizerNotes ? 'Edit Note' : 'Add Note'}</span>
                  </button>

                  <button
                    onClick={() => onConvertToEvent(sug)}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Convert to Event</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note Editor Modal */}
      {selectedSugForNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-base font-bold text-slate-900 font-heading">
              Add Organiser Update for "{selectedSugForNote.title}"
            </h4>
            <p className="text-xs text-slate-500">
              Students who browse or upvoted this idea will see your note on their board.
            </p>
            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              rows={3}
              placeholder="E.g., We love this! Discussed at the staff meeting today; investigating equipment availability..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSugForNote(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save & Post Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
