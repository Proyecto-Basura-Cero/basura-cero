import { Star } from "lucide-react";

/**
 * Barra de XP de la semana del alumno. Muestra cuantos puntos lleva ganados
 * (pasos completados + juego) sobre el total posible del reto.
 *
 * Los valores provienen de datos reales de la vista del reto (no inventados):
 * se calculan en student-challenge a partir de `steps` y `game`.
 */
export function XpBar({ earned, total }: { earned: number; total: number }) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(100, Math.round((earned / safeTotal) * 100));
  const complete = total > 0 && earned >= total;

  return (
    <section
      className="rounded-3xl border-4 border-sun-300 bg-sun-50 p-4"
      aria-label={`Llevas ${earned} de ${total} puntos esta semana`}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-display text-sm font-bold text-sun-600">
          <Star className="h-5 w-5 fill-sun-400 text-sun-500" aria-hidden />
          Tus puntos de la semana
        </span>
        <span className="font-display text-base font-extrabold text-sun-600">
          {earned}
          <span className="text-sun-500/80"> / {total}</span>
        </span>
      </div>

      <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-white">
        <div
          role="progressbar"
          aria-valuenow={earned}
          aria-valuemin={0}
          aria-valuemax={total}
          className="h-4 rounded-full bg-sun-400 transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {complete && (
        <p className="mt-2 text-center text-sm font-bold text-eco-700">
          Completaste todos los puntos. Increible!
        </p>
      )}
    </section>
  );
}
