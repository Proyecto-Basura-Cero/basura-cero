import { Calendar52Weeks } from "@/components/gamification/calendar-52-weeks";
import { getCalendar52Weeks } from "@/lib/services/calendar-52-weeks";
import { resolveRankingSchoolId } from "@/lib/services/group-ranking";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const schoolId = await resolveRankingSchoolId();

  let calendar: Awaited<ReturnType<typeof getCalendar52Weeks>> = {
    weeks: Array.from({ length: 52 }, (_, i) => ({
      weekNumber: i + 1,
      type: null,
      title: null,
      completed: false,
      isCurrent: false,
      published: false
    })),
    completedCount: 0,
    currentWeek: null
  };

  try {
    calendar = await getCalendar52Weeks(schoolId);
  } catch {
    // Si falla Supabase, se muestra la rejilla vacia.
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-black text-eco-700">
          Calendario de 52 semanas
        </h1>
        <p className="mt-1 text-slate-600">
          Un reto cada semana. El color dice de que trata y las semanas
          completadas aparecen con una palomita.
        </p>
      </header>

      <section className="rounded-3xl border-4 border-eco-100 bg-white p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-lg font-bold text-eco-700">
            {calendar.completedCount} de 52 semanas completadas
          </p>
          {calendar.currentWeek && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-100 px-3 py-1 text-sm font-bold text-sun-600">
              Semana en curso: {calendar.currentWeek}
            </span>
          )}
        </div>
        <Calendar52Weeks weeks={calendar.weeks} showLegend />
      </section>
    </div>
  );
}
