import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/auth-admin";
import {
  assertStudentOwnership,
  requireTeacherWithSchool
} from "@/lib/auth-teacher";
import { createServerSupabase } from "@/lib/supabase/server";

const patchSchema = z.object({
  alias: z.string().trim().min(2).max(40).optional(),
  grade: z.string().trim().max(20).nullable().optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireTeacherWithSchool();
    const { id } = await params;
    await assertStudentOwnership(session, id);

    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.alias !== undefined) update.alias = parsed.data.alias;
    if (parsed.data.grade !== undefined) update.grade = parsed.data.grade;
    if (parsed.data.isActive !== undefined) update.is_active = parsed.data.isActive;

    const supabase = createServerSupabase();
    const { error } = await supabase.from("students").update(update).eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un alumno con ese alias en el grupo" },
          { status: 409 }
        );
      }
      throw error;
    }

    // Al desactivar al alumno, invalidamos su codigo activo.
    if (parsed.data.isActive === false) {
      await supabase
        .from("student_access_codes")
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq("student_id", id)
        .eq("is_active", true);
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
    const session = await requireTeacherWithSchool();
    const { id } = await params;
    await assertStudentOwnership(session, id);

    const supabase = createServerSupabase();
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
