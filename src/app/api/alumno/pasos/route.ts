import { NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, jsonError } from "@/lib/auth-admin";
import { requireStudentSession } from "@/lib/auth-student";
import { createServerSupabase } from "@/lib/supabase/server";

const schema = z.object({
  stepId: z.string().uuid(),
  completed: z.boolean().default(true)
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

    // Reto actual del grupo del alumno.
    const { data: challenge } = await supabase
      .from("weekly_challenges")
      .select("id, experiment_id")
      .eq("school_id", session.schoolId)
      .eq("is_current", true)
      .maybeSingle();
    if (!challenge) {
      throw new HttpError(404, "No hay un reto activo ahora mismo");
    }

    // El paso debe pertenecer al experimento del reto actual.
    const { data: step } = await supabase
      .from("experiment_steps")
      .select("id")
      .eq("id", parsed.data.stepId)
      .eq("experiment_id", challenge.experiment_id)
      .maybeSingle();
    if (!step) {
      throw new HttpError(404, "Ese paso no es de tu reto actual");
    }

    if (parsed.data.completed) {
      const { error } = await supabase.from("student_step_progress").upsert(
        {
          student_id: session.studentId,
          step_id: parsed.data.stepId,
          challenge_id: challenge.id
        },
        { onConflict: "student_id,step_id,challenge_id" }
      );
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("student_step_progress")
        .delete()
        .eq("student_id", session.studentId)
        .eq("step_id", parsed.data.stepId)
        .eq("challenge_id", challenge.id);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
