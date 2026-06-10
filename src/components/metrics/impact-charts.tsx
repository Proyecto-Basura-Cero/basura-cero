"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { WeeklyImpactPoint } from "@/lib/services/admin-reports";

type Props = {
  data: WeeklyImpactPoint[];
};

export function ImpactCharts({ data }: Props) {
  if (!data.length) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-slate-500">
        Aun no hay datos de impacto semanal para mostrar.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
      <h3 className="mb-3 text-lg font-bold text-emerald-700">Impacto semanal</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="kg" name="Kg separados" fill="#2a9d5b" />
            <Bar dataKey="reused" name="Materiales reutilizados" fill="#d97706" />
            <Bar dataKey="participants" name="Participantes" fill="#0284c7" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
