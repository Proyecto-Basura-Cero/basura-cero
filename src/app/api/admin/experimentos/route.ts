import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdmin } from "@/lib/auth-admin";
import { createServerSupabase } from "@/lib/supabase/server";

const statusSchema = z.enum(["draft", "published", "archived"]);

const createSchema = z.object({
  weekNumber: z.coerce.number().int().min(1).max(52),
  title: z.string().min(2),
  objective: z.string().min(5),
  instructions: z.string().min(5),
  curiousFact: z.string().min(5, "El dato curioso es obligatorio"),
  conclusion: z.string().min(5, "La conclusion es obligatoria"),
  materials: z.string().optional(),
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
        "id, week_number, title, objective, instructions, materials, printable_url, video_url, curious_fact, conclusion, status"
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
        instructions: e.instructions,
        materials: e.materials,
        printableUrl: e.printable_url,
        videoUrl: e.video_url,
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
        instructions: parsed.data.instructions,
        curious_fact: parsed.data.curiousFact,
        conclusion: parsed.data.conclusion,
        materials: parsed.data.materials ?? null,
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
