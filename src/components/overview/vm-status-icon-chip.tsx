"use client";

import type { LucideIcon } from "lucide-react";
import { AlertCircle, Loader2, Play, Square, StopCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { VMStatus } from "@/types";

const STATUS_CHIP: Record<VMStatus, { icon: LucideIcon; color: string }> = {
  running: { icon: Play, color: "var(--color-green-400)" },
  starting: { icon: Loader2, color: "var(--color-amber-400)" },
  stopping: { icon: StopCircle, color: "var(--color-orange-400)" },
  stopped: { icon: Square, color: "var(--color-zinc-600)" },
  error: { icon: AlertCircle, color: "var(--color-red-500)" },
};

export interface VmStatusIconChipProps {
  status: VMStatus;
  /** `compact` matches dense table rows; `default` is slightly larger */
  size?: "default" | "compact";
  className?: string;
}

export function VmStatusIconChip({ status, size = "default", className }: VmStatusIconChipProps) {
  const { icon: Icon, color } = STATUS_CHIP[status];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full ",
        size === "compact" ? "size-5" : "size-6",
        className
      )}
      style={{
        backgroundColor: `color-mix(in oklch, ${color} 10%, transparent)`,
      }}
      title={status}
      aria-label={`VM status: ${status}`}
    >
      <Icon
        className={cn("drop-shadow-sm", size === "compact" ? "size-2.5" : "size-3.5")}
        style={{ color }}
        strokeWidth={2.25}
        aria-hidden
      />
    </div>
  );
}
