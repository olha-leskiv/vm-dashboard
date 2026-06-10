"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeveloperMachines, useAllVms } from "@/lib/query/hooks";
import { MOCK_TEMPLATES } from "@/mocks/templates";
import { MOCK_USERS } from "@/mocks/users";
import { formatCost, formatPercent, formatRelativeTime, utilizationColor } from "@/lib/utils/format";
import type { VM, VMStatus } from "@/types";

// ─── helpers ────────────────────────────────────────────────────────────────

function getTemplateName(id: string) {
  return MOCK_TEMPLATES.find((t) => t.id === id)?.name ?? id;
}

function getUserName(id: string) {
  return MOCK_USERS.find((u) => u.id === id)?.name ?? id;
}

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
  starting: "Starting…",
  stopping: "Stopping…",
  error: "Error",
};

function StatusBadge({ status }: { status: VMStatus }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {status === "starting" || status === "stopping" ? (
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-current animate-pulse" />
          {STATUS_LABELS[status]}
        </span>
      ) : (
        STATUS_LABELS[status]
      )}
    </Badge>
  );
}

function UtilCell({ value }: { value: number }) {
  return <span className={utilizationColor(value)}>{formatPercent(value)}</span>;
}

// ─── shared table ────────────────────────────────────────────────────────────

interface VmTableProps {
  vms: VM[];
  showOwner?: boolean;
}

function VmTable({ vms, showOwner = false }: VmTableProps) {
  if (vms.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No machines found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {showOwner && <TableHead>Owner</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Region</TableHead>
          <TableHead className="text-right">CPU</TableHead>
          <TableHead className="text-right">Memory</TableHead>
          <TableHead className="text-right">Disk</TableHead>
          <TableHead className="text-right">Cost</TableHead>
          <TableHead className="text-right">Last active</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vms.map((vm) => (
          <TableRow key={vm.id}>
            <TableCell className="font-mono">{vm.name}</TableCell>
            {showOwner && <TableCell>{getUserName(vm.ownerId)}</TableCell>}
            <TableCell>
              <StatusBadge status={vm.status} />
            </TableCell>
            <TableCell>{getTemplateName(vm.templateId)}</TableCell>
            <TableCell className="text-muted-foreground">{vm.region}</TableCell>
            <TableCell className="text-right">
              <UtilCell value={vm.cpuUsagePercent} />
            </TableCell>
            <TableCell className="text-right">
              <UtilCell value={vm.memoryUsagePercent} />
            </TableCell>
            <TableCell className="text-right">
              <UtilCell value={vm.diskUsagePercent} />
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {formatCost(vm.hourlyCost)}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {formatRelativeTime(vm.lastActiveAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── per-role exports ────────────────────────────────────────────────────────

export function DeveloperVmList() {
  const { data } = useDeveloperMachines();
  return <VmTable vms={data.data} />;
}

export function AdminVmList() {
  const { data } = useAllVms();
  return <VmTable vms={data.data} showOwner />;
}
