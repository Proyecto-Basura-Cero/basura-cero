import { NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, jsonError } from "@/lib/auth-admin";
import { assertGroupOwnership, requireTeacherWithSchool } from "@/lib/auth-teacher";
import { createServerSupabase } from "@/lib/supabase/server";
import { recalcGroupSubmissionScore } from "@/lib/services/scoring-service";

const schema = z.object({
  status: z.enum(["submitted", "approved", "rejected"])
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireTeacherWithSchool();
    const { id } = await params;
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: submission } = await supabase
      .from("student_submissions")
      .select("id, group_id, challenge_id, groups(school_id)")
      .eq("id", id)
      .maybeSingle();

    const group = Array.isArray(submission?.groups)
      ? submission?.groups[0]
      : submission?.groups;

    if (!submission || group?.school_id !== session.schoolId) {
      throw new HttpError(404, "Evidencia no encontrada");
    }

    // El maestro debe tener asignado el grupo (admin pasa libre).
    await assertGroupOwnership(session, submission.group_id as string);

    const { error } = await supabase
      .from("student_submissions")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;

    // Reflejar en el score del grupo si ya hay entrega de grupo del reto.
    const { data: groupSub } = await supabase
      .from("submissions")
      .select("id")
      .eq("challenge_id", submission.challenge_id)
      .eq("group_id", submission.group_id)
      .maybeSingle();
    if (groupSub?.id) {
      await recalcGroupSubmissionScore(groupSub.id);
    }

    return NextResponse.json({ ok: true, status: parsed.data.status });
  } catch (error) {
    return jsonError(error);
  }
}
