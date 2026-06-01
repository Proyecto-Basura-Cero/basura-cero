import { NextResponse } from "next/server";
import { jsonError } from "@/lib/auth-admin";
import { requireTeacherWithSchool } from "@/lib/auth-teacher";
import { getCurrentChallengeForSchool } from "@/lib/services/current-challenge";

export async function GET() {
  try {
    const session = await requireTeacherWithSchool();
    const challenge = await getCurrentChallengeForSchool(session.schoolId);
    return NextResponse.json({ data: challenge });
  } catch (error) {
    return jsonError(error);
  }
}
