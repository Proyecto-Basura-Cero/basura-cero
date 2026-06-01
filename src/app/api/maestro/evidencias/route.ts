import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/auth-admin";
import {
  assertGroupOwnership,
  requireTeacherWithSchool
} from "@/lib/auth-teacher";
import { createServerSupabase } from "@/lib/supabase/server";
import { scoreSubmission, assignBadges } from "@/lib/services/scoring-service";

const fileSchema = z.object({
  path: z.string().min(3),
  type: z.string().min(1).max(60)
});

const schema = z.object({
  groupId: z.string().uuid(),
  challengeId: z.string().uuid(),
  comments: z.string().min(5).max(1000),
  participantsCount: z.coerce.number().int().min(0),
  kgSeparated: z.coerce.number().min(0).default(0),
  reusedItems: z.coerce.number().int().min(0).default(0),
  files: z.array(fileSchema).min(1, "Adjunta al menos una evidencia"),
  status: z.enum(["submitted", "draft"]).default("submitted")
});

export async function GET() {
  try {
    const session = await requireTeacherWithSchool();
    const supabase = createServerSupabase();

    let query = supabase
      .from("submissions")
      .select(
        "id, comments, participants_count, status, submitted_at, group_id, groups!inner(name, grade, school_id, teacher_id, teachers(user_id)), challenge_id, weekly_challenges(experiment_id, experiments(week_number, title)), scores(points_total), evidence_files(id)"
      )
      .eq("groups.school_id", session.schoolId)
      .order("submitted_at", { ascending: false })
      .limit(50);

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []).filter((row) => {
      if (session.role === "admin") return true;
      const groups = Array.isArray(row.groups) ? row.groups[0] : row.groups;
      const teachers = Array.isArray(groups?.teachers)
        ? groups?.teachers[0]
        : groups?.teachers;
      return teachers?.user_id === session.userId;
    });

    return NextResponse.json({
      data: rows.map((row) => {
        const groups = Array.isArray(row.groups) ? row.groups[0] : row.groups;
        const challenge = Array.isArray(row.weekly_challenges)
          ? row.weekly_challenges[0]
          : row.weekly_challenges;
        const experiment = Array.isArray(challenge?.experiments)
          ? challenge?.experiments[0]
          : challenge?.experiments;
        const score = Array.isArray(row.scores) ? row.scores[0] : row.scores;
        return {
          id: row.id,
          status: row.status,
          submittedAt: row.submitted_at,
          comments: row.comments,
          participantsCount: row.participants_count,
          group: { id: row.group_id, name: groups?.name, grade: groups?.grade },
          weekNumber: experiment?.week_number ?? null,
          experimentTitle: experiment?.title ?? null,
          pointsTotal: score?.points_total ?? null,
          filesCount: Array.isArray(row.evidence_files)
            ? row.evidence_files.length
            : 0
        };
      })
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireTeacherWithSchool();
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      );
    }

    await assertGroupOwnership(session, parsed.data.groupId);

    const supabase = createServerSupabase();

    const { data: challenge, error: challengeError } = await supabase
      .from("weekly_challenges")
      .select("id, school_id, end_date")
      .eq("id", parsed.data.challengeId)
      .maybeSingle();
    if (challengeError) throw challengeError;
    if (!challenge || challenge.school_id !== session.schoolId) {
      return NextResponse.json(
        { error: "Reto no encontrado en tu escuela" },
        { status: 404 }
      );
    }

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .upsert(
        {
          challenge_id: parsed.data.challengeId,
          group_id: parsed.data.groupId,
          submitted_by: session.userId,
          comments: parsed.data.comments,
          participants_count: parsed.data.participantsCount,
          status: parsed.data.status
        },
        { onConflict: "challenge_id,group_id" }
      )
      .select("id")
      .single();
    if (submissionError) throw submissionError;

    const submissionId = submission.id;

    await supabase.from("evidence_files").delete().eq("submission_id", submissionId);
    const { error: filesError } = await supabase.from("evidence_files").insert(
      parsed.data.files.map((f) => ({
        submission_id: submissionId,
        file_path: f.path,
        file_type: f.type
      }))
    );
    if (filesError) throw filesError;

    const { error: metricsError } = await supabase.from("impact_metrics").upsert(
      {
        submission_id: submissionId,
        kg_separated: parsed.data.kgSeparated,
        reused_items: parsed.data.reusedItems,
        waste_reduced_estimate: parsed.data.kgSeparated
      },
      { onConflict: "submission_id" }
    );
    if (metricsError) throw metricsError;

    if (parsed.data.status === "submitted") {
      const today = new Date().toISOString().slice(0, 10);
      const isOnTime = today <= challenge.end_date;

      await scoreSubmission(submissionId, {
        participantsCount: parsed.data.participantsCount,
        expectedParticipants: Math.max(parsed.data.participantsCount, 1),
        kgSeparated: parsed.data.kgSeparated,
        reusedItems: parsed.data.reusedItems,
        creativityScore: 0,
        teamworkScore: 0,
        hasEvidenceFile: parsed.data.files.length > 0,
        isOnTime
      });

      const { data: groupSubs } = await supabase
        .from("submissions")
        .select(
          "id, status, submitted_at, participants_count, impact_metrics(kg_separated), weekly_challenges(end_date)"
        )
        .eq("group_id", parsed.data.groupId)
        .eq("status", "submitted");

      const totalKgSeparated = (groupSubs ?? []).reduce((sum, sub) => {
        const im = Array.isArray(sub.impact_metrics)
          ? sub.impact_metrics[0]
          : sub.impact_metrics;
        return sum + Number(im?.kg_separated ?? 0);
      }, 0);
      const completedWeeks = (groupSubs ?? []).length;
      const onTimeSubmissions = (groupSubs ?? []).filter((sub) => {
        const wc = Array.isArray(sub.weekly_challenges)
          ? sub.weekly_challenges[0]
          : sub.weekly_challenges;
        if (!wc || !sub.submitted_at) return false;
        return sub.submitted_at.slice(0, 10) <= wc.end_date;
      }).length;

      await assignBadges(parsed.data.groupId, {
        totalKgSeparated,
        completedWeeks,
        consecutiveWeeks: completedWeeks,
        compostWeeks: 0,
        avgParticipation: 0,
        onTimeSubmissions,
        isTop3Monthly: false,
        isTop1Quarterly: false
      });
    }

    return NextResponse.json({ ok: true, submissionId });
  } catch (error) {
    return jsonError(error);
  }
}
