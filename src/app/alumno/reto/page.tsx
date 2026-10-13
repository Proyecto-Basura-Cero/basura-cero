import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth-student";
import { StudentChallenge } from "@/components/students/student-challenge";

export const dynamic = "force-dynamic";

export default async function StudentChallengePage() {
  const session = await getStudentSession();
  if (!session) {
    redirect("/alumno");
  }
  return (
    <div className="py-6">
      <StudentChallenge />
    </div>
  );
}
