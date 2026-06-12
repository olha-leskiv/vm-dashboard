"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VmStatusIconChip } from "@/components/overview/vm-status-icon-chip";
import { VmDrawer } from "@/components/vm-drawer";
import { utilizationColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { VM } from "@/types";

function CpuBar({ value }: { value: number }) {
  const barColor =
    value >= 85 ? "bg-destructive" : value >= 70 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={cn("tabular-nums shrink-0 w-7 text-right text-xs", utilizationColor(value))}>
        {value}%
      </span>
      <div className="flex-1 bg-muted rounded-full h-1.5 min-w-[40px]">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

interface HotVmRow {
  vm: VM;
  ownerName: string;
  ownerId: string;
}

interface Props {
  rows: HotVmRow[];
}

export function HotVmsTable({ rows }: Props) {
  const router = useRouter();
  const [selectedVm, setSelectedVm] = useState<VM | null>(null);
  const selectedOwnerName = selectedVm
    ? (rows.find((r) => r.vm.id === selectedVm.id)?.ownerName ?? selectedVm.ownerId)
    : null;

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Hot VMs</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          {rows.length === 0 ? (
            <EmptyState message="No hot VMs." description="All VMs are running within normal CPU thresholds." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] uppercase tracking-wider h-7 px-0">VM</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider h-7">Owner</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider h-7">CPU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ vm, ownerName, ownerId }) => (
                  <TableRow key={vm.id}>
                    <TableCell className="px-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <VmStatusIconChip status={vm.status} size="compact" />
                        <button
                          onClick={() => setSelectedVm(vm)}
                          aria-label={`View details for ${vm.name}`}
                          className="min-w-0 font-mono text-xs hover:text-foreground text-muted-foreground hover:underline underline-offset-2 transition-colors text-left cursor-pointer"
                        >
                          {vm.name}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/users/${ownerId}`}
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors whitespace-nowrap"
                      >
                        {ownerName}
                      </Link>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <CpuBar value={vm.cpuUsagePercent} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/40">
            <span className="text-xs text-muted-foreground">Sorted by CPU usage</span>
            <Button variant="ghost" size="xs" aria-label="View all hot VMs" onClick={() => router.push("/admin/fleet?sort=cpuUsagePercent&dir=desc")}>
              View all
            </Button>
          </div>
        </CardContent>
      </Card>

      <VmDrawer
        vm={selectedVm}
        ownerName={selectedOwnerName}
        onClose={() => setSelectedVm(null)}
      />
    </>
  );
}
