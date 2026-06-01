import { createClient } from "@supabase/supabase-js";
import { sanitizeSupabaseUrl } from "./url";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!rawUrl || !rawKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseAnonKey = rawKey.trim();

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
