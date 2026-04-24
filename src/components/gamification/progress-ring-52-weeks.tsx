export function ProgressRing52Weeks({ completed }: { completed: number }) {
  const progress = Math.min(100, Math.round((completed / 52) * 100));
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
      <p className="text-sm font-semibold text-emerald-700">Progreso anual</p>
      <p className="mt-2 text-3xl font-bold">{progress}%</p>
      <p className="text-sm text-slate-600">{completed} de 52 semanas completadas</p>
      <div className="mt-3 h-3 w-full rounded-full bg-emerald-100">
        <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
