import { getSession } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export type RankingEntry = {
  groupId: string;
  schoolId: string;
  groupName: string;
  grade: string;
  points: number;
  completedWeeks: number;
  schoolRank: number;
  badges: number;
};

export type RankingFilters = {
  schoolId?: string;
  grade?: string;
};

async function countBadgesByGroup(
  groupIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!groupIds.length) return counts;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("group_badges")
    .select("group_id")
    .in("group_id", groupIds);

  if (error) throw error;

  for (const row of data ?? []) {
    counts.set(row.group_id, (counts.get(row.group_id) ?? 0) + 1);
  }
  return counts;
}

export async function getGroupRanking(
  filters: RankingFilters = {}
): Promise<RankingEntry[]> {
  const supabase = createServerSupabase();

  let query = supabase
    .from("v_group_ranking")
    .select(
      "group_id, school_id, group_name, grade, total_points, completed_weeks, school_rank"
    )
    .order("school_rank", { ascending: true });

  if (filters.schoolId) {
    query = query.eq("school_id", filters.schoolId);
  }
  if (filters.grade) {
    query = query.eq("grade", filters.grade);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const badgeCounts = await countBadgesByGroup(rows.map((r) => r.group_id));

  return rows.map((row) => ({
    groupId: row.group_id,
    schoolId: row.school_id,
    groupName: row.group_name,
    grade: row.grade,
    points: Number(row.total_points ?? 0),
    completedWeeks: Number(row.completed_weeks ?? 0),
    schoolRank: Number(row.school_rank ?? 0),
    badges: badgeCounts.get(row.group_id) ?? 0
  }));
}

export async function getDistinctGrades(schoolId: string): Promise<string[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("groups")
    .select("grade")
    .eq("school_id", schoolId)
    .order("grade", { ascending: true });

  if (error) throw error;

  const unique = new Set<string>();
  for (const row of data ?? []) {
    if (row.grade) unique.add(row.grade);
  }
  return [...unique];
}

export async function resolveRankingSchoolId(): Promise<string | undefined> {
  const session = await getSession();
  if (session?.schoolId) return session.schoolId;

  if (!session?.userId) return undefined;

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", session.userId)
    .maybeSingle();

  return (data?.school_id as string | undefined) ?? undefined;
}
