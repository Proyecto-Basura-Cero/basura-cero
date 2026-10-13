import { NextResponse } from "next/server";
import { jsonError } from "@/lib/auth-admin";
import { requireStudentSession } from "@/lib/auth-student";
import { getStudentChallengeView } from "@/lib/services/student-challenge";

export async function GET() {
  try {
    const session = await requireStudentSession();
    const view = await getStudentChallengeView(session);
    return NextResponse.json({ data: view });
  } catch (error) {
    return jsonError(error);
  }
}
