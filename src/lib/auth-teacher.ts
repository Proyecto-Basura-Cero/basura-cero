import { getSession } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { HttpError } from "@/lib/auth-admin";
import type { Role } from "@/lib/types";

export type TeacherSession = {
  userId: string;
  role: Role;
  schoolId: string;
};

/**
 * Garantiza que el caller es maestro (o admin actuando como tal) y
 * resuelve su school_id desde public.users. Lanza HttpError si no
 * cumple.
 */
export async function requireTeacherWithSchool(): Promise<TeacherSession> {
  const session = await getSession();
  if (!session) throw new HttpError(401, "No autenticado");
  if (!["teacher", "admin"].includes(session.role)) {
    throw new HttpError(403, "Solo maestros y administradores");
  }

  if (session.schoolId) {
    return { userId: session.userId, role: session.role, schoolId: session.schoolId };
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("school_id, is_active")
    .eq("id", session.userId)
    .maybeSingle();

  if (error) throw new HttpError(500, error.message);
  if (!data || data.is_active === false) {
    throw new HttpError(403, "Usuario inactivo");
  }
  if (!data.school_id) {
    throw new HttpError(400, "Tu cuenta no tiene escuela asignada");
  }

  return {
    userId: session.userId,
    role: session.role,
    schoolId: data.school_id as string
  };
}

/**
 * Verifica que el maestro tiene asignado el grupo en su escuela. Admin
 * tiene paso libre dentro de su escuela.
 */
export async function assertGroupOwnership(
  session: TeacherSession,
  groupId: string
): Promise<void> {
  const supabase = createServerSupabase();
  const { data: group, error } = await supabase
    .from("groups")
    .select("id, school_id, teacher_id, teachers(user_id)")
    .eq("id", groupId)
    .maybeSingle();

  if (error) throw new HttpError(500, error.message);
  if (!group || group.school_id !== session.schoolId) {
    throw new HttpError(404, "Grupo no encontrado");
  }

  if (session.role === "admin") return;

  const teacher = Array.isArray(group.teachers) ? group.teachers[0] : group.teachers;
  if (!teacher || teacher.user_id !== session.userId) {
    throw new HttpError(403, "No tienes asignado este grupo");
  }
}

/**
 * Verifica que el maestro (o admin de la escuela) puede gestionar al alumno,
 * resolviendo el grupo del alumno y reutilizando assertGroupOwnership.
 * Devuelve el alumno con su group_id. Lanza HttpError si no procede.
 */
export async function assertStudentOwnership(
  session: TeacherSession,
  studentId: string
): Promise<{ id: string; groupId: string }> {
  const supabase = createServerSupabase();
  const { data: student, error } = await supabase
    .from("students")
    .select("id, group_id, school_id")
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw new HttpError(500, error.message);
  if (!student || student.school_id !== session.schoolId) {
    throw new HttpError(404, "Alumno no encontrado");
  }

  await assertGroupOwnership(session, student.group_id as string);
  return { id: student.id as string, groupId: student.group_id as string };
}
