import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdmin } from "@/lib/auth-admin";
import { createServerSupabase } from "@/lib/supabase/server";

const statusSchema = z.enum(["draft", "published", "archived"]);

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  objective: z.string().min(5).optional(),
  instructions: z.string().min(5).optional(),
  materials: z.string().nullable().optional(),
  printableUrl: z.string().nullable().optional(),
  status: statusSchema.optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const json = await request.json();
    const parsed = updateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.objective !== undefined) updates.objective = parsed.data.objective;
    if (parsed.data.instructions !== undefined) {
      updates.instructions = parsed.data.instructions;
    }
    if (parsed.data.materials !== undefined) updates.materials = parsed.data.materials;
    if (parsed.data.printableUrl !== undefined) {
      updates.printable_url = parsed.data.printableUrl || null;
    }
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;

    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createServerSupabase();
    const { error } = await supabase.from("experiments").update(updates).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = createServerSupabase();

    const { count, error: countError } = await supabase
      .from("weekly_challenges")
      .select("id", { count: "exact", head: true })
      .eq("experiment_id", id);
    if (countError) throw countError;

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar: el experimento esta vinculado a retos semanales. Archivalo en su lugar."
        },
        { status: 409 }
      );
    }

    const { error } = await supabase.from("experiments").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
