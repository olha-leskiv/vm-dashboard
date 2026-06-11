"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Server,
  Layers,
  ShieldCheck,
  Users,
  Monitor,
  type LucideIcon,
} from "lucide-react";
import type { User } from "@/types";

export type NavIconName =
  | "LayoutDashboard"
  | "Server"
  | "Layers"
  | "ShieldCheck"
  | "Users"
  | "Monitor";

const ICON_MAP: Record<NavIconName, LucideIcon> = {
  LayoutDashboard,
  Server,
  Layers,
  ShieldCheck,
  Users,
  Monitor,
};

export interface NavItem {
  label: string;
  href: string;
  icon?: NavIconName;
}

interface SidebarProps {
  navItems: NavItem[];
  user: User | null;
}

export function Sidebar({ navItems, user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-56 shrink-0 border-r bg-sidebar h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 h-14 flex items-center border-b">
        <span className="font-semibold tracking-tight">Ascendra</span>
        <span className="ml-1 text-muted-foreground font-light">Workspaces</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon ? ICON_MAP[item.icon] : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              }`}
            >
              {Icon && <Icon className="size-4 shrink-0" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="border-t px-4 py-4 space-y-3">
        {user && (
          <div>
            <p className="font-medium leading-none">{user.name}</p>
            <small className="text-muted-foreground capitalize mt-1 block">{user.role}</small>
          </div>
        )}
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="px-0 text-muted-foreground hover:text-foreground">
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}
