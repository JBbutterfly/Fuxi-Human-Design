import type { Metadata } from "next";
import { Spectral, Barlow, Space_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/AuthProvider";
import "./globals.css";

// Spectral (display/reading serif), Barlow (UI sans), Space Mono (numerals,
// coordinates, timestamps) — the three faces from the Fuxi design system.
// Self-hosted via next/font rather than the design system's Google Fonts
// <link>, but the same families and weights.
const spectral = Spectral({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const barlow = Barlow({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Fuxi",
  description: "Human Design + Astrology charts for communities and partners",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${barlow.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
