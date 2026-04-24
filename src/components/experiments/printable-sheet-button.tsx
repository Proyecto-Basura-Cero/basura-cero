export function PrintableSheetButton({ printableUrl }: { printableUrl: string }) {
  return (
    <a
      href={printableUrl}
      className="inline-flex rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900"
      target="_blank"
      rel="noreferrer"
    >
      Descargar ficha imprimible
    </a>
  );
}
