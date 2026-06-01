import Link from "next/link";
import type { Route } from "next";
import { QrAccessCard } from "@/components/qr/qr-access-card";
import { getFeaturedChallenge } from "@/lib/services/current-challenge";
import { resolveRankingSchoolId } from "@/lib/services/group-ranking";
import { toAbsoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function CurrentWeekPage() {
  const schoolId = await resolveRankingSchoolId();
  const challenge = await getFeaturedChallenge(schoolId);

  if (!challenge) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-xl font-bold text-amber-900">Semana actual</h1>
        <p className="mt-2 text-sm text-amber-900">
          No hay reto activo en este momento. El administrador puede activarlo
          desde el panel de activacion semanal.
        </p>
        <Link
          href="/experimentos"
          className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Ver biblioteca de experimentos
        </Link>
      </div>
    );
  }

  const currentPath = `/experimentos/${challenge.weekNumber}` as Route;
  const qrUrl = await toAbsoluteUrl(currentPath);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <section className="rounded-2xl border border-emerald-100 bg-white p-6">
        <p className="text-sm font-semibold text-emerald-700">
          Semana #{challenge.weekNumber}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{challenge.title}</h1>
        <p className="mt-3 text-sm text-slate-700">{challenge.objective}</p>
        <p className="mt-2 text-xs text-slate-500">
          Periodo: {challenge.startDate} a {challenge.endDate}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={currentPath}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Ver detalle
          </Link>
          {challenge.printableUrl && (
            <a
              href={challenge.printableUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-emerald-300 px-4 py-2 text-sm text-emerald-700"
            >
              Descargar ficha
            </a>
          )}
        </div>
      </section>
      <QrAccessCard url={qrUrl} />
    </div>
  );
}
