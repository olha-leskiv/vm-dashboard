"use client";

import { useTransition, useState } from "react";
import { signIn } from "@/lib/auth-actions";

type Role = "engineer" | "admin";

const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "engineer",
    label: "Engineer",
    description: "Access and manage your developer machines",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Monitor fleet health and manage infrastructure",
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
        <button
          key={role.value}
          onClick={() => handleSelect(role.value)}
          disabled={pending}
          className="w-full text-left rounded-lg border bg-card px-4 py-3.5 hover:bg-accent transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">{role.label}</div>
              <small className="text-muted-foreground mt-0.5 block">{role.description}</small>
            </div>
            {pending && active === role.value && (
              <div className="size-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
