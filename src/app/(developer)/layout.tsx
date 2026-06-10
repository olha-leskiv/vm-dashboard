import { Sidebar } from "@/components/layout/sidebar";
import { getAuthUser } from "@/lib/auth";

const NAV_ITEMS = [{ label: "My Machines", href: "/developer/machines" }];

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  return (
    <div className="flex h-screen">
      <Sidebar navItems={NAV_ITEMS} user={user} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
