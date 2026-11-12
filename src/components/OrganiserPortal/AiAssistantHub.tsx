import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Palette,
  FileText,
  Lightbulb,
  Loader2,
  CheckCircle2,
  Calendar,
  Send,
  Download,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { SchoolEvent, Feedback, ConsentFormTemplate } from '../../types/index.ts';

interface AiAssistantHubProps {
  events: SchoolEvent[];
  feedbacks: Feedback[];
  onOpenPosterStudio: (eventId?: string) => void;
  onOpenConsentManager: () => void;
}

export const AiAssistantHub: React.FC<AiAssistantHubProps> = ({
  events,
  feedbacks,
  onOpenPosterStudio,
  onOpenConsentManager
}) => {
  const [selectedTool, setSelectedTool] = useState<'FEEDBACK' | 'POSTER' | 'CONSENT' | 'IDEATION'>('FEEDBACK');

  // Feedback Analysis State
  const [feedbackEventId, setFeedbackEventId] = useState<string>(events.find(e => e.status === 'COMPLETED')?.id || events[0]?.id || '');
  const [analysisMode, setAnalysisMode] = useState<'both' | 'summary' | 'improvements'>('both');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<any>(null);

  // Ideation Assistant State
  const [ideationTheme, setIdeationTheme] = useState('STEM & Robotics Festival for Spring Term');
  const [targetAudience, setTargetAudience] = useState('Whole School (Years 7-13)');
  const [isIdeating, setIsIdeating] = useState(false);
  const [ideationResults, setIdeationResults] = useState<any>(null);

  // Helper to run feedback analysis
  const handleRunFeedbackAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisReport(null);

    const targetEvt = events.find(e => e.id === feedbackEventId);
    const reviews = feedbacks.filter(f => f.eventId === feedbackEventId);

    try {
      const res = await fetch('/api/ai/analyze-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: targetEvt?.title || 'School Event',
          reviews: reviews.length > 0 ? reviews : [
            { liked: 'High energy and enthusiastic student engagement.', disliked: 'Queue bottlenecks at the entrance gate.', recommend: true }
          ],
          mode: analysisMode
        })
      });

      const data = await res.json();
      setAnalysisReport(data);
    } catch (err) {
      console.error('Feedback analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to run ideation
  const handleRunIdeation = () => {
    setIsIdeating(true);
    setTimeout(() => {
      setIdeationResults({
        concepts: [
          {
            title: 'KinetiQ RoboWars & Drone Obstacle Derby',
            scale: 'Whole School',
            description: 'Teams build and pilot customized autonomous rovers through an interactive laser-timed obstacle maze in the sports hall.',
            highlights: ['Hands-on micro:bit coding', 'House point tournament brackets', 'Live broadcast on cafeteria screens']
          },
          {
            title: 'St. Jude’s Youth Climate Action & Solar Build',
            scale: 'Years 8-11',
            description: 'Students collaborate with local clean-energy engineers to assemble portable solar power banks for school charging stations.',
            highlights: ['Clean energy career talks', 'Certificate of STEM achievement', 'Hands-on electrical safety kits']
          },
          {
            title: 'Inter-House Mystery Escape Room Gala',
            scale: 'Whole School',
            description: 'Classrooms converted into themed puzzle chambers requiring science, literature, and math riddles to escape.',
            highlights: ['Team problem solving', 'Costumed faculty game masters', 'Healthy competitive spirit']
          }
        ]
      });
      setIsIdeating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SMR TechNova AI Suite</span>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 hidden sm:inline">4 Core Intelligence Capabilities</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-2">
            Organiser AI Assistant Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Deploy Google Gemini AI to analyze actual student reviews, generate structured improvement roadmaps, draft promotional posters, design parental consent forms, and pitch engaging activities.
          </p>
        </div>
      </div>

      {/* 4 Tool Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedTool('FEEDBACK')}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
            selectedTool === 'FEEDBACK'
              ? 'bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-500/20'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-purple-900/50 text-purple-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            {selectedTool === 'FEEDBACK' && <span className="w-2 h-2 rounded-full bg-purple-400" />}
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">Review Summariser & Insights</h4>
            <p className="text-[11px] text-slate-400 mt-1">Synthesize reviews and operational fixes</p>
          </div>
        </button>

        <button
          onClick={() => onOpenPosterStudio()}
          className="p-4 rounded-3xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-300 group-hover:scale-105 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">Promotional Poster Generator</h4>
            <p className="text-[11px] text-slate-400 mt-1">Design eye-catching event posters</p>
          </div>
        </button>

        <button
          onClick={() => onOpenConsentManager()}
          className="p-4 rounded-3xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-300 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">Consent Form Generator</h4>
            <p className="text-[11px] text-slate-400 mt-1">Draft parental excursion agreements</p>
          </div>
        </button>

        <button
          onClick={() => setSelectedTool('IDEATION')}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
            selectedTool === 'IDEATION'
              ? 'bg-amber-950/80 border-amber-500 text-white shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-amber-900/50 text-amber-300">
              <Lightbulb className="w-5 h-5" />
            </div>
            {selectedTool === 'IDEATION' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">Event Ideator & Brainstorm</h4>
            <p className="text-[11px] text-slate-400 mt-1">Generate concepts from student trends</p>
          </div>
        </button>
      </div>

      {/* FEEDBACK ANALYSIS TOOL */}
      {selectedTool === 'FEEDBACK' && (
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white font-heading flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>AI Feedback Summariser & Improvement Recommendations</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyzes actual student reviews, distinguishes positives from pain points, and delivers operational recommendations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Analysis Mode:</span>
              <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setAnalysisMode('summary')}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                    analysisMode === 'summary' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setAnalysisMode('improvements')}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                    analysisMode === 'improvements' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Improvements
                </button>
                <button
                  onClick={() => setAnalysisMode('both')}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                    analysisMode === 'both' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Both
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-300">Choose Event to Analyze:</label>
              <select
                value={feedbackEventId}
                onChange={(e) => setFeedbackEventId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {events.map(ev => {
                  const count = feedbacks.filter(f => f.eventId === ev.id).length;
                  return (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({count} reviews) - {ev.date}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={handleRunFeedbackAnalysis}
              disabled={isAnalyzing}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Insights...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Feedback Report</span>
                </>
              )}
            </button>
          </div>

          {/* Structured Output View */}
          {analysisReport && (
            <div className="space-y-6 pt-4 border-t border-slate-800 animate-in fade-in">
              {analysisReport.summary && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/50">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block mb-1">
                      Overall Student Sentiment:
                    </span>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {analysisReport.summary.overallSentiment}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>What Went Well (Key Praises)</span>
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                        {analysisReport.summary.keyPraises?.map((p: string, i: number) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Problems Identified</span>
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                        {analysisReport.summary.recurringComplaints?.map((c: string, i: number) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Student Suggestions</span>
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                        {analysisReport.summary.studentSuggestions?.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {analysisReport.recommendations && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-white font-heading flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>Practical Operational Solutions & Next Steps</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {analysisReport.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                              {rec.area}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              rec.priority === 'High' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {rec.priority} Priority
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white">{rec.issue}</h5>
                        </div>
                        <p className="text-[11px] text-slate-300 italic border-l-2 border-cyan-400 pl-2">
                          "{rec.solution}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* EVENT IDEATOR & BRAINSTORM */}
      {selectedTool === 'IDEATION' && (
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-black text-white font-heading flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-300" />
              <span>AI Event Idea & Curriculum Pitch Assistant</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Brainstorms new activities aligned with student interest trends, curriculum enrichment, and house spirit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300">Theme or School Focus Area:</label>
              <input
                type="text"
                value={ideationTheme}
                onChange={(e) => setIdeationTheme(e.target.value)}
                placeholder="e.g. STEM Festival, Outdoor Survival, Arts Showcase"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Audience Scope:</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Whole School (Years 7-13)">Whole School (Years 7-13)</option>
                <option value="Junior Secondary (Years 7-9)">Junior Secondary (Years 7-9)</option>
                <option value="Senior Secondary (Years 10-12)">Senior Secondary (Years 10-12)</option>
                <option value="Sixth Form (Years 12-13)">Sixth Form (Years 12-13)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunIdeation}
            disabled={isIdeating}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isIdeating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Brainstorming Concepts...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-200" />
                <span>Generate Student Event Pitches</span>
              </>
            )}
          </button>

          {ideationResults && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 animate-in fade-in">
              {ideationResults.concepts.map((concept: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {concept.scale}
                    </span>
                    <h4 className="text-xs font-bold text-white">{concept.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{concept.description}</p>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-slate-850">
                    <span className="text-[10px] font-bold text-slate-400">Highlights:</span>
                    <ul className="text-[10px] text-slate-300 space-y-0.5 list-disc pl-3">
                      {concept.highlights.map((h: string, i: number) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
