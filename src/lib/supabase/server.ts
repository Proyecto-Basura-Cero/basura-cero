import { createClient } from "@supabase/supabase-js";
import { sanitizeSupabaseUrl } from "./url";

export function createServerSupabase() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !rawServiceRole) {
    throw new Error("Missing Supabase server environment variables");
  }

  const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
  const serviceRole = rawServiceRole.trim();

  return createClient(supabaseUrl, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
