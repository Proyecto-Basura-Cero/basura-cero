import { getSession } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Badge } from "@/lib/types";
import type { Role } from "@/lib/types";

const ACTIVE_STATUSES = ["submitted", "approved"] as const;

async function resolveSchoolId(
  userId: string,
  schoolId: string | null
): Promise<string | null> {
  if (schoolId) return schoolId;
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", userId)
    .maybeSingle();
  return (data?.school_id as string | null) ?? null;
}

async function getGroupIdsForUser(
  userId: string,
  role: Role,
  schoolId: string
): Promise<string[]> {
  const supabase = createServerSupabase();

  if (role === "admin") {
    const { data, error } = await supabase
      .from("groups")
      .select("id")
      .eq("school_id", schoolId);
    if (error) throw error;
    return (data ?? []).map((g) => g.id);
  }

  const { data, error } = await supabase
    .from("teachers")
    .select("groups(id)")
    .eq("user_id", userId)
    .eq("school_id", schoolId)
    .maybeSingle();
  if (error) throw error;

  const groups = data?.groups ?? [];
  if (!Array.isArray(groups)) return [];
  return groups.map((g) => g.id);
}

export async function getTeacherCompletedWeeks(
  userId: string,
  role: Role,
  schoolId: string | null
): Promise<number> {
  const resolvedSchoolId = await resolveSchoolId(userId, schoolId);
  if (!resolvedSchoolId) return 0;

  const groupIds = await getGroupIdsForUser(userId, role, resolvedSchoolId);
  if (!groupIds.length) return 0;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("submissions")
    .select("group_id, weekly_challenges(experiments(week_number))")
    .in("group_id", groupIds)
    .in("status", [...ACTIVE_STATUSES]);

  if (error) throw error;

  const weeks = new Set<number>();
  for (const row of data ?? []) {
    const challenge = Array.isArray(row.weekly_challenges)
      ? row.weekly_challenges[0]
      : row.weekly_challenges;
    const experiment = Array.isArray(challenge?.experiments)
      ? challenge?.experiments[0]
      : challenge?.experiments;
    const weekNumber = Number(experiment?.week_number ?? 0);
    if (weekNumber > 0) {
      weeks.add(weekNumber);
    }
  }

  return weeks.size;
}

export async function getTeacherBadges(
  userId: string,
  role: Role,
  schoolId: string | null
): Promise<Badge[]> {
  const supabase = createServerSupabase();

  const { data: allBadges, error: badgesError } = await supabase
    .from("badges")
    .select("code, name, description")
    .order("name", { ascending: true });
  if (badgesError) throw badgesError;

  const resolvedSchoolId = await resolveSchoolId(userId, schoolId);
  if (!resolvedSchoolId) {
    return (allBadges ?? []).map((b) => ({ ...b, unlocked: false }));
  }

  const groupIds = await getGroupIdsForUser(userId, role, resolvedSchoolId);
  if (!groupIds.length) {
    return (allBadges ?? []).map((b) => ({ ...b, unlocked: false }));
  }

  const { data: earned, error: earnedError } = await supabase
    .from("group_badges")
    .select("badges(code)")
    .in("group_id", groupIds);
  if (earnedError) throw earnedError;

  const unlockedCodes = new Set<string>();
  for (const row of earned ?? []) {
    const badge = Array.isArray(row.badges) ? row.badges[0] : row.badges;
    if (badge?.code) unlockedCodes.add(badge.code);
  }

  return (allBadges ?? []).map((b) => ({
    code: b.code,
    name: b.name,
    description: b.description,
    unlocked: unlockedCodes.has(b.code)
  }));
}

/** Atajo para server components con sesion del maestro/admin. */
export async function getTeacherDashboardStats(): Promise<{
  completedWeeks: number;
  badges: Badge[];
}> {
  const session = await getSession();
  if (!session) {
    return { completedWeeks: 0, badges: [] };
  }

  try {
    const [completedWeeks, badges] = await Promise.all([
      getTeacherCompletedWeeks(session.userId, session.role, session.schoolId),
      getTeacherBadges(session.userId, session.role, session.schoolId)
    ]);
    return { completedWeeks, badges };
  } catch {
    return { completedWeeks: 0, badges: [] };
  }
}

/** Insignias publicas: todas las del catalogo, desbloqueadas solo si hay sesion. */
export async function getBadgesForCurrentUser(): Promise<Badge[]> {
  const session = await getSession();
  if (!session) {
    const supabase = createServerSupabase();
    const { data } = await supabase
      .from("badges")
      .select("code, name, description")
      .order("name", { ascending: true });
    return (data ?? []).map((b) => ({ ...b, unlocked: false }));
  }
  return getTeacherBadges(session.userId, session.role, session.schoolId);
}
