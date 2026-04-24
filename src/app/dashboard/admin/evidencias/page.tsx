import { RoleGuard } from "@/components/auth/role-guard";
import { AdminReviewQueue } from "@/components/admin/admin-review-queue";

export default async function AdminEvidencePage() {
  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-emerald-700">Revision de evidencias</h1>
        <AdminReviewQueue />
      </div>
    </RoleGuard>
  );
}
