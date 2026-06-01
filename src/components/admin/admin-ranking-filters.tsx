"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  grades: string[];
  currentGrade?: string;
};

export function AdminRankingFilters({ grades, currentGrade }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const applyGrade = (grade: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (grade) params.set("grade", grade);
    else params.delete("grade");
    const query = params.toString();
    router.push(query ? `/dashboard/admin/ranking?${query}` : "/dashboard/admin/ranking");
  };

  return (
    <form
      className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-3"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="text-sm">
        <span className="mb-1 block text-slate-600">Grado</span>
        <select
          value={currentGrade ?? ""}
          onChange={(e) => applyGrade(e.target.value)}
          className="w-full rounded border border-slate-300 p-2"
        >
          <option value="">Todos los grados</option>
          {grades.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-slate-600">Periodo</span>
        <select
          disabled
          className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-slate-500"
          defaultValue="current"
        >
          <option value="current">Acumulado (todas las semanas)</option>
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="button"
          onClick={() => applyGrade("")}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  );
}
