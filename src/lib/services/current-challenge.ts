import { createServerSupabase } from "@/lib/supabase/server";

export type CurrentChallenge = {
  id: string;
  startDate: string;
  endDate: string;
  experimentId: string;
  weekNumber: number;
  title: string;
  objective: string;
  instructions: string | null;
  materials: string | null;
  printableUrl: string | null;
};

type ChallengeRow = {
  id: string;
  start_date: string;
  end_date: string;
  experiment_id: string;
  experiments:
    | {
        week_number: number;
        title: string;
        objective: string;
        instructions: string | null;
        materials: string | null;
        printable_url: string | null;
      }
    | {
        week_number: number;
        title: string;
        objective: string;
        instructions: string | null;
        materials: string | null;
        printable_url: string | null;
      }[]
    | null;
};

function mapChallengeRow(data: ChallengeRow): CurrentChallenge | null {
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

export async function getCurrentChallengeForSchool(
  schoolId: string
): Promise<CurrentChallenge | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("weekly_challenges")
    .select(
      "id, start_date, end_date, experiment_id, experiments(week_number, title, objective, instructions, materials, printable_url)"
    )
    .eq("school_id", schoolId)
    .eq("is_current", true)
    .maybeSingle();

  if (error || !data) return null;
  return mapChallengeRow(data);
}

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
  return mapChallengeRow(data);
}
