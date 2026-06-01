"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { ExperimentVideo } from "@/components/experiments/experiment-video";

type Props = {
  experimentId: string;
  videoUrl: string;
  onChange: (videoUrl: string) => void;
  disabled?: boolean;
};

export function ExperimentVideoField({
  experimentId,
  videoUrl,
  onChange,
  disabled = false
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);

    try {
      const signRes = await fetch(
        `/api/admin/experimentos/${experimentId}/video/upload-url`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name })
        }
      );
      const signPayload = await signRes.json();
      if (!signRes.ok) {
        throw new Error(signPayload.error ?? "No se pudo preparar la subida");
      }

      const { error: uploadErrorResult } = await supabaseClient.storage
        .from(signPayload.bucket)
        .uploadToSignedUrl(signPayload.path, signPayload.token, file, {
          contentType: file.type || "video/mp4",
          upsert: true
        });

      if (uploadErrorResult) {
        throw new Error(uploadErrorResult.message);
      }

      onChange(signPayload.publicUrl as string);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Error al subir video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
      <div>
        <p className="text-sm font-semibold text-slate-700">Video del experimento</p>
        <p className="mt-1 text-xs text-slate-500">
          Sube un MP4/WebM/MOV o pega un enlace de YouTube con la demostracion paso
          a paso.
        </p>
      </div>

      <label className="block text-sm">
        <span className="block text-slate-600">Enlace de video (opcional)</span>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://youtube.com/... o URL del archivo"
          disabled={disabled || uploading}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
        />
      </label>

      <label className="block text-sm">
        <span className="block text-slate-600">Subir archivo de video</span>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
          disabled={disabled || uploading}
          onChange={(e) => void handleUpload(e.target.files?.[0] ?? null)}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
        />
      </label>

      {uploading && (
        <p className="text-xs text-slate-500">Subiendo video, puede tardar un momento...</p>
      )}
      {uploadError && (
        <p className="text-xs text-red-600">{uploadError}</p>
      )}

      {videoUrl && (
        <div className="space-y-2">
          <ExperimentVideo videoUrl={videoUrl} />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => onChange("")}
            className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            Quitar video
          </button>
        </div>
      )}
    </div>
  );
}
