"use client";

import { useFormContext } from "react-hook-form";

export function ImpactMetricsForm() {
  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <label className="flex flex-col gap-1 text-sm">
        Kg separados
        <input type="number" step="0.1" className="rounded-lg border p-2" {...register("kgSeparated")} />
        {errors.kgSeparated ? <span className="text-xs text-red-600">Valor invalido</span> : null}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Materiales reutilizados
        <input type="number" className="rounded-lg border p-2" {...register("reusedItems")} />
        {errors.reusedItems ? <span className="text-xs text-red-600">Valor invalido</span> : null}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Participantes
        <input type="number" className="rounded-lg border p-2" {...register("participantsCount")} />
        {errors.participantsCount ? <span className="text-xs text-red-600">Valor invalido</span> : null}
      </label>
    </div>
  );
}
