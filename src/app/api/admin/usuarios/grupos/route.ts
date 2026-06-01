import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdminWithSchool } from "@/lib/auth-admin";
import { createServerSupabase } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().min(2),
  grade: z.string().min(1),
  teacherId: z.string().uuid().nullable().optional()
});

export async function GET() {
  try {
    const session = await requireAdminWithSchool();
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from("groups")
      .select("id, name, grade, created_at, teacher_id, teachers(full_name)")
      .eq("school_id", session.schoolId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      data: (data ?? []).map((g) => {
        const teacher = Array.isArray(g.teachers) ? g.teachers[0] : g.teachers;
        return {
          id: g.id,
          name: g.name,
          grade: g.grade,
          teacherId: g.teacher_id,
          teacherName: teacher?.full_name ?? null
        };
      })
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminWithSchool();
    const json = await request.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    if (parsed.data.teacherId) {
      const { data: teacher, error: teacherErr } = await supabase
        .from("teachers")
        .select("id, school_id")
        .eq("id", parsed.data.teacherId)
        .maybeSingle();
      if (teacherErr) throw teacherErr;
      if (!teacher || teacher.school_id !== session.schoolId) {
        return NextResponse.json(
          { error: "Maestro no pertenece a tu escuela" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("groups")
      .insert({
        school_id: session.schoolId,
        teacher_id: parsed.data.teacherId ?? null,
        name: parsed.data.name,
        grade: parsed.data.grade
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return jsonError(error);
  }
}
