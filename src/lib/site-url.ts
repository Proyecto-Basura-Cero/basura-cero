import { headers } from "next/headers";

export function getConfiguredSiteUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }

  return null;
}

export async function getSiteUrl(): Promise<string> {
  const configured = getConfiguredSiteUrl();
  if (configured) return configured;

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host.split(",")[0]?.trim() ?? host}`;
  }

  return "http://localhost:3000";
}

export async function toAbsoluteUrl(path: string): Promise<string> {
  if (/^https?:\/\//i.test(path)) return path;

  const base = await getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
