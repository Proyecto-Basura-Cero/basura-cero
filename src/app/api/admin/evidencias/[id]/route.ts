import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdminWithSchool } from "@/lib/auth-admin";
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
    const session = await requireAdminWithSchool();
    const { id } = await params;
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: submission, error: lookupError } = await supabase
      .from("submissions")
      .select("id, group_id, groups(school_id)")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const groups = Array.isArray(submission?.groups)
      ? submission?.groups[0]
      : submission?.groups;

    if (!submission || groups?.school_id !== session.schoolId) {
      return NextResponse.json({ error: "Evidencia no encontrada" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("submissions")
      .update({ status: parsed.data.status })
      .eq("id", id);
    if (updateError) throw updateError;

    // Mantener el score coherente al validar: recalcular para submitted/approved,
    // y limpiar el score si se rechaza.
    if (parsed.data.status === "rejected") {
      await supabase.from("scores").delete().eq("submission_id", id);
    } else {
      await recalcGroupSubmissionScore(id);
    }

    return NextResponse.json({ ok: true, status: parsed.data.status });
  } catch (error) {
    return jsonError(error);
  }
}
