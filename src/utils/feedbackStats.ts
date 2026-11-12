import { Feedback } from '../types/index.ts';

export interface FeedbackSummaryStats {
  totalResponses: number;
  recommendYesCount: number;
  recommendNoCount: number;
  percentRecommendYes: number;
  percentRecommendNo: number;
  averageRating: number;
  positiveHighlights: string[];
  commonCriticisms: string[];
}

export function computeFeedbackStats(reviews: Feedback[]): FeedbackSummaryStats {
  if (!reviews || reviews.length === 0) {
    return {
      totalResponses: 0,
      recommendYesCount: 0,
      recommendNoCount: 0,
      percentRecommendYes: 0,
      percentRecommendNo: 0,
      averageRating: 0,
      positiveHighlights: [],
      commonCriticisms: []
    };
  }

  const totalResponses = reviews.length;
  const recommendYesCount = reviews.filter(r => r.recommend).length;
  const recommendNoCount = totalResponses - recommendYesCount;

  const percentRecommendYes = Math.round((recommendYesCount / totalResponses) * 100);
  const percentRecommendNo = 100 - percentRecommendYes;

  const sumRatings = reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0);
  const averageRating = Number((sumRatings / totalResponses).toFixed(1));

  // Extract distinct praises and criticisms
  const positiveHighlights = reviews
    .map(r => r.liked)
    .filter(Boolean)
    .slice(0, 4);

  const commonCriticisms = reviews
    .map(r => r.disliked)
    .filter(Boolean)
    .slice(0, 4);

  return {
    totalResponses,
    recommendYesCount,
    recommendNoCount,
    percentRecommendYes,
    percentRecommendNo,
    averageRating,
    positiveHighlights,
    commonCriticisms
  };
}
