import { Sidebar } from "@/components/layout/sidebar";
import type { NavItem } from "@/components/layout/sidebar";
import { getAuthUser } from "@/lib/auth";

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/admin/overview", icon: "LayoutDashboard", section: "Admin" },
  { label: "Virtual Machines", href: "/admin/fleet", icon: "Server", section: "Admin" },
  { label: "Templates", href: "/admin/templates", icon: "Layers", section: "Admin" },
  { label: "Policies", href: "/admin/policies", icon: "ShieldCheck", section: "Admin" },
  { label: "Users", href: "/admin/users", icon: "Users", section: "Admin" },
  { label: "My Machines", href: "/admin/machines", icon: "Monitor", section: "Developer" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  return (
    <div className="flex h-screen">
      <Sidebar navItems={NAV_ITEMS} user={user} />
      <main className="flex-1 overflow-auto p-12">{children}</main>
    </div>
  );
}
