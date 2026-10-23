import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/layout/main-nav";
import { SiteChrome } from "@/components/layout/site-chrome";

// Fuente display redondeada (titulos y botones) con soporte de espanol.
const displayFont = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap"
});

// Fuente de cuerpo legible para lectores noveles.
const bodyFont = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Basura Cero en 52 Semanas",
  description: "Plataforma escolar de retos ecologicos"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <SiteChrome nav={<MainNav />}>{children}</SiteChrome>
      </body>
    </html>
  );
}
