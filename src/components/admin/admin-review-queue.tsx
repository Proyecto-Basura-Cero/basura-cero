import { adminEvidenceRows } from "@/lib/admin/mock";

export function AdminReviewQueue() {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-4">
      <h3 className="text-lg font-bold text-emerald-700">Cola de revision</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {adminEvidenceRows.map((item) => (
          <li key={item.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr,auto] md:items-center">
            <span>
              {item.id} - Grupo {item.groupName} - Semana {item.weekNumber} - {item.submittedAt}
            </span>
            <div className="space-x-2">
              <button className="rounded bg-emerald-600 px-2 py-1 text-white" type="button">
                Aprobar
              </button>
              <button className="rounded bg-rose-600 px-2 py-1 text-white" type="button">
                Rechazar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
