"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";

function resolveAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window !== "undefined") {
    return new URL(url, window.location.origin).href;
  }
  return url;
}

export function QrAccessCard({ url }: { url: string }) {
  const qrValue = useMemo(() => resolveAbsoluteUrl(url), [url]);

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 text-center">
      <h3 className="text-lg font-bold text-emerald-700">Acceso por QR</h3>
      <p className="mb-4 mt-2 text-sm text-slate-600">
        Escanea para abrir el experimento de la semana en tu dispositivo.
      </p>
      <div className="inline-block rounded-xl bg-white p-3 shadow">
        <QRCodeSVG
          value={qrValue}
          size={180}
          level="M"
          includeMargin
          aria-label="Codigo QR del experimento semanal"
        />
      </div>
      <p className="mt-3 break-all text-xs text-slate-500">{qrValue}</p>
    </section>
  );
}
