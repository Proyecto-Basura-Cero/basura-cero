import Link from "next/link";
import { Check } from "lucide-react";
import type { CalendarWeek } from "@/lib/services/calendar-52-weeks";
import {
  CHALLENGE_TYPES,
  CHALLENGE_TYPE_STYLES,
  UNTYPED_CELL
} from "@/lib/challenge-types";

type Props = {
  weeks: CalendarWeek[];
  /** Muestra la leyenda de colores arriba. */
  showLegend?: boolean;
  /** Variante compacta (celdas mas pequenas, sin titulo). */
  compact?: boolean;
};

function cellClasses(week: CalendarWeek): string {
  if (!week.type) return UNTYPED_CELL;
  return CHALLENGE_TYPE_STYLES[week.type].cell;
}

export function Calendar52Weeks({
  weeks,
  showLegend = false,
  compact = false
}: Props) {
  return (
    <div className="space-y-4">
      {showLegend && (
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
          {CHALLENGE_TYPES.map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5 text-slate-700">
              <span
                className={`h-4 w-4 rounded ${CHALLENGE_TYPE_STYLES[t].swatch}`}
                aria-hidden
              />
              {CHALLENGE_TYPE_STYLES[t].label}
            </li>
          ))}
        </ul>
      )}

      <ol
        className={`grid gap-2 ${
          compact
            ? "grid-cols-8 sm:grid-cols-13"
            : "grid-cols-5 sm:grid-cols-7 lg:grid-cols-8"
        }`}
      >
        {weeks.map((week) => {
          const base = cellClasses(week);
          const label = `Semana ${week.weekNumber}${
            week.title ? `: ${week.title}` : ""
          }${week.completed ? " (completada)" : ""}${
            week.isCurrent ? " (en curso)" : ""
          }`;

          const inner = (
            <span
              aria-label={label}
              title={label}
              className={`relative flex aspect-square items-center justify-center rounded-xl font-display font-bold transition ${base} ${
                compact ? "text-xs" : "text-base sm:text-lg"
              } ${week.completed ? "" : "opacity-45"} ${
                week.isCurrent ? "ring-4 ring-sun-400 ring-offset-1" : ""
              } ${week.published ? "hover:scale-105 hover:opacity-100" : ""}`}
            >
              {week.weekNumber}
              {week.completed && (
                <span
                  className={`absolute -right-1 -top-1 flex items-center justify-center rounded-full border-2 border-white bg-eco-600 text-white ${
                    compact ? "h-4 w-4" : "h-5 w-5"
                  }`}
                  aria-hidden
                >
                  <Check className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
                </span>
              )}
            </span>
          );

          return (
            <li key={week.weekNumber}>
              {week.published ? (
                <Link
                  href={`/experimentos/${week.weekNumber}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
                >
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
