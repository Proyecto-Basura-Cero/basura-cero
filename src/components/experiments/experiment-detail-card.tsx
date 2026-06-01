import { Experiment } from "@/lib/types";
import { PrintableSheetButton } from "@/components/experiments/printable-sheet-button";

export function ExperimentDetailCard({ experiment }: { experiment: Experiment }) {
  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-emerald-700">{experiment.title}</h2>
      <p className="mt-2 text-sm text-slate-700">{experiment.objective}</p>

      <div className="mt-4 space-y-3 text-sm">
        {experiment.materials && (
          <p>
            <span className="font-semibold">Materiales:</span> {experiment.materials}
          </p>
        )}
        <p>
          <span className="font-semibold">Instrucciones:</span> {experiment.instructions}
        </p>
      </div>

      <section className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-800">
          Dato curioso
        </h3>
        <p className="mt-2 text-sm text-sky-900">{experiment.curiousFact}</p>
      </section>

      <section className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
          Conclusion
        </h3>
        <p className="mt-2 text-sm text-emerald-900">{experiment.conclusion}</p>
      </section>

      {experiment.printableUrl && (
        <div className="mt-5">
          <PrintableSheetButton printableUrl={experiment.printableUrl} />
        </div>
      )}
    </article>
  );
}
