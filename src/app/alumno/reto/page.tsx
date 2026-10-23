import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth-student";
import { StudentChallenge } from "@/components/students/student-challenge";
import { getCalendar52Weeks } from "@/lib/services/calendar-52-weeks";

export const dynamic = "force-dynamic";

export default async function StudentChallengePage() {
  const session = await getStudentSession();
  if (!session) {
    redirect("/alumno");
  }

  let calendar: Awaited<ReturnType<typeof getCalendar52Weeks>> | null = null;
  try {
    calendar = await getCalendar52Weeks(session.schoolId);
  } catch {
    calendar = null;
  }

  return (
    <div className="py-6">
      <StudentChallenge calendarWeeks={calendar?.weeks ?? null} />
    </div>
  );
}
