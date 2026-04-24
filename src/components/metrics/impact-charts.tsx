"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const sample = [
  { week: "S1", kg: 12, participants: 28 },
  { week: "S2", kg: 16, participants: 30 },
  { week: "S3", kg: 18, participants: 31 },
  { week: "S4", kg: 14, participants: 27 }
];

export function ImpactCharts() {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
      <h3 className="mb-3 text-lg font-bold text-emerald-700">Impacto semanal</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={sample}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="kg" fill="#2a9d5b" />
            <Bar dataKey="participants" fill="#0284c7" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
