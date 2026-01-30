import { redirect } from "next/navigation";

export default function AdminOrderRedirect() {
  redirect("/admin/orders");
}
