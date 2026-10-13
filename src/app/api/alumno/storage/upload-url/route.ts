import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/auth-admin";
import { requireStudentSession } from "@/lib/auth-student";
import { createServerSupabase } from "@/lib/supabase/server";

const schema = z.object({
  draftId: z.string().min(8).max(64),
  filename: z.string().min(1).max(180)
});

const BUCKET = "evidencias";

function sanitizeFilename(name: string): string {
  return (
    name
      .normalize("NFKD")
      .replace(/[^\w.\-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 120) || "archivo"
  );
}

export async function POST(request: Request) {
  try {
    const session = await requireStudentSession();
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Reto actual para incluirlo en la ruta (sin PII: solo IDs).
    const { data: challenge } = await supabase
      .from("weekly_challenges")
      .select("id")
      .eq("school_id", session.schoolId)
      .eq("is_current", true)
      .maybeSingle();
    const challengeId = challenge?.id ?? "sin-reto";

    const filename = sanitizeFilename(parsed.data.filename);
    const path = `${session.schoolId}/${session.groupId}/${session.studentId}/${challengeId}/${parsed.data.draftId}/${Date.now()}-${filename}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "No se pudo firmar la subida" },
        { status: 500 }
      );
    }

    return NextResponse.json({ bucket: BUCKET, path: data.path, token: data.token });
  } catch (error) {
    return jsonError(error);
  }
}
