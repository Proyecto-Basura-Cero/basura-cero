import { createServerSupabase } from "@/lib/supabase/server";
import { isChallengeType, type ChallengeType } from "@/lib/challenge-types";

/**
 * Una celda del calendario de 52 semanas.
 * - `type`: tipo de reto (color); null si el admin aun no lo configuro.
 * - `title`: titulo del experimento publicado de esa semana (si existe).
 * - `completed`: la ESCUELA ya trabajo esa semana (tiene evidencias
 *    enviadas/aprobadas). Siempre false si no hay escuela de contexto.
 * - `isCurrent`: es el reto en curso de la escuela.
 * - `published`: existe un experimento publicado para esa semana.
 */
export type CalendarWeek = {
  weekNumber: number;
  type: ChallengeType | null;
  title: string | null;
  completed: boolean;
  isCurrent: boolean;
  published: boolean;
};

export type Calendar52 = {
  weeks: CalendarWeek[];
  completedCount: number;
  currentWeek: number | null;
};

/**
 * Arma las 52 celdas del calendario. La completitud es POR ESCUELA:
 * se marca completada toda semana con submissions_count > 0 en v_weekly_impact.
 * Si no hay escuela (visitante sin contexto), el calendario muestra tipos y
 * colores pero sin progreso.
 */
export async function getCalendar52Weeks(
  schoolId?: string
): Promise<Calendar52> {
  const supabase = createServerSupabase();

  // Base: experimentos publicados (plantilla global de las 52 semanas).
  const { data: experiments } = await supabase
    .from("experiments")
    .select("week_number, title, challenge_type")
    .eq("status", "published");

  const byWeek = new Map<
    number,
    { title: string; type: ChallengeType | null }
  >();
  for (const row of experiments ?? []) {
    const week = Number(row.week_number);
    if (week >= 1 && week <= 52) {
      byWeek.set(week, {
        title: row.title as string,
        type: isChallengeType(row.challenge_type) ? row.challenge_type : null
      });
    }
  }

  // Completitud y semana en curso: solo si hay escuela de contexto.
  const completedWeeks = new Set<number>();
  let currentWeek: number | null = null;

  if (schoolId) {
    const [{ data: impact }, { data: current }] = await Promise.all([
      supabase
        .from("v_weekly_impact")
        .select("week_number, submissions_count")
        .eq("school_id", schoolId),
      supabase
        .from("weekly_challenges")
        .select("experiments(week_number)")
        .eq("school_id", schoolId)
        .eq("is_current", true)
        .maybeSingle()
    ]);

    for (const row of impact ?? []) {
      if (Number(row.submissions_count) > 0) {
        completedWeeks.add(Number(row.week_number));
      }
    }

    const exp = Array.isArray(current?.experiments)
      ? current?.experiments[0]
      : current?.experiments;
    const cw = Number(exp?.week_number ?? 0);
    currentWeek = cw >= 1 && cw <= 52 ? cw : null;
  }

  const weeks: CalendarWeek[] = Array.from({ length: 52 }, (_, i) => {
    const weekNumber = i + 1;
    const exp = byWeek.get(weekNumber);
    return {
      weekNumber,
      type: exp?.type ?? null,
      title: exp?.title ?? null,
      completed: completedWeeks.has(weekNumber),
      isCurrent: currentWeek === weekNumber,
      published: Boolean(exp)
    };
  });

  return {
    weeks,
    completedCount: completedWeeks.size,
    currentWeek
  };
}
