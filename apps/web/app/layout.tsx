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
      <body suppressHydrationWarning className="bg-[#f8fafc] font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed relative min-h-screen">
        {/* Fixed Technical Blueprint Grid Layer */}
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern"
          aria-hidden="true"
        />
        {/* Ambient Subtle Radial Mesh Lighting */}
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-ambient-mesh"
          aria-hidden="true"
        />
        {/* Application Viewport */}
        <div className="relative z-10 w-full min-h-screen">
          {children}
        </div>
      </body>

    </html>
  );

}
