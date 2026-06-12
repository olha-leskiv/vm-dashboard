"use client";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { formatCost, formatRelativeTime, utilizationColor } from "@/lib/utils/format";
import { MOCK_TEMPLATES } from "@/mocks/templates";
import type { VM, VMStatus } from "@/types";
import { cn } from "@/lib/utils";

const TEMPLATE_MAP = Object.fromEntries(MOCK_TEMPLATES.map((t) => [t.id, t]));

const STATUS_LABELS: Record<VMStatus, string> = {
  running: "Running",
  stopped: "Stopped",
  starting: "Starting",
  stopping: "Stopping",
  error: "Error",
};

const STATUS_STYLES: Record<VMStatus, string> = {
  running: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  stopped: "bg-muted text-muted-foreground border-transparent",
  starting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  stopping: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

function StatusBadge({ status }: { status: VMStatus }) {
  const pulsing = status === "starting" || status === "stopping";
  return (
    <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5 gap-1", STATUS_STYLES[status])}>
      {pulsing && <span className="size-1.5 rounded-full bg-current animate-pulse shrink-0" />}
      {STATUS_LABELS[status]}
    </Badge>
  );
}

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

  return (
    <Sheet open={!!vm} onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto gap-0 p-0">
        {vm && (
          <>
            <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2 pr-6">
                <SheetTitle className="font-mono text-sm truncate">{vm.name}</SheetTitle>
                <StatusBadge status={vm.status} />
              </div>
              <SheetDescription className="font-mono text-[11px] text-muted-foreground/60">
                {vm.id}
              </SheetDescription>
            </SheetHeader>

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
