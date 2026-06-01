import { createServerSupabase } from "@/lib/supabase/server";
import type { Experiment } from "@/lib/types";

type ExperimentRow = {
  id: string;
  week_number: number;
  title: string;
  objective: string;
  instructions: string;
  materials: string | null;
  printable_url: string | null;
  video_url: string | null;
  curious_fact: string;
  conclusion: string;
  status: Experiment["status"];
};

function mapExperiment(row: ExperimentRow): Experiment {
  return {
    id: row.id,
    weekNumber: row.week_number,
    title: row.title,
    objective: row.objective,
    instructions: row.instructions,
    materials: row.materials,
    printableUrl: row.printable_url,
    videoUrl: row.video_url,
    curiousFact: row.curious_fact,
    conclusion: row.conclusion,
    status: row.status
  };
}

const SELECT_FIELDS =
  "id, week_number, title, objective, instructions, materials, printable_url, video_url, curious_fact, conclusion, status";

export async function getExperiments(options?: {
  status?: Experiment["status"] | Experiment["status"][];
}): Promise<Experiment[]> {
  const supabase = createServerSupabase();
  let query = supabase
    .from("experiments")
    .select(SELECT_FIELDS)
    .order("week_number", { ascending: true });

  if (options?.status) {
    const statuses = Array.isArray(options.status)
      ? options.status
      : [options.status];
    query = query.in("status", statuses);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapExperiment);
}

export async function getPublishedExperiments(): Promise<Experiment[]> {
  return getExperiments({ status: "published" });
}

export async function getExperimentByWeekNumber(
  weekNumber: number
): Promise<Experiment | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("experiments")
    .select(SELECT_FIELDS)
    .eq("week_number", weekNumber)
    .maybeSingle();

  if (error) throw error;
  return data ? mapExperiment(data) : null;
}

export async function getPublishedExperimentByWeekNumber(
  weekNumber: number
): Promise<Experiment | null> {
  const experiment = await getExperimentByWeekNumber(weekNumber);
  if (!experiment || experiment.status !== "published") return null;
  return experiment;
}
