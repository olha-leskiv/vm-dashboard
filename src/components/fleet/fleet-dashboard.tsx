"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, X, Plus } from "lucide-react";
import { useAllVms } from "@/lib/query/hooks";
import { MOCK_TEMPLATES } from "@/mocks/templates";
import { MOCK_USERS } from "@/mocks/users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VmStatusIconChip } from "@/components/overview/vm-status-icon-chip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { formatCost, formatRelativeTime, utilizationColor } from "@/lib/utils/format";
import type { VM, VMStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { VmDrawer } from "@/components/vm-drawer";
import { ViewDrawer as TemplateViewDrawer } from "@/components/templates/templates-dashboard";

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

// ─── VM detail drawer ─────────────────────────────────────────────────────────
// imported from @/components/vm-drawer

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
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof MOCK_TEMPLATES)[number] | null>(null);

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
        <PageHeader
          title="Virtual Machines"
          actions={
            <Button size="sm" className="gap-1.5 shrink-0">
              <Plus className="size-4" />
              Add Virtual Machine
            </Button>
          }
        />

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
        <Card>
          <CardContent>
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
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          <VmStatusIconChip status={vm.status} size="compact" />
                          <span className="font-mono font-medium truncate">{vm.name}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/admin/users/${vm.ownerId}`}
                          className="text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors whitespace-nowrap"
                        >
                          {USER_MAP[vm.ownerId] ?? vm.ownerId}
                        </Link>
                      </TableCell>
                      <TableCell onClick={(e) => { e.stopPropagation(); setSelectedTemplate(TEMPLATE_MAP[vm.templateId] ?? null); }}>
                        <button className="text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors whitespace-nowrap cursor-pointer text-left">
                          {TEMPLATE_MAP[vm.templateId]?.name ?? vm.templateId}
                        </button>
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
          </CardContent>
        </Card>
      </div>

      <VmDrawer
        vm={selectedVm}
        ownerName={selectedVm ? (USER_MAP[selectedVm.ownerId] ?? selectedVm.ownerId) : null}
        onClose={() => setSelectedVm(null)}
      />
      <TemplateViewDrawer
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />
    </>
  );
}
