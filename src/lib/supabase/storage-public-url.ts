import { sanitizeSupabaseUrl } from "./url";

export function getPublicStorageUrl(bucket: string, path: string): string {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!rawUrl) return "";
  const base = sanitizeSupabaseUrl(rawUrl);
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

export const EXPERIMENT_VIDEOS_BUCKET = "experimentos-videos";
