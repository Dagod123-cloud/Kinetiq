import React, { useState } from 'react';
import {
  X,
  Star,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Edit3,
  Send,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SchoolEvent, Feedback } from '../../types/index.ts';
import { scanTextForModeration } from '../../utils/moderation.ts';

interface FeedbackModalProps {
  event: SchoolEvent;
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp'>) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  event,
  isOpen,
  onClose,
  onSubmitFeedback
}) => {
  const [liked, setLiked] = useState('');
  const [disliked, setDisliked] = useState('');
  const [recommend, setRecommend] = useState<boolean | null>(true);
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Moderation state
  const [moderationBlocked, setModerationBlocked] = useState(false);
  const [moderationReason, setModerationReason] = useState('');
  const [flaggedTerms, setFlaggedTerms] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liked.trim() && !disliked.trim()) return;

    setIsSubmitting(true);
    setModerationBlocked(false);
    setModerationReason('');
    setFlaggedTerms([]);

    const combinedText = `${liked} ${disliked}`;

    // Step 1: Client-side quick moderation scan
    const localCheck = scanTextForModeration(combinedText);
    if (!localCheck.approved) {
      setIsSubmitting(false);
      setModerationBlocked(true);
      setModerationReason(localCheck.reason);
      setFlaggedTerms(localCheck.flaggedTerms);
      return;
    }

    // Step 2: Server-side check with Gemini context safety API
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
          setModerationReason(data.reason || 'Comment contains language that requires editing.');
          setFlaggedTerms(data.flaggedTerms || []);
          return;
        }
      }
    } catch (err) {
      console.warn('Server moderation endpoint check fallback:', err);
    }

    // Moderation Passed! Submit anonymously
    setIsSubmitting(false);
    onSubmitFeedback({
      eventId: event.id,
      eventTitle: event.title,
      liked: liked.trim(),
      disliked: disliked.trim(),
      recommend: recommend ?? true,
      rating,
      isAnonymous: true
    });

    setIsSuccess(true);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      role="dialog"
      aria-label="Submit anonymous feedback"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Anonymous Feedback Submission</span>
            </div>
            <h3 className="text-lg font-bold font-heading">{event.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 font-heading">
              Feedback Submitted Anonymously!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thank you! Your comments passed automated moderation and have been shared with school organisers to improve future activities.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Moderation Block Alert Notice (Process requirement) */}
            {moderationBlocked && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 animate-in shake">
                <div className="flex items-start gap-2.5">
                  <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Automatic Moderation Notice
                    </h5>
                    <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                      {moderationReason}
                    </p>
                    {flaggedTerms.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-rose-900">Flagged words:</span>
                        {flaggedTerms.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold px-2 py-0.5 bg-rose-200/80 text-rose-950 rounded-md line-through"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-rose-700 mt-2 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" />
                      Please edit your comments below and resubmit for another check.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Question 1: What did you like? */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                1. What did you like most about the event?
              </label>
              <textarea
                value={liked}
                onChange={(e) => {
                  setLiked(e.target.value);
                  if (moderationBlocked) setModerationBlocked(false);
                }}
                required
                rows={3}
                placeholder="E.g., The experiments were engaging, the DJ had a great playlist, loved the guest speaker..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Question 2: What did you dislike or what could be improved? */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                2. What could be improved or what did you dislike?
              </label>
              <textarea
                value={disliked}
                onChange={(e) => {
                  setDisliked(e.target.value);
                  if (moderationBlocked) setModerationBlocked(false);
                }}
                rows={3}
                placeholder="E.g., The sound was a bit quiet at the back, queue times were long, needed more chairs..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Question 3: Would you recommend organising a similar event again? (Yes/No) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                3. Do you recommend organising a similar event again?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRecommend(true)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                    recommend === true
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  aria-pressed={recommend === true}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Yes, absolutely</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecommend(false)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                    recommend === false
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  aria-pressed={recommend === false}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>No, try something else</span>
                </button>
              </div>
            </div>

            {/* Overall Star Rating */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Overall Event Experience Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`w-6 h-6 transition-all ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-slate-500 ml-2">
                  {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : 'Needs Work'}
                </span>
              </div>
            </div>

            {/* Anonymity Security Notice */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                Zero personal identifiers (no name, student ID, or email) are transmitted with this form.
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!liked.trim() && !disliked.trim())}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white transition-all shadow-xs flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning Comment...</span>
                  </>
                ) : moderationBlocked ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Resubmit for Moderation Check</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Anonymous Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
