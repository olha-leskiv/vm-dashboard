import { redirect } from "next/navigation";
import { getAuthRole } from "@/lib/auth";

export default async function RootPage() {
  const role = await getAuthRole();
  if (role === "engineer") redirect("/developer/machines");
  if (role === "admin") redirect("/admin/overview");
  redirect("/sign-in");
}
