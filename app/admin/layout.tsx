import Link from "next/link";
import AdminGate from "@/components/admin/AdminGate";
import { Container, Card, CardContent } from "@/components/ui/ui";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="space-y-6">
      <AdminGate>
        <Card>
          <CardContent className="p-6 flex flex-wrap items-center gap-4">
            <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900" href="/admin/orders">
              Orders
            </Link>
            <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900" href="/admin/subscriptions">
              Subscriptions
            </Link>
            <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900" href="/admin/deliveries">
              Deliveries
            </Link>
          </CardContent>
        </Card>

        {children}
      </AdminGate>
    </Container>
  );
}
