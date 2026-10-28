import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { MusicProvider } from "@/components/MusicContext";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Bunutan Pasko",
  description: "Ang tradisyonal na bunutan, dinala sa web.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fil" className={`${fraunces.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-pasko-paper text-pasko-ink font-body antialiased">
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}