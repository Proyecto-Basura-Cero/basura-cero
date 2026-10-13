import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth-student";
import { StudentEvidenceUploader } from "@/components/students/student-evidence-uploader";

export const dynamic = "force-dynamic";

export default async function StudentEvidencePage() {
  const session = await getStudentSession();
  if (!session) {
    redirect("/alumno");
  }
  return (
    <div className="py-6">
      <StudentEvidenceUploader />
    </div>
  );
}
