import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/auth-admin";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from("experiments")
      .select("id, week_number, title, objective, status, printable_url")
      .order("week_number", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      data: (data ?? []).map((e) => ({
        id: e.id,
        weekNumber: e.week_number,
        title: e.title,
        objective: e.objective,
        status: e.status,
        printableUrl: e.printable_url
      }))
    });
  } catch (error) {
    return jsonError(error);
  }
}
