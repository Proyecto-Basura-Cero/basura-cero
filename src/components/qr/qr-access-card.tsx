"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrAccessCard({ url }: { url: string }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 text-center">
      <h3 className="text-lg font-bold text-emerald-700">Acceso por QR</h3>
      <p className="mb-4 mt-2 text-sm text-slate-600">Escanea para abrir la semana actual en clase.</p>
      <div className="inline-block rounded-xl bg-white p-3 shadow">
        <QRCodeSVG value={url} size={180} />
      </div>
      <p className="mt-3 text-xs text-slate-500">{url}</p>
    </section>
  );
}
