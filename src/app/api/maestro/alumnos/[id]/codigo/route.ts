import { NextResponse } from "next/server";
import { jsonError } from "@/lib/auth-admin";
import {
  assertStudentOwnership,
  requireTeacherWithSchool
} from "@/lib/auth-teacher";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  buildStoredHash,
  codePrefix,
  generateAccessCode
} from "@/lib/students/access-code";

/**
 * Regenera el codigo de acceso del alumno: invalida el anterior y emite uno
 * nuevo. El codigo en claro se devuelve una sola vez.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireTeacherWithSchool();
    const { id } = await params;
    await assertStudentOwnership(session, id);

    const supabase = createServerSupabase();

    // Revoca el codigo activo previo.
    await supabase
      .from("student_access_codes")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("student_id", id)
      .eq("is_active", true);

    const code = generateAccessCode();
    const { error } = await supabase.from("student_access_codes").insert({
      student_id: id,
      code_hash: buildStoredHash(code),
      code_prefix: codePrefix(code),
      is_active: true
    });
    if (error) throw error;

    return NextResponse.json({ ok: true, code });
  } catch (error) {
    return jsonError(error);
  }
}
