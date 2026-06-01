import { BadgeGrid } from "@/components/gamification/badge-grid";
import { getBadgesForCurrentUser } from "@/lib/services/teacher-dashboard";

export const dynamic = "force-dynamic";

export default async function BadgesPage() {
  let badges: Awaited<ReturnType<typeof getBadgesForCurrentUser>> = [];
  try {
    badges = await getBadgesForCurrentUser();
  } catch {
    badges = [];
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-emerald-700">Insignias ecologicas</h1>
        <p className="text-sm text-slate-600">
          Catalogo completo. Las insignias desbloqueadas corresponden a los
          grupos de tu escuela cuando has iniciado sesion.
        </p>
      </header>
      <BadgeGrid badges={badges} />
    </div>
  );
}
