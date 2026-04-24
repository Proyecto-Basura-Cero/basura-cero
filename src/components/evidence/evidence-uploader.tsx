"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { ImpactMetricsForm } from "@/components/evidence/impact-metrics-form";

const schema = z.object({
  groupId: z.string().min(1),
  comments: z.string().min(5),
  participantsCount: z.coerce.number().int().min(1),
  kgSeparated: z.coerce.number().min(0),
  reusedItems: z.coerce.number().int().min(0),
  evidenceFile: z
    .any()
    .refine((value) => value instanceof FileList && value.length > 0, "Archivo requerido")
});

type FormValues = z.infer<typeof schema>;

export function EvidenceUploader() {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      groupId: "",
      comments: "",
      participantsCount: 0,
      kgSeparated: 0,
      reusedItems: 0
    }
  });

  const onSubmit = methods.handleSubmit((values) => {
    // Placeholder para integrar upload a Supabase Storage + insert en submissions
    console.log("Evidence submitted", values);
    alert("Evidencia enviada (modo demo)");
    methods.reset();
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5">
        <h3 className="text-lg font-bold text-emerald-700">Subir evidencia semanal</h3>

        <label className="flex flex-col gap-1 text-sm">
          Grupo
          <input className="rounded-lg border p-2" {...methods.register("groupId")} placeholder="5A" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Comentarios
          <textarea className="rounded-lg border p-2" rows={3} {...methods.register("comments")} />
        </label>

        <ImpactMetricsForm />

        <label className="flex flex-col gap-1 text-sm">
          Archivo de evidencia
          <input type="file" className="rounded-lg border p-2" {...methods.register("evidenceFile")} />
        </label>

        <button className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white" type="submit">
          Enviar evidencia
        </button>
      </form>
    </FormProvider>
  );
}
