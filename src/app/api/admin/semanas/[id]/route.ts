import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdminWithSchool } from "@/lib/auth-admin";
import { createServerSupabase } from "@/lib/supabase/server";

const patchSchema = z.object({
  action: z.enum(["activate", "deactivate"]).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
});

async function ensureBelongs(supabase: ReturnType<typeof createServerSupabase>, id: string, schoolId: string) {
  const { data, error } = await supabase
    .from("weekly_challenges")
    .select("id, school_id, is_current")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.school_id !== schoolId) return null;
  return data;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminWithSchool();
    const { id } = await params;
    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const challenge = await ensureBelongs(supabase, id, session.schoolId);
    if (!challenge) {
      return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
    }

    if (parsed.data.action === "activate") {
      const { error: clearError } = await supabase
        .from("weekly_challenges")
        .update({ is_current: false })
        .eq("school_id", session.schoolId)
        .eq("is_current", true);
      if (clearError) throw clearError;

      const { error: setError } = await supabase
        .from("weekly_challenges")
        .update({ is_current: true })
        .eq("id", id);
      if (setError) throw setError;
    }

    if (parsed.data.action === "deactivate") {
      const { error } = await supabase
        .from("weekly_challenges")
        .update({ is_current: false })
        .eq("id", id);
      if (error) throw error;
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.startDate) updates.start_date = parsed.data.startDate;
    if (parsed.data.endDate) updates.end_date = parsed.data.endDate;
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("weekly_challenges")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminWithSchool();
    const { id } = await params;
    const supabase = createServerSupabase();

    const challenge = await ensureBelongs(supabase, id, session.schoolId);
    if (!challenge) {
      return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
    }

    const { error } = await supabase.from("weekly_challenges").delete().eq("id", id);
    if (error) {
      return NextResponse.json(
        {
          error:
            "No se pudo eliminar. Probablemente tiene evidencias asociadas; desactivalo en su lugar."
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
