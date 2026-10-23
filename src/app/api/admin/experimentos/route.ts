import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdmin } from "@/lib/auth-admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { CHALLENGE_TYPES } from "@/lib/challenge-types";

const statusSchema = z.enum(["draft", "published", "archived"]);
const challengeTypeSchema = z.enum(CHALLENGE_TYPES);

const createSchema = z.object({
  weekNumber: z.coerce.number().int().min(1).max(52),
  title: z.string().min(2),
  objective: z.string().min(5),
  challengeType: challengeTypeSchema.nullable().optional(),
  instructions: z.string().min(5),
  curiousFact: z.string().min(5, "El dato curioso es obligatorio"),
  conclusion: z.string().min(5, "La conclusión es obligatoria"),
  materials: z.string().optional(),
  hypothesis: z.string().nullable().optional(),
  classification: z.string().nullable().optional(),
  observations: z.string().nullable().optional(),
  resultsPrompt: z.string().nullable().optional(),
  drawingPrompt: z.string().nullable().optional(),
  finalMessage: z.string().nullable().optional(),
  printableUrl: z.string().optional(),
  videoUrl: z.string().nullable().optional(),
  status: statusSchema.default("draft")
});

function parseStatusParam(value: string | null) {
  if (!value || value === "all") return null;
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter((p): p is z.infer<typeof statusSchema> =>
      ["draft", "published", "archived"].includes(p)
    );
  return parts.length ? parts : null;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const supabase = createServerSupabase();
    const url = new URL(request.url);
    const statuses = parseStatusParam(url.searchParams.get("status"));

    let query = supabase
      .from("experiments")
      .select(
        "id, week_number, title, objective, challenge_type, instructions, materials, printable_url, video_url, hypothesis, classification, observations, results_prompt, drawing_prompt, final_message, curious_fact, conclusion, status"
      )
      .order("week_number", { ascending: true });

    if (statuses) {
      query = query.in("status", statuses);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      data: (data ?? []).map((e) => ({
        id: e.id,
        weekNumber: e.week_number,
        title: e.title,
        objective: e.objective,
        challengeType: e.challenge_type,
        instructions: e.instructions,
        materials: e.materials,
        printableUrl: e.printable_url,
        videoUrl: e.video_url,
        hypothesis: e.hypothesis,
        classification: e.classification,
        observations: e.observations,
        resultsPrompt: e.results_prompt,
        drawingPrompt: e.drawing_prompt,
        finalMessage: e.final_message,
        curiousFact: e.curious_fact,
        conclusion: e.conclusion,
        status: e.status
      }))
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const json = await request.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("experiments")
      .insert({
        week_number: parsed.data.weekNumber,
        title: parsed.data.title,
        objective: parsed.data.objective,
        challenge_type: parsed.data.challengeType ?? null,
        instructions: parsed.data.instructions,
        curious_fact: parsed.data.curiousFact,
        conclusion: parsed.data.conclusion,
        materials: parsed.data.materials ?? null,
        hypothesis: parsed.data.hypothesis || null,
        classification: parsed.data.classification || null,
        observations: parsed.data.observations || null,
        results_prompt: parsed.data.resultsPrompt || null,
        drawing_prompt: parsed.data.drawingPrompt || null,
        final_message: parsed.data.finalMessage || null,
        printable_url: parsed.data.printableUrl || null,
        video_url: parsed.data.videoUrl || null,
        status: parsed.data.status
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un experimento para esa semana" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return jsonError(error);
  }
}
