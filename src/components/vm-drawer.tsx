"use client";

import { Separator } from "@/components/ui/separator";
import { VmStatusBadge } from "@/components/vms/vm-status-badge";
import { Button } from "@/components/ui/button";
import { Code2, RotateCcw, Square, Play, Loader2 } from "lucide-react";
import { VmUtilizationChart } from "@/components/vms/vm-utilization-chart";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRestartMachine, useStopMachine, useCancelMachine } from "@/lib/query/hooks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { formatCost, formatRelativeTime, utilizationColor } from "@/lib/utils/format";
import { MOCK_TEMPLATES } from "@/mocks/templates";
import type { VM } from "@/types";
import { cn } from "@/lib/utils";

const TEMPLATE_MAP = Object.fromEntries(MOCK_TEMPLATES.map((t) => [t.id, t]));

function DetailBar({ value, label }: { value: number; label: string }) {
  const fill =
    value >= 85 ? "bg-destructive" : value >= 70 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono font-medium", utilizationColor(value))}>{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full">
        <div className={cn("h-full rounded-full", fill)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-right">{value}</span>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface VmDrawerProps {
  vm: VM | null;
  ownerName: string | null;
  onClose: () => void;
}

export function VmDrawer({ vm, ownerName, onClose }: VmDrawerProps) {
  const template = vm ? TEMPLATE_MAP[vm.templateId] : null;
  const restart = useRestartMachine();
  const stop = useStopMachine();
  const cancel = useCancelMachine();
  const isPending = restart.isPending || stop.isPending || cancel.isPending;

  const transitioning = vm?.status === "starting" || vm?.status === "stopping";
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!transitioning) { setSeconds(0); return; }
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [transitioning]);
  const elapsed = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  function handleOpenIde() {
    toast.info("IDE launching", { description: "In the real product this would open your IDE in a new window." });
  }

  function handleRestart() {
    if (!vm) return;
    restart.mutate(vm.id, {
      onSuccess: () => toast.success(`${vm.name} is restarting`, { description: "Will be ready in ~15 seconds." }),
      onError: () => toast.error("Restart failed", { description: "Please try again." }),
    });
  }

  function handleStop() {
    if (!vm) return;
    stop.mutate(vm.id, {
      onSuccess: () => toast.success(`${vm.name} stopped`),
      onError: () => toast.error("Stop failed", { description: "Please try again." }),
    });
  }

  function handleCancel() {
    if (!vm) return;
    cancel.mutate(vm.id, {
      onSuccess: () => toast.info(`${vm.name} start cancelled`),
      onError: () => toast.error("Cancel failed", { description: "Please try again." }),
    });
  }

  return (
    <Sheet open={!!vm} onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto gap-0 p-0">
        {vm && (
          <>
            <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2 pr-6">
                <SheetTitle className="font-mono text-sm truncate">{vm.name}</SheetTitle>
                <VmStatusBadge status={vm.status} />
              </div>
              <SheetDescription className="font-mono text-[11px] text-muted-foreground/60">
                {vm.id}
              </SheetDescription>
            </SheetHeader>

            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              {vm.status === "running" && (
                <>
                  <Button size="sm" className="flex-1 gap-2" onClick={handleOpenIde} disabled={isPending}>
                    <Code2 className="size-4" />
                    Open IDE
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={handleRestart} disabled={isPending}>
                    <RotateCcw className="size-3.5" />
                    Restart
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={handleStop} disabled={isPending}>
                    <Square className="size-3 fill-destructive text-destructive" />
                    Stop
                  </Button>
                </>
              )}
              {(vm.status === "stopped" || vm.status === "error") && (
                <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={handleRestart} disabled={isPending}>
                  {vm.status === "error" ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
                  {vm.status === "error" ? "Restart" : "Start"}
                </Button>
              )}
              {vm.status === "starting" && (
                <>
                  <Button size="sm" variant="outline" className="flex-1 gap-2" disabled>
                    <Loader2 className="size-4 animate-spin shrink-0" />
                    Starting…
                    <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">{elapsed}</span>
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={handleCancel} disabled={isPending}>
                    Cancel
                  </Button>
                </>
              )}
              {vm.status === "stopping" && (
                <Button size="sm" variant="outline" className="flex-1 gap-2" disabled>
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  Stopping…
                  <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">{elapsed}</span>
                </Button>
              )}
            </div>

            <div className="px-4 py-4 space-y-5">
              <section>
                <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Metadata
                </h4>
                <MetaRow label="Owner" value={ownerName} />
                <MetaRow label="Template" value={template?.name ?? vm.templateId} />
                <MetaRow label="Region" value={vm.region} />
                {template && (
                  <>
                    <MetaRow label="vCPU" value={`${template.vCpu} cores`} />
                    <MetaRow label="Memory" value={`${template.memoryGb} GB`} />
                    <MetaRow label="Disk" value={`${template.diskSizeGb} GB`} />
                    <MetaRow
                      label="Base image"
                      value={<span className="font-mono text-[11px]">{template.baseImage}</span>}
                    />
                  </>
                )}
              </section>

              <Separator />

              <section>
                <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Current Utilization
                </h4>
                <div className="space-y-3">
                  <DetailBar value={vm.cpuUsagePercent} label="CPU" />
                  <DetailBar value={vm.memoryUsagePercent} label="Memory" />
                  <DetailBar value={vm.diskUsagePercent} label="Disk" />
                </div>
              </section>

              <Separator />

              <section>
                <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Usage — Last 24 h
                </h4>
                <VmUtilizationChart vmId={vm.id} />
              </section>

              <Separator />

              <section>
                <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Timeline
                </h4>
                <MetaRow label="Created" value={formatDate(vm.createdAt)} />
                <MetaRow label="Started" value={formatDate(vm.startedAt)} />
                <MetaRow label="Last active" value={formatRelativeTime(vm.lastActiveAt)} />
              </section>

              <Separator />

              <section>
                <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Cost
                </h4>
                <MetaRow label="Hourly rate" value={<span className="font-mono">{formatCost(vm.hourlyCost)}</span>} />
              </section>
            </div>

          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
