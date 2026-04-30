import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Script from "next/script";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="bg-nw-bone text-nw-black font-body antialiased selection-acid relative min-h-screen">
        <Script
          src="https://code.iconify.design/3/3.1.1/iconify.min.js"
          strategy="lazyOnload"
        />
        <div className="bg-noise"></div>
        {children}
      </body>
    </html>
  );
}
