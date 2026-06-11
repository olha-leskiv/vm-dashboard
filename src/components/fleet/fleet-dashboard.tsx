"use client";

import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, X } from "lucide-react";
import { useAllVms } from "@/lib/query/hooks";
import { MOCK_TEMPLATES } from "@/mocks/templates";
import { MOCK_USERS } from "@/mocks/users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCost, formatRelativeTime, utilizationColor } from "@/lib/utils/format";
import type { VM, VMStatus } from "@/types";
import { cn } from "@/lib/utils";

// ─── lookup maps ──────────────────────────────────────────────────────────────

const TEMPLATE_MAP = Object.fromEntries(MOCK_TEMPLATES.map((t) => [t.id, t]));
const USER_MAP = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u.name]));

// ─── status display ───────────────────────────────────────────────────────────

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

// ─── sort types ───────────────────────────────────────────────────────────────

export type SortField =
  | "name"
  | "ownerId"
  | "templateId"
  | "status"
  | "cpuUsagePercent"
  | "memoryUsagePercent"
  | "diskUsagePercent"
  | "region"
  | "lastActiveAt"
  | "hourlyCost";

export type SortDir = "asc" | "desc";

// ─── data helpers ─────────────────────────────────────────────────────────────

function applyFilters(
  vms: VM[],
  search: string,
  status: string,
  templateId: string,
  ownerId: string
): VM[] {
  const q = search.toLowerCase();
  return vms.filter((vm) => {
    if (q && !vm.name.toLowerCase().includes(q)) return false;
    if (status !== "all" && vm.status !== status) return false;
    if (templateId !== "all" && vm.templateId !== templateId) return false;
    if (ownerId !== "all" && vm.ownerId !== ownerId) return false;
    return true;
  });
}

function applySort(vms: VM[], field: SortField, dir: SortDir): VM[] {
  return [...vms].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av ?? "").localeCompare(String(bv ?? ""));
    return dir === "asc" ? cmp : -cmp;
  });
}

function rowHighlight(vm: VM): string {
  if (vm.status === "error") return "bg-destructive/5";
  if (vm.status === "running" && vm.cpuUsagePercent <= 5) return "bg-amber-500/5";
  return "";
}

// ─── mini utilization bar ─────────────────────────────────────────────────────

function MiniBar({ value }: { value: number }) {
  const fill =
    value >= 85 ? "bg-destructive" : value >= 70 ? "bg-amber-400" : "bg-primary/30";
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("text-xs tabular-nums w-7 shrink-0", utilizationColor(value))}>
        {value}%
      </span>
      <div className="w-10 h-1 bg-muted rounded-full shrink-0">
        <div className={cn("h-full rounded-full", fill)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ─── sortable column header ───────────────────────────────────────────────────

interface SortableHeadProps {
  field: SortField;
  active: SortField;
  dir: SortDir;
  onSort: (f: SortField) => void;
  children: React.ReactNode;
  className?: string;
}

function SortHead({ field, active, dir, onSort, children, className }: SortableHeadProps) {
  const isActive = active === field;
  const Icon = isActive ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <TableHead className={className}>
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-0.5 hover:text-foreground transition-colors"
      >
        {children}
        <Icon
          className={cn(
            "size-3 shrink-0 ml-0.5",
            isActive ? "text-foreground" : "text-muted-foreground/40"
          )}
        />
      </button>
    </TableHead>
  );
}

// ─── detail bar (drawer) ──────────────────────────────────────────────────────

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

// ─── drawer metadata row ──────────────────────────────────────────────────────

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

// ─── VM detail drawer ─────────────────────────────────────────────────────────

function VmDrawer({ vm, onClose }: { vm: VM | null; onClose: () => void }) {
  const template = vm ? TEMPLATE_MAP[vm.templateId] : null;
  const ownerName = vm ? (USER_MAP[vm.ownerId] ?? vm.ownerId) : null;

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
              {/* metadata */}
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

              {/* utilization */}
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

              {/* timeline */}
              <section>
                <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Timeline
                </h4>
                <MetaRow label="Created" value={formatDate(vm.createdAt)} />
                <MetaRow label="Started" value={formatDate(vm.startedAt)} />
                <MetaRow label="Last active" value={formatRelativeTime(vm.lastActiveAt)} />
              </section>

              <Separator />

              {/* cost */}
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

// ─── loading skeleton ─────────────────────────────────────────────────────────

export function FleetSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 max-w-xs rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-36 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  );
}

// ─── fleet dashboard ──────────────────────────────────────────────────────────

interface FleetDashboardProps {
  initialStatus?: string;
  initialSortField?: SortField;
  initialSortDir?: SortDir;
}

export function FleetDashboard({
  initialStatus = "all",
  initialSortField = "name",
  initialSortDir = "asc",
}: FleetDashboardProps = {}) {
  const { data: vmsRes } = useAllVms();
  const vms = vmsRes.data;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [templateFilter, setTemplateFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>(initialSortField);
  const [sortDir, setSortDir] = useState<SortDir>(initialSortDir);
  const [selectedVm, setSelectedVm] = useState<VM | null>(null);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(
    () =>
      applySort(
        applyFilters(vms, search, statusFilter, templateFilter, ownerFilter),
        sortField,
        sortDir
      ),
    [vms, search, statusFilter, templateFilter, ownerFilter, sortField, sortDir]
  );

  const hasFilters =
    search !== "" || statusFilter !== "all" || templateFilter !== "all" || ownerFilter !== "all";

  const sortProps = { active: sortField, dir: sortDir, onSort: handleSort };

  return (
    <>
      <div className="space-y-4">
        {/* header */}
        <div>
          <h1>Fleet</h1>
          <p className="text-muted-foreground mt-0.5">
            All virtual machines across the workspace.
          </p>
        </div>

        {/* ── filters ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search VMs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
              <SelectItem value="starting">Starting</SelectItem>
              <SelectItem value="stopping">Stopping</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={templateFilter} onValueChange={(v) => setTemplateFilter(v ?? "all")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All templates</SelectItem>
              {MOCK_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ownerFilter} onValueChange={(v) => setOwnerFilter(v ?? "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owners</SelectItem>
              {MOCK_USERS.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setTemplateFilter("all");
                setOwnerFilter("all");
              }}
              className="gap-1.5 text-muted-foreground"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}

          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {filtered.length} / {vms.length} VMs
          </span>
        </div>

        {/* ── table ──────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortHead field="name" {...sortProps}>Name</SortHead>
                <SortHead field="ownerId" {...sortProps}>Owner</SortHead>
                <SortHead field="templateId" {...sortProps}>Template</SortHead>
                <SortHead field="status" {...sortProps}>Status</SortHead>
                <SortHead field="cpuUsagePercent" {...sortProps}>CPU</SortHead>
                <SortHead field="memoryUsagePercent" {...sortProps}>Memory</SortHead>
                <SortHead field="diskUsagePercent" {...sortProps}>Disk</SortHead>
                <SortHead field="region" {...sortProps}>Region</SortHead>
                <SortHead field="lastActiveAt" {...sortProps}>Last Active</SortHead>
                <SortHead field="hourlyCost" {...sortProps} className="text-right">Cost</SortHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                    {hasFilters
                      ? "No VMs match the current filters."
                      : "No virtual machines found."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((vm) => (
                  <TableRow
                    key={vm.id}
                    onClick={() => setSelectedVm(vm)}
                    className={cn("cursor-pointer", rowHighlight(vm))}
                  >
                    <TableCell className="font-mono font-medium">{vm.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {USER_MAP[vm.ownerId] ?? vm.ownerId}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {TEMPLATE_MAP[vm.templateId]?.name ?? vm.templateId}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={vm.status} />
                    </TableCell>
                    <TableCell>
                      <MiniBar value={vm.cpuUsagePercent} />
                    </TableCell>
                    <TableCell>
                      <MiniBar value={vm.memoryUsagePercent} />
                    </TableCell>
                    <TableCell>
                      <MiniBar value={vm.diskUsagePercent} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{vm.region}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatRelativeTime(vm.lastActiveAt)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs tabular-nums">
                      {formatCost(vm.hourlyCost)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <VmDrawer vm={selectedVm} onClose={() => setSelectedVm(null)} />
    </>
  );
}
