import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const res = await supabase
    .from("products")
    .select("id,category,name,size,price,image_url")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (res.error) {
    return NextResponse.json({ error: res.error.message }, { status: 500 });
  }

  return NextResponse.json({ products: res.data });
}
