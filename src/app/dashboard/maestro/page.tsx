import { RoleGuard } from "@/components/auth/role-guard";
import { ProgressRing52Weeks } from "@/components/gamification/progress-ring-52-weeks";
import { EvidenceUploader } from "@/components/evidence/evidence-uploader";
import { BadgeGrid } from "@/components/gamification/badge-grid";

export default async function TeacherDashboardPage() {
  return (
    <RoleGuard allow={["teacher", "admin"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-700">Panel de maestro</h1>
        <ProgressRing52Weeks completed={18} />
        <EvidenceUploader />
        <BadgeGrid />
      </div>
    </RoleGuard>
  );
}
