import { defaultScoreWeights, ScoreWeights } from "@/lib/scoring/rules";

export type SubmissionMetrics = {
  participantsCount: number;
  expectedParticipants: number;
  kgSeparated: number;
  reusedItems: number;
  creativityScore: number;
  teamworkScore: number;
  hasEvidenceFile: boolean;
  isOnTime: boolean;
};

export type ScoreResult = {
  pointsTotal: number;
  breakdown: Record<string, number>;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateScore(
  metrics: SubmissionMetrics,
  weights: ScoreWeights = defaultScoreWeights
): ScoreResult {
  const participationPct =
    metrics.expectedParticipants > 0
      ? (metrics.participantsCount / metrics.expectedParticipants) * 100
      : 0;

  const participationPoints = clamp(Math.round(participationPct / 10), 0, weights.participationMax);
  const wasteReductionPoints = clamp(Math.floor(metrics.kgSeparated), 0, weights.wasteReductionMax);
  const reusePoints = clamp(metrics.reusedItems, 0, weights.reusedItemsMax);
  const creativityPoints = clamp(metrics.creativityScore, 0, weights.creativityMax);
  const teamworkPoints = clamp(metrics.teamworkScore, 0, weights.teamworkMax);
  const experimentPoints = weights.experimentCompleted;
  const evidencePoints = metrics.hasEvidenceFile ? weights.evidenceComplete : 0;

  let subtotal =
    experimentPoints +
    evidencePoints +
    participationPoints +
    wasteReductionPoints +
    reusePoints +
    creativityPoints +
    teamworkPoints;

  if (!metrics.isOnTime) {
    subtotal = Math.round(subtotal * 0.9);
  }

  const pointsTotal = clamp(subtotal, 0, 100);

  return {
    pointsTotal,
    breakdown: {
      experimentCompleted: experimentPoints,
      evidenceComplete: evidencePoints,
      participation: participationPoints,
      wasteReduction: wasteReductionPoints,
      reusedItems: reusePoints,
      creativity: creativityPoints,
      teamwork: teamworkPoints,
      latePenaltyApplied: metrics.isOnTime ? 0 : -1
    }
  };
}
