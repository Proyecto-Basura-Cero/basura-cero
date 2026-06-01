/**
 * Devuelve la URL base del proyecto Supabase, descartando sufijos
 * comunes que los usuarios pegan por error (REST, GraphQL, Auth, Storage,
 * Realtime endpoints) y normalizando trailing slashes / espacios.
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL no es una URL valida: "${trimmed}"`
    );
  }

  const cleanedPath = url.pathname
    .replace(/\/(rest|auth|storage|realtime|graphql)\/v\d+\/?$/i, "")
    .replace(/\/+$/, "");

  return `${url.protocol}//${url.host}${cleanedPath}`;
}
