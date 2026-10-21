import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalRank — Votre visibilité locale, en clair.",
  description:
    "L’outil gratuit et open source pour suivre votre position sur Google Maps. Relevés manuels, historique et comparaisons. Sans compte, sans API, vos données restent chez vous.",
  applicationName: "LocalRank",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafaf9",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
