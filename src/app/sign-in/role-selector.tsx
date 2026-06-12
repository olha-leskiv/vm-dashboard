"use client";

import { useTransition, useState } from "react";
import { ChevronRight, Code2, ShieldCheck, type LucideIcon } from "lucide-react";
import { signIn } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

type Role = "engineer" | "admin";

const ROLES: { value: Role; label: string; description: string; icon: LucideIcon }[] = [

  {
    value: "admin",
    label: "Sign in as Admin",
    description: "Monitor fleet health and manage infrastructure",
    icon: ShieldCheck,
  },

  {
    value: "engineer",
    label: "Sign in as Engineer",
    description: "Access and manage your developer machines",
    icon: Code2,
  },
];

export function RoleSelector() {
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<Role | null>(null);

  function handleSelect(role: Role) {
    setActive(role);
    startTransition(() => signIn(role));
  }

  return (
    <div className="space-y-3">
      {ROLES.map((role) => (
        <Button
          key={role.value}
          variant="outline"
          onClick={() => handleSelect(role.value)}
          disabled={pending}
          className="w-full h-auto justify-start px-4 py-3.5"
        >
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <role.icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 text-left">
                <div className="font-medium">{role.label}</div>

              </div>
            </div>
            {pending && active === role.value ? (
              <div className="size-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
          </div>
        </Button>
      ))}
    </div>
  );
}
