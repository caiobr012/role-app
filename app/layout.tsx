import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Que tal mais um?",
  description: "Descubra shows, bares, restaurantes, parques, museus e muito mais perto de você.",
  keywords: ["eventos", "shows", "bares", "restaurantes", "o que fazer hoje", "rolê"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#7C3AED",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
