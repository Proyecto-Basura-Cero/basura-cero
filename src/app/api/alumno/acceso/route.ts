import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/auth-admin";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  clearStudentSession,
  setStudentSession
} from "@/lib/auth-student";
import { codePrefix, normalizeCode, verifyStoredHash } from "@/lib/students/access-code";

const schema = z.object({
  code: z.string().trim().min(4).max(16)
});

// Rate limiting best-effort en memoria por IP. En entornos serverless con
// varias instancias es solo una primera barrera; la seguridad real la dan el
// espacio de codigos y el hash. Para produccion a escala conviene un store
// compartido (p.ej. Supabase/Redis).
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera un momento e intenta de nuevo." },
        { status: 429 }
      );
    }

    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Escribe tu codigo" }, { status: 400 });
    }

    const normalized = normalizeCode(parsed.data.code);
    const prefix = codePrefix(normalized);
    const supabase = createServerSupabase();

    // Candidatos: codigos activos con el mismo prefijo. Verificamos el hash en
    // el servidor (nunca se guarda el codigo en claro).
    const { data: candidates, error } = await supabase
      .from("student_access_codes")
      .select(
        "id, code_hash, is_active, expires_at, students!inner(id, group_id, school_id, is_active, groups!inner(id, school_id))"
      )
      .eq("code_prefix", prefix)
      .eq("is_active", true);
    if (error) throw error;

    const invalid = NextResponse.json(
      { error: "Codigo no valido o desactivado" },
      { status: 401 }
    );

    const now = Date.now();
    const match = (candidates ?? []).find((c) => {
      if (c.expires_at && Date.parse(c.expires_at) < now) return false;
      return verifyStoredHash(normalized, c.code_hash);
    });

    if (!match) return invalid;

    const student = Array.isArray(match.students) ? match.students[0] : match.students;
    if (!student || student.is_active === false) return invalid;

    const group = Array.isArray(student.groups) ? student.groups[0] : student.groups;
    if (!group) return invalid;

    await setStudentSession({
      studentId: student.id,
      groupId: student.group_id,
      schoolId: student.school_id
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE() {
  await clearStudentSession();
  return NextResponse.json({ ok: true });
}
