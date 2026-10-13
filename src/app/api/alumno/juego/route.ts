import { NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, jsonError } from "@/lib/auth-admin";
import { requireStudentSession } from "@/lib/auth-student";
import { createServerSupabase } from "@/lib/supabase/server";

const schema = z.object({
  gameId: z.string().uuid(),
  score: z.coerce.number().int().min(0).max(1000).default(0)
});

export async function POST(request: Request) {
  try {
    const session = await requireStudentSession();
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: challenge } = await supabase
      .from("weekly_challenges")
      .select("id, experiment_id")
      .eq("school_id", session.schoolId)
      .eq("is_current", true)
      .maybeSingle();
    if (!challenge) {
      throw new HttpError(404, "No hay un reto activo ahora mismo");
    }

    // El juego debe pertenecer al experimento del reto actual y estar activo.
    const { data: game } = await supabase
      .from("experiment_games")
      .select("id")
      .eq("id", parsed.data.gameId)
      .eq("experiment_id", challenge.experiment_id)
      .eq("is_active", true)
      .maybeSingle();
    if (!game) {
      throw new HttpError(404, "Ese juego no es de tu reto actual");
    }

    const { error } = await supabase.from("student_game_progress").upsert(
      {
        student_id: session.studentId,
        game_id: parsed.data.gameId,
        challenge_id: challenge.id,
        score: parsed.data.score,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: "student_id,game_id,challenge_id" }
    );
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
