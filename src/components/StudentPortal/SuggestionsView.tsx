import React, { useState } from 'react';
import {
  Lightbulb,
  ThumbsUp,
  Plus,
  Send,
  Sparkles,
  ShieldCheck,
  Tag,
  AlertOctagon,
  Edit3,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventSuggestion, EventCategory, StudentProfile } from '../../types/index.ts';
import { scanTextForModeration } from '../../utils/moderation.ts';

interface SuggestionsViewProps {
  suggestions: EventSuggestion[];
  activeStudent: StudentProfile;
  onAddSuggestion: (suggestion: Omit<EventSuggestion, 'id' | 'upvotes' | 'createdAt'>) => void;
  onToggleUpvote: (suggestionId: string) => void;
}

const CATEGORIES: EventCategory[] = [
  'Social & Fun',
  'Sports',
  'Arts & Drama',
  'STEM & Robotics',
  'Academic & Careers',
  'Community & Charity',
  'Leadership & Council'
];

export const SuggestionsView: React.FC<SuggestionsViewProps> = ({
  suggestions,
  activeStudent,
  onAddSuggestion,
  onToggleUpvote
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Social & Fun');
  const [description, setDescription] = useState('');
  const [scale, setScale] = useState<'Small (Class/Club)' | 'Medium (Year Group)' | 'Large (Whole School)'>('Large (Whole School)');

  // Moderation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationBlocked, setModerationBlocked] = useState(false);
  const [moderationReason, setModerationReason] = useState('');
  const [flaggedTerms, setFlaggedTerms] = useState<string[]>([]);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setModerationBlocked(false);
    setModerationReason('');
    setFlaggedTerms([]);

    const combinedText = `${title} ${description}`;

    // Step 1: Client check
    const localCheck = scanTextForModeration(combinedText);
    if (!localCheck.approved) {
      setIsSubmitting(false);
      setModerationBlocked(true);
      setModerationReason(localCheck.reason);
      setFlaggedTerms(localCheck.flaggedTerms);
      return;
    }

    // Step 2: Server check
    try {
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: combinedText })
      });
      if (response.ok) {
        const data = await response.json();
        if (!data.approved) {
          setIsSubmitting(false);
          setModerationBlocked(true);
          setModerationReason(data.reason || 'Suggestion contains language requiring editing.');
          setFlaggedTerms(data.flaggedTerms || []);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Moderation Passed!
    setIsSubmitting(false);
    onAddSuggestion({
      title: title.trim(),
      category,
      description: description.trim(),
      estimatedScale: scale,
      studentYearGroup: activeStudent.yearGroup,
      status: 'Under Consideration'
    });

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setSubmittedSuccess(true);
    setTimeout(() => {
      setTitle('');
      setDescription('');
      setShowForm(false);
      setSubmittedSuccess(false);
    }, 1500);
  };

  const getStatusBadge = (status: EventSuggestion['status']) => {
    switch (status) {
      case 'Approved & Scheduled':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Approved & Scheduled
          </span>
        );
      case 'Feasibility Review':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            Feasibility Review
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Under Consideration
          </span>
        );
    }
  };

  // Sort by upvotes descending
  const sortedSuggestions = [...suggestions].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md mb-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Student Voice & Ideation
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Suggest Future School Events
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Have a brilliant idea for a tournament, club night, charity drive, or fair?
            Propose it anonymously, vote for student ideas, and see them turned into official school events!
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel Suggestion' : 'Suggest an Event'}</span>
        </button>
      </div>

      {/* Suggestion Form Drawer */}
      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-indigo-200 ring-2 ring-indigo-500/10 shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Propose a New School Activity
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Anonymous Submission
            </div>
          </div>

          {submittedSuccess ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Idea Submitted Successfully!</h4>
              <p className="text-xs text-slate-500">
                It is now visible on the student board for peer upvoting and organiser review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {moderationBlocked && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-700">
                    <AlertOctagon className="w-4 h-4" />
                    <span>Automatic Comment Moderation</span>
                  </div>
                  <p>{moderationReason}</p>
                  {flaggedTerms.length > 0 && (
                    <div className="flex gap-1 items-center flex-wrap mt-1">
                      <span>Flagged:</span>
                      {flaggedTerms.map((t, idx) => (
                        <span key={idx} className="bg-rose-200 px-1.5 py-0.5 rounded text-[10px] font-bold line-through">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-rose-700 font-medium pt-1 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Edit your idea and resubmit for approval.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Event Title / Idea Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (moderationBlocked) setModerationBlocked(false);
                    }}
                    required
                    placeholder="E.g., Sunset Outdoor Cinema Night, Mario Kart Tournament..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Description & How It Would Work
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (moderationBlocked) setModerationBlocked(false);
                  }}
                  required
                  rows={3}
                  placeholder="Describe your idea: what would happen, what equipment might be needed, and why students would love it..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">Estimated Scale</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Small (Class/Club)', 'Medium (Year Group)', 'Large (Whole School)'] as const).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setScale(s)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          scale === s
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 flex items-center gap-2 shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking Content...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Anonymous Idea</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Suggestion Cards Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Student Ideas Leaderboard ({suggestions.length})
          </h3>
          <span className="text-xs text-slate-400">Ranked by peer student upvotes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedSuggestions.map((sug) => (
            <div
              key={sug.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs flex flex-col justify-between space-y-4 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {sug.category}
                  </span>
                  {getStatusBadge(sug.status)}
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">
                  {sug.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {sug.description}
                </p>

                {/* Organiser Consideration Note */}
                {sug.organizerNotes && (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950">
                    <span className="font-bold block text-[11px] text-indigo-800 uppercase tracking-wider mb-0.5">
                      Organiser Review Update:
                    </span>
                    {sug.organizerNotes}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 text-[11px]">
                  Scale: <strong className="text-slate-700">{sug.estimatedScale}</strong>
                </span>

                <button
                  onClick={() => onToggleUpvote(sug.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    sug.upvotedByMe
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  aria-label={`Upvote ${sug.title}`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{sug.upvotes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
