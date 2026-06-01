import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdmin } from "@/lib/auth-admin";
import {
  EXPERIMENT_VIDEOS_BUCKET,
  getPublicStorageUrl
} from "@/lib/supabase/storage-public-url";
import { createServerSupabase } from "@/lib/supabase/server";

const schema = z.object({
  filename: z.string().min(1).max(180)
});

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120) || "video";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: experiment, error: lookupError } = await supabase
      .from("experiments")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!experiment) {
      return NextResponse.json({ error: "Experimento no encontrado" }, { status: 404 });
    }

    const filename = sanitizeFilename(parsed.data.filename);
    const path = `${id}/${Date.now()}-${filename}`;

    const { data, error } = await supabase.storage
      .from(EXPERIMENT_VIDEOS_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "No se pudo firmar la subida" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bucket: EXPERIMENT_VIDEOS_BUCKET,
      path: data.path,
      token: data.token,
      publicUrl: getPublicStorageUrl(EXPERIMENT_VIDEOS_BUCKET, data.path)
    });
  } catch (error) {
    return jsonError(error);
  }
}
