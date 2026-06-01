import { NextResponse } from "next/server";
import { jsonError } from "@/lib/auth-admin";
import { requireTeacherWithSchool } from "@/lib/auth-teacher";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    const session = await requireTeacherWithSchool();
    const supabase = createServerSupabase();

    if (session.role === "admin") {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, grade")
        .eq("school_id", session.schoolId)
        .order("name", { ascending: true });
      if (error) throw error;
      return NextResponse.json({ data: data ?? [] });
    }

    const { data, error } = await supabase
      .from("teachers")
      .select("groups(id, name, grade)")
      .eq("user_id", session.userId)
      .eq("school_id", session.schoolId)
      .maybeSingle();

    if (error) throw error;
    const groups = Array.isArray(data?.groups) ? data?.groups : [];
    return NextResponse.json({ data: groups });
  } catch (error) {
    return jsonError(error);
  }
}
