import { Sidebar } from "@/components/layout/sidebar";
import type { NavItem } from "@/components/layout/sidebar";
import { getAuthUser } from "@/lib/auth";

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/admin/overview", icon: "LayoutDashboard" },
  { label: "Virtual Machines", href: "/admin/fleet", icon: "Server" },
  { label: "Templates", href: "/admin/templates", icon: "Layers" },
  { label: "Policies", href: "/admin/policies", icon: "ShieldCheck" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "My Machines", href: "/admin/machines", icon: "Monitor" },
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
