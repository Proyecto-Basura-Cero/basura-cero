import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdminWithSchool } from "@/lib/auth-admin";
import { createServerSupabase } from "@/lib/supabase/server";

const patchSchema = z.object({
  isActive: z.boolean()
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

    const { data: teacher, error: lookupError } = await supabase
      .from("teachers")
      .select("user_id, school_id")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!teacher || teacher.school_id !== session.schoolId) {
      return NextResponse.json({ error: "Maestro no encontrado" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ is_active: parsed.data.isActive })
      .eq("id", teacher.user_id);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
