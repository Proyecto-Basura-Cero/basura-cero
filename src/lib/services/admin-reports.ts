import { createServerSupabase } from "@/lib/supabase/server";
import type { AdminReportRow } from "@/lib/admin/types";

export type WeeklyImpactPoint = {
  week: string;
  weekNumber: number;
  kg: number;
  participants: number;
  submissions: number;
};

export type SchoolReportSummary = {
  schoolName: string;
  totalKgSeparated: number;
  totalReusedItems: number;
  totalParticipants: number;
  totalSubmissions: number;
};

const ACTIVE_STATUSES = ["submitted", "approved"] as const;

export async function getAdminReportRows(
  schoolId: string
): Promise<AdminReportRow[]> {
  const supabase = createServerSupabase();

  const [rankingRes, groupsRes] = await Promise.all([
    supabase
      .from("v_group_ranking")
      .select("group_id, group_name, grade, total_points, completed_weeks, school_rank")
      .eq("school_id", schoolId)
      .order("school_rank", { ascending: true }),
    supabase
      .from("groups")
      .select(
        "id, name, submissions(status, participants_count, impact_metrics(kg_separated))"
      )
      .eq("school_id", schoolId)
  ]);

  if (rankingRes.error) throw rankingRes.error;
  if (groupsRes.error) throw groupsRes.error;

  const metricsByGroup = new Map<
    string,
    { kgSeparated: number; participants: number }
  >();

  for (const group of groupsRes.data ?? []) {
    let kgSeparated = 0;
    let participants = 0;
    for (const submission of group.submissions ?? []) {
      if (!ACTIVE_STATUSES.includes(submission.status as (typeof ACTIVE_STATUSES)[number])) {
        continue;
      }
      participants += Number(submission.participants_count ?? 0);
      const metrics = Array.isArray(submission.impact_metrics)
        ? submission.impact_metrics[0]
        : submission.impact_metrics;
      kgSeparated += Number(metrics?.kg_separated ?? 0);
    }
    metricsByGroup.set(group.id, { kgSeparated, participants });
  }

  return (rankingRes.data ?? []).map((row) => {
    const metrics = metricsByGroup.get(row.group_id) ?? {
      kgSeparated: 0,
      participants: 0
    };
    return {
      group: row.group_name,
      grade: row.grade,
      rank: Number(row.school_rank ?? 0),
      points: Number(row.total_points ?? 0),
      completedWeeks: Number(row.completed_weeks ?? 0),
      kgSeparated: metrics.kgSeparated,
      participants: metrics.participants
    };
  });
}

export async function getWeeklyImpactChart(
  schoolId: string
): Promise<WeeklyImpactPoint[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("v_weekly_impact")
    .select("week_number, kg_separated, participants, submissions_count")
    .eq("school_id", schoolId)
    .order("week_number", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    week: `S${row.week_number}`,
    weekNumber: Number(row.week_number),
    kg: Number(row.kg_separated ?? 0),
    participants: Number(row.participants ?? 0),
    submissions: Number(row.submissions_count ?? 0)
  }));
}

export async function getSchoolReportSummary(
  schoolId: string
): Promise<SchoolReportSummary | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("v_school_summary")
    .select(
      "school_name, total_kg_separated, total_reused_items, total_participants, total_submissions"
    )
    .eq("school_id", schoolId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    schoolName: data.school_name,
    totalKgSeparated: Number(data.total_kg_separated ?? 0),
    totalReusedItems: Number(data.total_reused_items ?? 0),
    totalParticipants: Number(data.total_participants ?? 0),
    totalSubmissions: Number(data.total_submissions ?? 0)
  };
}
