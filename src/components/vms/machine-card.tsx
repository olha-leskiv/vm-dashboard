"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MOCK_TEMPLATES } from "@/mocks/templates";
import { formatRelativeTime, utilizationColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { useRestartMachine, useStopMachine, useCancelMachine } from "@/lib/query/hooks";
import { VmDrawer } from "@/components/vm-drawer";
import { toast } from "sonner";
import {
  Terminal,
  Cpu,
  MemoryStick,
  HardDrive,
  Clock,
  Activity,
  Code2,
  RotateCcw,
  Square,
  Play,
  Info,
  Loader2,
} from "lucide-react";
import type { VM, VMStatus, VMTemplate } from "@/types";

// ─── elapsed counter hook ────────────────────────────────────────────────────

function useElapsed(active: boolean): string {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) { setSeconds(0); return; }
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getTemplate(id: string): VMTemplate | undefined {
  return MOCK_TEMPLATES.find((t) => t.id === id);
}

function formatUptime(startedAt: string | null, status: VMStatus): string {
  if (status !== "running" || !startedAt) return "—";
  const ms = Date.now() - new Date(startedAt).getTime();
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days > 0) return `${days}d ${remHours}h`;
  if (hours > 0) return `${hours}h ${totalMinutes % 60}m`;
  return `${totalMinutes}m`;
}

// ─── status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<VMStatus, string> = {
  running: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  stopped: "bg-muted text-muted-foreground border-border",
  starting: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  stopping: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  error: "bg-destructive/15 text-destructive border-destructive/25",
};

const STATUS_DOT: Record<VMStatus, string> = {
  running: "bg-emerald-400",
  stopped: "bg-muted-foreground",
  starting: "bg-amber-400",
  stopping: "bg-orange-400",
  error: "bg-destructive",
};

const STATUS_LABELS: Record<VMStatus, string> = {
  running: "Running",
  stopped: "Stopped",
  starting: "Starting",
  stopping: "Stopping",
  error: "Error",
};

function StatusBadge({ status }: { status: VMStatus }) {
  const pulsing = status === "starting" || status === "stopping";
  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium", STATUS_STYLES[status])}>
      <span className={cn("size-2 rounded-full shrink-0", STATUS_DOT[status], pulsing && "animate-pulse")} />
      {STATUS_LABELS[status]}
    </div>
  );
}

// ─── resource bar row ─────────────────────────────────────────────────────────

function ResourceRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  const fill =
    value >= 85 ? "bg-destructive" : value >= 60 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <span className="text-sm w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", fill)} style={{ width: `${value}%` }} />
      </div>
      <span className={cn("text-sm font-mono tabular-nums w-10 text-right shrink-0", utilizationColor(value))}>
        {value}%
      </span>

    </div>
  );
}

// ─── actions ──────────────────────────────────────────────────────────────────

interface ActionsProps {
  status: VMStatus;
  elapsed: string;
  onOpenIde: () => void;
  onRestart: () => void;
  onStop: () => void;
  onCancel: () => void;
  isPending: boolean;
}

function Actions({ status, elapsed, onOpenIde, onRestart, onStop, onCancel, isPending }: ActionsProps) {
  const running = status === "running";
  const stopped = status === "stopped";
  const errored = status === "error";
  const starting = status === "starting";
  const stopping = status === "stopping";

  return (
    <div className="flex items-center gap-2">
      {/* primary CTA */}
      {running && (
        <Button className="flex-1 gap-2" onClick={onOpenIde} disabled={isPending}>
          <Code2 className="size-4" />
          Open IDE
        </Button>
      )}
      {(stopped || errored) && (
        <Button variant="outline" className="flex-1 gap-2" onClick={onRestart} disabled={isPending}>
          {errored ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
          {errored ? "Restart" : "Start"}
        </Button>
      )}
      {starting && (
        <>
          <Button variant="outline" className="flex-1 gap-2" disabled>
            <Loader2 className="size-4 animate-spin shrink-0" />
            Starting…
            <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">{elapsed}</span>
          </Button>
          <Button variant="ghost" className="gap-1.5 text-muted-foreground" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        </>
      )}
      {stopping && (
        <Button variant="outline" className="flex-1 gap-2" disabled>
          <Loader2 className="size-4 animate-spin shrink-0" />
          Stopping…
          <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">{elapsed}</span>
        </Button>
      )}

      {/* secondary controls */}
      {running && (
        <>
          <Button variant="outline" className="gap-1.5" onClick={onRestart} disabled={isPending}>
            <RotateCcw className="size-3.5" />
            Restart
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={onStop} disabled={isPending}>
            <Square className="size-3 fill-destructive text-destructive" />
            Stop
          </Button>
        </>
      )}


    </div>
  );
}

// ─── card ─────────────────────────────────────────────────────────────────────

export function MachineCard({ vm }: { vm: VM }) {
  const template = getTemplate(vm.templateId);
  const uptime = formatUptime(vm.startedAt, vm.status);

  const restart = useRestartMachine();
  const stop = useStopMachine();
  const cancel = useCancelMachine();
  const isPending = restart.isPending || stop.isPending || cancel.isPending;

  const transitioning = vm.status === "starting" || vm.status === "stopping";
  const elapsed = useElapsed(transitioning);

  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleOpenIde() {
    toast.info("IDE launching", {
      description: "In the real product this would open your IDE in a new window.",
    });
  }

  function handleRestart() {
    restart.mutate(vm.id, {
      onSuccess: () => toast.success(`${vm.name} is restarting`, { description: "Will be ready in ~15 seconds." }),
      onError: () => toast.error("Restart failed", { description: "Please try again." }),
    });
  }

  function handleStop() {
    stop.mutate(vm.id, {
      onSuccess: () => toast.success(`${vm.name} stopped`),
      onError: () => toast.error("Stop failed", { description: "Please try again." }),
    });
  }

  function handleCancel() {
    cancel.mutate(vm.id, {
      onSuccess: () => toast.info(`${vm.name} start cancelled`),
      onError: () => toast.error("Cancel failed", { description: "Please try again." }),
    });
  }

  return (
    <>
    <Card>
      <CardContent className="p-5 space-y-4">

        {/* header */}
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
            <Terminal className="size-5 text-zinc-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{vm.name}</p>
            <p className="text-xs text-muted-foreground font-mono">ID: {vm.id}</p>
          </div>
          <StatusBadge status={vm.status} />
          <Button
            variant="ghost"
            size="icon"
            aria-label={`View details for ${vm.name}`}
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground -mr-1"
            onClick={() => setDrawerOpen(true)}
          >
            <Info className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {/* specs */}
        {template && (
          <div className="flex items-center text-sm text-muted-foreground divide-x divide-border">
            <div className="flex items-center gap-1.5 pr-4">
              <Cpu className="size-3.5 shrink-0" />
              <span>{template.vCpu} vCPU</span>
            </div>
            <div className="flex items-center gap-1.5 px-4">
              <MemoryStick className="size-3.5 shrink-0" />
              <span>{template.memoryGb} GB RAM</span>
            </div>
            <div className="flex items-center gap-1.5 pl-4">
              <HardDrive className="size-3.5 shrink-0" />
              <span>{template.diskSizeGb} GB SSD</span>
            </div>
          </div>
        )}

        <Separator />

        {/* resource usage */}
        <div className="divide-y divide-border/40">
          <ResourceRow icon={Cpu} label="CPU" value={vm.cpuUsagePercent} />
          <ResourceRow icon={MemoryStick} label="Memory" value={vm.memoryUsagePercent} />
          <ResourceRow icon={HardDrive} label="Disk" value={vm.diskUsagePercent} />
        </div>

        <Separator />

        {/* uptime + last active */}
        <div className="flex items-center divide-x divide-border">
          <div className="flex items-center gap-2 pr-5">
            <Clock className="size-3.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Uptime</p>
              <p className="text-sm font-medium">{uptime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-5">
            <Activity className="size-3.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Last active</p>
              <p className="text-sm font-medium">{formatRelativeTime(vm.lastActiveAt)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* actions */}
        <Actions
          status={vm.status}
          elapsed={elapsed}
          onOpenIde={handleOpenIde}
          onRestart={handleRestart}
          onStop={handleStop}
          onCancel={handleCancel}
          isPending={isPending}
        />
      </CardContent>
    </Card>

    <VmDrawer vm={drawerOpen ? vm : null} ownerName={null} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
