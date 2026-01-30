// app/admin/layout.tsx
import AdminGate from "@/components/admin/AdminGate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // ✅ IMPORTANT: do NOT render <html> or <body> here
  return <AdminGate>{children}</AdminGate>;
}
