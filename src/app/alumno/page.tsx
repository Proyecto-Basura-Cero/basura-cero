import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth-student";
import { StudentAccessForm } from "@/components/students/student-access-form";

export const dynamic = "force-dynamic";

export default async function StudentAccessPage() {
  const session = await getStudentSession();
  if (session) {
    redirect("/alumno/reto");
  }
  return (
    <div className="py-8">
      <StudentAccessForm />
    </div>
  );
}
