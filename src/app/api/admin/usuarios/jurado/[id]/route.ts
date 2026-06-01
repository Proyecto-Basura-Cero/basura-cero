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

    const { data: user, error: lookupError } = await supabase
      .from("users")
      .select("id, role, school_id")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (
      !user ||
      user.role !== "jury" ||
      user.school_id !== session.schoolId
    ) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ is_active: parsed.data.isActive })
      .eq("id", id);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
