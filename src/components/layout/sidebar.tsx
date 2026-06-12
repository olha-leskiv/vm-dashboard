"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  section?: string;
}

interface SidebarProps {
  navItems: NavItem[];
  user: User | null;
  accountHref?: string;
}

export function Sidebar({ navItems, user, accountHref = "/admin/account" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-56 shrink-0 border-r bg-sidebar h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 h-14 flex items-center border-b">
        <Image
          src="/ascendra-logo.svg"
          alt="Ascendra"
          width={211}
          height={64}
          className="h-8 w-auto mx-auto max-w-[min(100%,9rem)] object-contain object-left"
          priority
          unoptimized
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {(() => {
          const sections = navItems.reduce<{ label: string; items: NavItem[] }[]>((acc, item) => {
            const sectionLabel = item.section ?? "";
            const existing = acc.find((s) => s.label === sectionLabel);
            if (existing) existing.items.push(item);
            else acc.push({ label: sectionLabel, items: [item] });
            return acc;
          }, []);
          const showHeaders = sections.length > 1;
          return sections.map((section, si) => (
            <div key={section.label} className={si > 0 ? "mt-4" : ""}>
              {showHeaders && section.label && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon ? ICON_MAP[item.icon] : null;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                      }`}
                    >
                      {Icon && <Icon className="size-4 shrink-0" />}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ));
        })()}
      </nav>

      {/* User profile */}
      {user && (
        <Link
          href={accountHref}
          className="border-t px-4 py-4 flex items-center gap-3 hover:bg-sidebar-accent/60 transition-colors"
        >
          <div className="size-7 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0 text-xs font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium leading-none text-sm truncate">{user.name}</p>
            <small className="text-muted-foreground capitalize mt-0.5 block">{user.role}</small>
          </div>
        </Link>
      )}
    </aside>
  );
}
