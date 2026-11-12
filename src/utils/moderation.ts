export interface ModerationResult {
  approved: boolean;
  flaggedTerms: string[];
  reason: string;
}

const OFFENSIVE_TERMS = [
  'swear', 'damn', 'hell', 'hate you', 'kill', 'die', 'shut up', 'loser',
  'idiot', 'stupid', 'dumb', 'ugly', 'trash', 'garbage', 'useless', 'freak',
  'f***', 's***', 'bitch', 'asshole', 'bastard', 'crap', 'pathetic', 'stfu',
  'moron', 'retard', 'scam', 'scumbag', 'jerk', 'sucks', 'terrible teacher'
];

/**
 * Scans user comments for offensive, disrespectful, or harassing content.
 * Returns actionable feedback to help students edit respectfully.
 */
export function scanTextForModeration(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return {
      approved: false,
      flaggedTerms: [],
      reason: 'Please enter feedback before submitting.'
    };
  }

  const normalized = text.toLowerCase();
  const flagged = new Set<string>();

  for (const term of OFFENSIVE_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|\\W)${escaped}($|\\W)`, 'i');
    if (pattern.test(normalized)) {
      flagged.add(term);
    }
  }

  const flaggedTerms = Array.from(flagged);

  if (flaggedTerms.length > 0) {
    return {
      approved: false,
      flaggedTerms,
      reason: `Your feedback contains language that doesn't meet our respectful school standards: "${flaggedTerms.join('", "')}". Please rephrase your thoughts constructively.`
    };
  }

  return {
    approved: true,
    flaggedTerms: [],
    reason: 'Comment approved! Meets school community guidelines.'
  };
}
