import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/error-message";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export type AdminSession = {
  userId: string;
  role: Role;
  schoolId: string | null;
};

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const role = store.get("role")?.value as Role | undefined;
  const userId = store.get("userId")?.value;
  if (!role || !userId) return null;
  if (role !== "admin") return null;
  return {
    userId,
    role,
    schoolId: store.get("schoolId")?.value ?? null
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new HttpError(401, "No autorizado");
  }
  return session;
}

async function resolveSchoolId(session: AdminSession): Promise<string | null> {
  if (session.schoolId) return session.schoolId;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", session.userId)
    .maybeSingle();

  if (error) throw new HttpError(500, error.message);
  return (data?.school_id as string | null) ?? null;
}

export async function getAdminSchoolId(): Promise<string | null> {
  const session = await getAdminSession();
  if (!session) return null;
  return resolveSchoolId(session);
}

export async function requireAdminWithSchool(): Promise<
  AdminSession & { schoolId: string }
> {
  const session = await requireAdmin();
  const schoolId = await resolveSchoolId(session);

  if (!schoolId) {
    throw new HttpError(
      400,
      "Tu cuenta de admin no tiene school_id. Asigna uno en public.users."
    );
  }

  return { ...session, schoolId };
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
}

export function generateTempPassword(length = 12): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
