import { createServerSupabase } from "@/lib/supabase/server";

export type AdminKpiData = {
  activeGroups: number;
  pendingEvidence: number;
  totalKgSeparated: number;
  totalReusedItems: number;
  totalPoints: number;
};

export async function getAdminKpisForSchool(
  schoolId: string
): Promise<AdminKpiData> {
  const supabase = createServerSupabase();

  const [groupsRes, pendingRes, summaryRes, rankingRes] = await Promise.all([
    supabase
      .from("groups")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId),
    supabase
      .from("submissions")
      .select("id, groups!inner(school_id)", { count: "exact", head: true })
      .eq("status", "submitted")
      .eq("groups.school_id", schoolId),
    supabase
      .from("v_school_summary")
      .select("total_kg_separated, total_reused_items")
      .eq("school_id", schoolId)
      .maybeSingle(),
    supabase
      .from("v_group_ranking")
      .select("total_points")
      .eq("school_id", schoolId)
  ]);

  if (groupsRes.error) throw groupsRes.error;
  if (pendingRes.error) throw pendingRes.error;
  if (summaryRes.error) throw summaryRes.error;
  if (rankingRes.error) throw rankingRes.error;

  const totalPoints = (rankingRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.total_points ?? 0),
    0
  );

  return {
    activeGroups: groupsRes.count ?? 0,
    pendingEvidence: pendingRes.count ?? 0,
    totalKgSeparated: Number(summaryRes.data?.total_kg_separated ?? 0),
    totalReusedItems: Number(summaryRes.data?.total_reused_items ?? 0),
    totalPoints
  };
}

export function formatAdminKpiValue(value: number, decimals = 0): string {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
