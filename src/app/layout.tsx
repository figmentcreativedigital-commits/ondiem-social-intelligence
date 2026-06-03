import type { Metadata } from "next";
import { Tinos, Montserrat } from "next/font/google";
import "./globals.css";

/**
 * Tinos: the open-source Times Roman / TeX Gyre Termes equivalent on Google Fonts.
 * Used for display/serif headlines per onDiem brand spec.
 */
const tinos = Tinos({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--next-font-display",
  display: "swap",
});

/**
 * Montserrat: brand-spec'd secondary typeface (page 15 of the guidelines).
 * Used for all body, eyebrow, label, and UI copy.
 */
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--next-font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OnDiem · Social Performance",
  description:
    "Weekly social media intelligence dashboard for OnDiem, by Figment Creative.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${tinos.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
