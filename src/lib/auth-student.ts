import { cookies } from "next/headers";
import { HttpError } from "@/lib/auth-admin";

/**
 * Sesion acotada de ALUMNO.
 *
 * Decision de diseno: contexto NUEVO y minimo, NO un sub-rol de `group`.
 * - Los alumnos no son users de Supabase Auth: no existe fila en users/auth.users.
 * - No se toca el modelo de roles (admin|teacher|group|jury) ni getSession().
 * - La sesion vive en cookies propias, httpOnly, de corta duracion, y solo
 *   habilita: ver su reto, jugar, completar pasos y subir su evidencia.
 * - El acceso a datos del alumno ocurre siempre en el servidor con el service
 *   role tras validar estas cookies (nunca por RLS basada en auth.uid()).
 */

export type StudentSession = {
  studentId: string;
  groupId: string;
  schoolId: string;
};

const STUDENT_COOKIE_MAX_AGE = 60 * 60 * 2; // 2 horas

const COOKIE_STUDENT_ID = "studentId";
const COOKIE_STUDENT_GROUP = "studentGroupId";
const COOKIE_STUDENT_SCHOOL = "studentSchoolId";

export async function getStudentSession(): Promise<StudentSession | null> {
  const store = await cookies();
  const studentId = store.get(COOKIE_STUDENT_ID)?.value;
  const groupId = store.get(COOKIE_STUDENT_GROUP)?.value;
  const schoolId = store.get(COOKIE_STUDENT_SCHOOL)?.value;
  if (!studentId || !groupId || !schoolId) return null;
  return { studentId, groupId, schoolId };
}

export async function requireStudentSession(): Promise<StudentSession> {
  const session = await getStudentSession();
  if (!session) {
    throw new HttpError(401, "Entra con tu codigo para continuar");
  }
  return session;
}

export async function setStudentSession(session: StudentSession): Promise<void> {
  const store = await cookies();
  const baseOptions = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STUDENT_COOKIE_MAX_AGE
  };
  store.set(COOKIE_STUDENT_ID, session.studentId, baseOptions);
  store.set(COOKIE_STUDENT_GROUP, session.groupId, baseOptions);
  store.set(COOKIE_STUDENT_SCHOOL, session.schoolId, baseOptions);
}

export async function clearStudentSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_STUDENT_ID);
  store.delete(COOKIE_STUDENT_GROUP);
  store.delete(COOKIE_STUDENT_SCHOOL);
}
