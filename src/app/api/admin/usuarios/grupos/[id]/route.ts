import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdminWithSchool } from "@/lib/auth-admin";
import { createServerSupabase } from "@/lib/supabase/server";

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  grade: z.string().min(1).optional(),
  teacherId: z.string().uuid().nullable().optional()
});

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

    const { data: group, error: lookupError } = await supabase
      .from("groups")
      .select("id, school_id")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!group || group.school_id !== session.schoolId) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.grade !== undefined) updates.grade = parsed.data.grade;
    if (parsed.data.teacherId !== undefined) updates.teacher_id = parsed.data.teacherId;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: true });
    }

    const { error: updateError } = await supabase
      .from("groups")
      .update(updates)
      .eq("id", id);
    if (updateError) throw updateError;

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

    const { data: group, error: lookupError } = await supabase
      .from("groups")
      .select("id, school_id")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!group || group.school_id !== session.schoolId) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from("groups").delete().eq("id", id);
    if (deleteError) {
      return NextResponse.json(
        {
          error:
            "No se pudo eliminar. Probablemente tiene evidencias asociadas; desactiva al maestro responsable en su lugar."
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
