import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nexora — Autonomous Agentic Automation Platform",
  description:
    "Turn instructions into autonomous execution. Nexora builds the operation, coordinates AI agents, connects your systems, and executes the work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakartaSans.variable} scroll-smooth`}>
      <body suppressHydrationWarning className="bg-surface font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
        {children}
      </body>
    </html>
  );
}
