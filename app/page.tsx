// app/page.tsx
import Link from "next/link";
import { Button, Card, CardContent, Container } from "@/components/ui/ui";

export default function Home() {
  return (
    <Container className="space-y-6">
      <Card>
        <CardContent className="p-6 sm:p-10">
          <div className="text-3xl font-black">Rockview Dairy</div>
          <div className="mt-2 text-slate-600">Fresh dairy essentials — delivered or pickup.</div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Shop</Button>
            </Link>
            <Link href="/subscribe" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                Subscribe
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
