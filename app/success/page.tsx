import Link from "next/link";
import { Container, Card, CardContent, Button } from "@/components/ui/ui";

export default function SuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const order = searchParams?.order;

  return (
    <Container>
      <Card>
        <CardContent className="p-10">
          <div className="text-3xl font-extrabold">✅ Success</div>
          <div className="mt-2 text-slate-600">
            Your order was placed. We will confirm by text/call.
          </div>

          {order && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-600">Order ID</div>
              <div className="mt-1 font-extrabold">{order}</div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/shop"><Button>Back to shop</Button></Link>
            <Link href="/subscribe"><Button variant="secondary">Subscription</Button></Link>
            <Link href="/cart"><Button variant="secondary">Cart</Button></Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
