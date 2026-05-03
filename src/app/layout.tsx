import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: "NW Pricer — Northernware Pricing Calculator",
  description: "Internal tool for generating project quotes and estimates. Input scope → output price.",
};

import NorthernwareToaster from "@/components/NorthernwareToaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-nw-bone text-nw-black font-body antialiased selection-acid relative min-h-screen" suppressHydrationWarning>
        <Providers>
          <div className="bg-noise"></div>
          <NorthernwareToaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
