import {
  defaultScoreWeights,
  ScoreWeights,
  timeDecayFactor
} from "@/lib/scoring/rules";

export type SubmissionMetrics = {
  participantsCount: number;
  expectedParticipants: number;
  kgSeparated: number;
  reusedItems: number;
  creativityScore: number;
  teamworkScore: number;
  hasEvidenceFile: boolean;
  /**
   * Dias calendario de retraso respecto al end_date del reto (0 = en tiempo).
   * Si se omite, se deriva de isOnTime (0 cuando en tiempo, 1 cuando tarde)
   * para mantener compatibilidad con llamadores antiguos.
   */
  daysLate?: number;
  isOnTime: boolean;
  /** Proporcion de pasos completados por el grupo (0..1). */
  stepsCompletionRatio?: number;
  /** Proporcion de desempeno del mini-juego (0..1). */
  gamesCompletionRatio?: number;
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

  const stepsRatio = clamp(metrics.stepsCompletionRatio ?? 0, 0, 1);
  const gamesRatio = clamp(metrics.gamesCompletionRatio ?? 0, 0, 1);
  const stepsPoints = Math.round(stepsRatio * weights.stepsMax);
  const gamesPoints = Math.round(gamesRatio * weights.gamesMax);

  const subtotal =
    experimentPoints +
    evidencePoints +
    stepsPoints +
    gamesPoints +
    participationPoints +
    wasteReductionPoints +
    reusePoints +
    creativityPoints +
    teamworkPoints;

  // Factor temporal por tramos (reemplaza el castigo plano de 10%).
  const daysLate = metrics.daysLate ?? (metrics.isOnTime ? 0 : 1);
  const factor = timeDecayFactor(daysLate);

  const pointsTotal = clamp(Math.round(subtotal * factor), 0, 100);

  return {
    pointsTotal,
    breakdown: {
      experimentCompleted: experimentPoints,
      evidenceComplete: evidencePoints,
      steps: stepsPoints,
      games: gamesPoints,
      participation: participationPoints,
      wasteReduction: wasteReductionPoints,
      reusedItems: reusePoints,
      creativity: creativityPoints,
      teamwork: teamworkPoints,
      subtotal,
      daysLate,
      timeFactor: factor
    }
  };
}
