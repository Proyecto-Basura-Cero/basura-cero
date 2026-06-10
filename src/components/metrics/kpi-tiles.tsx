type Kpi = { label: string; value: string };

export function KpiTiles({ items }: { items: Kpi[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => (
        <article key={item.label} className="rounded-2xl border border-emerald-100 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">{item.label}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{item.value}</p>
        </article>
      ))}
    </section>
  );
}
