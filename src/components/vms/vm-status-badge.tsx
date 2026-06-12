"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VMStatus } from "@/types";

const STATUS_STYLES: Record<VMStatus, string> = {
  running: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  stopped: "bg-muted text-muted-foreground border-transparent",
  starting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  stopping: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABELS: Record<VMStatus, string> = {
  running: "Running",
  stopped: "Stopped",
  starting: "Starting",
  stopping: "Stopping",
  error: "Error",
};

export interface VmStatusBadgeProps {
  status: VMStatus;
  className?: string;
}

/** Compact VM status pill — single source for labels, colors, and transition pulse. */
export function VmStatusBadge({ status, className }: VmStatusBadgeProps) {
  const pulsing = status === "starting" || status === "stopping";
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] h-4 shrink-0 gap-1 px-1.5 py-0",
        STATUS_STYLES[status],
        className,
      )}
    >
      {pulsing && <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-current" />}
      {STATUS_LABELS[status]}
    </Badge>
  );
}
