import { Sidebar } from "@/components/layout/sidebar";
import { getAuthUser } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin/overview" },
  { label: "Fleet", href: "/admin/fleet" },
  { label: "Templates", href: "/admin/templates" },
  { label: "Policies", href: "/admin/policies" },
  { label: "My Machines", href: "/admin/machines" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  return (
    <div className="flex h-screen">
      <Sidebar navItems={NAV_ITEMS} user={user} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
