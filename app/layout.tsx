import "./globals.css";
import NavBar from "@/components/NavBar";
import { Suspense } from "react";

export const metadata = {
  title: "DairyShop",
  description: "Pickup or delivery (ZIP-based). Pay with COD.",
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
        <Suspense fallback={<NavFallback />}>
          <NavBar />
        </Suspense>

        <div className="py-8">{children}</div>
      </body>
    </html>
  );
}
