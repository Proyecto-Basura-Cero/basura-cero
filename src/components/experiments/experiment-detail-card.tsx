import { Experiment } from "@/lib/types";
import { PrintableSheetButton } from "@/components/experiments/printable-sheet-button";
import { ExperimentVideo } from "@/components/experiments/experiment-video";

function FormattedText({
  label,
  text,
  className = "text-slate-700"
}: {
  label: string;
  text: string;
  className?: string;
}) {
  return (
    <div>
      <p className="font-semibold">{label}</p>
      <p className={`mt-1 whitespace-pre-line ${className}`}>{text}</p>
    </div>
  );
}

export function ExperimentDetailCard({ experiment }: { experiment: Experiment }) {
  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-emerald-700">{experiment.title}</h2>
      <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
        {experiment.objective}
      </p>

      {experiment.videoUrl && <ExperimentVideo videoUrl={experiment.videoUrl} />}

      <div className="mt-4 space-y-4 text-sm">
        {experiment.hypothesis && (
          <FormattedText label="Hipótesis:" text={experiment.hypothesis} />
        )}
        {experiment.materials && (
          <FormattedText label="Materiales:" text={experiment.materials} />
        )}
        {experiment.classification && (
          <FormattedText label="Clasificación:" text={experiment.classification} />
        )}
        <FormattedText label="Procedimiento:" text={experiment.instructions} />
        {experiment.observations && (
          <FormattedText label="Observaciones:" text={experiment.observations} />
        )}
        {experiment.resultsPrompt && (
          <FormattedText label="Resultados:" text={experiment.resultsPrompt} />
        )}
      </div>

      <section className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-800">
          Dato impactante
        </h3>
        <p className="mt-2 whitespace-pre-line text-sm text-sky-900">
          {experiment.curiousFact}
        </p>
      </section>

      <section className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
          Conclusión
        </h3>
        <p className="mt-2 whitespace-pre-line text-sm text-emerald-900">
          {experiment.conclusion}
        </p>
      </section>

      {experiment.drawingPrompt && (
        <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Gráfica o dibujo
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
            {experiment.drawingPrompt}
          </p>
        </section>
      )}

      {experiment.finalMessage && (
        <section className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
            Mensaje final
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm text-emerald-900">
            {experiment.finalMessage}
          </p>
        </section>
      )}

      {experiment.printableUrl && (
        <div className="mt-5">
          <PrintableSheetButton printableUrl={experiment.printableUrl} />
        </div>
      )}
    </article>
  );
}
