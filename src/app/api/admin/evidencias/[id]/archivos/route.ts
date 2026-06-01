import { NextResponse } from "next/server";
import { jsonError, requireAdminWithSchool } from "@/lib/auth-admin";
import { createServerSupabase } from "@/lib/supabase/server";

const BUCKET = "evidencias";
const EXPIRES_IN_SECONDS = 600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminWithSchool();
    const { id } = await params;
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from("submissions")
      .select(
        "id, groups(school_id), evidence_files(id, file_path, file_type)"
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;

    const groups = Array.isArray(data?.groups) ? data?.groups[0] : data?.groups;
    if (!data || groups?.school_id !== session.schoolId) {
      return NextResponse.json({ error: "Evidencia no encontrada" }, { status: 404 });
    }

    const files = data.evidence_files ?? [];
    if (!files.length) {
      return NextResponse.json({ data: [] });
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(
        files.map((f) => f.file_path),
        EXPIRES_IN_SECONDS
      );
    if (signedError) throw signedError;

    const signedByPath = new Map<string, string>();
    (signed ?? []).forEach((entry) => {
      if (entry.path && entry.signedUrl) {
        signedByPath.set(entry.path, entry.signedUrl);
      }
    });

    return NextResponse.json({
      data: files.map((f) => ({
        id: f.id,
        path: f.file_path,
        type: f.file_type,
        signedUrl: signedByPath.get(f.file_path) ?? null
      })),
      expiresInSeconds: EXPIRES_IN_SECONDS
    });
  } catch (error) {
    return jsonError(error);
  }
}
