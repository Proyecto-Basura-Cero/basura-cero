import { calculateScore, SubmissionMetrics } from "@/lib/scoring/calculate";
import { evaluateUnlockedBadges } from "@/lib/scoring/badges";
import { createServerSupabase } from "@/lib/supabase/server";

type BadgeInput = {
  totalKgSeparated: number;
  completedWeeks: number;
  consecutiveWeeks: number;
  compostWeeks: number;
  avgParticipation: number;
  onTimeSubmissions: number;
  isTop3Monthly: boolean;
  isTop1Quarterly: boolean;
};

export async function scoreSubmission(submissionId: string, metrics: SubmissionMetrics) {
  const supabase = createServerSupabase();
  const score = calculateScore(metrics);

  await supabase.from("scores").upsert({
    submission_id: submissionId,
    points_total: score.pointsTotal,
    breakdown_json: score.breakdown
  });

  return score;
}

export async function assignBadges(groupId: string, input: BadgeInput) {
  const supabase = createServerSupabase();
  const unlockedCodes = evaluateUnlockedBadges(input);

  if (!unlockedCodes.length) {
    return [];
  }

  const { data: badgeRows } = await supabase.from("badges").select("id, code").in("code", unlockedCodes);
  if (!badgeRows?.length) {
    return [];
  }

  const payload = badgeRows.map((badge) => ({
    group_id: groupId,
    badge_id: badge.id
  }));

  await supabase.from("group_badges").upsert(payload, { onConflict: "group_id,badge_id" });
  return unlockedCodes;
}
