"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VmDrawer } from "@/components/vm-drawer";
import { utilizationColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
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
  const [selectedVm, setSelectedVm] = useState<VM | null>(null);
  const selectedOwnerName = selectedVm
    ? (rows.find((r) => r.vm.id === selectedVm.id)?.ownerName ?? selectedVm.ownerId)
    : null;

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Hot VMs</CardTitle>
            <Link
              href="/admin/fleet?sort=cpuUsagePercent&dir=desc"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No hot VMs.</p>
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
                      <button
                        onClick={() => setSelectedVm(vm)}
                        className="font-mono text-xs hover:text-foreground text-muted-foreground hover:underline underline-offset-2 transition-colors text-left"
                      >
                        {vm.name}
                      </button>
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
