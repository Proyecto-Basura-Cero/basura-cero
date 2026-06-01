import { createServerSupabase } from "@/lib/supabase/server";
import {
  getCurrentChallengeForSchool,
  type CurrentChallenge
} from "@/lib/services/current-challenge";

export type HomeKpiData = {
  publishedExperiments: number;
  participatingGroups: number;
  totalKgSeparated: number;
  totalEvidence: number;
};

export async function getFeaturedChallenge(
  schoolId?: string
): Promise<CurrentChallenge | null> {
  if (schoolId) {
    return getCurrentChallengeForSchool(schoolId);
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("weekly_challenges")
    .select(
      "id, start_date, end_date, experiment_id, experiments(week_number, title, objective, instructions, materials, printable_url)"
    )
    .eq("is_current", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const exp = Array.isArray(data.experiments) ? data.experiments[0] : data.experiments;
  if (!exp) return null;

  return {
    id: data.id,
    startDate: data.start_date,
    endDate: data.end_date,
    experimentId: data.experiment_id,
    weekNumber: exp.week_number,
    title: exp.title,
    objective: exp.objective,
    instructions: exp.instructions ?? null,
    materials: exp.materials ?? null,
    printableUrl: exp.printable_url ?? null
  };
}

export async function getHomeKpis(schoolId?: string): Promise<HomeKpiData> {
  const supabase = createServerSupabase();

  const experimentsQuery = supabase
    .from("experiments")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  const groupsQuery = supabase
    .from("groups")
    .select("id", { count: "exact", head: true });

  const summaryQuery = schoolId
    ? supabase
        .from("v_school_summary")
        .select("total_kg_separated, total_submissions")
        .eq("school_id", schoolId)
        .maybeSingle()
    : supabase
        .from("v_school_summary")
        .select("total_kg_separated, total_submissions");

  if (schoolId) {
    groupsQuery.eq("school_id", schoolId);
  }

  const [experimentsRes, groupsRes, summaryRes] = await Promise.all([
    experimentsQuery,
    groupsQuery,
    summaryQuery
  ]);

  if (experimentsRes.error) throw experimentsRes.error;
  if (groupsRes.error) throw groupsRes.error;
  if (summaryRes.error) throw summaryRes.error;

  let totalKgSeparated = 0;
  let totalEvidence = 0;

  if (schoolId) {
    totalKgSeparated = Number(summaryRes.data?.total_kg_separated ?? 0);
    totalEvidence = Number(summaryRes.data?.total_submissions ?? 0);
  } else {
    for (const row of summaryRes.data ?? []) {
      totalKgSeparated += Number(row.total_kg_separated ?? 0);
      totalEvidence += Number(row.total_submissions ?? 0);
    }
  }

  return {
    publishedExperiments: experimentsRes.count ?? 0,
    participatingGroups: groupsRes.count ?? 0,
    totalKgSeparated,
    totalEvidence
  };
}
