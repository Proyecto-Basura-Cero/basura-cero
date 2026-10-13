import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/auth-admin";
import {
  assertGroupOwnership,
  requireTeacherWithSchool
} from "@/lib/auth-teacher";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  buildStoredHash,
  codePrefix,
  generateAccessCode
} from "@/lib/students/access-code";

const createSchema = z.object({
  groupId: z.string().uuid(),
  alias: z.string().trim().min(2, "Alias muy corto").max(40),
  grade: z.string().trim().max(20).optional()
});

export async function GET(request: Request) {
  try {
    const session = await requireTeacherWithSchool();
    const supabase = createServerSupabase();
    const url = new URL(request.url);
    const groupId = url.searchParams.get("groupId");

    if (groupId) {
      await assertGroupOwnership(session, groupId);
    }

    let query = supabase
      .from("students")
      .select(
        "id, alias, grade, is_active, group_id, groups!inner(name, grade, school_id, teacher_id, teachers(user_id)), student_access_codes(code_prefix, is_active, expires_at)"
      )
      .eq("groups.school_id", session.schoolId)
      .order("alias", { ascending: true });

    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []).filter((row) => {
      if (session.role === "admin") return true;
      const group = Array.isArray(row.groups) ? row.groups[0] : row.groups;
      const teacher = Array.isArray(group?.teachers)
        ? group?.teachers[0]
        : group?.teachers;
      return teacher?.user_id === session.userId;
    });

    return NextResponse.json({
      data: rows.map((row) => {
        const group = Array.isArray(row.groups) ? row.groups[0] : row.groups;
        const activeCode = (row.student_access_codes ?? []).find(
          (c: { is_active: boolean }) => c.is_active
        );
        return {
          id: row.id,
          alias: row.alias,
          grade: row.grade,
          isActive: row.is_active,
          group: { id: row.group_id, name: group?.name, grade: group?.grade },
          code: activeCode
            ? { prefix: activeCode.code_prefix, expiresAt: activeCode.expires_at }
            : null
        };
      })
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireTeacherWithSchool();
    const json = await request.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      );
    }

    await assertGroupOwnership(session, parsed.data.groupId);

    const supabase = createServerSupabase();

    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        school_id: session.schoolId,
        group_id: parsed.data.groupId,
        alias: parsed.data.alias,
        grade: parsed.data.grade ?? null
      })
      .select("id, alias, grade, is_active, group_id")
      .single();
    if (studentError) {
      // alias duplicado dentro del grupo
      if (studentError.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un alumno con ese alias en el grupo" },
          { status: 409 }
        );
      }
      throw studentError;
    }

    // Emite el primer codigo de acceso (se muestra una sola vez).
    const code = generateAccessCode();
    const { error: codeError } = await supabase.from("student_access_codes").insert({
      student_id: student.id,
      code_hash: buildStoredHash(code),
      code_prefix: codePrefix(code),
      is_active: true
    });
    if (codeError) throw codeError;

    return NextResponse.json({
      ok: true,
      student: {
        id: student.id,
        alias: student.alias,
        grade: student.grade,
        isActive: student.is_active,
        groupId: student.group_id
      },
      // Solo se devuelve en claro aqui; nunca se vuelve a mostrar.
      code
    });
  } catch (error) {
    return jsonError(error);
  }
}
