import { Sidebar } from "@/components/layout/sidebar";
import type { NavItem } from "@/components/layout/sidebar";
import { getAuthUser } from "@/lib/auth";

const NAV_ITEMS: NavItem[] = [{ label: "My Machines", href: "/developer/machines", icon: "Monitor" }];

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  return (
    <div className="flex h-screen">
      <Sidebar navItems={NAV_ITEMS} user={user} accountHref="/developer/account" />
      <main className="flex-1 overflow-auto p-12">{children}</main>
    </div>
  );
}
