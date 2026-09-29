import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic Platform",
  description:
    "Enterprise-grade Agentic Automation Platform Technical Foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        <div className="min-h-screen flex flex-col justify-between">
          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
            Agentic Platform &bull; Phase 0 Foundation Initialized
          </footer>
        </div>
      </body>
    </html>
  );
}
