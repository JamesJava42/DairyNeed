// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "DairyShop",
  description: "Pickup or delivery (ZIP-based). Pay with COD.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "DairyNeed", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

function NavFallback() {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="h-10" />
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <Suspense fallback={<NavFallback />}>
            <NavBar />
          </Suspense>

          <div className="py-8">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
