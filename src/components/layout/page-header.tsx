import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Right side: meta text, buttons, etc. */
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1>{title}</h1>
        {description != null ? (
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions != null ? (
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end sm:pt-0.5">{actions}</div>
      ) : null}
    </div>
  );
}
