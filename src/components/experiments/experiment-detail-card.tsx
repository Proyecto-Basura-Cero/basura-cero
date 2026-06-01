import { Experiment } from "@/lib/types";
import { PrintableSheetButton } from "@/components/experiments/printable-sheet-button";

export function ExperimentDetailCard({ experiment }: { experiment: Experiment }) {
  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-emerald-700">{experiment.title}</h2>
      <p className="mt-2 text-sm text-slate-700">{experiment.objective}</p>

      <div className="mt-4 space-y-3 text-sm">
        <p>
          <span className="font-semibold">Instrucciones:</span> {experiment.instructions}
        </p>
        {experiment.materials && (
          <p>
            <span className="font-semibold">Materiales:</span> {experiment.materials}
          </p>
        )}
      </div>

      {experiment.printableUrl && (
        <div className="mt-5">
          <PrintableSheetButton printableUrl={experiment.printableUrl} />
        </div>
      )}
    </article>
  );
}
