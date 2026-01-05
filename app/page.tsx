import Link from "next/link";
import { Container, Card, CardContent, Button } from "@/components/ui/ui";

export default function Home() {
  return (
    <Container>
      <Card>
        <CardContent className="p-10">
          <div className="text-4xl font-extrabold tracking-tight">Welcome to DairyShop</div>
          <div className="mt-3 text-lg text-slate-600">
            Pickup or delivery (ZIP-based). Pay with COD.
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/shop">
              <Button>Go to shop</Button>
            </Link>
            <Link href="/subscribe">
              <Button variant="secondary">Weekly Subscription</Button>
            </Link>
            <Link href="/cart">
              <Button variant="secondary">Go to cart</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
