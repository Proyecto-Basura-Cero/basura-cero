import { createServerSupabase } from "@/lib/supabase/server";

export type HomeKpiData = {
  publishedExperiments: number;
  participatingGroups: number;
  totalKgSeparated: number;
  totalEvidence: number;
};

export async function getHomeKpis(schoolId?: string): Promise<HomeKpiData> {
  const supabase = createServerSupabase();

  const experimentsQuery = supabase
    .from("experiments")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  const groupsQuery = supabase
    .from("groups")
    .select("id", { count: "exact", head: true });

  let summaryQuery = supabase
    .from("v_school_summary")
    .select("total_kg_separated, total_submissions");

  if (schoolId) {
    groupsQuery.eq("school_id", schoolId);
    summaryQuery = summaryQuery.eq("school_id", schoolId);
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

  for (const row of summaryRes.data ?? []) {
    totalKgSeparated += Number(row.total_kg_separated ?? 0);
    totalEvidence += Number(row.total_submissions ?? 0);
  }

  return {
    publishedExperiments: experimentsRes.count ?? 0,
    participatingGroups: groupsRes.count ?? 0,
    totalKgSeparated,
    totalEvidence
  };
}
