import type { RiskAnswer, RiskDimension } from './types';

export const RISK_DIMENSIONS: RiskDimension[] = ['man', 'machine', 'material', 'method', 'measurement', 'environment'];

export interface RiskResult {
  dimensionScores: Record<RiskDimension, number | null>;
  completenessBasisPoints: number;
  finalScore: number | null;
  level: 'unknown' | 'low' | 'moderate' | 'high' | 'critical';
}

export function calculateRisk(
  answers: RiskAnswer[],
  weights: Record<RiskDimension, number>,
): RiskResult {
  for (const dimension of RISK_DIMENSIONS) {
    if (!Number.isInteger(weights[dimension]) || weights[dimension] < 0) throw new Error('Risk weights must be non-negative integers');
  }
  if (RISK_DIMENSIONS.reduce((sum, dimension) => sum + weights[dimension], 0) !== 10_000) {
    throw new Error('Risk weights must sum to 10000 basis points');
  }

  const answered = answers.filter((answer) => answer.score !== null);
  const completenessBasisPoints = answers.length === 0 ? 0 : Math.round((answered.length / answers.length) * 10_000);
  const dimensionScores = Object.fromEntries(RISK_DIMENSIONS.map((dimension) => {
    const scores = answered.filter((answer) => answer.dimension === dimension).map((answer) => answer.score as number);
    for (const score of scores) {
      if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error('Risk answer scores must be between 0 and 100');
    }
    const average = scores.length === 0 ? null : Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    return [dimension, average];
  })) as Record<RiskDimension, number | null>;

  const present = RISK_DIMENSIONS.filter((dimension) => dimensionScores[dimension] !== null);
  if (present.length === 0) return { dimensionScores, completenessBasisPoints, finalScore: null, level: 'unknown' };
  const presentWeight = present.reduce((sum, dimension) => sum + weights[dimension], 0);
  const weighted = present.reduce((sum, dimension) => sum + (dimensionScores[dimension] as number) * weights[dimension], 0);
  const finalScore = Math.round(weighted / presentWeight);
  const level = finalScore < 25 ? 'low' : finalScore < 50 ? 'moderate' : finalScore < 75 ? 'high' : 'critical';
  return { dimensionScores, completenessBasisPoints, finalScore, level };
}

